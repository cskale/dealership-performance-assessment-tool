import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react";
import { formatEuro, formatPercentage, formatNumber, generateRealisticData, industryBenchmarks } from "@/utils/euroFormatter";

interface IndustrialKPIDashboardProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
}

export function IndustrialKPIDashboard({ scores, answers }: IndustrialKPIDashboardProps) {
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
                <h4 className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                </h4>
                {isGood ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {key.includes('Revenue') || key.includes('Value') || key.includes('RO') || key.includes('costPerSale') 
                    ? formatEuro(value as number)
                    : key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Satisfaction') || key.includes('Retention') || key.includes('Utilization') || key.includes('Performance') || key.includes('Conversion')
                      ? formatPercentage(value as number)
                      : key.includes('Days') || key.includes('turnoverRate')
                        ? `${formatNumber(value as number)}${key.includes('Days') ? ' days' : 'x/year'}`
                        : formatNumber(value as number)
                  }
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Benchmark: {
                      key.includes('Revenue') || key.includes('Value') || key.includes('RO') || key.includes('costPerSale')
                        ? formatEuro(benchmark as number)
                        : key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Satisfaction') || key.includes('Retention') || key.includes('Utilization') || key.includes('Performance') || key.includes('Conversion')
                          ? formatPercentage(benchmark as number)
                          : key.includes('Days') || key.includes('turnoverRate')
                            ? `${formatNumber(benchmark as number)}${key.includes('Days') ? ' days' : 'x/year'}`
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
    const titles = {
      'new-vehicle-sales': 'New Vehicle Sales KPIs',
      'used-vehicle-sales': 'Used Vehicle Sales KPIs',
      'service-performance': 'Service Department KPIs',
      'parts-inventory': 'Parts & Inventory KPIs',
      'financial-operations': 'Financial Operations KPIs'
    };
    return titles[sectionId as keyof typeof titles] || sectionId;
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

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Industrial KPI Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">
          Real-time performance metrics with European market benchmarks
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
                      Performance Score: {score}/100
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
                    {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Focus"}
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
            Overall Dealership Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Object.values(scores).filter(score => score >= 70).length}
              </div>
              <div className="text-sm text-muted-foreground">Strong Areas</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {Object.values(scores).filter(score => score < 70).length}
              </div>
              <div className="text-sm text-muted-foreground">Improvement Areas</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">Strategic Recommendations</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(scores)
                .filter(([_, score]) => score < 70)
                .map(([sectionId, _]) => (
                  <li key={sectionId}>
                    • Focus on improving {getSectionTitle(sectionId).toLowerCase()} through targeted training and process optimization
                  </li>
                ))
              }
              {Object.values(scores).every(score => score >= 70) && (
                <li>• Excellent performance across all areas! Focus on maintaining excellence and exploring new growth opportunities.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}