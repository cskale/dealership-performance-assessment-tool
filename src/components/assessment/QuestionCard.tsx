import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, HelpCircle, Info } from "lucide-react";
import { Question } from "@/data/questionnaire";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuestionCardProps {
  question: Question;
  value?: number;
  onChange: (value: number) => void;
}

function getWeightLabel(weight: number): string {
  if (weight >= 1.8) return 'Critical diagnostic question';
  if (weight >= 1.4) return 'High diagnostic value';
  if (weight >= 1.1) return 'Important indicator';
  return 'Supporting indicator';
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const { t } = useLanguage();

  const handleRatingClick = (rating: number) => {
    onChange(rating);
  };

  const getRatingText = (rating: number) => {
    if (!question.scale) return "";
    return question.scale.labels[rating - 1] || "";
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground leading-relaxed">
              {question.text}
            </h3>
            {question.description && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {question.description}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {question.category}
          </Badge>
        </div>
      </div>

      {/* Rating Scale — Neutral Tiles */}
      {question.type === "scale" && question.scale && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-[hsl(var(--dd-muted))] mb-4">
              {t('assessment.rateFrom')} {question.scale.min} ({t('assessment.lowest')}) {t('assessment.to')} {question.scale.max} ({t('assessment.highest')})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {Array.from({ length: question.scale.max }, (_, i) => {
              const rating = i + 1;
              const isSelected = value === rating;
              const label = getRatingText(rating);

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
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

          {/* Selected Value Display */}
          {value && (
            <div className="text-center p-3 bg-[hsl(var(--dd-accent-light))] rounded-lg border border-[hsl(var(--dd-accent-mid))]">
              <p className="text-sm text-[hsl(var(--dd-ink))]">
                <strong>{t('assessment.selected')}:</strong> {value} - {getRatingText(value)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Additional Features */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[hsl(var(--dd-rule))]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {t('assessment.additionalNotes')}
        </Button>

        <div className="flex items-center gap-2 text-xs text-[hsl(var(--dd-ghost))]">
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs text-[hsl(var(--dd-ghost))] flex items-center gap-1.5">
            <Info className="h-3 w-3" />{getWeightLabel(question.weight)}
          </span>
        </div>
      </div>

      {/* Notes Section */}
      {showNotes && (
        <div className="border border-[hsl(var(--dd-rule))] rounded-lg p-4 bg-[hsl(var(--dd-fog))]">
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('assessment.additionalNotes')}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('assessment.placeholder.notes')}
            rows={3}
            maxLength={5000}
            className="w-full"
          />
          <p className="text-xs text-[hsl(var(--dd-ghost))] text-right mt-1">
            {5000 - (notes?.length ?? 0)} characters remaining
          </p>
        </div>
      )}
    </div>
  );
}
