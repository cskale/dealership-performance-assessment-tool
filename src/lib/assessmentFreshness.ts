export type FreshnessStatus = 'current' | 'ageing' | 'stale';

export interface FreshnessResult {
  status: FreshnessStatus;
  daysSince: number;
  label: string;
  message: string;
  showCta: boolean;
}

export function getAssessmentFreshness(completedAt: string | null | undefined): FreshnessResult {
  if (!completedAt) {
    return {
      status: 'stale',
      daysSince: 999,
      label: 'No assessment',
      message: 'Run your first assessment to get a diagnostic.',
      showCta: true,
    };
  }
  const days = Math.floor((Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 60) {
    return {
      status: 'current',
      daysSince: days,
      label: 'Current',
      message: `Assessment completed ${days} days ago.`,
      showCta: false,
    };
  }
  if (days < 90) {
    return {
      status: 'ageing',
      daysSince: days,
      label: 'Ageing',
      message: `Assessment is ${days} days old — consider a refresh assessment soon.`,
      showCta: false,
    };
  }
  return {
    status: 'stale',
    daysSince: days,
    label: 'Stale',
    message: `Assessment is ${days} days old. Key conditions may have shifted — a refresh is recommended.`,
    showCta: true,
  };
}
