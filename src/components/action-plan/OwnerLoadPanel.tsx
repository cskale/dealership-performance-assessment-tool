import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActionRecord } from "../ActionPlan";

interface OwnerLoadPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: ActionRecord[];
  onFilterByOwner: (owner: string) => void;
}

function isOverdue(action: ActionRecord): boolean {
  if (!action.target_completion_date || action.status === 'Completed') return false;
  return new Date(action.target_completion_date) < new Date(new Date().toDateString());
}

interface OwnerStats {
  name: string;
  initials: string;
  total: number;
  open: number;
  inProgress: number;
  overdue: number;
  completed: number;
}

export function OwnerLoadPanel({ open, onOpenChange, actions, onFilterByOwner }: OwnerLoadPanelProps) {
  const ownerStats = useMemo(() => {
    const map = new Map<string, OwnerStats>();

    actions.forEach(a => {
      const owner = a.responsible_person || 'Unassigned';
      if (!map.has(owner)) {
        const initials = owner === 'Unassigned' ? '?' : owner.split(' ').map(n => n[0]).join('').slice(0, 2);
        map.set(owner, { name: owner, initials, total: 0, open: 0, inProgress: 0, overdue: 0, completed: 0 });
      }
      const stats = map.get(owner)!;
      stats.total++;
      if (a.status === 'Open') stats.open++;
      else if (a.status === 'In Progress') stats.inProgress++;
      else if (a.status === 'Completed') stats.completed++;
      if (isOverdue(a)) stats.overdue++;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [actions]);

  const maxActions = Math.max(...ownerStats.map(o => o.total), 1);
  const totalActions = actions.length;
  const overloadedCount = ownerStats.filter(o => o.total > 6).length;

  const getBarColor = (total: number) => {
    if (total <= 3) return 'bg-success';
    if (total <= 6) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-sm p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-base">Owner Workload</SheetTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {totalActions} total actions · {overloadedCount > 0 ? `${overloadedCount} overloaded` : 'No overloaded owners'}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {ownerStats.map(owner => (
            <button
              key={owner.name}
              onClick={() => onFilterByOwner(owner.name)}
              className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {owner.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{owner.name}</p>
                  <p className="text-xs text-muted-foreground">{owner.total} actions</p>
                </div>
              </div>
              {/* Bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getBarColor(owner.total))}
                  style={{ width: `${(owner.total / maxActions) * 100}%` }}
                />
              </div>
              {/* Stats */}
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>{owner.open} Open</span>
                <span>{owner.inProgress} Active</span>
                {owner.overdue > 0 && <span className="text-destructive">{owner.overdue} Overdue</span>}
                <span>{owner.completed} Done</span>
              </div>
            </button>
          ))}
          {ownerStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No actions to display.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
