import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExecutiveSummaryProps {
  overallScore: number;
  scores: Record<string, number>;
  answers: Record<string, any>;
  completedAt: string;
}

export function ExecutiveSummary({ overallScore, scores, answers, completedAt }: ExecutiveSummaryProps) {
  const { t, language } = useLanguage();

  // Memoize all computed values to prevent recalculation
  const computedData = useMemo(() => {
    const getToneClassification = (score: number) => {
      if (score >= 80) {
        return {
          level: 'excellent',
          title: t('executive.excellentPerformance'),
          description: t('executive.excellentDesc')
        };
      } else if (score >= 65) {
        return {
          level: 'good',
          title: t('executive.goodPerformance'),
          description: t('executive.goodDesc')
        };
      } else if (score >= 50) {
        return {
          level: 'concerning',
          title: t('executive.concerningAreas'),
          description: t('executive.concerningDesc')
        };
      } else {
        return {
          level: 'critical',
          title: t('executive.criticalIssues'),
          description: t('executive.criticalDesc')
        };
      }
    };

    const getStrengths = (): string[] => {
      const strengths: string[] = [];
      const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
      
      sortedScores.forEach(([dept, score]) => {
        if (score >= 60 && strengths.length < 3) {
          const deptNames: Record<string, Record<string, string>> = {
            'new-vehicle-sales': { en: 'New Vehicle Sales Performance', de: 'Neuwagenverkaufsleistung' },
            'used-vehicle-sales': { en: 'Used Vehicle Sales Performance', de: 'Gebrauchtwagenverkaufsleistung' },
            'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
            'parts-inventory': { en: 'Parts and Inventory Performance', de: 'Teile- und Lagerleistung' },
            'financial-operations': { en: 'Financial Operations Performance', de: 'Finanzoperationsleistung' }
          };
          strengths.push(deptNames[dept]?.[language] || dept);
        }
      });
      
      if (strengths.length === 0) {
        strengths.push(language === 'de' ? 'Grundlegende Betriebsprozesse' : 'Basic Operational Processes');
      }
      
      return strengths;
    };

    const getWeaknesses = (): string[] => {
      const weaknesses: string[] = [];
      const sortedScores = Object.entries(scores).sort(([,a], [,b]) => a - b);
      
      sortedScores.forEach(([dept, score]) => {
        if (score < 60 && weaknesses.length < 3) {
          const deptNames: Record<string, Record<string, string>> = {
            'new-vehicle-sales': { en: 'New Vehicle Sales Performance', de: 'Neuwagenverkaufsleistung' },
            'used-vehicle-sales': { en: 'Used Vehicle Sales Performance', de: 'Gebrauchtwagenverkaufsleistung' },
            'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
            'parts-inventory': { en: 'Parts and Inventory Performance', de: 'Teile- und Lagerleistung' },
            'financial-operations': { en: 'Financial Operations Performance', de: 'Finanzoperationsleistung' }
          };
          weaknesses.push(deptNames[dept]?.[language] || dept);
        }
      });
      
      return weaknesses;
    };

    const getTopActions = (): string[] => {
      const actions: string[] = [];
      const sortedScores = Object.entries(scores).sort(([,a], [,b]) => a - b);
      
      sortedScores.slice(0, 2).forEach(([dept, score]) => {
        if (score < 60) {
          const deptNames: Record<string, Record<string, string>> = {
            'new-vehicle-sales': { en: 'New Vehicle Sales Performance', de: 'Neuwagenverkaufsleistung' },
            'used-vehicle-sales': { en: 'Used Vehicle Sales Performance', de: 'Gebrauchtwagenverkaufsleistung' },
            'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
            'parts-inventory': { en: 'Parts and Inventory Performance (Priority Area)', de: 'Teile- und Lagerleistung (Prioritätsbereich)' },
            'financial-operations': { en: 'Financial Operations Performance', de: 'Finanzoperationsleistung' }
          };
          actions.push(deptNames[dept]?.[language] || dept);
        }
      });
      
      if (actions.length === 0) {
        actions.push(language === 'de' ? 'Aktuelle Leistung optimieren' : 'Optimize Current Performance');
      }
      
      return actions;
    };

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
      const avgScore = overallScore;
      const topDept = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
      const weakestDepts = Object.entries(scores)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 2)
        .map(([dept, score]) => {
          const deptNames: Record<string, Record<string, string>> = {
            'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
            'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
            'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
            'parts-inventory': { en: 'Parts and Inventory Performance', de: 'Teile- und Lagerleistung' },
            'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
          };
          return `${deptNames[dept]?.[language] || dept} (${score}%)`;
        });

      const topDeptName: Record<string, Record<string, string>> = {
        'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
        'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
        'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
        'parts-inventory': { en: 'Parts and Inventory', de: 'Teile und Lager' },
        'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
      };

      if (language === 'de') {
        return `Das Autohaus steht vor erheblichen betrieblichen Herausforderungen mit einer Leistungsbewertung von ${avgScore}%, was eine dringende strategische Intervention in mehreren Abteilungen erfordert. Die Hauptstärke liegt in ${topDeptName[topDept[0]]?.de || topDept[0]}, was als solide Grundlage für Wachstum dient. Sofortige Aufmerksamkeit ist erforderlich in ${weakestDepts.join(' und ')}, um die Gesamtleistung des Autohauses zu optimieren. Die strategische Umsetzung der empfohlenen Maßnahmen wird signifikante Leistungsverbesserungen und Gewinnsteigerungen erzielen.`;
      }

      return `The dealership faces significant operational challenges with a ${avgScore}% performance score, requiring urgent strategic intervention across multiple departments. Key strengths include ${topDeptName[topDept[0]]?.en || topDept[0]}, which serves as a solid foundation for growth. Immediate attention is needed in ${weakestDepts.join(' and ')} to optimize overall dealership performance. Strategic implementation of the recommended action items will drive significant performance improvements and profitability gains.`;
    };

    return {
      tone: getToneClassification(overallScore),
      strengths: getStrengths(),
      weaknesses: getWeaknesses(),
      actions: getTopActions(),
      industryComparison: getIndustryComparison(overallScore),
      maturityLevel: getMaturityLevel(overallScore),
      summaryParagraph: generateSummaryParagraph(),
      questionsAnswered: Object.keys(answers).length
    };
  }, [overallScore, scores, answers, t, language]);

  const { tone, strengths, weaknesses, actions, industryComparison, maturityLevel, summaryParagraph, questionsAnswered } = computedData;

  return (
    <div className="space-y-6">
      {/* Clean Summary Paragraph - NO colored background */}
      <Card className="shadow-lg border">
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed text-base">
            {summaryParagraph}
          </p>
        </CardContent>
      </Card>

      {/* 3-Column Grid: Strengths | Needs Work | Actions - Clean white cards with colored icons only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths - White card with green icon */}
        <Card className="shadow-lg border bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              {language === 'de' ? 'Schlüsselstärken' : 'Key Strengths'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Needs Work - White card with yellow icon */}
        <Card className="shadow-lg border bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {language === 'de' ? 'Verbesserungsbereiche' : 'Areas for Improvement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-yellow-500 mt-0.5">⚠</span>
                    <span className="text-sm">{weakness}</span>
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

        {/* Actions Needed - White card with red icon */}
        <Card className="shadow-lg border bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Target className="h-5 w-5 text-red-500" />
              {language === 'de' ? 'Empfohlener Fokus' : 'Recommended Focus'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="text-red-500 mt-0.5">🚨</span>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview Cards */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {language === 'de' ? 'Abteilungsübersicht' : 'Department Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(scores).map(([dept, score]) => {
              const deptNames: Record<string, Record<string, string>> = {
                'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
                'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
                'service-performance': { en: 'Service', de: 'Service' },
                'parts-inventory': { en: 'Parts', de: 'Teile' },
                'financial-operations': { en: 'Financial', de: 'Finanzen' }
              };
              const deptName = deptNames[dept]?.[language] || dept.replace(/-/g, ' ');
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

      {/* Bottom Stats Bar */}
      <Card className="bg-gradient-to-r from-primary/90 to-primary text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{overallScore}%</div>
              <div className="text-sm text-white/80">{language === 'de' ? 'Gesamtpunktzahl' : 'Overall Score'}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{industryComparison.label}</div>
              <div className="text-sm text-white/80">{industryComparison.percentile}</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{questionsAnswered}/60</div>
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
