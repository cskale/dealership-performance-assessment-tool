import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber, generateRealisticData, industryBenchmarks } from "@/utils/euroFormatter";
import { useLanguage } from "@/contexts/LanguageContext";

interface IndustrialKPIDashboardProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
}

export function IndustrialKPIDashboard({ scores, answers }: IndustrialKPIDashboardProps) {
  const { t, language } = useLanguage();

  const getKPILabel = (key: string): string => {
    const labels: Record<string, Record<string, string>> = {
      monthlyRevenue: { en: 'Monthly Revenue', de: 'Monatsumsatz' },
      averageMargin: { en: 'Average Margin', de: 'Durchschnittliche Marge' },
      customerSatisfaction: { en: 'Customer Satisfaction', de: 'Kundenzufriedenheit' },
      leadConversion: { en: 'Lead Conversion', de: 'Lead-Konvertierung' },
      averageTransactionValue: { en: 'Avg Transaction Value', de: 'Durchschn. Transaktionswert' },
      salesVolume: { en: 'Sales Volume', de: 'Verkaufsvolumen' },
      stockTurnover: { en: 'Stock Turnover', de: 'Lagerumschlag' },
      grossMargin: { en: 'Gross Margin', de: 'Bruttomarge' },
      daysInInventory: { en: 'Days in Inventory', de: 'Lagertage' },
      costPerSale: { en: 'Cost per Sale', de: 'Kosten pro Verkauf' },
      serviceRetention: { en: 'Service Retention', de: 'Servicebindung' },
      workshopUtilization: { en: 'Workshop Utilization', de: 'Werkstattauslastung' },
      laborEfficiency: { en: 'Labor Efficiency', de: 'Arbeitseffizienz' },
      partsAttachment: { en: 'Parts Attachment', de: 'Teileanbindung' },
      averageRO: { en: 'Average RO', de: 'Durchschnittlicher RO' },
      partsMargin: { en: 'Parts Margin', de: 'Teilemarge' },
      fillRate: { en: 'Fill Rate', de: 'Erfüllungsrate' },
      turnoverRate: { en: 'Turnover Rate', de: 'Umschlagsrate' },
      obsoleteStock: { en: 'Obsolete Stock', de: 'Veralteter Bestand' },
      counterSales: { en: 'Counter Sales', de: 'Thekenverkäufe' },
      cashFlow: { en: 'Cash Flow', de: 'Cashflow' },
      workingCapital: { en: 'Working Capital', de: 'Betriebskapital' },
      profitMargin: { en: 'Profit Margin', de: 'Gewinnmarge' },
      expenseRatio: { en: 'Expense Ratio', de: 'Kostenquote' },
      returnOnAssets: { en: 'Return on Assets', de: 'Kapitalrendite' }
    };
    return labels[key]?.[language] || key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  const generateKPICards = (sectionId: string, sectionScore: number) => {
    const data = generateRealisticData(sectionScore, sectionId);
    const benchmarks = industryBenchmarks[sectionId as keyof typeof industryBenchmarks];
    
    if (!data || !benchmarks) return null;

    const kpiData = Object.entries(data).map(([key, value]) => {
      const benchmark = benchmarks[key as keyof typeof benchmarks];
      const performance = typeof value === 'number' && typeof benchmark === 'number' 
        ? ((value / benchmark) * 100) - 100 
        : 0;
      
      return {
        key,
        value,
        benchmark,
        performance,
        isGood: performance >= 0
      };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiData.map(({ key, value, benchmark, performance, isGood }) => (
          <Card key={key} className={`border-l-4 ${isGood ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {getKPILabel(key)}
                </h4>
                {isGood ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {key.includes('Revenue') || key.includes('Value') || key.includes('RO') || key.includes('costPerSale') || key.includes('cashFlow') || key.includes('workingCapital') || key.includes('counterSales')
                    ? formatEuro(value as number)
                    : key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Satisfaction') || key.includes('Retention') || key.includes('Utilization') || key.includes('Performance') || key.includes('Conversion') || key.includes('Attachment') || key.includes('fillRate') || key.includes('obsoleteStock') || key.includes('expenseRatio') || key.includes('returnOnAssets')
                      ? formatPercentage(value as number)
                      : key.includes('Days') || key.includes('daysInInventory')
                        ? `${formatNumber(value as number)} ${t('kpi.days')}`
                        : key.includes('turnoverRate') || key.includes('stockTurnover')
                          ? `${formatNumber(value as number)}x${t('kpi.perYear')}`
                          : formatNumber(value as number)
                  }
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t('kpi.benchmark')}: {
                      key.includes('Revenue') || key.includes('Value') || key.includes('RO') || key.includes('costPerSale') || key.includes('cashFlow') || key.includes('workingCapital') || key.includes('counterSales')
                        ? formatEuro(benchmark as number)
                        : key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Satisfaction') || key.includes('Retention') || key.includes('Utilization') || key.includes('Performance') || key.includes('Conversion') || key.includes('Attachment') || key.includes('fillRate') || key.includes('obsoleteStock') || key.includes('expenseRatio') || key.includes('returnOnAssets')
                          ? formatPercentage(benchmark as number)
                          : key.includes('Days') || key.includes('daysInInventory')
                            ? `${formatNumber(benchmark as number)} ${t('kpi.days')}`
                            : key.includes('turnoverRate') || key.includes('stockTurnover')
                              ? `${formatNumber(benchmark as number)}x${t('kpi.perYear')}`
                              : formatNumber(benchmark as number)
                    }
                  </span>
                  <Badge variant={isGood ? "default" : "destructive"} className="text-xs">
                    {performance >= 0 ? '+' : ''}{formatPercentage(Math.abs(performance))}
                  </Badge>
                </div>
                
                <Progress 
                  value={Math.min(100, Math.max(0, 50 + performance))} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

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

  const getSectionIcon = (sectionId: string) => {
    const icons = {
      'new-vehicle-sales': '🚗',
      'used-vehicle-sales': '🔄',
      'service-performance': '🔧',
      'parts-inventory': '📦',
      'financial-operations': '💰'
    };
    return icons[sectionId as keyof typeof icons] || '📊';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('kpi.excellent');
    if (score >= 60) return t('kpi.good');
    return t('kpi.needsFocus');
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {t('kpi.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('kpi.subtitle')}
        </p>
      </div>

      {Object.entries(scores).map(([sectionId, score]) => (
        <div key={sectionId}>
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSectionIcon(sectionId)}</span>
                  <div>
                    <CardTitle className="text-xl text-primary">
                      {getSectionTitle(sectionId)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('kpi.performanceScore')}: {score}/100
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                    {getScoreLabel(score)}
                  </Badge>
                </div>
              </div>
              <Progress value={score} className="mt-4" />
            </CardHeader>
          </Card>
          
          {generateKPICards(sectionId, score)}
        </div>
      ))}

      {/* Overall Performance Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary flex items-center justify-center gap-2">
            <Award className="h-6 w-6" />
            {t('kpi.overallPerformance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length)}
              </div>
              <div className="text-sm text-muted-foreground">{t('kpi.overallScore')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Object.values(scores).filter(score => score >= 70).length}
              </div>
              <div className="text-sm text-muted-foreground">{t('kpi.strongAreas')}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {Object.values(scores).filter(score => score < 70).length}
              </div>
              <div className="text-sm text-muted-foreground">{t('kpi.improvementAreas')}</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">{t('kpi.strategicRecommendations')}</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(scores)
                .filter(([_, score]) => score < 70)
                .map(([sectionId, _]) => (
                  <li key={sectionId}>
                    • {t('kpi.focusOnImproving')} {getSectionTitle(sectionId).toLowerCase()} {t('kpi.throughTraining')}
                  </li>
                ))
              }
              {Object.values(scores).every(score => score >= 70) && (
                <li>• {t('kpi.excellentAcross')}</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}