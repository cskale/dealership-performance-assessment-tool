-- Monthly KPI check-ins between assessments (spec 2026-09-25 §2)
CREATE TABLE IF NOT EXISTS public.kpi_checkins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  kpi_key         text NOT NULL,
  period_month    date NOT NULL CHECK (EXTRACT(DAY FROM period_month) = 1),
  value           numeric NOT NULL,
  entered_by      uuid NOT NULL DEFAULT auth.uid(),
  entered_by_role text NOT NULL DEFAULT 'dealer' CHECK (entered_by_role IN ('dealer','coach')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dealership_id, kpi_key, period_month)
);
CREATE INDEX IF NOT EXISTS kpi_checkins_dealer_kpi_idx
  ON public.kpi_checkins (dealership_id, kpi_key, period_month DESC);

-- Server decides who entered it; client values ignored.
CREATE OR REPLACE FUNCTION private.kpi_checkins_set_actor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.entered_by := auth.uid();
  NEW.entered_by_role := CASE
    WHEN (SELECT actor_type FROM public.profiles WHERE user_id = auth.uid()) = 'coach'
    THEN 'coach' ELSE 'dealer' END;
  NEW.updated_at := now();
  IF TG_OP = 'UPDATE' THEN NEW.created_at := OLD.created_at; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER kpi_checkins_set_actor
  BEFORE INSERT OR UPDATE ON public.kpi_checkins
  FOR EACH ROW EXECUTE FUNCTION private.kpi_checkins_set_actor();

-- Write access: active dealer member with owner/admin/member role, or assigned coach.
CREATE OR REPLACE FUNCTION private.can_write_kpi_checkin(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.user_can_access_dealership_as_coach(_dealership_id)
      OR EXISTS (
        SELECT 1 FROM public.dealerships d
        JOIN public.memberships m ON m.organization_id = d.organization_id
        WHERE d.id = _dealership_id AND m.user_id = auth.uid()
          AND m.is_active AND m.role IN ('owner','admin','member'));
$$;

CREATE OR REPLACE FUNCTION private.can_delete_kpi_checkin(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = _dealership_id AND m.user_id = auth.uid()
      AND m.is_active AND m.role IN ('owner','admin'));
$$;

REVOKE ALL ON FUNCTION private.can_write_kpi_checkin(uuid), private.can_delete_kpi_checkin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_write_kpi_checkin(uuid), private.can_delete_kpi_checkin(uuid) TO authenticated;

ALTER TABLE public.kpi_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY kpi_checkins_select ON public.kpi_checkins FOR SELECT TO authenticated
  USING (private.can_view_dealership(dealership_id));
CREATE POLICY kpi_checkins_insert ON public.kpi_checkins FOR INSERT TO authenticated
  WITH CHECK (private.can_write_kpi_checkin(dealership_id));
CREATE POLICY kpi_checkins_update ON public.kpi_checkins FOR UPDATE TO authenticated
  USING (private.can_write_kpi_checkin(dealership_id))
  WITH CHECK (private.can_write_kpi_checkin(dealership_id));
CREATE POLICY kpi_checkins_delete ON public.kpi_checkins FOR DELETE TO authenticated
  USING (private.can_delete_kpi_checkin(dealership_id));

-- Reminder notification type
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY['stale_action','milestone','digest','coach_comment',
                           'google_review_alert','visit_recap','kpi_checkin_reminder']));

-- 1st of month: remind active org owners/admins of dealerships that have ever been assessed.
CREATE OR REPLACE FUNCTION public.process_kpi_checkin_reminders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev_month text := to_char(date_trunc('month', now()) - interval '1 month', 'FMMonth YYYY');
BEGIN
  INSERT INTO public.notifications
    (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
  SELECT DISTINCT m.user_id, d.organization_id, 'kpi_checkin_reminder', 'in_app',
         'dealership', d.id,
         'Log your ' || prev_month || ' KPIs',
         'Add last month''s figures to keep your trend lines and projections current.'
  FROM public.dealerships d
  JOIN public.memberships m ON m.organization_id = d.organization_id
  WHERE m.is_active AND m.role IN ('owner','admin')
    AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.dealership_id = d.id);
END $$;
REVOKE ALL ON FUNCTION public.process_kpi_checkin_reminders() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('kpi-checkin-reminder', '0 7 1 * *',
                     'SELECT public.process_kpi_checkin_reminders()');
