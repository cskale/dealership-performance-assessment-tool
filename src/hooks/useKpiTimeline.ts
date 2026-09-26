import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TRACKED_KPIS } from '@/data/trackedKpis';
import { mergeTimeline, type CheckinRow, type SnapshotRow, type TimelinePoint } from '@/lib/kpiTimeline';

const KEYS = TRACKED_KPIS.map((k) => k.kpiKey);

interface SnapshotQueryRow {
  kpi_key: string;
  value: number | string | null;
  skipped: boolean;
  assessments: { created_at: string };
}

interface CheckinQueryRow {
  kpi_key: string;
  period_month: string;
  value: number;
  entered_by_role: string;
  updated_at: string;
}

export function useKpiTimelines(dealershipId: string | null | undefined) {
  return useQuery({
    queryKey: ['kpi-timelines', dealershipId],
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, TimelinePoint[]>> => {
      const [checkins, snaps] = await Promise.all([
        supabase.from('kpi_checkins')
          .select('kpi_key, period_month, value, entered_by_role, updated_at')
          .eq('dealership_id', dealershipId!).in('kpi_key', KEYS),
        supabase.from('assessment_kpi_values')
          .select('kpi_key, value, skipped, assessments!inner(created_at)')
          .eq('dealership_id', dealershipId!).in('kpi_key', KEYS),
      ]);
      if (checkins.error) throw checkins.error;
      if (snaps.error) throw snaps.error;
      const snapshots: SnapshotRow[] = (snaps.data ?? []).map((r: SnapshotQueryRow) => ({
        kpi_key: r.kpi_key,
        value: r.value === null ? null : Number(r.value),
        skipped: r.skipped,
        assessment_created_at: r.assessments.created_at,
      }));
      const checkinRows: CheckinRow[] = (checkins.data ?? []).map((r: CheckinQueryRow) => ({
        kpi_key: r.kpi_key,
        period_month: r.period_month,
        value: r.value,
        entered_by_role: r.entered_by_role === 'coach' ? 'coach' : 'dealer',
        updated_at: r.updated_at,
      }));
      return Object.fromEntries(
        KEYS.map((k) => [k, mergeTimeline(k, checkinRows, snapshots)]),
      );
    },
  });
}

export function useSaveKpiCheckin(dealershipId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ kpiKey, month, value }: { kpiKey: string; month: string; value: number }) => {
      if (!dealershipId) throw new Error('No dealership selected');
      const { error } = await supabase.from('kpi_checkins').upsert(
        { dealership_id: dealershipId, kpi_key: kpiKey, period_month: month, value },
        { onConflict: 'dealership_id,kpi_key,period_month' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kpi-timelines', dealershipId] });
      qc.invalidateQueries({ queryKey: ['latest-kpi-value', dealershipId] });
    },
  });
}
