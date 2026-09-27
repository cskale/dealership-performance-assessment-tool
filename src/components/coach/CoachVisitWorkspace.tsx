import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarPlus, MapPin, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVisitBrief } from '@/hooks/useCoachVisitLoop';
import type { CoachVisit } from '@/lib/coachVisitUtils';
import { sendVisitNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PreVisitBrief } from './PreVisitBrief';
import { VisitDetail } from './VisitDetail';
import { VisitTimeline, type TimelineVisit } from './VisitTimeline';

interface CoachVisitWorkspaceProps {
  dealershipId: string;
  dealerName: string;
  location?: string;
  latestScore?: number | null;
  latestAssessmentId?: string | null;
  onBack?: () => void;
  onClose?: () => void;
  onVisitSaved?: () => void;
}

export function CoachVisitWorkspace({ dealershipId, dealerName, location, latestScore, latestAssessmentId, onBack, onClose, onVisitSaved }: CoachVisitWorkspaceProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const briefQuery = useVisitBrief(dealershipId);
  const timelineQuery = useQuery({
    queryKey: ['visit-workspace-timeline', dealershipId],
    queryFn: async (): Promise<TimelineVisit[]> => {
      const [visitsResult, notesResult, reviewsResult] = await Promise.all([
        supabase.from('coach_visits').select('*').eq('dealership_id', dealershipId).order('visit_date', { ascending: false }),
        supabase.from('coach_notes').select('visit_id').eq('dealership_id', dealershipId).not('visit_id', 'is', null),
        supabase.from('visit_action_reviews').select('visit_id, id'),
      ]);
      if (visitsResult.error) throw visitsResult.error;
      if (notesResult.error) throw notesResult.error;
      if (reviewsResult.error) throw reviewsResult.error;
      const noteCounts = new Map<string, number>();
      const reviewCounts = new Map<string, number>();
      for (const note of notesResult.data ?? []) if (note.visit_id) noteCounts.set(note.visit_id, (noteCounts.get(note.visit_id) ?? 0) + 1);
      for (const review of reviewsResult.data ?? []) reviewCounts.set(review.visit_id, (reviewCounts.get(review.visit_id) ?? 0) + 1);
      return (visitsResult.data ?? []).map(visit => ({ ...visit, reviewCount: reviewCounts.get(visit.id) ?? 0, noteCount: noteCounts.get(visit.id) ?? 0 })) as TimelineVisit[];
    },
  });
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduling, setScheduling] = useState(false);
  const [heroCompact, setHeroCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeroCompact(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visits = useMemo(() => timelineQuery.data ?? [], [timelineQuery.data]);
  const selectedVisit = useMemo(() => visits.find(visit => visit.id === selectedVisitId) ?? null, [visits, selectedVisitId]);
  const nextVisit = visits.find(visit => ['proposed', 'confirmed', 'counter_proposed'].includes(visit.status));
  const completedCount = visits.filter(visit => visit.status === 'completed').length;

  const refresh = async () => {
    await Promise.all([timelineQuery.refetch(), briefQuery.refetch()]);
    onVisitSaved?.();
  };

  const schedule = async () => {
    if (!scheduleDate || !user) return;
    setScheduling(true);
    try {
      const date = format(scheduleDate, 'yyyy-MM-dd');
      const { data: inserted, error } = await supabase.from('coach_visits').insert({ dealership_id: dealershipId, coach_user_id: user.id, visit_date: date, status: 'proposed' }).select('id').single();
      if (error) throw error;
      const { data: dealer } = await supabase.from('dealerships').select('user_id').eq('id', dealershipId).maybeSingle();
      if (dealer?.user_id) {
        void sendVisitNotification({ event: 'proposed', recipientUserId: dealer.user_id, dealershipId, visitId: inserted.id, visitDate: date, dealershipName: dealerName });
      }
      toast.success(t('visit.scheduleSuccess'));
      setScheduleOpen(false);
      setScheduleDate(undefined);
      await refresh();
    } catch { toast.error(t('visit.scheduleFailed')); }
    finally { setScheduling(false); }
  };

  const startVisit = async () => {
    let visit = nextVisit;
    if (!visit && user) {
      const { data, error } = await supabase.from('coach_visits').insert({ dealership_id: dealershipId, coach_user_id: user.id, visit_date: format(new Date(), 'yyyy-MM-dd'), status: 'confirmed' }).select('*').single();
      if (error) { toast.error(t('visit.startFailed')); return; }
      visit = data as TimelineVisit;
      await refresh();
    }
    if (visit) setSelectedVisitId(visit.id);
  };

  return (
    <div className="min-h-full bg-neutral-50">
      <header className="sticky top-0 z-30 bg-dd-midnight text-white shadow-sm transition-[padding] duration-200">
        <div className={`mx-auto flex max-w-[1440px] items-center gap-4 px-4 transition-[padding] duration-200 sm:px-6 ${heroCompact ? 'py-3' : 'py-5 sm:py-7'}`}>
          {onBack && <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/10 hover:text-white" onClick={onBack} aria-label={t('common.back')}><ArrowLeft className="h-5 w-5" /></Button>}
          <div className="min-w-0 flex-1"><p className="text-label uppercase tracking-wider text-white/55">{t('visit.workspace.eyebrow')}</p><h1 className={`${heroCompact ? 'text-h5' : 'text-h3'} truncate transition-all`}>{dealerName}</h1>{!heroCompact && location && <p className="mt-1 flex items-center gap-1.5 text-body-sm text-white/60"><MapPin className="h-3.5 w-3.5" />{location}</p>}</div>
          <div className="hidden items-center gap-6 sm:flex"><div><p className="text-label uppercase tracking-wider text-white/45">{t('visit.workspace.score')}</p><p className="numeric text-h5">{latestScore == null ? '—' : Math.round(latestScore)}</p></div><div><p className="text-label uppercase tracking-wider text-white/45">{t('visit.workspace.visits')}</p><p className="numeric text-h5">{completedCount}</p></div></div>
          {onClose && <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={onClose} aria-label={t('common.close')}><X className="h-5 w-5" /></Button>}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-8">
        <VisitTimeline visits={visits} selectedVisitId={selectedVisitId} loading={timelineQuery.isLoading} onSelectBrief={() => setSelectedVisitId(null)} onSelectVisit={visit => setSelectedVisitId(visit.id)} onSchedule={() => setScheduleOpen(true)} />
        <div className="min-w-0 flex-1">{selectedVisit ? <VisitDetail visitId={selectedVisit.id} dealershipId={dealershipId} latestAssessmentId={latestAssessmentId} onSaved={refresh} /> : <PreVisitBrief dealerName={dealerName} brief={briefQuery.data} loading={briefQuery.isLoading} nextVisitDate={nextVisit?.visit_date} onStartVisit={startVisit} />}</div>
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{t('visit.schedule')}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>{t('visit.scheduleDate')}</Label><Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} disabled={{ before: new Date() }} className="mx-auto" /></div><Button className="w-full" disabled={!scheduleDate || scheduling} onClick={schedule}><CalendarPlus className="h-4 w-4" />{scheduling ? t('visit.scheduling') : t('visit.propose')}</Button></div></DialogContent></Dialog>
    </div>
  );
}
