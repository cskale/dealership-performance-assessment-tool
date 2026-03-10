/**
 * Context Intelligence Generator
 * 
 * Generates rich, consulting-grade content for the 10 new action fields.
 * Content is deterministic and specific to each action's department and template.
 */

import type { InstantiatedAction } from './signalEngine';
import { KPI_DEFINITIONS } from './kpiDefinitions';

interface ContextIntelligenceFields {
  action_context: string;
  business_impact: string;
  recommendation: string;
  expected_benefit: string;
  linked_kpis: Array<{ name: string; type: string; reason: string }>;
  likely_drivers: Array<{ name: string; type: string }>;
  likely_consequences: Array<{ name: string; type: string }>;
  impact_score: number;
  effort_score: number;
  urgency_score: number;
}

// Department-specific benchmark data for realistic context
const DEPT_BENCHMARKS: Record<string, { metric: string; topQuartile: string; gap: string }> = {
  'New Vehicle Sales': { metric: 'units per executive per month', topQuartile: '15–18', gap: '25–40%' },
  'Used Vehicle Sales': { metric: 'inventory turn rate', topQuartile: '12–14x per year', gap: '20–35%' },
  'Service': { metric: 'labour utilisation', topQuartile: '85–92%', gap: '15–25%' },
  'Parts & Inventory': { metric: 'parts fill rate', topQuartile: '92–96%', gap: '10–20%' },
  'Financial Operations': { metric: 'F&I penetration', topQuartile: '65–75%', gap: '15–30%' },
};

const DEFAULT_BENCHMARK = { metric: 'operational efficiency index', topQuartile: '80–90%', gap: '15–25%' };

// Signal-specific context templates
const SIGNAL_CONTEXT: Record<string, {
  gapTemplate: string;
  causeTemplate: string;
  consequenceTemplate: string;
}> = {
  PROCESS_NOT_STANDARDISED: {
    gapTemplate: 'Key operational processes in {dept} lack documented standards, leading to inconsistent execution and variable outcomes across team members.',
    causeTemplate: 'The root cause is the absence of formal standard operating procedures (SOPs) and structured process documentation, leaving execution quality dependent on individual habits rather than institutionalised best practices.',
    consequenceTemplate: 'Without standardisation, the dealership faces continued margin erosion, quality variance, and inability to scale improvements — typically costing 3–5% in recoverable revenue.',
  },
  PROCESS_NOT_EXECUTED: {
    gapTemplate: 'Defined processes in {dept} are not being consistently followed, creating execution gaps between documented procedures and actual day-to-day practice.',
    causeTemplate: 'The root cause is insufficient accountability infrastructure — compliance is not monitored, process champions are not assigned, and there are no systematic consequences for non-adherence.',
    consequenceTemplate: 'Persistent non-execution of defined processes typically results in 15–25% lower conversion rates, increased customer complaints, and missed revenue opportunities totalling 4–7% of departmental revenue.',
  },
  ROLE_OWNERSHIP_MISSING: {
    gapTemplate: 'Critical functions in {dept} lack clear role ownership and accountability, resulting in process gaps and dropped responsibilities.',
    causeTemplate: 'The root cause is unclear organisational structure where responsibilities are assumed but not formally documented, creating overlap in some areas and gaps in others.',
    consequenceTemplate: 'Without clear ownership, customer-facing failures increase, response times grow, and staff morale suffers — top-performing dealers with defined role matrices outperform peers by 20–30% on key metrics.',
  },
  KPI_NOT_DEFINED: {
    gapTemplate: 'Performance metrics in {dept} are either undefined or not systematically tracked, making it impossible to measure progress or identify underperformance.',
    causeTemplate: 'The root cause is a missing performance management framework — without defined KPIs, teams operate without clear targets and managers cannot identify areas requiring intervention.',
    consequenceTemplate: 'Dealerships without defined KPIs typically underperform those with structured measurement by 15–20%, as issues remain undetected until they become systemic.',
  },
  KPI_NOT_REVIEWED: {
    gapTemplate: 'Performance data in {dept} exists but is not regularly reviewed or acted upon, creating a disconnect between available insights and operational decisions.',
    causeTemplate: 'The root cause is the absence of a structured review cadence — data is collected but not analysed in routine management meetings, preventing timely corrective action.',
    consequenceTemplate: 'Failure to review KPIs regularly leads to delayed responses to underperformance, typically allowing issues to persist 4–6 weeks longer than necessary, costing 2–4% in preventable losses.',
  },
  CAPACITY_MISALIGNED: {
    gapTemplate: 'Resource allocation and capacity planning in {dept} are misaligned with actual demand patterns, creating bottlenecks during peak periods and waste during low periods.',
    causeTemplate: 'The root cause is the absence of data-driven capacity planning — staffing levels, scheduling, and resource allocation are based on legacy patterns rather than current demand analysis.',
    consequenceTemplate: 'Capacity misalignment typically results in 10–15% lost productivity, missed customer opportunities during peaks, and unnecessary costs during troughs — representing 3–6% of departmental revenue.',
  },
  TOOL_UNDERUTILISED: {
    gapTemplate: 'Available technology tools and systems in {dept} are not being fully leveraged, leaving significant value on the table from existing investments.',
    causeTemplate: 'The root cause is insufficient training, unclear adoption expectations, and lack of system enforcement — tools exist but staff defaults to manual or legacy methods.',
    consequenceTemplate: 'Tool underutilisation means the dealership is paying for capabilities it is not using — typically resulting in 20–30% lower productivity versus competitors who fully leverage their technology stack.',
  },
  GOVERNANCE_WEAK: {
    gapTemplate: 'Governance and oversight mechanisms in {dept} are insufficient, with inadequate approval workflows, decision authority clarity, and management review frequency.',
    causeTemplate: 'The root cause is an informal management culture where decisions are made ad-hoc without documented authority levels, creating risk of inconsistency and unchecked financial exposure.',
    consequenceTemplate: 'Weak governance exposes the dealership to financial risk, margin leakage, and compliance issues — dealers with strong governance frameworks typically achieve 5–8% higher net margins.',
  },
};

const DEFAULT_SIGNAL_CONTEXT = {
  gapTemplate: 'An operational gap has been identified in {dept} that is impacting performance relative to industry benchmarks.',
  causeTemplate: 'The root cause relates to process maturity gaps, where current practices have not kept pace with evolving best practices and market requirements.',
  consequenceTemplate: 'Inaction on this gap will likely result in continued underperformance and widening distance from top-quartile peer performance.',
};

// Impact descriptions by department
const BUSINESS_IMPACT_TEMPLATES: Record<string, string[]> = {
  'New Vehicle Sales': [
    'Improving this area typically yields a 3–5% uplift in front-end gross margin and 2–3 additional units per executive per month.',
    'Addressing this gap can recover €500–1,200 per retail unit in margin improvement, translating to €60,000–150,000 annually for mid-sized dealerships.',
  ],
  'Used Vehicle Sales': [
    'Optimising this area typically results in 15–20% faster inventory turn and €200–500 higher gross per unit through better pricing discipline.',
    'Improvements here can reduce average days-in-inventory by 8–12 days, freeing €50,000–120,000 in floorplan cost savings annually.',
  ],
  'Service': [
    'Service process improvements typically drive a 10–15% increase in labour revenue and 5–8% improvement in customer retention rates.',
    'Addressing this gap can generate 2–4 additional repair orders per day, representing €80,000–160,000 in incremental annual revenue.',
  ],
  'Parts & Inventory': [
    'Parts management improvements typically yield 5–8% reduction in obsolete stock and 3–5% increase in first-time fill rates.',
    'Optimising this area can reduce lost sales by €30,000–80,000 annually while freeing working capital tied up in slow-moving inventory.',
  ],
  'Financial Operations': [
    'F&I process improvements typically generate €150–400 additional back-end gross per retail unit through better product penetration.',
    'Addressing this area can increase overall F&I penetration by 8–15 percentage points, adding €100,000–250,000 in annual back-end revenue.',
  ],
};

const DEFAULT_BUSINESS_IMPACT = [
  'Addressing this gap typically results in a 5–10% improvement in departmental efficiency and 2–4% revenue uplift through better process execution.',
];

// Recommendation templates by signal code
const RECOMMENDATION_TEMPLATES: Record<string, string> = {
  PROCESS_NOT_STANDARDISED: 'Begin by conducting a process audit within the first week. The {owner} should document the top 3 high-impact workflows as formal SOPs, then schedule weekly compliance reviews for the first 60 days. Target: measurable standardisation of {dept} core processes within 30 days.',
  PROCESS_NOT_EXECUTED: 'The {owner} should implement daily execution checklists starting immediately and schedule a 15-minute daily stand-up to review compliance. Assign a process champion for each critical workflow and report adherence weekly to management. Target: 90%+ process compliance within 21 days.',
  ROLE_OWNERSHIP_MISSING: 'Map all unowned functions this week and assign primary accountable owners by end of Week 2. The {owner} should create a RACI matrix and communicate role clarity in a team meeting. Include accountability metrics in monthly performance reviews starting next cycle.',
  KPI_NOT_DEFINED: 'The {owner} should define 5–7 critical KPIs for {dept} within 7 days, using industry benchmarks as target references. Configure automated dashboards and schedule weekly review meetings. Cascade targets to individual team members within 14 days.',
  KPI_NOT_REVIEWED: 'Establish a structured weekly performance review cadence led by the {owner}. Create standardised review templates with variance analysis and action item tracking. Ensure each review produces at least 2 specific action items with named owners and deadlines.',
  CAPACITY_MISALIGNED: 'The {owner} should analyse 90-day demand patterns this week and create a data-driven staffing model. Implement flexible scheduling to match peak periods and cross-train staff for multi-function capability. Review capacity utilisation monthly.',
  TOOL_UNDERUTILISED: 'Conduct a technology audit by end of Week 1 identifying underused features with high business value. The {owner} should schedule role-specific training sessions and implement system usage requirements. Track adoption metrics weekly for the first 60 days.',
  GOVERNANCE_WEAK: 'The {owner} should establish a formal decision authority matrix and approval workflow within 14 days. Schedule bi-weekly management review meetings with structured agendas. Implement exception reporting for any high-risk decisions made outside approved channels.',
};

const DEFAULT_RECOMMENDATION = 'The {owner} should prioritise this area within the next 7–14 days, starting with a gap analysis and quick-win identification. Establish weekly tracking and review cadence to ensure sustained progress.';

// Expected benefit templates
const BENEFIT_TEMPLATES: Record<string, string[]> = {
  PROCESS_NOT_STANDARDISED: [
    'Achieve 90%+ process standardisation compliance within 30 days, resulting in 15–20% reduction in execution variance and 3–5% margin recovery.',
    'Standardised processes will reduce training time for new staff by 40% and improve customer experience consistency scores by 10–15 points.',
  ],
  PROCESS_NOT_EXECUTED: [
    'Reach 90%+ process compliance within 21 days, driving a 10–15% improvement in conversion rates and 5–8% reduction in customer complaints.',
    'Consistent process execution will generate 2–4 additional closed deals per month per executive through improved follow-up discipline.',
  ],
  ROLE_OWNERSHIP_MISSING: [
    'Clear role assignment will reduce response time gaps by 30–40% and eliminate ownership blind spots within 14 days.',
    'Defined accountability will improve task completion rates by 25–35% and reduce management escalations by 40%.',
  ],
  KPI_NOT_DEFINED: [
    'Defined KPIs with targets will enable early detection of underperformance, typically improving departmental results by 10–15% within 60 days.',
  ],
  KPI_NOT_REVIEWED: [
    'Regular KPI reviews will reduce average issue response time from 4–6 weeks to 1–2 weeks, preventing 60–70% of performance degradation.',
  ],
  CAPACITY_MISALIGNED: [
    'Data-driven capacity planning will improve resource utilisation by 15–20% and reduce missed customer opportunities by 25–30% during peak periods.',
  ],
  TOOL_UNDERUTILISED: [
    'Full technology adoption will improve team productivity by 20–30% and reduce manual process errors by 50–60% within 45 days.',
  ],
  GOVERNANCE_WEAK: [
    'Strengthened governance will reduce uncontrolled discounting by 30–40% and improve margin discipline, recovering 2–3% of net profit margin.',
  ],
};

const DEFAULT_BENEFIT = ['Implementing this improvement will yield measurable gains in efficiency and performance, targeting a 5–10% uplift within 60 days.'];

function getKPIType(kpiKey: string): 'INPUT KPI' | 'CORE KPI' | 'OUTCOME KPI' {
  const def = KPI_DEFINITIONS[kpiKey]?.en;
  if (!def) return 'CORE KPI';
  const cat = (def as any).category?.toLowerCase() || '';
  if (cat.includes('input') || cat.includes('lead') || cat.includes('activity')) return 'INPUT KPI';
  if (cat.includes('outcome') || cat.includes('result') || cat.includes('profit') || cat.includes('revenue')) return 'OUTCOME KPI';
  return 'CORE KPI';
}

function getKPIName(kpiKey: string): string {
  return KPI_DEFINITIONS[kpiKey]?.en?.title || kpiKey;
}

// Driver mappings by signal code
const DRIVERS_BY_SIGNAL: Record<string, Array<{ name: string; type: string }>> = {
  PROCESS_NOT_STANDARDISED: [
    { name: 'Missing SOPs', type: 'PROCESS GAP' },
    { name: 'Inconsistent execution methods', type: 'OPERATIONAL FACTOR' },
    { name: 'No compliance monitoring', type: 'PROCESS GAP' },
  ],
  PROCESS_NOT_EXECUTED: [
    { name: 'Low accountability', type: 'PROCESS GAP' },
    { name: 'No process enforcement', type: 'OPERATIONAL FACTOR' },
    { name: 'Staff skill gaps', type: 'INPUT KPI' },
  ],
  ROLE_OWNERSHIP_MISSING: [
    { name: 'Undefined responsibilities', type: 'PROCESS GAP' },
    { name: 'Overlapping role scope', type: 'OPERATIONAL FACTOR' },
  ],
  KPI_NOT_DEFINED: [
    { name: 'No measurement framework', type: 'PROCESS GAP' },
    { name: 'Unclear performance targets', type: 'OPERATIONAL FACTOR' },
  ],
  KPI_NOT_REVIEWED: [
    { name: 'No review cadence', type: 'PROCESS GAP' },
    { name: 'Data not acted upon', type: 'OPERATIONAL FACTOR' },
  ],
  CAPACITY_MISALIGNED: [
    { name: 'Demand pattern mismatch', type: 'OPERATIONAL FACTOR' },
    { name: 'Fixed scheduling model', type: 'PROCESS GAP' },
    { name: 'Insufficient cross-training', type: 'INPUT KPI' },
  ],
  TOOL_UNDERUTILISED: [
    { name: 'Insufficient training', type: 'INPUT KPI' },
    { name: 'Manual process defaults', type: 'PROCESS GAP' },
    { name: 'Low adoption enforcement', type: 'OPERATIONAL FACTOR' },
  ],
  GOVERNANCE_WEAK: [
    { name: 'Informal decision-making', type: 'PROCESS GAP' },
    { name: 'No approval workflows', type: 'OPERATIONAL FACTOR' },
    { name: 'Insufficient oversight frequency', type: 'PROCESS GAP' },
  ],
};

// Consequence mappings by department type
const CONSEQUENCES_SALES: Array<{ name: string; type: string }> = [
  { name: 'Revenue leakage', type: 'FINANCIAL OUTCOME' },
  { name: 'Lower closing rates', type: 'PRODUCTIVITY OUTCOME' },
  { name: 'Customer defection', type: 'CUSTOMER OUTCOME' },
];

const CONSEQUENCES_SERVICE: Array<{ name: string; type: string }> = [
  { name: 'Reduced retention', type: 'CUSTOMER OUTCOME' },
  { name: 'Lower labour revenue', type: 'FINANCIAL OUTCOME' },
  { name: 'Increased rework', type: 'PRODUCTIVITY OUTCOME' },
];

const CONSEQUENCES_DEFAULT: Array<{ name: string; type: string }> = [
  { name: 'Margin compression', type: 'FINANCIAL OUTCOME' },
  { name: 'Operational inefficiency', type: 'PRODUCTIVITY OUTCOME' },
  { name: 'Competitive disadvantage', type: 'CUSTOMER OUTCOME' },
];

const SALES_DEPTS = ['New Vehicle Sales', 'Used Vehicle Sales', 'Financial Operations', 'Sales', 'Finance'];
const SERVICE_DEPTS = ['Service', 'Parts & Inventory', 'Workshop', 'Parts', 'Aftersales'];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function generateContextIntelligence(action: InstantiatedAction): ContextIntelligenceFields {
  const dept = action.department;
  const signal = action.signalCode;
  const signalCtx = SIGNAL_CONTEXT[signal] || DEFAULT_SIGNAL_CONTEXT;
  const benchmark = DEPT_BENCHMARKS[dept] || DEFAULT_BENCHMARK;

  // action_context: 4 sentences
  const gap = signalCtx.gapTemplate.replace(/\{dept\}/g, dept);
  const cause = signalCtx.causeTemplate.replace(/\{dept\}/g, dept);
  const consequence = signalCtx.consequenceTemplate.replace(/\{dept\}/g, dept);
  const benchRef = `Top-quartile European dealers typically achieve ${benchmark.topQuartile} for ${benchmark.metric}. Current performance indicates a gap of approximately ${benchmark.gap}.`;
  const action_context = `${gap} ${cause} ${consequence} ${benchRef}`;

  // business_impact
  const impactOptions = BUSINESS_IMPACT_TEMPLATES[dept] || DEFAULT_BUSINESS_IMPACT;
  const business_impact = impactOptions[hashStr(action.templateId) % impactOptions.length];

  // recommendation
  const recTemplate = RECOMMENDATION_TEMPLATES[signal] || DEFAULT_RECOMMENDATION;
  const recommendation = recTemplate
    .replace(/\{owner\}/g, action.defaultOwnerRole)
    .replace(/\{dept\}/g, dept);

  // expected_benefit
  const benefitOptions = BENEFIT_TEMPLATES[signal] || DEFAULT_BENEFIT;
  const expected_benefit = benefitOptions[hashStr(action.templateId + dept) % benefitOptions.length];

  // linked_kpis: structured JSONB
  const kpiKeys = action.linkedKPIs || [];
  const linked_kpis: Array<{ name: string; type: string; reason: string }> = [];
  
  for (const key of kpiKeys.slice(0, 4)) {
    const def = KPI_DEFINITIONS[key]?.en;
    linked_kpis.push({
      name: getKPIName(key),
      type: getKPIType(key),
      reason: def?.whyItMatters 
        ? def.whyItMatters.substring(0, 120) 
        : `Improving ${action.title.toLowerCase()} directly impacts this KPI through better process execution.`,
    });
  }

  // Ensure minimum 2 KPIs
  if (linked_kpis.length < 2) {
    const deptKpis: Record<string, Array<{ name: string; type: string; reason: string }>> = {
      'New Vehicle Sales': [
        { name: 'Units Sold Per Executive', type: 'CORE KPI', reason: 'Direct measure of sales team productivity affected by process improvements.' },
        { name: 'Closing Ratio', type: 'CORE KPI', reason: 'Conversion effectiveness is directly improved by standardised sales processes.' },
      ],
      'Used Vehicle Sales': [
        { name: 'Days in Inventory', type: 'CORE KPI', reason: 'Inventory velocity improves with standardised pricing and reconditioning processes.' },
        { name: 'Used Vehicle Gross Profit', type: 'OUTCOME KPI', reason: 'Better process execution protects margins across the used vehicle lifecycle.' },
      ],
      'Service': [
        { name: 'Labour Utilisation Rate', type: 'CORE KPI', reason: 'Service productivity directly benefits from process standardisation and capacity alignment.' },
        { name: 'Service Retention Rate', type: 'OUTCOME KPI', reason: 'Customer retention improves when service experiences are consistent and predictable.' },
      ],
      'Parts & Inventory': [
        { name: 'Parts Fill Rate', type: 'CORE KPI', reason: 'First-time availability improves with better inventory management processes.' },
        { name: 'Parts Obsolescence Rate', type: 'INPUT KPI', reason: 'Active inventory governance reduces dead stock and frees working capital.' },
      ],
      'Financial Operations': [
        { name: 'F&I Penetration Rate', type: 'CORE KPI', reason: 'Structured F&I presentation processes directly drive product attachment rates.' },
        { name: 'Back-End Gross Per Unit', type: 'OUTCOME KPI', reason: 'F&I revenue per unit improves with menu-based selling and better product knowledge.' },
      ],
    };
    const fallbacks = deptKpis[dept] || [
      { name: 'Departmental Efficiency Score', type: 'CORE KPI', reason: 'Overall efficiency improves through better process execution and resource alignment.' },
      { name: 'Customer Satisfaction Index', type: 'OUTCOME KPI', reason: 'Consistent execution quality drives higher satisfaction and repeat business.' },
    ];
    for (const fb of fallbacks) {
      if (linked_kpis.length >= 2) break;
      if (!linked_kpis.find(k => k.name === fb.name)) linked_kpis.push(fb);
    }
  }

  // likely_drivers
  const likely_drivers = (DRIVERS_BY_SIGNAL[signal] || [
    { name: 'Process maturity gap', type: 'PROCESS GAP' },
    { name: 'Execution inconsistency', type: 'OPERATIONAL FACTOR' },
  ]).slice(0, 3);

  // likely_consequences
  let likely_consequences: Array<{ name: string; type: string }>;
  if (SALES_DEPTS.includes(dept)) {
    likely_consequences = CONSEQUENCES_SALES;
  } else if (SERVICE_DEPTS.includes(dept)) {
    likely_consequences = CONSEQUENCES_SERVICE;
  } else {
    likely_consequences = CONSEQUENCES_DEFAULT;
  }
  likely_consequences = likely_consequences.slice(0, 3);

  // Triage scores based on priority and template characteristics
  const priorityToImpact: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2 };
  const priorityToUrgency: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2 };
  
  const impact_score = priorityToImpact[action.priority] || 3;
  const urgency_score = priorityToUrgency[action.priority] || 3;
  
  // Effort based on timeframe
  let effort_score: number;
  if (action.defaultTimeframeDays <= 7) effort_score = 2;
  else if (action.defaultTimeframeDays <= 14) effort_score = 3;
  else if (action.defaultTimeframeDays <= 30) effort_score = 4;
  else effort_score = 5;

  return {
    action_context,
    business_impact,
    recommendation,
    expected_benefit,
    linked_kpis,
    likely_drivers,
    likely_consequences,
    impact_score,
    effort_score,
    urgency_score,
  };
}
