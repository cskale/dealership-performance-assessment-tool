import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDepartmentConfig } from "./departmentConfig";
import { KPIBenchmarkBar } from "./KPIBenchmarkBar";
import { KPIRootCauseTiles } from "./KPIRootCauseTiles";
import { KPIImprovementLevers } from "./KPIImprovementLevers";
import { BookOpen, ArrowRight } from "lucide-react";
import type { KPIDefinition } from "@/lib/kpiDefinitions";

interface KPIDetailPreviewProps {
  kpiKey: string | null;
  kpi: KPIDefinition | null;
  departmentKey: string;
  language: string;
  onOpenDetail: () => void;
  onSelectKpi: (key: string) => void;
  className?: string;
}

export function KPIDetailPreview({
  kpiKey, kpi, departmentKey, language, onOpenDetail, onSelectKpi, className
}: KPIDetailPreviewProps) {
  if (!kpi || !kpiKey) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full px-8 text-center", className)}>
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <BookOpen className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          {language === 'de'
            ? 'Wählen Sie einen KPI aus, um Definition, Benchmarks, Ursachendiagnostik und Maßnahmen zu erkunden.'
            : 'Select a KPI to explore definition, benchmarks, root causes, and actions.'}
        </p>
      </div>
    );
  }

  const config = getDepartmentConfig(departmentKey);
  const DeptIcon = config.icon;
  const deptLabel = config.label[language as 'en' | 'de'] || config.label.en;

  return (
    <div className={cn("overflow-y-auto p-6 space-y-6", className)}>
      {/* Hero */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={cn("text-xs font-normal border", config.bgClass, config.textClass, config.borderClass)} variant="outline">
            <DeptIcon className="h-3 w-3 mr-1" />
            {deptLabel}
          </Badge>
          {kpi.rootCauseDiagnostics && (
            <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-0">
              Deep Dive
            </Badge>
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground leading-tight">{kpi.title}</h2>
        {kpi.executiveSummary && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{kpi.executiveSummary}</p>
        )}
      </div>

      {/* Benchmark */}
      <KPIBenchmarkBar benchmark={kpi.benchmark} unit={kpi.unitOfMeasure} />

      {/* Why it matters */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          {language === 'de' ? 'Warum wichtig' : 'Why It Matters'}
        </h3>
        <p className="text-sm text-foreground leading-relaxed">{kpi.whyItMatters}</p>
      </div>

      {/* Root Causes - compact */}
      {kpi.rootCauseDiagnostics && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {language === 'de' ? 'Ursachendiagnostik' : 'Root Cause Diagnostics'}
          </h3>
          <KPIRootCauseTiles diagnostics={kpi.rootCauseDiagnostics} language={language} mode="compact" />
        </div>
      )}

      {/* Top levers - compact */}
      {kpi.improvementLevers && kpi.improvementLevers.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {language === 'de' ? 'Top Verbesserungshebel' : 'Top Improvement Levers'}
          </h3>
          <KPIImprovementLevers levers={kpi.improvementLevers} language={language} mode="compact" />
        </div>
      )}

      {/* Related KPIs */}
      {kpi.interdependencies && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {language === 'de' ? 'Verwandte KPIs' : 'Related KPIs'}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {[...kpi.interdependencies.upstreamDrivers, ...kpi.interdependencies.downstreamImpacts]
              .slice(0, 6)
              .map((name, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] font-normal cursor-default hover:bg-muted transition-colors"
                >
                  {name}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-2">
        <Button onClick={onOpenDetail} className="w-full gap-2">
          {language === 'de' ? 'KPI Deep Dive öffnen' : 'Open KPI Deep Dive'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
