import { describe, it, expect } from 'vitest';
import { generateKpiSignals, KPI_SIGNAL_MAP } from '@/lib/kpiSignalEngine';
import { STATIC_BENCHMARKS } from '@/lib/kpiBenchmarks';

// nvs_lead_response_1h_pct: higher-better, target 80, warning 60, critical 40
// uvs_days_to_sale: lower-better, target 45, warning 60, critical 90

describe('KPI_SIGNAL_MAP', () => {
  it('covers every static benchmark key with valid module keys', () => {
    const validModules = [
      'new-vehicle-sales', 'used-vehicle-sales', 'service-performance',
      'parts-inventory', 'financial-operations',
    ];
    for (const key of Object.keys(STATIC_BENCHMARKS)) {
      expect(KPI_SIGNAL_MAP[key], `missing map for ${key}`).toBeDefined();
      expect(validModules).toContain(KPI_SIGNAL_MAP[key].moduleKey);
      expect(KPI_SIGNAL_MAP[key].signalCode).not.toBe('NONE');
    }
  });
});

describe('generateKpiSignals — higher-better banding', () => {
  const bm = STATIC_BENCHMARKS;

  it('below critical → HIGH', () => {
    const [s] = generateKpiSignals({ nvs_lead_response_1h_pct: 30 }, bm);
    expect(s.severity).toBe('HIGH');
    expect(s.signalCode).toBe('PROCESS_NOT_EXECUTED');
    expect(s.moduleKey).toBe('new-vehicle-sales');
    expect(s.actualValue).toBe(30);
    expect(s.targetValue).toBe(80);
  });

  it('exactly at critical → MEDIUM (meets critical, breaches warning)', () => {
    const [s] = generateKpiSignals({ nvs_lead_response_1h_pct: 40 }, bm);
    expect(s.severity).toBe('MEDIUM');
  });

  it('between warning and target → LOW', () => {
    const [s] = generateKpiSignals({ nvs_lead_response_1h_pct: 70 }, bm);
    expect(s.severity).toBe('LOW');
  });

  it('exactly at target → no signal', () => {
    expect(generateKpiSignals({ nvs_lead_response_1h_pct: 80 }, bm)).toHaveLength(0);
  });

  it('above target → no signal', () => {
    expect(generateKpiSignals({ nvs_lead_response_1h_pct: 95 }, bm)).toHaveLength(0);
  });
});

describe('generateKpiSignals — lower-better banding', () => {
  const bm = STATIC_BENCHMARKS;

  it('above critical → HIGH', () => {
    const [s] = generateKpiSignals({ uvs_days_to_sale: 120 }, bm);
    expect(s.severity).toBe('HIGH');
  });

  it('exactly at critical → MEDIUM', () => {
    const [s] = generateKpiSignals({ uvs_days_to_sale: 90 }, bm);
    expect(s.severity).toBe('MEDIUM');
  });

  it('between target and warning → LOW', () => {
    const [s] = generateKpiSignals({ uvs_days_to_sale: 50 }, bm);
    expect(s.severity).toBe('LOW');
  });

  it('exactly at target → no signal', () => {
    expect(generateKpiSignals({ uvs_days_to_sale: 45 }, bm)).toHaveLength(0);
  });
});

describe('generateKpiSignals — gap + robustness', () => {
  const bm = STATIC_BENCHMARKS;

  it('computes gapPercent to 1 decimal', () => {
    // actual 40 vs target 80 → 50.0
    const [s] = generateKpiSignals({ nvs_lead_response_1h_pct: 40 }, bm);
    expect(s.gapPercent).toBe(50.0);
    // actual 50 vs target 45 (lower-better) → |50-45|/45*100 = 11.1
    const [s2] = generateKpiSignals({ uvs_days_to_sale: 50 }, bm);
    expect(s2.gapPercent).toBe(11.1);
  });

  it('skips unknown KPI keys', () => {
    expect(generateKpiSignals({ not_a_kpi: 10 }, bm)).toHaveLength(0);
  });

  it('skips non-finite values', () => {
    expect(generateKpiSignals({ nvs_lead_response_1h_pct: NaN }, bm)).toHaveLength(0);
    expect(generateKpiSignals({ uvs_days_to_sale: Infinity }, bm)).toHaveLength(0);
  });

  it('skips KPIs missing from benchmarks map', () => {
    const partial = { nvs_lead_response_1h_pct: STATIC_BENCHMARKS.nvs_lead_response_1h_pct };
    expect(generateKpiSignals({ uvs_days_to_sale: 200 }, partial)).toHaveLength(0);
  });

  it('emits one signal per breaching KPI, carries unit', () => {
    const signals = generateKpiSignals(
      { nvs_lead_response_1h_pct: 30, uvs_days_to_sale: 120, svc_workshop_loading_pct: 90 },
      bm
    );
    expect(signals).toHaveLength(2); // svc at 90 ≥ target 85 → healthy
    expect(signals.every(s => s.unit.length > 0)).toBe(true);
  });
});
