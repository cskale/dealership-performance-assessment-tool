import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, BookOpen, BarChart3, ExternalLink } from "lucide-react";
import { getDepartmentConfig } from "./departmentConfig";
import { KPIBenchmarkStudio } from "./KPIBenchmarkStudio";
import { RootCauseIntelligenceBoard } from "./RootCauseIntelligenceBoard";
import { ImprovementPlaybook } from "./ImprovementPlaybook";
import { KpiRelationshipMap } from "./KpiRelationshipMap";
import type { KPIDefinition } from "@/lib/kpiDefinitions";
import { Separator } from "@/components/ui/separator";

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

      {/* ============================================= */}
      {/* ZONE A — HERO CANVAS                          */}
      {/* ============================================= */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
          {/* Left: Title, meta, summary */}
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
              {kpi.rootCauseDiagnostics && (
                <Badge variant="secondary" className="text-xs font-normal bg-primary/5 text-primary border-0">
                  {language === 'de' ? 'Vollständige Analyse' : 'Full Analysis'}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight mb-3">
              {kpi.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {kpi.executiveSummary || kpi.definition}
            </p>

            {/* Directionality note */}
            <p className="text-xs text-muted-foreground/70 mt-3 italic">
              {isLowerBetter
                ? (language === 'de' ? '↓ Niedrigere Werte sind besser' : '↓ Lower is better')
                : (language === 'de' ? '↑ Höhere Werte sind besser' : '↑ Higher is better')}
            </p>
          </div>

          {/* Right: Benchmark visualization */}
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

      {/* ============================================= */}
      {/* ZONE B — INSIGHT GRID                         */}
      {/* ============================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* Block 1 — Definition & Formula (wide) */}
        <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {language === 'de' ? 'Definition & Formel' : 'Definition & Formula'}
          </h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">{kpi.definition}</p>

          {kpi.formula && (
            <div className="bg-muted/40 rounded-xl p-4 mb-4">
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
                        <span className="text-emerald-500 mt-0.5">✓</span>
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

        {/* Block 3 — Why It Matters (narrow) */}
        <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {language === 'de' ? 'Warum es wichtig ist' : 'Why It Matters'}
          </h3>
          <p className="text-sm text-foreground leading-relaxed mb-4">{kpi.whyItMatters}</p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {kpi.benchmark && (
              <div className="bg-muted/30 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Benchmark</span>
                <span className="text-lg font-bold text-foreground">{kpi.benchmark}</span>
              </div>
            )}
            {kpi.unitOfMeasure && (
              <div className="bg-muted/30 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {language === 'de' ? 'Einheit' : 'Unit'}
                </span>
                <span className="text-lg font-bold text-foreground">{kpi.unitOfMeasure}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block 4 — Root Cause Intelligence */}
      {kpi.rootCauseDiagnostics && (
        <div className="mb-8">
          <RootCauseIntelligenceBoard
            diagnostics={kpi.rootCauseDiagnostics}
            language={language}
          />
        </div>
      )}

      {/* Block 5 — Improvement Playbook */}
      {kpi.improvementLevers && kpi.improvementLevers.length > 0 && (
        <div className="mb-8">
          <ImprovementPlaybook
            levers={kpi.improvementLevers}
            language={language}
          />
        </div>
      )}

      {/* Block 6 — Relationship Map */}
      {kpi.interdependencies && (
        <div className="mb-8">
          <KpiRelationshipMap
            interdependencies={kpi.interdependencies}
            kpiTitle={kpi.title}
            language={language}
            onNavigateToKpi={onNavigateToKpi}
          />
        </div>
      )}

      {/* ============================================= */}
      {/* ZONE C — ACTION RAIL                          */}
      {/* ============================================= */}
      <div className="sticky bottom-0 z-20 -mx-1 px-1 pb-1">
        <div className="rounded-2xl border border-border/60 bg-card/95 backdrop-blur-sm p-4 flex flex-wrap items-center gap-3 shadow-lg shadow-background/80">
          <Button size="sm" className="gap-2 rounded-xl">
            <Plus className="h-3.5 w-3.5" />
            {language === 'de' ? 'Aktion erstellen' : 'Create Action'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <BarChart3 className="h-3.5 w-3.5" />
            {language === 'de' ? 'Zum Ergebnis' : 'View Results'}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {language === 'de' ? 'Methodik' : 'Methodology'}
          </Button>
        </div>
      </div>
    </div>
  );
}
