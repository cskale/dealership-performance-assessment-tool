import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

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

function getUpstreamTag(driver: string): { en: string; de: string } {
  const d = driver.toLowerCase();
  if (d.includes('lead') || d.includes('traffic') || d.includes('enquir')) return { en: 'Input KPI', de: 'Input-KPI' };
  if (d.includes('process') || d.includes('follow') || d.includes('response')) return { en: 'Process driver', de: 'Prozesstreiber' };
  if (d.includes('satisfaction') || d.includes('experience') || d.includes('nps') || d.includes('csi')) return { en: 'Experience factor', de: 'Erlebnisfaktor' };
  return { en: 'Operational factor', de: 'Operativer Faktor' };
}

function getDownstreamTag(impact: string): { en: string; de: string } {
  const d = impact.toLowerCase();
  if (d.includes('revenue') || d.includes('profit') || d.includes('margin') || d.includes('financial')) return { en: 'Financial outcome', de: 'Finanzergebnis' };
  if (d.includes('satisfaction') || d.includes('experience') || d.includes('nps') || d.includes('loyalty')) return { en: 'Customer outcome', de: 'Kundenergebnis' };
  if (d.includes('retention') || d.includes('churn') || d.includes('repeat')) return { en: 'Retention outcome', de: 'Bindungsergebnis' };
  if (d.includes('oem') || d.includes('brand') || d.includes('standard')) return { en: 'OEM/brand outcome', de: 'OEM/Markenergebnis' };
  return { en: 'Productivity outcome', de: 'Produktivitätsergebnis' };
}

export function KpiRelationshipMap({ interdependencies, kpiTitle, language, onNavigateToKpi, className }: KpiRelationshipMapProps) {
  const hasUpstream = interdependencies.upstreamDrivers.length > 0;
  const hasDownstream = interdependencies.downstreamImpacts.length > 0;

  if (!hasUpstream && !hasDownstream) return null;

  return (
    <div className={cn("", className)}>
      <h2 className="text-sm font-semibold text-foreground mb-1.5">
        {language === 'de' ? 'Performance-Einflussrahmen' : 'Performance Influence Framework'}
      </h2>
      <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl leading-relaxed">
        {language === 'de'
          ? 'Diese Ansicht zeigt die wesentlichen Treiber, die diesen KPI typischerweise formen, und die Geschäftsergebnisse, die davon betroffen sind.'
          : 'This view outlines the main drivers that typically shape this KPI and the business outcomes commonly affected by it.'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Left: Likely drivers */}
        {hasUpstream && (
          <div className="min-w-0 overflow-hidden">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-4">
              {language === 'de' ? 'Wahrscheinliche Treiber' : 'Likely drivers'}
            </span>
            <div className="space-y-2">
              {interdependencies.upstreamDrivers.map((driver, i) => {
                const tag = getUpstreamTag(driver);
                return (
                  <button
                    key={i}
                    onClick={() => onNavigateToKpi(driver)}
                    className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 bg-muted/25 hover:bg-muted/50 transition-colors duration-150 group overflow-hidden"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="flex-1 text-sm text-foreground/80 truncate min-w-0">{driver}</span>
                    <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider shrink-0 hidden sm:block">
                      {language === 'de' ? tag.de : tag.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Center: Core KPI */}
        <div className="flex items-center justify-center lg:py-8">
          <div className="flex flex-col items-center gap-2">
            {hasUpstream && (
              <div className="hidden lg:flex items-center gap-1 text-muted-foreground/20">
                <span className="text-xs">→</span>
              </div>
            )}
            <div className="rounded-xl border-2 border-primary/15 bg-primary/[0.03] px-6 py-5 text-center w-[180px]">
              <span className="text-[10px] font-semibold text-primary/50 uppercase tracking-wider block mb-1.5">
                {language === 'de' ? 'Kern-KPI' : 'Core KPI'}
              </span>
              <span className="text-sm font-bold text-foreground leading-tight block">
                {kpiTitle}
              </span>
            </div>
            {hasDownstream && (
              <div className="hidden lg:flex items-center gap-1 text-muted-foreground/20">
                <span className="text-xs">→</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Likely consequences */}
        {hasDownstream && (
          <div className="min-w-0 overflow-hidden">
            <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider block mb-4">
              {language === 'de' ? 'Wahrscheinliche Auswirkungen' : 'Likely consequences'}
            </span>
            <div className="space-y-2">
              {interdependencies.downstreamImpacts.map((impact, i) => {
                const tag = getDownstreamTag(impact);
                return (
                  <button
                    key={i}
                    onClick={() => onNavigateToKpi(impact)}
                    className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 bg-muted/25 hover:bg-muted/50 transition-colors duration-150 group overflow-hidden"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 group-hover:text-primary transition-colors" />
                    <span className="flex-1 text-sm text-foreground/80 truncate min-w-0">{impact}</span>
                    <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider shrink-0 hidden sm:block">
                      {language === 'de' ? tag.de : tag.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Context note */}
      <p className="text-[11px] text-muted-foreground/40 mt-8 leading-relaxed">
        {language === 'de'
          ? 'Allgemeine Geschäftsergebnisse dieses KPIs umfassen Umsatzproduktivität, Bruttomarge, Kundenbindung und Kundenzufriedenheit.'
          : 'Common business outcomes linked to this KPI include revenue productivity, gross profit, retention, and customer experience.'}
      </p>
    </div>
  );
}
