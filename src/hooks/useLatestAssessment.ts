import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveRole } from '@/hooks/useActiveRole';

export interface LatestAssessment {
  id: string;
  overallScore: number;
  departmentScores: Record<string, number>;
  completedAt: string;
}

export function useLatestAssessment() {
  const { dealerId } = useActiveRole();

  return useQuery({
    queryKey: ['latest-assessment', dealerId],
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<LatestAssessment | null> => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, overall_score, scores, completed_at')
        .eq('dealership_id', dealerId!)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // scores jsonb is stored as { 'new-vehicle-sales': 72, ... }
      const departmentScores =
        data.scores && typeof data.scores === 'object'
          ? (data.scores as Record<string, number>)
          : {};

      return {
        id: data.id,
        overallScore: data.overall_score ?? 0,
        departmentScores,
        completedAt: data.completed_at!,
      };
    },
  });
}
