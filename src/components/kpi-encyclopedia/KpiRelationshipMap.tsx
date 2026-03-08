import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight } from "lucide-react";

interface KpiRelationshipMapProps {
  interdependencies: {
    upstreamDrivers: string[];
    downstreamImpacts: string[];
  };
  kpiTitle: string;
  language: string;
  onNavigateToKpi: (name: string) => void;
  className?: string;
}

export function KpiRelationshipMap({ interdependencies, kpiTitle, language, onNavigateToKpi, className }: KpiRelationshipMapProps) {
  const hasUpstream = interdependencies.upstreamDrivers.length > 0;
  const hasDownstream = interdependencies.downstreamImpacts.length > 0;

  if (!hasUpstream && !hasDownstream) return null;

  return (
    <div className={cn("", className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {language === 'de' ? 'KPI-Einflussbereich' : 'KPI Influence Map'}
      </h3>
      <p className="text-[11px] text-muted-foreground/60 mb-5 max-w-2xl">
        {language === 'de'
          ? 'Diese Ansicht zeigt, welche Leistungsbereiche diesen KPI typischerweise beeinflussen und welche Geschäftsergebnisse davon betroffen sind.'
          : 'This view shows which performance areas typically shape this KPI and which business outcomes are commonly affected by it.'}
      </p>

      <div className="rounded-xl border border-border/40 bg-card p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">

          {/* Left: What influences */}
          {hasUpstream && (
            <div className="flex-1 lg:pr-5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                {language === 'de' ? 'Was diesen KPI beeinflusst' : 'What influences this KPI'}
              </span>
              <div className="space-y-1.5">
                {interdependencies.upstreamDrivers.map((driver, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigateToKpi(driver)}
                    className="w-full text-left flex items-center gap-2.5 text-xs text-foreground/80 rounded-lg px-3 py-2 bg-muted/30 border border-border/30 hover:border-border hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="truncate">{driver}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Center: current KPI */}
          <div className="flex items-center justify-center lg:px-5 lg:border-x border-border/30 shrink-0">
            <div className="flex flex-col items-center gap-2 py-3">
              {hasUpstream && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 rotate-0 lg:rotate-0 hidden lg:block" />
              )}
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 text-center">
                <span className="text-xs font-semibold text-foreground leading-tight block max-w-[140px]">
                  {kpiTitle}
                </span>
              </div>
              {hasDownstream && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 hidden lg:block" />
              )}
            </div>
          </div>

          {/* Right: What this KPI impacts */}
          {hasDownstream && (
            <div className="flex-1 lg:pl-5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                {language === 'de' ? 'Was dieser KPI beeinflusst' : 'What this KPI impacts'}
              </span>
              <div className="space-y-1.5">
                {interdependencies.downstreamImpacts.map((impact, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigateToKpi(impact)}
                    className="w-full text-left flex items-center gap-2.5 text-xs text-foreground/80 rounded-lg px-3 py-2 bg-muted/30 border border-border/30 hover:border-border hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="truncate">{impact}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Context note */}
        <p className="text-[9px] text-muted-foreground/50 mt-5 text-center italic">
          {language === 'de'
            ? 'Allgemeine Geschäftsergebnisse dieses KPIs umfassen Umsatzproduktivität, Bruttomarge, Kundenbindung und Kundenzufriedenheit.'
            : 'Common business outcomes linked to this KPI include revenue productivity, gross profit, retention, and customer experience.'}
        </p>
      </div>
    </div>
  );
}
