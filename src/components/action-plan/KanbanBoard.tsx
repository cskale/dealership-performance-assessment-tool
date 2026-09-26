import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cleanActionTitle } from '@/lib/actionRationaleMap';
import type { ActionRecord } from '../ActionPlan';
import type { TimelinePoint } from '@/lib/kpiTimeline';
import { isTrackedKpi, trackedKpisFor, type DepartmentKey } from '@/data/trackedKpis';
import { LinkedKpiChip } from './LinkedKpiChip';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface KanbanBoardProps {
  actions: ActionRecord[];
  onStatusChange: (actionId: string, newStatus: 'Open' | 'In Progress' | 'Completed') => Promise<void>;
  onActionClick: (action: ActionRecord) => void;
  dealershipId?: string | null;
  kpiTimelines?: Record<string, TimelinePoint[]>;
}

type ColumnStatus = 'Open' | 'In Progress' | 'Completed';

const COLUMNS: { key: ColumnStatus; label: string }[] = [
  { key: 'Open', label: 'Open' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed', label: 'Done' },
];

const PRIORITY_BORDER: Record<ActionRecord['priority'], string> = {
  critical: 'border-l-destructive',
  high: 'border-l-warning',
  medium: 'border-l-info',
  low: 'border-l-neutral-400',
};

const DEPARTMENT_KEYS: Record<string, DepartmentKey> = {
  'New Vehicle Sales': 'nvs', 'Used Vehicle Sales': 'uvs', 'Service': 'svc',
  'Parts & Inventory': 'prt', 'Financial Operations': 'fin',
};

function linkedTrackedKpi(action: ActionRecord): string | undefined {
  const department = DEPARTMENT_KEYS[action.department];
  if (!department) return undefined;
  return action.kpis_linked_to?.find((key) => isTrackedKpi(key) && trackedKpisFor(department).includes(key));
}

function isOverdue(action: ActionRecord): boolean {
  return Boolean(action.target_completion_date && action.status !== 'Completed' && new Date(action.target_completion_date) < new Date(new Date().toDateString()));
}

export function KanbanBoard({ actions, onStatusChange, onActionClick, dealershipId, kpiTimelines = {} }: KanbanBoardProps) {
  const { t, language } = useLanguage();
  const draggingIdRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<ColumnStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, action: ActionRecord) => {
    draggingIdRef.current = action.id;
    setDraggingId(action.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setHoverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: ColumnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoverColumn !== columnKey) setHoverColumn(columnKey);
  };

  const handleDrop = async (e: React.DragEvent, columnKey: ColumnStatus) => {
    e.preventDefault();
    const id = draggingIdRef.current;
    setHoverColumn(null);
    setDraggingId(null);
    draggingIdRef.current = null;
    if (!id) return;
    const action = actions.find(a => a.id === id);
    if (!action || action.status === columnKey) return;
    try {
      await onStatusChange(id, columnKey);
      if (columnKey === 'Completed') {
        toast.success('Action marked complete');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px] overflow-x-auto">
      {COLUMNS.map(col => {
        const colActions = actions.filter(a => a.status === col.key);
        const isHover = hoverColumn === col.key;
        return (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => setHoverColumn(prev => (prev === col.key ? null : prev))}
            onDrop={(e) => handleDrop(e, col.key)}
            className={cn('rounded-lg border border-border bg-muted/40 p-3 transition-colors', isHover && 'border-brand-300 bg-brand-50')}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                {col.label}
              </span>
              <span
                className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {colActions.length}
              </span>
            </div>

            <div className="space-y-2">
              {colActions.length === 0 && (
                <div
                  className="py-6 text-center text-[11px] text-muted-foreground"
                >
                  {t('actionPlan.noActionsShort')}
                </div>
              )}
              {colActions.map(action => {
                const isDragging = draggingId === action.id;
                const kpiKey = dealershipId ? linkedTrackedKpi(action) : undefined;
                return (
                  <div
                    key={action.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, action)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onActionClick(action)}
                    className={cn(
                      'cursor-pointer rounded-lg border border-border border-l-[3px] bg-card p-3 shadow-card transition-all hover:shadow-elevated',
                      PRIORITY_BORDER[action.priority],
                      action.status === 'Completed' && 'opacity-80',
                      isDragging && 'opacity-40',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <h4 className="flex-1 line-clamp-2 text-[13px] font-medium text-foreground">
                        {cleanActionTitle(action.action_title)}
                      </h4>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                      <span>{action.department}</span>
                      {action.responsible_person && <><span aria-hidden="true">·</span><span>{action.responsible_person}</span></>}
                      {action.target_completion_date && <><span aria-hidden="true">·</span><span>{new Date(action.target_completion_date).toLocaleDateString(language)}</span></>}
                      {isOverdue(action) && <span className="inline-flex items-center gap-1 text-destructive"><Clock className="h-3 w-3" />{t('actionPlan.overdue')}</span>}
                    </div>
                    <div className="mt-2"><LinkedKpiChip kpiKey={kpiKey} history={kpiKey ? kpiTimelines[kpiKey] : undefined} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
