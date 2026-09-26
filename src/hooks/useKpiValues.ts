import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AssessmentKpiValue {
  id: string;
  assessment_id: string;
  dealership_id: string;
  question_id: string;
  kpi_key: string;
  value: number | null;
  unit: string;
  currency_code: string | null;
  reference_period: string;
  skipped: boolean;
  created_at: string;
  updated_at: string;
}

/** Strips the joined `assessments` field off a snapshot row, keeping just the KPI value columns. */
function omitAssessments(
  row: AssessmentKpiValue & { assessments: { created_at: string } },
): AssessmentKpiValue {
  const { assessments: _assessments, ...rest } = row;
  return rest;
}

/**
 * All KPI value rows recorded for a single assessment.
 */
export function useKpiValues(assessmentId: string | null | undefined) {
  return useQuery({
    queryKey: ['kpi-values', assessmentId],
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AssessmentKpiValue[]> => {
      const { data, error } = await supabase
        .from('assessment_kpi_values')
        .select('*')
        .eq('assessment_id', assessmentId!);

      if (error) throw error;
      return (data ?? []) as AssessmentKpiValue[];
    },
  });
}

export interface LatestKpiValue {
  row: AssessmentKpiValue;
  /** Date the value applies to: assessment created_at, or check-in period_month */
  assessmentCreatedAt: string;
  source: 'assessment' | 'checkin';
}

/**
 * Fetches the most recent non-skipped value for a given KPI across all of a
 * dealership's assessments, ordered by the parent assessment's created_at —
 * but prefers a newer monthly check-in (kpi_checkins) when one exists for a
 * month at or after the latest assessment's month.
 * Shared by useLatestKpiValue and the Playground prefill hook.
 */
export async function fetchLatestKpiValue(
  dealershipId: string,
  kpiKey: string
): Promise<LatestKpiValue | null> {
  const [snap, checkin] = await Promise.all([
    supabase
      .from('assessment_kpi_values')
      .select('*, assessments!inner(created_at)')
      .eq('dealership_id', dealershipId)
      .eq('kpi_key', kpiKey)
      .eq('skipped', false)
      .order('created_at', { referencedTable: 'assessments', ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('kpi_checkins')
      .select('value, period_month')
      .eq('dealership_id', dealershipId)
      .eq('kpi_key', kpiKey)
      .order('period_month', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (snap.error) throw snap.error;
  if (checkin.error) throw checkin.error;

  const s = snap.data as (AssessmentKpiValue & { assessments: { created_at: string } }) | null;
  const c = checkin.data as { value: number; period_month: string } | null;
  const snapMonth = s ? s.assessments.created_at.slice(0, 7) : '';

  if (c && c.period_month.slice(0, 7) >= snapMonth) {
    const base = s
      ? omitAssessments(s)
      : ({ kpi_key: kpiKey, dealership_id: dealershipId } as AssessmentKpiValue);
    return {
      row: { ...base, value: Number(c.value) } as AssessmentKpiValue,
      assessmentCreatedAt: c.period_month,
      source: 'checkin',
    };
  }

  if (!s) return null;
  return { row: omitAssessments(s), assessmentCreatedAt: s.assessments.created_at, source: 'assessment' };
}

/**
 * Most recent non-skipped value for a given KPI across all of a dealership's
 * assessments.
 *
 * This powers Playground seeding (pre-filling simulator inputs with real
 * historical figures) and future delta/trend queries across assessment cycles.
 */
export function useLatestKpiValue(dealershipId: string | null | undefined, kpiKey: string) {
  return useQuery({
    queryKey: ['latest-kpi-value', dealershipId, kpiKey],
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AssessmentKpiValue | null> => {
      const result = await fetchLatestKpiValue(dealershipId!, kpiKey);
      return result?.row ?? null;
    },
  });
}
