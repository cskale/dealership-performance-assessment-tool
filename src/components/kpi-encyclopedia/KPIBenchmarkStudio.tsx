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

  const zones = isLowerBetter
    ? [
        { label: language === 'de' ? 'Führend' : 'Leading', color: 'bg-primary/12' },
        { label: language === 'de' ? 'Stark' : 'Strong', color: 'bg-primary/8' },
        { label: language === 'de' ? 'Unter Referenz' : 'Below Reference', color: 'bg-muted/60' },
        { label: language === 'de' ? 'Entwicklung' : 'Developing', color: 'bg-muted/30' },
      ]
    : [
        { label: language === 'de' ? 'Entwicklung' : 'Developing', color: 'bg-muted/30' },
        { label: language === 'de' ? 'Unter Referenz' : 'Below Reference', color: 'bg-muted/60' },
        { label: language === 'de' ? 'Stark' : 'Strong', color: 'bg-primary/8' },
        { label: language === 'de' ? 'Führend' : 'Leading', color: 'bg-primary/12' },
      ];

  // Reference corridor position (the "strong performance" zone)
  const corridorLeft = isLowerBetter ? '0%' : '50%';
  const corridorWidth = '37.5%';

  return (
    <div className={cn("rounded-xl border border-border/40 bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {language === 'de' ? 'Referenz-Benchmarkbereich' : 'Reference Benchmark Range'}
        </span>
      </div>

      {/* Indicative range value */}
      <div className="mb-4">
        <span className="text-xl font-bold text-foreground">{benchmark}</span>
        {unit && <span className="text-xs text-muted-foreground ml-1.5">{unit}</span>}
        <span className="text-[10px] text-muted-foreground ml-2 italic">
          {language === 'de' ? 'Indikative Spanne' : 'Indicative range'}
        </span>
      </div>

      {/* Spectrum band */}
      <div className="relative mb-1.5">
        <div className="flex rounded-md overflow-hidden h-2.5 gap-px">
          {zones.map((zone, i) => (
            <div
              key={i}
              className={cn("h-full flex-1 rounded-sm", zone.color)}
            />
          ))}
        </div>

        {/* Reference corridor overlay */}
        <div
          className="absolute top-0 h-2.5 border-y-2 border-primary/25 rounded-sm pointer-events-none"
          style={{ left: corridorLeft, width: corridorWidth }}
        />
      </div>

      {/* Zone labels */}
      <div className="flex mb-3">
        {zones.map((zone, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[8px] text-muted-foreground/60 leading-none">{zone.label}</span>
          </div>
        ))}
      </div>

      {/* Direction + corridor note */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60 italic">
          {isLowerBetter
            ? (language === 'de' ? '← Niedrigere Werte sind besser' : '← Lower is better')
            : (language === 'de' ? 'Höhere Werte sind besser →' : 'Higher is better →')}
        </span>
        <span className="text-[10px] text-primary/50 font-medium">
          {language === 'de' ? 'Referenzkorridor' : 'Reference corridor'}
        </span>
      </div>

      {/* Credibility note */}
      <p className="text-[9px] text-muted-foreground/50 mt-3 leading-relaxed">
        {language === 'de'
          ? 'Referenzbereiche variieren je nach OEM, Marktreife, Kanalmix und Geschäftsmodell.'
          : 'Reference ranges vary by OEM, market maturity, channel mix, and operating model.'}
      </p>
    </div>
  );
}
