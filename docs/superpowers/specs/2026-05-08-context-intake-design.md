# Context Intake — Design Spec
**Date:** 2026-05-08  
**Status:** Approved  
**Tracker:** #12  

---

## Overview

A Dealership Profile feature that captures operational and financial KPIs before assessment. This data serves two purposes: (1) adjusts benchmark corridors to the dealer's size tier, (2) gates advanced questions only shown to dealers above a volume threshold.

---

## Decisions Log

| Question | Decision |
|---|---|
| What does context data do? | Adjusts benchmarks **and** gates questions (B+C combined) |
| Which fields? | Operational + financial — 16 fields (Option B) |
| When is it collected? | Prompted if stale >90 days; not before every assessment (Option C) |
| Question gating logic | Size tiers: Small / Mid / Large based on `new_units_monthly` (Option A) |
| Who sees the data? | Full visibility: dealer → coach → OEM (Option B) |
| Profile UI layout | Dealership Profile tab in Account, summary grid + Edit modal (Option A) |

---

## Data Model

### New table: `dealer_context`

```sql
create table public.dealer_context (
  id                      uuid primary key default gen_random_uuid(),
  dealership_id           uuid not null references dealerships(id) on delete cascade,
  organization_id         uuid not null references organizations(id) on delete cascade,
  submitted_by            uuid not null references auth.users(id),
  submitted_at            timestamptz not null default now(),
  data_period_month       date not null,          -- first day of month this data covers

  -- Volume & Staff
  new_units_monthly       integer not null,        -- primary size tier driver
  used_units_monthly      integer,
  service_bays            integer,
  service_technicians     integer,
  sales_staff_new         integer,
  sales_staff_used        integer,
  parts_staff             integer,
  finance_staff           integer,
  years_in_operation      integer,

  -- Financial
  avg_gross_new_unit      numeric(10,2),           -- avg gross profit per new vehicle, stored in org's local currency (no conversion)
  avg_gross_used_unit     numeric(10,2),           -- same currency assumption as above
  service_absorption_rate numeric(5,2),            -- % 0–100
  parts_fill_rate         numeric(5,2),            -- % 0–100
  csi_score               numeric(5,2),
  floor_plan_utilisation  numeric(5,2),            -- % 0–100

  created_at              timestamptz default now()
);

-- Index for fast latest-row lookup
create index dealer_context_dealership_submitted
  on dealer_context(dealership_id, submitted_at desc);
```

**History preserved:** Each submission is a new row. The latest row per `dealership_id` is the active profile.

### RLS Policies

| Actor | Permission |
|---|---|
| Dealer (own org) | SELECT, INSERT on own dealership rows |
| Coach | SELECT on rows for assigned dealerships (via `coach_dealership_assignments`) |
| OEM | SELECT on rows for dealers in their network (via `dealer_network_memberships`) |

---

## Size Tier Classification

Computed on read in `src/lib/contextUtils.ts` — not stored in DB.

```ts
export type SizeTier = 'small' | 'mid' | 'large'

export function getSizeTier(newUnitsMonthly: number): SizeTier {
  if (newUnitsMonthly < 50)  return 'small'
  if (newUnitsMonthly <= 150) return 'mid'
  return 'large'
}
```

**Tier thresholds:**
- **Small**: < 50 new units/month
- **Mid**: 50–150 new units/month  
- **Large**: > 150 new units/month

---

## Question Gating

Extends `src/lib/moduleGating.ts`.

### Questionnaire change

Each question in `src/data/questionnaire.ts` gains an optional field:

```ts
interface Question {
  // existing fields...
  minSizeTier?: 'mid' | 'large'  // undefined = visible to all tiers
}
```

Approximately:
- **8–12 questions** tagged `minSizeTier: 'mid'` — multi-location logistics, high-volume floor plan, multi-shift ops
- **4–6 questions** tagged `minSizeTier: 'large'` — national fleet programmes, bulk procurement, multi-brand operations

### Extended function signature

```ts
// Before
getActiveSections(sections: Section[], businessModel: BusinessModel | null): Section[]

// After
getActiveSections(
  sections: Section[],
  businessModel: BusinessModel | null,
  sizeTier: SizeTier | null        // null = show all questions (no context yet)
): Section[]
```

When `sizeTier` is null (no context data), all questions are shown — safe fallback.

---

## Benchmark Adjustment

Extends `src/lib/benchmarkGovernance.ts` and `src/lib/benchmarkUtils.ts`.

```ts
// Current shape
type ModuleBenchmark = { p25: number; median: number; p75: number }

// New shape
type TieredBenchmark = {
  small: ModuleBenchmark
  mid:   ModuleBenchmark
  large: ModuleBenchmark
  all:   ModuleBenchmark  // fallback when no context (current values)
}
```

`fetchModuleBenchmarks()` accepts an optional `sizeTier` param and returns the matching tier's corridors. Results page, KPI encyclopedia, and OEM dashboard all use tier-adjusted corridors when context is available, falling back to `all` otherwise.

---

## UI: Dealership Profile Tab

### Location

New tab in `src/pages/Account.tsx`: **"Dealership Profile"** (alongside existing Team, Billing tabs).

Route: `/app/account?tab=profile`

### Layout (Option A — summary grid + Edit modal)

```
┌─────────────────────────────────────────────────┐
│  Dealership Profile          [MID-TIER badge]   │
│  Used to calibrate benchmarks and tailor        │
│  your assessment                                │
├─────────────────────────────────────────────────┤
│  [New Units/Mo]  [Svc Absorption]               │
│  [CSI Score]     [Sales Staff (New)]            │
│  ... 4-column grid of key metrics               │
├─────────────────────────────────────────────────┤
│  Last updated: Jan 2026 · 93 days ago           │
│                          [Update Profile →]     │
└─────────────────────────────────────────────────┘
```

"Update Profile" opens a shadcn/ui `Sheet` (right-side drawer) with the full 16-field form. Fields grouped by section: Volume & Staff / Financial. The form includes a month picker (e.g. "April 2026") that sets `data_period_month` to the first day of that month. All numeric fields validated as positive integers or decimals; percentage fields clamped 0–100. `new_units_monthly` is required; all other fields optional. On save, inserts new row into `dealer_context`.

### New component files

```
src/components/account/DealershipProfileTab.tsx   — summary grid view
src/components/account/DealershipProfileSheet.tsx — edit drawer with form
src/hooks/useDealerContext.ts                     — query + mutation hook
src/lib/contextUtils.ts                           — getSizeTier(), TIER_LABELS
```

---

## UI: Assessment Staleness Check

### Hook: `useContextCheck`

```ts
// src/hooks/useContextCheck.ts
export function useContextCheck(dealershipId: string | null) {
  // returns: { hasContext, isStale, daysSinceUpdate, latestContext }
  // isStale = submitted_at < now() - 90 days
}
```

### Banner in `Assessment.tsx`

Rendered above the assessment progress bar when `isStale === true`:

```
┌────────────────────────────────────────────────────────────┐
│ ⚠  Your dealership profile is 93 days old                  │
│    Update it to keep your benchmarks accurate. ~2 minutes  │
│                          [Skip for now]  [Update Profile →]│
└────────────────────────────────────────────────────────────┘
```

- Amber (`--warning`) background, skippable
- "Update Profile →" navigates to `/app/account?tab=profile`
- If `hasContext === false` (no profile at all): non-skippable redirect to profile tab

---

## UI: OEM Dashboard Additions

Extends `src/pages/OemDashboard.tsx` leaderboard table.

**New columns added:**
- Tier badge (Small / Mid / Large)
- New Units/Mo
- Service Absorption %
- CSI Score
- Profile Age (coloured: green <30d, amber 30–90d, red >90d)

**New filter:** Tier dropdown — "All tiers / Small / Mid / Large". Filters leaderboard to same-tier peers only.

**No new page** — all additions are to the existing leaderboard table.

---

## UI: Coach Dashboard Additions

Extends dealer cards in `src/pages/CoachDashboard.tsx`.

Each dealer card gains a collapsible "Dealership Profile" panel below the score row:

```
┌─ Dealership Profile ──────────── [MID-TIER]  93 days old ─┐
│  [New units/mo: 87]  [Svc absorption: 64%]                 │
│  [CSI score: 78.4]   [Parts fill rate: 91%]                │
└────────────────────────────────────────────────────────────┘
```

Shows top 4 context fields. Amber staleness indicator if >90 days.

---

## Implementation Sequence

Build in this order to avoid blocking:

1. **DB migration** — create `dealer_context` table + RLS policies
2. **Regenerate Supabase types** — `generate_typescript_types`
3. **`contextUtils.ts`** — `getSizeTier()`, tier labels, staleness logic
4. **`useDealerContext` hook** — query (latest row) + insert mutation
5. **`useContextCheck` hook** — staleness detection, used in Assessment
6. **`DealershipProfileTab` + `DealershipProfileSheet`** — Account tab
7. **`Account.tsx`** — wire in new tab
8. **`Assessment.tsx`** — staleness banner
9. **`moduleGating.ts`** — extend `getActiveSections()` with `sizeTier`
10. **`questionnaire.ts`** — tag questions with `minSizeTier`
11. **`benchmarkUtils.ts` / `benchmarkGovernance.ts`** — tiered benchmarks
12. **`OemDashboard.tsx`** — tier column + tier filter
13. **`CoachDashboard.tsx`** — context panel on dealer cards
14. **Results page** — show tier badge, use tier-adjusted benchmarks

---

## Out of Scope (this sprint)

- OEM-configured custom intake fields (requires Programme Management)
- DMS/CRM auto-population of context fields
- Context data in PDF export (add in a follow-up)
- Mobile-optimised profile form
- Historical context trend view ("how your profile changed over time")

---

## Success Criteria

- Dealer can complete the 16-field profile in < 3 minutes
- Assessment questions vary noticeably between Small and Large tier dealers
- OEM leaderboard tier filter works — Mid-tier dealers compare only against Mid-tier peers
- Stale profile banner appears after 90 days and resolves after update
- Coach sees context panel on all assigned dealer cards
- No regression in existing assessment, results, or action plan flows
