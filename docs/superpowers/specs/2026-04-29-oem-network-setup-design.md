# OEM Network Setup — Design Spec

**Date:** 2026-04-29
**Status:** Approved
**Scope:** A dedicated `/app/oem-settings` page where OEM users can create their network and manage which dealerships appear on their OEM Dashboard leaderboard. Option A: email-lookup of already-onboarded dealers. Option B (invite flow for unonboarded dealers) is explicitly out of scope and noted as a future extension.

---

## Goal

Give OEM admins a self-service page to (1) define their network name/brand/countries and (2) add/remove the handful of pilot dealerships that appear on their OEM Dashboard leaderboard — without any manual Supabase access.

## Architecture

One new page (`OemSettings.tsx`), one self-contained component (`OemNetworkSettings.tsx`), one new `SECURITY DEFINER` SQL function for cross-org dealer lookup. Zero new tables — uses existing `oem_networks` and `dealer_network_memberships`. Route gated by `requiresActorType="oem"` via `ProtectedRoute`.

## Scalability path

The two-card layout is additive: the dealer table gains columns (Region, Last Assessment, Benchmark flag) as needed. The page gains tabs when content volume justifies it. The email-lookup input coexists with a future invite flow input on the same card. One active network per org for the pilot — the `oem_networks` table already supports multiple networks (OEM Dashboard has a selector) so there is no structural rework when a second brand is added.

---

## Section 1 — Data Layer

### 1.1 New SQL function: `lookup_dealer_by_email`

Required because dealer profiles live in separate orgs — cross-org `dealerships` and `profiles` data is blocked by RLS for the OEM user. A `SECURITY DEFINER` function runs as the function owner and returns only the minimum safe fields needed for the confirmation preview.

```sql
CREATE OR REPLACE FUNCTION public.lookup_dealer_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id  uuid := auth.uid();
  v_user_id    uuid;
  v_profile    record;
  v_dealer     record;
BEGIN
  -- Guard 1: caller must be authenticated with actor_type = 'oem'
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  IF (SELECT actor_type FROM profiles WHERE user_id = v_caller_id) != 'oem' THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  -- Guard 2: caller's org must own an active OEM network
  IF NOT EXISTS (
    SELECT 1 FROM oem_networks
    WHERE owner_org_id = (
      SELECT active_organization_id FROM profiles WHERE user_id = v_caller_id
    )
    AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  -- Resolve user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(p_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_account');
  END IF;

  -- Get their active dealership
  SELECT active_organization_id, active_dealership_id
  INTO v_profile
  FROM profiles
  WHERE user_id = v_user_id;

  IF v_profile.active_dealership_id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_dealership');
  END IF;

  -- Get dealership details (safe minimum: name + location only)
  SELECT id, name, location, organization_id
  INTO v_dealer
  FROM dealerships
  WHERE id = v_profile.active_dealership_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_dealership');
  END IF;

  RETURN jsonb_build_object(
    'found',           true,
    'dealership_id',   v_dealer.id,
    'dealership_name', v_dealer.name,
    'location',        v_dealer.location,
    'organization_id', v_dealer.organization_id
  );
END;
$$;
```

**Security notes:**
- Guard 1 rejects any caller who is not `actor_type = 'oem'` — a dealer or coach calling this function gets `{ error: 'unauthorized' }` and sees nothing.
- Guard 2 rejects OEM users whose org has no active network — prevents enumeration by accounts where `actor_type` was set but no network was created.
- Returns only `name`, `location`, and IDs — no emails, no financial data, no assessment content.
- This is the only intentional RLS bypass in the codebase. All other tables are RLS-enforced.

Returns one of:
- `{ found: true, dealership_id, dealership_name, location, organization_id }` — dealer found
- `{ found: false, reason: 'no_account' }` — email not in auth.users
- `{ found: false, reason: 'no_dealership' }` — user exists but hasn't completed onboarding
- `{ error: 'unauthorized' }` — caller is not a verified OEM user with an active network

### 1.2 `oem_networks` — no schema changes

Used as-is. The page reads with:
```sql
SELECT * FROM oem_networks WHERE owner_org_id = :org_id AND status = 'active' LIMIT 1
```
Creates with INSERT, updates with UPDATE. Only one active network per org during the pilot — a second save always updates the existing row.

### 1.3 `dealer_network_memberships` — no schema changes

**Add dealer:**
```sql
INSERT INTO dealer_network_memberships
  (network_id, dealership_id, organization_id, programme_tier, is_active, enrolled_at)
VALUES
  (:network_id, :dealership_id, :organization_id, :programme_tier, true, now())
ON CONFLICT (network_id, organization_id, dealership_id) DO UPDATE SET is_active = true, programme_tier = EXCLUDED.programme_tier
```

**Remove dealer** (soft delete — preserves history):
```sql
UPDATE dealer_network_memberships SET is_active = false WHERE id = :membership_id
```

**Load roster:**
```sql
SELECT dnm.id, dnm.dealership_id, dnm.programme_tier, dnm.enrolled_at,
       d.name AS dealership_name, d.location
FROM dealer_network_memberships dnm
JOIN dealerships d ON d.id = dnm.dealership_id
WHERE dnm.network_id = :network_id AND dnm.is_active = true
ORDER BY d.name
```

Note: this join to `dealerships` crosses org boundaries. The RLS policy on `dealer_network_memberships` allows org members of the owning org to SELECT — but the JOIN to `dealerships` may be blocked. If it is, load dealership names in a second query using the list of `dealership_id` values returned from the first.

### 1.4 Permission model

All operations require the caller to be `owner` or `admin` of the OEM org. Enforced by existing RLS on `oem_networks` (write requires `owner`/`admin` membership) and `dealer_network_memberships` (same). The `lookup_dealer_by_email` function is SECURITY DEFINER but returns no sensitive fields — only name, location, and IDs.

---

## Section 2 — UI Components and Layout

### 2.1 Route and sidebar

**`App.tsx`:** Add route at `oem-settings`:
```tsx
<Route path="oem-settings" element={
  <ProtectedRoute requiresActorType="oem">
    <OemSettings />
  </ProtectedRoute>
} />
```

**`AppSidebar.tsx`:** Add "Network Settings" nav item for OEM users, directly below "OEM Dashboard":
```ts
...(actorType === 'oem' ? [
  { path: '/app/oem-dashboard',  label: 'OEM Dashboard',    icon: Globe },
  { path: '/app/oem-settings',   label: 'Network Settings', icon: Settings },
] : []),
```

`Settings` icon is already available from `lucide-react`.

### 2.2 `src/pages/OemSettings.tsx`

Thin wrapper — just layout and heading:
```tsx
import { OemNetworkSettings } from '@/components/OemNetworkSettings';

export default function OemSettings() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Network Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your OEM network and manage enrolled dealerships.
        </p>
      </div>
      <OemNetworkSettings />
    </div>
  );
}
```

### 2.3 `src/components/OemNetworkSettings.tsx`

Self-contained component — owns all state and Supabase queries. Two Card sections:

**Card 1 — Network Details**

Fields:
- `name` — text input, e.g. "Audi Germany Pilot Network"
- `oem_brand` — text input, e.g. "Audi"
- `country_scope` — comma-separated text input (stored as `string[]`), e.g. "Germany, Austria, Switzerland"

Behaviour:
- On mount: query `oem_networks` for this org. If found, pre-fill fields and show "Save changes" button. If not found, show "Create network" button.
- On save: upsert. Show success toast "Network saved." on completion.

**Card 2 — Dealer Roster**

*Add dealer row (top of card):*
- Email input + "Look up" button
- Loading state while RPC runs
- On `found: true`: shows confirmation chip — `✓ {dealership_name} · {location}` — with a Programme Tier select (options: Standard, Silver, Gold, Platinum) defaulting to Standard, and an "Add to network" confirm button
- On `found: false, reason: 'no_account'`: inline message "No account found for this email. Ask the dealer to sign up first."
- On `found: false, reason: 'no_dealership'`: inline message "This user hasn't completed dealership setup yet."
- On already in network: "Already enrolled in this network." — Add button disabled

*Dealer table (below add row):*

| Dealer | Location | Programme Tier | Enrolled | |
|--------|----------|----------------|----------|--|
| Audi München | München | Gold | 29 Apr 2026 | Remove |

- Programme Tier is an inline Select per row — change triggers immediate UPDATE on `dealer_network_memberships`
- Remove button triggers soft-delete + removes row from table with optimistic UI
- Empty state: "No dealers added yet. Use the email lookup above to add your first dealer."

### 2.4 Programme Tier options

Fixed set for MVP — stored as plain strings in `programme_tier`:
- `Standard`
- `Silver`
- `Gold`
- `Platinum`

No enum in DB — free text column already exists. This allows the OEM client to request custom tier names in future without a migration.

---

## Section 3 — Error Handling and Edge Cases

### 3.1 Dealer lookup errors

| Result | UI message |
|--------|-----------|
| `no_account` | "No account found for this email. Ask the dealer to sign up first." |
| `no_dealership` | "This user hasn't completed dealership setup yet." |
| Already enrolled (`is_active = true`, matching `network_id + organization_id + dealership_id`) | "Already enrolled in this network." — Add button disabled |
| Previously removed (`is_active = false`, same triple) | Re-activates the existing row (ON CONFLICT on the three-column constraint) — treated as a fresh add |
| RPC error / network failure | Toast: "Lookup failed. Please try again." |

### 3.2 Network save errors

- RLS rejection (non-admin user somehow reaches the page) — blocked at route level by `ProtectedRoute`; if reached anyway, Supabase returns 403 → toast "Permission denied."
- Duplicate network insert — prevented by ON CONFLICT — page always upserts, never double-inserts

### 3.3 Dealer removal

- Soft delete only (`is_active = false`) — dealer disappears from OEM Dashboard leaderboard immediately (existing leaderboard query filters `is_active = true`)
- Removal is reversible: re-adding the same email re-activates the row

### 3.4 `dealerships` JOIN cross-org issue

If the JOIN in the roster query is blocked by RLS, fall back to two queries:
1. `SELECT dealership_id, programme_tier, enrolled_at FROM dealer_network_memberships WHERE network_id = :id AND is_active = true`
2. `SELECT id, name, location FROM dealerships WHERE id = ANY(:ids)` — this second query may also be blocked

If blocked, use the `lookup_dealer_by_email` function pattern: add a second SECURITY DEFINER function `get_dealership_details(p_ids uuid[])` that returns `{ id, name, location }[]` for a list of dealership IDs. Only build this if the direct query is confirmed blocked during implementation.

---

## Section 4 — Testing

### 4.1 Vitest unit test — `OemNetworkSettings` lookup display

One test file: `src/__tests__/oemNetworkSettings.test.tsx`

Two tests:
1. When lookup returns `{ found: true, dealership_name: 'Audi München', location: 'München' }` — renders confirmation chip with name and location, "Add to network" button visible
2. When lookup returns `{ found: false, reason: 'no_account' }` — renders "No account found" message, no Add button

### 4.2 Manual verification checklist (post-deploy)

- [ ] Navigate to `/app/oem-settings` as an OEM user → page loads
- [ ] Navigate to `/app/oem-settings` as a dealer user → redirected to `/app/dashboard`
- [ ] Create network → verify row in Supabase `oem_networks`
- [ ] Look up known dealer email → confirmation chip shows correct name + location
- [ ] Add dealer → appears in roster table + appears on OEM Dashboard leaderboard
- [ ] Change programme tier → updates inline, persists on refresh
- [ ] Remove dealer → disappears from roster + disappears from OEM Dashboard leaderboard
- [ ] Re-add same dealer → re-activates, appears again on leaderboard

---

## Out of scope (future)

- **Option B — invite flow** for unonboarded dealers: add `invite_type='network'` + `network_id` to `dealership_invites`, update accept flow to create `dealer_network_memberships`
- **Region management**: assign dealers to sub-regions within the network; requires `network_regions` UI
- **Multiple networks per org**: already supported by DB, OEM Dashboard selector is already built; just needs the settings page to support switching between networks
- **Benchmark threshold configuration**: per-network KPI targets stored in `oem_networks.settings` JSON
- **OEM user provisioning UI**: currently manual SQL (`UPDATE profiles SET actor_type='oem'`); future Account settings toggle or dedicated invite flow
