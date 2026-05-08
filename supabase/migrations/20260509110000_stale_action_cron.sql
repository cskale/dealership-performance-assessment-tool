-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── process_stale_actions ────────────────────────────────────────────────────
-- Called by cron daily at 08:00 UTC.
-- Inserts in_app notifications directly (SECURITY DEFINER bypasses RLS).
-- Sends email via notify-dispatcher edge function when responsible_person looks
-- like an email address AND app.settings.service_role_key is configured.
-- NOTE: To enable email dispatch, run once in SQL editor:
--   ALTER DATABASE postgres SET "app.settings.service_role_key" = '<your-service-role-key>';

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
  srk            TEXT;
  edge_url       TEXT := 'https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/notify-dispatcher';
BEGIN
  srk := current_setting('app.settings.service_role_key', true);

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

    -- In-app: insert directly, bypassing RLS
    INSERT INTO public.notifications
      (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
    VALUES
      (action_rec.user_id, action_rec.organization_id,
       'stale_action', 'in_app',
       'improvement_action', action_rec.id,
       notif_title, notif_body);

    -- Email: call edge function only if responsible_person is email-like and key is set
    IF action_rec.responsible_person LIKE '%@%'
       AND srk IS NOT NULL
       AND srk <> ''
    THEN
      PERFORM net.http_post(
        url     := edge_url,
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || srk
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

    -- Mark nudged
    UPDATE public.improvement_actions
       SET stale_nudge_sent_at = now()
     WHERE id = action_rec.id;
  END LOOP;
END;
$$;

-- ── trigger_stale_action_check ───────────────────────────────────────────────
-- Manual RPC callable by authenticated coaches and OEM admins for testing.

CREATE OR REPLACE FUNCTION public.trigger_stale_action_check()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND actor_type IN ('coach', 'oem')
  ) THEN
    RAISE EXCEPTION 'Access denied: coach or oem actor_type required';
  END IF;

  PERFORM public.process_stale_actions();
END;
$$;

-- ── Cron schedule: daily 08:00 UTC ──────────────────────────────────────────
SELECT cron.schedule(
  'stale-action-nudge',
  '0 8 * * *',
  'SELECT public.process_stale_actions()'
);
