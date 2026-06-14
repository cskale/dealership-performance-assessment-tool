import { describe, it, expect } from 'vitest';
import { buildKpiValueRows, type KpiAnswerState } from '@/lib/kpiAnswerPersistence';
import type { DataQuestion } from '@/data/questionnaire';

const currencyQuestion: DataQuestion = {
  id: 'nvs-kpi-4',
  kind: 'data',
  text: 'gross profit per unit',
  category: 'performance_data',
  type: 'currency',
  kpiKey: 'nvs_gross_profit_per_unit',
  unit: 'EUR',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

const percentageQuestion: DataQuestion = {
  id: 'nvs-kpi-7',
  kind: 'data',
  text: 'lead response within 1 hour',
  category: 'performance_data',
  type: 'percentage',
  kpiKey: 'nvs_lead_response_1h_pct',
  unit: '%',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

const numericQuestion: DataQuestion = {
  id: 'uvs-kpi-2',
  kind: 'data',
  text: 'days to sale',
  category: 'performance_data',
  type: 'numeric',
  kpiKey: 'uvs_days_to_sale',
  unit: 'days',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

const dataQuestions: DataQuestion[] = [currencyQuestion, percentageQuestion, numericQuestion];

describe('buildKpiValueRows', () => {
  it('builds a row with value set and currency_code EUR for a provided currency answer', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      nvs_gross_profit_per_unit: { value: 1200, skipped: false },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toEqual([
      {
        assessment_id: 'assessment-1',
        dealership_id: 'dealership-1',
        question_id: 'nvs-kpi-4',
        kpi_key: 'nvs_gross_profit_per_unit',
        value: 1200,
        unit: 'EUR',
        currency_code: 'EUR',
        reference_period: 'last_calendar_month',
        skipped: false,
      },
    ]);
  });

  it('builds a row with value null and currency_code null for a skipped non-currency answer', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      nvs_lead_response_1h_pct: { value: null, skipped: true },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toEqual([
      {
        assessment_id: 'assessment-1',
        dealership_id: 'dealership-1',
        question_id: 'nvs-kpi-7',
        kpi_key: 'nvs_lead_response_1h_pct',
        value: null,
        unit: '%',
        currency_code: null,
        reference_period: 'last_calendar_month',
        skipped: true,
      },
    ]);
  });

  it('produces no row for a question never present in kpiAnswers', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      uvs_days_to_sale: { value: 45, skipped: false },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toHaveLength(1);
    expect(rows[0].kpi_key).toBe('uvs_days_to_sale');
  });

  it('produces no row for an entry that is neither skipped nor has a value', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      uvs_days_to_sale: { value: null, skipped: false },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toHaveLength(0);
  });
});
