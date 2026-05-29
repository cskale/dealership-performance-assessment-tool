import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MapPin, Loader2, Trash2, X, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { getScoreBand } from '@/lib/coachDashboardUtils';
import { type AssignedDealer } from '@/pages/CoachDashboard';
import { type CoachVisit } from '@/lib/coachVisitUtils';
import { VISIT_MODULES } from '@/lib/coachVisitUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VisitLogSheet } from '@/components/coach/VisitLogSheet';
import { generateVisitReport, type VisitReportData } from '@/lib/pdfReportGenerator';
import { STATIC_BENCHMARKS, sectionToModuleCode } from '@/lib/benchmarkUtils';
import { getDepartmentName } from '@/lib/departmentNames';
import { AlertCircle } from 'lucide-react';

// ── Local types ────────────────────────────────────────────────────────────────

interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  note_type: 'observation' | 'action' | 'follow-up' | null;
  created_at: string;
}

interface FocusAction {
  id: string;
  action_title: string;
  priority: string;
  last_status_updated_at: string | null;
}

interface CompletedAssessment {
  id: string;
  overall_score: number | null;
  created_at: string;
}

interface PanelData {
  notes: CoachNote[];
  visits: CoachVisit[];
  assessmentScores: Record<string, number>;
  focusActions: FocusAction[];
  completedAssessments: CompletedAssessment[];
}

// ── Activity feed ──────────────────────────────────────────────────────────────

type ActivityEntry =
  | { kind: 'note'; id: string; text: string; noteType: string | null; sortKey: string }
  | { kind: 'visit_proposed'; id: string; visitDate: string; sortKey: string }
  | { kind: 'visit_completed'; id: string; visitDate: string; visitType: string | null; modules: string[]; summary: string | null; sortKey: string }
  | { kind: 'assessment'; id: string; score: number; sortKey: string };

type ActivityFilter = 'all' | 'notes' | 'visits' | 'assessments';

function buildActivityFeed(data: PanelData): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  data.notes.forEach(n => {
    entries.push({
      kind: 'note',
      id: n.id,
      text: n.note_text,
      noteType: n.note_type,
      sortKey: n.created_at,
    });
  });

  data.visits.forEach(v => {
    if (v.status === 'completed') {
      entries.push({
        kind: 'visit_completed',
        id: v.id,
        visitDate: v.visit_date,
        visitType: v.visit_type,
        modules: v.modules_reviewed ?? [],
        summary: v.summary,
        sortKey: v.visit_date,
      });
    } else {
      entries.push({
        kind: 'visit_proposed',
        id: v.id,
        visitDate: v.visit_date,
        sortKey: v.created_at ?? v.visit_date,
      });
    }
  });

  data.completedAssessments.forEach(a => {
    if (a.overall_score != null) {
      entries.push({
        kind: 'assessment',
        id: a.id,
        score: a.overall_score,
        sortKey: a.created_at,
      });
    }
  });

  return entries.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

// ── Visits tab ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  proposed:         'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
  confirmed:        'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20',
  cancelled:        'bg-muted text-muted-foreground border-border',
  completed:        'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
  counter_proposed: 'bg-amber-100 text-amber-800 border-amber-200',
};

function VisitsTab({
  data,
  dataLoading,
  dealer,
  latestAssessmentId,
  user,
  onDataRefresh,
  onVisitSaved,
}: {
  data: PanelData | null;
  dataLoading: boolean;
  dealer: AssignedDealer;
  latestAssessmentId: string | null;
  user: { id: string; email?: string } | null;
  onDataRefresh: () => void;
  onVisitSaved: () => void;
}) {
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [proposeDate, setProposeDate] = useState<Date | undefined>();
  const [proposeNotes, setProposeNotes] = useState('');
  const [proposeSaving, setProposeSaving] = useState(false);
  const [coachResponseMode, setCoachResponseMode] = useState(false);
  const [coachCounterDate, setCoachCounterDate] = useState<Date | undefined>();
  const [responding, setResponding] = useState(false);
  const [visitLogOpen, setVisitLogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<CoachVisit | null>(null);

  const visits = data?.visits ?? [];
  const activeVisit = visits.find(v =>
    ['proposed', 'confirmed', 'counter_proposed'].includes(v.status as string)
  ) ?? null;
  const pastVisits = visits.filter(v =>
    ['cancelled', 'completed'].includes(v.status as string)
  );

  const handlePropose = async () => {
    if (!proposeDate || !user?.id) return;
    setProposeSaving(true);
    try {
      const { error } = await supabase.from('coach_visits').insert({
        coach_user_id: user.id,
        dealership_id: dealer.dealershipId,
        visit_date: format(proposeDate, 'yyyy-MM-dd'),
        visit_notes: proposeNotes.trim() || null,
        status: 'proposed',
      });
      if (error) {
        if (error.code === '23505') {
          toast.error('Cancel the existing proposed visit before scheduling a new one.');
        } else {
          throw error;
        }
        return;
      }
      toast.success('Visit proposed');
      setProposeDate(undefined);
      setProposeNotes('');
      setShowProposeForm(false);
      onVisitSaved();
    } catch {
      toast.error('Failed to propose visit');
    } finally {
      setProposeSaving(false);
    }
  };

  const handleCancel = async (visitId: string) => {
    const { error } = await supabase
      .from('coach_visits')
      .update({ status: 'cancelled' })
      .eq('id', visitId);
    if (error) { toast.error('Failed to cancel visit'); return; }
    toast.success('Visit cancelled');
    onVisitSaved();
  };

  const handleMarkCompleted = async (visitId: string) => {
    const { error } = await supabase
      .from('coach_visits')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', visitId);
    if (error) { toast.error('Failed to mark visit as completed'); return; }
    toast.success('Visit marked as completed');
    onVisitSaved();
  };

  const handleAcceptCounterProposal = async (visitId: string, dealerDate: string) => {
    setResponding(true);
    try {
      const { error } = await supabase
        .from('coach_visits')
        .update({ status: 'confirmed', visit_date: dealerDate, dealer_proposed_date: null })
        .eq('id', visitId);
      if (!error) {
        toast.success("Visit confirmed on dealer's date");
        onVisitSaved();
      } else {
        toast.error('Failed to confirm visit');
      }
    } catch {
      toast.error('Failed to confirm visit');
    } finally {
      setResponding(false);
    }
  };

  const handleRejectAndRepropose = async (visitId: string) => {
    if (!coachCounterDate) return;
    setResponding(true);
    try {
      const { error } = await supabase
        .from('coach_visits')
        .update({
          status: 'proposed',
          visit_date: format(coachCounterDate, 'yyyy-MM-dd'),
          dealer_proposed_date: null,
        })
        .eq('id', visitId);
      if (!error) {
        toast.success('New date proposed to dealer');
        setCoachResponseMode(false);
        setCoachCounterDate(undefined);
        onVisitSaved();
      } else {
        toast.error('Failed to propose new date');
      }
    } catch {
      toast.error('Failed to propose new date');
    } finally {
      setResponding(false);
    }
  };

  const handleDownloadReport = async (visit: CoachVisit) => {
    try {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('scores')
        .eq('dealership_id', dealer.dealershipId)
        .order('created_at', { ascending: false })
        .limit(1);
      const scores = (assessments?.[0] as any)?.scores ?? {};
      let agreedActions: VisitReportData['agreedActions'] = [];
      if (visit.agreed_action_ids.length > 0) {
        const { data: actions } = await supabase
          .from('improvement_actions')
          .select('action_title, department, priority, status')
          .in('id', visit.agreed_action_ids);
        agreedActions = (actions ?? []) as VisitReportData['agreedActions'];
      }
      const reportData: VisitReportData = {
        dealerName: dealer.dealerName,
        dealerLocation: dealer.location,
        coachName: user?.email ?? 'Coach',
        visit,
        scores,
        benchmarks: STATIC_BENCHMARKS,
        agreedActions,
        lang: 'en',
      };
      await generateVisitReport(reportData);
    } catch {
      toast.error('Failed to generate visit report');
    }
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Active visit */}
      {activeVisit && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Upcoming
          </p>

          {/* Counter-proposal banner */}
          {activeVisit.status === 'counter_proposed' && activeVisit.dealer_proposed_date && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-amber-800">Dealer suggested a new date</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {format(new Date(activeVisit.dealer_proposed_date), 'EEEE, dd MMMM yyyy')}
                </p>
              </div>
              {!coachResponseMode ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    disabled={responding}
                    onClick={() => handleAcceptCounterProposal(activeVisit.id, activeVisit.dealer_proposed_date!)}
                  >
                    {responding ? 'Saving…' : 'Accept this date'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setCoachResponseMode(true)}
                  >
                    Propose different date
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Calendar
                    mode="single"
                    selected={coachCounterDate}
                    onSelect={setCoachCounterDate}
                    disabled={{ before: new Date() }}
                    className="rounded-md border"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      disabled={!coachCounterDate || responding}
                      onClick={() => handleRejectAndRepropose(activeVisit.id)}
                    >
                      {responding ? 'Saving…' : 'Propose this date'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => { setCoachResponseMode(false); setCoachCounterDate(undefined); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {format(new Date(activeVisit.visit_date), 'dd MMM yyyy')}
              </span>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${STATUS_STYLES[activeVisit.status]}`}
              >
                {activeVisit.status === 'counter_proposed' ? 'Counter proposed' : activeVisit.status}
              </Badge>
            </div>
            {activeVisit.visit_notes && (
              <p className="text-xs text-muted-foreground">{activeVisit.visit_notes}</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[#dc2626] hover:text-[#dc2626] px-2"
                onClick={() => handleCancel(activeVisit.id)}
              >
                <X className="h-3 w-3 mr-1" />Cancel visit
              </Button>
              {activeVisit.status === 'confirmed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#16a34a] hover:text-[#16a34a] px-2"
                  onClick={() => handleMarkCompleted(activeVisit.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />Mark as completed
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Past visits */}
      {pastVisits.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Past visits
          </p>
          <div className="rounded-lg border border-border divide-y divide-border">
            {pastVisits.map(v => (
              <div key={v.id} className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {format(new Date(v.visit_date), 'dd MMM yyyy')}
                    </span>
                    {v.status === 'completed' && v.visit_type && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {v.visit_type}
                      </Badge>
                    )}
                    {v.modules_reviewed?.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {v.modules_reviewed.length} module{v.modules_reviewed.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize shrink-0 ${STATUS_STYLES[v.status]}`}
                  >
                    {v.status}
                  </Badge>
                </div>
                {v.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{v.summary}</p>
                )}
                {v.status === 'completed' && (
                  <div className="flex items-center gap-2 pt-1">
                    {v.summary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleDownloadReport(v)}
                      >
                        ↓ Report
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => { setSelectedVisit(v); setVisitLogOpen(true); }}
                    >
                      {v.summary ? 'Edit log' : 'Log session'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Propose new visit */}
      {!activeVisit && (
        <div>
          {!showProposeForm ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowProposeForm(true)}
            >
              + Propose New Visit
            </Button>
          ) : (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm font-medium">Propose a visit date</p>
              <Calendar
                mode="single"
                selected={proposeDate}
                onSelect={setProposeDate}
                disabled={{ before: new Date() }}
                className="rounded-md border"
              />
              <Textarea
                placeholder="Optional notes for this visit…"
                value={proposeNotes}
                onChange={e => setProposeNotes(e.target.value)}
                className="resize-none text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  disabled={!proposeDate || proposeSaving}
                  onClick={handlePropose}
                >
                  {proposeSaving ? 'Proposing…' : 'Propose Visit'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowProposeForm(false); setProposeDate(undefined); setProposeNotes(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VisitLogSheet nested dialog */}
      {selectedVisit && (
        <VisitLogSheet
          open={visitLogOpen}
          onOpenChange={setVisitLogOpen}
          visit={selectedVisit}
          dealershipId={dealer.dealershipId}
          dealerName={dealer.dealerName}
          latestAssessmentId={latestAssessmentId}
          onLogSaved={() => {
            setVisitLogOpen(false);
            onDataRefresh();
          }}
        />
      )}
    </div>
  );
}

// ── ActivityEntryRow ───────────────────────────────────────────────────────────

function ActivityEntryRow({
  entry,
  coachInitials,
  onDeleteNote,
}: {
  entry: ActivityEntry;
  coachInitials: string;
  onDeleteNote?: (id: string) => void;
}) {
  const isCoachEntry = entry.kind === 'note';
  const avatarText = isCoachEntry ? coachInitials : 'SYS';
  const avatarCls = isCoachEntry
    ? 'bg-[hsl(var(--brand-500))] text-white'
    : 'bg-muted text-muted-foreground';

  let actionText = '';
  let primaryBadge = '';
  let secondaryBadge: string | null = null;
  let timestamp = '';
  let contentNode: ReactNode = null;

  if (entry.kind === 'note') {
    actionText = 'added a note';
    primaryBadge = 'NOTE';
    secondaryBadge = entry.noteType ?? null;
    timestamp = formatDistanceToNowStrict(new Date(entry.sortKey), { addSuffix: true });
    contentNode = <p className="text-sm text-foreground mt-1.5">{entry.text}</p>;
  } else if (entry.kind === 'visit_proposed') {
    actionText = `proposed a visit for ${format(new Date(entry.visitDate), 'dd MMM yyyy')}`;
    primaryBadge = 'VISIT';
    timestamp = formatDistanceToNowStrict(new Date(entry.sortKey), { addSuffix: true });
  } else if (entry.kind === 'visit_completed') {
    actionText = 'visit completed';
    primaryBadge = 'VISIT';
    timestamp = format(new Date(entry.visitDate), 'dd MMM yyyy');
    contentNode = (
      <div className="mt-1.5 space-y-0.5">
        {entry.visitType && (
          <p className="text-xs text-muted-foreground capitalize">{entry.visitType}</p>
        )}
        {entry.modules.length > 0 && (
          <p className="text-xs text-muted-foreground">{entry.modules.join(', ')}</p>
        )}
        {entry.summary && (
          <p className="text-xs text-foreground line-clamp-2">{entry.summary}</p>
        )}
      </div>
    );
  } else {
    actionText = 'assessment completed';
    primaryBadge = 'ASSESSMENT';
    timestamp = format(new Date(entry.sortKey), 'dd MMM yyyy');
    contentNode = (
      <p className="text-xs text-muted-foreground mt-1.5">
        Overall score: {entry.score}/100
      </p>
    );
  }

  return (
    <div className="flex gap-3 py-4">
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarCls}`}
      >
        {avatarText}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm leading-snug">
            <span className="font-semibold">{isCoachEntry ? 'You' : 'System'}</span>
            {' '}
            <span className="text-muted-foreground">{actionText}</span>
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0">{timestamp}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0">
            {primaryBadge}
          </Badge>
          {secondaryBadge && (
            <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
              {secondaryBadge}
            </Badge>
          )}
        </div>
        {contentNode}
      </div>
      {entry.kind === 'note' && onDeleteNote && (
        <button
          className="shrink-0 text-muted-foreground hover:text-[#dc2626] transition-colors mt-0.5"
          onClick={() => onDeleteNote(entry.id)}
          aria-label="Delete note"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── ActivityTab ────────────────────────────────────────────────────────────────

function ActivityTab({
  data,
  dataLoading,
  dealer,
  user,
  onNoteAdded,
  onNoteDeleted,
}: {
  data: PanelData | null;
  dataLoading: boolean;
  dealer: AssignedDealer;
  user: { id: string; email?: string } | null;
  onNoteAdded: () => void;
  onNoteDeleted: () => void;
}) {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'observation' | 'action' | 'follow-up' | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const coachInitials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'ME';

  const handleSaveNote = async () => {
    if (!noteText.trim() || !user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('coach_notes').insert({
      coach_user_id: user.id,
      dealership_id: dealer.dealershipId,
      note_text: noteText.trim(),
      note_type: noteType || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Failed to save note');
      return;
    }
    setNoteText('');
    setNoteType('');
    onNoteAdded();
  };

  const handleDeleteNote = async (noteId: string) => {
    await supabase.from('coach_notes').delete().eq('id', noteId);
    onNoteDeleted();
  };

  const feed = data ? buildActivityFeed(data) : [];
  const filtered = filter === 'all' ? feed
    : filter === 'notes' ? feed.filter(e => e.kind === 'note')
    : filter === 'visits' ? feed.filter(e => e.kind === 'visit_proposed' || e.kind === 'visit_completed')
    : feed.filter(e => e.kind === 'assessment');

  return (
    <div className="p-6 space-y-5">
      {/* Filter strip */}
      <div className="flex gap-1">
        {(['all', 'notes', 'visits', 'assessments'] as ActivityFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? 'bg-[hsl(var(--brand-500))] text-white border-[hsl(var(--brand-500))]'
                : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Compose box */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Select value={noteType} onValueChange={v => setNoteType(v as typeof noteType)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Note type (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="action">Action</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Add a field note…"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          maxLength={2000}
          rows={3}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{noteText.length}/2000</span>
          <Button
            size="sm"
            onClick={handleSaveNote}
            disabled={!noteText.trim() || submitting}
          >
            {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Save Note
          </Button>
        </div>
      </div>

      {/* Feed */}
      {dataLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map(entry => (
            <ActivityEntryRow
              key={`${entry.kind}-${entry.id}`}
              entry={entry}
              coachInitials={coachInitials}
              onDeleteNote={entry.kind === 'note' ? handleDeleteNote : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Briefing tab ───────────────────────────────────────────────────────────────

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

function BriefingTab({
  data,
  dataLoading,
  latestScore,
  latestDate,
  onSwitchToVisits,
  onSwitchToActivity,
}: {
  data: PanelData | null;
  dataLoading: boolean;
  latestScore: number | null;
  latestDate: string | null;
  onSwitchToVisits: () => void;
  onSwitchToActivity: () => void;
}) {
  if (dataLoading || !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const lastVisit = data.visits.find(v => v.status === 'completed' && v.summary) ?? null;
  const upcomingVisit = data.visits.find(v =>
    ['proposed', 'confirmed', 'counter_proposed'].includes(v.status as string)
  ) ?? null;

  const getDaysStale = (lastUpdated: string | null): number | null => {
    if (!lastUpdated) return null;
    return Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86_400_000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* VISIT STATUS */}
      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          VISIT STATUS
        </p>

        {/* Last visit card */}
        {!lastVisit ? (
          <p className="text-xs text-muted-foreground">No previous visit logged.</p>
        ) : (
          <div className="rounded-lg border border-border px-3 py-2.5 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium">
                {format(new Date(lastVisit.visit_date), 'dd MMM yyyy')}
              </span>
              {lastVisit.visit_type && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {lastVisit.visit_type}
                </Badge>
              )}
              {lastVisit.modules_reviewed.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {lastVisit.modules_reviewed.length} module{lastVisit.modules_reviewed.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {lastVisit.summary && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{lastVisit.summary}</p>
            )}
          </div>
        )}

        {/* Upcoming visit row */}
        {upcomingVisit ? (
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 mt-2">
            <span className="text-xs font-medium">
              {format(new Date(upcomingVisit.visit_date), 'dd MMM yyyy')}
            </span>
            <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[upcomingVisit.status]}`}>
              {upcomingVisit.status === 'counter_proposed' ? 'Counter proposed' : upcomingVisit.status}
            </Badge>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">No visit scheduled</p>
            <button
              type="button"
              className="text-xs text-[hsl(var(--brand-500))] underline cursor-pointer"
              onClick={onSwitchToVisits}
            >
              Schedule →
            </button>
          </div>
        )}
      </section>

      {/* PERFORMANCE SNAPSHOT */}
      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          PERFORMANCE SNAPSHOT
        </p>
        <div className="space-y-2.5">
          {DEPT_ORDER.map(sectionId => {
            const score = data.assessmentScores[sectionId];
            if (score === undefined) return null;
            const benchmark = STATIC_BENCHMARKS[sectionToModuleCode(sectionId)]?.meanScore ?? 70;
            const gap = Math.round(score - benchmark);
            return (
              <div key={sectionId} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">
                  {getDepartmentName(sectionId, 'en')}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      score >= 75 ? 'bg-emerald-500' :
                      score >= 55 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
                <span className="w-7 text-right text-xs font-medium text-foreground">{Math.round(score)}</span>
                <span className={`w-12 text-right text-[10px] font-medium ${
                  gap >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {gap >= 0 ? `▲ +${gap}` : `▼ ${gap}`}
                </span>
              </div>
            );
          })}
          {DEPT_ORDER.every(id => data.assessmentScores[id] === undefined) && (
            <p className="text-xs text-muted-foreground">No assessment scores available.</p>
          )}
        </div>
      </section>

      {/* PRIORITY ACTIONS */}
      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          PRIORITY ACTIONS
        </p>
        {(() => {
          const priorityWeight: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          const sortedActions = [...data.focusActions].sort(
            (a, b) => (priorityWeight[a.priority] ?? 4) - (priorityWeight[b.priority] ?? 4)
          );
          if (sortedActions.length === 0) {
            return (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                ✓ All actions on track
              </p>
            );
          }
          return (
            <div className="space-y-2">
              {sortedActions.map(action => {
                const daysStale = getDaysStale(action.last_status_updated_at);
                const dotColor =
                  action.priority === 'critical' ? 'bg-red-500' :
                  action.priority === 'high' ? 'bg-orange-500' :
                  action.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400';
                return (
                  <div key={action.id} className="flex items-start gap-2 rounded-md border border-border px-3 py-2">
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotColor}`} />
                    <p className="flex-1 min-w-0 text-xs font-medium leading-snug truncate">
                      {action.action_title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className={`text-[10px] capitalize ${PRIORITY_COLORS[action.priority] ?? ''}`}>
                        {action.priority}
                      </Badge>
                      {daysStale !== null && daysStale > 7 && (
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
          );
        })()}
      </section>

      {/* Add field note shortcut */}
      <button
        type="button"
        className="text-xs text-[hsl(var(--brand-500))] underline block"
        onClick={onSwitchToActivity}
      >
        ＋ Add field note →
      </button>
    </div>
  );
}

// ── Tab constant (module-level so it is stable across renders) ─────────────────

const TABS = ['activity', 'visits', 'briefing'] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
// Live now:   open, onOpenChange, dealer, latestScore, latestAssessmentId, onNoteAdded
// Reserved:   latestDate, onVisitSaved, initialTab  (wired in later tasks)

export interface DealerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: AssignedDealer;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  initialTab?: 'activity' | 'visits' | 'briefing';
  onVisitSaved: () => void;
  onNoteAdded: () => void;
}

export function DealerPanel({
  open,
  onOpenChange,
  dealer,
  latestAssessmentId,
  latestScore,
  latestDate,
  initialTab = 'activity',
  onVisitSaved,
  onNoteAdded,
}: DealerPanelProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'visits' | 'briefing'>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const { user } = useAuth();
  const [data, setData] = useState<PanelData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;
    setDataLoading(true);
    try {
      const [notesRes, visitsRes, assessmentsRes] = await Promise.all([
        supabase
          .from('coach_notes')
          .select('*')
          .eq('dealership_id', dealer.dealershipId)
          .eq('coach_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('coach_visits')
          .select('*')
          .eq('dealership_id', dealer.dealershipId)
          .eq('coach_user_id', user.id)
          .order('visit_date', { ascending: false }),
        supabase
          .from('assessments')
          .select('id, overall_score, created_at')
          .eq('dealership_id', dealer.dealershipId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const completedAssessments = (assessmentsRes.data ?? []) as CompletedAssessment[];
      const assessmentIds = completedAssessments.map(a => a.id);

      let assessmentScores: Record<string, number> = {};
      if (latestAssessmentId) {
        const { data: scoreRow } = await supabase
          .from('assessments')
          .select('scores')
          .eq('id', latestAssessmentId)
          .single();
        assessmentScores = (scoreRow as any)?.scores ?? {};
      }

      let focusActions: FocusAction[] = [];
      if (assessmentIds.length) {
        const { data: actionsData } = await supabase
          .from('improvement_actions')
          .select('id, action_title, priority, last_status_updated_at')
          .in('assessment_id', assessmentIds)
          .in('status', ['Open', 'In Progress'])
          .order('urgency_score', { ascending: false, nullsFirst: false })
          .limit(3);
        focusActions = (actionsData ?? []) as FocusAction[];
      }

      setData({
        notes: (notesRes.data ?? []) as CoachNote[],
        visits: (visitsRes.data ?? []) as CoachVisit[],
        assessmentScores,
        focusActions,
        completedAssessments,
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dealer.dealershipId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight">
                {dealer.dealerName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {dealer.location}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {latestScore != null && (() => {
                const band = getScoreBand(latestScore);
                return (
                  <>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(latestScore)}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${band.className}`}>
                      {band.label}
                    </Badge>
                  </>
                );
              })()}
            </div>
          </div>
        </DialogHeader>

        {/* Tab strip */}
        <div className="flex border-b border-border px-6 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[hsl(var(--brand-500))] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab bodies */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'activity' && (
            <ActivityTab
              data={data}
              dataLoading={dataLoading}
              dealer={dealer}
              user={user}
              onNoteAdded={() => { fetchData(); onNoteAdded(); }}
              onNoteDeleted={fetchData}
            />
          )}
          {activeTab === 'visits' && (
            <VisitsTab
              data={data}
              dataLoading={dataLoading}
              dealer={dealer}
              latestAssessmentId={latestAssessmentId}
              user={user}
              onDataRefresh={fetchData}
              onVisitSaved={() => { fetchData(); onVisitSaved(); }}
            />
          )}
          {activeTab === 'briefing' && (
            <BriefingTab
              data={data}
              dataLoading={dataLoading}
              latestScore={latestScore}
              latestDate={latestDate}
              onSwitchToVisits={() => setActiveTab('visits')}
              onSwitchToActivity={() => setActiveTab('activity')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
