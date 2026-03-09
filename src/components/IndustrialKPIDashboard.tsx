import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Target, DollarSign, Info, BookOpen, BarChart3 } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber } from "@/utils/euroFormatter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getKPILabel, KPI_DEFINITIONS } from "@/lib/kpiDefinitions";
import { KpiTooltipContent } from "@/components/shared/KpiInsightPanel";
import { SharedSectionHeader } from "@/components/shared/SharedSectionHeader";
import { getScoreLabel, getScoreBadgeVariant, SCORE_THRESHOLDS } from "@/lib/constants";

interface IndustrialKPIDashboardProps {
  scores: Record<string, number>;
  onNavigateToEncyclopedia?: (kpiKey?: string) => void;
}

// Map section KPI keys to canonical KPI definition keys
const kpiKeyMapping: Record<string, Record<string, string>> = {
  'new-vehicle-sales': {
    leadResponseTime: 'leadResponseTime',
    leadConversion: 'leadConversion',
    showroomConversion: 'showroomConversion',
    testDriveRatio: 'testDriveRatio',
    appointmentShowRate: 'appointmentShowRate',
  },
  'used-vehicle-sales': {
    grossPerUsedRetailed: 'grossPerUsedRetailed',
    usedVehicleInventoryTurn: 'usedVehicleInventoryTurn',
    reconCycleDays: 'reconCycleDays',
    daysSupply: 'daysSupply',
    usedRetailMix: 'usedRetailMix',
  },
  'service-performance': {
    serviceAbsorption: 'serviceAbsorption',
    labourEfficiency: 'labourEfficiency',
    technicianUtilization: 'technicianUtilization',
    effectiveLabourRate: 'effectiveLabourRate',
    serviceRetention: 'serviceRetention',
  },
  'parts-inventory': {
    partsGrossProfit: 'partsGrossProfit',
    partsInventoryTurnover: 'partsInventoryTurnover',
    partsFillRate: 'partsFillRate',
    partsSalesPerRo: 'partsSalesPerRo',
    partsObsolescence: 'partsObsolescence',
  },
  'financial-operations': {
    netProfitMargin: 'netProfitMargin',
    returnOnAssets: 'returnOnAssets',
    variableSelling: 'variableSelling',
    inventoryTurnover: 'inventoryTurnover',
  }
};

export function IndustrialKPIDashboard({ 
  scores, 
  onNavigateToEncyclopedia 
}: IndustrialKPIDashboardProps) {
  const { language } = useLanguage();

  // Get department-relevant KPIs from canonical definitions
  const departmentKPIs = useMemo(() => {
    const result: Record<string, Array<{ key: string; title: string; benchmark?: string; whyItMatters: string }>> = {};
    
    Object.entries(kpiKeyMapping).forEach(([sectionId, kpis]) => {
      result[sectionId] = Object.entries(kpis).map(([_, canonicalKey]) => {
        const kpiDef = KPI_DEFINITIONS[canonicalKey];
        if (!kpiDef) return null;
        const localized = kpiDef[language as 'en' | 'de'] || kpiDef.en;
        return {
          key: canonicalKey,
          title: localized.title,
          benchmark: localized.benchmark,
          whyItMatters: localized.whyItMatters,
        };
      }).filter(Boolean) as Array<{ key: string; title: string; benchmark?: string; whyItMatters: string }>;
    });
    
    return result;
  }, [language]);

  const getSectionTitle = (sectionId: string) => {
    const titles: Record<string, Record<string, string>> = {
      'new-vehicle-sales': { en: 'New Vehicle Sales KPIs', de: 'Neuwagen-KPIs' },
      'used-vehicle-sales': { en: 'Used Vehicle Sales KPIs', de: 'Gebrauchtwagen-KPIs' },
      'service-performance': { en: 'Service Department KPIs', de: 'Service-KPIs' },
      'parts-inventory': { en: 'Parts & Inventory KPIs', de: 'Teile & Lager-KPIs' },
      'financial-operations': { en: 'Financial Operations KPIs', de: 'Finanz-KPIs' }
    };
    return titles[sectionId]?.[language] || sectionId;
  };

  // Calculate average score for overall performance
  const avgScore = useMemo(() => {
    const values = Object.values(scores);
    return Math.round(values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1));
  }, [scores]);

  return (
    <div className="space-y-8">
      {/* Assessment-based KPI context banner */}
      <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {language === 'de' 
                  ? 'KPI-Kontext aus Ihrer Bewertung'
                  : 'KPI Context from Your Assessment'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'de'
                  ? 'Die folgenden KPIs sind für Ihre bewerteten Bereiche relevant. Benchmarks stammen aus Branchenstandards. Klicken Sie auf einen KPI, um Details in der Enzyklopädie anzuzeigen.'
                  : 'The following KPIs are relevant to your assessed areas. Benchmarks are from industry standards. Click any KPI to view details in the Encyclopedia.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Hero Card */}
      <Card className="col-span-2 mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6 flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {language === 'de' ? 'Gesamtleistung' : 'Overall Performance Score'}
            </p>
            <div className="text-5xl font-bold text-foreground leading-none">{avgScore}</div>
            <Badge className={`mt-2 ${
              avgScore >= SCORE_THRESHOLDS.excellent ? 'bg-success/20 text-success border-success/30' : 
              avgScore >= SCORE_THRESHOLDS.good ? 'bg-warning/20 text-warning-foreground border-warning/30' : 
              'bg-destructive/20 text-destructive border-destructive/30'
            }`}>
              {getScoreLabel(avgScore, language as 'en' | 'de')}
            </Badge>
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p>
              {language === 'de' 
                ? 'Aggregierte Leistung über alle bewerteten Abteilungen.'
                : 'Aggregated performance across all assessed departments.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <SharedSectionHeader
        icon={BarChart3}
        title={language === 'de' ? 'Relevante Leistungskennzahlen' : 'Relevant Performance Indicators'}
        subtitle={language === 'de' ? 'KPIs basierend auf Ihren bewerteten Bereichen mit Branchenbenchmarks' : 'KPIs based on your assessed areas with industry benchmarks'}
        action={
          onNavigateToEncyclopedia && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToEncyclopedia()}
              className="text-xs"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              {language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}
            </Button>
          )
        }
        size="lg"
      />

      {Object.entries(scores).map(([sectionId, score]) => {
        const kpis = departmentKPIs[sectionId] || [];
        if (kpis.length === 0) return null;

        return (
          <div key={sectionId}>
            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-primary">
                      {getSectionTitle(sectionId)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'de' ? 'Bewertungspunktzahl' : 'Assessment Score'}: {score}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{score}</div>
                    <Badge variant={getScoreBadgeVariant(score)}>
                      {getScoreLabel(score, language as 'en' | 'de')}
                    </Badge>
                  </div>
                </div>
                <Progress value={score} className="mt-4" />
              </CardHeader>
            </Card>
            
            {/* KPI Cards - show relevant KPIs with benchmark context */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {kpis.map((kpi) => (
                <Card 
                  key={kpi.key} 
                  className="border-l-4 border-l-primary/50 hover:border-l-primary cursor-pointer transition-colors"
                  onClick={() => onNavigateToEncyclopedia?.(kpi.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">{kpi.title}</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="p-3 max-w-xs">
                          <KpiTooltipContent kpiKey={kpi.key} language={language as 'en' | 'de'} />
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="space-y-2">
                      {kpi.benchmark && (
                        <div className="flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {language === 'de' ? 'Benchmark' : 'Benchmark'}: {kpi.benchmark}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {kpi.whyItMatters}
                      </p>
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-xs text-primary hover:underline">
                          {language === 'de' ? 'Details anzeigen →' : 'View details →'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Strategic Recommendations */}
      <Card className="bg-warning/10 border-2 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl text-warning-foreground flex items-center gap-2">
            <Target className="h-5 w-5" />
            {language === 'de' ? 'Strategische Empfehlungen' : 'Strategic Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-warning-foreground/90 space-y-2">
            {Object.entries(scores)
              .filter(([_, score]) => score < 70) // Below mature threshold
              .slice(0, 3)
              .map(([sectionId, score]) => (
                <li key={sectionId} className="flex items-start gap-2">
                  <span className="text-warning-foreground/70 mt-0.5">•</span>
                  <span>
                    {language === 'de' ? 'Fokus auf Verbesserung von' : 'Focus on improving'} <strong>{getSectionTitle(sectionId)}</strong> ({score}%) {language === 'de' ? 'durch gezielte Schulung und Prozessoptimierung' : 'through targeted training and process optimization'}
                  </span>
                </li>
              ))
            }
            {Object.values(scores).every(score => score >= SCORE_THRESHOLDS.mature) && (
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                <span>
                  {language === 'de'
                    ? 'Hervorragende Leistung in allen Bereichen! Konzentrieren Sie sich auf die Aufrechterhaltung der Exzellenz und erkunden Sie neue Wachstumschancen.'
                    : 'Excellent performance across all areas! Focus on maintaining excellence and exploring new growth opportunities.'}
                </span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
