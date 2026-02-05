/**
 * Signal to Action Mapping
 * 
 * Maps each SignalCode to one or more ActionTemplate IDs.
 * Used by the signal engine to instantiate actions.
 */

import { SignalCode } from './signalTypes';

export interface SignalToActionEntry {
  signalCode: Exclude<SignalCode, 'NONE'>;
  templateIds: string[];
  maxActionsPerAssessment: number;
}

/**
 * Mapping of signals to action templates
 * 
 * Rules:
 * - At most one instance per templateId per assessment
 * - When multiple templates exist, engine picks based on context
 */
export const SIGNAL_TO_ACTION_MAP: SignalToActionEntry[] = [
  {
    signalCode: 'PROCESS_NOT_STANDARDISED',
    templateIds: ['ACT-PNS-001', 'ACT-PNS-002'],
    maxActionsPerAssessment: 2
  },
  {
    signalCode: 'PROCESS_NOT_EXECUTED',
    templateIds: ['ACT-PNE-001', 'ACT-PNE-002'],
    maxActionsPerAssessment: 2
  },
  {
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    templateIds: ['ACT-ROM-001', 'ACT-ROM-002'],
    maxActionsPerAssessment: 2
  },
  {
    signalCode: 'KPI_NOT_DEFINED',
    templateIds: ['ACT-KND-001'],
    maxActionsPerAssessment: 1
  },
  {
    signalCode: 'KPI_NOT_REVIEWED',
    templateIds: ['ACT-KNR-001', 'ACT-KNR-002'],
    maxActionsPerAssessment: 2
  },
  {
    signalCode: 'CAPACITY_MISALIGNED',
    templateIds: ['ACT-CMA-001', 'ACT-CMA-002'],
    maxActionsPerAssessment: 2
  },
  {
    signalCode: 'TOOL_UNDERUTILISED',
    templateIds: ['ACT-TUU-001', 'ACT-TUU-002'],
    maxActionsPerAssessment: 2
  },
  {
    signalCode: 'GOVERNANCE_WEAK',
    templateIds: ['ACT-GWK-001', 'ACT-GWK-002'],
    maxActionsPerAssessment: 2
  }
];

/**
 * Get template IDs for a signal code
 */
export function getTemplateIdsForSignal(signalCode: Exclude<SignalCode, 'NONE'>): string[] {
  const entry = SIGNAL_TO_ACTION_MAP.find(e => e.signalCode === signalCode);
  return entry?.templateIds || [];
}

/**
 * Get max actions allowed for a signal
 */
export function getMaxActionsForSignal(signalCode: Exclude<SignalCode, 'NONE'>): number {
  const entry = SIGNAL_TO_ACTION_MAP.find(e => e.signalCode === signalCode);
  return entry?.maxActionsPerAssessment || 1;
}
