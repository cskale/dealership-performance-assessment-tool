import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Star, Brain, Globe, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EnhancedCharts } from "@/components/EnhancedCharts";
import { EnhancedExport } from "@/components/EnhancedExport";
import { useAssessmentData } from "@/hooks/useAssessmentData";


export default function Results() {
  const [activeTab, setActiveTab] = useState("overview");
  const [improvementActions, setImprovementActions] = useState<any[]>([]);
  const [benchmarkComparisons, setBenchmarkComparisons] = useState<any[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    dealership, 
    assessment, 
    benchmarks,
    loadAssessment, 
    loadBenchmarks, 
    generateImprovementActions,
    isLoading 
  } = useAssessmentData();

  // Load assessment data and generate insights
  useEffect(() => {
    const loadData = async () => {
      if (!assessment) {
        await loadAssessment();
      }
      
      if (dealership && assessment) {
        // Load benchmarks for comparison
        await loadBenchmarks(dealership.brand, dealership.country);
        
        // Generate improvement actions
        if (assessment.scores && Object.keys(assessment.scores).length > 0) {
          const actions = await generateImprovementActions(assessment.id, assessment.scores);
          setImprovementActions(actions || []);
        }
      }
    };
    
    loadData();
  }, [dealership, assessment, loadAssessment, loadBenchmarks, generateImprovementActions]);

  const sectionData = useMemo(() => {
    if (!assessment?.scores) {
      return [
        { section: "New Vehicle Sales", score: 0, color: "#3B82F6", trend: "up", benchmark: 82 },
        { section: "Used Vehicle Sales", score: 0, color: "#10B981", trend: "down", benchmark: 75 },
        { section: "Service Performance", score: 0, color: "#8B5CF6", trend: "up", benchmark: 80 },
        { section: "Parts & Inventory", score: 0, color: "#F59E0B", trend: "stable", benchmark: 78 },
        { section: "Financial Operations", score: 0, color: "#EF4444", trend: "up", benchmark: 76 }
      ];
    }

    return [
      { 
        section: "New Vehicle Sales", 
        score: assessment.scores.new_vehicle_sales || 0, 
        color: "#3B82F6", 
        trend: "up", 
        benchmark: 82 
      },
      { 
        section: "Used Vehicle Sales", 
        score: assessment.scores.used_vehicle_sales || 0, 
        color: "#10B981", 
        trend: "down", 
        benchmark: 75 
      },
      { 
        section: "Service Performance", 
        score: assessment.scores.service_performance || 0, 
        color: "#8B5CF6", 
        trend: "up", 
        benchmark: 80 
      },
      { 
        section: "Parts & Inventory", 
        score: assessment.scores.parts_inventory || 0, 
        color: "#F59E0B", 
        trend: "stable", 
        benchmark: 78 
      },
      { 
        section: "Financial Operations", 
        score: assessment.scores.financial_operations || 0, 
        color: "#EF4444", 
        trend: "up", 
        benchmark: 76 
      }
    ];
  }, [assessment]);

  const overallScore = assessment?.overallScore || 0;

  const radarData = sectionData.map(s => ({
    subject: s.section.replace(" ", "\n"),
    score: s.score,
    benchmark: s.benchmark,
    fullMark: 100
  }));

  const trendData = [
    { month: "Jan", score: 68 },
    { month: "Feb", score: 71 },
    { month: "Mar", score: 69 },
    { month: "Apr", score: 74 },
    { month: "May", score: 77 },
    { month: "Jun", score: overallScore }
  ];

  // Redirect if no assessment data
  useEffect(() => {
    if (!assessment && !isLoading) {
      navigate('/assessment');
    }
  }, [assessment, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No assessment data found</p>
          <Button onClick={() => navigate('/assessment')}>Start Assessment</Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Results</h1>
          <p className="text-gray-600 mb-2">Comprehensive analysis of your dealership performance</p>
          
          {dealership && (
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {dealership.name}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {dealership.brand}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {dealership.country}
              </div>
            </div>
          )}
          
          {/* Overall Score */}
          <div className="flex justify-center mb-6">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{overallScore}</div>
                <div className="text-sm text-blue-800">Overall Performance Score</div>
                <Badge className="mt-2 bg-blue-600">
                  Above Industry Average
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Export Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export PDF Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="detailed">📈 Detailed Analysis</TabsTrigger>
            <TabsTrigger value="trends">📉 Trends</TabsTrigger>
            <TabsTrigger value="benchmarks">🏆 Benchmarks</TabsTrigger>
            <TabsTrigger value="recommendations">🎯 AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Section Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionData.map((section, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: section.color }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{section.section}</CardTitle>
                      {getTrendIcon(section.trend)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ color: section.color }}>
                          {section.score}
                        </span>
                        <Badge variant="outline">
                          vs {section.benchmark} benchmark
                        </Badge>
                      </div>
                      <Progress value={section.score} className="h-2" />
                      <div className="text-xs text-gray-600">
                        {section.score >= section.benchmark ? (
                          <span className="text-green-600">✅ Above benchmark</span>
                        ) : (
                          <span className="text-orange-600">⚠️ Below benchmark</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance vs Industry Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: { label: "Your Score", color: "#3B82F6" },
                    benchmark: { label: "Industry Benchmark", color: "#94A3B8" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Your Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
                      <Radar name="Benchmark" dataKey="benchmark" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.1} strokeWidth={1} strokeDasharray="5,5" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: "#3B82F6" }
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionData}>
                        <XAxis dataKey="section" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: { label: "Sections", color: "#3B82F6" }
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectionData}
                          dataKey="score"
                          nameKey="section"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {sectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-blue-800">Customer Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$2.8M</div>
                    <div className="text-sm text-green-800">Annual Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">12.5</div>
                    <div className="text-sm text-purple-800">Inventory Turns</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">78%</div>
                    <div className="text-sm text-orange-800">Service Efficiency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: { label: "Overall Score", color: "#3B82F6" }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="month" />
                      <YAxis domain={[60, 80]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">+6 pts</div>
                  <div className="text-sm text-green-800">6-Month Improvement</div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">3rd</div>
                  <div className="text-sm text-blue-800">Regional Ranking</div>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">82</div>
                  <div className="text-sm text-purple-800">Target Score</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Benchmark Comparisons
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Compare your performance against industry standards and peer dealerships
                </p>
              </CardHeader>
              <CardContent>
                {benchmarks.length > 0 ? (
                  <div className="space-y-4">
                    {benchmarks.map((benchmark, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{benchmark.metricName}</h4>
                          <Badge variant={benchmark.averageScore > (assessment?.scores?.[benchmark.segment] || 0) ? 'destructive' : 'default'}>
                            Industry: {benchmark.averageScore}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Your Score:</span>
                            <span className="ml-2 font-medium">{assessment?.scores?.[benchmark.segment] || 0}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sample Size:</span>
                            <span className="ml-2">{benchmark.sampleSize} dealerships</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No benchmark data available for your brand and country
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Recommendations
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Based on your assessment results, here are personalized improvement recommendations
                </p>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {improvementActions.length > 0 ? improvementActions.map((action, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{action.action_title}</CardTitle>
                          <p className="text-sm text-gray-600">{action.department}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{action.action_description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {action.expected_impact && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Expected Impact:</strong> {action.expected_impact}
                          </p>
                        </div>
                      )}
                      {action.estimated_effort && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Estimated Effort:</strong> {action.estimated_effort}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No recommendations available yet. Complete more sections to generate insights.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Schedule a detailed consultation with our automotive experts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Implement high-priority recommendations within 30 days
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Re-assess performance in 90 days to track improvements
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}