# OEM Network Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give OEM admins a `/app/oem-settings` page where they can create their network and add/remove pilot dealers by email lookup.

**Architecture:** Two `SECURITY DEFINER` SQL functions handle cross-org data access (dealer lookup by email; dealership name/location by IDs). A single `OemNetworkSettings` component owns all state and Supabase queries; `OemSettings` is a thin page wrapper. Route is gated by `requiresActorType="oem"`. All other tables and RLS are unchanged.

**Tech Stack:** Supabase MCP (migrations, type generation), React 18, TypeScript, shadcn/ui, Vitest, `@testing-library/react`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create via MCP | `supabase/migrations/20260429110000_oem_lookup_functions.sql` | Two SECURITY DEFINER functions |
| Regenerate | `src/integrations/supabase/types.ts` | Adds RPC function signatures |
| Create | `src/components/OemNetworkSettings.tsx` | Network details + dealer roster — all logic |
| Create | `src/__tests__/oemNetworkSettings.test.tsx` | Lookup display unit tests |
| Create | `src/pages/OemSettings.tsx` | Thin page wrapper |
| Modify | `src/App.tsx` | Add `/app/oem-settings` route |
| Modify | `src/components/AppSidebar.tsx` | Add "Network Settings" nav item for OEM users |

---

## Task 1 — SQL migration: two SECURITY DEFINER functions

**Files:**
- Create via MCP: `supabase/migrations/20260429110000_oem_lookup_functions.sql`

### Background

The OEM admin's org does not own the dealer dealerships — they belong to separate orgs. Supabase RLS therefore blocks the OEM admin from reading `dealerships` rows directly. Two `SECURITY DEFINER` functions provide controlled, guarded cross-org access:

1. **`lookup_dealer_by_email`** — given an email, returns the matching dealership's name, location, and IDs for the confirmation preview. Guards: caller must be `actor_type='oem'` AND their org must own an active network.
2. **`get_dealership_details`** — given an array of dealership UUIDs, returns `{ id, name, location }` for the roster display. Same guards.

- [ ] **Step 1: Apply the migration via Supabase MCP**

Call `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `oem_lookup_functions`
- `query`: the full SQL below

```sql
-- ─────────────────────────────────────────────────────────────────
-- Helper: returns the caller's active_organization_id (OEM org)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.caller_oem_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_organization_id
  FROM profiles
  WHERE user_id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────
-- Guard: returns true only when caller is OEM + has active network
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.caller_is_verified_oem()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT actor_type FROM profiles WHERE user_id = auth.uid()) = 'oem'
    AND EXISTS (
      SELECT 1 FROM oem_networks
      WHERE owner_org_id = private.caller_oem_org_id()
        AND status = 'active'
    )
$$;

-- ─────────────────────────────────────────────────────────────────
-- 1. lookup_dealer_by_email
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.lookup_dealer_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid;
  v_profile  record;
  v_dealer   record;
BEGIN
  IF auth.uid() IS NULL OR NOT private.caller_is_verified_oem() THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_account');
  END IF;

  SELECT active_organization_id, active_dealership_id
  INTO v_profile
  FROM profiles
  WHERE user_id = v_user_id;

  IF v_profile.active_dealership_id IS NULL THEN
    RETURN jsonb_build_object('found', false, 'reason', 'no_dealership');
  END IF;

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

-- ─────────────────────────────────────────────────────────────────
-- 2. get_dealership_details
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dealership_details(p_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT private.caller_is_verified_oem() THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'location', location)
      )
      FROM dealerships
      WHERE id = ANY(p_ids)
    ),
    '[]'::jsonb
  );
END;
$$;
```

- [ ] **Step 2: Confirm migration applied**

Check MCP response for `success: true`. If you see "function already exists", add `DROP FUNCTION IF EXISTS` before each `CREATE OR REPLACE` — though `CREATE OR REPLACE` should handle this automatically.

- [ ] **Step 3: Write local migration file**

Write the exact SQL from Step 1 to `supabase/migrations/20260429110000_oem_lookup_functions.sql`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260429110000_oem_lookup_functions.sql
git commit -m "feat(db): add lookup_dealer_by_email and get_dealership_details SECURITY DEFINER functions"
```

---

## Task 2 — Regenerate TypeScript types

**Files:**
- Regenerate: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Regenerate via Supabase MCP**

Call `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id: "xrypgosuyfdkkqafftae"`. Write the full returned content to `src/integrations/supabase/types.ts`.

- [ ] **Step 2: Verify functions appear**

```bash
grep "lookup_dealer_by_email\|get_dealership_details" src/integrations/supabase/types.ts
```

Expected: at least 2 lines referencing each function name.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate supabase types after oem lookup functions"
```

---

## Task 3 — OemNetworkSettings component (TDD)

**Files:**
- Create: `src/__tests__/oemNetworkSettings.test.tsx`
- Create: `src/components/OemNetworkSettings.tsx`

### Background

This component owns all state and Supabase operations for the OEM settings page. It renders two cards: Network Details (create/edit form) and Dealer Roster (email lookup + table). Tests cover the three lookup result states: found, no_account, no_dealership.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/oemNetworkSettings.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'u1' }, loading: false, signOut: vi.fn(), session: null })),
}));

vi.mock('@/hooks/useMultiTenant', () => ({
  useMultiTenant: vi.fn(() => ({
    currentOrganization: { id: 'org-1', name: 'Audi HQ' },
    userMemberships: [{ organization_id: 'org-1', role: 'owner', is_active: true }],
  })),
}));

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: mockRpc, from: mockFrom },
}));

import { OemNetworkSettings } from '@/components/OemNetworkSettings';

const MOCK_NETWORK = {
  id: 'net-1',
  name: 'Audi Germany Pilot',
  oem_brand: 'Audi',
  country_scope: ['Germany'],
  owner_org_id: 'org-1',
  status: 'active',
  settings: {},
  programme_code: null,
  created_at: '2026-04-29T00:00:00Z',
  updated_at: '2026-04-29T00:00:00Z',
};

function setupFromMock(networkData: typeof MOCK_NETWORK | null = MOCK_NETWORK) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'oem_networks') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: networkData, error: null }),
            }),
          }),
        }),
      };
    }
    if (table === 'dealer_network_memberships') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      };
    }
    return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };
  });
}

describe('OemNetworkSettings — dealer lookup', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockFrom.mockReset();
    setupFromMock();
  });

  it('shows dealer name and location when lookup finds a match', async () => {
    mockRpc.mockResolvedValue({
      data: {
        found: true,
        dealership_id: 'd-1',
        dealership_name: 'Audi München',
        location: 'München',
        organization_id: 'org-dealer-1',
      },
      error: null,
    });

    render(<OemNetworkSettings />);
    await waitFor(() => expect(screen.getByLabelText(/email/i)).toBeInTheDocument(), { timeout: 3000 });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'manager@audimunich.de' } });
    fireEvent.click(screen.getByRole('button', { name: /look up/i }));

    await waitFor(() =>
      expect(screen.getByText('Audi München')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getByText(/münchen/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to network/i })).toBeInTheDocument();
  });

  it('shows no_account message when email is not registered', async () => {
    mockRpc.mockResolvedValue({
      data: { found: false, reason: 'no_account' },
      error: null,
    });

    render(<OemNetworkSettings />);
    await waitFor(() => expect(screen.getByLabelText(/email/i)).toBeInTheDocument(), { timeout: 3000 });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'unknown@nobody.com' } });
    fireEvent.click(screen.getByRole('button', { name: /look up/i }));

    await waitFor(() =>
      expect(screen.getByText(/no account found/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('shows no_dealership message when user has not completed onboarding', async () => {
    mockRpc.mockResolvedValue({
      data: { found: false, reason: 'no_dealership' },
      error: null,
    });

    render(<OemNetworkSettings />);
    await waitFor(() => expect(screen.getByLabelText(/email/i)).toBeInTheDocument(), { timeout: 3000 });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'incomplete@dealer.com' } });
    fireEvent.click(screen.getByRole('button', { name: /look up/i }));

    await waitFor(() =>
      expect(screen.getByText(/hasn't completed/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/__tests__/oemNetworkSettings.test.tsx
```

Expected: FAIL — `OemNetworkSettings` component does not exist yet.

- [ ] **Step 3: Create `src/components/OemNetworkSettings.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Search, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type OemNetwork = Tables<'oem_networks'>;

interface LookupResult {
  found: boolean;
  reason?: 'no_account' | 'no_dealership';
  dealership_id?: string;
  dealership_name?: string;
  location?: string;
  organization_id?: string;
  error?: string;
}

interface DealershipDetail {
  id: string;
  name: string;
  location: string;
}

interface RosterEntry {
  membershipId: string;
  dealershipId: string;
  name: string;
  location: string;
  programmeTier: string;
  enrolledAt: string | null;
}

const PROGRAMME_TIERS = ['Standard', 'Silver', 'Gold', 'Platinum'] as const;

export function OemNetworkSettings() {
  const { currentOrganization, userMemberships } = useMultiTenant();

  // Network form
  const [network, setNetwork] = useState<OemNetwork | null>(null);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkSaving, setNetworkSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCountries, setFormCountries] = useState('');

  // Dealer lookup
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('Standard');
  const [addingDealer, setAddingDealer] = useState(false);

  // Roster
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const canManage = userMemberships.some(
    m => m.organization_id === currentOrganization?.id &&
         ['owner', 'admin'].includes(m.role) &&
         m.is_active
  );

  const loadRoster = useCallback(async (networkId: string) => {
    setRosterLoading(true);
    const { data: memberships } = await supabase
      .from('dealer_network_memberships')
      .select('id, dealership_id, programme_tier, enrolled_at')
      .eq('network_id', networkId)
      .eq('is_active', true)
      .order('enrolled_at', { ascending: false });

    if (!memberships?.length) {
      setRoster([]);
      setRosterLoading(false);
      return;
    }

    const ids = memberships
      .map(m => m.dealership_id)
      .filter((id): id is string => id != null);

    // SECURITY DEFINER function — bypasses cross-org RLS safely
    const { data: detailsRaw } = await supabase.rpc('get_dealership_details', { p_ids: ids });
    const details = (detailsRaw as DealershipDetail[] | null) ?? [];
    const detailMap = new Map(details.map(d => [d.id, d]));

    setRoster(
      memberships.map(m => ({
        membershipId: m.id,
        dealershipId: m.dealership_id ?? '',
        name: detailMap.get(m.dealership_id ?? '')?.name ?? 'Unknown',
        location: detailMap.get(m.dealership_id ?? '')?.location ?? '',
        programmeTier: m.programme_tier ?? 'Standard',
        enrolledAt: m.enrolled_at,
      }))
    );
    setRosterLoading(false);
  }, []);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    const load = async () => {
      setNetworkLoading(true);
      const { data } = await supabase
        .from('oem_networks')
        .select('*')
        .eq('owner_org_id', currentOrganization.id)
        .eq('status', 'active')
        .maybeSingle();
      if (data) {
        setNetwork(data);
        setFormName(data.name);
        setFormBrand(data.oem_brand);
        setFormCountries((data.country_scope ?? []).join(', '));
        loadRoster(data.id);
      }
      setNetworkLoading(false);
    };
    load();
  }, [currentOrganization?.id, loadRoster]);

  const handleSaveNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id) return;
    setNetworkSaving(true);
    const countryArray = formCountries
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (network) {
      await supabase
        .from('oem_networks')
        .update({ name: formName, oem_brand: formBrand, country_scope: countryArray })
        .eq('id', network.id);
      setNetwork(prev => prev ? { ...prev, name: formName, oem_brand: formBrand, country_scope: countryArray } : prev);
    } else {
      const { data } = await supabase
        .from('oem_networks')
        .insert({
          name: formName,
          oem_brand: formBrand,
          country_scope: countryArray,
          owner_org_id: currentOrganization.id,
          status: 'active',
        })
        .select()
        .single();
      if (data) {
        setNetwork(data);
        loadRoster(data.id);
      }
    }
    toast.success('Network saved.');
    setNetworkSaving(false);
  };

  const handleLookup = async () => {
    if (!lookupEmail.trim() || !network) return;
    setLookupLoading(true);
    setLookupResult(null);
    const { data } = await supabase.rpc('lookup_dealer_by_email', {
      p_email: lookupEmail.trim().toLowerCase(),
    });
    setLookupResult(data as LookupResult);
    setLookupLoading(false);
  };

  const handleAddDealer = async () => {
    if (!lookupResult?.found || !network) return;
    const alreadyEnrolled = roster.some(r => r.dealershipId === lookupResult.dealership_id);
    if (alreadyEnrolled) {
      toast.error('This dealer is already enrolled in your network.');
      return;
    }
    setAddingDealer(true);
    const { error } = await supabase
      .from('dealer_network_memberships')
      .upsert(
        {
          network_id: network.id,
          dealership_id: lookupResult.dealership_id!,
          organization_id: lookupResult.organization_id!,
          programme_tier: selectedTier,
          is_active: true,
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: 'network_id,organization_id,dealership_id' }
      );
    if (error) {
      toast.error('Failed to add dealer. Please try again.');
    } else {
      toast.success(`${lookupResult.dealership_name} added to your network.`);
      setLookupEmail('');
      setLookupResult(null);
      setSelectedTier('Standard');
      loadRoster(network.id);
    }
    setAddingDealer(false);
  };

  const handleTierChange = async (membershipId: string, tier: string) => {
    await supabase
      .from('dealer_network_memberships')
      .update({ programme_tier: tier })
      .eq('id', membershipId);
    setRoster(prev =>
      prev.map(r => r.membershipId === membershipId ? { ...r, programmeTier: tier } : r)
    );
  };

  const handleRemove = async (membershipId: string, dealerName: string) => {
    await supabase
      .from('dealer_network_memberships')
      .update({ is_active: false })
      .eq('id', membershipId);
    setRoster(prev => prev.filter(r => r.membershipId !== membershipId));
    toast.success(`${dealerName} removed from network.`);
  };

  if (!canManage) return null;
  if (networkLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Card 1: Network Details ── */}
      <Card className="shadow-card rounded-xl">
        <CardHeader>
          <CardTitle>{network ? 'Edit network details' : 'Create your network'}</CardTitle>
          <CardDescription>
            Define the name and brand for your OEM network. These appear on the OEM Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveNetwork} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="net-name">Network name</Label>
              <Input
                id="net-name"
                placeholder="e.g. Audi Germany Pilot Network"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="net-brand">OEM brand</Label>
              <Input
                id="net-brand"
                placeholder="e.g. Audi"
                value={formBrand}
                onChange={e => setFormBrand(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="net-countries">Country scope</Label>
              <Input
                id="net-countries"
                placeholder="e.g. Germany, Austria, Switzerland"
                value={formCountries}
                onChange={e => setFormCountries(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of countries</p>
            </div>
            <Button type="submit" disabled={networkSaving || !formName || !formBrand}>
              {networkSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {network ? 'Save changes' : 'Create network'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Card 2: Dealer Roster ── */}
      {network && (
        <Card className="shadow-card rounded-xl">
          <CardHeader>
            <CardTitle>Dealer roster</CardTitle>
            <CardDescription>
              Look up a dealer by email to add them to your network. They must already have an account and completed dealership setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lookup row */}
            <div className="space-y-3">
              <div className="flex gap-2 max-w-md">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="lookup-email">Dealer contact email</Label>
                  <Input
                    id="lookup-email"
                    type="email"
                    placeholder="manager@dealership.com"
                    value={lookupEmail}
                    onChange={e => { setLookupEmail(e.target.value); setLookupResult(null); }}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLookup}
                    disabled={lookupLoading || !lookupEmail.trim()}
                  >
                    {lookupLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Search className="h-4 w-4" />}
                    <span className="ml-1.5">Look up</span>
                  </Button>
                </div>
              </div>

              {/* Lookup result */}
              {lookupResult && (
                <div className="max-w-md">
                  {lookupResult.error === 'unauthorized' && (
                    <p className="text-sm text-destructive">Permission denied. Ensure your network is active.</p>
                  )}
                  {!lookupResult.error && !lookupResult.found && lookupResult.reason === 'no_account' && (
                    <p className="text-sm text-muted-foreground">
                      No account found for this email. Ask the dealer to sign up first.
                    </p>
                  )}
                  {!lookupResult.error && !lookupResult.found && lookupResult.reason === 'no_dealership' && (
                    <p className="text-sm text-muted-foreground">
                      This user hasn't completed dealership setup yet.
                    </p>
                  )}
                  {lookupResult.found && (
                    <div className="flex items-start justify-between gap-3 rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{lookupResult.dealership_name}</p>
                          <p className="text-xs text-muted-foreground">{lookupResult.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select value={selectedTier} onValueChange={setSelectedTier}>
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROGRAMME_TIERS.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={handleAddDealer}
                          disabled={addingDealer || roster.some(r => r.dealershipId === lookupResult.dealership_id)}
                        >
                          {addingDealer && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                          {roster.some(r => r.dealershipId === lookupResult.dealership_id)
                            ? 'Already enrolled'
                            : 'Add to network'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Roster table */}
            {rosterLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : roster.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No dealers added yet. Use the email lookup above to add your first dealer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Programme Tier</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map(entry => (
                    <TableRow key={entry.membershipId}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.location}</TableCell>
                      <TableCell>
                        <Select
                          value={entry.programmeTier}
                          onValueChange={tier => handleTierChange(entry.membershipId, tier)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROGRAMME_TIERS.map(t => (
                              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.enrolledAt
                          ? format(new Date(entry.enrolledAt), 'dd MMM yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemove(entry.membershipId, entry.name)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests — confirm all 3 pass**

```bash
npx vitest run src/__tests__/oemNetworkSettings.test.tsx
```

Expected: 3/3 pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass, zero regressions.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/OemNetworkSettings.tsx src/__tests__/oemNetworkSettings.test.tsx
git commit -m "feat(ui): add OemNetworkSettings component with network form and dealer roster"
```

---

## Task 4 — OemSettings page + route + sidebar nav

**Files:**
- Create: `src/pages/OemSettings.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/AppSidebar.tsx`

### Background

`OemSettings.tsx` is a thin wrapper. The route is gated by `requiresActorType="oem"`. The sidebar gains a "Network Settings" item visible only to OEM users, placed directly below "OEM Dashboard". `Settings` icon is imported from `lucide-react` — it is already available in the project.

- [ ] **Step 1: Create `src/pages/OemSettings.tsx`**

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

- [ ] **Step 2: Add route in `src/App.tsx`**

Add the import after the existing OEM imports (around line 21):

```tsx
import OemSettings from "./pages/OemSettings";
```

Then add the route inside the `/app/*` authenticated routes block, after the `coach-actions` route:

```tsx
<Route path="oem-settings" element={
  <ProtectedRoute requiresActorType="oem">
    <OemSettings />
  </ProtectedRoute>
} />
```

- [ ] **Step 3: Add sidebar nav item in `src/components/AppSidebar.tsx`**

First, add `Settings` to the lucide-react import (line 8):

```tsx
import {
  BarChart3, Building2, Plus, ClipboardList, CheckSquare,
  BookOpen, FileText, LogOut, Database, Globe, Users, Settings,
} from 'lucide-react';
```

Then update the OEM nav items (around line 98) from:

```ts
...(actorType === 'oem' ? [{ path: '/app/oem-dashboard', label: 'OEM Dashboard', icon: Globe }] : []),
```

to:

```ts
...(actorType === 'oem' ? [
  { path: '/app/oem-dashboard', label: 'OEM Dashboard',    icon: Globe },
  { path: '/app/oem-settings',  label: 'Network Settings', icon: Settings },
] : []),
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit and push**

```bash
git add src/pages/OemSettings.tsx src/App.tsx src/components/AppSidebar.tsx
git commit -m "feat(routing): add /app/oem-settings page, route, and sidebar nav"
git push origin main
```

---

## Post-implementation manual verification checklist

- [ ] Log in as an OEM user (`actor_type='oem'`). Sidebar shows "Network Settings" below "OEM Dashboard".
- [ ] Navigate to `/app/oem-settings` as a dealer user → redirected to `/app/dashboard` immediately.
- [ ] Navigate to `/app/oem-settings` as OEM user → page loads with "Create your network" form.
- [ ] Fill in name + brand + countries → click "Create network" → row appears in Supabase `oem_networks`.
- [ ] Enter a valid dealer email → click "Look up" → confirmation chip shows dealer name and location.
- [ ] Enter unknown email → "No account found" message appears.
- [ ] Click "Add to network" → dealer appears in roster table below.
- [ ] Change programme tier inline → persists on page refresh.
- [ ] Click "Remove" → dealer disappears from roster + disappears from OEM Dashboard leaderboard.
- [ ] Re-add same dealer email → re-activates, appears again in roster and leaderboard.

---

## Out of scope

- Multiple networks per org (DB supports it; OEM Dashboard selector already built; settings page manages one network for the pilot)
- Region management (`network_regions` table exists; add as a future tab)
- Option B invite flow for unonboarded dealers (future — add `invite_type='network'` to `dealership_invites`)
- OEM user provisioning UI (still manual SQL: `UPDATE profiles SET actor_type='oem' WHERE user_id='<uuid>'`)
