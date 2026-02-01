import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, Info, Lightbulb, BookOpen, ChevronDown, ExternalLink } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber, generateRealisticData, industryBenchmarks } from "@/utils/euroFormatter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

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

export function IndustrialKPIDashboard({ scores, answers, onNavigateToResources }: IndustrialKPIDashboardProps) {
  const { t, language } = useLanguage();
  const [expandedKPIs, setExpandedKPIs] = useState<Set<string>>(new Set());

  const toggleKPI = (key: string) => {
    setExpandedKPIs(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

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
        value: value as number,
        benchmark: benchmark as number,
        performance,
        isGood: performance >= 0
      };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiData.map(({ key, value, benchmark, performance, isGood }) => {
          const definition = kpiDefinitions[key];
          const isExpanded = expandedKPIs.has(key);
          
          return (
            <Card key={key} className={`border-l-4 ${isGood ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {getKPILabel(key)}
                  </h4>
                  <div className="flex items-center gap-1">
                    {definition && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleKPI(key)}
                      >
                        <Info className={`h-4 w-4 ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                      </Button>
                    )}
                    {isGood ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatValue(key, value)}</span>
                    <span className="text-xs text-muted-foreground">
                      vs {formatValue(key, benchmark)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {language === 'de' ? 'Benchmark' : 'Benchmark'}
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

                {/* Collapsible Info Section */}
                {definition && isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {/* What is this? */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Info className="h-3 w-3" />
                        {language === 'de' ? 'Was ist das?' : 'What is this?'}
                      </div>
                      <p className="text-sm">
                        {definition.definition[language]}
                      </p>
                    </div>

                    {/* Why it matters */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Lightbulb className="h-3 w-3" />
                        {language === 'de' ? 'Warum wichtig?' : 'Why it matters?'}
                      </div>
                      <p className="text-sm">
                        {definition.whyMatters[language]}
                      </p>
                    </div>

                    {/* Related Resources - Links to Resources tab on Results page */}
                    {definition.topics.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {language === 'de' ? 'Ressourcen' : 'Resources'}
                        </div>
                        <button
                          onClick={() => {
                            // Navigate to the Resources tab on the same Results page
                            const resourcesTab = document.querySelector('[value="resources"]') as HTMLElement;
                            if (resourcesTab) {
                              resourcesTab.click();
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          📚 {language === 'de' ? 'Passende Lernmaterialien' : 'Related Learning'} ({definition.topics.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {language === 'de' ? 'Leistungskennzahlen (KPIs)' : 'Key Performance Indicators'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'de' 
            ? 'Klicken Sie auf ℹ️ für Details zu jedem KPI' 
            : 'Click ℹ️ on any KPI for detailed insights'}
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

      {/* Overall Performance Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary flex items-center justify-center gap-2">
            <Award className="h-6 w-6" />
            {language === 'de' ? 'Gesamtleistung' : 'Overall Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length)}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Gesamtwert' : 'Overall Score'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Object.values(scores).filter(score => score >= 70).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Starke Bereiche' : 'Strong Areas'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {Object.values(scores).filter(score => score < 70).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Verbesserungsbereiche' : 'Improvement Areas'}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">
                {language === 'de' ? 'Strategische Empfehlungen' : 'Strategic Recommendations'}
              </h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(scores)
                .filter(([_, score]) => score < 70)
                .map(([sectionId, _]) => (
                  <li key={sectionId}>
                    • {language === 'de' ? 'Fokus auf Verbesserung von' : 'Focus on improving'} {getSectionTitle(sectionId).toLowerCase()} {language === 'de' ? 'durch gezielte Schulung' : 'through targeted training'}
                  </li>
                ))
              }
              {Object.values(scores).every(score => score >= 70) && (
                <li>• {language === 'de' ? 'Hervorragende Leistung in allen Bereichen!' : 'Excellent performance across all areas!'}</li>
              )}
            </ul>
          </div>

          {/* Link to Resource Hub */}
          <div className="mt-6 text-center">
            <Link to="/resources">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {language === 'de' ? 'Lernressourcen erkunden' : 'Explore Learning Resources'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
