import { UserCheck, Settings, Wrench, Building2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROOT_CAUSE_DIMENSIONS } from "@/lib/departmentConfig";
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
      <h2 className="text-h5 text-foreground mb-1.5">
        {language === 'de' ? 'Zentrale Diagnosethemen' : 'Key Diagnostic Themes'}
      </h2>
      <p className="text-body-md text-muted-foreground/70 mb-8 leading-relaxed">
        {language === 'de'
          ? 'Die wiederkehrenden Dimensionen, die die Varianz dieses KPI typischerweise erklären.'
          : 'The recurring dimensions that typically explain variance in this KPI.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ROOT_CAUSE_DIMENSIONS.map((dim) => {
          const text = diagnostics[dim.key];
          if (!text) return null;
          const Icon = DIMENSION_ICONS[dim.key];
          const label = dim.label[language as 'en' | 'de'] || dim.label.en;

          return (
            <div
              key={dim.key}
              className="rounded-xl bg-muted/20 p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", dim.iconBgClass)}>
                  <Icon className={cn("h-3.5 w-3.5", dim.textClass)} />
                </div>
                <span className={cn("text-label font-medium", dim.textClass)}>{label}</span>
              </div>
              <p className="text-body-md text-foreground/65 leading-relaxed flex-1">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
