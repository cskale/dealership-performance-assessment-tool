/**
 * Action Rationale Mapping
 * 
 * Maps technical signal codes to human-readable, consulting-grade summaries.
 * Uses template-driven patterns (B3) for contextual explanations.
 * No internal codes are exposed to users.
 */

export interface ActionRationale {
  title: string;
  summary: string;
  recommendation: string;
  pattern: string;
}

// B3.1: Template patterns — COPY EXACTLY from spec
type PatternKey = 'revenue_impact' | 'customer_risk' | 'operational_efficiency' | 'compliance_governance' | 'competitive_positioning';

interface PatternTemplate {
  key: PatternKey;
  why: string; // {department}, {module}, {specific_weak_area} are substituted
  recommendation: string;
}

const PATTERN_TEMPLATES: PatternTemplate[] = [
  {
    key: 'revenue_impact',
    why: '{department} improvement typically unlocks recoverable margin by addressing avoidable leakage in key workflows.',
    recommendation: 'Prioritize {specific_weak_area} to close the gap versus stronger performers.'
  },
  {
    key: 'customer_risk',
    why: 'Weakness in {module} execution increases customer experience risk and reduces repeat business potential.',
    recommendation: 'Stabilize {specific_weak_area} to improve consistency and reduce customer-facing variance.'
  },
  {
    key: 'operational_efficiency',
    why: 'Gaps in {module} process discipline drive rework, cycle-time inflation, and uneven execution.',
    recommendation: 'Standardize and reinforce {specific_weak_area} to improve throughput and reliability.'
  },
  {
    key: 'compliance_governance',
    why: 'This gap increases governance exposure and misalignment with brand/process standards.',
    recommendation: 'Implement clear ownership and review cadence for {specific_weak_area} to reduce risk.'
  },
  {
    key: 'competitive_positioning',
    why: 'Current performance in {module} indicates a competitiveness gap versus stronger dealerships.',
    recommendation: 'Focus on {specific_weak_area} to accelerate uplift and move toward top-quartile habits.'
  }
];

// B3.2: Pattern assignment by department + severity
const SALES_DEPARTMENTS = ['Sales', 'New Vehicle Sales', 'Used Vehicle Sales', 'Finance', 'Financial Operations'];
const SERVICE_DEPARTMENTS = ['Service', 'Aftersales', 'Workshop', 'Parts', 'Parts & Inventory', 'Customer Service'];
const GOVERNANCE_DEPARTMENTS = ['Leadership', 'Process', 'Training', 'Governance'];

// Customer-facing signals
const CUSTOMER_FACING_SIGNALS = ['KPI_NOT_REVIEWED', 'CAPACITY_MISALIGNED'];

function assignPattern(department: string, signalCode: string | null, severityScore?: number): PatternKey {
  const dept = department || '';
  
  if (SALES_DEPARTMENTS.some(d => dept.toLowerCase().includes(d.toLowerCase()))) {
    if (severityScore !== undefined && severityScore <= 2) return 'competitive_positioning';
    return 'revenue_impact';
  }
  
  if (SERVICE_DEPARTMENTS.some(d => dept.toLowerCase().includes(d.toLowerCase()))) {
    if (signalCode && CUSTOMER_FACING_SIGNALS.includes(signalCode)) return 'customer_risk';
    return 'operational_efficiency';
  }
  
  if (GOVERNANCE_DEPARTMENTS.some(d => dept.toLowerCase().includes(d.toLowerCase()))) {
    if (signalCode === 'GOVERNANCE_WEAK') return 'compliance_governance';
    return 'operational_efficiency';
  }
  
  // Fallback
  return 'operational_efficiency';
}

function substituteVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

// Weak area fallback chain
const WEAK_AREA_FALLBACKS = ['core workflows', 'day-to-day execution', 'process adherence'];

/**
 * Signal code to human-friendly title map
 */
const signalCodeToTitle: Record<string, string> = {
  PROCESS_NOT_STANDARDISED: 'Process standardization',
  PROCESS_NOT_EXECUTED: 'Process execution consistency',
  ROLE_OWNERSHIP_MISSING: 'Role clarity and accountability',
  GOVERNANCE_WEAK: 'Governance and oversight',
  KPI_NOT_DEFINED: 'Performance metrics definition',
  KPI_NOT_REVIEWED: 'Performance tracking and review',
  CAPACITY_MISALIGNED: 'Capacity and resource alignment',
  TOOL_UNDERUTILISED: 'Technology and tool adoption',
};

/**
 * Extract signal code from action_description if embedded there by the signal engine.
 */
function extractSignalCodeFromDescription(description: string | undefined): string | null {
  if (!description) return null;
  const match = description.match(/Triggered because:\s*([A-Z_]+)/);
  return match ? match[1] : null;
}

// B3.4: Track pattern usage for uniqueness within a plan
let planPatternUsage: Record<string, number> = {};

export function resetPatternUsage() {
  planPatternUsage = {};
}

/**
 * Get human-readable rationale for an action using template-driven patterns.
 * 
 * A1: Uses signal code from description, NOT department as signal proxy.
 * B3: Uses 5 template patterns with variable substitution.
 */
export function getHumanRationale(action: { 
  action_description?: string; 
  department?: string;
  action_title?: string;
}): ActionRationale {
  const signalCode = extractSignalCodeFromDescription(action.action_description);
  const department = action.department || 'Operations';
  const module = department; // Use department as module name
  
  // Extract specific_weak_area from title if possible
  let specificWeakArea = '';
  if (action.action_title) {
    const cleaned = cleanActionTitle(action.action_title).toLowerCase();
    if (cleaned.length > 10 && cleaned.length < 80) {
      specificWeakArea = cleaned;
    }
  }
  if (!specificWeakArea) {
    // Use fallback chain
    const idx = Math.abs(hashCode(department + (signalCode || ''))) % WEAK_AREA_FALLBACKS.length;
    specificWeakArea = WEAK_AREA_FALLBACKS[idx];
  }

  // Assign pattern
  let patternKey = assignPattern(department, signalCode);
  
  // B3.4: Uniqueness enforcement — rotate if same pattern used 2x
  const usageCount = planPatternUsage[patternKey] || 0;
  if (usageCount >= 2) {
    const allKeys: PatternKey[] = ['revenue_impact', 'customer_risk', 'operational_efficiency', 'compliance_governance', 'competitive_positioning'];
    const alternatives = allKeys.filter(k => (planPatternUsage[k] || 0) < 2 && k !== patternKey);
    if (alternatives.length > 0) {
      patternKey = alternatives[0];
    }
  }
  planPatternUsage[patternKey] = (planPatternUsage[patternKey] || 0) + 1;

  const template = PATTERN_TEMPLATES.find(t => t.key === patternKey)!;
  const vars = { department, module, specific_weak_area: specificWeakArea };
  
  const title = signalCode 
    ? (signalCodeToTitle[signalCode] || 'Improvement area identified')
    : 'Improvement area identified';

  return {
    title,
    summary: substituteVars(template.why, vars),
    recommendation: substituteVars(template.recommendation, vars),
    pattern: patternKey
  };
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Clean action title: strip "Assess:", "Address:" prefixes and rubric language
 */
export function cleanActionTitle(title: string): string {
  return title
    .replace(/^(Assess|Address|Evaluate|Review|Implement|Improve):\s*/i, '')
    .replace(/\.\.\.$/, '')
    .replace(/^Triggered because:.*$/gm, '')
    .trim();
}

/**
 * Clean action description: remove "Triggered because:", question IDs, and system language.
 * Returns a human-readable description suitable for display.
 */
export function cleanActionDescription(description: string): string {
  if (!description) return '';
  
  let cleaned = description.replace(/\n*Triggered because:.*$/gm, '');
  cleaned = cleaned.replace(/\n*Related questions:.*$/gm, '');
  cleaned = cleaned.replace(/\n*Rationale:.*$/gm, '');
  cleaned = cleaned.replace(/\n*Current assessment score:.*$/gm, '');
  cleaned = cleaned.replace(/\n*Score:.*$/gm, '');
  cleaned = cleaned.replace(/\n*Priority:.*$/gm, '');
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

/**
 * Safety fallback rationale (B3.5)
 */
export const FALLBACK_RATIONALE: ActionRationale = {
  title: 'Improvement area identified',
  summary: 'Results show the largest improvement opportunity within this area. Strengthening execution here will improve consistency and outcomes.',
  recommendation: 'Start with core workflows, clarify ownership, and track progress weekly.',
  pattern: 'fallback'
};
