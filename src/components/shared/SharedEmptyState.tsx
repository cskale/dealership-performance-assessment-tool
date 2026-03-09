import { cn } from '@/lib/utils';
import { LucideIcon, Search } from 'lucide-react';

interface SharedEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * SharedEmptyState - Unified empty state pattern across modules
 */
export function SharedEmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  className
}: SharedEmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 text-center",
      className
    )}>
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
