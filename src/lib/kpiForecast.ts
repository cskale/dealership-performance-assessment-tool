import type { KpiBenchmark } from '@/lib/kpiBenchmarks';

export interface MonthPoint { month: string; value: number }
export interface Forecast {
  basedOnMonths: number;
  points: { month: string; value: number; low: number; high: number }[];
  reachesTargetMonth: string | null;
  onTrack: boolean;
}

const monthIndex = (m: string) => { const d = new Date(m); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
const monthFromIndex = (i: number) =>
  new Date(Date.UTC(Math.floor(i / 12), i % 12, 1)).toISOString().slice(0, 10);

// ponytail: OLS line + ±1σ residual band over ≤6 months. Seasonal model once ≥12 months are common.
export function forecastKpi(history: MonthPoint[], benchmark: KpiBenchmark): Forecast | null {
  const h = [...history].sort((a, b) => monthIndex(a.month) - monthIndex(b.month)).slice(-6);
  if (h.length < 3) return null;
  const xs = h.map((p) => monthIndex(p.month));
  for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 3) return null;

  const n = h.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = h.reduce((s, p) => s + p.value, 0) / n;
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (h[i].value - my), 0) / sxx;
  const at = (x: number) => my + slope * (x - mx);
  const sd = Math.sqrt(h.reduce((s, p, i) => s + (p.value - at(xs[i])) ** 2, 0) / n);

  const max = benchmark.unit === '%' ? 100 : Infinity;
  const clamp = (v: number) => Math.min(max, Math.max(0, v));
  const meets = (v: number) =>
    benchmark.direction === 'higher-better' ? v >= benchmark.target : v <= benchmark.target;

  const last = xs[n - 1];
  const points = [1, 2, 3].map((k) => {
    const v = at(last + k);
    return { month: monthFromIndex(last + k), value: clamp(v), low: clamp(v - sd), high: clamp(v + sd) };
  });
  const reachesTargetMonth = points.find((p) => meets(p.value))?.month ?? null;
  return { basedOnMonths: n, points, reachesTargetMonth, onTrack: meets(h[n - 1].value) || reachesTargetMonth !== null };
}
