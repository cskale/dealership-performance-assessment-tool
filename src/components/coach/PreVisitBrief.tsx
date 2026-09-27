import { useMemo } from 'react';
import { DATE_LOCALES } from '@/lib/dateLocale';
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { STATIC_BENCHMARKS, sectionToModuleCode } from '@/lib/benchmarkUtils';
import { VISIT_MODULES } from '@/lib/coachVisitUtils';
import type { BriefAction, VisitBrief } from '@/hooks/useCoachVisitLoop';

interface PreVisitBriefProps {
  dealerName: string;
  brief: VisitBrief | null | undefined;
  loading: boolean;
  nextVisitDate?: string | null;
  lastVisitNotes?: string[];
  onStartVisit?: () => void;
}

const outcomeLabel: Record<string, string> = { done: 'Done', in_progress: 'In progress', blocked: 'Blocked', not_started: 'Not started' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-border pt-5"><h3 className="text-h5 text-foreground">{title}</h3><div className="mt-3">{children}</div></section>;
}

function actionMeta(action: BriefAction, t: (key: string) => string, language: string) {
  return [action.responsible_person, action.target_completion_date ? t('visit.due').replace('{date}', format(new Date(action.target_completion_date), 'd MMM yyyy', { locale: DATE_LOCALES[language] })) : null].filter(Boolean).join(' · ');
}

export function PreVisitBrief({ dealerName, brief, loading, nextVisitDate, lastVisitNotes = [], onStartVisit }: PreVisitBriefProps) {
  const { t, language } = useLanguage();
  const departments = useMemo(() => {
    const current = brief?.score.departments_current ?? {};
    const previous = brief?.score.departments_at_last_visit ?? {};
    return Object.entries(current).flatMap(([id, value]) => {
      if (typeof value !== 'number') return [];
      const prior = typeof previous[id] === 'number' ? previous[id] : null;
      const benchmark = STATIC_BENCHMARKS[sectionToModuleCode(id)]?.meanScore ?? 70;
      const delta = prior === null ? null : value - prior;
      return [{ id, label: VISIT_MODULES.find(item => item.id === id)?.label ?? id, current: value, previous: prior, benchmark, delta, expanded: (delta !== null && Math.abs(delta) >= 5) || value < benchmark }];
    }).sort((a, b) => Number(b.expanded) - Number(a.expanded));
  }, [brief]);

  const agenda = useMemo(() => {
    const blocked = (brief?.agreed_actions ?? []).filter(action => action.last_review?.outcome === 'blocked').map(action => ({ id: `blocked-${action.id}`, label: action.title, kind: t('visit.agenda.blocked') }));
    const overdue = (brief?.overdue_actions ?? []).filter(action => !blocked.some(item => item.id === `blocked-${action.id}`)).map(action => ({ id: `overdue-${action.id}`, label: action.title, kind: t('visit.agenda.overdue') }));
    const drops = departments.filter(item => item.delta !== null && item.delta < 0).sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0)).map(item => ({ id: `drop-${item.id}`, label: item.label, kind: t('visit.agenda.scoreDrop') }));
    return [...blocked, ...overdue, ...drops].slice(0, 5);
  }, [brief, departments, t]);

  if (loading) return <main className="w-full max-w-3xl space-y-5"><Skeleton className="h-20" /><Skeleton className="h-40" /><Skeleton className="h-32" /><Skeleton className="h-40" /></main>;

  const lastVisit = brief?.last_visit;
  const score = brief?.score.current;
  const delta = brief?.score.delta;
  const openActions = (brief?.agreed_actions ?? []).filter(action => action.status !== 'Completed');
  const completedCount = (brief?.agreed_actions ?? []).length - openActions.length;
  const visitDate = nextVisitDate ?? lastVisit?.next_visit_date;
  const headline = score == null
    ? t('visit.brief.noScore').replace('{dealer}', dealerName)
    : t('visit.brief.headline')
        .replace('{dealer}', dealerName)
        .replace('{score}', String(Math.round(score)))
        .replace('{delta}', delta == null ? t('visit.brief.noDelta') : `${delta >= 0 ? '▲' : '▼'}${Math.abs(Math.round(delta))}`)
        .replace('{date}', lastVisit ? format(new Date(lastVisit.visit_date), 'd MMM', { locale: DATE_LOCALES[language] }) : t('visit.brief.noVisit'))
        .replace('{overdue}', String(brief?.overdue_count ?? 0));

  return (
    <main className="w-full max-w-3xl rounded-xl bg-background p-5 shadow-card sm:p-8 print:shadow-none">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-label uppercase tracking-wider text-muted-foreground">{t('visit.brief.title')}</p>
          <h2 className="mt-2 text-h4 text-foreground">{headline}</h2>
          {visitDate && <p className="mt-1 text-body-sm text-muted-foreground">{t('visit.brief.nextVisit').replace('{date}', format(new Date(visitDate), 'd MMM yyyy', { locale: DATE_LOCALES[language] }))}</p>}
        </div>
        {onStartVisit && <Button onClick={onStartVisit}><Play className="h-4 w-4" />{t('visit.start')}</Button>}
      </header>

      <div className="mt-6 space-y-6">
        <Section title={t('visit.brief.sinceLast')}>
          {openActions.length === 0 ? <p className="text-body-sm text-muted-foreground">{t('visit.brief.noAgreed')}</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-body-sm"><thead className="border-b border-border text-caption uppercase tracking-wider text-muted-foreground"><tr><th className="pb-2 font-medium">{t('visit.action')}</th><th className="pb-2 font-medium">{t('visit.ownerDue')}</th><th className="pb-2 font-medium">{t('visit.status')}</th><th className="pb-2 font-medium">{t('visit.lastReview')}</th></tr></thead><tbody className="divide-y divide-border">{openActions.map(action => <tr key={action.id}><td className="py-3 pr-4 font-medium text-foreground">{action.title}</td><td className="py-3 pr-4 text-muted-foreground">{actionMeta(action, t, language) || '—'}</td><td className="py-3 pr-4"><Badge variant="outline">{action.status}</Badge></td><td className="py-3 text-muted-foreground">{action.last_review ? outcomeLabel[action.last_review.outcome] ?? action.last_review.outcome : '—'}</td></tr>)}</tbody></table></div>
          )}
          {completedCount > 0 && <p className="mt-3 flex items-center gap-2 text-body-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />{t('visit.brief.completedCollapsed').replace('{count}', String(completedCount))}</p>}
        </Section>

        <Section title={t('visit.brief.lastNotes')}>
          {lastVisit?.summary || lastVisitNotes.length ? <div className="space-y-2 text-body-md leading-relaxed text-foreground">{lastVisit?.summary && <p className="whitespace-pre-line">{lastVisit.summary}</p>}{lastVisitNotes.map((note, index) => <p key={`${index}-${note}`} className="border-l-2 border-primary/30 pl-3 text-muted-foreground">{note}</p>)}</div> : <p className="text-body-sm text-muted-foreground">{t('visit.brief.noNotes')}</p>}
        </Section>

        <Section title={t('visit.brief.kpisDepartments')}>
          {departments.length === 0 ? <p className="text-body-sm text-muted-foreground">{t('visit.brief.noComparison')}</p> : <div className="space-y-2">{departments.filter(item => item.expanded).map(item => <div key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-border px-3 py-2.5"><span className="text-body-sm font-medium text-foreground">{item.label}</span><span className="numeric text-body-sm text-muted-foreground">{item.previous == null ? '—' : Math.round(item.previous)} → <strong className="text-foreground">{Math.round(item.current)}</strong></span>{item.delta == null ? <Badge variant="outline">—</Badge> : <Badge variant="outline" className={cn(item.delta > 0 ? 'border-success/30 bg-success/10 text-success' : item.delta < 0 ? 'border-destructive/30 bg-destructive/10 text-destructive' : '')}>{item.delta > 0 ? <ArrowUp className="h-3 w-3" /> : item.delta < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}{Math.abs(Math.round(item.delta))}</Badge>}</div>)}{departments.some(item => !item.expanded) && <p className="text-body-sm text-muted-foreground">{t('visit.brief.stableDepartments').replace('{departments}', departments.filter(item => !item.expanded).map(item => item.label).join(', '))}</p>}</div>}
        </Section>

        <Section title={t('visit.brief.needsAttention')}>
          {(brief?.overdue_actions ?? []).length === 0 && (brief?.stale_count ?? 0) === 0 ? <p className="text-body-sm text-muted-foreground">{t('visit.brief.noAttention')}</p> : <div className="space-y-2">{(brief?.overdue_actions ?? []).slice(0, 5).map(action => <div key={action.id} className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5"><span className="text-body-sm font-medium text-foreground">{action.title}</span><span className="shrink-0 text-caption font-medium text-destructive numeric">{t('visit.daysOverdue').replace('{days}', String(action.days_overdue))}</span></div>)}{(brief?.stale_count ?? 0) > 0 && <p className="flex items-center gap-2 text-body-sm text-warning-foreground"><AlertTriangle className="h-4 w-4" />{t('visit.brief.stale').replace('{count}', String(brief?.stale_count ?? 0))}</p>}</div>}
        </Section>

        <Section title={t('visit.brief.agenda')}>
          {agenda.length === 0 ? <p className="text-body-sm text-muted-foreground">{t('visit.agenda.empty')}</p> : <ol className="space-y-2">{agenda.map((item, index) => <li key={item.id} className="flex items-start gap-3 text-body-sm"><span className="numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold text-muted-foreground">{index + 1}</span><span><strong className="font-medium text-foreground">{item.label}</strong><span className="ml-2 text-caption text-muted-foreground">{item.kind}</span></span></li>)}</ol>}
        </Section>
      </div>
    </main>
  );
}
