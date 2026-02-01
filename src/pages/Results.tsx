import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { IndustrialKPIDashboard } from "@/components/IndustrialKPIDashboard";
import { MaturityScoring } from "@/components/MaturityScoring";
import { ActionPlan } from "@/components/ActionPlan";
import { UsefulResources } from "@/components/UsefulResources";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Results() {
  const [activeTab, setActiveTab] = useState("executive");
  const [resultsData, setResultsData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

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
    } else {
      toast({
        title: t('results.noResults'),
        description: t('results.completeFirst'),
        variant: "destructive",
      });
      navigate('/app/assessment');
    }
  }, [navigate, toast, t]);

  // Calculate overall score ONCE - memoized
  const overallScore = useMemo(() => {
    return resultsData?.overallScore || 0;
  }, [resultsData?.overallScore]);

  const handleRetakeAssessment = () => {
    localStorage.removeItem('completed_assessment_results');
    localStorage.removeItem('assessment_data');
    toast({
      title: t('results.assessmentReset'),
      description: t('results.startingFresh'),
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
        title: t('results.pdfExported'),
        description: t('results.pdfSuccess'),
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('results.exportFailed'),
        description: t('results.exportError'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: t('results.excellent'), emoji: '🟢' };
    if (score >= 60) return { label: t('results.good'), emoji: '🟡' };
    return { label: t('results.needsImprovement'), emoji: '🔴' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US');
  };

  // Handler to navigate to resources tab
  const handleNavigateToResources = () => {
    setActiveTab("resources");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(overallScore);

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
              {t('nav.backToDashboard')}
            </Button>
            <Button
              onClick={handleRetakeAssessment}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('results.retakeAssessment')}
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🏆 {t('results.title')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('results.completedOn')} {formatDate(resultsData.completedAt)}
          </p>
          
          {/* Overall Score */}
          <div className="flex justify-center mb-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-6xl font-bold text-primary mb-2">{overallScore}</div>
                <div className="text-lg text-primary mb-4">{t('results.overallScore')}</div>
                <Badge className={`text-lg px-4 py-2 ${overallScore >= 80 ? 'bg-green-600' : overallScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                  {scoreInfo.emoji} {scoreInfo.label}
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
              {isExporting ? t('results.exporting') : t('results.exportPDF')}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" defaultValue="executive">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="executive">📋 {t('results.tab.executive')}</TabsTrigger>
            <TabsTrigger value="kpi">💰 {t('results.tab.kpi')}</TabsTrigger>
            <TabsTrigger value="maturity">🏆 {t('results.tab.maturity')}</TabsTrigger>
            <TabsTrigger value="action-plan">✅ {t('results.tab.actionPlan')}</TabsTrigger>
            <TabsTrigger value="resources">📚 {t('results.tab.resources')}</TabsTrigger>
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
              onNavigateToResources={handleNavigateToResources}
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
