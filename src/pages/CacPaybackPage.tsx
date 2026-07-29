import { useMemo, useState } from 'react';
import { PiggyBank, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateCacPayback,
  type CacPaybackInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULT_INPUTS: CacPaybackInputs = {
  monthlyMarketingSpend: 18000,
  monthlySalesStaffCost: 22000,
  unitsSoldPerMonth: 65,
  avgFrontEndGpPerUnit: 1450,
  avgMonthlyRecurringGpPerCustomer: 45,
};

const ACCENT = '#1D7AFC';

const FIELDS: { key: keyof CacPaybackInputs; label: string; suffix: string; step: number }[] = [
  { key: 'monthlyMarketingSpend', label: 'Monthly Marketing Spend', suffix: '€', step: 500 },
  { key: 'monthlySalesStaffCost', label: 'Monthly Sales Staff Cost', suffix: '€', step: 500 },
  { key: 'unitsSoldPerMonth', label: 'Units Sold per Month', suffix: 'units', step: 1 },
  { key: 'avgFrontEndGpPerUnit', label: 'Avg Front-End GP per Unit', suffix: '€', step: 50 },
  { key: 'avgMonthlyRecurringGpPerCustomer', label: 'Avg Monthly Service/Parts GP per Customer', suffix: '€', step: 5 },
];

export default function CacPaybackPage() {
  const [inputs, setInputs] = useState<CacPaybackInputs>(DEFAULT_INPUTS);
  const outputs = useMemo(() => calculateCacPayback(inputs), [inputs]);

  const handleChange = (field: keyof CacPaybackInputs, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Acquisition & Recovery Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter acquisition cost drivers and the recurring aftersales GP each customer generates.
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
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Recovery Trajectory</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Cumulative gross profit per customer against acquisition cost (dashed line).
      </p>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={outputs.cumulativeRecovery} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="cacRecoveryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EEF0F2" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(m) => (m === 0 ? 'Sale' : `M${m}`)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${Math.round(v / 100) / 10}k`}
              width={48}
            />
            <Tooltip
              formatter={(value: number) => [formatEuro(value), 'Cumulative GP']}
              labelFormatter={(m) => (m === 0 ? 'At point of sale' : `Month ${m}`)}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE1E6' }}
            />
            {outputs.cac !== null && (
              <ReferenceLine
                y={outputs.cac}
                stroke="#6B7280"
                strokeDasharray="4 4"
                label={{ value: `CAC ${formatEuro(outputs.cac)}`, position: 'insideTopRight', fontSize: 10, fill: '#6B7280' }}
              />
            )}
            <Area type="monotone" dataKey="cumulativeGp" stroke={ACCENT} strokeWidth={2} fill="url(#cacRecoveryFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6] mt-2">
        <StatRow label="Customer Acquisition Cost" value={outputs.cac === null ? '—' : formatEuro(outputs.cac)} />
        <StatRow
          label="Payback Period"
          value={
            outputs.paybackMonths === null
              ? 'Not recovered within model'
              : outputs.paybackMonths === 0
                ? 'Instant (at point of sale)'
                : `${outputs.paybackMonths.toFixed(1)} months`
          }
          emphasised
        />
        <StatRow label="Remaining CAC After Front GP" value={formatEuro(outputs.netCacAfterFrontGp)} />
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.paybackMonths === 0 ? (
            <>Front-end gross profit alone covers acquisition cost — every sale is profitable from day one.</>
          ) : outputs.paybackMonths !== null ? (
            <>
              After front-end gross profit, the remaining{' '}
              <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.netCacAfterFrontGp)}</span> is
              recovered from aftersales GP in{' '}
              <span className="font-semibold text-[#172B4D]">{outputs.paybackMonths.toFixed(1)} months</span>.
            </>
          ) : (
            <>Recurring GP per customer is zero — remaining CAC is never recovered without aftersales retention.</>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="CAC Payback Calculator"
      icon={PiggyBank}
      category="Marketing Intelligence"
      title="CAC Payback Calculator"
      description="Determine months to recover customer acquisition cost from average gross profit per unit."
      kpiStrip={[
        { label: 'Customer Acquisition Cost', value: outputs.cac === null ? '—' : formatEuro(outputs.cac), emphasis: true },
        {
          label: 'Payback Period',
          value: outputs.paybackMonths === null ? '—' : outputs.paybackMonths === 0 ? 'Instant' : `${outputs.paybackMonths.toFixed(1)} mo`,
        },
        { label: 'Total Monthly Acquisition Cost', value: formatEuro(outputs.totalMonthlyCost) },
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
