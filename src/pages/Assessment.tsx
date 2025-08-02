import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Car, Wrench, Package, DollarSign, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { SectionNavigation } from "@/components/assessment/SectionNavigation";
import { questionnaire } from "@/data/questionnaire";

export default function Assessment() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void | null>(null);
  const { toast } = useToast();

  const sections = questionnaire.sections;
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    toast({
      title: "Answer Saved",
      description: "Your response has been recorded.",
      duration: 1000,
    });
  };

  const navigateToQuestion = (sectionIndex: number, questionIndex: number) => {
    if (hasUnsavedChanges()) {
      setPendingNavigation(() => () => {
        setCurrentSection(sectionIndex);
        setCurrentQuestion(questionIndex);
      });
      setShowConfirmDialog(true);
    } else {
      setCurrentSection(sectionIndex);
      setCurrentQuestion(questionIndex);
    }
  };

  const hasUnsavedChanges = () => {
    if (!currentQuestionData) return false;
    return !(currentQuestionData.id in answers);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
    }
  };

  const canGoNext = () => {
    return currentSection < sections.length - 1 || currentQuestion < currentSectionData.questions.length - 1;
  };

  const canGoPrev = () => {
    return currentSection > 0 || currentQuestion > 0;
  };

  const getSectionIcon = (sectionTitle: string) => {
    if (sectionTitle.includes("New Vehicle")) return Car;
    if (sectionTitle.includes("Used Vehicle")) return Car;
    if (sectionTitle.includes("Service")) return Wrench;
    if (sectionTitle.includes("Parts")) return Package;
    return BarChart3;
  };

  const getSectionColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Dealership Performance Assessment</h1>
          </div>
          <p className="text-gray-600 mb-6">Comprehensive analysis of your dealership's operational excellence</p>
          
          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{answeredQuestions} of {totalQuestions} questions</span>
            </div>
            <Progress value={progress} className="h-3" />
            <Badge variant="outline" className="mt-2">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <SectionNavigation
              sections={sections}
              currentSection={currentSection}
              currentQuestion={currentQuestion}
              answers={answers}
              onNavigate={navigateToQuestion}
              getSectionIcon={getSectionIcon}
              getSectionColor={getSectionColor}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getSectionIcon(currentSectionData.title);
                    return <Icon className="h-6 w-6" />;
                  })()}
                  <div>
                    <CardTitle className="text-xl">{currentSectionData.title}</CardTitle>
                    <p className="text-blue-100 text-sm">
                      Question {currentQuestion + 1} of {currentSectionData.questions.length}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {currentQuestionData && (
                  <QuestionCard
                    question={currentQuestionData}
                    value={answers[currentQuestionData.id]}
                    onChange={(value) => handleAnswer(currentQuestionData.id, value)}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={!canGoPrev()}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {canGoNext() ? (
                      <Button
                        onClick={nextQuestion}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => window.location.href = "/results"}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        View Results
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes on this question. Are you sure you want to navigate away?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingNavigation) {
                    pendingNavigation();
                    setPendingNavigation(null);
                  }
                  setShowConfirmDialog(false);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}