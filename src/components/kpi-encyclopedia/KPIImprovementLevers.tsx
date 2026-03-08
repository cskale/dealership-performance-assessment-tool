import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface KPIImprovementLeversProps {
  levers: string[];
  language: string;
  mode?: 'compact' | 'full';
  className?: string;
}

export function KPIImprovementLevers({ levers, language, mode = 'full', className }: KPIImprovementLeversProps) {
  const displayLevers = mode === 'compact' ? levers.slice(0, 3) : levers;

  return (
    <div className={cn("space-y-2", className)}>
      {displayLevers.map((lever, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-xl p-3 transition-colors duration-150",
            i % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'
          )}
        >
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
          <p className="text-sm text-foreground flex-1 leading-relaxed">{lever}</p>
          {mode === 'full' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-primary shrink-0">
              <Plus className="h-3 w-3 mr-1" />
              {language === 'de' ? 'Aktion' : 'Action'}
            </Button>
          )}
        </div>
      ))}
      {mode === 'compact' && levers.length > 3 && (
        <p className="text-xs text-muted-foreground pl-9">
          +{levers.length - 3} {language === 'de' ? 'weitere Hebel' : 'more levers'}
        </p>
      )}
    </div>
  );
}
