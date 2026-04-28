# OEM & Coach Dashboard Security Wiring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the already-built OEM and Coach dashboards to production-safe access control by adding RLS policies to the three unprotected network tables, hardening route guards, and ensuring `actor_type` is stamped on every invite acceptance.

**Architecture:** Four isolated commits: (1) a Supabase SQL migration enabling RLS on `oem_networks`, `dealer_network_memberships`, and `coach_dealership_assignments`; (2) a second migration updating `accept_dealership_invite` to stamp `actor_type = 'dealer'`; (3) `ProtectedRoute.tsx` gains a `requiresActorType` prop for defence-in-depth; (4) `App.tsx` wires that prop to the two dashboard routes.

**Tech Stack:** Supabase MCP (`apply_migration`), React 18, TypeScript, Vitest, `@testing-library/react`

---

## What is already done — do NOT re-implement

- `OemDashboard.tsx` and `CoachDashboard.tsx` — fully built, route-connected, translated.
- `AppSidebar.tsx` — already hides/shows OEM and Coach nav items by `actorType`.
- `LanguageContext.tsx` — all `oem.*` and `coach.*` i18n keys are present in EN and DE.
- `useActiveRole()` hook — reads `actor_type` from `profiles` and returns it.
- Both pages already do a client-side `<Navigate to="/app/dashboard">` when `actorType` is wrong. **Tasks 1–4 add the missing server-side and route-level layers on top of that.**

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create (via MCP) | `supabase/migrations/<ts>_rls_network_tables.sql` | RLS on 3 tables |
| Create (via MCP) | `supabase/migrations/<ts>_actor_type_on_invite.sql` | Stamp actor_type in invite RPC |
| Modify | `src/components/ProtectedRoute.tsx` | Add requiresActorType prop |
| Modify | `src/App.tsx` | Wire requiresActorType to oem/coach routes |
| Create | `src/__tests__/protectedRoute.test.tsx` | Route guard unit tests |

---

## Task 1 — RLS policies for network tables

**Files:**
- Create via MCP: `supabase/migrations/<timestamp>_rls_network_tables.sql`

### Background
`oem_networks`, `dealer_network_memberships`, and `coach_dealership_assignments` have no RLS. Any authenticated user can read/write any row via the PostgREST API. These three tables hold all cross-dealer visibility data.

**Access model:**
- `oem_networks` — readable/writeable by members of the owning org (`owner_org_id`); delete requires `owner` role.
- `dealer_network_memberships` — scoped to members of the network's owning org; insert/update/delete requires `owner`/`admin`.
- `coach_dealership_assignments` — coaches read their own rows; org `owner`/`admin` read all rows for their dealerships and can manage (insert/update/delete).

- [ ] **Step 1: Apply the RLS migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with `project_id = "xrypgosuyfdkkqafftae"` and the SQL below.

```sql
-- ─────────────────────────────────────────────────────────
-- RLS: oem_networks
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.oem_networks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "oem_networks_select"
ON public.oem_networks FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
  )
);

CREATE POLICY "oem_networks_insert"
ON public.oem_networks FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "oem_networks_update"
ON public.oem_networks FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "oem_networks_delete"
ON public.oem_networks FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true
      AND m.role = 'owner'
  )
);

-- ─────────────────────────────────────────────────────────
-- RLS: dealer_network_memberships
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.dealer_network_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dnm_select"
ON public.dealer_network_memberships FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
  )
);

CREATE POLICY "dnm_insert"
ON public.dealer_network_memberships FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "dnm_update"
ON public.dealer_network_memberships FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "dnm_delete"
ON public.dealer_network_memberships FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.oem_networks n
    JOIN public.memberships m ON m.organization_id = n.owner_org_id
    WHERE n.id = dealer_network_memberships.network_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

-- ─────────────────────────────────────────────────────────
-- RLS: coach_dealership_assignments
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.coach_dealership_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cda_select"
ON public.coach_dealership_assignments FOR SELECT TO authenticated
USING (
  coach_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "cda_insert"
ON public.coach_dealership_assignments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "cda_update"
ON public.coach_dealership_assignments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);

CREATE POLICY "cda_delete"
ON public.coach_dealership_assignments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = coach_dealership_assignments.dealership_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  )
);
```

- [ ] **Step 2: Confirm migration applied**

In the Supabase MCP response, confirm `success: true` and no error. If there is an error like "policy already exists," use `DROP POLICY IF EXISTS` prefixes (add `DROP POLICY IF EXISTS "oem_networks_select" ON public.oem_networks;` etc. before each `CREATE POLICY`).

- [ ] **Step 3: Commit the migration file locally**

The MCP applies the migration to the remote DB. Also write the SQL to a local file so it's tracked in git:

```bash
# The timestamp should match what the MCP generated.
# Use current UTC timestamp in YYYYMMDDHHmmss format.
git add supabase/migrations/
git commit -m "feat(rls): add row-level security to oem_networks, dealer_network_memberships, coach_dealership_assignments"
```

---

## Task 2 — Stamp actor_type on invite acceptance

**Files:**
- Create via MCP: `supabase/migrations/<timestamp>_actor_type_on_invite.sql`

### Background
`accept_dealership_invite` updates `profiles.active_organization_id` and `active_dealership_id` but never touches `actor_type`. Every user who accepts a dealership invite should get `actor_type = 'dealer'`. Without this, `useActiveRole()` reads `null` and both dashboards silently redirect away.

Coach and OEM `actor_type` values are set via separate admin tooling (not through this invite flow — coaches and OEM users are provisioned by org owners directly in Supabase or through future admin UI).

- [ ] **Step 1: Apply the migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with the SQL below.

```sql
CREATE OR REPLACE FUNCTION public.accept_dealership_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite   dealership_invites%ROWTYPE;
  v_user_id  uuid := auth.uid();
  v_email    text;
  v_deal_org uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_invite
  FROM dealership_invites
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_not_found');
  END IF;

  IF v_invite.status = 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_accepted');
  END IF;
  IF v_invite.status IN ('revoked', 'expired') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;
  IF v_invite.expires_at <= now() THEN
    UPDATE dealership_invites SET status = 'expired' WHERE id = v_invite.id;
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email != v_invite.invited_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT organization_id INTO v_deal_org
  FROM dealerships WHERE id = v_invite.dealership_id;
  IF v_deal_org IS DISTINCT FROM v_invite.organization_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'data_integrity_error');
  END IF;

  -- Upsert membership (no role elevation if already exists)
  INSERT INTO memberships (user_id, organization_id, role, is_active)
  VALUES (v_user_id, v_invite.organization_id, v_invite.membership_role, true)
  ON CONFLICT (user_id, organization_id) DO NOTHING;

  -- Set active org, dealership, AND actor_type
  -- Dealership invites always create dealer-type actors.
  -- Coach and OEM actor_types are provisioned separately by org owners.
  UPDATE profiles
  SET
    active_organization_id = v_invite.organization_id,
    active_dealership_id   = v_invite.dealership_id,
    actor_type             = 'dealer'
  WHERE user_id = v_user_id;

  -- Mark accepted
  UPDATE dealership_invites
  SET
    status      = 'accepted',
    accepted_by = v_user_id,
    accepted_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success',         true,
    'organization_id', v_invite.organization_id,
    'dealership_id',   v_invite.dealership_id,
    'role',            v_invite.membership_role
  );
END;
$$;
```

- [ ] **Step 2: Confirm migration applied**

Check the MCP response for `success: true`.

- [ ] **Step 3: Commit locally**

```bash
git add supabase/migrations/
git commit -m "feat(auth): stamp actor_type='dealer' on invite acceptance"
```

---

## Task 3 — ProtectedRoute: add requiresActorType guard

**Files:**
- Modify: `src/components/ProtectedRoute.tsx`
- Create: `src/__tests__/protectedRoute.test.tsx`

### Background
`ProtectedRoute` currently only checks auth. The OEM and Coach dashboard pages do a client-side `actorType` check internally, but a wrong-role user still gets the page JS executed and a flash before redirect. Adding the guard at the route level is defence in depth and eliminates that flash.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/protectedRoute.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Hoisted mocks
const { mockGetSession, mockFrom } = vi.hoisted(() => ({
  mockGetSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'u1', email: 'x@x.com' } } } })),
  mockFrom: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: () => mockGetSession(),
    },
    from: mockFrom,
  },
}));

import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function makeFromMock(actorType: string | null) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({
              data: { active_organization_id: 'org-1', actor_type: actorType },
            }),
          }),
        }),
      };
    }
    if (table === 'memberships') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: { role: 'owner' } }),
              }),
            }),
          }),
        }),
      };
    }
    if (table === 'dealerships') {
      return {
        select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }),
      };
    }
    return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };
  });
}

function renderWithRouter(actorType: string | null, requiredType: 'oem' | 'coach') {
  makeFromMock(actorType);
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiresActorType={requiredType}>
                <div data-testid="protected-content">Protected</div>
              </ProtectedRoute>
            }
          />
          <Route path="/app/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ProtectedRoute requiresActorType', () => {
  it('renders children when actorType matches required type', async () => {
    renderWithRouter('oem', 'oem');
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('redirects to /app/dashboard when actorType does not match', async () => {
    renderWithRouter('dealer', 'oem');
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('redirects to /app/dashboard when actorType is null', async () => {
    renderWithRouter(null, 'coach');
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
npx vitest run src/__tests__/protectedRoute.test.tsx
```

Expected: FAIL — `requiresActorType` prop does not exist on `ProtectedRoute`.

- [ ] **Step 3: Update ProtectedRoute.tsx**

Replace the entire file content with:

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useActiveRole, type ActorType } from '@/hooks/useActiveRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
  requiresActorType?: ActorType;
}

export const ProtectedRoute = ({
  children,
  requiresOnboarding = false,
  requiresActorType,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { status: onboardingStatus, isLoading: onboardingLoading } = useOnboarding();
  const { actorType, loading: roleLoading } = useActiveRole();
  const location = useLocation();

  const isOnboardingRoute = location.pathname.includes('/onboarding');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const returnTo = location.pathname + location.search;
    if (returnTo !== '/auth') {
      document.cookie = `returnTo=${encodeURIComponent(returnTo)}; path=/; max-age=300`;
    }
    return <Navigate to="/auth" replace />;
  }

  if (requiresOnboarding && !isOnboardingRoute) {
    if (onboardingLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Checking setup...</p>
          </div>
        </div>
      );
    }
    if (onboardingStatus === 'needs_organization' || onboardingStatus === 'needs_dealership') {
      return <Navigate to="/app/onboarding" replace />;
    }
  }

  // Actor-type guard: wait for role to resolve, then redirect if wrong type
  if (requiresActorType) {
    if (roleLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Checking access...</p>
          </div>
        </div>
      );
    }
    if (actorType !== requiresActorType) {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
```

- [ ] **Step 4: Run the test — confirm it passes**

```bash
npx vitest run src/__tests__/protectedRoute.test.tsx
```

Expected: PASS (all 3 tests).

- [ ] **Step 5: Run full test suite — confirm no regressions**

```bash
npx vitest run
```

Expected: all existing tests still pass.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/ProtectedRoute.tsx src/__tests__/protectedRoute.test.tsx
git commit -m "feat(auth): add requiresActorType guard to ProtectedRoute"
```

---

## Task 4 — Wire requiresActorType to dashboard routes in App.tsx

**Files:**
- Modify: `src/App.tsx`

### Background
With the new `requiresActorType` prop available, replace the bare `<Route>` wrappers for `oem-dashboard` and `coach-dashboard` with guarded ones. This means a dealer user who manually types `/app/oem-dashboard` gets a server-enforced redirect before any dashboard JS runs.

- [ ] **Step 1: Update the two routes in App.tsx**

Find this block in `src/App.tsx` (lines 72–73):

```tsx
<Route path="oem-dashboard" element={<OemDashboard />} />
<Route path="coach-dashboard" element={<CoachDashboard />} />
```

Replace it with:

```tsx
<Route path="oem-dashboard" element={
  <ProtectedRoute requiresActorType="oem">
    <OemDashboard />
  </ProtectedRoute>
} />
<Route path="coach-dashboard" element={
  <ProtectedRoute requiresActorType="coach">
    <CoachDashboard />
  </ProtectedRoute>
} />
```

No other changes to App.tsx.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(routing): gate oem-dashboard and coach-dashboard by actor_type"
```

---

## Post-implementation verification checklist

After all 4 tasks are committed and pushed:

- [ ] Run `npx tsc --noEmit` — zero errors
- [ ] Run `npx vitest run` — all tests pass
- [ ] Run `git log --oneline -6` — confirm 4 new commits present
- [ ] Run `git push origin main`
- [ ] Verify in Supabase dashboard → Table Editor → `oem_networks`: RLS is listed as "Enabled"
- [ ] Verify same for `dealer_network_memberships` and `coach_dealership_assignments`
- [ ] Verify `accept_dealership_invite` function in Supabase → Database → Functions shows updated body with `actor_type = 'dealer'`

---

## Out of scope (future work)

- **Coach/OEM actor_type provisioning UI** — currently set via Supabase admin or direct SQL (`UPDATE profiles SET actor_type = 'oem' WHERE user_id = '...'`). A future invite flow for coaches/OEM users is a separate feature.
- **Edge Functions** for network-wide aggregated queries — client-side queries with RLS are sufficient for current scale.
- **`OemDashboard` internal `<Navigate>` guard** — now redundant but harmless; can be removed in a Lovable polish pass.
- **Coach-specific invite flow** — separate spec required; out of scope here.
