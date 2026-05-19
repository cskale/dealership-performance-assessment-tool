-- supabase/migrations/20260519130000_cron_use_anon_key.sql
-- Fix: replace app.settings.service_role_key (requires superuser) with anon key.
-- notify-dispatcher has verify_jwt=false so anon key is sufficient for auth.
-- The Edge Function itself uses SUPABASE_SERVICE_ROLE_KEY from its own env vars.

CREATE OR REPLACE FUNCTION public.process_stale_actions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_rec     RECORD;
  days_stale     INTEGER;
  notif_title    TEXT;
  notif_body     TEXT;
  anon_key       CONSTANT TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeXBnb3N1eWZka2txYWZmdGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NjE3NTksImV4cCI6MjA4OTMyMTc1OX0.c274nQnYDUN2DMTIVhCoMZUDNB1pST6WLMpzmPHU7lI';
  edge_url       CONSTANT TEXT := 'https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/notify-dispatcher';
BEGIN
  FOR action_rec IN
    SELECT
      ia.id,
      ia.action_title,
      ia.priority,
      ia.status,
      ia.user_id,
      ia.organization_id,
      ia.responsible_person,
      ia.stale_nudge_sent_at,
      GREATEST(1, FLOOR(
        EXTRACT(EPOCH FROM (now() - COALESCE(ia.last_status_updated_at, ia.created_at))) / 86400
      )::INTEGER) AS days_stale
    FROM public.improvement_actions ia
    WHERE ia.status IN ('Open', 'In Progress')
      AND ia.user_id IS NOT NULL
      AND (ia.stale_nudge_sent_at IS NULL
           OR ia.stale_nudge_sent_at < now() - INTERVAL '7 days')
      AND (
        (ia.priority = 'critical'
          AND (ia.last_status_updated_at IS NULL
               OR ia.last_status_updated_at < now() - INTERVAL '7 days'))
        OR
        (ia.priority = 'high'
          AND (ia.last_status_updated_at IS NULL
               OR ia.last_status_updated_at < now() - INTERVAL '14 days'))
        OR
        (ia.priority = 'medium'
          AND (ia.last_status_updated_at IS NULL
               OR ia.last_status_updated_at < now() - INTERVAL '21 days'))
      )
  LOOP
    days_stale  := action_rec.days_stale;
    notif_title := 'Action overdue: ' || action_rec.action_title;
    notif_body  := 'This action has had no update for ' || days_stale
                   || ' day' || CASE WHEN days_stale = 1 THEN '' ELSE 's' END
                   || '. Priority: ' || action_rec.priority;

    INSERT INTO public.notifications
      (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
    VALUES
      (action_rec.user_id, action_rec.organization_id,
       'stale_action', 'in_app',
       'improvement_action', action_rec.id,
       notif_title, notif_body);

    IF action_rec.responsible_person LIKE '%@%' THEN
      PERFORM net.http_post(
        url     := edge_url,
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body    := jsonb_build_object(
          'user_id',         action_rec.user_id,
          'organization_id', action_rec.organization_id,
          'type',            'stale_action',
          'channel',         'email',
          'entity_type',     'improvement_action',
          'entity_id',       action_rec.id,
          'title',           notif_title,
          'body',            notif_body,
          'email_to',        action_rec.responsible_person
        )
      );
    END IF;

    UPDATE public.improvement_actions
       SET stale_nudge_sent_at = now()
     WHERE id = action_rec.id;
  END LOOP;
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
  anon_key      CONSTANT TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeXBnb3N1eWZka2txYWZmdGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NjE3NTksImV4cCI6MjA4OTMyMTc1OX0.c274nQnYDUN2DMTIVhCoMZUDNB1pST6WLMpzmPHU7lI';
  edge_url      CONSTANT TEXT := 'https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/notify-dispatcher';
BEGIN
  FOR org_id IN
    SELECT DISTINCT organization_id
    FROM   public.improvement_actions
    WHERE  status IN ('Open', 'In Progress')
  LOOP
    SELECT COUNT(*) INTO open_count
    FROM   public.improvement_actions
    WHERE  organization_id = org_id
      AND  status IN ('Open', 'In Progress');

    SELECT COUNT(*) INTO overdue_count
    FROM   public.improvement_actions
    WHERE  organization_id = org_id
      AND  status != 'Completed'
      AND  target_completion_date IS NOT NULL
      AND  target_completion_date < CURRENT_DATE;

    SELECT jsonb_agg(t) INTO top_actions
    FROM (
      SELECT
        id, action_title, priority, urgency_score, target_completion_date,
        CASE
          WHEN target_completion_date IS NOT NULL AND target_completion_date < CURRENT_DATE
          THEN (CURRENT_DATE - target_completion_date)
          ELSE 0
        END AS days_overdue
      FROM   public.improvement_actions
      WHERE  organization_id = org_id
        AND  status IN ('Open', 'In Progress')
      ORDER  BY urgency_score DESC NULLS LAST
      LIMIT  3
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

      PERFORM net.http_post(
        url     := edge_url,
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || anon_key
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
    END LOOP;
  END LOOP;
END;
$$;
