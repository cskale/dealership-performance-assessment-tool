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
        { label: language === 'de' ? 'Führend' : 'Leading', bg: 'bg-primary/15', text: 'text-primary' },
        { label: language === 'de' ? 'Stark' : 'Strong', bg: 'bg-primary/8', text: 'text-primary/70' },
        { label: language === 'de' ? 'Unter Referenz' : 'Below Reference', bg: 'bg-muted/70', text: 'text-muted-foreground' },
        { label: language === 'de' ? 'Entwicklung' : 'Developing', bg: 'bg-muted/40', text: 'text-muted-foreground/60' },
      ]
    : [
        { label: language === 'de' ? 'Entwicklung' : 'Developing', bg: 'bg-muted/40', text: 'text-muted-foreground/60' },
        { label: language === 'de' ? 'Unter Referenz' : 'Below Reference', bg: 'bg-muted/70', text: 'text-muted-foreground' },
        { label: language === 'de' ? 'Stark' : 'Strong', bg: 'bg-primary/8', text: 'text-primary/70' },
        { label: language === 'de' ? 'Führend' : 'Leading', bg: 'bg-primary/15', text: 'text-primary' },
      ];

  // Corridor covers the "Strong" zone area
  const corridorLeft = isLowerBetter ? '0%' : '50%';
  const corridorWidth = '37.5%';

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block mb-4">
        {language === 'de' ? 'Referenz-Benchmarkbereich' : 'Reference Benchmark Range'}
      </span>

      {/* Indicative range value */}
      <div className="mb-5">
        <span className="text-2xl font-bold text-foreground tracking-tight">{benchmark}</span>
        {unit && <span className="text-sm text-muted-foreground ml-2">{unit}</span>}
        <span className="text-xs text-muted-foreground/60 ml-2 italic">
          {language === 'de' ? 'Indikative Spanne' : 'Indicative range'}
        </span>
      </div>

      {/* Spectrum band — thicker, more visible */}
      <div className="relative mb-2">
        <div className="flex rounded-lg overflow-hidden h-4 gap-[2px]">
          {zones.map((zone, i) => (
            <div key={i} className={cn("h-full flex-1 rounded-md", zone.bg)} />
          ))}
        </div>

        {/* Reference corridor overlay — clearly visible */}
        <div
          className="absolute top-[-2px] h-[20px] border-2 border-primary/30 bg-primary/[0.06] rounded-md pointer-events-none"
          style={{ left: corridorLeft, width: corridorWidth }}
        >
          {/* Left boundary marker */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/40 rounded-full" />
          {/* Right boundary marker */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-primary/40 rounded-full" />
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex mb-4">
        {zones.map((zone, i) => (
          <div key={i} className="flex-1 text-center">
            <span className={cn("text-[10px] font-medium leading-none", zone.text)}>{zone.label}</span>
          </div>
        ))}
      </div>

      {/* Direction + corridor label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-muted-foreground/60">
          {isLowerBetter
            ? (language === 'de' ? '← Niedrigere Werte sind besser' : '← Lower is better')
            : (language === 'de' ? 'Höhere Werte sind besser →' : 'Higher is better →')}
        </span>
        <span className="text-[11px] text-primary/60 font-medium">
          {language === 'de' ? 'Referenzkorridor' : 'Reference corridor'}
        </span>
      </div>

      {/* Credibility note */}
      <p className="text-[11px] text-muted-foreground/50 leading-relaxed border-t border-border/30 pt-3">
        {language === 'de'
          ? 'Referenzbereiche variieren je nach OEM, Marktreife, Kanalmix und Geschäftsmodell.'
          : 'Reference ranges vary by OEM, market maturity, channel mix, and operating model.'}
      </p>
    </div>
  );
}
