import { describe, it, expect } from 'vitest';
import { TRACKED_KPIS, isTrackedKpi, trackedKpisFor } from '@/data/trackedKpis';
import { STATIC_BENCHMARKS } from '@/lib/kpiBenchmarks';

describe('TRACKED_KPIS', () => {
  it('has 10 KPIs, 2 per department, each with a benchmark', () => {
    expect(TRACKED_KPIS).toHaveLength(10);
    for (const d of ['nvs', 'uvs', 'svc', 'prt', 'fin'] as const) {
      expect(trackedKpisFor(d)).toHaveLength(2);
    }
    for (const k of TRACKED_KPIS) expect(STATIC_BENCHMARKS[k.kpiKey]).toBeDefined();
  });
  it('isTrackedKpi', () => {
    expect(isTrackedKpi('uvs_days_to_sale')).toBe(true);
    expect(isTrackedKpi('prt_backorder_days')).toBe(false);
  });
});
