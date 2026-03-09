
-- Invite table
create table public.dealership_invites (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null,
  membership_role membership_role not null default 'viewer',
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  accepted_by uuid,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  constraint invited_email_lowercase check (invited_email = lower(invited_email))
);

-- Only one pending invite per dealership+email at a time
create unique index if not exists ux_pending_dealership_invite
  on public.dealership_invites (dealership_id, invited_email)
  where status = 'pending';

-- Prevent duplicate dealership names within the same org
create unique index if not exists ux_dealership_org_name_norm
  on public.dealerships (organization_id, lower(trim(name)));

-- RLS policies
alter table public.dealership_invites enable row level security;

-- managers can create invites
create policy "managers_can_insert_invites"
  on public.dealership_invites for insert
  with check (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id = dealership_invites.organization_id
        and m.role in ('owner', 'admin', 'manager')
        and m.is_active = true
    )
  );

-- managers can view invites for their org
create policy "managers_can_view_invites"
  on public.dealership_invites for select
  using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id = dealership_invites.organization_id
        and m.role in ('owner', 'admin', 'manager')
        and m.is_active = true
    )
  );

-- managers can revoke invites (status to 'revoked' only)
create policy "managers_can_revoke_invites"
  on public.dealership_invites for update
  using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id = dealership_invites.organization_id
        and m.role in ('owner', 'admin', 'manager')
        and m.is_active = true
    )
  )
  with check (status = 'revoked');

-- Acceptance RPC (atomic, race-safe)
create or replace function public.accept_dealership_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite   dealership_invites%rowtype;
  v_user_id  uuid := auth.uid();
  v_email    text;
  v_deal_org uuid;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'not_authenticated');
  end if;

  select * into v_invite
  from dealership_invites
  where token = p_token
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'invite_not_found');
  end if;

  if v_invite.status = 'accepted' then
    return jsonb_build_object('success', false, 'error', 'already_accepted');
  end if;
  if v_invite.status in ('revoked', 'expired') then
    return jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  end if;
  if v_invite.expires_at <= now() then
    update dealership_invites set status = 'expired' where id = v_invite.id;
    return jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  end if;

  select lower(email) into v_email from auth.users where id = v_user_id;
  if v_email != v_invite.invited_email then
    return jsonb_build_object('success', false, 'error', 'email_mismatch');
  end if;

  select organization_id into v_deal_org
  from dealerships where id = v_invite.dealership_id;
  if v_deal_org is distinct from v_invite.organization_id then
    return jsonb_build_object('success', false, 'error', 'data_integrity_error');
  end if;

  -- Upsert membership (no role elevation if already exists)
  insert into memberships (user_id, organization_id, role, is_active)
  values (v_user_id, v_invite.organization_id, v_invite.membership_role, true)
  on conflict (user_id, organization_id) do nothing;

  -- Set active org and dealership
  update profiles
  set
    active_organization_id = v_invite.organization_id,
    active_dealership_id   = v_invite.dealership_id
  where user_id = v_user_id;

  -- Mark accepted
  update dealership_invites
  set
    status      = 'accepted',
    accepted_by = v_user_id,
    accepted_at = now()
  where id = v_invite.id;

  return jsonb_build_object(
    'success',         true,
    'organization_id', v_invite.organization_id,
    'dealership_id',   v_invite.dealership_id,
    'role',            v_invite.membership_role
  );
end;
$$;
