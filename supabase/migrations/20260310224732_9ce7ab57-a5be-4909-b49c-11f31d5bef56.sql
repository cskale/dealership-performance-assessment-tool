
-- Create action_audit_log table
CREATE TABLE IF NOT EXISTS public.action_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.improvement_actions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  field_name TEXT NOT NULL,
  old_value TEXT NULL,
  new_value TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.action_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT for org members only
CREATE POLICY "Org members can view audit logs"
  ON public.action_audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_org_member(organization_id));

-- RLS: INSERT for org members only
CREATE POLICY "Org members can insert audit logs"
  ON public.action_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_member(organization_id));

-- Index for fast lookups by action_id
CREATE INDEX idx_action_audit_log_action_id ON public.action_audit_log(action_id);
CREATE INDEX idx_action_audit_log_org_id ON public.action_audit_log(organization_id);
