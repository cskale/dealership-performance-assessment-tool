# Coach Briefing Pack — Full-Width Two-Column Redesign

**Date:** 2026-05-29  
**Status:** Approved for implementation  
**Scope:** `src/components/coach/DealerPanel.tsx` + `src/pages/CoachDashboard.tsx`  
**Owner:** Claude Code (full rewrite of DealerPanel layout + CoachDashboard wiring fix)

---

## Problem

1. `DealerPanel` uses `Dialog max-w-2xl` — renders as a narrow (~672px) box that appears off-centre on wide viewports. User describes this as "opening on the right hand side."
2. The `BriefingTab` layout is a vertical data-dump — not a command-centre view.
3. `CoachDashboard.tsx` has unstaged changes that **deleted** the DealerPanel state variables and render block while leaving the button `onClick` handlers that call the deleted setters — silently broken.

---

## Goal

Replace the narrow dialog with a full-width two-column command-centre modal, matching the user-provided mockup. Fix the CoachDashboard wiring breakage.

---

## Design

### Container

```
Dialog: w-[95vw] max-w-7xl h-[90vh] flex flex-col gap-0 p-0 overflow-hidden
```

- Centered in viewport (default Dialog behaviour)
- Scrolls the two-column body independently
- Header and tab strip are sticky / non-scrolling

### Header (full width, non-scrolling)

```
+─────────────────────────────────────────────────────────────────────────────+
│  [Brand logo]  CSK Demo Dealership  📍 Munich · Volkswagen    47  Developing │
│  ──────────────────────────────────────────────────────────────────────────  │
│  Overall Score: 47     Active Actions: 5     Critical Gaps: 2     Next Visit: 21 May │
+─────────────────────────────────────────────────────────────────────────────+
```

- Row 1: dealer name (left) + score number + score band badge (right)
- Row 2: 4-stat chips — Overall Score / Active Actions / Critical Gaps / Next Visit
  - Active Actions = `data.focusActions.length`
  - Critical Gaps = depts with score < 46 (count from `assessmentScores`)
  - Next Visit = upcoming visit date formatted `dd MMM yyyy`, or "None scheduled"

### Two-column body (flex-row, both cols scroll independently)

**Left column** (`flex-1 min-w-0 overflow-y-auto border-r border-border`):

```
TOP FOCUS ACTIONS
┌──────────────────────────────────────────┐
│ ⚠ Implement Lead Management Protocol  DUE IN 12 DAYS │
│   Response time for digital leads...                   │
│   [NEW VEHICLE SALES]  Sales Manager    Open Steps > │
├──────────────────────────────────────────┤
│ ▣ Workshop Capacity Audit & Overtime Freeze  HIGH PRIORITY │
│   ...                                                  │
└──────────────────────────────────────────┘

─── Tabs ──────────────────────────────────────────────
  Activity Log  |  Visit History  |  Coach Notes   🔍
──────────────────────────────────────────────────────
  [tab content scrolls here]
```

- "Top Focus Actions" section shows top 3 `focusActions`, each as a card with:
  - Priority icon (⚠ red = critical/high, ▣ orange = medium)
  - Title + due-date badge (if `target_completion_date` within 14 days: "DUE IN X DAYS" red; else "HIGH PRIORITY" orange)
  - First line of action description (not currently in data — show `action_title` only, no truncation)
  - Department tag chip + "Open Steps →" link (navigates to `/app/results/:assessmentId`)
  - Stale warning if `daysStale > 14`
- Tab strip: `Activity Log` | `Visit History` | `Coach Notes` (search input placeholder — no-op for now)
- Activity Log tab = existing `ActivityTab` content (feed + compose box)
- Visit History tab = existing `VisitsTab` content
- Coach Notes tab = notes-only filtered feed + compose box (no visit/assessment entries)

**Right column** (`w-80 shrink-0 overflow-y-auto p-4 space-y-4`):

Card 1: **Department Health**
```
DEPARTMENT HEALTH
  New Vehicle Sales ──────────── 49  ▼ -23  [Developing]
  Used Vehicle Sales ─────────── 48  ▼ -22  [Developing]
  Service Performance ────────── 52  ▼ -18  [Developing]
  Parts Inventory ────────────── 61  ▲ +1   [Progressing]
  Financial Operations ───────── 45  ▼ -25  [Foundational]

  [Full Assessment →]
```
- Each row: dept name (truncate w-28) | score bar (flex-1, h-1.5, colour-banded) | score | gap vs benchmark (▲/▼) | status chip
- Status chip: score ≥75 = "Performing" (green), 46–74 = "Developing" (amber), <46 = "Foundational" (red)
- Gap: `score - benchmark` where benchmark from `STATIC_BENCHMARKS[sectionToModuleCode(sectionId)]?.meanScore ?? 70`
- "Full Assessment →" navigates to `/app/results/:latestAssessmentId` (disabled if null)

Card 2: **Upcoming Visit**
```
UPCOMING VISIT
  Q2 Strategic Review
  📅 21 May 2026 · 09:00 AM     [SCHEDULED]
  📍 (visit_notes if any)
  👥 (visit_type if any)
  [Confirm]  [Modify]
```
- If `upcomingVisit` exists: show date, status badge, notes preview, visit type
- "Confirm" = mark as confirmed (only if status = proposed); "Modify" = switch to Visit History tab
- If no upcoming visit: muted text + "Schedule →" link switches to Visit History tab

Card 3: **Staleness Insight** (conditional — dark card)
```
[dark bg, INSIGHT badge]
⚡ High Staleness Risk
  Assessment data is X days old. Consider scheduling a reassessment.
  [Request Reassessment →]
```
- Show only if `latestDate` is >60 days ago (or null)
- "Request Reassessment →" navigates to `/app/results/:latestAssessmentId` (or disabled if null)

---

## Component Architecture

All new sub-components remain **inside `DealerPanel.tsx`** (no new files):

| New sub-component | Replaces | Notes |
|---|---|---|
| `TopFocusActionsCard` | Part of `BriefingTab` | Rendered above tabs in left col |
| `DeptHealthCard` | `BriefingTab` dept section | Right sidebar card 1 |
| `UpcomingVisitCard` | `BriefingTab` upcoming section | Right sidebar card 2 |
| `InsightCard` | (new) | Right sidebar card 3, conditional |
| `CoachNotesTab` | (new, extracted) | Notes-only tab from ActivityTab |

**`BriefingTab` component**: deleted — content redistributed.

**Tab order change**: `['activity', 'visits', 'notes']` (was `['activity', 'visits', 'briefing']`). The `initialTab` prop default becomes `'activity'`. CoachDashboard buttons are updated accordingly.

**`DealerPanelProps`**: no interface changes — same props.

---

## CoachDashboard.tsx fixes

1. Restore import: `import { DealerPanel } from '@/components/coach/DealerPanel';`
2. Restore 3 state vars:
   ```tsx
   const [panelOpen, setPanelOpen] = useState(false);
   const [panelDealer, setPanelDealer] = useState<AssignedDealer | null>(null);
   const [panelInitialTab, setPanelInitialTab] = useState<'activity' | 'visits' | 'notes'>('activity');
   ```
3. Restore DealerPanel render after dealer grid (with full `onVisitSaved` handler that re-fetches `coach_visits`)
4. Update 3 ghost buttons: Notes → `'activity'`, Visits → `'visits'`, Briefing → `'activity'` (briefing tab gone, activity is the default)
5. Make dealer card itself clickable (cursor-pointer, onClick sets panelDealer + open). "Enter Dealership →" button gets `e.stopPropagation()`.

---

## Data: no new queries

All data already in `PanelData`:
- `assessmentScores` → dept health
- `focusActions` → top focus actions card
- `visits` → upcoming visit card + visit history tab
- `notes` → activity + coach notes tab
- `completedAssessments` → staleness insight (use `latestDate` prop from parent)

One derived computation added: `criticalGaps` = count of depts where `assessmentScores[dept] < 46`.

---

## Constraints

- Do NOT install new npm packages
- Do NOT change data fetching, Supabase queries, or props
- Do NOT edit `ScoreGauge`, `VisitLogSheet`, `getScoreBand`, `computeTrend`, `STATIC_BENCHMARKS`, `sectionToModuleCode`, `getDepartmentName`
- Existing TypeScript types unchanged — no new interfaces needed
- Mobile (<768px): right sidebar stacks below left column (flex-col breakpoint)

---

## Spec self-review

- No TBDs or placeholders — all sections resolved
- Architecture consistent with existing DealerPanel component structure
- Scope: single file rewrite (`DealerPanel.tsx`) + small wiring fix (`CoachDashboard.tsx`)
- No ambiguous requirements — layout, data mapping, and component boundaries all specified
