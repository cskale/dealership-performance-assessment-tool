import { ReactNode } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type MetricStatus = 'good' | 'watch' | 'risk' | 'neutral';

export const calculatorCardClass = 'playground-card min-w-0 bg-card rounded-lg border border-border shadow-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-elevated';

const insightStyles: Record<MetricStatus, string> = {
  good: 'border-success/25 bg-success/5 text-success',
  watch: 'border-warning/30 bg-warning/5 text-warning',
  risk: 'border-destructive/25 bg-destructive/5 text-destructive',
  neutral: 'border-primary/20 bg-primary/5 text-primary',
};

export function CalculatedInsight({
  status = 'neutral',
  headline,
  children,
}: {
  status?: MetricStatus;
  headline: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={cn('mt-5 flex gap-3 rounded-lg border px-4 py-3.5 transition-colors duration-200', insightStyles[status])}>
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-card shadow-soft">
        <Lightbulb className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-5 text-foreground">{headline}</p>
        {children && <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}

export function WhatIfHeader({ onReset, disabled }: { onReset: () => void; disabled: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase text-muted-foreground">What-if adjustments</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={disabled}
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"
      >
        <RotateCcw className="h-3 w-3" aria-hidden /> Reset
      </Button>
    </div>
  );
}