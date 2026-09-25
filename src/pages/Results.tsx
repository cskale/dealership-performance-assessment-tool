import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, RefreshCw, ArrowLeft, ClipboardList, CheckSquare, AlertCircle, Globe } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ActionPlan } from "@/components/ActionPlan";
import { useLanguage } from "@/contexts/LanguageContext";

import { ExportPDFModal } from "@/components/ExportPDFModal";
import { useAuth } from "@/hooks/useAuth";
import { useMultiTenant } from "@/hooks/useMultiTenant";
import { useActiveRole } from "@/hooks/useActiveRole";
import { useKpiValues } from "@/hooks/useKpiValues";
import { useDealershipAssessments } from "@/hooks/useDealershipAssessments";
import { TierBadge } from "@/components/shared/TierBadge";
import { supabase } from "@/integrations/supabase/client";
import type { PDFExportData } from "@/lib/pdfReportGenerator";
import { calculateWeightedScore } from "@/lib/scoringEngine";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { getAssessmentFreshness } from "@/lib/assessmentFreshness";
import { useAssessmentNotes } from "@/hooks/useAssessmentNotes";

interface ResultsData {
  assessmentId: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  completedAt: string;
  dealershipId: string | null;
}

interface ResultsQueryResult {
  data: ResultsData | null;
  notFound: boolean;
}

async function fetchResultsData(userId: string | undefined, routeAssessmentId: string | undefined): Promise<ResultsQueryResult> {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (userId) {
    try {
      let query = supabase
        .from('assessments')
        .select('id, answers, scores, overall_score, completed_at, status, dealership_id')
        .eq('status', 'completed');

      if (routeAssessmentId) {
        query = query.eq('id', routeAssessmentId);
      } else {
        query = query
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1);
      }

      const { data: dbAssessment, error } = await query.single();

      if (error && routeAssessmentId) {
        return { data: null, notFound: true };
      }

      if (dbAssessment && dbAssessment.answers && Object.keys(dbAssessment.answers as object).length > 0) {
        return {
          data: {
            assessmentId: dbAssessment.id,
            answers: dbAssessment.answers as Record<string, number>,
            scores: dbAssessment.scores as Record<string, number>,
            completedAt: dbAssessment.completed_at || new Date().toISOString(),
            dealershipId: (dbAssessment as any).dealership_id ?? null,
          },
          notFound: false,
        };
      }
    } catch (err) {
      console.warn('DB assessment load failed, falling back to localStorage:', err);
    }
  }

  if (!routeAssessmentId) {
    const completedResults = localStorage.getItem('completed_assessment_results');
    if (completedResults) {
      const data = JSON.parse(completedResults);
      if (data._expiresAt && Date.now() > data._expiresAt) {
        localStorage.removeItem('completed_assessment_results');
      } else {
        if (!data.assessmentId) {
          data.assessmentId = crypto.randomUUID();
          localStorage.setItem('completed_assessment_results', JSON.stringify(data));
        }
        return { data, notFound: false };
      }
    }
  }

  return { data: null, notFound: false };
}

async function fetchPdfActions(assessmentId: string, organizationId: string | undefined): Promise<PDFExportData['actions']> {
  try {
    let query = supabase
      .from('improvement_actions')
      .select('action_title, action_description, priority, status, responsible_person, target_completion_date, department')
      .eq('assessment_id', assessmentId);
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    const { data } = await query;
    return (data as any) || [];
  } catch {
    return [];
  }
}

export default function Results() {
  useEffect(() => { document.title = 'Results — Dealer Diagnostic'; }, []);
  const { assessmentId: routeAssessmentId } = useParams<{ assessmentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showExportModal, setShowExportModal] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const { actorType } = useActiveRole();

  // Load completed assessment results
  const { data: resultsQuery, isLoading } = useQuery({
    queryKey: ['results-data', user?.id, routeAssessmentId],
    queryFn: () => fetchResultsData(user?.id, routeAssessmentId),
  });

  const resultsData = resultsQuery?.data ?? null;
  const activeTab = searchParams.get('tab') === 'action-plan' ? 'action-plan' : 'diagnosis';
  const loadError = resultsQuery?.notFound
    ? (language === 'de'
        ? 'Diese Bewertung wurde nicht gefunden oder Sie haben keinen Zugriff darauf.'
        : 'This assessment was not found or you do not have access to it.')
    : null;

  const { notes } = useAssessmentNotes(resultsData?.assessmentId);
  const { data: kpiValues = [] } = useKpiValues(resultsData?.assessmentId);
  const { data: dealershipAssessments = [], isLoading: assessmentsLoading } = useDealershipAssessments(resultsData?.dealershipId);
  const [oemDealerContext, setOemDealerContext] = useState<{
    name: string;
    tier: string | null;
  } | null>(null);

  useEffect(() => {
    if (!resultsQuery || isLoading) return;
    if (!resultsQuery.notFound && !resultsQuery.data) {
      toast({ title: t('results.noResults'), description: t('results.completeFirst'), variant: "destructive" });
      navigate('/app/assessment');
    }
  }, [resultsQuery, isLoading, navigate, toast, t]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab === 'diagnosis' || requestedTab === 'action-plan') return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'diagnosis');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const overallScore = useMemo(() => {
    if (!resultsData?.scores) return 0;
    return calculateWeightedScore(resultsData.scores);
  }, [resultsData?.scores]);

  const handleRetakeAssessment = () => {
    localStorage.removeItem('completed_assessment_results');
    localStorage.removeItem('assessment_data');
    toast({ title: t('results.assessmentReset'), description: t('results.startingFresh') });
    navigate('/app/assessment');
  };

  const { data: pdfActions = [] } = useQuery({
    queryKey: ['pdf-actions', resultsData?.assessmentId, currentOrganization?.id],
    queryFn: () => fetchPdfActions(resultsData!.assessmentId, currentOrganization?.id),
    enabled: !!user && !!resultsData?.assessmentId,
  });

  useEffect(() => {
    if (actorType !== 'oem' || !(resultsData as any)?.dealershipId) return;
    const dealershipId = (resultsData as any).dealershipId;
    supabase
      .from('dealerships')
      .select('name')
      .eq('id', dealershipId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setOemDealerContext(prev => ({ name: data.name, tier: prev?.tier ?? null }));
      });
    supabase
      .from('dealer_network_memberships')
      .select('programme_tier')
      .eq('dealership_id', dealershipId)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setOemDealerContext(prev => prev ? { ...prev, tier: data.programme_tier } : null);
      });
  }, [actorType, (resultsData as any)?.dealershipId]);

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
    fieldNotes: notes,
    kpiValues,
  } : null;

  const formatDate = (dateString: string) => {
    const locales = { en: 'en-GB', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', it: 'it-IT' } as const;
    return new Date(dateString).toLocaleDateString(locales[language], {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleTabChange = (tab: string) => {
    if (tab !== 'diagnosis' && tab !== 'action-plan') return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  const handleAssessmentChange = (assessmentId: string) => {
    navigate(`/app/results/${assessmentId}?${searchParams.toString()}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full mx-4 shadow-card rounded-xl">
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
      {actorType === 'oem' && oemDealerContext && (
        <div className="bg-[hsl(var(--brand-50))] border-b border-[hsl(var(--brand-200))] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--brand-700))]">
            <Globe className="h-4 w-4 shrink-0" />
            <span>Viewing as OEM</span>
            <span className="text-[hsl(var(--brand-400))]">·</span>
            <span className="font-medium">{oemDealerContext.name}</span>
            {oemDealerContext.tier && (
              <TierBadge tier={oemDealerContext.tier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--brand-700))] hover:text-[hsl(var(--brand-900))] gap-1"
            onClick={() => navigate('/app/oem-dashboard')}
          >
            ← Back to OEM Dashboard
          </Button>
        </div>
      )}
      <div className="px-6 py-6" id="results-content">

        {/* Results shell */}
        <div className="mb-8">
          {/* Precision Header */}
          <header className="mb-6">
            <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="text-caption uppercase tracking-wider text-muted-foreground">
                    {t('results.title')}
                  </p>
                  <h1 className="mt-1 text-h2 text-foreground">
                    {oemDealerContext?.name || currentOrganization?.name || t('results.title')}
                  </h1>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    {t('results.completedOn')} {formatDate(resultsData.completedAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 sm:w-60">
                    <label htmlFor="assessment-picker" className="mb-1.5 block text-label text-muted-foreground">
                      {t('results.picker.label')}
                    </label>
                    <Select
                      value={resultsData.assessmentId}
                      onValueChange={handleAssessmentChange}
                      disabled={assessmentsLoading || dealershipAssessments.length === 0}
                    >
                      <SelectTrigger id="assessment-picker" aria-label={t('results.picker.label')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dealershipAssessments.map((assessment) => (
                          <SelectItem key={assessment.id} value={assessment.id}>
                            {formatDate(assessment.completed_at ?? assessment.created_at)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </header>

          {/* Stale assessment banner */}
          {(() => {
            const freshness = getAssessmentFreshness(resultsData.completedAt);
            if (freshness.status !== 'stale') return null;
            return (
              <div className="flex items-center justify-between gap-3 bg-amber-50 border-l-[3px] border-l-amber-600 rounded-md px-4 py-2.5 text-xs text-amber-800 mb-4">
                <span>
                  This assessment is {freshness.daysSince} days old. Market conditions and team changes may mean your diagnostic no longer reflects current reality. Consider running a refresh assessment.
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/app/assessment')}
                  className="text-[11px] text-amber-800 border border-amber-600 bg-transparent px-2.5 py-1 rounded-md cursor-pointer font-medium whitespace-nowrap hover:bg-amber-100 transition-colors"
                >
                  Reassess
                </button>
              </div>
            );
          })()}

        </div>

        <ExportPDFModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          exportData={pdfExportData}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid h-11 w-full grid-cols-2 border border-border bg-card">
            <TabsTrigger value="diagnosis" className="gap-1.5 text-body-sm">
              <ClipboardList className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.diagnosis')}
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="gap-1.5 text-body-sm">
              <CheckSquare className="h-4 w-4 hidden sm:inline" />
              {t('results.tab.actionPlan')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis" className="animate-fade-in">
            <div data-results-hero-placeholder />
          </TabsContent>

          <TabsContent value="action-plan" className="space-y-6 animate-fade-in">
            <ErrorBoundary fallbackTitle={language === 'de' ? 'Maßnahmenplan nicht verfügbar' : 'Action Plan unavailable'}>
              <ActionPlan assessmentId={resultsData.assessmentId} notes={notes} />
            </ErrorBoundary>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
