-- ── send_weekly_digests ──────────────────────────────────────────────────────
-- Runs every Monday at 07:00 UTC.
-- Aggregates open/overdue actions per org, sends in_app + email digest to
-- each member who has weekly_digest enabled (default = true when no prefs row).
-- Email requires app.settings.service_role_key to be configured (see #70 notes).

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
  srk := current_setting('app.settings.service_role_key', true);

  FOR org_id IN
    SELECT DISTINCT organization_id
    FROM   public.improvement_actions
    WHERE  status IN ('Open', 'In Progress')
  LOOP
    -- Total open / in-progress
    SELECT COUNT(*) INTO open_count
    FROM   public.improvement_actions
    WHERE  organization_id = org_id
      AND  status IN ('Open', 'In Progress');

    -- Overdue: past target date and not completed
    SELECT COUNT(*) INTO overdue_count
    FROM   public.improvement_actions
    WHERE  organization_id = org_id
      AND  status != 'Completed'
      AND  target_completion_date IS NOT NULL
      AND  target_completion_date < CURRENT_DATE;

    -- Top 3 by urgency_score DESC
    SELECT jsonb_agg(t) INTO top_actions
    FROM (
      SELECT
        id,
        action_title,
        priority,
        urgency_score,
        target_completion_date,
        CASE
          WHEN target_completion_date IS NOT NULL
               AND target_completion_date < CURRENT_DATE
          THEN (CURRENT_DATE - target_completion_date)
          ELSE 0
        END AS days_overdue
      FROM   public.improvement_actions
      WHERE  organization_id = org_id
        AND  status IN ('Open', 'In Progress')
      ORDER  BY urgency_score DESC NULLS LAST
      LIMIT  3
    ) t;

    -- JSON payload for email template
    digest_body := jsonb_build_object(
      'open_count',    open_count,
      'overdue_count', overdue_count,
      'top_actions',   COALESCE(top_actions, '[]'::jsonb)
    )::TEXT;

    -- Human-readable summary for in_app body
    inapp_body := open_count || ' open action'
      || CASE WHEN open_count = 1 THEN '' ELSE 's' END
      || CASE WHEN overdue_count > 0
              THEN ', ' || overdue_count || ' overdue'
              ELSE '' END || '.';

    -- Per active member
    FOR member_rec IN
      SELECT user_id
      FROM   public.memberships
      WHERE  organization_id = org_id
        AND  is_active = true
    LOOP
      -- Skip if user has explicitly disabled weekly_digest
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.notification_preferences
        WHERE  user_id    = member_rec.user_id
          AND  weekly_digest = false
      );

      -- Get email
      SELECT email INTO user_email
      FROM   auth.users
      WHERE  id = member_rec.user_id;

      CONTINUE WHEN user_email IS NULL;

      -- In-app: insert directly
      INSERT INTO public.notifications
        (user_id, organization_id, type, channel, entity_type, title, body)
      VALUES
        (member_rec.user_id, org_id,
         'digest', 'in_app', 'assessment',
         notif_title, inapp_body);

      -- Email via edge function (skip if no service role key)
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

-- Schedule: every Monday 07:00 UTC
SELECT cron.schedule(
  'weekly-digest',
  '0 7 * * 1',
  'SELECT public.send_weekly_digests()'
);
