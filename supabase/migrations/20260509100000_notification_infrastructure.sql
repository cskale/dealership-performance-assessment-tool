-- ── notifications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN ('stale_action','milestone','digest','coach_comment','google_review_alert')),
  channel         TEXT        NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app','email')),
  entity_type     TEXT,
  entity_id       UUID,
  title           TEXT        NOT NULL,
  body            TEXT        NOT NULL,
  read            BOOLEAN     NOT NULL DEFAULT false,
  sent_at         TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id      ON public.notifications(organization_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_org_member(organization_id));

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── notification_preferences ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                  UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID      NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled       BOOLEAN   NOT NULL DEFAULT true,
  in_app_enabled      BOOLEAN   NOT NULL DEFAULT true,
  stale_action_nudge  BOOLEAN   NOT NULL DEFAULT true,
  weekly_digest       BOOLEAN   NOT NULL DEFAULT true,
  milestone_alerts    BOOLEAN   NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_own"
  ON public.notification_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── improvement_actions additions ───────────────────────────────
ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS stale_nudge_sent_at     TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_status_updated_at  TIMESTAMPTZ NULL;

CREATE OR REPLACE FUNCTION public.set_last_status_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_improvement_actions_status_updated ON public.improvement_actions;
CREATE TRIGGER trg_improvement_actions_status_updated
  BEFORE UPDATE ON public.improvement_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_last_status_updated_at();
