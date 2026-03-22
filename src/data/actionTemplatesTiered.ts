/**
 * Tiered Action Templates
 *
 * KPI-specific action templates organised into three score bands:
 *   foundational  20–45  (urgent remediation)
 *   developing    46–69  (structured improvement)
 *   optimising    70–84  (fine-tuning toward excellence)
 *
 * Business-model filtering and role-addressed steps are first-class concerns.
 * Covers 8 KPI signal codes across NVS, UVS, SVC, FIN, and PTS departments.
 *
 * Constraints enforced at type-level via relevantBusinessModels:
 *   - UVS templates do NOT fire for sales_only or service_only
 *   - PTS templates do NOT fire for sales_only or service_only
 */

export type TieredSignalCode =
  | 'NVS_LEAD_RESPONSE'
  | 'NVS_CLOSING_RATIO'
  | 'NVS_GROSS_PER_UNIT'
  | 'UVS_STOCK_TURN'
  | 'SVC_WORKSHOP_UTILISATION'
  | 'SVC_CSI'
  | 'FIN_NET_PROFIT'
  | 'PTS_OBSOLESCENCE';

export type ScoreBand = 'foundational' | 'developing' | 'optimising';

export type BusinessModel = 'sales_only' | 'service_only' | '2s' | '3s' | '4s';

export type PrimaryRole =
  | 'Dealer Principal'
  | 'General Manager'
  | 'Sales Manager'
  | 'Used Vehicle Manager'
  | 'Aftersales Manager'
  | 'Workshop Controller'
  | 'Parts Manager'
  | 'Finance & Insurance Manager'
  | 'Marketing Manager'
  | 'HR / Training Manager'
  | 'IT / DMS Administrator';

export interface TieredImplementationStep {
  text: string;
  primaryRole: PrimaryRole;
}

export interface TieredActionTemplate {
  templateId: string;
  signalCode: TieredSignalCode;
  scoreBand: ScoreBand;
  title: string;
  description: string;
  defaultOwnerRole: PrimaryRole;
  defaultTimeframeDays: number;
  relevantBusinessModels: BusinessModel[];
  implementationSteps: TieredImplementationStep[];
}

// ─────────────────────────────────────────────────────────────────────────────
// NVS_LEAD_RESPONSE
// Relevant for: any business model with a new vehicle sales department
// ─────────────────────────────────────────────────────────────────────────────

const NVS_LEAD_RESPONSE_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-NVS-LR-FOUND',
    signalCode: 'NVS_LEAD_RESPONSE',
    scoreBand: 'foundational',
    title: 'Establish a Lead Response Protocol',
    description: 'No consistent process exists for handling inbound leads. Define ownership, set a response SLA, and make sure every lead is acknowledged within 60 minutes.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Set a non-negotiable response SLA — target ≤60 min for all inbound leads', primaryRole: 'Dealer Principal' },
      { text: 'Assign a named owner for the inbound lead queue during opening hours', primaryRole: 'Sales Manager' },
      { text: 'Configure the CRM/DMS to timestamp every inbound lead on receipt', primaryRole: 'IT / DMS Administrator' },
      { text: 'Brief sales team on the urgency and commercial impact of fast response', primaryRole: 'HR / Training Manager' },
      { text: 'Review response time report daily for the first 30 days', primaryRole: 'General Manager' },
    ],
  },
  {
    templateId: 'TIERED-NVS-LR-DEV',
    signalCode: 'NVS_LEAD_RESPONSE',
    scoreBand: 'developing',
    title: 'Implement a Structured Lead Response Cadence',
    description: 'Response happens but lacks consistency or follow-through. Build a multi-touch sequence and automate initial acknowledgement so no lead falls through the cracks.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 21,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Audit lead sources and measure current response time by channel (web, phone, walk-in)', primaryRole: 'Sales Manager' },
      { text: 'Design a 5-touch follow-up sequence (immediate call → same-day email → day 3 SMS → day 7 call → day 14 email)', primaryRole: 'Sales Manager' },
      { text: 'Set up automated lead acknowledgement messages to buy time while a human calls back', primaryRole: 'IT / DMS Administrator' },
      { text: 'Align ad messaging and landing pages to the response experience customers will receive', primaryRole: 'Marketing Manager' },
      { text: 'Set KPI: 90% of leads responded to within 30 minutes; review weekly', primaryRole: 'General Manager' },
    ],
  },
  {
    templateId: 'TIERED-NVS-LR-OPT',
    signalCode: 'NVS_LEAD_RESPONSE',
    scoreBand: 'optimising',
    title: 'Refine Lead Response Quality and Personalisation',
    description: 'Response speed is adequate but quality and conversion vary by consultant. Analyse conversion data by source and person, then use coaching and tooling to close the gap.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Pull response-to-appointment conversion by salesperson and lead source — identify outliers', primaryRole: 'Sales Manager' },
      { text: 'Use call recordings to coach underperformers on tone, urgency, and questioning technique', primaryRole: 'HR / Training Manager' },
      { text: 'Personalise follow-up templates by lead source and vehicle interest to improve relevance', primaryRole: 'Marketing Manager' },
      { text: 'Integrate lead scoring to surface hot prospects and trigger priority alerts', primaryRole: 'IT / DMS Administrator' },
      { text: 'Review lead-to-sale conversion monthly and set a stretch target vs network benchmark', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NVS_CLOSING_RATIO
// ─────────────────────────────────────────────────────────────────────────────

const NVS_CLOSING_RATIO_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-NVS-CR-FOUND',
    signalCode: 'NVS_CLOSING_RATIO',
    scoreBand: 'foundational',
    title: 'Build Fundamental Sales Process Discipline',
    description: 'The closing ratio is critically low, indicating a broken or absent sales process. Map where deals are lost and introduce the minimum viable sales steps before any advanced technique training.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 21,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Map each deal stage in the DMS from first contact to delivery and identify where exits occur', primaryRole: 'General Manager' },
      { text: 'Implement a mandatory lost-deal debrief for every un-converted prospect', primaryRole: 'Sales Manager' },
      { text: 'Deliver a half-day objection handling workshop to all sales consultants', primaryRole: 'HR / Training Manager' },
      { text: 'Set a minimum closing ratio target and display it on the sales board', primaryRole: 'Sales Manager' },
      { text: 'Hold a monthly deal review to identify patterns and actions', primaryRole: 'Dealer Principal' },
    ],
  },
  {
    templateId: 'TIERED-NVS-CR-DEV',
    signalCode: 'NVS_CLOSING_RATIO',
    scoreBand: 'developing',
    title: 'Strengthen Negotiation and Follow-Up Systems',
    description: 'Sales process exists but conversion rate is below potential. Tighten negotiation structure, introduce F&I early in the process, and systematise prospect follow-up.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 28,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Introduce a structured negotiation framework (e.g., 4-square) and train the team on its use', primaryRole: 'Sales Manager' },
      { text: 'Introduce F&I to the customer at or before the test drive stage — not after price agreement', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Build a 30/60/90-day follow-up cadence for all unconverted prospects in the CRM', primaryRole: 'Sales Manager' },
      { text: 'Configure CRM pipeline stages to capture every stage outcome — no blank fields', primaryRole: 'IT / DMS Administrator' },
      { text: 'Run a weekly deal review meeting with pipeline visibility for all open opportunities', primaryRole: 'General Manager' },
    ],
  },
  {
    templateId: 'TIERED-NVS-CR-OPT',
    signalCode: 'NVS_CLOSING_RATIO',
    scoreBand: 'optimising',
    title: 'Advanced Consultative Selling and Pipeline Management',
    description: 'Closing ratio is above average but ceiling remains. Identify and replicate top-performer behaviours, run targeted re-engagement campaigns, and build a data-driven coaching culture.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Identify the top 20% of performers by closing ratio and document their approach for replication', primaryRole: 'Sales Manager' },
      { text: 'Deliver consultative selling workshops focused on needs discovery and value articulation', primaryRole: 'HR / Training Manager' },
      { text: 'Launch a re-engagement campaign for prospects that were lost in the last 90 days', primaryRole: 'Marketing Manager' },
      { text: 'Build a closing ratio leaderboard by salesperson and model line — update weekly', primaryRole: 'IT / DMS Administrator' },
      { text: 'Benchmark closing ratio against OEM network and set a top-quartile target', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NVS_GROSS_PER_UNIT
// ─────────────────────────────────────────────────────────────────────────────

const NVS_GROSS_PER_UNIT_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-NVS-GPU-FOUND',
    signalCode: 'NVS_GROSS_PER_UNIT',
    scoreBand: 'foundational',
    title: 'Stop Discount Bleeding and Establish Floor Pricing',
    description: 'Gross per unit is critically low. Discounting authority is uncontrolled and F&I penetration is negligible. Impose price floors immediately and remove unauthorised discount authority.',
    defaultOwnerRole: 'Dealer Principal',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Set a minimum gross per unit floor by model line — no deal approved below this without DP sign-off', primaryRole: 'Dealer Principal' },
      { text: 'Remove blanket discount authority from sales consultants — escalation required for any discount', primaryRole: 'General Manager' },
      { text: 'Review the deal register weekly with front-end gross visible to all managers', primaryRole: 'General Manager' },
      { text: 'Immediately increase focus on F&I product introduction to protect total deal gross', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Brief the sales team on why gross per unit matters and what the new rules are', primaryRole: 'Sales Manager' },
    ],
  },
  {
    templateId: 'TIERED-NVS-GPU-DEV',
    signalCode: 'NVS_GROSS_PER_UNIT',
    scoreBand: 'developing',
    title: 'Value Selling and Back-End Gross Improvement',
    description: 'Front-end gross is inconsistent and F&I penetration is below target. Train consultants on value-based selling, add an accessories menu, and set clear back-end gross targets.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 28,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Deliver value-based selling training — focus on how to sell on product, not price', primaryRole: 'HR / Training Manager' },
      { text: 'Introduce a structured accessories and add-on menu presented at every handover', primaryRole: 'Sales Manager' },
      { text: 'Set F&I penetration targets (per product) and hold a monthly review', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Implement a gross-per-unit report by salesperson and model — distribute weekly', primaryRole: 'General Manager' },
      { text: 'Deliver negotiation skills training focused on defending the deal value, not the list price', primaryRole: 'HR / Training Manager' },
    ],
  },
  {
    templateId: 'TIERED-NVS-GPU-OPT',
    signalCode: 'NVS_GROSS_PER_UNIT',
    scoreBand: 'optimising',
    title: 'Premium Positioning and Portfolio Mix Optimisation',
    description: 'Gross per unit is solid but can be pushed further by refining model mix, reducing price-led advertising, and optimising the F&I product portfolio.',
    defaultOwnerRole: 'Dealer Principal',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['sales_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Analyse model mix profitability — shift selling effort toward higher-margin variants', primaryRole: 'Dealer Principal' },
      { text: 'Eliminate or reduce price-point advertising — rebuild creative around value and ownership experience', primaryRole: 'Marketing Manager' },
      { text: 'Audit F&I product mix: remove low-margin products, increase focus on highest-penetration lines', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Introduce a gross-positive recognition programme (e.g., gross champion of the month)', primaryRole: 'Sales Manager' },
      { text: 'Benchmark gross per unit against OEM dealer network — set a top-quartile target', primaryRole: 'General Manager' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UVS_STOCK_TURN
// NOT relevant for: sales_only, service_only
// ─────────────────────────────────────────────────────────────────────────────

const UVS_STOCK_TURN_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-UVS-ST-FOUND',
    signalCode: 'UVS_STOCK_TURN',
    scoreBand: 'foundational',
    title: 'Establish Stock Ageing Controls',
    description: 'Stock is sitting far too long, tying up capital and eroding margin. Perform an immediate age audit, introduce a hard stop policy, and clear aged units before new stock arrives.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Generate a full stock age report — identify all units over 60 days and prioritise clearance', primaryRole: 'Used Vehicle Manager' },
      { text: 'Set a maximum stock age policy — 90-day hard stop with no exceptions without DP approval', primaryRole: 'General Manager' },
      { text: 'Create an aged stock clearance plan with revised pricing for each unit over 60 days', primaryRole: 'Used Vehicle Manager' },
      { text: 'Review wholesale/retail mix and floorplan exposure with finance — adjust if needed', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Approve targeted write-downs to free up capital for faster-turning stock', primaryRole: 'Dealer Principal' },
    ],
  },
  {
    templateId: 'TIERED-UVS-ST-DEV',
    signalCode: 'UVS_STOCK_TURN',
    scoreBand: 'developing',
    title: 'Structured Appraisal and Weekly Pricing Cadence',
    description: 'Stock turn is below benchmark. Improve acquisition quality through a standardised appraisal process and ensure pricing stays competitive with a disciplined weekly review cadence.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 21,
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement a structured trade-in appraisal process with condition grading and market-data pricing', primaryRole: 'Used Vehicle Manager' },
      { text: 'Run a formal weekly pricing review using live market data (e.g., CAP, Eurotax, AutoTrader insights)', primaryRole: 'Used Vehicle Manager' },
      { text: 'Configure DMS to trigger automatic alerts at 30, 45, and 60 days on stock', primaryRole: 'IT / DMS Administrator' },
      { text: 'Increase digital and social media exposure for stock approaching the 45-day threshold', primaryRole: 'Marketing Manager' },
      { text: 'Set a stock turn target (minimum 3× per quarter) and report against it monthly', primaryRole: 'General Manager' },
    ],
  },
  {
    templateId: 'TIERED-UVS-ST-OPT',
    signalCode: 'UVS_STOCK_TURN',
    scoreBand: 'optimising',
    title: 'Dynamic Pricing and Predictive Stocking Strategy',
    description: 'Stock turn is close to target but further gains require dynamic pricing technology and a demand-led stocking strategy built on market and seasonality data.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Subscribe to a live market valuation data feed and integrate with DMS pricing workflow', primaryRole: 'IT / DMS Administrator' },
      { text: 'Build a stocking strategy focused on fast-turn vehicle profiles by age, fuel type, and price band', primaryRole: 'Used Vehicle Manager' },
      { text: 'Develop sourcing relationships (auction, direct, fleet) that prioritise in-demand vehicles', primaryRole: 'Used Vehicle Manager' },
      { text: 'Launch targeted performance marketing campaigns for high-demand models currently in stock', primaryRole: 'Marketing Manager' },
      { text: 'Review UV department P&L and stock turn together monthly — link turn to gross per unit', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVC_WORKSHOP_UTILISATION
// NOT relevant for: sales_only
// ─────────────────────────────────────────────────────────────────────────────

const SVC_WORKSHOP_UTILISATION_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-SVC-WU-FOUND',
    signalCode: 'SVC_WORKSHOP_UTILISATION',
    scoreBand: 'foundational',
    title: 'Fix Scheduling and Capacity Fundamentals',
    description: 'Workshop utilisation is critically low. Capacity is being lost to poor scheduling, inaccurate job time estimates, or unmanaged idle time. Establish basic capacity control before anything else.',
    defaultOwnerRole: 'Workshop Controller',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Map current booked capacity vs available hours to identify where daily utilisation is lost', primaryRole: 'Aftersales Manager' },
      { text: 'Introduce a structured daily scheduling board visible to all technicians and service advisors', primaryRole: 'Workshop Controller' },
      { text: 'Set a minimum utilisation target (≥75%) and report against it weekly', primaryRole: 'Aftersales Manager' },
      { text: 'Train service advisors on accurate job time estimation to reduce scheduling overruns', primaryRole: 'HR / Training Manager' },
      { text: 'Review the utilisation report in the daily stand-up for the first 60 days', primaryRole: 'General Manager' },
    ],
  },
  {
    templateId: 'TIERED-SVC-WU-DEV',
    signalCode: 'SVC_WORKSHOP_UTILISATION',
    scoreBand: 'developing',
    title: 'Productivity Measurement and Workflow Optimisation',
    description: 'Utilisation is tracked but below benchmark. Focus on reducing no-shows, managing work-in-progress, and measuring productive hours per technician to identify waste.',
    defaultOwnerRole: 'Aftersales Manager',
    defaultTimeframeDays: 21,
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Track productive hours per technician per day — post results on the workshop board', primaryRole: 'Workshop Controller' },
      { text: 'Analyse booking-to-arrival drop-off rate and introduce reminder calls/SMS to reduce no-shows', primaryRole: 'Aftersales Manager' },
      { text: 'Implement a work-in-progress board to surface waiting jobs and eliminate idle time between tasks', primaryRole: 'Workshop Controller' },
      { text: 'Configure DMS to report actual hours vs clock hours daily for each technician', primaryRole: 'IT / DMS Administrator' },
      { text: 'Set individual technician efficiency targets (target: ≥90% productive) and review monthly', primaryRole: 'Aftersales Manager' },
    ],
  },
  {
    templateId: 'TIERED-SVC-WU-OPT',
    signalCode: 'SVC_WORKSHOP_UTILISATION',
    scoreBand: 'optimising',
    title: 'Advanced Throughput and Upsell Integration',
    description: 'Utilisation is strong but the next step is to extract more revenue per visit through systematic inspection processes and a skilled upsell conversation at the service counter.',
    defaultOwnerRole: 'Aftersales Manager',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Implement a structured multi-point inspection (MPI) process on every vehicle — results presented to every customer', primaryRole: 'Workshop Controller' },
      { text: 'Build a structured upsell conversation guide for service advisors tied to MPI findings', primaryRole: 'Aftersales Manager' },
      { text: 'Deliver upsell skills training covering needs framing, urgency language, and value presentation', primaryRole: 'HR / Training Manager' },
      { text: 'Build a dashboard combining utilisation, ELR, and upsell conversion — update daily', primaryRole: 'IT / DMS Administrator' },
      { text: 'Benchmark effective labour rate (ELR) against OEM and regional averages — target top quartile', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVC_CSI
// NOT relevant for: sales_only
// ─────────────────────────────────────────────────────────────────────────────

const SVC_CSI_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-SVC-CSI-FOUND',
    signalCode: 'SVC_CSI',
    scoreBand: 'foundational',
    title: 'Establish Basic Customer Communication Standards',
    description: 'CSI is critically low, typically driven by poor communication and broken promises. Define the minimum expected behaviours and enforce them before tackling culture or loyalty.',
    defaultOwnerRole: 'Aftersales Manager',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Define and post non-negotiable communication standards: greeting, job update, handover explanation', primaryRole: 'Aftersales Manager' },
      { text: 'Implement a job completion status update to every customer before they need to ask', primaryRole: 'Workshop Controller' },
      { text: 'Train service advisors on professional telephone etiquette and face-to-face communication', primaryRole: 'HR / Training Manager' },
      { text: 'Share CSI scores with the team every week — make them visible on the service board', primaryRole: 'General Manager' },
      { text: 'Call every customer with a score below 7/10 personally within 48 hours', primaryRole: 'Aftersales Manager' },
    ],
  },
  {
    templateId: 'TIERED-SVC-CSI-DEV',
    signalCode: 'SVC_CSI',
    scoreBand: 'developing',
    title: 'Structured Follow-Up and Complaint Resolution',
    description: 'CSI is inconsistent. Introduce a post-service follow-up process, formalise complaint handling, and train the team on empathy and recovery to prevent repeat issues.',
    defaultOwnerRole: 'Aftersales Manager',
    defaultTimeframeDays: 21,
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Introduce a post-service follow-up call within 48 hours of every vehicle collection', primaryRole: 'Aftersales Manager' },
      { text: 'Build a formal complaints handling process with defined escalation steps and resolution timelines', primaryRole: 'Aftersales Manager' },
      { text: 'Guarantee all negative CSI responses are acknowledged personally within 24 hours', primaryRole: 'General Manager' },
      { text: 'Deliver an empathy and service recovery training session for all customer-facing service staff', primaryRole: 'HR / Training Manager' },
      { text: 'Review complaint trend data monthly and identify the top 3 recurring root causes to fix', primaryRole: 'Dealer Principal' },
    ],
  },
  {
    templateId: 'TIERED-SVC-CSI-OPT',
    signalCode: 'SVC_CSI',
    scoreBand: 'optimising',
    title: 'Experience Optimisation and Customer Loyalty Building',
    description: 'CSI is good but peak loyalty requires proactive relationship management. Introduce premium service options, a loyalty programme, and personalised communications to differentiate.',
    defaultOwnerRole: 'Aftersales Manager',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Design and pilot a premium collection and delivery service for high-value customers', primaryRole: 'Aftersales Manager' },
      { text: 'Build a service loyalty programme with meaningful, personalised rewards (not just points)', primaryRole: 'Marketing Manager' },
      { text: 'Automate personalised service reminders, MOT alerts, and ownership anniversary messages', primaryRole: 'IT / DMS Administrator' },
      { text: 'Introduce a VIP handling protocol for fleet accounts and high-lifetime-value retail customers', primaryRole: 'Aftersales Manager' },
      { text: 'Benchmark CSI against the OEM network — set a top-quartile target and review quarterly', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FIN_NET_PROFIT
// Relevant for all business models
// ─────────────────────────────────────────────────────────────────────────────

const FIN_NET_PROFIT_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-FIN-NP-FOUND',
    signalCode: 'FIN_NET_PROFIT',
    scoreBand: 'foundational',
    title: 'Establish Cost Control and Margin Baseline',
    description: 'Net profit is critically low or negative. Commission an immediate P&L review, identify the largest cost overruns, and impose purchase order controls before working on revenue improvement.',
    defaultOwnerRole: 'Dealer Principal',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['sales_only', 'service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Commission a full P&L review by department against OEM standards and industry benchmarks', primaryRole: 'Dealer Principal' },
      { text: 'Identify the top 5 cost overruns and assign a named owner accountable for reducing each', primaryRole: 'General Manager' },
      { text: 'Review all variable costs as a percentage of department revenue — flag anything above benchmark', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Implement a purchase order approval process for all non-routine expenditure above a defined threshold', primaryRole: 'General Manager' },
      { text: 'Set monthly net profit targets by department and schedule a formal monthly financial review', primaryRole: 'Dealer Principal' },
    ],
  },
  {
    templateId: 'TIERED-FIN-NP-DEV',
    signalCode: 'FIN_NET_PROFIT',
    scoreBand: 'developing',
    title: 'Department P&L Accountability and Reporting',
    description: 'Profit exists but departments lack visibility of their own contribution. Introduce department P&L reporting, set gross targets by area, and build a monthly management accounts discipline.',
    defaultOwnerRole: 'General Manager',
    defaultTimeframeDays: 28,
    relevantBusinessModels: ['sales_only', 'service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Introduce department P&L reporting — each department head receives their own numbers monthly', primaryRole: 'General Manager' },
      { text: 'Build a management accounts pack distributed within 5 working days of month end', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Set gross per unit and F&I penetration targets — link to department net contribution', primaryRole: 'Sales Manager' },
      { text: 'Set labour gross and parts gross targets with monthly review by the aftersales manager', primaryRole: 'Aftersales Manager' },
      { text: 'Hold a monthly financial review meeting with all department heads — every manager sees the group P&L', primaryRole: 'Dealer Principal' },
    ],
  },
  {
    templateId: 'TIERED-FIN-NP-OPT',
    signalCode: 'FIN_NET_PROFIT',
    scoreBand: 'optimising',
    title: 'Capital Efficiency and Portfolio Mix Optimisation',
    description: 'Profitable but ROI and capital deployment can be improved. Review return by department, optimise the product and model mix, and tie management incentives to net profit outcomes.',
    defaultOwnerRole: 'Dealer Principal',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['sales_only', 'service_only', '2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Review return on investment by department and reallocate headcount, floor space, or marketing spend accordingly', primaryRole: 'Dealer Principal' },
      { text: 'Analyse profitability by product line — increase focus on the highest-margin lines in each department', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Implement a management bonus structure with net profit as the primary performance trigger', primaryRole: 'General Manager' },
      { text: 'Review floorplan cost, facility financing, and overhead structure for refinancing opportunities', primaryRole: 'Finance & Insurance Manager' },
      { text: 'Benchmark net profit margin against OEM dealer network and set a top-quartile target', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PTS_OBSOLESCENCE
// NOT relevant for: sales_only, service_only
// ─────────────────────────────────────────────────────────────────────────────

const PTS_OBSOLESCENCE_TEMPLATES: TieredActionTemplate[] = [
  {
    templateId: 'TIERED-PTS-OB-FOUND',
    signalCode: 'PTS_OBSOLESCENCE',
    scoreBand: 'foundational',
    title: 'Identify and Contain Obsolete Stock',
    description: 'Parts obsolescence is critically high, representing dead capital on the shelf. Perform an immediate age analysis, initiate OEM returns, and stop reordering zero-demand parts.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 14,
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Generate a full parts stock age analysis — flag all parts with zero demand in the last 12 months', primaryRole: 'Parts Manager' },
      { text: 'Agree a write-down budget and an approval process for obsolete stock clearance', primaryRole: 'General Manager' },
      { text: 'Submit all eligible parts to the OEM return programme before the next cut-off date', primaryRole: 'Parts Manager' },
      { text: 'Immediately halt reordering of any part with zero demand in the last 12 months', primaryRole: 'Parts Manager' },
      { text: 'Approve the aged stock write-down plan and set a target obsolescence percentage', primaryRole: 'Dealer Principal' },
    ],
  },
  {
    templateId: 'TIERED-PTS-OB-DEV',
    signalCode: 'PTS_OBSOLESCENCE',
    scoreBand: 'developing',
    title: 'Order Discipline and Returns Management',
    description: 'Obsolescence is above target. Tighten ordering policy, introduce FIFO stock rotation, and configure the DMS to flag slow-moving parts automatically.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 21,
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Set a maximum stock holding policy by parts category — enforce before new orders are approved', primaryRole: 'Parts Manager' },
      { text: 'Implement a first-in-first-out (FIFO) stock rotation process in the parts store', primaryRole: 'Parts Manager' },
      { text: 'Configure DMS to automatically flag parts with no demand movement for 90+ days', primaryRole: 'IT / DMS Administrator' },
      { text: 'Restrict emergency and non-routine orders — introduce a manager approval step', primaryRole: 'Parts Manager' },
      { text: 'Report obsolescence as a percentage of total stock value monthly — target <5%', primaryRole: 'General Manager' },
    ],
  },
  {
    templateId: 'TIERED-PTS-OB-OPT',
    signalCode: 'PTS_OBSOLESCENCE',
    scoreBand: 'optimising',
    title: 'Demand Forecasting and Intelligent Stock Optimisation',
    description: 'Obsolescence is under control but can be further reduced through demand-led reorder automation, supplier return agreements, and alignment of stock with workshop bookings.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 30,
    relevantBusinessModels: ['2s', '3s', '4s'],
    implementationSteps: [
      { text: 'Analyse part number demand over a rolling 24-month window — remove persistent zero-movers', primaryRole: 'Parts Manager' },
      { text: 'Implement demand-driven automatic reorder points in the DMS based on usage history', primaryRole: 'IT / DMS Administrator' },
      { text: 'Negotiate return-to-vendor terms with preferred suppliers for slow-moving categories', primaryRole: 'Parts Manager' },
      { text: 'Align parts stocking strategy with scheduled service bookings and workshop demand forecasts', primaryRole: 'Aftersales Manager' },
      { text: 'Benchmark parts obsolescence rate against OEM network — set and hold a top-quartile target', primaryRole: 'Dealer Principal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Master collection
// ─────────────────────────────────────────────────────────────────────────────

export const TIERED_TEMPLATES: TieredActionTemplate[] = [
  ...NVS_LEAD_RESPONSE_TEMPLATES,
  ...NVS_CLOSING_RATIO_TEMPLATES,
  ...NVS_GROSS_PER_UNIT_TEMPLATES,
  ...UVS_STOCK_TURN_TEMPLATES,
  ...SVC_WORKSHOP_UTILISATION_TEMPLATES,
  ...SVC_CSI_TEMPLATES,
  ...FIN_NET_PROFIT_TEMPLATES,
  ...PTS_OBSOLESCENCE_TEMPLATES,
];

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a numeric score to its score band.
 * Scores outside the 20–84 range are clamped to the nearest band.
 */
export function scoreToBand(score: number): ScoreBand {
  if (score <= 45) return 'foundational';
  if (score <= 69) return 'developing';
  return 'optimising';
}

/**
 * Return the template for a given signal code and score.
 * Returns null if no matching template exists.
 */
export function getTieredTemplate(
  signalCode: TieredSignalCode,
  score: number,
): TieredActionTemplate | null {
  const band = scoreToBand(score);
  return TIERED_TEMPLATES.find(t => t.signalCode === signalCode && t.scoreBand === band) ?? null;
}

/**
 * Filter a template by the dealer's business model.
 * Returns the template unchanged if the business model is relevant, or null if not.
 * Callers should skip the signal entirely when this returns null.
 */
export function filterByBusinessModel(
  template: TieredActionTemplate,
  orgBusinessModel: BusinessModel,
): TieredActionTemplate | null {
  return template.relevantBusinessModels.includes(orgBusinessModel) ? template : null;
}

/**
 * Return all three band templates for a given signal code.
 */
export function getAllBandsForSignal(signalCode: TieredSignalCode): TieredActionTemplate[] {
  return TIERED_TEMPLATES.filter(t => t.signalCode === signalCode);
}
