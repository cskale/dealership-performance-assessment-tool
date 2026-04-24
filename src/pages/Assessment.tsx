import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Car, Wrench, Package, BarChart3, Bot, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CategoryAssessment } from "@/components/assessment/CategoryAssessment";
import { SmartAssistant } from "@/components/SmartAssistant";
import { questionnaire, getTranslatedSection } from "@/data/questionnaire";
import { useAssessmentData, OnboardingError } from "@/hooks/useAssessmentData";
import { calculateAllSectionScores, calculateWeightedScore } from "@/lib/scoringEngine";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoActionGeneration } from "@/hooks/useAutoActionGeneration";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { useMultiTenant } from "@/hooks/useMultiTenant";
import { getActiveSections, getSuppressedSectionCount, BusinessModel } from "@/lib/moduleGating";

type CompletionState = 'idle' | 'saving' | 'generating_actions' | 'complete' | 'error';

export default function Assessment() {
  useEffect(() => { document.title = 'Assessment — Dealer Diagnostic'; }, []);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAssistant, setShowAssistant] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completionState, setCompletionState] = useState<CompletionState>('idle');
  const [completionError, setCompletionError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { 
    assessment, 
    saveAssessment, 
    loadAssessment, 
    isLoading 
  } = useAssessmentData();
  
  const { generateActions, isEnabled: autoActionsEnabled } = useAutoActionGeneration();
  const { status: onboardingStatus, context: onboardingContext } = useOnboarding();
  const { currentOrganization } = useMultiTenant();
  const businessModel = currentOrganization?.business_model ?? null;

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (onboardingStatus === 'needs_organization' || onboardingStatus === 'needs_dealership') {
      navigate('/app/onboarding');
    }
  }, [onboardingStatus, navigate]);

  // Get translated sections (filtered by business model)
  const translatedSections = useMemo(() => {
    return getActiveSections(questionnaire.sections, businessModel).map(section => getTranslatedSection(section, language));
  }, [language, businessModel]);

  const totalQuestions = translatedSections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentSectionData = translatedSections[currentSection];

  // Calculate real-time scores using question weights
  const calculateScores = useCallback((currentAnswers: Record<string, number>) => {
    return calculateAllSectionScores(translatedSections, currentAnswers);
  }, [translatedSections]);

  const handleAnswer = async (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Calculate real-time scores
    const newScores = calculateScores(newAnswers);
    setScores(newScores);
    
    // Auto-save to local storage (in-progress, non-blocking)
    try {
      const overallScore = Object.values(newScores).length > 0 
        ? calculateWeightedScore(newScores)
        : 0;
        
      await saveAssessment({
        answers: newAnswers,
        scores: newScores,
        overallScore,
        status: 'in_progress' as const
      });
    } catch (error) {
      // Don't show error for in-progress saves - just log
      if (import.meta.env.DEV) {
        console.warn('Failed to auto-save assessment:', error);
      }
    }
    
    toast({
      title: t('assessment.answerSaved'),
      description: t('assessment.responseRecorded'),
      duration: 1000,
    });
  };

  const nextSection = () => {
    if (currentSection < translatedSections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinishAssessment();
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canContinue = () => {
    const sectionQuestions = currentSectionData.questions;
    return sectionQuestions.every(q => answers[q.id] !== undefined);
  };


  const getSectionIcon = (sectionTitle: string) => {
    if (sectionTitle.includes("New Vehicle") || sectionTitle.includes("Neuwagen")) return Car;
    if (sectionTitle.includes("Used Vehicle") || sectionTitle.includes("Gebrauchtwagen")) return Car;
    if (sectionTitle.includes("Service")) return Wrench;
    if (sectionTitle.includes("Parts") || sectionTitle.includes("Teile")) return Package;
    return BarChart3;
  };

  const getSectionColor = (index: number) => {
    const colors = ["bg-primary", "bg-success", "bg-discovery", "bg-warning", "bg-info"];
    return colors[index % colors.length];
  };

  // Load existing assessment data on mount (only once)
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        await loadAssessment();
      } catch (error) {
        console.error('Failed to load assessment:', error);
      }
    };
    
    loadExistingData();
  }, []); // Remove dependencies to prevent infinite loop

  // Sync with loaded assessment data
  useEffect(() => {
    if (assessment) {
      setAnswers(assessment.answers || {});
      setScores(assessment.scores || {});
    }
  }, [assessment]);

  /**
   * CRITICAL: Assessment completion flow
   * 
   * This is an ATOMIC operation that:
   * 1. Validates user has org/dealership context
   * 2. Saves assessment to DB with DB-generated ID
   * 3. Generates actions using that real ID
   * 4. Only then navigates to results
   * 
   * NO fire-and-forget. NO client UUIDs. NO silent failures.
   */
  const handleFinishAssessment = async () => {
    // Prevent double-submission
    if (completionState !== 'idle') return;

    setCompletionState('saving');
    setCompletionError(null);
    
    try {
      const finalScores = calculateScores(answers);
      const overallScore = Object.values(finalScores).length > 0 
        ? calculateWeightedScore(finalScores)
        : 0;
        
      // Check if all questions are answered
      const totalQs = translatedSections.reduce((total, section) => total + section.questions.length, 0);
      const answeredQs = Object.keys(answers).length;
      
      if (answeredQs < totalQs) {
        toast({
          title: t('assessment.incomplete'),
          description: `${t('assessment.pleaseAnswerAll')} ${answeredQs}/${totalQs} ${t('assessment.completed')}.`,
          variant: "destructive",
        });
        setCompletionState('idle');
        return;
      }
      
      // STEP 1: Save assessment to database
      // This validates org/dealership and returns real DB ID
      const savedAssessment = await saveAssessment({
        answers,
        scores: finalScores,
        overallScore,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      });

      // Get the real DB-generated assessment ID
      const realAssessmentId = savedAssessment.dbId || savedAssessment.id;
      
      if (!realAssessmentId) {
        throw new Error('Failed to get assessment ID from database');
      }

      if (import.meta.env.DEV) {
        console.log('[Assessment] Saved with DB ID:', realAssessmentId);
      }
      
      // Clear in-progress data from localStorage
      localStorage.removeItem('assessment_data');
      
      // Store completed results for the results page
      localStorage.setItem('completed_assessment_results', JSON.stringify({
        answers,
        scores: finalScores,
        overallScore,
        completedAt: new Date().toISOString(),
        assessmentId: realAssessmentId, // Real DB ID
        _expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
      }));
      
      // STEP 2: Generate actions using REAL assessment ID
      setCompletionState('generating_actions');
      
      let actionResult: { success: boolean; actionsGenerated: number; error?: string } = { success: true, actionsGenerated: 0, error: undefined };
      
      if (autoActionsEnabled && onboardingContext.organizationId) {
        try {
          actionResult = await generateActions(
            realAssessmentId,  // Real DB-generated UUID
            answers,
            onboardingContext.organizationId,
            businessModel ?? undefined,
            finalScores       // Enables ceiling-pass signals for high-scoring dealers
          );
          
          if (actionResult.success && actionResult.actionsGenerated > 0) {
            if (import.meta.env.DEV) {
              console.log(`[Assessment] Auto-generated ${actionResult.actionsGenerated} improvement actions`);
            }
          } else if (!actionResult.success) {
            // Log but don't block - action generation failure is non-fatal
            console.warn('[Assessment] Action generation failed:', actionResult.error);
          }
        } catch (actionError) {
          // Don't block assessment completion if action generation fails
          console.error('[Assessment] Action generation error:', actionError);
          actionResult = { success: false, actionsGenerated: 0, error: 'Action generation failed' };
        }
      }
      
      setCompletionState('complete');
      
      // Show appropriate success message
      if (actionResult.actionsGenerated > 0) {
        toast({
          title: t('assessment.assessmentComplete'),
          description: `${t('assessment.resultsReady')} ${actionResult.actionsGenerated} improvement actions generated.`,
        });
      } else if (actionResult.error) {
        // Assessment saved but actions failed - show warning
        toast({
          title: t('assessment.assessmentComplete'),
          description: "Assessment saved. Action generation encountered an issue - you can generate actions manually.",
          variant: "default",
        });
      } else {
        toast({
          title: t('assessment.assessmentComplete'),
          description: t('assessment.resultsReady'),
        });
      }
      
      // Navigate to results
      navigate('/app/results');
      
    } catch (error) {
      console.error('Assessment completion error:', error);
      setCompletionState('error');
      
      // Handle specific error types
      if (error instanceof OnboardingError) {
        setCompletionError(error.message);
        toast({
          title: "Setup Required",
          description: error.message,
          variant: "destructive",
        });
        // Redirect to onboarding
        navigate('/app/onboarding');
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to save assessment. Please try again.";
        setCompletionError(errorMessage);
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Reset state after a delay to allow retry
      setTimeout(() => {
        setCompletionState('idle');
      }, 2000);
    }
  };

  const handleNavigateToSection = (sectionIndex: number, questionIndex: number) => {
    setCurrentSection(sectionIndex);
    // Scroll to top of questions area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show blocking overlay during completion
  const isCompleting = completionState !== 'idle' && completionState !== 'error';

  return (
    <div className="min-h-screen bg-muted">
      {/* Completion Overlay */}
      {isCompleting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 shadow-card rounded-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="text-h5">
                    {completionState === 'saving' && 'Saving Assessment...'}
                    {completionState === 'generating_actions' && 'Generating Action Plan...'}
                    {completionState === 'complete' && 'Complete!'}
                  </h3>
                  <p className="text-body-sm text-muted-foreground mt-1">
                    {completionState === 'saving' && 'Please wait while we save your assessment results.'}
                    {completionState === 'generating_actions' && 'Analyzing responses and creating improvement actions.'}
                    {completionState === 'complete' && 'Redirecting to your results...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              disabled={isCompleting}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('nav.backToDashboard')}
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-h5 text-foreground">{t('assessment.title')}</h1>
              {onboardingContext.dealershipName && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {onboardingContext.dealershipName}
                </Badge>
              )}
            </div>
            <div className="text-center">
              <div className="text-h4 text-foreground">
                {Math.round(progress)}%
              </div>
              <div className="text-caption text-muted-foreground">{t('assessment.complete')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {(() => {
          const suppressedCount = getSuppressedSectionCount(questionnaire.sections, businessModel);
          const modelLabel = businessModel?.toUpperCase() ?? '';
          if (suppressedCount === 0 || !businessModel) return null;
          return (
            <div className="mb-4 px-4 py-3 bg-muted border border-border rounded-md text-sm text-muted-foreground">
              {suppressedCount} section{suppressedCount > 1 ? 's are' : ' is'} not shown based on your business model ({modelLabel}). You can update this in{' '}
              <a href="/account" className="underline text-foreground">Settings</a>.
            </div>
          );
        })()}
        <div className="flex gap-6 w-full">
          {/* Left Sidebar - Sections Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="shadow-card rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t('assessment.sections')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {translatedSections.map((section, sectionIndex) => {
                    const sectionAnswered = section.questions.filter(q => answers[q.id] !== undefined).length;
                    const sectionTotal = section.questions.length;
                    const sectionProgress = (sectionAnswered / sectionTotal) * 100;
                    const isCurrentSection = sectionIndex === currentSection;
                    const Icon = getSectionIcon(section.title);
                    
                    return (
                      <Card
                        key={section.id}
                        className={`shadow-card rounded-xl transition-all duration-200 cursor-pointer ${
                          isCurrentSection
                            ? "border border-primary bg-primary/5"
                            : "hover:shadow-elevated"
                        }`}
                        onClick={() => !isCompleting && handleNavigateToSection(sectionIndex, 0)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`p-1.5 rounded ${getSectionColor(sectionIndex)}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm leading-tight">
                                {section.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {sectionTotal} {t('assessment.questions')}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">
                                {sectionAnswered} {t('assessment.completed')}
                              </span>
                              <Badge 
                                variant={sectionProgress === 100 ? "default" : "secondary"}
                                className="text-xs h-5"
                              >
                                {Math.round(sectionProgress)}%
                              </Badge>
                            </div>
                            <Progress value={sectionProgress} className="h-1.5" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Overall Progress Card */}
                  <Card className="bg-primary/5 mt-4 shadow-card rounded-xl">
                    <CardContent className="p-3">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {t('assessment.overallProgress')}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{answeredQuestions} {t('assessment.of')} {totalQuestions}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Content - Questions */}
          <div className="flex-1 min-w-0">
            <CategoryAssessment
              section={currentSectionData}
              answers={answers}
              onAnswer={handleAnswer}
              onContinue={nextSection}
              canContinue={canContinue()}
              isLastSection={currentSection === translatedSections.length - 1}
            />
            
            {/* Section Navigation Buttons */}
            {translatedSections.length > 1 && (
              <Card className="mt-6 bg-muted/50 shadow-card rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={prevSection}
                      disabled={currentSection === 0 || isCompleting}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('assessment.previousSection')}
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {t('assessment.section')} {currentSection + 1} {t('assessment.of')} {translatedSections.length}
                      </div>
                      <div className="font-medium">{currentSectionData.title}</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={nextSection}
                      disabled={(currentSection === translatedSections.length - 1 && !canContinue()) || isCompleting}
                      className="flex items-center gap-2"
                    >
                      {currentSection === translatedSections.length - 1 ? t('assessment.finish') : t('assessment.nextSection')}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Smart Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowAssistant(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          disabled={isCompleting}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* Smart Assistant */}
      <SmartAssistant
        open={showAssistant}
        onOpenChange={setShowAssistant}
        currentQuestion={null}
        currentSection={currentSectionData}
        answers={answers}
        scores={scores}
      />
    </div>
  );
}
