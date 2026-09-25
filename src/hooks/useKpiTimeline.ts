import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TRACKED_KPIS } from '@/data/trackedKpis';
import { mergeTimeline, type CheckinRow, type SnapshotRow, type TimelinePoint } from '@/lib/kpiTimeline';

const KEYS = TRACKED_KPIS.map((k) => k.kpiKey);

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
      const snapshots: SnapshotRow[] = (snaps.data ?? []).map((r: any) => ({
        kpi_key: r.kpi_key, value: r.value, skipped: r.skipped,
        assessment_created_at: r.assessments.created_at,
      }));
      return Object.fromEntries(
        KEYS.map((k) => [k, mergeTimeline(k, (checkins.data ?? []) as CheckinRow[], snapshots)]),
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
