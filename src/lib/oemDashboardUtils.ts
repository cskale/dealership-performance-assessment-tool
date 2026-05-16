export type DeptKey =
  | 'new-vehicle-sales'
  | 'used-vehicle-sales'
  | 'service-performance'
  | 'parts-inventory'
  | 'financial-operations';

export const DEPT_KEYS: DeptKey[] = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

export const DEPT_LABELS: Record<DeptKey, string> = {
  'new-vehicle-sales': 'NVS',
  'used-vehicle-sales': 'UVS',
  'service-performance': 'SVC',
  'parts-inventory': 'PTS',
  'financial-operations': 'FIN',
};

export const AT_RISK_THRESHOLD = 46;

export function parseDeptScores(scoresJsonb: unknown): Record<DeptKey, number | null> {
  const result: Record<DeptKey, number | null> = {
    'new-vehicle-sales': null,
    'used-vehicle-sales': null,
    'service-performance': null,
    'parts-inventory': null,
    'financial-operations': null,
  };
  if (!scoresJsonb || typeof scoresJsonb !== 'object') return result;
  const scores = scoresJsonb as Record<string, unknown>;
  for (const key of DEPT_KEYS) {
    const val = scores[key];
    result[key] = typeof val === 'number' ? val : null;
  }
  return result;
}

export function getDeptCellClass(score: number | null): string {
  if (score === null) return 'text-muted-foreground';
  if (score >= 85) return 'bg-[#16a34a]/10 text-[#16a34a]';
  if (score >= 70) return 'bg-[#2563eb]/10 text-[#2563eb]';
  if (score >= 46) return 'bg-[#d97706]/10 text-[#d97706]';
  return 'bg-[#dc2626]/10 text-[#dc2626]';
}

export function getDeptBgClass(score: number): string {
  if (score >= 85) return 'bg-[#16a34a]';
  if (score >= 70) return 'bg-[#2563eb]';
  if (score >= 46) return 'bg-[#d97706]';
  return 'bg-[#dc2626]';
}

export function getDeptTextClass(score: number): string {
  if (score >= 85) return 'text-[#16a34a]';
  if (score >= 70) return 'text-[#2563eb]';
  if (score >= 46) return 'text-[#d97706]';
  return 'text-[#dc2626]';
}

export function networkAvgByDept(
  dealers: Array<{ deptScores: Record<DeptKey, number | null> }>
): Record<DeptKey, number | null> {
  const result: Record<DeptKey, number | null> = {
    'new-vehicle-sales': null,
    'used-vehicle-sales': null,
    'service-performance': null,
    'parts-inventory': null,
    'financial-operations': null,
  };
  for (const key of DEPT_KEYS) {
    const vals = dealers.map(d => d.deptScores[key]).filter((v): v is number => v !== null);
    result[key] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }
  return result;
}

export function getWeakestDept(
  deptScores: Record<DeptKey, number | null>
): { key: DeptKey; score: number } | null {
  let weakest: { key: DeptKey; score: number } | null = null;
  for (const key of DEPT_KEYS) {
    const score = deptScores[key];
    if (score === null) continue;
    if (!weakest || score < weakest.score) weakest = { key, score };
  }
  return weakest;
}

// ── Sprint 8 additions ──────────────────────────────────────────────────────

export const STALE_THRESHOLD_DAYS = 90;
export const WEAKNESS_THRESHOLD = 60;

export interface DealerCoverageInput {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestAssessmentId: string | null;
  latestAssessmentDate: string | null;
}

export function computeNetworkMomentum(
  dealers: Array<{ latestScore: number | null; previousScore: number | null }>
): { delta: number; direction: 'up' | 'down' | 'flat'; sampleSize: number; fromAvg: number; toAvg: number } {
  const paired = dealers.filter(d => d.latestScore !== null && d.previousScore !== null);
  if (paired.length < 2) {
    return { delta: 0, direction: 'flat', sampleSize: paired.length, fromAvg: 0, toAvg: 0 };
  }
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const toVals = paired.map(d => d.latestScore!);
  const fromVals = paired.map(d => d.previousScore!);
  const toAvg = Math.round((sum(toVals) / toVals.length) * 10) / 10;
  const fromAvg = Math.round((sum(fromVals) / fromVals.length) * 10) / 10;
  const delta = Math.round((toAvg - fromAvg) * 10) / 10;
  const direction: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return { delta, direction, sampleSize: paired.length, fromAvg, toAvg };
}

export function computeCoverage(dealers: DealerCoverageInput[]): {
  missing: DealerCoverageInput[];
  stale: DealerCoverageInput[];
  healthy: DealerCoverageInput[];
} {
  const now = Date.now();
  const missing: DealerCoverageInput[] = [];
  const stale: DealerCoverageInput[] = [];
  const healthy: DealerCoverageInput[] = [];
  for (const d of dealers) {
    if (!d.latestAssessmentId || !d.latestAssessmentDate) {
      missing.push(d);
    } else {
      const daysSince = (now - new Date(d.latestAssessmentDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > STALE_THRESHOLD_DAYS) {
        stale.push(d);
      } else {
        healthy.push(d);
      }
    }
  }
  return { missing, stale, healthy };
}

export function computeDeptWeaknessCounts(
  dealers: Array<{ deptScores: Record<DeptKey, number | null> }>,
  threshold: number
): Record<DeptKey, number> {
  const result: Record<DeptKey, number> = {
    'new-vehicle-sales': 0,
    'used-vehicle-sales': 0,
    'service-performance': 0,
    'parts-inventory': 0,
    'financial-operations': 0,
  };
  for (const dealer of dealers) {
    for (const key of DEPT_KEYS) {
      const score = dealer.deptScores[key];
      if (score !== null && score < threshold) {
        result[key]++;
      }
    }
  }
  return result;
}

export function extractTopSignals(signalCodes: string[][]): { code: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const codes of signalCodes) {
    for (const code of codes) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
