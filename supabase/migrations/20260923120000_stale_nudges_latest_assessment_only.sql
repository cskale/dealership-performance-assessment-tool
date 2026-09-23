-- Fix notification flood (Sep 2026): one user received 1,868 in-app + 245 email
-- "Action overdue" nudges in 30 days. 557 of 597 open actions belonged to
-- assessments superseded by a newer one for the same dealership, and every
-- stale action fired its own email, tripping notify-dispatcher's 50/hour limit.
--
-- Changes:
--   1. private.current_assessment_ids(): latest assessment per dealership.
--   2. process_stale_actions(): only nudges actions on a current assessment;
--      in-app nudge per action, but ONE email per user per run (most urgent
--      action, "+N more" in the title).
--   3. send_weekly_digests(): counts only actions on a current assessment.
-- Also brings the repo back in line with the live function bodies (vault SRK
-- + owner email lookup), which had drifted from 20260519130000.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.current_assessment_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (dealership_id) id
  FROM public.assessments
  ORDER BY dealership_id, created_at DESC;
$$;

REVOKE ALL ON FUNCTION private.current_assessment_ids() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.process_stale_actions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_rec     RECORD;
  action_rec   RECORD;
  owner_email  TEXT;
  srk          TEXT;
  email_title  TEXT;
  edge_url     TEXT := 'https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/notify-dispatcher';
BEGIN
  SELECT decrypted_secret INTO srk
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  CREATE TEMP TABLE _stale ON COMMIT DROP AS
  SELECT
    ia.id, ia.action_title, ia.priority, ia.user_id, ia.organization_id,
    GREATEST(1, FLOOR(
      EXTRACT(EPOCH FROM (now() - COALESCE(ia.last_status_updated_at, ia.created_at))) / 86400
    )::INTEGER) AS days_stale,
    CASE ia.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END AS prio_rank
  FROM public.improvement_actions ia
  WHERE ia.status IN ('Open', 'In Progress')
    AND ia.user_id IS NOT NULL
    AND ia.assessment_id IN (SELECT private.current_assessment_ids())
    AND (ia.stale_nudge_sent_at IS NULL
         OR ia.stale_nudge_sent_at < now() - INTERVAL '7 days')
    AND (
      (ia.priority = 'critical'
        AND COALESCE(ia.last_status_updated_at, ia.created_at) < now() - INTERVAL '7 days')
      OR (ia.priority = 'high'
        AND COALESCE(ia.last_status_updated_at, ia.created_at) < now() - INTERVAL '14 days')
      OR (ia.priority = 'medium'
        AND COALESCE(ia.last_status_updated_at, ia.created_at) < now() - INTERVAL '21 days')
    );

  -- In-app: one per stale action (links to the action).
  INSERT INTO public.notifications
    (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
  SELECT user_id, organization_id, 'stale_action', 'in_app', 'improvement_action', id,
         'Action overdue: ' || action_title,
         'This action has had no update for ' || days_stale
           || ' day' || CASE WHEN days_stale = 1 THEN '' ELSE 's' END
           || '. Priority: ' || priority
  FROM _stale;

  -- Email: one per user, for their most urgent stale action.
  IF srk IS NOT NULL AND srk <> '' THEN
    FOR user_rec IN
      SELECT user_id, count(*) AS n FROM _stale GROUP BY user_id
    LOOP
      SELECT * INTO action_rec FROM _stale
      WHERE user_id = user_rec.user_id
      ORDER BY prio_rank, days_stale DESC
      LIMIT 1;

      SELECT email INTO owner_email FROM auth.users WHERE id = user_rec.user_id;
      CONTINUE WHEN owner_email IS NULL;

      email_title := 'Action overdue: ' || action_rec.action_title
        || CASE WHEN user_rec.n > 1
                THEN ' (+' || (user_rec.n - 1) || ' more)' ELSE '' END;

      PERFORM net.http_post(
        url     := edge_url,
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || srk
        ),
        body    := jsonb_build_object(
          'user_id',         user_rec.user_id,
          'organization_id', action_rec.organization_id,
          'type',            'stale_action',
          'channel',         'email',
          'entity_type',     'improvement_action',
          'entity_id',       action_rec.id,
          'title',           email_title,
          'body',            'This action has had no update for ' || action_rec.days_stale
                               || ' day' || CASE WHEN action_rec.days_stale = 1 THEN '' ELSE 's' END
                               || '. Priority: ' || action_rec.priority,
          'email_to',        owner_email
        )
      );
    END LOOP;
  END IF;

  UPDATE public.improvement_actions
     SET stale_nudge_sent_at = now()
   WHERE id IN (SELECT id FROM _stale);
END;
$$;

CREATE OR REPLACE FUNCTION public.send_weekly_digests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id        UUID;
  open_count    INTEGER;
  overdue_count INTEGER;
  top_actions   JSONB;
  member_rec    RECORD;
  user_email    TEXT;
  digest_body   TEXT;
  inapp_body    TEXT;
  notif_title   TEXT := 'Your weekly action digest';
  srk           TEXT;
  edge_url      TEXT := 'https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/notify-dispatcher';
BEGIN
  SELECT decrypted_secret INTO srk
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  CREATE TEMP TABLE _current ON COMMIT DROP AS
  SELECT * FROM public.improvement_actions
  WHERE assessment_id IN (SELECT private.current_assessment_ids());

  FOR org_id IN
    SELECT DISTINCT organization_id FROM _current
    WHERE status IN ('Open', 'In Progress')
  LOOP
    SELECT COUNT(*) INTO open_count
    FROM _current
    WHERE organization_id = org_id AND status IN ('Open', 'In Progress');

    SELECT COUNT(*) INTO overdue_count
    FROM _current
    WHERE organization_id = org_id
      AND status != 'Completed'
      AND target_completion_date IS NOT NULL
      AND target_completion_date < CURRENT_DATE;

    SELECT jsonb_agg(t) INTO top_actions
    FROM (
      SELECT id, action_title, priority, urgency_score, target_completion_date,
        CASE WHEN target_completion_date IS NOT NULL AND target_completion_date < CURRENT_DATE
             THEN (CURRENT_DATE - target_completion_date) ELSE 0 END AS days_overdue
      FROM _current
      WHERE organization_id = org_id AND status IN ('Open', 'In Progress')
      ORDER BY urgency_score DESC NULLS LAST
      LIMIT 3
    ) t;

    digest_body := jsonb_build_object(
      'open_count',    open_count,
      'overdue_count', overdue_count,
      'top_actions',   COALESCE(top_actions, '[]'::jsonb)
    )::TEXT;

    inapp_body := open_count || ' open action'
      || CASE WHEN open_count = 1 THEN '' ELSE 's' END
      || CASE WHEN overdue_count > 0 THEN ', ' || overdue_count || ' overdue' ELSE '' END || '.';

    FOR member_rec IN
      SELECT user_id FROM public.memberships
      WHERE organization_id = org_id AND is_active = true
    LOOP
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.notification_preferences
        WHERE user_id = member_rec.user_id AND weekly_digest = false
      );

      SELECT email INTO user_email FROM auth.users WHERE id = member_rec.user_id;
      CONTINUE WHEN user_email IS NULL;

      INSERT INTO public.notifications
        (user_id, organization_id, type, channel, entity_type, title, body)
      VALUES
        (member_rec.user_id, org_id, 'digest', 'in_app', 'assessment', notif_title, inapp_body);

      IF srk IS NOT NULL AND srk <> '' THEN
        PERFORM net.http_post(
          url     := edge_url,
          headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'Authorization', 'Bearer ' || srk
          ),
          body    := jsonb_build_object(
            'user_id',         member_rec.user_id,
            'organization_id', org_id,
            'type',            'digest',
            'channel',         'email',
            'entity_type',     'assessment',
            'title',           notif_title,
            'body',            digest_body,
            'email_to',        user_email
          )
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
