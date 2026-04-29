-- Allows an org owner to activate or deactivate OEM mode for their own account.
-- Guards: caller must be authenticated AND must be 'owner' of their active org.
-- Replaces manual SQL: UPDATE profiles SET actor_type='oem' WHERE user_id='<uuid>';
CREATE OR REPLACE FUNCTION public.toggle_oem_mode(p_activate boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_org_id  uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT active_organization_id INTO v_org_id
  FROM profiles WHERE user_id = v_user_id;

  -- Only org owners can toggle OEM mode
  IF NOT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = v_user_id
      AND organization_id = v_org_id
      AND role = 'owner'
      AND is_active = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'owner_required');
  END IF;

  UPDATE profiles
  SET actor_type = CASE WHEN p_activate THEN 'oem' ELSE 'dealer' END
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success',     true,
    'actor_type',  CASE WHEN p_activate THEN 'oem' ELSE 'dealer' END
  );
END;
$$;
