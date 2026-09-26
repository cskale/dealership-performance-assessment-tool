import { describe, it, expect } from 'vitest';
import { forecastKpi } from '@/lib/kpiForecast';
import { STATIC_BENCHMARKS } from '@/lib/kpiBenchmarks';

const pts = (start: string, vals: number[]) =>
  vals.map((value, i) => {
    const d = new Date(start); d.setUTCMonth(d.getUTCMonth() + i);
    return { month: d.toISOString().slice(0, 10), value };
  });

const lead = STATIC_BENCHMARKS.nvs_lead_response_1h_pct; // higher-better, target 80, %
const days = STATIC_BENCHMARKS.uvs_days_to_sale;         // lower-better, target 45

describe('forecastKpi', () => {
  it('returns null with fewer than 3 points', () => {
    expect(forecastKpi(pts('2026-01-01', [60, 65]), lead)).toBeNull();
  });
  it('returns null if consecutive points are more than 3 months apart', () => {
    const h = [...pts('2026-01-01', [60, 62]), { month: '2026-07-01', value: 70 }];
    expect(forecastKpi(h, lead)).toBeNull();
  });
  it('projects a perfect linear trend with zero-width band', () => {
    const f = forecastKpi(pts('2026-01-01', [60, 65, 70]), lead)!;
    expect(f.basedOnMonths).toBe(3);
    expect(f.points.map((p) => p.month)).toEqual(['2026-04-01', '2026-05-01', '2026-06-01']);
    expect(f.points.map((p) => Math.round(p.value))).toEqual([75, 80, 85]);
    expect(f.points[0].high - f.points[0].low).toBeCloseTo(0);
    expect(f.reachesTargetMonth).toBe('2026-05-01');
    expect(f.onTrack).toBe(true);
  });
  it('clamps percentages to 0..100', () => {
    const f = forecastKpi(pts('2026-01-01', [80, 90, 100]), lead)!;
    for (const p of f.points) { expect(p.high).toBeLessThanOrEqual(100); expect(p.value).toBeLessThanOrEqual(100); }
  });
  it('lower-better: falling days-to-sale reaches target', () => {
    const f = forecastKpi(pts('2026-01-01', [60, 55, 50]), days)!;
    expect(f.reachesTargetMonth).toBe('2026-04-01');
    expect(f.onTrack).toBe(true);
  });
  it('lower-better: rising days-to-sale is off track', () => {
    const f = forecastKpi(pts('2026-01-01', [50, 55, 60]), days)!;
    expect(f.reachesTargetMonth).toBeNull();
    expect(f.onTrack).toBe(false);
  });
  it('uses only the last 6 points', () => {
    const f = forecastKpi(pts('2026-01-01', [0, 0, 0, 10, 20, 30, 40, 50, 60]), lead)!;
    expect(f.basedOnMonths).toBe(6);
  });
  it('still forecasts when an old >3-month gap falls outside the last-6 window', () => {
    // A stale point far in the past has a large gap to the recent run, but
    // slice(-6) drops it before the gap check runs — the recent 6 are
    // contiguous, so this must still forecast.
    const stale = { month: '2025-01-01', value: 10 };
    const recent = pts('2026-01-01', [20, 22, 24, 26, 28, 30]); // 6 consecutive months
    const f = forecastKpi([stale, ...recent], lead);
    expect(f).not.toBeNull();
    expect(f!.basedOnMonths).toBe(6);
  });
  it('non-percentage values are clamped at 0', () => {
    const f = forecastKpi(pts('2026-01-01', [3, 2, 1]), STATIC_BENCHMARKS.prt_inventory_turns)!;
    for (const p of f.points) expect(p.low).toBeGreaterThanOrEqual(0);
  });
});
