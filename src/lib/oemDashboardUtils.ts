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
