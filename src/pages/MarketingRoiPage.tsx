import { useEffect, useMemo, useState } from 'react';
import { Megaphone, Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateMarketingRoi,
  type MarketingRoiInputs,
  type MarketingChannel,
} from '@/lib/playgroundCalculators';
import { usePlaygroundPrefill, formatPlaygroundPeriod } from '@/hooks/usePlaygroundPrefill';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEuro } from '@/utils/euroFormatter';
import { PLAYGROUND_KPI_MAPPINGS } from '@/data/playgroundKpiMappings';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const CALCULATOR_ID = 'marketing-roi';

const DEFAULT_CHANNELS: MarketingChannel[] = [
  { name: 'Google Ads', monthlySpend: 5000, leadsGenerated: 80 },
  { name: 'Social (Meta/IG)', monthlySpend: 3000, leadsGenerated: 50 },
  { name: 'OEM Co-op', monthlySpend: 2000, leadsGenerated: 30 },
  { name: 'Direct Mail', monthlySpend: 1500, leadsGenerated: 20 },
  { name: 'Events/Sponsorships', monthlySpend: 2000, leadsGenerated: 15 },
];

interface SharedInputs {
  avgGrossProfitPerUnit: number;
  overallCloseRate: number;
}

const DEFAULT_SHARED: SharedInputs = {
  avgGrossProfitPerUnit: 2000,
  overallCloseRate: 25,
};

const formatNumber = (n: number) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.ceil(n));

const formatRoas = (n: number | null) =>
  n === null ? '—' : `${n.toFixed(2)}x`;

export default function MarketingRoiPage() {
  const { dealerId } = useActiveRole();
  const { language } = useLanguage();
  const { values: prefillValues, isLoading: prefillLoading } = usePlaygroundPrefill(
    CALCULATOR_ID,
    dealerId,
  );

  const [shared, setShared] = useState<SharedInputs>(DEFAULT_SHARED);
  const [channels, setChannels] = useState<MarketingChannel[]>(DEFAULT_CHANNELS);
  const [hydratedFromPrefill, setHydratedFromPrefill] = useState(false);

  useEffect(() => {
    if (hydratedFromPrefill || prefillLoading) return;
    if (Object.keys(prefillValues).length === 0) {
      setHydratedFromPrefill(true);
      return;
    }
    const pv = prefillValues['avgGrossProfitPerUnit'];
    if (pv) {
      setShared((prev) => ({ ...prev, avgGrossProfitPerUnit: pv.value }));
    }
    setHydratedFromPrefill(true);
  }, [prefillValues, prefillLoading, hydratedFromPrefill]);

  const inputs: MarketingRoiInputs = useMemo(
    () => ({ ...shared, channels }),
    [shared, channels],
  );
  const outputs = useMemo(() => calculateMarketingRoi(inputs), [inputs]);

  const handleSharedChange = (field: keyof SharedInputs, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setShared((prev) => ({ ...prev, [field]: num }));
  };

  const handleChannelChange = (
    index: number,
    field: 'monthlySpend' | 'leadsGenerated',
    raw: string,
  ) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setChannels((prev) =>
      prev.map((ch, i) => (i === index ? { ...ch, [field]: num } : ch)),
    );
  };

  const documentationKpiKey =
    PLAYGROUND_KPI_MAPPINGS[CALCULATOR_ID]?.avgGrossProfitPerUnit ?? null;

  const prefillChipText = prefillValues['avgGrossProfitPerUnit']
    ? `Seeded from ${formatPlaygroundPeriod(
        prefillValues['avgGrossProfitPerUnit'].assessmentDate,
        language === 'de' ? 'de' : 'en',
      )} assessment`
    : null;

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Operational Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Set average deal economics and per-channel marketing spend.
      </p>

      {/* Shared inputs */}
      <div className="space-y-4 mb-5">
        <div className="space-y-1.5">
          <Label htmlFor="avgGP" className="text-sm">
            Avg Gross Profit per Unit <span className="text-muted-foreground font-normal">(€)</span>
          </Label>
          <Input
            id="avgGP"
            type="number"
            inputMode="decimal"
            min={0}
            step={50}
            value={shared.avgGrossProfitPerUnit}
            onChange={(e) => handleSharedChange('avgGrossProfitPerUnit', e.target.value)}
          />
          {prefillChipText && (
            <p className="inline-flex items-center rounded-full bg-[#1D7AFC]/10 text-[#1D7AFC] px-2.5 py-1 text-xs">
              {prefillChipText}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="closeRate" className="text-sm">
            Overall Close Rate <span className="text-muted-foreground font-normal">(%)</span>
          </Label>
          <Input
            id="closeRate"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={1}
            value={shared.overallCloseRate}
            onChange={(e) => handleSharedChange('overallCloseRate', e.target.value)}
          />
        </div>
      </div>

      {/* Channel table */}
      <div className="pt-4 border-t border-[#DFE1E6]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
          Channel Spend & Leads
        </p>
        <div className="space-y-3">
          {channels.map((ch, i) => (
            <div key={ch.name} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
              <p className="text-xs font-medium text-[#172B4D] self-center">{ch.name}</p>
              <div className="w-24">
                <Label className="text-[10px] text-muted-foreground">Spend (€)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={100}
                  value={ch.monthlySpend}
                  onChange={(e) => handleChannelChange(i, 'monthlySpend', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-20">
                <Label className="text-[10px] text-muted-foreground">Leads</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={ch.leadsGenerated}
                  onChange={(e) => handleChannelChange(i, 'leadsGenerated', e.target.value)}
                  className="h-8 text-sm"
                />
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
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Channel Performance</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Per-channel return on ad spend and cost metrics.
      </p>

      {/* Results table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#DFE1E6]">
              <th className="text-left py-2 pr-2 text-muted-foreground font-semibold">Channel</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-semibold">CPL</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-semibold">CPS</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-semibold">ROAS</th>
              <th className="text-right py-2 pl-2 text-muted-foreground font-semibold">Share</th>
            </tr>
          </thead>
          <tbody>
            {outputs.channelResults.map((cr) => (
              <tr key={cr.name} className="border-b border-[#DFE1E6]/50">
                <td className="py-2 pr-2 font-medium text-[#172B4D]">{cr.name}</td>
                <td className="py-2 px-2 text-right">
                  {cr.costPerLead === null ? '—' : formatEuro(cr.costPerLead)}
                </td>
                <td className="py-2 px-2 text-right">
                  {cr.costPerSale === null ? '—' : formatEuro(cr.costPerSale)}
                </td>
                <td className="py-2 px-2 text-right">{formatRoas(cr.roas)}</td>
                <td className="py-2 pl-2 text-right">{cr.spendShare.toFixed(1)}%</td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="font-semibold text-[#172B4D]">
              <td className="py-2 pr-2">Total</td>
              <td className="py-2 px-2 text-right">
                {outputs.blendedCPL === null ? '—' : formatEuro(outputs.blendedCPL)}
              </td>
              <td className="py-2 px-2 text-right">
                {outputs.blendedCPS === null ? '—' : formatEuro(outputs.blendedCPS)}
              </td>
              <td className="py-2 px-2 text-right">{formatRoas(outputs.overallROAS)}</td>
              <td className="py-2 pl-2 text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Insight callout */}
      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Break-Even Insight: </span>
          {outputs.breakEvenCPL === null || outputs.breakEvenCPL === 0 ? (
            <>Enter a non-zero close rate and GP to calculate break-even cost per lead.</>
          ) : (
            <>
              At your current close rate and GP, break-even cost per lead is{' '}
              <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.breakEvenCPL)}</span>.
              Any channel with a CPL below this threshold is profitable.
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Marketing ROI Engine"
      icon={Megaphone}
      category="Marketing Intelligence"
      title="Marketing ROI Engine"
      documentationKpiKey={documentationKpiKey}
      description="Compute channel-level ROAS and break-even spend at your current funnel rates."
      kpiStrip={[
        {
          label: 'Total ROAS',
          value: formatRoas(outputs.overallROAS),
          emphasis: true,
        },
        {
          label: 'Blended CPL',
          value: outputs.blendedCPL === null ? '—' : formatEuro(outputs.blendedCPL),
        },
        {
          label: 'Total Marketing Spend',
          value: formatEuro(outputs.totalSpend),
        },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
      bottomStats={[
        {
          label: 'Break-Even CPL',
          value: outputs.breakEvenCPL === null ? '—' : formatEuro(outputs.breakEvenCPL),
        },
        {
          label: 'Total Leads Generated',
          value: formatNumber(outputs.totalLeads),
        },
      ]}
    />
  );
}
