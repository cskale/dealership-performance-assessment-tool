import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, BookOpen, BarChart3 } from "lucide-react";
import { getDepartmentConfig } from "./departmentConfig";
import { KPIBenchmarkStudio } from "./KPIBenchmarkStudio";
import { RootCauseIntelligenceBoard } from "./RootCauseIntelligenceBoard";
import { ImprovementPlaybook } from "./ImprovementPlaybook";
import { KpiRelationshipMap } from "./KpiRelationshipMap";
import type { KPIDefinition } from "@/lib/kpiDefinitions";

interface KPIStudioProps {
  kpiKey: string;
  kpi: KPIDefinition;
  departmentKey: string;
  language: string;
  onBack: () => void;
  onNavigateToKpi: (name: string) => void;
}

export function KPIStudio({ kpiKey, kpi, departmentKey, language, onBack, onNavigateToKpi }: KPIStudioProps) {
  const config = getDepartmentConfig(departmentKey);
  const DeptIcon = config.icon;
  const deptLabel = config.label[language as 'en' | 'de'] || config.label.en;

  const isLowerBetter = kpi.benchmark?.includes('<') ||
    kpi.unitOfMeasure?.toLowerCase()?.includes('minute') ||
    kpi.unitOfMeasure?.toLowerCase()?.includes('day');

  return (
    <div className="space-y-0">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {language === 'de' ? 'Zurück zur Enzyklopädie' : 'Back to Encyclopedia'}
      </button>

      {/* ===== 1. KPI HERO ===== */}
      <div className="rounded-xl border border-border/40 bg-card p-6 sm:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge
                variant="outline"
                className={cn("text-xs font-medium border", config.bgClass, config.textClass, config.borderClass)}
              >
                <DeptIcon className="h-3 w-3 mr-1" />
                {deptLabel}
              </Badge>
              {kpi.unitOfMeasure && (
                <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground">
                  {kpi.unitOfMeasure}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight mb-3">
              {kpi.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {kpi.executiveSummary || kpi.definition}
            </p>
          </div>

          {/* Benchmark */}
          <div className="lg:w-80 shrink-0">
            <KPIBenchmarkStudio
              benchmark={kpi.benchmark}
              unit={kpi.unitOfMeasure}
              isLowerBetter={!!isLowerBetter}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* ===== 2. EXECUTIVE TAKEAWAY ===== */}
      {kpi.executiveSummary && (
        <div className="rounded-xl border border-primary/10 bg-primary/[0.03] px-5 py-4 mb-6">
          <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider block mb-1.5">
            {language === 'de' ? 'Executive Takeaway' : 'Executive Takeaway'}
          </span>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {kpi.whyItMatters}
          </p>
        </div>
      )}

      {/* ===== 3. REFERENCE BENCHMARK RANGE (already in hero) ===== */}

      {/* ===== 4. DEFINITION & CONTEXT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        <div className="lg:col-span-7 rounded-xl border border-border/40 bg-card p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {language === 'de' ? 'Definition & Formel' : 'Definition & Formula'}
          </h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">{kpi.definition}</p>

          {kpi.formula && (
            <div className="bg-muted/30 rounded-lg p-3.5 mb-4">
              <code className="text-xs font-mono text-foreground leading-relaxed block">{kpi.formula}</code>
            </div>
          )}

          {(kpi.inclusions || kpi.exclusions) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {kpi.inclusions && kpi.inclusions.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {language === 'de' ? 'Einschlüsse' : 'Includes'}
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {kpi.inclusions.map((item, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                        <span className="text-primary/60 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {kpi.exclusions && kpi.exclusions.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {language === 'de' ? 'Ausschlüsse' : 'Excludes'}
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {kpi.exclusions.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-0.5">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-xl border border-border/40 bg-card p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {language === 'de' ? 'Warum es wichtig ist' : 'Why It Matters'}
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{kpi.whyItMatters}</p>

          {/* Context note */}
          <p className="text-[10px] text-muted-foreground/50 mt-4 leading-relaxed italic">
            {language === 'de'
              ? 'Referenzbereiche sollten weiter nach OEM, Markt und Kanalmix kalibriert werden, sofern verfügbar.'
              : 'Reference ranges should be calibrated further by OEM, market, and channel mix where available.'}
          </p>
        </div>
      </div>

      {/* ===== 5. KEY DIAGNOSTIC THEMES ===== */}
      {kpi.rootCauseDiagnostics && (
        <div className="mb-6">
          <RootCauseIntelligenceBoard
            diagnostics={kpi.rootCauseDiagnostics}
            language={language}
          />
        </div>
      )}

      {/* ===== 6. SUGGESTED IMPROVEMENT IDEAS ===== */}
      {kpi.improvementLevers && kpi.improvementLevers.length > 0 && (
        <div className="mb-6">
          <ImprovementPlaybook
            levers={kpi.improvementLevers}
            language={language}
          />
        </div>
      )}

      {/* ===== 7. KPI INFLUENCE MAP ===== */}
      {kpi.interdependencies && (
        <div className="mb-6">
          <KpiRelationshipMap
            interdependencies={kpi.interdependencies}
            kpiTitle={kpi.title}
            language={language}
            onNavigateToKpi={onNavigateToKpi}
          />
        </div>
      )}

      {/* ===== 8. CTA ACTION BAR ===== */}
      <div className="sticky bottom-0 z-20 -mx-1 px-1 pb-1">
        <div className="rounded-xl border border-border/40 bg-card/95 backdrop-blur-sm p-4 flex flex-wrap items-center gap-3 shadow-lg shadow-background/80">
          <Button size="sm" className="gap-2 rounded-lg">
            <Plus className="h-3.5 w-3.5" />
            {language === 'de' ? 'Aktion erstellen' : 'Create Action'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-lg">
            <BarChart3 className="h-3.5 w-3.5" />
            {language === 'de' ? 'Zum Ergebnis' : 'View Results'}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-lg text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {language === 'de' ? 'Methodik' : 'Methodology'}
          </Button>
        </div>
      </div>
    </div>
  );
}
