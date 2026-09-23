-- Coach visit loop (A + B + D + F):
--   A. get_visit_brief(dealership)       pre-visit brief for coach (and dealer)
--   B. visit_action_reviews               per-visit review of previously agreed actions;
--                                         outcome syncs improvement_actions.status
--   D. visit recap                        in-app notification to dealer org members
--                                         when a completed visit's log is saved
--   F. get_network_coaching_stats()       OEM coaching-effectiveness per dealership

-- ── Shared guard ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.can_view_dealership(_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.user_can_access_dealership_as_coach(_dealership_id)
      OR public.user_can_access_dealership_as_oem(_dealership_id)
      OR EXISTS (
        SELECT 1
        FROM public.dealerships d
        JOIN public.memberships m ON m.organization_id = d.organization_id
        WHERE d.id = _dealership_id
          AND m.user_id = auth.uid()
          AND m.is_active = true
      );
$$;

REVOKE ALL ON FUNCTION private.can_view_dealership(uuid) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_view_dealership(uuid) TO authenticated;

-- ── B. Visit action reviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visit_action_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id    uuid NOT NULL REFERENCES public.coach_visits(id) ON DELETE CASCADE,
  action_id   uuid NOT NULL REFERENCES public.improvement_actions(id) ON DELETE CASCADE,
  outcome     text NOT NULL CHECK (outcome IN ('done', 'in_progress', 'blocked', 'not_started')),
  note        text CHECK (char_length(note) <= 1000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (visit_id, action_id)
);

CREATE INDEX IF NOT EXISTS visit_action_reviews_action_idx ON public.visit_action_reviews(action_id);

ALTER TABLE public.visit_action_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY visit_action_reviews_select ON public.visit_action_reviews
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.coach_visits v
    WHERE v.id = visit_id AND private.can_view_dealership(v.dealership_id)
  ));

CREATE POLICY visit_action_reviews_coach_write ON public.visit_action_reviews
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.coach_visits v
    WHERE v.id = visit_id AND v.coach_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.coach_visits v
    WHERE v.id = visit_id AND v.coach_user_id = auth.uid()
  ));

-- A review outcome moves the action: done → Completed, in_progress → In Progress.
-- blocked / not_started leave status alone (the review itself is the record).
CREATE OR REPLACE FUNCTION private.sync_action_status_from_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  UPDATE public.improvement_actions
     SET status = CASE NEW.outcome WHEN 'done' THEN 'Completed' ELSE 'In Progress' END
   WHERE id = NEW.action_id
     AND NEW.outcome IN ('done', 'in_progress')
     AND status IS DISTINCT FROM CASE NEW.outcome WHEN 'done' THEN 'Completed' ELSE 'In Progress' END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visit_action_review_sync ON public.visit_action_reviews;
CREATE TRIGGER trg_visit_action_review_sync
  BEFORE INSERT OR UPDATE ON public.visit_action_reviews
  FOR EACH ROW EXECUTE FUNCTION private.sync_action_status_from_review();

-- ── A. Pre-visit brief ─────────────────────────────────────────────────────
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
  WHERE dealership_id = p_dealership_id AND status = 'completed'
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

-- ── D. Visit recap to dealer ───────────────────────────────────────────────
ALTER TABLE public.coach_visits ADD COLUMN IF NOT EXISTS recap_sent_at timestamptz;

-- Don't retro-send recaps for visits logged before this feature existed.
UPDATE public.coach_visits SET recap_sent_at = updated_at
WHERE status = 'completed' AND summary IS NOT NULL AND recap_sent_at IS NULL;

CREATE OR REPLACE FUNCTION private.send_visit_recap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org   uuid;
  v_n     integer := COALESCE(cardinality(NEW.agreed_action_ids), 0);
BEGIN
  IF NEW.status <> 'completed' OR NEW.summary IS NULL OR NEW.recap_sent_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT organization_id INTO v_org FROM public.dealerships WHERE id = NEW.dealership_id;

  INSERT INTO public.notifications
    (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
  SELECT m.user_id, v_org, 'visit_recap', 'in_app', 'coach_visit', NEW.id,
         'Visit recap: ' || to_char(NEW.visit_date, 'DD Mon YYYY'),
         left(NEW.summary, 280)
           || CASE WHEN v_n > 0
                   THEN ' — ' || v_n || ' agreed action' || CASE WHEN v_n = 1 THEN '' ELSE 's' END
                   ELSE '' END
  FROM public.memberships m
  WHERE m.organization_id = v_org AND m.is_active = true;

  -- ponytail: in-app only; add email via notify-dispatcher once the Resend domain is verified.
  NEW.recap_sent_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_coach_visit_recap ON public.coach_visits;
CREATE TRIGGER trg_coach_visit_recap
  BEFORE INSERT OR UPDATE OF status, summary ON public.coach_visits
  FOR EACH ROW EXECUTE FUNCTION private.send_visit_recap();

-- ── F. OEM coaching effectiveness ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_network_coaching_stats()
RETURNS TABLE (
  dealership_id           uuid,
  dealership_name         text,
  last_visit_date         date,
  days_since_last_visit   integer,
  visits_last_90d         integer,
  agreed_actions          integer,
  agreed_actions_completed integer,
  agreed_completion_rate  numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.caller_is_verified_oem() THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN QUERY
  WITH net AS (
    SELECT DISTINCT dnm.dealership_id
    FROM public.dealer_network_memberships dnm
    JOIN public.oem_networks onet ON onet.id = dnm.network_id
    WHERE onet.owner_org_id = private.caller_oem_org_id()
      AND onet.status = 'active'
      AND dnm.is_active = true
  ),
  v AS (
    SELECT cv.dealership_id,
           max(cv.visit_date) AS last_visit,
           count(DISTINCT cv.id) FILTER (WHERE cv.visit_date >= CURRENT_DATE - 90)::int AS visits_90d,
           array_agg(DISTINCT a) FILTER (WHERE a IS NOT NULL) AS agreed
    FROM public.coach_visits cv
    LEFT JOIN LATERAL unnest(cv.agreed_action_ids) a ON true
    WHERE cv.status = 'completed'
    GROUP BY cv.dealership_id
  )
  SELECT d.id, d.name, v.last_visit,
         CASE WHEN v.last_visit IS NULL THEN NULL ELSE (CURRENT_DATE - v.last_visit)::int END,
         COALESCE(v.visits_90d, 0),
         COALESCE(cardinality(v.agreed), 0),
         (SELECT count(*)::int FROM public.improvement_actions ia
           WHERE ia.id = ANY (v.agreed) AND ia.status = 'Completed'),
         CASE WHEN COALESCE(cardinality(v.agreed), 0) = 0 THEN NULL
              ELSE round(100.0 * (SELECT count(*) FROM public.improvement_actions ia
                                   WHERE ia.id = ANY (v.agreed) AND ia.status = 'Completed')
                         / cardinality(v.agreed), 0) END
  FROM net
  JOIN public.dealerships d ON d.id = net.dealership_id
  LEFT JOIN v ON v.dealership_id = d.id
  ORDER BY v.last_visit NULLS FIRST;
END;
$$;

REVOKE ALL ON FUNCTION public.get_network_coaching_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_network_coaching_stats() TO authenticated;
