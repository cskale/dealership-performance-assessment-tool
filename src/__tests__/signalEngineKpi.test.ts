import { describe, it, expect } from 'vitest';
import {
  mergeKpiSignals,
  instantiateActions,
  generateActionsFromAssessment,
  type GeneratedSignal,
} from '@/lib/signalEngine';
import type { KpiSignal } from '@/lib/kpiSignalEngine';
import { STATIC_BENCHMARKS } from '@/lib/kpiBenchmarks';
import { KPI_ACTION_TEMPLATES } from '@/data/actionTemplatesKpi';

// Helper: a qualitative signal as produced by generateSignals
const qualSignal = (over: Partial<GeneratedSignal> = {}): GeneratedSignal => ({
  signalCode: 'PROCESS_NOT_EXECUTED',
  severity: 'LOW',
  moduleKey: 'new-vehicle-sales',
  triggeringQuestionIds: ['nvs-1'],
  rationale: 'Detected in New Vehicle Sales',
  sourceQuestionScores: { 'nvs-1': 2 },
  ...over,
});

// Helper: a KPI signal
const kpiSignal = (over: Partial<KpiSignal> = {}): KpiSignal => ({
  kpiKey: 'nvs_lead_response_1h_pct',
  signalCode: 'PROCESS_NOT_EXECUTED',
  moduleKey: 'new-vehicle-sales',
  severity: 'HIGH',
  actualValue: 30,
  targetValue: 80,
  gapPercent: 50,
  unit: '%',
  ...over,
});

describe('mergeKpiSignals — matched signal', () => {
  it('escalates matched signal severity one step and attaches gap + linkedKPI', () => {
    const signals = [qualSignal({ severity: 'LOW' })];
    const merged = mergeKpiSignals(signals, [kpiSignal()]);

    expect(merged).toHaveLength(1);
    const s = merged[0];
    expect(s.severity).toBe('MEDIUM'); // LOW -> MEDIUM (one step)
    expect(s.kpiGap).toBeDefined();
    expect(s.kpiGap?.kpiKey).toBe('nvs_lead_response_1h_pct');
    expect(s.linkedKPIs).toContain('nvs_lead_response_1h_pct');
  });

  it('does not mutate the original signal object', () => {
    const original = qualSignal({ severity: 'LOW' });
    const merged = mergeKpiSignals([original], [kpiSignal()]);
    expect(original.severity).toBe('LOW');
    expect(original.kpiGap).toBeUndefined();
    expect(merged[0]).not.toBe(original);
  });

  it('MEDIUM -> HIGH, HIGH stays HIGH', () => {
    const med = mergeKpiSignals([qualSignal({ severity: 'MEDIUM' })], [kpiSignal()]);
    expect(med[0].severity).toBe('HIGH');
    const high = mergeKpiSignals([qualSignal({ severity: 'HIGH' })], [kpiSignal()]);
    expect(high[0].severity).toBe('HIGH');
  });

  it('keeps the higher-gap kpiGap when two KPI signals match the same signal', () => {
    const signals = [qualSignal({ severity: 'LOW' })];
    const low = kpiSignal({ kpiKey: 'nvs_lead_response_1h_pct', gapPercent: 20 });
    const high = kpiSignal({ kpiKey: 'nvs_gross_profit_per_unit', signalCode: 'PROCESS_NOT_EXECUTED', gapPercent: 70 });
    const merged = mergeKpiSignals(signals, [low, high]);
    expect(merged[0].kpiGap?.gapPercent).toBe(70);
    expect(merged[0].linkedKPIs).toEqual(
      expect.arrayContaining(['nvs_lead_response_1h_pct', 'nvs_gross_profit_per_unit'])
    );
  });
});

describe('mergeKpiSignals — unmatched signal becomes standalone', () => {
  it('creates a standalone GeneratedSignal with empty triggers and kpiGap set', () => {
    const merged = mergeKpiSignals([], [kpiSignal()]);
    expect(merged).toHaveLength(1);
    const s = merged[0];
    expect(s.triggeringQuestionIds).toEqual([]);
    expect(s.sourceQuestionScores).toEqual({});
    expect(s.kpiGap).toBeDefined();
    expect(s.severity).toBe('HIGH');
    expect(s.moduleKey).toBe('new-vehicle-sales');
    expect(s.signalCode).toBe('PROCESS_NOT_EXECUTED');
    expect(s.linkedKPIs).toEqual(['nvs_lead_response_1h_pct']);
    // rationale built from formatted values
    expect(s.rationale).toContain('vs benchmark');
    expect(s.rationale).toContain('30%');
    expect(s.rationale).toContain('80%');
    expect(s.rationale).toContain('50%');
  });
});

describe('instantiateActions — KPI template first for gap signals', () => {
  it('selects and interpolates the KPI-specific template for a signal with kpiGap', () => {
    const signal = qualSignal({ severity: 'HIGH', kpiGap: kpiSignal(), linkedKPIs: ['nvs_lead_response_1h_pct'] });
    const actions = instantiateActions([signal], 15);
    const expectedId = KPI_ACTION_TEMPLATES['nvs_lead_response_1h_pct'].templateId;
    const kpiAction = actions.find((a) => a.templateId === expectedId);
    expect(kpiAction).toBeDefined();
    // interpolated placeholders resolved (no raw {actual}/{target} tokens)
    expect(kpiAction!.title).not.toContain('{');
    expect(kpiAction!.title).toContain('30%');
    expect(kpiAction!.title).toContain('80%');
  });

  it('falls through to tiered/generic logic when no KPI template exists for the kpiKey', () => {
    // kpiKey with no KPI_ACTION_TEMPLATES entry, but valid module+signal → tiered path
    const orphan = kpiSignal({ kpiKey: 'nonexistent_kpi_key' });
    const signal = qualSignal({ severity: 'HIGH', kpiGap: orphan });
    const actions = instantiateActions([signal], 15);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].templateId).not.toContain('nonexistent');
  });
});

describe('generateActionsFromAssessment — parity (no KPI values)', () => {
  const answers: Record<string, number> = {
    'nvs-1': 2, 'nvs-2': 2, 'nvs-3': 3,
    'uvs-1': 2, 'uvs-2': 3,
    'svc-1': 2, 'svc-2': 2, 'svc-3': 3,
    'pts-1': 2, 'fin-1': 2,
  };
  const weights: Record<string, number> = Object.fromEntries(
    Object.keys(answers).map((k) => [k, 1.5])
  );

  it('produces the same set of action templateIds as before this task', () => {
    const result = generateActionsFromAssessment(answers, weights);
    const ids = result.actions.map((a) => a.templateId).sort();
    expect(ids).toEqual([
      'TIERED-FIN-NP-DEV',
      'TIERED-NVS-CR-DEV',
      'TIERED-NVS-LR-DEV',
      'TIERED-PTS-OB-DEV',
      'TIERED-SVC-WU-DEV',
      'TIERED-UVS-ST-DEV',
    ]);
  });

  it('still assigns rank + isQuickWin fields (prioritiser runs) and empty kpiSignals', () => {
    const result = generateActionsFromAssessment(answers, weights);
    expect(result.kpiSignals).toEqual([]);
    expect(result.actions.every((a) => typeof a.rank === 'number')).toBe(true);
    expect(result.actions.every((a) => typeof a.isQuickWin === 'boolean')).toBe(true);
  });
});

describe('generateActionsFromAssessment — with KPI values', () => {
  const answers: Record<string, number> = { 'nvs-1': 2, 'nvs-2': 2 };
  const weights: Record<string, number> = { 'nvs-1': 1.5, 'nvs-2': 1.5 };

  it('generates KPI signals and merges them into the engine output', () => {
    const kpiValues = { nvs_lead_response_1h_pct: 30 };
    const result = generateActionsFromAssessment(
      answers,
      weights,
      undefined,
      undefined,
      undefined,
      undefined,
      kpiValues,
      STATIC_BENCHMARKS
    );
    expect(result.kpiSignals.length).toBeGreaterThan(0);
    expect(result.kpiSignals[0].kpiKey).toBe('nvs_lead_response_1h_pct');
    // a KPI-specific action should now appear
    const kpiTemplateId = KPI_ACTION_TEMPLATES['nvs_lead_response_1h_pct'].templateId;
    expect(result.actions.some((a) => a.templateId === kpiTemplateId)).toBe(true);
  });
});
