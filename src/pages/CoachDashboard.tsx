import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, StickyNote, Calendar, CalendarDays, Database, BookOpen, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { computeStatsBar, computeTrend, daysSince, getScoreBand, isOverdue } from '@/lib/coachDashboardUtils';
import { CoachNoteSheet } from '@/components/coach/CoachNoteSheet';
import { VisitSheet } from '@/components/coach/VisitSheet';
import { VisitLogSheet } from '@/components/coach/VisitLogSheet';
import { VisitBriefingSheet } from '@/components/coach/VisitBriefingSheet';
import { type CoachVisit } from '@/lib/coachVisitUtils';
import { KPI_DEFINITIONS } from '@/lib/kpiDefinitions';
import { ACTION_TEMPLATES } from '@/data/actionTemplates';
import { generateVisitReport, type VisitReportData } from '@/lib/pdfReportGenerator';
import { STATIC_BENCHMARKS } from '@/lib/benchmarkUtils';

const BRAND_MAP: Record<string, { accent: string; domain: string | null }> = {
  bmw:             { accent: '#1C69D4', domain: 'bmw.com' },
  mercedes:        { accent: '#2D3035', domain: 'mercedes-benz.com' },
  'mercedes-benz': { accent: '#2D3035', domain: 'mercedes-benz.com' },
  audi:            { accent: '#BB0A21', domain: 'audi.com' },
  volkswagen:      { accent: '#003399', domain: 'vw.com' },
  vw:              { accent: '#003399', domain: 'vw.com' },
  toyota:          { accent: '#EB0A1E', domain: 'toyota.com' },
  ford:            { accent: '#003087', domain: 'ford.com' },
};

function getBrandStyle(brand: string): { accent: string; domain: string | null } {
  const key = (brand ?? '').toLowerCase().trim();
  return BRAND_MAP[key] ?? { accent: 'hsl(var(--brand-500))', domain: null };
}

function BrandLogo({ brand, size = 24 }: { brand: string; size?: number }) {
  const { accent, domain } = getBrandStyle(brand);
  const initials = (brand || 'XX').slice(0, 2).toUpperCase();
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return (
      <div
        className="rounded-sm flex items-center justify-center text-[9px] font-bold shrink-0"
        style={{
          width: size, height: size,
          backgroundColor: accent + '26',
          color: accent,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      width={size} height={size}
      className="rounded-sm object-contain shrink-0"
      onError={() => setFailed(true)}
      alt={brand}
    />
  );
}

function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

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
  networks: { id: string; name: string; brand: string }[];
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
  note_type: 'observation' | 'action' | 'follow-up' | null;
}


function ResourceKpiPanel() {
  const [search, setSearch] = useState('');
  const entries = Object.entries(KPI_DEFINITIONS);
  const filtered = search.trim()
    ? entries.filter(([key, val]) =>
        key.toLowerCase().includes(search.toLowerCase()) ||
        val.en.title.toLowerCase().includes(search.toLowerCase()) ||
        (val.en.definition ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-[hsl(var(--brand-500))]" />
          KPI Reference
        </CardTitle>
        <input
          className="mt-2 h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
          placeholder="Search KPIs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent className="p-0 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground text-center">No KPIs match &quot;{search}&quot;</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.slice(0, 50).map(([key, val]) => (
              <div key={key} className="px-5 py-3 space-y-0.5">
                <p className="text-sm font-medium">{val.en.title}</p>
                {val.en.definition && <p className="text-xs text-muted-foreground">{val.en.definition}</p>}
                {val.en.benchmark && (
                  <p className="text-xs text-[hsl(var(--brand-500))]">
                    Benchmark: {val.en.benchmark}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DEPT_LABELS: Record<string, string> = {
  NVS: 'New Vehicle Sales', UVS: 'Used Vehicle Sales',
  SVC: 'Service', PTS: 'Parts', FIN: 'Financial Operations',
};

const DEPT_KPI_PREFIX: Record<string, string> = {
  NVS: 'new-vehicle-sales',
  UVS: 'used-vehicle-sales',
  SVC: 'service',
  PTS: 'parts',
  FIN: 'financial',
};

function ResourcePlaybookPanel() {
  const [dept, setDept] = useState<string>('all');
  const templates = ACTION_TEMPLATES ?? [];
  const filtered = dept === 'all'
    ? templates
    : templates.filter(t =>
        t.linkedKPIs?.some(kpiKey => {
          const kpiDef = KPI_DEFINITIONS[kpiKey];
          return kpiDef?.en?.department?.includes(DEPT_KPI_PREFIX[dept] ?? dept.toLowerCase());
        })
      );

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Action Playbooks
          </CardTitle>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.entries(DEPT_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[480px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground text-center">No templates for this department</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t, i) => (
              <div key={t.templateId ?? i} className="px-5 py-3 space-y-1">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                {t.implementationSteps?.length > 0 && (
                  <ol className="mt-1 space-y-0.5 pl-4 list-decimal">
                    {t.implementationSteps.slice(0, 4).map((step, si) => (
                      <li key={si} className="text-xs text-muted-foreground">{step.text}</li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const [dashboardView, setDashboardView] = useState<'dashboard' | 'resources'>('dashboard');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'overdue'>('score');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [activeTab, setActiveTab] = useState<'overdue' | 'stale' | 'all'>('overdue');
  const [actionDealerFilter, setActionDealerFilter] = useState<string>('all');
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteSheetDealer, setNoteSheetDealer] = useState<AssignedDealer | null>(null);
  const [visitSheetOpen, setVisitSheetOpen] = useState(false);
  const [visitSheetDealer, setVisitSheetDealer] = useState<AssignedDealer | null>(null);
  const [activeVisitsByDealer, setActiveVisitsByDealer] = useState<Map<string, string>>(new Map());
  const [activeNetworkId, setActiveNetworkId] = useState<string>('all');
  const [lastCompletedVisit, setLastCompletedVisit] = useState<{ date: string; dealerName: string } | null>(null);
  const [visitHistoryDealerId, setVisitHistoryDealerId] = useState<string | null>(null);
  const [visitLogSheetOpen, setVisitLogSheetOpen] = useState(false);
  const [briefingDealerId, setBriefingDealerId] = useState<string | null>(null);
  const [briefingSheetOpen, setBriefingSheetOpen] = useState(false);
  const [selectedVisitForLog, setSelectedVisitForLog] = useState<CoachVisit | null>(null);
  const [dealerVisits, setDealerVisits] = useState<Record<string, CoachVisit[]>>({});
  const [visitHistoryLoading, setVisitHistoryLoading] = useState(false);

  const networkTabs = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; brand: string }>();
    dealers.forEach(d => d.networks.forEach(n => seen.set(n.id, n)));
    return Array.from(seen.values());
  }, [dealers]);

  const fetchDealerVisits = async (dealershipId: string) => {
    if (!user?.id) return;
    setVisitHistoryLoading(true);
    const { data } = await supabase
      .from('coach_visits')
      .select('*')
      .eq('coach_user_id', user.id)
      .eq('dealership_id', dealershipId)
      .order('visit_date', { ascending: false });
    setDealerVisits(prev => ({
      ...prev,
      [dealershipId]: (data ?? []) as CoachVisit[],
    }));
    setVisitHistoryLoading(false);
  };

  const downloadVisitReport = async (visit: CoachVisit, dealer: AssignedDealer) => {
    try {
      // Fetch latest assessment scores for this dealership
      const { data: assessments } = await supabase
        .from('assessments')
        .select('scores')
        .eq('dealership_id', dealer.dealershipId)
        .order('created_at', { ascending: false })
        .limit(1);
      const scores = (assessments?.[0] as any)?.scores ?? {};

      // Fetch agreed actions by IDs (if any)
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

      // Fetch OEM network memberships for these dealerships
      const { data: networkMemberships } = await supabase
        .from('dealer_network_memberships')
        .select('dealership_id, oem_networks(id, name, oem_brand)')
        .in('dealership_id', dealershipIds)
        .eq('is_active', true);

      const dealerNetworkMap = new Map<string, { id: string; name: string; brand: string }[]>();
      (networkMemberships ?? []).forEach((m: any) => {
        const net = m.oem_networks;
        if (!net) return;
        const existing = dealerNetworkMap.get(m.dealership_id) ?? [];
        dealerNetworkMap.set(m.dealership_id, [
          ...existing,
          { id: net.id, name: net.name, brand: net.oem_brand ?? '' },
        ]);
      });

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

      // Scope actions to latest completed assessment per dealer only
      const latestCompletedByDealer = new Map<string, string>();
      const tempByDealer = new Map<string, typeof assessments>();
      assessments.forEach(a => {
        const list = tempByDealer.get(a.dealership_id) ?? [];
        list.push(a);
        tempByDealer.set(a.dealership_id, list);
      });
      tempByDealer.forEach((records, dealerId) => {
        const completed = records.filter(r => r.status === 'completed');
        if (completed[0]) latestCompletedByDealer.set(dealerId, completed[0].id);
      });
      const latestAssessmentIds = Array.from(latestCompletedByDealer.values());

      let actionData: Array<{
        id: string; action_title: string; priority: string; status: string;
        last_status_updated_at: string | null; target_completion_date: string | null;
        assessment_id: string;
      }> = [];

      if (latestAssessmentIds.length) {
        const { data } = await supabase
          .from('improvement_actions')
          .select('id, action_title, priority, status, last_status_updated_at, target_completion_date, assessment_id')
          .in('assessment_id', latestAssessmentIds)
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
        // Use only completed assessments for score display and results link
        const completed = records.filter(r => r.status === 'completed');
        const latest = completed[0];
        const previous = completed[1];
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
          networks: dealerNetworkMap.get(d.id) ?? [],
        };
      });

      setDealers(dealerList);
      // Pre-fetch visits for badge display (counter_proposed / declined)
      dealerList.forEach(d => fetchDealerVisits(d.dealershipId));
      await fetchNotes(0);

      // Fetch active visits for dealer cards
      const { data: visitData } = await supabase
        .from('coach_visits')
        .select('dealership_id, visit_date, status')
        .eq('coach_user_id', user!.id)
        .in('dealership_id', dealershipIds)
        .in('status', ['proposed', 'confirmed'])
        .order('visit_date', { ascending: true });
      const visitMap = new Map<string, string>();
      (visitData ?? []).forEach((v: any) => {
        visitMap.set(v.dealership_id, `${format(new Date(v.visit_date), 'dd MMM')} · ${v.status}`);
      });
      setActiveVisitsByDealer(visitMap);

      // Fetch most recent completed visit for timeline strip
      const { data: completedVisits } = await supabase
        .from('coach_visits')
        .select('dealership_id, visit_date')
        .eq('coach_user_id', user!.id)
        .in('dealership_id', dealershipIds)
        .eq('status', 'completed')
        .order('visit_date', { ascending: false })
        .limit(1);

      if (completedVisits?.length) {
        const cv = completedVisits[0] as { dealership_id: string; visit_date: string };
        const dealerName = dealerships.find(d => d.id === cv.dealership_id)?.name ?? 'Unknown';
        setLastCompletedVisit({ date: cv.visit_date, dealerName });
      } else {
        setLastCompletedVisit(null);
      }

      setLoading(false);
    };
    fetchAssignments();
  }, [user?.id]);

  const filteredDealers = useMemo(() => {
    let result = [...dealers];
    if (activeNetworkId !== 'all') {
      result = result.filter(d => d.networks.some(n => n.id === activeNetworkId));
    }
    if (statusFilter === 'completed') result = result.filter(d => d.latestStatus === 'completed');
    else if (statusFilter === 'in_progress') result = result.filter(d => d.latestStatus === 'in_progress');
    if (sortBy === 'score') result.sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
    else if (sortBy === 'name') result.sort((a, b) => a.dealerName.localeCompare(b.dealerName));
    else result.sort((a, b) => b.overdueCount - a.overdueCount);
    return result;
  }, [dealers, activeNetworkId, sortBy, statusFilter]);

  const overdueActions = useMemo(() => {
    const base = actionDealerFilter === 'all' ? allActions : allActions.filter(a => a.dealershipId === actionDealerFilter);
    return base.filter(a => isOverdue(a.target_completion_date));
  }, [allActions, actionDealerFilter]);

  const staleActions = useMemo(() => {
    const base = actionDealerFilter === 'all' ? allActions : allActions.filter(a => a.dealershipId === actionDealerFilter);
    return base.filter(a => a.daysStale >= 7);
  }, [allActions, actionDealerFilter]);

  const allOpenActions = useMemo(() => {
    if (actionDealerFilter === 'all') return allActions;
    return allActions.filter(a => a.dealershipId === actionDealerFilter);
  }, [allActions, actionDealerFilter]);

  // Derive next upcoming visit (first entry in activeVisitsByDealer)
  const nextVisit: { dateLabel: string; dealerName: string; status: string } | null = (() => {
    let earliest: { dateLabel: string; dealerName: string; status: string } | null = null;
    activeVisitsByDealer.forEach((label, dealershipId) => {
      if (earliest) return;
      const dealer = dealers.find(d => d.dealershipId === dealershipId);
      const parts = label.split(' · ');
      earliest = {
        dateLabel: parts[0] ?? label,
        dealerName: dealer?.dealerName ?? 'Unknown',
        status: parts[1] ?? 'proposed',
      };
    });
    return earliest;
  })();

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
            { label: 'Dealers',         value: String(s.total) },
            { label: 'Avg Score',       value: s.avgScore > 0 ? String(s.avgScore) : '—' },
            { label: 'Overdue Actions', value: String(s.overdueCount) },
            { label: 'Critical Gaps',   value: String(dealers.filter(d => (d.latestScore ?? 101) < 46).length) },
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

      <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
            COACHING PERSPECTIVE · {getQuarterLabel()}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Field Performance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active monitoring for {dealers.length} assigned {dealers.length === 1 ? 'dealership' : 'dealerships'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 mt-1"
          onClick={() => console.log('Export Report — wired in future sprint')}
        >
          <span className="mr-1.5">↓</span> Export Report
        </Button>
      </div>

      {/* Dark hero card */}
      {(() => {
        const s = computeStatsBar(dealers);
        const avgScore = s.avgScore > 0 ? s.avgScore : null;
        const belowBenchmark = dealers.filter(d => (d.latestScore ?? 101) < 70).length;
        const focusDealer = [...dealers]
          .filter(d => d.latestScore != null)
          .sort((a, b) => (a.latestScore ?? 0) - (b.latestScore ?? 0))[0] ?? null;

        const narrative = avgScore == null
          ? 'No assessments completed yet across the portfolio.'
          : avgScore >= 85
          ? 'Portfolio performing above benchmark across all departments.'
          : avgScore >= 70
          ? `Most dealers performing well — ${belowBenchmark} below benchmark threshold.`
          : avgScore >= 46
          ? `${belowBenchmark} dealers require active intervention this quarter.`
          : `${dealers.filter(d => (d.latestScore ?? 101) < 46).length} dealers at foundational level — priority coaching required.`;

        const topOverdue = overdueActions.slice(0, 2);

        return (
          <div className="rounded-xl bg-[#0b1f3a] text-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Col 1: Portfolio Score */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-white/50">Overall Portfolio Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold leading-none">
                  {avgScore != null ? avgScore : '—'}
                </span>
                {avgScore != null && <span className="text-lg text-white/50">/ 100</span>}
              </div>
              {avgScore != null && (
                <div className="w-full h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-[#2563eb] transition-all"
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
              )}
              {avgScore != null && (() => {
                const band = getScoreBand(avgScore);
                return (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${band.className}`}>
                    ● {band.label}
                  </span>
                );
              })()}
              <p className="text-xs text-white/60 italic mt-2">"{narrative}"</p>
            </div>

            {/* Col 2: Active Actions */}
            <div className="space-y-3 md:border-l md:border-white/10 md:pl-6">
              <p className="text-[10px] uppercase tracking-widest text-white/50">Open Actions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold leading-none">{allActions.length}</span>
              </div>
              <p className="text-xs text-white/50">items requiring attention</p>
              <div className="space-y-1.5 mt-2">
                {topOverdue.length === 0 ? (
                  <p className="text-xs text-[#16a34a] font-medium">All actions on track ✓</p>
                ) : topOverdue.map(a => (
                  <p key={a.id} className="text-xs text-white/70 truncate">
                    <span className="text-white/40">•</span>{' '}
                    <span className="font-medium text-white">{a.dealerName}:</span>{' '}
                    {a.action_title}
                    {a.target_completion_date && (
                      <span className="text-[#dc2626] ml-1">
                        — due {format(new Date(a.target_completion_date), 'dd MMM')}
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* Col 3: Focus Dealer */}
            <div className="space-y-3 md:border-l md:border-white/10 md:pl-6">
              <p className="text-[10px] uppercase tracking-widest text-white/50">Focus Dealer</p>
              {focusDealer ? (
                <>
                  <p className="text-lg font-semibold leading-tight">{focusDealer.dealerName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{Math.round(focusDealer.latestScore!)}</span>
                    {(() => {
                      const band = getScoreBand(focusDealer.latestScore!);
                      return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${band.className}`}>{band.label}</span>;
                    })()}
                  </div>
                  <p className="text-xs text-white/50">{focusDealer.location}</p>
                  <p className="text-xs font-medium mt-1">
                    {(focusDealer.latestScore ?? 101) < 46
                      ? <span className="text-[#dc2626]">Needs immediate attention</span>
                      : <span className="text-[#d97706]">Monitor closely</span>
                    }
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">No assessments yet</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Timeline strip */}
      {(() => {
        const assessmentsDue = dealers.filter(d =>
          d.latestDate == null || (daysSince(d.latestDate) ?? 0) > 90
        ).length;

        const chips = [
          {
            label: 'Last Visit',
            value: lastCompletedVisit
              ? format(new Date(lastCompletedVisit.date), 'dd MMM yyyy')
              : 'Not scheduled',
            sub: lastCompletedVisit?.dealerName ?? 'No visits recorded',
            status: lastCompletedVisit ? 'completed' : 'none',
          },
          {
            label: 'Next Visit',
            value: nextVisit ? nextVisit.dateLabel : 'Not scheduled',
            sub: nextVisit ? nextVisit.dealerName : 'Contact dealer',
            status: nextVisit
              ? nextVisit.status.toLowerCase().includes('confirmed') ? 'confirmed' : 'proposed'
              : 'none',
          },
          {
            label: 'Assessments Due',
            value: assessmentsDue > 0 ? String(assessmentsDue) : 'All current',
            sub: assessmentsDue > 0 ? 'dealers need assessment' : '✓ Up to date',
            status: assessmentsDue > 0 ? 'attention' : 'ok',
          },
          {
            label: 'Overdue Actions',
            value: overdueActions.length > 0 ? String(overdueActions.length) : 'On track',
            sub: overdueActions.some(a => a.priority === 'critical') ? 'incl. critical items' : 'actions past due date',
            status: overdueActions.length > 0 ? 'critical' : 'ok',
          },
          {
            label: 'Action Plan Review',
            value: `30 Jun ${new Date().getFullYear()}`,
            sub: 'End of quarter · all depts',
            status: 'upcoming',
          },
        ];

        const statusDot: Record<string, string> = {
          completed: 'bg-[#16a34a]',
          confirmed:  'bg-[#16a34a]',
          proposed:   'bg-[#d97706]',
          attention:  'bg-[#d97706]',
          critical:   'bg-[#dc2626]',
          ok:         'bg-[#16a34a]',
          upcoming:   'bg-[#2563eb]',
          none:       'bg-muted-foreground',
        };

        const statusLabel: Record<string, string> = {
          completed: '● Completed',
          confirmed:  '● Confirmed',
          proposed:   '● Proposed',
          attention:  '● Attention',
          critical:   '● Critical',
          ok:         '✓ On track',
          upcoming:   '○ Upcoming',
          none:       '○ Not scheduled',
        };

        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {chips.map((chip, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-3 space-y-1"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{chip.label}</p>
                <p className="text-sm font-semibold text-foreground">{chip.value}</p>
                <p className="text-[11px] text-muted-foreground">{chip.sub}</p>
                <div className="flex items-center gap-1 pt-0.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot[chip.status]}`} />
                  <span className="text-[10px] text-muted-foreground">{statusLabel[chip.status]}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* View tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['dashboard', 'resources'] as const).map(view => (
          <button
            key={view}
            onClick={() => setDashboardView(view)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              dashboardView === view
                ? 'border-[hsl(var(--brand-500))] text-foreground -mb-px'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {view === 'dashboard' ? 'Overview' : 'Resources'}
          </button>
        ))}
      </div>

      {dashboardView === 'dashboard' && (
      <div className="space-y-6">

      {/* Network tab strip */}
      {networkTabs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveNetworkId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeNetworkId === 'all'
                ? 'bg-[hsl(var(--brand-500))] text-white border-[hsl(var(--brand-500))]'
                : 'bg-transparent text-muted-foreground border-border hover:border-[hsl(var(--brand-400))]'
            }`}
          >
            All Networks
          </button>
          {networkTabs.map(n => (
            <button
              key={n.id}
              onClick={() => setActiveNetworkId(n.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeNetworkId === n.id
                  ? 'bg-[hsl(var(--brand-500))] text-white border-[hsl(var(--brand-500))]'
                  : 'bg-transparent text-muted-foreground border-border hover:border-[hsl(var(--brand-400))]'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>
      )}

      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={sortBy} onValueChange={v => setSortBy(v as 'score' | 'name' | 'overdue')}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Sort: Score</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="overdue">Sort: Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'completed' | 'in_progress')}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dealers</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              filteredDealers.map(d => d.location).filter(Boolean).join(' OR ')
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[hsl(var(--brand-500))] hover:underline font-medium"
          >
            View Map →
          </a>
        </div>
      </div>

      {/* Dealer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.map((dealer, i) => {
          const { accent } = getBrandStyle(dealer.brand);
          const trend = computeTrend(dealer.latestScore, dealer.previousScore);
          const since = daysSince(dealer.latestDate);
          const hasNotes = notes.some(n => n.dealership_id === dealer.dealershipId);
          const visitLabel = activeVisitsByDealer.get(dealer.dealershipId);
          const visitParts = visitLabel ? visitLabel.split(' · ') : null;
          const visitConfirmed = visitParts?.[1]?.toLowerCase() === 'confirmed';

          const activeVisit = (dealerVisits[dealer.dealershipId] ?? [])
            .find(v => ['proposed', 'confirmed', 'counter_proposed', 'cancelled'].includes(v.status as string));
          const isCounterProposed = (activeVisit as any)?.status === 'counter_proposed';
          const isDeclined = activeVisit?.status === 'cancelled' && (activeVisit as any)?.declined_by === 'dealer';

          const openMinusOverdue = Math.max(0, dealer.openCount - dealer.overdueCount);
          const progressPct = dealer.openCount > 0
            ? (openMinusOverdue / dealer.openCount) * 100
            : 100;

          return (
            <Card
              key={dealer.dealershipId}
              className="opacity-0 animate-fade-in shadow-card rounded-xl overflow-hidden"
              style={{
                animationDelay: `${Math.min(i, 4) * 50}ms`,
                animationFillMode: 'forwards',
                borderTop: `3px solid ${accent}`,
              }}
            >
              <CardContent className="p-4 space-y-3">
                {/* Brand row */}
                <div className="flex items-center justify-between gap-2">
                  <BrandLogo brand={dealer.brand} size={28} />
                  {dealer.latestScore != null && (() => {
                    const band = getScoreBand(dealer.latestScore);
                    return (
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${band.className}`}>
                        {band.label}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Dealer name + location */}
                <div>
                  <p className="text-sm font-semibold leading-tight text-foreground">{dealer.dealerName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {dealer.location}
                    {since != null && <span className="text-[hsl(var(--neutral-400))] ml-1">· {since}d ago</span>}
                  </p>
                </div>

                <div className="border-t border-border/50 pt-3 flex items-start gap-4">
                  {/* Score gauge */}
                  <div className="shrink-0">
                    {dealer.latestScore != null ? (
                      <ScoreGauge score={dealer.latestScore} size={88} />
                    ) : (
                      <div className="w-[88px] h-[88px] flex items-center justify-center text-[10px] text-muted-foreground text-center leading-tight">
                        No score yet
                      </div>
                    )}
                  </div>

                  {/* Action plan */}
                  <div className="flex-1 space-y-1.5 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Action Plan</p>
                    <div className="w-full h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-[hsl(var(--brand-500))] transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-foreground font-medium">
                      {dealer.openCount > 0
                        ? `${openMinusOverdue} / ${dealer.openCount} on track`
                        : 'No open actions'
                      }
                    </p>
                    {dealer.overdueCount > 0 && (
                      <p className="text-[11px] text-[#dc2626] font-medium">{dealer.overdueCount} overdue</p>
                    )}
                    {/* Trend */}
                    {trend.direction !== 'none' && (
                      <div className="flex items-center gap-1 pt-0.5">
                        {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-[#16a34a]" />}
                        {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-[#dc2626]" />}
                        {trend.direction === 'flat' && <Minus className="w-3 h-3 text-muted-foreground" />}
                        <span className={`text-[11px] font-medium ${
                          trend.direction === 'up' ? 'text-[#16a34a]' :
                          trend.direction === 'down' ? 'text-[#dc2626]' :
                          'text-muted-foreground'
                        }`}>
                          {trend.delta != null && trend.delta !== 0
                            ? `${trend.delta > 0 ? '+' : ''}${trend.delta}`
                            : '—'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visit chip */}
                <div className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                  {visitParts ? (
                    <span className={visitConfirmed ? 'text-[#16a34a] font-medium' : 'text-[#d97706] font-medium'}>
                      Next visit: {visitParts[0]} · {visitParts[1]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No visit scheduled</span>
                  )}
                </div>
                {(isCounterProposed || isDeclined) && (
                  <div className="mt-1">
                    {isCounterProposed && (activeVisit as any)?.dealer_proposed_date && (
                      <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                        Dealer suggested {format(new Date((activeVisit as any).dealer_proposed_date), 'dd MMM')}
                      </span>
                    )}
                    {isDeclined && (
                      <span className="inline-flex items-center text-[10px] bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5">
                        Dealer declined visit
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom action row — single line */}
                <div className="border-t border-border/50 pt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 shrink-0">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-7 w-7 p-0"
                      onClick={() => { setVisitSheetDealer(dealer); setVisitSheetOpen(true); }}
                      aria-label="Schedule visit"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {activeVisitsByDealer.has(dealer.dealershipId) && (
                        <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 text-xs ${visitHistoryDealerId === dealer.dealershipId ? 'text-[hsl(var(--brand-500))]' : 'text-muted-foreground'}`}
                      onClick={() => {
                        if (visitHistoryDealerId === dealer.dealershipId) {
                          setVisitHistoryDealerId(null);
                        } else {
                          setVisitHistoryDealerId(dealer.dealershipId);
                          fetchDealerVisits(dealer.dealershipId);
                        }
                      }}
                      aria-label="Visit history"
                    >
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setBriefingDealerId(dealer.dealershipId);
                        setBriefingSheetOpen(true);
                      }}
                    >
                      <CalendarDays className="h-3 w-3" />
                      Briefing
                    </Button>
                  </div>
                  {dealer.latestAssessmentId ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => navigate(`/app/results/${dealer.latestAssessmentId}`)}
                    >
                      Enter Dealership →
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1" disabled>
                      No assessment yet
                    </Button>
                  )}
                </div>

                {/* Visit history panel */}
                {visitHistoryDealerId === dealer.dealershipId && (
                  <div className="mt-3 border-t border-border pt-3 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1">Visit history</p>
                    {visitHistoryLoading ? (
                      <p className="text-xs text-muted-foreground px-1">Loading…</p>
                    ) : (dealerVisits[dealer.dealershipId] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground px-1">No visits recorded.</p>
                    ) : (
                      (dealerVisits[dealer.dealershipId] ?? []).map(v => (
                        <div
                          key={v.id}
                          className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium">
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
                            {v.summary && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{v.summary}</p>
                            )}
                          </div>
                          {v.status === 'completed' && (
                            <div className="flex items-center gap-1 shrink-0">
                              {v.summary && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs shrink-0"
                                  onClick={() => downloadVisitReport(v, dealer)}
                                >
                                  ↓ Report
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs shrink-0"
                                onClick={() => {
                                  setSelectedVisitForLog(v);
                                  setVisitLogSheetOpen(true);
                                }}
                              >
                                {v.summary ? 'Edit log' : 'Log session'}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
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

      <VisitSheet
        open={visitSheetOpen}
        onOpenChange={setVisitSheetOpen}
        dealershipId={visitSheetDealer?.dealershipId ?? null}
        dealerName={visitSheetDealer?.dealerName ?? ''}
        onVisitSaved={async () => {
          const { data } = await supabase
            .from('coach_visits')
            .select('dealership_id, visit_date, status')
            .eq('coach_user_id', user!.id)
            .in('status', ['proposed', 'confirmed']);
          const map = new Map<string, string>();
          (data ?? []).forEach((v: any) => {
            map.set(v.dealership_id, `${format(new Date(v.visit_date), 'dd MMM')} · ${v.status}`);
          });
          setActiveVisitsByDealer(map);
        }}
      />

      {selectedVisitForLog && visitHistoryDealerId && (
        <VisitLogSheet
          open={visitLogSheetOpen}
          onOpenChange={setVisitLogSheetOpen}
          visit={selectedVisitForLog}
          dealershipId={visitHistoryDealerId}
          dealerName={
            dealers.find(d => d.dealershipId === visitHistoryDealerId)?.dealerName ?? ''
          }
          latestAssessmentId={dealers.find(d => d.dealershipId === visitHistoryDealerId)?.latestAssessmentId ?? null}
          onLogSaved={() => {
            setVisitLogSheetOpen(false);
            fetchDealerVisits(visitHistoryDealerId);
          }}
        />
      )}

      {briefingDealerId && (
        <VisitBriefingSheet
          open={briefingSheetOpen}
          onOpenChange={setBriefingSheetOpen}
          dealershipId={briefingDealerId}
          dealerName={dealers.find(d => d.dealershipId === briefingDealerId)?.dealerName ?? ''}
          latestAssessmentId={dealers.find(d => d.dealershipId === briefingDealerId)?.latestAssessmentId ?? null}
          latestScore={dealers.find(d => d.dealershipId === briefingDealerId)?.latestScore ?? null}
          latestDate={dealers.find(d => d.dealershipId === briefingDealerId)?.latestDate ?? null}
        />
      )}

      {/* Actions Requiring Attention */}
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">Network Actions Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'overdue' | 'stale' | 'all')}>
            {/* Tabs + dealer filter + view all on one line */}
            <div className="flex items-center px-5 py-2 border-b border-border gap-3">
              <TabsList className="h-8">
                <TabsTrigger value="overdue" className="text-xs">
                  Overdue
                  {overdueActions.length > 0 && (
                    <span className="ml-1 rounded-full bg-[#dc2626]/10 text-[#dc2626] px-1.5 text-[10px]">{overdueActions.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="stale" className="text-xs">
                  Stale
                  {staleActions.length > 0 && (
                    <span className="ml-1 rounded-full bg-[#d97706]/10 text-[#d97706] px-1.5 text-[10px]">{staleActions.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All Open ({allOpenActions.length})</TabsTrigger>
              </TabsList>
              <Select value={actionDealerFilter} onValueChange={setActionDealerFilter}>
                <SelectTrigger className="w-36 h-8 text-xs shrink-0"><SelectValue placeholder="All dealers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dealers</SelectItem>
                  {dealers.map(d => (
                    <SelectItem key={d.dealershipId} value={d.dealershipId}>{d.dealerName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                className="ml-auto text-sm text-[hsl(var(--brand-500))] hover:underline font-medium whitespace-nowrap shrink-0"
                onClick={() => navigate('/app/coach-actions')}
              >
                View all →
              </button>
            </div>

            {(['overdue', 'stale', 'all'] as const).map(tab => {
              const items = tab === 'overdue' ? overdueActions : tab === 'stale' ? staleActions : allOpenActions;
              const emptyMsg = tab === 'overdue'
                ? 'No overdue actions — all on track'
                : tab === 'stale'
                ? 'No stale actions — all updated within 7 days'
                : 'No open actions';

              return (
                <TabsContent key={tab} value={tab} className="mt-0">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <span className="text-2xl text-[#16a34a]">✓</span>
                      <p className="text-sm text-muted-foreground">{emptyMsg}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      <div className="grid grid-cols-[auto_1fr_minmax(140px,auto)_80px_80px_70px] gap-3 px-5 py-2 bg-muted/50 items-center">
                        <span />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Action</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dealership</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">
                          {tab === 'overdue' ? 'Due date' : 'Days stale'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">Status</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">Priority</span>
                      </div>
                      {items.map(action => {
                        return (
                          <div
                            key={action.id}
                            className="grid grid-cols-[auto_1fr_minmax(140px,auto)_80px_80px_70px] gap-3 px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer items-center"
                            onClick={() => navigate(`/app/results/${action.assessmentId}`)}
                          >
                            {/* Priority dot */}
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              action.priority === 'critical' ? 'bg-[#dc2626]' :
                              action.priority === 'high'     ? 'bg-[#d97706]' :
                              action.priority === 'medium'   ? 'bg-[#2563eb]' :
                                                               'bg-muted-foreground'
                            }`} />

                            {/* Action title + dealer sub */}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{action.action_title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{action.dealerName}</p>
                            </div>

                            {/* Dealership brand chip */}
                            <div className="flex items-center gap-1.5">
                              <BrandLogo brand={dealers.find(d => d.dealershipId === action.dealershipId)?.brand ?? ''} size={16} />
                              <span className="text-xs text-foreground font-medium">{action.dealerName}</span>
                            </div>

                            {/* Due date / days stale */}
                            <span className={`text-xs text-center ${
                              tab === 'overdue'
                                ? isOverdue(action.target_completion_date) ? 'text-[#dc2626] font-semibold' : 'text-muted-foreground'
                                : action.daysStale >= 14 ? 'text-[#dc2626] font-semibold' : 'text-muted-foreground'
                            }`}>
                              {tab === 'overdue'
                                ? (action.target_completion_date ? format(new Date(action.target_completion_date), 'dd MMM') : '—')
                                : `${action.daysStale}d`
                              }
                            </span>

                            {/* Status badge — derived display mapping, no DB change */}
                            {(() => {
                              const isBlocked = action.daysStale >= 21 && isOverdue(action.target_completion_date);
                              const isStalled = !isBlocked && action.daysStale >= 14 && isOverdue(action.target_completion_date);
                              const label = isBlocked ? 'BLOCKED' : isStalled ? 'STALLED' : action.status === 'In Progress' ? 'IN PROGRESS' : 'ASSIGNED';
                              const cls = isBlocked
                                ? 'bg-[#dc2626] text-white border-[#dc2626]'
                                : isStalled
                                ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'
                                : action.status === 'In Progress'
                                ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20'
                                : 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20';
                              return (
                                <Badge variant="outline" className={`text-[10px] whitespace-nowrap w-full flex justify-center ${cls}`}>
                                  {label}
                                </Badge>
                              );
                            })()}

                            {/* Priority badge */}
                            <Badge variant="outline" className={`text-[10px] capitalize w-full flex justify-center ${
                              action.priority === 'critical' ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' :
                              action.priority === 'high'     ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' :
                              action.priority === 'medium'   ? 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' :
                                                               'bg-muted text-muted-foreground border-border'
                            }`}>{action.priority}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      </div>
      )}

      {dashboardView === 'resources' && (
        <div className="space-y-6">
          <ResourceKpiPanel />
          <ResourcePlaybookPanel />
        </div>
      )}
    </div>
    </div>
  );
}
