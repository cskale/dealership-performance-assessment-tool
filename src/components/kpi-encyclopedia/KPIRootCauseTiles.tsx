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

interface KPIRootCauseTilesProps {
  diagnostics: Record<string, string>;
  language: string;
  mode?: 'compact' | 'expanded';
  className?: string;
}

export function KPIRootCauseTiles({ diagnostics, language, mode = 'compact', className }: KPIRootCauseTilesProps) {
  return (
    <div className={cn(
      mode === 'compact' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-3',
      className
    )}>
      {ROOT_CAUSE_DIMENSIONS.map((dim) => {
        const text = diagnostics[dim.key];
        if (!text) return null;
        const Icon = DIMENSION_ICONS[dim.key];
        const label = dim.label[language as 'en' | 'de'] || dim.label.en;

        return (
          <div
            key={dim.key}
            className={cn(
              "rounded-xl border p-3 transition-colors duration-150",
              dim.bgClass, dim.textClass,
              mode === 'compact' ? 'border-transparent' : 'border-transparent'
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn("p-1 rounded-md", dim.iconBgClass)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </div>
            <p className={cn(
              "text-xs leading-relaxed opacity-80",
              mode === 'compact' ? 'line-clamp-2' : ''
            )}>
              {text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
