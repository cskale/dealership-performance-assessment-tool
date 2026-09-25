# Lovable handoff: Results redesign + monthly KPI check-ins

The backend, hooks, migration, RLS and i18n keys are done. Everything below is UI only.
Paste one prompt per Lovable message, **in order** (each depends on the one before it landing).

**Do not edit** these Claude-owned files (from `CLAUDE.md`) — import them as they are:
`src/data/questionnaire.ts`, `src/data/signalTypes.ts`, `src/data/signalMappings.ts`,
`src/lib/signalEngine.ts`, `src/components/assessment/KpiQuestionInput.tsx`,
`src/components/results/PerformanceDataPanel.tsx`, `src/lib/kpiCrossValidation.ts`,
`src/hooks/useKpiValues.ts`, `src/lib/playgroundCalculators.ts`,
`src/data/playgroundKpiMappings.ts`, `src/hooks/usePlaygroundPrefill.ts`,
`src/hooks/useCoachVisitLoop.ts`. Also do not edit `src/hooks/useKpiTimeline.ts`,
`src/lib/kpiTimeline.ts`, `src/lib/kpiForecast.ts`, `src/data/trackedKpis.ts`,
`src/hooks/useDealershipAssessments.ts`, `src/lib/kpiBenchmarks.ts`, or any Supabase migration.

## Two React Hook rules that matter here (both have caused production crashes before)

1. **Hook ordering**: never add `useState`/`useEffect`/`useMemo` after a conditional check or
   early `return` inside a component. Declare every hook unconditionally at the top of the
   component body. Violating this throws React error #300 and crashes the whole page at
   runtime — it does not fail at build time.
2. **`useMemo` ordering in `Results.tsx`**: any `useMemo`/derived `const` in `Results.tsx` must
   be declared *after* everything it references. Referencing a later `const` throws a
   temporal-dead-zone `ReferenceError` at runtime and blanks Results, History and Action Plans.
   If you add a new `useMemo` (e.g. for the hero band's "biggest lever"), put it after the
   `scores`/`benchmarks`/`answers` values it reads, not before.

Also: always import every UI component you use in JSX (`Badge`, `Button`, `Tooltip`, etc.).
A missing import passes TypeScript but throws a `ReferenceError` in the minified production
bundle, not in dev.

## Hook contract (all in place, all TanStack Query except `forecastKpi`/`trackedKpisFor` which are plain functions)

```ts
// src/hooks/useKpiTimeline.ts
useKpiTimelines(dealershipId: string | null | undefined)
  -> { data, isLoading, error } where data: Record<kpiKey, TimelinePoint[]>

useSaveKpiCheckin(dealershipId: string | null | undefined)
  -> { mutate, mutateAsync, isPending }
  mutate({ kpiKey: string, month: 'YYYY-MM-01', value: number })

// src/lib/kpiTimeline.ts
type TimelineSource = 'assessment' | 'checkin-dealer' | 'checkin-coach';
interface TimelinePoint { month: string; value: number; source: TimelineSource; enteredAt: string }

// src/lib/kpiForecast.ts
forecastKpi(history: { month: string; value: number }[], benchmark: KpiBenchmark) -> Forecast | null
interface Forecast {
  basedOnMonths: number;
  points: { month: string; value: number; low: number; high: number }[]; // next 1–3 months
  reachesTargetMonth: string | null;
  onTrack: boolean;
}
// null when <3 points, or a >3-month gap between consecutive points.

// src/data/trackedKpis.ts
type DepartmentKey = 'nvs' | 'uvs' | 'svc' | 'prt' | 'fin';
trackedKpisFor(dept: DepartmentKey) -> kpiKey[]
isTrackedKpi(key: string) -> boolean

// src/hooks/useDealershipAssessments.ts
useDealershipAssessments(dealershipId) -> { data, isLoading, error }
  data: { id, completed_at, created_at, overall_score }[], newest first, status='completed' only.
  Use this for the header assessment picker.

// src/lib/kpiBenchmarks.ts
STATIC_BENCHMARKS: Record<kpiKey, KpiBenchmark>   // synchronous, safe default
loadBenchmarks(): Promise<Record<kpiKey, KpiBenchmark>>  // DB-overridden, async, session-cached
interface KpiBenchmark { kpiKey, direction: 'higher-better'|'lower-better', target, warning, critical, unit }

// src/lib/kpiDefinitions.ts
KPI_LABELS: Record<string, { en: string; de: string }>   // human labels for kpiKey, keyed by kpiKey

// src/hooks/useActiveRole.tsx
useActiveRole() -> { actorType, uxRole, membershipRole, organizationId, dealerId, loading }
  actorType: 'dealer' | 'coach' | 'oem' | 'internal' | null   — use THIS for role gating, not uxRole
  membershipRole: 'owner' | 'admin' | 'member' | 'viewer' | null
```

### i18n keys already added (EN + all 4 other languages), no interpolation from `t()`

`t()` returns the raw string — placeholders like `{month}` are NOT replaced by `t()`. Replace
them yourself with `.replace('{month}', value)` etc. after calling `t()`.

```
results.tab.diagnosis           "Diagnosis"
results.hero.biggestLever        "Biggest lever"
results.hero.coverage             "{assessed} of 5 departments assessed · {answered}/{total} questions"
results.hero.readNarrative        "Read full narrative"
results.dept.notAssessed          "Not assessed — include in next assessment"
results.picker.label              "Assessment"
kpi.logMonth                      "Log {month}"
kpi.trendUnlocks                  "Trend unlocks after 2 check-ins"
kpi.projectionBasis               "Projection based on {n} months"
kpi.onTrack                       "On track to reach benchmark by {month}"
kpi.offTrack                      "Off track to reach benchmark"
kpi.enteredByCoach                "Entered by coach"
kpi.saveAsCheckin                 "Save as {month} check-in"
kpi.saved                         "KPI saved"
```

Existing keys you'll reuse: `results.tab.actionPlan`, `results.exportPDF`, `results.retakeAssessment`,
`results.ceiling.title`, `results.ceiling.noInsights` (drop the "activates at 55+" copy per prompt 1
below — a new `results.ceiling.*` string is fine to add if you need one, follow the existing naming).

## Colour rules (from `DESIGN.md`) — read before styling anything

- **Maturity/score-band colours encode status ONLY** (the dot on a department row, the maturity
  chip, the ladder's "you are here" marker). Never use them as decorative accents elsewhere.
  Canonical bands (must match exactly, do not use `>= 80`/`>= 60` anywhere):
  - Foundational 0–45 → `#dc2626` (red-600)
  - Developing 46–69 → `#d97706` (amber-600)
  - Performing 70–84 → `#2563eb` (blue-600)
  - Advanced 85–100 → `#16a34a` (green-600)
- **Everything else** (cards, borders, chart axes, non-status chips) uses the brand/neutral scale,
  not the score-band colours.
- KPI chart series colours: **actual value line = `brand-600`** (`#1e6ec8`), **benchmark band =
  `neutral-200`** (`#d4dde4`), **projection = dashed `brand-400`** (`#4fa8ff`).
- Recharts is already installed — use it for all new charts (sparkline, line + projection band).
  Don't add a new charting library.

## What's being removed from `src/pages/Results.tsx` (and its current children)

Verified by reading the current file — remove all of the following. Delete any component file
that has no remaining importer after these removals (check with a repo-wide import search before
deleting a file, since some are shared).

1. **The 4 top tiles** — `Results.tsx` lines ~450–514, the `grid grid-cols-2 md:grid-cols-4`
   block with "Card 1 — Overall Score", "Card 2 — Maturity Level", "Card 3 — Modules Assessed",
   "Card 4 — Assessment Coverage". Replaced by the hero band (prompt 2 below).
2. **The 4-tab `TabsList`/`TabsContent`** structure (`executive`, `kpi`, `maturity`, `action-plan`)
   → replaced by 2 tabs: `diagnosis` (default) and `action-plan`, with tab state in a `?tab=`
   query param.
3. Inside `ExecutiveSummary.tsx` (rendered in the old `executive` tab), remove:
   - `DepartmentHeatmap` (`src/components/results/DepartmentHeatmap.tsx`) — the KPI matrix.
   - `CausalChainDiagram` (`src/components/results/CausalChainDiagram.tsx`) — "Root-Cause
     Analysis" / "Shared Root Causes".
   - The "Key Diagnostic Findings" section (`ExecutiveSummary.tsx` ~line 288, comment
     `SECTION 1D`).
   - The "Department Performance" cards section (~line 431).
   - `ScoreDecomposition` (`src/components/results/ScoreDecomposition.tsx`) — "Score Breakdown" bar.
4. **The whole `maturity` tab**: `MaturityScoring` (`src/components/MaturityScoring.tsx`) and its
   import — this single component contains both the "Performance Gap Analysis" table and the
   "Development Roadmap" section, so removing the tab removes both.
5. The standalone `kpi` tab (KPI Analysis) — its content is replaced by KPI cards inside each
   department row (prompt 3), not kept as a separate tab.
6. `CeilingInsightsPanel` (`src/components/results/CeilingInsightsPanel.tsx`) is **kept**, but
   move it under "Excellence gaps" in the Diagnosis tab and only render it when
   `generateCeilingInsights(...)` returns insights — drop the current
   `results.ceiling.noInsights` "activates at 55+" placeholder copy entirely (no empty state).

Keep as-is, just relocate/restyle: `PerformanceDataPanel`, `ExportPDFModal`, `FreshnessBadge`,
`TierBadge`, the cross-validation alert cards driven by `evaluateCrossValidations()` from
`src/data/crossValidationRules.ts` (both `evaluateCrossValidations` and
`generateCeilingInsights` from `src/lib/ceilingAnalysis.ts` are computed via `useMemo` in
`Results.tsx` today — keep that pattern, just make sure the `useMemo`s stay declared after the
`scores`/`answers`/`benchmarks` consts they read, per the ordering rule above).

## Action Plan tab — visual changes only, zero behaviour changes

Everything in `src/components/ActionPlan.tsx` and `src/components/action-plan/KanbanBoard.tsx`
keeps working exactly as today: search, status filters, List/Kanban/Roadmap view switch, Add/Edit
action dialogs, the Filter panel, overdue detection, progress calculation, the completion banner.

**Do not replace `KanbanBoard.tsx`'s drag-and-drop.** It uses the native HTML5 Drag and Drop API
on purpose — do not swap in `@dnd-kit` or any other DnD library. Status updates go through
`handleKanbanStatusChange` in `ActionPlan.tsx` writing to `improvement_actions`; leave that wiring
alone.

Visual-only changes:
- Header: replace whatever summary row exists today with a progress ring + quiet stat chips
  (Open / In progress / Done / Overdue). Overdue is the only element allowed to use red.
- Card: neutral surface, thin left border in priority colour (not a full-card colour wash), meta
  line `dept · owner · due`. Overdue shows as a clock icon + text in that meta line, not a red pill.
- New: a **linked KPI chip** with a mini sparkline on cards whose action maps to a tracked KPI
  (mapping = the action's department + a `kpiKey` when the action originated from a KPI gap;
  when there's no `kpiKey` on the action, show no chip — don't guess one).
- The green completion banner becomes a neutral info strip (no green background).

## Prompt 1: Results shell — header, tabs, picker

> In `src/pages/Results.tsx`, replace the current 4-tab layout with 2 tabs: **Diagnosis**
> (default) and **Action Plan**. Keep tab state in the URL as a `?tab=diagnosis|action-plan`
> query param so links are shareable — read it with `useSearchParams` on mount, write it on tab
> change.
>
> Header row above the tabs: org/dealership name, an **assessment picker** dropdown (uses
> `useDealershipAssessments(dealerId)` from `@/hooks/useDealershipAssessments` — list by
> `completed_at ?? created_at`, newest first, label each as a formatted date; selecting one
> navigates to `/app/results/:id`), the existing Export PDF button (`ExportPDFModal`), and the
> existing Retake button. Use `results.picker.label` for the picker's accessible label.
>
> Remove the sidebar's `nav.history` item in `src/components/AppSidebar.tsx` (around line 78) —
> History is being dropped, the assessment picker replaces it.
>
> Remove the old 4-tile grid (Overall Score / Maturity Level / Modules Assessed / Assessment
> Coverage — currently `Results.tsx` lines ~450–514) entirely; its content moves into the hero
> band in prompt 2, which you are not building yet in this prompt — leave a placeholder `<div>`
> where the hero band will go so the page still renders.
>
> Declare any new hooks (`useSearchParams`, `useDealershipAssessments`) unconditionally at the
> top of the component, before any early return — see the hook-ordering rule in the doc this
> prompt was copied from.
>
> **Acceptance**: page loads with 2 tabs, `?tab=` reflects the active tab and restores it on
> reload, the assessment picker lists all completed assessments for the dealership newest-first
> and navigating via it changes the URL and reloads results, History is gone from the sidebar,
> Action Plan tab still works exactly as before (it's untouched in this prompt).

## Prompt 2: Hero band

> In the Diagnosis tab of `src/pages/Results.tsx` (or a new `src/components/results/HeroBand.tsx`
> if that's cleaner — your call), build the hero band as **one card, three zones**:
>
> 1. **Score ring** — reuse the existing score-ring SVG/markup from the old Card 1 you removed in
>    prompt 1 (outer ring stroke-width 8, `neutral-200` track; see `DESIGN.md` §22 for the full
>    spec) so you don't have to redesign the ring itself, just relocate it.
> 2. **Maturity ladder** — 4 steps Foundational → Developing → Performing → Advanced with a
>    "you are here" marker positioned by `overallScore` using the canonical thresholds (0–45 /
>    46–69 / 70–84 / 85–100 — use `getMaturityLevel` from `@/lib/maturityConfig`, don't
>    reimplement the boundaries). Below the ladder, a 2-line executive summary with a
>    "Read full narrative" link/button (`results.hero.readNarrative`) that expands the full
>    `buildExecutiveNarrative` output (from `@/lib/narrativeTemplates`) inline.
> 3. **Biggest lever** — the assessed department with the largest negative benchmark gap; render
>    its name and link to its highest-priority open action in the Action Plan tab (deep link via
>    `?tab=action-plan`). Label it with `results.hero.biggestLever`. Below it, a muted confidence
>    line using `results.hero.coverage`, e.g. "N of 5 departments assessed · X/Y questions" — get
>    N from however many departments have scores, X/Y from `TOTAL_QUESTIONS` (`@/lib/constants`)
>    and the answered count already computed elsewhere in `Results.tsx`/`ExecutiveSummary.tsx`.
>    Remember `t()` does not interpolate — replace `{assessed}`/`{answered}`/`{total}` yourself.
>
> Only the "you are here" marker and any maturity-level text use the score-band colours from
> `DESIGN.md` §2.3; the rest of the card uses brand/neutral tokens.
>
> If you add a `useMemo` for "biggest lever" or the coverage numbers, declare it after the
> `scores`/`benchmarks`/`answers` values it depends on (TDZ rule above).
>
> **Acceptance**: hero band renders above the department rows, ring/ladder/lever all reflect the
> currently selected assessment, "Read full narrative" expands without navigating away, biggest
> lever link lands on the right action in Action Plan tab.

## Prompt 3: Department rows + KPI cards/charts

> Below the hero band, render one row per department (NVS, UVS, SVC, PTS, FIN) replacing the
> removed `DepartmentHeatmap`/"Department Performance" sections.
>
> Each row: department name · a 0–100 track with a score dot, a benchmark tick, and the gap
> between them shaded · a maturity chip · a confidence percentage. **Only the dot and the chip**
> use maturity/score-band colour; the track and gap shading use neutral tokens.
>
> Unassessed department: render a muted row with `results.dept.notAssessed`
> ("Not assessed — include in next assessment") instead of the track.
>
> Clicking/expanding an assessed row reveals:
> - **KPI cards** for that department's tracked KPIs — get the list via `trackedKpisFor(dept)`
>   from `@/data/trackedKpis` (dept keys are `'nvs'|'uvs'|'svc'|'prt'|'fin'`). For each `kpiKey`:
>   - Label from `KPI_LABELS[kpiKey]` (`@/lib/kpiDefinitions`), current value, benchmark and gap
>     from `STATIC_BENCHMARKS[kpiKey]` (`@/lib/kpiBenchmarks`) — prefer `loadBenchmarks()` if you
>     need DB-overridden thresholds, falling back to `STATIC_BENCHMARKS` synchronously so the
>     card never blocks on a network call.
>   - History from `useKpiTimelines(dealershipId).data[kpiKey]` (`@/hooks/useKpiTimeline`) — an
>     array of `{ month, value, source, enteredAt }` sorted by month.
>   - Chart by history depth:
>     - 0–1 points: value-vs-benchmark bar + `kpi.trendUnlocks` text.
>     - 2 points: sparkline + month-over-month delta.
>     - ≥3 points: line chart (Recharts) + a 3-month projection from
>       `forecastKpi(points, STATIC_BENCHMARKS[kpiKey])` (`@/lib/kpiForecast`) — dashed
>       `brand-400` line with a shaded ±1σ band, plus `kpi.onTrack`/`kpi.offTrack` text (use
>       `forecast.onTrack` and replace `{month}` in `kpi.onTrack` with `forecast.reachesTargetMonth`).
>       If `forecastKpi` returns `null` (it does below 3 points or when there's a >3-month gap
>       between two consecutive points), fall back to the 2-point or 0–1-point treatment.
>   - Points with `source === 'checkin-coach'` get a visually distinct marker; tooltip on hover
>     shows the source (dealer/coach) and `enteredAt` date.
>   - **"Log this month"** button (`kpi.logMonth`, replace `{month}` with the current month) opens
>     an inline popover with a number input; on submit calls
>     `useSaveKpiCheckin(dealershipId).mutate({ kpiKey, month: 'YYYY-MM-01', value })`. On success
>     toast `kpi.saved`. **Hide this button** when `actorType === 'oem'` or
>     `membershipRole === 'viewer'` (from `useActiveRole()`).
> - That department's existing cross-validation alert cards (driven by
>   `evaluateCrossValidations()`) and its ceiling insight slice, relocated from the old executive
>   tab, unchanged in logic.
>
> Money impact line on a KPI card: show only when an existing `playgroundCalculators` formula
> already covers that KPI with inputs you actually have from the dealer's data — never invent a
> figure. If you're not sure a formula applies cleanly, omit the money-impact line rather than
> guess.
>
> **Acceptance**: every tracked KPI across all 5 departments renders a card with the correct
> chart tier for its history length, "Log this month" upserts and refetches (timeline updates
> without a full page reload — the hook already invalidates the right query keys), the button is
> absent for OEM/viewer roles, unassessed departments show the muted row instead of a broken card
> grid.

## Prompt 4: Action Plan restyle

> Restyle `src/components/ActionPlan.tsx` and its card rendering. **Every existing behaviour must
> keep working identically**: search, status filters, List/Kanban/Roadmap view switch, Add/Edit
> dialogs, the Filter panel, overdue detection, progress calculation, the completion banner. Do
> not touch `src/components/action-plan/KanbanBoard.tsx`'s drag-and-drop implementation (HTML5
> DnD API — not `@dnd-kit`) or `handleKanbanStatusChange`.
>
> Changes, visual only:
> - Header: progress ring + quiet stat chips (Open / In progress / Done / Overdue). Overdue is
>   the only red element in the header.
> - Card: neutral surface, thin left border in priority colour, meta line `dept · owner · due`.
>   Overdue renders as a clock icon + text in that meta line instead of a red pill.
> - Add a **linked KPI chip** with a mini sparkline (reuse the sparkline component from prompt 3
>   if you built one standalone) on any action card whose record has a `kpiKey` tied to a tracked
>   KPI. If the action has no `kpiKey`, render no chip — don't infer one from department alone.
> - Completion banner: neutral info strip instead of the current green background.
>
> **Acceptance**: search/filters/views/Add/Edit/overdue/progress all behave exactly as before a
> manual click-through; only colours, card layout and the new KPI chip changed; Kanban
> drag-and-drop still works.

## Prompt 5: Playground "Save as check-in" buttons

> Four Playground calculators touch a tracked KPI. Add a **"Save as {month} check-in"** button
> (`kpi.saveAsCheckin`, replace `{month}` with the current month) next to the relevant field on
> each, calling `useSaveKpiCheckin(dealershipId).mutate({ kpiKey, month: 'YYYY-MM-01', value })`
> on click, toasting `kpi.saved` on success. Hide the button for `actorType === 'oem'` or
> `membershipRole === 'viewer'`.
>
> Mapping (calculator page → field → `kpiKey`):
> - `reverse-sales-funnel`, `marketing-roi`, `sales-velocity` — input field
>   `avgGrossProfitPerUnit` → `nvs_gross_profit_per_unit`.
> - `tech-utilization` — input field `effectiveLabourRate` → `svc_effective_labour_rate`, and the
>   **computed output** `utilizationPct` → `svc_workshop_loading_pct`.
> - `vehicle-stock-turn` — the **computed output** `avgDaysInStock` → `uvs_days_to_sale`.
>
> Find the actual page files under `src/pages/*Page.tsx` built on `PlaygroundCalculatorShell`
> (`src/components/playground/PlaygroundCalculatorShell.tsx`) and the calculator logic in
> `src/lib/playgroundCalculators.ts` (do not edit that file or
> `src/data/playgroundKpiMappings.ts`/`src/hooks/usePlaygroundPrefill.ts` — they're Claude-owned
> and already handle prefilling these same fields from the latest timeline value).
>
> Get `dealershipId` the same way these pages already get it for prefill (via
> `usePlaygroundPrefill`/`useActiveRole` — check the existing page for the pattern rather than
> introducing a new one).
>
> **Acceptance**: each of the 4 calculators shows exactly one save button per mapped field (2 on
> `tech-utilization`), saving updates the KPI card/timeline in Results without a page reload, the
> button is hidden for OEM/viewer, no button appears on any other calculator.
