import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Target } from "lucide-react";

interface KPIInsightsProps {
  scores: Record<string, number>;
  answers: Record<string, any>;
}

interface KPIData {
  department: string;
  currentScore: number;
  potentialScore: number;
  improvementPercent: number;
  annualRevenueImpact: number;
  keyMetrics: {
    name: string;
    current: string;
    potential: string;
    unit: string;
  }[];
}

export function KPIInsights({ scores, answers }: KPIInsightsProps) {
  const calculateKPIData = (): KPIData[] => {
    const kpiData: KPIData[] = [];

    // New Vehicle Sales KPIs
    if (scores['new-vehicle-sales']) {
      const currentScore = scores['new-vehicle-sales'];
      const potentialScore = Math.min(100, currentScore + (30 * (100 - currentScore) / 100));
      const improvementPercent = ((potentialScore - currentScore) / currentScore) * 100;
      
      kpiData.push({
        department: 'New Vehicle Sales',
        currentScore,
        potentialScore,
        improvementPercent,
        annualRevenueImpact: 150000 * (improvementPercent / 100),
        keyMetrics: [
          {
            name: 'Monthly Sales Volume',
            current: `${Math.round(20 + (currentScore / 100) * 180)} units`,
            potential: `${Math.round(20 + (potentialScore / 100) * 180)} units`,
            unit: 'vehicles'
          },
          {
            name: 'Closing Ratio',
            current: `${Math.round(10 + (currentScore / 100) * 15)}%`,
            potential: `${Math.round(10 + (potentialScore / 100) * 15)}%`,
            unit: '%'
          },
          {
            name: 'Gross Profit per Unit',
            current: `$${Math.round(1000 + (currentScore / 100) * 4000)}`,
            potential: `$${Math.round(1000 + (potentialScore / 100) * 4000)}`,
            unit: 'USD'
          }
        ]
      });
    }

    // Used Vehicle Sales KPIs
    if (scores['used-vehicle-sales']) {
      const currentScore = scores['used-vehicle-sales'];
      const potentialScore = Math.min(100, currentScore + (25 * (100 - currentScore) / 100));
      const improvementPercent = ((potentialScore - currentScore) / currentScore) * 100;
      
      kpiData.push({
        department: 'Used Vehicle Sales',
        currentScore,
        potentialScore,
        improvementPercent,
        annualRevenueImpact: 120000 * (improvementPercent / 100),
        keyMetrics: [
          {
            name: 'Inventory Turnover',
            current: `${Math.round(21 + (100 - currentScore) / 100 * 40)} days`,
            potential: `${Math.round(21 + (100 - potentialScore) / 100 * 40)} days`,
            unit: 'days'
          },
          {
            name: 'Gross Profit Margin',
            current: `$${Math.round(1500 + (currentScore / 100) * 3000)}`,
            potential: `$${Math.round(1500 + (potentialScore / 100) * 3000)}`,
            unit: 'USD per vehicle'
          },
          {
            name: 'Reconditioning Cost',
            current: `$${Math.round(2000 - (currentScore / 100) * 1500)}`,
            potential: `$${Math.round(2000 - (potentialScore / 100) * 1500)}`,
            unit: 'USD per vehicle'
          }
        ]
      });
    }

    // Service Performance KPIs
    if (scores['service-performance']) {
      const currentScore = scores['service-performance'];
      const potentialScore = Math.min(100, currentScore + (35 * (100 - currentScore) / 100));
      const improvementPercent = ((potentialScore - currentScore) / currentScore) * 100;
      
      kpiData.push({
        department: 'Service Performance',
        currentScore,
        potentialScore,
        improvementPercent,
        annualRevenueImpact: 200000 * (improvementPercent / 100),
        keyMetrics: [
          {
            name: 'Labor Efficiency',
            current: `${Math.round(60 + (currentScore / 100) * 30)}%`,
            potential: `${Math.round(60 + (potentialScore / 100) * 30)}%`,
            unit: '%'
          },
          {
            name: 'Customer Satisfaction',
            current: `${Math.round(6 + (currentScore / 100) * 4)}/10`,
            potential: `${Math.round(6 + (potentialScore / 100) * 4)}/10`,
            unit: 'rating'
          },
          {
            name: 'First-Time Fix Rate',
            current: `${Math.round(75 + (currentScore / 100) * 20)}%`,
            potential: `${Math.round(75 + (potentialScore / 100) * 20)}%`,
            unit: '%'
          }
        ]
      });
    }

    // Parts Inventory KPIs
    if (scores['parts-inventory']) {
      const currentScore = scores['parts-inventory'];
      const potentialScore = Math.min(100, currentScore + (28 * (100 - currentScore) / 100));
      const improvementPercent = ((potentialScore - currentScore) / currentScore) * 100;
      
      kpiData.push({
        department: 'Parts & Inventory',
        currentScore,
        potentialScore,
        improvementPercent,
        annualRevenueImpact: 80000 * (improvementPercent / 100),
        keyMetrics: [
          {
            name: 'Inventory Turnover',
            current: `${Math.round(4 + (currentScore / 100) * 6)} times/year`,
            potential: `${Math.round(4 + (potentialScore / 100) * 6)} times/year`,
            unit: 'annual'
          },
          {
            name: 'Fill Rate',
            current: `${Math.round(80 + (currentScore / 100) * 18)}%`,
            potential: `${Math.round(80 + (potentialScore / 100) * 18)}%`,
            unit: '%'
          },
          {
            name: 'Gross Profit Margin',
            current: `${Math.round(25 + (currentScore / 100) * 15)}%`,
            potential: `${Math.round(25 + (potentialScore / 100) * 15)}%`,
            unit: '%'
          }
        ]
      });
    }

    // Financial Operations KPIs
    if (scores['financial-operations']) {
      const currentScore = scores['financial-operations'];
      const potentialScore = Math.min(100, currentScore + (20 * (100 - currentScore) / 100));
      const improvementPercent = ((potentialScore - currentScore) / currentScore) * 100;
      
      kpiData.push({
        department: 'Financial Operations',
        currentScore,
        potentialScore,
        improvementPercent,
        annualRevenueImpact: 100000 * (improvementPercent / 100),
        keyMetrics: [
          {
            name: 'Operating Margin',
            current: `${Math.round(2 + (currentScore / 100) * 8)}%`,
            potential: `${Math.round(2 + (potentialScore / 100) * 8)}%`,
            unit: '%'
          },
          {
            name: 'Cash Flow Score',
            current: `${Math.round(currentScore)}`,
            potential: `${Math.round(potentialScore)}`,
            unit: 'index'
          },
          {
            name: 'Cost Efficiency',
            current: `${Math.round(70 + (currentScore / 100) * 25)}%`,
            potential: `${Math.round(70 + (potentialScore / 100) * 25)}%`,
            unit: '%'
          }
        ]
      });
    }

    return kpiData.sort((a, b) => b.annualRevenueImpact - a.annualRevenueImpact);
  };

  const kpiData = calculateKPIData();
  const totalRevenueImpact = kpiData.reduce((sum, dept) => sum + dept.annualRevenueImpact, 0);

  return (
    <div className="space-y-6">
      {/* Revenue Impact Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Revenue Impact Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">
                ${Math.round(totalRevenueImpact).toLocaleString()}
              </div>
              <div className="text-sm text-green-600 font-medium">
                Total Annual Revenue Potential
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">
                {kpiData.length}
              </div>
              <div className="text-sm text-green-600 font-medium">
                Departments with Improvement Opportunity
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">
                {Math.round(kpiData.reduce((sum, d) => sum + d.improvementPercent, 0) / kpiData.length)}%
              </div>
              <div className="text-sm text-green-600 font-medium">
                Average Improvement Potential
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kpiData.map((dept, index) => (
          <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dept.department}</CardTitle>
                <Badge 
                  className="bg-green-100 text-green-800"
                  variant="outline"
                >
                  +${Math.round(dept.annualRevenueImpact).toLocaleString()} annual
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Score</div>
                  <div className="text-2xl font-bold text-blue-600">{Math.round(dept.currentScore)}</div>
                  <Progress value={dept.currentScore} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Potential Score</div>
                  <div className="text-2xl font-bold text-green-600">{Math.round(dept.potentialScore)}</div>
                  <Progress value={dept.potentialScore} className="mt-1" />
                </div>
              </div>

              {/* Improvement Potential */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-yellow-700" />
                  <span className="font-medium text-yellow-800">
                    {Math.round(dept.improvementPercent)}% Improvement Potential
                  </span>
                </div>
                <div className="text-sm text-yellow-700">
                  Implementing targeted improvements could increase performance by {Math.round(dept.improvementPercent)}%
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-2">
                <div className="font-medium text-gray-700 mb-3">Key Performance Metrics</div>
                {dept.keyMetrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-medium">{metric.current}</span>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 font-medium">{metric.potential}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Priority */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Implementation Priority Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kpiData.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 text-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{dept.department}</div>
                    <div className="text-sm text-gray-600">
                      {Math.round(dept.improvementPercent)}% improvement potential
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    +${Math.round(dept.annualRevenueImpact).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">annual impact</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}