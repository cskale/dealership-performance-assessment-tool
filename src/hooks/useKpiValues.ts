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
  /** created_at of the assessment the row belongs to */
  assessmentCreatedAt: string;
}

/**
 * Fetches the most recent non-skipped value for a given KPI across all of a
 * dealership's assessments, ordered by the parent assessment's created_at.
 * Shared by useLatestKpiValue and the Playground prefill hook.
 */
export async function fetchLatestKpiValue(
  dealershipId: string,
  kpiKey: string
): Promise<LatestKpiValue | null> {
  const { data, error } = await supabase
    .from('assessment_kpi_values')
    .select('*, assessments!inner(created_at)')
    .eq('dealership_id', dealershipId)
    .eq('kpi_key', kpiKey)
    .eq('skipped', false)
    .order('created_at', { referencedTable: 'assessments', ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { assessments, ...row } = data as AssessmentKpiValue & {
    assessments: { created_at: string };
  };
  return { row: row as AssessmentKpiValue, assessmentCreatedAt: assessments.created_at };
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
