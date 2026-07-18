/**
 * KPI Signal Engine — Quantitative Banding
 *
 * Converts raw KPI values into quantitative signals by comparing against
 * benchmark thresholds. Uses direction-aware banding (higher-better vs lower-better).
 *
 * Banding rule (exactly-at-threshold counts as meeting it, not breaching):
 * - higher-better: v < critical → HIGH; v < warning → MEDIUM; v < target → LOW; else none
 * - lower-better: v > critical → HIGH; v > warning → MEDIUM; v > target → LOW; else none
 */

import { SignalCode, Severity } from '@/data/signalTypes';
import { KpiBenchmark } from '@/lib/kpiBenchmarks';

export interface KpiSignal {
  kpiKey: string;
  signalCode: Exclude<SignalCode, 'NONE'>;
  moduleKey: string;
  severity: Severity;
  actualValue: number;
  targetValue: number;
  gapPercent: number; // |actual - target| / target * 100, rounded to 1 decimal
  unit: string;
}

/**
 * Maps each KPI key to its associated signal code and module.
 * All 22 KPIs from the brief.
 */
export const KPI_SIGNAL_MAP: Record<
  string,
  { signalCode: Exclude<SignalCode, 'NONE'>; moduleKey: string }
> = {
  nvs_gross_profit_per_unit: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'new-vehicle-sales',
  },
  nvs_lead_response_1h_pct: {
    signalCode: 'PROCESS_NOT_EXECUTED',
    moduleKey: 'new-vehicle-sales',
  },
  uvs_days_to_sale: {
    signalCode: 'PROCESS_NOT_STANDARDISED',
    moduleKey: 'used-vehicle-sales',
  },
  uvs_gross_profit_per_unit: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'used-vehicle-sales',
  },
  uvs_recon_cost_per_unit: {
    signalCode: 'GOVERNANCE_WEAK',
    moduleKey: 'used-vehicle-sales',
  },
  uvs_used_to_new_ratio: {
    signalCode: 'CAPACITY_MISALIGNED',
    moduleKey: 'used-vehicle-sales',
  },
  uvs_appraisal_to_buy_pct: {
    signalCode: 'PROCESS_NOT_EXECUTED',
    moduleKey: 'used-vehicle-sales',
  },
  svc_hours_per_ro: {
    signalCode: 'PROCESS_NOT_EXECUTED',
    moduleKey: 'service-performance',
  },
  svc_effective_labour_rate: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'service-performance',
  },
  svc_workshop_loading_pct: {
    signalCode: 'CAPACITY_MISALIGNED',
    moduleKey: 'service-performance',
  },
  prt_gross_margin_pct: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'parts-inventory',
  },
  prt_inventory_turns: {
    signalCode: 'PROCESS_NOT_STANDARDISED',
    moduleKey: 'parts-inventory',
  },
  prt_sales_per_ro: {
    signalCode: 'PROCESS_NOT_EXECUTED',
    moduleKey: 'parts-inventory',
  },
  prt_wholesale_pct: {
    signalCode: 'GOVERNANCE_WEAK',
    moduleKey: 'parts-inventory',
  },
  prt_backorder_days: {
    signalCode: 'CAPACITY_MISALIGNED',
    moduleKey: 'parts-inventory',
  },
  fin_net_profit_pct: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'financial-operations',
  },
  fin_total_gp_per_nv_unit: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'financial-operations',
  },
  fin_floorplan_cost_pct: {
    signalCode: 'GOVERNANCE_WEAK',
    moduleKey: 'financial-operations',
  },
  fin_revenue_per_employee: {
    signalCode: 'CAPACITY_MISALIGNED',
    moduleKey: 'financial-operations',
  },
  fin_debtor_days: {
    signalCode: 'GOVERNANCE_WEAK',
    moduleKey: 'financial-operations',
  },
  fin_aftersales_gp_share_pct: {
    signalCode: 'KPI_NOT_REVIEWED',
    moduleKey: 'financial-operations',
  },
  fin_selling_expense_pct: {
    signalCode: 'GOVERNANCE_WEAK',
    moduleKey: 'financial-operations',
  },
};

/**
 * Determines signal severity based on banding logic.
 * Returns null if value meets or exceeds target (no signal).
 */
function determineSeverity(
  value: number,
  benchmark: KpiBenchmark
): Severity | null {
  const { direction, target, warning, critical } = benchmark;

  if (direction === 'higher-better') {
    if (value < critical) return 'HIGH';
    if (value < warning) return 'MEDIUM';
    if (value < target) return 'LOW';
    return null;
  } else {
    // lower-better
    if (value > critical) return 'HIGH';
    if (value > warning) return 'MEDIUM';
    if (value > target) return 'LOW';
    return null;
  }
}

/**
 * Calculates gap percentage: |actual - target| / target * 100
 * Rounded to 1 decimal place.
 */
function calculateGapPercent(actual: number, target: number): number {
  return Math.round((Math.abs(actual - target) / target) * 1000) / 10;
}

/**
 * Generates KPI signals from raw KPI values by comparing against benchmarks.
 * Iterates through input keys in insertion order.
 * Skips (silently, with optional DEV logging):
 *   - Missing benchmark for kpiKey
 *   - Missing KPI_SIGNAL_MAP entry
 *   - Non-finite values (NaN, Infinity)
 * Returns array of KpiSignal for every key that produces a signal.
 */
export function generateKpiSignals(
  kpiValues: Record<string, number>,
  benchmarks: Record<string, KpiBenchmark>
): KpiSignal[] {
  const signals: KpiSignal[] = [];

  for (const kpiKey of Object.keys(kpiValues)) {
    const value = kpiValues[kpiKey];

    // Skip non-finite values
    if (!Number.isFinite(value)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[KPI Signal Engine] Skipping non-finite value for ${kpiKey}`);
      }
      continue;
    }

    // Skip missing benchmark
    const benchmark = benchmarks[kpiKey];
    if (!benchmark) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[KPI Signal Engine] No benchmark found for ${kpiKey}`);
      }
      continue;
    }

    // Skip missing map entry
    const mapping = KPI_SIGNAL_MAP[kpiKey];
    if (!mapping) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[KPI Signal Engine] No signal mapping found for ${kpiKey}`);
      }
      continue;
    }

    // Determine severity
    const severity = determineSeverity(value, benchmark);
    if (severity === null) {
      // No signal — value meets or exceeds target
      continue;
    }

    // Build signal
    const signal: KpiSignal = {
      kpiKey,
      signalCode: mapping.signalCode,
      moduleKey: mapping.moduleKey,
      severity,
      actualValue: value,
      targetValue: benchmark.target,
      gapPercent: calculateGapPercent(value, benchmark.target),
      unit: benchmark.unit,
    };

    signals.push(signal);
  }

  return signals;
}
