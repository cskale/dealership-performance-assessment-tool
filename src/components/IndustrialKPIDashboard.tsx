import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, DollarSign, Info } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber, generateRealisticData, industryBenchmarks } from "@/utils/euroFormatter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getKPILabel } from "@/lib/kpiDefinitions";

interface IndustrialKPIDashboardProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
  onNavigateToResources?: () => void;
}

export function IndustrialKPIDashboard({ scores }: { scores: Record<string, number> }) {
  const { language } = useLanguage();

  // CRITICAL FIX: Memoize ALL KPI data to prevent recalculation when clicking info button
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
  }, [scores]);

  // Calculate total revenue optimization potential
  const revenueOptimizationPotential = useMemo(() => {
    let totalPotential = 0;
    Object.entries(scores).forEach(([sectionId, score]) => {
      if (score < 70) {
        const gap = 70 - score;
        const basePotential = sectionId === 'service-performance' ? 150000 : 
                             sectionId === 'parts-inventory' ? 95000 : 
                             sectionId === 'used-vehicle-sales' ? 200000 : 100000;
        totalPotential += Math.round(basePotential * (gap / 100) * 2);
      }
    });
    return totalPotential;
  }, [scores]);


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
    const kpiData = memoizedKPIData[sectionId];
    
    if (!kpiData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiData.map(({ key, value, benchmark, performance, isGood }) => {
          const pct = Math.min(100, Math.max(0, (value / benchmark) * 100));
          const markerLeft = Math.min(95, Math.max(5, pct));
          
          return (
            <Card key={key} className={`border-l-4 kpi-card ${isGood ? 'border-l-success' : 'border-l-destructive'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {getKPILabel(key, language as 'en' | 'de')}
                  </h4>
                  <div className="flex items-center gap-1">
                    {isGood ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatValue(key, value)}
                    </span>
                    <span className="text-xs text-muted-foreground italic">
                      ({language === 'de' ? 'geschätzt' : 'estimated'})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs. Benchmark ({formatValue(key, benchmark)})
                  </div>
                  
                  {/* Benchmark band using design tokens */}
                  <div className="relative h-3 rounded-full overflow-hidden flex">
                    <div className="h-full bg-destructive/40" style={{ width: '30%' }} />
                    <div className="h-full bg-warning/50" style={{ width: '20%' }} />
                    <div className="h-full bg-success/40" style={{ width: '20%' }} />
                    <div className="h-full bg-success/70" style={{ width: '30%' }} />
                    <div 
                      className="absolute top-0 w-0.5 h-full bg-foreground"
                      style={{ left: `${markerLeft}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Performance</span>
                    <Badge 
                      variant={isGood ? "default" : "destructive"} 
                      className="text-xs"
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
    const icons: Record<string, string> = {
      'new-vehicle-sales': '--',
      'used-vehicle-sales': '--',
      'service-performance': '--',
      'parts-inventory': '--',
      'financial-operations': '--'
    };
    return icons[sectionId] || '--';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return language === 'de' ? 'Ausgezeichnet' : 'Excellent';
    if (score >= 60) return language === 'de' ? 'Gut' : 'Good';
    return language === 'de' ? 'Fokus erforderlich' : 'Needs Focus';
  };

  return (
    <div className="space-y-8">
      {/* 1A: Estimated data disclaimer banner */}
      <Card className="border-2 border-warning bg-warning/10 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-warning-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-foreground">
                {language === 'de' 
                  ? 'Illustrative Schätzwerte'
                  : 'Illustrative Estimates'}
              </p>
              <p className="text-xs text-warning-foreground/80 mt-1">
                {language === 'de'
                  ? 'Die dargestellten Werte sind illustrative Schätzungen, die aus Ihren Bewertungsantworten abgeleitet wurden — keine tatsächlichen Geschäftsdaten des Autohauses. Für echte KPI-Analytik verbinden Sie bitte Ihre Datensysteme.'
                  : 'Values shown are illustrative estimates derived from your assessment responses — not actual dealership business data. For real KPI analytics, connect your data systems.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Optimization Banner */}
      {revenueOptimizationPotential > 0 && (
        <Card className="bg-success text-success-foreground border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success-foreground/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{formatEuro(revenueOptimizationPotential)}</h3>
                  <p className="text-success-foreground/80">
                    {language === 'de' ? 'Umsatzoptimierungspotenzial (geschätzt)' : 'Revenue Optimization Potential (estimated)'}
                  </p>
                </div>
              </div>
              <Badge className="bg-success-foreground/20 text-success-foreground border-success-foreground/30">
                {language === 'de' ? 'Basierend auf Ihrer Bewertung | Jährliches Potenzial' : 'Based on your assessment | Annual Potential'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Hero Card */}
      {(() => {
        const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(scores).length, 1));
        const badge = avgScore >= 80 ? (language === 'de' ? 'Stark' : 'Strong') : avgScore >= 60 ? (language === 'de' ? 'Auf Kurs' : 'On Track') : (language === 'de' ? 'Fokus erforderlich' : 'Needs Focus');
        const badgeVariant = avgScore >= 80 ? 'bg-success/20 text-success border-success/30' : avgScore >= 60 ? 'bg-warning/20 text-warning-foreground border-warning/30' : 'bg-destructive/20 text-destructive border-destructive/30';
        return (
          <Card className="col-span-2 mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6 flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{language === 'de' ? 'Gesamtleistung' : 'Overall Performance Score'}</p>
                <div className="text-5xl font-bold text-foreground leading-none">{avgScore}</div>
                <Badge className={`mt-2 ${badgeVariant}`}>{badge}</Badge>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                <p>{language === 'de' ? 'Aggregierte Leistung über alle bewerteten Abteilungen.' : 'Aggregated performance across all assessed departments.'}</p>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {language === 'de' ? 'Leistungskennzahlen (KPIs)' : 'Key Performance Indicators'}
        </h2>
      </div>

      {Object.entries(scores).map(([sectionId, score]) => (
        <div key={sectionId}>
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-primary">
                    {getSectionTitle(sectionId)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'de' ? 'Leistungswert' : 'Performance Score'}: {score}/100
                  </p>
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
              .filter(([_, score]) => score < 70)
              .slice(0, 3)
              .map(([sectionId, score]) => (
                <li key={sectionId} className="flex items-start gap-2">
                  <span className="text-warning-foreground/70 mt-0.5">-</span>
                  <span>
                    {language === 'de' ? 'Fokus auf Verbesserung von' : 'Focus on improving'} <strong>{getSectionTitle(sectionId)}</strong> ({score}%) {language === 'de' ? 'durch gezielte Schulung und Prozessoptimierung' : 'through targeted training and process optimization'}
                  </span>
                </li>
              ))
            }
            {Object.values(scores).every(score => score >= 70) && (
              <li className="flex items-start gap-2">
                <span className="text-success">-</span>
                {language === 'de' ? 'Hervorragende Leistung in allen Bereichen! Fokus auf kontinuierliche Verbesserung.' : 'Excellent performance across all areas! Focus on continuous improvement.'}
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
