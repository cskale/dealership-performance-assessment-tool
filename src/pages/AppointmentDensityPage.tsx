import { useMemo, useState } from 'react';
import { Clock, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateAppointmentDensity,
  type AppointmentDensityInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULT_INPUTS: AppointmentDensityInputs = {
  numberOfBays: 8,
  hoursOpenPerDay: 10,
  avgServiceTimeHours: 1.2,
  bufferMinutes: 15,
  currentAppointmentsPerDay: 42,
  avgRevenuePerAppointment: 185,
};

const ACCENT = '#1D7AFC';
const CAPACITY = '#DFE1E6';

const FIELDS: { key: keyof AppointmentDensityInputs; label: string; suffix: string; step: number }[] = [
  { key: 'numberOfBays', label: 'Number of Service Bays', suffix: 'bays', step: 1 },
  { key: 'hoursOpenPerDay', label: 'Hours Open per Day', suffix: 'hrs', step: 0.5 },
  { key: 'avgServiceTimeHours', label: 'Avg Service Time per Appointment', suffix: 'hrs', step: 0.1 },
  { key: 'bufferMinutes', label: 'Buffer Between Appointments', suffix: 'min', step: 5 },
  { key: 'currentAppointmentsPerDay', label: 'Current Appointments per Day', suffix: 'appts', step: 1 },
  { key: 'avgRevenuePerAppointment', label: 'Avg Revenue per Appointment', suffix: '€', step: 5 },
];

function utilizationColor(pct: number | null): string {
  if (pct === null) return 'text-muted-foreground';
  if (pct >= 90) return 'text-red-600';
  if (pct >= 75) return 'text-green-600';
  return 'text-amber-600';
}

export default function AppointmentDensityPage() {
  const [inputs, setInputs] = useState<AppointmentDensityInputs>(DEFAULT_INPUTS);
  const outputs = useMemo(() => calculateAppointmentDensity(inputs), [inputs]);

  const handleChange = (field: keyof AppointmentDensityInputs, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const chartData = [
    { label: 'Current', value: inputs.currentAppointmentsPerDay, isCurrent: true },
    { label: 'Max Capacity', value: outputs.maxCapacityPerDay, isCurrent: false },
  ];

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Workshop Scheduling Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter bay capacity, service time, and current booking volume.
      </p>

      <div className="space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key} className="text-sm">
              {f.label} <span className="text-muted-foreground font-normal">({f.suffix})</span>
            </Label>
            <Input
              id={f.key}
              type="number"
              inputMode="decimal"
              min={0}
              step={f.step}
              value={inputs[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const rightCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Capacity Analysis</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Current bookings against maximum theoretical bay capacity per day.
      </p>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-muted-foreground">Utilization</span>
        <span className={`text-2xl font-bold ${utilizationColor(outputs.utilizationPct)}`}>
          {outputs.utilizationPct === null ? '—' : `${outputs.utilizationPct.toFixed(0)}%`}
        </span>
      </div>

      <div className="h-[160px] -ml-2 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="#EEF0F2" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} unit=" appts" />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fontSize: 11, fill: '#172B4D' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#F5F6F8' }}
              formatter={(value: number) => [`${value} appointments/day`, '']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE1E6' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.isCurrent ? ACCENT : CAPACITY} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6]">
        <StatRow label="Max Daily Capacity" value={`${outputs.maxCapacityPerDay} appointments`} />
        <StatRow label="Additional Capacity Available" value={`${outputs.additionalCapacity} appointments`} />
        <StatRow label="Current Daily Revenue" value={formatEuro(outputs.currentDailyRevenue)} />
        <StatRow label="Revenue Opportunity" value={formatEuro(outputs.revenueOpportunity)} emphasised />
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.additionalCapacity > 0 ? (
            <>
              Filling the remaining{' '}
              <span className="font-semibold text-[#172B4D]">{outputs.additionalCapacity} appointments/day</span>{' '}
              of open bay capacity is worth{' '}
              <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.revenueOpportunity)}</span> in
              additional daily revenue.
            </>
          ) : (
            <>Workshop is at or above theoretical capacity — consider extending hours or adding bays before booking more appointments.</>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Appointment Density Optimizer"
      icon={Clock}
      category="Operational Models"
      title="Appointment Density Optimizer"
      description="Optimize workshop scheduling for maximum throughput and minimum wait time."
      kpiStrip={[
        {
          label: 'Utilization',
          value: outputs.utilizationPct === null ? '—' : `${outputs.utilizationPct.toFixed(0)}%`,
          emphasis: true,
        },
        { label: 'Max Daily Capacity', value: `${outputs.maxCapacityPerDay} appts` },
        { label: 'Revenue Opportunity', value: formatEuro(outputs.revenueOpportunity) },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
    />
  );
}

function StatRow({ label, value, emphasised }: { label: string; value: React.ReactNode; emphasised?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={emphasised ? 'text-base font-bold text-[#172B4D]' : 'text-sm font-semibold text-[#172B4D]'}>
        {value}
      </span>
    </div>
  );
}
