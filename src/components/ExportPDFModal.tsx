import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Globe, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePDFReport, type PDFExportData } from '@/lib/pdfReportGenerator';

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
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const reportLang = exportData?.organization?.default_language || 'en';

  const handleGenerate = async () => {
    if (!exportData) return;

    setGenerating(true);
    try {
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
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating || !exportData}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
