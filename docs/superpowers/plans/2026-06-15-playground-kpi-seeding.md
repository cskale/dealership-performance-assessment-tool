# Playground KPI Seeding & Benchmark Threshold Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the logic/data layer for a new "Reverse Sales Funnel Calculator" (Playground's first tool) — formula module, KPI-to-input mapping, a prefill hook seeded from `assessment_kpi_values`, i18n chip strings, and a `kpi_benchmark_thresholds` table scaffold — so Lovable can build the `/playground` UI on top of it.

**Architecture:** Pure-function calculator module (`playgroundCalculators.ts`) + a static mapping data file (`playgroundKpiMappings.ts`) + a `useQueries`-based prefill hook (`usePlaygroundPrefill.ts`) that shares a fetch function extracted from the existing `useLatestKpiValue`. A new Postgres table scaffolds benchmark thresholds (read-only, unseeded). No routes/pages/components — that's Lovable's job, briefed at the end via Lovable MCP.

**Tech Stack:** React 18 + TypeScript, TanStack React Query (`useQueries`), Supabase (Postgres + RLS), Vitest.

Spec: `docs/superpowers/specs/2026-06-15-playground-kpi-seeding.md`

---

### Task 1: Create feature branch

**Files:** none

- [ ] **Step 1: Create and switch to the feature branch**

```bash
git checkout -b feat/playground-kpi-seeding
```

Expected: `Switched to a new branch 'feat/playground-kpi-seeding'`

---

### Task 2: Reverse Sales Funnel Calculator formula module

**Files:**
- Create: `src/lib/playgroundCalculators.ts`
- Test: `src/__tests__/playgroundCalculators.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/playgroundCalculators.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateReverseSalesFunnel } from '@/lib/playgroundCalculators';

describe('calculateReverseSalesFunnel', () => {
  it('computes required funnel volumes and projected gross profit for normal inputs', () => {
    const result = calculateReverseSalesFunnel({
      targetUnitSales: 20,
      avgGrossProfitPerUnit: 3500,
      leadToAppointmentRate: 25,
      appointmentShowRate: 50,
      showToCloseRate: 40,
    });

    expect(result.requiredShows).toBe(50);
    expect(result.requiredAppointments).toBe(100);
    expect(result.requiredLeads).toBe(400);
    expect(result.projectedGrossProfit).toBe(70000);
  });

  it('returns null for all required-volume fields when showToCloseRate is 0', () => {
    const result = calculateReverseSalesFunnel({
      targetUnitSales: 20,
      avgGrossProfitPerUnit: 3500,
      leadToAppointmentRate: 25,
      appointmentShowRate: 50,
      showToCloseRate: 0,
    });

    expect(result.requiredShows).toBeNull();
    expect(result.requiredAppointments).toBeNull();
    expect(result.requiredLeads).toBeNull();
    expect(result.projectedGrossProfit).toBe(70000);
  });

  it('returns null only for requiredLeads when leadToAppointmentRate is 0', () => {
    const result = calculateReverseSalesFunnel({
      targetUnitSales: 20,
      avgGrossProfitPerUnit: 3500,
      leadToAppointmentRate: 0,
      appointmentShowRate: 50,
      showToCloseRate: 40,
    });

    expect(result.requiredShows).toBe(50);
    expect(result.requiredAppointments).toBe(100);
    expect(result.requiredLeads).toBeNull();
    expect(result.projectedGrossProfit).toBe(70000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/playgroundCalculators.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/playgroundCalculators"`

- [ ] **Step 3: Write the implementation**

Create `src/lib/playgroundCalculators.ts`:

```ts
export interface ReverseSalesFunnelInputs {
  /** Monthly new vehicle unit sales target */
  targetUnitSales: number;
  /** Average front-end gross profit per unit, EUR */
  avgGrossProfitPerUnit: number;
  /** Lead -> appointment conversion rate, 0-100 */
  leadToAppointmentRate: number;
  /** Appointment -> show conversion rate, 0-100 */
  appointmentShowRate: number;
  /** Show -> close conversion rate, 0-100 */
  showToCloseRate: number;
}

export interface ReverseSalesFunnelOutputs {
  requiredShows: number | null;
  requiredAppointments: number | null;
  requiredLeads: number | null;
  projectedGrossProfit: number;
}

/**
 * Divides `value` by `ratePercent` expressed as 0-100. Returns null when the
 * rate is 0 or negative — dividing by a zero conversion rate has no
 * meaningful "required volume" answer.
 */
function divideByRate(value: number, ratePercent: number): number | null {
  if (ratePercent <= 0) return null;
  return value / (ratePercent / 100);
}

/**
 * Reverse Sales Funnel Calculator: given a unit-sales target and the
 * dealership's current funnel conversion rates, works backward to the
 * required volume at each funnel stage, plus projected gross profit.
 */
export function calculateReverseSalesFunnel(
  inputs: ReverseSalesFunnelInputs
): ReverseSalesFunnelOutputs {
  const {
    targetUnitSales,
    avgGrossProfitPerUnit,
    leadToAppointmentRate,
    appointmentShowRate,
    showToCloseRate,
  } = inputs;

  const requiredShows = divideByRate(targetUnitSales, showToCloseRate);
  const requiredAppointments =
    requiredShows === null ? null : divideByRate(requiredShows, appointmentShowRate);
  const requiredLeads =
    requiredAppointments === null
      ? null
      : divideByRate(requiredAppointments, leadToAppointmentRate);

  return {
    requiredShows,
    requiredAppointments,
    requiredLeads,
    projectedGrossProfit: targetUnitSales * avgGrossProfitPerUnit,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/playgroundCalculators.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/playgroundCalculators.ts src/__tests__/playgroundCalculators.test.ts
git commit -m "feat: add Reverse Sales Funnel Calculator formula module"
```

---

### Task 3: Playground KPI mapping data file

**Files:**
- Create: `src/data/playgroundKpiMappings.ts`
- Test: `src/__tests__/playgroundKpiMappings.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/playgroundKpiMappings.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire, isDataQuestion } from '@/data/questionnaire';
import { PLAYGROUND_KPI_MAPPINGS } from '@/data/playgroundKpiMappings';

describe('PLAYGROUND_KPI_MAPPINGS', () => {
  const allQuestions = questionnaire.sections.flatMap((s) => s.questions);
  const validKpiKeys = new Set(
    allQuestions.filter(isDataQuestion).map((q) => q.kpiKey)
  );

  it('maps every field to a kpiKey that exists in the questionnaire data questions', () => {
    for (const [calculatorId, fieldMap] of Object.entries(PLAYGROUND_KPI_MAPPINGS)) {
      for (const [fieldId, kpiKey] of Object.entries(fieldMap)) {
        expect(validKpiKeys.has(kpiKey), `${calculatorId}.${fieldId} -> ${kpiKey}`).toBe(true);
      }
    }
  });

  it('maps the Reverse Sales Funnel Calculator avgGrossProfitPerUnit field to nvs_gross_profit_per_unit', () => {
    expect(PLAYGROUND_KPI_MAPPINGS['reverse-sales-funnel'].avgGrossProfitPerUnit).toBe(
      'nvs_gross_profit_per_unit'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/playgroundKpiMappings.test.ts`
Expected: FAIL — `Failed to resolve import "@/data/playgroundKpiMappings"`

- [ ] **Step 3: Write the implementation**

Create `src/data/playgroundKpiMappings.ts`:

```ts
/**
 * Maps Playground calculator input fields to the kpiKey (from
 * src/data/questionnaire.ts data questions) that can pre-fill them from a
 * dealership's most recent assessment. Fields with no entry here are always
 * manual entry — see docs/superpowers/specs/2026-06-15-playground-kpi-seeding.md
 * for which fields were intentionally left unmapped and why.
 */
export const PLAYGROUND_KPI_MAPPINGS: Record<string, Record<string, string>> = {
  'reverse-sales-funnel': {
    avgGrossProfitPerUnit: 'nvs_gross_profit_per_unit',
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/playgroundKpiMappings.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/playgroundKpiMappings.ts src/__tests__/playgroundKpiMappings.test.ts
git commit -m "feat: add Playground calculator-to-KPI mapping data"
```

---

### Task 4: Extract `fetchLatestKpiValue` from `useKpiValues`

**Files:**
- Modify: `src/hooks/useKpiValues.ts`

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/hooks/useKpiValues.ts` with:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AssessmentKpiValue {
  id: string;
  assessment_id: string;
  dealership_id: string;
  question_id: string;
  kpi_key: string;
  value: number | null;
  unit: string;
  currency_code: string | null;
  reference_period: string;
  skipped: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * All KPI value rows recorded for a single assessment.
 */
export function useKpiValues(assessmentId: string | null | undefined) {
  return useQuery({
    queryKey: ['kpi-values', assessmentId],
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AssessmentKpiValue[]> => {
      const { data, error } = await supabase
        .from('assessment_kpi_values')
        .select('*')
        .eq('assessment_id', assessmentId!);

      if (error) throw error;
      return (data ?? []) as AssessmentKpiValue[];
    },
  });
}

export interface LatestKpiValue {
  row: AssessmentKpiValue;
  /** created_at of the assessment the row belongs to */
  assessmentCreatedAt: string;
}

/**
 * Fetches the most recent non-skipped value for a given KPI across all of a
 * dealership's assessments, ordered by the parent assessment's created_at.
 * Shared by useLatestKpiValue and the Playground prefill hook.
 */
export async function fetchLatestKpiValue(
  dealershipId: string,
  kpiKey: string
): Promise<LatestKpiValue | null> {
  const { data, error } = await supabase
    .from('assessment_kpi_values')
    .select('*, assessments!inner(created_at)')
    .eq('dealership_id', dealershipId)
    .eq('kpi_key', kpiKey)
    .eq('skipped', false)
    .order('created_at', { referencedTable: 'assessments', ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { assessments, ...row } = data as AssessmentKpiValue & {
    assessments: { created_at: string };
  };
  return { row: row as AssessmentKpiValue, assessmentCreatedAt: assessments.created_at };
}

/**
 * Most recent non-skipped value for a given KPI across all of a dealership's
 * assessments.
 *
 * This powers Playground seeding (pre-filling simulator inputs with real
 * historical figures) and future delta/trend queries across assessment cycles.
 */
export function useLatestKpiValue(dealershipId: string | null | undefined, kpiKey: string) {
  return useQuery({
    queryKey: ['latest-kpi-value', dealershipId, kpiKey],
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AssessmentKpiValue | null> => {
      const result = await fetchLatestKpiValue(dealershipId!, kpiKey);
      return result?.row ?? null;
    },
  });
}
```

This is a pure refactor: `useLatestKpiValue` returns exactly the same shape as before (`AssessmentKpiValue | null`); the new `fetchLatestKpiValue` exposes the previously-discarded `assessments.created_at` for Task 5.

- [ ] **Step 2: Run the full suite to confirm nothing broke**

Run: `npx vitest run`
Expected: PASS — same pass count as before this change (no test currently references `useKpiValues.ts` directly, so this confirms no other file's import of `useLatestKpiValue`/`useKpiValues` broke)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useKpiValues.ts
git commit -m "refactor: extract fetchLatestKpiValue from useLatestKpiValue"
```

---

### Task 5: Playground prefill hook

**Files:**
- Create: `src/hooks/usePlaygroundPrefill.ts`
- Test: `src/__tests__/usePlaygroundPrefill.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/usePlaygroundPrefill.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const { mockFrom, mockMaybeSingle } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockMaybeSingle: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}));

import { usePlaygroundPrefill, formatPlaygroundPeriod } from '@/hooks/usePlaygroundPrefill';

function setupFromMock() {
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: mockMaybeSingle,
  };
  mockFrom.mockImplementation(() => chain);
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePlaygroundPrefill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFromMock();
  });

  it('returns the latest value for a mapped field when one exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: 'kpi-1',
        kpi_key: 'nvs_gross_profit_per_unit',
        value: 3200,
        skipped: false,
        assessments: { created_at: '2026-05-10T00:00:00Z' },
      },
      error: null,
    });

    const { result } = renderHook(
      () => usePlaygroundPrefill('reverse-sales-funnel', 'dealer-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.values.avgGrossProfitPerUnit).toEqual({
      value: 3200,
      kpiKey: 'nvs_gross_profit_per_unit',
      assessmentDate: '2026-05-10T00:00:00Z',
    });
  });

  it('returns an empty values map when no KPI value has been recorded', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => usePlaygroundPrefill('reverse-sales-funnel', 'dealer-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.values).toEqual({});
  });

  it('returns an empty values map for a calculator with no KPI mappings', () => {
    const { result } = renderHook(
      () => usePlaygroundPrefill('unmapped-calculator', 'dealer-1'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.values).toEqual({});
  });
});

describe('formatPlaygroundPeriod', () => {
  it('formats an ISO date as Month Year in English', () => {
    expect(formatPlaygroundPeriod('2026-05-10T00:00:00Z', 'en')).toBe('May 2026');
  });

  it('formats an ISO date as Month Year in German', () => {
    expect(formatPlaygroundPeriod('2026-05-10T00:00:00Z', 'de')).toBe('Mai 2026');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/usePlaygroundPrefill.test.tsx`
Expected: FAIL — `Failed to resolve import "@/hooks/usePlaygroundPrefill"`

- [ ] **Step 3: Write the implementation**

Create `src/hooks/usePlaygroundPrefill.ts`:

```ts
import { useQueries } from '@tanstack/react-query';
import { fetchLatestKpiValue } from './useKpiValues';
import { PLAYGROUND_KPI_MAPPINGS } from '@/data/playgroundKpiMappings';

export interface PlaygroundPrefillValue {
  value: number;
  kpiKey: string;
  /** created_at of the assessment this value came from (ISO string) */
  assessmentDate: string;
}

export interface PlaygroundPrefillResult {
  isLoading: boolean;
  values: Record<string, PlaygroundPrefillValue>;
}

/**
 * For each input field mapped to a kpiKey in PLAYGROUND_KPI_MAPPINGS, fetches
 * the dealership's most recent recorded value. Fields with no mapping, or no
 * recorded (non-skipped) value, are simply absent from `values` — callers
 * leave those inputs for manual entry.
 *
 * Uses useQueries (not a per-field useLatestKpiValue) so the number of
 * queries can vary by calculator without violating the rules of hooks.
 */
export function usePlaygroundPrefill(
  calculatorId: string,
  dealershipId: string | null | undefined
): PlaygroundPrefillResult {
  const mapping = PLAYGROUND_KPI_MAPPINGS[calculatorId] ?? {};
  const entries = Object.entries(mapping);

  const results = useQueries({
    queries: entries.map(([, kpiKey]) => ({
      queryKey: ['latest-kpi-value', dealershipId, kpiKey],
      enabled: !!dealershipId,
      staleTime: 5 * 60 * 1000,
      queryFn: () => fetchLatestKpiValue(dealershipId!, kpiKey),
    })),
  });

  const values: Record<string, PlaygroundPrefillValue> = {};
  let isLoading = false;

  entries.forEach(([fieldId, kpiKey], index) => {
    const result = results[index];
    if (result.isLoading) isLoading = true;

    const latest = result.data;
    if (latest && latest.row.value !== null) {
      values[fieldId] = {
        value: latest.row.value,
        kpiKey,
        assessmentDate: latest.assessmentCreatedAt,
      };
    }
  });

  return { isLoading, values };
}

/**
 * Formats an assessment's created_at date as "{Month} {Year}" for the
 * Playground prefill chip, e.g. "May 2026" / "Mai 2026".
 */
export function formatPlaygroundPeriod(isoDate: string, language: 'en' | 'de'): string {
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/usePlaygroundPrefill.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePlaygroundPrefill.ts src/__tests__/usePlaygroundPrefill.test.tsx
git commit -m "feat: add usePlaygroundPrefill hook for KPI-seeded calculator inputs"
```

---

### Task 6: i18n chip strings (EN/DE)

**Files:**
- Modify: `src/contexts/LanguageContext.tsx`

- [ ] **Step 1: Add the English key**

In the `en` translations block, find this line (around line 68):

```ts
    'assessment.kpiOutOfRangeWarning': 'This value looks unusually high or low — please double-check.',
```

Add immediately after it:

```ts
    'assessment.kpiOutOfRangeWarning': 'This value looks unusually high or low — please double-check.',
    'playground.prefillChip': 'Pre-filled from your assessment ({period}) — editable',
```

- [ ] **Step 2: Add the German key**

In the `de` translations block, find this line (around line 490):

```ts
    'assessment.kpiOutOfRangeWarning': 'Dieser Wert wirkt ungewöhnlich hoch oder niedrig — bitte überprüfen.',
```

Add immediately after it:

```ts
    'assessment.kpiOutOfRangeWarning': 'Dieser Wert wirkt ungewöhnlich hoch oder niedrig — bitte überprüfen.',
    'playground.prefillChip': 'Vorausgefüllt aus Ihrer Bewertung ({period}) — bearbeitbar',
```

- [ ] **Step 3: Run the full suite to confirm nothing broke**

Run: `npx vitest run`
Expected: PASS — same pass count as Task 4's run, plus the new tests from Tasks 2/3/5

- [ ] **Step 4: Commit**

```bash
git add src/contexts/LanguageContext.tsx
git commit -m "feat: add playground.prefillChip i18n strings (EN/DE)"
```

---

### Task 7: Update CLAUDE.md ownership list

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add the three new files to the Claude Code owned files list**

Find this line in `CLAUDE.md`:

```markdown
- **Claude Code owned files** (Lovable must not edit): `src/data/questionnaire.ts`, `src/data/signalTypes.ts`, `src/data/signalMappings.ts`, `src/lib/signalEngine.ts`, `src/components/assessment/KpiQuestionInput.tsx`, `src/components/results/PerformanceDataPanel.tsx`, `src/lib/kpiCrossValidation.ts`, `src/hooks/useKpiValues.ts` — any changes require TypeScript validation and signal mapping consistency check
```

Replace with:

```markdown
- **Claude Code owned files** (Lovable must not edit): `src/data/questionnaire.ts`, `src/data/signalTypes.ts`, `src/data/signalMappings.ts`, `src/lib/signalEngine.ts`, `src/components/assessment/KpiQuestionInput.tsx`, `src/components/results/PerformanceDataPanel.tsx`, `src/lib/kpiCrossValidation.ts`, `src/hooks/useKpiValues.ts`, `src/lib/playgroundCalculators.ts`, `src/data/playgroundKpiMappings.ts`, `src/hooks/usePlaygroundPrefill.ts` — any changes require TypeScript validation and signal mapping consistency check
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Playground logic/data files to CC-owned boundary list"
```

---

### Task 8: `kpi_benchmark_thresholds` migration

**Files:**
- Create: `supabase/migrations/20260615000001_kpi_benchmark_thresholds.sql`
- Modify: `src/integrations/supabase/types.ts` (regenerated)

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/20260615000001_kpi_benchmark_thresholds.sql`:

```sql
-- KPI benchmark threshold scaffolding (schema only, no seed data).
-- segmentation_key follows the peer_segmentation_keys composite convention:
-- positioning|business_model|network_structure|volume_band
CREATE TABLE public.kpi_benchmark_thresholds (
  kpi_key text NOT NULL,
  segmentation_key text NOT NULL,
  healthy_min numeric,
  healthy_max numeric,
  warning_min numeric,
  warning_max numeric,
  critical_min numeric,
  critical_max numeric,
  source text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kpi_key, segmentation_key)
);

ALTER TABLE public.kpi_benchmark_thresholds ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users. No write policies — managed via
-- migration/admin only for now.
CREATE POLICY "kpi_benchmark_thresholds_select_authenticated"
  ON public.kpi_benchmark_thresholds
  FOR SELECT
  TO authenticated
  USING (true);
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Call `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `kpi_benchmark_thresholds`
- `query`: the SQL from Step 1

Expected: migration applies with no errors.

- [ ] **Step 3: Regenerate Supabase TypeScript types**

Call `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id`: `xrypgosuyfdkkqafftae`, and write the returned output to `src/integrations/supabase/types.ts` (full file replace).

Expected: `src/integrations/supabase/types.ts` now contains a `kpi_benchmark_thresholds` entry under `Tables`, with `Row`/`Insert`/`Update` shapes matching the columns in Step 1.

- [ ] **Step 4: Run the full suite and build to confirm the regenerated types compile cleanly**

Run: `npx vitest run`
Expected: PASS — same test count as Task 6

Run: `npm run build`
Expected: build succeeds with no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260615000001_kpi_benchmark_thresholds.sql src/integrations/supabase/types.ts
git commit -m "feat: add kpi_benchmark_thresholds table scaffold (read-only, unseeded)"
```

---

### Task 9: Final verification

**Files:** none

- [ ] **Step 1: Run the full test suite with coverage**

Run: `npx vitest run --coverage`
Expected: all tests PASS, coverage thresholds (80% branches/functions/lines/statements) met

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: build succeeds

---

### Task 10: Push branch and open PR

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/playground-kpi-seeding
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "feat: playground calculator logic, KPI seeding mapping, benchmark threshold scaffolding" --body "$(cat <<'EOF'
## Summary
- Adds the Reverse Sales Funnel Calculator formula module (new — neither Playground nor this calculator existed before)
- Adds PLAYGROUND_KPI_MAPPINGS (1 honest mapping of 22 kpiKeys: avgGrossProfitPerUnit -> nvs_gross_profit_per_unit)
- Adds usePlaygroundPrefill hook (refactors useLatestKpiValue to share fetchLatestKpiValue)
- Adds playground.prefillChip i18n strings (EN/DE)
- Adds kpi_benchmark_thresholds table (read-only, unseeded, segmentation_key = positioning|business_model|network_structure|volume_band)
- Updates CLAUDE.md CC-owned file boundary list

No routes/pages/components — Lovable builds the /playground UI consuming these exports (brief sent separately via Lovable MCP).

## Test plan
- [ ] `npx vitest run --coverage` green
- [ ] `npm run build` clean
- [ ] `npm run lint` clean

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR created, URL returned.

---

### Task 11: Send Lovable brief

**Files:** none

- [ ] **Step 1: Find the Lovable project**

Call `mcp__lovable__list_projects` (and `mcp__lovable__list_workspaces` if needed) to find the project corresponding to `dealership-performance-assessment-tool`.

- [ ] **Step 2: Send the build brief**

Call `mcp__lovable__send_message` for that project with this message:

```
Build a new Playground page at /app/playground (add route + sidebar nav entry,
gated the same as other authenticated /app/* routes).

First tool: "Reverse Sales Funnel Calculator" card.

Inputs (all numeric, EUR/% as noted):
- targetUnitSales — "Target vehicle sales (units/month)"
- avgGrossProfitPerUnit — "Average gross profit per unit (EUR)"
- leadToAppointmentRate — "Lead-to-appointment rate (%)"
- appointmentShowRate — "Appointment show rate (%)"
- showToCloseRate — "Show-to-close rate (%)"

Outputs (computed live via calculateReverseSalesFunnel from
src/lib/playgroundCalculators.ts — call this on every input change):
- requiredShows — "Required showroom visits"
- requiredAppointments — "Required appointments"
- requiredLeads — "Required leads"
- projectedGrossProfit — "Projected gross profit"

If requiredShows/requiredAppointments/requiredLeads is null (a 0% rate makes
the chain undefined), show "—" instead of a number, not "Infinity" or "NaN".

Prefill: call usePlaygroundPrefill('reverse-sales-funnel', dealershipId) from
src/hooks/usePlaygroundPrefill.ts. For avgGrossProfitPerUnit, if
values.avgGrossProfitPerUnit exists, pre-fill the field with that value and
show a dismissible chip using the playground.prefillChip i18n key (EN/DE,
already added to LanguageContext.tsx) — replace the literal "{period}" in the
string with formatPlaygroundPeriod(values.avgGrossProfitPerUnit.assessmentDate,
language). User edits to the field should not write back to
assessment_kpi_values — this is read-only seeding.

All other inputs (targetUnitSales, leadToAppointmentRate, appointmentShowRate,
showToCloseRate) have no KPI mapping — plain manual entry fields, no chip.

Benchmark comparison for this calculator's outputs is not available yet — keep
the existing "Benchmark coming soon" placeholder state, do not wire up
kpi_benchmark_thresholds.
```

---

## Final summary (produce after Task 11)

After completing all tasks, output a summary covering:
1. All Supabase tables created across P0–P5 (assessment_kpi_values from P1, kpi_benchmark_thresholds from this plan)
2. All files touched across P0–P5 (gather via `git log --oneline` and `git show --stat` for the kpi-questions-p1 through p5 commits)
3. Remaining TODOs: currency locale hardcoded to EUR (pre-existing), kpi_benchmark_thresholds has no seed data, nvs_lead_response_1h_pct still unmapped (candidate for a future Lead Management calculator), 12 remaining Playground calculators beyond Reverse Sales Funnel
