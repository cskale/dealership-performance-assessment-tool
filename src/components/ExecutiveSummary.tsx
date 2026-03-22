import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Target, Info, ShieldAlert, BarChart3, BookOpen } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { TOTAL_QUESTIONS, getMaturityLevel as getCanonicalMaturityLevel, SCORE_THRESHOLDS } from "@/lib/constants";
import { getDepartmentName } from "@/lib/departmentNames";
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
  answers: Record<string, any>;
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
    high: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
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
        <Card className="shadow-lg border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                Diagnostic Summary
              </h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.situation}</p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.diagnosis}</p>

            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm text-foreground leading-relaxed font-medium">{narrative.priority}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 2 — Department Score Cards */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--dd-ghost))] mb-3">
          Department Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(() => {
            const MODULE_BADGE_MAP: Record<string, "module-nvs" | "module-uvs" | "module-service" | "module-financial" | "module-parts"> = {
              'new-vehicle-sales': 'module-nvs',
              'used-vehicle-sales': 'module-uvs',
              'service-performance': 'module-service',
              'financial-operations': 'module-financial',
              'parts-inventory': 'module-parts',
            };
            const MODULE_SHORT: Record<string, string> = {
              'new-vehicle-sales': 'NVS',
              'used-vehicle-sales': 'UVS',
              'service-performance': 'Service',
              'financial-operations': 'Finance',
              'parts-inventory': 'Parts',
            };
            return Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .map(([dept, score]) => {
                const benchmark = MODULE_BENCHMARKS[dept] ?? 72;
                const gap = score - benchmark;
                const fillColor = gap >= 0
                  ? 'bg-[hsl(var(--dd-green))]'
                  : gap >= -10
                  ? 'bg-[hsl(var(--dd-amber))]'
                  : 'bg-[hsl(var(--dd-red))]';
                return (
                  <div key={dept} className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <Badge variant={MODULE_BADGE_MAP[dept] ?? 'module-parts'} className="mb-2">
                      {MODULE_SHORT[dept] ?? getDepartmentName(dept, language)}
                    </Badge>
                    <div className="text-[24px] font-semibold tracking-tight text-[hsl(var(--dd-ink))]">
                      {score}
                    </div>
                    <div className="h-1.5 bg-[hsl(var(--dd-fog))] rounded-full w-full mt-2">
                      <div
                        className={`h-full rounded-full ${fillColor}`}
                        style={{ width: `${Math.min(100, score)}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-[hsl(var(--dd-ghost))] mt-1">
                      Benchmark: {benchmark}
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      </div>

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
                  ? 'border-l-red-500 bg-red-50/30'
                  : signal.severity === 'MEDIUM'
                  ? 'border-l-amber-500 bg-amber-50/30'
                  : 'border-l-blue-400 bg-blue-50/30';
                const severityLabel = signal.severity === 'HIGH' ? 'Critical'
                  : signal.severity === 'MEDIUM' ? 'Moderate' : 'Monitor';
                const severityBadge = signal.severity === 'HIGH'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : signal.severity === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-blue-100 text-blue-700 border-blue-200';
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

      {/* SECTION 4 — Systemic Patterns (only when fired) */}
      {systemicPatterns.filter(p => p.severity === 'systemic').length > 0 && (
        <Card className="shadow-lg border border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="h-5 w-5" />
              Organisation-Wide Pattern Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {systemicPatterns.filter(p => p.severity === 'systemic').map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="text-sm text-red-700">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.departments.map(d => (
                    <Badge key={d} variant="outline" className="text-xs border-red-300 text-red-700">
                      {getDepartmentName(d, language)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SECTION 5 — Excellence Gaps (only for high scorers) */}
      {ceilingInsights.length > 0 && (
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Excellence Gaps — Path to Top Quartile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ceilingInsights.map((insight, i) => {
                const prefix = insight.questionId.split('-')[0];
                const deptKey = PREFIX_TO_DEPT[prefix] ?? 'new-vehicle-sales';
                const deptLabel = getDepartmentName(deptKey, language);
                return (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">{deptLabel}</span>
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        Above Average
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {insight.bestInClassDescription}
                    </p>
                    <div className="flex items-start gap-2 bg-blue-50/50 rounded-md p-3">
                      <span className="text-primary font-bold mt-0.5">→</span>
                      <p className="text-sm text-foreground">{insight.nextLevelAction}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
