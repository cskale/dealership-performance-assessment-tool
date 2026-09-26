# Prompt 3 implementation plan

## Scope

Implement only the requested Action Plan focus safeguard and Prompt 3 department/KPI experience. Prompt 4 and later work remain untouched.

## Files to change

- `src/components/ActionPlan.tsx`
  - Add a ref holding the last successfully focused action ID.
  - Let the existing focus effect reset filters, select List view, and scroll only when a new `focusActionId` is first found.
  - Do not mark an ID handled until its action exists, preserving pagination/loading behavior.

- `src/pages/Results.tsx`
  - Add `useKpiTimelines(resultsData?.dealershipId)` and `useSaveKpiCheckin(resultsData?.dealershipId)` with all hooks above early returns.
  - Derive confidence, cross-validation findings, and ceiling insights with ordered `useMemo`s after their inputs.
  - Load DB-overridden KPI benchmarks with static defaults as the immediate fallback.
  - Render the new department rows below the existing hero and pass the viewed assessment’s dealership ID, permissions, timelines, findings, and insights.

- `src/components/results/DepartmentResultsRows.tsx` (new)
  - Render all five departments in the fixed NVS → UVS → Service → Parts → Financial order.
  - Assessed rows show the neutral 0–100 scale, score dot, benchmark tick, shaded gap, canonical maturity chip, and consistency-based confidence percentage.
  - Unassessed rows remain muted and show `results.dept.notAssessed` without charts.
  - Expanded rows show only that department’s tracked KPI cards, questionnaire cross-validation findings, and ceiling insights.

- `src/components/results/KpiTrendCard.tsx` (new)
  - Show localized KPI label, current value, benchmark, and directional gap with European number/currency formatting.
  - Use Recharts for all three history states: benchmark bar for 0–1 points, sparkline and month-over-month delta for 2 points, and actual plus forecast line/band for 3+ valid points.
  - Use brand-600 for actuals, neutral-200 for the benchmark, and dashed brand-400 with a shaded band for projections.
  - Distinguish coach-entered points and include source/date details in the tooltip.
  - Add the inline monthly check-in popover, hidden for OEMs and viewer members; submit through the existing mutation and show the existing localized success toast.

- `src/components/results/CeilingInsightsPanel.tsx`
  - Keep its insight logic unchanged, but align its presentation to brand/neutral tokens for use inside expanded departments.
  - It will only be mounted for non-empty department insight slices, so the old empty placeholder will not appear.

No protected hook, calculation, questionnaire, KPI data, Supabase type, or migration file will be edited. If the latest main changes these integration points during synchronization, the implementation will adapt to the synced contracts rather than modifying them.

## Data mapping and calculations

- Department scores and assessed state: the selected assessment’s `resultsData.scores`.
- Department labels: translated questionnaire section labels.
- Department benchmark tick/gap: existing module benchmarks keyed through `sectionToModuleCode`.
- Maturity: `getMaturityLevel` and the four existing `maturity.*` keys only.
- Confidence: `calculateAllConfidenceMetrics(...).consistencyScore` for each questionnaire section.
- KPI set: `trackedKpisFor(dept)`; history: `useKpiTimelines(resultsData.dealershipId)`.
- KPI benchmarks: `loadBenchmarks()` merged over `STATIC_BENCHMARKS`; forecasts: `forecastKpi`.
- Questionnaire cross-validation: `evaluateCrossValidations(resultsData.answers)`, grouped by the finding’s question-prefix department.
- Ceiling insights: `generateCeilingInsights(resultsData.answers, resultsData.scores)`, grouped by question-prefix department.
- Money-impact copy will be omitted because Prompt 3 does not provide all calculator inputs needed to apply those formulas safely.

## Current-state removal handling

The current Diagnosis tab contains the Prompt 2 hero but does not mount the former department heatmap, department performance cards, standalone KPI tab, maturity tab, or old executive sections. Prompt 3 will add the replacement rows below the hero without reintroducing those removed sections. Legacy component files will only be deleted if a post-sync repository-wide import check proves they have no remaining consumers.

## Verification

- Confirm latest `main` is synchronized first and preserve the `prefer-const` safeguard in `previewAuthStorage.ts`.
- Add focused tests for the Action Plan one-time focus behavior and KPI chart-tier/permission helpers where practical.
- Verify all five departments, unassessed rows, expansion, forecast fallback, coach markers/tooltips, and check-in visibility at desktop and 390px width.
- Run TypeScript validation, full tests, lint with 0 errors, production build, and inspect the latest preview build log.
