import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare, Save, ChevronRight, AlertCircle, CheckCircle2, StickyNote } from "lucide-react";
import { Question, Section } from "@/data/questionnaire";
import { useAssessmentNotes } from "@/hooks/useAssessmentNotes";
import { useToast } from "@/hooks/use-toast";

interface CategoryAssessmentProps {
  section: Section;
  answers: Record<string, number>;
  onAnswer: (questionId: string, value: number) => void;
  onContinue: () => void;
  canContinue: boolean;
  isLastSection: boolean;
}

export function CategoryAssessment({ 
  section, 
  answers, 
  onAnswer, 
  onContinue, 
  canContinue,
  isLastSection 
}: CategoryAssessmentProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [notesText, setNotesText] = useState<Record<string, string>>({});
  const [autoSaveTimers, setAutoSaveTimers] = useState<Record<string, NodeJS.Timeout>>({});
  
  const { notes, saveNote, hasNotes, getCategoryNoteCount } = useAssessmentNotes();
  const { toast } = useToast();

  // Initialize notes text from loaded notes
  useEffect(() => {
    const initialNotesText: Record<string, string> = {};
    section.questions.forEach(question => {
      if (notes[question.id]) {
        initialNotesText[question.id] = notes[question.id];
      }
    });
    setNotesText(initialNotesText);
  }, [notes, section.questions]);

  const answeredQuestions = section.questions.filter(q => answers[q.id] !== undefined).length;
  const progress = (answeredQuestions / section.questions.length) * 100;
  const noteCount = getCategoryNoteCount(section.questions.map(q => q.id));

  const handleRatingClick = (questionId: string, rating: number) => {
    onAnswer(questionId, rating);
  };

  const handleNotesChange = (questionId: string, text: string) => {
    setNotesText(prev => ({ ...prev, [questionId]: text }));
    
    // Clear existing timer
    if (autoSaveTimers[questionId]) {
      clearTimeout(autoSaveTimers[questionId]);
    }
    
    // Set new autosave timer
    const timer = setTimeout(() => {
      saveNote(questionId, text);
      toast({
        title: "Note Saved",
        description: "Your note has been automatically saved.",
        duration: 1500,
      });
    }, 2000); // Auto-save after 2 seconds of no typing
    
    setAutoSaveTimers(prev => ({ ...prev, [questionId]: timer }));
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "bg-red-500 hover:bg-red-600 text-white";
    if (rating === 3) return "bg-yellow-500 hover:bg-yellow-600 text-white";
    return "bg-green-500 hover:bg-green-600 text-white";
  };

  const getRatingText = (question: Question, rating: number) => {
    if (!question.scale) return "";
    return question.scale.labels[rating - 1] || "";
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(autoSaveTimers).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [autoSaveTimers]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3">
                <span className="text-3xl">{section.icon}</span>
                {section.title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">{section.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
              {noteCount > 0 && (
                <Badge variant="secondary" className="mt-2 flex items-center gap-1">
                  <StickyNote className="h-3 w-3" />
                  {noteCount} notes
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-4" />
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {section.questions.map((question, index) => (
          <Card 
            key={question.id} 
            className={`border-l-4 transition-all duration-200 ${
              answers[question.id] 
                ? 'border-l-green-500 bg-green-50/50' 
                : 'border-l-gray-300 hover:border-l-primary/50'
            }`}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Question Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Q{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {question.category}
                      </Badge>
                      {answers[question.id] && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {hasNotes(question.id) && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <StickyNote className="h-3 w-3" />
                          Note
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground leading-relaxed">
                      {question.text}
                    </h3>
                    {question.description && (
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {question.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating Scale */}
                {question.type === "scale" && question.scale && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Rate from {question.scale.min} (lowest) to {question.scale.max} (highest)
                      </p>
                    </div>

                    {/* Rating Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {Array.from({ length: question.scale.max }, (_, i) => {
                        const rating = i + 1;
                        const isSelected = answers[question.id] === rating;
                        const label = getRatingText(question, rating);

                        return (
                          <Button
                            key={rating}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleRatingClick(question.id, rating)}
                            className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                              isSelected ? getRatingColor(rating) : "hover:bg-muted"
                            }`}
                          >
                            <span className="text-2xl font-bold">{rating}</span>
                            <span className="text-xs text-center leading-tight">
                              {label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>

                    {/* Selected Value Display */}
                    {answers[question.id] && (
                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-primary">
                          <strong>Selected:</strong> {answers[question.id]} - {getRatingText(question, answers[question.id])}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Context Information */}
                {(question.purpose || question.situationAnalysis || question.linkedKPIs || question.benefits) && (
                  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-0">
                      <Collapsible 
                        open={expandedQuestions.has(question.id)}
                        onOpenChange={() => toggleQuestionExpansion(question.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-between p-4 h-auto text-left"
                          >
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-primary" />
                              <span className="font-medium text-primary">
                                Why This Question Matters
                              </span>
                            </div>
                            <ChevronRight className={`h-4 w-4 text-primary transition-transform ${
                              expandedQuestions.has(question.id) ? 'rotate-90' : ''
                            }`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4 space-y-4">
                          {question.purpose && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-primary">Assessment Purpose</h4>
                              <p className="text-sm text-muted-foreground">{question.purpose}</p>
                            </div>
                          )}
                          
                          {question.situationAnalysis && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-primary">Situation Analysis</h4>
                              <p className="text-sm text-muted-foreground">{question.situationAnalysis}</p>
                            </div>
                          )}
                          
                          {question.linkedKPIs && question.linkedKPIs.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-primary">Linked KPIs</h4>
                              <div className="flex flex-wrap gap-2">
                                {question.linkedKPIs.map((kpi, kpiIndex) => (
                                  <Badge key={kpiIndex} variant="secondary" className="text-xs">
                                    {kpi}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {question.benefits && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-primary">Business Benefits</h4>
                              <p className="text-sm text-muted-foreground">{question.benefits}</p>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                )}

                {/* Notes Section */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <label className="text-sm font-medium text-blue-900">
                        Additional Notes & Insights
                        {hasNotes(question.id) && (
                          <Badge variant="outline" className="ml-2 text-xs text-blue-600">
                            Saved
                          </Badge>
                        )}
                      </label>
                    </div>
                    <Textarea
                      value={notesText[question.id] || ''}
                      onChange={(e) => handleNotesChange(question.id, e.target.value)}
                      placeholder="Add your observations, context, or improvement ideas for this question..."
                      rows={3}
                      className="w-full bg-white"
                    />
                    <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      Auto-saves as you type
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {answeredQuestions === section.questions.length 
                  ? "Section Complete!" 
                  : `${answeredQuestions}/${section.questions.length} Questions Answered`
                }
              </h3>
              <p className="text-primary-foreground/80">
                {answeredQuestions === section.questions.length
                  ? isLastSection 
                    ? "Ready to view your comprehensive results"
                    : "Continue to the next assessment category"
                  : "Please answer all questions to continue"
                }
              </p>
            </div>
            <Button
              onClick={onContinue}
              disabled={!canContinue}
              size="lg"
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isLastSection ? "View Results" : "Save & Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}