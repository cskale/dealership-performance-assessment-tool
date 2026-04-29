import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SharedLoadingState } from '@/components/shared/SharedLoadingState';
import { SharedEmptyState } from '@/components/shared/SharedEmptyState';
import { Globe, TrendingUp, TrendingDown, Minus, Users, Award, ArrowDown, ArrowUp, Settings } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type OemNetwork = Tables<'oem_networks'>;

interface DealerScore {
  dealershipId: string;
  dealerName: string;
  location: string;
  latestScore: number | null;
  previousScore: number | null;
  latestAssessmentId: string | null;
}

function getScoreBand(score: number): { label: string; className: string } {
  if (score >= 85) return { label: 'Leading',      className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
  if (score >= 65) return { label: 'Advanced',     className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
  if (score >= 45) return { label: 'Developing',   className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' };
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

export default function OemDashboard() {
  const { actorType, loading: roleLoading } = useActiveRole();
  const { currentOrganization } = useMultiTenant();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [networks, setNetworks] = useState<OemNetwork[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [dealerScores, setDealerScores] = useState<DealerScore[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch networks owned by current org
  useEffect(() => {
    if (!currentOrganization?.id) return;
    const fetchNetworks = async () => {
      setLoadingNetworks(true);
      const { data, error: err } = await supabase
        .from('oem_networks')
        .select('*')
        .eq('owner_org_id', currentOrganization.id)
        .eq('status', 'active');

      if (err) {
        setError(t('oem.loadError'));
        setLoadingNetworks(false);
        return;
      }
      setNetworks(data || []);
      if (data && data.length > 0) {
        setSelectedNetworkId(data[0].id);
      }
      setLoadingNetworks(false);
    };
    fetchNetworks();
  }, [currentOrganization?.id, t]);

  // Fetch dealer scores for selected network
  useEffect(() => {
    if (!selectedNetworkId) return;
    const fetchDealerScores = async () => {
      setLoadingDealers(true);
      setError(null);

      // Get dealer memberships for this network
      const { data: memberships, error: memErr } = await supabase
        .from('dealer_network_memberships')
        .select('dealership_id')
        .eq('network_id', selectedNetworkId)
        .eq('is_active', true);

      if (memErr || !memberships?.length) {
        setDealerScores([]);
        setLoadingDealers(false);
        return;
      }

      const dealershipIds = memberships
        .map(m => m.dealership_id)
        .filter((id): id is string => id != null);

      if (dealershipIds.length === 0) {
        setDealerScores([]);
        setLoadingDealers(false);
        return;
      }

      // Get dealership names
      const { data: dealerships } = await supabase
        .from('dealerships')
        .select('id, name, location')
        .in('id', dealershipIds);

      // Get latest 2 assessments per dealership
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, overall_score, created_at, dealership_id')
        .in('dealership_id', dealershipIds)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      const dealerMap = new Map<string, DealerScore>();
      for (const d of dealerships || []) {
        dealerMap.set(d.id, {
          dealershipId: d.id,
          dealerName: d.name,
          location: d.location,
          latestScore: null,
          previousScore: null,
          latestAssessmentId: null,
        });
      }

      // Assign latest and previous scores
      const countMap = new Map<string, number>();
      for (const a of assessments || []) {
        const count = countMap.get(a.dealership_id) ?? 0;
        if (count >= 2) continue;
        const dealer = dealerMap.get(a.dealership_id);
        if (!dealer) continue;
        if (count === 0) {
          dealer.latestScore = a.overall_score ? Number(a.overall_score) : null;
          dealer.latestAssessmentId = a.id;
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

  const sortedDealers = useMemo(() => {
    return [...dealerScores].sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
  }, [dealerScores]);

  const stats = useMemo(() => {
    const scored = sortedDealers.filter(d => d.latestScore != null);
    const scores = scored.map(d => d.latestScore!);
    return {
      total: sortedDealers.length,
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highest: scores.length ? Math.max(...scores) : 0,
      lowest: scores.length ? Math.min(...scores) : 0,
    };
  }, [sortedDealers]);

  if (roleLoading) return <SharedLoadingState />;
  if (actorType !== 'oem') return <Navigate to="/app/dashboard" replace />;

  if (loadingNetworks) return <SharedLoadingState />;

  if (error) {
    return (
      <div className="p-6">
        <SharedEmptyState title={t('oem.loadError')} description={error} />
      </div>
    );
  }

  if (networks.length === 0) {
    return (
      <div className="p-6">
        <Card className="mx-auto mt-16 max-w-md rounded-xl border border-[hsl(var(--neutral-200))] shadow-card">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Globe className="h-12 w-12 text-[hsl(var(--brand-300))]" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[hsl(var(--neutral-900))]">Set up your OEM network</h2>
              <p className="text-sm text-[hsl(var(--neutral-600))]">
                Create your dealer network in Network Settings to start tracking performance across your pilot dealerships.
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
    { label: t('oem.totalDealers'), value: stats.total, icon: Users },
    { label: t('oem.avgScore'), value: stats.avg, icon: Award },
    { label: t('oem.highestScore'), value: stats.highest, icon: ArrowUp },
    { label: t('oem.lowestScore'), value: stats.lowest, icon: ArrowDown },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('oem.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {networks.find(n => n.id === selectedNetworkId)?.oem_brand ?? ''}
          </p>
        </div>
        {networks.length > 1 && (
          <Select value={selectedNetworkId ?? ''} onValueChange={setSelectedNetworkId}>
            <SelectTrigger className="w-64">
              <Globe className="w-4 h-4 mr-2 shrink-0" />
              <SelectValue placeholder={t('oem.selectNetwork')} />
            </SelectTrigger>
            <SelectContent>
              {networks.map(n => (
                <SelectItem key={n.id} value={n.id}>
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Cards */}
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

      {/* Leaderboard */}
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{t('oem.leaderboard')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingDealers ? (
            <div className="p-6"><SharedLoadingState /></div>
          ) : sortedDealers.length === 0 ? (
            <div className="p-6">
              <SharedEmptyState title={t('oem.noAssessments')} description={t('oem.noAssessments')} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t('oem.rank')}</TableHead>
                    <TableHead>{t('oem.dealerName')}</TableHead>
                    <TableHead className="text-right">{t('oem.latestScore')}</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">{t('oem.previousScore')}</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">{t('oem.trend')}</TableHead>
                    <TableHead className="text-center">{t('oem.benchmarkBand')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDealers.map((dealer, index) => {
                    const rank = index + 1;
                    const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;
                    return (
                      <TableRow
                        key={dealer.dealershipId}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${getRankStyle(rank)}`}
                        onClick={() => {
                          if (dealer.latestAssessmentId) {
                            navigate(`/app/results/${dealer.latestAssessmentId}`);
                          }
                        }}
                      >
                        <TableCell className="font-medium text-muted-foreground">{rank}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium text-foreground">{dealer.dealerName}</span>
                            <span className="text-xs text-muted-foreground ml-2">{dealer.location}</span>
                          </div>
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
                            <Badge variant="outline" className={band.className}>
                              {band.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
