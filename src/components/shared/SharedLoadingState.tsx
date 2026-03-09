import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharedLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * SharedLoadingState - Unified loading pattern across modules
 */
export function SharedLoadingState({ 
  message, 
  size = 'md',
  className 
}: SharedLoadingStateProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2 className={cn("animate-spin text-primary mb-3", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
