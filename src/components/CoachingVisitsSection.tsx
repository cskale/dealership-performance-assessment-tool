import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { VisitHistoryItem } from '@/hooks/useCoachVisitLoop';
import { VisitDetail } from '@/components/coach/VisitDetail';
import { VisitTimeline, type TimelineVisit } from '@/components/coach/VisitTimeline';

interface CoachingVisitsSectionProps {
  dealershipId: string;
  visits: VisitHistoryItem[];
  loading: boolean;
  upcomingVisit?: {
    id: string;
    coach_user_id: string;
    visit_date: string;
    status: 'proposed' | 'confirmed' | 'counter_proposed' | 'cancelled';
    dealer_proposed_date: string | null;
  } | null;
}

export function CoachingVisitsSection({ dealershipId, visits, loading, upcomingVisit }: CoachingVisitsSectionProps) {
  const { t } = useLanguage();
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(visits[0]?.id ?? null);
  const timelineVisits = useMemo<TimelineVisit[]>(() => [
    ...(upcomingVisit ? [{
      id: upcomingVisit.id,
      coach_user_id: upcomingVisit.coach_user_id,
      dealership_id: dealershipId,
      visit_date: upcomingVisit.dealer_proposed_date ?? upcomingVisit.visit_date,
      status: upcomingVisit.status,
      visit_notes: null,
      visit_type: null,
      modules_reviewed: [],
      summary: null,
      next_visit_date: null,
      agreed_action_ids: [],
      created_at: null,
      updated_at: null,
      dealer_proposed_date: upcomingVisit.dealer_proposed_date,
      declined_by: null,
    } satisfies TimelineVisit] : []),
    ...visits.map(visit => ({
    id: visit.id,
    coach_user_id: '',
    dealership_id: dealershipId,
    visit_date: visit.visit_date,
    status: 'completed' as const,
    visit_notes: null,
    visit_type: visit.visit_type as TimelineVisit['visit_type'],
    modules_reviewed: visit.modules_reviewed,
    summary: visit.summary,
    next_visit_date: visit.next_visit_date,
    agreed_action_ids: visit.agreed_actions.map(action => action.id),
    created_at: null,
    updated_at: null,
    dealer_proposed_date: null,
    declined_by: null,
    } satisfies TimelineVisit)),
  ], [dealershipId, upcomingVisit, visits]);

  useEffect(() => {
    if (!selectedVisitId && timelineVisits.length > 0) setSelectedVisitId(timelineVisits[0].id);
  }, [selectedVisitId, timelineVisits]);

  return (
    <section id="coaching-visits" className="scroll-mt-6 space-y-4 rounded-lg border border-border bg-card p-5 shadow-card">
      <h2 className="text-base font-semibold text-foreground">{t('dealerVisits.title')}</h2>
      {!loading && timelineVisits.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('dealerVisits.empty')}</p>
      ) : (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <VisitTimeline
            visits={timelineVisits}
            selectedVisitId={selectedVisitId}
            loading={loading}
            onSelectBrief={() => setSelectedVisitId(timelineVisits[0]?.id ?? null)}
            onSelectVisit={visit => setSelectedVisitId(visit.id)}
            onSchedule={() => undefined}
            readOnly
          />
          {selectedVisitId && (
            <div className="min-w-0 flex-1">
              <VisitDetail visitId={selectedVisitId} dealershipId={dealershipId} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}