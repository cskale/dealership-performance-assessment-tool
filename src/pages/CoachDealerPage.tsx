import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  ClipboardList,
  Network,
  BookOpen,
  Settings,
  Plus,
  FileDown,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  StickyNote,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { getScoreBand } from '@/lib/coachDashboardUtils';

type ActivityTab = 'all' | 'notes' | 'visits' | 'assessments';

interface DealerInfo {
  id: string;
  name: string;
  location: string | null;
  brand: string | null;
}

interface NoteRow {
  id: string;
  note_text: string;
  note_type: string | null;
  created_at: string;
  coach_user_id: string;
}

interface VisitRow {
  id: string;
  visit_date: string;
  status: string;
  visit_notes: string | null;
  created_at: string;
}

interface AssessmentRow {
  id: string;
  overall_score: number | null;
  scores: Record<string, number> | null;
  completed_at: string | null;
  created_at: string;
  status: string;
}

interface ActionRow {
  id: string;
  action_title: string;
  department: string | null;
  priority: string | null;
  status: string | null;
}

const DEPT_LABELS: Record<string, string> = {
  'new-vehicle-sales': 'NVS',
  'used-vehicle-sales': 'UVS',
  'service-performance': 'SVC',
  'parts-inventory': 'PTS',
  'financial-operations': 'FIN',
};

const DEPT_FULL: Record<string, string> = {
  'new-vehicle-sales': 'New Vehicle Sales',
  'used-vehicle-sales': 'Used Vehicle Sales',
  'service-performance': 'Service',
  'parts-inventory': 'Parts',
  'financial-operations': 'Financial Operations',
};

function getQuarterLabel(d: Date = new Date()): string {
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

export default function CoachDealerPage() {
  const { dealershipId } = useParams<{ dealershipId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const initialTab: ActivityTab =
    tabParam === 'notes' || tabParam === 'visits' || tabParam === 'assessments'
      ? (tabParam as ActivityTab)
      : tabParam === 'briefing'
      ? 'assessments'
      : 'all';

  const [tab, setTab] = useState<ActivityTab>(initialTab);
  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer state
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<string>('field-note');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tabParam !== tab) {
      setSearchParams(tab === 'all' ? {} : { tab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (!dealershipId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [dRes, nRes, vRes, aRes, actRes] = await Promise.all([
        supabase.from('dealerships').select('id, name, location, brand').eq('id', dealershipId).maybeSingle(),
        supabase.from('coach_notes').select('id, note_text, note_type, created_at, coach_user_id').eq('dealership_id', dealershipId).order('created_at', { ascending: false }),
        supabase.from('coach_visits').select('id, visit_date, status, visit_notes, created_at').eq('dealership_id', dealershipId).order('visit_date', { ascending: false }),
        supabase.from('assessments').select('id, overall_score, scores, completed_at, created_at, status').eq('dealership_id', dealershipId).order('created_at', { ascending: false }),
        supabase
          .from('improvement_actions')
          .select('id, action_title, department, priority, status, assessment_id, assessments!inner(dealership_id)')
          .eq('assessments.dealership_id', dealershipId)
          .neq('status', 'Completed'),
      ]);
      if (cancelled) return;
      setDealer((dRes.data as DealerInfo) ?? null);
      setNotes((nRes.data as NoteRow[]) ?? []);
      setVisits((vRes.data as VisitRow[]) ?? []);
      setAssessments(((aRes.data as unknown) as AssessmentRow[]) ?? []);
      setActions(((actRes.data as unknown) as ActionRow[]) ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [dealershipId]);

  const latestCompleted = useMemo(
    () => assessments.find((a) => a.status === 'completed' || a.completed_at),
    [assessments],
  );
  const previousCompleted = useMemo(
    () => assessments.filter((a) => a.status === 'completed' || a.completed_at)[1],
    [assessments],
  );

  const overallScore = latestCompleted?.overall_score ?? 0;
  const previousScore = previousCompleted?.overall_score ?? null;
  const delta =
    previousScore !== null && latestCompleted?.overall_score !== null && latestCompleted
      ? Math.round((latestCompleted.overall_score ?? 0) - previousScore)
      : null;

  const upcomingVisit = useMemo(
    () =>
      visits.find(
        (v) =>
          (v.status === 'confirmed' || v.status === 'proposed' || v.status === 'counter_proposed') &&
          new Date(v.visit_date) >= new Date(new Date().toDateString()),
      ),
    [visits],
  );

  const latestVisit = visits[0];

  const departmentScores = latestCompleted?.scores ?? {};
  const moduleCount = Object.keys(departmentScores).length;
  const onTrack = Object.values(departmentScores).filter((s) => typeof s === 'number' && s >= 70).length;

  const handleSaveNote = async () => {
    if (!user || !dealershipId || !noteText.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('coach_notes')
      .insert({
        coach_user_id: user.id,
        dealership_id: dealershipId,
        note_text: noteText.trim(),
        note_type: noteType,
      })
      .select('id, note_text, note_type, created_at, coach_user_id')
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error('Failed to save note');
      return;
    }
    setNotes((prev) => [data as NoteRow, ...prev]);
    setNoteText('');
    toast.success('Note saved');
  };

  const handleCancelVisit = async (id: string) => {
    const { error } = await supabase.from('coach_visits').update({ status: 'cancelled' }).eq('id', id);
    if (error) {
      toast.error('Failed to cancel');
      return;
    }
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'cancelled' } : v)));
    toast.success('Visit cancelled');
  };

  const handleCompleteVisit = async (id: string) => {
    const { error } = await supabase.from('coach_visits').update({ status: 'completed' }).eq('id', id);
    if (error) {
      toast.error('Failed to complete');
      return;
    }
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'completed' } : v)));
    toast.success('Visit marked complete');
  };

  // Build chronological feed
  type FeedItem =
    | { kind: 'note'; ts: string; data: NoteRow }
    | { kind: 'visit'; ts: string; data: VisitRow }
    | { kind: 'assessment'; ts: string; data: AssessmentRow };

  const feed: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    if (tab === 'all' || tab === 'notes') {
      notes.forEach((n) => items.push({ kind: 'note', ts: n.created_at, data: n }));
    }
    if (tab === 'all' || tab === 'visits') {
      visits.forEach((v) => items.push({ kind: 'visit', ts: v.created_at, data: v }));
    }
    if (tab === 'all' || tab === 'assessments') {
      assessments.forEach((a) =>
        items.push({ kind: 'assessment', ts: a.completed_at ?? a.created_at, data: a }),
      );
    }
    return items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [tab, notes, visits, assessments]);

  const band = getScoreBand(overallScore);

  return (
    <div className="min-h-screen flex bg-[#F4F5F7]">
      {/* Left sidebar (dark) */}
      <aside className="w-[200px] shrink-0 bg-[#0B1426] text-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              DD
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Dealer Diagnostic</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Coach Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SideLink icon={LayoutDashboard} label="Dashboard" active />
          <SideLink
            icon={ClipboardList}
            label="Assessments"
            onClick={() => setTab('assessments')}
          />
          <SideLink
            icon={Network}
            label="Network Stats"
            onClick={() => navigate('/app/coach-dashboard')}
          />
          <SideLink
            icon={BookOpen}
            label="KPI Encyclopedia"
            onClick={() => navigate('/app/knowledge?tab=kpi')}
          />
          <SideLink icon={Settings} label="Settings" onClick={() => navigate('/account')} />
        </nav>

        <div className="p-3 border-t border-slate-800">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            size="sm"
            onClick={() =>
              navigate(`/app/assessment?dealershipId=${dealershipId ?? ''}`)
            }
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Assessment
          </Button>
          <button
            type="button"
            onClick={() => navigate('/app/coach-dashboard')}
            className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to network
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Network Intelligence Hub
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                {loading ? '…' : dealer?.name ?? 'Dealer'}
                {dealer?.location && <span className="text-muted-foreground"> — {dealer.location}</span>}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Diagnostic Summary for Reporting Period {getQuarterLabel()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${band.className}`}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 align-middle" />
                {band.label}
              </span>
              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-500">
                <FileDown className="w-4 h-4 mr-1.5" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-4 gap-6 mb-8 pb-6 border-b border-border">
            <StatTile label="Open Actions" value={String(actions.length)} accent="text-blue-600" />
            <StatTile
              label="Visit Status"
              value={
                upcomingVisit
                  ? upcomingVisit.status.charAt(0).toUpperCase() + upcomingVisit.status.slice(1)
                  : 'None'
              }
              accent={upcomingVisit?.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}
            />
            <StatTile
              label="Maturity Band"
              value={band.label}
              valueClassName={band.className.split(' ').find((c) => c.startsWith('text-')) ?? ''}
            />
            <StatTile
              label="Last Synced"
              value={
                latestCompleted?.completed_at
                  ? formatDistanceToNow(new Date(latestCompleted.completed_at), { addSuffix: false }) + ' ago'
                  : '—'
              }
            />
          </div>

          {/* Grid: feed + right panel */}
          <div className="grid grid-cols-[1fr_320px] gap-6">
            <div>
              {/* Tab bar */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Intelligence Timeline</h2>
                <div className="flex gap-1.5">
                  {(['all', 'notes', 'visits', 'assessments'] as ActivityTab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        tab === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <div className="bg-white rounded-xl border border-border p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <StickyNote className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Select value={noteType} onValueChange={setNoteType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Note type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="field-note">Field Note</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="phone-call">Phone Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value.slice(0, 2000))}
                      placeholder="Add a field note…"
                      className="min-h-[100px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{noteText.length}/2000</span>
                      <Button
                        size="sm"
                        onClick={handleSaveNote}
                        disabled={!noteText.trim() || saving}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        {saving ? 'Saving…' : 'Save Note'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed */}
              <div className="space-y-4">
                {feed.length === 0 ? (
                  <div className="bg-white rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
                    No activity yet for this filter.
                  </div>
                ) : (
                  feed.map((item) => <FeedItemCard key={`${item.kind}-${item.data.id}`} item={item} />)
                )}
              </div>
            </div>

            {/* Right panel */}
            <aside className="space-y-4">
              {/* Aggregate score */}
              <div className="bg-white rounded-xl border border-border p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-3">
                  Aggregate Maturity Score
                </p>
                <div className="flex justify-center mb-3">
                  <ScoreGauge score={overallScore} size={140} />
                </div>
                {delta !== null && (
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {delta > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    ) : delta < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-muted-foreground'
                      }`}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </span>
                  </div>
                )}
                {moduleCount > 0 && (
                  <>
                    <div className="h-1 bg-blue-600 rounded mb-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {onTrack}/{moduleCount} modules on track for reporting
                    </p>
                  </>
                )}
              </div>

              {/* Department Performance */}
              {moduleCount > 0 && (
                <div className="bg-white rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold mb-4">Department Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(departmentScores).map(([key, score]) => {
                      if (typeof score !== 'number') return null;
                      const label = DEPT_LABELS[key] ?? key.slice(0, 3).toUpperCase();
                      return (
                        <div key={key} className="flex items-center gap-3 text-xs">
                          <span className="w-10 text-muted-foreground font-medium">{label}</span>
                          <Progress value={score} className="flex-1 h-2" />
                          <span className="w-8 text-right font-semibold">{Math.round(score)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Focus Actions */}
              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Focus Actions</h3>
                  <Link to="/app/coach-actions" className="text-xs text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                {actions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No open actions.</p>
                ) : (
                  <div className="space-y-3">
                    {actions
                      .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
                      .slice(0, 3)
                      .map((a) => (
                        <div
                          key={a.id}
                          className="border-l-2 border-blue-500 pl-3 py-1"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium leading-snug">{a.action_title}</p>
                            <PriorityBadge priority={a.priority} />
                          </div>
                          {a.department && (
                            <p className="text-xs text-muted-foreground">
                              {DEPT_FULL[a.department] ?? a.department}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Upcoming Visit */}
              {upcomingVisit && (
                <div className="bg-white rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold mb-3">Upcoming Visit</h3>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-base font-semibold">
                      {format(new Date(upcomingVisit.visit_date), 'd MMM yyyy')}
                    </p>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                        upcomingVisit.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {upcomingVisit.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Scheduled on-site diagnostic review
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelVisit(upcomingVisit.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-500"
                      onClick={() => handleCompleteVisit(upcomingVisit.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complete
                    </Button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function SideLink({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition ${
        active
          ? 'bg-blue-600/15 text-white border-l-2 border-blue-500'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatTile({
  label,
  value,
  accent,
  valueClassName,
}: {
  label: string;
  value: string;
  accent?: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      <p className={`text-2xl font-semibold ${accent ?? ''} ${valueClassName ?? ''}`}>{value}</p>
    </div>
  );
}

function priorityRank(p: string | null): number {
  switch ((p ?? '').toLowerCase()) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = (priority ?? 'low').toLowerCase();
  const cls =
    p === 'high'
      ? 'bg-red-100 text-red-700'
      : p === 'medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600';
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${cls}`}>
      {p}
    </span>
  );
}

function FeedItemCard({ item }: { item: { kind: 'note' | 'visit' | 'assessment'; ts: string; data: NoteRow | VisitRow | AssessmentRow } }) {
  const when = formatDistanceToNow(new Date(item.ts), { addSuffix: true });

  if (item.kind === 'note') {
    const n = item.data as NoteRow;
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-semibold">
          CN
        </div>
        <div className="flex-1 bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Coach Note</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                NOTE
              </span>
              {n.note_type && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {n.note_type}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{when}</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{n.note_text}</p>
        </div>
      </div>
    );
  }

  if (item.kind === 'visit') {
    const v = item.data as VisitRow;
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex-1 bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Coach Visit</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                VISIT
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                {v.status}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{when}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Visit {format(new Date(v.visit_date), 'd MMM yyyy')}
          </p>
          {v.visit_notes && <p className="text-sm mt-2">{v.visit_notes}</p>}
        </div>
      </div>
    );
  }

  const a = item.data as AssessmentRow;
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
        <ClipboardList className="w-4 h-4" />
      </div>
      <div className="flex-1 bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Assessment</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {a.status?.toUpperCase() ?? 'IN PROGRESS'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{when}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Overall score: {a.overall_score !== null ? Math.round(a.overall_score) : '—'} / 100
        </p>
        {(a.status === 'completed' || a.completed_at) && (
          <Link
            to={`/app/results/${a.id}`}
            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
          >
            View results →
          </Link>
        )}
      </div>
    </div>
  );
}
