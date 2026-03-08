/**
 * Signal to Action Mapping
 * 
 * Maps each SignalCode to one or more ActionTemplate IDs.
 * Used by the signal engine to instantiate actions.
 * 
 * Includes both generic and KPI-specific template IDs.
 * When linkedKPIs are available, KPI-specific templates are preferred.
 */

import { SignalCode } from './signalTypes';

export interface SignalToActionEntry {
  signalCode: Exclude<SignalCode, 'NONE'>;
  templateIds: string[];
  /** KPI-specific template IDs — preferred when triggering question has linkedKPIs */
  kpiSpecificTemplateIds?: string[];
  maxActionsPerAssessment: number;
}

/**
 * Mapping of signals to action templates
 * 
 * Rules:
 * - At most one instance per templateId per assessment
 * - When linkedKPIs match, KPI-specific templates are preferred over generic
 * - Generic templates serve as fallbacks
 */
export const SIGNAL_TO_ACTION_MAP: SignalToActionEntry[] = [
  {
    signalCode: 'PROCESS_NOT_STANDARDISED',
    templateIds: ['ACT-PNS-001', 'ACT-PNS-002'],
    kpiSpecificTemplateIds: ['ACT-PNS-TDR', 'ACT-PNS-INV', 'ACT-PNS-NEG'],
    maxActionsPerAssessment: 3
  },
  {
    signalCode: 'PROCESS_NOT_EXECUTED',
    templateIds: ['ACT-PNE-001', 'ACT-PNE-002'],
    kpiSpecificTemplateIds: ['ACT-PNE-LRT', 'ACT-PNE-LCR', 'ACT-PNE-CLR', 'ACT-PNE-FNI'],
    maxActionsPerAssessment: 3
  },
  {
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    templateIds: ['ACT-ROM-001', 'ACT-ROM-002'],
    kpiSpecificTemplateIds: ['ACT-ROM-BDC', 'ACT-ROM-INC'],
    maxActionsPerAssessment: 3
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
    kpiSpecificTemplateIds: ['ACT-CMA-ASR', 'ACT-CMA-PRD'],
    maxActionsPerAssessment: 3
  },
  {
    signalCode: 'TOOL_UNDERUTILISED',
    templateIds: ['ACT-TUU-001', 'ACT-TUU-002'],
    kpiSpecificTemplateIds: ['ACT-TUU-DRT', 'ACT-TUU-FNI', 'ACT-TUU-IMS'],
    maxActionsPerAssessment: 3
  },
  {
    signalCode: 'GOVERNANCE_WEAK',
    templateIds: ['ACT-GWK-001', 'ACT-GWK-002'],
    kpiSpecificTemplateIds: ['ACT-GWK-CAN', 'ACT-GWK-INC'],
    maxActionsPerAssessment: 3
  }
];

/**
 * Get template IDs for a signal code (generic only)
 */
export function getTemplateIdsForSignal(signalCode: Exclude<SignalCode, 'NONE'>): string[] {
  const entry = SIGNAL_TO_ACTION_MAP.find(e => e.signalCode === signalCode);
  return entry?.templateIds || [];
}

/**
 * Get KPI-specific template IDs for a signal code
 */
export function getKPISpecificTemplateIds(signalCode: Exclude<SignalCode, 'NONE'>): string[] {
  const entry = SIGNAL_TO_ACTION_MAP.find(e => e.signalCode === signalCode);
  return entry?.kpiSpecificTemplateIds || [];
}

/**
 * Get all template IDs (generic + KPI-specific) for a signal code
 */
export function getAllTemplateIdsForSignal(signalCode: Exclude<SignalCode, 'NONE'>): string[] {
  const entry = SIGNAL_TO_ACTION_MAP.find(e => e.signalCode === signalCode);
  if (!entry) return [];
  return [...(entry.templateIds || []), ...(entry.kpiSpecificTemplateIds || [])];
}

/**
 * Get max actions allowed for a signal
 */
export function getMaxActionsForSignal(signalCode: Exclude<SignalCode, 'NONE'>): number {
  const entry = SIGNAL_TO_ACTION_MAP.find(e => e.signalCode === signalCode);
  return entry?.maxActionsPerAssessment || 1;
}
