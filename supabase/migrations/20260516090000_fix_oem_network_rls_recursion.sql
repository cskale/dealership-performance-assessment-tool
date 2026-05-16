-- Fix circular RLS recursion between oem_networks and dealer_network_memberships.
-- Root cause: oem_networks policy read dealer_network_memberships,
-- whose policies read oem_networks back → infinite recursion.
-- Fix: SECURITY DEFINER helper in private schema breaks the cycle.

-- Step 1: Helper functions that check network ownership WITHOUT triggering RLS on oem_networks
CREATE OR REPLACE FUNCTION private.user_is_member_of_network_owner(p_network_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM oem_networks n
    JOIN memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = p_network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION private.user_is_admin_of_network_owner(p_network_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM oem_networks n
    JOIN memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = p_network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role = ANY (ARRAY['owner'::membership_role, 'admin'::membership_role])
  );
$$;

-- Step 2: Drop all recursive policies
DROP POLICY IF EXISTS "Members can read their networks"          ON public.oem_networks;
DROP POLICY IF EXISTS "Members can read their dealer memberships" ON public.dealer_network_memberships;
DROP POLICY IF EXISTS "dnm_select"  ON public.dealer_network_memberships;
DROP POLICY IF EXISTS "dnm_delete"  ON public.dealer_network_memberships;
DROP POLICY IF EXISTS "dnm_update"  ON public.dealer_network_memberships;
DROP POLICY IF EXISTS "dnm_insert"  ON public.dealer_network_memberships;

-- Step 3: Recreate dealer_network_memberships policies using SECURITY DEFINER helpers
CREATE POLICY "dnm_select" ON public.dealer_network_memberships
FOR SELECT USING (
  private.user_is_member_of_network_owner(network_id)
  OR organization_id IN (
    SELECT m.organization_id FROM memberships m
    WHERE m.user_id = auth.uid() AND m.is_active = true
  )
);

CREATE POLICY "dnm_insert" ON public.dealer_network_memberships
FOR INSERT WITH CHECK (
  private.user_is_admin_of_network_owner(network_id)
);

CREATE POLICY "dnm_update" ON public.dealer_network_memberships
FOR UPDATE USING (
  private.user_is_admin_of_network_owner(network_id)
);

CREATE POLICY "dnm_delete" ON public.dealer_network_memberships
FOR DELETE USING (
  private.user_is_admin_of_network_owner(network_id)
);
