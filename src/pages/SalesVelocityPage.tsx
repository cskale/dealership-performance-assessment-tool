import { useMemo, useState } from 'react';
import { Gauge, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateSalesVelocity,
  type SalesVelocityInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro, formatNumber } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULT_INPUTS: SalesVelocityInputs = {
  monthlyLeads: 220,
  overallCloseRate: 18,
  avgGrossProfitPerUnit: 1450,
  leadToApptDays: 3,
  apptToShowDays: 2,
  showToCloseDays: 4,
};

const ACCENT = '#1D7AFC';
const BOTTLENECK = '#ef4444';

const FIELDS: { key: keyof SalesVelocityInputs; label: string; suffix: string; step: number }[] = [
  { key: 'monthlyLeads', label: 'Monthly Leads', suffix: 'leads', step: 5 },
  { key: 'overallCloseRate', label: 'Overall Close Rate', suffix: '%', step: 1 },
  { key: 'avgGrossProfitPerUnit', label: 'Avg Gross Profit per Unit', suffix: '€', step: 50 },
];

const STAGE_FIELDS: { key: keyof SalesVelocityInputs; label: string }[] = [
  { key: 'leadToApptDays', label: 'Lead → Appointment (days)' },
  { key: 'apptToShowDays', label: 'Appointment → Show (days)' },
  { key: 'showToCloseDays', label: 'Show → Close (days)' },
];

export default function SalesVelocityPage() {
  const [inputs, setInputs] = useState<SalesVelocityInputs>(DEFAULT_INPUTS);
  const outputs = useMemo(() => calculateSalesVelocity(inputs), [inputs]);

  const handleChange = (field: keyof SalesVelocityInputs, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const chartData = outputs.stageDurations.map((s) => ({
    stage: s.stage,
    days: s.days,
    isBottleneck: outputs.bottleneckStage?.stage === s.stage && s.days > 0,
  }));

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Pipeline Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter monthly lead volume, close rate, and average deal value.
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

      <div className="pt-4 mt-4 border-t border-[#DFE1E6]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
          Stage Durations
        </p>
        <div className="space-y-4">
          {STAGE_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-sm">{f.label}</Label>
              <Input
                id={f.key}
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={inputs[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
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
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Pipeline Velocity</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Stage duration by day — the longest bar is the bottleneck slowing deal flow.
      </p>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="#EEF0F2" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} unit="d" />
            <YAxis
              type="category"
              dataKey="stage"
              width={140}
              tick={{ fontSize: 11, fill: '#172B4D' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#F5F6F8' }}
              formatter={(value: number) => [`${value} days`, 'Duration']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE1E6' }}
            />
            <Bar dataKey="days" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {chartData.map((entry) => (
                <Cell key={entry.stage} fill={entry.isBottleneck ? BOTTLENECK : ACCENT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6] mt-2">
        <StatRow label="Total Sales Cycle" value={`${outputs.totalCycleDays} days`} />
        <StatRow label="Projected Monthly Sales" value={formatNumber(outputs.projectedSales)} />
        <StatRow label="Monthly Velocity (GP)" value={formatEuro(outputs.monthlyVelocity)} emphasised />
        <StatRow
          label="Daily Velocity"
          value={outputs.dailyVelocity === null ? '—' : `${formatEuro(outputs.dailyVelocity)} / day`}
        />
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.bottleneckStage && outputs.bottleneckStage.days > 0 ? (
            <>
              <span className="font-semibold text-[#172B4D]">{outputs.bottleneckStage.stage}</span> is your
              slowest stage at <span className="font-semibold text-[#172B4D]">{outputs.bottleneckStage.days} days</span> —
              tightening it shortens the full cycle and compounds monthly velocity.
            </>
          ) : (
            <>Enter stage durations to identify your pipeline bottleneck.</>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Sales Velocity Instrument"
      icon={Gauge}
      category="Sales Optimization"
      title="Sales Velocity Instrument"
      description="Quantify deal-flow speed across the pipeline and identify bottleneck stages."
      kpiStrip={[
        { label: 'Monthly Velocity', value: formatEuro(outputs.monthlyVelocity), emphasis: true },
        { label: 'Sales Cycle Length', value: `${outputs.totalCycleDays} days` },
        {
          label: 'Bottleneck Stage',
          value: outputs.bottleneckStage && outputs.bottleneckStage.days > 0 ? outputs.bottleneckStage.stage : '—',
        },
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
