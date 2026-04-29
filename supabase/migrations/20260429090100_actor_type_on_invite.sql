CREATE OR REPLACE FUNCTION public.accept_dealership_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite   dealership_invites%ROWTYPE;
  v_user_id  uuid := auth.uid();
  v_email    text;
  v_deal_org uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_invite
  FROM dealership_invites
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_not_found');
  END IF;

  IF v_invite.status = 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_accepted');
  END IF;
  IF v_invite.status IN ('revoked', 'expired') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;
  IF v_invite.expires_at <= now() THEN
    UPDATE dealership_invites SET status = 'expired' WHERE id = v_invite.id;
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email != v_invite.invited_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT organization_id INTO v_deal_org
  FROM dealerships WHERE id = v_invite.dealership_id;
  IF v_deal_org IS DISTINCT FROM v_invite.organization_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'data_integrity_error');
  END IF;

  -- Upsert membership (no role elevation if already exists)
  INSERT INTO memberships (user_id, organization_id, role, is_active)
  VALUES (v_user_id, v_invite.organization_id, v_invite.membership_role, true)
  ON CONFLICT (user_id, organization_id) DO NOTHING;

  -- Set active org, dealership, AND actor_type.
  -- Dealership invites always produce dealer-type actors.
  -- Coach and OEM actor_types are provisioned separately by org owners.
  UPDATE profiles
  SET
    active_organization_id = v_invite.organization_id,
    active_dealership_id   = v_invite.dealership_id,
    actor_type             = 'dealer'
  WHERE user_id = v_user_id;

  -- Mark accepted
  UPDATE dealership_invites
  SET
    status      = 'accepted',
    accepted_by = v_user_id,
    accepted_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success',         true,
    'organization_id', v_invite.organization_id,
    'dealership_id',   v_invite.dealership_id,
    'role',            v_invite.membership_role
  );
END;
$$;
