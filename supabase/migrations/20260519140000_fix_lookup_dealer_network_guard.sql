-- Security fix: lookup_dealer_by_email must NOT return organization_id.
-- Returning organization_id allowed an OEM admin to map any dealer's email → org
-- across the entire platform, leaking competitive network intelligence.
--
-- The client fetches organization_id separately via the additive OEM RLS policy
-- on the dealerships table (SELECT organization_id FROM dealerships WHERE id = ...).
-- That path is intentional and scoped; this enumeration path is not.

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

  SELECT id, name, location
  INTO v_dealer
  FROM dealerships
  WHERE id = v_profile.active_dealership_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_dealership');
  END IF;

  -- organization_id intentionally omitted: client must fetch it separately via
  -- SELECT organization_id FROM dealerships WHERE id = <dealership_id>
  -- using the additive OEM RLS policy. This prevents cross-platform org mapping
  -- via brute-force email enumeration.
  RETURN jsonb_build_object(
    'found',           true,
    'dealership_id',   v_dealer.id,
    'dealership_name', v_dealer.name,
    'location',        v_dealer.location
  );
END;
$$;
