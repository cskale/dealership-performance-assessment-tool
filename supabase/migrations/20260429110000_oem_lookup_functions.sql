-- ─────────────────────────────────────────────────────────────────
-- Helper: returns the caller's active_organization_id (OEM org)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.caller_oem_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_organization_id
  FROM profiles
  WHERE user_id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────
-- Guard: returns true only when caller is OEM + has active network
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.caller_is_verified_oem()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT actor_type FROM profiles WHERE user_id = auth.uid()) = 'oem'
    AND EXISTS (
      SELECT 1 FROM oem_networks
      WHERE owner_org_id = private.caller_oem_org_id()
        AND status = 'active'
    )
$$;

-- ─────────────────────────────────────────────────────────────────
-- 1. lookup_dealer_by_email
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.lookup_dealer_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid;
  v_profile  record;
  v_dealer   record;
BEGIN
  IF auth.uid() IS NULL OR NOT private.caller_is_verified_oem() THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_account');
  END IF;

  SELECT active_organization_id, active_dealership_id
  INTO v_profile
  FROM profiles
  WHERE user_id = v_user_id;

  IF v_profile.active_dealership_id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_dealership');
  END IF;

  SELECT id, name, location, organization_id
  INTO v_dealer
  FROM dealerships
  WHERE id = v_profile.active_dealership_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_dealership');
  END IF;

  RETURN jsonb_build_object(
    'found',           true,
    'dealership_id',   v_dealer.id,
    'dealership_name', v_dealer.name,
    'location',        v_dealer.location,
    'organization_id', v_dealer.organization_id
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 2. get_dealership_details
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dealership_details(p_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT private.caller_is_verified_oem() THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'location', location)
      )
      FROM dealerships
      WHERE id = ANY(p_ids)
    ),
    '[]'::jsonb
  );
END;
$$;
