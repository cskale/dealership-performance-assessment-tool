import { useMemo, useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateFiPenetration,
  type FiProductInput,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULT_UNITS = 65;

// Fixed categorical order/colors — never reassigned when a row is edited.
const DEFAULT_PRODUCTS: FiProductInput[] = [
  { name: 'Finance', attachRate: 62, avgGpPerAttach: 380 },
  { name: 'Insurance', attachRate: 28, avgGpPerAttach: 220 },
  { name: 'Extended Warranty', attachRate: 34, avgGpPerAttach: 410 },
  { name: 'GAP', attachRate: 19, avgGpPerAttach: 150 },
];

const PRODUCT_COLORS: Record<string, string> = {
  Finance: '#1D7AFC',
  Insurance: '#7c3aed',
  'Extended Warranty': '#059669',
  GAP: '#d97706',
};
const FALLBACK_COLOR = '#6B7280';

export default function FiPenetrationPage() {
  const [unitsSoldPerMonth, setUnitsSoldPerMonth] = useState(DEFAULT_UNITS);
  const [products, setProducts] = useState<FiProductInput[]>(DEFAULT_PRODUCTS);
  const outputs = useMemo(() => calculateFiPenetration({ unitsSoldPerMonth, products }), [unitsSoldPerMonth, products]);

  const updateProduct = (index: number, field: keyof FiProductInput, raw: string) => {
    setProducts((prev) => prev.map((p, i) => {
      if (i !== index) return p;
      const num = raw === '' ? 0 : Number(raw);
      if (Number.isNaN(num)) return p;
      return { ...p, [field]: num };
    }));
  };

  const chartData = outputs.productResults.map((r) => ({ name: r.name, totalGp: r.totalGp }));

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">F&amp;I Attach Rates</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter monthly unit sales and attach rate + average GP for each F&amp;I product.
      </p>

      <div className="space-y-1.5 mb-5">
        <Label htmlFor="units" className="text-sm">
          Units Sold per Month
        </Label>
        <Input
          id="units"
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          value={unitsSoldPerMonth}
          onChange={(e) => {
            const num = e.target.value === '' ? 0 : Number(e.target.value);
            if (!Number.isNaN(num)) setUnitsSoldPerMonth(num);
          }}
        />
      </div>

      <div className="space-y-3">
        {products.map((p, i) => (
          <div key={p.name} className="rounded-lg border border-[#DFE1E6] p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PRODUCT_COLORS[p.name] ?? FALLBACK_COLOR }}
              />
              <span className="text-sm font-semibold text-[#172B4D]">{p.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Attach Rate (%)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={1}
                  value={p.attachRate}
                  onChange={(e) => updateProduct(i, 'attachRate', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Avg GP per Attach (€)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={10}
                  value={p.avgGpPerAttach}
                  onChange={(e) => updateProduct(i, 'avgGpPerAttach', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
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
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">F&amp;I Gross Profit by Product</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Monthly gross profit contribution from each finance & insurance product line.
      </p>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="#EEF0F2" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${Math.round(v / 100) / 10}k`} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 11, fill: '#172B4D' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#F5F6F8' }}
              formatter={(value: number) => [formatEuro(value), 'Monthly GP']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE1E6' }}
            />
            <Bar dataKey="totalGp" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={PRODUCT_COLORS[entry.name] ?? FALLBACK_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6] mt-2">
        <StatRow label="Total F&I GP / Month" value={formatEuro(outputs.totalFiGp)} emphasised />
        <StatRow label="F&I GP per Unit" value={outputs.fiGpPerUnit === null ? '—' : formatEuro(outputs.fiGpPerUnit)} />
        <StatRow label="Blended Attach Rate" value={outputs.blendedAttachRate === null ? '—' : `${outputs.blendedAttachRate.toFixed(0)}%`} />
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.fiGpPerUnit !== null && outputs.fiGpPerUnit < 800 ? (
            <>
              F&amp;I GP per unit is <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.fiGpPerUnit)}</span>,
              below the ~€800–1,200 industry benchmark — raising Extended Warranty or GAP attach rates has the most
              headroom to close the gap.
            </>
          ) : outputs.fiGpPerUnit !== null ? (
            <>
              F&amp;I GP per unit is <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.fiGpPerUnit)}</span>,
              at or above the industry benchmark range.
            </>
          ) : (
            <>Enter unit sales to calculate F&amp;I gross profit per unit.</>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="F&I Penetration Calculator"
      icon={Sparkles}
      category="Operational Models"
      title="F&I Penetration Calculator"
      description="Model finance, insurance, and warranty attach rates against gross profit uplift."
      kpiStrip={[
        { label: 'Total F&I GP / Month', value: formatEuro(outputs.totalFiGp), emphasis: true },
        { label: 'F&I GP per Unit', value: outputs.fiGpPerUnit === null ? '—' : formatEuro(outputs.fiGpPerUnit) },
        { label: 'Blended Attach Rate', value: outputs.blendedAttachRate === null ? '—' : `${outputs.blendedAttachRate.toFixed(0)}%` },
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
