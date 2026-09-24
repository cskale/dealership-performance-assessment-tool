import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/playground/AnimatedNumber';
import type { MetricStatus } from '@/components/playground/CalculatorPrimitives';
import { cn } from '@/lib/utils';

interface KpiStat {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
  caption?: string;
  status?: MetricStatus;
}

interface PlaygroundCalculatorShellProps {
  breadcrumbLabel: string;
  icon: LucideIcon;
  category: string;
  title: string;
  description: ReactNode;
  kpiStrip: KpiStat[];
  leftCard: ReactNode;
  rightCard: ReactNode;
  bottomStats?: KpiStat[];
}

export function PlaygroundCalculatorShell({
  breadcrumbLabel,
  icon: Icon,
  category,
  title,
  description,
  kpiStrip,
  leftCard,
  rightCard,
  bottomStats,
}: PlaygroundCalculatorShellProps) {
  return (
    <div className="playground-calculator w-full max-w-7xl mx-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
        <Link to="/app/playground" className="flex shrink-0 items-center gap-1 transition-colors duration-200 hover:text-primary">
          <ChevronLeft className="w-3 h-3" />
          Playground
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="truncate text-foreground">{breadcrumbLabel}</span>
      </nav>

      {/* Header */}
      <header className="relative mb-5 overflow-hidden rounded-lg border border-border bg-card px-4 py-5 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300 sm:px-6 sm:py-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="mt-0.5 shrink-0 rounded-md border border-primary/15 bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
              {category}
            </p>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
          </div>
        </div>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </header>

      {/* KPI summary strip */}
      <section aria-label="Key results" className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-card animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {kpiStrip.map((stat, i) => (
            <div key={i} className="relative min-w-0 px-5 py-4 transition-colors duration-200 hover:bg-muted/50">
              <span className={cn(
                'absolute inset-y-4 left-0 w-0.5 rounded-r-full',
                stat.status === 'good' && 'bg-success',
                stat.status === 'watch' && 'bg-warning',
                stat.status === 'risk' && 'bg-destructive',
                (!stat.status || stat.status === 'neutral') && (stat.emphasis ? 'bg-primary' : 'bg-border'),
              )} aria-hidden />
              <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</p>
              <div className={cn('min-w-0 break-words text-[26px] font-bold leading-8 numeric', stat.emphasis ? 'text-primary' : 'text-foreground')}>
                <AnimatedNumber value={stat.value} />
              </div>
              <p className="mt-1 min-h-4 text-[11px] leading-4 text-muted-foreground">
                {stat.caption ?? `Current ${stat.label.toLocaleLowerCase()}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column main grid */}
      <div className="mb-5 grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-500">{leftCard}</div>
        <div className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-700">{rightCard}</div>
      </div>

      {/* Bottom stats */}
      {bottomStats && bottomStats.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            {bottomStats.map((stat, i) => (
              <div key={i} className="px-5 py-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  {stat.label}
                </p>
                <div className="text-lg font-bold text-foreground numeric"><AnimatedNumber value={stat.value} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
