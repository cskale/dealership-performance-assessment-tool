/**
 * Ceiling Analysis Engine
 *
 * Fires only for departments scoring >=65 on questions answered at score 4,
 * identifying what separates current best-practice from top-quartile performance.
 */

export interface CeilingInsight {
  questionId: string;
  currentScore: number;
  bestInClassDescription: string;
  nextLevelAction: string;
}

// ---------------------------------------------------------------------------
// Best-in-class descriptions — what score 5 looks like vs score 4
// ---------------------------------------------------------------------------

const BEST_IN_CLASS: Record<string, string> = {
  'nvs-2':
    'Top-quartile dealers achieve >98% CSI scores through proactive relationship management, digital follow-up automation, and systematic complaint resolution within 24 hours — moving from reactive satisfaction management to predictive experience design.',
  'nvs-4':
    'Leading dealers generate above €2,000 front-end gross per unit through structured desking processes, manager-enforced minimum margin floors, and value-building delivery protocols that eliminate customer focus on price alone.',
  'nvs-6':
    'Best-in-class digital operations achieve <5-minute lead response times through automated routing, AI-assisted initial response, and full CRM-driven funnel analytics — converting digital infrastructure from a cost centre to a revenue multiplier.',
  'nvs-9':
    'Top-performing F&I departments achieve >85% penetration through menu-based selling, needs discovery conversations, and structured objection handling — making F&I a core customer value proposition rather than an afterthought.',
  'nvs-10':
    'Leading CRM adopters use their system as the operational backbone — 100% of interactions logged, automated follow-up sequences active, and pipeline reporting driving weekly sales meetings with predictable forecast accuracy.',
  'svc-1':
    'Top-quartile service departments sustain >90% labour utilisation through real-time workflow management, load balancing across technicians, and proactive appointment optimisation that eliminates idle time between jobs.',
  'svc-2':
    'Leading service operations realise >95% of posted rate through transparent multi-point inspection processes, advisor training on value presentation, and consistent customer communication that reduces rate concessions.',
  'svc-3':
    'Best-in-class service availability is achieved through active appointment book management, same-day service capacity reserved for walk-ins, and online self-scheduling that distributes demand across the week.',
  'svc-4':
    'Top-quartile first-time fix rates exceed 92% through structured diagnostic protocols, mandatory technical sign-off before vehicle handback, and technician quality scorecards that create personal accountability for rework.',
  'fin-1':
    'Leading dealers sustain net profit above 4% through diversified revenue streams, active fixed-to-variable cost management, and monthly financial review disciplines that enable rapid response to margin pressure.',
  'fin-5':
    'Best-in-class F&I penetration is achieved through structured menu presentation, finance manager certification programmes, and product bundling strategies that increase perceived value while driving consistent back-end gross.',
};

// ---------------------------------------------------------------------------
// Next-level actions — specific to moving from score 4 to score 5
// ---------------------------------------------------------------------------

const NEXT_LEVEL_ACTIONS: Record<string, string> = {
  'nvs-2':
    'Implement a post-delivery follow-up automation sequence (Day 3, Day 14, Day 30) with personalised messages from the selling consultant. Add a proactive NPS survey at 7 days and create a structured recovery protocol for any score below 8.',
  'nvs-4':
    'Install a structured desking process requiring manager sign-off for any deal below the minimum gross floor. Train consultants on value-based selling and delivery presentation protocols that reduce customer price focus.',
  'nvs-6':
    'Configure CRM-based lead routing with automated initial response within 5 minutes. Add conversion tracking from first contact to showroom visit, and implement weekly digital funnel review in sales meetings.',
  'nvs-9':
    'Transition to a menu-based F&I presentation process for all deals. Add a needs discovery step before product presentation and implement a structured objection-handling guide reviewed in weekly F&I manager meetings.',
  'nvs-10':
    'Enforce 100% CRM logging through manager audit and consequence framework. Activate automated follow-up sequences for all unsold leads at 3, 7, and 14 days, and introduce weekly pipeline review driven by CRM data.',
  'svc-1':
    'Implement real-time technician loading visibility on the service manager\'s dashboard. Introduce a load-balancing protocol for morning job allocation and a fill-in job queue for technicians completing work ahead of schedule.',
  'svc-2':
    'Roll out a multi-point inspection presentation standard that requires advisors to walk through all findings with customers before starting work. Add advisor rate-realisation to the weekly KPI dashboard with individual targets.',
  'svc-3':
    'Activate online self-scheduling with real-time availability visibility. Reserve 15–20% of each day\'s capacity for same-day and walk-in appointments and monitor appointment lead time weekly against a <2-day target.',
  'svc-4':
    'Introduce a technician quality scorecard with first-time fix rate tracked individually. Implement a mandatory pre-delivery quality check and a structured customer complaint root-cause process for any comeback.',
  'fin-1':
    'Introduce a monthly financial review process with department-level P&L accountability. Add a 90-day rolling forecast and implement a management action trigger whenever net margin drops below 3% for two consecutive months.',
  'fin-5':
    'Implement a structured F&I certification programme for all finance managers. Introduce menu selling across all finance transactions and track product penetration by manager weekly in the performance review.',
};

// ---------------------------------------------------------------------------
// Generator function
// ---------------------------------------------------------------------------

const CEILING_QUESTION_IDS = new Set(Object.keys(BEST_IN_CLASS));

export function generateCeilingInsights(
  answers: Record<string, number>,
  sectionScores: Record<string, number>
): CeilingInsight[] {
  const insights: CeilingInsight[] = [];

  // Build a map from question prefix to section key
  const prefixToSection: Record<string, string> = {
    nvs: 'nvs',
    uvs: 'uvs',
    svc: 'svc',
    fin: 'fin',
    pts: 'pts',
  };

  for (const [questionId, score] of Object.entries(answers)) {
    if (score !== 4) continue;
    if (!CEILING_QUESTION_IDS.has(questionId)) continue;

    const prefix = questionId.split('-')[0];
    const sectionKey = prefixToSection[prefix];
    if (!sectionKey) continue;

    const sectionScore = sectionScores[sectionKey];
    if (sectionScore == null || sectionScore < 55) continue;

    insights.push({
      questionId,
      currentScore: score,
      bestInClassDescription: BEST_IN_CLASS[questionId],
      nextLevelAction: NEXT_LEVEL_ACTIONS[questionId],
    });
  }

  return insights;
}
