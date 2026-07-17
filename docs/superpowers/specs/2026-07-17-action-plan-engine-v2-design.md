# Action Plan Engine v2 — KPI-Driven Signals, Prioritisation, KPI Templates

**Date:** 2026-07-17
**Status:** Approved
**Approach:** Bounded modules — new focused files, `signalEngine.ts` orchestrates, existing behaviour preserved.

## Problem

The assessment now has 80+ questions, including ~22 KPI data questions whose numeric
values persist to `assessment_kpi_values`. The signal engine explicitly excludes data
questions (`signalEngine.ts` — `isDataQuestion` skip), so real quantitative performance
data never drives action generation. Prioritisation is severity-only with a fixed cap
of 10 actions, and no template speaks in the dealer's actual numbers.

## Goals

1. KPI values fire quantitative signals against benchmark thresholds.
2. Actions ranked by ROI, dependency-ordered, dynamically counted, quick-win tagged.
3. ~22 KPI-specific templates that interpolate the dealer's actual numbers.

Non-goals: per-brand OEM threshold overrides (schema supports later), AI narrative
layer (separate approved feature), Action Plan UI redesign.

## Architecture

Four new modules; `signalEngine.ts` orchestrates. Existing qualitative pipeline
(3-tier signal resolution, tiered templates, business-model filter, context
intelligence, cross-validation) is untouched except at merge points.

```
answers ──────────────► generateSignals (existing, qualitative)
kpiValues ──► kpiSignalEngine ──► KpiSignals ─┐
                    ▲                          ├─► merge ► instantiateActions
kpiBenchmarks ──────┘                          │    (KPI templates first)
                                               ▼
                                       actionPrioritiser ► ranked actions ► DB
```

### 1. `src/lib/kpiBenchmarks.ts`

```ts
interface KpiBenchmark {
  kpiKey: string;
  direction: 'higher-better' | 'lower-better';
  target: number;    // at/above (or below) = healthy
  warning: number;   // breach = MEDIUM signal
  critical: number;  // breach = HIGH signal
  unit: string;
}
```

- `STATIC_BENCHMARKS`: map for the ~22 KPI question keys. Values sourced from
  benchmark data already present in `kpiDefinitions.ts` where available, industry
  standards elsewhere.
- `loadBenchmarks(): Promise<Record<string, KpiBenchmark>>` — fetches
  `kpi_benchmark_thresholds` rows, DB rows override static entries per `kpi_key`,
  static map is the fallback on error/empty. Result cached for the session
  (module-level cache).

### 2. `src/lib/kpiSignalEngine.ts`

```ts
interface KpiSignal {
  kpiKey: string;
  signalCode: SignalCode;      // mapped from KPI domain
  moduleKey: string;           // derived from KPI's department
  severity: Severity;          // HIGH | MEDIUM | LOW
  actualValue: number;
  targetValue: number;
  gapPercent: number;          // |actual − target| / target × 100
  unit: string;
}
```

- `generateKpiSignals(kpiValues, benchmarks): KpiSignal[]`
- Banding (direction-aware): breach of `critical` → HIGH; breach of `warning` →
  MEDIUM; short of `target` → LOW; at/above target → no signal.
- Threshold edges: value exactly at a threshold counts as **meeting** it (no breach).
- Merge rule (in `signalEngine.ts`): a KpiSignal whose `moduleKey::signalCode`
  matches an existing qualitative signal escalates that signal's severity one step
  (LOW→MEDIUM→HIGH) and attaches gap data. Unmatched KpiSignals become standalone
  `GeneratedSignal`s carrying `kpiGap` metadata.

### 3. `src/data/actionTemplatesKpi.ts`

- ~22 templates keyed by `kpiKey`, same shape as `ActionTemplate` plus placeholder
  support in `title`, `description`, and `implementationSteps`:
  `{actual}`, `{target}`, `{gap}`, `{unit}`.
- Interpolated at instantiation from the triggering KpiSignal — e.g.
  "Cut lead response time from 95 min to under 30 min".
- Template selection order for a signal with KPI gap data:
  1. KPI template for that `kpiKey` (this file)
  2. Existing KPI-specific chain (`getKPISpecificTemplateIds`)
  3. Existing generic fallback chain
- Existing templates and tiered templates untouched.

### 4. `src/lib/actionPrioritiser.ts`

`prioritiseActions(actions, signals, sectionScores, overallScore): PrioritisedAction[]`

Runs after `instantiateActions`, before `formatActionsForDatabaseInsert`.

- **ROI rank**: `composite = (impact_score + gapBonus) × urgency_score ÷ max(effort_score, 1)`
  using existing contextIntelligence scores; `gapBonus` scales with `gapPercent`
  of the triggering KpiSignal (0 when none).
- **Dependency sort**: static map `templateId → prerequisite templateIds`
  (small, hand-curated — e.g. define-KPI before review-cadence). A prerequisite
  present in the plan floats above its dependent; otherwise composite order.
  No full topological engine — single-pass bubble of prerequisites.
- **Dynamic count** (replaces fixed cap 10), by overall assessment score:
  - < 50 → up to 15 actions
  - 50–69 → up to 10
  - 70–84 → up to 6
  - ≥ 85 → up to 4
- **Quick-win tag**: `effort_score ≤ 2` AND `defaultTimeframeDays ≤ 30` →
  `is_quick_win: true`.
- Output adds `rank` (1-based) and `is_quick_win` to each action.

### 5. Wiring & data flow

- `generateActionsFromAssessment(answers, weights, config, questionLinkedKPIs?,
  businessModel?, departmentScore?, kpiValues?)` — new optional `kpiValues` param
  and `overallScore` via config. Passing nothing preserves current behaviour exactly.
- `useAutoActionGeneration.generateActions` fetches the assessment's rows from
  `assessment_kpi_values` (KPI answers are saved before action generation in the
  submit flow) and passes `kpi_key → value` in. Fetch failure → proceed without
  KPI values (qualitative-only, current behaviour).
- `formatActionsForDatabaseInsert` writes `rank` and `is_quick_win`.

### 6. Database (Supabase MCP migrations)

- `improvement_actions`: add `rank int`, `is_quick_win boolean default false`.
- `kpi_benchmark_thresholds`: finalise schema —
  `(id, kpi_key text unique, direction text, target numeric, warning numeric,
  critical numeric, unit text, updated_at)`. RLS: readable by authenticated users;
  writable by service role only (no UI for editing yet).
- Regenerate `src/integrations/supabase/types.ts` after migration.

### 7. UI (minimal)

- Action Plan list sorts by `rank`; quick-win badge on tagged actions.
- No layout redesign.

## Error handling

- Benchmark fetch failure → static map (never blocks generation).
- Missing benchmark for a KPI key → that KPI produces no signal (logged in DEV).
- Missing placeholder value at interpolation → placeholder segment dropped
  gracefully, never rendered raw as `{actual}`.
- Empty `kpiValues` → engine output identical to today.

## Testing

Vitest, `src/__tests__/`:

- `kpiBenchmarks.test.ts` — DB override merge, fallback on error, cache.
- `kpiSignalEngine.test.ts` — banding both directions, exact-threshold edges,
  gapPercent math, merge/escalation with qualitative signals.
- `actionPrioritiser.test.ts` — composite ordering, gap bonus effect, dependency
  bubble, dynamic count per score band, quick-win tagging.
- `actionTemplatesKpi.test.ts` — interpolation of all placeholders, graceful
  missing-value handling, every template has valid kpiKey + signal mapping.
- Existing `signalEngine` tests stay green; new cases cover no-kpiValues parity.

Coverage threshold 80% applies.

## Rollout

1. Migrations + types regen.
2. Modules + tests (pure logic, no UI risk).
3. Wire `useAutoActionGeneration` + `formatActionsForDatabaseInsert`.
4. UI sort/badge.
5. Branch + PR (multi-file change — not direct to main).
