# Coach UI Overhaul — Design Spec

**Date:** 2026-05-23  
**Status:** Approved for implementation

## Problem

The coach dashboard cards and dialogs lack visual consistency and professionalism:
- Dealer cards have a small score gauge crowded by secondary information
- Four separate dialogs (Notes, Visits, Briefing, VisitLog) use different sizes (`max-w-md`, `max-w-lg`) and visual patterns
- Visit history expands inline inside the card, creating clutter
- No unified activity feed — notes have no Jira-style timeline

## Goal

Redesign the coach-facing UI to match enterprise tool quality (Jira-level):
1. Cleaner dealer cards where the score is the visual hero
2. One unified centred dialog per dealer replacing all four current dialogs
3. Jira-style activity feed (notes + visit events + assessment events)

---

## Section 1 — Dealer Card Redesign

**File:** `src/pages/CoachDashboard.tsx` (the inline card JSX, lines ~966–1214)

### Layout

```
┌─────────────────────────────────────────────┐  ← 3px brand-color top border
│  [Brand logo]            [Status badge]      │
│  Dealer Name                                 │
│  📍 Location · Nd ago                         │
├──────────────────────────────────────────────┤
│          ┌──────────────────┐                │
│          │       47         │  ↑ +6          │
│          │      /100        │                │
│          └──────────────────┘                │
│  ████████████░░  8/8 on track · 0 overdue    │  ← text-xs muted
│  📅 Next visit: 31 May · proposed            │  ← text-xs
├──────────────────────────────────────────────┤
│  [Notes]  [Visits]  [Briefing]  │ Enter →   │
└──────────────────────────────────────────────┘
```

### Rules

- Score gauge: `~120px` diameter, centred, occupies 50–60% of card body height
- Trend indicator (`↑ +6` / `↓ -3`) sits beside the gauge
- Action plan: single line, `text-xs`, muted colour — supporting data not headline
- Visit chip: `text-xs`, below action plan line
- Bottom row: three clearly-labelled text buttons (`Notes`, `Visits`, `Briefing`) each open the unified panel on the corresponding tab. `Enter Dealership →` remains as full primary button.
- **Remove** the inline History expansion entirely (no toggle, no inline panel)
- Counter-proposal and declined-visit badges remain below the visit chip

---

## Section 2 — Unified Dealer Dialog

**New file:** `src/components/coach/DealerPanel.tsx`  
**Replaces:** `CoachNoteSheet`, `VisitSheet`, `VisitBriefingSheet` (all deleted)  
**Keeps:** `VisitLogSheet` (opens as nested dialog from within Visits tab)

### Structure

```
┌─────────────────────────────────────────────────────┐
│  📅  Dealer Name        [47] [Developing]      [✕]  │
│      📍 Location                                     │
├──────────────────────────────────────────────────────┤
│   Activity       Visits       Briefing               │
├──────────────────────────────────────────────────────┤
│                                                      │
│   [tab content — scrollable]                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Sizing

- `max-w-2xl` (672px) fixed — identical for every dealer
- `max-h-[80vh]` with internal tab body scroll
- Centred with backdrop overlay

### Props

```ts
interface DealerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: AssignedDealer;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  initialTab?: 'activity' | 'visits' | 'briefing';
  onVisitSaved: () => void;
  onNoteAdded: () => void;
}
```

`initialTab` lets the card buttons open the panel on the right tab directly.

### CoachDashboard wiring

Replace 4× `open/dealer` state pairs with one:
```ts
const [panelOpen, setPanelOpen] = useState(false);
const [panelDealer, setPanelDealer] = useState<AssignedDealer | null>(null);
const [panelInitialTab, setPanelInitialTab] = useState<'activity'|'visits'|'briefing'>('activity');
```

---

## Section 3 — Activity Tab

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [All] [Notes] [Visits] [Assessments]           ≡↓  │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │ Note type (optional)              ▼          │    │
│  │ Add a field note...                          │    │
│  │                               0/2000 [Save]  │    │
│  └─────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────┤
│  [CK]  Chetan Kale  added a note    12 hours ago     │
│        [NOTE] [Follow-Up]                            │
│        Is it done?                              [🗑] │
├──────────────────────────────────────────────────────┤
│  [SYS] System  visit completed      21 May 2026      │
│        [VISIT]                                       │
│        Phone · Used Vehicle Sales, New Vehicle Sales │
│        Discussed the new action plan…                │
├──────────────────────────────────────────────────────┤
│  [SYS] System  assessment completed  20 May 2026     │
│        [ASSESSMENT]                                  │
│        Overall score: None → 47                      │
└─────────────────────────────────────────────────────┘
```

### Event model

Activity entries are derived client-side by merging three data sources (no new DB table):

| Source | Event label | Avatar |
|--------|-------------|--------|
| `coach_notes` row | "added a note" | Coach initials — brand-colour circle |
| `coach_visits` row (any status) | "proposed a visit for [date]" | `SYS` grey circle |
| `coach_visits` where `status=completed` | "visit completed" | `SYS` grey circle |
| `assessments` where `status=completed` | "assessment completed" | `SYS` grey circle |

All entries sorted descending by `created_at` / `visit_date`.

### Entry anatomy

```
[Avatar]  [Actor name bold]  [action text regular]   [timestamp muted]
          [TYPE badge]  [optional secondary badge]
          [content text — note body / visit summary / score change]
          [delete icon — notes only, right-aligned]
```

- Coach avatar: 2-letter initials, `bg-brand-500`, `text-white`, 32px circle
- System avatar: "SYS", `bg-muted`, `text-muted-foreground`, 32px circle
- Type badges: `NOTE` / `VISIT` / `ASSESSMENT` — outlined, `text-[10px]` uppercase
- Timestamp: `formatDistanceToNowStrict` for notes; `format(date, 'dd MMM yyyy')` for system events

### Filter tabs

`All | Notes | Visits | Assessments` — client-side filter on the merged array, no refetch.

### Compose box

- Note type dropdown (Observation / Action / Follow-up) — optional
- Textarea, 2000 char limit with counter
- Save button — disabled until text entered
- On save: inserts to `coach_notes`, prepends to feed optimistically, calls `onNoteAdded`

---

## Section 4 — Visits Tab

### Layout

```
UPCOMING
┌────────────────────────────────────────────────┐
│  31 May 2026                      [Proposed]   │
│  ✕ Cancel visit                                │
└────────────────────────────────────────────────┘

PAST VISITS
┌────────────────────────────────────────────────┐
│  26 May 2026                      [Cancelled]  │
├────────────────────────────────────────────────┤
│  21 May 2026  [Phone]  3 modules  [Completed]  │
│  Discussed the new action plan follow up…      │
│                         [↓ Report]  [Edit log] │
└────────────────────────────────────────────────┘

[+ Propose New Visit]  ← expands inline calendar
```

### Behaviour

- "Propose New Visit" expands an inline section (shadcn `Calendar` + optional notes textarea + `Propose` button) — no nested dialog
- Counter-proposal banner appears above the upcoming visit row when `status=counter_proposed`
- "Edit log" / "Log session" opens `VisitLogSheet` as a Dialog stacked over the panel
- "↓ Report" triggers `downloadVisitReport` (existing logic, unchanged)
- On visit saved: calls `onVisitSaved` prop, refetches visit list

---

## Section 5 — Briefing Tab

Content identical to existing `VisitBriefingSheet`. Layout cleaned up to match new design language.

### Sections (top to bottom)

1. Assessment context line: `Assessment 20 May 2026 · Overall 47/100`
2. **Dept scores vs benchmark** — horizontal bar per dept, score number, gap delta (▼ -23 red / ▲ +5 green)
3. **Focus actions** — top 3 open actions, priority badge right-aligned
4. **Last visit** — date, type badge, modules, summary. "View history →" button switches to Visits tab.
5. **Upcoming visit** — date + status badge. "Schedule →" switches to Visits tab if none.

### Cross-tab navigation

- "View history →" → `setActiveTab('visits')`
- "Add note →" → `setActiveTab('activity')` + focus compose box
- "Schedule →" → `setActiveTab('visits')` + expand propose form

No `onOpenHistory` / `onOpenVisit` / `onOpenNotes` callbacks needed — handled internally.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/CoachDashboard.tsx` | Dealer card JSX rewrite; replace 4 sheet states with 1 panel state; mount `DealerPanel` once |
| `src/components/coach/DealerPanel.tsx` | **New** — unified dialog with Activity / Visits / Briefing tabs |
| `src/components/coach/CoachNoteSheet.tsx` | **Delete** — replaced by Activity tab inside DealerPanel |
| `src/components/coach/VisitSheet.tsx` | **Delete** — replaced by Visits tab inside DealerPanel |
| `src/components/coach/VisitBriefingSheet.tsx` | **Delete** — replaced by Briefing tab inside DealerPanel |
| `src/components/coach/VisitLogSheet.tsx` | **Keep** — opens as nested Dialog from Visits tab |

---

## Non-goals

- No new DB tables or migrations
- No changes to scoring, assessments, or action plan logic
- No changes to OEM dashboard or dealer dashboard
- No i18n changes (EN strings only in this sprint)
- No changes to `VisitLogSheet` internals
