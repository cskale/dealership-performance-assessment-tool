import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { SharedLoadingState } from '@/components/shared/SharedLoadingState';
import { SharedEmptyState } from '@/components/shared/SharedEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/shared/TierBadge';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import {
  DEPT_KEYS, DEPT_LABELS, AT_RISK_THRESHOLD,
  parseDeptScores, getDeptCellClass, getDeptBgClass, getDeptTextClass,
  networkAvgByDept, getWeakestDept,
  computeNetworkMomentum,
  computeCoverage,
  computeDeptWeaknessCounts,
  extractTopSignals,
  STALE_THRESHOLD_DAYS,
  WEAKNESS_THRESHOLD,
  type DealerCoverageInput,
} from '@/lib/oemDashboardUtils';
import type { DeptKey } from '@/lib/oemDashboardUtils';
import {
  Globe, TrendingUp, TrendingDown, Minus, Users, Award, ArrowDown, ArrowUp,
  Settings, ClipboardList, Trophy, AlertTriangle, CheckCircle, MapPin,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type OemNetwork = Tables<'oem_networks'>;

interface DealerScore {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestScore: number | null;
  previousScore: number | null;
  latestAssessmentId: string | null;
  deptScores: Record<DeptKey, number | null>;
  latestAssessmentDate: string | null;
  signalCodes: string[];
  openActionCount: number;
}

function getScoreBand(score: number): { label: string; className: string } {
  if (score >= 85) return { label: 'Advanced',     className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
  if (score >= 70) return { label: 'Performing',   className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
  if (score >= 46) return { label: 'Developing',   className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' };
  return             { label: 'Foundational', className: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' };
}

function getTrendIcon(latest: number | null, previous: number | null) {
  if (latest == null || previous == null) return <Minus className="w-4 h-4 text-muted-foreground" />;
  if (latest > previous) return <TrendingUp className="w-4 h-4 text-[#16a34a]" />;
  if (latest < previous) return <TrendingDown className="w-4 h-4 text-[#dc2626]" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'border-l-4 border-l-[#d4a017]';
  if (rank === 2) return 'border-l-4 border-l-[#9ca3af]';
  if (rank === 3) return 'border-l-4 border-l-[#b87333]';
  return '';
}

function getRankBadgeClass(rank: number): string | null {
  if (rank === 1) return 'bg-[#d4a017]/10 text-[#d4a017] border-[#d4a017]/30';
  if (rank === 2) return 'bg-[#9ca3af]/10 text-[#9ca3af] border-[#9ca3af]/30';
  if (rank === 3) return 'bg-[#b87333]/10 text-[#b87333] border-[#b87333]/30';
  return null;
}

function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

function getHeroNarrative(avgScore: number, dealerCount: number, atRiskCount: number): string {
  if (dealerCount === 0) return 'No dealers enrolled in the network yet.';
  if (avgScore >= 85) return 'Network performing above benchmark across all departments.';
  if (avgScore >= 70) return `Most dealers performing well — ${atRiskCount} below Foundational threshold.`;
  if (avgScore >= 46) return `${atRiskCount} dealer${atRiskCount !== 1 ? 's' : ''} require active intervention this quarter.`;
  return `${atRiskCount} dealer${atRiskCount !== 1 ? 's' : ''} at Foundational level — priority coaching required.`;
}

function OemDealerCard({
  dealer,
  onSelect,
  onNavigate,
}: {
  dealer: DealerScore;
  onSelect: (d: DealerScore) => void;
  onNavigate: (path: string) => void;
}) {
  const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;

  const rankedDepts = DEPT_KEYS
    .map(k => ({ key: k, score: dealer.deptScores[k] }))
    .filter((d): d is { key: DeptKey; score: number } => d.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const daysAgo = dealer.latestAssessmentDate
    ? Math.round((Date.now() - new Date(dealer.latestAssessmentDate).getTime()) / 86400000)
    : null;

  return (
    <div
      className="rounded-xl shadow-card border p-4 space-y-3 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => onSelect(dealer)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <TierBadge
            tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null}
            size="sm"
          />
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {dealer.dealerName}
          </p>
          {band && (
            <Badge variant="outline" className={`${band.className} text-xs py-0`}>
              {band.label}
            </Badge>
          )}
        </div>
        <div className="shrink-0">
          <ScoreGauge score={dealer.latestScore ?? 0} size={56} />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{dealer.location}</span>
      </div>

      {/* Dept score bars — top 3 weakest */}
      {rankedDepts.length > 0 ? (
        <div className="space-y-1.5 pt-2 border-t border-border">
          {rankedDepts.map(({ key, score }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground w-8 shrink-0 uppercase">
                {DEPT_LABELS[key]}
              </span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${getDeptBgClass(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-xs font-semibold w-6 text-right shrink-0 ${getDeptTextClass(score)}`}>
                {Math.round(score)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground italic">No assessment data yet</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border pt-2 space-y-2">
        <p className="text-xs text-muted-foreground">
          {dealer.latestAssessmentId
            ? `${dealer.openActionCount} open action${dealer.openActionCount !== 1 ? 's' : ''} · assessed ${daysAgo}d ago`
            : 'No assessment yet'}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7"
          disabled={!dealer.latestAssessmentId}
          onClick={e => {
            e.stopPropagation();
            if (dealer.latestAssessmentId) {
              onNavigate(`/app/results/${dealer.latestAssessmentId}`);
            }
          }}
        >
          Enter Dealership →
        </Button>
      </div>
    </div>
  );
}

export default function OemDashboard() {
  const { actorType, loading: roleLoading } = useActiveRole();
  const { currentOrganization } = useMultiTenant();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [networks, setNetworks] = useState<OemNetwork[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [dealerScores, setDealerScores] = useState<DealerScore[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedDealer, setSelectedDealer] = useState<DealerScore | null>(null);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    const fetchNetworks = async () => {
      setLoadingNetworks(true);
      const { data, error: err } = await supabase
        .from('oem_networks')
        .select('*')
        .eq('owner_org_id', currentOrganization.id)
        .eq('status', 'active');
      if (err) { setError(t('oem.loadError')); setLoadingNetworks(false); return; }
      setNetworks(data || []);
      if (data && data.length > 0) setSelectedNetworkId(data[0].id);
      setLoadingNetworks(false);
    };
    fetchNetworks();
  }, [currentOrganization?.id, t]);

  useEffect(() => {
    if (!selectedNetworkId) return;
    const fetchDealerScores = async () => {
      setLoadingDealers(true);
      setError(null);

      const { data: memberships, error: memErr } = await supabase
        .from('dealer_network_memberships')
        .select('dealership_id, programme_tier')
        .eq('network_id', selectedNetworkId)
        .eq('is_active', true);

      if (memErr || !memberships?.length) { setDealerScores([]); setLoadingDealers(false); return; }

      const tierByDealer = new Map<string, string | null>();
      for (const m of memberships) {
        if (m.dealership_id) tierByDealer.set(m.dealership_id, m.programme_tier ?? null);
      }

      const dealershipIds = memberships.map(m => m.dealership_id).filter((id): id is string => id != null);
      if (dealershipIds.length === 0) { setDealerScores([]); setLoadingDealers(false); return; }

      const { data: dealerships } = await supabase
        .from('dealerships')
        .select('id, name, location')
        .in('id', dealershipIds);

      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, overall_score, scores, created_at, dealership_id')
        .in('dealership_id', dealershipIds)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      const { data: openActions } = await supabase
        .from('improvement_actions')
        .select('dealership_id')
        .in('dealership_id', dealershipIds)
        .neq('status', 'Completed');

      const openCountByDealer = new Map<string, number>();
      for (const a of openActions ?? []) {
        if (a.dealership_id) {
          openCountByDealer.set(
            a.dealership_id,
            (openCountByDealer.get(a.dealership_id) ?? 0) + 1,
          );
        }
      }

      const dealerMap = new Map<string, DealerScore>();
      for (const d of dealerships || []) {
        dealerMap.set(d.id, {
          dealershipId: d.id,
          dealerName: d.name,
          location: d.location,
          programmeTier: tierByDealer.get(d.id) ?? null,
          latestScore: null,
          previousScore: null,
          latestAssessmentId: null,
          deptScores: parseDeptScores(null),
          latestAssessmentDate: null,
          signalCodes: [],
          openActionCount: openCountByDealer.get(d.id) ?? 0,
        });
      }

      const countMap = new Map<string, number>();
      for (const a of assessments || []) {
        const count = countMap.get(a.dealership_id) ?? 0;
        if (count >= 2) continue;
        const dealer = dealerMap.get(a.dealership_id);
        if (!dealer) continue;
        if (count === 0) {
          dealer.latestScore = a.overall_score ? Number(a.overall_score) : null;
          dealer.latestAssessmentId = a.id;
          dealer.deptScores = parseDeptScores(a.scores);
          dealer.latestAssessmentDate = a.created_at ?? null;
          dealer.signalCodes = (a.scores as any)?.signals ?? [];
        } else {
          dealer.previousScore = a.overall_score ? Number(a.overall_score) : null;
        }
        countMap.set(a.dealership_id, count + 1);
      }

      setDealerScores(Array.from(dealerMap.values()));
      setLoadingDealers(false);
    };
    fetchDealerScores();
  }, [selectedNetworkId]);

  const sortedDealers = useMemo(() =>
    [...dealerScores].sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0)),
    [dealerScores],
  );

  const filteredDealers = useMemo(() =>
    tierFilter === 'all' ? sortedDealers : sortedDealers.filter(d => d.programmeTier === tierFilter),
    [sortedDealers, tierFilter],
  );

  const atRiskDealers = useMemo(() =>
    sortedDealers.filter(d => (d.latestScore ?? 100) < AT_RISK_THRESHOLD),
    [sortedDealers],
  );

  const networkAvg = useMemo(() => networkAvgByDept(sortedDealers), [sortedDealers]);

  const momentum = useMemo(
    () => computeNetworkMomentum(sortedDealers),
    [sortedDealers],
  );

  const coverage = useMemo(
    () => computeCoverage(sortedDealers as unknown as DealerCoverageInput[]),
    [sortedDealers],
  );

  const deptWeaknessCounts = useMemo(
    () => computeDeptWeaknessCounts(sortedDealers, WEAKNESS_THRESHOLD),
    [sortedDealers],
  );

  const topSignals = useMemo(
    () => extractTopSignals(sortedDealers.map(d => d.signalCodes)),
    [sortedDealers],
  );

  const stats = useMemo(() => {
    const scored = sortedDealers.filter(d => d.latestScore != null);
    const scores = scored.map(d => d.latestScore!);
    return {
      total: sortedDealers.length,
      avg:     scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highest: scores.length ? Math.max(...scores) : 0,
      lowest:  scores.length ? Math.min(...scores) : 0,
    };
  }, [sortedDealers]);

  const filteredStats = useMemo(() => {
    const scored = filteredDealers.filter(d => d.latestScore != null);
    const scores = scored.map(d => d.latestScore!);
    return {
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    };
  }, [filteredDealers]);

  if (roleLoading) return <SharedLoadingState />;
  if (actorType !== 'oem') return <Navigate to="/app/dashboard" replace />;
  if (loadingNetworks) return <SharedLoadingState />;
  if (error) return <div className="p-6"><SharedEmptyState title={t('oem.loadError')} description={error} /></div>;

  if (networks.length === 0) {
    return (
      <div className="p-6">
        <Card className="mx-auto mt-16 max-w-md rounded-xl border border-[hsl(var(--neutral-200))] shadow-card">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Globe className="h-12 w-12 text-[hsl(var(--brand-300))]" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[hsl(var(--neutral-900))]">Set up your OEM network</h2>
              <p className="text-sm text-[hsl(var(--neutral-600))]">
                Create your dealer network in Network Settings to start tracking performance.
              </p>
            </div>
            <Button onClick={() => navigate('/app/oem-settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Go to Network Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryCards = [
    { label: t('oem.totalDealers'), value: stats.total,   icon: Users },
    { label: t('oem.avgScore'),     value: stats.avg,     icon: Award },
    { label: t('oem.highestScore'), value: stats.highest, icon: ArrowUp },
    { label: t('oem.lowestScore'),  value: stats.lowest,  icon: ArrowDown },
  ];

  return (
    <div className="flex flex-col">
      {/* ── Top stats bar ── */}
      <div className="h-9 bg-[#0b1f3a] flex items-center px-6 sticky top-0 z-10">
        {(() => {
          const brand = networks.find(n => n.id === selectedNetworkId)?.oem_brand ?? 'OEM Network';
          const chips = [
            { label: 'NETWORK',          value: brand },
            { label: 'AVG SCORE',        value: stats.avg > 0 ? String(stats.avg) : '—' },
            { label: 'CRITICAL GAPS',    value: String(atRiskDealers.length) },
            { label: 'ENROLLED DEALERS', value: String(stats.total) },
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
        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
              OEM PERSPECTIVE · {getQuarterLabel()}
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Network Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Active monitoring for {stats.total} enrolled {stats.total === 1 ? 'dealership' : 'dealerships'}
            </p>
          </div>
          {networks.length > 1 && (
            <Select value={selectedNetworkId ?? ''} onValueChange={setSelectedNetworkId}>
              <SelectTrigger className="w-56 shrink-0">
                <Globe className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map(n => (
                  <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <Card
                key={card.label}
                className="opacity-0 animate-fade-in shadow-card rounded-xl"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <card.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                      <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dept Weakness Heatmap */}
          {loadingDealers ? (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : sortedDealers.length > 0 ? (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Department Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground w-48">Dealer</th>
                        {DEPT_KEYS.map(key => (
                          <th key={key} className="text-center py-2 px-2 font-medium text-muted-foreground w-16">
                            {DEPT_LABELS[key]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDealers.map(dealer => (
                        <tr
                          key={dealer.dealershipId}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedDealer(dealer)}
                        >
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate max-w-[160px]">{dealer.dealerName}</span>
                              <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                            </div>
                          </td>
                          {DEPT_KEYS.map(key => {
                            const score = dealer.deptScores[key];
                            return (
                              <td key={key} className="py-2 px-2 text-center">
                                {score !== null ? (
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(score)}`}>
                                    {Math.round(score)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td className="py-2 px-4 text-sm italic text-muted-foreground">Network avg</td>
                        {DEPT_KEYS.map(key => {
                          const score = networkAvg[key];
                          return (
                            <td key={key} className="py-2 px-2 text-center">
                              {score !== null ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(score)}`}>
                                  {score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <SharedEmptyState
                  title="No assessments recorded yet"
                  description="Enrolled dealers haven't completed an assessment. Share the assessment link to get started."
                />
              </CardContent>
            </Card>
          )}

          {/* At-Risk Dealers */}
          {!loadingDealers && sortedDealers.length > 0 && (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">At-Risk Dealers</CardTitle>
              </CardHeader>
              <CardContent>
                {atRiskDealers.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-[#16a34a]/5 rounded-lg border border-[#16a34a]/20">
                    <CheckCircle className="h-5 w-5 text-[#16a34a] shrink-0" />
                    <p className="text-sm text-[#16a34a] font-medium">
                      All dealers performing above Foundational threshold
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#dc2626] mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {atRiskDealers.length} dealer{atRiskDealers.length > 1 ? 's' : ''} in Foundational band (score &lt; {AT_RISK_THRESHOLD})
                      </span>
                    </div>
                    {atRiskDealers.map(dealer => (
                      <div key={dealer.dealershipId} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium">{dealer.dealerName}</p>
                            <p className="text-xs text-muted-foreground">{dealer.location}</p>
                          </div>
                          <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          {dealer.latestScore !== null && (
                            <Badge variant="outline" className="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 text-xs">
                              {Math.round(dealer.latestScore)}
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setSelectedDealer(dealer)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Score Momentum */}
          {!loadingDealers && sortedDealers.length > 0 && (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Network Momentum</CardTitle>
              </CardHeader>
              <CardContent>
                {momentum.sampleSize < 2 ? (
                  <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
                    <Minus className="h-5 w-5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Not enough data — need 2+ assessment cycles per dealer
                      {momentum.sampleSize === 1 && ` (1 dealer has trend data)`}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {momentum.direction === 'up' && <TrendingUp className="h-8 w-8 text-[#16a34a]" />}
                      {momentum.direction === 'down' && <TrendingDown className="h-8 w-8 text-[#dc2626]" />}
                      {momentum.direction === 'flat' && <Minus className="h-8 w-8 text-muted-foreground" />}
                      <p className={`text-3xl font-semibold ${
                        momentum.direction === 'up' ? 'text-[#16a34a]' :
                        momentum.direction === 'down' ? 'text-[#dc2626]' :
                        'text-muted-foreground'
                      }`}>
                        {momentum.delta > 0 ? '+' : ''}{momentum.delta} pts
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Network avg {momentum.direction === 'up' ? 'improved' : momentum.direction === 'down' ? 'declined' : 'unchanged'} from{' '}
                        <span className="font-medium text-foreground">{momentum.fromAvg}</span> →{' '}
                        <span className="font-medium text-foreground">{momentum.toAvg}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Based on {momentum.sampleSize} dealers with 2+ assessments
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assessment Coverage */}
          {!loadingDealers && sortedDealers.length > 0 && (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Assessment Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                {coverage.missing.length === 0 && coverage.stale.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-[#16a34a]/5 rounded-lg border border-[#16a34a]/20">
                    <CheckCircle className="h-5 w-5 text-[#16a34a] shrink-0" />
                    <p className="text-sm text-[#16a34a] font-medium">
                      All {sortedDealers.length} dealers assessed within {STALE_THRESHOLD_DAYS} days
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#d97706]">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {coverage.missing.length + coverage.stale.length} of {sortedDealers.length} dealers need attention
                      </span>
                    </div>
                    {[...coverage.missing, ...coverage.stale].map(dealer => {
                      const isStale = coverage.stale.some(s => s.dealershipId === dealer.dealershipId);
                      const daysAgo = dealer.latestAssessmentDate
                        ? Math.round((Date.now() - new Date(dealer.latestAssessmentDate).getTime()) / (1000 * 60 * 60 * 24))
                        : null;
                      return (
                        <div key={dealer.dealershipId} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium">{dealer.dealerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {isStale && daysAgo ? `Last assessed: ${daysAgo} days ago` : 'No assessment yet'}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => navigate('/app/oem-settings')}>
                            Manage
                          </Button>
                        </div>
                      );
                    })}
                    {coverage.healthy.length > 0 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        ✓ {coverage.healthy.length} dealer{coverage.healthy.length > 1 ? 's' : ''} assessed within {STALE_THRESHOLD_DAYS} days
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Network Insights */}
          {!loadingDealers && sortedDealers.length > 0 && (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Network Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Section A — Dept weakness counts */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Departments below {WEAKNESS_THRESHOLD} — most common weaknesses
                  </p>
                  {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No departments below {WEAKNESS_THRESHOLD} — strong network performance
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0)
                        .sort((a, b) => deptWeaknessCounts[b] - deptWeaknessCounts[a])
                        .slice(0, 3)
                        .map(key => {
                          const count = deptWeaknessCounts[key];
                          const pct = sortedDealers.length > 0 ? count / sortedDealers.length : 0;
                          const barClass = pct > 0.5 ? 'bg-[#dc2626]' : pct > 0.25 ? 'bg-[#d97706]' : 'bg-[#2563eb]';
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="w-10 text-xs font-medium text-muted-foreground shrink-0">
                                {DEPT_LABELS[key]}
                              </span>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-2 rounded-full ${barClass}`}
                                  style={{ width: `${Math.round(pct * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-24 shrink-0">
                                {count}/{sortedDealers.length} dealers
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
                {/* Section B — Top signal codes (only if signal data exists) */}
                {topSignals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Recurring signals
                    </p>
                    <div className="space-y-2">
                      {topSignals.map(({ code, count }) => (
                        <div key={code} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-foreground flex-1 truncate">{code}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: Math.min(sortedDealers.length, 12) }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < count ? 'bg-[#d97706]' : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">
                            {count} dealer{count > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Leaderboard Tab ── */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredDealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''}
              {tierFilter !== 'all' ? ` · ${tierFilter}` : ''}
            </p>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="shadow-card rounded-xl">
            <CardContent className="p-0">
              {loadingDealers ? (
                <div className="p-6"><SharedLoadingState /></div>
              ) : filteredDealers.length === 0 ? (
                <div className="py-12 space-y-3 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-[hsl(var(--neutral-400))]" />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[hsl(var(--neutral-900))]">
                      {tierFilter !== 'all' ? `No ${tierFilter} tier dealers` : 'No assessments yet'}
                    </h3>
                    <p className="mx-auto max-w-md text-sm text-[hsl(var(--neutral-600))]">
                      {tierFilter !== 'all'
                        ? 'Try a different tier filter or check Network Settings.'
                        : "Enrolled dealers haven't completed an assessment yet."}
                    </p>
                  </div>
                  {tierFilter !== 'all' && (
                    <Button variant="outline" size="sm" onClick={() => setTierFilter('all')}>
                      Clear filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{t('oem.rank')}</TableHead>
                        <TableHead>{t('oem.dealerName')}</TableHead>
                        <TableHead className="text-center hidden md:table-cell">Weakest Dept</TableHead>
                        <TableHead className="text-right">{t('oem.latestScore')}</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">{t('oem.previousScore')}</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">{t('oem.trend')}</TableHead>
                        <TableHead className="text-center">{t('oem.benchmarkBand')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDealers.map(dealer => {
                        const rank = sortedDealers.indexOf(dealer) + 1;
                        const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;
                        const rankBadgeClass = getRankBadgeClass(rank);
                        const weakest = getWeakestDept(dealer.deptScores);
                        return (
                          <TableRow
                            key={dealer.dealershipId}
                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${getRankStyle(rank)}`}
                            onClick={() => setSelectedDealer(dealer)}
                          >
                            <TableCell className="font-medium">
                              {rankBadgeClass ? (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${rankBadgeClass}`}>
                                  {rank === 1 && <Trophy className="h-3 w-3" />}
                                  {rank}
                                </span>
                              ) : (
                                <span className="text-[hsl(var(--neutral-500))]">{rank}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">{dealer.dealerName}</span>
                                <span className="text-xs text-muted-foreground">{dealer.location}</span>
                                <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                              </div>
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              {weakest ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(weakest.score)}`}>
                                  {DEPT_LABELS[weakest.key]} {Math.round(weakest.score)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {dealer.latestScore != null ? (
                                <span className="font-semibold text-foreground">{Math.round(dealer.latestScore)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">
                              {dealer.previousScore != null ? (
                                <span className="text-muted-foreground">{Math.round(dealer.previousScore)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              {getTrendIcon(dealer.latestScore, dealer.previousScore)}
                            </TableCell>
                            <TableCell className="text-center">
                              {band ? (
                                <Badge variant="outline" className={band.className}>{band.label}</Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-[hsl(var(--neutral-050))] hover:bg-[hsl(var(--neutral-050))]">
                        <TableCell className="text-[hsl(var(--neutral-500))]">—</TableCell>
                        <TableCell><span className="italic text-[hsl(var(--neutral-600))]">Network average</span></TableCell>
                        <TableCell className="hidden md:table-cell" />
                        <TableCell className="text-right font-semibold text-foreground">{filteredStats.avg}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-muted-foreground">—</TableCell>
                        <TableCell className="text-center hidden sm:table-cell text-muted-foreground">—</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getScoreBand(filteredStats.avg).className}>
                            {getScoreBand(filteredStats.avg).label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dealer Drill-down Sheet */}
      <Sheet open={!!selectedDealer} onOpenChange={open => { if (!open) setSelectedDealer(null); }}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px] overflow-y-auto">
          {selectedDealer && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-start justify-between pr-6">
                  <div>
                    <SheetTitle className="text-lg font-semibold">{selectedDealer.dealerName}</SheetTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedDealer.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ScoreGauge score={selectedDealer.latestScore ?? 0} size={64} />
                    <TierBadge tier={selectedDealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Department Scores</h3>
                  <div className="space-y-2">
                    {DEPT_KEYS.map(key => {
                      const score = selectedDealer.deptScores[key];
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-10 text-xs font-medium text-muted-foreground">{DEPT_LABELS[key]}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            {score !== null && (
                              <div
                                className={`h-2 rounded-full ${getDeptBgClass(score)}`}
                                style={{ width: `${score}%` }}
                              />
                            )}
                          </div>
                          <span className={`text-xs font-semibold w-8 text-right ${score !== null ? getDeptTextClass(score) : 'text-muted-foreground'}`}>
                            {score !== null ? Math.round(score) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Score History</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Latest</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {selectedDealer.latestScore !== null ? Math.round(selectedDealer.latestScore) : '—'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon(selectedDealer.latestScore, selectedDealer.previousScore)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Previous</p>
                      <p className="text-lg font-medium text-muted-foreground">
                        {selectedDealer.previousScore !== null ? Math.round(selectedDealer.previousScore) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDealer.latestAssessmentId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/app/results/${selectedDealer.latestAssessmentId}`)}
                  >
                    Open Full Report →
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
}
