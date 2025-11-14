import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare, Save, ChevronRight, AlertCircle, StickyNote } from "lucide-react";
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
    
    if (autoSaveTimers[questionId]) {
      clearTimeout(autoSaveTimers[questionId]);
    }
    
    const timer = setTimeout(() => {
      saveNote(questionId, text);
      toast({
        title: "Note Saved",
        description: "Your note has been automatically saved.",
        duration: 1500,
      });
    }, 2000);
    
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

  const getRatingText = (question: Question, rating: number) => {
    if (!question.scale) return "";
    return question.scale.labels[rating - 1] || "";
  };

  useEffect(() => {
    return () => {
      Object.values(autoSaveTimers).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [autoSaveTimers]);

  return (
    <div className="space-y-4">
      <Card className="border bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg font-medium text-foreground mb-2">
                {section.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.description}
              </p>
            </div>
            {noteCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-normal">
                <StickyNote className="h-3 w-3" />
                {noteCount} {noteCount === 1 ? 'note' : 'notes'}
              </Badge>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {answeredQuestions} of {section.questions.length} completed
              </span>
              <span className="font-medium text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {section.questions.map((question, index) => {
          const value = answers[question.id];
          
          return (
            <Card key={question.id} className="border bg-white hover:shadow-sm transition-all duration-200">
              <CardContent className="p-5">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Q{index + 1}</span>
                        <Badge variant="outline" className="text-xs h-5 font-normal">
                          {question.category}
                        </Badge>
                      </div>
                      <h3 className="text-base font-medium text-foreground leading-relaxed">
                        {question.text}
                      </h3>
                      {question.description && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {question.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {question.type === "scale" && question.scale && (
                  <div className="space-y-4 mb-4">
                    <div className="text-xs text-muted-foreground text-center">
                      Rate from {question.scale.min} (lowest) to {question.scale.max} (highest)
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: question.scale.max }, (_, i) => {
                        const rating = i + 1;
                        const isSelected = value === rating;
                        const label = getRatingText(question, rating);

                        return (
                          <Button
                            key={rating}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleRatingClick(question.id, rating)}
                            className={`h-auto p-3 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                              isSelected 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                : "border hover:bg-muted/50 hover:scale-[1.02]"
                            }`}
                          >
                            <span className={`text-xl font-medium ${isSelected ? '' : 'text-foreground'}`}>
                              {rating}
                            </span>
                            <span className={`text-xs text-center leading-tight ${
                              isSelected ? 'opacity-90' : 'text-muted-foreground'
                            }`}>
                              {label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>

                    {value && (
                      <div className="text-center p-3 bg-muted/30 rounded border">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Selected:</span> {value} - {getRatingText(question, value)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(question.purpose || question.situationAnalysis || question.linkedKPIs || question.benefits) && (
                  <Card className="border bg-white mb-4">
                    <CardContent className="p-0">
                      <Collapsible 
                        open={expandedQuestions.has(question.id)}
                        onOpenChange={() => toggleQuestionExpansion(question.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">
                                Why This Question Matters
                              </span>
                            </div>
                            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                              expandedQuestions.has(question.id) ? 'rotate-90' : ''
                            }`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4 space-y-4">
                          {question.purpose && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground">Assessment Purpose</h4>
                              <p className="text-sm text-muted-foreground">{question.purpose}</p>
                            </div>
                          )}
                          
                          {question.situationAnalysis && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground">Situation Analysis</h4>
                              <p className="text-sm text-muted-foreground">{question.situationAnalysis}</p>
                            </div>
                          )}
                          
                          {question.linkedKPIs && question.linkedKPIs.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground">Linked KPIs</h4>
                              <div className="flex flex-wrap gap-2">
                                {question.linkedKPIs.map((kpi, kpiIndex) => (
                                  <Badge key={kpiIndex} variant="outline" className="text-xs">
                                    {kpi}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {question.benefits && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground">Business Benefits</h4>
                              <p className="text-sm text-muted-foreground">{question.benefits}</p>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                )}

                <Card className="border bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium text-foreground">
                        Additional Notes & Insights
                        {hasNotes(question.id) && (
                          <Badge variant="outline" className="ml-2 text-xs text-primary">
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
                      className="w-full bg-white border"
                    />
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      Auto-saves as you type
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
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
