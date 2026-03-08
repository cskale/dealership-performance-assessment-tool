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
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {language === 'de' ? 'Ursachendiagnostik' : 'Root Cause Intelligence'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROOT_CAUSE_DIMENSIONS.map((dim) => {
          const text = diagnostics[dim.key];
          if (!text) return null;
          const Icon = DIMENSION_ICONS[dim.key];
          const label = dim.label[language as 'en' | 'de'] || dim.label.en;

          return (
            <div
              key={dim.key}
              className={cn(
                "rounded-2xl border border-border/40 p-5 transition-all duration-200 hover:shadow-sm",
                dim.bgClass
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", dim.iconBgClass)}>
                  <Icon className={cn("h-4 w-4", dim.textClass)} />
                </div>
                <span className={cn("text-sm font-semibold", dim.textClass)}>{label}</span>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
