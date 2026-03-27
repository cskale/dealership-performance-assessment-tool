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
import { ArrowUpDown, Filter } from 'lucide-react';

interface AssignedDealer {
  dealershipId: string;
  dealerName: string;
  location: string;
  brand: string;
  latestScore: number | null;
  latestDate: string | null;
  latestStatus: string | null;
  latestAssessmentId: string | null;
}

interface AssessmentRecord {
  dealership_id: string;
  overall_score: number | null;
  created_at: string;
}

const CHART_COLORS = ['#2563eb', '#7c3aed', '#0891b2'];

function getScoreBadge(score: number): { className: string } {
  if (score >= 85) return { className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
  if (score >= 70) return { className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
  if (score >= 46) return { className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' };
  return { className: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' };
}

export default function CoachDashboard() {
  const { actorType, loading: roleLoading } = useActiveRole();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [dealers, setDealers] = useState<AssignedDealer[]>([]);
  const [allAssessments, setAllAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [selectedDealerIds, setSelectedDealerIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAssignments = async () => {
      setLoading(true);

      // Get coach assignments
      const { data: assignments, error: assignErr } = await supabase
        .from('coach_dealership_assignments')
        .select('dealership_id')
        .eq('coach_user_id', user.id)
        .eq('is_active', true);

      if (assignErr || !assignments?.length) {
        setDealers([]);
        setLoading(false);
        return;
      }

      const dealershipIds = assignments.map(a => a.dealership_id);

      // Get dealership details
      const { data: dealerships } = await supabase
        .from('dealerships')
        .select('id, name, location, brand')
        .in('id', dealershipIds);

      // Get all assessments for these dealerships
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, overall_score, created_at, dealership_id, status')
        .in('dealership_id', dealershipIds)
        .order('created_at', { ascending: false });

      setAllAssessments(
        (assessments || []).map(a => ({
          dealership_id: a.dealership_id,
          overall_score: a.overall_score ? Number(a.overall_score) : null,
          created_at: a.created_at,
        }))
      );

      const dealerList: AssignedDealer[] = (dealerships || []).map(d => {
        const latestAssessment = (assessments || []).find(a => a.dealership_id === d.id);
        return {
          dealershipId: d.id,
          dealerName: d.name,
          location: d.location,
          brand: d.brand,
          latestScore: latestAssessment?.overall_score ? Number(latestAssessment.overall_score) : null,
          latestDate: latestAssessment?.created_at ?? null,
          latestStatus: latestAssessment?.status ?? null,
          latestAssessmentId: latestAssessment?.id ?? null,
        };
      });

      setDealers(dealerList);
      setLoading(false);
    };
    fetchAssignments();
  }, [user?.id]);

  const filteredDealers = useMemo(() => {
    let result = [...dealers];
    if (statusFilter === 'completed') {
      result = result.filter(d => d.latestStatus === 'completed');
    } else if (statusFilter === 'in_progress') {
      result = result.filter(d => d.latestStatus === 'in_progress');
    }
    if (sortBy === 'score') {
      result.sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
    } else {
      result.sort((a, b) => a.dealerName.localeCompare(b.dealerName));
    }
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('coach.title')}</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={sortBy === 'score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('score')}
          >
            {t('coach.sortByScore')}
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            {t('coach.sortByName')}
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'completed' | 'in_progress')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
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
        {filteredDealers.map((dealer, i) => (
          <Card
            key={dealer.dealershipId}
            className="cursor-pointer hover:shadow-md transition-shadow opacity-0 animate-fade-in"
            style={{ animationDelay: `${Math.min(i, 4) * 50}ms`, animationFillMode: 'forwards' }}
            onClick={() => {
              if (dealer.latestAssessmentId) {
                navigate(`/app/results/${dealer.latestAssessmentId}`);
              }
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold">{dealer.dealerName}</CardTitle>
                <Badge variant="outline" className="text-xs shrink-0">{dealer.brand}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{dealer.location}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  {dealer.latestScore != null ? (
                    <Badge variant="outline" className={getScoreBadge(dealer.latestScore).className}>
                      {Math.round(dealer.latestScore)}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="text-right">
                  {dealer.latestDate && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(dealer.latestDate), 'dd MMM yyyy')}
                    </p>
                  )}
                  {dealer.latestStatus && (
                    <Badge
                      variant="outline"
                      className={
                        dealer.latestStatus === 'completed'
                          ? 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 text-xs'
                          : 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20 text-xs'
                      }
                    >
                      {dealer.latestStatus === 'completed' ? t('coach.filterCompleted') : t('coach.filterInProgress')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{t('coach.scoreTrend')}</CardTitle>
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
                  className="w-2.5 h-2.5 rounded-full shrink-0"
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
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              {t('coach.selectDealers')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
