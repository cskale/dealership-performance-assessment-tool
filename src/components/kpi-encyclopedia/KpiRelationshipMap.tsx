import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Link2 } from "lucide-react";
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

export function KpiRelationshipMap({ interdependencies, kpiTitle, language, onNavigateToKpi, className }: KpiRelationshipMapProps) {
  const hasUpstream = interdependencies.upstreamDrivers.length > 0;
  const hasDownstream = interdependencies.downstreamImpacts.length > 0;

  if (!hasUpstream && !hasDownstream) return null;

  return (
    <div className={cn("", className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {language === 'de' ? 'KPI-Beziehungen' : 'KPI Relationships'}
      </h3>

      {/* Horizontal flow layout */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">

          {/* Upstream drivers */}
          {hasUpstream && (
            <div className="flex-1 lg:pr-6">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === 'de' ? 'Vorgelagerte Treiber' : 'Upstream Drivers'}
                </span>
              </div>
              <div className="space-y-1.5">
                {interdependencies.upstreamDrivers.map((driver, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigateToKpi(driver)}
                    className="w-full text-left flex items-center gap-2.5 text-xs text-foreground/80 rounded-lg px-3 py-2 bg-blue-50/50 border border-blue-100/40 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                  >
                    <ArrowUpRight className="h-3 w-3 text-blue-400 shrink-0" />
                    <span className="truncate">{driver}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Center: current KPI */}
          <div className="flex items-center justify-center lg:px-6 lg:border-x border-border/40 shrink-0">
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center max-w-[140px] leading-tight">
                {kpiTitle}
              </span>
            </div>
          </div>

          {/* Downstream impacts */}
          {hasDownstream && (
            <div className="flex-1 lg:pl-6">
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownRight className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === 'de' ? 'Nachgelagerte Auswirkungen' : 'Downstream Impacts'}
                </span>
              </div>
              <div className="space-y-1.5">
                {interdependencies.downstreamImpacts.map((impact, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigateToKpi(impact)}
                    className="w-full text-left flex items-center gap-2.5 text-xs text-foreground/80 rounded-lg px-3 py-2 bg-amber-50/50 border border-amber-100/40 hover:border-amber-200 hover:bg-amber-50 transition-all duration-200"
                  >
                    <ArrowDownRight className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="truncate">{impact}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
