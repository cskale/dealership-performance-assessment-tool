import { useMemo, useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculateAbsorptionRate,
  type AbsorptionRateInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

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
  if (rate === null) return 'bg-gray-200';
  if (rate >= 100) return 'bg-green-500';
  if (rate >= 80) return 'bg-amber-500';
  return 'bg-red-500';
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

  const gaugeWidth = outputs.adjustedAbsorptionRate === null
    ? 0
    : Math.min(outputs.adjustedAbsorptionRate, 150);

  const sliders: { field: keyof Adjustments; label: string; adjustedValue: number }[] = [
    { field: 'serviceAdjustmentPct', label: 'Service GP', adjustedValue: outputs.adjustedServiceGP },
    { field: 'partsAdjustmentPct', label: 'Parts GP', adjustedValue: outputs.adjustedPartsGP },
    { field: 'overheadAdjustmentPct', label: 'Fixed Overhead', adjustedValue: outputs.adjustedOverhead },
  ];

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Operational Inputs</h2>
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
      <div className="pt-4 mt-4 border-t border-[#DFE1E6]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
          What-If Adjustments
        </p>
        <div className="space-y-4">
          {sliders.map((s) => (
            <div key={s.field} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{s.label}</Label>
                <span className="text-xs font-medium text-[#172B4D]">
                  {adj[s.field] > 0 ? '+' : ''}{adj[s.field]}% → {formatEuro(s.adjustedValue)}
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={1}
                value={adj[s.field]}
                onChange={(e) => handleAdjChange(s.field, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D7AFC]"
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
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Absorption Analysis</h2>
      <p className="text-xs text-muted-foreground mb-5">
        How well aftersales gross profit covers fixed dealership overhead.
      </p>

      {/* Absorption gauge */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-muted-foreground">Absorption Rate</span>
          <span className={`text-2xl font-bold ${
            outputs.adjustedAbsorptionRate !== null && outputs.adjustedAbsorptionRate >= 100
              ? 'text-green-600'
              : outputs.adjustedAbsorptionRate !== null && outputs.adjustedAbsorptionRate >= 80
                ? 'text-amber-600'
                : 'text-red-600'
          }`}>
            {formatPct(outputs.adjustedAbsorptionRate)}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${absorptionColor(outputs.adjustedAbsorptionRate)}`}
            style={{ width: `${Math.max(0, (gaugeWidth / 150) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0%</span>
          <span className="border-l border-dashed border-gray-300 px-1">100%</span>
          <span>150%</span>
        </div>
      </div>

      {/* Stat rows */}
      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6]">
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
      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.adjustedAbsorptionRate === null ? (
            <>Enter a non-zero overhead value to calculate absorption rate.</>
          ) : outputs.adjustedAbsorptionRate >= 100 ? (
            <>
              Aftersales departments fully cover fixed overhead with{' '}
              <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.monthlySurplusDeficit)}</span>{' '}
              monthly surplus.
            </>
          ) : (
            <>
              Fixed overhead is{' '}
              <span className="font-semibold text-[#172B4D]">
                {(100 - outputs.adjustedAbsorptionRate).toFixed(1)}%
              </span>{' '}
              under-absorbed. Closing the gap requires{' '}
              <span className="font-semibold text-[#172B4D]">
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
        },
        {
          label: 'Monthly Surplus/Deficit',
          value: formatEuro(outputs.monthlySurplusDeficit),
        },
        {
          label: 'Aftersales GP Share',
          value: outputs.serviceGpShare !== null && outputs.partsGpShare !== null
            ? '100%'
            : '—',
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
      <span className={emphasised ? 'text-base font-bold text-[#172B4D]' : 'text-sm font-semibold text-[#172B4D]'}>
        {value}
      </span>
    </div>
  );
}
