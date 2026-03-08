import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImprovementPlaybookProps {
  levers: string[];
  language: string;
  className?: string;
}

function getTag(index: number, total: number): { en: string; de: string; variant: 'default' | 'secondary' | 'outline' } | null {
  if (total <= 3) return null;
  if (index < 2) return { en: 'Quick win', de: 'Quick Win', variant: 'secondary' };
  if (index >= total - 1) return { en: 'Capability', de: 'Kompetenz', variant: 'outline' };
  return { en: 'Structural', de: 'Strukturell', variant: 'outline' };
}

export function ImprovementPlaybook({ levers, language, className }: ImprovementPlaybookProps) {
  // Show max 7 levers
  const displayLevers = levers.slice(0, 7);

  return (
    <div className={cn("", className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {language === 'de' ? 'Vorgeschlagene Verbesserungsideen' : 'Suggested Improvement Ideas'}
      </h3>
      <p className="text-[11px] text-muted-foreground/60 mb-5">
        {language === 'de'
          ? 'Konsolidierte Maßnahmen zur Verbesserung der KPI-Leistung.'
          : 'Consolidated actions to improve KPI performance, prioritized by typical impact.'}
      </p>

      <div className="space-y-2">
        {displayLevers.map((lever, i) => {
          const tag = getTag(i, displayLevers.length);
          return (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm group"
            >
              <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{lever}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {tag && (
                  <Badge variant={tag.variant} className="text-[9px] font-normal px-1.5 py-0 h-5 hidden sm:inline-flex">
                    {language === 'de' ? tag.de : tag.en}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {language === 'de' ? 'Aktion' : 'Action'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
