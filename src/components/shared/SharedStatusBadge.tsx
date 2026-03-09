import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

type StatusType = 'open' | 'in_progress' | 'completed' | 'overdue';

interface SharedStatusBadgeProps {
  status: StatusType | string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<StatusType, { 
  label: { en: string; de: string }; 
  icon: typeof Circle;
  classes: string;
}> = {
  open: {
    label: { en: 'Open', de: 'Offen' },
    icon: Circle,
    classes: 'bg-muted text-muted-foreground border-border'
  },
  in_progress: {
    label: { en: 'In Progress', de: 'In Bearbeitung' },
    icon: Clock,
    classes: 'bg-info/10 text-info border-info/30'
  },
  completed: {
    label: { en: 'Completed', de: 'Abgeschlossen' },
    icon: CheckCircle2,
    classes: 'bg-success/10 text-success border-success/30'
  },
  overdue: {
    label: { en: 'Overdue', de: 'Überfällig' },
    icon: AlertTriangle,
    classes: 'bg-destructive/10 text-destructive border-destructive/30'
  }
};

/**
 * SharedStatusBadge - Unified status badge pattern
 */
export function SharedStatusBadge({
  status,
  showIcon = true,
  size = 'sm',
  className
}: SharedStatusBadgeProps) {
  // Normalize status string
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as StatusType;
  const config = statusConfig[normalizedStatus] || statusConfig.open;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-1.5 py-0'
    : 'text-xs px-2 py-0.5';

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        sizeClasses,
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className={cn("mr-1", size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />}
      {config.label.en}
    </Badge>
  );
}
