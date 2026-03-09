import { cn } from "@/lib/utils";
import { BenchmarkConfidenceIndicator, BenchmarkNoteBadge } from "@/components/shared/BenchmarkConfidenceIndicator";

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

  // Corridor position: covers the "Strong" zone
  const corridorLeftPct = isLowerBetter ? 0 : 50;
  const corridorWidthPct = 25;

  return (
    <div className={cn("", className)}>
      {/* Value display with confidence */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-xl font-bold text-foreground tracking-tight">{benchmark}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
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
        <span className="text-[11px] text-muted-foreground/50 italic">
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
            className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium tracking-wide uppercase"
            style={{ color: 'hsl(var(--primary) / 0.55)' }}
          >
            {language === 'de' ? 'Referenzkorridor' : 'Reference corridor'}
          </span>
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex mb-3">
        {zones.map((zone, i) => (
          <span key={i} className="flex-1 text-center text-[10px] font-medium text-muted-foreground/60">
            {zone.label}
          </span>
        ))}
      </div>

      {/* Direction note */}
      <span className="text-[11px] text-muted-foreground/50 block">
        {isLowerBetter
          ? (language === 'de' ? '← Niedrigere Werte sind besser' : '← Lower is better')
          : (language === 'de' ? 'Höhere Werte sind besser →' : 'Higher is better →')}
      </span>
    </div>
  );
}
