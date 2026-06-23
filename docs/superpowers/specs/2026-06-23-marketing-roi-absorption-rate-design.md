# Marketing ROI Engine & Absorption Rate Modeler — Design Spec

**Date:** 2026-06-23
**Status:** Approved
**Pattern:** Follows Reverse Sales Funnel Calculator exactly

---

## Shared Architecture (both calculators)

Each calculator follows the established Playground pattern:

1. **Pure calc function** in `src/lib/playgroundCalculators.ts`
2. **Page component** using `PlaygroundCalculatorShell` (left card = inputs, right card = outputs)
3. **KPI mappings** in `src/data/playgroundKpiMappings.ts` for assessment prefill
4. **Route** added to router under `/app/playground/<id>`
5. **Playground catalog** entry in `src/pages/Playground.tsx` updated: `live: true`, `href` added

---

## Calculator 1: Marketing ROI Engine

**ID:** `marketing-roi`
**Route:** `/app/playground/marketing-roi`
**Category:** Marketing Intelligence
**Icon:** `Megaphone` (already assigned)

### Inputs (left card)

**Shared inputs:**
- Average Gross Profit per Unit (€) — prefilled from `nvs_gross_profit_per_unit`
- Overall Close Rate (%) — manual entry, default 25%

**Channel table — 5 fixed rows:**

| Channel | Default Spend (€) | Default Leads |
|---|---|---|
| Google Ads | 5000 | 80 |
| Social (Meta/IG) | 3000 | 50 |
| OEM Co-op | 2000 | 30 |
| Direct Mail | 1500 | 20 |
| Events/Sponsorships | 2000 | 15 |

Each row: Monthly Spend (€ input), Leads Generated (# input).

### Outputs (right card)

**Per-channel results table:**

| Column | Formula |
|---|---|
| Cost per Lead (CPL) | spend / leads |
| Cost per Sale (CPS) | spend / (leads × closeRate/100) |
| ROAS | (leads × closeRate/100 × avgGP) / spend |
| Share of Spend | channelSpend / totalSpend × 100 |

**Totals row:** sum of spend, sum of leads, blended CPL, blended CPS, overall ROAS.

**Insight callout:** "At your current close rate and GP, break-even cost per lead is €{breakEvenCPL}."
- Formula: breakEvenCPL = avgGP × (closeRate / 100)

### KPI Strip (top, 3 items)

| Label | Value | Emphasis |
|---|---|---|
| Total ROAS | overall ROAS formatted as X.Xx | yes |
| Blended CPL | €X | no |
| Total Marketing Spend | €X | no |

### KPI Prefill Mappings

```typescript
'marketing-roi': {
  avgGrossProfitPerUnit: 'nvs_gross_profit_per_unit',
}
```

### Calc Function Signature

```typescript
export interface MarketingChannel {
  name: string;
  monthlySpend: number;
  leadsGenerated: number;
}

export interface MarketingRoiInputs {
  avgGrossProfitPerUnit: number;
  overallCloseRate: number;
  channels: MarketingChannel[];
}

export interface MarketingChannelResult {
  name: string;
  costPerLead: number | null;
  costPerSale: number | null;
  roas: number | null;
  spendShare: number;
}

export interface MarketingRoiOutputs {
  channelResults: MarketingChannelResult[];
  totalSpend: number;
  totalLeads: number;
  blendedCPL: number | null;
  blendedCPS: number | null;
  overallROAS: number | null;
  breakEvenCPL: number | null;
}
```

Division by zero → `null` (same pattern as Reverse Sales Funnel).

---

## Calculator 2: Absorption Rate Modeler

**ID:** `absorption-rate`
**Route:** `/app/playground/absorption-rate`
**Category:** Operational Models
**Icon:** `ShieldCheck` (already assigned)

### Inputs (left card)

**Base inputs:**
- Service Gross Profit (€/month) — default 45000
- Parts Gross Profit (€/month) — default 25000
- Total Fixed Overhead (€/month) — default 60000, info tooltip: "Salaries, rent, utilities, insurance — everything except variable COGS"

**What-if sliders (below base inputs, separated by border-t):**
- Service GP Adjustment: range −20% to +20%, step 1%, default 0%
- Parts GP Adjustment: range −20% to +20%, step 1%, default 0%
- Fixed Overhead Adjustment: range −20% to +20%, step 1%, default 0%
- Each slider shows: label, slider, adjusted €value beside it

Implementation: native `<input type="range">` styled with Tailwind. No new dependencies.

### Outputs (right card)

**Absorption gauge:** horizontal progress bar
- Green (≥100%): fully absorbed
- Amber (80–99%): partial absorption
- Red (<80%): under-absorbed
- Shows percentage value prominently

**Stat rows (same `StatRow` pattern as Reverse Sales Funnel):**
- Baseline Absorption Rate (%)
- Adjusted Absorption Rate (%) — only shown if any slider ≠ 0%
- Monthly Surplus / Deficit (€) — (ServiceGP + PartsGP) − Overhead
- Service GP Share (%) — ServiceGP / (ServiceGP + PartsGP) × 100
- Parts GP Share (%) — PartsGP / (ServiceGP + PartsGP) × 100

**Insight callout:**
- If absorption ≥ 100%: "Aftersales departments fully cover fixed overhead with €{surplus} monthly surplus."
- If absorption < 100%: "Fixed overhead is {deficit}% under-absorbed. Closing the gap requires €{shortfall}/month in additional aftersales GP."

### KPI Strip (top, 3 items)

| Label | Value | Emphasis |
|---|---|---|
| Absorption Rate | X.X% | yes |
| Monthly Surplus/Deficit | €X | no |
| Aftersales GP Share | X% | no |

### KPI Prefill Mappings

```typescript
'absorption-rate': {}
```

No existing KPI questions directly map to absolute € GP values for service/parts. Empty mapping — all manual entry.

### Calc Function Signature

```typescript
export interface AbsorptionRateInputs {
  serviceGrossProfit: number;
  partsGrossProfit: number;
  totalFixedOverhead: number;
  serviceAdjustmentPct: number;
  partsAdjustmentPct: number;
  overheadAdjustmentPct: number;
}

export interface AbsorptionRateOutputs {
  baselineAbsorptionRate: number | null;
  adjustedAbsorptionRate: number | null;
  adjustedServiceGP: number;
  adjustedPartsGP: number;
  adjustedOverhead: number;
  monthlySurplusDeficit: number;
  serviceGpShare: number | null;
  partsGpShare: number | null;
}
```

Formulas:
- adjustedX = baseX × (1 + adjustmentPct/100)
- absorptionRate = (adjServiceGP + adjPartsGP) / adjOverhead × 100
- baseline = same formula with 0% adjustments
- Division by zero overhead → `null`

---

## Files to Create/Modify

| File | Action |
|---|---|
| `src/lib/playgroundCalculators.ts` | Add `calculateMarketingRoi()` and `calculateAbsorptionRate()` |
| `src/pages/MarketingRoiPage.tsx` | New page component |
| `src/pages/AbsorptionRateModelerPage.tsx` | New page component |
| `src/data/playgroundKpiMappings.ts` | Add mapping entries |
| `src/pages/Playground.tsx` | Set `live: true` + `href` for both |
| Router config | Add routes |

No new npm dependencies. No new UI components beyond what shadcn/ui already provides.

---

## Out of Scope

- Scenario saving/persistence (existing "Save Model" toast stub covers this)
- i18n labels (follow existing pattern — English first, DE can follow)
- Channel-specific close rates (user chose shared rate)
- F&I or Body Shop in absorption (user chose Service + Parts only)
