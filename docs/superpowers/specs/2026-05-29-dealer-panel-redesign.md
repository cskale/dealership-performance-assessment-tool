# DealerPanel Redesign Spec
**Date:** 2026-05-29  
**Status:** Approved

## Problem

The DealerPanel dialog has four concrete bugs:

1. **No hero/body visual differentiation.** The stats row (Overall Score, Active Actions, Critical Gaps, Next Visit) is plain text chips in a white header — visually indistinguishable from the body content below.
2. **Department health badges overflow.** "Developing" / "Foundational" badges clip outside the sidebar card boundary because the right-side flex container is `shrink-0` in a 256px-wide inner space.
3. **"Top Focus Actions" is static content, not a summary metric.** Hero section should show action _counts_ (Pending / In Progress / Completed) — actual action cards belong in the tab body only.
4. **Tab content (Activity, Visit History, Coach Notes) lacks visual clarity.** Entries have low contrast; tab strip underline is thin and easy to miss.

## Design Standard

Match the exact design system used in dealer and coach dashboards:

- **Hero:** `bg-[#0b1f3a]` dark card, `text-white`, 4 columns, `border-r border-white/10` separators
- **Labels:** `text-[10px] uppercase tracking-[0.1em] text-white/50`
- **Metrics:** `text-5xl font-extrabold` (score), `text-3xl font-bold` (counts)
- **Progress bar:** `h-[5px] rounded-full bg-white/10` fill with gradient
- **Maturity badge:** inline `bg-[rgba(...)]/20` pill
- **Body cards:** `rounded-xl border border-border` on white/light bg

## Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ DialogHeader (dark hero — bg-[#0b1f3a])                                    │
│                                                                            │
│  Dealer Name  ⊙ Munich                                          [X close]  │
│                                                                            │
│  OVERALL SCORE  │  ACTIONS STATUS    │  NEXT VISIT      │  CRITICAL GAPS  │
│  47 /100        │  2  Pending        │  31 May 2026     │  1              │
│  ████░░░        │  1  In Progress    │  [Proposed]      │  dept <46       │
│  [Developing]   │  5  Completed      │  Schedule →      │                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

  [Activity Log]  [Visit History]  [Coach Notes]    ← pill-style active tab
  ─────────────────────────────────────────────

  LEFT COLUMN (flex-1)                │  RIGHT SIDEBAR (w-80)
  ────────────────────────────────    │  ─────────────────────
  Scrollable tab content              │  Department Health card
  (no static focus-action block)      │  Upcoming Visit card
                                      │  Insight card (if stale)
```

## Data Changes

### New query in `fetchData`

Add a count query for all action statuses (not just open/in-progress):

```ts
// Count actions by status for this dealer's assessments
const { data: actionCountsData } = await supabase
  .from('improvement_actions')
  .select('status')
  .in('assessment_id', assessmentIds);

const actionCounts = {
  pending: actionCountsData?.filter(a => a.status === 'Open').length ?? 0,
  inProgress: actionCountsData?.filter(a => a.status === 'In Progress').length ?? 0,
  completed: actionCountsData?.filter(a => a.status === 'Completed').length ?? 0,
};
```

### Extended `PanelData` interface

```ts
interface PanelData {
  notes: CoachNote[];
  visits: CoachVisit[];
  assessmentScores: Record<string, number>;
  focusActions: FocusAction[];           // kept for tab body use
  completedAssessments: CompletedAssessment[];
  actionCounts: { pending: number; inProgress: number; completed: number };
}
```

## Component Changes

### 1. Hero section (DialogHeader)

**Replace current:** plain white header with chip row.

**With:** `bg-[#0b1f3a] text-white px-6 py-5` grid, 4 columns with `border-r border-white/10` separators. Close button stays top-right.

Columns:
| Col | Label | Content |
|-----|-------|---------|
| 1 | OVERALL SCORE | `text-5xl` score + `/100`, progress bar, maturity badge |
| 2 | ACTIONS | `text-3xl` pending count + supporting row of in-progress + completed counts |
| 3 | NEXT VISIT | Date string or "None scheduled" + status badge + Schedule link |
| 4 | CRITICAL GAPS | Count of depts with score <46 + "dept(s) below benchmark" label |

Dealer name + location stays above the grid as `text-lg font-semibold text-white` row.

### 2. Tab strip

**Replace:** thin underline tabs.

**With:** pill-style active state — `bg-white/10 text-white rounded-full px-4 py-1.5` for active, `text-white/50` for inactive. Strip `bg-[#0b1f3a]` or `bg-muted` depending on transition feel — use `bg-background border-b border-border` strip, pills inside.

### 3. `DeptHealthCard` overflow fix

**Replace:** single-row flex per department (dept name + score + gap + badge all in one line).

**With:** two-row layout per department:
- Row 1: `flex justify-between` — dept name (left) + score + delta (right)
- Row 2: progress bar (full width) + badge (`flex-shrink-0 ml-auto` or `mt-1`)

Badge gets its own row so it never clips.

### 4. Remove `TopFocusActionsCard` from above-tab position

The static focus action cards currently render above the scrollable tab area (non-scrolling, always visible). Remove this position. Focus actions are already visible in the Activity tab feed. The hero now shows counts.

### 5. Tab content polish (Lovable)

Hand to Lovable via MCP:
- **ActivityTab:** improve entry card padding, avatar color contrast, timestamp alignment
- **CoachNotesTab:** compose box border/shadow, note entry card polish  
- **VisitsTab:** past visits list card spacing, status badge visibility

## Split of Ownership

| Task | Owner |
|------|-------|
| `fetchData` action count query | Claude Code |
| `PanelData` interface extension | Claude Code |
| Hero section rewrite (dark card) | Claude Code |
| Tab strip pill-style | Claude Code |
| `DeptHealthCard` 2-row layout | Claude Code |
| Remove `TopFocusActionsCard` from above-tab | Claude Code |
| Activity/Notes/Visits tab content polish | Lovable MCP |

## Success Criteria

- Hero visually matches dealer/coach dashboard dark card aesthetic
- Action count metrics (pending/in-progress/completed) shown in hero
- No dept health badge clipping at any viewport within the dialog
- Tab strip active state is visually clear
- Tab content entries are readable at normal dialog size
- No new TypeScript errors
- No React hook rule violations
