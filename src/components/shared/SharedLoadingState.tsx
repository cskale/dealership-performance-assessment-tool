import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'spinner' | 'skeleton';
}

export function SharedLoadingState({
  message,
  size = 'md',
  className,
  variant = 'spinner',
}: SharedLoadingStateProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-4 py-6", className)}>
        <div className="skeleton h-8 w-2/5" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-3/5" />
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2 className={cn("animate-spin text-primary mb-3", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
