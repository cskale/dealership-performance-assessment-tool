/**
 * Action Templates
 * 
 * Pre-defined action templates for each signal code.
 * Actions are instantiated from these templates when signals are detected.
 */

import { SignalCode, Priority } from './signalTypes';

export interface ActionTemplate {
  templateId: string;
  signalCode: Exclude<SignalCode, 'NONE'>;
  title: string;
  description: string;
  defaultOwnerRole: string;
  defaultTimeframeDays: number;
  defaultPriority: Priority;
  implementationSteps: string[];
}

export const ACTION_TEMPLATES: ActionTemplate[] = [
  // =====================================================
  // PROCESS_NOT_STANDARDISED Templates
  // =====================================================
  {
    templateId: 'ACT-PNS-001',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Document and standardize operational procedures',
    description: 'Triggered because: PROCESS_NOT_STANDARDISED. Standard operating procedures are missing or inconsistent. Create documented SOPs for key processes to ensure consistency and quality.',
    defaultOwnerRole: 'Department Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      'Audit current processes and identify gaps in documentation',
      'Interview staff to capture best practices and variations',
      'Draft standardized procedures with clear step-by-step instructions',
      'Review with team leads and incorporate feedback',
      'Train all staff on new procedures',
      'Implement compliance monitoring checkpoints'
    ]
  },
  {
    templateId: 'ACT-PNS-002',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Implement pricing strategy framework',
    description: 'Triggered because: PROCESS_NOT_STANDARDISED. Pricing decisions lack consistency. Establish a standardized pricing framework with clear guidelines and approval workflows.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Analyze current pricing patterns and identify inconsistencies',
      'Define pricing tiers and discount authority levels',
      'Create pricing guidelines document',
      'Configure system guardrails for pricing boundaries',
      'Train sales staff on pricing framework',
      'Monitor compliance weekly for first month'
    ]
  },

  // =====================================================
  // PROCESS_NOT_EXECUTED Templates
  // =====================================================
  {
    templateId: 'ACT-PNE-001',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Reinforce process compliance through accountability',
    description: 'Triggered because: PROCESS_NOT_EXECUTED. Defined processes are not being followed consistently. Implement accountability measures and regular compliance monitoring.',
    defaultOwnerRole: 'Operations Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Identify specific processes with compliance gaps',
      'Meet with team to understand barriers to execution',
      'Remove obstacles and simplify processes where possible',
      'Assign process champions responsible for each area',
      'Implement daily/weekly compliance checklists',
      'Review compliance metrics in team meetings'
    ]
  },
  {
    templateId: 'ACT-PNE-002',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Improve lead follow-up execution',
    description: 'Triggered because: PROCESS_NOT_EXECUTED. Lead follow-up processes are not being executed consistently. Establish clear follow-up cadence and accountability.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 7,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Define standard follow-up timeline (e.g., 15 min, 2 hr, 24 hr)',
      'Configure CRM alerts and task automation',
      'Create follow-up scripts and templates',
      'Implement daily lead status review',
      'Track and report follow-up response times'
    ]
  },

  // =====================================================
  // ROLE_OWNERSHIP_MISSING Templates
  // =====================================================
  {
    templateId: 'ACT-ROM-001',
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    title: 'Establish clear role accountability',
    description: 'Triggered because: ROLE_OWNERSHIP_MISSING. Clear accountability and role ownership is not established. Define responsibilities and accountability for key functions.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      'Map all key functions and current ownership',
      'Identify functions without clear accountability',
      'Assign primary owner and backup for each function',
      'Document responsibilities in role descriptions',
      'Communicate changes to all staff',
      'Include accountability in performance reviews'
    ]
  },
  {
    templateId: 'ACT-ROM-002',
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    title: 'Implement staff training and development program',
    description: 'Triggered because: ROLE_OWNERSHIP_MISSING. Training and development investment is insufficient. Create structured training program with clear development paths.',
    defaultOwnerRole: 'HR Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      'Assess current skill gaps across departments',
      'Create training curriculum for each role',
      'Schedule regular training sessions (weekly/monthly)',
      'Partner with manufacturers for product training',
      'Track certification progress per employee',
      'Link training completion to career advancement'
    ]
  },

  // =====================================================
  // KPI_NOT_DEFINED Templates
  // =====================================================
  {
    templateId: 'ACT-KND-001',
    signalCode: 'KPI_NOT_DEFINED',
    title: 'Define department KPIs and targets',
    description: 'Triggered because: KPI_NOT_DEFINED. Key performance indicators are not clearly defined. Establish measurable KPIs with specific targets for each department.',
    defaultOwnerRole: 'Department Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Identify 5-7 critical metrics for the department',
      'Set realistic but challenging targets based on benchmarks',
      'Define measurement methodology and data sources',
      'Configure reporting dashboards',
      'Communicate KPIs and targets to all team members',
      'Review and adjust targets quarterly'
    ]
  },

  // =====================================================
  // KPI_NOT_REVIEWED Templates
  // =====================================================
  {
    templateId: 'ACT-KNR-001',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Implement regular performance review cadence',
    description: 'Triggered because: KPI_NOT_REVIEWED. Performance metrics are not regularly reviewed or acted upon. Establish structured review meetings and action planning.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 7,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Schedule weekly department performance reviews',
      'Create standard review meeting agenda',
      'Prepare automated performance reports',
      'Document action items from each review',
      'Track action item completion',
      'Conduct monthly management performance review'
    ]
  },
  {
    templateId: 'ACT-KNR-002',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Enhance customer satisfaction monitoring',
    description: 'Triggered because: KPI_NOT_REVIEWED. Customer satisfaction metrics need more attention. Implement systematic CSI tracking and response protocols.',
    defaultOwnerRole: 'Customer Experience Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      'Review current CSI data collection methods',
      'Implement post-transaction survey automation',
      'Create escalation protocol for low scores',
      'Schedule daily review of customer feedback',
      'Train staff on service recovery techniques',
      'Report CSI trends in weekly meetings'
    ]
  },

  // =====================================================
  // CAPACITY_MISALIGNED Templates
  // =====================================================
  {
    templateId: 'ACT-CMA-001',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Optimize resource allocation',
    description: 'Triggered because: CAPACITY_MISALIGNED. Resources and capacity are not aligned with demand. Conduct capacity analysis and realign staffing/resources.',
    defaultOwnerRole: 'Operations Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Analyze demand patterns by day/time/season',
      'Map current resource allocation against demand',
      'Identify peak periods with insufficient capacity',
      'Develop flexible staffing/scheduling model',
      'Cross-train staff for multi-department support',
      'Monitor utilization and adjust monthly'
    ]
  },
  {
    templateId: 'ACT-CMA-002',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Improve service appointment availability',
    description: 'Triggered because: CAPACITY_MISALIGNED. Service appointment availability does not meet customer demand. Optimize scheduling and increase capacity.',
    defaultOwnerRole: 'Service Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Analyze current appointment lead times',
      'Review bay utilization by hour/day',
      'Optimize scheduling algorithm for efficiency',
      'Consider extended hours or weekend capacity',
      'Implement online booking with real-time availability',
      'Track appointment availability weekly'
    ]
  },

  // =====================================================
  // TOOL_UNDERUTILISED Templates
  // =====================================================
  {
    templateId: 'ACT-TUU-001',
    signalCode: 'TOOL_UNDERUTILISED',
    title: 'Maximize CRM system utilization',
    description: 'Triggered because: TOOL_UNDERUTILISED. CRM and technology tools are not being fully leveraged. Implement training and adoption program.',
    defaultOwnerRole: 'IT Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      'Audit current CRM usage and feature adoption',
      'Identify underutilized features with high value',
      'Create role-specific training modules',
      'Schedule hands-on training sessions',
      'Configure system to enforce data entry standards',
      'Monitor adoption metrics weekly'
    ]
  },
  {
    templateId: 'ACT-TUU-002',
    signalCode: 'TOOL_UNDERUTILISED',
    title: 'Enhance digital marketing and lead generation',
    description: 'Triggered because: TOOL_UNDERUTILISED. Digital tools for marketing and lead generation are underutilized. Improve online presence and digital conversion.',
    defaultOwnerRole: 'Marketing Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      'Audit current digital presence and performance',
      'Optimize website for lead capture',
      'Implement/enhance online chat and scheduling',
      'Create content strategy for social media',
      'Set up marketing automation workflows',
      'Track digital lead sources and conversion'
    ]
  },

  // =====================================================
  // GOVERNANCE_WEAK Templates
  // =====================================================
  {
    templateId: 'ACT-GWK-001',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Strengthen management oversight',
    description: 'Triggered because: GOVERNANCE_WEAK. Management oversight and governance structures need improvement. Implement regular review cycles and approval workflows.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Define decision authority matrix by role/amount',
      'Establish approval workflows for key decisions',
      'Schedule regular management review meetings',
      'Create exception reporting protocols',
      'Implement audit checkpoints for high-risk areas',
      'Document and communicate governance policies'
    ]
  },
  {
    templateId: 'ACT-GWK-002',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Improve inventory and aged stock management',
    description: 'Triggered because: GOVERNANCE_WEAK. Inventory governance needs strengthening. Implement proactive aged stock management and pricing discipline.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    implementationSteps: [
      'Define aging policy with price reduction triggers',
      'Implement daily aged inventory review',
      'Set maximum days-in-stock targets',
      'Create escalation path for aged units',
      'Review and approve pricing adjustments weekly',
      'Track aging metrics and hold managers accountable'
    ]
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): ActionTemplate | undefined {
  return ACTION_TEMPLATES.find(t => t.templateId === templateId);
}

/**
 * Get all templates for a signal code
 */
export function getTemplatesForSignal(signalCode: Exclude<SignalCode, 'NONE'>): ActionTemplate[] {
  return ACTION_TEMPLATES.filter(t => t.signalCode === signalCode);
}

/**
 * Get the default template for a signal code (first match)
 */
export function getDefaultTemplateForSignal(signalCode: Exclude<SignalCode, 'NONE'>): ActionTemplate | undefined {
  return ACTION_TEMPLATES.find(t => t.signalCode === signalCode);
}
