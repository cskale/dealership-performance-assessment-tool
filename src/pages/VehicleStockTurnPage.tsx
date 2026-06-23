import { useMemo, useState } from 'react';
import { Package, Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  calculateVehicleStockTurn,
  type VehicleStockTurnInputs,
} from '@/lib/playgroundCalculators';
import { formatEuro } from '@/utils/euroFormatter';
import { PlaygroundCalculatorShell } from '@/components/playground/PlaygroundCalculatorShell';

const DEFAULTS: VehicleStockTurnInputs = {
  averageInventoryCount: 60,
  vehiclesSoldPerMonth: 20,
  avgVehicleCost: 25000,
  holdingCostPctPerMonth: 1.5,
};

type FieldId = keyof VehicleStockTurnInputs;

interface FieldConfig {
  id: FieldId;
  label: string;
  suffix?: string;
  tooltip?: string;
  min: number;
  max?: number;
  step: number;
  group: 'inventory' | 'cost';
}

const FIELDS: FieldConfig[] = [
  { id: 'averageInventoryCount', label: 'Average Inventory Count', suffix: 'units', min: 0, step: 1, group: 'inventory' },
  { id: 'vehiclesSoldPerMonth', label: 'Vehicles Sold per Month', suffix: 'units', min: 0, step: 1, group: 'inventory' },
  { id: 'avgVehicleCost', label: 'Average Vehicle Cost', suffix: '€', min: 0, step: 500, group: 'cost' },
  { id: 'holdingCostPctPerMonth', label: 'Monthly Holding Cost', suffix: '%', tooltip: 'Floorplan interest, insurance, depreciation, and opportunity cost as % of vehicle value per month. Industry typical: 1–2%.', min: 0, max: 10, step: 0.1, group: 'cost' },
];

const formatNum = (n: number) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

const formatDecimal = (n: number | null) =>
  n === null ? '—' : new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(n);

function daysColor(days: number | null): string {
  if (days === null) return 'text-muted-foreground';
  if (days <= 45) return 'text-green-600';
  if (days <= 75) return 'text-amber-600';
  return 'text-red-600';
}

export default function VehicleStockTurnPage() {
  const [inputs, setInputs] = useState<VehicleStockTurnInputs>(DEFAULTS);

  const outputs = useMemo(() => calculateVehicleStockTurn(inputs), [inputs]);

  const handleChange = (id: FieldId, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs((prev) => ({ ...prev, [id]: num }));
  };

  const inventoryFields = FIELDS.filter((f) => f.group === 'inventory');
  const costFields = FIELDS.filter((f) => f.group === 'cost');

  const renderField = (field: FieldConfig) => (
    <div key={field.id} className="space-y-1.5">
      <Label htmlFor={field.id} className="text-sm flex items-center gap-1">
        {field.label}
        {field.suffix && (
          <span className="text-muted-foreground font-normal">({field.suffix})</span>
        )}
        {field.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[220px]">{field.tooltip}</p>
            </TooltipContent>
          </Tooltip>
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
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Inventory Inputs</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Enter current inventory levels, sales velocity, and cost assumptions.
      </p>
      <div className="space-y-4">
        {inventoryFields.map(renderField)}
        <div className="pt-3 border-t border-[#DFE1E6]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
            Cost Assumptions
          </p>
          <div className="space-y-4">{costFields.map(renderField)}</div>
        </div>
      </div>
    </div>
  );

  const rightCard = (
    <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
        Output
      </p>
      <h2 className="text-[15px] font-bold text-[#172B4D] mb-1">Stock Performance</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Inventory velocity, aging risk, and holding cost analysis.
      </p>

      {/* Days in stock — prominent metric */}
      <div className="mb-5 text-center py-4 rounded-lg border border-[#DFE1E6] bg-gray-50">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
          Average Days in Stock
        </p>
        <p className={`text-4xl font-bold ${daysColor(outputs.avgDaysInStock)}`}>
          {outputs.avgDaysInStock === null ? '—' : formatNum(outputs.avgDaysInStock)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Target: &lt; 45 days
        </p>
      </div>

      {/* Stat rows */}
      <div className="rounded-lg border border-[#DFE1E6] divide-y divide-[#DFE1E6]">
        <StatRow label="Annual Stock Turn" value={`${formatDecimal(outputs.annualStockTurn)}x`} />
        <StatRow label="Inventory Value at Cost" value={formatEuro(outputs.inventoryValueAtCost)} />
        <StatRow label="Monthly Holding Cost" value={formatEuro(outputs.monthlyHoldingCost)} emphasised />
        <StatRow
          label="Holding Cost per Unit Sold"
          value={outputs.holdingCostPerUnit === null ? '—' : formatEuro(outputs.holdingCostPerUnit)}
        />
      </div>

      {/* Insight callout */}
      <div className="mt-5 flex gap-3 rounded-lg border border-[#1D7AFC]/20 bg-[#1D7AFC]/5 px-4 py-3">
        <Info className="h-4 w-4 text-[#1D7AFC] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-[#172B4D]">Calculated Insight: </span>
          {outputs.avgDaysInStock === null ? (
            <>Enter sales volume to calculate days in stock.</>
          ) : outputs.avgDaysInStock <= 45 ? (
            <>
              Inventory turns at{' '}
              <span className="font-semibold text-[#172B4D]">{formatDecimal(outputs.annualStockTurn)}x</span>{' '}
              annually — healthy velocity. Monthly holding cost is{' '}
              <span className="font-semibold text-[#172B4D]">{formatEuro(outputs.monthlyHoldingCost)}</span>.
            </>
          ) : (
            <>
              At{' '}
              <span className="font-semibold text-[#172B4D]">{formatNum(outputs.avgDaysInStock)}</span> average
              days in stock, each unit carries{' '}
              <span className="font-semibold text-[#172B4D]">
                {outputs.holdingCostPerUnit === null ? '—' : formatEuro(outputs.holdingCostPerUnit)}
              </span>{' '}
              in holding cost before it sells. Reducing inventory by 10 units saves{' '}
              <span className="font-semibold text-[#172B4D]">
                {formatEuro(10 * inputs.avgVehicleCost * (inputs.holdingCostPctPerMonth / 100))}
              </span>
              /month.
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <PlaygroundCalculatorShell
      breadcrumbLabel="Vehicle Stock Turn Calculator"
      icon={Package}
      category="Operational Models"
      title="Vehicle Stock Turn"
      description="Analyse inventory velocity, days in stock, and holding cost to optimize vehicle stock levels."
      kpiStrip={[
        {
          label: 'Avg Days in Stock',
          value: outputs.avgDaysInStock === null ? '—' : `${formatNum(outputs.avgDaysInStock)} days`,
          emphasis: true,
        },
        {
          label: 'Annual Stock Turn',
          value: `${formatDecimal(outputs.annualStockTurn)}x`,
        },
        {
          label: 'Monthly Holding Cost',
          value: formatEuro(outputs.monthlyHoldingCost),
        },
      ]}
      leftCard={leftCard}
      rightCard={rightCard}
      bottomStats={[
        {
          label: 'Holding Cost per Unit Sold',
          value: outputs.holdingCostPerUnit === null ? '—' : formatEuro(outputs.holdingCostPerUnit),
        },
        {
          label: 'Inventory Value at Cost',
          value: formatEuro(outputs.inventoryValueAtCost),
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
