// Core KPI set for monthly check-ins (spec 2026-09-25 §2). All are assessment
// data questions; includes every KPI overlapping a Playground calculator.
export type DepartmentKey = 'nvs' | 'uvs' | 'svc' | 'prt' | 'fin';

export const TRACKED_KPIS: { kpiKey: string; department: DepartmentKey }[] = [
  { kpiKey: 'nvs_lead_response_1h_pct', department: 'nvs' },
  { kpiKey: 'nvs_gross_profit_per_unit', department: 'nvs' },
  { kpiKey: 'uvs_days_to_sale', department: 'uvs' },
  { kpiKey: 'uvs_gross_profit_per_unit', department: 'uvs' },
  { kpiKey: 'svc_workshop_loading_pct', department: 'svc' },
  { kpiKey: 'svc_effective_labour_rate', department: 'svc' },
  { kpiKey: 'prt_inventory_turns', department: 'prt' },
  { kpiKey: 'prt_gross_margin_pct', department: 'prt' },
  { kpiKey: 'fin_net_profit_pct', department: 'fin' },
  { kpiKey: 'fin_aftersales_gp_share_pct', department: 'fin' },
];

export const isTrackedKpi = (key: string) => TRACKED_KPIS.some((k) => k.kpiKey === key);
export const trackedKpisFor = (dept: DepartmentKey) =>
  TRACKED_KPIS.filter((k) => k.department === dept).map((k) => k.kpiKey);
