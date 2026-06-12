import { useState, useEffect, useRef } from "react";
import { MessageSquare, Save, ChevronRight, StickyNote, Check, ExternalLink } from "lucide-react";
import { Question, Section, isScoredQuestion } from "@/data/questionnaire";
import { useAssessmentNotes } from "@/hooks/useAssessmentNotes";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { mergeWhyThisMatters } from "@/lib/assessmentUtils";

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
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { notes, saveNote, hasNotes, getCategoryNoteCount } = useAssessmentNotes();
  const { toast } = useToast();
  const { t } = useLanguage();

  const toggleNote = (questionId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

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

  useEffect(() => {
    return () => {
      Object.values(autoSaveTimers).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [autoSaveTimers]);

  return (
    <div className="space-y-4">
      {/* Section progress — thin count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-medium text-[#6e7e8a]">
          {answeredQuestions} of {section.questions.length} questions answered
        </p>
        {noteCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5">
            <StickyNote className="h-3 w-3" />
            {noteCount} {noteCount === 1 ? 'note' : 'notes'}
          </span>
        )}
      </div>

      <div key={section.id} className="space-y-4">
        {section.questions.map((question, index) => {
          const value = answers[question.id];
          const isNoteOpen = expandedNotes.has(question.id);
          const whyThisMatters = mergeWhyThisMatters(
            question.purpose,
            question.situationAnalysis,
            question.benefits
          );

          return (
            <div
              key={question.id}
              ref={(el) => { questionRefs.current[question.id] = el; }}
              className="bg-white border border-[#d4dde4] rounded-xl overflow-hidden mb-8 opacity-0 animate-fade-in"
              style={{
                animationDelay: `${index * 45}ms`,
                animationFillMode: 'forwards',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.05)',
              }}
            >
              {/* ── Top bar: #D6E3FF background ── */}
              <div
                className="flex items-center justify-between px-5 py-2.5 border-b border-[#c7d4f0]"
                style={{ background: '#D6E3FF' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-[#1D7AFC] text-white text-[11px] font-bold rounded-[5px] px-2 py-1 leading-none flex-shrink-0">
                    Q{index + 1}
                  </span>
                  <span className="text-[12px] font-medium text-[#172d4d]">
                    {question.category}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#94a3b8] tabular-nums">
                  Question {index + 1} of {section.questions.length}
                </span>
              </div>

              {/* ── Question body ── */}
              <div className="px-5 pt-5 pb-0">
                <h3
                  className="text-[18px] font-bold text-[#0b1f3a] leading-[1.4] mb-1"
                  style={{ letterSpacing: '-0.018em' } as React.CSSProperties}
                >
                  {question.text}
                </h3>
                {question.description && (
                  <p className="text-[13px] text-[#445166] leading-relaxed mb-4">
                    {question.description}
                  </p>
                )}

                {/* ── Rating tiles ── */}
                {isScoredQuestion(question) && question.type === 'scale' && (() => {
                  const scale = question.scale;
                  return (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {Array.from({ length: scale.max }, (_, i) => {
                        const rating = i + 1;
                        const isSelected = value === rating;
                        const label = scale.labels[i] || '';

                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingClick(question.id, rating)}
                            className="relative min-h-[80px] w-full flex flex-col items-center justify-center rounded-[10px] px-2.5 py-4 text-center transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#1D7AFC] focus-visible:outline-offset-2"
                            style={
                              isSelected
                                ? {
                                    border: '1.5px solid #1D7AFC',
                                    borderLeft: '4px solid #1D7AFC',
                                    background: 'rgba(29,122,252,0.04)',
                                    boxShadow: '0 0 0 3px rgba(29,122,252,0.08)',
                                  }
                                : {
                                    border: '1px solid #d4dde4',
                                    background: 'white',
                                  }
                            }
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,122,252,0.35)';
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(29,122,252,0.02)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#d4dde4';
                                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                              }
                            }}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1D7AFC] flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                              </span>
                            )}
                            <span
                              className="text-[13px] font-semibold leading-[1.35] break-words"
                              style={{ color: isSelected ? '#0b1f3a' : '#263d57' }}
                            >
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ── Context strip: Why this matters | Linked KPIs ── */}
              {(whyThisMatters || (question.linkedKPIs && question.linkedKPIs.length > 0)) && (
                <div
                  className="grid mt-4 items-start"
                  style={{
                    background: '#f4f6f8',
                    borderTop: '1px solid #e2e8f0',
                    gridTemplateColumns: '1fr 1px 1fr',
                  }}
                >
                  <div className="px-5 py-4">
                    <p className="text-[13px] font-semibold text-[#172d4d] mb-1.5">Why this matters</p>
                    <p className="text-[13px] text-[#445166] leading-relaxed">
                      {whyThisMatters || 'No context available for this question.'}
                    </p>
                  </div>

                  <div className="bg-[#d4dde4] self-stretch" />

                  <div className="px-5 py-4">
                    <p className="text-[12px] font-semibold text-[#172d4d] mb-1.5">Linked KPIs</p>
                    {question.linkedKPIs && question.linkedKPIs.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {question.linkedKPIs.map((kpi) => (
                          <a
                            key={kpi}
                            href="/app/kpi-encyclopedia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-[#dbeafe] text-[#1e40af] text-[11px] font-medium rounded px-2 py-1 no-underline hover:bg-[#bfdbfe] transition-colors"
                          >
                            {kpi}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-muted-foreground">No linked KPIs</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Footer: two actions ── */}
              <div className="flex items-center px-5 py-3 border-t border-[#eef0f3] bg-white">
                <button
                  type="button"
                  onClick={() => toggleNote(question.id)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6e7e8a] hover:text-[#1D7AFC] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {hasNotes(question.id) ? 'Edit field coach notes' : 'Add field coach notes'}
                </button>
              </div>

              {/* Notes textarea — expands inline when open */}
              {isNoteOpen && (
                <div className="px-5 pb-4 border-t border-[#eef0f3]">
                  <div className="flex items-center gap-1.5 py-3">
                    <Save className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{t('assessment.autoSaves')}</span>
                    {hasNotes(question.id) && (
                      <span className="text-[11px] text-[#1D7AFC] font-medium ml-1">{t('assessment.saved')}</span>
                    )}
                  </div>
                  <textarea
                    value={notesText[question.id] || ''}
                    onChange={(e) => handleNotesChange(question.id, e.target.value)}
                    placeholder={t('assessment.placeholder.notes')}
                    rows={3}
                    maxLength={5000}
                    className="w-full bg-white border border-[#d4dde4] rounded-lg text-[13px] text-[#172d4d] px-3 py-2.5 resize-none focus:outline-none focus:border-[#1D7AFC] focus:ring-2 focus:ring-[#1D7AFC]/20"
                  />
                  <p className="text-[11px] text-muted-foreground text-right mt-1">
                    {5000 - (notesText[question.id]?.length ?? 0)} characters remaining
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="bg-white border border-[#d4dde4] rounded-xl p-6 mt-4"
        style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.05)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0b1f3a]">
              {answeredQuestions === section.questions.length
                ? t('assessment.sectionComplete')
                : `${answeredQuestions} / ${section.questions.length} ${t('assessment.questionsAnswered')}`}
            </h3>
            <p className="text-[13px] text-[#6e7e8a] mt-0.5">
              {answeredQuestions === section.questions.length
                ? isLastSection
                  ? t('assessment.readyToView')
                  : t('assessment.continueToNext')
                : t('assessment.pleaseAnswer')}
            </p>
          </div>
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 bg-[#1D7AFC] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1a5fb4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLastSection ? t('assessment.viewResults') : t('assessment.saveAndContinue')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
