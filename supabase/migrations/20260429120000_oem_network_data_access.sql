-- ── OEM admins can read dealerships in their network ──────────────
-- Without this, the OEM Dashboard leaderboard shows blank dealer names
-- because dealerships RLS is scoped to the user's own org.
DROP POLICY IF EXISTS "OEM admins can view network dealerships" ON public.dealerships;
CREATE POLICY "OEM admins can view network dealerships"
ON public.dealerships FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealer_network_memberships dnm
    JOIN public.oem_networks n ON n.id = dnm.network_id
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE dnm.dealership_id = dealerships.id
      AND dnm.is_active = true
      AND m.user_id = auth.uid()
      AND m.is_active = true
  )
);

-- ── OEM admins can read assessments for their network dealers ──────
-- Without this, the OEM Dashboard leaderboard shows no scores
-- because assessments RLS is scoped to auth.uid() = user_id.
DROP POLICY IF EXISTS "OEM admins can view network assessments" ON public.assessments;
CREATE POLICY "OEM admins can view network assessments"
ON public.assessments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealer_network_memberships dnm
    JOIN public.oem_networks n ON n.id = dnm.network_id
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE dnm.dealership_id = assessments.dealership_id
      AND dnm.is_active = true
      AND m.user_id = auth.uid()
      AND m.is_active = true
  )
);
