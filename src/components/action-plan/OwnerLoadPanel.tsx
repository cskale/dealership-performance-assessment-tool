import { useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionRecord } from "../ActionPlan";

interface OwnerLoadPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: ActionRecord[];
  onFilterByOwner: (owner: string) => void;
  activeOwnerFilter: string | null;
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

export function OwnerLoadPanel({ open, onOpenChange, actions, onFilterByOwner, activeOwnerFilter }: OwnerLoadPanelProps) {
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

    // Sort by total desc, Unassigned last
    return Array.from(map.values()).sort((a, b) => {
      if (a.name === 'Unassigned') return 1;
      if (b.name === 'Unassigned') return -1;
      return b.total - a.total;
    });
  }, [actions]);

  const maxActions = Math.max(...ownerStats.map(o => o.total), 1);
  const totalActions = actions.length;
  const overloadedCount = ownerStats.filter(o => o.total > 6 && o.name !== 'Unassigned').length;

  const getBarColor = (total: number) => {
    if (total <= 3) return 'bg-success';
    if (total <= 6) return 'bg-warning';
    return 'bg-destructive';
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel — centered dialog */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4"
        )}
      >
        <div
          className={cn(
            "bg-background border border-border rounded-xl shadow-2xl flex flex-col",
            "w-full max-w-md max-h-[80vh]",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
        {/* Header - sticky */}
        <div className="px-5 pt-5 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground">Owner Workload</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {ownerStats.length} owners · {totalActions} total actions
            {overloadedCount > 0 && <span className="text-destructive"> · {overloadedCount} overloaded</span>}
          </p>
        </div>

        {/* Body - scrollable */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-2">
            {ownerStats.map(owner => (
              <button
                key={owner.name}
                onClick={() => {
                  onFilterByOwner(owner.name);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm",
                  activeOwnerFilter === owner.name
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {owner.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{owner.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{owner.total} actions</span>
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
                  <span>Open: {owner.open}</span>
                  <span>Active: {owner.inProgress}</span>
                  {owner.overdue > 0 && <span className="text-destructive">⚠ Overdue: {owner.overdue}</span>}
                  <span>Done: {owner.completed}</span>
                </div>
              </button>
            ))}
            {ownerStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No actions to display.</p>
            )}
          </div>
        </ScrollArea>

        {/* Footer - sticky, shows active filter */}
        {activeOwnerFilter && (
          <div className="px-5 py-3 border-t flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Filtered:</span>
            <Badge variant="secondary" className="text-xs gap-1">
              {activeOwnerFilter}
              <button onClick={(e) => { e.stopPropagation(); onFilterByOwner(''); }} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
