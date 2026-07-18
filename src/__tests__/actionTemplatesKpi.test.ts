import { describe, it, expect } from 'vitest';
import {
  KPI_ACTION_TEMPLATES,
  interpolateKpiTemplate,
  type KpiActionTemplate,
} from '@/data/actionTemplatesKpi';
import { KPI_SIGNAL_MAP, type KpiSignal } from '@/lib/kpiSignalEngine';

function makeSignal(overrides: Partial<KpiSignal>): KpiSignal {
  return {
    kpiKey: 'nvs_lead_response_1h_pct',
    signalCode: 'PROCESS_NOT_EXECUTED',
    moduleKey: 'new-vehicle-sales',
    severity: 'HIGH',
    actualValue: 45,
    targetValue: 80,
    gapPercent: 43.8,
    unit: '%',
    ...overrides,
  };
}

describe('KPI_ACTION_TEMPLATES coverage', () => {
  it('has a template for every KPI_SIGNAL_MAP key', () => {
    for (const kpiKey of Object.keys(KPI_SIGNAL_MAP)) {
      expect(KPI_ACTION_TEMPLATES[kpiKey], `missing template for ${kpiKey}`).toBeDefined();
    }
  });

  it('has exactly 22 templates (no extras)', () => {
    expect(Object.keys(KPI_ACTION_TEMPLATES)).toHaveLength(
      Object.keys(KPI_SIGNAL_MAP).length
    );
  });

  it('every template kpiKey field matches its record key', () => {
    for (const [key, template] of Object.entries(KPI_ACTION_TEMPLATES)) {
      expect(template.kpiKey).toBe(key);
    }
  });

  it('every template signalCode matches KPI_SIGNAL_MAP for that kpiKey', () => {
    for (const [key, template] of Object.entries(KPI_ACTION_TEMPLATES)) {
      expect(template.signalCode).toBe(KPI_SIGNAL_MAP[key].signalCode);
    }
  });

  it('templateIds are unique and follow ACT-KPI-<kpikey-kebab> pattern', () => {
    const ids = new Set<string>();
    for (const [key, template] of Object.entries(KPI_ACTION_TEMPLATES)) {
      expect(ids.has(template.templateId)).toBe(false);
      ids.add(template.templateId);
      const expectedId = `ACT-KPI-${key.replace(/_/g, '-')}`;
      expect(template.templateId).toBe(expectedId);
    }
  });

  it('every template has 3 implementation steps with valid PrimaryRole values', () => {
    const validRoles = new Set([
      'General Manager', 'Sales Manager', 'Sales Director',
      'Workshop Controller', 'Service Manager', 'Parts Manager',
      'F&I Director', 'BDC Manager', 'HR Manager',
      'Finance Director', 'Customer Experience Manager',
      'Operations Manager', 'Department Manager', 'Used Vehicle Manager',
      'IT Manager', 'Marketing Manager',
    ]);
    for (const template of Object.values(KPI_ACTION_TEMPLATES)) {
      expect(template.implementationSteps).toHaveLength(3);
      for (const step of template.implementationSteps) {
        expect(validRoles.has(step.primaryRole), `invalid role: ${step.primaryRole}`).toBe(true);
      }
    }
  });
});

describe('interpolateKpiTemplate', () => {
  const template = KPI_ACTION_TEMPLATES['nvs_lead_response_1h_pct'];

  it('replaces {actual}, {target}, {gap}, {unit} with % formatting', () => {
    const signal = makeSignal({ actualValue: 45, targetValue: 80, gapPercent: 43.8, unit: '%' });
    const result = interpolateKpiTemplate(template, signal);
    expect(result.title).toContain('45%');
    expect(result.title).toContain('80%');
    expect(result.description).toContain('45%');
    expect(result.description).toContain('80%');
    expect(result.description).toContain('43.8%');
  });

  it('formats EUR values with euro sign and thousands separator', () => {
    const eurTemplate = KPI_ACTION_TEMPLATES['nvs_gross_profit_per_unit'];
    const signal = makeSignal({
      kpiKey: 'nvs_gross_profit_per_unit',
      actualValue: 1200,
      targetValue: 2500,
      gapPercent: 52,
      unit: 'EUR',
    });
    const result = interpolateKpiTemplate(eurTemplate, signal);
    const allText = result.title + result.description + result.implementationSteps.map(s => s.text).join(' ');
    expect(allText).toMatch(/€1,200|€2,500/);
  });

  it('formats non-EUR/% units as "value unit"', () => {
    const daysTemplate = KPI_ACTION_TEMPLATES['uvs_days_to_sale'];
    const signal = makeSignal({
      kpiKey: 'uvs_days_to_sale',
      actualValue: 65,
      targetValue: 45,
      gapPercent: 44.4,
      unit: 'days',
    });
    const result = interpolateKpiTemplate(daysTemplate, signal);
    expect(result.title).toContain('65 days');
    expect(result.title).toContain('45 days');
  });

  it('leaves no unreplaced { characters after interpolation', () => {
    for (const [kpiKey, template] of Object.entries(KPI_ACTION_TEMPLATES)) {
      const signal = makeSignal({
        kpiKey,
        signalCode: template.signalCode,
        actualValue: 50,
        targetValue: 60,
        gapPercent: 16.7,
        unit: 'EUR',
      });
      const result = interpolateKpiTemplate(template, signal);
      expect(result.title).not.toMatch(/[{}]/);
      expect(result.description).not.toMatch(/[{}]/);
      for (const step of result.implementationSteps) {
        expect(step.text).not.toMatch(/[{}]/);
      }
    }
  });

  it('replaces missing/NaN actualValue with empty string, collapsing double spaces', () => {
    const signal = makeSignal({ actualValue: NaN });
    const result = interpolateKpiTemplate(template, signal);
    expect(result.title).not.toMatch(/[{}]/);
    expect(result.title).not.toMatch(/\s{2,}/);
    expect(result.description).not.toMatch(/\s{2,}/);
  });

  it('replaces missing/NaN targetValue with empty string, collapsing double spaces', () => {
    const signal = makeSignal({ targetValue: NaN });
    const result = interpolateKpiTemplate(template, signal);
    expect(result.title).not.toMatch(/[{}]/);
    expect(result.title).not.toMatch(/\s{2,}/);
  });

  it('replaces missing/NaN gapPercent with empty string, collapsing double spaces', () => {
    const signal = makeSignal({ gapPercent: NaN });
    const result = interpolateKpiTemplate(template, signal);
    expect(result.description).not.toMatch(/[{}]/);
    expect(result.description).not.toMatch(/\s{2,}/);
  });

  it('does not mutate the original template', () => {
    const before = JSON.stringify(template);
    interpolateKpiTemplate(template, makeSignal({}));
    expect(JSON.stringify(template)).toBe(before);
  });
});
