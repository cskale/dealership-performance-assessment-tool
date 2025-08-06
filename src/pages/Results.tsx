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
      try {
        await loadAssessment();
        
        if (assessment) {
          // Load default benchmarks 
          await loadBenchmarks('General', 'Global');
          
          // Generate improvement actions based on scores
          if (assessment.scores && Object.keys(assessment.scores).length > 0) {
            const actions = await generateImprovementActions('assessment-' + Date.now(), assessment.scores);
            setImprovementActions(actions || []);
          }
        } else {
          // Redirect to assessment if no data found
          navigate('/assessment');
        }
      } catch (error) {
        console.error('Failed to load results data:', error);
        toast({
          title: "Error",
          description: "Failed to load assessment results. Please try again.",
          variant: "destructive",
        });
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

          {/* Enhanced Export Section */}
          <div className="mb-8">
            <EnhancedExport 
              data={{
                dealership: dealership || { name: 'Assessment Results', brand: 'N/A', location: 'N/A', country: 'N/A' },
                scores: assessment?.scores || {},
                answers: assessment?.answers || {},
                recommendations: improvementActions
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="overview" className="transition-all duration-300 hover:scale-105">📊 Overview</TabsTrigger>
            <TabsTrigger value="detailed" className="transition-all duration-300 hover:scale-105">📈 Advanced Analysis</TabsTrigger>
            <TabsTrigger value="trends" className="transition-all duration-300 hover:scale-105">📉 Trend Analysis</TabsTrigger>
            <TabsTrigger value="benchmarks" className="transition-all duration-300 hover:scale-105">🏆 Benchmarks</TabsTrigger>
            <TabsTrigger value="recommendations" className="transition-all duration-300 hover:scale-105">🎯 AI Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            {/* Section Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionData.map((section, index) => (
                <Card 
                  key={index} 
                  className="border-l-4 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" 
                  style={{ 
                    borderLeftColor: section.color,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{section.section}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(section.trend)}
                        <Badge variant={section.score >= section.benchmark ? "default" : "secondary"}>
                          {section.score >= section.benchmark ? "Strong" : "Improve"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold" style={{ color: section.color }}>
                          {section.score}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">vs {section.benchmark}</div>
                          <div className={`text-sm font-medium ${section.score >= section.benchmark ? 'text-green-600' : 'text-orange-600'}`}>
                            {section.score >= section.benchmark ? '+' : ''}{section.score - section.benchmark} pts
                          </div>
                        </div>
                      </div>
                      <Progress value={section.score} className="h-3" />
                      <div className="flex items-center gap-2 text-xs">
                        {section.score >= section.benchmark ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                        <span className={section.score >= section.benchmark ? 'text-green-600' : 'text-orange-600'}>
                          {section.score >= section.benchmark ? 'Above industry benchmark' : 'Below industry benchmark'}
                        </span>
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

          <TabsContent value="detailed" className="space-y-6 animate-fade-in">
            {/* Enhanced Charts Component */}
            <EnhancedCharts 
              scores={assessment?.scores || {}}
              benchmarks={benchmarks.reduce((acc, b) => ({ ...acc, [b.metricName]: b.averageScore }), {})}
            />

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

          <TabsContent value="recommendations" className="space-y-6 animate-fade-in">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Powered Improvement Recommendations
                </CardTitle>
                <p className="text-muted-foreground">
                  Automatically generated based on your diagnostic scores and industry best practices
                </p>
              </CardHeader>
              <CardContent>
                {improvementActions.length > 0 ? (
                  <div className="space-y-6">
                    {improvementActions
                      .sort((a, b) => {
                        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                      })
                      .map((action, index) => (
                      <Card 
                        key={index} 
                        className={`border-l-4 hover:shadow-lg transition-all duration-300 animate-fade-in hover-scale ${
                          action.priority === 'critical' ? 'border-red-500 bg-red-50/50' :
                          action.priority === 'high' ? 'border-orange-500 bg-orange-50/50' :
                          action.priority === 'medium' ? 'border-yellow-500 bg-yellow-50/50' :
                          'border-green-500 bg-green-50/50'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                action.priority === 'critical' ? 'bg-red-100 text-red-600' :
                                action.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {action.priority === 'critical' ? <AlertTriangle className="h-5 w-5" /> :
                                 action.priority === 'high' ? <TrendingUp className="h-5 w-5" /> :
                                 action.priority === 'medium' ? <Target className="h-5 w-5" /> :
                                 <CheckCircle className="h-5 w-5" />}
                              </div>
                              <h3 className="font-semibold text-lg">{action.action_title}</h3>
                            </div>
                            <Badge 
                              variant={action.priority === 'critical' ? 'destructive' : 'secondary'}
                              className={`${
                                action.priority === 'critical' ? 'bg-red-500 text-white' :
                                action.priority === 'high' ? 'bg-orange-500 text-white' :
                                action.priority === 'medium' ? 'bg-yellow-500 text-white' :
                                'bg-green-500 text-white'
                              } capitalize`}
                            >
                              {action.priority} Priority
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            {action.action_description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-sm">Department</p>
                                <p className="text-muted-foreground">{action.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="font-medium text-sm">Expected Impact</p>
                                <p className="text-muted-foreground">{action.expected_impact}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">Implementation Time</p>
                                <p className="text-muted-foreground">{action.estimated_effort}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-pulse">
                      <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Generating AI Recommendations...</h3>
                    <p className="text-muted-foreground">Our AI is analyzing your performance data to create personalized improvement strategies.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}