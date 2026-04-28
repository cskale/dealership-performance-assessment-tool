import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Network, Target, Users, Wrench, Workflow } from "lucide-react";
import { getDepartmentConfig } from "@/lib/departmentConfig";
import { KPIBenchmarkStudio } from "./KPIBenchmarkStudio";
import type { KPIDefinition } from "@/lib/kpiDefinitions";

interface KPIStudioProps {
  kpiKey: string;
  kpi: KPIDefinition;
  departmentKey: string;
  language: string;
}

const diagnosticRows = [
  { key: "people", label: "People", icon: Users },
  { key: "process", label: "Process", icon: Workflow },
  { key: "tools", label: "Tools", icon: Wrench },
  { key: "structure", label: "Structure", icon: Network },
  { key: "incentives", label: "Incentives", icon: Target },
] as const;

function getImprovementTag(index: number, total: number) {
  if (total <= 3 || index < 2) return "Quick win";
  if (index >= total - 1) return "Capability";
  return "Structural";
}

export function KPIStudio({ kpiKey, kpi, departmentKey, language }: KPIStudioProps) {
  const config = getDepartmentConfig(departmentKey);
  const DeptIcon = config.icon;
  const deptLabel = config.label[language as 'en' | 'de'] || config.label.en;

  const isLowerBetter = kpi.benchmark?.includes('<') ||
    kpi.unitOfMeasure?.toLowerCase()?.includes('minute') ||
    kpi.unitOfMeasure?.toLowerCase()?.includes('day');

  const directionLabel = isLowerBetter
    ? (language === 'de' ? 'Niedriger ist besser' : 'Lower is better')
    : (language === 'de' ? 'Höher ist besser' : 'Higher is better');

  const displayedLevers = kpi.improvementLevers?.slice(0, 7) ?? [];

  return (
    <div className="flex max-h-[85vh] flex-col bg-card">
      <header className="shrink-0 px-6 py-5 pr-14 border-b border-border/60">
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
          {kpi.title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("rounded-full text-xs font-medium border px-2.5 py-1", config.bgClass, config.textClass, config.borderClass)}
          >
            <DeptIcon className="h-3 w-3 mr-1" />
            {deptLabel}
          </Badge>
          {kpi.unitOfMeasure && (
            <Badge variant="secondary" className="rounded-full text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1">
              {kpi.unitOfMeasure}
            </Badge>
          )}
        </div>
      </header>

      <div className="overflow-y-auto px-6 py-6 space-y-8">
        {kpi.benchmark && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              {language === 'de' ? 'Referenz-Benchmarkbereich' : 'Reference Benchmark Range'}
            </h2>
            <div className="w-full rounded-xl border border-border/40 bg-background p-5">
              <KPIBenchmarkStudio
                kpiKey={kpiKey}
                benchmark={kpi.benchmark}
                unit={kpi.unitOfMeasure}
                isLowerBetter={!!isLowerBetter}
                language={language}
              />
            </div>
          </section>
        )}

        {kpi.executiveSummary && (
          <section className="rounded-xl bg-primary/5 px-5 py-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Executive Takeaway
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {kpi.executiveSummary}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {language === 'de' ? 'Definition & Formel' : 'Definition & Context'}
          </h2>
          <p className="text-sm text-foreground leading-relaxed">{kpi.definition}</p>
          {kpi.formula && (
            <div className="bg-muted rounded px-3 py-2 mt-4">
              <code className="text-sm font-mono text-foreground leading-relaxed block">{kpi.formula}</code>
            </div>
          )}
        </section>

        {kpi.rootCauseDiagnostics && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              {language === 'de' ? 'Zentrale diagnostische Themen' : 'Key Diagnostic Themes'}
            </h2>
            <div className="space-y-3">
              {diagnosticRows.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-bold mr-1">{label}:</span>
                    {kpi.rootCauseDiagnostics?.[key]}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {displayedLevers.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              {language === 'de' ? 'Vorgeschlagene Verbesserungsideen' : 'Suggested Improvement Ideas'}
            </h2>
            <div className="space-y-3">
              {displayedLevers.map((lever, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/20 px-3 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-sm text-foreground leading-relaxed min-w-0">{lever}</p>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden sm:inline-flex">
                    {getImprovementTag(index, displayedLevers.length)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {kpi.unitOfMeasure && (
              <span><span className="font-medium">{language === 'de' ? 'Einheit' : 'Unit'}:</span> {kpi.unitOfMeasure}</span>
            )}
            <span><span className="font-medium">{language === 'de' ? 'Richtung' : 'Direction'}:</span> {directionLabel}</span>
            <span><span className="font-medium">{language === 'de' ? 'Referenztyp' : 'Reference Type'}:</span> {language === 'de' ? 'Branchenrichtwert' : 'Industry indicative'}</span>
            <span><span className="font-medium">{language === 'de' ? 'Bereich' : 'Scope'}:</span> {deptLabel}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
