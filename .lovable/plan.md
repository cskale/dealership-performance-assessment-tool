

# Upgrade 11 Legacy KPIs to Consulting-Grade Depth

## Current State

The file has **11 shallow/legacy KPIs** that only contain `title`, `definition`, `whyItMatters`, `benchmark`, and `department` -- missing `executiveSummary`, `formula`, `inclusions`, `exclusions`, `unitOfMeasure`, `rootCauseDiagnostics`, `improvementLevers`, and `interdependencies`. All other KPIs (the 25 New Vehicle Sales + 2 early Used Vehicle + 75 added in KPIs 26-100) are already fully enriched.

## Legacy KPIs to Upgrade

| Key | Title | Dept | Lines |
|-----|-------|------|-------|
| `monthlyRevenue` | Monthly Revenue | new-vehicle-sales | 1058-1071 |
| `avgMargin` | Average Margin | new-vehicle-sales | 1073-1086 |
| `customerSatisfaction` | Customer Satisfaction | new-vehicle-sales | 1088-1101 |
| `usedInventoryTurnover` | Used Inventory Turnover | used-vehicle-sales | 4095-4108 |
| `laborEfficiency` | Labor Efficiency Rate | service-performance | 4110-4123 |
| `serviceRetention` | Service Retention Rate | service-performance | 4125-4138 |
| `technicianProductivity` | Technician Productivity | service-performance | 4140-4153 |
| `partsGrossProfit` | Parts Gross Profit | parts-inventory | 4155-4168 |
| `fillRate` | Parts Fill Rate | parts-inventory | 4170-4183 |
| `cashFlowDays` | Cash Flow Days | financial-operations | 4185-4198 |
| `expenseRatio` | Expense Ratio | financial-operations | 4200-4213 |

## What Changes

For each of these 11 KPIs, expand from ~8 lines to ~40 lines by adding:
- `executiveSummary` (2-4 sentences)
- `formula` (business terms)
- `inclusions` / `exclusions` arrays
- `unitOfMeasure`
- `rootCauseDiagnostics` (people, process, tools, structure, incentives)
- `improvementLevers` (5-10 concrete actions)
- `interdependencies` (upstream drivers + downstream impacts cross-referencing other KPIs)
- Preserve existing DE content; add missing DE `title`/`definition`/`whyItMatters`/`benchmark` where needed

No keys renamed. No function signatures changed. No imports modified.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/kpiDefinitions.ts` | Replace 11 shallow KPI entries with fully enriched versions |

## After Completion

All KPIs in the dictionary will have full consulting-grade depth. The `getEnrichedKPIs()` function will return all entries (currently it filters on `rootCauseDiagnostics`). No legacy/shallow entries remain.

