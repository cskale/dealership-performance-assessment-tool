/**
 * Action Rationale Mapping - P1.2
 * 
 * This file provides human-readable transformations for technical signal codes
 * and action rationales. Used throughout the Action Plan UI to replace internal
 * codes with consulting-grade summaries.
 */

export interface ActionRationale {
  title: string;
  summary: string;
  recommendation: string;
}

/**
 * Maps technical signal codes to human-friendly language
 */
export const signalCodeToRationale: Record<string, ActionRationale> = {
  // Process signals
  PROCESS_NOT_STANDARDISED: {
    title: 'Process standardization needed',
    summary: 'Business processes lack consistent documentation and standards',
    recommendation: 'Develop and document standard operating procedures to ensure consistency across the team'
  },
  PROCESS_NOT_EXECUTED: {
    title: 'Process execution gaps identified',
    summary: 'Defined processes are not being consistently followed',
    recommendation: 'Reinforce process adherence through training and accountability measures'
  },
  
  // Role & governance signals
  ROLE_OWNERSHIP_MISSING: {
    title: 'Role clarity needed',
    summary: 'Key responsibilities lack clear ownership assignment',
    recommendation: 'Define and document role responsibilities to ensure accountability'
  },
  GOVERNANCE_WEAK: {
    title: 'Governance improvement opportunity',
    summary: 'Management oversight and decision-making structures need strengthening',
    recommendation: 'Establish regular review cadences and clear escalation paths'
  },
  
  // KPI signals
  KPI_NOT_DEFINED: {
    title: 'Performance metrics needed',
    summary: 'Key performance indicators are not yet established',
    recommendation: 'Define measurable KPIs aligned with business objectives'
  },
  KPI_NOT_REVIEWED: {
    title: 'Performance tracking gaps',
    summary: 'Performance metrics need more consistent tracking and review',
    recommendation: 'Implement regular KPI review meetings with trend analysis'
  },
  
  // Capacity signals
  CAPACITY_MISALIGNED: {
    title: 'Capacity alignment needed',
    summary: 'Resource allocation may not match current workload requirements',
    recommendation: 'Review and optimize staffing levels and workload distribution'
  },
  
  // Tool signals
  TOOL_UNDERUTILISED: {
    title: 'Technology optimization opportunity',
    summary: 'Available tools and systems are not being fully leveraged',
    recommendation: 'Provide training and integrate tools into daily workflows'
  },
  
  // Legacy/fallback codes
  LOW_SCORE: {
    title: 'Improvement area identified',
    summary: 'Assessment responses indicate an opportunity for improvement',
    recommendation: 'Focus on targeted improvements in this area'
  },
  MEDIUM_SCORE: {
    title: 'Enhancement opportunity',
    summary: 'Current performance is adequate but could be strengthened',
    recommendation: 'Consider incremental improvements to reach best-in-class'
  },
  
  // Default fallback
  UNKNOWN: {
    title: 'Area for attention',
    summary: 'This area has been flagged for review based on assessment responses',
    recommendation: 'Review the detailed responses and identify specific improvement actions'
  }
};

/**
 * Get human-readable rationale from a technical code
 * Falls back gracefully if code is unknown
 */
export function getHumanRationale(code: string | undefined): ActionRationale {
  if (!code) return signalCodeToRationale.UNKNOWN;
  
  const normalized = code.toUpperCase().replace(/-/g, '_');
  return signalCodeToRationale[normalized] || signalCodeToRationale.UNKNOWN;
}

/**
 * Format a list of triggering question IDs into readable text
 */
export function formatTriggeringQuestions(questionIds: string[] | undefined, moduleName?: string): string {
  if (!questionIds || questionIds.length === 0) {
    return moduleName ? `Based on responses in ${moduleName}` : 'Based on assessment responses';
  }
  
  const questionCount = questionIds.length;
  const prefix = moduleName ? `Based on ${questionCount} response${questionCount > 1 ? 's' : ''} in ${moduleName}` : 
                              `Based on ${questionCount} assessment response${questionCount > 1 ? 's' : ''}`;
  
  return prefix;
}

/**
 * Priority level display configuration
 */
export const priorityDisplay = {
  critical: {
    label: 'Critical',
    color: 'bg-red-500/10 text-red-600 border-red-200',
    icon: 'AlertTriangle'
  },
  high: {
    label: 'High',
    color: 'bg-orange-500/10 text-orange-600 border-orange-200',
    icon: 'AlertCircle'
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    icon: 'Clock'
  },
  low: {
    label: 'Low',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    icon: 'Info'
  }
} as const;

/**
 * Status display configuration
 */
export const statusDisplay = {
  'Open': {
    label: 'Open',
    color: 'bg-muted text-muted-foreground',
    description: 'Not yet started'
  },
  'In Progress': {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-600',
    description: 'Currently being worked on'
  },
  'Completed': {
    label: 'Completed',
    color: 'bg-green-500/10 text-green-600',
    description: 'Successfully completed'
  },
  'Blocked': {
    label: 'Blocked',
    color: 'bg-red-500/10 text-red-600',
    description: 'Cannot proceed due to dependency'
  }
} as const;
