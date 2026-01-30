import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
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
      // If no department scores above 75, find the highest performing area
      const topDepartment = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
      strengths.push(`${t('executive.strength.relative')} ${topDepartment[0].replace('-', ' ')}`);
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

  const getStrategicRecommendations = (): string[] => {
    const recommendations = [];
    const tone = getToneClassification(overallScore);
    
    if (tone.level === 'critical') {
      recommendations.push(t('executive.rec.critical1'));
      recommendations.push(t('executive.rec.critical2'));
      recommendations.push(t('executive.rec.critical3'));
    } else if (tone.level === 'concerning') {
      recommendations.push(t('executive.rec.concerning1'));
      recommendations.push(t('executive.rec.concerning2'));
      recommendations.push(t('executive.rec.concerning3'));
    } else if (tone.level === 'good') {
      recommendations.push(t('executive.rec.good1'));
      recommendations.push(t('executive.rec.good2'));
      recommendations.push(t('executive.rec.good3'));
    } else {
      recommendations.push(t('executive.rec.excellent1'));
      recommendations.push(t('executive.rec.excellent2'));
      recommendations.push(t('executive.rec.excellent3'));
    }
    
    return recommendations;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US');
  };

  const getIndustryComparison = (score: number) => {
    if (score >= 75) return { emoji: '🟢', label: t('executive.aboveAverage') };
    if (score >= 60) return { emoji: '🟡', label: t('executive.average') };
    return { emoji: '🔴', label: t('executive.belowAverage') };
  };

  const tone = getToneClassification(overallScore);
  const strengths = getStrengths();
  const weaknesses = getWeaknesses();
  const recommendations = getStrategicRecommendations();
  const industryComparison = getIndustryComparison(overallScore);

  return (
    <div className="space-y-6">
      {/* Performance Classification */}
      <Card className={`border-2 shadow-lg ${tone.color}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tone.emoji}</span>
            <div>
              <CardTitle className="text-xl font-bold">{tone.title}</CardTitle>
              <p className="text-sm opacity-80 mt-1">{tone.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{overallScore}</div>
              <div className="text-sm font-medium">{t('executive.overallScore')}</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{Object.keys(scores).length}</div>
              <div className="text-sm font-medium">{t('executive.areasAssessed')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {Object.values(scores).filter(score => score >= 75).length}
              </div>
              <div className="text-sm font-medium">{t('executive.strongAreas')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {t('executive.keyStrengths')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-green-700">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('executive.areasForImprovement')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-orange-700">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-orange-700">{t('executive.noWeaknesses')}</p>
            )}
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('executive.strategicActions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

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
              <div className="font-medium text-gray-600">{t('executive.completionDate')}</div>
              <div className="font-semibold">{formatDate(completedAt)}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">{t('executive.totalQuestions')}</div>
              <div className="font-semibold">{Object.keys(answers).length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">{t('executive.performanceLevel')}</div>
              <Badge className={tone.color}>{tone.title}</Badge>
            </div>
            <div>
              <div className="font-medium text-gray-600">{t('executive.industryComparison')}</div>
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