import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SharedSectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * SharedSectionHeader - Unified section header pattern across modules
 */
export function SharedSectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  size = 'md',
  className
}: SharedSectionHeaderProps) {
  const sizeClasses = {
    sm: {
      container: 'mb-3',
      iconBox: 'h-7 w-7',
      icon: 'h-3.5 w-3.5',
      title: 'text-h5',
      subtitle: 'text-caption'
    },
    md: {
      container: 'mb-4',
      iconBox: 'h-9 w-9',
      icon: 'h-4 w-4',
      title: 'text-h5',
      subtitle: 'text-body-sm'
    },
    lg: {
      container: 'mb-6',
      iconBox: 'h-10 w-10',
      icon: 'h-5 w-5',
      title: 'text-h4',
      subtitle: 'text-body-sm'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div className={cn("flex items-start justify-between gap-4", styles.container, className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn("rounded-xl bg-primary/10 flex items-center justify-center shrink-0", styles.iconBox)}>
            <Icon className={cn("text-primary", styles.icon)} />
          </div>
        )}
        <div>
          <h2 className={cn("text-foreground tracking-tight", styles.title)}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn("text-muted-foreground mt-0.5", styles.subtitle)}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  );
}
