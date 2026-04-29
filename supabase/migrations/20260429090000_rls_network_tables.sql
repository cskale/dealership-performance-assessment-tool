-- ─────────────────────────────────────────────────────────
-- RLS: oem_networks
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.oem_networks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "oem_networks_select" ON public.oem_networks;
CREATE POLICY "oem_networks_select"
ON public.oem_networks FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
  )
);

DROP POLICY IF EXISTS "oem_networks_insert" ON public.oem_networks;
CREATE POLICY "oem_networks_insert"
ON public.oem_networks FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "oem_networks_update" ON public.oem_networks;
CREATE POLICY "oem_networks_update"
ON public.oem_networks FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "oem_networks_delete" ON public.oem_networks;
CREATE POLICY "oem_networks_delete"
ON public.oem_networks FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
      AND m.role = 'owner'
  )
);

-- ─────────────────────────────────────────────────────────
-- RLS: dealer_network_memberships
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.dealer_network_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dnm_select" ON public.dealer_network_memberships;
CREATE POLICY "dnm_select"
ON public.dealer_network_memberships FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
  )
);

DROP POLICY IF EXISTS "dnm_insert" ON public.dealer_network_memberships;
CREATE POLICY "dnm_insert"
ON public.dealer_network_memberships FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "dnm_update" ON public.dealer_network_memberships;
CREATE POLICY "dnm_update"
ON public.dealer_network_memberships FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "dnm_delete" ON public.dealer_network_memberships;
CREATE POLICY "dnm_delete"
ON public.dealer_network_memberships FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

-- ─────────────────────────────────────────────────────────
-- RLS: coach_dealership_assignments
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.coach_dealership_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cda_select" ON public.coach_dealership_assignments;
CREATE POLICY "cda_select"
ON public.coach_dealership_assignments FOR SELECT TO authenticated
USING (
  coach_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "cda_insert" ON public.coach_dealership_assignments;
CREATE POLICY "cda_insert"
ON public.coach_dealership_assignments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "cda_update" ON public.coach_dealership_assignments;
CREATE POLICY "cda_update"
ON public.coach_dealership_assignments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "cda_delete" ON public.coach_dealership_assignments;
CREATE POLICY "cda_delete"
ON public.coach_dealership_assignments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);
