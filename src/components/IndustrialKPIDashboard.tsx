import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Target, Info, BookOpen, BarChart3 } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber } from "@/utils/euroFormatter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getKPILabel, KPI_DEFINITIONS } from "@/lib/kpiDefinitions";
import { KpiTooltipContent } from "@/components/shared/KpiInsightPanel";
import { SharedSectionHeader } from "@/components/shared/SharedSectionHeader";
import { getScoreLabel, getScoreBadgeVariant } from "@/lib/constants";

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
    usedCarInventoryTurn: 'usedCarInventoryTurn',
    daysInInventory: 'daysInInventory',
    reconditioningCycleTime: 'reconditioningCycleTime',
    grossPerUsedVehicle: 'grossPerUsedVehicle',
    agedStockPercentage: 'agedStockPercentage',
  },
  'service-performance': {
    technicianProductivityPct: 'technicianProductivityPct',
    technicianEfficiencyPct: 'technicianEfficiencyPct',
    laborUtilizationRate: 'laborUtilizationRate',
    firstTimeFixRate: 'firstTimeFixRate',
    serviceRetention: 'serviceRetention',
  },
  'parts-inventory': {
    partsGrossProfit: 'partsGrossProfit',
    partsGrossMarginPct: 'partsGrossMarginPct',
    partsInventoryTurn: 'partsInventoryTurn',
    partsObsolescence: 'partsObsolescence',
    fillRateEnriched: 'fillRateEnriched',
  },
  'financial-operations': {
    totalDealershipNetProfit: 'totalDealershipNetProfit',
    operatingMarginPct: 'operatingMarginPct',
    ebitdaMargin: 'ebitdaMargin',
    grossProfitPerDepartment: 'grossProfitPerDepartment',
    netProfitPerVehicleRetail: 'netProfitPerVehicleRetail',
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

  return (
    <div className="space-y-8">
      {/* Assessment-based KPI context banner */}
      <Card className="bg-primary/5 shadow-sm shadow-card rounded-xl">
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

      <SharedSectionHeader
        icon={BarChart3}
        title={language === 'de' ? 'Relevante Leistungskennzahlen' : 'Relevant Performance Indicators'}
        subtitle={language === 'de' ? 'KPIs basierend auf Ihren bewerteten Bereichen mit Branchenbenchmarks' : 'KPIs directly linked to your lowest-scoring areas — with European benchmark ranges to show where you stand against the market.'}
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

      {Object.entries(scores).sort(([, a], [, b]) => a - b).map(([sectionId, score]) => {
        const kpis = departmentKPIs[sectionId] || [];
        if (kpis.length === 0) return null;

        return (
          <div key={sectionId}>
            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 shadow-card rounded-xl">
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
                  className="cursor-pointer transition-colors shadow-card rounded-xl"
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
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onNavigateToEncyclopedia?.(kpi.key); }}
                        >
                          {language === 'de' ? 'Details anzeigen →' : 'View details →'}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

    </div>
  );
}
