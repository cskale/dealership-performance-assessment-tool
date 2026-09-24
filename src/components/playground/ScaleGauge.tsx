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

  return (
    <div>
      <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillClass}`}
          style={{ width: value === null ? '0%' : pos(value) }}
        />
        <div className="absolute inset-y-0 w-px bg-gray-400/70" style={{ left: pos(target) }} aria-hidden />
      </div>
      <div className="relative h-4 text-[10px] text-muted-foreground mt-1">
        <span className="absolute left-0">0%</span>
        <span className="absolute -translate-x-1/2 font-medium" style={{ left: pos(target) }}>{target}%</span>
        <span className="absolute right-0">{scaleMax}%</span>
      </div>
    </div>
  );
}
