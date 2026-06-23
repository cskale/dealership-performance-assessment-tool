/**
 * Maps Playground calculator input fields to the kpiKey (from
 * src/data/questionnaire.ts data questions) that can pre-fill them from a
 * dealership's most recent assessment. Fields with no entry here are always
 * manual entry — see docs/superpowers/specs/2026-06-15-playground-kpi-seeding.md
 * for which fields were intentionally left unmapped and why.
 */
export const PLAYGROUND_KPI_MAPPINGS: Record<string, Record<string, string>> = {
  'reverse-sales-funnel': {
    avgGrossProfitPerUnit: 'nvs_gross_profit_per_unit',
  },
  'marketing-roi': {
    avgGrossProfitPerUnit: 'nvs_gross_profit_per_unit',
  },
  'absorption-rate': {},
};
