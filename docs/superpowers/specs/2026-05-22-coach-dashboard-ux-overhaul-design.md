# Design Spec: Coach Dashboard UX Overhaul
**Date:** 2026-05-22  
**Status:** Approved  
**Covers:** Stream 1 (quick fixes) + Stream 2 (visit negotiation) + Stream 3 (coherent 4-button hub)

---

## Overview

Three coordinated improvements to the coach–dealer interaction layer:

1. **Stream 1 — Quick fixes:** Sheet positioning (right → center), Field Notes removal, score prominence, action filter.
2. **Stream 2 — Visit negotiation:** Dealer can Accept / Decline / Counter-propose visit dates. Coach sees badge notification. Confirmed visit syncs to OEM.
3. **Stream 3 — Coherent hub:** Briefing becomes the read-only intelligence hub linking to the other three dialogs (Notes, Calendar, History). Each dialog cross-references the others.

---

## Stream 1 — Quick Fixes

### 1a. Sheet → Dialog conversion (all 4 coach sheets)

All four coach sheet components currently use `<Sheet side="right">` which slides in from the right edge. Replace with `<Dialog>` which centers as a modal overlay.

**Files to modify:**
- `src/components/coach/VisitSheet.tsx` → `Dialog` max-w-md
- `src/components/coach/CoachNoteSheet.tsx` → `Dialog` max-w-md
- `src/components/coach/VisitLogSheet.tsx` → `Dialog` max-w-lg (more content)
- `src/components/coach/VisitBriefingSheet.tsx` → `Dialog` max-w-lg

**Pattern for each conversion:**
```tsx
// Before
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
    <SheetHeader>
      <SheetTitle>...</SheetTitle>
    </SheetHeader>
    {children}
  </SheetContent>
</Sheet>

// After
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    {children}
  </DialogContent>
</Dialog>
```

Import changes: replace `Sheet, SheetContent, SheetHeader, SheetTitle` with `Dialog, DialogContent, DialogHeader, DialogTitle` from `@/components/ui/dialog`.

### 1b. Remove Field Notes from CoachDashboard

Delete the entire Field Notes `<section>` block from `src/pages/CoachDashboard.tsx`. This includes the section heading, the note list, and the "+ New Note" button row. No replacement.

### 1c. Dealer card score prominence

In `src/pages/CoachDashboard.tsx`, find where the overall score number is rendered on each dealer card:
- Score number: increase to `text-4xl font-bold` (from current smaller size)
- Progress bar (action plan): reduce height from current to `h-0.5` (very thin line, secondary)
- Maturity badge: keep below score number

### 1d. VisitLogSheet action filter

In `src/components/coach/VisitLogSheet.tsx`, `fetchOpenActions()` currently queries all assessments for the dealership. Change to only fetch from the single assessment passed as `latestAssessmentId`.

**If `VisitLogSheet` doesn't receive `latestAssessmentId` as a prop:** add it as an optional prop `latestAssessmentId?: string | null`. In `CoachDashboard.tsx`, pass `dealer.latestAssessmentId` when rendering `<VisitLogSheet>`.

**New query in `fetchOpenActions`:**
```ts
// If latestAssessmentId is provided, use it directly
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
// Fallback: fetch by dealership assessments (existing behaviour)
```

---

## Stream 2 — Visit Negotiation

### 2a. DB migration

```sql
-- coach_visits.status is plain text (not a DB enum) — no ALTER TYPE needed.
-- New values 'counter_proposed' and 'cancelled' (with declined_by) are app-validated.
ALTER TABLE public.coach_visits
  ADD COLUMN IF NOT EXISTS dealer_proposed_date date,
  ADD COLUMN IF NOT EXISTS declined_by text 
    CHECK (declined_by IN ('dealer', 'coach'));

COMMENT ON COLUMN public.coach_visits.dealer_proposed_date IS 'Date proposed by dealer in a counter-proposal';
COMMENT ON COLUMN public.coach_visits.declined_by IS 'Who declined: dealer or coach';
```

`coach_visits.status` is `text` in both Supabase schema and generated types. No enum migration needed. App validates allowed values: `proposed | confirmed | cancelled | completed | counter_proposed`.

After migration: regenerate Supabase TypeScript types.

### 2b. Dealer-side visit banner (existing dealer Dashboard)

**File:** `src/pages/Dashboard.tsx` or wherever the "Upcoming coaching visit" banner is rendered.

Current state: banner shows proposed visit with single "Confirm" button.

New state: banner shows 3 actions:
```tsx
{/* When status === 'proposed' */}
<div className="flex items-center gap-2">
  <Button size="sm" onClick={handleAccept}>Accept ✓</Button>
  <Button size="sm" variant="outline" onClick={() => setCounterMode(true)}>
    Suggest new date
  </Button>
  <Button size="sm" variant="ghost" className="text-red-600" onClick={handleDecline}>
    Decline
  </Button>
</div>

{/* Counter-propose inline date picker (shown when counterMode is true) */}
{counterMode && (
  <div className="mt-3 space-y-2">
    <Calendar
      mode="single"
      selected={counterDate}
      onSelect={setCounterDate}
      disabled={{ before: new Date() }}
    />
    <Button onClick={handleCounterPropose} disabled={!counterDate}>
      Suggest this date
    </Button>
    <button onClick={() => setCounterMode(false)} className="text-xs text-muted-foreground">
      Cancel
    </button>
  </div>
)}
```

**Handlers:**
```ts
const handleAccept = async () => {
  await supabase.from('coach_visits').update({ status: 'confirmed' }).eq('id', activeVisit.id);
};

const handleDecline = async () => {
  await supabase.from('coach_visits')
    .update({ status: 'cancelled', declined_by: 'dealer' })
    .eq('id', activeVisit.id);
};

const handleCounterPropose = async () => {
  await supabase.from('coach_visits').update({
    status: 'counter_proposed',
    dealer_proposed_date: format(counterDate!, 'yyyy-MM-dd'),
  }).eq('id', activeVisit.id);
};
```

When `status === 'counter_proposed'`, banner changes to:
```
📅 You suggested [dealer_proposed_date] — waiting for coach response
```

### 2c. Coach-side badge notification

**File:** `src/pages/CoachDashboard.tsx`

In `fetchDealerVisits()`, fetch the active visit for each dealer. The `dealerVisits` state already holds this. Add a computed indicator per dealer card:

```tsx
// In dealer card render:
const activeVisit = (dealerVisits[dealer.dealershipId] ?? [])
  .find(v => v.status === 'proposed' || v.status === 'confirmed' 
          || v.status === 'counter_proposed' || v.status === 'cancelled');

{activeVisit?.status === 'counter_proposed' && (
  <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
    Dealer suggested {format(new Date(activeVisit.dealer_proposed_date!), 'dd MMM')}
  </span>
)}

{activeVisit?.status === 'cancelled' && activeVisit.declined_by === 'dealer' && (
  <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5">
    Dealer declined
  </span>
)}
```

**VisitSheet coach response to counter-proposal:**

When `activeVisit.status === 'counter_proposed'`, show instead of the calendar:
```tsx
<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
  <p className="text-sm font-medium">
    Dealer suggested {format(new Date(activeVisit.dealer_proposed_date!), 'dd MMMM yyyy')}
  </p>
  <div className="flex gap-2">
    <Button size="sm" onClick={handleAcceptCounterProposal}>Accept this date</Button>
    <Button size="sm" variant="outline" onClick={handleRejectCounter}>Propose different date</Button>
  </div>
</div>
```

`handleAcceptCounterProposal` → UPDATE `status = 'confirmed'`, `visit_date = dealer_proposed_date`.
`handleRejectCounter` → resets to calendar picker, UPDATE `status = 'proposed'`.

### 2d. OEM dashboard sync

**File:** `src/pages/OemDashboard.tsx`

In the dealer leaderboard table, add a "Next Visit" column. Query: for each `dealership_id`, fetch the most recent `coach_visits` row where `status IN ('proposed', 'confirmed')`, ordered by `visit_date asc`, limit 1.

Show:
- `confirmed` → green chip with date
- `proposed` → muted chip with date + "(pending)"
- None → "—"

This is a read-only display. RLS: OEM already has additive read access to `coach_visits` via existing policies (verify — if not, add a SECURITY DEFINER function or additive policy).

---

## Stream 3 — Coherent 4-Button Hub System

### 3a. Briefing as read-only hub

**File:** `src/components/coach/VisitBriefingSheet.tsx` (now converted to Dialog in Stream 1)

Add two new sections to the briefing:

**Section 5: Upcoming Visit**
```tsx
<section>
  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
    Upcoming visit
  </p>
  {upcomingVisit ? (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-xs font-medium">
        {format(new Date(upcomingVisit.visit_date), 'dd MMM yyyy')}
      </span>
      <Badge variant="outline" className="text-[10px] capitalize">
        {upcomingVisit.status}
      </Badge>
    </div>
  ) : (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">No visit scheduled</p>
      <button
        className="text-xs text-[hsl(var(--brand-500))] underline"
        onClick={() => { onOpenChange(false); onOpenVisit?.(); }}
      >
        Schedule →
      </button>
    </div>
  )}
</section>
```

**Updated Section 3 (Last Visit):** Add "View history →" link:
```tsx
<button
  className="text-xs text-[hsl(var(--brand-500))] underline mt-1 block"
  onClick={() => { onOpenChange(false); onOpenHistory?.(); }}
>
  View history →
</button>
```

**Updated Section 4 (Coach Notes):** Add "Add note →" link:
```tsx
<button
  className="text-xs text-[hsl(var(--brand-500))] underline mt-1 block"
  onClick={() => { onOpenChange(false); onOpenNotes?.(); }}
>
  Add note →
</button>
```

**Updated VisitBriefingSheetProps:**
```ts
interface VisitBriefingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string;
  dealerName: string;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  // New: callbacks to open other dialogs
  onOpenHistory?: () => void;
  onOpenVisit?: () => void;
  onOpenNotes?: () => void;
}
```

**Fetch upcoming visit** in `fetchBriefingData`:
```ts
// 5th parallel query — upcoming confirmed/proposed visit
supabase
  .from('coach_visits')
  .select('visit_date, status')
  .eq('coach_user_id', user.id)
  .eq('dealership_id', dealershipId)
  .in('status', ['proposed', 'confirmed'])
  .order('visit_date', { ascending: true })
  .limit(1)
  .maybeSingle()
```

### 3b. Context chips in Calendar and Notes dialogs

**VisitSheet (Calendar dialog)** — add context row below title:
```tsx
{latestScore !== null && (
  <p className="text-xs text-muted-foreground mb-4">
    Score: <span className="font-semibold">{Math.round(latestScore)}/100</span>
    {lastVisitDate && (
      <> · Last visit: {format(new Date(lastVisitDate), 'dd MMM')}</>
    )}
  </p>
)}
```

Pass `latestScore` and `lastVisitDate` as optional props to `VisitSheet`.

**CoachNoteSheet (Notes dialog)** — add context row:
```tsx
{lastVisitSummary && (
  <p className="text-[10px] text-muted-foreground bg-muted/50 rounded px-2 py-1.5 mb-4">
    Last visit context: "{lastVisitSummary.slice(0, 80)}…"
  </p>
)}
```

Pass `lastVisitSummary?: string | null` as optional prop to `CoachNoteSheet`.

**VisitLogSheet (History / Session Log)** — add "Open Briefing →" shortcut:
```tsx
{onOpenBriefing && (
  <button
    className="text-xs text-[hsl(var(--brand-500))] underline"
    onClick={() => { onOpenChange(false); onOpenBriefing(); }}
  >
    ← Open briefing
  </button>
)}
```

### 3c. CoachDashboard wires callbacks

**File:** `src/pages/CoachDashboard.tsx`

When rendering `<VisitBriefingSheet>`, pass:
```tsx
<VisitBriefingSheet
  ...existing props...
  onOpenHistory={() => {
    setBriefingSheetOpen(false);
    setVisitHistoryDealerId(dealer.dealershipId);
    // History panel is inline, so just set the dealerId to expand it
  }}
  onOpenVisit={() => {
    setBriefingSheetOpen(false);
    setVisitSheetDealerId(dealer.dealershipId);
    setVisitSheetOpen(true);
  }}
  onOpenNotes={() => {
    setBriefingSheetOpen(false);
    setNoteSheetDealerId(dealer.dealershipId);
    setNoteSheetOpen(true);
  }}
/>
```

When rendering `<VisitSheet>`, pass `latestScore` and `lastVisitDate`.
When rendering `<CoachNoteSheet>`, pass `lastVisitSummary`.
When rendering `<VisitLogSheet>`, pass `onOpenBriefing` callback.

---

## Modified Files Summary

| File | Stream | Change |
|---|---|---|
| `src/components/coach/VisitSheet.tsx` | 1, 2, 3 | Sheet→Dialog, counter-proposal UI, context chip |
| `src/components/coach/CoachNoteSheet.tsx` | 1, 3 | Sheet→Dialog, last visit context chip |
| `src/components/coach/VisitLogSheet.tsx` | 1, 3 | Sheet→Dialog, action filter, briefing link |
| `src/components/coach/VisitBriefingSheet.tsx` | 1, 3 | Sheet→Dialog, hub links, upcoming visit section |
| `src/pages/CoachDashboard.tsx` | 1, 2, 3 | Remove Field Notes, score prominence, badges, callbacks |
| `src/pages/Dashboard.tsx` | 2 | Dealer visit banner: accept/decline/counter-propose |
| `src/pages/OemDashboard.tsx` | 2 | Add Next Visit column to leaderboard |
| `src/integrations/supabase/types.ts` | 2 | Regenerate after migration |

---

## Out of Scope

- PDF professional redesign (Stream 4 — deferred)
- Playwright E2E test setup (separate feature)
- Push notifications for visit responses (would need Edge Function + notification system extension)
- OEM ability to propose or cancel visits (OEM is read-only observer for visit data)
