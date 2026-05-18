export type SignalType = 'CRITICAL_GAP' | 'HIGH_PRIORITY' | 'GROWTH_OPPORTUNITY';

export type ResourceType = 'video' | 'article' | 'course' | 'webinar' | 'tool' | 'template' | 'case_study';

export interface GapCard {
  deptKey: string;
  deptName: string;
  score: number;
  signalType: SignalType;
  topicFilters: string[];
}

export const DEPT_DISPLAY_NAMES: Record<string, string> = {
  'new-vehicle-sales': 'New Vehicle Sales',
  'used-vehicle-sales': 'Used Vehicle Sales',
  'service-performance': 'Service',
  'parts-inventory': 'Parts',
  'financial-operations': 'Financial Operations',
};

const SIGNAL_ORDER: Record<SignalType, number> = {
  CRITICAL_GAP: 0,
  HIGH_PRIORITY: 1,
  GROWTH_OPPORTUNITY: 2,
};

function classifyScore(score: number): SignalType | null {
  if (score < 50) return 'CRITICAL_GAP';
  if (score < 65) return 'HIGH_PRIORITY';
  if (score < 75) return 'GROWTH_OPPORTUNITY';
  return null;
}

export function mapSignalsToResources(
  scores: Record<string, number> | null | undefined
): GapCard[] {
  if (!scores || typeof scores !== 'object') return [];

  const cards: GapCard[] = [];

  for (const [deptKey, score] of Object.entries(scores)) {
    if (typeof score !== 'number' || isNaN(score)) continue;
    const deptName = DEPT_DISPLAY_NAMES[deptKey];
    if (!deptName) continue;

    const signalType = classifyScore(score);
    if (!signalType) continue;

    cards.push({
      deptKey,
      deptName,
      score,
      signalType,
      topicFilters: [deptKey],
    });
  }

  return cards.sort(
    (a, b) => SIGNAL_ORDER[a.signalType] - SIGNAL_ORDER[b.signalType]
  );
}
