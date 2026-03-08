import { cn } from "@/lib/utils";

interface KPIBenchmarkStudioProps {
  benchmark?: string;
  unit?: string;
  isLowerBetter: boolean;
  language: string;
  className?: string;
}

export function KPIBenchmarkStudio({ benchmark, unit, isLowerBetter, language, className }: KPIBenchmarkStudioProps) {
  if (!benchmark) return null;

  // Determine marker position based on benchmark context
  const markerPosition = isLowerBetter ? 25 : 75;

  const zones = isLowerBetter
    ? [
        { label: language === 'de' ? 'Top' : 'Top', color: 'bg-emerald-100', width: '25%' },
        { label: language === 'de' ? 'Gut' : 'Good', color: 'bg-emerald-50', width: '25%' },
        { label: language === 'de' ? 'Durchschnitt' : 'Average', color: 'bg-amber-50', width: '25%' },
        { label: language === 'de' ? 'Schlecht' : 'Poor', color: 'bg-red-50', width: '25%' },
      ]
    : [
        { label: language === 'de' ? 'Schlecht' : 'Poor', color: 'bg-red-50', width: '25%' },
        { label: language === 'de' ? 'Durchschnitt' : 'Average', color: 'bg-amber-50', width: '25%' },
        { label: language === 'de' ? 'Gut' : 'Good', color: 'bg-emerald-50', width: '25%' },
        { label: language === 'de' ? 'Top' : 'Top', color: 'bg-emerald-100', width: '25%' },
      ];

  return (
    <div className={cn("rounded-xl border border-border/60 bg-muted/20 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Benchmark
        </span>
        <span className="text-xs text-muted-foreground italic">
          {isLowerBetter
            ? (language === 'de' ? 'Niedriger ist besser' : 'Lower is better')
            : (language === 'de' ? 'Höher ist besser' : 'Higher is better')}
        </span>
      </div>

      {/* Benchmark value */}
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-foreground">{benchmark}</span>
        {unit && <span className="text-xs text-muted-foreground ml-1.5">{unit}</span>}
      </div>

      {/* Horizontal benchmark rail */}
      <div className="relative mb-2">
        {/* Zone bands */}
        <div className="flex rounded-lg overflow-hidden h-3">
          {zones.map((zone, i) => (
            <div
              key={i}
              className={cn("h-full", zone.color)}
              style={{ width: zone.width }}
            />
          ))}
        </div>

        {/* Benchmark marker */}
        <div
          className="absolute top-0 h-3 w-0.5 bg-foreground rounded-full"
          style={{ left: `${markerPosition}%`, transform: 'translateX(-50%)' }}
        />
        <div
          className="absolute -top-1 w-2 h-2 rounded-full bg-foreground border-2 border-card"
          style={{ left: `${markerPosition}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Zone labels */}
      <div className="flex">
        {zones.map((zone, i) => (
          <div key={i} className="text-center" style={{ width: zone.width }}>
            <span className="text-[9px] text-muted-foreground/70">{zone.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
