import { useMemo, useState } from 'react';
import { z } from 'zod';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarPlus, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import type { DataQuestion } from '@/data/questionnaire';
import type { TimelinePoint } from '@/lib/kpiTimeline';
import { forecastKpi } from '@/lib/kpiForecast';
import type { KpiBenchmark } from '@/lib/kpiBenchmarks';
import { cn } from '@/lib/utils';

interface KpiTrendCardProps {
  question: DataQuestion;
  history: TimelinePoint[];
  benchmark: KpiBenchmark;
  canLog: boolean;
  saving: boolean;
  onSave: (input: { kpiKey: string; month: string; value: number }) => Promise<void>;
}

const LOCALES: Record<Language, string> = {
  en: 'en-GB', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', it: 'it-IT',
};

function previousMonthValue(): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function currentMonthValue(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month: string, locale: string): string {
  return new Date(`${month.slice(0, 7)}-01T00:00:00Z`).toLocaleDateString(locale, { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

function formatValue(value: number, unit: string, locale: string): string {
  if (unit.includes('EUR')) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  return unit === '%' ? `${formatted}%` : `${formatted} ${unit}`;
}

function KpiTooltip({ active, payload, locale, unit, enteredByCoach }: {
  active?: boolean;
  payload?: Array<{ payload?: TimelinePoint & { source?: string; enteredAt?: string }; value?: number }>;
  locale: string;
  unit: string;
  enteredByCoach: string;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point || typeof payload?.[0]?.value !== 'number') return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-caption shadow-md">
      <p className="font-semibold text-foreground">{formatValue(payload[0].value, unit, locale)}</p>
      <p className="text-muted-foreground">{formatMonth(point.month, locale)}</p>
      {point.source === 'checkin-coach' && <p className="mt-1 text-primary">{enteredByCoach}</p>}
      {point.enteredAt && (
        <p className="text-muted-foreground">{new Date(point.enteredAt).toLocaleDateString(locale)}</p>
      )}
    </div>
  );
}

export function KpiTrendCard({ question, history, benchmark, canLog, saving, onSave }: KpiTrendCardProps) {
  const { t, language } = useLanguage();
  const locale = LOCALES[language];
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(previousMonthValue);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const forecast = useMemo(() => forecastKpi(history, benchmark), [benchmark, history]);
  const current = history.at(-1)?.value;
  const gap = current == null ? null : current - benchmark.target;
  const twoPointDelta = history.length === 2 ? history[1].value - history[0].value : null;
  const title = question.translations?.[language]?.text ?? question.text;
  const maxMonth = currentMonthValue();

  const chartData = useMemo(() => {
    if (!forecast) return history;
    const actual = history.map((point) => ({ ...point, actual: point.value }));
    const projection = forecast.points.map((point) => ({
      month: point.month,
      projection: point.value,
      low: point.low,
      band: point.high - point.low,
    }));
    const last = history.at(-1);
    return last
      ? [...actual, { ...last, actual: last.value, projection: last.value, low: last.value, band: 0 }, ...projection]
      : projection;
  }, [forecast, history]);

  const submit = async () => {
    const parsed = z.coerce.number().finite().min(question.validRange?.min ?? 0).max(question.validRange?.max ?? Number.MAX_SAFE_INTEGER).safeParse(value);
    if (!parsed.success) {
      const min = question.validRange?.min ?? 0;
      const max = question.validRange?.max;
      setError(max == null ? `Enter a number of at least ${min}.` : `Enter a number between ${min} and ${max}.`);
      return;
    }
    setError('');
    await onSave({ kpiKey: question.kpiKey, month: `${month}-01`, value: parsed.data });
    setOpen(false);
    setValue('');
  };

  const labelEveryPoint = history.length <= 6 ? 0 : Math.ceil(history.length / 6);

  return (
    <article className="min-w-0 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="line-clamp-2 text-body-sm font-semibold text-foreground">{title}</h4>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
              {current == null ? '—' : formatValue(current, benchmark.unit, locale)}
            </span>
            <span className="text-caption text-muted-foreground">
              {t('kpi.benchmark')} {formatValue(benchmark.target, benchmark.unit, locale)}
            </span>
            {gap != null && (
              <span className="font-mono text-caption tabular-nums text-muted-foreground">
                {gap > 0 ? '+' : ''}{formatValue(gap, benchmark.unit, locale)}
              </span>
            )}
          </div>
        </div>
        {canLog && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('kpi.logMonth').replace('{month}', formatMonth(`${month}-01`, locale))}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-3">
              <Input type="month" value={month} max={maxMonth} onChange={(event) => setMonth(event.target.value)} />
              <Input
                type="number"
                inputMode="decimal"
                value={value}
                min={question.validRange?.min}
                max={question.validRange?.max}
                step="any"
                aria-invalid={!!error}
                onChange={(event) => { setValue(event.target.value); setError(''); }}
              />
              {error && <p role="alert" className="text-caption text-destructive">{error}</p>}
              <Button className="w-full" size="sm" disabled={saving || !month} onClick={submit}>
                {t('kpi.saveAsCheckin').replace('{month}', formatMonth(`${month}-01`, locale))}
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="mt-4 h-36 w-full" role="img" aria-label={`${title}: ${history.length} historical observations`}>
        {forecast ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 6, bottom: 0, left: -28 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--neutral-200))" />
              <XAxis dataKey="month" tickFormatter={(monthLabel) => formatMonth(monthLabel, locale)} interval={labelEveryPoint} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={benchmark.target} stroke="hsl(var(--neutral-300))" strokeDasharray="3 3" />
              <Area dataKey="low" stackId="forecast" stroke="none" fill="transparent" />
              <Area dataKey="band" stackId="forecast" stroke="none" fill="hsl(var(--brand-200))" fillOpacity={0.55} />
              <Line dataKey="actual" stroke="hsl(var(--brand-600))" strokeWidth={2} connectNulls={false} dot={(props) => {
                const source = (props.payload as TimelinePoint | undefined)?.source;
                return <Circle {...props} r={source === 'checkin-coach' ? 5 : 3.5} fill={source === 'checkin-coach' ? 'hsl(var(--card))' : 'hsl(var(--brand-600))'} stroke="hsl(var(--brand-600))" strokeWidth={source === 'checkin-coach' ? 3 : 1} />;
              }} />
              <Line dataKey="projection" stroke="hsl(var(--brand-400))" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              <RechartsTooltip content={<KpiTooltip locale={locale} unit={benchmark.unit} enteredByCoach={t('kpi.enteredByCoach')} />} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : history.length === 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 12, right: 10, bottom: 0, left: 10 }}>
              <ReferenceLine y={benchmark.target} stroke="hsl(var(--neutral-200))" strokeDasharray="3 3" />
              <Line dataKey="value" stroke="hsl(var(--brand-600))" strokeWidth={2} dot={(props) => {
                const source = (props.payload as TimelinePoint | undefined)?.source;
                return <Circle {...props} r={source === 'checkin-coach' ? 5 : 4} fill={source === 'checkin-coach' ? 'hsl(var(--card))' : 'hsl(var(--brand-600))'} stroke="hsl(var(--brand-600))" strokeWidth={source === 'checkin-coach' ? 3 : 1} />;
              }} />
              <XAxis dataKey="month" tickFormatter={(monthLabel) => formatMonth(monthLabel, locale)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <RechartsTooltip content={<KpiTooltip locale={locale} unit={benchmark.unit} enteredByCoach={t('kpi.enteredByCoach')} />} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ label: t('kpi.benchmark'), value: benchmark.target }, { label: title, value: current ?? 0 }]} margin={{ top: 12, right: 10, bottom: 0, left: 10 }}>
              <XAxis dataKey="label" hide />
              <YAxis hide domain={[0, 'dataMax']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="hsl(var(--neutral-200))" />
                <Cell fill="hsl(var(--brand-600))" />
              </Bar>
              <RechartsTooltip formatter={(chartValue: number) => formatValue(chartValue, benchmark.unit, locale)} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
        {forecast ? (
          <>
            <span>{t('kpi.projectionBasis').replace('{n}', String(forecast.basedOnMonths))}</span>
            <span className={cn('font-medium', forecast.onTrack ? 'text-success' : 'text-muted-foreground')}>
              {forecast.onTrack && forecast.reachesTargetMonth
                ? t('kpi.onTrack').replace('{month}', formatMonth(forecast.reachesTargetMonth, locale))
                : t('kpi.offTrack')}
            </span>
          </>
        ) : history.length === 2 && twoPointDelta != null ? (
          <span className="font-mono tabular-nums">{twoPointDelta > 0 ? '+' : ''}{formatValue(twoPointDelta, benchmark.unit, locale)}</span>
        ) : (
          <span>{t('kpi.trendUnlocks')}</span>
        )}
      </div>
    </article>
  );
}