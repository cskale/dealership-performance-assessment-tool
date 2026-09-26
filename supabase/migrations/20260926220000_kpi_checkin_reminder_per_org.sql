-- process_kpi_checkin_reminders() previously inserted one notification per
-- (user, dealership), so an owner/admin of a multi-dealership org got a
-- separate reminder for every dealership. Roll that up to one notification
-- per (user, organization), naming how many dealerships it covers.
CREATE OR REPLACE FUNCTION public.process_kpi_checkin_reminders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev_month text := to_char(date_trunc('month', now()) - interval '1 month', 'FMMonth YYYY');
BEGIN
  INSERT INTO public.notifications
    (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
  SELECT
    grouped.user_id, grouped.organization_id, 'kpi_checkin_reminder', 'in_app',
    'organization', grouped.organization_id,
    'Log your ' || prev_month || ' KPIs',
    CASE
      WHEN grouped.dealership_count > 1
        THEN 'Add last month''s figures for your ' || grouped.dealership_count || ' dealerships to keep your trend lines and projections current.'
      ELSE 'Add last month''s figures to keep your trend lines and projections current.'
    END
  FROM (
    SELECT m.user_id, d.organization_id, count(DISTINCT d.id) AS dealership_count
    FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE m.is_active AND m.role IN ('owner','admin')
      AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.dealership_id = d.id)
    GROUP BY m.user_id, d.organization_id
  ) grouped;
END $$;
REVOKE ALL ON FUNCTION public.process_kpi_checkin_reminders() FROM PUBLIC, anon, authenticated;
