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
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {language === 'de' ? 'Zentrale Diagnosethemen' : 'Key Diagnostic Themes'}
      </h2>
      <p className="text-sm text-muted-foreground/60 mb-6">
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

          // First sentence or max ~100 chars for consistent card heights
          const dotIndex = text.indexOf('.', 30);
          const shortText = dotIndex > 0 && dotIndex < 110
            ? text.slice(0, dotIndex + 1)
            : text.length > 100
              ? text.slice(0, text.lastIndexOf(' ', 100)) + '.'
              : text;

          return (
            <div
              key={dim.key}
              className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", dim.iconBgClass)}>
                  <Icon className={cn("h-4 w-4", dim.textClass)} />
                </div>
                <span className={cn("text-xs font-semibold", dim.textClass)}>{label}</span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed flex-1">
                {shortText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
