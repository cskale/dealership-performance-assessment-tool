import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveRole } from '@/hooks/useActiveRole';

export interface LatestAssessment {
  id: string;
  overallScore: number;
  departmentScores: Record<string, number>;
  completedAt: string;
}

export function useLatestAssessment() {
  const { user } = useAuth();
  const { dealerId } = useActiveRole();

  return useQuery({
    queryKey: ['latest-assessment', user?.id, dealerId],
    // Enable when user exists — dealerId may be null for org owners, fallback to user_id
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<LatestAssessment | null> => {
      let query = supabase
        .from('assessments')
        .select('id, overall_score, scores, completed_at')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);

      // Org owners have dealerId=null (mapped to uxRole='coach'); fall back to user_id
      if (dealerId) {
        query = query.eq('dealership_id', dealerId);
      } else {
        query = query.eq('user_id', user!.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) return null;

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
