import { describe, it, expect } from 'vitest';
import { questionnaire, isDataQuestion } from '@/data/questionnaire';
import { PLAYGROUND_KPI_MAPPINGS } from '@/data/playgroundKpiMappings';

describe('PLAYGROUND_KPI_MAPPINGS', () => {
  const allQuestions = questionnaire.sections.flatMap((s) => s.questions);
  const validKpiKeys = new Set(
    allQuestions.filter(isDataQuestion).map((q) => q.kpiKey)
  );

  it('maps every field to a kpiKey that exists in the questionnaire data questions', () => {
    for (const [calculatorId, fieldMap] of Object.entries(PLAYGROUND_KPI_MAPPINGS)) {
      for (const [fieldId, kpiKey] of Object.entries(fieldMap)) {
        expect(validKpiKeys.has(kpiKey), `${calculatorId}.${fieldId} -> ${kpiKey}`).toBe(true);
      }
    }
  });

  it('maps the Reverse Sales Funnel Calculator avgGrossProfitPerUnit field to nvs_gross_profit_per_unit', () => {
    expect(PLAYGROUND_KPI_MAPPINGS['reverse-sales-funnel'].avgGrossProfitPerUnit).toBe(
      'nvs_gross_profit_per_unit'
    );
  });
});
