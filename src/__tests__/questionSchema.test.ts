import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import { ScoredQuestionSchema, QuestionSchema, validateQuestionSet } from '@/lib/questionSchema';

describe('questionSchema', () => {
  it('validates the entire static questionnaire', () => {
    const allQuestions = questionnaire.sections.flatMap(s => s.questions);
    expect(() => validateQuestionSet(allQuestions)).not.toThrow();
  });

  it('rejects a data question carrying a stray weight field', () => {
    const dataQuestionWithWeight = {
      kind: 'data',
      id: 'test-data-1',
      text: 'Test data question',
      category: 'test',
      type: 'numeric',
      kpiKey: 'test_kpi',
      unit: 'units',
      referencePeriod: 'current',
      weight: 1.5, // stray field — not allowed on DataQuestion
    };

    const result = QuestionSchema.safeParse(dataQuestionWithWeight);
    expect(result.success).toBe(false);
  });

  it('rejects a scored question with weight 0', () => {
    const scoredQuestionZeroWeight = {
      kind: 'scored',
      id: 'test-scored-1',
      text: 'Test scored question',
      category: 'test',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['a', 'b', 'c', 'd', 'e'] },
      weight: 0,
    };

    const result = ScoredQuestionSchema.safeParse(scoredQuestionZeroWeight);
    expect(result.success).toBe(false);
  });

  it('accepts a fully-populated synthetic data question', () => {
    const fullyPopulatedDataQuestion = {
      kind: 'data',
      id: 'kpi-test-1',
      text: 'What was your monthly new vehicle sales volume?',
      description: 'Enter the total units sold last month',
      category: 'volume',
      purpose: 'Measures sales volume',
      situationAnalysis: 'Volume drives revenue',
      linkedKPIs: ['Monthly Revenue'],
      benefits: 'Better forecasting',
      primarySignalCode: 'CAPACITY_MISALIGNED',
      secondarySignalCode: 'KPI_NOT_REVIEWED',
      rootCauseDimension: 'structure',
      translations: {
        en: { text: 'What was your monthly new vehicle sales volume?' },
      },
      type: 'numeric',
      kpiKey: 'nvs_monthly_units',
      unit: 'units',
      referencePeriod: 'last_calendar_month',
      validRange: { min: 0, max: 1000 },
      formula: { expression: 'sum(units_sold)', example: '42', dataSource: 'DMS' },
      benchmarkRef: 'nvs_monthly_units_benchmark',
      subSection: 'volume-metrics',
    };

    expect(() => validateQuestionSet([fullyPopulatedDataQuestion])).not.toThrow();
  });
});
