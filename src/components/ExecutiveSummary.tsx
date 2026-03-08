import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Target, Info, ShieldAlert, BarChart3 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { TOTAL_QUESTIONS } from "@/lib/constants";
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

interface ExecutiveSummaryProps {
  overallScore: number;
  scores: Record<string, number>;
  answers: Record<string, any>;
  completedAt: string;
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

export function ExecutiveSummary({ overallScore, scores, answers, completedAt }: ExecutiveSummaryProps) {
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
      if (score >= 85) return language === 'de' ? 'Fortgeschritten' : 'Advanced';
      if (score >= 70) return language === 'de' ? 'Ausgereift' : 'Mature';
      if (score >= 50) return language === 'de' ? 'Entwickelnd' : 'Developing';
      return language === 'de' ? 'Basis' : 'Basic';
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

  return (
    <div className="space-y-6">
      {/* Summary Paragraph */}
      <Card className="shadow-lg border">
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed text-base">{summaryParagraph}</p>
        </CardContent>
      </Card>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              {language === 'de' ? 'Schlüsselstärken' : 'Key Strengths'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {language === 'de' ? 'Verbesserungsbereiche' : 'Areas for Improvement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {language === 'de' ? 'Alle Bereiche über dem Durchschnitt' : 'All areas performing above average'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Target className="h-5 w-5 text-red-500" />
              {language === 'de' ? 'Empfohlener Fokus' : 'Recommended Focus'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {actions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <Target className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Category Capability Breakdown */}
      {Object.keys(subCategoryData).length > 0 && (
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {language === 'de' ? 'Capability-Analyse nach Teilbereich' : 'Capability Analysis by Sub-Category'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'de'
                ? 'Detaillierte Aufschlüsselung nach Kompetenzbereich innerhalb jeder Abteilung'
                : 'Detailed breakdown by capability area within each department'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(subCategoryData).map(([dept, data]) => {
                const conf = confidenceData[dept];
                return (
                  <div key={dept} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{getDepartmentName(dept, language)}</h4>
                      {conf && confidenceBadge(conf, language)}
                    </div>
                    <div className="space-y-2">
                      {data.subCategories.map((sc) => {
                        const color = sc.score >= 75 ? 'text-emerald-600' : sc.score >= 50 ? 'text-yellow-600' : 'text-red-600';
                        return (
                          <div key={sc.category} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-24 truncate capitalize">{sc.category}</span>
                            <Progress value={sc.score} className="flex-1 h-2" />
                            <span className={`text-xs font-semibold w-10 text-right ${color}`}>{sc.score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Systemic Patterns */}
      {systemicPatterns.filter(p => p.severity === 'systemic').length > 0 && (
        <Card className="shadow-lg border border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="h-5 w-5" />
              {language === 'de' ? 'Systemische Muster erkannt' : 'Systemic Patterns Detected'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {systemicPatterns.filter(p => p.severity === 'systemic').map((p, i) => (
                <li key={i} className="text-sm text-red-700">
                  <span className="font-medium capitalize">{p.signalCode.toLowerCase()}</span>: {p.description}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.departments.map(d => (
                      <Badge key={d} variant="outline" className="text-xs border-red-300 text-red-700">
                        {getDepartmentName(d, language)}
                      </Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Department Overview Cards */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {language === 'de' ? 'Abteilungsübersicht' : 'Department Overview'}
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 transition-colors" aria-label="Score calculation info">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3">
                <p className="font-medium mb-2">{language === 'de' ? 'Gewichtete Berechnung' : 'Weighted Calculation'}</p>
                <ul className="text-xs space-y-1">
                  {weightTooltipContent.map((line, i) => (
                    <li key={i}>- {line}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(scores).map(([dept, score]) => {
              const deptName = getDepartmentName(dept, language);
              const scoreColor = score >= 75 ? 'text-emerald-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
              const bgColor = score >= 75 ? 'bg-emerald-50' : score >= 60 ? 'bg-yellow-50' : 'bg-red-50';
              return (
                <div key={dept} className={`${bgColor} rounded-lg p-4 text-center transition-transform hover:scale-105`}>
                  <div className={`text-3xl font-bold ${scoreColor}`}>{score}%</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{deptName}</div>
                  <Progress value={score} className="mt-2 h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Stats */}
      <Card className="bg-gradient-to-r from-primary/90 to-primary text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{overallScore}%</div>
              <div className="text-sm text-white/80">{language === 'de' ? 'Gewichtete Punktzahl' : 'Weighted Score'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{industryComparison.label}</div>
              <div className="text-sm text-white/80">{industryComparison.percentile}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{questionsAnswered}/{TOTAL_QUESTIONS}</div>
              <div className="text-sm text-white/80">{language === 'de' ? 'Fragen' : 'Questions'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{maturityLevel}</div>
              <div className="text-sm text-white/80">{language === 'de' ? 'Reifestufe' : 'Maturity Level'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
