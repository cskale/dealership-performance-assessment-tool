import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Diamond, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addWeeks, eachDayOfInterval, isSameDay, differenceInDays, isWithinInterval } from 'date-fns';
import type { ActionRecord } from '../ActionPlan';

interface TimelineViewProps {
  actions: ActionRecord[];
  onActionClick: (action: ActionRecord) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-muted-foreground/40',
  'In Progress': 'bg-amber-500',
  'Completed': 'bg-green-500',
};

function isOverdue(a: ActionRecord): boolean {
  if (!a.target_completion_date || a.status === 'Completed') return false;
  return new Date(a.target_completion_date) < new Date(new Date().toDateString());
}

export function TimelineView({ actions, onActionClick }: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const { rangeStart, rangeEnd, days } = useMemo(() => {
    let s: Date, e: Date;
    if (viewMode === 'month') {
      s = startOfMonth(currentDate);
      e = endOfMonth(currentDate);
    } else {
      s = startOfWeek(currentDate, { weekStartsOn: 1 });
      e = endOfWeek(currentDate, { weekStartsOn: 1 });
    }
    return { rangeStart: s, rangeEnd: e, days: eachDayOfInterval({ start: s, end: e }) };
  }, [currentDate, viewMode]);

  const navigate = (dir: number) => {
    setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, dir) : addWeeks(prev, dir));
  };

  // Group by department
  const grouped = useMemo(() => {
    const map = new Map<string, ActionRecord[]>();
    for (const a of actions) {
      const dept = a.department || 'Other';
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept)!.push(a);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [actions]);

  const today = new Date();
  const todayInRange = isWithinInterval(today, { start: rangeStart, end: rangeEnd });
  const totalDays = days.length;

  function dayOffset(date: Date): number {
    const d = differenceInDays(date, rangeStart);
    return Math.max(0, Math.min(d, totalDays - 1));
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-medium">No actions to display in timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(rangeStart, 'MMM d')}`}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {(['month', 'week'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={cn("px-3 py-1 text-xs font-medium transition-colors",
                viewMode === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )}>
              {m === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt */}
      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Date header */}
          <div className="flex border-b bg-muted/30">
            <div className="w-[180px] flex-shrink-0 px-3 py-2 text-xs font-medium text-muted-foreground border-r">
              Actions
            </div>
            <div className="flex-1 flex relative">
              {days.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <div key={i}
                    className={cn(
                      "flex-1 text-center text-[9px] py-2 border-r border-border/30",
                      isToday && "bg-destructive/10 font-bold"
                    )}>
                    {viewMode === 'week' ? format(day, 'EEE d') : (
                      i % (totalDays > 20 ? 5 : 2) === 0 || isToday ? format(day, 'd') : ''
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          {grouped.map(([dept, deptActions]) => (
            <div key={dept}>
              {/* Dept header */}
              <div className="flex border-b bg-muted/20">
                <div className="w-[180px] flex-shrink-0 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-r">
                  {dept}
                </div>
                <div className="flex-1" />
              </div>

              {/* Action rows */}
              {deptActions.map(action => {
                const hasDate = !!action.target_completion_date;
                const dueDate = hasDate ? new Date(action.target_completion_date!) : null;
                const createdDate = new Date(action.updated_at || Date.now());
                const overdue = isOverdue(action);

                // Compute bar positions
                let barStart: number | null = null;
                let barEnd: number | null = null;
                let isValid = true;

                if (hasDate && dueDate) {
                  const startDate = createdDate < rangeStart ? rangeStart : createdDate;
                  const endDate = dueDate > rangeEnd ? rangeEnd : dueDate;
                  if (startDate > endDate) isValid = false;
                  if (dueDate < rangeStart || createdDate > rangeEnd) {
                    barStart = null; // out of range
                  } else {
                    barStart = dayOffset(startDate);
                    barEnd = dayOffset(endDate);
                  }
                }

                return (
                  <div key={action.id} className="flex border-b hover:bg-muted/30 cursor-pointer" onClick={() => onActionClick(action)}>
                    <div className="w-[180px] flex-shrink-0 px-3 py-2 text-xs text-foreground truncate border-r flex items-center gap-1">
                      {!isValid && <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                      <span className="truncate">{action.action_title}</span>
                    </div>
                    <div className="flex-1 relative" style={{ height: 32 }}>
                      {/* Today line */}
                      {todayInRange && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10 border-dashed"
                          style={{ left: `${((dayOffset(today) + 0.5) / totalDays) * 100}%` }}
                        >
                          <span className="absolute -top-0.5 -left-3 text-[7px] text-destructive font-bold">Today</span>
                        </div>
                      )}

                      {/* Bar or marker */}
                      {hasDate && barStart !== null && barEnd !== null && isValid ? (
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-3 rounded-full",
                            overdue
                              ? "bg-red-500 bg-[length:8px_8px]"
                              : STATUS_COLORS[action.status] || 'bg-muted-foreground/40'
                          )}
                          style={{
                            left: `${((barStart) / totalDays) * 100}%`,
                            width: `${Math.max(((barEnd - barStart + 1) / totalDays) * 100, 1.5)}%`,
                          }}
                          title={`${action.action_title} — Due: ${action.target_completion_date}`}
                        />
                      ) : !hasDate ? (
                        // Diamond marker at created position
                        <div
                          className="absolute top-1/2 -translate-y-1/2"
                          style={{ left: `${((dayOffset(createdDate) + 0.5) / totalDays) * 100}%` }}
                        >
                          <Diamond className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
