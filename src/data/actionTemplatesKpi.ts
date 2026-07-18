/**
 * KPI-Specific Action Templates
 *
 * One hand-written action template per KPI key (22 total), used by the
 * Action Plan Engine v2 to generate concrete, data-grounded recommendations
 * from quantitative KPI signals (see `src/lib/kpiSignalEngine.ts`).
 *
 * Templates support placeholder interpolation ({actual} {target} {gap} {unit})
 * against a `KpiSignal` via `interpolateKpiTemplate`.
 */

import { SignalCode } from './signalTypes';
import { ImplementationStep } from './actionTemplates';
import { KpiSignal } from '@/lib/kpiSignalEngine';

export interface KpiActionTemplate {
  templateId: string; // 'ACT-KPI-<kpikey-kebab>'
  kpiKey: string;
  signalCode: Exclude<SignalCode, 'NONE'>;
  title: string; // may contain {actual} {target} {gap} {unit}
  description: string; // same placeholders
  defaultOwnerRole: string;
  defaultTimeframeDays: number;
  implementationSteps: ImplementationStep[]; // step text may contain placeholders
}

/**
 * Formats a raw KPI value + unit for display.
 * EUR -> '€2,500', % -> '71.3%', else -> '2.0 hours'.
 */
function formatValue(value: number, unit: string): string {
  if (!Number.isFinite(value)) return '';

  const rounded = Math.round(value * 10) / 10;
  const numText = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);

  if (unit === 'EUR') {
    return `€${Math.round(value).toLocaleString('en-US')}`;
  }
  if (unit === '%') {
    return `${numText}%`;
  }
  return `${numText} ${unit}`;
}

/** Collapses runs of whitespace left behind by empty-string placeholder replacement. */
function collapseSpaces(text: string): string {
  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

function interpolateText(
  text: string,
  actualText: string,
  targetText: string,
  gapText: string,
  unit: string
): string {
  const replaced = text
    .replace(/\{actual\}/g, actualText)
    .replace(/\{target\}/g, targetText)
    .replace(/\{gap\}/g, gapText)
    .replace(/\{unit\}/g, unit ?? '');
  return collapseSpaces(replaced);
}

/**
 * Interpolates {actual}/{target}/{gap}/{unit} placeholders in a template's
 * title, description, and implementation step text using values from a
 * KpiSignal. Missing/NaN source values become empty strings (never raw
 * placeholders), with resulting double spaces collapsed. Does not mutate
 * the input template.
 */
export function interpolateKpiTemplate(
  t: KpiActionTemplate,
  s: KpiSignal
): KpiActionTemplate {
  const actualText = formatValue(s.actualValue, s.unit);
  const targetText = formatValue(s.targetValue, s.unit);
  const gapText = Number.isFinite(s.gapPercent) ? `${s.gapPercent}%` : '';
  const unit = s.unit ?? '';

  return {
    ...t,
    title: interpolateText(t.title, actualText, targetText, gapText, unit),
    description: interpolateText(t.description, actualText, targetText, gapText, unit),
    implementationSteps: t.implementationSteps.map((step) => ({
      ...step,
      text: interpolateText(step.text, actualText, targetText, gapText, unit),
    })),
  };
}

export const KPI_ACTION_TEMPLATES: Record<string, KpiActionTemplate> = {
  nvs_lead_response_1h_pct: {
    templateId: 'ACT-KPI-nvs-lead-response-1h-pct',
    kpiKey: 'nvs_lead_response_1h_pct',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Lift 1-hour lead response rate from {actual} to {target}',
    description:
      'Currently {actual} of new vehicle leads get a first response within 1 hour, against a benchmark of {target} — a gap of {gap}. Slow first response is the single biggest controllable driver of lead-to-sale conversion loss.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [
      { text: 'Pull the CRM lead response time report for the last 90 days and identify where response SLAs break (source, daypart, consultant).', primaryRole: 'Sales Manager' },
      { text: 'Introduce a 15-minute first-response SLA with automatic CRM escalation to the Sales Manager when breached.', primaryRole: 'Sales Manager' },
      { text: 'Review response-rate trend weekly in the sales meeting until the rate holds at {target} for 4 consecutive weeks.', primaryRole: 'General Manager' },
    ],
  },

  nvs_gross_profit_per_unit: {
    templateId: 'ACT-KPI-nvs-gross-profit-per-unit',
    kpiKey: 'nvs_gross_profit_per_unit',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Rebuild new vehicle gross profit per unit from {actual} to {target}',
    description:
      'New vehicle GP per unit is currently {actual} against a benchmark of {target} — a gap of {gap}. Without a regular deal-level review, discounting drifts unchecked and erodes front-end margin deal by deal.',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Export the DMS deal register for the last quarter and segment gross profit per unit by consultant and model line.', primaryRole: 'Sales Manager' },
      { text: 'Introduce a weekly deal-gross review meeting where every deal below {target} requires a documented justification.', primaryRole: 'Sales Manager' },
      { text: 'Set consultant-level discount authority limits, with GM sign-off required above the threshold.', primaryRole: 'General Manager' },
    ],
  },

  uvs_days_to_sale: {
    templateId: 'ACT-KPI-uvs-days-to-sale',
    kpiKey: 'uvs_days_to_sale',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Cut average days-to-sale from {actual} to {target}',
    description:
      'Used vehicles currently take {actual} to sell against a benchmark of {target} — a gap of {gap}. Every extra day on the lot erodes gross through price reductions, floorplan interest and depreciation.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Run an ageing analysis from the DMS used stock list and flag every unit over 60 days for immediate repricing or wholesale exit.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Standardise a 3-step price ladder (day 21, 42, 60) with mandatory repricing actions at each gate.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Set a 5-day recon-to-frontline SLA and track it weekly alongside days-to-sale.', primaryRole: 'Service Manager' },
    ],
  },

  uvs_gross_profit_per_unit: {
    templateId: 'ACT-KPI-uvs-gross-profit-per-unit',
    kpiKey: 'uvs_gross_profit_per_unit',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Restore used vehicle gross profit per unit from {actual} to {target}',
    description:
      'Used vehicle GP per unit is currently {actual} against a benchmark of {target} — a gap of {gap}. Without appraisal-to-sale margin tracking, over-allowing on trade-ins and under-pricing on the lot quietly compound into lost gross.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS unit-level margin report and compare appraisal value to actual sale gross for the last 90 days.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Introduce a weekly gross review of every unit sold below {target}, tracing the gross loss back to appraisal, recon, or pricing.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Tighten appraisal sign-off so trade allowances above guide require manager approval.', primaryRole: 'General Manager' },
    ],
  },

  uvs_recon_cost_per_unit: {
    templateId: 'ACT-KPI-uvs-recon-cost-per-unit',
    kpiKey: 'uvs_recon_cost_per_unit',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Bring reconditioning cost per unit down from {actual} to {target}',
    description:
      'Recon cost per unit currently averages {actual} against a benchmark of {target} — a gap of {gap}. Without spend governance, recon work orders run over scope and directly eat into used vehicle gross.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS recon work order history and identify units where recon spend exceeded {target} per unit, broken down by job type.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Introduce a mandatory recon estimate and manager sign-off before any work order exceeds a set cost ceiling.', primaryRole: 'Service Manager' },
      { text: 'Review recon spend per unit monthly against target and flag repeat cost overruns to the vendor or technician.', primaryRole: 'Used Vehicle Manager' },
    ],
  },

  uvs_used_to_new_ratio: {
    templateId: 'ACT-KPI-uvs-used-to-new-ratio',
    kpiKey: 'uvs_used_to_new_ratio',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Rebalance the used-to-new sales ratio from {actual} to {target}',
    description:
      'The used-to-new ratio is currently {actual} against a benchmark of {target} — a gap of {gap}. A ratio below target signals under-investment in used stock sourcing relative to new vehicle sales capacity.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS sales mix report for the last 6 months to quantify the used-to-new ratio trend by month.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Increase trade-in acquisition targets and auction sourcing budget to lift used stock volume toward {target}.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Review sourcing and mix ratio monthly with the General Manager as part of the stocking plan.', primaryRole: 'General Manager' },
    ],
  },

  uvs_appraisal_to_buy_pct: {
    templateId: 'ACT-KPI-uvs-appraisal-to-buy-pct',
    kpiKey: 'uvs_appraisal_to_buy_pct',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Lift appraisal-to-buy conversion from {actual} to {target}',
    description:
      'Only {actual} of vehicle appraisals convert to a purchase, against a benchmark of {target} — a gap of {gap}. A weak appraisal-to-buy process means the dealership is losing trade-in stock to competitors at the point of appraisal.',
    defaultOwnerRole: 'Used Vehicle Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [
      { text: 'Pull the CRM appraisal log for the last 90 days and identify where appraisals are lost (declined offer, no follow-up, price gap).', primaryRole: 'Used Vehicle Manager' },
      { text: 'Standardise the appraisal-to-offer process with a same-day written offer for every completed appraisal.', primaryRole: 'Used Vehicle Manager' },
      { text: 'Track conversion rate weekly and coach consultants whose appraisal-to-buy rate falls below {target}.', primaryRole: 'Sales Manager' },
    ],
  },

  svc_hours_per_ro: {
    templateId: 'ACT-KPI-svc-hours-per-ro',
    kpiKey: 'svc_hours_per_ro',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Increase hours sold per repair order from {actual} to {target}',
    description:
      'Hours per RO currently average {actual} against a benchmark of {target} — a gap of {gap}. Low hours per RO usually means technicians are under-selling additional work identified during the multi-point inspection.',
    defaultOwnerRole: 'Service Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [
      { text: 'Pull the DMS labour hours report by repair order for the last 90 days and segment by service advisor and technician.', primaryRole: 'Service Manager' },
      { text: 'Enforce a mandatory multi-point inspection with photo/video evidence on every RO before customer sign-off.', primaryRole: 'Workshop Controller' },
      { text: 'Review hours-per-RO by advisor weekly and coach on additional-work presentation technique.', primaryRole: 'Service Manager' },
    ],
  },

  svc_effective_labour_rate: {
    templateId: 'ACT-KPI-svc-effective-labour-rate',
    kpiKey: 'svc_effective_labour_rate',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Raise effective labour rate from {actual} to {target}',
    description:
      'The effective labour rate realised is currently {actual} against a benchmark of {target} — a gap of {gap}. A gap this size against the posted door rate points to uncontrolled discounting that is not being reviewed.',
    defaultOwnerRole: 'Service Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS labour billing report and compare posted door rate to effective realised rate by advisor and job type.', primaryRole: 'Service Manager' },
      { text: 'Introduce a monthly effective labour rate review, flagging discount codes and warranty rates dragging the average down.', primaryRole: 'Service Manager' },
      { text: 'Set discount authority limits for service advisors, with manager sign-off required above the threshold.', primaryRole: 'Service Manager' },
    ],
  },

  svc_workshop_loading_pct: {
    templateId: 'ACT-KPI-svc-workshop-loading-pct',
    kpiKey: 'svc_workshop_loading_pct',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Improve workshop loading from {actual} to {target}',
    description:
      'Workshop loading currently sits at {actual} against a benchmark of {target} — a gap of {gap}. Under-loaded capacity means technician hours and bay time are going unsold, directly reducing service department throughput and profit.',
    defaultOwnerRole: 'Service Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [
      { text: 'Pull the DMS workshop capacity and booking report for the last 8 weeks to identify low-loading dayparts and technicians.', primaryRole: 'Workshop Controller' },
      { text: 'Introduce proactive booking outreach (service reminders, recall campaigns) to fill identified low-loading slots.', primaryRole: 'BDC Manager' },
      { text: 'Review loading percentage daily in the workshop stand-up and rebalance technician allocation against target.', primaryRole: 'Workshop Controller' },
    ],
  },

  prt_gross_margin_pct: {
    templateId: 'ACT-KPI-prt-gross-margin-pct',
    kpiKey: 'prt_gross_margin_pct',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Rebuild parts gross margin from {actual} to {target}',
    description:
      'Parts gross margin is currently {actual} against a benchmark of {target} — a gap of {gap}. Without a regular margin review, discounting on counter and workshop sales quietly compresses profitability line by line.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS parts sales report and segment gross margin by sales channel (counter, workshop, wholesale) for the last quarter.', primaryRole: 'Parts Manager' },
      { text: 'Introduce a monthly margin review meeting where any channel below {target} requires a documented pricing action.', primaryRole: 'Parts Manager' },
      { text: 'Set matrix pricing rules in the DMS to remove ad-hoc manual discounting at the counter.', primaryRole: 'Parts Manager' },
    ],
  },

  prt_inventory_turns: {
    templateId: 'ACT-KPI-prt-inventory-turns',
    kpiKey: 'prt_inventory_turns',
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: 'Increase parts inventory turns from {actual} to {target}',
    description:
      'Parts inventory is currently turning {actual} against a benchmark of {target} — a gap of {gap}. Slow turns tie up working capital in stock that is not standardised against actual demand, and increase obsolescence risk.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS parts stock ageing report and classify inventory into fast, slow and obsolete movers.', primaryRole: 'Parts Manager' },
      { text: 'Standardise min/max stocking levels and reorder points based on the last 12 months of actual demand.', primaryRole: 'Parts Manager' },
      { text: 'Review turns monthly and action any slow-moving stock through return-to-supplier or promotional clearance.', primaryRole: 'Parts Manager' },
    ],
  },

  prt_sales_per_ro: {
    templateId: 'ACT-KPI-prt-sales-per-ro',
    kpiKey: 'prt_sales_per_ro',
    signalCode: 'PROCESS_NOT_EXECUTED',
    title: 'Grow parts sales per repair order from {actual} to {target}',
    description:
      'Parts sales per RO currently average {actual} against a benchmark of {target} — a gap of {gap}. Low parts attachment on workshop ROs usually means technicians and advisors are not consistently executing the additional-parts-sale process.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [
      { text: 'Pull the DMS RO-level parts sales report for the last 90 days and segment by service advisor and job type.', primaryRole: 'Parts Manager' },
      { text: 'Introduce a standard parts-attachment checklist (wipers, filters, brake fluid) for every workshop RO.', primaryRole: 'Service Manager' },
      { text: 'Review parts-per-RO attainment weekly against {target} in the service-parts joint meeting.', primaryRole: 'Parts Manager' },
    ],
  },

  prt_wholesale_pct: {
    templateId: 'ACT-KPI-prt-wholesale-pct',
    kpiKey: 'prt_wholesale_pct',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Bring wholesale share of parts sales down from {actual} to {target}',
    description:
      'Wholesale currently makes up {actual} of parts sales against a benchmark of {target} — a gap of {gap}. An over-reliance on low-margin wholesale volume without pricing governance dilutes overall parts department profitability.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS parts sales-by-channel report and quantify wholesale margin versus retail and workshop margin.', primaryRole: 'Parts Manager' },
      { text: 'Introduce tiered wholesale account pricing with minimum margin floors approved by the Parts Manager.', primaryRole: 'Parts Manager' },
      { text: 'Review wholesale mix and margin monthly and rebalance sales effort toward higher-margin retail and workshop channels.', primaryRole: 'General Manager' },
    ],
  },

  prt_backorder_days: {
    templateId: 'ACT-KPI-prt-backorder-days',
    kpiKey: 'prt_backorder_days',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Cut average parts backorder days from {actual} to {target}',
    description:
      'Parts backorders currently take {actual} to resolve against a benchmark of {target} — a gap of {gap}. Extended backorder times misalign stocking capacity with real demand, delaying repairs and hurting customer satisfaction.',
    defaultOwnerRole: 'Parts Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [
      { text: 'Pull the DMS backorder report for the last quarter and identify the top part numbers and suppliers driving delays.', primaryRole: 'Parts Manager' },
      { text: 'Adjust min/max stock levels and safety stock for the top recurring backorder lines identified.', primaryRole: 'Parts Manager' },
      { text: 'Review open backorder ageing weekly and escalate any line exceeding {target} to the supplier account manager.', primaryRole: 'Parts Manager' },
    ],
  },

  fin_net_profit_pct: {
    templateId: 'ACT-KPI-fin-net-profit-pct',
    kpiKey: 'fin_net_profit_pct',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Rebuild net profit margin from {actual} to {target}',
    description:
      'Net profit margin is currently {actual} against a benchmark of {target} — a gap of {gap}. Without a structured monthly P&L review across departments, cost creep and gross erosion go unaddressed until year-end.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 90,
    implementationSteps: [
      { text: 'Pull the DMS/accounting system P&L by department for the last 6 months and identify which departments are dragging net profit below {target}.', primaryRole: 'Finance Director' },
      { text: 'Introduce a monthly department-head P&L review meeting chaired by the General Manager.', primaryRole: 'General Manager' },
      { text: 'Set department-level profit targets tied to the overall {target} and track variance monthly.', primaryRole: 'Finance Director' },
    ],
  },

  fin_total_gp_per_nv_unit: {
    templateId: 'ACT-KPI-fin-total-gp-per-nv-unit',
    kpiKey: 'fin_total_gp_per_nv_unit',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Grow total gross profit per new vehicle unit from {actual} to {target}',
    description:
      'Total GP per new unit (front-end plus F&I and aftersales) is currently {actual} against a benchmark of {target} — a gap of {gap}. Without a blended-gross review, departments optimise in isolation and leave money on the table across the whole deal.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 90,
    implementationSteps: [
      { text: 'Pull the DMS deal register and blend front-end gross, F&I product income and prepaid service income per unit for the last quarter.', primaryRole: 'Finance Director' },
      { text: 'Introduce a monthly blended-gross review with Sales and F&I to identify units closing below {target}.', primaryRole: 'F&I Director' },
      { text: 'Set a minimum blended-gross target per unit and require manager sign-off on deals falling short.', primaryRole: 'General Manager' },
    ],
  },

  fin_floorplan_cost_pct: {
    templateId: 'ACT-KPI-fin-floorplan-cost-pct',
    kpiKey: 'fin_floorplan_cost_pct',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Bring floorplan cost down from {actual} to {target}',
    description:
      'Floorplan interest cost currently runs at {actual} of revenue against a benchmark of {target} — a gap of {gap}. Weak inventory-age governance lets aged stock accumulate floorplan interest that directly erodes net profit.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the DMS floorplan aging report and quantify interest cost attributable to units aged past 60 and 90 days.', primaryRole: 'Finance Director' },
      { text: 'Set a mandatory aged-stock reduction plan requiring repricing or wholesale exit past the 90-day threshold.', primaryRole: 'General Manager' },
      { text: 'Review floorplan cost as a percentage of revenue monthly against {target} in the finance review meeting.', primaryRole: 'Finance Director' },
    ],
  },

  fin_revenue_per_employee: {
    templateId: 'ACT-KPI-fin-revenue-per-employee',
    kpiKey: 'fin_revenue_per_employee',
    signalCode: 'CAPACITY_MISALIGNED',
    title: 'Raise revenue per employee from {actual} to {target}',
    description:
      'Revenue per employee is currently {actual} against a benchmark of {target} — a gap of {gap}. A gap this size signals headcount capacity is misaligned with revenue-generating throughput across departments.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 90,
    implementationSteps: [
      { text: 'Pull the payroll and DMS revenue reports and calculate revenue per employee by department for the last 12 months.', primaryRole: 'Finance Director' },
      { text: 'Benchmark headcount against throughput (ROs, units sold, revenue) by department to identify over- or under-staffed areas.', primaryRole: 'Operations Manager' },
      { text: 'Rebalance staffing plans and review revenue-per-employee quarterly against {target} with department heads.', primaryRole: 'General Manager' },
    ],
  },

  fin_debtor_days: {
    templateId: 'ACT-KPI-fin-debtor-days',
    kpiKey: 'fin_debtor_days',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Reduce debtor days from {actual} to {target}',
    description:
      'Debtor days currently average {actual} against a benchmark of {target} — a gap of {gap}. Weak collections governance ties up working capital and increases bad-debt risk the longer receivables go uncollected.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the accounting system aged debtors report and segment outstanding balances by age band and customer type.', primaryRole: 'Finance Director' },
      { text: 'Introduce a weekly collections cadence with automatic follow-up at 30, 60 and 90 days overdue.', primaryRole: 'Finance Director' },
      { text: 'Set a credit hold policy for customer accounts exceeding {target} days outstanding, enforced at point of sale.', primaryRole: 'Finance Director' },
    ],
  },

  fin_aftersales_gp_share_pct: {
    templateId: 'ACT-KPI-fin-aftersales-gp-share-pct',
    kpiKey: 'fin_aftersales_gp_share_pct',
    signalCode: 'KPI_NOT_REVIEWED',
    title: 'Grow aftersales share of total gross profit from {actual} to {target}',
    description:
      'Aftersales (service and parts) currently contributes {actual} of total gross profit against a benchmark of {target} — a gap of {gap}. An under-reviewed aftersales contribution leaves the dealership overexposed to volatile new/used vehicle margins.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 90,
    implementationSteps: [
      { text: 'Pull the DMS/accounting P&L and calculate aftersales gross profit as a share of total dealership gross for the last 6 months.', primaryRole: 'Finance Director' },
      { text: 'Introduce a monthly cross-department gross-mix review to track aftersales contribution against {target}.', primaryRole: 'Service Manager' },
      { text: 'Set growth initiatives (workshop loading, parts attachment) with joint accountability between Service and Parts Managers.', primaryRole: 'General Manager' },
    ],
  },

  fin_selling_expense_pct: {
    templateId: 'ACT-KPI-fin-selling-expense-pct',
    kpiKey: 'fin_selling_expense_pct',
    signalCode: 'GOVERNANCE_WEAK',
    title: 'Bring selling expense ratio down from {actual} to {target}',
    description:
      'Selling expense currently runs at {actual} of revenue against a benchmark of {target} — a gap of {gap}. Without cost governance on marketing and sales overhead, spend creeps upward without a matching lift in volume or gross.',
    defaultOwnerRole: 'Finance Director',
    defaultTimeframeDays: 60,
    implementationSteps: [
      { text: 'Pull the accounting system expense ledger and break down selling expense by category (marketing, commissions, overhead) for the last quarter.', primaryRole: 'Finance Director' },
      { text: 'Set a marketing spend-to-lead-conversion review to cut channels with the weakest return before cutting headcount.', primaryRole: 'Marketing Manager' },
      { text: 'Review selling expense as a percentage of revenue monthly against {target} in the finance review meeting.', primaryRole: 'Finance Director' },
    ],
  },
};
