import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-1' }, loading: false, signOut: vi.fn(), session: null })),
}));

const generateActionsFromAssessmentSpy = vi.hoisted(() => vi.fn());

vi.mock('@/lib/signalEngine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/signalEngine')>();
  return {
    ...actual,
    generateActionsFromAssessment: ((...args: Parameters<typeof actual.generateActionsFromAssessment>) => {
      generateActionsFromAssessmentSpy(...args);
      return actual.generateActionsFromAssessment(...args);
    }) as typeof actual.generateActionsFromAssessment,
  };
});

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}));

import { useAutoActionGeneration } from '@/hooks/useAutoActionGeneration';
import { clearBenchmarkCache } from '@/lib/kpiBenchmarks';

// Same answer set as signalEngineKpi.test.ts "parity" block — deterministically
// produces 6 real actions (with rank + isQuickWin) via the real prioritiser.
const PARITY_ANSWERS: Record<string, number> = {
  'nvs-1': 2, 'nvs-2': 2, 'nvs-3': 3,
  'uvs-1': 2, 'uvs-2': 3,
  'svc-1': 2, 'svc-2': 2, 'svc-3': 3,
  'pts-1': 2, 'fin-1': 2,
};

const ASSESSMENT_ID = '11111111-1111-1111-1111-111111111111';
const ORG_ID = '22222222-2222-2222-2222-222222222222';

let insertedRows: any[] | null = null;
let kpiValuesResponse: { data: any; error: any } | 'throw' = { data: [], error: null };
let benchmarkThresholdsResponse: { data: any; error: any } = { data: [], error: null };

function setupFromMock() {
  insertedRows = null;
  mockFrom.mockImplementation((table: string) => {
    if (table === 'assessments') {
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: { id: ASSESSMENT_ID }, error: null }),
          }),
        }),
      };
    }
    if (table === 'improvement_actions') {
      return {
        select: (_sel: string, _opts?: any) => ({
          eq: () => ({
            eq: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
        insert: (rows: any[]) => {
          insertedRows = rows;
          return {
            select: () =>
              Promise.resolve({ data: rows.map((_r, i) => ({ id: `action-${i}` })), error: null }),
          };
        },
      };
    }
    if (table === 'assessment_kpi_values') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => {
              if (kpiValuesResponse === 'throw') {
                return Promise.reject(new Error('kpi fetch boom'));
              }
              return Promise.resolve(kpiValuesResponse);
            },
          }),
        }),
      };
    }
    if (table === 'kpi_benchmark_thresholds') {
      return {
        select: () => ({
          eq: () => Promise.resolve(benchmarkThresholdsResponse),
        }),
      };
    }
    throw new Error(`Unexpected table: ${table}`);
  });
}

describe('useAutoActionGeneration — KPI values + rank/quick-win persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearBenchmarkCache();
    kpiValuesResponse = { data: [], error: null };
    benchmarkThresholdsResponse = { data: [], error: null };
    setupFromMock();
  });

  it('fetches KPI rows from assessment_kpi_values and passes kpiValues + benchmarks through to the engine', async () => {
    kpiValuesResponse = {
      data: [
        { kpi_key: 'nvs_lead_response_1h_pct', value: 30 },
        { kpi_key: 'skipped_but_null', value: null },
      ],
      error: null,
    };

    const { result } = renderHook(() => useAutoActionGeneration());

    await act(async () => {
      await result.current.generateActions(
        ASSESSMENT_ID,
        { 'nvs-1': 2, 'nvs-2': 2 },
        ORG_ID
      );
    });

    expect(generateActionsFromAssessmentSpy).toHaveBeenCalledTimes(1);
    const callArgs = generateActionsFromAssessmentSpy.mock.calls[0];
    // kpiValues is the 7th positional arg (index 6), benchmarks the 8th (index 7)
    const kpiValues = callArgs[6];
    const benchmarks = callArgs[7];
    expect(kpiValues).toEqual({ nvs_lead_response_1h_pct: 30 });
    expect(benchmarks).toHaveProperty('nvs_lead_response_1h_pct');
  });

  it('proceeds with empty kpiValues/benchmarks when the KPI fetch throws', async () => {
    kpiValuesResponse = 'throw';

    const { result } = renderHook(() => useAutoActionGeneration());

    let outcome: any;
    await act(async () => {
      outcome = await result.current.generateActions(
        ASSESSMENT_ID,
        PARITY_ANSWERS,
        ORG_ID
      );
    });

    // Generation still proceeds (not a hard failure).
    expect(outcome.success).toBe(true);
    expect(outcome.actionsGenerated).toBeGreaterThan(0);

    const callArgs = generateActionsFromAssessmentSpy.mock.calls[0];
    expect(callArgs[6]).toEqual({});
    expect(callArgs[7]).toEqual({});
  });

  it('persists rank and is_quick_win on every inserted action row', async () => {
    const { result } = renderHook(() => useAutoActionGeneration());

    await act(async () => {
      await result.current.generateActions(ASSESSMENT_ID, PARITY_ANSWERS, ORG_ID);
    });

    expect(insertedRows).not.toBeNull();
    expect(insertedRows!.length).toBeGreaterThan(0);
    for (const row of insertedRows!) {
      expect(typeof row.rank).toBe('number');
      expect(typeof row.is_quick_win).toBe('boolean');
    }
    // ranks are 1-based and sequential per the prioritiser's output
    const ranks = insertedRows!.map((r) => r.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(insertedRows!.map((_r, i) => i + 1));
  });
});
