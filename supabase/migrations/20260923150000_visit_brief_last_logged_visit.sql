-- get_visit_brief: 'last visit' = latest completed visit that has been LOGGED (summary set).
-- Coaches mark a visit completed before logging it; without this, the visit being logged
-- became the 'last visit', so the log sheet hid the review-of-last-visit step.

CREATE OR REPLACE FUNCTION public.get_visit_brief(p_dealership_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last        public.coach_visits%ROWTYPE;
  v_latest      public.assessments%ROWTYPE;
  v_baseline    public.assessments%ROWTYPE;
  v_agreed      jsonb;
  v_overdue     jsonb;
  v_overdue_n   integer;
  v_stale_n     integer;
  v_done_since  integer;
BEGIN
  IF NOT private.can_view_dealership(p_dealership_id) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO v_last
  FROM public.coach_visits
  WHERE dealership_id = p_dealership_id AND status = 'completed' AND summary IS NOT NULL
  ORDER BY visit_date DESC, updated_at DESC
  LIMIT 1;

  SELECT * INTO v_latest
  FROM public.assessments
  WHERE dealership_id = p_dealership_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Baseline = latest assessment on or before the last visit.
  IF v_last.id IS NOT NULL THEN
    SELECT * INTO v_baseline
    FROM public.assessments
    WHERE dealership_id = p_dealership_id
      AND created_at < (v_last.visit_date + 1)::timestamptz
    ORDER BY created_at DESC
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
             'id', ia.id,
             'title', ia.action_title,
             'department', ia.department,
             'priority', ia.priority,
             'status', ia.status,
             'responsible_person', ia.responsible_person,
             'target_completion_date', ia.target_completion_date,
             'last_review', (
               SELECT jsonb_build_object('outcome', r.outcome, 'note', r.note, 'reviewed_at', r.created_at)
               FROM public.visit_action_reviews r
               WHERE r.action_id = ia.id
               ORDER BY r.created_at DESC LIMIT 1
             )
           ) ORDER BY ia.status = 'Completed', ia.priority), '[]'::jsonb)
      INTO v_agreed
    FROM public.improvement_actions ia
    WHERE ia.id = ANY (v_last.agreed_action_ids);

    SELECT count(*) INTO v_done_since
    FROM public.improvement_actions ia
    WHERE ia.assessment_id = v_latest.id
      AND ia.status = 'Completed'
      AND ia.last_status_updated_at >= v_last.visit_date;
  END IF;

  SELECT count(*) INTO v_overdue_n
  FROM public.improvement_actions
  WHERE assessment_id = v_latest.id
    AND status <> 'Completed'
    AND target_completion_date < CURRENT_DATE;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_overdue
  FROM (
    SELECT id, action_title AS title, priority, responsible_person,
           target_completion_date, CURRENT_DATE - target_completion_date AS days_overdue
    FROM public.improvement_actions
    WHERE assessment_id = v_latest.id
      AND status <> 'Completed'
      AND target_completion_date < CURRENT_DATE
    ORDER BY target_completion_date
    LIMIT 5
  ) t;

  SELECT count(*) INTO v_stale_n
  FROM public.improvement_actions
  WHERE assessment_id = v_latest.id
    AND status IN ('Open', 'In Progress')
    AND COALESCE(last_status_updated_at, created_at) < now() - INTERVAL '21 days';

  RETURN jsonb_build_object(
    'last_visit', CASE WHEN v_last.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_last.id,
      'visit_date', v_last.visit_date,
      'visit_type', v_last.visit_type,
      'summary', v_last.summary,
      'modules_reviewed', v_last.modules_reviewed,
      'next_visit_date', v_last.next_visit_date
    ) END,
    'days_since_last_visit', CASE WHEN v_last.id IS NULL THEN NULL ELSE CURRENT_DATE - v_last.visit_date END,
    'agreed_actions', COALESCE(v_agreed, '[]'::jsonb),
    'score', jsonb_build_object(
      'current', v_latest.overall_score,
      'current_assessed_at', v_latest.created_at,
      'at_last_visit', v_baseline.overall_score,
      'at_last_visit_assessed_at', v_baseline.created_at,
      'delta', CASE WHEN v_baseline.id IS NOT NULL AND v_baseline.id <> v_latest.id
                    THEN v_latest.overall_score - v_baseline.overall_score END,
      'departments_current', v_latest.scores,
      'departments_at_last_visit', v_baseline.scores
    ),
    'completed_since_last_visit', COALESCE(v_done_since, 0),
    'overdue_count', v_overdue_n,
    'overdue_actions', v_overdue,
    'stale_count', v_stale_n
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_visit_brief(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_visit_brief(uuid) TO authenticated;
