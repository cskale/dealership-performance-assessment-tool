import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

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
  const getToneClassification = (score: number): ToneClassification => {
    if (score >= 80) {
      return {
        level: 'excellent',
        emoji: '🟢',
        color: 'text-green-800 bg-green-50 border-green-200',
        title: 'Excellent Performance',
        description: 'Your dealership demonstrates exceptional operational excellence across key performance areas.'
      };
    } else if (score >= 65) {
      return {
        level: 'good',
        emoji: '🟦',
        color: 'text-blue-800 bg-blue-50 border-blue-200',
        title: 'Good Performance',
        description: 'Your dealership shows strong performance with opportunities for strategic improvements.'
      };
    } else if (score >= 50) {
      return {
        level: 'concerning',
        emoji: '🟡',
        color: 'text-orange-800 bg-orange-50 border-orange-200',
        title: 'Concerning Areas',
        description: 'Your dealership has notable performance gaps that require focused attention and improvement initiatives.'
      };
    } else {
      return {
        level: 'critical',
        emoji: '🔴',
        color: 'text-red-800 bg-red-50 border-red-200',
        title: 'Critical Issues',
        description: 'Your dealership faces significant operational challenges requiring immediate strategic intervention.'
      };
    }
  };

  const getStrengths = (): string[] => {
    const strengths = [];
    if (scores['new-vehicle-sales'] >= 75) strengths.push('New vehicle sales excellence');
    if (scores['used-vehicle-sales'] >= 75) strengths.push('Strong used vehicle operations');
    if (scores['service-performance'] >= 75) strengths.push('Service department efficiency');
    if (scores['parts-inventory'] >= 75) strengths.push('Parts inventory optimization');
    if (scores['financial-operations'] >= 75) strengths.push('Financial process management');
    
    if (strengths.length === 0) {
      // If no department scores above 75, find the highest performing area
      const topDepartment = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
      strengths.push(`Relative strength in ${topDepartment[0].replace('-', ' ')}`);
    }
    
    return strengths;
  };

  const getWeaknesses = (): string[] => {
    const weaknesses = [];
    if (scores['new-vehicle-sales'] < 60) weaknesses.push('New vehicle sales processes');
    if (scores['used-vehicle-sales'] < 60) weaknesses.push('Used vehicle inventory management');
    if (scores['service-performance'] < 60) weaknesses.push('Service department operations');
    if (scores['parts-inventory'] < 60) weaknesses.push('Parts procurement and availability');
    if (scores['financial-operations'] < 60) weaknesses.push('Financial operational efficiency');
    
    return weaknesses;
  };

  const getStrategicRecommendations = (): string[] => {
    const recommendations = [];
    const tone = getToneClassification(overallScore);
    
    if (tone.level === 'critical') {
      recommendations.push('Implement immediate operational restructuring focusing on the lowest-scoring departments');
      recommendations.push('Establish weekly performance review meetings with department heads');
      recommendations.push('Consider bringing in external consultants for rapid improvement initiatives');
    } else if (tone.level === 'concerning') {
      recommendations.push('Develop 90-day improvement plans for underperforming departments');
      recommendations.push('Invest in staff training and process optimization');
      recommendations.push('Implement performance monitoring systems for better visibility');
    } else if (tone.level === 'good') {
      recommendations.push('Focus on achieving consistency across all departments');
      recommendations.push('Implement best practice sharing between high and low performing areas');
      recommendations.push('Consider technology upgrades to drive further efficiency gains');
    } else {
      recommendations.push('Maintain current excellence while exploring innovative growth opportunities');
      recommendations.push('Share best practices with industry peers and consider mentoring programs');
      recommendations.push('Invest in advanced analytics and AI-driven optimization');
    }
    
    return recommendations;
  };

  const tone = getToneClassification(overallScore);
  const strengths = getStrengths();
  const weaknesses = getWeaknesses();
  const recommendations = getStrategicRecommendations();

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
              <div className="text-sm font-medium">Overall Score</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{Object.keys(scores).length}</div>
              <div className="text-sm font-medium">Areas Assessed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {Object.values(scores).filter(score => score >= 75).length}
              </div>
              <div className="text-sm font-medium">Strong Areas</div>
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
              Key Strengths
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
              Areas for Improvement
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
              <p className="text-sm text-orange-700">No critical weaknesses identified. Focus on maintaining current performance levels.</p>
            )}
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Strategic Actions
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
            📋 Assessment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-600">Completion Date</div>
              <div className="font-semibold">{new Date(completedAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">Total Questions</div>
              <div className="font-semibold">{Object.keys(answers).length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">Performance Level</div>
              <Badge className={tone.color}>{tone.title}</Badge>
            </div>
            <div>
              <div className="font-medium text-gray-600">Industry Comparison</div>
              <div className="font-semibold">
                {overallScore >= 75 ? '🟢 Above Average' : overallScore >= 60 ? '🟡 Average' : '🔴 Below Average'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}