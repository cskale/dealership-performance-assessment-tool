-- Replace client-side action_audit_log inserts (which return 403) with a
-- SECURITY DEFINER trigger so all writes happen in the DB security context.

CREATE OR REPLACE FUNCTION private.log_improvement_action_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT o.id INTO v_org_id
  FROM public.assessments a
  JOIN public.dealerships d ON d.id = a.dealership_id
  JOIN public.organizations o ON o.id = d.organization_id
  WHERE a.id = COALESCE(NEW.assessment_id, OLD.assessment_id)
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.action_audit_log
      (action_id, organization_id, changed_by, field_name, new_value)
    VALUES
      (NEW.id, v_org_id, auth.uid(), 'created', 'Action created');

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.action_audit_log
        (action_id, organization_id, changed_by, field_name, old_value, new_value)
      VALUES
        (NEW.id, v_org_id, auth.uid(), 'status', OLD.status, NEW.status);
    END IF;
    IF OLD.action_title IS DISTINCT FROM NEW.action_title THEN
      INSERT INTO public.action_audit_log
        (action_id, organization_id, changed_by, field_name, old_value, new_value)
      VALUES
        (NEW.id, v_org_id, auth.uid(), 'action_title', OLD.action_title, NEW.action_title);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_improvement_action_audit ON public.improvement_actions;
CREATE TRIGGER trg_improvement_action_audit
  AFTER INSERT OR UPDATE ON public.improvement_actions
  FOR EACH ROW EXECUTE FUNCTION private.log_improvement_action_change();
