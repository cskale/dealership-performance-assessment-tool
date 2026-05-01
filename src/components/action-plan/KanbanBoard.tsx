import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cleanActionTitle } from '@/lib/actionRationaleMap';
import type { ActionRecord } from '../ActionPlan';

interface KanbanBoardProps {
  actions: ActionRecord[];
  onStatusChange: (actionId: string, newStatus: 'Open' | 'In Progress' | 'Completed') => Promise<void>;
  onActionClick: (action: ActionRecord) => void;
}

type ColumnStatus = 'Open' | 'In Progress' | 'Completed';

const COLUMNS: { key: ColumnStatus; label: string }[] = [
  { key: 'Open', label: 'Open' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed', label: 'Done' },
];

const PRIORITY_DOT: Record<ActionRecord['priority'], string> = {
  critical: '#E24B4A',
  high: '#EF9F27',
  medium: '#378ADD',
  low: '#888780',
};

export function KanbanBoard({ actions, onStatusChange, onActionClick }: KanbanBoardProps) {
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
            className="rounded-lg p-3 transition-colors"
            style={{ backgroundColor: isHover ? '#e8f5ee' : '#f8f7f3' }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span
                className="uppercase"
                style={{ fontSize: '12px', color: '#96948e', letterSpacing: '0.04em', fontWeight: 600 }}
              >
                {col.label}
              </span>
              <span
                className="rounded-full px-2 py-0.5 bg-white"
                style={{ fontSize: '11px', color: '#5c5a54', border: '1px solid #e2e0d8' }}
              >
                {colActions.length}
              </span>
            </div>

            <div className="space-y-2">
              {colActions.length === 0 && (
                <div
                  className="text-center py-6"
                  style={{ fontSize: '11px', color: '#96948e' }}
                >
                  No actions
                </div>
              )}
              {colActions.map(action => {
                const isDragging = draggingId === action.id;
                return (
                  <div
                    key={action.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, action)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onActionClick(action)}
                    className={cn(
                      'bg-white cursor-pointer transition-all hover:shadow-md',
                      action.status === 'Completed' && 'opacity-80',
                    )}
                    style={{
                      border: '1px solid #e2e0d8',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 8,
                      opacity: isDragging ? 0.4 : undefined,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1.5 flex-shrink-0 rounded-full"
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: PRIORITY_DOT[action.priority] ?? PRIORITY_DOT.medium,
                        }}
                      />
                      <h4
                        className="flex-1 line-clamp-2"
                        style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}
                      >
                        {cleanActionTitle(action.action_title)}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: '10px',
                          color: '#5c5a54',
                          backgroundColor: '#f8f7f3',
                          border: '1px solid #e2e0d8',
                        }}
                      >
                        {action.department}
                      </span>
                      {action.responsible_person && (
                        <span
                          className="truncate text-right"
                          style={{ fontSize: '10px', color: '#96948e' }}
                        >
                          {action.responsible_person}
                        </span>
                      )}
                    </div>
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
