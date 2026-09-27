import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Clock3, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CoachVisit } from '@/lib/coachVisitUtils';

export interface TimelineVisit extends CoachVisit {
  reviewCount?: number;
  noteCount?: number;
}

interface VisitTimelineProps {
  visits: TimelineVisit[];
  selectedVisitId: string | null;
  loading?: boolean;
  onSelectBrief: () => void;
  onSelectVisit: (visit: TimelineVisit) => void;
  onSchedule: () => void;
  readOnly?: boolean;
}

const ACTIVE_STATUSES = new Set(['proposed', 'confirmed', 'counter_proposed']);

function statusVariant(status: string) {
  if (status === 'completed') return 'border-success/30 bg-success/10 text-success';
  if (status === 'cancelled') return 'border-border bg-muted text-muted-foreground';
  if (status === 'confirmed') return 'border-primary/30 bg-primary/10 text-primary';
  if (status === 'counter_proposed') return 'border-warning/30 bg-warning/10 text-warning-foreground';
  return 'border-info/30 bg-info/10 text-info';
}

function VisitRow({ visit, active, onClick }: { visit: TimelineVisit; active: boolean; onClick: () => void }) {
  const { t } = useLanguage();
  const summary = visit.summary ?? visit.visit_notes;
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        'h-auto w-full items-start justify-start rounded-lg border px-3 py-3 text-left font-normal',
        active ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/40',
      )}
    >
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="flex items-center justify-between gap-2">
          <span className="text-body-sm font-semibold text-foreground numeric">
            {format(new Date(visit.visit_date), 'dd MMM yyyy')}
          </span>
          <Badge variant="outline" className={cn('shrink-0 text-caption capitalize', statusVariant(visit.status))}>
            {t(`visit.status.${visit.status}`)}
          </Badge>
        </span>
        {summary && <span className="block truncate text-caption text-muted-foreground">{summary}</span>}
        <span className="block text-caption text-muted-foreground">
          {t('visit.timeline.counts')
            .replace('{actions}', String(visit.reviewCount ?? 0))
            .replace('{notes}', String(visit.noteCount ?? 0))}
        </span>
      </span>
    </Button>
  );
}

export function VisitTimeline({ visits, selectedVisitId, loading, onSelectBrief, onSelectVisit, onSchedule, readOnly = false }: VisitTimelineProps) {
  const { t } = useLanguage();
  const [showCancelled, setShowCancelled] = useState(false);
  const upcoming = visits.find(visit => ACTIVE_STATUSES.has(visit.status)) ?? null;
  const past = visits.filter(visit => !ACTIVE_STATUSES.has(visit.status) && visit.status !== 'cancelled');
  const cancelled = visits.filter(visit => visit.status === 'cancelled');

  if (loading) {
    return <aside className="w-full space-y-3 lg:w-72 lg:shrink-0"><Skeleton className="h-28" /><Skeleton className="h-20" /><Skeleton className="h-20" /></aside>;
  }

  return (
    <aside className="w-full space-y-5 lg:w-72 lg:shrink-0" aria-label={t('visit.timeline.title')}>
      <div>
        <p className="text-label uppercase tracking-wider text-muted-foreground">{t('visit.timeline.next')}</p>
        {upcoming ? (
          <VisitRow visit={upcoming} active={selectedVisitId === upcoming.id} onClick={() => onSelectVisit(upcoming)} />
        ) : (
          <div className="mt-2 rounded-lg border border-dashed border-border bg-background p-4">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> {t('visit.timeline.noneScheduled')}
            </div>
            {!readOnly && (
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={onSchedule}>
                <Plus className="h-4 w-4" /> {t('visit.schedule')}
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-label uppercase tracking-wider text-muted-foreground">{t('visit.timeline.past')}</p>
          {selectedVisitId && <Button variant="ghost" size="sm" className="h-7 px-2 text-caption" onClick={onSelectBrief}>{t('visit.brief.title')}</Button>}
        </div>
        <div className="mt-2 space-y-1">
          {past.length === 0 ? (
            <p className="rounded-lg border border-border bg-background p-4 text-body-sm text-muted-foreground">{t('visit.timeline.empty')}</p>
          ) : past.map(visit => <VisitRow key={visit.id} visit={visit} active={selectedVisitId === visit.id} onClick={() => onSelectVisit(visit)} />)}
        </div>
      </div>

      {cancelled.length > 0 && (
        <div>
          <Button variant="ghost" size="sm" className="w-full justify-between px-2 text-muted-foreground" onClick={() => setShowCancelled(value => !value)}>
            <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{t('visit.timeline.cancelled').replace('{count}', String(cancelled.length))}</span>
            {showCancelled ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {showCancelled && <div className="mt-1 space-y-1">{cancelled.map(visit => <VisitRow key={visit.id} visit={visit} active={selectedVisitId === visit.id} onClick={() => onSelectVisit(visit)} />)}</div>}
        </div>
      )}
    </aside>
  );
}
