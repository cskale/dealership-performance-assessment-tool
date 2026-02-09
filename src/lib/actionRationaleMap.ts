/**
 * Action Rationale Mapping
 * 
 * Maps technical signal codes to human-readable, consulting-grade summaries.
 * Used throughout the Action Plan UI. No internal codes are exposed to users.
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
  PROCESS_NOT_STANDARDISED: {
    title: 'Process standardization needed',
    summary: 'Business processes lack consistent documentation and standards, leading to variable outcomes.',
    recommendation: 'Develop and document standard operating procedures to ensure consistency across the team.'
  },
  PROCESS_NOT_EXECUTED: {
    title: 'Process execution gaps identified',
    summary: 'Defined processes are not being consistently followed, reducing operational effectiveness.',
    recommendation: 'Reinforce process adherence through training, accountability measures, and regular compliance checks.'
  },
  ROLE_OWNERSHIP_MISSING: {
    title: 'Role clarity needed',
    summary: 'Key responsibilities lack clear ownership, creating accountability gaps.',
    recommendation: 'Define and document role responsibilities with clear owners for each key function.'
  },
  GOVERNANCE_WEAK: {
    title: 'Governance improvement opportunity',
    summary: 'Management oversight and decision-making structures need strengthening for better control.',
    recommendation: 'Establish regular review cadences, clear escalation paths, and approval workflows.'
  },
  KPI_NOT_DEFINED: {
    title: 'Performance metrics needed',
    summary: 'Key performance indicators are not yet established, making it difficult to measure success.',
    recommendation: 'Define measurable KPIs aligned with business objectives and set specific targets.'
  },
  KPI_NOT_REVIEWED: {
    title: 'Performance tracking gaps',
    summary: 'Performance metrics need more consistent tracking and review to drive improvement.',
    recommendation: 'Implement regular KPI review meetings with trend analysis and action planning.'
  },
  CAPACITY_MISALIGNED: {
    title: 'Capacity alignment needed',
    summary: 'Resource allocation may not match current workload requirements, affecting service delivery.',
    recommendation: 'Review and optimize staffing levels and workload distribution to match demand patterns.'
  },
  TOOL_UNDERUTILISED: {
    title: 'Technology optimization opportunity',
    summary: 'Available tools and systems are not being fully leveraged, reducing operational efficiency.',
    recommendation: 'Provide targeted training and integrate tools into daily workflows for better adoption.'
  },
};

/**
 * Fallback rationale when no signal code is available
 */
const FALLBACK_RATIONALE: ActionRationale = {
  title: 'Improvement area identified',
  summary: 'Assessment responses indicate an opportunity for improvement in this area.',
  recommendation: 'Review the action details and work with your team to implement the recommended changes.'
};

/**
 * Extract signal code from action_description if embedded there by the signal engine.
 * The signal engine formats descriptions like: "...\n\nTriggered because: SIGNAL_CODE\n..."
 */
function extractSignalCodeFromDescription(description: string | undefined): string | null {
  if (!description) return null;
  const match = description.match(/Triggered because:\s*([A-Z_]+)/);
  return match ? match[1] : null;
}

/**
 * Get human-readable rationale for an action.
 * 
 * Tries to extract the signal code from the action's description field,
 * then falls back to a safe generic rationale. NEVER uses department as a signal proxy.
 */
export function getHumanRationale(action: { action_description?: string; department?: string }): ActionRationale {
  // Try to extract signal code from description
  const signalCode = extractSignalCodeFromDescription(action.action_description);
  
  if (signalCode) {
    const normalized = signalCode.toUpperCase().replace(/-/g, '_');
    const rationale = signalCodeToRationale[normalized];
    if (rationale) return rationale;
  }
  
  return FALLBACK_RATIONALE;
}

/**
 * Clean action title: strip "Assess:", "Address:" prefixes and rubric language
 */
export function cleanActionTitle(title: string): string {
  return title
    .replace(/^(Assess|Address|Evaluate|Review):\s*/i, '')
    .replace(/\.\.\.$/, '')
    .trim();
}

/**
 * Clean action description: remove "Triggered because:", question IDs, and system language.
 * Returns a human-readable description suitable for display.
 */
export function cleanActionDescription(description: string): string {
  if (!description) return '';
  
  // Remove "Triggered because: ..." lines
  let cleaned = description.replace(/\n*Triggered because:.*$/gm, '');
  // Remove "Related questions: ..." lines  
  cleaned = cleaned.replace(/\n*Related questions:.*$/gm, '');
  // Remove "Rationale: ..." lines
  cleaned = cleaned.replace(/\n*Rationale:.*$/gm, '');
  // Remove "Current assessment score: ..." lines
  cleaned = cleaned.replace(/\n*Current assessment score:.*$/gm, '');
  // Remove trailing whitespace/newlines
  cleaned = cleaned.replace(/\s+$/, '').trim();
  
  return cleaned || 'Review the details and implement the recommended improvements.';
}

/**
 * Priority level display configuration
 */
export const priorityDisplay = {
  critical: {
    label: 'Critical',
    color: 'bg-red-500/10 text-red-600 border-red-200',
  },
  high: {
    label: 'High',
    color: 'bg-orange-500/10 text-orange-600 border-orange-200',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  },
  low: {
    label: 'Low',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
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
} as const;
