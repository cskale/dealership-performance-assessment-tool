import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DataQuestion } from "@/data/questionnaire";
import { useLanguage } from "@/contexts/LanguageContext";
import type { KpiAnswerState } from "@/lib/kpiAnswerPersistence";

interface KpiQuestionInputProps {
  question: DataQuestion;
  value: KpiAnswerState;
  onChange: (value: number | null, skipped: boolean) => void;
}

export function getUnitLabel(question: DataQuestion): string {
  if (question.type === "currency") {
    return question.unit.replace("EUR", "€");
  }
  return question.unit;
}

export function KpiQuestionInput({ question, value, onChange }: KpiQuestionInputProps) {
  const { t } = useLanguage();
  const [rawInput, setRawInput] = useState<string>(value.value !== null ? String(value.value) : "");

  const unitLabel = getUnitLabel(question);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawInput(raw);

    // Locale-aware decimals: normalise a comma (DE) to a dot before parsing.
    const normalised = raw.replace(",", ".");

    if (normalised === "" || normalised === "-") {
      onChange(null, false);
      return;
    }

    const parsed = Number(normalised);
    if (!Number.isNaN(parsed)) {
      onChange(parsed, false);
    }
  };

  const handleSkip = () => {
    setRawInput("");
    onChange(null, true);
  };

  const handleUndo = () => {
    onChange(null, false);
  };

  const isOutOfRange =
    !value.skipped &&
    value.value !== null &&
    !!question.validRange &&
    (value.value < question.validRange.min || value.value > question.validRange.max);

  return (
    <div className="mt-4 mb-2 space-y-2">
      {value.skipped ? (
        <div className="flex items-center gap-2 text-[12px] text-[#6e7e8a]">
          <span>{t("assessment.dontHaveFigure")}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="font-medium text-[#1D7AFC] underline-offset-2 hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            {t("assessment.undo")}
          </button>
        </div>
      ) : (
        <>
          <div className="relative max-w-[240px]">
            <Input
              type="text"
              inputMode="decimal"
              value={rawInput}
              onChange={handleInputChange}
              placeholder={t("assessment.kpiInputPlaceholder")}
              className={unitLabel ? "pr-12" : undefined}
            />
            {unitLabel && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#6e7e8a] pointer-events-none">
                {unitLabel}
              </span>
            )}
          </div>

          {isOutOfRange && (
            <p className="text-[12px] text-amber-600">{t("assessment.kpiOutOfRangeWarning")}</p>
          )}

          <button
            type="button"
            onClick={handleSkip}
            className="text-[12px] text-[#6e7e8a] hover:text-[#1D7AFC] underline-offset-2 hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            {t("assessment.dontHaveFigure")}
          </button>
        </>
      )}

      {question.formula && (
        <Collapsible>
          <CollapsibleTrigger className="group flex items-center gap-1.5 text-[12px] font-medium text-[#1D7AFC] bg-transparent border-none cursor-pointer p-0">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
            {t("assessment.howToCalculate")}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg border border-[#e2e8f0] bg-[#f4f6f8] px-3 py-2.5 space-y-1.5">
            <code className="block text-[12px] font-mono text-[#172d4d] whitespace-pre-wrap">
              {question.formula.expression}
            </code>
            {question.formula.example && (
              <p className="text-[12px] text-[#445166]">{question.formula.example}</p>
            )}
            {question.formula.dataSource && (
              <p className="text-[12px] text-[#6e7e8a]">
                {t("assessment.whereToFindIt")} {question.formula.dataSource}
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
