-- Track who last edited a kpi_checkins row separately from who originally entered it.
-- entered_by / entered_by_role must keep reflecting the original enterer (the
-- timeline UI shows "checkin-dealer"/"checkin-coach" from entered_by_role), so a
-- coach editing a dealer's figure — or vice versa — must not overwrite that.
ALTER TABLE public.kpi_checkins
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by_role text CHECK (updated_by_role IN ('dealer','coach'));

CREATE OR REPLACE FUNCTION private.kpi_checkins_set_actor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role text := CASE
    WHEN (SELECT actor_type FROM public.profiles WHERE user_id = auth.uid()) = 'coach'
    THEN 'coach' ELSE 'dealer' END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.entered_by := auth.uid();
    NEW.entered_by_role := _role;
  ELSE
    -- Preserve the original enterer on UPDATE.
    NEW.entered_by := OLD.entered_by;
    NEW.entered_by_role := OLD.entered_by_role;
    NEW.created_at := OLD.created_at;
  END IF;

  NEW.updated_by := auth.uid();
  NEW.updated_by_role := _role;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
