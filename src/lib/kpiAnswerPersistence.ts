import type { DataQuestion } from '@/data/questionnaire';

export interface KpiAnswerState {
  value: number | null;
  skipped: boolean;
}

export interface KpiValueRow {
  assessment_id: string;
  dealership_id: string;
  question_id: string;
  kpi_key: string;
  value: number | null;
  unit: string;
  currency_code: string | null;
  reference_period: string;
  skipped: boolean;
}

/**
 * Builds upsert rows for assessment_kpi_values from in-memory KPI answer state.
 * - Never shown / untouched (no entry in kpiAnswers) -> no row.
 * - Touched but neither skipped nor given a value -> no row (avoids violating
 *   the table's CHECK constraint on partial input).
 * - Skipped -> value null, skipped true.
 * - Provided -> value set, skipped false.
 */
export function buildKpiValueRows(
  assessmentId: string,
  dealershipId: string,
  dataQuestions: DataQuestion[],
  kpiAnswers: Record<string, KpiAnswerState>
): KpiValueRow[] {
  const rows: KpiValueRow[] = [];

  for (const q of dataQuestions) {
    const answer = kpiAnswers[q.kpiKey];
    if (!answer) continue;
    if (!answer.skipped && answer.value === null) continue;

    rows.push({
      assessment_id: assessmentId,
      dealership_id: dealershipId,
      question_id: q.id,
      kpi_key: q.kpiKey,
      value: answer.skipped ? null : answer.value,
      unit: q.unit,
      // TODO: read currency from org/locale settings once available — hardcoded EUR for now
      currency_code: q.type === 'currency' ? 'EUR' : null,
      reference_period: q.referencePeriod,
      skipped: answer.skipped,
    });
  }

  return rows;
}
