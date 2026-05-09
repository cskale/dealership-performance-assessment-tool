import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CategoryAssessment } from "@/components/assessment/CategoryAssessment";
import { AssessmentHeroNav } from "@/components/assessment/AssessmentHeroNav";
import { questionnaire, getTranslatedSection } from "@/data/questionnaire";
import { useAssessmentData, OnboardingError } from "@/hooks/useAssessmentData";
import { calculateAllSectionScores, calculateWeightedScore } from "@/lib/scoringEngine";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoActionGeneration } from "@/hooks/useAutoActionGeneration";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useMultiTenant } from "@/hooks/useMultiTenant";
import { getActiveSections, getSuppressedSectionCount } from "@/lib/moduleGating";

type CompletionState = 'idle' | 'saving' | 'generating_actions' | 'complete' | 'error';

export default function Assessment() {
  useEffect(() => { document.title = 'Assessment — Dealer Diagnostic'; }, []);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completionState, setCompletionState] = useState<CompletionState>('idle');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const {
    assessment,
    saveAssessment,
    loadAssessment,
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

  const canContinue = () => {
    const sectionQuestions = currentSectionData.questions;
    return sectionQuestions.every(q => answers[q.id] !== undefined);
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
        toast({
          title: "Setup Required",
          description: error.message,
          variant: "destructive",
        });
        // Redirect to onboarding
        navigate('/app/onboarding');
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to save assessment. Please try again.";
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

  const handleNavigateToSection = (sectionIndex: number) => {
    setCurrentSection(sectionIndex);
    // Scroll to top of questions area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show blocking overlay during completion
  const isCompleting = completionState !== 'idle' && completionState !== 'error';

  return (
    <div className="min-h-screen">
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
                    {completionState === 'generating_actions' && 'Analysing responses and creating improvement actions.'}
                    {completionState === 'complete' && 'Redirecting to your results...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AssessmentHeroNav
        sections={translatedSections}
        currentSection={currentSection}
        answers={answers}
        onSectionChange={(idx) => !isCompleting && handleNavigateToSection(idx)}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        dealershipName={onboardingContext.dealershipName ?? undefined}
        disabled={isCompleting}
      />

      <div className="px-6 pb-8">
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

        <div
          key={currentSection}
          className="animate-in fade-in slide-in-from-right-4 duration-200"
        >
          <CategoryAssessment
            section={currentSectionData}
            answers={answers}
            onAnswer={handleAnswer}
            onContinue={nextSection}
            canContinue={canContinue()}
            isLastSection={currentSection === translatedSections.length - 1}
          />
        </div>
      </div>
    </div>
  );
}
