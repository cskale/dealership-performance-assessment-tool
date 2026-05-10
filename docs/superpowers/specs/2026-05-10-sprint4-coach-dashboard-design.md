# Sprint 4: Coach Dashboard Redesign + Notes
**Date:** 2026-05-10
**Status:** Approved — ready for implementation
**Owner:** Claude Code
**Scope:** `src/pages/CoachDashboard.tsx` + one new Supabase migration (`coach_notes` table). No other files.

---

## Context

Part of the 7-sprint Leapsome-style quality bar raise. Sprint 3 delivered the dealer dashboard redesign. Sprint 4 applies the same design language to the coach dashboard and adds the first coach-specific premium feature: field notes.

Current coach dashboard is functional but visually generic — unstyled cards, no dark stats bar, no overdue action logic, no notes capability.

**Sprint 5** will add visit log (check-in/check-out), next-visit scheduling, and visit-based sorting.

---

## What Does NOT Change

- `AppSidebar.tsx` — Sprint 1 work, untouched
- `CoachActions.tsx` — separate page, untouched
- `AuthenticatedLayout.tsx` — untouched
- Routing — `/app/coach-dashboard` stays
- Scoring engine, signal engine, action templates — untouched
- Score trend chart (recharts `LineChart`) — kept as-is, moved to bottom of page
- No new npm packages (`Sheet` and all other components already in shadcn/ui)

---

## Page Structure

Two states: **empty** (no assignments) and **filled**.

Empty state: existing `SharedEmptyState` preserved unchanged.

Filled state — section order:

```
[Dark stats bar]
[Page header]
[Dealer Cards Grid — 3-col]
[Actions Requiring Attention]
[Notes Feed]
[Score Trend Chart]
```

---

## Section Specifications

### 1. Dark Stats Bar

`h-9` strip using `bg-[#0b1f3a]` — exact match to Sprint 3 dealer dashboard and `AssessmentHeroNav`.

Four chips separated by `border-r border-white/[0.08]`:

| Label | Value source |
|---|---|
| Dealers | `assignments.length` |
| Avg Score | mean of `latestScore` across all dealers (exclude nulls) |
| Overdue Actions | count of `improvement_actions` where `target_completion_date < today` AND `status != 'completed'` |
| Attention Needed | count of dealers where `latestScore < 46` |

All values computed client-side from data already fetched.

---

### 2. Page Header

```
[Page title: "Coach Dashboard"]
[Subtitle: "N dealerships assigned"]
```

No network selector (coaches have one implicit portfolio). No extra controls in header row.

---

### 3. Dealer Cards Grid

3-column grid (responsive: 1-col mobile, 2-col md, 3-col lg). Cards animate in with `opacity-0 animate-fade-in` staggered at 50ms per card (cap at card index 4).

**Card anatomy:**

```
[Dealer name — font-semibold]          [Brand badge]
[Location · N days since assessment]
────────────────────────────────────
[Score badge + maturity label]    [Trend arrow + delta]
[Open: N   Overdue: N (red if > 0)]
────────────────────────────────────
[Note icon btn]            [View Results →]
```

**Score badge**: same `getScoreBand()` logic as OEM dashboard (Advanced / Performing / Developing / Foundational thresholds: 85 / 70 / 46).

**Trend**: compares `latestScore` vs `previousScore`. Green `▲ +N` / Red `▼ −N` / Grey `—`. Requires fetching top-2 assessments per dealer (already fetched in current implementation).

**Action counts**: one extra query in `fetchAssignments` — `improvement_actions` filtered to dealer's assessment IDs, grouped into:
- `openCount`: `status IN ('Open', 'In Progress')`
- `overdueCount`: above AND `target_completion_date < today`

Overdue count shown as red badge if `> 0`.

**"Days since assessment"**: `Math.floor((now - new Date(latestDate)) / 86400000)` — shown as "N days ago" next to location. If no assessment: "No assessment yet".

**Note icon button**: ghost icon button (bottom-left). If notes exist for this dealer, shows a dot badge. Click → `Sheet` slides in (see Section 5).

**"View Results →"**: always visible (not hover-only). Navigates to `/app/results/:latestAssessmentId`. Disabled + replaced with "Start Assessment" if no `latestAssessmentId`.

**Sort controls** (above grid, left-aligned): "Score" | "Name" | "Overdue" toggle buttons. "Overdue" sort orders by `overdueCount` descending.

**Status filter** (beside sort): "All" | "Completed" | "In Progress" — same as current implementation.

---

### 4. Actions Requiring Attention

Replaces current "Stale Actions" card.

**Three tabs:**

| Tab | Filter |
|---|---|
| Overdue | `target_completion_date < today` AND `status != 'completed'` |
| Stale | no update ≥ 7 days AND `status != 'completed'` (existing staleness logic) |
| All Open | `status IN ('Open', 'In Progress')` |

**Dealer filter dropdown** above tabs — "All dealers" or individual dealer. Persists across tab switches.

**Table columns:**

```
Action title  |  Dealership  |  Due / Last updated  |  Priority  |  Status
```

- Due date: red text if overdue, amber if within 3 days, default otherwise
- Dealership: chip that navigates to `/app/results/:assessmentId`
- Priority badge: critical (red) / high (amber) / medium (blue) / low (muted)
- Row click: navigate to `/app/results/:assessmentId`

**Empty state per tab**: descriptive message + appropriate icon. Not a blank table.

---

### 5. Notes Sheet

Triggered by note icon on dealer card. Uses shadcn/ui `Sheet` (side, full height).

```
[Header: Dealer name]                      [× close]
────────────────────────────────────────────────────
[Context picker]
  ○ General note
  ○ Linked to assessment  [Select: latest 5 assessments for this dealer]
  ○ Linked to action      [Select: open actions for this dealer]

[Textarea — placeholder: "Add a field note…" — max 2000 chars]
[Submit button — "Save Note"]
────────────────────────────────────────────────────
[Previous notes — newest first]
  [Date]  [Context badge if linked]
  Note text
  ─────
  [Date]  ...
```

On submit: `INSERT INTO coach_notes` with `coach_user_id`, `dealership_id`, and optionally `assessment_id` / `action_id`. Optimistic UI update — note appears in sheet list immediately. Dot badge on dealer card updates.

---

### 6. Notes Feed

Full-width section below Actions card.

**Header row:**

```
[Section title: "Field Notes"]    [Dealer filter]    [+ New Note btn]
```

"+ New Note" opens the Sheet with dealer pre-selected from filter (or blank if "All").

**Feed:**

```
[Dealer name chip]  [Assessment / Action badge — if linked]      [Date]
Note text — multi-line, no truncation
──────────────────────────────────────────────────────────────────────
```

- Newest first
- Fetch 20 notes per page — "Load more" button at bottom
- Filter by dealer (dropdown in header)
- Query: `SELECT * FROM coach_notes WHERE coach_user_id = auth.uid() ORDER BY created_at DESC LIMIT 20 OFFSET N`

---

### 7. Score Trend Chart

Kept as-is from current implementation (recharts `LineChart`, up to 3 dealers, checkbox selector). Moved to bottom of page — below Notes Feed.

No visual changes to the chart itself this sprint.

---

## Data Model

### New table: `coach_notes`

```sql
CREATE TABLE public.coach_notes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id     uuid NOT NULL REFERENCES auth.users(id),
  dealership_id     uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  assessment_id     uuid REFERENCES assessments(id) ON DELETE SET NULL,
  action_id         uuid REFERENCES improvement_actions(id) ON DELETE SET NULL,
  note_text         text NOT NULL CHECK (char_length(note_text) <= 2000),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
```

### RLS policies

| Operation | Role | Condition |
|---|---|---|
| INSERT | Coach | `coach_user_id = auth.uid()` |
| UPDATE | Coach | `coach_user_id = auth.uid()` |
| DELETE | Coach | `coach_user_id = auth.uid()` |
| SELECT | Coach | `coach_user_id = auth.uid()` |
| SELECT | Dealer | `dealership_id` matches `profiles.active_dealership_id` where `profiles.user_id = auth.uid()` |
| SELECT | OEM | `dealership_id` IN any active `dealer_network_memberships` for OEM's network |

OEM policy must use `SECURITY DEFINER` function to avoid RLS recursion (same pattern as `get_dealership_details`).

### Updated data fetch in `CoachDashboard.tsx`

`fetchAssignments` gains one additional query after fetching assessments:

```ts
// Fetch open + overdue action counts per dealership
const { data: actionCounts } = await supabase
  .from('improvement_actions')
  .select('assessment_id, status, target_completion_date')
  .in('assessment_id', assessmentIds)
  .in('status', ['Open', 'In Progress']);
```

Compute `openCount` and `overdueCount` per dealership client-side. Add both fields to `AssignedDealer` interface.

### Supabase types regeneration

After migration is applied, regenerate via:
```
mcp__claude_ai_Supabase__generate_typescript_types (project_id: xrypgosuyfdkkqafftae)
```
Write output to `src/integrations/supabase/types.ts`.

---

## Deferred to Sprint 5

- Visit log (check-in / check-out per dealer)
- Next-visit scheduling and cadence rules
- Visit-based sort on dealer cards
- Visit history feed

---

## Files Modified

| File | Change |
|---|---|
| `src/pages/CoachDashboard.tsx` | Full redesign |
| `src/integrations/supabase/types.ts` | Regenerated after migration |
| New migration | `coach_notes` table + RLS |
