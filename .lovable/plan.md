

# Invite Team Members — Implementation Plan

## Summary
Simplify onboarding by removing the organization creation step (DB trigger handles it), add a two-path split screen (Create Dealership / Join via Invite), and build a full invite system with DB table, RPC, edge function, acceptance page, and team management UI.

## Scope — 8 Work Items

### 1. Database Migration
Create `dealership_invites` table + RLS policies + `accept_dealership_invite` RPC + unique index on dealerships for org-scoped name dedup.

**SQL objects:**
- `dealership_invites` table with token, status, email, expiry
- Unique partial index: one pending invite per `(dealership_id, invited_email)`
- Unique index on `dealerships(organization_id, lower(trim(name)))` to prevent duplicate names
- RLS: managers can insert/select/update(revoke only), no delete policy
- `accept_dealership_invite(p_token text)` — SECURITY DEFINER RPC that validates token, checks email match, upserts membership (no role elevation), sets active org+dealership on profile, marks invite accepted

### 2. Rewrite `src/pages/Onboarding.tsx`
- Remove org creation step, progress stepper, `handleCreateOrganization`
- Replace with two-path split screen: "New Dealership" / "Join Existing"
- "Create" path: inline form (name, brand, country, location) with org-scoped duplicate check before insert
- "Join" path: static instructions only — no input field, no search, just text telling user to use their invite link
- If existing dealerships exist in the org, show them as selectable options above the create form

### 3. Update `src/hooks/useOnboarding.tsx`
- At top of `checkOnboardingStatus`: check `localStorage` for `pending_invite_token`, if found redirect to `/invite/:token`
- If `needs_organization` is reached: silently call `createOrganization` as a repair path (DEV-only console.warn), never show org UI
- Keep all existing `createDealership`, `setActiveDealership` logic intact

### 4. New page `src/pages/AcceptInvite.tsx`
- Route: `/invite/:token` (public, outside ProtectedRoute)
- If not logged in: save token to localStorage, redirect to `/auth?returnTo=/invite/:token`
- If logged in: call `supabase.rpc('accept_dealership_invite', { p_token: token })`
- Handle all error states with user-friendly messages (expired, email mismatch, already used, not found)
- On success: clear localStorage token, redirect to `/app/assessment`

### 5. Update `src/App.tsx`
- Add `<Route path="/invite/:token" element={<AcceptInvite />} />` outside ProtectedRoute groups

### 6. Edge Function `supabase/functions/send-invite/index.ts`
- CORS headers, auth validation via service role
- Server-side permission check (caller must be owner/admin/manager in org)
- Resend logic: extend expiry on existing pending invite, return same token
- Insert new invite if none exists
- Always return `{ success: true, invite_url }` — email delivery is best-effort / not implemented yet
- Add `[functions.send-invite] verify_jwt = false` to `supabase/config.toml`

### 7. New component `src/components/InviteTeamMembers.tsx`
- Email input + role selector (from `membership_role` enum: owner/admin/manager/analyst/viewer)
- Calls `send-invite` edge function, displays copyable invite URL on success
- Lists pending invites (queried via RLS), with Revoke button (status update only)
- Resend button re-calls edge function (extends expiry)
- Render only when user's membership role is owner/admin/manager

### 8. Gate test role context + clean up nav
- `src/contexts/RoleContext.tsx`: Wrap `RoleProvider` children rendering so it only provides test role state in DEV mode; in production, provide a no-op context
- `src/components/Navigation/HomeHeader.tsx`: Org switcher for multi-org users is already in the dropdown menu — keep it there but only show for `owner` role (check via useMultiTenant membership)
- `src/components/RoleSelector.tsx`: Gate with `import.meta.env.DEV`

## Files Modified/Created

| File | Action |
|---|---|
| `supabase/migrations/[timestamp]_invite_system.sql` | New — table, RLS, RPC, indexes |
| `supabase/config.toml` | Add send-invite function config |
| `supabase/functions/send-invite/index.ts` | New edge function |
| `src/pages/Onboarding.tsx` | Major rewrite |
| `src/hooks/useOnboarding.tsx` | Add token check + silent org repair |
| `src/pages/AcceptInvite.tsx` | New page |
| `src/components/InviteTeamMembers.tsx` | New component |
| `src/App.tsx` | Add public /invite route |
| `src/contexts/RoleContext.tsx` | Gate behind DEV |
| `src/components/Navigation/HomeHeader.tsx` | Gate org switcher to owner only |

## Key Constraints Respected
- `membership_role` enum values: `owner | admin | manager | analyst | viewer` (from DB)
- No cross-org queries from client
- No invite record deletion — revoke by status only
- Invite URL always returned regardless of email config
- Join-by-invite-only — no search/claim path
- Existing RLS policies untouched

