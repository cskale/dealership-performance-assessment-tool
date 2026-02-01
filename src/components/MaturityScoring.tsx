import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Circle, Target, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

interface MaturityScoringProps {
  scores: Record<string, number>;
  answers: Record<string, any>;
}

interface MaturityLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  emoji: string;
  color: string;
  description: string;
  characteristics: string[];
}

export function MaturityScoring({ scores, answers }: MaturityScoringProps) {
  const { t, language } = useLanguage();

  const maturityLevels: MaturityLevel[] = useMemo(() => [
    {
      level: 1,
      name: t('maturity.basic'),
      emoji: '🔴',
      color: 'bg-red-50 text-red-800 border-red-200',
      description: t('maturity.basicDesc'),
      characteristics: [
        t('maturity.char.basic1'),
        t('maturity.char.basic2'),
        t('maturity.char.basic3'),
        t('maturity.char.basic4')
      ]
    },
    {
      level: 2,
      name: t('maturity.developing'),
      emoji: '🟡',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      description: t('maturity.developingDesc'),
      characteristics: [
        t('maturity.char.developing1'),
        t('maturity.char.developing2'),
        t('maturity.char.developing3'),
        t('maturity.char.developing4')
      ]
    },
    {
      level: 3,
      name: t('maturity.mature'),
      emoji: '🟦',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      description: t('maturity.matureDesc'),
      characteristics: [
        t('maturity.char.mature1'),
        t('maturity.char.mature2'),
        t('maturity.char.mature3'),
        t('maturity.char.mature4')
      ]
    },
    {
      level: 4,
      name: t('maturity.advanced'),
      emoji: '🟢',
      color: 'bg-green-50 text-green-800 border-green-200',
      description: t('maturity.advancedDesc'),
      characteristics: [
        t('maturity.char.advanced1'),
        t('maturity.char.advanced2'),
        t('maturity.char.advanced3'),
        t('maturity.char.advanced4')
      ]
    }
  ], [t]);

  const getMaturityLevel = (score: number): MaturityLevel => {
    if (score >= 85) return maturityLevels[3]; // Advanced
    if (score >= 70) return maturityLevels[2]; // Mature
    if (score >= 50) return maturityLevels[1]; // Developing
    return maturityLevels[0]; // Basic
  };

  // Exact 5 assessment sections for radar chart
  const radarData = useMemo(() => {
    const sectionNames = {
      'new-vehicle-sales': language === 'de' ? 'Neuwagenverkauf' : 'New Vehicle Sales',
      'used-vehicle-sales': language === 'de' ? 'Gebrauchtwagenverkauf' : 'Used Vehicle Sales',
      'service-performance': language === 'de' ? 'Serviceleistung' : 'Service Performance',
      'parts-inventory': language === 'de' ? 'Teile & Lager' : 'Parts & Inventory',
      'financial-operations': language === 'de' ? 'Finanzoperationen' : 'Financial Operations'
    };

    return Object.entries(sectionNames).map(([key, name]) => ({
      subject: name,
      score: scores[key] || 0,
      benchmark: 70, // Industry average benchmark
      fullMark: 100
    }));
  }, [scores, language]);

  const overallMaturity = useMemo(() => {
    const avgScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.values(scores).length || 0;
    return getMaturityLevel(avgScore);
  }, [scores, maturityLevels]);

  const getStepsToNextLevel = (): string[] => {
    const avgScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.values(scores).length || 0;
    
    if (avgScore >= 85) {
      return [
        language === 'de' ? 'Innovationskultur weiter stärken' : 'Continue strengthening innovation culture',
        language === 'de' ? 'Best Practices mit anderen teilen' : 'Share best practices with others',
        language === 'de' ? 'Marktführerschaft ausbauen' : 'Expand market leadership'
      ];
    } else if (avgScore >= 70) {
      return [
        language === 'de' ? 'Schwächste Bereiche auf 85+ bringen' : 'Bring weakest areas to 85+',
        language === 'de' ? 'Erweiterte Analytik implementieren' : 'Implement advanced analytics',
        language === 'de' ? 'Vollständige Prozessautomatisierung' : 'Full process automation'
      ];
    } else if (avgScore >= 50) {
      return [
        language === 'de' ? 'Kernprozesse standardisieren' : 'Standardize core processes',
        language === 'de' ? 'Digitale Tools einführen' : 'Introduce digital tools',
        language === 'de' ? 'Team-Schulungsprogramme starten' : 'Start team training programs'
      ];
    } else {
      return [
        language === 'de' ? 'Grundlegende Systeme implementieren' : 'Implement basic systems',
        language === 'de' ? 'Klare Prozesse definieren' : 'Define clear processes',
        language === 'de' ? 'Performance-Tracking einrichten' : 'Set up performance tracking'
      ];
    }
  };

  const departmentMaturityData = useMemo(() => {
    return Object.entries(scores).map(([dept, score]) => {
      const deptNames: Record<string, Record<string, string>> = {
        'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
        'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
        'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
        'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
        'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
      };
      
      const level = getMaturityLevel(score);
      const nextLevel = level.level < 4 ? maturityLevels[level.level] : null;
      
      return {
        department: deptNames[dept]?.[language] || dept,
        score,
        level,
        nextLevel,
        progressToNext: nextLevel ? Math.min(100, ((score % 20) / 20) * 100) : 100
      };
    });
  }, [scores, language, maturityLevels]);

  return (
    <div className="space-y-6">
      {/* Radar Chart Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 {language === 'de' ? 'Leistungsradar' : 'Performance Radar'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'de' 
              ? 'Ihre Bewertung vs. Branchendurchschnitt (graue Linie)'
              : 'Your assessment vs. industry benchmark (gray line)'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Radar
                  name={language === 'de' ? 'Branchendurchschnitt' : 'Industry Benchmark'}
                  dataKey="benchmark"
                  stroke="#9ca3af"
                  fill="#9ca3af"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Radar
                  name={language === 'de' ? 'Ihre Bewertung' : 'Your Score'}
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  strokeWidth={3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Overall Maturity Assessment */}
      <Card className={`border-2 shadow-lg ${overallMaturity.color}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{overallMaturity.emoji}</span>
            <div>
              <CardTitle className="text-xl font-bold">
                {t('maturity.title')}: {overallMaturity.name}
              </CardTitle>
              <p className="text-sm opacity-80 mt-1">{overallMaturity.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">{t('maturity.currentCharacteristics')}</h4>
              <ul className="space-y-1">
                {overallMaturity.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">{t('maturity.maturityDistribution')}</h4>
              <div className="space-y-2">
                {maturityLevels.map((level) => {
                  const count = departmentMaturityData.filter(d => d.level.level === level.level).length;
                  const percentage = (count / departmentMaturityData.length) * 100;
                  return (
                    <div key={level.level} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{level.emoji}</span>
                        <span>{level.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20" />
                        <span className="text-xs w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps to Next Level */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            {language === 'de' ? '3 Schritte zur nächsten Stufe' : '3 Steps to Next Maturity Level'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getStepsToNextLevel().map((step, index) => (
              <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-800 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Maturity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departmentMaturityData.map((dept, index) => (
          <Card key={index} className="border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dept.department}</CardTitle>
                <Badge className={dept.level.color} variant="outline">
                  {dept.level.emoji} {dept.level.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{t('maturity.currentScore')}</span>
                  <span className="text-xl font-bold">{Math.round(dept.score)}</span>
                </div>
                <Progress value={dept.score} className="mb-2" />
                <p className="text-sm text-gray-600">{dept.level.description}</p>
              </div>

              {/* Progress to Next Level */}
              {dept.nextLevel && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-700">
                      {t('maturity.progressTo')} {dept.nextLevel.name}
                    </span>
                    <span className="text-blue-600 font-bold">{Math.round(dept.progressToNext)}%</span>
                  </div>
                  <Progress value={dept.progressToNext} className="mb-2" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600">{t('maturity.nextMilestone')}:</span>
                    <span className="text-blue-800 font-medium">
                      {dept.nextLevel.emoji} {dept.nextLevel.name} {t('maturity.level')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maturity Roadmap */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('maturity.developmentRoadmap')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            {maturityLevels.map((level, index) => (
              <div key={level.level} className="flex items-center gap-2">
                <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-bold ${level.color}`}>
                  <span className="text-2xl">{level.emoji}</span>
                </div>
                <div className="text-sm">
                  <div className="font-bold">{level.name}</div>
                  <div className="text-muted-foreground">
                    {departmentMaturityData.filter(d => d.level.level === level.level).length} {t('maturity.departments')}
                  </div>
                </div>
                {index < maturityLevels.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
