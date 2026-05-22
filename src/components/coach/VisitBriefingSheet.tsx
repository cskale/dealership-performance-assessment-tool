import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { AlertCircle, StickyNote, CalendarDays } from 'lucide-react';
import { STATIC_BENCHMARKS, sectionToModuleCode } from '@/lib/benchmarkUtils';
import { getDepartmentName } from '@/lib/departmentNames';
import { VISIT_MODULES } from '@/lib/coachVisitUtils';

interface VisitBriefingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string;
  dealerName: string;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  onOpenHistory?: () => void;
  onOpenVisit?: () => void;
  onOpenNotes?: () => void;
}

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

interface BriefingData {
  scores: Record<string, number>;
  topActions: Array<{
    id: string;
    action_title: string;
    priority: string;
    last_status_updated_at: string | null;
  }>;
  lastVisit: {
    visit_date: string;
    visit_type: string | null;
    modules_reviewed: string[];
    summary: string | null;
  } | null;
  recentNotes: Array<{
    id: string;
    note_text: string;
    created_at: string;
  }>;
  upcomingVisit: {
    visit_date: string;
    status: string;
  } | null;
}

export function VisitBriefingSheet({
  open,
  onOpenChange,
  dealershipId,
  dealerName,
  latestAssessmentId,
  latestScore,
  latestDate,
  onOpenHistory,
  onOpenVisit,
  onOpenNotes,
}: VisitBriefingSheetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BriefingData | null>(null);

  useEffect(() => {
    if (open) fetchBriefingData();
  }, [open, dealershipId, latestAssessmentId]);

  const fetchBriefingData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [scoresResult, assessmentsResult, visitResult, notesResult, upcomingVisitResult] = await Promise.all([
        latestAssessmentId
          ? supabase.from('assessments').select('scores').eq('id', latestAssessmentId).single()
          : Promise.resolve({ data: null }),
        supabase.from('assessments').select('id').eq('dealership_id', dealershipId),
        supabase
          .from('coach_visits')
          .select('visit_date, visit_type, modules_reviewed, summary')
          .eq('coach_user_id', user.id)
          .eq('dealership_id', dealershipId)
          .eq('status', 'completed')
          .not('summary', 'is', null)
          .order('visit_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('coach_notes')
          .select('id, note_text, created_at')
          .eq('dealership_id', dealershipId)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('coach_visits')
          .select('visit_date, status')
          .eq('coach_user_id', user.id)
          .eq('dealership_id', dealershipId)
          .in('status', ['proposed', 'confirmed'])
          .order('visit_date', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      const assessmentIds = (assessmentsResult.data ?? []).map((a: { id: string }) => a.id);

      const actionsResult = assessmentIds.length > 0
        ? await supabase
            .from('improvement_actions')
            .select('id, action_title, priority, last_status_updated_at')
            .in('assessment_id', assessmentIds)
            .in('status', ['Open', 'In Progress'])
            .order('urgency_score', { ascending: false, nullsFirst: false })
            .limit(3)
        : { data: [] };

      setData({
        scores: (scoresResult.data as any)?.scores ?? {},
        topActions: (actionsResult.data ?? []) as BriefingData['topActions'],
        lastVisit: (visitResult.data as BriefingData['lastVisit']) ?? null,
        recentNotes: (notesResult.data ?? []) as BriefingData['recentNotes'],
        upcomingVisit: (upcomingVisitResult.data as BriefingData['upcomingVisit']) ?? null,
      });
    } catch {
      // Silently fail — briefing shows empty sections rather than crashing
    } finally {
      setLoading(false);
    }
  };

  const getDaysStale = (lastUpdated: string | null): number | null => {
    if (!lastUpdated) return null;
    return Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86_400_000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Pre-Visit Briefing — {dealerName}
          </DialogTitle>
          {latestScore !== null && latestDate && (
            <p className="text-xs text-muted-foreground">
              Assessment {format(new Date(latestDate), 'dd MMM yyyy')} · Overall{' '}
              <span className="font-semibold text-foreground">{Math.round(latestScore)}/100</span>
            </p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading briefing…</p>
          </div>
        ) : data && (
          <div className="mt-6 space-y-6">

            {/* Section 1: Dept Scores vs Benchmark */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Dept scores vs benchmark
              </p>
              <div className="space-y-2.5">
                {DEPT_ORDER.map(sectionId => {
                  const score = data.scores[sectionId];
                  if (score === undefined) return null;
                  const benchmark = STATIC_BENCHMARKS[sectionToModuleCode(sectionId)]?.meanScore ?? 70;
                  const gap = Math.round(score - benchmark);
                  return (
                    <div key={sectionId} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">
                        {getDepartmentName(sectionId, 'en')}
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score >= 75 ? 'bg-emerald-500' :
                            score >= 55 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-7 text-right">{Math.round(score)}</span>
                      <span className={`text-[10px] w-10 text-right font-medium ${
                        gap >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {gap >= 0 ? `▲ +${gap}` : `▼ ${gap}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Focus Actions */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Focus actions
              </p>
              {data.topActions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No open actions — dealer is on track.</p>
              ) : (
                <div className="space-y-2">
                  {data.topActions.map(action => {
                    const daysStale = getDaysStale(action.last_status_updated_at);
                    return (
                      <div key={action.id} className="flex items-start gap-2 rounded-md border border-border px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-snug truncate">{action.action_title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className={`text-[10px] capitalize ${PRIORITY_COLORS[action.priority] ?? ''}`}>
                            {action.priority}
                          </Badge>
                          {daysStale !== null && daysStale > 14 && (
                            <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {daysStale}d
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Section 3: Last Visit */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Last visit
              </p>
              {!data.lastVisit ? (
                <p className="text-xs text-muted-foreground">No previous visit logged.</p>
              ) : (
                <div className="rounded-md border border-border px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">
                      {format(new Date(data.lastVisit.visit_date), 'dd MMM yyyy')}
                    </span>
                    {data.lastVisit.visit_type && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {data.lastVisit.visit_type}
                      </Badge>
                    )}
                    {data.lastVisit.modules_reviewed.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {data.lastVisit.modules_reviewed
                          .map(id => VISIT_MODULES.find(m => m.id === id)?.label ?? id)
                          .join(', ')}
                      </span>
                    )}
                  </div>
                  {data.lastVisit.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {data.lastVisit.summary}
                    </p>
                  )}
                </div>
              )}
              {onOpenHistory && (
                <button
                  type="button"
                  className="text-xs text-[hsl(var(--brand-500))] underline mt-1 block"
                  onClick={() => { onOpenChange(false); onOpenHistory(); }}
                >
                  View history →
                </button>
              )}
            </section>

            {/* Section 4: Coach Notes */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Recent coach notes
              </p>
              {data.recentNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentNotes.map(note => (
                    <div key={note.id} className="flex items-start gap-2">
                      <StickyNote className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed">{note.note_text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNowStrict(new Date(note.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {onOpenNotes && (
                <button
                  type="button"
                  className="text-xs text-[hsl(var(--brand-500))] underline mt-2 block"
                  onClick={() => { onOpenChange(false); onOpenNotes(); }}
                >
                  Add note →
                </button>
              )}
            </section>

            {/* Section 5: Upcoming Visit */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Upcoming visit
              </p>
              {data.upcomingVisit ? (
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-xs font-medium">
                    {format(new Date(data.upcomingVisit.visit_date), 'dd MMM yyyy')}
                  </span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {data.upcomingVisit.status}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">No visit scheduled</p>
                  {onOpenVisit && (
                    <button
                      type="button"
                      className="text-xs text-[hsl(var(--brand-500))] underline"
                      onClick={() => { onOpenChange(false); onOpenVisit(); }}
                    >
                      Schedule →
                    </button>
                  )}
                </div>
              )}
            </section>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
