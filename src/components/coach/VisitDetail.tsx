import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, Check, MessageSquarePlus, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSaveVisitReviews, type ReviewOutcome } from '@/hooks/useCoachVisitLoop';
import { sanitizeText } from '@/lib/sanitize';
import type { CoachVisit, OpenAction } from '@/lib/coachVisitUtils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface DetailAction {
  id: string;
  action_title?: string;
  title?: string;
  responsible_person: string | null;
  target_completion_date: string | null;
  department?: string;
  priority?: string;
  status?: string;
}

interface DetailReview {
  action_id: string;
  outcome: ReviewOutcome;
  note: string | null;
}

interface DetailNote {
  id: string;
  note_text: string;
  action_id: string | null;
  created_at: string;
}

interface VisitDetailPayload {
  visit: CoachVisit;
  reviews: DetailReview[];
  agreed_actions: DetailAction[];
  notes: DetailNote[];
}

interface VisitDetailProps {
  visitId: string;
  dealershipId: string;
  latestAssessmentId?: string | null;
  onSaved?: () => void;
}

const OUTCOMES: ReviewOutcome[] = ['done', 'in_progress', 'blocked', 'not_started'];

function actionTitle(action: DetailAction) { return action.action_title ?? action.title ?? ''; }

export function VisitDetail({ visitId, dealershipId, latestAssessmentId, onSaved }: VisitDetailProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const saveReviews = useSaveVisitReviews(dealershipId);
  const detailQuery = useQuery({
    queryKey: ['visit-detail', visitId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_visit_detail', { p_visit_id: visitId });
      if (error) throw error;
      return data as unknown as VisitDetailPayload;
    },
  });
  const openActionsQuery = useQuery({
    queryKey: ['visit-open-actions', dealershipId, latestAssessmentId],
    queryFn: async (): Promise<OpenAction[]> => {
      let assessmentIds = latestAssessmentId ? [latestAssessmentId] : [];
      if (!assessmentIds.length) {
        const { data, error } = await supabase.from('assessments').select('id').eq('dealership_id', dealershipId);
        if (error) throw error;
        assessmentIds = (data ?? []).map(item => item.id);
      }
      if (!assessmentIds.length) return [];
      const { data, error } = await supabase.from('improvement_actions').select('id, action_title, department, priority, status').in('assessment_id', assessmentIds).in('status', ['Open', 'In Progress']).order('priority');
      if (error) throw error;
      return (data ?? []) as OpenAction[];
    },
  });

  const detail = detailQuery.data;
  const visit = detail?.visit;
  const readOnly = !visit || user?.id !== visit.coach_user_id;
  const [outcomes, setOutcomes] = useState<Record<string, ReviewOutcome>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState('');
  const [nextDate, setNextDate] = useState<Date | undefined>();
  const [agreedIds, setAgreedIds] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteActionId, setNoteActionId] = useState('none');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!detail) return;
    setOutcomes(Object.fromEntries(detail.reviews.map(review => [review.action_id, review.outcome])));
    setReviewNotes(Object.fromEntries(detail.reviews.map(review => [review.action_id, review.note ?? ''])));
    setSummary(detail.visit.summary ?? '');
    setNextDate(detail.visit.next_visit_date ? new Date(detail.visit.next_visit_date) : undefined);
    setAgreedIds(detail.visit.agreed_action_ids ?? []);
    setNewNote('');
    setNoteActionId('none');
  }, [detail]);

  const actionsToReview = useMemo(() => detail?.agreed_actions ?? [], [detail]);
  const selectableActions = openActionsQuery.data ?? [];

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['visit-detail', visitId] }),
      queryClient.invalidateQueries({ queryKey: ['visit-workspace-timeline', dealershipId] }),
      queryClient.invalidateQueries({ queryKey: ['visit-brief', dealershipId] }),
    ]);
    onSaved?.();
  };

  const save = async () => {
    if (!visit || readOnly) return;
    setSaving(true);
    try {
      const reviews = actionsToReview.flatMap(action => {
        const outcome = outcomes[action.id];
        return outcome ? [{ actionId: action.id, outcome, note: reviewNotes[action.id] }] : [];
      });
      await saveReviews.mutateAsync({ visitId, reviews });
      const { error } = await supabase.from('coach_visits').update({
        summary: sanitizeText(summary.trim()) || null,
        next_visit_date: nextDate ? format(nextDate, 'yyyy-MM-dd') : null,
        agreed_action_ids: agreedIds,
        updated_at: new Date().toISOString(),
      }).eq('id', visitId);
      if (error) throw error;
      toast.success(t('visit.saved'));
      await refresh();
    } catch {
      toast.error(t('visit.saveFailed'));
    } finally { setSaving(false); }
  };

  const addNote = async () => {
    if (!visit || readOnly || !newNote.trim() || !user) return;
    setAddingNote(true);
    try {
      const { error } = await supabase.from('coach_notes').insert({
        dealership_id: dealershipId,
        coach_user_id: user.id,
        visit_id: visitId,
        action_id: noteActionId === 'none' ? null : noteActionId,
        note_text: sanitizeText(newNote.trim()),
        note_type: 'general',
      });
      if (error) throw error;
      toast.success(t('visit.noteAdded'));
      setNewNote('');
      setNoteActionId('none');
      await refresh();
    } catch { toast.error(t('visit.noteFailed')); }
    finally { setAddingNote(false); }
  };

  if (detailQuery.isLoading) return <main className="w-full max-w-3xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-56" /><Skeleton className="h-40" /></main>;
  if (detailQuery.isError || !visit) return <main className="w-full max-w-3xl rounded-xl bg-background p-6 shadow-card"><p className="text-body-sm text-destructive">{t('visit.detail.failed')}</p></main>;

  return (
    <main className="w-full max-w-3xl rounded-xl bg-background p-5 shadow-card sm:p-8">
      <header className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div><p className="text-label uppercase tracking-wider text-muted-foreground">{t('visit.detail.title')}</p><h2 className="mt-1 text-h4 text-foreground">{format(new Date(visit.visit_date), 'dd MMMM yyyy')}</h2><p className="mt-1 text-body-sm text-muted-foreground">{readOnly ? t('visit.detail.readOnly') : t('visit.detail.editing')}</p></div>
        {!readOnly && <Button onClick={save} disabled={saving}><Save className="h-4 w-4" />{saving ? t('visit.saving') : t('visit.save')}</Button>}
      </header>

      <div className="mt-6 space-y-7">
        <section><Label className="text-h5">{t('visit.review.title')}</Label><p className="mt-1 text-caption text-muted-foreground">{t('visit.review.helper')}</p><div className="mt-3 space-y-3">{actionsToReview.length === 0 ? <p className="text-body-sm text-muted-foreground">{t('visit.review.empty')}</p> : actionsToReview.map(action => {
          const meta = [action.responsible_person, action.target_completion_date ? t('visit.due').replace('{date}', format(new Date(action.target_completion_date), 'dd MMM yyyy')) : null].filter(Boolean).join(' · ');
          const outcome = outcomes[action.id];
          const showNote = outcome === 'blocked' || outcome === 'in_progress';
          return <div key={action.id} className="rounded-lg border border-border p-4"><p className="whitespace-normal break-words text-body-sm font-semibold leading-relaxed text-foreground">{actionTitle(action)}</p>{meta && <p className="mt-1 text-caption text-muted-foreground">{meta}</p>}<div className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg border border-border sm:grid-cols-4" role="group" aria-label={t('visit.review.outcome')}>{OUTCOMES.map(item => <button key={item} type="button" disabled={readOnly} onClick={() => setOutcomes(current => ({ ...current, [action.id]: item }))} className={cn('min-h-9 border-r border-border px-2 text-caption font-medium last:border-r-0 disabled:cursor-default', outcome === item ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50')}>{t(`visit.outcome.${item}`)}</button>)}</div>{showNote && <Input disabled={readOnly} value={reviewNotes[action.id] ?? ''} onChange={event => setReviewNotes(current => ({ ...current, [action.id]: event.target.value }))} placeholder={t('visit.review.notePlaceholder')} maxLength={500} className="mt-3" />}</div>;
        })}</div></section>

        <section className="border-t border-border pt-6"><Label className="text-h5">{t('visit.notes.title')}</Label>{!readOnly && <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3"><Textarea value={newNote} onChange={event => setNewNote(event.target.value)} placeholder={t('visit.notes.placeholder')} maxLength={2000} /><div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><Select value={noteActionId} onValueChange={setNoteActionId}><SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{t('visit.notes.general')}</SelectItem>{actionsToReview.map(action => <SelectItem key={action.id} value={action.id}>{actionTitle(action)}</SelectItem>)}</SelectContent></Select><Button size="sm" onClick={addNote} disabled={!newNote.trim() || addingNote}><MessageSquarePlus className="h-4 w-4" />{t('visit.notes.add')}</Button></div></div>}<div className="mt-3 space-y-2">{(detail.notes ?? []).length === 0 ? <p className="text-body-sm text-muted-foreground">{t('visit.notes.empty')}</p> : detail.notes.map(note => { const linked = actionsToReview.find(action => action.id === note.action_id); return <article key={note.id} className="rounded-lg border border-border px-4 py-3"><p className="whitespace-pre-line text-body-sm text-foreground">{note.note_text}</p><p className="mt-2 text-caption text-muted-foreground">{format(new Date(note.created_at), 'dd MMM yyyy')}{linked ? ` · ${t('visit.notes.about')} ${actionTitle(linked)}` : ''}</p></article>; })}</div></section>

        <section className="border-t border-border pt-6"><Label className="text-h5">{t('visit.agreedNext')}</Label><p className="mt-1 text-caption text-muted-foreground">{t('visit.agreedNextHelp')}</p><div className="mt-3 max-h-56 divide-y divide-border overflow-y-auto rounded-lg border border-border">{selectableActions.length === 0 ? <p className="p-4 text-body-sm text-muted-foreground">{t('visit.agreedEmpty')}</p> : selectableActions.map(action => { const selected = agreedIds.includes(action.id); return <button key={action.id} type="button" disabled={readOnly} onClick={() => setAgreedIds(current => selected ? current.filter(id => id !== action.id) : [...current, action.id])} className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-muted/30 disabled:cursor-default"><span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>{selected && <Check className="h-3 w-3" />}</span><span><span className="block text-body-sm font-medium text-foreground">{action.action_title}</span><span className="text-caption text-muted-foreground">{action.department} · {action.priority}</span></span></button>; })}</div></section>

        <section className="grid gap-5 border-t border-border pt-6 sm:grid-cols-[220px_1fr]"><div><Label>{t('visit.nextDate')}</Label><Popover><PopoverTrigger asChild><Button variant="outline" disabled={readOnly} className="mt-2 w-full justify-start font-normal"><CalendarIcon className="h-4 w-4" />{nextDate ? format(nextDate, 'dd MMM yyyy') : t('visit.pickDate')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={nextDate} onSelect={setNextDate} disabled={{ before: new Date() }} /></PopoverContent></Popover></div><div><Label>{t('visit.summary')}</Label><Textarea disabled={readOnly} className="mt-2 min-h-32" value={summary} onChange={event => setSummary(event.target.value)} maxLength={3000} placeholder={t('visit.summaryPlaceholder')} /></div></section>
      </div>
    </main>
  );
}
