# Coach Sprint 4 Hardening + Sprint 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 known bugs in the coach experience, then add multi-OEM grouping, visit scheduling, notes polish, and a resource panel to the coach dashboard.

**Architecture:** Phase 1 is pure bug-fix (no new components). Phase 2 adds one new table (`coach_visits`), one column (`coach_notes.note_type`), one new component (`VisitSheet`), and extends `CoachDashboard`. All changes are additive — no existing features removed.

**Tech Stack:** React 18, TypeScript, Vite, Supabase (Postgres + RLS), shadcn/ui, Tailwind, Vitest

---

## File Map

| File | Change |
|------|--------|
| `supabase/migrations/20260514000001_audit_log_trigger.sql` | New — DB trigger replacing client-side audit inserts |
| `supabase/migrations/20260514000002_coach_visits_table.sql` | New — coach_visits table + RLS |
| `supabase/migrations/20260514000003_coach_notes_note_type.sql` | New — add note_type column to coach_notes |
| `src/components/AppSidebar.tsx` | Modify — hide Dashboard item for coaches |
| `src/pages/Dashboard.tsx` | Modify — coach redirect + dealer visit banner |
| `src/pages/Results.tsx` | Modify — fix coach assessment access (remove user_id filter when assessmentId present) |
| `src/components/ActionPlan.tsx` | Modify — remove 3 client-side action_audit_log inserts |
| `src/components/ActionSheet.tsx` | Modify — add sr-only DialogTitle |
| `src/components/SmartAssistant.tsx` | Modify — add sr-only DialogTitle |
| `src/components/ExportPDFModal.tsx` | Modify — add sr-only DialogTitle |
| `src/components/OemModeToggle.tsx` | Modify — add sr-only DialogTitle |
| `src/components/coach/CoachNoteSheet.tsx` | Modify — add note_type selector + delete button |
| `src/components/coach/VisitSheet.tsx` | New — visit scheduling sheet |
| `src/pages/CoachDashboard.tsx` | Modify — OEM grouping tabs, visit chip, notes polish, resource panel tab |
| `src/integrations/supabase/types.ts` | Regenerate — after all migrations applied |

---

## Phase 1: Sprint 4 Hardening

---

### Task 1: Replace client-side audit log inserts with DB trigger

**Files:**
- Create: `supabase/migrations/20260514000001_audit_log_trigger.sql`
- Modify: `src/components/ActionPlan.tsx`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260514000001_audit_log_trigger.sql
-- Replace client-side action_audit_log inserts (which return 403) with a
-- SECURITY DEFINER trigger so all writes happen in the DB security context.

CREATE OR REPLACE FUNCTION private.log_improvement_action_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT o.id INTO v_org_id
  FROM public.assessments a
  JOIN public.dealerships d ON d.id = a.dealership_id
  JOIN public.organizations o ON o.id = d.organization_id
  WHERE a.id = COALESCE(NEW.assessment_id, OLD.assessment_id)
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.action_audit_log
      (action_id, organization_id, changed_by, field_name, new_value)
    VALUES
      (NEW.id, v_org_id, auth.uid(), 'created', 'Action created');

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.action_audit_log
        (action_id, organization_id, changed_by, field_name, old_value, new_value)
      VALUES
        (NEW.id, v_org_id, auth.uid(), 'status', OLD.status, NEW.status);
    END IF;
    IF OLD.action_title IS DISTINCT FROM NEW.action_title THEN
      INSERT INTO public.action_audit_log
        (action_id, organization_id, changed_by, field_name, old_value, new_value)
      VALUES
        (NEW.id, v_org_id, auth.uid(), 'action_title', OLD.action_title, NEW.action_title);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_improvement_action_audit ON public.improvement_actions;
CREATE TRIGGER trg_improvement_action_audit
  AFTER INSERT OR UPDATE ON public.improvement_actions
  FOR EACH ROW EXECUTE FUNCTION private.log_improvement_action_change();
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with project_id `xrypgosuyfdkkqafftae`, name `audit_log_trigger`, and the SQL above.

- [ ] **Step 3: Remove client inserts from ActionPlan.tsx**

In `src/components/ActionPlan.tsx`, find and remove these three blocks:

**Block 1** (around line 260–267) — remove the `auditRows` build + insert after AI generation:
```typescript
// DELETE this entire block:
const auditRows = insertedActions.map((a) => ({
  action_id: a.id,
  organization_id: currentOrganization.id,
  changed_by: user.id,
  field_name: 'created',
  new_value: 'Action created by AI generation',
}));
await supabase.from('action_audit_log').insert(auditRows);
```

**Block 2** (around line 317–325) — remove the audit log after manual create:
```typescript
// DELETE this entire block:
if (inserted?.[0] && currentOrganization?.id) {
  await supabase.from('action_audit_log').insert({
    action_id: inserted[0].id,
    organization_id: currentOrganization.id,
    changed_by: user.id,
    field_name: 'created',
    new_value: 'Action created',
  });
}
```

**Block 3** (around line 393–403) — remove the audit rows build + insert on update:
```typescript
// DELETE this entire block (the auditRows array build and the insert):
const auditRows = [];
for (const [field, [oldVal, newVal]] of Object.entries(changes)) {
  auditRows.push({
    action_id: actionId,
    organization_id: currentOrganization.id,
    changed_by: user.id,
    field_name: field,
    old_value: oldVal || null,
    new_value: newVal,
  });
}
if (auditRows.length > 0) {
  await supabase.from('action_audit_log').insert(auditRows);
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```
Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260514000001_audit_log_trigger.sql src/components/ActionPlan.tsx
git commit -m "fix: replace client-side audit log inserts with DB trigger"
```

---

### Task 2: Fix DialogContent missing accessible titles

**Files:**
- Modify: `src/components/ActionSheet.tsx`
- Modify: `src/components/SmartAssistant.tsx`
- Modify: `src/components/ExportPDFModal.tsx`
- Modify: `src/components/OemModeToggle.tsx`

- [ ] **Step 1: Add sr-only title to ActionSheet**

In `src/components/ActionSheet.tsx`, find the `<DialogContent` element. If `<DialogTitle>` is absent or visually hidden, ensure the `<DialogHeader>` contains:

```tsx
<DialogHeader>
  <DialogTitle className="sr-only">Action Details</DialogTitle>
  {/* existing visible header content */}
</DialogHeader>
```

If `<DialogTitle>` already exists with visible text, skip this file.

- [ ] **Step 2: Add sr-only title to SmartAssistant**

In `src/components/SmartAssistant.tsx`, find `<DialogContent` and add inside `<DialogHeader>`:

```tsx
<DialogTitle className="sr-only">Smart Assistant</DialogTitle>
```

- [ ] **Step 3: Add sr-only title to ExportPDFModal**

In `src/components/ExportPDFModal.tsx`, find `<DialogContent` and add inside `<DialogHeader>`:

```tsx
<DialogTitle className="sr-only">Export PDF Report</DialogTitle>
```

- [ ] **Step 4: Add sr-only title to OemModeToggle**

In `src/components/OemModeToggle.tsx`, find `<DialogContent` and add inside `<DialogHeader>`:

```tsx
<DialogTitle className="sr-only">OEM Mode</DialogTitle>
```

- [ ] **Step 5: Verify no accessibility warnings**

```bash
npm run dev
```

Open browser console. Confirm no `Warning: DialogContent requires a DialogTitle` messages appear when opening any of the above dialogs.

- [ ] **Step 6: Commit**

```bash
git add src/components/ActionSheet.tsx src/components/SmartAssistant.tsx src/components/ExportPDFModal.tsx src/components/OemModeToggle.tsx
git commit -m "fix: add sr-only DialogTitle to dialogs missing accessible title"
```

---

### Task 3: Hide Dashboard nav item for coaches

**Files:**
- Modify: `src/components/AppSidebar.tsx:61-70`

- [ ] **Step 1: Modify the Overview section items**

In `src/components/AppSidebar.tsx`, replace lines 61-70:

```typescript
// BEFORE:
{
  label: 'Overview',
  items: [
    { path: '/app/dashboard', label: 'Dashboard', icon: BarChart3 },
    ...(actorType === 'oem' ? [
      { path: '/app/oem-dashboard', label: 'OEM Dashboard',    icon: Globe },
      { path: '/app/oem-settings',  label: 'Network Settings', icon: Settings },
    ] : []),
    ...(actorType === 'coach' ? [
      { path: '/app/coach-dashboard', label: 'Coach Dashboard', icon: Users },
      { path: '/app/coach-actions', label: 'Action Tracker', icon: CheckSquare },
    ] : []),
  ],
},

// AFTER:
{
  label: 'Overview',
  items: [
    ...(actorType !== 'coach' ? [{ path: '/app/dashboard', label: 'Dashboard', icon: BarChart3 }] : []),
    ...(actorType === 'oem' ? [
      { path: '/app/oem-dashboard', label: 'OEM Dashboard',    icon: Globe },
      { path: '/app/oem-settings',  label: 'Network Settings', icon: Settings },
    ] : []),
    ...(actorType === 'coach' ? [
      { path: '/app/coach-dashboard', label: 'Coach Dashboard', icon: Users },
      { path: '/app/coach-actions', label: 'Action Tracker', icon: CheckSquare },
    ] : []),
  ],
},
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "fix: hide dealer Dashboard nav item for coach actor type"
```

---

### Task 4: Add coach redirect in Dashboard + fix Results coach access

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/Results.tsx:68-80`

- [ ] **Step 1: Add coach redirect to Dashboard.tsx**

In `src/pages/Dashboard.tsx`, find where `actorType` is read (it already uses `useActiveRole`). Add a redirect immediately after the loading guard:

```typescript
// Find the existing pattern like:
const { actorType, loading: roleLoading } = useActiveRole();
// ...
if (roleLoading) return <SharedLoadingState />;

// Add immediately after the loading guard:
if (actorType === 'coach') return <Navigate to="/app/coach-dashboard" replace />;
```

Make sure `Navigate` is imported from `react-router-dom` — it likely already is.

- [ ] **Step 2: Fix Results.tsx coach access**

In `src/pages/Results.tsx`, restructure the query at lines 68-80 so `.eq('user_id', user.id)` only applies when there is no specific `routeAssessmentId`:

```typescript
// BEFORE:
let query = supabase
  .from('assessments')
  .select('id, answers, scores, overall_score, completed_at, status')
  .eq('user_id', user.id)
  .eq('status', 'completed');

if (routeAssessmentId) {
  query = query.eq('id', routeAssessmentId);
} else {
  query = query.order('completed_at', { ascending: false }).limit(1);
}

// AFTER:
let query = supabase
  .from('assessments')
  .select('id, answers, scores, overall_score, completed_at, status')
  .eq('status', 'completed');

if (routeAssessmentId) {
  query = query.eq('id', routeAssessmentId);
} else {
  query = query
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(1);
}
```

This lets RLS handle authorization when a coach views a specific assessment by ID (RLS already allows coach access to assigned dealership assessments). Without an ID, filter by `user_id` to show only the user's own history.

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/Results.tsx
git commit -m "fix: redirect coach from dealer dashboard; fix Results access for coach view"
```

---

## Phase 2: Sprint 5 DB Migrations

---

### Task 5: Create coach_visits table

**Files:**
- Create: `supabase/migrations/20260514000002_coach_visits_table.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260514000002_coach_visits_table.sql

CREATE TABLE public.coach_visits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id    uuid REFERENCES auth.users(id) NOT NULL,
  dealership_id    uuid REFERENCES public.dealerships(id) NOT NULL,
  visit_date       date NOT NULL,
  status           text NOT NULL DEFAULT 'proposed'
                     CHECK (status IN ('proposed','confirmed','cancelled','completed')),
  visit_notes      text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.coach_visits ENABLE ROW LEVEL SECURITY;

-- Coach: full CRUD on own rows
CREATE POLICY "coach_visits_coach_all" ON public.coach_visits
  FOR ALL
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

-- Dealer: read visits for their dealership
CREATE POLICY "coach_visits_dealer_select" ON public.coach_visits
  FOR SELECT
  USING (
    dealership_id = (
      SELECT active_dealership_id FROM public.profiles
      WHERE user_id = auth.uid() AND active_dealership_id IS NOT NULL
    )
  );

-- Dealer: confirm or cancel (status update only, no insert/delete)
CREATE POLICY "coach_visits_dealer_update" ON public.coach_visits
  FOR UPDATE
  USING (
    dealership_id = (
      SELECT active_dealership_id FROM public.profiles
      WHERE user_id = auth.uid() AND active_dealership_id IS NOT NULL
    )
  )
  WITH CHECK (status IN ('confirmed', 'cancelled'));

-- OEM: read visits for their network dealers
CREATE POLICY "coach_visits_oem_select" ON public.coach_visits
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dnm.dealership_id
      FROM public.dealer_network_memberships dnm
      JOIN public.oem_networks onet ON onet.id = dnm.network_id
      WHERE onet.owner_org_id = (
        SELECT active_organization_id FROM public.profiles
        WHERE user_id = auth.uid()
      )
      AND dnm.is_active = true
    )
  );

-- Enforce at most one active (proposed/confirmed) visit per coach+dealer pair
CREATE UNIQUE INDEX coach_visits_one_active_per_dealer
  ON public.coach_visits (coach_user_id, dealership_id)
  WHERE status IN ('proposed', 'confirmed');

-- updated_at trigger
CREATE TRIGGER update_coach_visits_updated_at
  BEFORE UPDATE ON public.coach_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with project_id `xrypgosuyfdkkqafftae`, name `coach_visits_table`, and the SQL above.

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/20260514000002_coach_visits_table.sql
git commit -m "feat(db): add coach_visits table with RLS for coach/dealer/oem"
```

---

### Task 6: Add note_type to coach_notes + regenerate types

**Files:**
- Create: `supabase/migrations/20260514000003_coach_notes_note_type.sql`
- Modify: `src/integrations/supabase/types.ts` (regenerate)

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260514000003_coach_notes_note_type.sql

ALTER TABLE public.coach_notes
  ADD COLUMN IF NOT EXISTS note_type text
    CHECK (note_type IN ('observation', 'action', 'follow-up'));
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with project_id `xrypgosuyfdkkqafftae`, name `coach_notes_note_type`, and the SQL above.

- [ ] **Step 3: Regenerate Supabase TypeScript types**

Use `mcp__claude_ai_Supabase__generate_typescript_types` with project_id `xrypgosuyfdkkqafftae`. Write the output to `src/integrations/supabase/types.ts`.

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260514000003_coach_notes_note_type.sql src/integrations/supabase/types.ts
git commit -m "feat(db): add note_type to coach_notes; regenerate supabase types"
```

---

## Phase 3: Sprint 5 Features

---

### Task 7: Multi-OEM grouping in CoachDashboard

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Extend AssignedDealer interface**

In `src/pages/CoachDashboard.tsx`, update the `AssignedDealer` interface:

```typescript
interface AssignedDealer {
  dealershipId: string;
  dealerName: string;
  location: string;
  brand: string;
  latestScore: number | null;
  previousScore: number | null;
  latestDate: string | null;
  latestStatus: string | null;
  latestAssessmentId: string | null;
  openCount: number;
  overdueCount: number;
  networks: { id: string; name: string; brand: string }[]; // NEW
}
```

- [ ] **Step 2: Add network fetch to the data loading effect**

Inside `fetchAssignments`, after fetching `dealerships`, add a network query. Insert this block after `const dealerships = dealershipsRes.data ?? [];`:

```typescript
// Fetch OEM network memberships for these dealerships
const { data: networkMemberships } = await supabase
  .from('dealer_network_memberships')
  .select('dealership_id, oem_networks(id, name, oem_brand)')
  .in('dealership_id', dealershipIds)
  .eq('is_active', true);

// Build dealership → networks lookup
const dealerNetworkMap = new Map<string, { id: string; name: string; brand: string }[]>();
(networkMemberships ?? []).forEach((m: any) => {
  const net = m.oem_networks;
  if (!net) return;
  const existing = dealerNetworkMap.get(m.dealership_id) ?? [];
  dealerNetworkMap.set(m.dealership_id, [
    ...existing,
    { id: net.id, name: net.name, brand: net.oem_brand ?? '' },
  ]);
});
```

Then in the `dealerList` map, add `networks`:

```typescript
const dealerList: AssignedDealer[] = dealerships.map(d => {
  const records = dealerAssessments.get(d.id) ?? [];
  const latest = records[0];
  const previous = records[1];
  return {
    dealershipId: d.id,
    dealerName: d.name,
    location: d.location,
    brand: d.brand,
    latestScore: latest?.overall_score ?? null,
    previousScore: previous?.overall_score ?? null,
    latestDate: latest?.created_at ?? null,
    latestStatus: latest?.status ?? null,
    latestAssessmentId: latest?.id ?? null,
    openCount: openByDealer.get(d.id) ?? 0,
    overdueCount: overdueByDealer.get(d.id) ?? 0,
    networks: dealerNetworkMap.get(d.id) ?? [],  // NEW
  };
});
```

- [ ] **Step 3: Add network tab state + derived networkTabs**

Add state and derived value after existing state declarations:

```typescript
const [activeNetworkId, setActiveNetworkId] = useState<string>('all');

const networkTabs = useMemo(() => {
  const seen = new Map<string, { id: string; name: string; brand: string }>();
  dealers.forEach(d => d.networks.forEach(n => seen.set(n.id, n)));
  return Array.from(seen.values());
}, [dealers]);
```

- [ ] **Step 4: Add network filter to filteredDealers**

Update `filteredDealers` to apply network filter first:

```typescript
const filteredDealers = useMemo(() => {
  let result = [...dealers];
  if (activeNetworkId !== 'all') {
    result = result.filter(d => d.networks.some(n => n.id === activeNetworkId));
  }
  if (statusFilter === 'completed') result = result.filter(d => d.latestStatus === 'completed');
  else if (statusFilter === 'in_progress') result = result.filter(d => d.latestStatus === 'in_progress');
  if (sortBy === 'score') result.sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
  else if (sortBy === 'name') result.sort((a, b) => a.dealerName.localeCompare(b.dealerName));
  else result.sort((a, b) => b.overdueCount - a.overdueCount);
  return result;
}, [dealers, activeNetworkId, sortBy, statusFilter]);
```

- [ ] **Step 5: Render network tab strip above dealer cards**

Add the tab strip JSX directly above the sort/filter controls block (before the `{/* Sort + filter controls */}` comment):

```tsx
{/* Network tabs — only render if coach has dealers in multiple networks */}
{networkTabs.length > 0 && (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => setActiveNetworkId('all')}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        activeNetworkId === 'all'
          ? 'bg-[hsl(var(--brand-500))] text-white border-[hsl(var(--brand-500))]'
          : 'bg-transparent text-muted-foreground border-border hover:border-[hsl(var(--brand-400))]'
      }`}
    >
      All Networks
    </button>
    {networkTabs.map(n => (
      <button
        key={n.id}
        onClick={() => setActiveNetworkId(n.id)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          activeNetworkId === n.id
            ? 'bg-[hsl(var(--brand-500))] text-white border-[hsl(var(--brand-500))]'
            : 'bg-transparent text-muted-foreground border-border hover:border-[hsl(var(--brand-400))]'
        }`}
      >
        {n.name}
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 6: Verify build + manual test**

```bash
npm run build
npm run dev
```

Log in as a coach. Confirm network tabs appear (if dealer has network memberships). Selecting a tab filters dealer cards.

- [ ] **Step 7: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: multi-OEM network grouping tabs in coach dashboard"
```

---

### Task 8: VisitSheet component

**Files:**
- Create: `src/components/coach/VisitSheet.tsx`

- [ ] **Step 1: Create VisitSheet component**

```tsx
// src/components/coach/VisitSheet.tsx
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface CoachVisit {
  id: string;
  visit_date: string;
  status: 'proposed' | 'confirmed' | 'cancelled' | 'completed';
  visit_notes: string | null;
  created_at: string;
}

interface VisitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string | null;
  dealerName: string;
  onVisitSaved: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  proposed:  'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
  confirmed: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  completed: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
};

export function VisitSheet({ open, onOpenChange, dealershipId, dealerName, onVisitSaved }: VisitSheetProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<CoachVisit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeVisit, setActiveVisit] = useState<CoachVisit | null>(null);

  useEffect(() => {
    if (open && dealershipId && user?.id) fetchVisits();
  }, [open, dealershipId, user?.id]);

  const fetchVisits = async () => {
    if (!dealershipId || !user?.id) return;
    const { data } = await supabase
      .from('coach_visits')
      .select('*')
      .eq('coach_user_id', user.id)
      .eq('dealership_id', dealershipId)
      .order('visit_date', { ascending: false });
    const rows = (data ?? []) as CoachVisit[];
    setVisits(rows);
    const active = rows.find(v => v.status === 'proposed' || v.status === 'confirmed') ?? null;
    setActiveVisit(active);
  };

  const handlePropose = async () => {
    if (!selectedDate || !dealershipId || !user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('coach_visits').insert({
        coach_user_id: user.id,
        dealership_id: dealershipId,
        visit_date: format(selectedDate, 'yyyy-MM-dd'),
        visit_notes: notes.trim() || null,
        status: 'proposed',
      });
      if (error) {
        // Unique index violation — active visit already exists
        if (error.code === '23505') {
          toast.error('Cancel the existing proposed visit before scheduling a new one.');
        } else {
          throw error;
        }
        return;
      }
      toast.success('Visit proposed');
      setSelectedDate(undefined);
      setNotes('');
      await fetchVisits();
      onVisitSaved();
    } catch {
      toast.error('Failed to propose visit');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (visitId: string) => {
    const { error } = await supabase
      .from('coach_visits')
      .update({ status: 'cancelled' })
      .eq('id', visitId);
    if (error) { toast.error('Failed to cancel visit'); return; }
    toast.success('Visit cancelled');
    await fetchVisits();
    onVisitSaved();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Visits — {dealerName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Active visit status */}
          {activeVisit && (
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {format(new Date(activeVisit.visit_date), 'dd MMM yyyy')}
                </span>
                <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[activeVisit.status]}`}>
                  {activeVisit.status}
                </Badge>
              </div>
              {activeVisit.visit_notes && (
                <p className="text-xs text-muted-foreground">{activeVisit.visit_notes}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[#dc2626] hover:text-[#dc2626]"
                onClick={() => handleCancel(activeVisit.id)}
              >
                <X className="h-3 w-3 mr-1" />Cancel visit
              </Button>
            </div>
          )}

          {/* Propose new visit — only if no active visit */}
          {!activeVisit && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Propose a visit date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="rounded-md border"
              />
              <Textarea
                placeholder="Optional notes for this visit..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="resize-none text-sm"
                rows={3}
              />
              <Button
                className="w-full"
                disabled={!selectedDate || saving}
                onClick={handlePropose}
              >
                {saving ? 'Proposing…' : 'Propose Visit'}
              </Button>
            </div>
          )}

          {/* Past visits */}
          {visits.filter(v => v.status === 'cancelled' || v.status === 'completed').length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Past visits</p>
              <div className="divide-y divide-border rounded-lg border">
                {visits
                  .filter(v => v.status === 'cancelled' || v.status === 'completed')
                  .map(v => (
                    <div key={v.id} className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm">{format(new Date(v.visit_date), 'dd MMM yyyy')}</span>
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[v.status]}`}>
                        {v.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/VisitSheet.tsx
git commit -m "feat: VisitSheet component for coach visit scheduling"
```

---

### Task 9: Wire VisitSheet into CoachDashboard dealer cards

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Import VisitSheet + CalendarIcon**

Add to imports at top of `CoachDashboard.tsx`:

```typescript
import { VisitSheet } from '@/components/coach/VisitSheet';
import { Calendar } from 'lucide-react'; // add Calendar to existing lucide import
```

- [ ] **Step 2: Add visit sheet state**

Add these state variables alongside existing sheet state:

```typescript
const [visitSheetOpen, setVisitSheetOpen] = useState(false);
const [visitSheetDealer, setVisitSheetDealer] = useState<AssignedDealer | null>(null);
```

- [ ] **Step 3: Add activeVisits fetch**

Add to the data fetch (after `fetchNotes`) a fetch for active visits:

```typescript
const [visitSheetOpen, setVisitSheetOpen] = useState(false);
const [visitSheetDealer, setVisitSheetDealer] = useState<AssignedDealer | null>(null);
const [activeVisitsByDealer, setActiveVisitsByDealer] = useState<Map<string, string>>(new Map());

const fetchActiveVisits = async () => {
  if (!user?.id || !dealershipIds?.length) return;
  const { data } = await supabase
    .from('coach_visits')
    .select('dealership_id, visit_date, status')
    .eq('coach_user_id', user.id)
    .in('status', ['proposed', 'confirmed']);
  const map = new Map<string, string>();
  (data ?? []).forEach((v: any) => {
    map.set(v.dealership_id, `${format(new Date(v.visit_date), 'dd MMM')} · ${v.status}`);
  });
  setActiveVisitsByDealer(map);
};
```

Call `fetchActiveVisits()` inside `fetchAssignments` after `fetchNotes(0)`.

Note: `dealershipIds` must be in scope — hoist it from the inner function or pass it. The simplest approach is to call `fetchActiveVisits` with the local `dealershipIds` array:

```typescript
// After: await fetchNotes(0);
const { data: visitData } = await supabase
  .from('coach_visits')
  .select('dealership_id, visit_date, status')
  .eq('coach_user_id', user!.id)
  .in('dealership_id', dealershipIds)
  .in('status', ['proposed', 'confirmed']);
const visitMap = new Map<string, string>();
(visitData ?? []).forEach((v: any) => {
  visitMap.set(v.dealership_id, `${format(new Date(v.visit_date), 'dd MMM')} · ${v.status}`);
});
setActiveVisitsByDealer(visitMap);
```

- [ ] **Step 4: Add visit chip + calendar button to dealer card bottom row**

In the dealer card's bottom row (`{/* Bottom: note icon + CTA */}`), add a visit chip and calendar button:

```tsx
{/* Bottom: note icon + visit chip + CTA */}
<div className="flex items-center justify-between pt-1 border-t border-border/50">
  <div className="flex items-center gap-1">
    <Button
      variant="ghost"
      size="sm"
      className="relative h-7 w-7 p-0"
      onClick={() => { setNoteSheetDealer(dealer); setNoteSheetOpen(true); }}
      aria-label="Add note"
    >
      <StickyNote className="h-4 w-4 text-muted-foreground" />
      {hasNotes && (
        <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
      )}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="relative h-7 w-7 p-0"
      onClick={() => { setVisitSheetDealer(dealer); setVisitSheetOpen(true); }}
      aria-label="Schedule visit"
    >
      <Calendar className="h-4 w-4 text-muted-foreground" />
      {activeVisitsByDealer.has(dealer.dealershipId) && (
        <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
      )}
    </Button>
    {activeVisitsByDealer.has(dealer.dealershipId) && (
      <span className="text-xs text-[#16a34a] font-medium">
        {activeVisitsByDealer.get(dealer.dealershipId)}
      </span>
    )}
  </div>
  {dealer.latestAssessmentId ? (
    <Button variant="outline" size="sm" className="h-7 text-xs"
      onClick={() => navigate(`/app/results/${dealer.latestAssessmentId}`)}>
      View Results →
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="h-7 text-xs"
      onClick={() => navigate('/app/assessment')}>
      Start Assessment
    </Button>
  )}
</div>
```

- [ ] **Step 5: Render VisitSheet alongside CoachNoteSheet**

Add after the `<CoachNoteSheet ... />` element:

```tsx
<VisitSheet
  open={visitSheetOpen}
  onOpenChange={setVisitSheetOpen}
  dealershipId={visitSheetDealer?.dealershipId ?? null}
  dealerName={visitSheetDealer?.dealerName ?? ''}
  onVisitSaved={async () => {
    // Re-fetch active visits to refresh chips
    const { data } = await supabase
      .from('coach_visits')
      .select('dealership_id, visit_date, status')
      .eq('coach_user_id', user!.id)
      .in('status', ['proposed', 'confirmed']);
    const map = new Map<string, string>();
    (data ?? []).forEach((v: any) => {
      map.set(v.dealership_id, `${format(new Date(v.visit_date), 'dd MMM')} · ${v.status}`);
    });
    setActiveVisitsByDealer(map);
  }}
/>
```

- [ ] **Step 6: Build + manual test**

```bash
npm run build
npm run dev
```

Log in as a coach. Verify: calendar icon appears on each dealer card; clicking it opens `VisitSheet`; proposing a date shows green chip on card; cancelling clears it.

- [ ] **Step 7: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: wire VisitSheet into coach dealer cards with visit date chips"
```

---

### Task 10: Dealer visit confirmation banner

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add visit fetch to Dashboard data load**

In `src/pages/Dashboard.tsx`, after the coach redirect guard, add a visit query in a new `useEffect`:

```typescript
const [upcomingVisit, setUpcomingVisit] = useState<{
  visit_date: string;
  status: 'proposed' | 'confirmed';
  id: string;
} | null>(null);

useEffect(() => {
  if (!user?.id || actorType !== 'dealer') return;
  const fetchVisit = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('active_dealership_id')
      .eq('user_id', user.id)
      .single();
    if (!profile?.active_dealership_id) return;
    const { data } = await supabase
      .from('coach_visits')
      .select('id, visit_date, status')
      .eq('dealership_id', profile.active_dealership_id)
      .in('status', ['proposed', 'confirmed'])
      .order('visit_date', { ascending: true })
      .limit(1)
      .maybeSingle();
    setUpcomingVisit(data ?? null);
  };
  fetchVisit();
}, [user?.id, actorType]);
```

- [ ] **Step 2: Add confirm handler**

```typescript
const handleConfirmVisit = async () => {
  if (!upcomingVisit) return;
  const { error } = await supabase
    .from('coach_visits')
    .update({ status: 'confirmed' })
    .eq('id', upcomingVisit.id);
  if (!error) setUpcomingVisit(prev => prev ? { ...prev, status: 'confirmed' } : null);
};
```

- [ ] **Step 3: Render visit banner**

Add this block near the top of the Dashboard return, below the page header and above the first stats section:

```tsx
{upcomingVisit && (
  <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4 ${
    upcomingVisit.status === 'confirmed'
      ? 'bg-[#16a34a]/5 border-[#16a34a]/20'
      : 'bg-[#2563eb]/5 border-[#2563eb]/20'
  }`}>
    <div className="flex items-center gap-3">
      <CalendarIcon className={`h-4 w-4 shrink-0 ${
        upcomingVisit.status === 'confirmed' ? 'text-[#16a34a]' : 'text-[#2563eb]'
      }`} />
      <div>
        <p className="text-sm font-medium">
          {upcomingVisit.status === 'confirmed' ? 'Confirmed coaching visit' : 'Upcoming coaching visit'}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(upcomingVisit.visit_date), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>
    </div>
    {upcomingVisit.status === 'proposed' && (
      <Button size="sm" className="h-8 text-xs shrink-0" onClick={handleConfirmVisit}>
        Confirm
      </Button>
    )}
    {upcomingVisit.status === 'confirmed' && (
      <Badge variant="outline" className="bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 shrink-0">
        Confirmed ✓
      </Badge>
    )}
  </div>
)}
```

Make sure `CalendarIcon` and `format` are imported — `format` from `date-fns`, `CalendarIcon` from `lucide-react`.

- [ ] **Step 4: Build + manual test**

```bash
npm run build
npm run dev
```

Log in as dealer. If coach has proposed a visit for this dealership, the banner should appear with "Confirm" button. Clicking Confirm changes status and shows green confirmed state.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dealer visit confirmation banner on dealer dashboard"
```

---

### Task 11: Notes polish — note_type selector + delete

**Files:**
- Modify: `src/components/coach/CoachNoteSheet.tsx`

- [ ] **Step 1: Read current CoachNoteSheet to understand existing structure**

Read `src/components/coach/CoachNoteSheet.tsx` fully before editing. Identify:
- The textarea for note text
- The submit/save button
- The notes list rendering

- [ ] **Step 2: Add note_type state + selector**

Add state:
```typescript
const [noteType, setNoteType] = useState<'observation' | 'action' | 'follow-up' | ''>('');
```

Add a type selector above the textarea (use shadcn `Select`):

```tsx
<Select value={noteType} onValueChange={v => setNoteType(v as typeof noteType)}>
  <SelectTrigger className="h-8 text-xs">
    <SelectValue placeholder="Note type (optional)" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="observation">Observation</SelectItem>
    <SelectItem value="action">Action</SelectItem>
    <SelectItem value="follow-up">Follow-up</SelectItem>
  </SelectContent>
</Select>
```

- [ ] **Step 3: Include note_type in insert**

In the insert call, add `note_type`:

```typescript
await supabase.from('coach_notes').insert({
  coach_user_id: user.id,
  dealership_id: dealershipId,
  note_text: noteText.trim(),
  note_type: noteType || null,   // ADD THIS
});
```

Reset after save: `setNoteType('');`

- [ ] **Step 4: Add delete button to note list**

In the notes list, add a delete button per note row:

```tsx
<button
  className="ml-auto text-muted-foreground hover:text-[#dc2626] transition-colors"
  onClick={async () => {
    await supabase.from('coach_notes').delete().eq('id', note.id);
    fetchSheetData(); // or re-fetch notes
  }}
  aria-label="Delete note"
>
  <Trash2 className="h-3.5 w-3.5" />
</button>
```

Import `Trash2` from `lucide-react` if not already imported.

- [ ] **Step 5: Show note_type badge in CoachDashboard notes feed**

In `CoachDashboard.tsx`, in the notes feed map, add a type badge after the dealer badge:

```tsx
{note.note_type && (
  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
    {note.note_type}
  </Badge>
)}
```

The `note` object from `coach_notes` needs `note_type` — update the `CoachNote` interface:

```typescript
interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  note_type: 'observation' | 'action' | 'follow-up' | null;  // ADD
  created_at: string;
}
```

- [ ] **Step 6: Build + manual test**

```bash
npm run build
npm run dev
```

Verify: opening note sheet shows type selector; saved notes show type badge in feed; delete button removes note.

- [ ] **Step 7: Commit**

```bash
git add src/components/coach/CoachNoteSheet.tsx src/pages/CoachDashboard.tsx
git commit -m "feat: notes polish — note_type selector, type badge, delete button"
```

---

### Task 12: Resource reference panel

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Add resource tab to the dashboard**

The CoachDashboard currently has no tab system at the top level. Add a simple tab state for switching between the main dashboard view and resources:

```typescript
const [dashboardView, setDashboardView] = useState<'dashboard' | 'resources'>('dashboard');
```

Add a tab toggle below the page header (above the network tabs):

```tsx
<div className="flex gap-1 border-b border-border pb-0">
  {(['dashboard', 'resources'] as const).map(view => (
    <button
      key={view}
      onClick={() => setDashboardView(view)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
        dashboardView === view
          ? 'border-[hsl(var(--brand-500))] text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {view === 'dashboard' ? 'Overview' : 'Resources'}
    </button>
  ))}
</div>
```

Wrap all existing dashboard content (network tabs through score trend chart) in `{dashboardView === 'dashboard' && (...)}`.

- [ ] **Step 2: Import KPI and action template data**

Add to imports:

```typescript
import { KPI_DEFINITIONS } from '@/lib/kpiDefinitions';
import { ACTION_TEMPLATES } from '@/data/actionTemplates';
```

- [ ] **Step 3: Add resources view JSX**

Below the `{dashboardView === 'dashboard' && (...)}` block:

```tsx
{dashboardView === 'resources' && (
  <div className="space-y-6">
    <ResourceKpiPanel />
    <ResourcePlaybookPanel />
  </div>
)}
```

Define these as inline sub-components at the bottom of the file (before the default export):

```tsx
function ResourceKpiPanel() {
  const [search, setSearch] = useState('');
  const entries = Object.entries(KPI_DEFINITIONS);
  const filtered = search.trim()
    ? entries.filter(([key, val]: [string, any]) =>
        key.toLowerCase().includes(search.toLowerCase()) ||
        (val.label ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (val.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-[hsl(var(--brand-500))]" />
          KPI Reference
        </CardTitle>
        <input
          className="mt-2 h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
          placeholder="Search KPIs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent className="p-0 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground text-center">No KPIs match "{search}"</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.slice(0, 50).map(([key, val]: [string, any]) => (
              <div key={key} className="px-5 py-3 space-y-0.5">
                <p className="text-sm font-medium">{val.label ?? key}</p>
                {val.description && <p className="text-xs text-muted-foreground">{val.description}</p>}
                {(val.benchmark ?? val.benchmarkRange) && (
                  <p className="text-xs text-[hsl(var(--brand-500))]">
                    Benchmark: {val.benchmark ?? val.benchmarkRange}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DEPT_LABELS: Record<string, string> = {
  NVS: 'New Vehicle Sales', UVS: 'Used Vehicle Sales',
  SVC: 'Service', PTS: 'Parts', FIN: 'Financial Operations',
};

function ResourcePlaybookPanel() {
  const [dept, setDept] = useState<string>('all');
  const templates = ACTION_TEMPLATES ?? [];
  const filtered = dept === 'all'
    ? templates
    : templates.filter((t: any) =>
        (t.department ?? t.category ?? '').toUpperCase().includes(dept)
      );

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Action Playbooks
          </CardTitle>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.entries(DEPT_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[480px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground text-center">No templates for this department</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t: any, i: number) => (
              <div key={t.id ?? i} className="px-5 py-3 space-y-1">
                <p className="text-sm font-medium">{t.title ?? t.action_title}</p>
                {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                {t.implementationSteps?.length > 0 && (
                  <ol className="mt-1 space-y-0.5 pl-4 list-decimal">
                    {t.implementationSteps.slice(0, 4).map((step: string, si: number) => (
                      <li key={si} className="text-xs text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

Add `Database` and `BookOpen` to the lucide-react import. Add `useState` import if not already destructured.

- [ ] **Step 4: Build + manual test**

```bash
npm run build
npm run dev
```

Log in as coach. Verify: "Resources" tab appears; clicking it shows KPI Reference (searchable) and Action Playbooks (filterable by dept). "Overview" tab shows normal dashboard.

- [ ] **Step 5: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: resource reference panel in coach dashboard — KPI search + action playbooks"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Sprint 4 Bug 1 (audit_log 403) → Task 1
- ✅ Sprint 4 Bug 2 (ActionSheet PATCH serialisation) → Task 1 addresses audit inserts; ActionSheet PATCH is the same `action_audit_log` insert pattern in ActionPlan, covered by trigger + removal
- ✅ Sprint 4 Bug 3 (DialogContent titles) → Task 2
- ✅ Sprint 4 Bug 4 (Coach sees Dashboard) → Task 3
- ✅ Sprint 4 Bug 5 (View Results broken) → Task 4
- ✅ Sprint 4 Bug 6 (Coach auto-lands dealer dashboard) → Task 4
- ✅ DB: coach_visits table + RLS → Task 5
- ✅ DB: coach_notes.note_type → Task 6
- ✅ Types regenerated → Task 6
- ✅ Multi-OEM grouping → Task 7
- ✅ VisitSheet component → Task 8
- ✅ Visit chip on dealer cards → Task 9
- ✅ Dealer visit banner → Task 10
- ✅ Notes polish (type + delete) → Task 11
- ✅ Resource panel → Task 12

**Security fix** already applied and committed (`20260514000000_fix_profiles_actor_type_escalation.sql`) — not a plan task.
