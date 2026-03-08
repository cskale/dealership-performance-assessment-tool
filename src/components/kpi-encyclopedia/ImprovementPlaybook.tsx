import { cn } from "@/lib/utils";
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
  const displayLevers = levers.slice(0, 7);

  return (
    <div className={cn("", className)}>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {language === 'de' ? 'Vorgeschlagene Verbesserungsideen' : 'Suggested Improvement Ideas'}
      </h2>
      <p className="text-sm text-muted-foreground/60 mb-6">
        {language === 'de'
          ? 'Konsolidierte Maßnahmen zur Verbesserung der KPI-Leistung.'
          : 'Consolidated actions to improve KPI performance, prioritized by typical impact.'}
      </p>

      <div className="space-y-3">
        {displayLevers.map((lever, i) => {
          const tag = getTag(i, displayLevers.length);
          return (
            <div
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card px-5 py-4 transition-all duration-200 hover:border-border/80 hover:shadow-sm"
            >
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted text-muted-foreground text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{lever}</p>
              </div>
              {tag && (
                <Badge variant={tag.variant} className="text-[10px] font-normal px-2 py-0.5 h-auto shrink-0 hidden sm:inline-flex">
                  {language === 'de' ? tag.de : tag.en}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
