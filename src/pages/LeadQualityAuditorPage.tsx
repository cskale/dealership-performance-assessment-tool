import { useMemo, useState } from 'react';
import { Target, Info, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  calculateLeadQuality,
  type LeadSourceInput,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULT_SOURCES: LeadSourceInput[] = [
  { name: 'Website', leadsReceived: 120, unitsClosed: 22, avgDaysToClose: 9, avgGrossProfitPerSale: 1500 },
  { name: 'OEM Referral', leadsReceived: 60, unitsClosed: 16, avgDaysToClose: 6, avgGrossProfitPerSale: 1650 },
  { name: 'Classifieds', leadsReceived: 90, unitsClosed: 9, avgDaysToClose: 14, avgGrossProfitPerSale: 1200 },
  { name: 'Walk-in', leadsReceived: 40, unitsClosed: 12, avgDaysToClose: 4, avgGrossProfitPerSale: 1550 },
];

const ACCENT = '#1D7AFC';
const BEST = '#22c55e';
const WORST = '#ef4444';

const formatScore = (n: number | null) => (n === null ? '—' : n.toFixed(0));
const formatPct = (n: number | null) => (n === null ? '—' : `${n.toFixed(1)}%`);

export default function LeadQualityAuditorPage() {
  const [sources, setSources] = useState<LeadSourceInput[]>(DEFAULT_SOURCES);
  const outputs = useMemo(() => calculateLeadQuality({ sources }), [sources]);

  const updateSource = (index: number, field: keyof LeadSourceInput, raw: string) => {
    setSources((prev) => prev.map((s, i) => {
      if (i !== index) return s;
      if (field === 'name') return { ...s, name: raw };
      const num = raw === '' ? 0 : Number(raw);
      if (Number.isNaN(num)) return s;
      return { ...s, [field]: num };
    }));
  };

  const addSource = () => {
    setSources((prev) => [
      ...prev,
      { name: `Source ${prev.length + 1}`, leadsReceived: 0, unitsClosed: 0, avgDaysToClose: 0, avgGrossProfitPerSale: 0 },
    ]);
  };

  const removeSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const chartData = [...outputs.results]
    .filter((r) => r.qualityScore !== null)
    .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
            Inputs
          </p>
          <h2 className="text-[15px] font-bold text-[#172B4D]">Lead Sources</h2>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addSource}>
          <Plus className="h-3 w-3" /> Add source
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Enter monthly lead volume, closes, average time to close, and GP per sale for each source.
      </p>

      <div className="space-y-4">
        {sources.map((s, i) => (
          <div key={i} className="rounded-lg border border-[#DFE1E6] p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={s.name}
                onChange={(e) => updateSource(i, 'name', e.target.value)}
                className="h-8 text-sm font-semibold"
                placeholder="Source name"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600"
                onClick={() => removeSource(i)}
                disabled={sources.length <= 1}
                aria-label={`Remove ${s.name || 'source'}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <MiniField label="Leads/mo" value={s.leadsReceived} onChange={(v) => updateSource(i, 'leadsReceived', v)} />
              <MiniField label="Units closed" value={s.unitsClosed} onChange={(v) => updateSource(i, 'unitsClosed', v)} />
              <MiniField label="Avg days to close" value={s.avgDaysToClose} onChange={(v) => updateSource(i, 'avgDaysToClose', v)} />
              <MiniField label="GP per sale (€)" value={s.avgGrossProfitPerSale} onChange={(v) => updateSource(i, 'avgGrossProfitPerSale', v)} step={50} />
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
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Quality Ranking</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Composite score: 50% close rate, 30% GP per lead, 20% close speed.
      </p>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="#EEF0F2" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11, fill: '#172B4D' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#F5F6F8' }}
              formatter={(value: number) => [value.toFixed(0), 'Quality Score']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DFE1E6' }}
            />
            <Bar dataKey="qualityScore" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === outputs.bestSource?.name ? BEST
                      : entry.name === outputs.worstSource?.name ? WORST
                      : ACCENT
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6] mt-2">
        <StatRow label="Total Leads" value={outputs.totalLeads} />
        <StatRow label="Blended GP per Lead" value={formatEuro(outputs.blendedGpPerLead ?? 0)} emphasised />
        {outputs.bestSource && (
          <StatRow label="Best Source" value={`${outputs.bestSource.name} (${formatScore(outputs.bestSource.qualityScore)})`} />
        )}
        {outputs.worstSource && outputs.worstSource.name !== outputs.bestSource?.name && (
          <StatRow label="Weakest Source" value={`${outputs.worstSource.name} (${formatScore(outputs.worstSource.qualityScore)})`} />
        )}
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.bestSource && outputs.worstSource && outputs.bestSource.name !== outputs.worstSource.name ? (
            <>
              <span className="font-semibold text-[#172B4D]">{outputs.bestSource.name}</span> converts at{' '}
              {formatPct(outputs.bestSource.closeRate)} close rate vs.{' '}
              <span className="font-semibold text-[#172B4D]">{outputs.worstSource.name}</span> at{' '}
              {formatPct(outputs.worstSource.closeRate)} — reallocating spend toward the stronger source
              raises blended GP per lead.
            </>
          ) : (
            <>Add at least two lead sources with leads and closes to compare quality.</>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Lead Quality Auditor"
      icon={Target}
      category="Sales Optimization"
      title="Lead Quality Auditor"
      description="Score lead sources by close rate, time-to-close, and gross profit contribution."
      kpiStrip={[
        { label: 'Blended GP per Lead', value: formatEuro(outputs.blendedGpPerLead ?? 0), emphasis: true },
        { label: 'Best Source', value: outputs.bestSource?.name ?? '—' },
        { label: 'Total Monthly Leads', value: String(outputs.totalLeads) },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
    />
  );
}

function MiniField({
  label, value, onChange, step = 1,
}: {
  label: string; value: number; onChange: (raw: string) => void; step?: number;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
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
