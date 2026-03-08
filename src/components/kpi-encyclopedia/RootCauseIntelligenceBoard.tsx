import { UserCheck, Settings, Wrench, Building2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROOT_CAUSE_DIMENSIONS } from "./departmentConfig";
import type { LucideIcon } from "lucide-react";

const DIMENSION_ICONS: Record<string, LucideIcon> = {
  people: UserCheck,
  process: Settings,
  tools: Wrench,
  structure: Building2,
  incentives: Coins,
};

interface RootCauseIntelligenceBoardProps {
  diagnostics: Record<string, string>;
  language: string;
  className?: string;
}

export function RootCauseIntelligenceBoard({ diagnostics, language, className }: RootCauseIntelligenceBoardProps) {
  return (
    <div className={cn("", className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {language === 'de' ? 'Zentrale Diagnosethemen' : 'Key Diagnostic Themes'}
      </h3>
      <p className="text-[11px] text-muted-foreground/60 mb-5">
        {language === 'de'
          ? 'Fünf Dimensionen, die die KPI-Leistung typischerweise beeinflussen.'
          : 'Five dimensions that typically shape this KPI\'s performance.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ROOT_CAUSE_DIMENSIONS.map((dim) => {
          const text = diagnostics[dim.key];
          if (!text) return null;
          const Icon = DIMENSION_ICONS[dim.key];
          const label = dim.label[language as 'en' | 'de'] || dim.label.en;

          // Truncate to first sentence or ~120 chars for consistency
          const shortText = text.length > 120
            ? text.slice(0, text.indexOf(',', 60) > 0 ? text.indexOf(',', 60) : 120) + '…'
            : text;

          return (
            <div
              key={dim.key}
              className="rounded-xl border border-border/40 bg-card p-4 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", dim.iconBgClass)}>
                  <Icon className={cn("h-3.5 w-3.5", dim.textClass)} />
                </div>
                <span className={cn("text-xs font-semibold", dim.textClass)}>{label}</span>
              </div>
              <p className="text-[11px] text-foreground/70 leading-relaxed">
                {shortText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
