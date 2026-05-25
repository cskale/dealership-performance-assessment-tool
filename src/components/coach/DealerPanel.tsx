import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MapPin, Loader2, Trash2 } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';
import { getScoreBand } from '@/lib/coachDashboardUtils';
import { type AssignedDealer } from '@/pages/CoachDashboard';
import { type CoachVisit } from '@/lib/coachVisitUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  // Suppress unused-variable warnings for props reserved for later tasks
  void latestDate;
  void onVisitSaved;

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
            <div className="p-6">
              {dataLoading
                ? <p className="text-sm text-muted-foreground">Loading…</p>
                : <p className="text-sm text-muted-foreground">Visits coming in Task 4.</p>
              }
            </div>
          )}
          {activeTab === 'briefing' && (
            <div className="p-6">
              {dataLoading
                ? <p className="text-sm text-muted-foreground">Loading…</p>
                : <p className="text-sm text-muted-foreground">Briefing coming in Task 5.</p>
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
