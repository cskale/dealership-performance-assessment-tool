-- Security advisor: this SECURITY DEFINER helper was callable by signed-out (anon) users.
REVOKE EXECUTE ON FUNCTION public.user_can_access_dealership_as_coach(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_can_access_dealership_as_coach(uuid) TO authenticated;
