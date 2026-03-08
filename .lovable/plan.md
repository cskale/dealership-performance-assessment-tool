

# Integrate Remaining 75 KPIs into Encyclopedia

## Scope

The 5 uploaded PDFs contain **100 KPIs** numbered 1-100. KPIs 1-25 are already fully integrated. KPIs 26-100 need to be added. The first PDF failed to parse but those KPIs are already in the codebase.

## KPI Categories to Add

| # Range | Category | Count | Key Examples |
|---------|----------|-------|-------------|
| 26-37 | Used Vehicle Operations | 12 | Aged Stock %, Recon Cycle Time, Trade-In Capture, Wholesale Leakage |
| 38-50 | Service/Aftersales | 13 | Tech Productivity, Efficiency, First-Time Fix, Comeback Rate, CSI-Service, NPS |
| 51-60 | Parts & Inventory | 10 | Maintenance Plan Penetration, Parts Margin, Fill Rate, Obsolescence |
| 61-67 | Customer Satisfaction | 7 | Overall CSI, Sales CSI, Service CSI, Cost per Lead |
| 68-73 | Marketing & Digital | 6 | Website Conversion, Digital Appointment Ratio, Marketing ROI |
| 74-80 | Workforce & HR | 7 | Employee Turnover, Sales Staff Turnover, Tech Retention, Training Hours |
| 81-87 | EV Readiness | 7 | EV Penetration, EV Service Readiness, Charger Utilization, Battery Claim Rate |
| 88-93 | Sales Process & Pipeline | 6 | Follow-Up Completion, Pipeline Hygiene, Quote-to-Order, EBITDA |
| 94-100 | Financial Performance | 7 | Gross per Dept, Total Gross Margin, Net Profit per Vehicle, Break-Even Volume |

## Technical Approach

### File: `src/lib/kpiDefinitions.ts`

Add 75 new KPI entries to the `KPI_DEFINITIONS` record. Each entry includes:
- Full `en` object with all enriched fields: `title`, `definition`, `executiveSummary`, `whyItMatters`, `formula`, `inclusions`, `exclusions`, `unitOfMeasure`, `benchmark`, `department`, `rootCauseDiagnostics` (5 dimensions), `improvementLevers`, `interdependencies`
- Minimal `de` object with `title`, `definition`, `whyItMatters`, `benchmark` (matching existing pattern)

New department categories needed beyond existing ones:
- `marketing-digital` (for KPIs 67-73)
- `workforce-hr` (for KPIs 74-80)
- `ev-readiness` (for KPIs 81-85)
- `sales-process` (for KPIs 86-90)

### File: `src/components/UsefulResources.tsx`

Update the department grouping logic to include the new department categories in the KPI Encyclopedia accordion. The existing UI pattern (collapsible cards with search, root cause tabs, improvement levers) will automatically render the new KPIs since it sources from `KPI_DEFINITIONS`.

Add department display labels for new categories in the department name mapping.

### File: `src/lib/departmentNames.ts`

Add display name mappings for new department categories.

## Implementation Notes

- This is primarily a data expansion task -- the UI and engine infrastructure already supports the enriched format
- The signal engine, action templates, and signal mappings do NOT need changes for encyclopedia-only KPIs (those mappings are tied to assessment questions, not KPI definitions)
- German translations are minimal stubs matching existing pattern (full translations can follow)
- The file will grow significantly (~4000+ lines) but this is acceptable for a static data module

## Files to Change

| File | Change |
|------|--------|
| `src/lib/kpiDefinitions.ts` | Add 75 KPI entries with full enriched data from documents |
| `src/components/UsefulResources.tsx` | Add new department categories to accordion grouping |
| `src/lib/departmentNames.ts` | Add display names for new department categories |

