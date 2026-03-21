/**
 * Executive Narrative Template System
 *
 * Produces consulting-grade 3-sentence minimum paragraphs for the results page,
 * keyed by maturity level and primary signal code.
 */

export type MaturityLevel = 'foundational' | 'developing' | 'capable' | 'leading';

export type PrimarySignalCode =
  | 'PROCESS_NOT_STANDARDISED'
  | 'PROCESS_NOT_EXECUTED'
  | 'ROLE_OWNERSHIP_MISSING'
  | 'KPI_NOT_DEFINED'
  | 'KPI_NOT_REVIEWED'
  | 'CAPACITY_MISALIGNED'
  | 'TOOL_UNDERUTILISED'
  | 'GOVERNANCE_WEAK';

export interface NarrativeBlock {
  situation: string;
  diagnosis: string;
  priority: string;
}

export interface NarrativeInput {
  maturityLevel: MaturityLevel;
  primarySignal: PrimarySignalCode;
  dealerName?: string;
  department?: string;
  score?: number;
  benchmark?: number;
  isSystemic?: boolean;
}

// ---------------------------------------------------------------------------
// SITUATION TEMPLATES — keyed by maturity level
// ---------------------------------------------------------------------------

export const SITUATION_TEMPLATES: Record<MaturityLevel, string> = {
  foundational:
    'The assessment results reveal that {dealerName} is currently operating at a foundational level across key performance dimensions, with significant gaps between current practice and industry benchmarks. Core processes are either undefined or inconsistently applied, and the dealership lacks the structured infrastructure needed to sustain performance improvements over time. This stage represents a significant opportunity: dealers who successfully transition from foundational to developing typically achieve 15–25% improvements in operational efficiency within 12 months.',

  developing:
    '{dealerName} is operating at a developing level, with some structured processes in place but inconsistent execution across departments and team members. The dealership has established the basic building blocks of performance management, yet has not yet embedded the discipline and accountability frameworks needed to translate intent into consistent outcomes. Dealers at this stage who close execution gaps typically move to capable-level performance within 6–9 months with targeted interventions.',

  capable:
    '{dealerName} demonstrates capable-level performance, with structured processes, defined KPIs, and reasonable execution consistency across most departments. The assessment identifies selective improvement opportunities that, if addressed, would allow the dealership to transition from capable to leading-edge performance in targeted areas. Top-quartile dealers at this level focus their improvement energy on the 20% of initiatives that drive 80% of incremental performance gains.',

  leading:
    '{dealerName} is performing at a leading level across the assessed dimensions, with strong process discipline, data-driven decision-making, and consistent above-benchmark results. The assessment has identified ceiling-level opportunities — areas where the dealership can move from best-practice execution to market-differentiating performance. Dealers operating at this level typically focus on innovation, digital capability, and talent development to maintain competitive distance from the market.',
};

// ---------------------------------------------------------------------------
// DIAGNOSIS TEMPLATES — keyed by signal code, with single + systemic variants
// ---------------------------------------------------------------------------

export const DIAGNOSIS_TEMPLATES: Record<
  PrimarySignalCode,
  { single: string; systemic: string }
> = {
  PROCESS_NOT_STANDARDISED: {
    single:
      'The primary diagnostic finding is the absence of documented standard operating procedures in {department}, where execution quality varies significantly between individuals and shifts. Without formalised SOPs, the dealership is dependent on institutional knowledge held by individuals rather than embedded in systems — a structural vulnerability that compounds over time. European benchmark data indicates that dealerships with documented process standards outperform peers by 18–22% on key throughput and margin metrics.',
    systemic:
      'A systemic process standardisation gap has been identified across multiple departments, indicating that the root cause is cultural rather than departmental — the organisation has not yet established a process ownership mindset. This pattern typically reflects the absence of a formal continuous improvement discipline, where process documentation is treated as optional rather than foundational. Addressing this systemically requires a structured programme rather than individual department fixes, and typically takes 90–180 days to embed sustainably.',
  },

  PROCESS_NOT_EXECUTED: {
    single:
      'Documented processes exist in {department} but are not being consistently followed, creating a gap between defined standards and actual day-to-day execution. The root cause is insufficient accountability infrastructure — without systematic compliance monitoring, teams default to convenience rather than consistency. Research across European dealership groups shows that process compliance gaps of this type cost an average of 4–7% of departmental revenue through missed conversions and quality failures.',
    systemic:
      'Process execution failures have been identified across multiple areas of the business, suggesting a systemic accountability gap rather than isolated departmental breakdowns. This pattern is typically driven by a management culture where non-compliance carries no meaningful consequence, and where process champions are either absent or insufficiently empowered. A cross-functional execution improvement programme, anchored by weekly compliance reviews and clear consequence frameworks, is the most effective systemic remedy.',
  },

  ROLE_OWNERSHIP_MISSING: {
    single:
      'The assessment identifies unclear role ownership in {department}, where key functions fall between defined responsibilities, creating execution gaps and delayed responses. Without formal role matrices and accountability assignment, critical customer-facing activities are vulnerable to being dropped during busy periods or staff transitions. Dealers who implement structured role clarity frameworks consistently report 20–30% improvements in task completion rates and significant reductions in management escalations.',
    systemic:
      'Role ownership gaps are present across multiple departments, indicating a structural organisational challenge that requires a business-wide RACI review rather than department-level adjustments. This systemic pattern is common in dealerships that have grown without formalising their organisational structure, leaving accountability assumptions rather than documented responsibilities. A formal role clarity programme, reviewed quarterly and integrated with performance management, is the recommended systemic intervention.',
  },

  KPI_NOT_DEFINED: {
    single:
      'Performance in {department} is not being systematically measured, leaving the management team without the visibility needed to identify underperformance early or validate improvement efforts. Without defined KPIs and targets, teams operate without clear performance expectations and managers cannot distinguish strong from weak execution. Industry data consistently shows that dealerships with structured performance measurement outperform unmeasured peers by 15–20% on core financial metrics.',
    systemic:
      'The absence of defined KPIs is systemic across the business, indicating that the dealership has not yet established a performance management framework as a core operational discipline. This creates an environment where decisions are intuition-led rather than data-driven, and where underperformance can persist undetected for extended periods. Establishing a dealership-wide KPI framework — with department-level targets, individual accountability, and monthly review cadence — is the foundational intervention required.',
  },

  KPI_NOT_REVIEWED: {
    single:
      'Performance data is being collected in {department} but is not reviewed consistently, creating a disconnect between available insight and operational decisions. The absence of a structured review cadence means that emerging issues are not detected until they become entrenched, typically adding 4–6 weeks of avoidable underperformance before corrective action is triggered. Establishing a weekly 30-minute performance review rhythm has been shown to reduce average issue resolution time by 60% in comparable dealership environments.',
    systemic:
      'A systemic pattern of data collection without review has been identified across the business, suggesting that KPI infrastructure exists but has not been integrated into the management operating rhythm. This pattern is common in dealerships where reporting systems were implemented but change management was not completed — data flows but decisions remain intuition-based. A structured management operating system, including weekly department reviews and monthly cross-functional performance sessions, is the recommended systemic remedy.',
  },

  CAPACITY_MISALIGNED: {
    single:
      'Capacity planning in {department} is misaligned with actual demand patterns, creating bottlenecks during peak periods and underutilisation during quieter phases. The root cause is a fixed scheduling model that does not adapt to demand signals, resulting in 10–15% lost productivity and missed revenue opportunities during peaks. Data-driven capacity modelling, anchored to 90-day demand history, typically recovers 8–12% of lost throughput within the first quarter of implementation.',
    systemic:
      'Capacity misalignment is present across multiple departments, suggesting that the dealership has not yet integrated demand forecasting into its operational planning processes. This systemic pattern results in compounding inefficiencies — staffing gaps in one department create downstream bottlenecks in others, amplifying the impact beyond what any single department analysis would reveal. A cross-departmental capacity review, linked to shared demand forecasting and flexible resourcing models, is the recommended systemic approach.',
  },

  TOOL_UNDERUTILISED: {
    single:
      'Available technology tools in {department} are not being fully leveraged, meaning the dealership is paying for capabilities it is not using while competitors who adopt these tools gain meaningful productivity advantages. The root cause is typically insufficient training combined with unclear adoption expectations — staff defaults to familiar manual methods when system usage is not monitored or required. Full technology adoption in comparable dealerships has driven 20–30% productivity improvements and 50–60% reductions in manual process errors.',
    systemic:
      'Technology underutilisation is systemic across the business, indicating that the dealership has made technology investments without completing the adoption journey required to realise the return. This pattern is common when system implementations are treated as IT projects rather than business change programmes, with insufficient attention to training, habit formation, and compliance monitoring. A structured technology adoption programme — with role-specific training, usage KPIs, and management enforcement — is required to convert existing investments into performance gains.',
  },

  GOVERNANCE_WEAK: {
    single:
      'Governance and oversight mechanisms in {department} are insufficient, with ad-hoc decision-making replacing structured approval workflows and review processes. Without defined decision authority levels and regular management oversight, the dealership is exposed to uncontrolled discounting, unchecked financial commitments, and inconsistent customer treatment. Dealers with strong governance frameworks achieve 5–8% higher net margins on average, primarily through reduced margin leakage and more disciplined resource allocation.',
    systemic:
      'Governance weaknesses are present across multiple areas of the business, indicating a structural management culture issue rather than a departmental gap. This systemic pattern is typically rooted in an informal leadership style where speed and flexibility are prioritised over documented accountability, creating risk exposure that scales with business volume. A governance framework review — covering decision authorities, approval workflows, and management review frequency — is the recommended systemic intervention, with staged implementation over 60–90 days.',
  },
};

// ---------------------------------------------------------------------------
// PRIORITY TEMPLATES — keyed by maturity level
// ---------------------------------------------------------------------------

export const PRIORITY_TEMPLATES: Record<MaturityLevel, string> = {
  foundational:
    'Given the foundational maturity profile identified, the immediate priority is to establish the structural foundations before attempting performance optimisation — process documentation, role clarity, and KPI definition must precede execution improvement efforts. The recommended sequencing is: Week 1–2 stabilise the highest-risk gaps; Week 3–6 document core processes and assign ownership; Month 2–3 establish measurement and review cadence. Attempting to skip the foundational layer and go directly to performance improvement initiatives typically results in short-term gains that are not sustained beyond 60–90 days.',

  developing:
    'With a developing maturity profile, the priority is converting documented intent into consistent execution — the frameworks exist but the discipline of daily compliance has not yet been embedded. Focus the next 30 days on the top two execution gaps identified in the assessment, implementing daily compliance monitoring and weekly management review of adherence. Dealers who successfully close the developing-to-capable gap typically do so by installing one strong process champion per department who owns compliance accountability.',

  capable:
    'At capable maturity, the priority is selective performance optimisation in the 2–3 areas where the gap between current performance and top-quartile benchmarks is greatest. Rather than broad-based improvement programmes, capable-level dealers benefit most from targeted interventions with clear ROI — typically 60-day focused projects with measurable outcomes. The assessment has identified the highest-leverage opportunities; sequencing these by impact-to-effort ratio will maximise the return on improvement investment.',

  leading:
    'At leading maturity, the priority shifts from operational improvement to competitive differentiation — the focus is on the capabilities that will separate this dealership from peers over the next 12–24 months. The assessment has identified ceiling-level opportunities in specific areas where best-practice execution can be elevated to market-leading performance through technology, talent, or process innovation. Sustaining leading-level performance requires quarterly reassessment to ensure the dealership continues to raise its own benchmark rather than optimising toward a static target.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export function buildExecutiveNarrative(input: NarrativeInput): NarrativeBlock {
  const { maturityLevel, primarySignal, dealerName = 'Your dealership', department = 'this department', isSystemic = false } = input;

  const vars: Record<string, string> = { dealerName, department };

  const situationTemplate = SITUATION_TEMPLATES[maturityLevel];
  const diagnosisVariant = isSystemic
    ? DIAGNOSIS_TEMPLATES[primarySignal].systemic
    : DIAGNOSIS_TEMPLATES[primarySignal].single;
  const priorityTemplate = PRIORITY_TEMPLATES[maturityLevel];

  return {
    situation: interpolate(situationTemplate, vars),
    diagnosis: interpolate(diagnosisVariant, vars),
    priority: interpolate(priorityTemplate, vars),
  };
}

// ---------------------------------------------------------------------------
// Department display labels
// ---------------------------------------------------------------------------

export const DEPT_LABELS: Record<string, string> = {
  nvs: 'New Vehicle Sales',
  uvs: 'Used Vehicle Sales',
  svc: 'Service',
  fin: 'Financial Operations',
  pts: 'Parts & Inventory',
};
