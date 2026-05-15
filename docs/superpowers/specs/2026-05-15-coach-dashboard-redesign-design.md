# Coach Dashboard Redesign
**Date:** 2026-05-15
**Status:** Approved — ready for implementation
**Owner:** Claude Code
**Scope:** `src/pages/CoachDashboard.tsx` only. No other pages, no schema changes, no new npm packages.

---

## Context

Sprint 4/5 delivered a functional coach dashboard — dark stats bar, dealer cards, actions tab, notes feed, visit scheduling, score trend chart, resources tab. All data logic is correct and stays.

This sprint is a full visual redesign using the **dealer dashboard** (`/app/dashboard`) as the design template, adapted for multi-dealer coaching context. Cherry-picked visual elements from Stitch mockups: OEM brand logos, circular score gauges, action plan progress bars, richer action status display.

**Deferred to future sprints:**
- Network Pattern Detection (cross-dealer signal intelligence)
- `CoachActions.tsx` redesign
- Full interactive map view (requires new package confirmation)

---

## What Does NOT Change

- All data-fetching logic — `fetchAssignments`, `fetchNotes`, `computeStatsBar`, `computeTrend`, `getScoreBand`, `isOverdue`, `isDueSoon`, `daysSince`
- `CoachNoteSheet` component — kept as-is
- `VisitSheet` component — kept as-is
- Resources tab content — `ResourceKpiPanel` + `ResourcePlaybookPanel` unchanged
- Score trend chart — recharts `LineChart` unchanged
- Routing — `/app/coach-dashboard` stays
- No new npm packages
- No Supabase schema changes
- No new DB queries (all data already in state)

---

## Brand Colour System

Applied to card top border, brand chip background/text, and dealer logo fallback:

| Brand (case-insensitive match) | Accent hex | Clearbit domain |
|---|---|---|
| BMW | `#1C69D4` | `bmw.com` |
| Mercedes / Mercedes-Benz | `#2D3035` | `mercedes-benz.com` |
| Audi | `#BB0A21` | `audi.com` |
| Volkswagen / VW | `#003399` | `volkswagen.com` |
| Toyota | `#EB0A1E` | `toyota.com` |
| Ford | `#003087` | `ford.com` |
| Default (any other) | `hsl(var(--brand-500))` | — (initials fallback only) |

**OEM logo:** `<img src="https://logo.clearbit.com/{domain}" width="24" height="24" />` — no package required. On `onError`, replace with a `<div>` showing brand initials (first 2 chars, uppercase) styled with accent colour background at 15% opacity.

**Brand chip:** `px-2 py-0.5 rounded-full text-[10px] font-semibold` with `background: {accent}18` (10% opacity) and `color: {accent}`.

---

## Helper: `getBrandStyle(brand: string)`

New pure utility function at top of `CoachDashboard.tsx` (not exported):

```ts
const BRAND_MAP: Record<string, { accent: string; domain: string }> = {
  bmw:             { accent: '#1C69D4', domain: 'bmw.com' },
  mercedes:        { accent: '#2D3035', domain: 'mercedes-benz.com' },
  'mercedes-benz': { accent: '#2D3035', domain: 'mercedes-benz.com' },
  audi:            { accent: '#BB0A21', domain: 'audi.com' },
  volkswagen:      { accent: '#003399', domain: 'volkswagen.com' },
  vw:              { accent: '#003399', domain: 'volkswagen.com' },
  toyota:          { accent: '#EB0A1E', domain: 'toyota.com' },
  ford:            { accent: '#003087', domain: 'ford.com' },
};

function getBrandStyle(brand: string) {
  const key = brand.toLowerCase().trim();
  return BRAND_MAP[key] ?? { accent: 'hsl(var(--brand-500))', domain: null };
}
```

---

## Helper: `ScoreGauge` component

Inline SVG arc gauge — no library. Renders inside dealer cards.

```tsx
function ScoreGauge({ score, accent }: { score: number; accent: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={accent} strokeWidth="6"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
        {Math.round(score)}
      </text>
    </svg>
  );
}
```

Band → accent colour mapping (reuse `getScoreBand` output):
- ≥85 → `#16a34a` (green, Advanced)
- ≥70 → `#2563eb` (blue, Performing)
- ≥46 → `#d97706` (amber, Developing)
- <46  → `#dc2626` (red, Foundational)

---

## Section 1: Sticky Top Strip

```
h-9  bg-[#0b1f3a]  sticky top-0 z-10  flex items-center px-6
```

Four chips separated by `border-r border-white/[0.08]`:

| Label | Value |
|---|---|
| Dealers | `dealers.length` |
| Avg Score | mean of `latestScore` (exclude nulls), or `—` |
| Overdue Actions | `allActions.filter(isOverdue).length` |
| Critical Gaps | `dealers.filter(d => (d.latestScore ?? 101) < 46).length` |

No change from current implementation — label rename only ("Attention Needed" → "Critical Gaps").

---

## Section 2: Page Header

```
COACHING PERSPECTIVE · Q2 2026          [↓ Export Report]  ← ghost button, no-op for now
Field Performance Dashboard
Active monitoring for assigned dealer portfolio
```

`Q2 2026` derived from `new Date()` — compute current quarter label client-side.

Export Report button: `variant="outline"` with download icon. No-op (console.log) for now — wired in a future sprint.

---

## Section 3: Dark Hero Card

Full-width card, `bg-[#0b1f3a]` background, `rounded-xl`, 3-column grid.

### Col 1 — Portfolio Score

```
OVERALL PORTFOLIO SCORE
[large number]  / 100
[progress bar — full width, accent colour fill]
● [Maturity band label]

"[narrative — 1 sentence]"
```

- Large number: `computeStatsBar(dealers).avgScore` or `—`
- Progress bar: `w-full h-1.5 bg-white/10 rounded-full` with fill at `avgScore%`
- Maturity band: same `getScoreBand` thresholds, white text
- Narrative: simple computed string:
  - avgScore ≥ 85 → `"Portfolio performing above benchmark across all departments."`
  - avgScore ≥ 70 → `"Most dealers performing well — {n} below benchmark threshold."`
  - avgScore ≥ 46 → `"{n} dealers require active intervention this quarter."`
  - else → `"{n} dealers at foundational level — priority coaching required."`
  - where `n` = `dealers.filter(d => (d.latestScore ?? 101) < 70).length`

### Col 2 — Active Actions

```
OPEN ACTIONS
[large count]
items requiring attention

• [dealer name]: [action_title] — due [date]   ← top 2 overdue, truncated
• [dealer name]: [action_title] — due [date]
```

- Count: `allActions.length`
- List: top 2 from `overdueActions` (sorted by `target_completion_date` ascending), text-white/70, `text-xs`
- If no overdue: "All actions on track ✓"

### Col 3 — Focus Dealer

```
FOCUS DEALER
[dealer name]
[score] · [maturity band]
[location]

"Needs immediate attention"   ← if score < 46
"Monitor closely"             ← if score < 70
```

- Focus dealer = `dealers` sorted by `latestScore` ascending, first with non-null score
- If all null: "No assessments yet"

---

## Section 4: Timeline Strip

5 equal-width cards in a horizontal flex row (scrollable on mobile). Exact dealer dashboard pattern.

| Slot | Label | Value | Sub-text | Status chip |
|---|---|---|---|---|
| 1 | Last Visit | Most recent `coach_visits` date (`dd MMM yyyy`) or "Not scheduled" | Dealer name | `● Completed` (green) / `○ Not scheduled` (muted) |
| 2 | Next Visit | Next future `coach_visits` date or "Not scheduled" | Dealer name | `● Confirmed` / `● Proposed` / `○ Not scheduled` |
| 3 | Assessments Due | Count of dealers with `latestDate` null OR `daysSince > 90` | "dealers need assessment" | `● Attention` (amber if >0) / `✓ All current` (green) |
| 4 | Overdue Actions | `overdueActions.length` | "high priority" if any critical | `● Critical` (red if >0) / `✓ On track` (green) |
| 5 | Action Plan Review | Hardcoded "30 Jun {year}" for now | "End of quarter · all departments" | `○ Upcoming` (blue) |

Data: slots 1–2 use `activeVisitsByDealer` map + a new `nextVisit` derived from `coach_visits` query (already fetched — pick first future date). Slots 3–4 from existing state.

---

## Section 5: Network Tabs + Controls

No change to logic. Visual: tabs move above the sort/filter row.

```
[All Networks]  [BMW Network]  [Audi Tier 1]     ← pill tabs, brand accent on active
────────────────────────────────────────────────
[↕ Score | Name | Overdue]    [Filter: All ▾]   [View Map →]
```

**View Map →**: anchor tag, `target="_blank"`, href constructed as:
```
https://www.google.com/maps/search/?api=1&query={encoded dealer locations joined by " | "}
```
Built client-side from `filteredDealers.map(d => d.location).join(' | ')`.

---

## Section 6: Dealer Portfolio Grid

3-col grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`). Stagger animation unchanged.

### Card anatomy

```
┌─────────────────────────────────────────────────┐
│  [3px top border — brand accent colour]          │
├─────────────────────────────────────────────────┤
│  [OEM logo 24px]  [Brand chip]      [Maturity]  │
│                                                  │
│  Dealer Name (font-semibold text-base)           │
│  📍 Location, Country                           │
├─────────────────────────────────────────────────┤
│  [ScoreGauge 72px]    ACTION PLAN               │
│                       ████████░░  12 / 14       │
│                       3 overdue   ← red text    │
├─────────────────────────────────────────────────┤
│  📅 Next visit: 12 Jun · Confirmed              │  ← green if confirmed, amber if proposed
│     No visit scheduled                          │  ← muted if none
├─────────────────────────────────────────────────┤
│  [🗒 note]  [📅 visit]              [Enter Dealership →] │
└─────────────────────────────────────────────────┘
```

**Top border:** `style={{ borderTop: \`3px solid ${getBrandStyle(dealer.brand).accent}\` }}`

**OEM logo:**
```tsx
<img
  src={`https://logo.clearbit.com/${getBrandStyle(dealer.brand).domain}`}
  width={24} height={24}
  className="rounded-sm object-contain"
  onError={e => { /* replace with initials div */ }}
/>
```
Initials fallback: `<div style={{ background: accent+'26' }} className="w-6 h-6 rounded-sm flex items-center justify-center text-[9px] font-bold" style={{ color: accent }}>{brand.slice(0,2).toUpperCase()}</div>`

**Brand chip:** `getBrandStyle(dealer.brand).accent` for colours.

**Maturity badge:** existing `getScoreBand()` labels — right-aligned, small, coloured.

**Score gauge:** `<ScoreGauge score={dealer.latestScore} accent={bandAccent} />` — if null, show "No assessment" text placeholder.

**Action plan progress:**
- Fraction: `dealer.openCount` as denominator proxy. Numerator: `dealer.openCount - dealer.overdueCount` (completed-ish). Display as `{openCount - overdueCount} / {openCount}` if openCount > 0, else "No actions".
- Progress bar: `w-full h-1.5`, fill = `((openCount - overdueCount) / openCount) * 100%`
- Overdue line: if `overdueCount > 0` → `<p className="text-xs text-[#dc2626]">{overdueCount} overdue</p>`

**Visit chip:** `activeVisitsByDealer.get(dealer.dealershipId)` — same data as current, restyled as `text-xs font-medium` with green (confirmed) or amber (proposed) dot.

**Note + Visit icon buttons:** unchanged from current.

**"Enter Dealership →":** replaces "View Results →". Same navigation target (`/app/results/:latestAssessmentId`). Disabled state if no assessment.

**No assessment state:** ScoreGauge area → "No assessment yet" muted text. CTA → "Start Assessment" (disabled, grey).

---

## Section 7: Network Actions Requiring Attention

Full-width card. Header:

```
Network Actions Requiring Attention      [≡ Filter ▾]  [↓ Export List]    View all in Action Tracker →
```

"View all in Action Tracker →" navigates to `/app/coach-actions`.

Export List: `variant="outline"` size="sm" — no-op for now (future sprint).

### Tabs (unchanged logic)

```
Overdue (N)  |  Stale (N)  |  All Open (N)
```

### Table columns

```
PRIORITY | DEALERSHIP           | DIAGNOSTIC ACTION ITEM | DEPARTMENT  | DUE DATE      | STATUS
```

**Priority:** coloured dot only — `●` red (critical), `●` amber (high), `●` blue (medium), `○` grey (low).

**Dealership cell:** `<img>` Clearbit logo 16px + dealer name (font-medium) + location (text-xs muted). Click → `/app/results/:assessmentId`.

**Diagnostic Action Item:** `action_title` (font-medium) — no truncation.

**Department:** small chip tag — existing colours.

**Due Date:**
- Past → `text-[#dc2626] font-semibold` + "Overdue (Nd)"
- Within 3 days → `text-[#d97706] font-medium`
- Otherwise → `text-muted-foreground`

**Status badge** — pure client-side display mapping, no DB change:

| Condition | Display | Style |
|---|---|---|
| `daysStale >= 21` AND overdue | BLOCKED | solid red |
| `daysStale >= 14` AND overdue | STALLED | red-muted |
| `status === 'In Progress'` | IN PROGRESS | amber |
| `status === 'Open'` | ASSIGNED | blue |

**Footer:** `Showing {min(items.length, pageSize)} of {items.length} active actions across portfolio` + `‹ ›` pagination arrows (client-side, 10 per page).

**Empty state per tab:** descriptive message + icon (unchanged from current).

---

## Section 8: Field Notes

Header restyled to match Section 7 pattern:

```
Field Notes                    [Dealer filter ▾]    [+ New Note]
```

Feed rows: dealer name chip uses brand accent colour from `getBrandStyle(dealer.brand).accent` instead of generic `hsl(var(--brand-500))`. All other logic unchanged.

---

## Section 9: Score Trend Chart

Moved to bottom (already in current order). Header restyled:

```
Score Trend
Select up to 3 dealers to compare performance over time
```

Dealer selector checkboxes: colour dot uses `CHART_COLORS[i]` unchanged. No other changes.

---

## Section 10: Resources Tab

Completely unchanged — `ResourceKpiPanel` + `ResourcePlaybookPanel` as-is.

---

## Files Modified

| File | Change |
|---|---|
| `src/pages/CoachDashboard.tsx` | Full redesign — all changes in this one file |

No migrations. No new packages. No type regeneration needed.

---

## Implementation Notes

- All new helper functions (`getBrandStyle`, `ScoreGauge`) defined at top of `CoachDashboard.tsx`, not exported.
- Clearbit logo requests are fire-and-forget — `onError` fallback handles any 404s silently.
- `View Map →` Google Maps URL built from `filteredDealers` — updates reactively when network filter changes.
- Quarter label: `const quarter = Math.ceil((new Date().getMonth() + 1) / 3); const year = new Date().getFullYear();` → `Q${quarter} ${year}`.
- Export Report button wired to `console.log` placeholder — noted for future sprint.
- Export List button same placeholder.
- No changes to `CoachNoteSheet`, `VisitSheet`, or any component outside `CoachDashboard.tsx`.
