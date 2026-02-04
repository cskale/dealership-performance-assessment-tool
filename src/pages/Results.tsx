import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Download, FileText, RefreshCw, ArrowLeft, HelpCircle, Info } from "lucide-react";
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
import { AppHeader } from "@/components/AppHeader";
import { calculateWeightedScore, CATEGORY_WEIGHTS } from "@/lib/scoringEngine";

export default function Results() {
  const [activeTab, setActiveTab] = useState("executive");
  const [resultsData, setResultsData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Load completed assessment results
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Small delay for loading state visibility
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      
      setIsLoading(false);
    };
    
    loadData();
  }, [navigate, toast, t]);

  // Calculate weighted overall score ONCE - memoized
  const overallScore = useMemo(() => {
    if (!resultsData?.scores) return 0;
    // Use weighted scoring engine for proper calculation
    return calculateWeightedScore(resultsData.scores);
  }, [resultsData?.scores]);

  // Animate score on load - smooth clockwise animation
  useEffect(() => {
    if (overallScore > 0 && !isLoading) {
      const duration = 1200; // 1.2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(overallScore * eased));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [overallScore, isLoading]);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: t('results.excellent'), color: 'bg-emerald-600' };
    if (score >= 60) return { label: t('results.good'), color: 'bg-yellow-600' };
    return { label: t('results.needsImprovement'), color: 'bg-red-600' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handler to navigate to resources tab
  const handleNavigateToResources = () => {
    setActiveTab("resources");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <AppHeader />
        <div className="p-4 max-w-7xl mx-auto pt-8">
          <div className="text-center mb-8 animate-fade-in">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto mb-8" />
            <Skeleton className="h-48 w-48 rounded-full mx-auto mb-8" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <AppHeader />
      
      <div className="p-4 max-w-7xl mx-auto" id="results-content">
        {/* Unified Results Hero - Single Score Display */}
        <div className="text-center mb-8 animate-fade-in pt-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('nav.backToDashboard')}
            </Button>
            <Button
              onClick={handleRetakeAssessment}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('results.retakeAssessment')}
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {language === 'de' ? 'Industrielle Bewertungsergebnisse' : 'Industrial Assessment Results'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'de' ? 'Umfassende Analyse abgeschlossen am' : 'Comprehensive analysis completed on'} {formatDate(resultsData.completedAt)}
          </p>
          
          {/* Single Large Score Circle with smooth clockwise animation */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <svg className="w-40 h-40 md:w-48 md:h-48" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                      />
                      {/* Animated progress circle - starts from top (12 o'clock) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        className={getScoreColor(overallScore)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(animatedScore / 100) * 283} 283`}
                        transform="rotate(-90 50 50)"
                        style={{ 
                          transition: 'stroke-dasharray 0.1s ease-out'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl md:text-6xl font-bold text-foreground">{animatedScore}</span>
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-2">{language === 'de' ? 'Gewichtete Punktzahl' : 'Weighted Score'}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {language === 'de' 
                      ? 'Diese Punktzahl wird nach Geschäftsbereich gewichtet berechnet:' 
                      : 'This score is calculated with weighted categories:'}
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• {language === 'de' ? 'Neuwagenverkauf' : 'New Vehicle Sales'}: 25%</li>
                    <li>• {language === 'de' ? 'Gebrauchtwagenverkauf' : 'Used Vehicle Sales'}: 20%</li>
                    <li>• {language === 'de' ? 'Serviceleistung' : 'Service Performance'}: 20%</li>
                    <li>• {language === 'de' ? 'Finanzoperationen' : 'Financial Operations'}: 20%</li>
                    <li>• {language === 'de' ? 'Teile & Lager' : 'Parts & Inventory'}: 15%</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Score Badge */}
          <Badge className={`${scoreInfo.color} text-white text-base px-4 py-2 mb-6`}>
            {scoreInfo.label}
          </Badge>

          {/* Export Options */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isExporting ? (language === 'de' ? 'Exportiere...' : 'Exporting...') : t('results.exportPDF')}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur-sm border shadow-lg h-12">
            <TabsTrigger value="executive" className="text-xs sm:text-sm">📋 {t('results.tab.executive')}</TabsTrigger>
            <TabsTrigger value="kpi" className="text-xs sm:text-sm">💰 {t('results.tab.kpi')}</TabsTrigger>
            <TabsTrigger value="maturity" className="text-xs sm:text-sm">🏆 {t('results.tab.maturity')}</TabsTrigger>
            <TabsTrigger value="action-plan" className="text-xs sm:text-sm">✅ {t('results.tab.actionPlan')}</TabsTrigger>
            <TabsTrigger value="resources" className="text-xs sm:text-sm">📚 {t('results.tab.resources')}</TabsTrigger>
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
