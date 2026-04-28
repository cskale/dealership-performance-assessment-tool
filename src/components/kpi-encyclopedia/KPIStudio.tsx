import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { getDepartmentConfig } from "@/lib/departmentConfig";
import type { KPIDefinition } from "@/lib/kpiDefinitions";

interface KPIStudioProps {
  kpiKey: string;
  kpi: KPIDefinition;
  departmentKey: string;
  language: string;
  onBack?: () => void;
  onNavigateToKpi?: (name: string) => void;
}

const diagnosticRows = [
  { key: "people", label: { en: "People", de: "Menschen" } },
  { key: "process", label: { en: "Process", de: "Prozess" } },
  { key: "tools", label: { en: "Tools", de: "Tools" } },
  { key: "structure", label: { en: "Structure", de: "Struktur" } },
  { key: "incentives", label: { en: "Incentives", de: "Anreize" } },
] as const;

function getImprovementTag(index: number, language: string) {
  if (index < 2) {
    return {
      label: language === "de" ? "Schneller Gewinn" : "Quick win",
      className: "bg-primary/10 text-primary border-primary/20",
    };
  }

  if (index < 5) {
    return {
      label: language === "de" ? "Strukturell" : "Structural",
      className: "bg-secondary text-secondary-foreground border-border/60",
    };
  }

  return {
    label: language === "de" ? "Fähigkeit" : "Capability",
    className: "bg-muted text-muted-foreground border-border/60",
  };
}

const BENCHMARK_GOOD_TO_BAD = ["bg-[#1D9E75]", "bg-[#97C459]", "bg-[#FAC775]", "bg-[#F0997B]"];
const BENCHMARK_BAD_TO_GOOD = [...BENCHMARK_GOOD_TO_BAD].reverse();

function getUpstreamTag(driver: string, language: string) {
  const d = driver.toLowerCase();
  if (d.includes("lead") || d.includes("traffic") || d.includes("enquir")) return language === "de" ? "Input-KPI" : "Input KPI";
  if (d.includes("process") || d.includes("follow") || d.includes("response")) return language === "de" ? "Prozesstreiber" : "Process driver";
  if (d.includes("satisfaction") || d.includes("experience") || d.includes("nps") || d.includes("csi")) return language === "de" ? "Erlebnisfaktor" : "Experience factor";
  return language === "de" ? "Operativer Faktor" : "Operational factor";
}

function getDownstreamTag(impact: string, language: string) {
  const d = impact.toLowerCase();
  if (d.includes("revenue") || d.includes("profit") || d.includes("margin") || d.includes("financial")) return language === "de" ? "Finanzergebnis" : "Financial outcome";
  if (d.includes("satisfaction") || d.includes("experience") || d.includes("nps") || d.includes("loyalty")) return language === "de" ? "Kundenergebnis" : "Customer outcome";
  if (d.includes("retention") || d.includes("churn") || d.includes("repeat")) return language === "de" ? "Bindungsergebnis" : "Retention outcome";
  if (d.includes("oem") || d.includes("brand") || d.includes("standard")) return language === "de" ? "OEM-/Markenergebnis" : "OEM/brand outcome";
  return language === "de" ? "Produktivitätsergebnis" : "Productivity outcome";
}

const labels = {
  en: {
    back: "Back",
    definition: "Definition",
    formula: "Formula",
    whyThisMatters: "Why this matters",
    referenceType: "Industry indicative",
    referenceBenchmark: "Reference benchmark",
    industryLeading: "Industry leading threshold",
    conversionUplift: "Conversion uplift at 1 min",
    delayedResponse: "vs. any delayed response",
    effectivenessLoss: "Effectiveness loss at 30 min",
    immediateResponse: "vs. immediate response",
    complianceRate: "Industry compliance rate",
    dealersBenchmark: "dealers meeting benchmark",
    benchmarkPosition: "Benchmark position",
    referenceCorridor: "Reference corridor",
    leading: "Leading · <5 min",
    strong: "Strong · 5–15 min",
    belowReference: "Below reference · 15–60 min",
    developing: "Developing · >60 min",
    diagnosticThemes: "Diagnostic themes",
    improvementActions: "Improvement actions",
    inclusions: "Inclusions",
    exclusions: "Exclusions",
    influenceFramework: "Performance influence framework",
    likelyDrivers: "Likely drivers",
    likelyConsequences: "Likely consequences",
    coreKpi: "Core KPI",
    lowerBetter: "Lower is better",
    higherBetter: "Higher is better",
  },
  de: {
    back: "Zurück",
    definition: "Definition",
    formula: "Formel",
    whyThisMatters: "Warum das wichtig ist",
    referenceType: "Branchenrichtwert",
    referenceBenchmark: "Referenz-Benchmark",
    industryLeading: "Schwelle für Branchenführer",
    conversionUplift: "Conversion-Uplift bei 1 Min.",
    delayedResponse: "ggü. verzögerter Antwort",
    effectivenessLoss: "Effektivitätsverlust bei 30 Min.",
    immediateResponse: "ggü. sofortiger Antwort",
    complianceRate: "Branchen-Compliance-Rate",
    dealersBenchmark: "Händler erreichen Benchmark",
    benchmarkPosition: "Benchmark-Position",
    referenceCorridor: "Referenzkorridor",
    leading: "Führend · <5 Min.",
    strong: "Stark · 5–15 Min.",
    belowReference: "Unter Referenz · 15–60 Min.",
    developing: "In Entwicklung · >60 Min.",
    diagnosticThemes: "Diagnostische Themen",
    improvementActions: "Verbesserungsmaßnahmen",
    inclusions: "Einschlüsse",
    exclusions: "Ausschlüsse",
    influenceFramework: "Performance-Einflussrahmen",
    likelyDrivers: "Wahrscheinliche Treiber",
    likelyConsequences: "Wahrscheinliche Auswirkungen",
    coreKpi: "Kern-KPI",
    lowerBetter: "Niedriger ist besser",
    higherBetter: "Höher ist besser",
  },
};

export function KPIStudio({ kpiKey, kpi, departmentKey, language, onBack, onNavigateToKpi }: KPIStudioProps) {
  const t = labels[language === "de" ? "de" : "en"];
  const config = getDepartmentConfig(departmentKey);
  const DeptIcon = config.icon;
  const deptLabel = config.label[language as "en" | "de"] || config.label.en;

  const isLeadResponseTime = kpiKey === "leadResponseTime";
  const isLowerBetter = kpi.benchmark?.includes("<") ||
    kpi.unitOfMeasure?.toLowerCase()?.includes("minute") ||
    kpi.unitOfMeasure?.toLowerCase()?.includes("day");
  const directionLabel = isLowerBetter ? t.lowerBetter : t.higherBetter;
  const benchmarkSegments = isLowerBetter ? BENCHMARK_GOOD_TO_BAD : BENCHMARK_BAD_TO_GOOD;
  const hasInterdependencies = !!(
    kpi.interdependencies &&
    (kpi.interdependencies.upstreamDrivers.length > 0 || kpi.interdependencies.downstreamImpacts.length > 0)
  );

  return (
    <div className="max-h-[88vh] overflow-y-auto bg-card text-foreground [font-family:Roboto,sans-serif]">
      {onBack && (
        <div className="border-b border-border/30 px-8 py-3 sm:px-10 lg:px-14">
          <Button variant="ghost" onClick={onBack} className="h-8 px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t.back}
          </Button>
        </div>
      )}

      <section className="border-b border-border/30 px-8 py-9 sm:px-10 lg:px-14">
        <div className="max-w-5xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-[1.5px] w-6 bg-[#1D9E75]" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#1D9E75]">{deptLabel}</span>
          </div>

          <h1 className="mb-4 text-h2 font-bold tracking-tight text-foreground">{kpi.title}</h1>

          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", config.bgClass, config.textClass, config.borderClass)}>
              <DeptIcon className="mr-1 h-3 w-3" />
              {deptLabel}
            </Badge>
            {kpi.unitOfMeasure && (
              <Badge variant="outline" className="rounded-full border-border/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {kpi.unitOfMeasure}
              </Badge>
            )}
            <Badge variant="outline" className="rounded-full border-border/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {directionLabel}
            </Badge>
            <Badge variant="outline" className="rounded-full border-border/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {t.referenceType}
            </Badge>
          </div>

          <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">
            {t.definition}
          </span>
          <p className="max-w-4xl text-body-md leading-relaxed text-muted-foreground">{kpi.definition}</p>
        </div>
      </section>

      <section className="space-y-6 border-b border-border/30 px-8 py-7 sm:px-10 lg:px-14">
        <div className="max-w-5xl">
          {kpi.formula && (
            <div className="mb-5">
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">
                {t.formula}
              </span>
              <code className="block rounded-lg border border-border/30 bg-muted/25 p-4 font-mono text-sm leading-relaxed text-foreground">
                {kpi.formula}
              </code>
            </div>
          )}

          <div className="rounded-lg border border-primary/10 bg-primary/5 p-5">
            <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.09em] text-primary/60">
              {t.whyThisMatters}
            </span>
            <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
              {kpi.executiveSummary || kpi.whyItMatters}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border/30 px-8 py-7 sm:px-10 lg:px-14">
        <div className="mb-4">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">{t.benchmarkPosition}</span>
          <p className="text-sm text-muted-foreground">
            {t.referenceCorridor}: {kpi.benchmark || "—"} · {directionLabel}
          </p>
        </div>
        <div className="grid h-2 grid-cols-4 gap-[3px]">
          {benchmarkSegments.map((segmentClass, index) => (
            <span key={index} className={cn("rounded-[4px]", segmentClass)} />
          ))}
        </div>
        {isLeadResponseTime && (
          <div className="mt-3 grid grid-cols-4 gap-[3px] text-[10px] font-medium text-muted-foreground/70">
            <span>{t.leading}</span>
            <span>{t.strong}</span>
            <span>{t.belowReference}</span>
            <span>{t.developing}</span>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 border-b border-border/30 lg:grid-cols-2">
        <div className="border-r border-border/30 px-10 py-7">
          <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">{t.diagnosticThemes}</span>
          <div>
            {kpi.rootCauseDiagnostics ? (
              diagnosticRows.map((row) => (
                <div key={row.key} className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 border-b border-border/20 py-3 last:border-b-0">
                  <span className="text-sm font-medium text-foreground">{row.label[language === "de" ? "de" : "en"]}</span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{kpi.rootCauseDiagnostics?.[row.key]}</p>
                </div>
              ))
            ) : (
              <>
                {kpi.inclusions && (
                  <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 border-b border-border/20 py-3">
                    <span className="text-sm font-medium text-foreground">{t.inclusions}</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{kpi.inclusions.join("; ")}</p>
                  </div>
                )}
                {kpi.exclusions && (
                  <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 border-b border-border/20 py-3 last:border-b-0">
                    <span className="text-sm font-medium text-foreground">{t.exclusions}</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{kpi.exclusions.join("; ")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-10 py-7">
          <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">{t.improvementActions}</span>
          <div>
            {kpi.improvementLevers?.map((lever, index) => {
              const tag = getImprovementTag(index, language);
              return (
                <div key={lever} className="flex items-start gap-3 border-b border-border/20 py-3 last:border-b-0">
                  <span className="w-4 shrink-0 text-xs text-muted-foreground/50">{index + 1}</span>
                  <p className="flex-1 text-sm leading-relaxed text-foreground">{lever}</p>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", tag.className)}>
                    {tag.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {hasInterdependencies && (
        <section className="bg-muted/20 px-10 py-7">
          <span className="mb-5 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">{t.influenceFramework}</span>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_140px_1fr]">
            <div>
              <h2 className="mb-3 text-sm font-medium text-foreground">{t.likelyDrivers}</h2>
              <div className="space-y-2">
                {kpi.interdependencies?.upstreamDrivers.map((driver) => (
                  <button
                    key={driver}
                    type="button"
                    onClick={() => onNavigateToKpi?.(driver)}
                    className="hover-lift flex w-full items-center gap-2 rounded-r-md border border-l-2 border-border/30 border-l-[#1D9E75] bg-card p-2 text-left"
                  >
                    <span className="flex-1 text-sm text-muted-foreground">{driver}</span>
                    <span className="text-[10px] text-muted-foreground/50">{getUpstreamTag(driver, language)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="self-center rounded-xl border border-border/40 p-4 text-center">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground/60">{t.coreKpi}</span>
              <span className="block text-sm font-medium text-foreground">{kpi.title}</span>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-medium text-foreground">{t.likelyConsequences}</h2>
              <div className="space-y-2">
                {kpi.interdependencies?.downstreamImpacts.map((impact) => (
                  <button
                    key={impact}
                    type="button"
                    onClick={() => onNavigateToKpi?.(impact)}
                    className="hover-lift flex w-full items-center gap-2 rounded-l-md border border-r-2 border-border/30 border-r-[#F0997B] bg-card p-2 text-left"
                  >
                    <span className="flex-1 text-sm text-muted-foreground">{impact}</span>
                    <span className="text-[10px] text-muted-foreground/50">{getDownstreamTag(impact, language)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
