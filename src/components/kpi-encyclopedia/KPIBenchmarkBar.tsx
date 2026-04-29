import { cn } from "@/lib/utils";

interface KPIBenchmarkBarProps {
  benchmark?: string;
  unit?: string;
  className?: string;
}

export function KPIBenchmarkBar({ benchmark, unit, className }: KPIBenchmarkBarProps) {
  if (!benchmark) return null;

  // Parse benchmark to determine zones
  const isPercentage = unit === 'Percentage (%)' || unit === '%' || benchmark.includes('%');
  const isLowerBetter = benchmark.includes('<') || (unit?.toLowerCase()?.includes('day') ?? false) || (unit?.toLowerCase()?.includes('minute') ?? false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-label">
        <span className="text-muted-foreground font-medium">
          Benchmark
        </span>
        <span className="font-semibold text-foreground">{benchmark}</span>
      </div>
      {/* Horizontal benchmark band */}
      <div className="relative h-2 rounded-md overflow-hidden bg-muted">
        <div className="absolute inset-0 flex">
          <div className="h-full w-1/3 bg-destructive/15" />
          <div className="h-full w-1/3 bg-warning/15" />
          <div className="h-full w-1/3 bg-success/15" />
        </div>
        {/* Benchmark marker */}
        <div
          className="absolute top-0 h-full w-0.5 rounded-md bg-foreground/70"
          style={{ left: isLowerBetter ? '25%' : '75%' }}
        />
      </div>
      <div className="flex items-center justify-between text-caption text-muted-foreground">
        <span>{isLowerBetter ? 'Better' : 'Poor'}</span>
        <span className="italic">
          {isLowerBetter ? 'Lower is better' : 'Higher is better'}
        </span>
        <span>{isLowerBetter ? 'Poor' : 'Better'}</span>
      </div>
    </div>
  );
}
