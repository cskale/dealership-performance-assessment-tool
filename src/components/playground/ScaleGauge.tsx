/**
 * Horizontal percentage gauge for Playground calculators.
 * The scale extends past `max` when the value exceeds it, so the bar, the
 * printed value and the tick labels always agree; the target tick is placed
 * at its true position (not spread evenly with flexbox).
 */
export function niceScaleMax(value: number | null, max: number): number {
  if (value === null || value <= max) return max;
  return Math.ceil((value * 1.1) / 50) * 50;
}

interface ScaleGaugeProps {
  value: number | null;
  /** Default upper bound of the scale, in %. Extended automatically if value exceeds it. */
  max: number;
  /** Target line, e.g. 100 for absorption or 85 for utilisation. */
  target: number;
  /** Tailwind background class for the fill. */
  fillClass: string;
}

export function ScaleGauge({ value, max, target, fillClass }: ScaleGaugeProps) {
  const scaleMax = niceScaleMax(value, max);
  const pos = (v: number) => `${Math.min(100, Math.max(0, (v / scaleMax) * 100))}%`;
  const hasOverflow = value !== null && value > max;

  return (
    <div className="pt-6">
      <div className="relative h-2.5 w-full overflow-visible rounded-full bg-muted shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-primary/70 to-current transition-all duration-500 ease-out ${fillClass}`}
          style={{ width: value === null ? '0%' : pos(value) }}
        />
        <div className="absolute -top-6 -translate-x-1/2" style={{ left: pos(target) }} aria-hidden>
          <span className="whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[9px] font-semibold text-background shadow-soft">Target {target}%</span>
          <span className="mx-auto block h-2 w-px bg-foreground/60" />
        </div>
        <div className="absolute -top-1 h-[18px] w-px bg-foreground/60" style={{ left: pos(target) }} aria-hidden />
        {hasOverflow && <span className="absolute -right-0.5 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--brand-100))]" aria-label="Value extends beyond the default range" />}
      </div>
      <div className="relative mt-1.5 h-4 text-[10px] text-muted-foreground numeric">
        <span className="absolute left-0">0%</span>
        <span className="absolute -translate-x-1/2 font-medium" style={{ left: pos(target) }}>{target}%</span>
        <span className="absolute right-0">{scaleMax}%</span>
      </div>
      {hasOverflow && <p className="mt-1 text-right text-[10px] font-medium text-primary">Scale extended beyond {max}%</p>}
    </div>
  );
}
