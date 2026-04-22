import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, Car, RotateCw, Wrench, Package, TrendingUp, Download,
  ChevronRight, ArrowUp, ArrowDown, Settings, User, Target, Sparkles, Info,
  FileText, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";


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
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setHasAssessments(null); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      if (cancelled) return;
      if (error) { setHasAssessments(true); return; }
      setHasAssessments((data?.length ?? 0) > 0);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const statusLabels = {
    'excellent': t('kpi.excellent'),
    'on-track': t('dashboard.onTrack'),
    'needs-focus': t('kpi.needsFocus')
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
      if (score >= 80) return { label: t('kpi.excellent'), variant: 'success' as const };
      if (score >= 60) return { label: t('kpi.good'), variant: 'warning' as const };
      return { label: t('kpi.needsFocus'), variant: 'destructive' as const };
    };
    const status = getScoreStatus(score);

    return (
      <div className="flex items-center justify-between p-4 rounded-lg rounded-t-lg border bg-card border-t-4" style={{ borderTopColor: title.includes('New') || title.includes('Neufahr') ? '#2563eb' : title.includes('Used') || title.includes('Gebraucht') ? '#7c3aed' : title.includes('Service') || title.includes('Aftersales') ? '#0891b2' : 'hsl(var(--border))' }}>
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
    <div className="min-h-screen bg-muted">
      

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
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-[640px] mx-auto p-10 px-12 border rounded-[12px] bg-card">
            <div>
              <h1 className="text-[20px] font-semibold text-foreground">
                {language === 'de' ? 'Starten Sie Ihre erste Händlerbewertung' : 'Start your first dealership assessment'}
              </h1>
              <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
                {language === 'de'
                  ? 'Dieses Tool diagnostiziert die Leistung in fünf Bereichen Ihres Autohauses und erstellt in unter 30 Minuten einen priorisierten Maßnahmenplan.'
                  : 'This tool diagnoses performance across five areas of your dealership and produces a prioritised action plan in under 30 minutes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  icon: TrendingUp,
                  heading: language === 'de' ? 'Gewichtete Diagnosewerte' : 'Weighted diagnostic scores',
                  desc: language === 'de'
                    ? 'Über 5 Module: Verkauf, Gebrauchtwagen, Service, Finanzen, Teile'
                    : 'Across 5 modules: Sales, Used Vehicles, Service, Finance, Parts',
                },
                {
                  icon: Target,
                  heading: language === 'de' ? 'Priorisierter Maßnahmenplan' : 'Prioritised action plan',
                  desc: language === 'de'
                    ? 'Nach Wirkung, Aufwand und Dringlichkeit sortierte Empfehlungen für Ihr Team'
                    : 'Impact, effort, and urgency-ranked recommendations for your team',
                },
                {
                  icon: FileText,
                  heading: language === 'de' ? 'Exportierbarer PDF-Bericht' : 'Exportable PDF report',
                  desc: language === 'de'
                    ? 'Beratungstauglicher Bericht zum Teilen mit Geschäftsführung oder OEM'
                    : 'Consulting-grade output ready to share with your principal or OEM',
                },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="text-[13px] font-medium text-foreground">{b.heading}</h3>
                    <p className="text-[12px] text-muted-foreground leading-snug">{b.desc}</p>
                  </div>
                );
              })}
            </div>

            <p className="text-[12px] uppercase tracking-wider text-muted-foreground mt-8 font-medium">
              {language === 'de' ? 'Vor dem Start — halten Sie folgendes bereit:' : 'Before you start, have these to hand:'}
            </p>
            <ul className="mt-3 space-y-2">
              {(language === 'de'
                ? [
                    'Neuwagenverkaufsvolumen und Bruttomargen der letzten 12 Monate',
                    'Werkstattauslastung sowie CSI/NPS-Werte',
                    'Gebrauchtwagen-Lagerumschlag und Altersstruktur',
                    'Aktueller Monatsabschluss (G+V-Übersicht)',
                    'Anteil obsoleter Ersatzteile in Prozent',
                  ]
                : [
                    "Last 12 months' new vehicle sales volume and gross profit figures",
                    'Workshop utilisation rate and CSI/NPS scores',
                    'Used vehicle stock turn and age profile',
                    'Latest monthly management accounts (P&L summary)',
                    'Parts obsolescence percentage',
                  ]
              ).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-foreground leading-[1.6]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full mt-8 h-11" onClick={() => navigate('/app/assessment')}>
              {language === 'de' ? 'Bewertung starten' : 'Begin Assessment'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              {language === 'de' ? 'Dauer ca. 25–30 Minuten' : 'Takes approximately 25–30 minutes'}
            </p>
          </div>
        </main>
      ) : (
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
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
