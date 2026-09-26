import { useMemo, useState } from 'react';
import { Wrench, Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateTechUtilization,
  type TechUtilizationInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';
import { ScaleGauge } from '@/components/playground/ScaleGauge';
import { AnimatedNumber } from '@/components/playground/AnimatedNumber';
import { KpiCheckinControl } from '@/components/playground/KpiCheckinControl';

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
  if (rate === null) return 'text-neutral-300 from-neutral-200 to-neutral-300';
  if (rate >= 85) return 'text-success from-success/60 to-success';
  if (rate >= 70) return 'text-warning from-warning/60 to-warning';
  return 'text-destructive from-destructive/60 to-destructive';
}

export default function TechUtilizationPage() {
  const [inputs, setInputs] = useState<TechUtilizationInputs>(DEFAULTS);
  const [emptyFields, setEmptyFields] = useState<Record<string, boolean>>({});

  const outputs = useMemo(() => calculateTechUtilization(inputs), [inputs]);

  const handleChange = (id: FieldId, raw: string) => {
    setEmptyFields((prev) => ({ ...prev, [id]: raw === '' }));
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [id]: num }));
  };

  const capacityFields = FIELDS.filter((f) => f.group === 'capacity');
  const performanceFields = FIELDS.filter((f) => f.group === 'performance');
  const hoursChartData = [
    { label: 'Billed', hours: inputs.actualBilledHoursPerMonth, fill: 'hsl(var(--brand-500))' },
    { label: 'Idle', hours: outputs.idleHours, fill: 'hsl(var(--warning))' },
    { label: 'Available', hours: outputs.totalAvailableHours, fill: 'hsl(var(--neutral-200))' },
  ];

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
      {field.id === 'effectiveLabourRate' && (
        <KpiCheckinControl
          kpiKey="svc_effective_labour_rate"
          value={inputs.effectiveLabourRate}
          empty={emptyFields.effectiveLabourRate}
        />
      )}
    </div>
  );

  const leftCard = (
    <div className="playground-card min-w-0 bg-card rounded-lg border border-border shadow-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-elevated">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-foreground mb-1">Workshop Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter workshop capacity and actual billing performance.
      </p>
      <div className="space-y-4">
        {capacityFields.map(renderField)}
        <div className="pt-3 border-t border-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            Billing Performance
          </p>
          <div className="space-y-4">{performanceFields.map(renderField)}</div>
        </div>
      </div>
    </div>
  );

  const rightCard = (
    <div className="playground-card min-w-0 bg-card rounded-lg border border-border shadow-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-elevated">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-foreground mb-1">Utilization Analysis</h2>
      <p className="text-xs text-muted-foreground mb-5">
        How effectively technician capacity converts to billed revenue.
      </p>

      {/* Utilization gauge */}
      <div className="mb-5">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <span className="text-xs text-muted-foreground">Utilization Rate</span>
          <div className="flex min-w-0 flex-col items-start gap-2 sm:items-end">
            <AnimatedNumber value={formatPct(outputs.utilizationPct)} className={`text-2xl font-bold numeric ${
              outputs.utilizationPct !== null && outputs.utilizationPct >= 85
                ? 'text-green-600'
                : outputs.utilizationPct !== null && outputs.utilizationPct >= 70
                  ? 'text-amber-600'
                  : 'text-red-600'
            }`} />
            <KpiCheckinControl
              kpiKey="svc_workshop_loading_pct"
              value={outputs.utilizationPct}
            />
          </div>
        </div>
        <ScaleGauge
          value={outputs.utilizationPct}
          max={120}
          target={85}
          fillClass={utilizationColor(outputs.utilizationPct)}
        />
      </div>

      <div className="mb-5 rounded-lg border border-border bg-muted/30 p-3" role="img" aria-label={`${formatNum(inputs.actualBilledHoursPerMonth)} billed hours and ${formatNum(outputs.idleHours)} idle hours from ${formatNum(outputs.totalAvailableHours)} available hours.`}>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hoursChartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid horizontal={false} stroke="hsl(var(--neutral-100))" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" width={62} tick={{ fontSize: 10, fill: 'hsl(var(--neutral-600))' }} axisLine={false} tickLine={false} />
              <ChartTooltip formatter={(value: number) => [`${formatNum(value)} hrs`, 'Hours']} />
              <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {hoursChartData.map((entry) => <Cell key={entry.label} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat rows */}
      <div className="rounded-lg border border-border divide-y divide-border bg-card">
        <StatRow label="Total Available Hours" value={`${formatNum(outputs.totalAvailableHours)} hrs`} />
        <StatRow label="Billed Hours" value={`${formatNum(inputs.actualBilledHoursPerMonth)} hrs`} />
        <StatRow label="Idle Hours" value={`${formatNum(outputs.idleHours)} hrs`} />
        <StatRow label="Revenue at Current Utilization" value={formatEuro(outputs.revenueAtCurrentUtil)} emphasised />
        <StatRow label="Revenue at Full Utilization" value={formatEuro(outputs.revenueAtFullUtil)} />
        <StatRow label="Revenue Opportunity Lost" value={formatEuro(outputs.revenueLost)} />
      </div>

      {/* Insight callout */}
      <div className={`mt-5 flex gap-3 rounded-lg border px-4 py-3.5 shadow-soft transition-colors duration-200 ${outputs.utilizationPct === null ? 'border-primary/20 bg-primary/5' : outputs.utilizationPct >= 85 ? 'border-success/25 bg-success/5' : outputs.utilizationPct >= 70 ? 'border-warning/30 bg-warning/5' : 'border-destructive/25 bg-destructive/5'}`}>
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="block text-sm font-bold text-foreground">Calculated Insight</span>
          {outputs.utilizationPct === null ? (
            <>Enter technician count and hours to calculate utilization.</>
          ) : outputs.utilizationPct >= 85 ? (
            <>
              Workshop is running at{' '}
              <span className="font-semibold text-foreground">{formatPct(outputs.utilizationPct)}</span>{' '}
              utilization — strong performance. Focus on efficiency and labour rate optimization.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{formatNum(outputs.idleHours)}</span> idle hours
              represent{' '}
              <span className="font-semibold text-foreground">{formatEuro(outputs.revenueLost)}</span> in
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
          caption: 'Billed hours as a share of capacity',
          status: outputs.utilizationPct === null ? 'neutral' : outputs.utilizationPct >= 85 ? 'good' : outputs.utilizationPct >= 70 ? 'watch' : 'risk',
        },
        {
          label: 'Revenue at Current Util.',
          value: formatEuro(outputs.revenueAtCurrentUtil),
          caption: 'Monthly labour revenue captured',
        },
        {
          label: 'Revenue Opportunity Lost',
          value: formatEuro(outputs.revenueLost),
          caption: 'Potential revenue in idle capacity',
          status: outputs.revenueLost > 0 ? 'watch' : 'good',
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
      <AnimatedNumber value={value} className={emphasised ? 'text-base font-bold text-foreground numeric' : 'text-sm font-semibold text-foreground numeric'} />
    </div>
  );
}
