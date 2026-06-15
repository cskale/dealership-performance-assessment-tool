# Playground KPI Seeding & Benchmark Threshold Scaffolding (kpi-questions-p5)

## Context

P0–P4 shipped the KPI data-question pipeline: `assessment_kpi_values` table, 22 `kpiKey`-tagged data questions across NVS/UVS/SVC/PTS/FIN, `useKpiValues` / `useLatestKpiValue` hooks, and KPI display on the Results page.

The original P5 brief assumed a "Playground" page with a "Reverse Sales Funnel Calculator" already existed and just needed KPI pre-fill wiring. **Neither exists anywhere in this repo** (checked all branches: `main`, `feat/notification-system-full-build`, `lovable-q46-sandbox`, `revert-to-21afbe`, plus `improvement_tracker_updated.html`). This spec therefore covers:

1. Defining the Reverse Sales Funnel Calculator from scratch (formula + types)
2. The KPI-mapping data file and prefill hook that will seed it
3. The benchmark threshold table scaffold (independent of the above)
4. A handoff brief for Lovable to build the actual `/playground` route and calculator UI

## Division of labour

Per CLAUDE.md: Claude Code owns logic/data/migrations; Lovable owns React/TSX UI. This spec's Claude Code deliverable is the **logic/data layer only** — no routes, pages, or components. Once it exists, a brief is sent to Lovable (via Lovable MCP `send_message`) describing the `/playground` page, the calculator UI, and the prefill chip, referencing the exports below.

## 1. Reverse Sales Funnel Calculator (`src/lib/playgroundCalculators.ts`)

New formula module. "Reverse funnel": dealer enters a unit-sales target and current conversion rates; the tool works backward through the funnel to show required volume at each stage, plus profit potential.

```ts
export interface ReverseSalesFunnelInputs {
  targetUnitSales: number;        // manual entry
  avgGrossProfitPerUnit: number;  // EUR — prefillable from nvs_gross_profit_per_unit
  leadToAppointmentRate: number;  // % (0-100), manual entry
  appointmentShowRate: number;    // % (0-100), manual entry
  showToCloseRate: number;        // % (0-100), manual entry
}

export interface ReverseSalesFunnelOutputs {
  requiredShows: number | null;
  requiredAppointments: number | null;
  requiredLeads: number | null;
  projectedGrossProfit: number;
}

export function calculateReverseSalesFunnel(
  inputs: ReverseSalesFunnelInputs
): ReverseSalesFunnelOutputs;
```

**Math**:
- `requiredShows = targetUnitSales / (showToCloseRate / 100)`
- `requiredAppointments = requiredShows / (appointmentShowRate / 100)`
- `requiredLeads = requiredAppointments / (leadToAppointmentRate / 100)`
- `projectedGrossProfit = targetUnitSales * avgGrossProfitPerUnit`

**Edge cases**: if any rate in a chain is `0`, the dependent `required*` fields return `null` (not `Infinity`/`NaN`) — division by a zero rate is undefined, not "infinite leads needed" as a useful number. `projectedGrossProfit` is always computed (no rate dependency).

## 2. KPI mapping (`src/data/playgroundKpiMappings.ts`)

```ts
export const PLAYGROUND_KPI_MAPPINGS: Record<string, Record<string, string>> = {
  'reverse-sales-funnel': {
    avgGrossProfitPerUnit: 'nvs_gross_profit_per_unit',
  },
};
```

Only one of the 22 `kpiKey`s maps honestly to this calculator's inputs. `nvs_lead_response_1h_pct` (lead response speed) is semantically distinct from `leadToAppointmentRate` (a conversion rate) and is **not** mapped — noted as a TODO for a future Lead Management calculator. `targetUnitSales`, `leadToAppointmentRate`, `appointmentShowRate`, `showToCloseRate` have no corresponding KPI questions and stay manual entry.

## 3. Prefill hook (`src/hooks/usePlaygroundPrefill.ts`)

Refactor `src/hooks/useKpiValues.ts` to extract the existing `useLatestKpiValue` query logic into an exported async function:

```ts
export async function fetchLatestKpiValue(
  dealershipId: string,
  kpiKey: string
): Promise<{ value: number; assessmentCreatedAt: string } | null>;
```

(Currently `useLatestKpiValue` fetches `assessments.created_at` for ordering and discards it — keep it, since the prefill chip needs it for the "{period}" label.)

New hook, using `useQueries` over the mapping's entries (avoids variable-length `useQuery` calls, which would violate rules of hooks):

```ts
export function usePlaygroundPrefill(
  calculatorId: string,
  dealershipId: string | null | undefined
): {
  isLoading: boolean;
  values: Record<string, { value: number; kpiKey: string; assessmentDate: string }>;
};

export function formatPlaygroundPeriod(isoDate: string, language: 'en' | 'de'): string;
// e.g. "May 2026" / "Mai 2026" via Intl.DateTimeFormat
```

If `PLAYGROUND_KPI_MAPPINGS[calculatorId]` is empty/undefined, `values` is `{}` and `isLoading` is `false`. If a mapped KPI has no recorded value (or is `skipped`), that field is simply absent from `values` — Lovable's UI shows no chip and leaves the field for manual entry.

**Alternative considered**: a single batched query (`.in('kpi_key', [...])`) instead of one query per mapped field. More efficient for calculators with many mapped fields, but this calculator has exactly one — `useQueries` is simpler and consistent with the existing per-KPI `useLatestKpiValue` pattern. Revisit if/when more calculators ship with larger mappings.

## 4. i18n (`src/contexts/LanguageContext.tsx`)

`t()` takes no interpolation params, so the string carries a literal `{period}` placeholder for the UI to `.replace()`:

- EN: `'playground.prefillChip': 'Pre-filled from your assessment ({period}) — editable'`
- DE: `'playground.prefillChip': 'Vorausgefüllt aus Ihrer Bewertung ({period}) — bearbeitbar'`

## 5. Benchmark threshold table (new migration)

```sql
CREATE TABLE public.kpi_benchmark_thresholds (
  kpi_key text NOT NULL,
  segmentation_key text NOT NULL,
  healthy_min numeric, healthy_max numeric,
  warning_min numeric, warning_max numeric,
  critical_min numeric, critical_max numeric,
  source text,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (kpi_key, segmentation_key)
);
```

`segmentation_key` format matches the existing `peer_segmentation_keys.peer_segment_key` convention: `positioning|business_model|network_structure|volume_band` (pipe-delimited, 4-dimension composite — see `peer_segmentation_keys` VIEW and `benchmark_snapshots` table).

RLS: `SELECT` for `authenticated`. No `INSERT`/`UPDATE`/`DELETE` policies — write access is migration/admin-managed only, for now. No seed data. Not wired to any UI beyond the existing "Benchmark coming soon" state.

## 6. Tests

- `src/__tests__/playgroundKpiMappings.test.ts` — every `kpiKey` referenced in `PLAYGROUND_KPI_MAPPINGS` exists as a `kpiKey` in `src/data/questionnaire.ts`
- `src/__tests__/playgroundCalculators.test.ts` — formula correctness for normal inputs; `null` outputs when a chain rate is `0`; `projectedGrossProfit` always computed
- `src/__tests__/usePlaygroundPrefill.test.ts` — value present → returned with `assessmentDate`; absent/skipped → field absent from `values`, no error

## 7. CLAUDE.md updates

Add the three new files to the "Claude Code owned files" list:
- `src/lib/playgroundCalculators.ts`
- `src/data/playgroundKpiMappings.ts`
- `src/hooks/usePlaygroundPrefill.ts`

## 8. Process

- Branch + PR (not direct push to `main` — CLAUDE.md rule for multi-file changes)
- `npx vitest run` and `npm run build` both green before PR
- Commit message: `feat: playground calculator logic, KPI seeding mapping, benchmark threshold scaffolding — kpi-questions-p5`
- After merge: Lovable brief via MCP `send_message`, describing `/playground` route, Reverse Sales Funnel Calculator UI (the 5 inputs + 4 outputs above), and the prefill chip (using `usePlaygroundPrefill` + `formatPlaygroundPeriod` + `playground.prefillChip` i18n key)

## Out of scope / TODOs for later

- Currency locale (hardcoded EUR throughout — pre-existing TODO, not addressed here)
- Seeding actual values into `kpi_benchmark_thresholds`
- The remaining ~12 Playground calculators beyond Reverse Sales Funnel
- Mapping `nvs_lead_response_1h_pct` to a future Lead Management calculator
