import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedSection, isDataQuestion, questionnaire, type DataQuestion } from '@/data/questionnaire';
import { trackedKpisFor, type DepartmentKey } from '@/data/trackedKpis';
import type { CrossValidationFinding } from '@/data/crossValidationRules';
import type { ModuleBenchmark } from '@/lib/benchmarkUtils';
import { sectionToModuleCode } from '@/lib/benchmarkUtils';
import type { CeilingInsight } from '@/lib/ceilingAnalysis';
import type { ConfidenceMetrics } from '@/lib/scoringEngine';
import { getMaturityLevel, type MaturityLevel } from '@/lib/maturityConfig';
import type { KpiBenchmark } from '@/lib/kpiBenchmarks';
import type { TimelinePoint } from '@/lib/kpiTimeline';
import { cn } from '@/lib/utils';
import { CeilingInsightsPanel } from '@/components/results/CeilingInsightsPanel';
import { KpiTrendCard } from '@/components/results/KpiTrendCard';

const DEPARTMENTS: Array<{ sectionId: string; shortKey: DepartmentKey; answerPrefix: string }> = [
  { sectionId: 'new-vehicle-sales', shortKey: 'nvs', answerPrefix: 'nvs' },
  { sectionId: 'used-vehicle-sales', shortKey: 'uvs', answerPrefix: 'uvs' },
  { sectionId: 'service-performance', shortKey: 'svc', answerPrefix: 'svc' },
  { sectionId: 'parts-inventory', shortKey: 'prt', answerPrefix: 'pts' },
  { sectionId: 'financial-operations', shortKey: 'fin', answerPrefix: 'fin' },
];

const MATURITY_STYLE: Record<MaturityLevel, string> = {
  foundational: 'bg-destructive/10 text-destructive border-destructive/20',
  developing: 'bg-warning/10 text-warning-foreground border-warning/20',
  performing: 'bg-info/10 text-info border-info/20',
  advanced: 'bg-success/10 text-success border-success/20',
};

const DOT_STYLE: Record<MaturityLevel, string> = {
  foundational: 'bg-destructive', developing: 'bg-warning', performing: 'bg-info', advanced: 'bg-success',
};

interface DepartmentResultsRowsProps {
  scores: Record<string, number>;
  benchmarks: Record<string, ModuleBenchmark>;
  confidence: Record<string, ConfidenceMetrics>;
  timelines: Record<string, TimelinePoint[]>;
  kpiBenchmarks: Record<string, KpiBenchmark>;
  findings: CrossValidationFinding[];
  ceilingInsights: CeilingInsight[];
  canLog: boolean;
  loadingTimelines: boolean;
  saving: boolean;
  onSave: (input: { kpiKey: string; month: string; value: number }) => Promise<void>;
}

export function DepartmentResultsRows({ scores, benchmarks, confidence, timelines, kpiBenchmarks, findings, ceilingInsights, canLog, loadingTimelines, saving, onSave }: DepartmentResultsRowsProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(DEPARTMENTS.find(({ sectionId }) => scores[sectionId] != null)?.sectionId ?? null);

  const kpiQuestions = useMemo(() => Object.fromEntries(
    questionnaire.sections.flatMap((section) => section.questions)
      .filter(isDataQuestion)
      .map((question) => [question.kpiKey, question]),
  ) as Record<string, DataQuestion>, []);

  return (
    <section className="mt-6 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      {DEPARTMENTS.map(({ sectionId, shortKey, answerPrefix }) => {
        const section = questionnaire.sections.find((candidate) => candidate.id === sectionId);
        const label = section ? getTranslatedSection(section, language).title : sectionId;
        const score = scores[sectionId];
        const assessed = Number.isFinite(score);
        const benchmark = benchmarks[sectionToModuleCode(sectionId)]?.meanScore ?? 70;
        const maturity = getMaturityLevel(score ?? 0);
        const open = expanded === sectionId;
        const departmentFindings = findings.filter((finding) => finding.ruleId.includes(`-${answerPrefix.toUpperCase()}-`) || finding.ruleId.startsWith(`CV-${answerPrefix.toUpperCase()}-`));
        const departmentInsights = ceilingInsights.filter((insight) => insight.questionId.startsWith(`${answerPrefix}-`));

        return (
          <div key={sectionId} className="border-b border-border last:border-b-0">
            <Button
              variant="ghost"
              className={cn('h-auto w-full rounded-none px-4 py-4 text-left hover:bg-muted/60 sm:px-5', !assessed && 'cursor-default opacity-65')}
              onClick={() => assessed && setExpanded(open ? null : sectionId)}
              aria-expanded={assessed ? open : undefined}
            >
              <div className="grid w-full min-w-0 grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(150px,0.8fr)_minmax(220px,1.7fr)_auto_auto] sm:gap-5">
                <span className="truncate text-body-sm font-semibold text-foreground">{label}</span>
                {assessed ? (
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-between font-mono text-caption tabular-nums text-muted-foreground">
                      <span>{Math.round(score)}</span><span>{Math.round(benchmark)}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted" aria-label={`${Math.round(score)} / 100`}>
                      <span
                        className="absolute top-0 h-2 bg-[hsl(var(--neutral-200))]"
                        style={{ left: `${Math.min(score, benchmark)}%`, width: `${Math.abs(score - benchmark)}%` }}
                      />
                      <span className="absolute -top-1 h-4 w-px bg-[hsl(var(--neutral-600))]" style={{ left: `${benchmark}%` }} />
                      <span className={cn('absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-card', DOT_STYLE[maturity])} style={{ left: `${score}%` }} />
                    </div>
                  </div>
                ) : (
                  <span className="text-body-sm font-normal text-muted-foreground">{t('results.dept.notAssessed')}</span>
                )}
                {assessed && <Badge variant="outline" className={cn('justify-self-start', MATURITY_STYLE[maturity])}>{t(`maturity.${maturity}`)}</Badge>}
                {assessed && (
                  <span className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
                    <span className="font-mono tabular-nums">{confidence[sectionId]?.consistencyScore ?? 0}%</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
                  </span>
                )}
              </div>
            </Button>

            {assessed && open && (
              <div className="animate-in fade-in slide-in-from-top-1 border-t border-border bg-muted/30 p-4 duration-200 sm:p-5">
                {loadingTimelines ? (
                  <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-56" /><Skeleton className="h-56" /></div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {trackedKpisFor(shortKey).map((kpiKey) => {
                      const question = kpiQuestions[kpiKey];
                      const kpiBenchmark = kpiBenchmarks[kpiKey];
                      if (!question || !kpiBenchmark) return null;
                      return (
                        <KpiTrendCard
                          key={kpiKey}
                          question={question}
                          history={timelines[kpiKey] ?? []}
                          benchmark={kpiBenchmark}
                          canLog={canLog}
                          saving={saving}
                          onSave={onSave}
                        />
                      );
                    })}
                  </div>
                )}

                {departmentFindings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {departmentFindings.map((finding) => (
                      <div key={finding.ruleId} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <div><p className="text-body-sm font-semibold text-foreground">{finding.title}</p><p className="mt-1 text-caption leading-relaxed text-muted-foreground">{finding.description}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {departmentInsights.length > 0 && <div className="mt-4"><CeilingInsightsPanel insights={departmentInsights} /></div>}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}