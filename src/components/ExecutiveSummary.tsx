import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExecutiveSummaryProps {
  overallScore: number;
  scores: Record<string, number>;
  answers: Record<string, any>;
  completedAt: string;
}

interface ToneClassification {
  level: 'excellent' | 'good' | 'concerning' | 'critical';
  emoji: string;
  color: string;
  title: string;
  description: string;
}

export function ExecutiveSummary({ overallScore, scores, answers, completedAt }: ExecutiveSummaryProps) {
  const { t, language } = useLanguage();

  // Memoize all computed values to prevent recalculation
  const computedData = useMemo(() => {
    const getToneClassification = (score: number): ToneClassification => {
      if (score >= 80) {
        return {
          level: 'excellent',
          emoji: '🟢',
          color: 'text-green-800 bg-green-50 border-green-200',
          title: t('executive.excellentPerformance'),
          description: t('executive.excellentDesc')
        };
      } else if (score >= 65) {
        return {
          level: 'good',
          emoji: '🟦',
          color: 'text-blue-800 bg-blue-50 border-blue-200',
          title: t('executive.goodPerformance'),
          description: t('executive.goodDesc')
        };
      } else if (score >= 50) {
        return {
          level: 'concerning',
          emoji: '🟡',
          color: 'text-orange-800 bg-orange-50 border-orange-200',
          title: t('executive.concerningAreas'),
          description: t('executive.concerningDesc')
        };
      } else {
        return {
          level: 'critical',
          emoji: '🔴',
          color: 'text-red-800 bg-red-50 border-red-200',
          title: t('executive.criticalIssues'),
          description: t('executive.criticalDesc')
        };
      }
    };

    const getStrengths = (): string[] => {
      const strengths = [];
      if (scores['new-vehicle-sales'] >= 75) strengths.push(t('executive.strength.newVehicle'));
      if (scores['used-vehicle-sales'] >= 75) strengths.push(t('executive.strength.usedVehicle'));
      if (scores['service-performance'] >= 75) strengths.push(t('executive.strength.service'));
      if (scores['parts-inventory'] >= 75) strengths.push(t('executive.strength.parts'));
      if (scores['financial-operations'] >= 75) strengths.push(t('executive.strength.financial'));
      
      if (strengths.length === 0) {
        const entries = Object.entries(scores);
        if (entries.length > 0) {
          const topDepartment = entries.reduce((a, b) => a[1] > b[1] ? a : b);
          strengths.push(`${t('executive.strength.relative')} ${topDepartment[0].replace(/-/g, ' ')}`);
        }
      }
      
      return strengths;
    };

    const getWeaknesses = (): string[] => {
      const weaknesses = [];
      if (scores['new-vehicle-sales'] < 60) weaknesses.push(t('executive.weakness.newVehicle'));
      if (scores['used-vehicle-sales'] < 60) weaknesses.push(t('executive.weakness.usedVehicle'));
      if (scores['service-performance'] < 60) weaknesses.push(t('executive.weakness.service'));
      if (scores['parts-inventory'] < 60) weaknesses.push(t('executive.weakness.parts'));
      if (scores['financial-operations'] < 60) weaknesses.push(t('executive.weakness.financial'));
      
      return weaknesses;
    };

    const getTopActions = (): string[] => {
      const actions = [];
      const sortedScores = Object.entries(scores).sort(([,a], [,b]) => a - b);
      
      sortedScores.slice(0, 3).forEach(([dept, score]) => {
        if (score < 60) {
          const deptName = dept.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          actions.push(`${language === 'de' ? 'Fokus auf' : 'Focus on'} ${deptName} (${score}%)`);
        }
      });
      
      if (actions.length === 0) {
        actions.push(language === 'de' ? 'Aktuelle Leistung aufrechterhalten' : 'Maintain current performance');
      }
      
      return actions;
    };

    const getIndustryComparison = (score: number) => {
      if (score >= 75) return { emoji: '🟢', label: t('executive.aboveAverage'), percentile: 'Top 25%' };
      if (score >= 60) return { emoji: '🟡', label: t('executive.average'), percentile: 'Middle 50%' };
      return { emoji: '🔴', label: t('executive.belowAverage'), percentile: 'Bottom 25%' };
    };

    return {
      tone: getToneClassification(overallScore),
      strengths: getStrengths(),
      weaknesses: getWeaknesses(),
      actions: getTopActions(),
      industryComparison: getIndustryComparison(overallScore),
      areasCount: Object.keys(scores).length,
      strongAreasCount: Object.values(scores).filter(score => score >= 75).length
    };
  }, [overallScore, scores, t, language]);

  const { tone, strengths, weaknesses, actions, industryComparison, areasCount, strongAreasCount } = computedData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US');
  };

  // Calculate score ring colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Hero Score Section - Large 96px Circle */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Large Score Circle */}
            <div className="relative flex-shrink-0">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  className={getScoreColor(overallScore)}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallScore / 100) * 553} 553`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold">{overallScore}</span>
                <span className="text-lg text-white/70">/100</span>
              </div>
            </div>

            {/* Score Context */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-2">{tone.title}</h2>
              <p className="text-white/70 mb-4">{tone.description}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Badge className="bg-white/10 text-white border-white/20">
                  {industryComparison.emoji} {industryComparison.percentile} vs other dealers
                </Badge>
                <Badge className="bg-white/10 text-white border-white/20">
                  {strongAreasCount} of {areasCount} areas strong
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-Column Grid: Strengths | Needs Work | Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths - Green */}
        <Card className="border-2 border-green-200 bg-green-50 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              {t('executive.keyStrengths')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 text-green-700">
                  <span className="text-green-500 mt-0.5 text-xl">✓</span>
                  <span className="text-sm font-medium">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Needs Work - Yellow/Orange */}
        <Card className="border-2 border-yellow-200 bg-yellow-50 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              {t('executive.areasForImprovement')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3 text-yellow-700">
                    <span className="text-yellow-500 mt-0.5 text-xl">⚠</span>
                    <span className="text-sm font-medium">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-700 font-medium">{t('executive.noWeaknesses')}</p>
            )}
          </CardContent>
        </Card>

        {/* Actions Needed - Red */}
        <Card className="border-2 border-red-200 bg-red-50 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              {language === 'de' ? 'Sofortige Maßnahmen' : 'Actions Needed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-red-700">
                  <span className="text-red-500 mt-0.5 text-xl">→</span>
                  <span className="text-sm font-medium">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Department Scores Grid */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {language === 'de' ? 'Abteilungsübersicht' : 'Department Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(scores).map(([dept, score]) => {
              const deptName = dept.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const scoreColor = score >= 75 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
              const bgColor = score >= 75 ? 'bg-green-50' : score >= 60 ? 'bg-yellow-50' : 'bg-red-50';
              
              return (
                <div key={dept} className={`${bgColor} rounded-lg p-4 text-center`}>
                  <div className={`text-3xl font-bold ${scoreColor}`}>{score}%</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{deptName}</div>
                  <Progress value={score} className="mt-2 h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 {t('executive.assessmentDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">{t('executive.completionDate')}</div>
              <div className="font-semibold">{formatDate(completedAt)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">{t('executive.totalQuestions')}</div>
              <div className="font-semibold">{Object.keys(answers).length}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">{t('executive.performanceLevel')}</div>
              <Badge className={tone.color}>{tone.title}</Badge>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">{t('executive.industryComparison')}</div>
              <div className="font-semibold">
                {industryComparison.emoji} {industryComparison.label}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
