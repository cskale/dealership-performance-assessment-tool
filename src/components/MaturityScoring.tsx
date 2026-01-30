import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Circle, Target, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

interface DepartmentMaturity {
  department: string;
  score: number;
  currentLevel: MaturityLevel;
  nextLevel?: MaturityLevel;
  progressToNext: number;
  keyGaps: string[];
}

export function MaturityScoring({ scores, answers }: MaturityScoringProps) {
  const { t, language } = useLanguage();

  const maturityLevels: MaturityLevel[] = [
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
  ];

  const getMaturityLevel = (score: number): MaturityLevel => {
    if (score >= 85) return maturityLevels[3]; // Advanced
    if (score >= 70) return maturityLevels[2]; // Mature
    if (score >= 50) return maturityLevels[1]; // Developing
    return maturityLevels[0]; // Basic
  };

  const getDepartmentName = (dept: string): string => {
    const names: Record<string, Record<string, string>> = {
      'new-vehicle-sales': { en: 'New Vehicle Sales', de: 'Neuwagenverkauf' },
      'used-vehicle-sales': { en: 'Used Vehicle Sales', de: 'Gebrauchtwagenverkauf' },
      'service-performance': { en: 'Service Performance', de: 'Serviceleistung' },
      'parts-inventory': { en: 'Parts & Inventory', de: 'Teile & Lager' },
      'financial-operations': { en: 'Financial Operations', de: 'Finanzoperationen' }
    };
    return names[dept]?.[language] || dept.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDepartmentMaturity = (): DepartmentMaturity[] => {
    return Object.entries(scores).map(([dept, score]) => {
      const currentLevel = getMaturityLevel(score);
      const nextLevelIndex = Math.min(3, currentLevel.level);
      const nextLevel = nextLevelIndex < 3 ? maturityLevels[nextLevelIndex] : undefined;
      
      // Calculate progress to next level
      const levelRanges = [
        { min: 0, max: 49 },   // Basic
        { min: 50, max: 69 },  // Developing
        { min: 70, max: 84 },  // Mature
        { min: 85, max: 100 }  // Advanced
      ];
      
      const currentRange = levelRanges[currentLevel.level - 1];
      const progressToNext = nextLevel 
        ? Math.round(((score - currentRange.min) / (currentRange.max - currentRange.min)) * 100)
        : 100;

      // Determine key gaps based on department and score
      const keyGaps = getKeyGaps(dept, score, currentLevel.level);

      return {
        department: getDepartmentName(dept),
        score,
        currentLevel,
        nextLevel,
        progressToNext,
        keyGaps
      };
    });
  };

  const getKeyGaps = (department: string, score: number, level: number): string[] => {
    const gapsEn: Record<string, Record<number, string[]>> = {
      'new-vehicle-sales': {
        1: ['Implement CRM system', 'Standardize sales process', 'Basic customer follow-up'],
        2: ['Digital lead management', 'Sales team training programs', 'Performance tracking systems'],
        3: ['Advanced analytics', 'Customer journey optimization', 'Predictive inventory management'],
        4: ['AI-powered recommendations', 'Omnichannel experience', 'Advanced personalization']
      },
      'used-vehicle-sales': {
        1: ['Inventory management system', 'Reconditioning standards', 'Basic appraisal tools'],
        2: ['Market pricing tools', 'Digital marketing presence', 'Quality control processes'],
        3: ['Predictive pricing models', 'Automated marketing', 'Advanced analytics'],
        4: ['AI-driven inventory optimization', 'Dynamic pricing', 'Machine learning insights']
      },
      'service-performance': {
        1: ['Digital scheduling system', 'Basic technician training', 'Customer communication tools'],
        2: ['Service advisor productivity tools', 'Quality metrics tracking', 'Customer satisfaction surveys'],
        3: ['Predictive maintenance programs', 'Advanced diagnostics', 'Workflow optimization'],
        4: ['IoT integration', 'AI diagnostics', 'Predictive service recommendations']
      },
      'parts-inventory': {
        1: ['Inventory management system', 'Supplier relationship management', 'Basic forecasting'],
        2: ['Automated ordering systems', 'Performance metrics', 'Obsolete parts management'],
        3: ['Predictive inventory planning', 'Advanced analytics', 'Integrated supply chain'],
        4: ['AI-powered demand forecasting', 'Real-time optimization', 'Predictive logistics']
      },
      'financial-operations': {
        1: ['Basic financial reporting', 'Cash flow management', 'Budget planning'],
        2: ['Automated reporting systems', 'Performance dashboards', 'Cost center analysis'],
        3: ['Advanced financial analytics', 'Predictive modeling', 'Integrated business intelligence'],
        4: ['AI-driven financial insights', 'Real-time optimization', 'Advanced forecasting models']
      }
    };

    const gapsDe: Record<string, Record<number, string[]>> = {
      'new-vehicle-sales': {
        1: ['CRM-System implementieren', 'Verkaufsprozess standardisieren', 'Grundlegende Kundennachverfolgung'],
        2: ['Digitales Lead-Management', 'Verkaufsteam-Schulungsprogramme', 'Leistungsverfolgungssysteme'],
        3: ['Erweiterte Analytik', 'Customer-Journey-Optimierung', 'Prädiktives Bestandsmanagement'],
        4: ['KI-gestützte Empfehlungen', 'Omnichannel-Erlebnis', 'Erweiterte Personalisierung']
      },
      'used-vehicle-sales': {
        1: ['Bestandsmanagement-System', 'Aufbereitungsstandards', 'Grundlegende Bewertungstools'],
        2: ['Marktpreistools', 'Digitale Marketingpräsenz', 'Qualitätskontrollprozesse'],
        3: ['Prädiktive Preismodelle', 'Automatisiertes Marketing', 'Erweiterte Analytik'],
        4: ['KI-gesteuerte Bestandsoptimierung', 'Dynamische Preisgestaltung', 'Machine-Learning-Erkenntnisse']
      },
      'service-performance': {
        1: ['Digitales Terminplanungssystem', 'Grundlegende Technikerschulung', 'Kundenkommunikationstools'],
        2: ['Serviceberater-Produktivitätstools', 'Qualitätskennzahlen-Tracking', 'Kundenzufriedenheitsumfragen'],
        3: ['Prädiktive Wartungsprogramme', 'Erweiterte Diagnostik', 'Workflow-Optimierung'],
        4: ['IoT-Integration', 'KI-Diagnostik', 'Prädiktive Serviceempfehlungen']
      },
      'parts-inventory': {
        1: ['Bestandsmanagement-System', 'Lieferantenbeziehungsmanagement', 'Grundlegende Prognosen'],
        2: ['Automatisierte Bestellsysteme', 'Leistungskennzahlen', 'Obsolete-Teile-Management'],
        3: ['Prädiktive Bestandsplanung', 'Erweiterte Analytik', 'Integrierte Lieferkette'],
        4: ['KI-gestützte Bedarfsprognose', 'Echtzeit-Optimierung', 'Prädiktive Logistik']
      },
      'financial-operations': {
        1: ['Grundlegendes Finanzreporting', 'Cashflow-Management', 'Budgetplanung'],
        2: ['Automatisierte Berichtssysteme', 'Leistungs-Dashboards', 'Kostenstellenanalyse'],
        3: ['Erweiterte Finanzanalytik', 'Prädiktive Modellierung', 'Integrierte Business Intelligence'],
        4: ['KI-gesteuerte Finanzerkenntnisse', 'Echtzeit-Optimierung', 'Erweiterte Prognosemodelle']
      }
    };

    const gaps = language === 'de' ? gapsDe : gapsEn;
    const nextLevel = Math.min(4, level + 1);
    const defaultGaps = language === 'de' 
      ? ['Prozessoptimierung', 'Technologieverbesserung', 'Leistungssteigerung']
      : ['Process optimization', 'Technology enhancement', 'Performance improvement'];
    
    return gaps[department]?.[nextLevel] || defaultGaps;
  };

  const departmentMaturity = getDepartmentMaturity();
  const overallMaturity = getMaturityLevel(
    departmentMaturity.reduce((sum, dept) => sum + dept.score, 0) / departmentMaturity.length
  );

  return (
    <div className="space-y-6">
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
                  const count = departmentMaturity.filter(d => d.currentLevel.level === level.level).length;
                  const percentage = (count / departmentMaturity.length) * 100;
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

      {/* Department Maturity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departmentMaturity.map((dept, index) => (
          <Card key={index} className="border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dept.department}</CardTitle>
                <Badge className={dept.currentLevel.color} variant="outline">
                  {dept.currentLevel.emoji} {dept.currentLevel.name}
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
                <p className="text-sm text-gray-600">{dept.currentLevel.description}</p>
              </div>

              {/* Progress to Next Level */}
              {dept.nextLevel && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-700">
                      {t('maturity.progressTo')} {dept.nextLevel.name}
                    </span>
                    <span className="text-blue-600 font-bold">{dept.progressToNext}%</span>
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

              {/* Key Gaps */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t('maturity.keyDevelopmentAreas')}
                </h4>
                <ul className="space-y-1">
                  {dept.keyGaps.map((gap, gapIndex) => (
                    <li key={gapIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <Circle className="h-3 w-3 mt-1 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maturity Roadmap */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('maturity.developmentRoadmap')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maturityLevels.map((level, index) => (
              <div key={level.level} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${level.color}`}>
                  {level.level}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{level.emoji}</span>
                    <h3 className="font-bold text-lg">{level.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {departmentMaturity.filter(d => d.currentLevel.level === level.level).length} {t('maturity.departments')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {level.characteristics.map((char, charIndex) => (
                      <div key={charIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-gray-700">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {index < maturityLevels.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mt-3" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}