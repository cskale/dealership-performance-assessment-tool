import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDepartmentName } from "@/lib/departmentNames";
import { questionnaire, isDataQuestion, type DataQuestion } from "@/data/questionnaire";
import { getUnitLabel } from "@/components/assessment/KpiQuestionInput";
import type { AssessmentKpiValue } from "@/hooks/useKpiValues";

interface PerformanceDataPanelProps {
  kpiValues: AssessmentKpiValue[];
}

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

function formatValue(value: number, language: string): string {
  return value.toLocaleString(language === 'de' ? 'de-DE' : 'en-US', {
    maximumFractionDigits: 2,
  });
}

export function PerformanceDataPanel({ kpiValues }: PerformanceDataPanelProps) {
  const { t, language } = useLanguage();

  const moduleData = useMemo(() => {
    // Map question id -> { sectionId, question } for every Performance Data question
    const questionLookup = new Map<string, { sectionId: string; question: DataQuestion }>();
    const totalsBySection: Record<string, number> = {};

    for (const section of questionnaire.sections) {
      for (const question of section.questions) {
        if (!isDataQuestion(question)) continue;
        questionLookup.set(question.id, { sectionId: section.id, question });
        totalsBySection[section.id] = (totalsBySection[section.id] ?? 0) + 1;
      }
    }

    const rowsBySection: Record<string, Array<{ row: AssessmentKpiValue; question: DataQuestion }>> = {};
    for (const row of kpiValues) {
      const entry = questionLookup.get(row.question_id);
      if (!entry) continue;
      (rowsBySection[entry.sectionId] ??= []).push({ row, question: entry.question });
    }

    return DEPT_ORDER
      .filter(sectionId => (rowsBySection[sectionId]?.length ?? 0) > 0)
      .map(sectionId => {
        const entries = rowsBySection[sectionId];
        const provided = entries.filter(e => !e.row.skipped && e.row.value !== null);
        const skipped = entries.filter(e => e.row.skipped || e.row.value === null);
        return {
          sectionId,
          total: totalsBySection[sectionId] ?? entries.length,
          provided,
          skipped,
        };
      });
  }, [kpiValues]);

  if (moduleData.length === 0) return null;

  return (
    <Card className="shadow-lg shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t('results.performanceData.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {moduleData.map(({ sectionId, total, provided, skipped }) => (
          <div key={sectionId}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-sm font-semibold text-foreground">
                {getDepartmentName(sectionId, language)}
              </span>
              <Badge variant="outline" className="text-xs">
                {t('assessment.performanceDataProgress')} {provided.length}/{total} {t('assessment.provided')}
              </Badge>
            </div>

            <div className="space-y-2">
              {provided.map(({ row, question }) => {
                const label = question.translations?.[language as 'en' | 'de']?.text ?? question.text;
                const unitLabel = getUnitLabel(question);
                return (
                  <div
                    key={row.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('results.performanceData.benchmarkComingSoon')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-foreground tabular-nums">
                        {formatValue(row.value as number, language)}{unitLabel ? ` ${unitLabel}` : ''}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {t(`assessment.referencePeriod.${row.reference_period}`)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {skipped.length > 0 && (
              <Collapsible className="mt-2">
                <CollapsibleTrigger className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  {t('results.performanceData.notProvided')} ({skipped.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1.5">
                  {skipped.map(({ row, question }) => {
                    const label = question.translations?.[language as 'en' | 'de']?.text ?? question.text;
                    return (
                      <div key={row.id} className="text-xs text-muted-foreground px-1">
                        {label}
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
