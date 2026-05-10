import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SharedLoadingState } from '@/components/shared/SharedLoadingState';
import { SharedEmptyState } from '@/components/shared/SharedEmptyState';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ArrowUpDown, CalendarDays, Filter, LineChart as LineChartIcon, TrendingUp as TrendingUpIcon, TrendingUp, TrendingDown, Minus, StickyNote, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { computeStatsBar, computeTrend, daysSince, getScoreBand, isOverdue, isDueSoon } from '@/lib/coachDashboardUtils';
import { CoachNoteSheet } from '@/components/coach/CoachNoteSheet';

interface AssignedDealer {
  dealershipId: string;
  dealerName: string;
  location: string;
  brand: string;
  latestScore: number | null;
  previousScore: number | null;
  latestDate: string | null;
  latestStatus: string | null;
  latestAssessmentId: string | null;
  openCount: number;
  overdueCount: number;
}

interface AssessmentRecord {
  id: string;
  dealership_id: string;
  overall_score: number | null;
  created_at: string;
  status: string;
}

interface ActionItem {
  id: string;
  action_title: string;
  priority: string;
  status: string;
  last_status_updated_at: string | null;
  target_completion_date: string | null;
  dealerName: string;
  dealershipId: string;
  assessmentId: string;
  daysStale: number;
}

interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  created_at: string;
}

const CHART_COLORS = ['#2563eb', '#7c3aed', '#0891b2'];

function getScoreBadge(score: number): { className: string; label: string } {
  if (score >= 85) return { className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20', label: 'Leading' };
  if (score >= 70) return { className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20', label: 'Advanced' };
  if (score >= 46) return { className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20', label: 'Developing' };
  return { className: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20', label: 'Foundational' };
}

export default function CoachDashboard() {
  const { actorType, loading: roleLoading } = useActiveRole();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [dealers, setDealers] = useState<AssignedDealer[]>([]);
  const [allAssessments, setAllAssessments] = useState<AssessmentRecord[]>([]);
  const [allActions, setAllActions] = useState<ActionItem[]>([]);
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'overdue'>('score');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [selectedDealerIds, setSelectedDealerIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overdue' | 'stale' | 'all'>('overdue');
  const [actionDealerFilter, setActionDealerFilter] = useState<string>('all');
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteSheetDealer, setNoteSheetDealer] = useState<AssignedDealer | null>(null);
  const [notesDealerFilter, setNotesDealerFilter] = useState<string>('all');
  const [notesPage, setNotesPage] = useState(0);
  // Temporary stubs — removed in Tasks 6-10
  const staleActions: never[] = [];
  const selectedDealer = null;

  const fetchNotes = async (page = 0) => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('coach_notes')
      .select('*')
      .eq('coach_user_id', user.id)
      .order('created_at', { ascending: false })
      .range(page * 20, page * 20 + 19);
    if (page === 0) {
      setNotes((data as CoachNote[]) ?? []);
    } else {
      setNotes(prev => [...prev, ...((data as CoachNote[]) ?? [])]);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchAssignments = async () => {
      setLoading(true);

      const { data: assignments, error: assignErr } = await supabase
        .from('coach_dealership_assignments')
        .select('dealership_id')
        .eq('coach_user_id', user!.id)
        .eq('is_active', true);

      if (assignErr || !assignments?.length) {
        setDealers([]);
        setLoading(false);
        return;
      }

      const dealershipIds = assignments.map(a => a.dealership_id);

      const [dealershipsRes, assessmentsRes] = await Promise.all([
        supabase.from('dealerships').select('id, name, location, brand').in('id', dealershipIds),
        supabase
          .from('assessments')
          .select('id, overall_score, created_at, dealership_id, status')
          .in('dealership_id', dealershipIds)
          .order('created_at', { ascending: false }),
      ]);

      const dealerships = dealershipsRes.data ?? [];
      const assessments = assessmentsRes.data ?? [];

      setAllAssessments(
        assessments.map(a => ({
          id: a.id,
          dealership_id: a.dealership_id,
          overall_score: a.overall_score ? Number(a.overall_score) : null,
          created_at: a.created_at,
          status: a.status,
        }))
      );

      const assessmentIds = assessments.map(a => a.id);
      const today = new Date();

      let actionData: Array<{
        id: string; action_title: string; priority: string; status: string;
        last_status_updated_at: string | null; target_completion_date: string | null;
        assessment_id: string;
      }> = [];

      if (assessmentIds.length) {
        const { data } = await supabase
          .from('improvement_actions')
          .select('id, action_title, priority, status, last_status_updated_at, target_completion_date, assessment_id')
          .in('assessment_id', assessmentIds)
          .in('status', ['Open', 'In Progress'])
          .order('target_completion_date', { ascending: true, nullsFirst: false });
        actionData = data ?? [];
      }

      // Build assessment → dealer lookup
      const assessmentToDealer = new Map<string, { id: string; name: string }>();
      assessments.forEach(a => {
        const dealer = dealerships.find(d => d.id === a.dealership_id);
        if (dealer) assessmentToDealer.set(a.id, { id: dealer.id, name: dealer.name });
      });

      // Compute per-dealer counts while building ActionItem list
      const openByDealer = new Map<string, number>();
      const overdueByDealer = new Map<string, number>();
      const now = Date.now();

      const builtActions: ActionItem[] = actionData.map(ia => {
        const dealer = assessmentToDealer.get(ia.assessment_id);
        const dealerId = dealer?.id ?? '';
        const dealerName = dealer?.name ?? 'Unknown';

        openByDealer.set(dealerId, (openByDealer.get(dealerId) ?? 0) + 1);
        if (ia.target_completion_date && new Date(ia.target_completion_date) < today) {
          overdueByDealer.set(dealerId, (overdueByDealer.get(dealerId) ?? 0) + 1);
        }

        const lastMs = ia.last_status_updated_at
          ? new Date(ia.last_status_updated_at).getTime()
          : now - 8 * 86400000;
        const daysStale = Math.max(1, Math.floor((now - lastMs) / 86400000));

        return {
          id: ia.id,
          action_title: ia.action_title,
          priority: ia.priority,
          status: ia.status,
          last_status_updated_at: ia.last_status_updated_at,
          target_completion_date: ia.target_completion_date,
          dealerName,
          dealershipId: dealerId,
          assessmentId: ia.assessment_id,
          daysStale,
        };
      });

      setAllActions(builtActions);

      // Build dealer list with top-2 assessments per dealer
      const dealerAssessments = new Map<string, AssessmentRecord[]>();
      assessments.forEach(a => {
        const list = dealerAssessments.get(a.dealership_id) ?? [];
        list.push({
          id: a.id,
          dealership_id: a.dealership_id,
          overall_score: a.overall_score ? Number(a.overall_score) : null,
          created_at: a.created_at,
          status: a.status,
        });
        dealerAssessments.set(a.dealership_id, list);
      });

      const dealerList: AssignedDealer[] = dealerships.map(d => {
        const records = dealerAssessments.get(d.id) ?? [];
        const latest = records[0];
        const previous = records[1];
        return {
          dealershipId: d.id,
          dealerName: d.name,
          location: d.location,
          brand: d.brand,
          latestScore: latest?.overall_score ?? null,
          previousScore: previous?.overall_score ?? null,
          latestDate: latest?.created_at ?? null,
          latestStatus: latest?.status ?? null,
          latestAssessmentId: latest?.id ?? null,
          openCount: openByDealer.get(d.id) ?? 0,
          overdueCount: overdueByDealer.get(d.id) ?? 0,
        };
      });

      setDealers(dealerList);
      await fetchNotes(0);
      setLoading(false);
    };
    fetchAssignments();
  }, [user?.id]);

  const filteredDealers = useMemo(() => {
    let result = [...dealers];
    if (statusFilter === 'completed') result = result.filter(d => d.latestStatus === 'completed');
    else if (statusFilter === 'in_progress') result = result.filter(d => d.latestStatus === 'in_progress');
    if (sortBy === 'score') result.sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
    else if (sortBy === 'name') result.sort((a, b) => a.dealerName.localeCompare(b.dealerName));
    else result.sort((a, b) => b.overdueCount - a.overdueCount);
    return result;
  }, [dealers, sortBy, statusFilter]);

  const chartData = useMemo(() => {
    if (selectedDealerIds.length === 0) return [];
    const selectedDealers = dealers.filter(d => selectedDealerIds.includes(d.dealershipId));
    const assessmentsByDealer = new Map<string, AssessmentRecord[]>();

    for (const id of selectedDealerIds) {
      assessmentsByDealer.set(
        id,
        allAssessments
          .filter(a => a.dealership_id === id && a.overall_score != null)
          .slice(0, 12)
          .reverse()
      );
    }

    // Merge all dates
    const allDates = new Set<string>();
    assessmentsByDealer.forEach(records => records.forEach(r => allDates.add(r.created_at.split('T')[0])));
    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map(date => {
      const point: Record<string, string | number | null> = { date: format(new Date(date), 'dd MMM yy') };
      for (const id of selectedDealerIds) {
        const dealer = selectedDealers.find(d => d.dealershipId === id);
        const record = assessmentsByDealer.get(id)?.find(r => r.created_at.startsWith(date));
        point[dealer?.dealerName ?? id] = record?.overall_score ?? null;
      }
      return point;
    });
  }, [selectedDealerIds, allAssessments, dealers]);

  const toggleDealerSelection = (id: string) => {
    setSelectedDealerIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  if (roleLoading) return <SharedLoadingState />;
  if (actorType !== 'coach') return <Navigate to="/app/dashboard" replace />;
  if (loading) return <SharedLoadingState />;

  if (dealers.length === 0) {
    return (
      <div className="p-6">
        <SharedEmptyState title={t('coach.noAssignments')} description={t('coach.noAssignments')} />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Dark stats bar — matches Sprint 3 dealer dashboard */}
      <div className="h-9 bg-[#0b1f3a] flex items-center px-6 sticky top-0 z-10">
        {(() => {
          const s = computeStatsBar(dealers);
          const chips = [
            { label: 'Dealers',          value: String(s.total) },
            { label: 'Avg Score',        value: s.avgScore > 0 ? String(s.avgScore) : '—' },
            { label: 'Overdue Actions',  value: String(s.overdueCount) },
            { label: 'Attention Needed', value: String(s.attentionNeeded) },
          ];
          return chips.map((chip, i) => (
            <div
              key={chip.label}
              className={`flex items-center gap-2 px-4 h-full ${i < chips.length - 1 ? 'border-r border-white/[0.08]' : ''}`}
            >
              <span className="text-[11px] text-white/50 uppercase tracking-wider">{chip.label}</span>
              <span className="text-[11px] font-semibold text-white">{chip.value}</span>
            </div>
          ));
        })()}
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('coach.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {dealers.length} {dealers.length === 1 ? 'dealership' : 'dealerships'} assigned
        </p>
      </div>

      {/* EXISTING SECTIONS — dealer cards, stale actions, trend chart — keep as-is below this comment */}

      {/* Sort + filter controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          {(['score', 'name', 'overdue'] as const).map(s => (
            <Button
              key={s}
              variant={sortBy === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(s)}
            >
              {s === 'score' ? 'Score' : s === 'name' ? 'Name' : 'Overdue'}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'completed' | 'in_progress')}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('coach.filterAll')}</SelectItem>
              <SelectItem value="completed">{t('coach.filterCompleted')}</SelectItem>
              <SelectItem value="in_progress">{t('coach.filterInProgress')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dealer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.map((dealer, i) => {
          const trend = computeTrend(dealer.latestScore, dealer.previousScore);
          const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;
          const since = daysSince(dealer.latestDate);
          const hasNotes = notes.some(n => n.dealership_id === dealer.dealershipId);

          return (
            <Card
              key={dealer.dealershipId}
              className="opacity-0 animate-fade-in shadow-card rounded-xl"
              style={{ animationDelay: `${Math.min(i, 4) * 50}ms`, animationFillMode: 'forwards' }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold leading-tight">{dealer.dealerName}</CardTitle>
                  <Badge variant="outline" className="bg-[hsl(var(--neutral-100))] text-[hsl(var(--neutral-700))] border-[hsl(var(--neutral-300))] text-xs shrink-0 ml-2">
                    {dealer.brand}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dealer.location}
                  {since != null && <span className="ml-1 text-[hsl(var(--neutral-400))]">· {since}d ago</span>}
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Score + trend */}
                <div className="flex items-center justify-between">
                  {band ? (
                    <div className={`inline-flex flex-col items-center rounded-lg border px-3 py-2 ${band.className}`}>
                      <span className="text-2xl font-bold leading-none">{Math.round(dealer.latestScore!)}</span>
                      <span className="mt-1 text-xs">{band.label}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No assessment yet</span>
                  )}
                  {trend.direction !== 'none' && (
                    <div className="flex items-center gap-1">
                      {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-[#16a34a]" />}
                      {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-[#dc2626]" />}
                      {trend.direction === 'flat' && <Minus className="w-4 h-4 text-muted-foreground" />}
                      <span className={`text-xs font-medium ${
                        trend.direction === 'up' ? 'text-[#16a34a]'
                        : trend.direction === 'down' ? 'text-[#dc2626]'
                        : 'text-muted-foreground'
                      }`}>
                        {trend.delta != null && trend.delta !== 0 ? `${trend.delta > 0 ? '+' : ''}${trend.delta}` : '—'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action counts */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Open: <span className="font-medium text-foreground">{dealer.openCount}</span>
                  </span>
                  {dealer.overdueCount > 0 && (
                    <Badge variant="outline" className="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 text-xs">
                      {dealer.overdueCount} overdue
                    </Badge>
                  )}
                </div>

                {/* Bottom: note icon + CTA */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-7 w-7 p-0"
                    onClick={() => { setNoteSheetDealer(dealer); setNoteSheetOpen(true); }}
                    aria-label="Add note"
                  >
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                    {hasNotes && (
                      <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                    )}
                  </Button>
                  {dealer.latestAssessmentId ? (
                    <Button variant="outline" size="sm" className="h-7 text-xs"
                      onClick={() => navigate(`/app/results/${dealer.latestAssessmentId}`)}>
                      View Results →
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs"
                      onClick={() => navigate('/app/assessment')}>
                      Start Assessment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Note sheet — rendered once, driven by noteSheetDealer state */}
      <CoachNoteSheet
        open={noteSheetOpen}
        onOpenChange={setNoteSheetOpen}
        dealershipId={noteSheetDealer?.dealershipId ?? null}
        dealerName={noteSheetDealer?.dealerName ?? ''}
        onNoteAdded={() => fetchNotes(0)}
      />

      {/* Score Trend Chart */}
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUpIcon className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            {t('coach.scoreTrend')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{t('coach.selectDealers')}</p>
        </CardHeader>
        <CardContent>
          {/* Dealer selector */}
          <div className="flex flex-wrap gap-3 mb-4">
            {dealers.map((d, i) => (
              <label
                key={d.dealershipId}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selectedDealerIds.includes(d.dealershipId)}
                  onCheckedChange={() => toggleDealerSelection(d.dealershipId)}
                  disabled={!selectedDealerIds.includes(d.dealershipId) && selectedDealerIds.length >= 3}
                />
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    selectedDealerIds.includes(d.dealershipId) ? 'ring-1 ring-offset-1 ring-white' : ''
                  }`}
                  style={{ backgroundColor: CHART_COLORS[selectedDealerIds.indexOf(d.dealershipId)] ?? '#9ca3af' }}
                />
                {d.dealerName}
              </label>
            ))}
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend />
                {selectedDealerIds.map((id, i) => {
                  const dealer = dealers.find(d => d.dealershipId === id);
                  return (
                    <Line
                      key={id}
                      type="monotone"
                      dataKey={dealer?.dealerName ?? id}
                      stroke={CHART_COLORS[i]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <LineChartIcon className="h-8 w-8 text-[hsl(var(--neutral-300))]" />
              <p className="text-sm text-[hsl(var(--neutral-500))]">
                Select up to 3 dealers above to compare their score trends
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stale Actions */}
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-h5">
            <Clock className="h-4 w-4 text-warning-foreground" />
            Stale Actions
            {staleActions.length > 0 && (
              <Badge variant="outline" className="ml-1 text-caption bg-warning/10 text-warning-foreground border-warning/20">
                {staleActions.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {staleActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Clock className="h-7 w-7 text-muted-foreground/30" />
              <p className="text-body-sm text-muted-foreground">No stale actions — all items updated within 7 days</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-2 bg-muted/50">
                <span className="text-caption uppercase tracking-wider text-muted-foreground">Action</span>
                <span className="text-caption uppercase tracking-wider text-muted-foreground w-32 text-left">Dealership</span>
                <span className="text-caption uppercase tracking-wider text-muted-foreground w-20 text-right">Days stale</span>
                <span className="text-caption uppercase tracking-wider text-muted-foreground w-20 text-right">Priority</span>
              </div>
              {staleActions.map(action => {
                const priorityClass =
                  action.priority === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  action.priority === 'high'     ? 'bg-warning/10 text-warning-foreground border-warning/20' :
                  action.priority === 'medium'   ? 'bg-info/10 text-info border-info/20' :
                                                   'bg-muted text-muted-foreground border-border';
                const daysClass =
                  action.daysStale >= 21 ? 'text-destructive font-semibold' :
                  action.daysStale >= 14 ? 'text-warning-foreground font-medium' :
                                           'text-muted-foreground';
                return (
                  <div
                    key={action.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-foreground truncate">{action.action_title}</p>
                      <p className="text-caption text-muted-foreground mt-0.5">{action.status}</p>
                    </div>
                    <span className="text-body-sm text-muted-foreground w-32 self-center truncate">{action.dealerName}</span>
                    <span className={`text-body-sm w-20 text-right self-center numeric ${daysClass}`}>
                      {action.daysStale}d
                    </span>
                    <div className="w-20 flex justify-end self-center">
                      <Badge variant="outline" className={`text-caption capitalize ${priorityClass}`}>
                        {action.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
