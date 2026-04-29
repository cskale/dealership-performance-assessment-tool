import { cn } from "@/lib/utils";
import { BenchmarkConfidenceIndicator, BenchmarkNoteBadge } from "@/components/shared/BenchmarkConfidenceIndicator";

function parseBenchmarkRange(
  benchmark: string,
  isLowerBetter: boolean
): { corridorLeftPct: number; corridorWidthPct: number } {
  const numbers = benchmark.match(/[\d.]+/g)?.map(Number) ?? [];
  const allPct = numbers.every(n => n <= 100);
  if (numbers.length === 0) {
    return { corridorLeftPct: isLowerBetter ? 0 : 50, corridorWidthPct: 25 };
  }
  let low: number, high: number;
  if (numbers.length === 1) {
    const n = numbers[0];
    if (benchmark.startsWith('<') || benchmark.startsWith('≤')) {
      low = 0; high = allPct ? n : Math.min(n / 1.5, 100);
    } else if (benchmark.startsWith('>') || benchmark.startsWith('≥')) {
      low = allPct ? n : Math.min(n / 1.5, 100); high = 100;
    } else {
      low = Math.max(0, (allPct ? n : n / 1.5) - 10);
      high = Math.min(100, (allPct ? n : n / 1.5) + 10);
    }
  } else {
    const [a, b] = numbers;
    if (allPct) {
      low = Math.min(a, b); high = Math.max(a, b);
    } else {
      const scale = Math.max(b, 100);
      low = (Math.min(a, b) / scale) * 100;
      high = (Math.max(a, b) / scale) * 100;
    }
  }
  low = Math.max(0, Math.min(100, low));
  high = Math.max(0, Math.min(100, high));
  return { corridorLeftPct: low, corridorWidthPct: Math.max(5, high - low) };
}

interface KPIBenchmarkStudioProps {
  kpiKey?: string;
  benchmark?: string;
  unit?: string;
  isLowerBetter: boolean;
  language: string;
  className?: string;
}

export function KPIBenchmarkStudio({ kpiKey, benchmark, unit, isLowerBetter, language, className }: KPIBenchmarkStudioProps) {
  if (!benchmark) return null;

  const zones = isLowerBetter
    ? [
        { label: language === 'de' ? 'Führend' : 'Leading', color: 'hsl(var(--primary) / 0.22)' },
        { label: language === 'de' ? 'Stark' : 'Strong', color: 'hsl(var(--primary) / 0.12)' },
        { label: language === 'de' ? 'Unter Referenz' : 'Below Reference', color: 'hsl(var(--muted-foreground) / 0.10)' },
        { label: language === 'de' ? 'Entwicklung' : 'Developing', color: 'hsl(var(--muted-foreground) / 0.05)' },
      ]
    : [
        { label: language === 'de' ? 'Entwicklung' : 'Developing', color: 'hsl(var(--muted-foreground) / 0.05)' },
        { label: language === 'de' ? 'Unter Referenz' : 'Below Reference', color: 'hsl(var(--muted-foreground) / 0.10)' },
        { label: language === 'de' ? 'Stark' : 'Strong', color: 'hsl(var(--primary) / 0.12)' },
        { label: language === 'de' ? 'Führend' : 'Leading', color: 'hsl(var(--primary) / 0.22)' },
      ];

  // Corridor position derived from the benchmark string
  const { corridorLeftPct, corridorWidthPct } = parseBenchmarkRange(benchmark, isLowerBetter);

  return (
    <div className={cn("", className)}>
      {/* Value display with confidence */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-metric-lg tabular-nums text-foreground">{benchmark}</span>
        {unit && <span className="text-body-sm text-muted-foreground">{unit}</span>}
        {kpiKey && (
          <BenchmarkConfidenceIndicator
            kpiKey={kpiKey}
            language={(language === 'de' ? 'de' : 'en') as 'en' | 'de'}
            showLabel
            size="sm"
          />
        )}
      </div>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-caption text-muted-foreground/50">
          {language === 'de' ? 'Indikative Spanne' : 'Indicative range'}
        </span>
        {kpiKey && (
          <BenchmarkNoteBadge
            kpiKey={kpiKey}
            language={(language === 'de' ? 'de' : 'en') as 'en' | 'de'}
          />
        )}
      </div>

      {/* Spectrum rail */}
      <div className="relative mb-1.5">
        {/* 4-zone background */}
        <div className="flex h-6 rounded-lg overflow-hidden gap-px">
          {zones.map((zone, i) => (
            <div
              key={i}
              className="flex-1 first:rounded-l-lg last:rounded-r-lg"
              style={{ backgroundColor: zone.color }}
            />
          ))}
        </div>

        {/* Reference corridor overlay */}
        <div
          className="absolute top-[-3px] rounded-md pointer-events-none"
          style={{
            left: `${corridorLeftPct}%`,
            width: `${corridorWidthPct}%`,
            height: 'calc(100% + 6px)',
            backgroundColor: 'hsl(var(--primary) / 0.08)',
            border: '2px solid hsl(var(--primary) / 0.35)',
          }}
        >
          {/* Corridor label */}
          <span
            className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-caption font-medium uppercase tracking-wider"
            style={{ color: 'hsl(var(--primary) / 0.55)' }}
          >
            {language === 'de' ? 'Referenzkorridor' : 'Reference corridor'}
          </span>
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex mb-3">
        {zones.map((zone, i) => (
          <span key={i} className="flex-1 text-center text-caption font-medium text-muted-foreground/60">
            {zone.label}
          </span>
        ))}
      </div>

      {/* Direction note */}
      <span className="text-caption text-muted-foreground/50 block">
        {isLowerBetter
          ? (language === 'de' ? '← Niedrigere Werte sind besser' : '← Lower is better')
          : (language === 'de' ? 'Höhere Werte sind besser →' : 'Higher is better →')}
      </span>
    </div>
  );
}
