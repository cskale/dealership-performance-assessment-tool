import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Globe, Shield, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePDFReport, type PDFExportData } from '@/lib/pdfReportGenerator';
import { generateExcelReport, type ExcelExportParams } from '@/lib/excelExportGenerator';
import { useTranslation } from 'react-i18next';
import { getDepartmentName } from '@/lib/departmentNames';
import { getMaturityLevel } from '@/lib/constants';
import { calculateWeightedScore } from '@/lib/scoringEngine';

interface ExportPDFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportData: PDFExportData | null;
}

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

export function ExportPDFModal({ open, onOpenChange, exportData }: ExportPDFModalProps) {
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [xlsxGenerating, setXlsxGenerating] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const reportLang = exportData?.organization?.default_language || 'en';

  const handleGenerate = async () => {
    if (!exportData) return;

    setPdfGenerating(true);
    try {
      // Defer to next tick so React can render the loading state before
      // the synchronous jsPDF work blocks the main thread
      await new Promise(resolve => setTimeout(resolve, 50));
      await generatePDFReport({
        ...exportData,
        includeWatermark,
      });
      toast({
        title: 'PDF Report Generated',
        description: 'Your consulting-grade assessment report has been downloaded.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to generate PDF. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!exportData) return;
    setXlsxGenerating(true);
    try {
      const lang = (exportData.organization?.default_language as 'en' | 'de') || 'en';
      const overallScore = exportData.assessment.overallScore;
      const maturityLevel = getMaturityLevel(overallScore, lang === 'de' ? 'de' : 'en');
      const INDICATIVE_BENCHMARK = 75;

      const kpiData = Object.entries(exportData.assessment.scores).map(([dept, score]) => ({
        category: getDepartmentName(dept, lang),
        score,
        benchmark: INDICATIVE_BENCHMARK,
        gap: score - INDICATIVE_BENCHMARK,
        confidence: 'N/A',
      }));

      const actionData = (exportData.actions ?? []).map(a => ({
        title: a.action_title ?? '',
        priority: a.priority ?? '',
        owner: a.responsible_person ?? undefined,
        dueDate: a.target_completion_date ?? undefined,
        triageScore: undefined,
        status: a.status ?? '',
      }));

      const gapAnalysisData = Object.entries(exportData.assessment.scores).map(([dept, score]) => ({
        department: getDepartmentName(dept, lang),
        score,
        benchmark: INDICATIVE_BENCHMARK,
        gap: score - INDICATIVE_BENCHMARK,
      }));

      generateExcelReport({
        dealerName: exportData.organization?.name ?? 'Dealer',
        assessmentDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        overallScore,
        maturityLevel,
        kpiData,
        actionData,
        gapAnalysisData,
      });
      toast({
        title: 'Excel Report Generated',
        description: 'Your report has been downloaded.',
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to generate Excel report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setXlsxGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Export Assessment Report
          </DialogTitle>
          <DialogDescription>
            Generate a consulting-grade PDF with all assessment sections except Useful Resources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Language indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Report Language</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {LANG_NAMES[reportLang] || reportLang.toUpperCase()}
            </Badge>
          </div>

          {/* Watermark toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="watermark" className="text-muted-foreground cursor-pointer">
                Include watermark
              </Label>
            </div>
            <Switch
              id="watermark"
              checked={includeWatermark}
              onCheckedChange={setIncludeWatermark}
            />
          </div>
          {includeWatermark && (
            <p className="text-xs text-muted-foreground ml-6 -mt-2">
              "{exportData?.organization?.name || 'Organization'} – Internal Use Only" on every page.
            </p>
          )}

          {/* Report contents note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              This report includes: Cover Page, Executive Summary, KPI Analytics,
              Action Plan, Methodology, and Appendix. Useful Resources are excluded.
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pdfGenerating || xlsxGenerating} className="sm:order-1">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadExcel}
            disabled={xlsxGenerating || !exportData}
            className="gap-2 sm:order-2"
          >
            {xlsxGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Export to Excel
          </Button>
          <Button onClick={handleGenerate} disabled={pdfGenerating || !exportData} className="gap-2 sm:order-3">
            {pdfGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {pdfGenerating ? 'Generating...' : 'Download PDF Report'}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center mt-1">
          PDF generation may take 5–15 seconds for full reports.
        </p>
      </DialogContent>
    </Dialog>
  );
}
