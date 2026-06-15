import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, X, Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculateReverseSalesFunnel,
  type ReverseSalesFunnelInputs,
} from '@/lib/playgroundCalculators';
import { usePlaygroundPrefill, formatPlaygroundPeriod } from '@/hooks/usePlaygroundPrefill';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEuro } from '@/utils/euroFormatter';
import { PLAYGROUND_KPI_MAPPINGS } from '@/data/playgroundKpiMappings';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const CALCULATOR_ID = 'reverse-sales-funnel';

const DEFAULTS: ReverseSalesFunnelInputs = {
  targetUnitSales: 50,
  avgGrossProfitPerUnit: 2000,
  leadToAppointmentRate: 40,
  appointmentShowRate: 65,
  showToCloseRate: 25,
};

type FieldId = keyof ReverseSalesFunnelInputs;

interface FieldConfig {
  id: FieldId;
  label: string;
  suffix?: string;
  min: number;
  max?: number;
  step: number;
  group: 'volume' | 'conversion';
}

const FIELDS: FieldConfig[] = [
  { id: 'targetUnitSales', label: 'Target Unit Sales', suffix: 'units', min: 0, step: 1, group: 'volume' },
  { id: 'avgGrossProfitPerUnit', label: 'Avg Gross Profit per Unit', suffix: '€', min: 0, step: 50, group: 'volume' },
  { id: 'leadToAppointmentRate', label: 'Lead → Appointment Rate', suffix: '%', min: 0, max: 100, step: 1, group: 'conversion' },
  { id: 'appointmentShowRate', label: 'Appointment → Show Rate', suffix: '%', min: 0, max: 100, step: 1, group: 'conversion' },
  { id: 'showToCloseRate', label: 'Show → Close Rate', suffix: '%', min: 0, max: 100, step: 1, group: 'conversion' },
];

const formatNumber = (n: number) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.ceil(n));

const renderRequired = (val: number | null) => {
  if (val === null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-muted-foreground cursor-help">—</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enter a non-zero rate to calculate this</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  return <span>{formatNumber(val)}</span>;
};

export default function ReverseSalesFunnelPage() {
  const { dealerId } = useActiveRole();
  const { language, t } = useLanguage();
  const { values: prefillValues, isLoading: prefillLoading } = usePlaygroundPrefill(
    CALCULATOR_ID,
    dealerId,
  );

  const [inputs, setInputs] = useState<ReverseSalesFunnelInputs>(DEFAULTS);
  const [dismissedChips, setDismissedChips] = useState<Record<string, boolean>>({});
  const [hydratedFromPrefill, setHydratedFromPrefill] = useState(false);

  useEffect(() => {
    if (hydratedFromPrefill || prefillLoading) return;
    if (Object.keys(prefillValues).length === 0) {
      setHydratedFromPrefill(true);
      return;
    }
    setInputs((prev) => {
      const next = { ...prev };
      (Object.keys(prefillValues) as FieldId[]).forEach((fieldId) => {
        const pv = prefillValues[fieldId];
        if (pv) next[fieldId] = pv.value;
      });
      return next;
    });
    setHydratedFromPrefill(true);
  }, [prefillValues, prefillLoading, hydratedFromPrefill]);

  const outputs = useMemo(() => calculateReverseSalesFunnel(inputs), [inputs]);

  const handleChange = (id: FieldId, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [id]: num }));
  };

  const chipTemplate = t('playground.prefillChip');
  const documentationKpiKey =
    PLAYGROUND_KPI_MAPPINGS[CALCULATOR_ID]?.avgGrossProfitPerUnit ?? null;

  const leadEfficiency =
    outputs.requiredLeads && outputs.requiredLeads > 0
      ? (inputs.targetUnitSales / outputs.requiredLeads) * 100
      : null;

  const yieldPerLead =
    outputs.requiredLeads && outputs.requiredLeads > 0
      ? outputs.projectedGrossProfit / outputs.requiredLeads
      : null;

  const renderField = (field: FieldConfig) => {
    const prefill = prefillValues[field.id];
    const showChip = prefill && !dismissedChips[field.id];
    const chipText = prefill
      ? chipTemplate.replace(
          '{period}',
          formatPlaygroundPeriod(prefill.assessmentDate, language === 'de' ? 'de' : 'en'),
        )
      : '';
    return (
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
        {showChip && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1D7AFC]/10 text-[#1D7AFC] px-2.5 py-1 text-xs">
            <span>{chipText}</span>
            <button
              type="button"
              onClick={() => setDismissedChips((prev) => ({ ...prev, [field.id]: true }))}
              className="hover:opacity-70"
              aria-label="Dismiss prefill notice"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const volumeFields = FIELDS.filter((f) => f.group === 'volume');
  const conversionFields = FIELDS.filter((f) => f.group === 'conversion');

  const funnelStages = [
    { label: 'Leads', value: outputs.requiredLeads, width: 100 },
    { label: 'Appointments', value: outputs.requiredAppointments, width: 78 },
    { label: 'Shows', value: outputs.requiredShows, width: 56 },
    { label: 'Sales', value: inputs.targetUnitSales, width: 34 },
  ];

  const leftCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Inputs
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Operational Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Configure target volume and current conversion performance.
      </p>
      <div className="space-y-4">
        {volumeFields.map(renderField)}
        <div className="pt-3 border-t border-[#DFE1E6]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            Conversion Rates
          </p>
          <div className="space-y-4">{conversionFields.map(renderField)}</div>
        </div>
      </div>
    </div>
  );

  const rightCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Required Funnel Volume</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Calculated volume requirements based on input conversion rates.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Funnel visualization */}
        <div className="flex flex-col items-center justify-center gap-1.5 py-2">
          {funnelStages.map((stage, i) => (
            <div
              key={stage.label}
              className="flex items-center justify-center text-xs font-medium text-white rounded-sm w-full"
              style={{
                width: `${stage.width}%`,
                height: 42,
                background: `hsl(var(--brand-500) / ${0.45 + i * 0.15})`,
              }}
            >
              <span className="opacity-90">{stage.label}</span>
              <span className="mx-1.5 opacity-50">·</span>
              <span>{stage.value === null ? '—' : formatNumber(stage.value)}</span>
            </div>
          ))}
        </div>

        {/* Stat list */}
        <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6] self-start">
          <StatRow label="Required Leads" value={renderRequired(outputs.requiredLeads)} />
          <StatRow
            label="Required Appointments"
            value={renderRequired(outputs.requiredAppointments)}
          />
          <StatRow
            label="Required Showroom Visits"
            value={renderRequired(outputs.requiredShows)}
          />
          <StatRow
            label="Targeted Unit Output"
            value={<span className="text-[#1D7AFC]">{formatNumber(inputs.targetUnitSales)}</span>}
            emphasised
          />
        </div>
      </div>

      {/* Insight callout */}
      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.requiredLeads === null ? (
            <>Enter non-zero conversion rates to generate a lead-volume insight.</>
          ) : (
            <>
              To reach <span className="font-semibold text-[#172B4D]">{formatNumber(inputs.targetUnitSales)}</span> unit sales
              at your current conversion rates, you'll need approximately{' '}
              <span className="font-semibold text-[#172B4D]">{formatNumber(outputs.requiredLeads)}</span> leads,{' '}
              <span className="font-semibold text-[#172B4D]">{formatNumber(outputs.requiredAppointments!)}</span>{' '}
              appointments, and{' '}
              <span className="font-semibold text-[#172B4D]">{formatNumber(outputs.requiredShows!)}</span> showroom visits.
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Reverse Sales Funnel Calculator"
      icon={TrendingUp}
      category="Sales Optimization"
      title="Reverse Sales Funnel"
      documentationKpiKey={documentationKpiKey}
      description="Work backward from a unit-sales target to the required funnel volume at each stage, based on your current conversion rates."
      kpiStrip={[
        {
          label: 'Projected Gross Profit',
          value: formatEuro(outputs.projectedGrossProfit),
          emphasis: true,
        },
        {
          label: 'Lead Efficiency',
          value: leadEfficiency === null ? '—' : `${leadEfficiency.toFixed(1)}%`,
        },
        {
          label: 'Required Lead Volume',
          value: outputs.requiredLeads === null ? '—' : formatNumber(outputs.requiredLeads),
        },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
      bottomStats={[
        {
          label: 'Yield Per Lead',
          value: yieldPerLead === null ? '—' : formatEuro(yieldPerLead),
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
