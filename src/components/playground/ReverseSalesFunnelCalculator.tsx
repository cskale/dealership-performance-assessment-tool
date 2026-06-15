import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
}

const FIELDS: FieldConfig[] = [
  { id: 'targetUnitSales', label: 'Target Unit Sales', suffix: 'units', min: 0, step: 1 },
  { id: 'avgGrossProfitPerUnit', label: 'Avg Gross Profit per Unit', suffix: '€', min: 0, step: 50 },
  { id: 'leadToAppointmentRate', label: 'Lead → Appointment Rate', suffix: '%', min: 0, max: 100, step: 1 },
  { id: 'appointmentShowRate', label: 'Appointment → Show Rate', suffix: '%', min: 0, max: 100, step: 1 },
  { id: 'showToCloseRate', label: 'Show → Close Rate', suffix: '%', min: 0, max: 100, step: 1 },
];

const formatNumber = (n: number) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.ceil(n));

export function ReverseSalesFunnelCalculator() {
  const { dealerId } = useActiveRole();
  const { language, t } = useLanguage();
  const { values: prefillValues, isLoading: prefillLoading } = usePlaygroundPrefill(
    CALCULATOR_ID,
    dealerId,
  );

  const [inputs, setInputs] = useState<ReverseSalesFunnelInputs>(DEFAULTS);
  const [dismissedChips, setDismissedChips] = useState<Record<string, boolean>>({});
  const [hydratedFromPrefill, setHydratedFromPrefill] = useState(false);

  // Pre-fill once when prefill values arrive
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Reverse Sales Funnel Calculator</CardTitle>
        <CardDescription>
          Work backward from a unit-sales target to the required funnel volume at each stage,
          based on your current conversion rates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-5">
            <h3 className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">
              Inputs
            </h3>
            {FIELDS.map((field) => {
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
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 px-2.5 py-1 text-xs">
                      <span>{chipText}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDismissedChips((prev) => ({ ...prev, [field.id]: true }))
                        }
                        className="hover:opacity-70"
                        aria-label="Dismiss prefill notice"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Outputs */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">
              Results
            </h3>
            <div className="rounded-lg border bg-muted/30 divide-y">
              <ResultRow label="Required Showroom Visits" value={renderRequired(outputs.requiredShows)} />
              <ResultRow
                label="Required Appointments"
                value={renderRequired(outputs.requiredAppointments)}
              />
              <ResultRow label="Required Leads" value={renderRequired(outputs.requiredLeads)} />
              <ResultRow
                label="Projected Gross Profit"
                value={<span className="text-brand-600">{formatEuro(outputs.projectedGrossProfit)}</span>}
                emphasised
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultRow({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: React.ReactNode;
  emphasised?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasised ? 'font-serif text-xl' : 'font-mono text-lg'}>{value}</span>
    </div>
  );
}
