# Prompt 5 — Playground KPI check-ins

## Goal
Add save controls only to the five mapped Playground values, preserving every calculator’s calculations, inputs, charts, and layout behavior.

## Implementation

1. **Add one shared check-in control**
   - Create a focused Playground component that accepts `kpiKey` and the current numeric value.
   - Read `dealerId`, `actorType`, and `membershipRole` from `useActiveRole()`.
   - Show the control only when an active dealership exists and the user is either:
     - an assigned coach (`actorType === 'coach'`), or
     - a dealer owner/admin/member (`actorType === 'dealer'` and membership role is not `viewer`).
   - Hide it for OEMs, viewers, users without an active dealership, and all other roles. Supabase RLS remains the final authorization layer for coach assignments.
   - Call `useSaveKpiCheckin(dealerId).mutateAsync({ kpiKey, month, value })` and show the existing `kpi.saved` success toast.

2. **Reuse Results-grade month and value validation**
   - Look up the exact KPI question in the existing questionnaire and validate against its `validRange` using Zod.
   - Default to the previous calendar month and allow selection through the current month only.
   - Disable saving for empty, non-finite, out-of-range, or null values; show the existing localized range error inline when applicable.
   - Use the existing localized `kpi.saveAsCheckin` label with the selected month substituted.

3. **Place the five controls without restructuring calculators**
   - `ReverseSalesFunnelPage.tsx`: beside/below the `avgGrossProfitPerUnit` input only → `nvs_gross_profit_per_unit`.
   - `MarketingRoiPage.tsx`: beside/below the shared `avgGrossProfitPerUnit` input, alongside its existing prefill notice → `nvs_gross_profit_per_unit`.
   - `SalesVelocityPage.tsx`: beside/below the `avgGrossProfitPerUnit` input only → `nvs_gross_profit_per_unit`.
   - `TechUtilizationPage.tsx`:
     - beside/below `effectiveLabourRate` → `svc_effective_labour_rate`;
     - next to the displayed Utilization Rate above its gauge → `svc_workshop_loading_pct`.
   - `VehicleStockTurnPage.tsx`: within the prominent Average Days in Stock output block, adjacent to the output → `uvs_days_to_sale`.
   - Controls stack cleanly on narrow screens. No button appears on any other field or calculator.

4. **Preserve protected logic and verify**
   - Do not edit calculator logic, KPI mappings, prefill hooks, questionnaire data, KPI timeline hooks, migrations, or generated Supabase types.
   - `PlaygroundCalculatorShell` remains unchanged unless implementation reveals a genuinely shared presentation slot; field-level placement currently belongs to each calculator page.
   - Recheck synchronization with latest `main` immediately before editing, retaining the existing preview-auth lint safeguard.
   - Run TypeScript validation, lint with zero errors, all tests, production build, and focused desktop/mobile rendering checks for the affected calculators where authentication permits.

## Files

**New**
- `src/components/playground/KpiCheckinControl.tsx`

**Update**
- `src/pages/ReverseSalesFunnelPage.tsx`
- `src/pages/MarketingRoiPage.tsx`
- `src/pages/SalesVelocityPage.tsx`
- `src/pages/TechUtilizationPage.tsx`
- `src/pages/VehicleStockTurnPage.tsx`

No database or protected-file changes are planned.
