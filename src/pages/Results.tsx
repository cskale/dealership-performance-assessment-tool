import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { FileText, RefreshCw, ArrowLeft, ClipboardList, BarChart3, Award, CheckSquare, BookOpen, AlertCircle } from "lucide-react";
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

  // Load completed assessment results — supports both specific ID and latest
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
            // Load specific assessment by ID
            query = query.eq('id', routeAssessmentId);
          } else {
            // Load latest completed
            query = query.order('completed_at', { ascending: false }).limit(1);
          }

          const { data: dbAssessment, error } = await query.single();
          
          if (error && routeAssessmentId) {
            // Specific assessment not found or unauthorized
            setLoadError(
              language === 'de' 
                ? 'Diese Bewertung wurde nicht gefunden oder Sie haben keinen Zugriff darauf.' 
                : 'This assessment was not found or you do not have access to it.'
            );
            setIsLoading(false);
            return;
          }
          
          if (dbAssessment && dbAssessment.answers && Object.keys(dbAssessment.answers as object).length > 0) {
            const data = {
              assessmentId: dbAssessment.id,
              answers: dbAssessment.answers,
              scores: dbAssessment.scores,
              completedAt: dbAssessment.completed_at || new Date().toISOString(),
            };
            setResultsData(data);
            loaded = true;
          }
        } catch (err) {
          console.warn('DB assessment load failed, falling back to localStorage:', err);
        }
      }

      // Fallback to localStorage only when no specific ID requested
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
        toast({
          title: t('results.noResults'),
          description: t('results.completeFirst'),
          variant: "destructive",
        });
        navigate('/app/assessment');
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [navigate, toast, t, user, routeAssessmentId]);

  // Calculate weighted overall score ONCE - memoized
  const overallScore = useMemo(() => {
    if (!resultsData?.scores) return 0;
    return calculateWeightedScore(resultsData.scores);
  }, [resultsData?.scores]);

  // Animate score on load
  useEffect(() => {
    if (overallScore > 0 && !isLoading) {
      const duration = 1200;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(overallScore * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [overallScore, isLoading]);

  const handleRetakeAssessment = () => {
    localStorage.removeItem('completed_assessment_results');
    localStorage.removeItem('assessment_data');
    toast({
      title: t('results.assessmentReset'),
      description: t('results.startingFresh'),
    });
    navigate('/app/assessment');
  };

  // Load actions for PDF export
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

  // Build PDF export data
  const pdfExportData: PDFExportData | null = resultsData ? {
    organization: currentOrganization ? {
      name: currentOrganization.name,
      logo_url: (currentOrganization as any).logo_url || null,
      default_language: (currentOrganization as any).default_language || language,
    } : {
      name: 'Dealership',
      default_language: language,
    },
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
    if (score >= 80) return { label: t('results.excellent'), color: 'bg-success' };
    if (score >= 60) return { label: t('results.good'), color: 'bg-warning' };
    return { label: t('results.needsImprovement'), color: 'bg-destructive' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNavigateToResources = () => {
    setActiveTab("resources");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <AppHeader />
        <div className="p-4 max-w-7xl mx-auto pt-8">
          <div className="text-center mb-8 animate-fade-in">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto mb-8" />
            <Skeleton className="h-48 w-48 rounded-full mx-auto mb-8" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Error state — contextual in-app error, not generic 404
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {language === 'de' ? 'Ergebnisse nicht verfügbar' : 'Results Unavailable'}
              </h2>
              <p className="text-sm text-muted-foreground">{loadError}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(overallScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <AppHeader />
      
      <div className="p-4 max-w-7xl mx-auto" id="results-content">
        {/* Unified Results Hero */}
        <div className="text-center mb-8 animate-fade-in pt-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('nav.backToDashboard')}
            </Button>
            <Button
              onClick={handleRetakeAssessment}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('results.retakeAssessment')}
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {language === 'de' ? 'Industrielle Bewertungsergebnisse' : 'Industrial Assessment Results'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'de' ? 'Umfassende Analyse abgeschlossen am' : 'Comprehensive analysis completed on'} {formatDate(resultsData.completedAt)}
          </p>
          
          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <svg className="w-40 h-40 md:w-48 md:h-48" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        className={getScoreColor(overallScore)}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(animatedScore / 100) * 283} 283`}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dasharray 0.1s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl md:text-6xl font-bold text-foreground">{animatedScore}</span>
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-2">{language === 'de' ? 'Gewichtete Punktzahl' : 'Weighted Score'}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {language === 'de' 
                      ? 'Diese Punktzahl wird nach Geschäftsbereich gewichtet berechnet:' 
                      : 'This score is calculated with weighted categories:'}
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• {language === 'de' ? 'Neuwagenverkauf' : 'New Vehicle Sales'}: 25%</li>
                    <li>• {language === 'de' ? 'Gebrauchtwagenverkauf' : 'Used Vehicle Sales'}: 20%</li>
                    <li>• {language === 'de' ? 'Serviceleistung' : 'Service Performance'}: 20%</li>
                    <li>• {language === 'de' ? 'Finanzoperationen' : 'Financial Operations'}: 20%</li>
                    <li>• {language === 'de' ? 'Teile & Lager' : 'Parts & Inventory'}: 15%</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Badge className={`${scoreInfo.color} text-white text-base px-4 py-2 mb-6`}>
            {scoreInfo.label}
          </Badge>

          <div className="flex justify-center gap-4">
            <Button onClick={() => setShowExportModal(true)} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('results.exportPDF')}
            </Button>
          </div>
        </div>

        <ExportPDFModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          exportData={pdfExportData}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/90 backdrop-blur-sm border shadow-lg h-12">
            <TabsTrigger value="executive" className="text-xs sm:text-sm gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 hidden sm:inline" />
              {t('results.tab.executive')}
            </TabsTrigger>
            <TabsTrigger value="kpi" className="text-xs sm:text-sm gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 hidden sm:inline" />
              {t('results.tab.kpi')}
            </TabsTrigger>
            <TabsTrigger value="maturity" className="text-xs sm:text-sm gap-1.5">
              <Award className="h-3.5 w-3.5 hidden sm:inline" />
              {t('results.tab.maturity')}
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="text-xs sm:text-sm gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 hidden sm:inline" />
              {t('results.tab.actionPlan')}
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs sm:text-sm gap-1.5">
              <BookOpen className="h-3.5 w-3.5 hidden sm:inline" />
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
