import { useMemo, useState } from 'react';
import { Wrench, Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateTechUtilization,
  type TechUtilizationInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULTS: TechUtilizationInputs = {
  numberOfTechnicians: 5,
  availableHoursPerTechPerDay: 8,
  workingDaysPerMonth: 22,
  actualBilledHoursPerMonth: 660,
  effectiveLabourRate: 95,
};

type FieldId = keyof TechUtilizationInputs;

interface FieldConfig {
  id: FieldId;
  label: string;
  suffix?: string;
  min: number;
  max?: number;
  step: number;
  group: 'capacity' | 'performance';
}

const FIELDS: FieldConfig[] = [
  { id: 'numberOfTechnicians', label: 'Number of Technicians', suffix: 'techs', min: 0, step: 1, group: 'capacity' },
  { id: 'availableHoursPerTechPerDay', label: 'Available Hours per Tech/Day', suffix: 'hrs', min: 0, max: 24, step: 0.5, group: 'capacity' },
  { id: 'workingDaysPerMonth', label: 'Working Days per Month', suffix: 'days', min: 0, max: 31, step: 1, group: 'capacity' },
  { id: 'actualBilledHoursPerMonth', label: 'Actual Billed Hours/Month', suffix: 'hrs', min: 0, step: 10, group: 'performance' },
  { id: 'effectiveLabourRate', label: 'Effective Labour Rate', suffix: '€/hr', min: 0, step: 5, group: 'performance' },
];

const formatNum = (n: number) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

const formatPct = (n: number | null) => (n === null ? '—' : `${n.toFixed(1)}%`);

function utilizationColor(rate: number | null): string {
  if (rate === null) return 'bg-gray-200';
  if (rate >= 85) return 'bg-green-500';
  if (rate >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function TechUtilizationPage() {
  const [inputs, setInputs] = useState<TechUtilizationInputs>(DEFAULTS);

  const outputs = useMemo(() => calculateTechUtilization(inputs), [inputs]);

  const handleChange = (id: FieldId, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [id]: num }));
  };

  const capacityFields = FIELDS.filter((f) => f.group === 'capacity');
  const performanceFields = FIELDS.filter((f) => f.group === 'performance');

  const gaugeWidth = outputs.utilizationPct === null
    ? 0
    : Math.min(outputs.utilizationPct, 120);

  const renderField = (field: FieldConfig) => (
    <div key={field.id} className="space-y-1.5">
      <Label htmlFor={field.id} className="text-sm">
        {field.label}
        {field.suffix && (
          <span className="ml-1 text-muted-foreground font-normal">({field.suffix})</span>
        )}
      </Label>
      <Input
        id={field.id}
        type="number"
        inputMode="decimal"
        min={field.min}
        max={field.max}
        step={field.step}
        value={inputs[field.id]}
        onChange={(e) => handleChange(field.id, e.target.value)}
      />
    </div>
  );

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Workshop Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter workshop capacity and actual billing performance.
      </p>
      <div className="space-y-4">
        {capacityFields.map(renderField)}
        <div className="pt-3 border-t border-[#DFE1E6]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            Billing Performance
          </p>
          <div className="space-y-4">{performanceFields.map(renderField)}</div>
        </div>
      </div>
    </div>
  );

  const rightCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Utilization Analysis</h2>
      <p className="text-xs text-muted-foreground mb-5">
        How effectively technician capacity converts to billed revenue.
      </p>

      {/* Utilization gauge */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-muted-foreground">Utilization Rate</span>
          <span className={`text-2xl font-bold ${
            outputs.utilizationPct !== null && outputs.utilizationPct >= 85
              ? 'text-green-600'
              : outputs.utilizationPct !== null && outputs.utilizationPct >= 70
                ? 'text-amber-600'
                : 'text-red-600'
          }`}>
            {formatPct(outputs.utilizationPct)}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${utilizationColor(outputs.utilizationPct)}`}
            style={{ width: `${Math.max(0, (gaugeWidth / 120) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0%</span>
          <span className="border-l border-dashed border-gray-300 px-1">85%</span>
          <span>120%</span>
        </div>
      </div>

      {/* Stat rows */}
      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6]">
        <StatRow label="Total Available Hours" value={`${formatNum(outputs.totalAvailableHours)} hrs`} />
        <StatRow label="Billed Hours" value={`${formatNum(inputs.actualBilledHoursPerMonth)} hrs`} />
        <StatRow label="Idle Hours" value={`${formatNum(outputs.idleHours)} hrs`} />
        <StatRow label="Revenue at Current Utilization" value={formatEuro(outputs.revenueAtCurrentUtil)} emphasised />
        <StatRow label="Revenue at Full Utilization" value={formatEuro(outputs.revenueAtFullUtil)} />
        <StatRow label="Revenue Opportunity Lost" value={formatEuro(outputs.revenueLost)} />
      </div>

      {/* Insight callout */}
      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.utilizationPct === null ? (
            <>Enter technician count and hours to calculate utilization.</>
          ) : outputs.utilizationPct >= 85 ? (
            <>
              Workshop is running at{' '}
              <span className="font-semibold text-[#172B4D]">{formatPct(outputs.utilizationPct)}</span>{' '}
              utilization — strong performance. Focus on efficiency and labour rate optimization.
            </>
          ) : (
            <>
              <span className="font-semibold text-[#172B4D]">{formatNum(outputs.idleHours)}</span> idle hours
              represent{' '}
              <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.revenueLost)}</span> in
              unrealised monthly revenue at your current labour rate.
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Technician Utilization Calculator"
      icon={Wrench}
      category="Operational Models"
      title="Technician Utilization"
      description="Calculate technician utilization to measure workshop capacity and identify revenue opportunities from idle hours."
      kpiStrip={[
        {
          label: 'Utilization Rate',
          value: formatPct(outputs.utilizationPct),
          emphasis: true,
        },
        {
          label: 'Revenue at Current Util.',
          value: formatEuro(outputs.revenueAtCurrentUtil),
        },
        {
          label: 'Revenue Opportunity Lost',
          value: formatEuro(outputs.revenueLost),
        },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
      bottomStats={[
        {
          label: 'Idle Hours per Month',
          value: `${formatNum(outputs.idleHours)} hrs`,
        },
        {
          label: 'Effective Labour Rate',
          value: formatEuro(inputs.effectiveLabourRate) + '/hr',
        },
      ]}
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
