import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDealershipAssessments(dealershipId: string | null | undefined) {
  return useQuery({
    queryKey: ['dealership-assessments', dealershipId],
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from('assessments')
        .select('id, completed_at, created_at, overall_score')
        .eq('dealership_id', dealershipId!).eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
