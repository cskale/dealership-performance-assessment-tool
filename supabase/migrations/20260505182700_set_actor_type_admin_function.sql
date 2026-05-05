-- Admin-only function to set actor_type on a profile, bypassing the
-- client-side trg_prevent_actor_type_self_edit trigger.
-- Restricted to postgres/service role; not callable by anon or authenticated.
CREATE OR REPLACE FUNCTION private.set_actor_type_admin(
  p_user_id uuid,
  p_actor_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  ALTER TABLE public.profiles DISABLE TRIGGER trg_prevent_actor_type_self_edit;

  UPDATE public.profiles
  SET actor_type = p_actor_type::public.actor_type
  WHERE user_id = p_user_id;

  ALTER TABLE public.profiles ENABLE TRIGGER trg_prevent_actor_type_self_edit;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No profile found for user_id %', p_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION private.set_actor_type_admin(uuid, text) FROM PUBLIC;
