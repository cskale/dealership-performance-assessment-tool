import { useQuery } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CoachVisitWorkspace } from '@/components/coach/CoachVisitWorkspace';
import { SharedLoadingState } from '@/components/shared/SharedLoadingState';

interface DealerWorkspaceData {
  dealer: { id: string; name: string; location: string | null } | null;
  latestAssessment: { id: string; overall_score: number | null } | null;
}

async function fetchDealerWorkspace(dealershipId: string): Promise<DealerWorkspaceData> {
  const [dealerResult, assessmentResult] = await Promise.all([
    supabase.from('dealerships').select('id, name, location').eq('id', dealershipId).maybeSingle(),
    supabase.from('assessments').select('id, overall_score').eq('dealership_id', dealershipId).eq('status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (dealerResult.error) throw dealerResult.error;
  if (assessmentResult.error) throw assessmentResult.error;
  return { dealer: dealerResult.data, latestAssessment: assessmentResult.data };
}

export default function CoachDealerPage() {
  const { dealershipId } = useParams<{ dealershipId: string }>();
  const navigate = useNavigate();
  const workspaceQuery = useQuery({
    queryKey: ['coach-dealer-workspace', dealershipId],
    queryFn: () => fetchDealerWorkspace(dealershipId!),
    enabled: !!dealershipId,
  });

  if (!dealershipId) return <Navigate to="/app/coach-dashboard" replace />;
  if (workspaceQuery.isLoading) return <SharedLoadingState />;
  if (!workspaceQuery.data?.dealer) return <Navigate to="/app/coach-dashboard" replace />;

  return (
    <CoachVisitWorkspace
      dealershipId={dealershipId}
      dealerName={workspaceQuery.data.dealer.name}
      location={workspaceQuery.data.dealer.location ?? undefined}
      latestScore={workspaceQuery.data.latestAssessment?.overall_score}
      latestAssessmentId={workspaceQuery.data.latestAssessment?.id}
      onBack={() => navigate('/app/coach-dashboard')}
      onVisitSaved={() => workspaceQuery.refetch()}
    />
  );
}