import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { FileText, RefreshCw, ArrowLeft, ClipboardList, BarChart3, Award, CheckSquare, BookOpen, AlertCircle, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { IndustrialKPIDashboard } from "@/components/IndustrialKPIDashboard";
import { MaturityScoring } from "@/components/MaturityScoring";
import { ActionPlan } from "@/components/ActionPlan";
import { UsefulResources } from "@/components/UsefulResources";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { ExportPDFModal } from "@/components/ExportPDFModal";
import { useAuth } from "@/hooks/useAuth";
import { useMultiTenant } from "@/hooks/useMultiTenant";
import { supabase } from "@/integrations/supabase/client";
import type { PDFExportData } from "@/lib/pdfReportGenerator";
import { calculateWeightedScore, CATEGORY_WEIGHTS } from "@/lib/scoringEngine";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { cn } from "@/lib/utils";

export default function Results() {
  const { assessmentId: routeAssessmentId } = useParams<{ assessmentId: string }>();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || "executive";
  });
  const [resultsData, setResultsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [pdfActions, setPdfActions] = useState<PDFExportData['actions']>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();

  // Load completed assessment results
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let loaded = false;
      
      if (user) {
        try {
          let query = supabase
            .from('assessments')
            .select('id, answers, scores, overall_score, completed_at, status')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          if (routeAssessmentId) {
            query = query.eq('id', routeAssessmentId);
          } else {
            query = query.order('completed_at', { ascending: false }).limit(1);
          }

          const { data: dbAssessment, error } = await query.single();
          
          if (error && routeAssessmentId) {
            setLoadError(
              language === 'de' 
                ? 'Diese Bewertung wurde nicht gefunden oder Sie haben keinen Zugriff darauf.' 
                : 'This assessment was not found or you do not have access to it.'
            );
            setIsLoading(false);
            return;
          }
          
          if (dbAssessment && dbAssessment.answers && Object.keys(dbAssessment.answers as object).length > 0) {
            setResultsData({
              assessmentId: dbAssessment.id,
              answers: dbAssessment.answers,
              scores: dbAssessment.scores,
              completedAt: dbAssessment.completed_at || new Date().toISOString(),
            });
            loaded = true;
          }
        } catch (err) {
          console.warn('DB assessment load failed, falling back to localStorage:', err);
        }
      }

      if (!loaded && !routeAssessmentId) {
        const completedResults = localStorage.getItem('completed_assessment_results');
        if (completedResults) {
          const data = JSON.parse(completedResults);
          if (!data.assessmentId) {
            data.assessmentId = crypto.randomUUID();
            localStorage.setItem('completed_assessment_results', JSON.stringify(data));
          }
          setResultsData(data);
          loaded = true;
        }
      }

      if (!loaded && !loadError) {
        toast({ title: t('results.noResults'), description: t('results.completeFirst'), variant: "destructive" });
        navigate('/app/assessment');
      }
      
      setIsLoading(false);
    };
    loadData();
  }, [navigate, toast, t, user, routeAssessmentId]);

  const overallScore = useMemo(() => {
    if (!resultsData?.scores) return 0;
    return calculateWeightedScore(resultsData.scores);
  }, [resultsData?.scores]);

  useEffect(() => {
    if (overallScore > 0 && !isLoading) {
      const duration = 1200;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(overallScore * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [overallScore, isLoading]);

  const handleRetakeAssessment = () => {
    localStorage.removeItem('completed_assessment_results');
    localStorage.removeItem('assessment_data');
    toast({ title: t('results.assessmentReset'), description: t('results.startingFresh') });
    navigate('/app/assessment');
  };

  useEffect(() => {
    const loadActions = async () => {
      if (!user || !resultsData?.assessmentId) return;
      try {
        let query = supabase
          .from('improvement_actions')
          .select('action_title, action_description, priority, status, responsible_person, target_completion_date, department')
          .eq('assessment_id', resultsData.assessmentId);
        if (currentOrganization?.id) {
          query = query.eq('organization_id', currentOrganization.id);
        }
        const { data } = await query;
        setPdfActions((data as any) || []);
      } catch {}
    };
    loadActions();
  }, [user, resultsData?.assessmentId, currentOrganization?.id]);

  const pdfExportData: PDFExportData | null = resultsData ? {
    organization: currentOrganization ? {
      name: currentOrganization.name,
      logo_url: (currentOrganization as any).logo_url || null,
      default_language: (currentOrganization as any).default_language || language,
    } : { name: 'Dealership', default_language: language },
    user: {
      fullName: user?.user_metadata?.full_name || user?.email || 'User',
      role: userMemberships.find(m => m.organization_id === currentOrganization?.id)?.role || 'user',
    },
    assessment: {
      id: resultsData.assessmentId || '',
      completedAt: resultsData.completedAt || new Date().toISOString(),
      overallScore,
      scores: resultsData.scores,
      answers: resultsData.answers,
    },
    actions: pdfActions,
    includeWatermark: false,
  } : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 60) return 'stroke-warning';
    return 'stroke-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: t('results.excellent'), variant: 'success' as const };
    if (score >= 60) return { label: t('results.good'), variant: 'warning' as const };
    return { label: t('results.needsImprovement'), variant: 'destructive' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const assessmentId = resultsData?.assessmentId;
  const actionCount = pdfActions.length;

  const scoreInfo = getScoreLabel(overallScore);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-muted">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-h4 text-foreground">
                {language === 'de' ? 'Ergebnisse nicht verfügbar' : 'Results Unavailable'}
              </h2>
              <p className="text-body-sm text-muted-foreground">{loadError}</p>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" onClick={() => navigate('/account?tab=activity')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'de' ? 'Zurück zur Aktivität' : 'Back to Activity'}
                </Button>
                <Button onClick={() => navigate('/app/results')}>
                  {language === 'de' ? 'Neueste Ergebnisse' : 'Latest Results'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-body-sm text-muted-foreground">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-8" id="results-content">

        {/* Results Hero */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {t('nav.backToDashboard')}
            </Button>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowExportModal(true)} size="sm" className="gap-1.5">
                <FileText className="h-4 w-4" />
                {t('results.exportPDF')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRetakeAssessment} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                {t('results.retakeAssessment')}
              </Button>
            </div>
          </div>
          
          {/* Score hero card */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score ring */}
                <div className="shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative cursor-help">
                        <svg className="w-36 h-36" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                          <circle
                            cx="50" cy="50" r="42" fill="none"
                            className={getScoreColor(overallScore)}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${(animatedScore / 100) * 264} 264`}
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dasharray 0.1s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-metric-lg text-foreground">{animatedScore}</span>
                          <span className="text-caption text-muted-foreground">/100</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs p-3">
                      <p className="font-medium mb-1">{language === 'de' ? 'Gewichtete Punktzahl' : 'Weighted Score'}</p>
                      <p className="text-caption text-muted-foreground">
                        {language === 'de' 
                          ? 'Gewichtet nach Geschäftsbereich: NV 25%, UV 20%, Service 20%, Finanzen 20%, Teile 15%' 
                          : 'Weighted by department: NV 25%, UV 20%, Service 20%, Finance 20%, Parts 15%'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-h2 text-foreground">
                    {language === 'de' ? 'Bewertungsergebnisse' : 'Assessment Results'}
                  </h1>
                  <p className="text-body-md text-muted-foreground">
                    {language === 'de' ? 'Umfassende Analyse abgeschlossen am' : 'Comprehensive analysis completed on'} {formatDate(resultsData.completedAt)}
                  </p>
                  <Badge variant={scoreInfo.variant} className="text-sm px-3 py-1">
                    {scoreInfo.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ExportPDFModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          exportData={pdfExportData}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-11 bg-card border">
            <TabsTrigger value="executive" className="gap-1.5 text-body-sm">
              <ClipboardList className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.executive')}
            </TabsTrigger>
            <TabsTrigger value="kpi" className="gap-1.5 text-body-sm">
              <BarChart3 className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.kpi')}
            </TabsTrigger>
            <TabsTrigger value="maturity" className="gap-1.5 text-body-sm">
              <Award className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.maturity')}
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="gap-1.5 text-body-sm">
              <CheckSquare className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.actionPlan')}
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5 text-body-sm">
              <BookOpen className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.resources')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6 animate-fade-in">
            <ErrorBoundary fallbackTitle={language === 'de' ? 'Zusammenfassung nicht verfügbar' : 'Summary unavailable'}>
              <ExecutiveSummary
                overallScore={overallScore}
                scores={resultsData.scores}
                answers={resultsData.answers}
                completedAt={resultsData.completedAt}
                onNavigateToEncyclopedia={(kpiKey) => {
                  setActiveTab("resources");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="kpi" className="space-y-6 animate-fade-in">
            <ErrorBoundary fallbackTitle={language === 'de' ? 'KPI-Dashboard nicht verfügbar' : 'KPI Dashboard unavailable'}>
              <IndustrialKPIDashboard
                scores={resultsData.scores}
                onNavigateToEncyclopedia={(kpiKey) => {
                  setActiveTab("resources");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="maturity" className="space-y-6 animate-fade-in">
            <ErrorBoundary fallbackTitle={language === 'de' ? 'Reifegradanalyse nicht verfügbar' : 'Maturity analysis unavailable'}>
              <MaturityScoring scores={resultsData.scores} answers={resultsData.answers} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="action-plan" className="space-y-6 animate-fade-in">
            <ErrorBoundary fallbackTitle={language === 'de' ? 'Maßnahmenplan nicht verfügbar' : 'Action Plan unavailable'}>
              <ActionPlan assessmentId={resultsData.assessmentId} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 animate-fade-in">
            <ErrorBoundary fallbackTitle={language === 'de' ? 'Ressourcen nicht verfügbar' : 'Resources unavailable'}>
              <UsefulResources scores={resultsData.scores} />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
