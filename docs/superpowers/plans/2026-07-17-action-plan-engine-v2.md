# Action Plan Engine v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KPI values drive quantitative signals + KPI-specific templates; actions ROI-ranked, dependency-ordered, dynamically counted, quick-win tagged.

**Architecture:** Four new bounded modules (`kpiBenchmarks`, `kpiSignalEngine`, `actionTemplatesKpi`, `actionPrioritiser`); `signalEngine.ts` orchestrates merge + selection; `useAutoActionGeneration` feeds KPI values; two new DB columns on `improvement_actions`.

**Tech Stack:** TypeScript, Vitest, Supabase (existing `kpi_benchmark_thresholds` table — range schema, `segmentation_key='default'` rows override static).

**Spec:** `docs/superpowers/specs/2026-07-17-action-plan-engine-v2-design.md`

## Global Constraints

- No new npm packages.
- Branch `feat/action-engine-v2`, PR at end — no direct main commits.
- Empty/absent `kpiValues` → engine output byte-identical to today (parity tests).
- Signal codes: existing 8-member `SignalCode` union only.
- `ImplementationStep = { text: string; primaryRole: PrimaryRole }`.
- Existing `kpi_benchmark_thresholds` schema is range-based (`healthy_min/max, warning_min/max, critical_min/max`, PK `(kpi_key, segmentation_key)`) — loader converts to direction model, do NOT alter that table.
- Coverage 80% threshold stays green; all existing tests stay green.

---

### Task 1: Branch + DB migration + types

**Files:**
- Migration via Supabase MCP `apply_migration` (project `xrypgosuyfdkkqafftae`)
- Modify: `src/integrations/supabase/types.ts` (regenerated)

- [ ] **Step 1:** `git checkout -b feat/action-engine-v2`
- [ ] **Step 2:** Apply migration `add_action_rank_quickwin`:

```sql
ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS rank integer,
  ADD COLUMN IF NOT EXISTS is_quick_win boolean NOT NULL DEFAULT false;
```

- [ ] **Step 3:** Regenerate types via `mcp__claude_ai_Supabase__generate_typescript_types`, write to `src/integrations/supabase/types.ts`. Verify `rank` + `is_quick_win` present under `improvement_actions`.
- [ ] **Step 4:** `npx vitest run` → all pass. Commit `feat: add rank + is_quick_win columns to improvement_actions`.

---

### Task 2: `src/lib/kpiBenchmarks.ts`

**Files:**
- Create: `src/lib/kpiBenchmarks.ts`
- Test: `src/__tests__/kpiBenchmarks.test.ts`

**Interfaces (Produces):**

```ts
export interface KpiBenchmark {
  kpiKey: string;
  direction: 'higher-better' | 'lower-better';
  target: number;   // meeting = healthy
  warning: number;  // breach = MEDIUM
  critical: number; // breach = HIGH
  unit: string;
}
export const STATIC_BENCHMARKS: Record<string, KpiBenchmark>;
export async function loadBenchmarks(): Promise<Record<string, KpiBenchmark>>;
export function clearBenchmarkCache(): void; // test hook
```

**Static data (all 22 — authoritative values):**

| kpiKey | dir | target | warning | critical | unit |
|---|---|---|---|---|---|
| nvs_gross_profit_per_unit | higher | 2500 | 1800 | 1200 | EUR |
| nvs_lead_response_1h_pct | higher | 80 | 60 | 40 | % |
| uvs_days_to_sale | lower | 45 | 60 | 90 | days |
| uvs_gross_profit_per_unit | higher | 1800 | 1300 | 900 | EUR |
| uvs_recon_cost_per_unit | lower | 700 | 1000 | 1500 | EUR |
| uvs_used_to_new_ratio | higher | 1.0 | 0.7 | 0.5 | ratio |
| uvs_appraisal_to_buy_pct | higher | 50 | 35 | 20 | % |
| svc_hours_per_ro | higher | 2.0 | 1.5 | 1.0 | hours |
| svc_effective_labour_rate | higher | 95 | 80 | 65 | EUR |
| svc_workshop_loading_pct | higher | 85 | 70 | 55 | % |
| prt_gross_margin_pct | higher | 28 | 22 | 16 | % |
| prt_inventory_turns | higher | 8 | 6 | 4 | turns |
| prt_sales_per_ro | higher | 180 | 120 | 80 | EUR |
| prt_wholesale_pct | lower | 30 | 45 | 60 | % |
| prt_backorder_days | lower | 3 | 7 | 14 | days |
| fin_net_profit_pct | higher | 3.0 | 1.5 | 0.5 | % |
| fin_total_gp_per_nv_unit | higher | 3200 | 2400 | 1600 | EUR |
| fin_floorplan_cost_pct | lower | 1.0 | 1.8 | 3.0 | % |
| fin_revenue_per_employee | higher | 450000 | 350000 | 250000 | EUR |
| fin_debtor_days | lower | 20 | 35 | 50 | days |
| fin_aftersales_gp_share_pct | higher | 55 | 40 | 30 | % |
| fin_selling_expense_pct | lower | 8 | 11 | 15 | % |

**Loader:** fetch `kpi_benchmark_thresholds` where `segmentation_key = 'default'`. Row→model conversion: `higher-better` (static entry's direction decides): `target=healthy_min, warning=warning_min, critical=critical_min`; `lower-better`: `target=healthy_max, warning=warning_max, critical=critical_max`. Row with nulls for needed fields → skip (keep static). Unknown kpi_key rows ignored. Fetch error → static only. Module-level promise cache.

- [ ] **Step 1:** Write failing tests: static map has 22 entries all with 5 fields; DB row overrides static entry; null-field row keeps static; fetch error keeps static; cache: second call no second fetch (mock supabase per `saveKpiAnswers.test.ts` pattern).
- [ ] **Step 2:** Run → FAIL (module missing).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS. Commit `feat: KPI benchmark thresholds (static + DB override)`.

---

### Task 3: `src/lib/kpiSignalEngine.ts`

**Files:**
- Create: `src/lib/kpiSignalEngine.ts`
- Test: `src/__tests__/kpiSignalEngine.test.ts`

**Interfaces (Produces):**

```ts
export interface KpiSignal {
  kpiKey: string;
  signalCode: Exclude<SignalCode, 'NONE'>;
  moduleKey: string;
  severity: Severity;
  actualValue: number;
  targetValue: number;
  gapPercent: number; // |actual-target|/target*100, 1 decimal
  unit: string;
}
export const KPI_SIGNAL_MAP: Record<string, { signalCode: Exclude<SignalCode,'NONE'>; moduleKey: string }>;
export function generateKpiSignals(
  kpiValues: Record<string, number>,
  benchmarks: Record<string, KpiBenchmark>
): KpiSignal[];
```

**KPI → signal/module map (all 22):**

| kpiKey | signalCode | moduleKey |
|---|---|---|
| nvs_gross_profit_per_unit | KPI_NOT_REVIEWED | new-vehicle-sales |
| nvs_lead_response_1h_pct | PROCESS_NOT_EXECUTED | new-vehicle-sales |
| uvs_days_to_sale | PROCESS_NOT_STANDARDISED | used-vehicle-sales |
| uvs_gross_profit_per_unit | KPI_NOT_REVIEWED | used-vehicle-sales |
| uvs_recon_cost_per_unit | GOVERNANCE_WEAK | used-vehicle-sales |
| uvs_used_to_new_ratio | CAPACITY_MISALIGNED | used-vehicle-sales |
| uvs_appraisal_to_buy_pct | PROCESS_NOT_EXECUTED | used-vehicle-sales |
| svc_hours_per_ro | PROCESS_NOT_EXECUTED | service-performance |
| svc_effective_labour_rate | KPI_NOT_REVIEWED | service-performance |
| svc_workshop_loading_pct | CAPACITY_MISALIGNED | service-performance |
| prt_gross_margin_pct | KPI_NOT_REVIEWED | parts-inventory |
| prt_inventory_turns | PROCESS_NOT_STANDARDISED | parts-inventory |
| prt_sales_per_ro | PROCESS_NOT_EXECUTED | parts-inventory |
| prt_wholesale_pct | GOVERNANCE_WEAK | parts-inventory |
| prt_backorder_days | CAPACITY_MISALIGNED | parts-inventory |
| fin_net_profit_pct | KPI_NOT_REVIEWED | financial-operations |
| fin_total_gp_per_nv_unit | KPI_NOT_REVIEWED | financial-operations |
| fin_floorplan_cost_pct | GOVERNANCE_WEAK | financial-operations |
| fin_revenue_per_employee | CAPACITY_MISALIGNED | financial-operations |
| fin_debtor_days | GOVERNANCE_WEAK | financial-operations |
| fin_aftersales_gp_share_pct | KPI_NOT_REVIEWED | financial-operations |
| fin_selling_expense_pct | GOVERNANCE_WEAK | financial-operations |

**Banding (direction-aware; exactly-at-threshold = meets it, no breach):**
higher-better: `v < critical` → HIGH; `v < warning` → MEDIUM; `v < target` → LOW; else none. lower-better mirrored with `>`.
Missing benchmark or missing map entry → skip (DEV console.log). Non-finite value → skip.

- [ ] **Step 1:** Failing tests: higher-better all 4 bands incl. exact-threshold edges (v===critical → MEDIUM not HIGH; v===target → none); lower-better mirrored; gapPercent math (`actual 40, target 80 → 50.0`); unknown kpiKey skipped; NaN skipped.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** PASS. Commit `feat: KPI signal engine (quantitative banding)`.

---

### Task 4: `src/data/actionTemplatesKpi.ts`

**Files:**
- Create: `src/data/actionTemplatesKpi.ts`
- Test: `src/__tests__/actionTemplatesKpi.test.ts`

**Interfaces (Produces):**

```ts
export interface KpiActionTemplate {
  templateId: string;          // 'ACT-KPI-<kpikey-kebab>'
  kpiKey: string;
  signalCode: Exclude<SignalCode, 'NONE'>;   // matches KPI_SIGNAL_MAP
  title: string;               // may contain {actual} {target} {gap} {unit}
  description: string;         // same placeholders
  defaultOwnerRole: string;
  defaultTimeframeDays: number;
  implementationSteps: ImplementationStep[]; // step text may contain placeholders
}
export const KPI_ACTION_TEMPLATES: Record<string, KpiActionTemplate>; // keyed by kpiKey
export function interpolateKpiTemplate(t: KpiActionTemplate, s: KpiSignal): KpiActionTemplate;
```

**Interpolation:** replace `{actual}`/`{target}` with value + unit (`95 min`… use `formatValue(v, unit)`: EUR → `€2,500`; % → `71.3%`; else `v unit`), `{gap}` → `gapPercent%`, `{unit}` → unit. Missing/NaN source → replace placeholder with empty string and collapse double spaces — never render raw `{actual}`.

**Content pattern (all 22 templates follow this):**
- title: imperative with numbers, e.g. `Lift lead response within 1 hour from {actual} to {target}`
- description: 2 sentences — current vs benchmark gap (`Currently {actual} against a benchmark of {target} — a gap of {gap}.`) + why it matters (from KPI's business meaning).
- 3 implementationSteps each `{ text, primaryRole }`, grounded in the question's `formula.dataSource` (CRM/DMS report names).

**Two fully-written examples (write remaining 20 to same standard, one per kpiKey in the Task 3 table; ownerRole = department head of the module; timeframeDays: 30 for process fixes, 60 for margin/structural, 90 for financial-structural):**

```ts
nvs_lead_response_1h_pct: {
  templateId: 'ACT-KPI-nvs-lead-response-1h-pct',
  kpiKey: 'nvs_lead_response_1h_pct',
  signalCode: 'PROCESS_NOT_EXECUTED',
  title: 'Lift 1-hour lead response rate from {actual} to {target}',
  description: 'Currently {actual} of new vehicle leads get a first response within 1 hour, against a benchmark of {target} — a gap of {gap}. Slow first response is the single biggest controllable driver of lead-to-sale conversion loss.',
  defaultOwnerRole: 'Sales Manager',
  defaultTimeframeDays: 30,
  implementationSteps: [
    { text: 'Pull the CRM lead response time report for the last 90 days and identify where response SLAs break (source, daypart, consultant).', primaryRole: 'sales_manager' },
    { text: 'Introduce a 15-minute first-response SLA with automatic CRM escalation to the Sales Manager when breached.', primaryRole: 'sales_manager' },
    { text: 'Review response-rate trend weekly in the sales meeting until the rate holds at {target} for 4 consecutive weeks.', primaryRole: 'dealer_principal' },
  ],
},
uvs_days_to_sale: {
  templateId: 'ACT-KPI-uvs-days-to-sale',
  kpiKey: 'uvs_days_to_sale',
  signalCode: 'PROCESS_NOT_STANDARDISED',
  title: 'Cut average days-to-sale from {actual} to {target}',
  description: 'Used vehicles currently take {actual} to sell against a benchmark of {target} — a gap of {gap}. Every extra day on the lot erodes gross through price reductions, floorplan interest and depreciation.',
  defaultOwnerRole: 'Used Vehicle Manager',
  defaultTimeframeDays: 60,
  implementationSteps: [
    { text: 'Run an ageing analysis from the DMS used stock list and flag every unit over 60 days for immediate repricing or wholesale exit.', primaryRole: 'used_vehicle_manager' },
    { text: 'Standardise a 3-step price ladder (day 21, 42, 60) with mandatory repricing actions at each gate.', primaryRole: 'used_vehicle_manager' },
    { text: 'Set a 5-day recon-to-frontline SLA and track it weekly alongside days-to-sale.', primaryRole: 'service_manager' },
  ],
},
```

- [ ] **Step 1:** Failing tests: every `KPI_SIGNAL_MAP` key has a template; template `signalCode` matches `KPI_SIGNAL_MAP`; templateIds unique; interpolation replaces all placeholders (EUR + % formatting); no `{` remains after interpolation; missing gapPercent → no raw placeholder.
- [ ] **Step 2:** FAIL. **Step 3:** Write all 22 templates + interpolation. **Step 4:** PASS. Commit `feat: 22 KPI-specific action templates with value interpolation`.

---

### Task 5: `src/lib/actionPrioritiser.ts`

**Files:**
- Create: `src/lib/actionPrioritiser.ts`
- Test: `src/__tests__/actionPrioritiser.test.ts`

**Interfaces:**
- Consumes: `InstantiatedAction` (signalEngine), `generateContextIntelligence(action)` → `{impact_score, effort_score, urgency_score}` (1–5 each), `KpiSignal[]`.
- Produces:

```ts
export interface PrioritisedAction extends InstantiatedAction {
  rank: number;          // 1-based
  isQuickWin: boolean;
  roiScore: number;      // for tests/debug
}
export function prioritiseActions(
  actions: InstantiatedAction[],
  kpiSignals: KpiSignal[],
  overallScore: number
): PrioritisedAction[];
```

**Logic (in order):**
1. Per action: `ci = generateContextIntelligence(action)`. `gapBonus = min(2, maxGapPercentOfLinkedKpis / 50)` (0 if none — match via action.linkedKPIs ∩ kpiSignal.kpiKey). `roiScore = (ci.impact_score + gapBonus) * ci.urgency_score / max(ci.effort_score, 1)`.
2. Sort desc by roiScore (tie: priority order critical>high>medium>low, then templateId for determinism).
3. Dependency bubble (signal-code level): `DEPENDS = { KPI_NOT_REVIEWED: 'KPI_NOT_DEFINED', PROCESS_NOT_EXECUTED: 'PROCESS_NOT_STANDARDISED' }`. Single pass: if action A (dependent code) sits above action B (its prerequisite code, same department), move B directly above A.
4. Truncate by overallScore: `<50 → 15; 50–69 → 10; 70–84 → 6; ≥85 → 4`.
5. Tag `isQuickWin = ci.effort_score <= 2 && action.defaultTimeframeDays <= 30`. Assign `rank = index+1`.

- [ ] **Step 1:** Failing tests: roi ordering (high impact/low effort beats inverse); gapBonus lifts rank of KPI-linked action; dependency bubble (PROCESS_NOT_STANDARDISED floats above PROCESS_NOT_EXECUTED same dept, cross-dept untouched); truncation at each band edge (49→15cap, 50→10, 70→6, 85→4); quick-win tag both conditions required; determinism (same input twice → identical order).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Commit `feat: action prioritiser (ROI rank, dependencies, dynamic count, quick wins)`.

---

### Task 6: Wire `signalEngine.ts` (merge + KPI template selection)

**Files:**
- Modify: `src/lib/signalEngine.ts`
- Test: extend `src/__tests__/` — create `signalEngineKpi.test.ts`

**Changes:**
1. `SignalEngineConfig` gains `overallScore?: number`.
2. `GeneratedSignal` gains `kpiGap?: KpiSignal`.
3. New export `mergeKpiSignals(signals: GeneratedSignal[], kpiSignals: KpiSignal[]): GeneratedSignal[]`:
   - match on `moduleKey` + `signalCode` → escalate matched signal severity one step (LOW→MEDIUM→HIGH, HIGH stays), attach `kpiGap` (keep highest-gap if multiple), append kpiKey to `linkedKPIs`.
   - unmatched KpiSignal → new `GeneratedSignal` (`triggeringQuestionIds: []`, rationale `"<KPI title-ish>: {actual} vs benchmark {target} ({gap} gap)"` built from formatted values, `sourceQuestionScores: {}`, `kpiGap` set).
4. In `instantiateActions`: for a signal with `kpiGap`, BEFORE the tiered lookup try `KPI_ACTION_TEMPLATES[signal.kpiGap.kpiKey]` → `interpolateKpiTemplate` → push (respect `usedTemplateIds`), then `continue`. Tiered/generic chain unchanged otherwise.
5. `generateActionsFromAssessment(..., kpiValues?: Record<string, number>, benchmarks?: Record<string, KpiBenchmark>)`: when both provided and non-empty → `generateKpiSignals` → `mergeKpiSignals`. Then `instantiateActions(signals, 15, ...)` (prioritiser truncates to real cap) → `prioritiseActions(actions, kpiSignals, config.overallScore ?? 50)`. Return type `AssessmentResult.actions: PrioritisedAction[]`; also return `kpiSignals`.
   - No kpiValues → `kpiSignals = []`, prioritiser still runs (rank/quick-win on qualitative actions; cap from overallScore, default 50 → 10 = today's cap).

- [ ] **Step 1:** Failing tests: merge escalates matched severity + attaches gap; unmatched KPI signal becomes standalone; KPI template selected + interpolated for gap signal; parity — `generateActionsFromAssessment` without kpiValues returns same action templateIds/order-agnostic set as before change (snapshot from a fixed answers fixture BEFORE editing, assert equal AFTER).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS + full `npx vitest run` green. Commit `feat: merge KPI signals into engine, KPI template selection, prioritised output`.

---

### Task 7: Wire `useAutoActionGeneration` + DB insert

**Files:**
- Modify: `src/hooks/useAutoActionGeneration.ts`, `src/lib/signalEngine.ts` (`formatActionsForDatabaseInsert`)
- Test: `src/__tests__/autoActionGenerationKpi.test.ts`

**Changes:**
1. In `generateActions` (hook), after idempotency check: fetch KPI values —
```ts
const { data: kpiRows } = await supabase.from('assessment_kpi_values')
  .select('kpi_key, value').eq('assessment_id', assessmentId).eq('skipped', false);
const kpiValues = Object.fromEntries((kpiRows ?? []).filter(r => r.value != null).map(r => [r.kpi_key, r.value as number]));
const benchmarks = Object.keys(kpiValues).length ? await loadBenchmarks() : {};
```
Fetch throws → catch, proceed with `{}` (qualitative-only). 
2. `config.overallScore`: compute `sectionScores` average when present, else undefined. Pass `kpiValues`, `benchmarks` into `generateActionsFromAssessment`.
3. `formatActionsForDatabaseInsert(actions: PrioritisedAction[], ...)`: add `rank: action.rank`, `is_quick_win: action.isQuickWin` to the insert row.
- [ ] **Step 1:** Failing tests (mock supabase chain): KPI rows fetched + passed through (spy on engine); fetch error → still generates; insert rows contain `rank` and `is_quick_win`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Commit `feat: feed KPI values into auto action generation; persist rank + quick-win`.

---

### Task 8: UI — rank sort + quick-win badge

**Files:**
- Modify: `src/components/ActionPlan.tsx`

**Changes:** order fetched actions by `rank` ascending nulls-last (fallback to current ordering when all null — legacy assessments); quick-win `Badge` (existing shadcn `Badge`, variant `secondary`, text `Quick win`) where `is_quick_win`. Verify `Badge` import exists.

- [ ] **Step 1:** Implement (sort + badge; no new test file — covered by lint/build; UI file is Lovable-adjacent but ActionPlan.tsx is not Lovable-owned).
- [ ] **Step 2:** `npm run lint` + `npx vitest run` green. Commit `feat: action plan sorted by rank with quick-win badges`.

---

### Task 9: Verify + PR

- [ ] **Step 1:** `npx vitest run` (all), `npm run lint`, `npm run build` — all green.
- [ ] **Step 2:** Update `docs/enhancement-log.md` (per feedback memory) + CLAUDE.md tracker note (cross-validation already wired; engine v2 shipped).
- [ ] **Step 3:** Push branch, `gh pr create` with summary + test plan.
