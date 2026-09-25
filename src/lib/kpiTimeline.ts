export type TimelineSource = 'assessment' | 'checkin-dealer' | 'checkin-coach';
export interface TimelinePoint { month: string; value: number; source: TimelineSource; enteredAt: string }
export interface CheckinRow { kpi_key: string; period_month: string; value: number; entered_by_role: 'dealer' | 'coach'; updated_at: string }
export interface SnapshotRow { kpi_key: string; value: number | null; skipped: boolean; assessment_created_at: string }

export const toMonth = (iso: string) => `${iso.slice(0, 7)}-01`;

export function mergeTimeline(kpiKey: string, checkins: CheckinRow[], snapshots: SnapshotRow[]): TimelinePoint[] {
  const byMonth = new Map<string, TimelinePoint>();
  for (const s of snapshots) {
    if (s.kpi_key !== kpiKey || s.skipped || s.value === null) continue;
    const month = toMonth(s.assessment_created_at);
    const prev = byMonth.get(month);
    if (!prev || prev.enteredAt < s.assessment_created_at)
      byMonth.set(month, { month, value: s.value, source: 'assessment', enteredAt: s.assessment_created_at });
  }
  for (const c of checkins) {
    if (c.kpi_key !== kpiKey) continue;
    byMonth.set(c.period_month, { month: c.period_month, value: Number(c.value), source: `checkin-${c.entered_by_role}`, enteredAt: c.updated_at });
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}
