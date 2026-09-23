import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { VISIT_MODULES } from '@/lib/coachVisitUtils';
import type { VisitBrief, VisitHistoryItem, ReviewOutcome } from '@/hooks/useCoachVisitLoop';

const VISIT_TYPE_LABELS: Record<string, string> = {
  'in-person': 'In person',
  in_person: 'In person',
  remote: 'Remote',
  phone: 'Phone',
};

const OUTCOME_LABELS: Record<ReviewOutcome, string> = {
  done: 'Done',
  in_progress: 'In progress',
  blocked: 'Blocked',
  not_started: 'Not started',
};

const OUTCOME_STYLES: Record<ReviewOutcome, string> = {
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-brand-50 text-brand-700 border-brand-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  not_started: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

function statusStyle(status: string) {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'In Progress') return 'bg-brand-50 text-brand-700 border-brand-200';
  return 'bg-neutral-100 text-neutral-600 border-neutral-200';
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
}

const moduleLabel = (id: string) => VISIT_MODULES.find(m => m.id === id)?.label ?? id;

function SinceLastVisitStrip({ brief }: { brief: VisitBrief }) {
  const delta = brief.score.delta;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Since your last coaching visit</span>
      {delta !== null ? (
        <span className={cn(
          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
          delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
        )}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(Math.round(delta))} pts
        </span>
      ) : (
        <span className="text-xs text-neutral-500">No new assessment since last visit</span>
      )}
      <span className="text-xs text-neutral-700 tabular-nums">
        {brief.overdue_count} overdue · {brief.stale_count} with no update in 21+ days · {brief.completed_since_last_visit} completed since last visit
      </span>
    </div>
  );
}

function VisitItem({ visit, defaultOpen, isLast }: { visit: VisitHistoryItem; defaultOpen: boolean; isLast: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const typeLabel = visit.visit_type ? VISIT_TYPE_LABELS[visit.visit_type] ?? visit.visit_type : null;
  const firstLine = visit.summary?.split('\n')[0] ?? '';

  return (
    <li className="relative pl-7">
      {!isLast && <span className="absolute left-[7px] top-5 bottom-0 w-px bg-neutral-200" aria-hidden />}
      <span className={cn(
        'absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-white ring-1',
        defaultOpen ? 'bg-brand-500 ring-brand-200' : 'bg-neutral-300 ring-neutral-200',
      )} aria-hidden />
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-neutral-900 tabular-nums">{fmtDate(visit.visit_date)}</span>
            {typeLabel && <Badge variant="outline" className="text-[11px] font-medium">{typeLabel}</Badge>}
          </div>
          {!open && firstLine && <p className="mt-1 text-xs text-neutral-500 truncate">{firstLine}</p>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />}
      </button>

      {open && (
        <div className="mt-3 space-y-4 pb-6">
          {visit.modules_reviewed.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visit.modules_reviewed.map(m => (
                <span key={m} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">{moduleLabel(m)}</span>
              ))}
            </div>
          )}
          {visit.summary && <p className="text-sm text-neutral-700 whitespace-pre-line leading-relaxed">{visit.summary}</p>}

          {visit.agreed_actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Agreed actions</p>
              <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                {visit.agreed_actions.map(a => {
                  const review = visit.reviews.find(r => r.action_id === a.id);
                  return (
                    <li key={a.id} className="px-3 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium text-neutral-900 leading-snug">{a.action_title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {review && (
                            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', OUTCOME_STYLES[review.outcome])}>
                              {OUTCOME_LABELS[review.outcome] ?? review.outcome}
                            </span>
                          )}
                          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium', statusStyle(a.status))}>{a.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">{a.responsible_person ?? 'Unassigned'} · Due {fmtDate(a.target_completion_date)}</p>
                      {review?.note && <p className="text-xs text-neutral-500 italic">{review.note}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {visit.next_visit_date && (
            <p className="flex items-center gap-1.5 text-xs text-neutral-600">
              <CalendarIcon className="h-3.5 w-3.5" /> Next visit planned: {fmtDate(visit.next_visit_date)}
            </p>
          )}
        </div>
      )}
      {!open && <div className="pb-5" />}
    </li>
  );
}

export function CoachingVisitsSection({
  visits, brief, loading,
}: { visits: VisitHistoryItem[]; brief: VisitBrief | null; loading: boolean }) {
  const sorted = [...visits].sort((a, b) => b.visit_date.localeCompare(a.visit_date));
  return (
    <section id="coaching-visits" className="bg-white rounded-xl shadow-card border border-neutral-200 px-5 py-5 space-y-4 scroll-mt-6">
      <h2 className="text-base font-semibold text-neutral-900">Coaching visits</h2>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          {brief?.last_visit && <SinceLastVisitStrip brief={brief} />}
          {sorted.length === 0 ? (
            <p className="text-sm text-neutral-500">No coaching visits logged yet. Your coach's visit notes and agreed actions will appear here.</p>
          ) : (
            <ol className="pt-1">
              {sorted.map((v, i) => (
                <VisitItem key={v.id} visit={v} defaultOpen={i === 0} isLast={i === sorted.length - 1} />
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
