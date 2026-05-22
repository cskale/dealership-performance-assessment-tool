# Coach Dashboard UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix sheet positioning (right → center), remove Field Notes, add dealer visit negotiation (decline/counter-propose), coach badge notifications, OEM visit sync, and make the 4 coach buttons (Briefing/Notes/Calendar/History) feed into each other as a coherent hub.

**Architecture:** Three coordinated streams. Stream 1 converts Sheet → Dialog components and removes Field Notes. Stream 2 extends the `coach_visits` table with negotiation columns and adds decline/counter-propose UI on both dealer and coach sides. Stream 3 makes VisitBriefingSheet the read-only hub with links to the other three dialogs. All changes target the coach–dealer interaction layer; no new tables required.

**Tech Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind + shadcn/ui Dialog + date-fns

---

## File Map

**Modified files:**
- `src/components/coach/CoachNoteSheet.tsx` — Sheet → Dialog
- `src/components/coach/VisitSheet.tsx` — Sheet → Dialog + coach counter-proposal response + context chip
- `src/components/coach/VisitLogSheet.tsx` — Sheet → Dialog + latestAssessmentId filter + briefing link
- `src/components/coach/VisitBriefingSheet.tsx` — Sheet → Dialog + hub cross-links + upcoming visit section
- `src/pages/CoachDashboard.tsx` — Remove Field Notes, score size, badge notifications, hub callbacks
- `src/pages/Dashboard.tsx` — Dealer visit banner: Decline + Counter-propose
- `src/pages/OemDashboard.tsx` — Next Visit column in leaderboard
- `src/integrations/supabase/types.ts` — Regenerated after migration

---

## Part A — Database

### Task 1: Migrate coach_visits — negotiation columns

**Files:** Run via Supabase MCP `apply_migration`

- [ ] **Step 1: Apply migration**

Run Supabase MCP tool `mcp__claude_ai_Supabase__apply_migration` with project_id `xrypgosuyfdkkqafftae`:

```sql
ALTER TABLE public.coach_visits
  ADD COLUMN IF NOT EXISTS dealer_proposed_date date,
  ADD COLUMN IF NOT EXISTS declined_by text
    CHECK (declined_by IN ('dealer', 'coach'));

COMMENT ON COLUMN public.coach_visits.dealer_proposed_date IS 'Date proposed by dealer in a counter-proposal';
COMMENT ON COLUMN public.coach_visits.declined_by IS 'Who declined: dealer or coach. status remains cancelled.';
```

Expected: migration applies without error. Existing RLS covers new columns.

- [ ] **Step 2: Regenerate TypeScript types**

Run Supabase MCP tool `mcp__claude_ai_Supabase__generate_typescript_types` with project_id `xrypgosuyfdkkqafftae`. Write output to `src/integrations/supabase/types.ts`.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "feat(db): add dealer_proposed_date + declined_by to coach_visits"
```

---

## Part B — Stream 1: Quick Fixes

### Task 2: Convert CoachNoteSheet — Sheet → Dialog

**Files:**
- Modify: `src/components/coach/CoachNoteSheet.tsx`

- [ ] **Step 1: Read the full file before editing**

Read `src/components/coach/CoachNoteSheet.tsx` to understand its full structure and all Sheet-related imports.

- [ ] **Step 2: Replace Sheet imports with Dialog**

Change the import block. Remove:
```tsx
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
```

Add:
```tsx
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
```

- [ ] **Step 3: Replace Sheet JSX with Dialog**

Find the outermost `<Sheet open={open} onOpenChange={onOpenChange}>` wrapper and replace the entire component wrapper:

```tsx
// Before
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent className="...">
    <SheetHeader>
      <SheetTitle>...</SheetTitle>
    </SheetHeader>
    {/* content */}
  </SheetContent>
</Sheet>

// After
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    {/* content — unchanged */}
  </DialogContent>
</Dialog>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/coach/CoachNoteSheet.tsx
git commit -m "fix(coach): center CoachNoteSheet — Sheet to Dialog"
```

---

### Task 3: Convert VisitSheet — Sheet → Dialog

**Files:**
- Modify: `src/components/coach/VisitSheet.tsx`

- [ ] **Step 1: Read the full file before editing**

Read `src/components/coach/VisitSheet.tsx` in full.

- [ ] **Step 2: Replace Sheet imports with Dialog**

Remove:
```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
```
Add:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

- [ ] **Step 3: Replace Sheet JSX with Dialog**

```tsx
// Before
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
    <SheetHeader>
      <SheetTitle ...>...</SheetTitle>
    </SheetHeader>
    {/* content */}
  </SheetContent>
</Sheet>

// After
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle ...>...</DialogTitle>
    </DialogHeader>
    {/* content — unchanged */}
  </DialogContent>
</Dialog>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/coach/VisitSheet.tsx
git commit -m "fix(coach): center VisitSheet — Sheet to Dialog"
```

---

### Task 4: Convert VisitLogSheet — Sheet → Dialog + action filter

**Files:**
- Modify: `src/components/coach/VisitLogSheet.tsx`

- [ ] **Step 1: Read the full file before editing**

Read `src/components/coach/VisitLogSheet.tsx` in full. Identify: the `VisitLogSheetProps` interface, `fetchOpenActions` function, and the Sheet JSX wrapper.

- [ ] **Step 2: Add latestAssessmentId prop**

Find `VisitLogSheetProps` and add the new optional prop:

```tsx
interface VisitLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: CoachVisit;
  dealershipId: string;
  dealerName: string;
  onLogSaved: () => void;
  latestAssessmentId?: string | null;  // NEW
}
```

Update the function signature to destructure the new prop:
```tsx
export function VisitLogSheet({ open, onOpenChange, visit, dealershipId, dealerName, onLogSaved, latestAssessmentId }: VisitLogSheetProps) {
```

- [ ] **Step 3: Update fetchOpenActions to filter by latestAssessmentId**

Find the `fetchOpenActions` function. Replace the query with:

```ts
const fetchOpenActions = async () => {
  // If we have the latest assessment ID, query directly — avoids loading 300+ actions
  if (latestAssessmentId) {
    const { data } = await supabase
      .from('improvement_actions')
      .select('id, action_title, department, priority, status')
      .eq('assessment_id', latestAssessmentId)
      .in('status', ['Open', 'In Progress'])
      .order('priority');
    setOpenActions((data ?? []) as OpenAction[]);
    return;
  }
  // Fallback: fetch from all dealership assessments (original behaviour)
  const { data: assessments } = await supabase
    .from('assessments')
    .select('id')
    .eq('dealership_id', dealershipId);
  if (!assessments?.length) return;
  const assessmentIds = assessments.map(a => a.id);
  const { data } = await supabase
    .from('improvement_actions')
    .select('id, action_title, department, priority, status')
    .in('assessment_id', assessmentIds)
    .in('status', ['Open', 'In Progress'])
    .order('priority');
  setOpenActions((data ?? []) as OpenAction[]);
};
```

- [ ] **Step 4: Replace Sheet JSX with Dialog**

Remove Sheet imports, add Dialog imports (same pattern as Tasks 2–3). Replace wrapper:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle ...>...</DialogTitle>
    </DialogHeader>
    {/* content — unchanged */}
  </DialogContent>
</Dialog>
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/VisitLogSheet.tsx
git commit -m "fix(coach): center VisitLogSheet + filter actions to current assessment"
```

---

### Task 5: Convert VisitBriefingSheet — Sheet → Dialog

**Files:**
- Modify: `src/components/coach/VisitBriefingSheet.tsx`

- [ ] **Step 1: Read the full file**

Read `src/components/coach/VisitBriefingSheet.tsx` in full.

- [ ] **Step 2: Replace Sheet with Dialog**

Remove Sheet imports, add Dialog imports. Replace wrapper:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle ...>...</DialogTitle>
    </DialogHeader>
    {/* content — unchanged for now, hub links added in Task 13 */}
  </DialogContent>
</Dialog>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/VisitBriefingSheet.tsx
git commit -m "fix(coach): center VisitBriefingSheet — Sheet to Dialog"
```

---

### Task 6: Remove Field Notes + increase score size in CoachDashboard

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Read the file around line 1407**

Read `src/pages/CoachDashboard.tsx` from offset 1380 to understand the Field Notes `<Card>` block boundaries. It starts at `{/* Notes Feed */}` and ends after the paginated notes list.

- [ ] **Step 2: Remove Field Notes Card block**

Delete the entire `<Card>` block starting at `{/* Notes Feed */}` through its closing `</Card>`. This includes: the card header with "Field Notes" title, the dealer filter Select, the "+ New Note" Button, and the paginated notes list.

Also remove these state variables that are now unused (Field Notes-specific):
```tsx
// Remove these:
const [notesDealerFilter, setNotesDealerFilter] = useState('all');
const [notesPage, setNotesPage] = useState(0);
```

And remove any `filteredNotes` computation derived from those variables (search for `filteredNotes` and remove the `useMemo` or derived value — but keep the `notes` array and `fetchNotes` function since they power the `hasNotes` dot on dealer cards).

- [ ] **Step 3: Increase score gauge size on dealer card**

Find the `<ScoreGauge score={dealer.latestScore} size={72} />` line in the dealer card render (around line 1005). Change `size={72}` to `size={88}`:

```tsx
<ScoreGauge score={dealer.latestScore} size={88} />
```

Also change the fallback div dimensions from `w-[72px] h-[72px]` to `w-[88px] h-[88px]`.

- [ ] **Step 4: Pass latestAssessmentId to VisitLogSheet**

Find the `<VisitLogSheet>` mount at the bottom of CoachDashboard. Add the prop:

```tsx
<VisitLogSheet
  open={visitLogSheetOpen}
  onOpenChange={setVisitLogSheetOpen}
  visit={selectedVisitForLog}
  dealershipId={visitHistoryDealerId}
  dealerName={dealers.find(d => d.dealershipId === visitHistoryDealerId)?.dealerName ?? ''}
  latestAssessmentId={dealers.find(d => d.dealershipId === visitHistoryDealerId)?.latestAssessmentId ?? null}
  onLogSaved={() => {
    setVisitLogSheetOpen(false);
    fetchDealerVisits(visitHistoryDealerId);
  }}
/>
```

- [ ] **Step 5: Verify build + tests**

```bash
npm run build && npx vitest run
```

Expected: clean build, 193 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "fix(coach): remove Field Notes section, increase score gauge size, pass latestAssessmentId to VisitLogSheet"
```

---

## Part C — Stream 2: Visit Negotiation

### Task 7: Dealer visit banner — Decline + Counter-propose

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Read Dashboard.tsx visit banner section**

Read `src/pages/Dashboard.tsx` from offset 600 to 850 to understand the full visit banner and `upcomingVisit` state.

- [ ] **Step 2: Extend upcomingVisit state type**

Find the `upcomingVisit` useState declaration. Extend the type:

```tsx
const [upcomingVisit, setUpcomingVisit] = useState<{
  visit_date: string;
  status: 'proposed' | 'confirmed' | 'counter_proposed' | 'cancelled';
  id: string;
  dealer_proposed_date: string | null;
} | null>(null);
```

Update the query that fetches the upcoming visit to include the new columns:

```tsx
const { data: visitData } = await supabase
  .from('coach_visits')
  .select('id, visit_date, status, dealer_proposed_date')
  .eq('dealership_id', profile.active_dealership_id)
  .in('status', ['proposed', 'confirmed', 'counter_proposed'])
  .order('visit_date', { ascending: true })
  .limit(1)
  .maybeSingle();
```

- [ ] **Step 3: Add state for counter-propose mode**

Inside the Dashboard component, add:

```tsx
const [counterMode, setCounterMode] = useState(false);
const [counterDate, setCounterDate] = useState<Date | undefined>(undefined);
const [negotiating, setNegotiating] = useState(false);
```

- [ ] **Step 4: Add handler functions**

Add these handlers in the Dashboard component body (after `handleConfirmVisit`):

```tsx
const handleDeclineVisit = async () => {
  if (!upcomingVisit) return;
  setNegotiating(true);
  try {
    const { error } = await supabase
      .from('coach_visits')
      .update({ status: 'cancelled', declined_by: 'dealer' })
      .eq('id', upcomingVisit.id);
    if (!error) setUpcomingVisit(null);
  } finally {
    setNegotiating(false);
  }
};

const handleCounterPropose = async () => {
  if (!upcomingVisit || !counterDate) return;
  setNegotiating(true);
  try {
    const { error } = await supabase
      .from('coach_visits')
      .update({
        status: 'counter_proposed',
        dealer_proposed_date: format(counterDate, 'yyyy-MM-dd'),
      })
      .eq('id', upcomingVisit.id);
    if (!error) {
      setUpcomingVisit(prev => prev
        ? { ...prev, status: 'counter_proposed', dealer_proposed_date: format(counterDate, 'yyyy-MM-dd') }
        : null
      );
      setCounterMode(false);
      setCounterDate(undefined);
    }
  } finally {
    setNegotiating(false);
  }
};
```

Ensure `format` from `date-fns` is imported. Check existing imports — add if missing:
```tsx
import { format } from 'date-fns';
```

Also ensure `Calendar` from `@/components/ui/calendar` is imported.

- [ ] **Step 5: Replace the visit banner JSX**

Find the visit confirmation banner block (starts at `{upcomingVisit && (`). Replace the entire block with:

```tsx
{upcomingVisit && (
  <div className={`rounded-xl border px-4 py-3 space-y-3 ${
    upcomingVisit.status === 'confirmed'
      ? 'bg-[#16a34a]/5 border-[#16a34a]/20'
      : upcomingVisit.status === 'counter_proposed'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-[#2563eb]/5 border-[#2563eb]/20'
  }`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CalendarIcon className={`h-4 w-4 shrink-0 ${
          upcomingVisit.status === 'confirmed' ? 'text-[#16a34a]'
          : upcomingVisit.status === 'counter_proposed' ? 'text-amber-600'
          : 'text-[#2563eb]'
        }`} />
        <div>
          <p className="text-sm font-medium">
            {upcomingVisit.status === 'confirmed'
              ? 'Confirmed coaching visit'
              : upcomingVisit.status === 'counter_proposed'
              ? 'You suggested a new date'
              : 'Proposed coaching visit'}
          </p>
          <p className="text-xs text-muted-foreground">
            {upcomingVisit.status === 'counter_proposed' && upcomingVisit.dealer_proposed_date
              ? format(new Date(upcomingVisit.dealer_proposed_date), 'EEEE, dd MMMM yyyy')
              : format(new Date(upcomingVisit.visit_date), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* Confirmed state */}
      {upcomingVisit.status === 'confirmed' && (
        <Badge variant="outline" className="bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 shrink-0">
          Confirmed ✓
        </Badge>
      )}

      {/* Counter-proposed state */}
      {upcomingVisit.status === 'counter_proposed' && (
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 shrink-0">
          Awaiting coach response
        </Badge>
      )}

      {/* Proposed state — 3 actions */}
      {upcomingVisit.status === 'proposed' && !counterMode && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={negotiating}
            onClick={handleConfirmVisit}
          >
            Accept ✓
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={negotiating}
            onClick={() => setCounterMode(true)}
          >
            Suggest new date
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-red-600 hover:text-red-600"
            disabled={negotiating}
            onClick={handleDeclineVisit}
          >
            Decline
          </Button>
        </div>
      )}
    </div>

    {/* Counter-propose inline calendar */}
    {upcomingVisit.status === 'proposed' && counterMode && (
      <div className="space-y-3 pt-1">
        <Calendar
          mode="single"
          selected={counterDate}
          onSelect={setCounterDate}
          disabled={{ before: new Date() }}
          className="rounded-md border mx-auto"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={!counterDate || negotiating}
            onClick={handleCounterPropose}
          >
            {negotiating ? 'Saving…' : 'Suggest this date'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => { setCounterMode(false); setCounterDate(undefined); }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(dealer): add decline + counter-propose to visit banner"
```

---

### Task 8: Coach badge notification for counter_proposed / declined

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Read CoachDashboard.tsx around fetchDealerVisits and dealer card render**

Read the file to understand: how `dealerVisits` is keyed (by `dealershipId`), and where the visit chip is rendered on the dealer card (around line 1052–1062).

- [ ] **Step 2: Add computed visit badge in dealer card render**

Find the section inside the `filteredDealers.map()` render where `const visitLabel = activeVisitsByDealer.get(dealer.dealershipId)` is computed (around line 958). After that line, add:

```tsx
const activeVisit = (dealerVisits[dealer.dealershipId] ?? [])
  .find(v => ['proposed', 'confirmed', 'counter_proposed', 'cancelled'].includes(v.status));
const isCounterProposed = activeVisit?.status === 'counter_proposed';
const isDeclined = activeVisit?.status === 'cancelled' && (activeVisit as any).declined_by === 'dealer';
```

- [ ] **Step 3: Add badge to the visit chip row**

Find the visit chip section (around line 1052–1062):

```tsx
{/* Visit chip */}
<div className="text-xs flex items-center gap-1">
  ...
</div>
```

After that closing `</div>`, add the negotiation badge row:

```tsx
{(isCounterProposed || isDeclined) && (
  <div className="mt-1">
    {isCounterProposed && activeVisit?.dealer_proposed_date && (
      <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
        Dealer suggested {format(new Date(activeVisit.dealer_proposed_date), 'dd MMM')}
      </span>
    )}
    {isDeclined && (
      <span className="inline-flex items-center text-[10px] bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5">
        Dealer declined visit
      </span>
    )}
  </div>
)}
```

- [ ] **Step 4: Ensure dealerVisits is populated for badge to work**

The badge reads from `dealerVisits[dealer.dealershipId]`. This is only populated when the coach clicks "History". To show badges without requiring the coach to open History first, trigger `fetchDealerVisits` for all dealers on initial load.

Find where `dealers` state is set (after `setDealers(assigned)` in the data fetch). After it, add:

```tsx
// Pre-fetch visits for all dealers to enable badge display
assigned.forEach(d => fetchDealerVisits(d.dealershipId));
```

**Note:** `fetchDealerVisits` is already defined in the component and handles its own loading state per dealer.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach): add counter_proposed + declined badge notification to dealer cards"
```

---

### Task 9: VisitSheet — coach response to counter-proposal

**Files:**
- Modify: `src/components/coach/VisitSheet.tsx`

- [ ] **Step 1: Read VisitSheet.tsx in full**

Read the complete file. Understand: `CoachVisit` type usage, `fetchVisits` function, `activeVisit` state, and where the existing "Mark as completed" and "Cancel visit" buttons render.

- [ ] **Step 2: Add state for coach counter-response**

Inside the `VisitSheet` component, add:

```tsx
const [coachResponseMode, setCoachResponseMode] = useState(false);
const [coachCounterDate, setCoachCounterDate] = useState<Date | undefined>(undefined);
const [responding, setResponding] = useState(false);
```

- [ ] **Step 3: Add handler functions**

```tsx
const handleAcceptCounterProposal = async (visitId: string, dealerDate: string) => {
  setResponding(true);
  try {
    const { error } = await supabase
      .from('coach_visits')
      .update({
        status: 'confirmed',
        visit_date: dealerDate,
        dealer_proposed_date: null,
      })
      .eq('id', visitId);
    if (!error) {
      toast.success('Visit confirmed on dealer\'s proposed date');
      await fetchVisits();
      onVisitSaved();
    }
  } catch {
    toast.error('Failed to confirm visit');
  } finally {
    setResponding(false);
  }
};

const handleRejectAndRepropose = async (visitId: string) => {
  setResponding(true);
  try {
    if (!coachCounterDate) return;
    const { error } = await supabase
      .from('coach_visits')
      .update({
        status: 'proposed',
        visit_date: format(coachCounterDate, 'yyyy-MM-dd'),
        dealer_proposed_date: null,
      })
      .eq('id', visitId);
    if (!error) {
      toast.success('New date proposed to dealer');
      setCoachResponseMode(false);
      setCoachCounterDate(undefined);
      await fetchVisits();
      onVisitSaved();
    }
  } catch {
    toast.error('Failed to propose new date');
  } finally {
    setResponding(false);
  }
};
```

Ensure `format` from `date-fns` is imported (check existing imports).

- [ ] **Step 4: Add counter_proposed UI in the active visit block**

Find the `{activeVisit && (` section that renders the active visit card. Add a new branch for `status === 'counter_proposed'` BEFORE the existing `!activeVisit &&` calendar section:

```tsx
{activeVisit?.status === 'counter_proposed' && activeVisit.dealer_proposed_date && (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
    <div>
      <p className="text-sm font-semibold text-amber-800">Dealer suggested a new date</p>
      <p className="text-xs text-amber-700 mt-0.5">
        {format(new Date(activeVisit.dealer_proposed_date), 'EEEE, dd MMMM yyyy')}
      </p>
    </div>
    {!coachResponseMode ? (
      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={responding}
          onClick={() => handleAcceptCounterProposal(activeVisit.id, activeVisit.dealer_proposed_date!)}
        >
          Accept this date
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => setCoachResponseMode(true)}
        >
          Propose different date
        </Button>
      </div>
    ) : (
      <div className="space-y-3">
        <Calendar
          mode="single"
          selected={coachCounterDate}
          onSelect={setCoachCounterDate}
          disabled={{ before: new Date() }}
          className="rounded-md border"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={!coachCounterDate || responding}
            onClick={() => handleRejectAndRepropose(activeVisit.id)}
          >
            {responding ? 'Saving…' : 'Propose this date'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => { setCoachResponseMode(false); setCoachCounterDate(undefined); }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )}
  </div>
)}
```

Also ensure `Calendar` from `@/components/ui/calendar` is imported if not already.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/VisitSheet.tsx
git commit -m "feat(coach): add counter-proposal response flow to VisitSheet"
```

---

### Task 10: OemDashboard — Next Visit column

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Read OemDashboard.tsx around the dealer state and leaderboard table**

Read the file around lines 100–200 (dealer data fetching) and 888–970 (leaderboard TableHead/TableRow). Understand how `filteredDealers` is typed and what fields each dealer record has.

- [ ] **Step 2: Fetch next visits for enrolled dealers**

Find where dealer data is loaded (look for the Supabase query that populates `filteredDealers` or similar). After loading dealer records, fetch their upcoming visits in parallel.

Add state near other OEM state declarations:
```tsx
const [dealerNextVisits, setDealerNextVisits] = useState<Record<string, { visit_date: string; status: string } | null>>({});
```

Add a fetch function (place after existing fetch functions):
```tsx
const fetchDealerNextVisits = async (dealershipIds: string[]) => {
  if (!dealershipIds.length) return;
  const { data } = await supabase
    .from('coach_visits')
    .select('dealership_id, visit_date, status')
    .in('dealership_id', dealershipIds)
    .in('status', ['proposed', 'confirmed'])
    .order('visit_date', { ascending: true });

  const visitMap: Record<string, { visit_date: string; status: string }> = {};
  for (const row of data ?? []) {
    // Take the earliest upcoming visit per dealership
    if (!visitMap[row.dealership_id]) {
      visitMap[row.dealership_id] = { visit_date: row.visit_date, status: row.status };
    }
  }
  setDealerNextVisits(visitMap);
};
```

Call this function after dealer data loads — find the `useEffect` or data loading block and call:
```tsx
fetchDealerNextVisits(dealerships.map(d => d.dealership_id));
```
(Adjust `dealerships` and `d.dealership_id` to match actual variable names found in the file.)

- [ ] **Step 3: Add Next Visit TableHead**

Find the `<TableHeader>` block in the leaderboard. Add a new column header after `Benchmark Band`:

```tsx
<TableHead className="text-center hidden lg:table-cell">Next Visit</TableHead>
```

- [ ] **Step 4: Add Next Visit TableCell in each dealer row**

Find the `filteredDealers.map(dealer => ...)` TableRow render. Add the cell (after the benchmark band cell):

```tsx
<TableCell className="text-center hidden lg:table-cell">
  {(() => {
    const visit = dealerNextVisits[dealer.dealership_id];
    if (!visit) return <span className="text-xs text-muted-foreground">—</span>;
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-medium">
          {format(new Date(visit.visit_date), 'dd MMM')}
        </span>
        <Badge
          variant="outline"
          className={`text-[10px] ${
            visit.status === 'confirmed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {visit.status === 'confirmed' ? 'Confirmed' : 'Proposed'}
        </Badge>
      </div>
    );
  })()}
</TableCell>
```

Ensure `format` from `date-fns` is imported (check existing imports in OemDashboard.tsx).

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add Next Visit column to dealer leaderboard"
```

---

## Part D — Stream 3: Coherent Hub System

### Task 11: VisitBriefingSheet — hub links + upcoming visit

**Files:**
- Modify: `src/components/coach/VisitBriefingSheet.tsx`

- [ ] **Step 1: Read the full file**

Read `src/components/coach/VisitBriefingSheet.tsx` in full. Note: already converted to Dialog in Task 5. Identify the `VisitBriefingSheetProps` interface, `BriefingData` interface, `fetchBriefingData` function, and the 4 existing sections.

- [ ] **Step 2: Extend VisitBriefingSheetProps with callbacks**

```tsx
interface VisitBriefingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string;
  dealerName: string;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  // Hub navigation callbacks
  onOpenHistory?: () => void;
  onOpenVisit?: () => void;
  onOpenNotes?: () => void;
}
```

Update function signature to destructure the new props.

- [ ] **Step 3: Extend BriefingData with upcomingVisit**

```tsx
interface BriefingData {
  scores: Record<string, number>;
  topActions: Array<{
    id: string;
    action_title: string;
    priority: string;
    last_status_updated_at: string | null;
  }>;
  lastVisit: {
    visit_date: string;
    visit_type: string | null;
    modules_reviewed: string[];
    summary: string | null;
  } | null;
  recentNotes: Array<{
    id: string;
    note_text: string;
    created_at: string;
  }>;
  upcomingVisit: {         // NEW
    visit_date: string;
    status: string;
  } | null;
}
```

- [ ] **Step 4: Add 5th parallel query in fetchBriefingData**

Inside `fetchBriefingData`, the `Promise.all` currently has 4 items. Add a 5th:

```tsx
const [scoresResult, assessmentsResult, visitResult, notesResult, upcomingVisitResult] = await Promise.all([
  // ... existing 4 queries unchanged ...

  // 5th: upcoming proposed/confirmed visit
  supabase
    .from('coach_visits')
    .select('visit_date, status')
    .eq('coach_user_id', user.id)
    .eq('dealership_id', dealershipId)
    .in('status', ['proposed', 'confirmed'])
    .order('visit_date', { ascending: true })
    .limit(1)
    .maybeSingle(),
]);
```

Update the `setData` call to include `upcomingVisit`:
```tsx
setData({
  scores: (scoresResult.data as any)?.scores ?? {},
  topActions: (actionsResult.data ?? []) as BriefingData['topActions'],
  lastVisit: (visitResult.data as BriefingData['lastVisit']) ?? null,
  recentNotes: (notesResult.data ?? []) as BriefingData['recentNotes'],
  upcomingVisit: (upcomingVisitResult.data as BriefingData['upcomingVisit']) ?? null,
});
```

- [ ] **Step 5: Add Upcoming Visit section + hub links to JSX**

After the existing 4 sections, add Section 5 (Upcoming Visit):

```tsx
{/* Section 5: Upcoming Visit */}
<section>
  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
    Upcoming visit
  </p>
  {data.upcomingVisit ? (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-xs font-medium">
        {format(new Date(data.upcomingVisit.visit_date), 'dd MMM yyyy')}
      </span>
      <Badge variant="outline" className="text-[10px] capitalize">
        {data.upcomingVisit.status}
      </Badge>
    </div>
  ) : (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">No visit scheduled</p>
      {onOpenVisit && (
        <button
          className="text-xs text-[hsl(var(--brand-500))] underline"
          onClick={() => { onOpenChange(false); onOpenVisit(); }}
        >
          Schedule →
        </button>
      )}
    </div>
  )}
</section>
```

Update Section 3 (Last Visit) to add "View history →" link after the summary text:

```tsx
{onOpenHistory && (
  <button
    className="text-xs text-[hsl(var(--brand-500))] underline mt-1 block"
    onClick={() => { onOpenChange(false); onOpenHistory(); }}
  >
    View history →
  </button>
)}
```

Update Section 4 (Coach Notes) to add "Add note →" link:

```tsx
{onOpenNotes && (
  <button
    className="text-xs text-[hsl(var(--brand-500))] underline mt-1 block"
    onClick={() => { onOpenChange(false); onOpenNotes(); }}
  >
    Add note →
  </button>
)}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/coach/VisitBriefingSheet.tsx
git commit -m "feat(coach): make VisitBriefingSheet hub with upcoming visit + cross-dialog links"
```

---

### Task 12: Wire hub callbacks in CoachDashboard

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Read the VisitBriefingSheet mount and existing dialog state**

Read `src/pages/CoachDashboard.tsx` bottom section where `<VisitBriefingSheet>` is mounted. Note existing state: `visitSheetOpen`, `noteSheetOpen`, `visitHistoryDealerId`.

- [ ] **Step 2: Pass hub callbacks to VisitBriefingSheet**

Find the `<VisitBriefingSheet>` mount and update it:

```tsx
{briefingDealerId && (
  <VisitBriefingSheet
    open={briefingSheetOpen}
    onOpenChange={setBriefingSheetOpen}
    dealershipId={briefingDealerId}
    dealerName={dealers.find(d => d.dealershipId === briefingDealerId)?.dealerName ?? ''}
    latestAssessmentId={dealers.find(d => d.dealershipId === briefingDealerId)?.latestAssessmentId ?? null}
    latestScore={dealers.find(d => d.dealershipId === briefingDealerId)?.latestScore ?? null}
    latestDate={dealers.find(d => d.dealershipId === briefingDealerId)?.latestDate ?? null}
    onOpenHistory={() => {
      setBriefingSheetOpen(false);
      // History is the inline panel — just expand it
      if (briefingDealerId) {
        setVisitHistoryDealerId(briefingDealerId);
        fetchDealerVisits(briefingDealerId);
      }
    }}
    onOpenVisit={() => {
      setBriefingSheetOpen(false);
      const dealer = dealers.find(d => d.dealershipId === briefingDealerId);
      if (dealer) {
        setVisitSheetDealer(dealer);
        setVisitSheetOpen(true);
      }
    }}
    onOpenNotes={() => {
      setBriefingSheetOpen(false);
      const dealer = dealers.find(d => d.dealershipId === briefingDealerId);
      if (dealer) {
        setNoteSheetDealer(dealer);
        setNoteSheetOpen(true);
      }
    }}
  />
)}
```

**Note:** Check the actual state variable names for VisitSheet (`setVisitSheetDealer`, `setVisitSheetOpen`) and CoachNoteSheet (`setNoteSheetDealer`, `setNoteSheetOpen`) by reading the file. Adjust if names differ.

- [ ] **Step 3: Verify build + full tests**

```bash
npm run build && npx vitest run
```

Expected: clean build, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach): wire hub callbacks — Briefing opens Notes/Visit/History dialogs"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npx vitest run
```

Expected: all 193+ tests pass.

- [ ] **Manual smoke test**

1. CoachDashboard → click Notes button → dialog opens centered ✓
2. CoachDashboard → click Calendar button → dialog opens centered ✓
3. CoachDashboard → click History → inline panel expands in card ✓
4. CoachDashboard → click Briefing → dialog opens centered, shows 5 sections ✓
5. Briefing → click "View history →" → Briefing closes, History expands ✓
6. Briefing → click "Add note →" → Briefing closes, Notes dialog opens ✓
7. Briefing → click "Schedule →" (no visit) → Briefing closes, Calendar dialog opens ✓
8. Dealer dashboard → proposed visit shows Accept / Suggest new date / Decline ✓
9. Dealer clicks "Suggest new date" → calendar shows → submit → banner shows "awaiting coach" ✓
10. CoachDashboard → dealer card shows amber badge "Dealer suggested [date]" ✓
11. Coach opens Calendar (VisitSheet) → sees counter-proposal with Accept/Propose different date ✓
12. OEM Dashboard → Leaderboard tab → Next Visit column shows confirmed/proposed visits ✓
13. Field Notes section gone from CoachDashboard ✓
14. Score gauge is larger on dealer card ✓
15. VisitLogSheet action list shows only current assessment actions ✓

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: coach dashboard UX overhaul — streams 1+2+3 complete"
```
