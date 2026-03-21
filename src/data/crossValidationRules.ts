/**
 * Cross-Validation Rules
 *
 * Detect ratio-pair diagnostic signals where two related questions
 * are either in ratio or both low, indicating a compound issue.
 */

export type CrossValidationSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type CrossValidationMode = 'ratio' | 'both_low';

export interface CrossValidationRule {
  id: string;
  primaryQuestionId: string;
  relatedQuestionId: string;
  mode: CrossValidationMode;
  threshold: number;
  severity: CrossValidationSeverity;
  title: string;
  description: string;
}

export interface CrossValidationFinding {
  ruleId: string;
  title: string;
  description: string;
  severity: CrossValidationSeverity;
  primaryScore: number;
  relatedScore: number;
}

export const CROSS_VALIDATION_RULES: CrossValidationRule[] = [
  {
    id: 'CV-NVS-PRODUCTIVITY',
    primaryQuestionId: 'nvs-1',
    relatedQuestionId: 'nvs-7',
    mode: 'ratio',
    threshold: 3.0,
    severity: 'HIGH',
    title: 'Sales productivity vs training investment imbalance',
    description:
      'A significant gap exists between sales productivity and training investment. High productivity without training investment is unsustainable; low productivity despite training suggests an execution problem beyond skills gaps.',
  },
  {
    id: 'CV-SVC-UTIL-CSI',
    primaryQuestionId: 'svc-1',
    relatedQuestionId: 'svc-5',
    mode: 'both_low',
    threshold: 2.5,
    severity: 'HIGH',
    title: 'Combined low utilisation and customer satisfaction in service',
    description:
      'Both labour utilisation and customer satisfaction are below benchmark simultaneously, indicating a systemic service department issue. This combination typically signals capacity or process problems that are degrading both efficiency and the customer experience.',
  },
  {
    id: 'CV-SVC-PARTS-FILL',
    primaryQuestionId: 'svc-2',
    relatedQuestionId: 'svc-9',
    mode: 'both_low',
    threshold: 2.0,
    severity: 'HIGH',
    title: 'Effective labour rate and parts availability both under-performing',
    description:
      'Low effective labour rate and parts availability occurring together suggests that service revenue is being suppressed from both the labour and parts sides simultaneously. This compound gap typically costs 8–15% of total service revenue.',
  },
  {
    id: 'CV-FIN-PROFIT-CASH',
    primaryQuestionId: 'fin-1',
    relatedQuestionId: 'fin-2',
    mode: 'both_low',
    threshold: 2.0,
    severity: 'HIGH',
    title: 'Profitability and cash flow both under pressure',
    description:
      'Simultaneous weakness in profitability trend and cash flow consistency is a high-risk financial signal. This combination indicates structural financial challenges that may affect operational continuity if not addressed through a formal financial recovery programme.',
  },
  {
    id: 'CV-PTS-TURN-OBSOL',
    primaryQuestionId: 'pts-1',
    relatedQuestionId: 'pts-4',
    mode: 'both_low',
    threshold: 2.0,
    severity: 'MEDIUM',
    title: 'Low parts turnover and high obsolescence risk',
    description:
      'Below-benchmark parts turnover combined with elevated obsolescence risk indicates that the parts inventory is not being actively managed. This compound signal typically results in 15–25% of inventory value being tied up in non-moving stock, suppressing working capital and fill rates.',
  },
];

// ---------------------------------------------------------------------------
// Evaluation function
// ---------------------------------------------------------------------------

export function evaluateCrossValidations(
  answers: Record<string, number>
): CrossValidationFinding[] {
  const findings: CrossValidationFinding[] = [];

  for (const rule of CROSS_VALIDATION_RULES) {
    const primaryScore = answers[rule.primaryQuestionId];
    const relatedScore = answers[rule.relatedQuestionId];

    if (primaryScore == null || relatedScore == null) continue;

    let triggered = false;

    if (rule.mode === 'ratio') {
      const ratio = primaryScore / relatedScore;
      triggered = ratio >= rule.threshold || ratio <= 1 / rule.threshold;
    } else if (rule.mode === 'both_low') {
      triggered = primaryScore <= rule.threshold && relatedScore <= rule.threshold;
    }

    if (triggered) {
      findings.push({
        ruleId: rule.id,
        title: rule.title,
        description: rule.description,
        severity: rule.severity,
        primaryScore,
        relatedScore,
      });
    }
  }

  return findings;
}
