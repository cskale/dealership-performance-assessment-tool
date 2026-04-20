import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Target, Info, BarChart3, BookOpen } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { TOTAL_QUESTIONS, getMaturityLevel as getCanonicalMaturityLevel, SCORE_THRESHOLDS } from "@/lib/constants";
import { getDepartmentName } from "@/lib/departmentNames";
import { DepartmentHeatmap } from "@/components/results/DepartmentHeatmap";
import { CausalChainDiagram } from "@/components/results/CausalChainDiagram";
import { CeilingInsightsPanel } from "@/components/results/CeilingInsightsPanel";
import { ScoreDecomposition } from "@/components/results/ScoreDecomposition";
import {
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
  calculateSubCategoryScores,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  calculateEnhancedMaturity,
  type ConfidenceMetrics,
  type DepartmentSubCategories,
  type SystemicPattern,
} from "@/lib/scoringEngine";
import { questionnaire } from "@/data/questionnaire";
import { KpiInsightPanel } from "@/components/shared/KpiInsightPanel";
import { buildExecutiveNarrative, DEPT_LABELS } from '@/lib/narrativeTemplates';
import type { MaturityLevel, PrimarySignalCode } from '@/lib/narrativeTemplates';
import { generateCeilingInsights } from '@/lib/ceilingAnalysis';
import { generateSignals } from '@/lib/signalEngine';

interface ExecutiveSummaryProps {
  overallScore: number;
  scores: Record<string, number>;
  answers: Record<string, number | string | null>;
  completedAt: string;
  onNavigateToEncyclopedia?: (kpiKey: string) => void;
}

function getScoreInterpretation(score: number, language: string): string {
  if (score >= 85) return language === 'de' ? 'deutlich über dem Branchendurchschnitt' : 'significantly above industry average';
  if (score >= 75) return language === 'de' ? 'über dem Durchschnitt' : 'above average';
  if (score >= 60) return language === 'de' ? 'im Durchschnittsbereich' : 'within the average range';
  if (score >= 45) return language === 'de' ? 'unter dem Durchschnitt' : 'below average';
  return language === 'de' ? 'deutlich unter dem Zielwert' : 'significantly below target';
}

function getScoreRecommendation(dept: string, score: number, language: string): string {
  if (score >= 80) {
    return language === 'de'
      ? 'Aktuelle Best Practices beibehalten und als internes Benchmark nutzen.'
      : 'Maintain current best practices and use as internal benchmark.';
  }
  if (score >= 60) {
    return language === 'de'
      ? 'Gezielte Prozessverbesserungen zur Optimierung einleiten.'
      : 'Initiate targeted process improvements to optimize further.';
  }
  const actions: Record<string, Record<string, string>> = {
    'new-vehicle-sales': { en: 'Prioritize lead management and sales process standardization.', de: 'Lead-Management und Vertriebsprozess-Standardisierung priorisieren.' },
    'used-vehicle-sales': { en: 'Focus on stock turnover optimization and pricing strategy.', de: 'Fokus auf Lagerumschlagsoptimierung und Preisstrategie.' },
    'service-performance': { en: 'Address workshop utilization and service retention gaps.', de: 'Werkstattauslastung und Servicebindungslücken angehen.' },
    'parts-inventory': { en: 'Prioritize inventory management and supplier processes.', de: 'Bestandsmanagement und Lieferantenprozesse priorisieren.' },
    'financial-operations': { en: 'Review cost structures and cash flow management.', de: 'Kostenstrukturen und Cashflow-Management überprüfen.' },
  };
  return actions[dept]?.[language] || (language === 'de' ? 'Sofortige Verbesserungsmaßnahmen empfohlen.' : 'Immediate improvement actions recommended.');
}

function confidenceBadge(c: ConfidenceMetrics, language: string) {
  const labels: Record<string, Record<string, string>> = {
    high: { en: 'High Confidence', de: 'Hohe Konfidenz' },
    medium: { en: 'Medium Confidence', de: 'Mittlere Konfidenz' },
    low: { en: 'Review Recommended', de: 'Überprüfung empfohlen' },
  };
  const colors: Record<string, string> = {
    high: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning-foreground',
    low: 'bg-destructive/10 text-destructive',
  };
  return (
    <Badge className={`${colors[c.confidence]} text-xs`}>
      {labels[c.confidence]?.[language] || labels[c.confidence]?.en}
    </Badge>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Map question prefix to department key for ceiling insights
const PREFIX_TO_DEPT: Record<string, string> = {
  nvs: 'new-vehicle-sales',
  uvs: 'used-vehicle-sales',
  svc: 'service-performance',
  fin: 'financial-operations',
  pts: 'parts-inventory',
};

export function ExecutiveSummary({ overallScore, scores, answers, completedAt, onNavigateToEncyclopedia }: ExecutiveSummaryProps) {
  const { t, language } = useLanguage();

  // Enhanced analytics from the new scoring engine
  const subCategoryData = useMemo(() =>
    calculateSubCategoryScores(questionnaire.sections, answers as Record<string, number>),
    [answers]
  );

  const confidenceData = useMemo(() =>
    calculateAllConfidenceMetrics(questionnaire.sections, answers as Record<string, number>),
    [answers]
  );

  const systemicPatterns = useMemo(() =>
    detectSystemicPatterns(questionnaire.sections, answers as Record<string, number>),
    [answers]
  );

  const computedData = useMemo(() => {
    const getToneClassification = (score: number) => {
      if (score >= 80) return { level: 'excellent', title: t('executive.excellentPerformance'), description: t('executive.excellentDesc') };
      if (score >= 65) return { level: 'good', title: t('executive.goodPerformance'), description: t('executive.goodDesc') };
      if (score >= 50) return { level: 'concerning', title: t('executive.concerningAreas'), description: t('executive.concerningDesc') };
      return { level: 'critical', title: t('executive.criticalIssues'), description: t('executive.criticalDesc') };
    };

    const sortedByScore = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const sortedAsc = Object.entries(scores).sort(([, a], [, b]) => a - b);

    const getStrengths = () => sortedByScore
      .filter(([, score]) => score >= 60)
      .slice(0, 3)
      .map(([dept, score]) => ({
        dept, score,
        text: `${getDepartmentName(dept, language)} ${language === 'de' ? 'erzielte' : 'scored'} ${score}/100 — ${getScoreInterpretation(score, language)}. ${getScoreRecommendation(dept, score, language)}`
      }));

    const getWeaknesses = () => sortedAsc
      .filter(([, score]) => score < 60)
      .slice(0, 3)
      .map(([dept, score]) => ({
        dept, score,
        text: `${getDepartmentName(dept, language)} ${language === 'de' ? 'erzielte' : 'scored'} ${score}/100 — ${getScoreInterpretation(score, language)}. ${getScoreRecommendation(dept, score, language)}`
      }));

    const getTopActions = () => sortedAsc
      .filter(([, score]) => score < 60)
      .slice(0, 2)
      .map(([dept, score]) => ({
        dept, score,
        text: `${getDepartmentName(dept, language)} (${score}%) — ${getScoreRecommendation(dept, score, language)}`
      }));

    const getIndustryComparison = (score: number) => {
      if (score >= 75) return { label: language === 'de' ? 'Überdurchschnittlich' : 'Above Average', percentile: 'Top 25%' };
      if (score >= 60) return { label: language === 'de' ? 'Durchschnittlich' : 'Average', percentile: 'Middle 50%' };
      return { label: language === 'de' ? 'Unterdurchschnittlich' : 'Below Average', percentile: 'Bottom 25%' };
    };

    const getMaturityLevel = (score: number) => {
      return getCanonicalMaturityLevel(score, language as 'en' | 'de');
    };

    const generateSummaryParagraph = () => {
      const topDept = sortedByScore[0];
      const weakestDepts = sortedAsc
        .slice(0, 2)
        .map(([dept, score]) => `${getDepartmentName(dept, language)} (${score}%)`);
      const topDeptName = getDepartmentName(topDept[0], language);

      if (language === 'de') {
        return `Das Autohaus erreicht eine Gesamtleistungsbewertung von ${overallScore}/100 (gewichtet). Die Hauptstärke liegt in ${topDeptName}, was als solide Grundlage für Wachstum dient. ${weakestDepts.length > 0 ? `Sofortige Aufmerksamkeit ist erforderlich in ${weakestDepts.join(' und ')}, um die Gesamtleistung zu optimieren.` : 'Alle Bereiche zeigen solide Leistung.'} Die strategische Umsetzung der empfohlenen Maßnahmen wird signifikante Leistungsverbesserungen erzielen.`;
      }
      return `The dealership achieves an overall weighted performance score of ${overallScore}/100. Key strengths include ${topDeptName}, which serves as a solid foundation for growth. ${weakestDepts.length > 0 ? `Immediate attention is needed in ${weakestDepts.join(' and ')} to optimize overall performance.` : 'All areas demonstrate solid performance.'} Strategic implementation of the recommended action items will drive significant improvements.`;
    };

    const strengths = getStrengths();
    if (strengths.length === 0) {
      strengths.push({ dept: '', score: 0, text: language === 'de' ? 'Grundlegende Betriebsprozesse sind vorhanden und bieten eine Basis für Verbesserungen.' : 'Basic operational processes are in place and provide a foundation for improvement.' });
    }

    const actions = getTopActions();
    if (actions.length === 0) {
      actions.push({ dept: '', score: 0, text: language === 'de' ? 'Aktuelle Leistung optimieren und Best Practices konsolidieren.' : 'Optimize current performance and consolidate best practices.' });
    }

    return {
      tone: getToneClassification(overallScore),
      strengths,
      weaknesses: getWeaknesses(),
      actions,
      industryComparison: getIndustryComparison(overallScore),
      maturityLevel: getMaturityLevel(overallScore),
      summaryParagraph: generateSummaryParagraph(),
      questionsAnswered: Object.keys(answers).length
    };
  }, [overallScore, scores, answers, t, language]);

  const { tone, strengths, weaknesses, actions, industryComparison, maturityLevel, summaryParagraph, questionsAnswered } = computedData;

  const weightTooltipContent = useMemo(() =>
    Object.entries(DEPARTMENT_TO_CATEGORY).map(([dept, cat]) => {
      const pct = Math.round(CATEGORY_WEIGHTS[cat] * 100);
      return `${getDepartmentName(dept, language)}: ${pct}%`;
    }),
    [language]
  );

  // ── New data hooks ──

  const narrative = useMemo(() => {
    const sortedByScore = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const sortedAsc = [...Object.entries(scores)].sort(([, a], [, b]) => a - b);
    const topDept = DEPT_LABELS[sortedByScore[0]?.[0]] ?? 'New Vehicle Sales';
    const weakestDept = DEPT_LABELS[sortedAsc[0]?.[0]] ?? 'New Vehicle Sales';
    const avgScore = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Math.max(Object.values(scores).length, 1));
    const maturityMap: Record<string, MaturityLevel> = {
      'Advanced': 'leading', 'Mature': 'capable', 'Developing': 'developing', 'Basic': 'foundational', 'Inconsistent': 'developing',
    };
    const subCats = Object.values(subCategoryData).flatMap(d => d.subCategories);
    const avgConf = { standardDeviation: 0.5, consistencyScore: 75, confidence: 'medium' as const, reviewRecommended: false };
    const maturity = calculateEnhancedMaturity(avgScore, subCats, avgConf);
    const maturityLevelKey: MaturityLevel = maturityMap[maturity.level] ?? 'developing';
    const questionWeights: Record<string, number> = {};
    questionnaire.sections.forEach(s => s.questions.forEach(q => { questionWeights[q.id] = q.weight; }));
    const signals = generateSignals(answers as Record<string, number>, questionWeights);
    const primarySignal = (signals[0]?.signalCode ?? 'PROCESS_NOT_STANDARDISED') as PrimarySignalCode;
    const isSystemic = systemicPatterns.some(p => p.severity === 'systemic');
    return buildExecutiveNarrative({ maturityLevel: maturityLevelKey, primarySignal, isSystemic, dealerName: 'Your dealership', department: weakestDept, score: avgScore, benchmark: 72 });
  }, [scores, answers, subCategoryData, systemicPatterns]);

  const ceilingInsights = useMemo(() =>
    generateCeilingInsights(answers as Record<string, number>, scores),
    [answers, scores]
  );

  const topSignals = useMemo(() => {
    const questionWeights: Record<string, number> = {};
    questionnaire.sections.forEach(s => s.questions.forEach(q => { questionWeights[q.id] = q.weight; }));
    return generateSignals(answers as Record<string, number>, questionWeights).slice(0, 3);
  }, [answers]);

  const MODULE_BENCHMARKS: Record<string, number> = {
    'new-vehicle-sales': 72, 'used-vehicle-sales': 70,
    'service-performance': 75, 'financial-operations': 68, 'parts-inventory': 65,
  };

  const signalLabels: Record<string, string> = {
    PROCESS_NOT_STANDARDISED: 'Process standardisation gap',
    PROCESS_NOT_EXECUTED: 'Process execution gap',
    ROLE_OWNERSHIP_MISSING: 'Unclear role accountability',
    KPI_NOT_DEFINED: 'Performance metrics not defined',
    KPI_NOT_REVIEWED: 'KPIs not regularly reviewed',
    CAPACITY_MISALIGNED: 'Capacity misalignment',
    TOOL_UNDERUTILISED: 'Technology underutilised',
    GOVERNANCE_WEAK: 'Weak management governance',
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1 — Diagnostic Narrative */}
      {narrative && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Assessment Overview</p>
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.situation}</p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.diagnosis}</p>

              <div className="border-l-2 border-primary pl-4">
                <p className="text-sm text-foreground leading-relaxed font-medium">{narrative.priority}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 1A — Score Decomposition */}
      <ScoreDecomposition scores={scores} overallScore={overallScore} />

      {/* SECTION 1B — Department KPI Heatmap */}
      <DepartmentHeatmap scores={scores} answers={answers as Record<string, number>} />

      {/* SECTION 1C — Causal Chain Diagram */}
      <CausalChainDiagram signals={topSignals} />

      {/* SECTION 1D — Systemic Patterns (moved up per spec) */}
      {systemicPatterns.length > 0 && (
        <Card className="shadow-lg border">
          <CardHeader className="pb-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {language === 'de' ? 'Systemische Muster' : 'Systemic Patterns'}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemicPatterns.map((p) => {
              const isSystemic = p.severity === 'systemic';
              const accent = isSystemic ? 'hsl(0 72% 51%)' : 'hsl(38 92% 50%)';
              const badgeLabel = isSystemic
                ? (language === 'de' ? 'Systemisch' : 'Systemic')
                : (language === 'de' ? 'Wiederkehrend' : 'Recurring');
              const title = p.signalCode
                .split('_')
                .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
                .join(' ');
              const fallbackDesc = language === 'de'
                ? 'Dieses Signal tritt in mehreren Abteilungen auf, was auf eine strukturelle Ursache hindeutet, nicht auf isolierte Ausführung.'
                : 'This signal appears across multiple departments, suggesting a structural cause rather than isolated execution.';
              return (
                <div
                  key={p.signalCode}
                  className="rounded-md p-4 border-l-[3px]"
                  style={{
                    borderLeftColor: accent,
                    backgroundColor: `${accent.replace(')', ' / 0.04)')}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {badgeLabel}
                    </span>
                    <span className="text-[13px] font-medium text-foreground">{title}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.departments.map((d: string) => {
                      const color = DEPT_COLORS_ES[d] ?? 'hsl(var(--muted-foreground))';
                      const abbrev = DEPT_ABBREV_ES[d] ?? d;
                      return (
                        <div
                          key={d}
                          className="rounded-[20px] px-2.5 py-[3px] text-[11px] font-medium border"
                          style={{
                            backgroundColor: `${color.replace(')', ' / 0.10)')}`,
                            borderColor: `${color.replace(')', ' / 0.40)')}`,
                            color,
                          }}
                        >
                          {abbrev}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {p.description || fallbackDesc}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* SECTION 2 — Department Score Cards */}
      <Card className="shadow-lg border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .map(([dept, score]) => {
                const benchmark = MODULE_BENCHMARKS[dept] ?? 72;
                const gap = score - benchmark;
                const isAbove = gap >= 0;
                const statusColor = score >= 75 ? 'border-success/30 bg-success/5'
                  : score >= 55 ? 'border-warning/30 bg-warning/5'
                  : 'border-destructive/30 bg-destructive/5';
                const scoreColor = score >= 75 ? 'text-success'
                  : score >= 55 ? 'text-warning-foreground'
                  : 'text-destructive';
                return (
                  <div key={dept} className={`rounded-lg border p-4 text-center ${statusColor}`}>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      {getDepartmentName(dept, language)}
                    </div>
                    <div className={`text-3xl font-bold tabular-nums ${scoreColor}`}>{score}%</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className={isAbove ? 'text-success' : 'text-destructive'}>
                        {isAbove ? '+' : ''}{gap} vs benchmark
                      </span>
                    </div>
                    <Progress value={score} className="mt-2 h-1.5" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3 — Top Findings */}
      {topSignals.length > 0 && (
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Top Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSignals.map((signal, i) => {
                const severityColor = signal.severity === 'HIGH'
                  ? 'border-l-destructive bg-destructive/5'
                  : signal.severity === 'MEDIUM'
                  ? 'border-l-warning bg-warning/5'
                  : 'border-l-info bg-info/5';
                const severityLabel = signal.severity === 'HIGH' ? 'Critical'
                  : signal.severity === 'MEDIUM' ? 'Moderate' : 'Monitor';
                const severityBadge = signal.severity === 'HIGH'
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : signal.severity === 'MEDIUM'
                  ? 'bg-warning/10 text-warning-foreground border-warning/20'
                  : 'bg-info/10 text-info border-info/20';
                const deptName = getDepartmentName(signal.moduleKey, language);
                const triggerCount = signal.triggeringQuestionIds?.length ?? 1;
                return (
                  <div key={i} className={`border-l-4 rounded-r-lg p-4 ${severityColor}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">
                          {signalLabels[signal.signalCode] ?? signal.signalCode}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {deptName} · {triggerCount} question{triggerCount > 1 ? 's' : ''} flagged
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 ${severityBadge}`}>
                        {severityLabel}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 4 — Systemic Issues Detected */}
      {systemicPatterns.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Systemic Issues Detected</p>
          {systemicPatterns.map((p, i) => {
            const isSystemic = p.severity === 'systemic';
            const borderClass = isSystemic
              ? 'border-l-4 border-l-red-500 border-t border-r border-b border-red-200 bg-red-50'
              : 'border-l-4 border-l-amber-500 border-t border-r border-b border-amber-200 bg-amber-50';
            const badgeClass = isSystemic
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-amber-100 text-amber-700 border-amber-200';
            const badgeLabel = isSystemic ? 'Organisation-wide' : 'Recurring';
            const title = p.signalCode
              .split('_')
              .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
              .join(' ');
            return (
              <Card key={p.signalCode} className={`shadow-sm ${borderClass}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                    <Badge variant="outline" className={`text-xs ${badgeClass}`}>{badgeLabel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.departments.map((d: string) => (
                      <Badge key={d} variant="outline" className="text-xs">
                        {getDepartmentName(d, language)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* SECTION 5 — Excellence Gaps (upgraded) */}
      <CeilingInsightsPanel insights={ceilingInsights} />

    </div>
  );
}
