import { useMemo, useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculateAbsorptionRate,
  type AbsorptionRateInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';
import { ScaleGauge } from '@/components/playground/ScaleGauge';
import { AnimatedNumber } from '@/components/playground/AnimatedNumber';
import { WhatIfHeader } from '@/components/playground/CalculatorPrimitives';

interface BaseInputs {
  serviceGrossProfit: number;
  partsGrossProfit: number;
  totalFixedOverhead: number;
}

interface Adjustments {
  serviceAdjustmentPct: number;
  partsAdjustmentPct: number;
  overheadAdjustmentPct: number;
}

const DEFAULT_BASE: BaseInputs = {
  serviceGrossProfit: 45000,
  partsGrossProfit: 25000,
  totalFixedOverhead: 60000,
};

const DEFAULT_ADJ: Adjustments = {
  serviceAdjustmentPct: 0,
  partsAdjustmentPct: 0,
  overheadAdjustmentPct: 0,
};

const formatPct = (n: number | null) => (n === null ? '—' : `${n.toFixed(1)}%`);

function absorptionColor(rate: number | null): string {
  if (rate === null) return 'text-neutral-300 from-neutral-200 to-neutral-300';
  if (rate >= 100) return 'text-success from-success/60 to-success';
  if (rate >= 80) return 'text-warning from-warning/60 to-warning';
  return 'text-destructive from-destructive/60 to-destructive';
}

export default function AbsorptionRateModelerPage() {
  const [base, setBase] = useState<BaseInputs>(DEFAULT_BASE);
  const [adj, setAdj] = useState<Adjustments>(DEFAULT_ADJ);

  const inputs: AbsorptionRateInputs = useMemo(
    () => ({ ...base, ...adj }),
    [base, adj],
  );
  const outputs = useMemo(() => calculateAbsorptionRate(inputs), [inputs]);

  const hasAdjustments =
    adj.serviceAdjustmentPct !== 0 ||
    adj.partsAdjustmentPct !== 0 ||
    adj.overheadAdjustmentPct !== 0;

  const handleBaseChange = (field: keyof BaseInputs, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setBase((prev) => ({ ...prev, [field]: num }));
  };

  const handleAdjChange = (field: keyof Adjustments, val: number) => {
    setAdj((prev) => ({ ...prev, [field]: val }));
  };

  const sliders: { field: keyof Adjustments; label: string; adjustedValue: number }[] = [
    { field: 'serviceAdjustmentPct', label: 'Service GP', adjustedValue: outputs.adjustedServiceGP },
    { field: 'partsAdjustmentPct', label: 'Parts GP', adjustedValue: outputs.adjustedPartsGP },
    { field: 'overheadAdjustmentPct', label: 'Fixed Overhead', adjustedValue: outputs.adjustedOverhead },
  ];

  const baselineValues: Record<keyof Adjustments, number> = {
    serviceAdjustmentPct: base.serviceGrossProfit,
    partsAdjustmentPct: base.partsGrossProfit,
    overheadAdjustmentPct: base.totalFixedOverhead,
  };
  const coverageChartData = [{
    label: 'Monthly coverage',
    service: outputs.adjustedServiceGP,
    parts: outputs.adjustedPartsGP,
  }];

  const leftCard = (
    <div className="playground-card min-w-0 bg-card rounded-lg border border-border shadow-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-elevated">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-foreground mb-1">Operational Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter monthly gross profit and fixed overhead figures.
      </p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="serviceGP" className="text-sm">
            Service Gross Profit <span className="text-muted-foreground font-normal">(€/month)</span>
          </Label>
          <Input
            id="serviceGP"
            type="number"
            inputMode="decimal"
            min={0}
            step={1000}
            value={base.serviceGrossProfit}
            onChange={(e) => handleBaseChange('serviceGrossProfit', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="partsGP" className="text-sm">
            Parts Gross Profit <span className="text-muted-foreground font-normal">(€/month)</span>
          </Label>
          <Input
            id="partsGP"
            type="number"
            inputMode="decimal"
            min={0}
            step={1000}
            value={base.partsGrossProfit}
            onChange={(e) => handleBaseChange('partsGrossProfit', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="overhead" className="text-sm flex items-center gap-1">
            Total Fixed Overhead <span className="text-muted-foreground font-normal">(€/month)</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px]">Salaries, rent, utilities, insurance — everything except variable COGS</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="overhead"
            type="number"
            inputMode="decimal"
            min={0}
            step={1000}
            value={base.totalFixedOverhead}
            onChange={(e) => handleBaseChange('totalFixedOverhead', e.target.value)}
          />
        </div>
      </div>

      {/* What-if sliders */}
      <div className="pt-4 mt-4 border-t border-border">
        <WhatIfHeader onReset={() => setAdj(DEFAULT_ADJ)} disabled={!hasAdjustments} />
        <div className="space-y-4">
          {sliders.map((s) => (
            <div key={s.field} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{s.label}</Label>
                <span key={`${s.field}-${adj[s.field]}`} className="animate-in fade-in zoom-in-95 duration-200 rounded-full border border-primary/15 bg-primary/5 px-2 py-1 text-[11px] font-semibold text-primary numeric">
                  {formatEuro(baselineValues[s.field])} → {adj[s.field] > 0 ? '+' : ''}{adj[s.field]}% · {formatEuro(s.adjustedValue - baselineValues[s.field])}
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={1}
                value={adj[s.field]}
                onChange={(e) => handleAdjChange(s.field, Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-all duration-200"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>−20%</span>
                <span>0%</span>
                <span>+20%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const rightCard = (
    <div className="playground-card min-w-0 bg-card rounded-lg border border-border shadow-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-elevated">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-foreground mb-1">Absorption Analysis</h2>
      <p className="text-xs text-muted-foreground mb-5">
        How well aftersales gross profit covers fixed dealership overhead.
      </p>

      {/* Absorption gauge */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-muted-foreground">Absorption Rate</span>
          <AnimatedNumber value={formatPct(outputs.adjustedAbsorptionRate)} className={`text-2xl font-bold numeric ${
            outputs.adjustedAbsorptionRate !== null && outputs.adjustedAbsorptionRate >= 100
              ? 'text-green-600'
              : outputs.adjustedAbsorptionRate !== null && outputs.adjustedAbsorptionRate >= 80
                ? 'text-amber-600'
                : 'text-red-600'
          }`} />
        </div>
        <ScaleGauge
          value={outputs.adjustedAbsorptionRate}
          max={150}
          target={100}
          fillClass={absorptionColor(outputs.adjustedAbsorptionRate)}
        />
      </div>

      <div className="mb-5 rounded-lg border border-border bg-muted/30 p-3" role="img" aria-label={`Service and parts gross profit total ${formatEuro(outputs.adjustedServiceGP + outputs.adjustedPartsGP)} against fixed overhead of ${formatEuro(outputs.adjustedOverhead)}.`}>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coverageChartData} layout="vertical" margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid horizontal={false} stroke="hsl(var(--neutral-100))" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" hide />
              <ChartTooltip formatter={(value: number) => formatEuro(value)} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine x={outputs.adjustedOverhead} stroke="hsl(var(--neutral-600))" strokeDasharray="4 4" label={{ value: 'Fixed overhead', position: 'insideTopRight', fontSize: 10, fill: 'hsl(var(--neutral-600))' }} />
              <Bar dataKey="service" name="Service GP" stackId="coverage" fill="hsl(var(--brand-500))" radius={[4, 0, 0, 4]} maxBarSize={34} />
              <Bar dataKey="parts" name="Parts GP" stackId="coverage" fill="hsl(var(--dd-teal))" radius={[0, 4, 4, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat rows */}
      <div className="rounded-lg border border-border divide-y divide-border bg-card">
        <StatRow label="Baseline Absorption" value={formatPct(outputs.baselineAbsorptionRate)} />
        {hasAdjustments && (
          <StatRow label="Adjusted Absorption" value={formatPct(outputs.adjustedAbsorptionRate)} emphasised />
        )}
        <StatRow
          label="Monthly Surplus / Deficit"
          value={formatEuro(outputs.monthlySurplusDeficit)}
          emphasised
        />
        <StatRow label="Service GP Share" value={formatPct(outputs.serviceGpShare)} />
        <StatRow label="Parts GP Share" value={formatPct(outputs.partsGpShare)} />
      </div>

      {/* Insight callout */}
      <div className={`mt-5 flex gap-3 rounded-lg border px-4 py-3.5 shadow-soft transition-colors duration-200 ${outputs.adjustedAbsorptionRate === null ? 'border-primary/20 bg-primary/5' : outputs.adjustedAbsorptionRate >= 100 ? 'border-success/25 bg-success/5' : outputs.adjustedAbsorptionRate >= 80 ? 'border-warning/30 bg-warning/5' : 'border-destructive/25 bg-destructive/5'}`}>
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="block text-sm font-bold text-foreground">Calculated Insight</span>
          {outputs.adjustedAbsorptionRate === null ? (
            <>Enter a non-zero overhead value to calculate absorption rate.</>
          ) : outputs.adjustedAbsorptionRate >= 100 ? (
            <>
              Aftersales departments fully cover fixed overhead with{' '}
              <span className="font-semibold text-foreground">{formatEuro(outputs.monthlySurplusDeficit)}</span>{' '}
              monthly surplus.
            </>
          ) : (
            <>
              Fixed overhead is{' '}
              <span className="font-semibold text-foreground">
                {(100 - outputs.adjustedAbsorptionRate).toFixed(1)}%
              </span>{' '}
              under-absorbed. Closing the gap requires{' '}
              <span className="font-semibold text-foreground">
                {formatEuro(Math.abs(outputs.monthlySurplusDeficit))}
              </span>
              /month in additional aftersales GP.
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Absorption Rate Modeler"
      icon={ShieldCheck}
      category="Operational Models"
      title="Absorption Rate Modeler"
      description="Model how service and parts gross profit cover fixed dealership overhead."
      kpiStrip={[
        {
          label: 'Absorption Rate',
          value: formatPct(outputs.adjustedAbsorptionRate),
          emphasis: true,
          caption: 'Aftersales coverage of fixed overhead',
          status: outputs.adjustedAbsorptionRate === null ? 'neutral' : outputs.adjustedAbsorptionRate >= 100 ? 'good' : outputs.adjustedAbsorptionRate >= 80 ? 'watch' : 'risk',
        },
        {
          label: 'Monthly Surplus/Deficit',
          value: formatEuro(outputs.monthlySurplusDeficit),
          caption: 'Monthly position after fixed overhead',
        },
        {
          label: 'Service / Parts GP Split',
          value: outputs.serviceGpShare !== null && outputs.partsGpShare !== null
            ? `${Math.round(outputs.serviceGpShare)}% / ${Math.round(outputs.partsGpShare)}%`
            : '—',
          caption: 'Contribution mix across aftersales',
        },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
    />
  );
}

function StatRow({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: React.ReactNode;
  emphasised?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <AnimatedNumber value={value} className={emphasised ? 'text-base font-bold text-foreground numeric' : 'text-sm font-semibold text-foreground numeric'} />
    </div>
  );
}
