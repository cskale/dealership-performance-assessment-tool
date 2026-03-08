/**
 * Action Templates
 * 
 * Pre-defined action templates for each signal code.
 * Actions are instantiated from these templates when signals are detected.
 * 
 * Includes both generic templates and KPI-specific templates derived from
 * the KPI Deep Dive document's improvement levers.
 */

import { SignalCode, Priority } from './signalTypes';

export type RootCauseDimension = 'people' | 'process' | 'tools' | 'structure' | 'incentives';

export interface ActionTemplate {
  templateId: string;
  signalCode: Exclude<SignalCode, 'NONE'>;
  title: string;
  description: string;
  defaultOwnerRole: string;
  defaultTimeframeDays: number;
  defaultPriority: Priority;
  implementationSteps: string[];
  /** KPI keys this template is specifically designed to improve */
  linkedKPIs?: string[];
  /** Root cause dimension this template addresses */
  rootCauseDimension?: RootCauseDimension;
}

export const ACTION_TEMPLATES: ActionTemplate[] = [
  // =====================================================
  // PROCESS_NOT_STANDARDISED Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-PNS-001',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Document and standardize operational procedures',
    description: 'Standard operating procedures are missing or inconsistent. Create documented SOPs for key processes to ensure consistency and quality.',
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
    description: 'Pricing decisions lack consistency. Establish a standardized pricing framework with clear guidelines and approval workflows.',
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
  // PROCESS_NOT_STANDARDISED Templates (KPI-Specific)
  // =====================================================
  {
    templateId: 'ACT-PNS-TDR',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Create mandatory test drive process with tracking',
    description: 'Test drive ratio is low due to lack of standardized demo process. Implement mandatory test drive suggestion with "demo or document" policy.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    linkedKPIs: ['testDriveRatio', 'closingRatio'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Create mandatory test drive suggestion in sales process (scripted offer)',
      'Streamline administrative requirements (e-signatures, digital license scan)',
      'Maintain dedicated demo fleet for popular models in optimal condition',
      'Create compelling demonstration routes highlighting vehicle features',
      'Implement "demo or document" policy — if no test drive, must document reason',
      'Track test drive ratio by salesperson and provide coaching',
      'Train sales team on experiential selling (focus on feeling, not just features)'
    ]
  },
  {
    templateId: 'ACT-PNS-INV',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Implement dynamic repricing protocols for used inventory',
    description: 'Days in inventory are high due to lack of standardized pricing strategy. Implement automated repricing at 15-day intervals with aged inventory action triggers.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    linkedKPIs: ['daysInInventory', 'usedCarInventoryTurn'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Implement automated repricing protocols at 15-day intervals based on market comparison',
      'Establish hard action triggers: 45 days (review), 60 days (aggressive repricing), 90 days (wholesale evaluation)',
      'Reduce reconditioning cycle time to <7 days through process optimization',
      'Create weekly aged inventory review meetings with accountability for action plans',
      'Deploy real-time aged inventory dashboards with vehicle-level visibility',
      'Make decisive wholesale decisions at 90+ days preventing further depreciation'
    ]
  },
  {
    templateId: 'ACT-PNS-NEG',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Implement structured desking and negotiation framework',
    description: 'Front-end gross margins are inconsistent due to lack of negotiation standards. Create multi-step framework with approval thresholds.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    linkedKPIs: ['grossPerNewVehicle', 'frontEndGross'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Implement structured desking process with required manager approval for below-threshold margins',
      'Create multi-step negotiation framework (first pencil → manager review → final offer)',
      'Shift to payment-focused selling vs. price-focused negotiations',
      'Establish minimum gross percentage thresholds by vehicle type',
      'Deploy dynamic pricing tools using market data to optimize asking prices',
      'Train on value-stacking techniques before presenting price'
    ]
  },

  // =====================================================
  // PROCESS_NOT_EXECUTED Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-PNE-001',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Reinforce process compliance through accountability',
    description: 'Defined processes are not being followed consistently. Implement accountability measures and regular compliance monitoring.',
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
    description: 'Lead follow-up processes are not being executed consistently. Establish clear follow-up cadence and accountability.',
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
  // PROCESS_NOT_EXECUTED Templates (KPI-Specific)
  // =====================================================
  {
    templateId: 'ACT-PNE-LRT',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Implement 5-minute lead response SLA with escalation',
    description: 'Lead response times are too slow, losing potential customers. Implement strict response SLA with automated routing and escalation protocol.',
    defaultOwnerRole: 'BDC Manager',
    defaultTimeframeDays: 7,
    defaultPriority: 'HIGH',
    linkedKPIs: ['leadResponseTime', 'leadConversion'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Implement instant lead routing automation with mobile push notifications',
      'Establish 5-minute response SLA with escalation after 10 minutes',
      'Deploy auto-responders followed by immediate human contact',
      'Implement real-time response time dashboards visible to team',
      'Tie BDC compensation directly to response time performance',
      'Create dedicated BDC with extended coverage or AI-powered initial response'
    ]
  },
  {
    templateId: 'ACT-PNE-LCR',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Deploy multi-touch follow-up sequences for leads',
    description: 'Lead conversion is low due to insufficient follow-up touchpoints. Implement structured multi-channel engagement with 7-10 touchpoints.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    linkedKPIs: ['leadConversion', 'closingRatio'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Implement lead scoring to prioritize high-intent prospects',
      'Develop multi-touch follow-up sequences (minimum 7-10 touchpoints)',
      'Deploy video personalization and multi-channel engagement',
      'Enhance lead qualification criteria to focus on viable prospects',
      'Track conversion by source to optimize marketing spend',
      'Create specialized internet sales team vs. traditional sales floor'
    ]
  },
  {
    templateId: 'ACT-PNE-CLR',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Implement mandatory closing training with certification',
    description: 'Closing ratio is below benchmark due to weak closing execution. Deploy structured closing techniques with ongoing certification.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    linkedKPIs: ['closingRatio', 'unitsSoldPerExec'],
    rootCauseDimension: 'people',
    implementationSteps: [
      'Implement mandatory closing training with certification requirements',
      'Develop multiple closing techniques (assumptive, alternative choice, urgency-based)',
      'Create structured objection-handling playbooks by common scenarios',
      'Deploy real-time deal structuring tools with multiple payment scenarios',
      'Increase management floor presence for collaborative closing',
      'Track closing ratio by individual and provide targeted coaching',
      'Use mystery shopping to identify process breakdowns'
    ]
  },
  {
    templateId: 'ACT-PNE-FNI',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Implement menu-based F&I selling with warm handoff',
    description: 'F&I penetration is low due to poor execution of F&I presentation process. Implement structured menu selling with sales-to-F&I warm handoff.',
    defaultOwnerRole: 'F&I Director',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    linkedKPIs: ['fniPenetration', 'backEndGross', 'productPerRetailUnit'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Train sales team to pre-frame F&I value during vehicle presentation ("warm handoff")',
      'Implement menu-based selling with tiered protection packages (good-better-best)',
      'Enhance F&I manager consultative selling training and product knowledge',
      'Deploy digital F&I presentation tools showing product value clearly',
      'Expand product portfolio (maintenance plans, wheel/tire programs)',
      'Establish minimum penetration targets with accountability and coaching',
      'Create logical product pairings for higher PVR'
    ]
  },

  // =====================================================
  // ROLE_OWNERSHIP_MISSING Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-ROM-001',
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    title: 'Establish clear role accountability',
    description: 'Clear accountability and role ownership is not established. Define responsibilities and accountability for key functions.',
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
    description: 'Training and development investment is insufficient. Create structured training program with clear development paths.',
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
  // ROLE_OWNERSHIP_MISSING Templates (KPI-Specific)
  // =====================================================
  {
    templateId: 'ACT-ROM-BDC',
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    title: 'Establish dedicated BDC with clear lead ownership',
    description: 'Lead response and conversion suffer from unclear ownership between BDC and sales floor. Create dedicated BDC with clear handoff protocols.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'HIGH',
    linkedKPIs: ['leadResponseTime', 'leadConversion', 'appointmentShowRate'],
    rootCauseDimension: 'structure',
    implementationSteps: [
      'Create dedicated BDC/internet department with clear ownership',
      'Define lead handoff protocols between BDC and sales floor',
      'Implement BDC-to-sales warm handoff with appointment confirmation',
      'Establish clear shift coverage ensuring no lead gaps',
      'Train BDC staff on response protocols and qualification criteria',
      'Monitor handoff quality and customer experience at transition points'
    ]
  },
  {
    templateId: 'ACT-ROM-INC',
    signalCode: 'ROLE_OWNERSHIP_MISSING',
    title: 'Assign dedicated factory incentive program manager',
    description: 'Factory incentive capture is low due to lack of focused ownership. Assign dedicated personnel to track and manage incentive achievement.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    linkedKPIs: ['factoryIncentiveCapture', 'grossPerNewVehicle'],
    rootCauseDimension: 'structure',
    implementationSteps: [
      'Assign dedicated personnel responsibility for incentive program management',
      'Implement real-time incentive tracking dashboards (daily/weekly)',
      'Create incentive attainment forecasts enabling proactive adjustments',
      'Conduct monthly incentive reviews analyzing capture probability',
      'Educate entire dealership team on incentive importance and individual role',
      'Create internal incentive alignment (staff bonuses tied to factory achievement)'
    ]
  },

  // =====================================================
  // KPI_NOT_DEFINED Templates
  // =====================================================
  {
    templateId: 'ACT-KND-001',
    signalCode: 'KPI_NOT_DEFINED',
    title: 'Define department KPIs and targets',
    description: 'Key performance indicators are not clearly defined. Establish measurable KPIs with specific targets for each department.',
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
  // KPI_NOT_REVIEWED Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-KNR-001',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Implement regular performance review cadence',
    description: 'Performance metrics are not regularly reviewed or acted upon. Establish structured review meetings and action planning.',
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
    description: 'Customer satisfaction metrics need more attention. Implement systematic CSI tracking and response protocols.',
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
  // CAPACITY_MISALIGNED Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-CMA-001',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Optimize resource allocation',
    description: 'Resources and capacity are not aligned with demand. Conduct capacity analysis and realign staffing/resources.',
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
    description: 'Service appointment availability does not meet customer demand. Optimize scheduling and increase capacity.',
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
  // CAPACITY_MISALIGNED Templates (KPI-Specific)
  // =====================================================
  {
    templateId: 'ACT-CMA-ASR',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Implement multi-touchpoint appointment confirmation sequence',
    description: 'Appointment show rates are low causing wasted capacity. Deploy systematic multi-channel confirmation and engagement protocol.',
    defaultOwnerRole: 'BDC Manager',
    defaultTimeframeDays: 7,
    defaultPriority: 'HIGH',
    linkedKPIs: ['appointmentShowRate', 'unitsSoldPerExec'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Implement multi-touchpoint confirmation sequence (at booking, 48hrs, 24hrs, 2hrs prior)',
      'Use multiple channels (email, SMS, phone, video message)',
      'Send personalized video confirmations from sales advisor',
      'Provide "add to calendar" functionality at booking',
      'Shorten time between appointment setting and actual appointment',
      'Create tiered no-show policy (warnings → deposits → restricted scheduling)',
      'Reward consistent show behavior with perks (priority scheduling, free services)'
    ]
  },
  {
    templateId: 'ACT-CMA-PRD',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Implement BDC to optimize sales executive productivity',
    description: 'Units sold per executive are below benchmark. Deploy BDC to handle appointment setting, freeing sales team for high-value closing activities.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'HIGH',
    linkedKPIs: ['unitsSoldPerExec', 'revenuePerExec'],
    rootCauseDimension: 'structure',
    implementationSteps: [
      'Implement BDC to handle appointment setting, freeing sales team for closing',
      'Optimize staffing levels and schedules to match traffic patterns',
      'Automate administrative tasks (credit apps, paperwork, vehicle prep coordination)',
      'Deploy digital retailing tools to reduce transaction friction and time',
      'Implement performance management with clear productivity targets',
      'Benchmark against industry standards (target: 15-20 units/month for high performers)'
    ]
  },

  // =====================================================
  // TOOL_UNDERUTILISED Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-TUU-001',
    signalCode: 'TOOL_UNDERUTILISED',
    title: 'Maximize CRM system utilization',
    description: 'CRM and technology tools are not being fully leveraged. Implement training and adoption program.',
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
    description: 'Digital tools for marketing and lead generation are underutilized. Improve online presence and digital conversion.',
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
  // TOOL_UNDERUTILISED Templates (KPI-Specific)
  // =====================================================
  {
    templateId: 'ACT-TUU-DRT',
    signalCode: 'TOOL_UNDERUTILISED',
    title: 'Deploy digital retailing tools to shorten sales cycle',
    description: 'Sales cycle is extended due to manual processes. Implement digital retailing enabling online credit applications, e-contracting, and virtual deal structuring.',
    defaultOwnerRole: 'IT Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    linkedKPIs: ['salesCycleLength', 'unitsSoldPerExec', 'closingRatio'],
    rootCauseDimension: 'tools',
    implementationSteps: [
      'Deploy digital retailing tools enabling online credit applications and approvals',
      'Streamline F&I process with menu selling and e-contracting',
      'Implement "one-visit close" protocols for qualified buyers',
      'Provide real-time inventory matching and digital retailing tools',
      'Use technology for virtual selling and remote deal structuring',
      'Expand lender network for faster approvals and more options'
    ]
  },
  {
    templateId: 'ACT-TUU-FNI',
    signalCode: 'TOOL_UNDERUTILISED',
    title: 'Deploy digital F&I presentation and menu tools',
    description: 'F&I product penetration is limited by outdated presentation methods. Deploy digital menu tools with visual value demonstrations.',
    defaultOwnerRole: 'F&I Director',
    defaultTimeframeDays: 21,
    defaultPriority: 'MEDIUM',
    linkedKPIs: ['fniPenetration', 'backEndGross', 'productPerRetailUnit', 'extendedWarrantyPenetration'],
    rootCauseDimension: 'tools',
    implementationSteps: [
      'Deploy digital F&I presentation tools with visual value demonstrations',
      'Create "protection package" bundles increasing perceived value vs. individual products',
      'Use customer testimonials and real-life examples demonstrating product benefits',
      'Implement payment-based selling showing minimal payment impact of additional products',
      'Expand product portfolio (key replacement, tire-wheel, windshield)',
      'Use depreciation charts and total-loss scenario illustrations for GAP selling'
    ]
  },
  {
    templateId: 'ACT-TUU-IMS',
    signalCode: 'TOOL_UNDERUTILISED',
    title: 'Deploy inventory management technology with turn rate alerts',
    description: 'Used inventory turn is suboptimal due to lack of data-driven management tools. Implement inventory management technology with pricing intelligence.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'MEDIUM',
    linkedKPIs: ['usedCarInventoryTurn', 'daysInInventory'],
    rootCauseDimension: 'tools',
    implementationSteps: [
      'Deploy inventory management technology with turn rate alerts and recommendations',
      'Implement data-driven acquisition targeting high-demand vehicles with fast turn history',
      'Use predictive analytics identifying slow-turn risks early for intervention',
      'Enhance digital marketing and merchandising accelerating online engagement',
      'Deploy real-time aged inventory dashboards with vehicle-level visibility',
      'Benchmark competitor days-to-sale using market intelligence tools'
    ]
  },

  // =====================================================
  // GOVERNANCE_WEAK Templates (Generic)
  // =====================================================
  {
    templateId: 'ACT-GWK-001',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Strengthen management oversight',
    description: 'Management oversight and governance structures need improvement. Implement regular review cycles and approval workflows.',
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
    description: 'Inventory governance needs strengthening. Implement proactive aged stock management and pricing discipline.',
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
  },

  // =====================================================
  // GOVERNANCE_WEAK Templates (KPI-Specific)
  // =====================================================
  {
    templateId: 'ACT-GWK-CAN',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Implement order cancellation prevention and monitoring system',
    description: 'Cancellation rate is high due to weak governance around order quality and customer commitment. Deploy proactive monitoring and intervention.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    linkedKPIs: ['cancellationRate', 'orderBankCoverage', 'allocationFulfillment'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Strengthen customer qualification including financial pre-qualification',
      'Require meaningful deposits ($500-1,000+) demonstrating commitment',
      'Implement proactive communication cadence (weekly updates) maintaining engagement',
      'Create early warning system identifying at-risk orders for intervention',
      'Deploy customer-facing order tracking increasing transparency',
      'Conduct "order confirmation" calls 24-48 hours after order',
      'Analyze cancellation reasons systematically to address root causes',
      'Monitor cancellation rate by salesperson identifying training needs'
    ]
  },
  {
    templateId: 'ACT-GWK-INC',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Balance incentive pursuit with margin management',
    description: 'Factory incentive management lacks governance, risking over-discounting to hit volume targets. Implement balanced approach with real-time tracking.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    linkedKPIs: ['factoryIncentiveCapture', 'grossPerNewVehicle'],
    rootCauseDimension: 'process',
    implementationSteps: [
      'Implement real-time incentive tracking dashboards monitoring progress daily/weekly',
      'Balance incentive pursuit with margin management (avoid losing money for bonuses)',
      'Develop contingency strategies for near-miss situations (targeted marketing, pricing adjustments)',
      'Document and analyze near-miss situations to prevent recurrence',
      'Create internal incentive alignment (staff bonuses tied to factory achievement)',
      'Negotiate with manufacturer on unrealistic or misaligned incentive programs'
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

/**
 * Get KPI-specific templates for a given set of linked KPIs
 */
export function getTemplatesForKPIs(kpiKeys: string[]): ActionTemplate[] {
  return ACTION_TEMPLATES.filter(t => 
    t.linkedKPIs && t.linkedKPIs.some(kpi => kpiKeys.includes(kpi))
  );
}

/**
 * Get templates by root cause dimension
 */
export function getTemplatesByRootCause(dimension: RootCauseDimension): ActionTemplate[] {
  return ACTION_TEMPLATES.filter(t => t.rootCauseDimension === dimension);
}
