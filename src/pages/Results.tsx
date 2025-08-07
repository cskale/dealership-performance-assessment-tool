import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Download, FileText, FileSpreadsheet, Image, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Star, Brain, Globe, Building, RefreshCw, ArrowLeft, Award, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { KPIInsights } from "@/components/KPIInsights";
import { MaturityScoring } from "@/components/MaturityScoring";
import { InteractiveRecommendations } from "@/components/InteractiveRecommendations";

export default function Results() {
  const [activeTab, setActiveTab] = useState("executive");
  const [improvementActions, setImprovementActions] = useState<any[]>([]);
  const [resultsData, setResultsData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load completed assessment results
  useEffect(() => {
    const completedResults = localStorage.getItem('completed_assessment_results');
    if (completedResults) {
      const data = JSON.parse(completedResults);
      setResultsData(data);
      generateImprovementActions(data.scores);
    } else {
      // If no completed results, redirect to assessment
      toast({
        title: "No Results Found",
        description: "Please complete the assessment first.",
        variant: "destructive",
      });
      navigate('/assessment');
    }
  }, [navigate, toast]);

  const generateImprovementActions = (scores: Record<string, number>) => {
    const actions: any[] = [];
    
    Object.entries(scores).forEach(([section, score]) => {
      if (score < 75) {
        let priority: 'critical' | 'high' | 'medium' = 'medium';
        let emoji = '🟡';
        
        if (score < 50) {
          priority = 'critical';
          emoji = '🔴';
        } else if (score < 60) {
          priority = 'high'; 
          emoji = '🟠';
        }

        switch (section) {
          case 'new-vehicle-sales':
            actions.push({
              id: 1,
              department: 'New Vehicle Sales',
              priority,
              emoji,
              title: 'Enhance Sales Process Training',
              description: 'Implement comprehensive training program focusing on customer engagement, product knowledge, and closing techniques.',
              impact: 'Improve conversion rates by 15-20%',
              effort: '2-3 weeks implementation',
              score: score
            });
            break;
          case 'used-vehicle-sales':
            actions.push({
              id: 2,
              department: 'Used Vehicle Sales',
              priority,
              emoji,
              title: 'Optimize Used Vehicle Inventory Management',
              description: 'Implement data-driven inventory management system and improve vehicle reconditioning processes.',
              impact: 'Reduce inventory days and increase margins by 10%',
              effort: '3-4 weeks implementation',
              score: score
            });
            break;
          case 'service-performance':
            actions.push({
              id: 3,
              department: 'Service',
              priority,
              emoji,
              title: 'Service Efficiency Improvement Program',
              description: 'Streamline service processes, implement digital check-in, and enhance technician productivity.',
              impact: 'Increase service bay utilization by 20%',
              effort: '4-6 weeks implementation',
              score: score
            });
            break;
          case 'parts-inventory':
            actions.push({
              id: 4,
              department: 'Parts',
              priority,
              emoji,
              title: 'Parts Inventory Optimization',
              description: 'Implement predictive inventory management and improve supplier relationships.',
              impact: 'Reduce parts cost by 8-12%',
              effort: '2-3 weeks implementation',
              score: score
            });
            break;
          case 'financial-operations':
            actions.push({
              id: 5,
              department: 'Finance',
              priority,
              emoji,
              title: 'Financial Process Automation',
              description: 'Implement automated reporting and improve cash flow management processes.',
              impact: 'Reduce administrative time by 30%',
              effort: '3-5 weeks implementation',
              score: score
            });
            break;
        }
      }
    });

    // Sort by priority
    const priorityOrder = { critical: 1, high: 2, medium: 3 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setImprovementActions(actions);
  };

  const sectionData = useMemo(() => {
    if (!resultsData?.scores) return [];

    return [
      { 
        section: "New Vehicle Sales", 
        score: resultsData.scores["new-vehicle-sales"] || 0, 
        color: "#3B82F6", 
        trend: "up", 
        benchmark: 82 
      },
      { 
        section: "Used Vehicle Sales", 
        score: resultsData.scores["used-vehicle-sales"] || 0, 
        color: "#10B981", 
        trend: "down", 
        benchmark: 75 
      },
      { 
        section: "Service Performance", 
        score: resultsData.scores["service-performance"] || 0, 
        color: "#8B5CF6", 
        trend: "up", 
        benchmark: 80 
      },
      { 
        section: "Parts & Inventory", 
        score: resultsData.scores["parts-inventory"] || 0, 
        color: "#F59E0B", 
        trend: "stable", 
        benchmark: 78 
      },
      { 
        section: "Financial Operations", 
        score: resultsData.scores["financial-operations"] || 0, 
        color: "#EF4444", 
        trend: "up", 
        benchmark: 76 
      }
    ];
  }, [resultsData]);

  const overallScore = resultsData?.overallScore || 0;

  const radarData = sectionData.map(s => ({
    subject: s.section.split(' ')[0],
    score: s.score,
    benchmark: s.benchmark,
    fullMark: 100
  }));

  const trendData = [
    { month: "Jan", score: Math.max(60, overallScore - 15) },
    { month: "Feb", score: Math.max(60, overallScore - 12) },
    { month: "Mar", score: Math.max(60, overallScore - 8) },
    { month: "Apr", score: Math.max(60, overallScore - 5) },
    { month: "May", score: Math.max(60, overallScore - 2) },
    { month: "Jun", score: overallScore }
  ];

  const previousAssessments = [
    { date: "May 2024", score: Math.max(60, overallScore - 5), improvement: "+2" },
    { date: "Apr 2024", score: Math.max(60, overallScore - 8), improvement: "+4" },
    { date: "Mar 2024", score: Math.max(60, overallScore - 12), improvement: "+1" }
  ];

  const handleRetakeAssessment = () => {
    localStorage.removeItem('completed_assessment_results');
    localStorage.removeItem('assessment_data');
    toast({
      title: "Assessment Reset",
      description: "Starting fresh assessment...",
    });
    navigate('/assessment');
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('results-content');
      if (!element) throw new Error('Results content not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('dealership-assessment-results.pdf');
      toast({
        title: "PDF Exported",
        description: "Your results have been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    try {
      const data = {
        'Assessment Summary': [
          ['Overall Score', overallScore],
          ['Completion Date', new Date(resultsData.completedAt).toLocaleDateString()],
          ['Assessment Status', 'Completed']
        ],
        'Section Scores': sectionData.map(s => [s.section, s.score, s.benchmark, s.score - s.benchmark]),
        'Improvement Actions': improvementActions.map(a => [
          a.department, 
          a.priority.toUpperCase(), 
          a.title, 
          a.description,
          a.impact,
          a.effort
        ])
      };

      const wb = XLSX.utils.book_new();
      
      Object.entries(data).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      XLSX.writeFile(wb, 'dealership-assessment-results.xlsx');
      
      toast({
        title: "Excel Exported",
        description: "Your results have been downloaded successfully.",
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export Excel file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('results-content');
      if (!element) throw new Error('Results content not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = 'dealership-assessment-results.png';
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Image Exported",
        description: "Your results have been downloaded successfully.",
      });
    } catch (error) {
      console.error('Image export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto" id="results-content">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              onClick={handleRetakeAssessment}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <RefreshCw className="h-4 w-4" />
              Retake Assessment
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Assessment Results Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive analysis completed on {new Date(resultsData.completedAt).toLocaleDateString()}
          </p>
          
          {/* Overall Score with Status */}
          <div className="flex justify-center mb-8">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{overallScore}</div>
                <div className="text-lg text-blue-800 mb-4">Overall Performance Score</div>
                <div className="flex items-center justify-center gap-4">
                  <Badge className={`text-lg px-4 py-2 ${overallScore >= 80 ? 'bg-green-600' : overallScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                    {overallScore >= 80 ? '🟢 Excellent' : overallScore >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}
                  </Badge>
                  {overallScore >= 75 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Above Industry Average
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <FileText className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
            <Button
              onClick={exportAsImage}
              disabled={isExporting}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Image className="h-4 w-4" />
              Export Image
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" defaultValue="executive">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="executive" className="transition-all duration-300 hover:scale-105">
              📋 Executive Summary
            </TabsTrigger>
            <TabsTrigger value="kpi" className="transition-all duration-300 hover:scale-105">
              💰 KPI Insights
            </TabsTrigger>
            <TabsTrigger value="maturity" className="transition-all duration-300 hover:scale-105">
              🏆 Maturity
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="transition-all duration-300 hover:scale-105">
              🎯 Recommendations
            </TabsTrigger>
            <TabsTrigger value="charts" className="transition-all duration-300 hover:scale-105">
              📈 Analytics
            </TabsTrigger>
            <TabsTrigger value="trends" className="transition-all duration-300 hover:scale-105">
              📉 Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6 animate-fade-in">
            <ExecutiveSummary
              overallScore={overallScore}
              scores={resultsData.scores}
              answers={resultsData.answers}
              completedAt={resultsData.completedAt}
            />
          </TabsContent>

          <TabsContent value="kpi" className="space-y-6 animate-fade-in">
            <KPIInsights
              scores={resultsData.scores}
              answers={resultsData.answers}
            />
          </TabsContent>

          <TabsContent value="maturity" className="space-y-6 animate-fade-in">
            <MaturityScoring
              scores={resultsData.scores}
              answers={resultsData.answers}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6 animate-fade-in">
            <InteractiveRecommendations
              scores={resultsData.scores}
              answers={resultsData.answers}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 animate-fade-in">
            {/* Section Scores Grid */}
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
                          {section.score >= section.benchmark ? "🟢 Strong" : "🟡 Improve"}
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

            {/* Performance Radar Chart */}
            <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
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

          <TabsContent value="charts" className="space-y-6 animate-fade-in">
            {/* Detailed Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: "#3B82F6" },
                      benchmark: { label: "Benchmark", color: "#94A3B8" }
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionData}>
                        <XAxis dataKey="section" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="score" fill="#3B82F6" name="Your Score" />
                        <Bar dataKey="benchmark" fill="#94A3B8" name="Benchmark" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{}}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="score"
                          label={({ section, score }) => `${section.split(' ')[0]}: ${score}`}
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

            {/* KPI Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(overallScore * 0.85)}%</div>
                    <div className="text-sm text-blue-800">Customer Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">${(overallScore * 35000).toLocaleString()}</div>
                    <div className="text-sm text-green-800">Projected Annual Savings</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(overallScore / 8)}</div>
                    <div className="text-sm text-purple-800">Inventory Turns</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(overallScore * 0.95)}%</div>
                    <div className="text-sm text-orange-800">Operational Efficiency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6 animate-fade-in">
            {/* Performance Trend */}
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

            {/* Historical Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Assessment Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previousAssessments.map((assessment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <div className="font-medium">{assessment.date}</div>
                        <div className="text-sm text-gray-600">Assessment Score</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{assessment.score}</div>
                        <div className="text-sm text-green-600 font-medium">{assessment.improvement} pts improvement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trend Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">+{overallScore - Math.max(60, overallScore - 15)} pts</div>
                  <div className="text-sm text-green-800">6-Month Improvement</div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{overallScore >= 80 ? '1st' : overallScore >= 70 ? '2nd' : '3rd'}</div>
                  <div className="text-sm text-blue-800">Regional Ranking</div>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">85</div>
                  <div className="text-sm text-purple-800">Target Score</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Improvement Recommendations
                </CardTitle>
                <p className="text-gray-600">Prioritized action items based on your assessment results</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {improvementActions.length > 0 ? (
                    improvementActions.map((action, index) => (
                      <Card 
                        key={action.id} 
                        className="border-l-4 hover:shadow-md transition-all duration-300"
                        style={{
                          borderLeftColor: action.priority === 'critical' ? '#EF4444' : 
                                         action.priority === 'high' ? '#F59E0B' : '#10B981'
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{action.emoji}</span>
                              <div>
                                <h3 className="font-semibold text-lg">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.department} • Score: {action.score}/100</p>
                              </div>
                            </div>
                            <Badge className={getPriorityColor(action.priority)}>
                              {action.priority.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{action.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Expected Impact:</span>
                              <span className="text-green-600">{action.impact}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-orange-600" />
                              <span className="font-medium">Effort Required:</span>
                              <span className="text-orange-600">{action.effort}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-green-800 mb-2">🎉 Excellent Performance!</h3>
                        <p className="text-green-700">
                          Your dealership is performing well across all areas. Keep up the great work!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}