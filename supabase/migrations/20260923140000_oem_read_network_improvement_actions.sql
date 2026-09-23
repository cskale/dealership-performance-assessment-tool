-- OEM dashboard showed "0 open actions" for every dealer: OEM users had no
-- SELECT policy on improvement_actions. Read-only, network-scoped. Uses a
-- SECURITY DEFINER helper to avoid RLS recursion via dealer_network_memberships.
CREATE OR REPLACE FUNCTION private.oem_can_view_assessment(_assessment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = _assessment_id
      AND public.user_can_access_assessment_as_oem(a.dealership_id)
  );
$$;

REVOKE ALL ON FUNCTION private.oem_can_view_assessment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.oem_can_view_assessment(uuid) TO authenticated;

CREATE POLICY "OEM admins can view network improvement_actions"
  ON public.improvement_actions
  FOR SELECT TO authenticated
  USING (private.oem_can_view_assessment(assessment_id));
