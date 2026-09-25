import { describe, it, expect } from 'vitest';
import { mergeTimeline, toMonth } from '@/lib/kpiTimeline';

describe('mergeTimeline', () => {
  const k = 'nvs_lead_response_1h_pct';
  it('check-in wins over assessment in same month; sorted ascending', () => {
    const r = mergeTimeline(
      k,
      [{ kpi_key: k, period_month: '2026-07-01', value: 72, entered_by_role: 'coach', updated_at: '2026-08-02T00:00:00Z' },
       { kpi_key: k, period_month: '2026-08-01', value: 74, entered_by_role: 'dealer', updated_at: '2026-09-01T00:00:00Z' }],
      [{ kpi_key: k, value: 67, skipped: false, assessment_created_at: '2026-07-27T10:00:00Z' },
       { kpi_key: k, value: 60, skipped: false, assessment_created_at: '2026-04-10T10:00:00Z' }],
    );
    expect(r.map((p) => [p.month, p.value, p.source])).toEqual([
      ['2026-04-01', 60, 'assessment'],
      ['2026-07-01', 72, 'checkin-coach'],
      ['2026-08-01', 74, 'checkin-dealer'],
    ]);
  });
  it('ignores skipped/null snapshots and other KPIs', () => {
    const r = mergeTimeline(k, [], [
      { kpi_key: k, value: null, skipped: true, assessment_created_at: '2026-07-27T10:00:00Z' },
      { kpi_key: 'x', value: 5, skipped: false, assessment_created_at: '2026-07-27T10:00:00Z' },
    ]);
    expect(r).toEqual([]);
  });
  it('toMonth', () => expect(toMonth('2026-07-27T23:59:00Z')).toBe('2026-07-01'));
});
