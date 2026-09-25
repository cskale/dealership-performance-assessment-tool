# Results Page Redesign + Monthly KPI Check-ins — Design

Date: 2026-09-25 · Branch: `feat/results-redesign`

## Goal

Make Results read as a premium diagnostic instrument: diagnose → act → measure in one loop.
Remove content that looks fabricated or duplicated. Colours strictly from `DESIGN.md`:
maturity colours (red <46, amber 46–69, blue 70–84, green ≥85) encode status only; everything else uses the brand/neutral scale.

## 1. Structure & navigation

- Sidebar: remove the `nav.history` item (`AppSidebar.tsx:78`). `/app/results` and `/app/results/:assessmentId` routes stay.
- Results header: org name, **assessment picker** (dropdown of the dealership's assessments by date, navigates to `/app/results/:id`), Export PDF, Retake.
- Two tabs only: **Diagnosis** (default) and **Action Plan**. Tab state in `?tab=` query param for deep links.

### Tab 1 — Diagnosis

1. **Hero band** (one card, three zones)
   - Score ring (DESIGN §22).
   - Maturity ladder: 4 steps Foundational → Developing → Performing → Advanced, "you are here" marker. 2-line executive summary below; "Read full narrative" expands `buildExecutiveNarrative` output.
   - Right zone: **Biggest lever** = assessed department with largest negative benchmark gap, links to its highest-priority open action. Below it a muted confidence line: "N of 5 departments assessed · X/Y questions".
2. **Department rows** — one per department.
   - Row: name · 0–100 track with score dot, benchmark tick, shaded gap · maturity chip · confidence %.
   - Only the dot and chip use maturity colour.
   - Unassessed department: muted row "Not assessed — include in next assessment".
   - Expand: department KPI cards (§3), its cross-validation alerts, its ceiling insight.
3. **Excellence gaps** — `CeilingInsightsPanel`, rendered only when it has insights (drop the "activates at 55+" placeholder).

### Removed

`DepartmentHeatmap` (KPI matrix), `CausalChainDiagram` (Shared Root Causes), Key Diagnostic Findings, Department Performance cards, Score Breakdown bar, Performance Gap Analysis table, Maturity tab, Development Roadmap, the 4 top tiles, standalone KPI Analysis tab (content moves into department rows). Delete components with no remaining importers.

## 2. Data model — `kpi_checkins`

| column | type | notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| dealership_id | uuid FK dealerships | not null |
| kpi_key | text | not null; app validates against `TRACKED_KPIS` |
| period_month | date | not null; CHECK day = 1 |
| value | numeric | not null |
| entered_by | uuid | default auth.uid() |
| entered_by_role | text | `'dealer' \| 'coach'`, set by BEFORE INSERT/UPDATE trigger from `profiles.actor_type` (client value ignored) |
| created_at / updated_at | timestamptz | updated_at maintained by trigger |

- UNIQUE `(dealership_id, kpi_key, period_month)`; writes are upserts.
- Audit = last writer (`entered_by`, `entered_by_role`, `updated_at`). Full history table deferred until disputes occur.
- RLS (via `private.can_view_dealership()` / SECURITY DEFINER helpers — no direct `dealer_network_memberships` joins):
  - SELECT: dealer org members, active assigned coach, OEM of the dealership's network.
  - INSERT/UPDATE: dealer org members with role owner/admin/member; active assigned coach.
  - DELETE: dealer org owner/admin only.
- `assessment_kpi_values` unchanged (assessment-time snapshot).
- Regenerate `src/integrations/supabase/types.ts` after migration.

### Tracked KPIs (`TRACKED_KPIS`, 10)

| Dept | kpi_key |
|---|---|
| NVS | `nvs_lead_response_1h_pct`, `nvs_gross_profit_per_unit` |
| UVS | `uvs_days_to_sale`, `uvs_gross_profit_per_unit` |
| SVC | `svc_workshop_loading_pct`, `svc_effective_labour_rate` |
| PTS | `prt_inventory_turns`, `prt_gross_margin_pct` |
| FIN | `fin_net_profit_pct`, `fin_aftersales_gp_share_pct` |

Units, direction (higher/lower is better) and benchmarks come from `kpiDefinitions.ts`.

All 10 are assessment data questions. Every assessment KPI that overlaps a Playground calculator is included:
`nvs_gross_profit_per_unit` (input to reverse-sales-funnel, marketing-roi, sales-velocity), `svc_effective_labour_rate` (input to tech-utilization),
`svc_workshop_loading_pct` (≈ tech-utilization `utilizationPct` output), `uvs_days_to_sale` (≈ vehicle-stock-turn `avgDaysInStock` output).
Other calculators need monthly volumes/€ figures the assessment does not ask; adding them would increase dealer effort, so they stay out.

### Single entry across assessment, check-ins and Playground

- `usePlaygroundPrefill` reads the latest value from `useKpiTimeline` (check-in, else assessment snapshot) instead of assessment only.
- Playground calculators touching a tracked KPI show **"Save as <Month> check-in"** (upsert to `kpi_checkins`): input fields for the two input KPIs, computed output for workshop loading and days to sale.
- Assessment KPI questions prefill from the latest timeline value (check-in or previous assessment); dealer confirms or edits.

### Timeline

`useKpiTimeline(dealershipId, kpiKey)` (React Query): merges `kpi_checkins` with `assessment_kpi_values` (assessment value counts for the month of the assessment's `created_at`); check-in wins on same month. Returns points sorted by month with source (`checkin-dealer`, `checkin-coach`, `assessment`).

### Reminder

Monthly pg_cron job (1st of month) creates an in-app notification "Log your <Month> KPIs" per dealership with tracked KPIs, via the existing notification system. Email deferred until the Resend domain is verified.

## 3. KPI card + forecast

Per tracked KPI inside its department row:

- Current value, benchmark, gap in KPI units.
- **Money impact**: shown only where an existing `playgroundCalculators` formula covers the KPI with inputs available from the dealer's data; otherwise omitted (no invented figures).
- Chart by history depth:
  - 0–1 points: value vs benchmark bar + "Trend unlocks after 2 check-ins".
  - 2 points: sparkline + month-over-month delta.
  - ≥3 points: line chart + 3-month projection (dashed, shaded band) + "On track / off track to reach benchmark by <month>".
- Coach-entered points get a distinct marker; tooltip shows who/when.
- "Log this month" → inline popover → upsert to `kpi_checkins`. Hidden for viewers/OEM.

### Forecast (`src/lib/kpiForecast.ts`, pure TS)

- Ordinary least squares over the last ≤6 monthly points.
- Band = ±1 standard deviation of residuals.
- Clamp to valid range (percentages 0–100, non-negative otherwise).
- No projection if any gap between consecutive points > 3 months, or < 3 points.
- Label: "Projection based on N months".
- Seasonality deferred until ≥12 months of data are common.

Charts: Recharts (already installed). Series colours: actual brand-600, benchmark band neutral-200, projection dashed brand-400.

## 4. Action Plan tab

All existing features unchanged: search, status filters, List/Kanban/Roadmap views, Add/Edit, Filter panel, overdue logic, progress, banner. KanbanBoard DnD untouched.

Visual only:
- Header: progress ring + quiet stat chips (Open / In progress / Done / Overdue); Overdue is the only red element.
- Card: neutral surface, thin left border in priority colour, meta line dept · owner · due; overdue shown as clock icon + text in meta line, not a red pill.
- **Linked KPI chip** with mini sparkline when the action maps to a tracked KPI (mapping via the action's department + `kpiKey` where the action originated from a KPI gap; otherwise no chip).
- Green banner → neutral info strip.

## 5. Ownership & sequence

1. **Claude Code**: migration + RLS + triggers, types regen, `TRACKED_KPIS`, `useKpiTimeline`, `kpiForecast.ts` + tests, check-in upsert hook, reminder cron, sidebar History removal, assessment-list hook for the picker, i18n keys (all 5 languages), dead-component deletion.
2. **Lovable** (handoff doc `docs/lovable/results-redesign.md`): Results layout, hero band, department rows, KPI cards/charts, header picker, Action Plan restyle incl. `KanbanBoard.tsx`. Consumes hooks only; no data logic.
3. **Claude Code**: `npx vitest run`, `npm run lint`, `npm run build`, `python scripts/qa_click_through.py http://localhost:8080` for dealer/coach/OEM.

## Testing

- `kpiForecast`: slope/intercept on known data, residual band, clamping, gap >3 months → null, <3 points → null.
- `useKpiTimeline` merge: check-in overrides assessment value in same month; ordering.
- RLS: SQL checks per role (dealer member write ok, viewer write denied, coach write ok, OEM read-only, unrelated user no read).
- `entered_by_role` trigger ignores client-supplied value.

## Out of scope

Seasonal forecasting, full check-in history/audit table, email reminders, dealer-chosen KPI sets, business-model branching.
