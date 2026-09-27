-- get_visit_detail: add review_actions = actions agreed at the previous (non-cancelled) visit,
-- plus anything already reviewed at this visit. The UI previously reviewed this visit's
-- agreed_action_ids, which are the actions agreed FOR the next visit.
CREATE OR REPLACE FUNCTION public.get_visit_detail(p_visit_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v public.coach_visits%rowtype;
  prev_ids uuid[];
begin
  select * into v from public.coach_visits where id = p_visit_id;
  if v.id is null or not private.can_view_dealership(v.dealership_id) then
    raise exception 'Access denied' using errcode = 'insufficient_privilege';
  end if;

  select pv.agreed_action_ids into prev_ids
  from public.coach_visits pv
  where pv.dealership_id = v.dealership_id
    and pv.id <> v.id
    and pv.status <> 'cancelled'
    and (pv.visit_date, pv.created_at) < (v.visit_date, v.created_at)
  order by pv.visit_date desc, pv.created_at desc
  limit 1;

  return jsonb_build_object(
    'visit', to_jsonb(v),
    'reviews', coalesce((select jsonb_agg(jsonb_build_object(
        'action_id', r.action_id, 'title', ia.action_title, 'department', ia.department,
        'outcome', r.outcome, 'note', r.note, 'current_status', ia.status) order by ia.priority)
      from public.visit_action_reviews r join public.improvement_actions ia on ia.id = r.action_id
      where r.visit_id = v.id), '[]'::jsonb),
    'review_actions', coalesce((select jsonb_agg(jsonb_build_object(
        'id', ia.id, 'title', ia.action_title, 'status', ia.status,
        'responsible_person', ia.responsible_person, 'target_completion_date', ia.target_completion_date)
        order by ia.priority)
      from public.improvement_actions ia
      where ia.id = any(coalesce(prev_ids, '{}'))
         or ia.id in (select r.action_id from public.visit_action_reviews r where r.visit_id = v.id)), '[]'::jsonb),
    'agreed_actions', coalesce((select jsonb_agg(jsonb_build_object(
        'id', ia.id, 'title', ia.action_title, 'status', ia.status,
        'responsible_person', ia.responsible_person, 'target_completion_date', ia.target_completion_date))
      from public.improvement_actions ia where ia.id = any(v.agreed_action_ids)), '[]'::jsonb),
    'notes', coalesce((select jsonb_agg(jsonb_build_object(
        'id', n.id, 'note_text', n.note_text, 'note_type', n.note_type, 'action_id', n.action_id,
        'action_title', ia.action_title, 'created_at', n.created_at) order by n.created_at)
      from public.coach_notes n left join public.improvement_actions ia on ia.id = n.action_id
      where n.visit_id = v.id), '[]'::jsonb)
  );
end $function$;
