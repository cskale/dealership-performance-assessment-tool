import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car, RotateCw, Wrench, TrendingUp, Download,
  ChevronRight, ArrowUp, ArrowDown, Target, Sparkles, Info,
  ClipboardList, ArrowRight, BarChart3, Zap, CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";


interface KPICardProps {
  title: string;
  value: string;
  benchmark: string;
  change: number;
  status: 'excellent' | 'on-track' | 'needs-focus';
  unit?: string;
}

const Dashboard = () => {
  useEffect(() => { document.title = 'Dashboard — Dealer Diagnostic'; }, []);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedDealer, setSelectedDealer] = useState("main");
  const [hasAssessments, setHasAssessments] = useState<boolean | null>(null);
  const [latestCompletedAt, setLatestCompletedAt] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setHasAssessments(null); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);
      if (cancelled) return;
      if (error) { setHasAssessments(true); return; }
      const rows = data ?? [];
      setHasAssessments(rows.length > 0);
      setLatestCompletedAt(rows[0]?.completed_at ?? null);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const statusLabels = {
    'excellent': language === 'de' ? 'Fortgeschritten' : 'Advanced',
    'on-track': language === 'de' ? 'Leistungsfähig' : 'Performing',
    'needs-focus': language === 'de' ? 'In Entwicklung' : 'Developing'
  };

  const KPICard = ({ title, value, benchmark, change, status, unit = '' }: KPICardProps) => {
    const statusClasses = {
      'excellent': 'bg-success/10 text-success-foreground border-success/20',
      'on-track': 'bg-warning/10 text-warning-foreground border-warning/20',
      'needs-focus': 'bg-destructive/10 text-destructive-foreground border-destructive/20'
    };

    return (
      <Card className="hover-lift shadow-card rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-body-sm text-muted-foreground font-medium">{title}</h4>
            <Badge variant="outline" className={cn("text-caption", statusClasses[status])}>
              {statusLabels[status]}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-metric-lg text-foreground">{value}</span>
              {unit && <span className="text-body-sm text-muted-foreground">{unit}</span>}
            </div>
            <div className="flex items-center justify-between text-caption">
              <span className="text-muted-foreground">{t('kpi.benchmark')}: {benchmark}</span>
              <span className={cn("flex items-center gap-0.5 font-medium",
                change >= 0 ? "text-success-foreground" : "text-destructive-foreground"
              )}>
                {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(change)}%
              </span>
            </div>
            <Progress value={Math.min(100, Math.max(0, 50 + change))} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    );
  };

  interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    score: number;
  }

  const SectionHeader = ({ icon, title, score }: SectionHeaderProps) => {
    const getScoreStatus = (score: number) => {
      if (score >= 85) return { label: language === 'de' ? 'Fortgeschritten' : 'Advanced', variant: 'success' as const };
      if (score >= 70) return { label: language === 'de' ? 'Leistungsfähig' : 'Performing', variant: 'default' as const };
      if (score >= 46) return { label: language === 'de' ? 'In Entwicklung' : 'Developing', variant: 'warning' as const };
      return { label: language === 'de' ? 'Grundlegend' : 'Foundational', variant: 'destructive' as const };
    };
    const status = getScoreStatus(score);

    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-card shadow-card border-t-4 border-t-brand-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-h5 text-foreground">{title}</h2>
            <p className="text-caption text-muted-foreground">{t('kpi.performanceScore')}: {score}/100</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-metric-lg text-primary">{score}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      

      {/* Context bar */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={selectedDealer} onValueChange={setSelectedDealer}>
              <SelectTrigger className="w-56 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">{t('dashboard.mainDealership')}</SelectItem>
                <SelectItem value="north">{t('dashboard.northBranch')}</SelectItem>
                <SelectItem value="south">{t('dashboard.southBranch')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t('dashboard.thisPeriod')}</SelectItem>
                <SelectItem value="quarter">{t('dashboard.thisQuarter')}</SelectItem>
                <SelectItem value="year">{t('dashboard.thisYear')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-1.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-1.5" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {hasAssessments === false ? (
        <main className="max-w-7xl mx-auto px-6 py-6">
          <Card className="max-w-xl mx-auto mt-8 shadow-card rounded-xl">
            <CardContent className="p-8 space-y-6 text-center">
              <ClipboardList className="h-14 w-14 text-[hsl(var(--brand-300))] mx-auto" />
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-[hsl(var(--neutral-900))]">Run your first dealership diagnostic</h1>
                <p className="text-sm text-[hsl(var(--neutral-600))] leading-relaxed">
                  A 45-minute structured assessment across 5 departments. Get a scored performance profile, diagnostic signals, and a prioritised action plan — ready to present to your team.
                </p>
              </div>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="/app/assessment">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: BarChart3, label: 'Scored across 5 departments' },
                  { icon: Zap, label: 'Diagnostic signals in minutes' },
                  { icon: CheckSquare, label: 'Prioritised action plan' },
                ].map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.label} className="bg-[hsl(var(--brand-050))] rounded-lg p-3 flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5 text-[hsl(var(--brand-400))]" />
                      <span className="text-xs text-[hsl(var(--neutral-600))]">{benefit.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-[hsl(var(--neutral-500))] text-center">
                What to prepare: your last 3 months of DMS sales data, service throughput figures, and parts inventory report.
              </p>
            </CardContent>
          </Card>
        </main>
      ) : (
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Preview banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-warning/30 bg-warning/5">
          <Info className="h-4 w-4 text-warning-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-body-sm font-medium text-foreground">
              {language === 'de' ? 'Dashboard-Vorschau' : 'Dashboard Preview'}
            </p>
            <p className="text-caption text-muted-foreground mt-0.5">
              {language === 'de'
                ? 'Die dargestellten Daten sind statische Beispielwerte. Verbinden Sie echte Geschäftsdaten, um Live-Analysen zu aktivieren.'
                : 'Data shown uses static sample values. Connect real dealership data to activate live analytics.'}
            </p>
          </div>
        </div>

        {/* Page header */}
        <div>
          <h1 className="text-h1 text-foreground">{t('dashboard.title')}</h1>
          <p className="text-body-md text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
          {latestCompletedAt && (
            <div className="mt-2">
              <FreshnessBadge
                completedAt={latestCompletedAt}
                onReassess={() => navigate('/app/assessment')}
              />
            </div>
          )}
        </div>

        {/* New Vehicle Sales */}
        <section className="space-y-4">
          <SectionHeader 
            icon={<Car className="h-4 w-4 text-primary" />}
            title={t('kpi.section.newVehicle')}
            score={72}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('kpi.monthlyRevenue'), value: "€385K", benchmark: "€420K", change: -8.3, status: 'needs-focus' as const },
              { title: t('kpi.averageMargin'), value: "9.1%", benchmark: "9.2%", change: -1.1, status: 'on-track' as const },
              { title: t('kpi.customerSatisfaction'), value: "87%", benchmark: "84%", change: 3.6, status: 'excellent' as const },
              { title: t('kpi.leadConversion'), value: "24%", benchmark: "23%", change: 4.3, status: 'excellent' as const },
            ].map((kpi, i) => (
              <div key={i} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}>
                <KPICard {...kpi} />
              </div>
            ))}
          </div>
        </section>

        {/* Used Vehicle Sales */}
        <section className="space-y-4">
          <SectionHeader 
            icon={<RotateCw className="h-4 w-4 text-primary" />}
            title={t('kpi.section.usedVehicle')}
            score={68}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('kpi.monthlyRevenue'), value: "€245K", benchmark: "€290K", change: -15.5, status: 'needs-focus' as const },
              { title: t('kpi.averageMargin'), value: "14.2%", benchmark: "15.8%", change: -10.1, status: 'needs-focus' as const },
              { title: t('kpi.turnoverRate'), value: "7.8x", benchmark: "8.5x", change: -8.2, status: 'on-track' as const, unit: t('kpi.perYear') },
              { title: t('kpi.customerSatisfaction'), value: "83%", benchmark: "81%", change: 2.5, status: 'excellent' as const },
            ].map((kpi, i) => (
              <div key={i} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}>
                <KPICard {...kpi} />
              </div>
            ))}
          </div>
        </section>

        {/* Service */}
        <section className="space-y-4">
          <SectionHeader 
            icon={<Wrench className="h-4 w-4 text-primary" />}
            title={t('kpi.section.service')}
            score={81}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('kpi.monthlyRevenue'), value: "€178K", benchmark: "€185K", change: -3.8, status: 'on-track' as const },
              { title: t('kpi.laborEfficiency'), value: "85%", benchmark: "78%", change: 9.0, status: 'excellent' as const },
              { title: t('kpi.customerRetention'), value: "76%", benchmark: "72%", change: 5.6, status: 'excellent' as const },
              { title: t('kpi.averageRO'), value: "€268", benchmark: "€245", change: 9.4, status: 'excellent' as const },
            ].map((kpi, i) => (
              <div key={i} className="opacity-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}>
                <KPICard {...kpi} />
              </div>
            ))}
          </div>
        </section>

        {/* AI Insights */}
        <Card className="shadow-card rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>{t('dashboard.aiInsights')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: <Target className="h-4 w-4 text-success-foreground" />, title: t('dashboard.insight1.title'), desc: t('dashboard.insight1.desc'), badge: t('dashboard.insight1.impact'), variant: 'success' as const },
              { icon: <Target className="h-4 w-4 text-warning-foreground" />, title: t('dashboard.insight2.title'), desc: t('dashboard.insight2.desc'), badge: t('dashboard.insight2.impact'), variant: 'warning' as const },
              { icon: <Target className="h-4 w-4 text-info-foreground" />, title: t('dashboard.insight3.title'), desc: t('dashboard.insight3.desc'), badge: t('dashboard.insight3.impact'), variant: 'info' as const },
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-muted/30">
                <div className="mt-0.5">{insight.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-body-md font-medium text-foreground">{insight.title}</h4>
                  <p className="text-body-sm text-muted-foreground mt-0.5">{insight.desc}</p>
                  <Badge variant={insight.variant} className="mt-2">{insight.badge}</Badge>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              {t('dashboard.viewAllRecommendations')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Overall Performance */}
        <Card className="shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('kpi.overallPerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '74', label: t('kpi.overallScore'), color: 'text-primary' },
                { value: '2', label: t('kpi.strongAreas'), color: 'text-success-foreground' },
                { value: '1', label: t('dashboard.needsAttention'), color: 'text-warning-foreground' },
                { value: '€91k', label: t('dashboard.monthlyOpportunity'), color: 'text-accent-foreground' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-5 rounded-lg bg-muted/50">
                  <div className={cn("text-metric-lg mb-1", stat.color)}>{stat.value}</div>
                  <div className="text-caption text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      )}
    </div>
  );
};

export default Dashboard;
