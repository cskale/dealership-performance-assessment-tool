import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Zap, Info, AlertCircle, TrendingUp, Award, ShieldQuestion } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDepartmentName } from "@/lib/departmentNames";
import {
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
  calculateSubCategoryScores,
  calculateAllConfidenceMetrics,
  calculateEnhancedMaturity,
  type EnhancedMaturityResult,
} from "@/lib/scoringEngine";
import { questionnaire } from "@/data/questionnaire";

interface MaturityScoringProps {
  scores: Record<string, number>;
  answers: Record<string, any>;
}

interface MaturityLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  characteristics: string[];
}

export function MaturityScoring({ scores, answers }: MaturityScoringProps) {
  const { t, language } = useLanguage();

  const subCategoryData = useMemo(() =>
    calculateSubCategoryScores(questionnaire.sections, answers as Record<string, number>),
    [answers]
  );

  const confidenceData = useMemo(() =>
    calculateAllConfidenceMetrics(questionnaire.sections, answers as Record<string, number>),
    [answers]
  );

  const maturityLevels: MaturityLevel[] = useMemo(() => [
    {
      level: 1,
      name: language === 'de' ? 'Basis' : 'Basic',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50 text-red-800 border-red-200',
      description: language === 'de' ? 'Grundlegende Prozesse vorhanden' : 'Basic processes in place',
      characteristics: [
        language === 'de' ? 'Grundlegende Prozesse vorhanden' : 'Basic processes in place',
        language === 'de' ? 'Begrenzte Datennutzung' : 'Limited data usage',
        language === 'de' ? 'Reaktiver Ansatz' : 'Reactive approach',
        language === 'de' ? 'Verbesserungspotenzial' : 'Room for improvement'
      ]
    },
    {
      level: 2,
      name: language === 'de' ? 'Entwickelnd' : 'Developing',
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      description: language === 'de' ? 'Prozesse werden standardisiert' : 'Processes being standardized',
      characteristics: [
        language === 'de' ? 'Strukturierte Prozesse' : 'Structured processes',
        language === 'de' ? 'Regelmäßige Datenanalyse' : 'Regular data analysis',
        language === 'de' ? 'Proaktive Maßnahmen' : 'Proactive measures',
        language === 'de' ? 'Kontinuierliche Verbesserung' : 'Continuous improvement'
      ]
    },
    {
      level: 3,
      name: language === 'de' ? 'Ausgereift' : 'Mature',
      icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      description: language === 'de' ? 'Optimierte Prozesse' : 'Optimized processes',
      characteristics: [
        language === 'de' ? 'Optimierte Arbeitsabläufe' : 'Optimized workflows',
        language === 'de' ? 'Datengesteuerte Entscheidungen' : 'Data-driven decisions',
        language === 'de' ? 'Starke Kundenorientierung' : 'Strong customer focus',
        language === 'de' ? 'Marktführende Praktiken' : 'Market-leading practices'
      ]
    },
    {
      level: 4,
      name: language === 'de' ? 'Fortgeschritten' : 'Advanced',
      icon: <Award className="h-5 w-5 text-emerald-600" />,
      color: 'bg-green-50 text-green-800 border-green-200',
      description: language === 'de' ? 'Branchenführend' : 'Industry leading',
      characteristics: [
        language === 'de' ? 'Innovation und Best Practices' : 'Innovation and best practices',
        language === 'de' ? 'Exzellente Leistung' : 'Excellent performance',
        language === 'de' ? 'Digitale Transformation' : 'Digital transformation',
        language === 'de' ? 'Benchmarking-Standard' : 'Benchmarking standard'
      ]
    }
  ], [language]);

  // Enhanced maturity per department
  const departmentMaturityData = useMemo(() => {
    return Object.entries(scores).map(([dept, score]) => {
      const subCats = subCategoryData[dept]?.subCategories || [];
      const conf = confidenceData[dept] || { standardDeviation: 0, consistencyScore: 100, confidence: 'high' as const, reviewRecommended: false };
      const enhanced = calculateEnhancedMaturity(score, subCats, conf);

      // Map enhanced level to our MaturityLevel objects
      const levelMap: Record<string, MaturityLevel> = {
        'Basic': maturityLevels[0],
        'Developing': maturityLevels[1],
        'Mature': maturityLevels[2],
        'Advanced': maturityLevels[3],
        'Inconsistent': { ...maturityLevels[1], name: language === 'de' ? 'Inkonsistent' : 'Inconsistent', icon: <ShieldQuestion className="h-5 w-5 text-amber-600" />, color: 'bg-amber-50 text-amber-800 border-amber-200' },
      };

      return {
        department: getDepartmentName(dept, language),
        deptKey: dept,
        score,
        level: levelMap[enhanced.level] || maturityLevels[0],
        enhanced,
        confidence: conf,
      };
    });
  }, [scores, subCategoryData, confidenceData, maturityLevels, language]);

  const overallMaturity = useMemo(() => {
    const avgScore = Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length || 0;
    const allSubCats = Object.values(subCategoryData).flatMap(d => d.subCategories);
    const overallConf = {
      standardDeviation: 0,
      consistencyScore: 100,
      confidence: 'high' as const,
      reviewRecommended: false,
    };
    return calculateEnhancedMaturity(Math.round(avgScore), allSubCats, overallConf);
  }, [scores, subCategoryData]);

  const overallMaturityLevel = useMemo(() => {
    const m: Record<string, MaturityLevel> = {
      'Basic': maturityLevels[0],
      'Developing': maturityLevels[1],
      'Mature': maturityLevels[2],
      'Advanced': maturityLevels[3],
      'Inconsistent': maturityLevels[1],
    };
    return m[overallMaturity.level] || maturityLevels[0];
  }, [overallMaturity, maturityLevels]);

  const radarData = useMemo(() =>
    Object.entries(scores).map(([key, score]) => ({
      subject: getDepartmentName(key, language),
      score: score || 0,
      benchmark: 75,
      fullMark: 100
    })),
    [scores, language]
  );

  const gapAnalysisData = useMemo(() => {
    const INDUSTRY_AVG = 75;
    return Object.entries(scores)
      .map(([dept, score]) => {
        const gap = score - INDUSTRY_AVG;
        let priorityLabel: string, priorityColor: string, priorityIcon: React.ReactNode;
        if (gap <= -30) {
          priorityLabel = language === 'de' ? 'Kritisch' : 'Critical';
          priorityColor = 'bg-red-100 text-red-800';
          priorityIcon = <AlertCircle className="h-3 w-3 text-red-600 inline mr-1" />;
        } else if (gap <= -10) {
          priorityLabel = language === 'de' ? 'Mittel' : 'Medium';
          priorityColor = 'bg-yellow-100 text-yellow-800';
          priorityIcon = <TrendingUp className="h-3 w-3 text-yellow-600 inline mr-1" />;
        } else {
          priorityLabel = language === 'de' ? 'Niedrig' : 'Low';
          priorityColor = 'bg-green-100 text-green-800';
          priorityIcon = <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />;
        }
        return { category: getDepartmentName(dept, language), yourScore: score, industryAvg: INDUSTRY_AVG, gap, priorityLabel, priorityColor, priorityIcon };
      })
      .sort((a, b) => a.gap - b.gap);
  }, [scores, language]);

  const weightTooltipLines = useMemo(() =>
    Object.entries(DEPARTMENT_TO_CATEGORY).map(([dept, cat]) =>
      `${getDepartmentName(dept, language)}: ${Math.round(CATEGORY_WEIGHTS[cat] * 100)}%`
    ),
    [language]
  );

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {language === 'de' ? 'Leistungsradar' : 'Performance Radar'}
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 transition-colors" aria-label="Calculation info">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3">
                <p className="font-medium mb-2">{language === 'de' ? 'Gewichtete Berechnung' : 'Weighted Calculation'}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {language === 'de'
                    ? 'Abteilungspunktzahlen nutzen Fragengewichte. Gesamtpunktzahl wird gewichtet berechnet:'
                    : 'Section scores use question weights. Overall score is calculated with category weights:'}
                </p>
                <ul className="text-xs space-y-1">
                  {weightTooltipLines.map((line, i) => <li key={i}>- {line}</li>)}
                </ul>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'de'
              ? 'Ihre Bewertung (blau) vs. Branchendurchschnitt 75% (graue Linie)'
              : 'Your assessment (blue) vs. industry benchmark 75% (gray line)'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Radar name={language === 'de' ? 'Branchendurchschnitt (75%)' : 'Industry Benchmark (75%)'} dataKey="benchmark" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.15} strokeWidth={2} strokeDasharray="5 5" />
                <Radar name={language === 'de' ? 'Ihre Bewertung' : 'Your Score'} dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{language === 'de' ? 'Lückenanalyse' : 'Performance Gap Analysis'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'de'
              ? 'Vergleich Ihrer Leistung mit dem Branchendurchschnitt'
              : 'Comparison of your performance against industry average'}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'de' ? 'Kategorie' : 'Category'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Ihre Punktzahl' : 'Your Score'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Branchendurchschnitt' : 'Industry Avg'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Lücke' : 'Gap'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Konfidenz' : 'Confidence'}</TableHead>
                <TableHead className="text-center">{language === 'de' ? 'Priorität' : 'Priority'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gapAnalysisData.map((row, i) => {
                // Find dept key for confidence lookup
                const deptEntry = departmentMaturityData.find(d => d.department === row.category);
                const conf = deptEntry?.confidence;
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.category}</TableCell>
                    <TableCell className="text-center font-semibold">{row.yourScore}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.industryAvg}</TableCell>
                    <TableCell className={`text-center font-semibold ${row.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {row.gap >= 0 ? '+' : ''}{row.gap}
                    </TableCell>
                    <TableCell className="text-center">
                      {conf && (
                        <Badge className={`text-xs ${conf.confidence === 'high' ? 'bg-emerald-100 text-emerald-800' : conf.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {conf.consistencyScore}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={row.priorityColor}>{row.priorityIcon} {row.priorityLabel}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overall Maturity */}
      <Card className={`border-2 shadow-lg ${overallMaturityLevel.color}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{overallMaturityLevel.icon}</span>
            <div>
              <CardTitle className="text-xl font-bold">
                {language === 'de' ? 'Reifestufe' : 'Maturity Level'}: {overallMaturity.level === 'Inconsistent' ? (language === 'de' ? 'Inkonsistent' : 'Inconsistent') : overallMaturityLevel.name}
              </CardTitle>
              <p className="text-sm opacity-80 mt-1">{overallMaturity.reason}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">{language === 'de' ? 'Aktuelle Merkmale' : 'Current Characteristics'}</h4>
              <ul className="space-y-1">
                {overallMaturityLevel.characteristics.map((char, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">{language === 'de' ? 'Abteilungs-Reifegrad' : 'Department Maturity'}</h4>
              <div className="space-y-2">
                {departmentMaturityData.map((d) => (
                  <div key={d.deptKey} className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <span className="flex-shrink-0">{d.level.icon}</span>
                    <span className="flex-shrink-0 w-28 truncate">{d.department}</span>
                    <Progress value={d.score} className="flex-1 h-2 min-w-[60px]" />
                    <span className="flex-shrink-0 text-xs w-20 text-right">
                      {d.enhanced.level === 'Inconsistent' ? (language === 'de' ? 'Inkonsistent' : 'Inconsistent') : d.level.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {language === 'de' ? 'Entwicklungs-Roadmap' : 'Development Roadmap'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            {maturityLevels.map((level, index) => {
              const count = departmentMaturityData.filter(d => d.level.level === level.level).length;
              return (
                <div key={level.level} className="flex items-center gap-2">
                  <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-bold ${level.color} ${overallMaturityLevel.level === level.level ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    {level.icon}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold">{level.name}</div>
                    <div className="text-muted-foreground">{count} {language === 'de' ? 'Bereiche' : 'depts'}</div>
                  </div>
                  {index < maturityLevels.length - 1 && <div className="hidden md:block w-8 h-0.5 bg-gray-300 mx-2" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
