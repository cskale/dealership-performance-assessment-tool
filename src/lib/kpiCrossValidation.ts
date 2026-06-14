/**
 * KPI Cross-Validation Rules ("Perception vs Data")
 *
 * Detects mismatches between a self-reported KPI value and a related
 * qualitative (scored) question answer — e.g. a dealer rates a capability
 * highly while the underlying KPI tells a different story.
 */

export type KpiCrossValSeverity = 'info' | 'warning' | 'critical';

export interface KpiCrossValRule {
  id: string;
  kpiKey: string;
  /**
   * Either a scored question id (answer on a 1-5 scale, compared against
   * qualitativeThreshold.minAnswer) or a department score id from
   * `scores` (0-100 scale, compared the same way against minAnswer).
   */
  qualitativeQuestionId: string;
  kpiThreshold: { direction: 'below' | 'above'; value: number };
  qualitativeThreshold: { minAnswer: number };
  flagLabel: string;
  narrative: string;
  severity: KpiCrossValSeverity;
}

export interface KpiCrossValFinding {
  ruleId: string;
  flagLabel: string;
  narrative: string;
  severity: KpiCrossValSeverity;
  kpiKey: string;
  kpiValue: number;
  qualitativeQuestionId: string;
  qualitativeAnswer: number;
}

/** Minimal shape needed from an assessment_kpi_values row. */
export interface KpiValueInput {
  kpi_key: string;
  value: number | null;
  skipped: boolean;
}

export const KPI_CROSS_VALIDATION_RULES: KpiCrossValRule[] = [
  {
    id: 'KPI-NVS-LEAD-RESPONSE',
    kpiKey: 'nvs_lead_response_1h_pct',
    qualitativeQuestionId: 'nvs-10',
    kpiThreshold: { direction: 'below', value: 40 },
    qualitativeThreshold: { minAnswer: 4 },
    flagLabel: 'CRM rated strong but lead response is slow',
    narrative: 'Your CRM utilisation was rated highly, but fewer than 40% of new vehicle leads receive a response within 1 hour. The tooling may be in place without the follow-up discipline to match.',
    severity: 'warning',
  },
  {
    id: 'KPI-UVS-AGED-STOCK',
    kpiKey: 'uvs_days_to_sale',
    qualitativeQuestionId: 'uvs-10',
    kpiThreshold: { direction: 'above', value: 75 },
    qualitativeThreshold: { minAnswer: 4 },
    flagLabel: 'Aged-stock strategy rated strong but stock turns slowly',
    narrative: 'Your aged inventory strategy was rated highly, but average days-to-sale exceeds 75 days. Review whether the process is being followed consistently in practice.',
    severity: 'warning',
  },
  {
    id: 'KPI-SVC-WORKSHOP-LOADING',
    kpiKey: 'svc_workshop_loading_pct',
    qualitativeQuestionId: 'svc-3',
    kpiThreshold: { direction: 'below', value: 60 },
    qualitativeThreshold: { minAnswer: 4 },
    flagLabel: 'Availability perception vs actual loading mismatch',
    narrative: 'Appointment availability was rated as strong, but workshop loading is below 60% of capacity. Capacity may be under-utilised even though customers perceive it as constrained.',
    severity: 'info',
  },
  {
    id: 'KPI-PTS-GROSS-MARGIN',
    kpiKey: 'prt_gross_margin_pct',
    qualitativeQuestionId: 'pts-10',
    kpiThreshold: { direction: 'below', value: 20 },
    qualitativeThreshold: { minAnswer: 4 },
    flagLabel: 'Vendor pricing discipline rated strong but parts margin is thin',
    narrative: 'Vendor pricing relationships were rated highly, but parts gross margin is below 20%. Strong supplier pricing discipline is not translating into department profitability.',
    severity: 'warning',
  },
  {
    id: 'KPI-FIN-NET-PROFIT',
    kpiKey: 'fin_net_profit_pct',
    qualitativeQuestionId: 'financial-operations',
    kpiThreshold: { direction: 'below', value: 1 },
    qualitativeThreshold: { minAnswer: 70 },
    flagLabel: 'Strong process perception, weak bottom line',
    narrative: 'The financial operations module scored well overall, but net profit margin is below 1%. Process maturity is not yet converting into financial results.',
    severity: 'critical',
  },
];

function kpiTriggers(rule: KpiCrossValRule, value: number): boolean {
  return rule.kpiThreshold.direction === 'below'
    ? value < rule.kpiThreshold.value
    : value > rule.kpiThreshold.value;
}

/**
 * Evaluates the seeded perception-gap rules against a set of KPI values,
 * scored question answers and department scores.
 *
 * Rules fire only when the relevant KPI value exists and is not skipped.
 */
export function evaluateKpiCrossValidations(
  kpiValues: KpiValueInput[],
  answers: Record<string, number>,
  scores: Record<string, number>
): KpiCrossValFinding[] {
  const findings: KpiCrossValFinding[] = [];
  const kpiByKey = new Map(kpiValues.map(row => [row.kpi_key, row]));

  for (const rule of KPI_CROSS_VALIDATION_RULES) {
    const kpiRow = kpiByKey.get(rule.kpiKey);
    if (!kpiRow || kpiRow.skipped || kpiRow.value === null) continue;
    if (!kpiTriggers(rule, kpiRow.value)) continue;

    const qualitativeAnswer = answers[rule.qualitativeQuestionId] ?? scores[rule.qualitativeQuestionId];
    if (qualitativeAnswer === undefined) continue;
    if (qualitativeAnswer < rule.qualitativeThreshold.minAnswer) continue;

    findings.push({
      ruleId: rule.id,
      flagLabel: rule.flagLabel,
      narrative: rule.narrative,
      severity: rule.severity,
      kpiKey: rule.kpiKey,
      kpiValue: kpiRow.value,
      qualitativeQuestionId: rule.qualitativeQuestionId,
      qualitativeAnswer,
    });
  }

  return findings;
}
