import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber, generateRealisticData, industryBenchmarks } from "@/utils/euroFormatter";
import { useLanguage } from "@/contexts/LanguageContext";

interface IndustrialKPIDashboardProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
  onNavigateToResources?: () => void;
}

// KPI definitions with benchmarks and explanations
const kpiDefinitions: Record<string, {
  definition: { en: string; de: string };
  whyMatters: { en: string; de: string };
  topics: string[];
}> = {
  monthlyRevenue: {
    definition: { en: 'Total revenue generated from sales per month', de: 'Gesamtumsatz aus Verkäufen pro Monat' },
    whyMatters: { en: 'Primary indicator of business health and growth trajectory', de: 'Primärer Indikator für Unternehmensgesundheit und Wachstumskurs' },
    topics: ['sales', 'finance']
  },
  averageMargin: {
    definition: { en: 'Average profit margin across all vehicle sales', de: 'Durchschnittliche Gewinnmarge über alle Fahrzeugverkäufe' },
    whyMatters: { en: 'Impacts profitability and pricing strategy effectiveness', de: 'Beeinflusst Rentabilität und Effektivität der Preisstrategie' },
    topics: ['sales', 'finance']
  },
  customerSatisfaction: {
    definition: { en: 'Average post-service survey rating from customers', de: 'Durchschnittliche Kundenbewertung nach dem Service' },
    whyMatters: { en: 'Drives repeat business, referrals, and brand loyalty', de: 'Fördert Folgegeschäft, Empfehlungen und Markentreue' },
    topics: ['service', 'customer-experience']
  },
  leadConversion: {
    definition: { en: 'Percentage of leads that convert to actual sales', de: 'Prozentsatz der Leads, die zu Verkäufen führen' },
    whyMatters: { en: 'Measures sales team effectiveness and follow-up quality', de: 'Misst die Effektivität des Verkaufsteams und die Nachverfolgungsqualität' },
    topics: ['sales', 'efficiency']
  },
  laborEfficiency: {
    definition: { en: 'Percentage of billable hours vs total available hours', de: 'Prozentsatz der abrechenbaren Stunden vs. verfügbare Gesamtstunden' },
    whyMatters: { en: 'Impacts profitability and capacity utilization', de: 'Beeinflusst Rentabilität und Kapazitätsauslastung' },
    topics: ['service', 'efficiency']
  },
  workshopUtilization: {
    definition: { en: 'Percentage of workshop capacity being used productively', de: 'Prozentsatz der produktiv genutzten Werkstattkapazität' },
    whyMatters: { en: 'Indicates operational efficiency and revenue potential', de: 'Zeigt betriebliche Effizienz und Umsatzpotenzial' },
    topics: ['service', 'efficiency']
  },
  serviceRetention: {
    definition: { en: 'Percentage of customers returning within 12 months', de: 'Prozentsatz der Kunden, die innerhalb von 12 Monaten zurückkehren' },
    whyMatters: { en: 'Indicates loyalty and predictable revenue stream', de: 'Zeigt Loyalität und vorhersehbare Einnahmequelle' },
    topics: ['service', 'customer-experience']
  },
  partsMargin: {
    definition: { en: 'Profit margin on parts sales', de: 'Gewinnmarge bei Teileverkäufen' },
    whyMatters: { en: 'Key contributor to service department profitability', de: 'Wichtiger Beitrag zur Rentabilität der Serviceabteilung' },
    topics: ['parts', 'finance']
  },
  fillRate: {
    definition: { en: 'Percentage of parts orders fulfilled from stock', de: 'Prozentsatz der aus dem Lager erfüllten Teilebestellungen' },
    whyMatters: { en: 'Affects service speed and customer satisfaction', de: 'Beeinflusst Servicegeschwindigkeit und Kundenzufriedenheit' },
    topics: ['parts', 'inventory']
  },
  turnoverRate: {
    definition: { en: 'How many times inventory is sold and replaced per year', de: 'Wie oft der Lagerbestand pro Jahr verkauft und ersetzt wird' },
    whyMatters: { en: 'Measures inventory management efficiency', de: 'Misst die Effizienz des Bestandsmanagements' },
    topics: ['parts', 'inventory']
  },
  obsoleteStock: {
    definition: { en: 'Percentage of inventory with no movement over 12 months', de: 'Prozentsatz des Bestands ohne Bewegung über 12 Monate' },
    whyMatters: { en: 'Ties up capital and reduces profitability', de: 'Bindet Kapital und reduziert Rentabilität' },
    topics: ['parts', 'inventory']
  },
  stockTurnover: {
    definition: { en: 'Rate at which vehicle stock is sold and replenished', de: 'Rate, mit der Fahrzeugbestand verkauft und aufgefüllt wird' },
    whyMatters: { en: 'Impacts cash flow and carrying costs', de: 'Beeinflusst Cashflow und Lagerkosten' },
    topics: ['sales', 'inventory']
  },
  daysInInventory: {
    definition: { en: 'Average days a vehicle stays in stock before sale', de: 'Durchschnittliche Tage, die ein Fahrzeug vor dem Verkauf auf Lager ist' },
    whyMatters: { en: 'Lower is better - reduces depreciation and holding costs', de: 'Niedriger ist besser - reduziert Wertverlust und Lagerkosten' },
    topics: ['sales', 'inventory']
  },
  profitMargin: {
    definition: { en: 'Net profit as percentage of total revenue', de: 'Nettogewinn als Prozentsatz des Gesamtumsatzes' },
    whyMatters: { en: 'Ultimate measure of business profitability', de: 'Ultimatives Maß für die Geschäftsrentabilität' },
    topics: ['finance']
  },
  cashFlow: {
    definition: { en: 'Net cash moving in and out of business', de: 'Netto-Cashflow des Unternehmens' },
    whyMatters: { en: 'Critical for operations and growth investments', de: 'Kritisch für Betrieb und Wachstumsinvestitionen' },
    topics: ['finance']
  }
};

export function IndustrialKPIDashboard({ scores }: { scores: Record<string, number> }) {
  const { language } = useLanguage();

  // CRITICAL FIX: Memoize ALL KPI data to prevent recalculation when clicking info button
  // This ensures numbers stay STATIC and never change
  const memoizedKPIData = useMemo(() => {
    const allData: Record<string, { key: string; value: number; benchmark: number; performance: number; isGood: boolean }[]> = {};
    
    Object.entries(scores).forEach(([sectionId, sectionScore]) => {
      const data = generateRealisticData(sectionScore, sectionId);
      const benchmarks = industryBenchmarks[sectionId as keyof typeof industryBenchmarks];
      
      if (data && benchmarks) {
        allData[sectionId] = Object.entries(data).map(([key, value]) => {
          const benchmark = benchmarks[key as keyof typeof benchmarks];
          const performance = typeof value === 'number' && typeof benchmark === 'number' 
            ? ((value / benchmark) * 100) - 100 
            : 0;
          
          return {
            key,
            value: value as number,
            benchmark: benchmark as number,
            performance,
            isGood: performance >= 0
          };
        });
      }
    });
    
    return allData;
  }, [scores]); // ONLY recalculate when scores change, NOT on info button click

  // Calculate total revenue optimization potential
  const revenueOptimizationPotential = useMemo(() => {
    let totalPotential = 0;
    Object.entries(scores).forEach(([sectionId, score]) => {
      if (score < 70) {
        // Calculate potential based on gap to 70%
        const gap = 70 - score;
        const basePotential = sectionId === 'service-performance' ? 150000 : 
                             sectionId === 'parts-inventory' ? 95000 : 
                             sectionId === 'used-vehicle-sales' ? 200000 : 100000;
        totalPotential += Math.round(basePotential * (gap / 100) * 2);
      }
    });
    return totalPotential;
  }, [scores]);

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

  const formatValue = (key: string, value: number) => {
    if (key.includes('Revenue') || key.includes('Value') || key.includes('RO') || key.includes('costPerSale') || key.includes('cashFlow') || key.includes('workingCapital') || key.includes('counterSales')) {
      return formatEuro(value);
    }
    if (key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Satisfaction') || key.includes('Retention') || key.includes('Utilization') || key.includes('Performance') || key.includes('Conversion') || key.includes('Attachment') || key.includes('fillRate') || key.includes('obsoleteStock') || key.includes('expenseRatio') || key.includes('returnOnAssets')) {
      return formatPercentage(value);
    }
    if (key.includes('Days') || key.includes('daysInInventory')) {
      return `${formatNumber(value)} ${language === 'de' ? 'Tage' : 'days'}`;
    }
    if (key.includes('turnoverRate') || key.includes('stockTurnover')) {
      return `${formatNumber(value)}x/${language === 'de' ? 'Jahr' : 'yr'}`;
    }
    return formatNumber(value);
  };

  // Use memoized data - values are now STABLE
  const generateKPICards = (sectionId: string, sectionScore: number) => {
    const kpiData = memoizedKPIData[sectionId];
    
    if (!kpiData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiData.map(({ key, value, benchmark, performance, isGood }) => {
          return (
            <Card key={key} className={`border-l-4 ${isGood ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {getKPILabel(key)}
                  </h4>
                  <div className="flex items-center gap-1">
                    {/* BUG #7 FIX: Tooltip icons REMOVED from all KPIs */}
                    {isGood ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* BUG #8 FIX: New Progress Bar with Benchmark Indicator */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatValue(key, value)}</span>
                    <span className="text-xs text-muted-foreground">
                      vs {formatValue(key, benchmark)}
                    </span>
                  </div>
                  
                  {/* Progress Bar with Benchmark Marker */}
                  <div className="relative">
                    {/* Background track */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      {/* Filled progress */}
                      <div 
                        className={`h-full transition-all duration-300 ease-out rounded-full ${
                          isGood ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                          performance >= -30 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, (value / benchmark) * 100))}%` }}
                      />
                    </div>
                    {/* Benchmark marker line at 100% of benchmark */}
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-slate-700 -translate-y-0.5"
                      style={{ left: `${Math.min(100, 100)}%`, transform: 'translateX(-50%)' }}
                      title={`Benchmark: ${formatValue(key, benchmark)}`}
                    />
                  </div>
                  
                  {/* Values display */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Current: {formatValue(key, value)} | Benchmark: {formatValue(key, benchmark)}
                    </span>
                    <Badge 
                      variant={isGood ? "default" : "destructive"} 
                      className="text-xs"
                      aria-label={`Performance: ${performance >= 0 ? '+' : ''}${performance.toFixed(1)}% variance from benchmark`}
                    >
                      {performance >= 0 ? '+' : ''}{formatPercentage(Math.abs(performance))}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
    if (score >= 80) return language === 'de' ? 'Ausgezeichnet' : 'Excellent';
    if (score >= 60) return language === 'de' ? 'Gut' : 'Good';
    return language === 'de' ? 'Fokus erforderlich' : 'Needs Focus';
  };

  return (
    <div className="space-y-8">
      {/* Revenue Optimization Banner */}
      {revenueOptimizationPotential > 0 && (
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{formatEuro(revenueOptimizationPotential)}</h3>
                  <p className="text-emerald-100">
                    {language === 'de' ? 'Umsatzoptimierungspotenzial' : 'Revenue Optimization Potential'}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {language === 'de' ? 'Basierend auf Ihrer Bewertung | Jährliches Potenzial' : 'Based on your assessment | Annual Potential'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {language === 'de' ? 'Leistungskennzahlen (KPIs)' : 'Key Performance Indicators'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'de' 
            ? 'Klicken Sie auf ℹ️ für Details zu jedem KPI – Zahlen bleiben konstant' 
            : 'Click ℹ️ on any KPI for detailed insights – numbers remain static'}
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
                      {language === 'de' ? 'Leistungswert' : 'Performance Score'}: {score}/100
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

      {/* Strategic Recommendations - Kept for actionable insights, NOT redundant with Overall Performance */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            {language === 'de' ? 'Strategische Empfehlungen' : 'Strategic Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-amber-800 space-y-2">
            {Object.entries(scores)
              .filter(([_, score]) => score < 70)
              .slice(0, 3)
              .map(([sectionId, score]) => (
                <li key={sectionId} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    {language === 'de' ? 'Fokus auf Verbesserung von' : 'Focus on improving'} <strong>{getSectionTitle(sectionId)}</strong> ({score}%) {language === 'de' ? 'durch gezielte Schulung und Prozessoptimierung' : 'through targeted training and process optimization'}
                  </span>
                </li>
              ))
            }
            {Object.values(scores).every(score => score >= 70) && (
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                {language === 'de' ? 'Hervorragende Leistung in allen Bereichen! Fokus auf kontinuierliche Verbesserung.' : 'Excellent performance across all areas! Focus on continuous improvement.'}
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
