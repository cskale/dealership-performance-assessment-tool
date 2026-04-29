-- Migration: coach_invite_accept_on_conflict
-- Replaces WHERE NOT EXISTS guard (not race-safe) with ON CONFLICT DO NOTHING
-- for the coach_dealership_assignments insert in accept_dealership_invite.
-- Also fixes email comparison to normalise both sides with lower().

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
  IF v_email != lower(v_invite.invited_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT organization_id INTO v_deal_org
  FROM dealerships WHERE id = v_invite.dealership_id;
  IF v_deal_org IS DISTINCT FROM v_invite.organization_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'data_integrity_error');
  END IF;

  IF v_invite.invite_type = 'coach' THEN
    INSERT INTO coach_dealership_assignments (coach_user_id, dealership_id, is_active)
    VALUES (v_user_id, v_invite.dealership_id, true)
    ON CONFLICT (coach_user_id, dealership_id) DO NOTHING;

    UPDATE profiles
    SET actor_type = 'coach'
    WHERE user_id = v_user_id
      AND (actor_type IS NULL OR actor_type != 'coach');

  ELSE
    INSERT INTO memberships (user_id, organization_id, role, is_active)
    VALUES (v_user_id, v_invite.organization_id, v_invite.membership_role, true)
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    UPDATE profiles
    SET
      active_organization_id = v_invite.organization_id,
      active_dealership_id   = v_invite.dealership_id,
      actor_type             = 'dealer'
    WHERE user_id = v_user_id;
  END IF;

  UPDATE dealership_invites
  SET
    status      = 'accepted',
    accepted_by = v_user_id,
    accepted_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success',         true,
    'invite_type',     v_invite.invite_type,
    'organization_id', v_invite.organization_id,
    'dealership_id',   v_invite.dealership_id,
    'role',            v_invite.membership_role
  );
END;
$$;
