import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type StatusType = 'open' | 'in_progress' | 'completed' | 'overdue';

interface SharedStatusBadgeProps {
  status: StatusType | string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<StatusType, { 
  label: { en: string; de: string }; 
  dotColor: string;
  classes: string;
}> = {
  open: {
    label: { en: 'Open', de: 'Offen' },
    dotColor: 'bg-muted-foreground',
    classes: 'bg-muted text-muted-foreground border-border'
  },
  in_progress: {
    label: { en: 'In Progress', de: 'In Bearbeitung' },
    dotColor: 'bg-info',
    classes: 'bg-info/10 text-info border-info/20'
  },
  completed: {
    label: { en: 'Completed', de: 'Abgeschlossen' },
    dotColor: 'bg-success',
    classes: 'bg-success/10 text-success border-success/20'
  },
  overdue: {
    label: { en: 'Overdue', de: 'Überfällig' },
    dotColor: 'bg-destructive',
    classes: 'bg-destructive/10 text-destructive border-destructive/20'
  }
};

/**
 * SharedStatusBadge — §5.8 spec: status dot + rounded-md enterprise badge
 */
export function SharedStatusBadge({
  status,
  showIcon = true,
  size = 'sm',
  className
}: SharedStatusBadgeProps) {
  const { language } = useLanguage();
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as StatusType;
  const config = statusConfig[normalizedStatus] || statusConfig.open;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2.5 py-1 text-label border inline-flex items-center gap-1.5",
        config.classes,
        className
      )}
    >
      {showIcon && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)} />
      )}
      {config.label[language as 'en' | 'de'] ?? config.label.en}
    </Badge>
  );
}
