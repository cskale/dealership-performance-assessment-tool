import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Save, ChevronRight, StickyNote } from "lucide-react";
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
    
    const currentIndex = section.questions.findIndex(q => q.id === questionId);
    let nextQuestion: Question | null = null;
    
    for (let i = currentIndex + 1; i < section.questions.length; i++) {
      if (answers[section.questions[i].id] === undefined) {
        nextQuestion = section.questions[i];
        break;
      }
    }
    
    if (!nextQuestion) {
      for (let i = 0; i < currentIndex; i++) {
        if (answers[section.questions[i].id] === undefined) {
          nextQuestion = section.questions[i];
          break;
        }
      }
    }
    
    if (nextQuestion && questionRefs.current[nextQuestion.id]) {
      setTimeout(() => {
        questionRefs.current[nextQuestion!.id]?.scrollIntoView({
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

  const hasContext = (question: Question) =>
    !!(question.purpose || question.situationAnalysis || question.linkedKPIs?.length || question.benefits);

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
          const showContext = hasContext(question);
          
          return (
            <Card 
              key={question.id} 
              ref={(el) => { questionRefs.current[question.id] = el; }}
              className="border bg-white hover:shadow-sm transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className={showContext ? 'grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5' : ''}>
                  {/* Left column — question + rating + notes */}
                  <div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-xs font-medium text-[hsl(var(--dd-ghost))]">Q{index + 1}</span>
                            <Badge variant="outline" className="text-xs h-5 font-normal">
                              {question.category}
                            </Badge>
                            {value !== undefined && (
                              <Badge className="text-xs h-5 bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-ink))] border border-[hsl(var(--dd-rule))]">
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
                        <div className="text-xs text-[hsl(var(--dd-ghost))] text-center">
                          {t('assessment.rateFrom')} {question.scale.min} ({t('assessment.lowest')}) {t('assessment.to')} {question.scale.max} ({t('assessment.highest')})
                        </div>

                        {/* Neutral rating tiles */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                          {Array.from({ length: question.scale.max }, (_, i) => {
                            const rating = i + 1;
                            const isSelected = value === rating;
                            const label = getRatingText(question, rating);

                            return (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleRatingClick(question.id, rating)}
                                className={`rounded-lg p-3 text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[hsl(var(--dd-accent-light))] border-l-[3px] border-l-[hsl(var(--dd-accent))] border-t border-r border-b border-[hsl(var(--dd-accent-mid))]'
                                    : 'bg-white border border-[hsl(var(--dd-rule))] hover:border-[hsl(var(--dd-accent-mid))] hover:bg-[hsl(var(--dd-accent-light))]'
                                }`}
                              >
                                <span className="block text-[15px] font-semibold text-[hsl(var(--dd-ink))] mb-1">
                                  {rating}
                                </span>
                                <span className="block text-[11px] text-[hsl(var(--dd-muted))] leading-tight text-center">
                                  {label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {value !== undefined && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--dd-green))] flex-shrink-0" />
                            <span className="text-xs text-[hsl(var(--dd-ghost))]">Saved</span>
                          </div>
                        )}

                        {value && (
                          <div className="text-center p-3 bg-[hsl(var(--dd-accent-light))] rounded-lg border border-[hsl(var(--dd-accent-mid))]">
                            <p className="text-sm text-[hsl(var(--dd-ink))]">
                              <span className="font-medium">{t('assessment.selected')}:</span> {value} - {getRatingText(question, value)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="border border-[hsl(var(--dd-rule))] rounded-lg bg-white p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-[hsl(var(--dd-accent))]" />
                        <label className="text-sm font-medium text-foreground">
                          {t('assessment.additionalNotes')}
                          {hasNotes(question.id) && (
                            <Badge variant="outline" className="ml-2 text-xs text-[hsl(var(--dd-accent))]">
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
                        maxLength={5000}
                        className="w-full bg-white border border-[hsl(var(--dd-rule))]"
                      />
                      <p className="text-xs text-[hsl(var(--dd-ghost))] text-right mt-1">
                        {5000 - (notesText[question.id]?.length ?? 0)} characters remaining
                      </p>
                      <div className="text-xs text-[hsl(var(--dd-ghost))] mt-2 flex items-center gap-1">
                        <Save className="h-3 w-3" />
                        {t('assessment.autoSaves')}
                      </div>
                    </div>
                  </div>

                  {/* Right column — persistent context panel */}
                  {showContext && (
                    <div className="bg-[hsl(var(--dd-fog))] border border-[hsl(var(--dd-rule))] rounded-xl p-5 h-fit sticky top-6">
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--dd-ghost))] mb-4">
                        Context
                      </div>

                      <div className="divide-y divide-[hsl(var(--dd-rule))]">
                        {question.purpose && (
                          <div className="py-3 first:pt-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] mb-1">
                              Purpose
                            </div>
                            <p className="text-[12px] text-[hsl(var(--dd-muted))] leading-relaxed">
                              {question.purpose}
                            </p>
                          </div>
                        )}

                        {question.situationAnalysis && (
                          <div className="py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] mb-1">
                              Situation Analysis
                            </div>
                            <p className="text-[12px] text-[hsl(var(--dd-muted))] leading-relaxed">
                              {question.situationAnalysis}
                            </p>
                          </div>
                        )}

                        {question.linkedKPIs && question.linkedKPIs.length > 0 && (
                          <div className="py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] mb-1">
                              Linked KPIs
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {question.linkedKPIs.map((kpi, kpiIndex) => (
                                <span
                                  key={kpiIndex}
                                  className="text-[11px] font-medium bg-white border border-[hsl(var(--dd-rule))] rounded-full px-2.5 py-0.5 text-[hsl(var(--dd-ink))]"
                                >
                                  {kpi}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.benefits && (
                          <div className="py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] mb-1">
                              Business Benefits
                            </div>
                            <p className="text-[12px] text-[hsl(var(--dd-muted))] leading-relaxed">
                              {question.benefits}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-[hsl(var(--dd-accent))] to-[hsl(var(--dd-accent))]/80 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {answeredQuestions === section.questions.length 
                  ? t('assessment.sectionComplete')
                  : `${answeredQuestions}/${section.questions.length} ${t('assessment.questionsAnswered')}`
                }
              </h3>
              <p className="text-white/80">
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
