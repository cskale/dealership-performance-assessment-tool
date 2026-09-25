import { describe, it, expect, vi, beforeEach } from 'vitest';

const results: Record<string, any> = {};
vi.mock('@/integrations/supabase/client', () => {
  const chain = (table: string) => {
    const c: any = {};
    for (const m of ['select', 'eq', 'order', 'limit']) c[m] = () => c;
    c.maybeSingle = async () => results[table];
    return c;
  };
  return { supabase: { from: (t: string) => chain(t) } };
});

import { fetchLatestKpiValue } from '@/hooks/useKpiValues';

describe('fetchLatestKpiValue', () => {
  beforeEach(() => { for (const k in results) delete results[k]; });
  it('prefers a newer check-in', async () => {
    results.assessment_kpi_values = { data: { value: 67, kpi_key: 'k', assessments: { created_at: '2026-07-27T10:00:00Z' } }, error: null };
    results.kpi_checkins = { data: { value: 74, period_month: '2026-08-01' }, error: null };
    const r = await fetchLatestKpiValue('d', 'k');
    expect(r?.row.value).toBe(74);
    expect(r?.source).toBe('checkin');
    expect(r?.assessmentCreatedAt).toBe('2026-08-01');
  });
  it('falls back to assessment when no check-in', async () => {
    results.assessment_kpi_values = { data: { value: 67, kpi_key: 'k', assessments: { created_at: '2026-07-27T10:00:00Z' } }, error: null };
    results.kpi_checkins = { data: null, error: null };
    const r = await fetchLatestKpiValue('d', 'k');
    expect(r?.row.value).toBe(67);
    expect(r?.source).toBe('assessment');
  });
});
