-- Also return coaches actively assigned to the org's dealerships (they are not members),
-- so the Team org chart can show them in its "External" lane.
CREATE OR REPLACE FUNCTION public.get_org_member_profiles(p_org_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, actor_type text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p.user_id, coalesce(nullif(p.display_name,''), nullif(p.full_name,''), p.email)::text, p.actor_type::text
  from profiles p
  where exists (select 1 from memberships me where me.organization_id = p_org_id and me.user_id = auth.uid() and me.is_active)
    and (
      exists (select 1 from memberships m where m.organization_id = p_org_id and m.user_id = p.user_id and m.is_active)
      or exists (select 1 from coach_dealership_assignments a join dealerships d on d.id = a.dealership_id
                 where d.organization_id = p_org_id and a.coach_user_id = p.user_id and a.is_active)
    );
$function$;

REVOKE ALL ON FUNCTION public.get_org_member_profiles(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_org_member_profiles(uuid) TO authenticated;
