

# Remediation Plan: Complete the Invite System

## What's Done
All foundational pieces are in place: DB schema, RPC, edge function code, AcceptInvite page, Onboarding rewrite, role gating. The architecture is sound.

## What's Missing (2 items)

### 1. Deploy the `send-invite` edge function
The code exists but hasn't been deployed to Supabase. Without this, `supabase.functions.invoke('send-invite')` returns a 404.

**Action:** Deploy via `supabase--deploy_edge_functions`.

### 2. Add `InviteTeamMembers` to the Account page
The component is built but never rendered. Need to:
- Import `InviteTeamMembers` in `src/pages/Account.tsx`
- Add a "Team" tab (or embed in an existing tab like "Organization") that renders `<InviteTeamMembers />`
- Only visible to users with owner/admin/manager membership role (the component already self-gates via `canInvite` check)

**Files changed:** `src/pages/Account.tsx` only.

### 3. Verify end-to-end
After deploying, test the edge function to confirm it responds correctly.

## No other gaps
Everything else (Onboarding split screen, AcceptInvite page, RoleContext gating, HomeHeader org switcher restriction) is already correctly implemented and wired up.

