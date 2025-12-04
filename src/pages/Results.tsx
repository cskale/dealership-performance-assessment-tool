import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, FileSpreadsheet, Image, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Star, Brain, Globe, Building, RefreshCw, ArrowLeft, Award, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { IndustrialKPIDashboard } from "@/components/IndustrialKPIDashboard";
import { MaturityScoring } from "@/components/MaturityScoring";
import { ActionPlan } from "@/components/ActionPlan";
import { UsefulResources } from "@/components/UsefulResources";
import { formatEuro, formatPercentage } from "@/utils/euroFormatter";

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
      
      // Ensure assessmentId exists (for backwards compatibility)
      if (!data.assessmentId) {
        data.assessmentId = crypto.randomUUID();
        localStorage.setItem('completed_assessment_results', JSON.stringify(data));
      }
      
      setResultsData(data);
      generateImprovementActions(data.scores);
    } else {
      toast({
        title: "No Results Found",
        description: "Please complete the assessment first.",
        variant: "destructive",
      });
      navigate('/app/assessment');
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

        actions.push({
          id: Math.random(),
          department: section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          priority,
          emoji,
          title: `Improve ${section.replace('-', ' ')} Performance`,
          description: `Focus on enhancing ${section.replace('-', ' ')} processes and efficiency.`,
          impact: 'Significant improvement expected',
          effort: '2-4 weeks implementation',
          score: score
        });
      }
    });

    setImprovementActions(actions);
  };

  const overallScore = resultsData?.overallScore || 0;

  const handleRetakeAssessment = () => {
    localStorage.removeItem('completed_assessment_results');
    localStorage.removeItem('assessment_data');
    toast({
      title: "Assessment Reset",
      description: "Starting fresh assessment...",
    });
    navigate('/app/assessment');
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

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-7xl mx-auto" id="results-content">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={handleRetakeAssessment}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retake Assessment
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🏆 Industrial Assessment Results
          </h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive analysis completed on {new Date(resultsData.completedAt).toLocaleDateString()}
          </p>
          
          {/* Overall Score */}
          <div className="flex justify-center mb-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-bold text-primary mb-2">{overallScore}</div>
                <div className="text-lg text-primary mb-4">Overall Performance Score</div>
                <Badge className={`text-lg px-4 py-2 ${overallScore >= 80 ? 'bg-green-600' : overallScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                  {overallScore >= 80 ? '🟢 Excellent' : overallScore >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" defaultValue="executive">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="executive">📋 Executive Summary</TabsTrigger>
            <TabsTrigger value="kpi">💰 KPI Analytics</TabsTrigger>
            <TabsTrigger value="maturity">🏆 Maturity</TabsTrigger>
            <TabsTrigger value="action-plan">✅ Action Plan</TabsTrigger>
            <TabsTrigger value="resources">📚 Useful Resources</TabsTrigger>
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
            <IndustrialKPIDashboard
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

          <TabsContent value="action-plan" className="space-y-6 animate-fade-in">
            <ActionPlan
              scores={resultsData.scores}
              assessmentId={resultsData.assessmentId}
            />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 animate-fade-in">
            <UsefulResources
              scores={resultsData.scores}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}