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
 * SharedEmptyState — §12 spec: larger icon, proper heading hierarchy
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
      <Icon className="h-8 w-8 text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
