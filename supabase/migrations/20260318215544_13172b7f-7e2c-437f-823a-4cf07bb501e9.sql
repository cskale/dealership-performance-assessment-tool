-- Add SELECT policy to memberships so users can read their own memberships
-- and admins/owners can see all memberships in their organization.
-- This is critical: without it, all tenant-scoped RLS policies that JOIN
-- memberships silently return empty results.

CREATE POLICY "memberships_select_own"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Admins/owners need to see other members in their org (for invite management, etc.)
-- Using a SECURITY DEFINER function to avoid recursion.
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE organization_id = _org_id
      AND user_id = (SELECT auth.uid())
      AND role IN ('owner', 'admin')
      AND is_active = true
  );
$$;

CREATE POLICY "memberships_select_org_admin"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (
    public.is_org_admin_or_owner(organization_id)
  );