import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ReviewOutcome, VisitHistoryItem } from '@/hooks/useCoachVisitLoop';

interface CoachingVisitsSectionProps {
  dealershipId: string;
  visits: VisitHistoryItem[];
  loading: boolean;
  upcomingVisit?: {
    visit_date: string;
    status: 'proposed' | 'confirmed' | 'counter_proposed' | 'cancelled';
    dealer_proposed_date: string | null;
  } | null;
}

const OUTCOME_STYLE: Record<ReviewOutcome, string> = {
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  not_started: 'bg-neutral-50 text-neutral-600 border-neutral-200',
};

// Read-only for dealers: every visit renders the same card, empty parts are simply omitted.
export function CoachingVisitsSection({ visits, loading, upcomingVisit }: CoachingVisitsSectionProps) {
  const { t } = useLanguage();
  if (loading) return null;

  const row = (key: string, date: string, badge: React.ReactNode, body?: React.ReactNode) => (
    <li key={key} className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{format(new Date(date), 'dd MMM yyyy')}</p>
        {badge}
      </div>
      {body}
    </li>
  );

  return (
    <section id="coaching-visits" className="scroll-mt-6 rounded-lg border border-border bg-card p-5 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-foreground">{t('dealerVisits.title')}</h2>
      {!upcomingVisit && visits.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('dealerVisits.empty')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {upcomingVisit && row(
            'upcoming',
            upcomingVisit.dealer_proposed_date ?? upcomingVisit.visit_date,
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t('dealerVisits.upcoming')}</Badge>,
          )}
          {visits.map(v => {
            const outcome = (id: string): ReviewOutcome => {
              const reviewed = v.reviews.find(r => r.action_id === id)?.outcome;
              if (reviewed) return reviewed;
              const status = v.agreed_actions.find(x => x.id === id)?.status?.toLowerCase().replace(' ', '_');
              return status === 'completed' ? 'done' : status === 'in_progress' ? 'in_progress' : 'not_started';
            };
            return row(
                  v.id,
                  v.visit_date,
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{t('dealerVisits.completed')}</Badge>,
                  <>
                    {v.summary && <p className="mt-2 text-sm text-muted-foreground">{v.summary}</p>}
                    {v.agreed_actions.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t('dealerVisits.agreedActions')} ({v.agreed_actions.length})
                        </p>
                        <ul className="space-y-1.5">
                          {v.agreed_actions.map(a => (
                            <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                              <span className="min-w-0 truncate">{a.action_title}</span>
                              <Badge variant="outline" className={cn('shrink-0', OUTCOME_STYLE[outcome(a.id)])}>
                                {t(`dealerVisits.outcome.${outcome(a.id)}`)}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>,
            );
          })}
        </ul>
      )}
    </section>
  );
}
