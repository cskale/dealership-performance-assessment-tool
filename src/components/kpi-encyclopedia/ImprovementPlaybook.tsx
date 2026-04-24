import { cn } from "@/lib/utils";

interface ImprovementPlaybookProps {
  levers: string[];
  language: string;
  className?: string;
}

function getTag(index: number, total: number): { en: string; de: string } | null {
  if (total <= 3) return null;
  if (index < 2) return { en: 'Quick win', de: 'Quick Win' };
  if (index >= total - 1) return { en: 'Capability', de: 'Kompetenz' };
  return { en: 'Structural', de: 'Strukturell' };
}

export function ImprovementPlaybook({ levers, language, className }: ImprovementPlaybookProps) {
  const displayLevers = levers.slice(0, 7);

  return (
    <div className={cn("", className)}>
      <h2 className="text-sm font-semibold text-foreground mb-1.5">
        {language === 'de' ? 'Vorgeschlagene Verbesserungsideen' : 'Suggested Improvement Ideas'}
      </h2>
      <p className="text-sm text-muted-foreground/70 mb-8 leading-relaxed">
        {language === 'de'
          ? 'Praktische Maßnahmen, die üblicherweise zur Verbesserung dieses KPI eingesetzt werden.'
          : 'Practical actions commonly used to improve this KPI, ordered by typical impact.'}
      </p>

      <div className="space-y-2.5">
        {displayLevers.map((lever, i) => {
          const tag = getTag(i, displayLevers.length);
          return (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl px-5 py-4 bg-muted/20 hover:bg-muted/35 transition-colors duration-150"
            >
              <span className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-xs font-normal text-foreground shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="flex-1 text-sm font-normal text-foreground leading-relaxed min-w-0">{lever}</p>
              {tag && (
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0 mt-1 hidden sm:block">
                  {language === 'de' ? tag.de : tag.en}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
