import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Car, Wrench, Package, BarChart3, Bot, Check, Loader2, AlertCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (onboardingStatus === 'needs_organization' || onboardingStatus === 'needs_dealership') {
      navigate('/app/onboarding');
    }
  }, [onboardingStatus, navigate]);

  const translatedSections = useMemo(() => {
    return questionnaire.sections.map(section => getTranslatedSection(section, language));
  }, [language]);

  const totalQuestions = translatedSections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentSectionData = translatedSections[currentSection];

  const calculateScores = useCallback((currentAnswers: Record<string, number>) => {
    return calculateAllSectionScores(translatedSections, currentAnswers);
  }, [translatedSections]);

  const handleAnswer = async (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    const newScores = calculateScores(newAnswers);
    setScores(newScores);
    
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

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        await loadAssessment();
      } catch (error) {
        console.error('Failed to load assessment:', error);
      }
    };
    loadExistingData();
  }, []);

  useEffect(() => {
    if (assessment) {
      setAnswers(assessment.answers || {});
      setScores(assessment.scores || {});
    }
  }, [assessment]);

  const handleFinishAssessment = async () => {
    if (completionState !== 'idle') return;

    setCompletionState('saving');
    setCompletionError(null);
    
    try {
      const finalScores = calculateScores(answers);
      const overallScore = Object.values(finalScores).length > 0 
        ? calculateWeightedScore(finalScores)
        : 0;
        
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
      
      const savedAssessment = await saveAssessment({
        answers,
        scores: finalScores,
        overallScore,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      });

      const realAssessmentId = savedAssessment.dbId || savedAssessment.id;
      
      if (!realAssessmentId) {
        throw new Error('Failed to get assessment ID from database');
      }

      if (import.meta.env.DEV) {
        console.log('[Assessment] Saved with DB ID:', realAssessmentId);
      }
      
      localStorage.removeItem('assessment_data');
      
      localStorage.setItem('completed_assessment_results', JSON.stringify({
        answers,
        scores: finalScores,
        overallScore,
        completedAt: new Date().toISOString(),
        assessmentId: realAssessmentId,
        _expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
      }));
      
      setCompletionState('generating_actions');
      
      let actionResult: { success: boolean; actionsGenerated: number; error?: string } = { success: true, actionsGenerated: 0, error: undefined };
      
      if (autoActionsEnabled && onboardingContext.organizationId) {
        try {
          actionResult = await generateActions(
            realAssessmentId,
            answers,
            onboardingContext.organizationId
          );
          
          if (actionResult.success && actionResult.actionsGenerated > 0) {
            if (import.meta.env.DEV) {
              console.log(`[Assessment] Auto-generated ${actionResult.actionsGenerated} improvement actions`);
            }
          } else if (!actionResult.success) {
            console.warn('[Assessment] Action generation failed:', actionResult.error);
          }
        } catch (actionError) {
          console.error('[Assessment] Action generation error:', actionError);
          actionResult = { success: false, actionsGenerated: 0, error: 'Action generation failed' };
        }
      }
      
      setCompletionState('complete');
      
      if (actionResult.actionsGenerated > 0) {
        toast({
          title: t('assessment.assessmentComplete'),
          description: `${t('assessment.resultsReady')} ${actionResult.actionsGenerated} improvement actions generated.`,
        });
      } else if (actionResult.error) {
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
      
      navigate('/app/results');
      
    } catch (error) {
      console.error('Assessment completion error:', error);
      setCompletionState('error');
      
      if (error instanceof OnboardingError) {
        setCompletionError(error.message);
        toast({
          title: "Setup Required",
          description: error.message,
          variant: "destructive",
        });
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
      
      setTimeout(() => {
        setCompletionState('idle');
      }, 2000);
    }
  };

  const handleNavigateToSection = (sectionIndex: number, questionIndex: number) => {
    setCurrentSection(sectionIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCompleting = completionState !== 'idle' && completionState !== 'error';

  return (
    <div className="min-h-screen bg-[hsl(var(--dd-fog))]">
      {/* Completion Overlay */}
      {isCompleting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {completionState === 'saving' && 'Saving Assessment...'}
                    {completionState === 'generating_actions' && 'Generating Action Plan...'}
                    {completionState === 'complete' && 'Complete!'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
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
      <div className="sticky top-0 z-10 bg-white border-b border-[hsl(var(--dd-rule))]">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-foreground">{t('assessment.title')}</h1>
              {onboardingContext.dealershipName && (
                <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                  {onboardingContext.dealershipName}
                </Badge>
              )}
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {Math.round(progress)}%
              </div>
              <div className="text-[10px] text-muted-foreground">{t('assessment.complete')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Horizontal Section Pills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {translatedSections.map((section, sectionIndex) => {
              const sectionAnswered = section.questions.filter(q => answers[q.id] !== undefined).length;
              const sectionTotal = section.questions.length;
              const sectionProgress = (sectionAnswered / sectionTotal) * 100;
              const isCurrent = sectionIndex === currentSection;
              const isComplete = sectionProgress === 100;
              const Icon = getSectionIcon(section.title);

              return (
                <button
                  key={section.id}
                  onClick={() => !isCompleting && handleNavigateToSection(sectionIndex, 0)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all',
                    isCurrent
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isComplete
                      ? 'bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-green))] border-[#6ee7b7]'
                      : 'bg-muted text-muted-foreground border-border cursor-pointer hover:border-primary/50'
                  )}
                  disabled={isCompleting}
                >
                  {isComplete && !isCurrent && <Check className="h-3 w-3" />}
                  {isCurrent && <Icon className="h-3.5 w-3.5" />}
                  <span>{section.title} ({sectionTotal}q)</span>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {answeredQuestions} of {totalQuestions} questions · {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Questions — full width */}
        <div>
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
            <Card className="mt-6 bg-muted/50">
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

      {/* Smart Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowAssistant(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg animate-bounce"
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
