-- Org owners/admins currently cannot see teammates' profiles: the only SELECT
-- policy on profiles is `auth.uid() = user_id`, so any query joining profiles
-- to memberships for the "Current members" list is silently filtered down to
-- just the caller's own row. Reuses the existing is_org_admin_or_owner()
-- SECURITY DEFINER helper (from 20260318215544) to avoid recursion.

CREATE POLICY "profiles_select_org_admin_view_members"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = profiles.user_id
        AND m.is_active = true
        AND public.is_org_admin_or_owner(m.organization_id)
    )
  );
