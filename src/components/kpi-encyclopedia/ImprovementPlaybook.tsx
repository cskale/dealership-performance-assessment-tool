import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Target, TrendingUp } from "lucide-react";

interface ImprovementPlaybookProps {
  levers: string[];
  language: string;
  className?: string;
}

function categorizeLevers(levers: string[]) {
  // Simple heuristic grouping: first 2 = quick wins, middle = core fixes, last = strategic
  if (levers.length <= 3) {
    return [{ group: 'actions', levers, icon: Target }];
  }

  const quickWins = levers.slice(0, 2);
  const coreFixes = levers.slice(2, Math.max(4, levers.length - 1));
  const strategic = levers.slice(Math.max(4, levers.length - 1));

  const groups = [];
  if (quickWins.length > 0) groups.push({ group: 'quick-wins', levers: quickWins, icon: Zap });
  if (coreFixes.length > 0) groups.push({ group: 'core-fixes', levers: coreFixes, icon: Target });
  if (strategic.length > 0) groups.push({ group: 'strategic', levers: strategic, icon: TrendingUp });
  return groups;
}

const GROUP_LABELS: Record<string, { en: string; de: string }> = {
  'quick-wins': { en: 'Quick Wins', de: 'Schnelle Erfolge' },
  'core-fixes': { en: 'Core Fixes', de: 'Kernmaßnahmen' },
  'strategic': { en: 'Strategic Enablers', de: 'Strategische Hebel' },
  'actions': { en: 'Improvement Levers', de: 'Verbesserungshebel' },
};

export function ImprovementPlaybook({ levers, language, className }: ImprovementPlaybookProps) {
  const groups = categorizeLevers(levers);
  let globalIndex = 0;

  return (
    <div className={cn("", className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {language === 'de' ? 'Verbesserungs-Playbook' : 'Improvement Playbook'}
      </h3>

      <div className="space-y-6">
        {groups.map((group) => {
          const GroupIcon = group.icon;
          const groupLabel = GROUP_LABELS[group.group]?.[language as 'en' | 'de'] || GROUP_LABELS[group.group]?.en || group.group;

          return (
            <div key={group.group}>
              {groups.length > 1 && (
                <div className="flex items-center gap-2 mb-3">
                  <GroupIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {groupLabel}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {group.levers.map((lever) => {
                  globalIndex++;
                  const idx = globalIndex;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-sm group"
                    >
                      <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {idx}
                      </span>
                      <p className="text-sm text-foreground flex-1 leading-relaxed pt-0.5">{lever}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {language === 'de' ? 'Aktion' : 'Action'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
