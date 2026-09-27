// Plain-language guide for each live Playground calculator: why it exists, when to use it,
// what it tells you, and how to act on the result. Rendered by PlaygroundCalculatorShell.
// ponytail: English only; move to i18n keys when the Playground pages are translated.

export interface PlaygroundGuide {
  /** The business question this calculator answers, in one sentence. */
  question: string;
  /** Situations where a dealer or coach should open it. */
  useWhen: string[];
  /** What each headline output means. */
  youGet: string[];
  /** How to read the result and what to do next. */
  howToAct: string[];
  /** Where to find the input numbers. */
  dataSources: string;
}

export const PLAYGROUND_GUIDES: Record<string, PlaygroundGuide> = {
  'reverse-sales-funnel': {
    question: 'How many leads, appointments and showroom visits do I need to hit my sales target?',
    useWhen: [
      'Setting a monthly or quarterly unit target and checking if it is realistic',
      'Planning the marketing budget: required leads × cost per lead = budget',
      'A sales target is being missed and you need to see which funnel stage is short',
    ],
    youGet: [
      'Required leads, appointments and showroom visits for the target',
      'Lead efficiency: the share of leads that become sales',
      'Projected gross profit at the target volume',
    ],
    howToAct: [
      'Compare required leads with the leads you actually receive. The gap is your marketing ask.',
      'Improving one conversion rate by a few points often beats buying more leads. Try raising the weakest rate to see the effect.',
    ],
    dataSources: 'CRM funnel report (leads, appointments, shows, sales) for the last 3 months.',
  },
  'sales-velocity': {
    question: 'How fast does a lead turn into a sale, and which stage slows us down?',
    useWhen: [
      'Deals feel slow or month-end is always a rush',
      'Deciding where to focus sales-process coaching',
    ],
    youGet: [
      'Total sales cycle in days, split by stage',
      'Projected sales and gross profit per month and per day',
      'The bottleneck stage (the longest one)',
    ],
    howToAct: [
      'Attack the longest stage first: faster appointment setting, tighter follow-up after the test drive.',
      'Every day removed from the cycle brings gross profit forward and frees salesperson time.',
    ],
    dataSources: 'CRM stage timestamps; average days between lead, appointment, show and sale.',
  },
  'lead-quality': {
    question: 'Which lead sources actually make us money?',
    useWhen: [
      'Reviewing lead providers or portal contracts',
      'Some sources bring volume but few sales',
    ],
    youGet: [
      'Close rate, gross profit per lead and time to close for each source',
      'A quality score that ranks the sources',
    ],
    howToAct: [
      'Shift budget from low gross-profit-per-lead sources to high ones.',
      'Low close rate with high volume usually means a follow-up problem, not a source problem. Check response time first.',
    ],
    dataSources: 'CRM leads by source, with units closed and gross profit per deal.',
  },
  'marketing-roi': {
    question: 'Which marketing channels pay back, and what is the most I can pay per lead?',
    useWhen: [
      'Setting or cutting the marketing budget',
      'Comparing channels (portals, social, search, events)',
    ],
    youGet: [
      'Cost per lead, cost per sale and return on ad spend (ROAS) per channel',
      'Break-even cost per lead: above this, a channel loses money',
    ],
    howToAct: [
      'Stop or renegotiate channels whose cost per lead is above break-even.',
      'Move spend towards the channels with the highest ROAS until their lead quality drops.',
    ],
    dataSources: 'Monthly spend per channel (marketing invoices) and leads per channel (CRM).',
  },
  'cac-payback': {
    question: 'How many months does it take to earn back what it costs to win one customer?',
    useWhen: [
      'Justifying marketing or sales headcount',
      'Deciding how much to invest in service retention',
    ],
    youGet: [
      'Customer acquisition cost (marketing + sales staff cost per unit sold)',
      'Payback in months once front-end and recurring gross profit are counted',
    ],
    howToAct: [
      'Payback within one service cycle (~12 months) is healthy. Longer means acquisition is too expensive or retention is weak.',
      'Lower acquisition cost through better conversion, or raise recurring gross profit through service plans.',
    ],
    dataSources: 'Marketing spend, sales payroll, units sold (DMS), average service gross profit per customer.',
  },
  'tech-utilization': {
    question: 'How much of our paid technician time do we actually bill, and what is idle time costing us?',
    useWhen: [
      'The workshop feels busy but labour sales are flat',
      'Deciding whether to hire another technician',
    ],
    youGet: [
      'Utilization %: billed hours ÷ available hours',
      'Idle hours and the labour revenue they represent',
    ],
    howToAct: [
      'Below ~85% utilization, fill the workshop before hiring: better booking, courtesy checks, express service.',
      'Above ~95% sustained, capacity is the limit. Hiring or extending hours pays.',
    ],
    dataSources: 'DMS workshop report: clocked vs billed hours; technician rosters.',
  },
  'vehicle-stock-turn': {
    question: 'How fast does our stock sell, and what does it cost to hold?',
    useWhen: [
      'Setting stock levels or ordering from the OEM',
      'Floorplan interest or aged stock is rising',
    ],
    youGet: [
      'Annual stock turn and average days in stock',
      'Monthly holding cost and holding cost per unit',
    ],
    howToAct: [
      'Every extra day in stock eats gross profit. Compare holding cost per unit with your average gross profit per unit.',
      'Use the result to set an aged-stock rule (e.g. act at 60 days) and to right-size orders.',
    ],
    dataSources: 'DMS stock list (units, cost), monthly sales, floorplan interest rate.',
  },
  'absorption-rate': {
    question: 'Can service and parts alone pay for the dealership\'s fixed costs?',
    useWhen: [
      'Planning for a weak sales year',
      'Setting aftersales growth targets',
    ],
    youGet: [
      'Absorption rate: (service GP + parts GP) ÷ fixed overhead',
      'Monthly surplus or gap, and each department\'s share',
      'A what-if when you change service, parts or overhead by a %',
    ],
    howToAct: [
      '100%+ means the business survives with zero vehicle sales. Most strong dealers aim for 80–100%.',
      'Use the what-if sliders to see how much aftersales growth or cost cutting closes the gap.',
    ],
    dataSources: 'Monthly P&L: service and parts gross profit, total fixed overhead.',
  },
  'appointment-density': {
    question: 'Are workshop appointments spread well enough to maximise throughput without long waits?',
    useWhen: [
      'Mornings are overloaded and afternoons are quiet',
      'Customers complain about waiting or cars are not ready on time',
    ],
    youGet: [
      'How evenly appointments fill the available bays and hours',
      'The throughput you could reach with a smoother schedule',
    ],
    howToAct: [
      'Move bookable slots from peak to off-peak times (staggered drop-offs, afternoon offers).',
      'Re-check after a month: a smoother schedule should raise utilization in the Technician Utilization calculator too.',
    ],
    dataSources: 'Workshop booking system: appointments per hour/day and bay count.',
  },
  'fi-penetration': {
    question: 'How much gross profit are we leaving on the table in finance, insurance and warranty?',
    useWhen: [
      'Back-end gross per unit is below target',
      'Setting F&I targets or planning training',
    ],
    youGet: [
      'Attach rate and gross profit per product',
      'Total F&I gross profit and the uplift if attach rates rise',
    ],
    howToAct: [
      'Focus on the product with the biggest gap between your attach rate and the benchmark.',
      'Introduce F&I early in the sales conversation; late introduction is the most common cause of low penetration.',
    ],
    dataSources: 'F&I / DMS deal report: products sold per deal and income per product.',
  },
};
