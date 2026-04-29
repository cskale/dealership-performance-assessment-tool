# Coach Invite Flow — Design Spec

**Date:** 2026-04-29
**Status:** Approved
**Scope:** Dealer org owners can invite external coaches to their dealership via email. Coaches get a dedicated accept flow that creates a `coach_dealership_assignments` row and sets `actor_type = 'coach'`. OEM-admin-initiated invites are explicitly out of scope and noted as a future extension.

---

## Goal

Give org owners (owner/admin role) a way to invite coaches to their dealership through the existing invite infrastructure, without duplicating the token, email, or accept-page logic. Coaches gain read access to their assigned dealerships' assessments via a new RLS policy.

---

## Approach

Reuse the `dealership_invites` table and `send-invite` Edge Function with a single new `invite_type` column. All existing dealer invite behaviour is unchanged. The accept function branches on `invite_type` to produce a coach assignment instead of a membership.

---

## Section 1 — Data Layer

### 1.1 `dealership_invites` — new column

```sql
ALTER TABLE public.dealership_invites
ADD COLUMN invite_type text NOT NULL DEFAULT 'dealer'
  CHECK (invite_type IN ('dealer', 'coach'));
```

- All existing rows default to `'dealer'` — no migration of existing data needed.
- The accept RPC and send-invite function both read this column.

### 1.2 RLS — coaches can read assigned dealership assessments

The current assessments policy `auth.uid() = user_id` blocks coaches from reading any dealer-created assessment. Add an additive SELECT policy:

```sql
CREATE POLICY "Coaches can view assessments for assigned dealerships"
ON public.assessments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_dealership_assignments cda
    WHERE cda.coach_user_id = auth.uid()
      AND cda.dealership_id = assessments.dealership_id
      AND cda.is_active = true
  )
);
```

- Read-only. Coaches cannot insert, update, or delete assessments.
- Scoped to active assignments only (`is_active = true`).

### 1.3 `accept_dealership_invite` SQL function — updated

Replace the existing function with a version that branches on `invite_type`:

**Coach path (`invite_type = 'coach'`):**
1. Run all existing validation (token lookup, expiry, email match, org integrity check) — unchanged.
2. Insert into `coach_dealership_assignments (coach_user_id, dealership_id, is_active)` with `ON CONFLICT DO NOTHING`.
3. Update `profiles` — set `actor_type = 'coach'` only if current value is not already `'coach'` (prevents overwrite when accepting a second dealership's coach invite).
4. Do NOT insert a `memberships` row — coaches are external and do not belong to the org.
5. Mark invite `accepted`.
6. Return `jsonb_build_object('success', true, 'invite_type', 'coach', ...)`.

**Dealer path (`invite_type = 'dealer'`):**
- Identical to current behaviour. Returns `invite_type: 'dealer'` added to the existing response JSON.

### 1.4 Edge cases

| Scenario | Behaviour |
|----------|-----------|
| Coach accepts second dealership invite | New `coach_dealership_assignments` row added; `actor_type` update skipped (already `'coach'`) |
| Duplicate coach invite for same dealership | `ON CONFLICT DO NOTHING` — safe no-op |
| Dealer user accepts a coach invite | `actor_type` overwritten to `'coach'` — intentional, org owner made a deliberate choice |
| Token expired / revoked / already accepted | Existing error handling unchanged |

---

## Section 2 — Backend (send-invite Edge Function)

**File:** `supabase/functions/send-invite/index.ts`

### 2.1 New request body field

```ts
invite_type?: 'dealer' | 'coach'  // defaults to 'dealer' when omitted
```

Validated server-side: any value other than `'coach'` is treated as `'dealer'`. All existing callers (`InviteTeamMembers`) omit this field and are unaffected.

### 2.2 DB insert change

```ts
.insert({
  dealership_id,
  organization_id,
  invited_email: normalizedEmail,
  invited_by: user.id,
  membership_role: inviteRole,   // 'viewer' for coach invites
  invite_type: resolvedInviteType,
})
```

For coach invites, `membership_role` is hardcoded to `'viewer'` (required field, but never used in the coach acceptance path).

### 2.3 Email copy — branches on `invite_type`

| Field | Dealer | Coach |
|-------|--------|-------|
| Subject | `You're invited to join {dealership}` | `You've been invited as a coach for {dealership}` |
| Body | `{inviter} has invited you to join {dealership} as a {role}` | `{inviter} has invited you to coach {dealership} on the Dealer Diagnostic platform` |
| CTA | `Accept Invitation` | `Accept Coach Invitation` |

Invite URL format is unchanged: `/invite/:token`. No new route needed.

### 2.4 Permission check

Unchanged — caller must be `owner` or `admin` of the org. Verified server-side from the `memberships` table.

---

## Section 3 — Frontend

### 3.1 New component: `src/components/InviteCoach.tsx`

Mirrors `InviteTeamMembers.tsx` structure. Key differences:

- Calls `send-invite` with `invite_type: 'coach'`
- No role selector — coaches have no org membership role
- Dealership picker: shown only when the org has multiple dealerships. Single-dealership orgs use `active_dealership_id` automatically
- Pending invites list filters on `invite_type = 'coach'`
- Badge label: "Coach" (not a membership role name)
- Revoke and resend work identically to `InviteTeamMembers`
- Renders `null` if caller's membership role is not `owner` or `admin`

### 3.2 `src/pages/Account.tsx` — add InviteCoach

Render `<InviteCoach />` directly below `<InviteTeamMembers />` in the existing team management section. No new page or route.

### 3.3 `src/pages/AcceptInvite.tsx` — post-accept redirect

Read `invite_type` from the RPC response and redirect accordingly:

```ts
const inviteType = (data as any)?.invite_type;
const destination = inviteType === 'coach' ? '/app/coach-dashboard' : '/app/assessment';
setTimeout(() => navigate(destination, { replace: true }), 1800);
```

Only this one line changes. All loading states, error states, and UI remain identical.

---

## Section 4 — Error Handling & Testing

### 4.1 Error states (all existing, no new states needed)

- `invite_not_found` — invalid token
- `already_accepted` — token already used
- `invite_invalid_or_expired` — revoked or past expiry
- `email_mismatch` — logged-in email ≠ invited email
- `data_integrity_error` — dealership/org mismatch

### 4.2 Vitest unit tests — `AcceptInvite.tsx`

Four tests covering the accept-page redirect logic:

1. `invite_type = 'dealer'` → navigates to `/app/assessment`
2. `invite_type = 'coach'` → navigates to `/app/coach-dashboard`
3. Expired token → renders error state with correct message
4. Already accepted token → renders error state with correct message

### 4.3 Manual verification after deployment

- Query `assessments` as a coach user (via Supabase Studio with a coach JWT) → confirm rows returned for assigned dealerships
- Query same as a dealer user from a different org → confirm no rows returned (RLS isolation)

---

## Out of scope (future)

- **OEM-admin coach invites** — OEM admin provisioning UI does not exist yet. When built, it will call the same `send-invite` function with `invite_type: 'coach'` and select dealerships from across the network.
- **Coach assignment management UI** — no UI yet to view/remove coach assignments from the dealer side. Future Account settings extension.
- **`improvement_actions` RLS for coaches** — `CoachActions.tsx` reads from `actions` table (legacy). Scope of that data access is a separate task.
