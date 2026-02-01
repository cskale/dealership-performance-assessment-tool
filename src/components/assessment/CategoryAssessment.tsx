import { useState, useEffect, useRef } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const { notes, saveNote, hasNotes, getCategoryNoteCount } = useAssessmentNotes();
  const { toast } = useToast();
  const { t } = useLanguage();

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
    
    // Find the next unanswered question and scroll to it
    const currentIndex = section.questions.findIndex(q => q.id === questionId);
    let nextQuestion = null;
    
    // First, look for the next unanswered question after the current one
    for (let i = currentIndex + 1; i < section.questions.length; i++) {
      if (answers[section.questions[i].id] === undefined) {
        nextQuestion = section.questions[i];
        break;
      }
    }
    
    // If no unanswered question found after current, check from the beginning
    if (!nextQuestion) {
      for (let i = 0; i < currentIndex; i++) {
        if (answers[section.questions[i].id] === undefined) {
          nextQuestion = section.questions[i];
          break;
        }
      }
    }
    
    // If there's a next unanswered question, scroll to it smoothly
    if (nextQuestion && questionRefs.current[nextQuestion.id]) {
      setTimeout(() => {
        questionRefs.current[nextQuestion.id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 150);
    }
  };

  const handleNotesChange = (questionId: string, text: string) => {
    setNotesText(prev => ({ ...prev, [questionId]: text }));
    
    if (autoSaveTimers[questionId]) {
      clearTimeout(autoSaveTimers[questionId]);
    }
    
    const timer = setTimeout(() => {
      saveNote(questionId, text);
      toast({
        title: t('assessment.noteSaved'),
        description: t('assessment.noteAutoSaved'),
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
                {noteCount} {noteCount === 1 ? t('common.note') : t('common.notes')}
              </Badge>
            )}
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {answeredQuestions} {t('assessment.of')} {section.questions.length} {t('assessment.completed')}
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
            <Card 
              key={question.id} 
              ref={(el) => { questionRefs.current[question.id] = el; }}
              className="border bg-white hover:shadow-sm transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Q{index + 1}</span>
                        <Badge variant="outline" className="text-xs h-5 font-normal">
                          {question.category}
                        </Badge>
                        {value !== undefined && (
                          <Badge className="text-xs h-5 bg-green-100 text-green-700 border-green-200">
                            ✓ Answered
                          </Badge>
                        )}
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
                      {t('assessment.rateFrom')} {question.scale.min} ({t('assessment.lowest')}) {t('assessment.to')} {question.scale.max} ({t('assessment.highest')})
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
                          <span className="font-medium">{t('assessment.selected')}:</span> {value} - {getRatingText(question, value)}
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
                                {t('assessment.whyThisMatters')}
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
                              <h4 className="font-medium text-foreground">{t('assessment.assessmentPurpose')}</h4>
                              <p className="text-sm text-muted-foreground">{question.purpose}</p>
                            </div>
                          )}
                          
                          {question.situationAnalysis && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground">{t('assessment.situationAnalysis')}</h4>
                              <p className="text-sm text-muted-foreground">{question.situationAnalysis}</p>
                            </div>
                          )}
                          
                          {question.linkedKPIs && question.linkedKPIs.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground">{t('assessment.linkedKPIs')}</h4>
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
                              <h4 className="font-medium text-foreground">{t('assessment.businessBenefits')}</h4>
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
                        {t('assessment.additionalNotes')}
                        {hasNotes(question.id) && (
                          <Badge variant="outline" className="ml-2 text-xs text-primary">
                            {t('assessment.saved')}
                          </Badge>
                        )}
                      </label>
                    </div>
                    <Textarea
                      value={notesText[question.id] || ''}
                      onChange={(e) => handleNotesChange(question.id, e.target.value)}
                      placeholder={t('assessment.placeholder.notes')}
                      rows={3}
                      className="w-full bg-white border"
                    />
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Save className="h-3 w-3" />
                      {t('assessment.autoSaves')}
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
                  ? t('assessment.sectionComplete')
                  : `${answeredQuestions}/${section.questions.length} ${t('assessment.questionsAnswered')}`
                }
              </h3>
              <p className="text-primary-foreground/80">
                {answeredQuestions === section.questions.length
                  ? isLastSection 
                    ? t('assessment.readyToView')
                    : t('assessment.continueToNext')
                  : t('assessment.pleaseAnswer')
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
              {isLastSection ? t('assessment.viewResults') : t('assessment.saveAndContinue')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
