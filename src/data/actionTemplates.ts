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

export type BusinessModel = 'sales_only' | '2s' | '3s' | '4s' | 'service_only';

export type PrimaryRole =
  | 'General Manager' | 'Sales Manager' | 'Sales Director'
  | 'Workshop Controller' | 'Service Manager' | 'Parts Manager'
  | 'F&I Director' | 'BDC Manager' | 'HR Manager'
  | 'Finance Director' | 'Customer Experience Manager'
  | 'Operations Manager' | 'Department Manager' | 'Used Vehicle Manager'
  | 'IT Manager' | 'Marketing Manager';

export interface ImplementationStep {
  text: string;
  primaryRole: PrimaryRole;
}

export interface ActionTemplate {
  templateId: string;
  signalCode: Exclude<SignalCode, 'NONE'>;
  title: string;
  description: string;
  defaultOwnerRole: string;
  defaultTimeframeDays: number;
  defaultPriority: Priority;
  implementationSteps: ImplementationStep[];
  /** KPI keys this template is specifically designed to improve */
  linkedKPIs?: string[];
  /** Root cause dimension this template addresses */
  rootCauseDimension?: RootCauseDimension;
  /** Business models this template is relevant for */
  relevantBusinessModels?: BusinessModel[];
  /** Score band this template targets */
  scoreBand?: 'foundational' | 'developing' | 'optimising';
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
      { text: 'Audit current processes and identify gaps in documentation', primaryRole: 'Department Manager' },
      { text: 'Interview staff to capture best practices and variations', primaryRole: 'Department Manager' },
      { text: 'Draft standardized procedures with clear step-by-step instructions', primaryRole: 'Department Manager' },
      { text: 'Review with team leads and incorporate feedback', primaryRole: 'Department Manager' },
      { text: 'Train all staff on new procedures', primaryRole: 'HR Manager' },
      { text: 'Implement compliance monitoring checkpoints', primaryRole: 'General Manager' },
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
      { text: 'Analyze current pricing patterns and identify inconsistencies', primaryRole: 'Sales Manager' },
      { text: 'Define pricing tiers and discount authority levels', primaryRole: 'Sales Manager' },
      { text: 'Create pricing guidelines document', primaryRole: 'Sales Manager' },
      { text: 'Configure system guardrails for pricing boundaries', primaryRole: 'IT Manager' },
      { text: 'Train sales staff on pricing framework', primaryRole: 'HR Manager' },
      { text: 'Monitor compliance weekly for first month', primaryRole: 'Sales Manager' },
    ]
  },

  // PROCESS_NOT_STANDARDISED — Foundational (score 20–45)
  {
    templateId: 'ACT-PNS-FOUND',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    scoreBand: 'foundational',
    title: 'Establish basic documented procedures',
    description: 'No documented processes exist for key operational areas. Start by capturing what currently happens, even informally, and write it down in plain language.',
    defaultOwnerRole: 'Department Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    implementationSteps: [
      { text: 'Walk the floor and document the 5 highest-frequency tasks as they currently happen — not as they should happen', primaryRole: 'Department Manager' },
      { text: 'For each task, write 3–5 steps in plain language a new hire could follow today', primaryRole: 'Department Manager' },
      { text: 'Print and laminate the top 3 procedures and place them at the point of use', primaryRole: 'General Manager' },
      { text: 'Run a 30-minute team session to agree on the process and get buy-in before enforcing it', primaryRole: 'Department Manager' },
      { text: 'Set a 30-day review date to check compliance and update based on what you learned', primaryRole: 'General Manager' },
    ]
  },
  // PROCESS_NOT_STANDARDISED — Developing (score 46–69)
  {
    templateId: 'ACT-PNS-DEV',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    scoreBand: 'developing',
    title: 'Formalise and embed existing process documentation',
    description: 'Some processes exist but are inconsistently documented or followed. Build a formal SOP library and introduce monitoring.',
    defaultOwnerRole: 'Department Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      { text: 'Audit all existing process documents — identify which are current, outdated, or missing', primaryRole: 'Department Manager' },
      { text: 'Prioritise the 10 highest-impact processes for formalisation (by revenue or customer touchpoint frequency)', primaryRole: 'General Manager' },
      { text: 'Assign a named process owner for each SOP accountable for keeping it current', primaryRole: 'General Manager' },
      { text: 'Build a shared digital SOP library accessible to all staff (SharePoint, Google Drive, or DMS document store)', primaryRole: 'Department Manager' },
      { text: 'Introduce monthly compliance spot-checks: 3 random SOP checks per manager per month', primaryRole: 'General Manager' },
      { text: 'Review and update all SOPs quarterly or when a process problem is identified', primaryRole: 'Department Manager' },
    ]
  },
  // PROCESS_NOT_STANDARDISED — Optimising (score 70–84)
  {
    templateId: 'ACT-PNS-OPT',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    scoreBand: 'optimising',
    title: 'Introduce process excellence and continuous improvement',
    description: 'Core processes are documented and followed. Focus shifts to eliminating variance, reducing cycle times, and embedding a continuous improvement culture.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 45,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      { text: 'Map end-to-end process flow for top 5 customer journeys — identify handoff points and wait times', primaryRole: 'Operations Manager' },
      { text: 'Time-study the 3 highest-volume processes and benchmark against OEM best-practice cycle times', primaryRole: 'Department Manager' },
      { text: 'Introduce a staff improvement suggestion system — reward ideas that reduce cycle time or error rate', primaryRole: 'General Manager' },
      { text: 'Run quarterly process improvement workshops with department leads', primaryRole: 'General Manager' },
      { text: 'Set formal KPI targets for process adherence and cycle time, tracked in management meetings', primaryRole: 'General Manager' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Create mandatory test drive suggestion in sales process (scripted offer)', primaryRole: 'Sales Manager' },
      { text: 'Streamline administrative requirements (e-signatures, digital license scan)', primaryRole: 'Operations Manager' },
      { text: 'Maintain dedicated demo fleet for popular models in optimal condition', primaryRole: 'Department Manager' },
      { text: 'Create compelling demonstration routes highlighting vehicle features', primaryRole: 'Sales Manager' },
      { text: 'Implement "demo or document" policy — if no test drive, must document reason', primaryRole: 'Sales Manager' },
      { text: 'Track test drive ratio by salesperson and provide coaching', primaryRole: 'Sales Manager' },
      { text: 'Train sales team on experiential selling (focus on feeling, not just features)', primaryRole: 'HR Manager' },
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
    relevantBusinessModels: ['3s', '4s'],
    implementationSteps: [
      { text: 'Implement automated repricing protocols at 15-day intervals based on market comparison', primaryRole: 'Used Vehicle Manager' },
      { text: 'Establish hard action triggers: 45 days (review), 60 days (aggressive repricing), 90 days (wholesale evaluation)', primaryRole: 'Used Vehicle Manager' },
      { text: 'Reduce reconditioning cycle time to <7 days through process optimization', primaryRole: 'Used Vehicle Manager' },
      { text: 'Create weekly aged inventory review meetings with accountability for action plans', primaryRole: 'Used Vehicle Manager' },
      { text: 'Deploy real-time aged inventory dashboards with vehicle-level visibility', primaryRole: 'IT Manager' },
      { text: 'Make decisive wholesale decisions at 90+ days preventing further depreciation', primaryRole: 'Used Vehicle Manager' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement structured desking process with required manager approval for below-threshold margins', primaryRole: 'Sales Manager' },
      { text: 'Create multi-step negotiation framework (first pencil → manager review → final offer)', primaryRole: 'Sales Manager' },
      { text: 'Shift to payment-focused selling vs. price-focused negotiations', primaryRole: 'Sales Manager' },
      { text: 'Establish minimum gross percentage thresholds by vehicle type', primaryRole: 'Sales Manager' },
      { text: 'Deploy dynamic pricing tools using market data to optimize asking prices', primaryRole: 'IT Manager' },
      { text: 'Train on value-stacking techniques before presenting price', primaryRole: 'HR Manager' },
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
      { text: 'Identify specific processes with compliance gaps', primaryRole: 'Department Manager' },
      { text: 'Meet with team to understand barriers to execution', primaryRole: 'General Manager' },
      { text: 'Remove obstacles and simplify processes where possible', primaryRole: 'Operations Manager' },
      { text: 'Assign process champions responsible for each area', primaryRole: 'General Manager' },
      { text: 'Implement daily/weekly compliance checklists', primaryRole: 'Department Manager' },
      { text: 'Review compliance metrics in team meetings', primaryRole: 'General Manager' },
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
      { text: 'Define standard follow-up timeline (e.g., 15 min, 2 hr, 24 hr)', primaryRole: 'Sales Manager' },
      { text: 'Configure CRM alerts and task automation', primaryRole: 'IT Manager' },
      { text: 'Create follow-up scripts and templates', primaryRole: 'Sales Manager' },
      { text: 'Implement daily lead status review', primaryRole: 'Sales Manager' },
      { text: 'Track and report follow-up response times', primaryRole: 'Sales Manager' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement instant lead routing automation with mobile push notifications', primaryRole: 'BDC Manager' },
      { text: 'Establish 5-minute response SLA with escalation after 10 minutes', primaryRole: 'BDC Manager' },
      { text: 'Deploy auto-responders followed by immediate human contact', primaryRole: 'BDC Manager' },
      { text: 'Implement real-time response time dashboards visible to team', primaryRole: 'BDC Manager' },
      { text: 'Tie BDC compensation directly to response time performance', primaryRole: 'BDC Manager' },
      { text: 'Create dedicated BDC with extended coverage or AI-powered initial response', primaryRole: 'BDC Manager' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement lead scoring to prioritize high-intent prospects', primaryRole: 'Sales Manager' },
      { text: 'Develop multi-touch follow-up sequences (minimum 7-10 touchpoints)', primaryRole: 'Sales Manager' },
      { text: 'Deploy video personalization and multi-channel engagement', primaryRole: 'BDC Manager' },
      { text: 'Enhance lead qualification criteria to focus on viable prospects', primaryRole: 'Sales Manager' },
      { text: 'Track conversion by source to optimize marketing spend', primaryRole: 'Marketing Manager' },
      { text: 'Create specialized internet sales team vs. traditional sales floor', primaryRole: 'Sales Manager' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement mandatory closing training with certification requirements', primaryRole: 'HR Manager' },
      { text: 'Develop multiple closing techniques (assumptive, alternative choice, urgency-based)', primaryRole: 'Sales Manager' },
      { text: 'Create structured objection-handling playbooks by common scenarios', primaryRole: 'Sales Manager' },
      { text: 'Deploy real-time deal structuring tools with multiple payment scenarios', primaryRole: 'IT Manager' },
      { text: 'Increase management floor presence for collaborative closing', primaryRole: 'Sales Manager' },
      { text: 'Track closing ratio by individual and provide targeted coaching', primaryRole: 'Sales Manager' },
      { text: 'Use mystery shopping to identify process breakdowns', primaryRole: 'Customer Experience Manager' },
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
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Train sales team to pre-frame F&I value during vehicle presentation ("warm handoff")', primaryRole: 'Sales Manager' },
      { text: 'Implement menu-based selling with tiered protection packages (good-better-best)', primaryRole: 'F&I Director' },
      { text: 'Enhance F&I manager consultative selling training and product knowledge', primaryRole: 'F&I Director' },
      { text: 'Deploy digital F&I presentation tools showing product value clearly', primaryRole: 'IT Manager' },
      { text: 'Expand product portfolio (maintenance plans, wheel/tire programs)', primaryRole: 'F&I Director' },
      { text: 'Establish minimum penetration targets with accountability and coaching', primaryRole: 'F&I Director' },
      { text: 'Create logical product pairings for higher PVR', primaryRole: 'F&I Director' },
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
      { text: 'Map all key functions and current ownership', primaryRole: 'General Manager' },
      { text: 'Identify functions without clear accountability', primaryRole: 'General Manager' },
      { text: 'Assign primary owner and backup for each function', primaryRole: 'General Manager' },
      { text: 'Document responsibilities in role descriptions', primaryRole: 'HR Manager' },
      { text: 'Communicate changes to all staff', primaryRole: 'General Manager' },
      { text: 'Include accountability in performance reviews', primaryRole: 'HR Manager' },
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
      { text: 'Assess current skill gaps across departments', primaryRole: 'HR Manager' },
      { text: 'Create training curriculum for each role', primaryRole: 'HR Manager' },
      { text: 'Schedule regular training sessions (weekly/monthly)', primaryRole: 'HR Manager' },
      { text: 'Partner with manufacturers for product training', primaryRole: 'HR Manager' },
      { text: 'Track certification progress per employee', primaryRole: 'HR Manager' },
      { text: 'Link training completion to career advancement', primaryRole: 'HR Manager' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Create dedicated BDC/internet department with clear ownership', primaryRole: 'General Manager' },
      { text: 'Define lead handoff protocols between BDC and sales floor', primaryRole: 'BDC Manager' },
      { text: 'Implement BDC-to-sales warm handoff with appointment confirmation', primaryRole: 'BDC Manager' },
      { text: 'Establish clear shift coverage ensuring no lead gaps', primaryRole: 'BDC Manager' },
      { text: 'Train BDC staff on response protocols and qualification criteria', primaryRole: 'HR Manager' },
      { text: 'Monitor handoff quality and customer experience at transition points', primaryRole: 'Customer Experience Manager' },
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
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Assign dedicated personnel responsibility for incentive program management', primaryRole: 'General Manager' },
      { text: 'Implement real-time incentive tracking dashboards (daily/weekly)', primaryRole: 'Finance Director' },
      { text: 'Create incentive attainment forecasts enabling proactive adjustments', primaryRole: 'Finance Director' },
      { text: 'Conduct monthly incentive reviews analyzing capture probability', primaryRole: 'Finance Director' },
      { text: 'Educate entire dealership team on incentive importance and individual role', primaryRole: 'General Manager' },
      { text: 'Create internal incentive alignment (staff bonuses tied to factory achievement)', primaryRole: 'General Manager' },
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
      { text: 'Identify 5-7 critical metrics for the department', primaryRole: 'Department Manager' },
      { text: 'Set realistic but challenging targets based on benchmarks', primaryRole: 'General Manager' },
      { text: 'Define measurement methodology and data sources', primaryRole: 'Department Manager' },
      { text: 'Configure reporting dashboards', primaryRole: 'IT Manager' },
      { text: 'Communicate KPIs and targets to all team members', primaryRole: 'Department Manager' },
      { text: 'Review and adjust targets quarterly', primaryRole: 'General Manager' },
    ]
  },

  // KPI_NOT_DEFINED — Foundational (score 20–45)
  {
    templateId: 'ACT-KND-FOUND',
    signalCode: 'KPI_NOT_DEFINED',
    scoreBand: 'foundational',
    title: 'Define your first 5 operational KPIs',
    description: 'No performance metrics are defined. Start small — 5 clear KPIs with targets is transformative for a dealership with no measurement culture.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    implementationSteps: [
      { text: 'Agree on 5 KPIs as a leadership team — one per department. Write them on a whiteboard and agree on the definition of each', primaryRole: 'General Manager' },
      { text: 'For each KPI, agree on the data source — where will this number come from and who owns it?', primaryRole: 'Department Manager' },
      { text: 'Set a target for each KPI using these guides if unsure: NVS closing ratio 20%, service utilisation 75%, F&I penetration 65%', primaryRole: 'General Manager' },
      { text: 'Create a simple weekly scoreboard — a printed or whiteboard table is fine to start', primaryRole: 'Department Manager' },
      { text: 'Review the 5 KPIs in your next weekly management meeting and keep them visible', primaryRole: 'General Manager' },
    ]
  },
  // KPI_NOT_DEFINED — Developing (score 46–69)
  {
    templateId: 'ACT-KND-DEV',
    signalCode: 'KPI_NOT_DEFINED',
    scoreBand: 'developing',
    title: 'Build a comprehensive departmental KPI framework',
    description: 'Some KPIs exist informally. Structure a full measurement framework with targets, owners, and review cadence.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 21,
    defaultPriority: 'HIGH',
    implementationSteps: [
      { text: 'Map every existing metric tracked, however informally, into a master KPI register', primaryRole: 'Finance Director' },
      { text: 'Identify gaps: which departments have no formal metrics? Start there', primaryRole: 'General Manager' },
      { text: 'Define 5–7 KPIs per department with formula, data source, and target', primaryRole: 'Department Manager' },
      { text: 'Configure DMS or CRM reporting to auto-populate KPIs where possible — avoid manual data entry', primaryRole: 'Operations Manager' },
      { text: 'Assign a KPI owner per metric accountable for accuracy and trend analysis', primaryRole: 'General Manager' },
      { text: 'Set a monthly KPI review as a standing agenda item in management meetings', primaryRole: 'General Manager' },
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
      { text: 'Schedule weekly department performance reviews', primaryRole: 'General Manager' },
      { text: 'Create standard review meeting agenda', primaryRole: 'General Manager' },
      { text: 'Prepare automated performance reports', primaryRole: 'IT Manager' },
      { text: 'Document action items from each review', primaryRole: 'Department Manager' },
      { text: 'Track action item completion', primaryRole: 'Department Manager' },
      { text: 'Conduct monthly management performance review', primaryRole: 'General Manager' },
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
      { text: 'Review current CSI data collection methods', primaryRole: 'Customer Experience Manager' },
      { text: 'Implement post-transaction survey automation', primaryRole: 'IT Manager' },
      { text: 'Create escalation protocol for low scores', primaryRole: 'Customer Experience Manager' },
      { text: 'Schedule daily review of customer feedback', primaryRole: 'Customer Experience Manager' },
      { text: 'Train staff on service recovery techniques', primaryRole: 'HR Manager' },
      { text: 'Report CSI trends in weekly meetings', primaryRole: 'Customer Experience Manager' },
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
      { text: 'Analyze demand patterns by day/time/season', primaryRole: 'Operations Manager' },
      { text: 'Map current resource allocation against demand', primaryRole: 'Operations Manager' },
      { text: 'Identify peak periods with insufficient capacity', primaryRole: 'Operations Manager' },
      { text: 'Develop flexible staffing/scheduling model', primaryRole: 'Operations Manager' },
      { text: 'Cross-train staff for multi-department support', primaryRole: 'HR Manager' },
      { text: 'Monitor utilization and adjust monthly', primaryRole: 'Operations Manager' },
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
      { text: 'Analyze current appointment lead times', primaryRole: 'Service Manager' },
      { text: 'Review bay utilization by hour/day', primaryRole: 'Workshop Controller' },
      { text: 'Optimize scheduling algorithm for efficiency', primaryRole: 'Service Manager' },
      { text: 'Consider extended hours or weekend capacity', primaryRole: 'Service Manager' },
      { text: 'Implement online booking with real-time availability', primaryRole: 'IT Manager' },
      { text: 'Track appointment availability weekly', primaryRole: 'Service Manager' },
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
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement multi-touchpoint confirmation sequence (at booking, 48hrs, 24hrs, 2hrs prior)', primaryRole: 'BDC Manager' },
      { text: 'Use multiple channels (email, SMS, phone, video message)', primaryRole: 'BDC Manager' },
      { text: 'Send personalized video confirmations from sales advisor', primaryRole: 'BDC Manager' },
      { text: 'Provide "add to calendar" functionality at booking', primaryRole: 'IT Manager' },
      { text: 'Shorten time between appointment setting and actual appointment', primaryRole: 'Service Manager' },
      { text: 'Create tiered no-show policy (warnings → deposits → restricted scheduling)', primaryRole: 'Service Manager' },
      { text: 'Reward consistent show behavior with perks (priority scheduling, free services)', primaryRole: 'Customer Experience Manager' },
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
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement BDC to handle appointment setting, freeing sales team for closing', primaryRole: 'General Manager' },
      { text: 'Optimize staffing levels and schedules to match traffic patterns', primaryRole: 'Operations Manager' },
      { text: 'Automate administrative tasks (credit apps, paperwork, vehicle prep coordination)', primaryRole: 'IT Manager' },
      { text: 'Deploy digital retailing tools to reduce transaction friction and time', primaryRole: 'IT Manager' },
      { text: 'Implement performance management with clear productivity targets', primaryRole: 'General Manager' },
      { text: 'Benchmark against industry standards (target: 15-20 units/month for high performers)', primaryRole: 'General Manager' },
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
      { text: 'Audit current CRM usage and feature adoption', primaryRole: 'IT Manager' },
      { text: 'Identify underutilized features with high value', primaryRole: 'IT Manager' },
      { text: 'Create role-specific training modules', primaryRole: 'HR Manager' },
      { text: 'Schedule hands-on training sessions', primaryRole: 'HR Manager' },
      { text: 'Configure system to enforce data entry standards', primaryRole: 'IT Manager' },
      { text: 'Monitor adoption metrics weekly', primaryRole: 'IT Manager' },
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
      { text: 'Audit current digital presence and performance', primaryRole: 'Marketing Manager' },
      { text: 'Optimize website for lead capture', primaryRole: 'Marketing Manager' },
      { text: 'Implement/enhance online chat and scheduling', primaryRole: 'IT Manager' },
      { text: 'Create content strategy for social media', primaryRole: 'Marketing Manager' },
      { text: 'Set up marketing automation workflows', primaryRole: 'Marketing Manager' },
      { text: 'Track digital lead sources and conversion', primaryRole: 'Marketing Manager' },
    ]
  },

  // TOOL_UNDERUTILISED — Foundational (score 20–45)
  {
    templateId: 'ACT-TUU-FOUND',
    signalCode: 'TOOL_UNDERUTILISED',
    scoreBand: 'foundational',
    title: 'Identify and address core technology adoption barriers',
    description: 'Technology investment is not being used. Before pushing adoption, understand why staff are not using the tools.',
    defaultOwnerRole: 'Operations Manager',
    defaultTimeframeDays: 14,
    defaultPriority: 'HIGH',
    implementationSteps: [
      { text: 'Run 1-on-1 conversations with 5 staff — ask what stops them using the system today (no blame, genuine discovery)', primaryRole: 'General Manager' },
      { text: 'Categorise the barriers: training gap? Workflow friction? No perceived value? Wrong tool for the job?', primaryRole: 'Operations Manager' },
      { text: 'If training gap: schedule a 90-minute focused hands-on session within 7 days', primaryRole: 'HR Manager' },
      { text: 'If workflow friction: escalate to your DMS/CRM account manager with specific examples', primaryRole: 'Department Manager' },
      { text: 'Set a minimum adoption floor: every lead must be logged, no exceptions — management checks daily for 30 days', primaryRole: 'Sales Manager' },
    ]
  },
  // TOOL_UNDERUTILISED — Developing (score 46–69)
  {
    templateId: 'ACT-TUU-DEV',
    signalCode: 'TOOL_UNDERUTILISED',
    scoreBand: 'developing',
    title: 'Drive systematic technology adoption across the team',
    description: 'Technology is partially adopted. Build a structured adoption programme with compliance tracking.',
    defaultOwnerRole: 'Operations Manager',
    defaultTimeframeDays: 30,
    defaultPriority: 'MEDIUM',
    implementationSteps: [
      { text: 'Conduct a technology audit: list every tool the dealership pays for and measure actual usage vs. potential', primaryRole: 'Operations Manager' },
      { text: 'Prioritise the 2 tools with highest ROI potential and lowest current adoption for immediate focus', primaryRole: 'General Manager' },
      { text: 'Create role-specific training for each tool — sales team sees a different workflow than service advisors', primaryRole: 'HR Manager' },
      { text: 'Assign department tech champions — peer trainers who support colleagues day-to-day', primaryRole: 'Department Manager' },
      { text: 'Build technology adoption into weekly team meetings — show weekly usage stats to the team', primaryRole: 'Department Manager' },
      { text: 'Review tool subscription ROI quarterly — cancel tools below 70% adoption after 90 days', primaryRole: 'Finance Director' },
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
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Deploy digital retailing tools enabling online credit applications and approvals', primaryRole: 'IT Manager' },
      { text: 'Streamline F&I process with menu selling and e-contracting', primaryRole: 'F&I Director' },
      { text: 'Implement "one-visit close" protocols for qualified buyers', primaryRole: 'Sales Manager' },
      { text: 'Provide real-time inventory matching and digital retailing tools', primaryRole: 'IT Manager' },
      { text: 'Use technology for virtual selling and remote deal structuring', primaryRole: 'IT Manager' },
      { text: 'Expand lender network for faster approvals and more options', primaryRole: 'F&I Director' },
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
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Deploy digital F&I presentation tools with visual value demonstrations', primaryRole: 'IT Manager' },
      { text: 'Create "protection package" bundles increasing perceived value vs. individual products', primaryRole: 'F&I Director' },
      { text: 'Use customer testimonials and real-life examples demonstrating product benefits', primaryRole: 'F&I Director' },
      { text: 'Implement payment-based selling showing minimal payment impact of additional products', primaryRole: 'F&I Director' },
      { text: 'Expand product portfolio (key replacement, tire-wheel, windshield)', primaryRole: 'F&I Director' },
      { text: 'Use depreciation charts and total-loss scenario illustrations for GAP selling', primaryRole: 'F&I Director' },
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
    relevantBusinessModels: ['3s', '4s'],
    implementationSteps: [
      { text: 'Deploy inventory management technology with turn rate alerts and recommendations', primaryRole: 'IT Manager' },
      { text: 'Implement data-driven acquisition targeting high-demand vehicles with fast turn history', primaryRole: 'Used Vehicle Manager' },
      { text: 'Use predictive analytics identifying slow-turn risks early for intervention', primaryRole: 'Used Vehicle Manager' },
      { text: 'Enhance digital marketing and merchandising accelerating online engagement', primaryRole: 'Marketing Manager' },
      { text: 'Deploy real-time aged inventory dashboards with vehicle-level visibility', primaryRole: 'IT Manager' },
      { text: 'Benchmark competitor days-to-sale using market intelligence tools', primaryRole: 'Used Vehicle Manager' },
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
      { text: 'Define decision authority matrix by role/amount', primaryRole: 'General Manager' },
      { text: 'Establish approval workflows for key decisions', primaryRole: 'General Manager' },
      { text: 'Schedule regular management review meetings', primaryRole: 'General Manager' },
      { text: 'Create exception reporting protocols', primaryRole: 'Finance Director' },
      { text: 'Implement audit checkpoints for high-risk areas', primaryRole: 'Finance Director' },
      { text: 'Document and communicate governance policies', primaryRole: 'General Manager' },
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
      { text: 'Define aging policy with price reduction triggers', primaryRole: 'Used Vehicle Manager' },
      { text: 'Implement daily aged inventory review', primaryRole: 'Used Vehicle Manager' },
      { text: 'Set maximum days-in-stock targets', primaryRole: 'Used Vehicle Manager' },
      { text: 'Create escalation path for aged units', primaryRole: 'General Manager' },
      { text: 'Review and approve pricing adjustments weekly', primaryRole: 'Used Vehicle Manager' },
      { text: 'Track aging metrics and hold managers accountable', primaryRole: 'General Manager' },
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
    relevantBusinessModels: ['3s', '4s'],
    implementationSteps: [
      { text: 'Strengthen customer qualification including financial pre-qualification', primaryRole: 'Sales Manager' },
      { text: 'Require meaningful deposits ($500-1,000+) demonstrating commitment', primaryRole: 'Sales Manager' },
      { text: 'Implement proactive communication cadence (weekly updates) maintaining engagement', primaryRole: 'Sales Manager' },
      { text: 'Create early warning system identifying at-risk orders for intervention', primaryRole: 'IT Manager' },
      { text: 'Deploy customer-facing order tracking increasing transparency', primaryRole: 'IT Manager' },
      { text: 'Conduct "order confirmation" calls 24-48 hours after order', primaryRole: 'BDC Manager' },
      { text: 'Analyze cancellation reasons systematically to address root causes', primaryRole: 'Sales Manager' },
      { text: 'Monitor cancellation rate by salesperson identifying training needs', primaryRole: 'Sales Manager' },
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
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement real-time incentive tracking dashboards monitoring progress daily/weekly', primaryRole: 'Finance Director' },
      { text: 'Balance incentive pursuit with margin management (avoid losing money for bonuses)', primaryRole: 'General Manager' },
      { text: 'Develop contingency strategies for near-miss situations (targeted marketing, pricing adjustments)', primaryRole: 'Sales Manager' },
      { text: 'Document and analyze near-miss situations to prevent recurrence', primaryRole: 'Finance Director' },
      { text: 'Create internal incentive alignment (staff bonuses tied to factory achievement)', primaryRole: 'General Manager' },
      { text: 'Negotiate with manufacturer on unrealistic or misaligned incentive programs', primaryRole: 'General Manager' },
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
