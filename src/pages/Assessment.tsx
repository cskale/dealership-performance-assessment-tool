import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Car, Wrench, Package, BarChart3, Bot, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CategoryAssessment } from "@/components/assessment/CategoryAssessment";
import { SmartAssistant } from "@/components/SmartAssistant";
import { questionnaire, getTranslatedSection } from "@/data/questionnaire";
import { useAssessmentData } from "@/hooks/useAssessmentData";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Assessment() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAssistant, setShowAssistant] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { 
    assessment, 
    saveAssessment, 
    loadAssessment, 
    isLoading 
  } = useAssessmentData();

  // Get translated sections
  const translatedSections = useMemo(() => {
    return questionnaire.sections.map(section => getTranslatedSection(section, language));
  }, [language]);

  const totalQuestions = translatedSections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentSectionData = translatedSections[currentSection];

  // Calculate real-time scores
  const calculateScores = useCallback((currentAnswers: Record<string, number>) => {
    const sectionScores: Record<string, number> = {};
    
    translatedSections.forEach((section) => {
      const sectionAnswers = section.questions
        .map(q => currentAnswers[q.id])
        .filter(answer => answer !== undefined);
      
      if (sectionAnswers.length > 0) {
        const average = sectionAnswers.reduce((sum, answer) => sum + answer, 0) / sectionAnswers.length;
        sectionScores[section.id] = Math.round((average / 5) * 100);
      }
    });
    
    return sectionScores;
  }, [translatedSections]);

  const handleAnswer = async (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Calculate real-time scores
    const newScores = calculateScores(newAnswers);
    setScores(newScores);
    
    // Auto-save to local storage
    try {
      const overallScore = Object.values(newScores).length > 0 
        ? Math.round(Object.values(newScores).reduce((sum, score) => sum + score, 0) / Object.values(newScores).length)
        : 0;
        
      await saveAssessment({
        answers: newAnswers,
        scores: newScores,
        overallScore,
        status: 'in_progress' as const
      });
    } catch (error) {
      console.error('Failed to save assessment:', error);
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
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
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

  const handleFinishAssessment = async () => {
    try {
      const finalScores = calculateScores(answers);
      const overallScore = Object.values(finalScores).length > 0 
        ? Math.round(Object.values(finalScores).reduce((sum, score) => sum + score, 0) / Object.values(finalScores).length)
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
        return;
      }
      
      await saveAssessment({
        answers,
        scores: finalScores,
        overallScore,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      });
      
      // Clear assessment from localStorage to allow fresh start
      localStorage.removeItem('assessment_data');
      
      // Store completed assessment results for the results page with unique ID
      const assessmentId = crypto.randomUUID();
      localStorage.setItem('completed_assessment_results', JSON.stringify({
        answers,
        scores: finalScores,
        overallScore,
        completedAt: new Date().toISOString(),
        assessmentId
      }));
      
      // Show success message and navigate
      toast({
        title: t('assessment.assessmentComplete'),
        description: t('assessment.resultsReady'),
      });
      
      navigate('/app/results');
    } catch (error) {
      console.error('Assessment completion error:', error);
      toast({
        title: t('common.error'),
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToSection = (sectionIndex: number, questionIndex: number) => {
    setCurrentSection(sectionIndex);
    // Scroll to top of questions area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--neutral-bg))]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('nav.backToDashboard')}
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-foreground">{t('assessment.title')}</h1>
            </div>
            <div className="text-center">
              <div className="text-xl font-medium text-foreground">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-muted-foreground">{t('assessment.complete')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 w-full">
          {/* Left Sidebar - Sections Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Card className="border-2">
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
                        className={`transition-all duration-200 cursor-pointer border-2 ${
                          isCurrentSection 
                            ? "border-primary shadow-md bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                        onClick={() => handleNavigateToSection(sectionIndex, 0)}
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
                  <Card className="border-primary/20 bg-primary/5 mt-4">
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
              <Card className="mt-6 bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={prevSection}
                      disabled={currentSection === 0}
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
                      disabled={currentSection === translatedSections.length - 1 && !canContinue()}
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
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowAssistant(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg animate-bounce"
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
