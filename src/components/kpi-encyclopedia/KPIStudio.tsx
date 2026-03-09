import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { getDepartmentConfig } from "@/lib/departmentConfig";
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

  const directionLabel = isLowerBetter
    ? (language === 'de' ? 'Niedriger ist besser' : 'Lower is better')
    : (language === 'de' ? 'Höher ist besser' : 'Higher is better');

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {language === 'de' ? 'Zurück zur Enzyklopädie' : 'Back to Encyclopedia'}
      </button>

      {/* ===== 1. KPI HERO ===== */}
      <section className="mb-6">
        {/* Row 1: Chips */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
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

        {/* Row 2: Title + Benchmark */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-14">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
              {kpi.title}
            </h1>

            {/* Row 3: Summary with Why It Matters integrated */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-2">
              {kpi.definition}
            </p>
            {kpi.whyItMatters && (
              <p className="text-sm text-foreground/60 leading-relaxed max-w-2xl">
                {kpi.whyItMatters}
              </p>
            )}
          </div>

          {/* Benchmark card */}
          {kpi.benchmark && (
            <div className="lg:w-[300px] shrink-0 rounded-2xl border border-border/40 bg-card p-5">
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest block mb-3">
                {language === 'de' ? 'Referenz-Benchmarkbereich' : 'Reference Benchmark Range'}
              </span>
              <KPIBenchmarkStudio
                benchmark={kpi.benchmark}
                unit={kpi.unitOfMeasure}
                isLowerBetter={!!isLowerBetter}
                language={language}
              />
            </div>
          )}
        </div>

        {/* Row 4: KPI Snapshot metadata */}
        <div className="flex items-center gap-4 flex-wrap mt-6 pt-5 border-t border-border/30">
          {kpi.unitOfMeasure && (
            <div className="text-xs text-muted-foreground/60">
              <span className="font-semibold text-muted-foreground/80 mr-1">{language === 'de' ? 'Einheit' : 'Unit'}:</span>
              {kpi.unitOfMeasure}
            </div>
          )}
          <div className="text-xs text-muted-foreground/60">
            <span className="font-semibold text-muted-foreground/80 mr-1">{language === 'de' ? 'Richtung' : 'Direction'}:</span>
            {directionLabel}
          </div>
          <div className="text-xs text-muted-foreground/60">
            <span className="font-semibold text-muted-foreground/80 mr-1">{language === 'de' ? 'Referenztyp' : 'Reference type'}:</span>
            {language === 'de' ? 'Branchenrichtwert' : 'Industry indicative'}
          </div>
          <div className="text-xs text-muted-foreground/60">
            <span className="font-semibold text-muted-foreground/80 mr-1">{language === 'de' ? 'Bereich' : 'Scope'}:</span>
            {deptLabel}
          </div>
        </div>
      </section>

      {/* ===== 2. EXECUTIVE TAKEAWAY ===== */}
      {kpi.executiveSummary && (
        <section className="mb-14 mt-10">
          <div className="rounded-xl bg-primary/[0.03] px-7 py-5">
            <span className="text-[11px] font-semibold text-primary/50 uppercase tracking-widest block mb-2">
              {language === 'de' ? 'Executive Takeaway' : 'Executive Takeaway'}
            </span>
            <p className="text-[15px] text-foreground/75 leading-relaxed">
              {kpi.executiveSummary}
            </p>
          </div>
        </section>
      )}

      {/* ===== 3. DEFINITION & CONTEXT ===== */}
      <section className="mb-14">
        <h2 className="text-[15px] font-semibold text-foreground mb-1.5">
          {language === 'de' ? 'Definition & Formel' : 'Definition & Context'}
        </h2>
        <p className="text-sm text-muted-foreground/70 mb-6 leading-relaxed">
          {language === 'de'
            ? 'Wie dieser KPI definiert, berechnet und interpretiert wird.'
            : 'How this KPI is defined, calculated, and interpreted.'}
        </p>

        <div className="rounded-xl border border-border/30 bg-card p-6 sm:p-7">
          <p className="text-sm text-foreground/80 leading-relaxed mb-5">{kpi.definition}</p>

          {kpi.formula && (
            <div className="bg-muted/30 rounded-lg px-5 py-4 mb-5">
              <code className="text-sm font-mono text-foreground/80 leading-relaxed block">{kpi.formula}</code>
            </div>
          )}

          {(kpi.inclusions || kpi.exclusions) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 pt-5 border-t border-border/20">
              {kpi.inclusions && kpi.inclusions.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider block mb-3">
                    {language === 'de' ? 'Einschlüsse' : 'Includes'}
                  </span>
                  <ul className="space-y-2">
                    {kpi.inclusions.map((item, i) => (
                      <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                        <span className="text-primary/40 mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {kpi.exclusions && kpi.exclusions.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider block mb-3">
                    {language === 'de' ? 'Ausschlüsse' : 'Excludes'}
                  </span>
                  <ul className="space-y-2">
                    {kpi.exclusions.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground/70 flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== 4. REFERENCE BENCHMARK RANGE (full-width) ===== */}
      {kpi.benchmark && (
        <section className="mb-14">
          <h2 className="text-[15px] font-semibold text-foreground mb-1.5">
            {language === 'de' ? 'Referenz-Benchmarkbereich' : 'Reference Benchmark Range'}
          </h2>
          <p className="text-sm text-muted-foreground/70 mb-6 leading-relaxed">
            {language === 'de'
              ? 'Referenzbereiche sollten nach OEM, Markt und Kanalmix weiter kalibriert werden.'
              : 'Reference ranges should be calibrated further by OEM, market, and channel mix where available.'}
          </p>
          <div className="rounded-xl border border-border/30 bg-card p-6 sm:p-7">
            <KPIBenchmarkStudio
              benchmark={kpi.benchmark}
              unit={kpi.unitOfMeasure}
              isLowerBetter={!!isLowerBetter}
              language={language}
            />
          </div>
        </section>
      )}

      {/* ===== 5. KEY DIAGNOSTIC THEMES ===== */}
      {kpi.rootCauseDiagnostics && (
        <section className="mb-14">
          <RootCauseIntelligenceBoard
            diagnostics={kpi.rootCauseDiagnostics}
            language={language}
          />
        </section>
      )}

      {/* ===== 6. SUGGESTED IMPROVEMENT IDEAS ===== */}
      {kpi.improvementLevers && kpi.improvementLevers.length > 0 && (
        <section className="mb-14">
          <ImprovementPlaybook
            levers={kpi.improvementLevers}
            language={language}
          />
        </section>
      )}

      {/* ===== 7. PERFORMANCE INFLUENCE FRAMEWORK ===== */}
      {kpi.interdependencies && (
        <section className="mb-14">
          <KpiRelationshipMap
            interdependencies={kpi.interdependencies}
            kpiTitle={kpi.title}
            language={language}
            onNavigateToKpi={onNavigateToKpi}
          />
        </section>
      )}
    </div>
  );
}
