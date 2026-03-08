import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

// Classification heuristics for upstream items
function getUpstreamTag(driver: string): { en: string; de: string } {
  const d = driver.toLowerCase();
  if (d.includes('lead') || d.includes('traffic') || d.includes('enquir')) return { en: 'Input KPI', de: 'Input-KPI' };
  if (d.includes('process') || d.includes('follow') || d.includes('response')) return { en: 'Process driver', de: 'Prozesstreiber' };
  if (d.includes('satisfaction') || d.includes('experience') || d.includes('nps') || d.includes('csi')) return { en: 'Experience driver', de: 'Erlebnistreiber' };
  return { en: 'Operational factor', de: 'Operativer Faktor' };
}

// Classification heuristics for downstream items
function getDownstreamTag(impact: string): { en: string; de: string } {
  const d = impact.toLowerCase();
  if (d.includes('revenue') || d.includes('profit') || d.includes('margin') || d.includes('financial')) return { en: 'Financial outcome', de: 'Finanzergebnis' };
  if (d.includes('satisfaction') || d.includes('experience') || d.includes('nps') || d.includes('loyalty')) return { en: 'Customer outcome', de: 'Kundenergebnis' };
  if (d.includes('retention') || d.includes('churn') || d.includes('repeat')) return { en: 'Retention outcome', de: 'Bindungsergebnis' };
  if (d.includes('oem') || d.includes('brand') || d.includes('standard')) return { en: 'OEM/brand outcome', de: 'OEM/Markenergebnis' };
  return { en: 'Business outcome', de: 'Geschäftsergebnis' };
}

export function KpiRelationshipMap({ interdependencies, kpiTitle, language, onNavigateToKpi, className }: KpiRelationshipMapProps) {
  const hasUpstream = interdependencies.upstreamDrivers.length > 0;
  const hasDownstream = interdependencies.downstreamImpacts.length > 0;

  if (!hasUpstream && !hasDownstream) return null;

  return (
    <div className={cn("", className)}>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {language === 'de' ? 'KPI-Einflussbereich' : 'KPI Influence Map'}
      </h2>
      <p className="text-sm text-muted-foreground/60 mb-6 max-w-2xl">
        {language === 'de'
          ? 'Diese Ansicht zeigt, welche Leistungsbereiche diesen KPI typischerweise beeinflussen und welche Geschäftsergebnisse davon betroffen sind.'
          : 'This view shows which performance areas typically shape this KPI and which business outcomes are commonly affected by it.'}
      </p>

      <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0">

          {/* Left: What influences */}
          {hasUpstream && (
            <div className="flex-1 lg:pr-8">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-4">
                {language === 'de' ? 'Was diesen KPI beeinflusst' : 'What influences this KPI'}
              </span>
              <div className="space-y-2.5">
                {interdependencies.upstreamDrivers.map((driver, i) => {
                  const tag = getUpstreamTag(driver);
                  return (
                    <button
                      key={i}
                      onClick={() => onNavigateToKpi(driver)}
                      className="w-full text-left flex items-center gap-3 text-sm text-foreground/80 rounded-xl px-4 py-3 bg-muted/30 border border-border/40 hover:border-border/70 hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                      <span className="flex-1 truncate">{driver}</span>
                      <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-5 text-muted-foreground/60 border-border/40 shrink-0 hidden sm:inline-flex">
                        {language === 'de' ? tag.de : tag.en}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Center: current KPI */}
          <div className="flex items-center justify-center lg:px-6 lg:border-x border-border/30 shrink-0">
            <div className="flex flex-col items-center gap-3 py-4">
              {hasUpstream && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/25 hidden lg:block" />
              )}
              <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.04] px-6 py-4 text-center min-w-[160px]">
                <span className="text-sm font-bold text-foreground leading-tight block">
                  {kpiTitle}
                </span>
                <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                  {language === 'de' ? 'Aktueller KPI' : 'Current KPI'}
                </span>
              </div>
              {hasDownstream && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/25 hidden lg:block" />
              )}
            </div>
          </div>

          {/* Right: What this KPI impacts */}
          {hasDownstream && (
            <div className="flex-1 lg:pl-8">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-4">
                {language === 'de' ? 'Was dieser KPI beeinflusst' : 'What this KPI impacts'}
              </span>
              <div className="space-y-2.5">
                {interdependencies.downstreamImpacts.map((impact, i) => {
                  const tag = getDownstreamTag(impact);
                  return (
                    <button
                      key={i}
                      onClick={() => onNavigateToKpi(impact)}
                      className="w-full text-left flex items-center gap-3 text-sm text-foreground/80 rounded-xl px-4 py-3 bg-muted/30 border border-border/40 hover:border-border/70 hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                      <span className="flex-1 truncate">{impact}</span>
                      <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-5 text-muted-foreground/60 border-border/40 shrink-0 hidden sm:inline-flex">
                        {language === 'de' ? tag.de : tag.en}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Context note */}
        <p className="text-[11px] text-muted-foreground/50 mt-6 text-center leading-relaxed border-t border-border/30 pt-4">
          {language === 'de'
            ? 'Allgemeine Geschäftsergebnisse dieses KPIs umfassen Umsatzproduktivität, Bruttomarge, Kundenbindung und Kundenzufriedenheit.'
            : 'Common business outcomes linked to this KPI include revenue productivity, gross profit, retention, and customer experience.'}
        </p>
      </div>
    </div>
  );
}
