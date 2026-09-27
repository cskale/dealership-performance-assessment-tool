-- Names of active members of an org, visible only to other active members of that org.
-- Already applied to production on 2026-09-27; this file records it.
CREATE OR REPLACE FUNCTION public.get_org_member_profiles(p_org_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, actor_type text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p.user_id, coalesce(nullif(p.display_name,''), nullif(p.full_name,''), p.email)::text, p.actor_type::text
  from memberships m join profiles p on p.user_id = m.user_id
  where m.organization_id = p_org_id and m.is_active
    and exists (select 1 from memberships me where me.organization_id = p_org_id and me.user_id = auth.uid() and me.is_active);
$function$;

REVOKE ALL ON FUNCTION public.get_org_member_profiles(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_org_member_profiles(uuid) TO authenticated;
