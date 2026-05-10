export interface StatsBar {
  total: number;
  avgScore: number;
  overdueCount: number;
  attentionNeeded: number;
}

export interface TrendResult {
  delta: number | null;
  direction: 'up' | 'down' | 'flat' | 'none';
}

export function computeStatsBar(
  dealers: Array<{ latestScore: number | null; overdueCount: number }>
): StatsBar {
  const scored = dealers.filter(d => d.latestScore != null);
  const avg = scored.length
    ? Math.round(scored.reduce((sum, d) => sum + d.latestScore!, 0) / scored.length)
    : 0;
  return {
    total: dealers.length,
    avgScore: avg,
    overdueCount: dealers.reduce((sum, d) => sum + d.overdueCount, 0),
    attentionNeeded: dealers.filter(d => d.latestScore != null && d.latestScore < 46).length,
  };
}

export function computeTrend(latest: number | null, previous: number | null): TrendResult {
  if (latest == null || previous == null) return { delta: null, direction: 'none' };
  const delta = Math.round(latest - previous);
  if (delta > 0) return { delta, direction: 'up' };
  if (delta < 0) return { delta, direction: 'down' };
  return { delta: 0, direction: 'flat' };
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function isOverdue(targetDate: string | null): boolean {
  if (!targetDate) return false;
  return new Date(targetDate) < new Date();
}

export function isDueSoon(targetDate: string | null, withinDays = 3): boolean {
  if (!targetDate) return false;
  const target = new Date(targetDate);
  const now = new Date();
  const soon = new Date(now.getTime() + withinDays * 86400000);
  return target >= now && target <= soon;
}

export function getScoreBand(score: number): { label: string; className: string } {
  if (score >= 85) return { label: 'Advanced',     className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
  if (score >= 70) return { label: 'Performing',   className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
  if (score >= 46) return { label: 'Developing',   className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' };
  return             { label: 'Foundational', className: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' };
}
