import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}));

import {
  STATIC_BENCHMARKS,
  loadBenchmarks,
  clearBenchmarkCache,
  type KpiBenchmark,
} from '@/lib/kpiBenchmarks';

function mockThresholdRows(rows: unknown[], error: unknown = null) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'kpi_benchmark_thresholds') {
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: rows, error }),
        }),
      };
    }
    throw new Error(`Unexpected table: ${table}`);
  });
}

describe('STATIC_BENCHMARKS', () => {
  it('has all 22 KPI keys with complete fields', () => {
    const keys = Object.keys(STATIC_BENCHMARKS);
    expect(keys).toHaveLength(22);
    for (const [key, b] of Object.entries(STATIC_BENCHMARKS)) {
      expect(b.kpiKey).toBe(key);
      expect(['higher-better', 'lower-better']).toContain(b.direction);
      expect(Number.isFinite(b.target)).toBe(true);
      expect(Number.isFinite(b.warning)).toBe(true);
      expect(Number.isFinite(b.critical)).toBe(true);
      expect(b.unit.length).toBeGreaterThan(0);
    }
  });

  it('orders thresholds consistently with direction', () => {
    for (const b of Object.values(STATIC_BENCHMARKS)) {
      if (b.direction === 'higher-better') {
        expect(b.target).toBeGreaterThan(b.warning);
        expect(b.warning).toBeGreaterThan(b.critical);
      } else {
        expect(b.target).toBeLessThan(b.warning);
        expect(b.warning).toBeLessThan(b.critical);
      }
    }
  });
});

describe('loadBenchmarks', () => {
  beforeEach(() => {
    clearBenchmarkCache();
    mockFrom.mockReset();
  });

  it('DB row overrides static entry (higher-better uses *_min)', async () => {
    mockThresholdRows([
      {
        kpi_key: 'nvs_lead_response_1h_pct',
        segmentation_key: 'default',
        healthy_min: 90, healthy_max: null,
        warning_min: 70, warning_max: null,
        critical_min: 50, critical_max: null,
      },
    ]);
    const b = await loadBenchmarks();
    expect(b['nvs_lead_response_1h_pct'].target).toBe(90);
    expect(b['nvs_lead_response_1h_pct'].warning).toBe(70);
    expect(b['nvs_lead_response_1h_pct'].critical).toBe(50);
    // untouched entries stay static
    expect(b['uvs_days_to_sale']).toEqual(STATIC_BENCHMARKS['uvs_days_to_sale']);
  });

  it('DB row overrides static entry (lower-better uses *_max)', async () => {
    mockThresholdRows([
      {
        kpi_key: 'uvs_days_to_sale',
        segmentation_key: 'default',
        healthy_min: null, healthy_max: 40,
        warning_min: null, warning_max: 55,
        critical_min: null, critical_max: 80,
      },
    ]);
    const b = await loadBenchmarks();
    expect(b['uvs_days_to_sale'].target).toBe(40);
    expect(b['uvs_days_to_sale'].warning).toBe(55);
    expect(b['uvs_days_to_sale'].critical).toBe(80);
  });

  it('row with null needed fields keeps static entry', async () => {
    mockThresholdRows([
      {
        kpi_key: 'nvs_lead_response_1h_pct',
        segmentation_key: 'default',
        healthy_min: null, healthy_max: null,
        warning_min: 70, warning_max: null,
        critical_min: 50, critical_max: null,
      },
    ]);
    const b = await loadBenchmarks();
    expect(b['nvs_lead_response_1h_pct']).toEqual(STATIC_BENCHMARKS['nvs_lead_response_1h_pct']);
  });

  it('unknown kpi_key rows are ignored', async () => {
    mockThresholdRows([
      {
        kpi_key: 'not_a_real_kpi',
        segmentation_key: 'default',
        healthy_min: 1, healthy_max: null,
        warning_min: 2, warning_max: null,
        critical_min: 3, critical_max: null,
      },
    ]);
    const b = await loadBenchmarks();
    expect(b['not_a_real_kpi']).toBeUndefined();
    expect(Object.keys(b)).toHaveLength(22);
  });

  it('falls back to static on fetch error', async () => {
    mockThresholdRows([], { message: 'boom' });
    const b = await loadBenchmarks();
    expect(b).toEqual(STATIC_BENCHMARKS);
  });

  it('falls back to static when fetch throws', async () => {
    mockFrom.mockImplementation(() => { throw new Error('network down'); });
    const b = await loadBenchmarks();
    expect(b).toEqual(STATIC_BENCHMARKS);
  });

  it('caches: second call does not re-fetch', async () => {
    mockThresholdRows([]);
    await loadBenchmarks();
    await loadBenchmarks();
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });
});
