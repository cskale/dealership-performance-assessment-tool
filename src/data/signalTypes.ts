/**
 * Signal Taxonomy V1
 * 
 * Global signal codes used across all assessment modules.
 * Each signal represents a specific type of operational weakness.
 */

export type SignalCode =
  | 'PROCESS_NOT_STANDARDISED'
  | 'PROCESS_NOT_EXECUTED'
  | 'ROLE_OWNERSHIP_MISSING'
  | 'KPI_NOT_DEFINED'
  | 'KPI_NOT_REVIEWED'
  | 'CAPACITY_MISALIGNED'
  | 'TOOL_UNDERUTILISED'
  | 'GOVERNANCE_WEAK'
  | 'NONE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Signal {
  signalCode: SignalCode;
  severity: Severity;
  moduleKey: string;
  triggeringQuestionIds: string[];
  rationale: string;
}

export interface SignalMapping {
  questionId: string;
  moduleKey: string;
  primarySignalCode: SignalCode;
  secondarySignalCode?: SignalCode;
  severityRule: 'standard' | 'weighted';
  notes: string;
}

export const SIGNAL_DESCRIPTIONS: Record<Exclude<SignalCode, 'NONE'>, string> = {
  PROCESS_NOT_STANDARDISED: 'Standard operating procedures are missing or inconsistent',
  PROCESS_NOT_EXECUTED: 'Defined processes are not being followed consistently',
  ROLE_OWNERSHIP_MISSING: 'Clear accountability and role ownership is not established',
  KPI_NOT_DEFINED: 'Key performance indicators are not clearly defined',
  KPI_NOT_REVIEWED: 'Performance metrics are not regularly reviewed or acted upon',
  CAPACITY_MISALIGNED: 'Resources and capacity are not aligned with demand',
  TOOL_UNDERUTILISED: 'Available tools and technology are not being fully leveraged',
  GOVERNANCE_WEAK: 'Management oversight and governance structures need improvement'
};
