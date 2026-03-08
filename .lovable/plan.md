

# Enrich KPI Encyclopedia & Improve Assessment Engine from KPI Deep Dive Document

## What the Document Contains

The uploaded document provides deep-dive data for **25 KPIs** across New Vehicle Sales and Used Vehicle departments. Each KPI includes:
- Executive summary with business impact
- Precise formula with inclusions/exclusions
- Root cause diagnostics across 5 dimensions: **People, Process, Tools, Structure, Incentives**
- Specific improvement levers (actionable steps)
- KPI interdependencies (upstream drivers + downstream impacts)
- Unit of measure and benchmarks

## Current State

- **KPI Encyclopedia** (`UsefulResources.tsx`): Only ~16 KPIs with 1-line definitions, basic formulas, and short "why it matters" text. No root cause analysis, no interdependencies, no improvement levers.
- **KPI Definitions** (`kpiDefinitions.ts`): 14 KPIs with title, definition, whyItMatters, benchmark. Very shallow.
- **Action Templates** (`actionTemplates.ts`): 14 generic templates mapped to 8 signal codes. Not KPI-specific — e.g., "Reinforce process compliance" is used for all PROCESS_NOT_EXECUTED signals regardless of whether the issue is lead conversion or service retention.
- **Signal Mappings** (`signalMappings.ts`): Maps question categories to signals but doesn't use the root cause dimension (People/Process/Tools/Structure/Incentives) to differentiate.

## Plan

### A. Expand KPI Definitions Data Model (High Impact)

**File: `src/lib/kpiDefinitions.ts`**

Expand the `KPIDefinition` interface to include all document fields:

```typescript
export interface KPIDefinition {
  title: string;
  definition: string;
  executiveSummary: string;
  whyItMatters: string;
  formula: string;
  inclusions: string[];
  exclusions: string[];
  unitOfMeasure: string;
  benchmark?: string;
  rootCauseDiagnostics: {
    people: string;
    process: string;
    tools: string;
    structure: string;
    incentives: string;
  };
  improvementLevers: string[];
  interdependencies: {
    upstreamDrivers: string[];
    downstreamImpacts: string[];
  };
}
```

Add all 25 KPIs from the document (English only initially — German translations for new fields can follow). Map existing keys and add new ones: `leadResponseTime`, `showroomConversion`, `testDriveRatio`, `appointmentShowRate`, `salesCycleLength`, `closingRatio`, `unitsSoldPerExec`, `revenuePerExec`, `grossPerNewVehicle`, `frontEndGross`, `backEndGross`, `fniPenetration`, `financePenetration`, `extendedWarrantyPenetration`, `gapInsurancePenetration`, `productPerRetailUnit`, `orderBankCoverage`, `orderToDeliveryTime`, `allocationFulfillment`, `cancellationRate`, `factoryIncentiveCapture`.

### B. Overhaul KPI Encyclopedia UI (High Impact)

**File: `src/components/UsefulResources.tsx`**

Replace the hardcoded `kpiEncyclopedia` object with data sourced from the expanded `kpiDefinitions.ts`. Each KPI card will now show:
- Executive summary (collapsible)
- Formula with inclusions/exclusions
- Root cause diagnostics as a 5-tab or 5-row breakdown (People | Process | Tools | Structure | Incentives)
- Improvement levers as a checklist
- KPI interdependencies as upstream/downstream flow
- Benchmark badge

### C. Create KPI-Specific Action Templates (High Impact)

**File: `src/data/actionTemplates.ts`**

Add ~20 new KPI-specific action templates derived from the document's improvement levers. Examples:
- `ACT-PNE-LRT`: "Implement 5-minute lead response SLA with escalation" (from Lead Response Time levers)
- `ACT-PNE-LCR`: "Deploy multi-touch follow-up sequences (7-10 touchpoints)" (from Lead Conversion Rate)
- `ACT-PNS-TDR`: "Create mandatory test drive suggestion in sales process" (from Test Drive Ratio)
- `ACT-CMA-ASR`: "Implement multi-touchpoint appointment confirmation sequence" (from Appointment Show Rate)
- `ACT-GWK-INV`: "Implement automated repricing protocols at 15-day intervals" (from Days in Inventory)

Each template uses the document's specific implementation steps rather than generic ones.

### D. Enrich Signal Mappings with Root Cause Dimension (Medium Impact)

**File: `src/data/signalMappings.ts`**

Add a `rootCauseDimension` field to signal mappings so that when a signal fires, the engine knows which root cause dimension (People/Process/Tools/Structure/Incentives) is most relevant. This enables selecting the most appropriate action template. For example:
- Question about CRM usage → signal `TOOL_UNDERUTILISED` with dimension `tools`
- Question about staff training → signal `ROLE_OWNERSHIP_MISSING` with dimension `people`

### E. Link Questions to KPIs in Signal Engine (Medium Impact)

**File: `src/lib/signalEngine.ts`**

Use the `linkedKPIs` field already on each question to connect assessment answers to the new KPI interdependency data. When a question scores low, the engine can now trace upstream drivers and downstream impacts, enabling:
- More targeted action generation (use KPI-specific templates instead of generic ones)
- Richer rationale text: "Low lead conversion score detected. Root cause analysis suggests Process issues (weak follow-up cadence). Downstream impact: Units Sold per Exec, Revenue per Exec, Customer Acquisition Cost."

### F. Update Signal-to-Action Map (Medium Impact)

**File: `src/data/signalToActionMap.ts`**

Expand mappings to include the new KPI-specific template IDs, increasing `maxActionsPerAssessment` where appropriate. The engine will prefer KPI-specific templates over generic ones when the triggering question has `linkedKPIs`.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/kpiDefinitions.ts` | Expand interface, add 25 KPIs with full document data |
| `src/components/UsefulResources.tsx` | Source encyclopedia from kpiDefinitions, rich UI with root causes and interdependencies |
| `src/data/actionTemplates.ts` | Add ~20 KPI-specific action templates from document improvement levers |
| `src/data/signalMappings.ts` | Add rootCauseDimension field to mappings |
| `src/data/signalToActionMap.ts` | Map new templates to signal codes |
| `src/lib/signalEngine.ts` | Use linkedKPIs + interdependencies for smarter action selection |

## What This Does NOT Change
- No new questions or assessment structure
- No database changes
- No new routes or pages
- Existing generic action templates remain as fallbacks

