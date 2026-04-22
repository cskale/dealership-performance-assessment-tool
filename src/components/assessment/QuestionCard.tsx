import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageSquare, Info, TrendingUp, Target, Search, BarChart3 } from "lucide-react";
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

  const hasPurpose = !!question.purpose;
  const hasSituation = !!question.situationAnalysis;
  const hasKPIs = !!question.linkedKPIs && question.linkedKPIs.length > 0;
  const hasBenefits = !!question.benefits;
  const hasAnyContext = hasPurpose || hasSituation || hasKPIs || hasBenefits;

  const sections: Array<{ key: string; render: () => JSX.Element }> = [];
  if (hasPurpose) {
    sections.push({
      key: 'purpose',
      render: () => (
        <div className="py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
              {t('assessment.assessmentPurpose')}
            </span>
          </div>
          <p className="text-[12px] text-foreground leading-[1.6]">{question.purpose}</p>
        </div>
      ),
    });
  }
  if (hasSituation) {
    sections.push({
      key: 'situation',
      render: () => (
        <div className="py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Search className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
              {t('assessment.situationAnalysis')}
            </span>
          </div>
          <p className="text-[12px] text-foreground leading-[1.6]">{question.situationAnalysis}</p>
        </div>
      ),
    });
  }
  if (hasKPIs) {
    sections.push({
      key: 'kpis',
      render: () => (
        <div className="py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
              {t('assessment.linkedKPIs')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {question.linkedKPIs!.map((kpi, index) => (
              <span
                key={index}
                className="bg-primary/10 text-primary text-[11px] rounded-[4px] px-2 py-0.5"
              >
                {kpi}
              </span>
            ))}
          </div>
        </div>
      ),
    });
  }
  if (hasBenefits) {
    sections.push({
      key: 'benefits',
      render: () => (
        <div className="py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
              {t('assessment.businessBenefits')}
            </span>
          </div>
          <p className="text-[12px] text-foreground leading-[1.6]">{question.benefits}</p>
        </div>
      ),
    });
  }

  const contextPanelInner = hasAnyContext ? (
    <div className="divide-y divide-border">
      {sections.map((s) => (
        <div key={s.key} className="first:pt-0 last:pb-0">
          {s.render()}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-[12px] text-muted-foreground text-center">
      No context available for this question.
    </p>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
      {/* Left column: Question + rating + notes */}
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

        {/* Rating Scale */}
        {question.type === "scale" && question.scale && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t('assessment.rateFrom')} {question.scale.min} ({t('assessment.lowest')}) {t('assessment.to')} {question.scale.max} ({t('assessment.highest')})
              </p>
            </div>

            {/* Rating Tiles — Neutral pattern per DESIGN.md §5.3 / §14 */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {Array.from({ length: question.scale.max }, (_, i) => {
                const rating = i + 1;
                const isSelected = value === rating;
                const label = getRatingText(rating);

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={`min-h-[80px] h-auto px-4 py-3 flex flex-col items-start justify-start gap-1 rounded-[8px] text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-primary/[0.04] border border-primary/30 border-l-[3px] border-l-primary"
                        : "bg-background border border-border hover:border-primary/30 hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {rating}
                    </span>
                    <span className="text-[13px] font-medium text-foreground leading-snug whitespace-normal break-words w-full">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Value Display */}
            {value && (
              <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>{t('assessment.selected')}:</strong> {value} - {getRatingText(value)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Features */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {showNotes ? t('assessment.additionalNotes') : t('assessment.additionalNotes')}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-3 w-3" />{getWeightLabel(question.weight)}</span>
          </div>
        </div>

        {/* Notes Section */}
        {showNotes && (
          <Card className="border-primary/20">
            <CardContent className="p-4">
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
              <p className="text-xs text-muted-foreground text-right mt-1">
                {5000 - (notes?.length ?? 0)} characters remaining
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mobile context block */}
        <div className="md:hidden mt-4 rounded-[10px] border border-border bg-muted/40 p-5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-4">
            {t('assessment.whyThisMatters')}
          </p>
          {contextPanelInner}
        </div>
      </div>

      {/* Right column: Persistent context panel (desktop only) */}
      <div className="hidden md:block">
        <div className="sticky top-4 h-fit rounded-[10px] border border-border bg-muted/40 p-5">
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium mb-4">
            {t('assessment.whyThisMatters')}
          </p>
          {contextPanelInner}
        </div>
      </div>
    </div>
  );
}
