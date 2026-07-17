/**
 * KPI Benchmark Thresholds
 *
 * Hybrid source: static defaults in code, overridden per kpi_key by
 * `kpi_benchmark_thresholds` rows with segmentation_key = 'default'.
 * The DB table is range-based (healthy/warning/critical min+max); this module
 * converts rows to the simpler direction model used by the KPI signal engine.
 * Fetch failure always falls back to the static map — benchmarks never block
 * action generation.
 */

import { supabase } from '@/integrations/supabase/client';

export interface KpiBenchmark {
  kpiKey: string;
  direction: 'higher-better' | 'lower-better';
  /** Meeting this value (or better) = healthy, no signal */
  target: number;
  /** Breaching this value = MEDIUM signal */
  warning: number;
  /** Breaching this value = HIGH signal */
  critical: number;
  unit: string;
}

const b = (
  kpiKey: string,
  direction: KpiBenchmark['direction'],
  target: number,
  warning: number,
  critical: number,
  unit: string
): KpiBenchmark => ({ kpiKey, direction, target, warning, critical, unit });

export const STATIC_BENCHMARKS: Record<string, KpiBenchmark> = {
  nvs_gross_profit_per_unit: b('nvs_gross_profit_per_unit', 'higher-better', 2500, 1800, 1200, 'EUR'),
  nvs_lead_response_1h_pct: b('nvs_lead_response_1h_pct', 'higher-better', 80, 60, 40, '%'),
  uvs_days_to_sale: b('uvs_days_to_sale', 'lower-better', 45, 60, 90, 'days'),
  uvs_gross_profit_per_unit: b('uvs_gross_profit_per_unit', 'higher-better', 1800, 1300, 900, 'EUR'),
  uvs_recon_cost_per_unit: b('uvs_recon_cost_per_unit', 'lower-better', 700, 1000, 1500, 'EUR'),
  uvs_used_to_new_ratio: b('uvs_used_to_new_ratio', 'higher-better', 1.0, 0.7, 0.5, 'ratio'),
  uvs_appraisal_to_buy_pct: b('uvs_appraisal_to_buy_pct', 'higher-better', 50, 35, 20, '%'),
  svc_hours_per_ro: b('svc_hours_per_ro', 'higher-better', 2.0, 1.5, 1.0, 'hours'),
  svc_effective_labour_rate: b('svc_effective_labour_rate', 'higher-better', 95, 80, 65, 'EUR'),
  svc_workshop_loading_pct: b('svc_workshop_loading_pct', 'higher-better', 85, 70, 55, '%'),
  prt_gross_margin_pct: b('prt_gross_margin_pct', 'higher-better', 28, 22, 16, '%'),
  prt_inventory_turns: b('prt_inventory_turns', 'higher-better', 8, 6, 4, 'turns'),
  prt_sales_per_ro: b('prt_sales_per_ro', 'higher-better', 180, 120, 80, 'EUR'),
  prt_wholesale_pct: b('prt_wholesale_pct', 'lower-better', 30, 45, 60, '%'),
  prt_backorder_days: b('prt_backorder_days', 'lower-better', 3, 7, 14, 'days'),
  fin_net_profit_pct: b('fin_net_profit_pct', 'higher-better', 3.0, 1.5, 0.5, '%'),
  fin_total_gp_per_nv_unit: b('fin_total_gp_per_nv_unit', 'higher-better', 3200, 2400, 1600, 'EUR'),
  fin_floorplan_cost_pct: b('fin_floorplan_cost_pct', 'lower-better', 1.0, 1.8, 3.0, '%'),
  fin_revenue_per_employee: b('fin_revenue_per_employee', 'higher-better', 450000, 350000, 250000, 'EUR'),
  fin_debtor_days: b('fin_debtor_days', 'lower-better', 20, 35, 50, 'days'),
  fin_aftersales_gp_share_pct: b('fin_aftersales_gp_share_pct', 'higher-better', 55, 40, 30, '%'),
  fin_selling_expense_pct: b('fin_selling_expense_pct', 'lower-better', 8, 11, 15, '%'),
};

interface ThresholdRow {
  kpi_key: string;
  healthy_min: number | null;
  healthy_max: number | null;
  warning_min: number | null;
  warning_max: number | null;
  critical_min: number | null;
  critical_max: number | null;
}

/** Convert a DB range row to the direction model; null when needed fields are missing. */
function rowToBenchmark(row: ThresholdRow, base: KpiBenchmark): KpiBenchmark | null {
  const higher = base.direction === 'higher-better';
  const target = higher ? row.healthy_min : row.healthy_max;
  const warning = higher ? row.warning_min : row.warning_max;
  const critical = higher ? row.critical_min : row.critical_max;
  if (target == null || warning == null || critical == null) return null;
  return { ...base, target, warning, critical };
}

let cache: Promise<Record<string, KpiBenchmark>> | null = null;

/** Test hook — resets the session cache. */
export function clearBenchmarkCache(): void {
  cache = null;
}

/**
 * Static benchmarks merged with 'default' segmentation rows from
 * kpi_benchmark_thresholds (DB wins per key). Cached for the session.
 */
export function loadBenchmarks(): Promise<Record<string, KpiBenchmark>> {
  if (cache) return cache;
  cache = (async () => {
    const merged: Record<string, KpiBenchmark> = { ...STATIC_BENCHMARKS };
    try {
      const { data, error } = await supabase
        .from('kpi_benchmark_thresholds')
        .select('kpi_key, healthy_min, healthy_max, warning_min, warning_max, critical_min, critical_max')
        .eq('segmentation_key', 'default');
      if (error || !data) return merged;
      for (const row of data as ThresholdRow[]) {
        const base = merged[row.kpi_key];
        if (!base) continue;
        const converted = rowToBenchmark(row, base);
        if (converted) merged[row.kpi_key] = converted;
      }
    } catch {
      // fetch failure → static only
    }
    return merged;
  })();
  return cache;
}
