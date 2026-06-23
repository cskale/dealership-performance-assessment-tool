# Marketing ROI Engine & Absorption Rate Modeler — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new Playground calculators following the exact Reverse Sales Funnel pattern.

**Architecture:** Pure calc functions in `playgroundCalculators.ts`, page components using `PlaygroundCalculatorShell`, KPI prefill mappings, routes in `App.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind, shadcn/ui (existing stack — no new deps)

## Global Constraints

- No new npm dependencies
- Follow exact Reverse Sales Funnel pattern (defaults, field configs, prefill hydration, shell props)
- Division by zero → `null` (existing `divideByRate` helper)
- Euro formatting via `formatEuro` from `@/utils/euroFormatter`
- All hooks declared unconditionally at top of component (React #300 rule)

---

### Task 1: Marketing ROI calc function + tests

**Files:**
- Modify: `src/lib/playgroundCalculators.ts`
- Modify: `src/__tests__/playgroundCalculators.test.ts`

**Interfaces:**
- Consumes: existing `divideByRate()` helper
- Produces: `MarketingRoiInputs`, `MarketingRoiOutputs`, `MarketingChannel`, `MarketingChannelResult`, `calculateMarketingRoi()`

- [ ] **Step 1: Write failing tests**

Add to `src/__tests__/playgroundCalculators.test.ts`:

```typescript
import { calculateMarketingRoi } from '@/lib/playgroundCalculators';

describe('calculateMarketingRoi', () => {
  const channels = [
    { name: 'Google Ads', monthlySpend: 5000, leadsGenerated: 100 },
    { name: 'Social', monthlySpend: 3000, leadsGenerated: 50 },
  ];

  it('computes per-channel CPL, CPS, ROAS, and totals', () => {
    const result = calculateMarketingRoi({
      avgGrossProfitPerUnit: 2000,
      overallCloseRate: 20,
      channels,
    });
    expect(result.totalSpend).toBe(8000);
    expect(result.totalLeads).toBe(150);
    expect(result.blendedCPL).toBeCloseTo(53.33, 1);
    expect(result.blendedCPS).toBeCloseTo(266.67, 1);
    expect(result.overallROAS).toBeCloseTo(7.5, 1);
    expect(result.breakEvenCPL).toBe(400);
    expect(result.channelResults).toHaveLength(2);
    expect(result.channelResults[0].costPerLead).toBe(50);
    expect(result.channelResults[0].roas).toBeCloseTo(8, 1);
    expect(result.channelResults[0].spendShare).toBeCloseTo(62.5, 1);
  });

  it('returns null for metrics when leads are zero', () => {
    const result = calculateMarketingRoi({
      avgGrossProfitPerUnit: 2000,
      overallCloseRate: 20,
      channels: [{ name: 'Empty', monthlySpend: 1000, leadsGenerated: 0 }],
    });
    expect(result.channelResults[0].costPerLead).toBeNull();
    expect(result.channelResults[0].costPerSale).toBeNull();
    expect(result.channelResults[0].roas).toBeNull();
  });

  it('returns null for CPS and ROAS when close rate is zero', () => {
    const result = calculateMarketingRoi({
      avgGrossProfitPerUnit: 2000,
      overallCloseRate: 0,
      channels: [{ name: 'Test', monthlySpend: 1000, leadsGenerated: 50 }],
    });
    expect(result.channelResults[0].costPerLead).toBe(20);
    expect(result.channelResults[0].costPerSale).toBeNull();
    expect(result.channelResults[0].roas).toBeNull();
    expect(result.breakEvenCPL).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run src/__tests__/playgroundCalculators.test.ts`
Expected: FAIL — `calculateMarketingRoi` not exported

- [ ] **Step 3: Implement `calculateMarketingRoi`**

Add to `src/lib/playgroundCalculators.ts`:

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

export function calculateMarketingRoi(inputs: MarketingRoiInputs): MarketingRoiOutputs {
  const { avgGrossProfitPerUnit, overallCloseRate, channels } = inputs;
  const closeRateFrac = overallCloseRate / 100;

  const totalSpend = channels.reduce((s, c) => s + c.monthlySpend, 0);
  const totalLeads = channels.reduce((s, c) => s + c.leadsGenerated, 0);

  const channelResults: MarketingChannelResult[] = channels.map((ch) => {
    const cpl = ch.leadsGenerated > 0 ? ch.monthlySpend / ch.leadsGenerated : null;
    const salesFromChannel = ch.leadsGenerated * closeRateFrac;
    const cps = salesFromChannel > 0 ? ch.monthlySpend / salesFromChannel : null;
    const revenue = salesFromChannel * avgGrossProfitPerUnit;
    const roas = ch.monthlySpend > 0 && salesFromChannel > 0 ? revenue / ch.monthlySpend : null;
    const spendShare = totalSpend > 0 ? (ch.monthlySpend / totalSpend) * 100 : 0;
    return { name: ch.name, costPerLead: cpl, costPerSale: cps, roas, spendShare };
  });

  const blendedCPL = totalLeads > 0 ? totalSpend / totalLeads : null;
  const totalSales = totalLeads * closeRateFrac;
  const blendedCPS = totalSales > 0 ? totalSpend / totalSales : null;
  const totalRevenue = totalSales * avgGrossProfitPerUnit;
  const overallROAS = totalSpend > 0 && totalSales > 0 ? totalRevenue / totalSpend : null;
  const breakEvenCPL = avgGrossProfitPerUnit * closeRateFrac;

  return { channelResults, totalSpend, totalLeads, blendedCPL, blendedCPS, overallROAS, breakEvenCPL };
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run src/__tests__/playgroundCalculators.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/playgroundCalculators.ts src/__tests__/playgroundCalculators.test.ts
git commit -m "feat: add calculateMarketingRoi with tests"
```

---

### Task 2: Absorption Rate calc function + tests

**Files:**
- Modify: `src/lib/playgroundCalculators.ts`
- Modify: `src/__tests__/playgroundCalculators.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `AbsorptionRateInputs`, `AbsorptionRateOutputs`, `calculateAbsorptionRate()`

- [ ] **Step 1: Write failing tests**

Add to `src/__tests__/playgroundCalculators.test.ts`:

```typescript
import { calculateAbsorptionRate } from '@/lib/playgroundCalculators';

describe('calculateAbsorptionRate', () => {
  it('computes baseline absorption and surplus with no adjustments', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 45000,
      partsGrossProfit: 25000,
      totalFixedOverhead: 60000,
      serviceAdjustmentPct: 0,
      partsAdjustmentPct: 0,
      overheadAdjustmentPct: 0,
    });
    expect(result.baselineAbsorptionRate).toBeCloseTo(116.67, 1);
    expect(result.adjustedAbsorptionRate).toBeCloseTo(116.67, 1);
    expect(result.monthlySurplusDeficit).toBe(10000);
    expect(result.serviceGpShare).toBeCloseTo(64.29, 1);
    expect(result.partsGpShare).toBeCloseTo(35.71, 1);
  });

  it('applies percentage adjustments correctly', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 45000,
      partsGrossProfit: 25000,
      totalFixedOverhead: 60000,
      serviceAdjustmentPct: 10,
      partsAdjustmentPct: -10,
      overheadAdjustmentPct: 5,
    });
    expect(result.adjustedServiceGP).toBe(49500);
    expect(result.adjustedPartsGP).toBe(22500);
    expect(result.adjustedOverhead).toBe(63000);
    expect(result.adjustedAbsorptionRate).toBeCloseTo(114.29, 1);
    expect(result.monthlySurplusDeficit).toBe(9000);
  });

  it('returns null when overhead is zero', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 45000,
      partsGrossProfit: 25000,
      totalFixedOverhead: 0,
      serviceAdjustmentPct: 0,
      partsAdjustmentPct: 0,
      overheadAdjustmentPct: 0,
    });
    expect(result.baselineAbsorptionRate).toBeNull();
    expect(result.adjustedAbsorptionRate).toBeNull();
  });

  it('returns null GP shares when both GPs are zero', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 0,
      partsGrossProfit: 0,
      totalFixedOverhead: 60000,
      serviceAdjustmentPct: 0,
      partsAdjustmentPct: 0,
      overheadAdjustmentPct: 0,
    });
    expect(result.serviceGpShare).toBeNull();
    expect(result.partsGpShare).toBeNull();
    expect(result.adjustedAbsorptionRate).toBeCloseTo(0, 1);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npx vitest run src/__tests__/playgroundCalculators.test.ts`

- [ ] **Step 3: Implement `calculateAbsorptionRate`**

Add to `src/lib/playgroundCalculators.ts`:

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

export function calculateAbsorptionRate(inputs: AbsorptionRateInputs): AbsorptionRateOutputs {
  const {
    serviceGrossProfit, partsGrossProfit, totalFixedOverhead,
    serviceAdjustmentPct, partsAdjustmentPct, overheadAdjustmentPct,
  } = inputs;

  const adjustedServiceGP = serviceGrossProfit * (1 + serviceAdjustmentPct / 100);
  const adjustedPartsGP = partsGrossProfit * (1 + partsAdjustmentPct / 100);
  const adjustedOverhead = totalFixedOverhead * (1 + overheadAdjustmentPct / 100);

  const baselineGP = serviceGrossProfit + partsGrossProfit;
  const adjustedGP = adjustedServiceGP + adjustedPartsGP;

  const baselineAbsorptionRate = totalFixedOverhead > 0
    ? (baselineGP / totalFixedOverhead) * 100 : null;
  const adjustedAbsorptionRate = adjustedOverhead > 0
    ? (adjustedGP / adjustedOverhead) * 100 : null;

  const monthlySurplusDeficit = adjustedGP - adjustedOverhead;

  const serviceGpShare = adjustedGP > 0 ? (adjustedServiceGP / adjustedGP) * 100 : null;
  const partsGpShare = adjustedGP > 0 ? (adjustedPartsGP / adjustedGP) * 100 : null;

  return {
    baselineAbsorptionRate, adjustedAbsorptionRate,
    adjustedServiceGP, adjustedPartsGP, adjustedOverhead,
    monthlySurplusDeficit, serviceGpShare, partsGpShare,
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run src/__tests__/playgroundCalculators.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/playgroundCalculators.ts src/__tests__/playgroundCalculators.test.ts
git commit -m "feat: add calculateAbsorptionRate with tests"
```

---

### Task 3: Marketing ROI Page + KPI mappings + route

**Files:**
- Create: `src/pages/MarketingRoiPage.tsx`
- Modify: `src/data/playgroundKpiMappings.ts`
- Modify: `src/pages/Playground.tsx` (set `marketing-roi` live)
- Modify: `src/App.tsx` (add route)

**Interfaces:**
- Consumes: `calculateMarketingRoi()`, `PlaygroundCalculatorShell`, `usePlaygroundPrefill`, `useActiveRole`, `useLanguage`, `formatEuro`, `PLAYGROUND_KPI_MAPPINGS`
- Produces: `MarketingRoiPage` default export, route at `/app/playground/marketing-roi`

- [ ] **Step 1: Create `MarketingRoiPage.tsx`**

Follow `ReverseSalesFunnelPage.tsx` pattern exactly:
- Hooks at top (useActiveRole, useLanguage, usePlaygroundPrefill, useState, useMemo)
- DEFAULTS object with channel defaults from spec
- Field rendering for shared inputs (avgGP, closeRate)
- Channel input table (5 rows, spend + leads per row)
- Output right card with per-channel results table + totals + insight callout
- Wire into `PlaygroundCalculatorShell` with kpiStrip, leftCard, rightCard, bottomStats

- [ ] **Step 2: Add KPI mapping**

In `playgroundKpiMappings.ts`:
```typescript
'marketing-roi': {
  avgGrossProfitPerUnit: 'nvs_gross_profit_per_unit',
},
```

- [ ] **Step 3: Update Playground catalog**

In `Playground.tsx`, set `marketing-roi` entry: `live: true`, `href: '/app/playground/marketing-roi'`

- [ ] **Step 4: Add route + import to App.tsx**

Import `MarketingRoiPage` and add `<Route path="playground/marketing-roi" element={<MarketingRoiPage />} />`

- [ ] **Step 5: Build check**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/pages/MarketingRoiPage.tsx src/data/playgroundKpiMappings.ts src/pages/Playground.tsx src/App.tsx
git commit -m "feat: add Marketing ROI Engine calculator page"
```

---

### Task 4: Absorption Rate Modeler Page + KPI mappings + route

**Files:**
- Create: `src/pages/AbsorptionRateModelerPage.tsx`
- Modify: `src/data/playgroundKpiMappings.ts`
- Modify: `src/pages/Playground.tsx` (set `absorption-rate` live)
- Modify: `src/App.tsx` (add route)

**Interfaces:**
- Consumes: `calculateAbsorptionRate()`, `PlaygroundCalculatorShell`, `usePlaygroundPrefill`, `useActiveRole`, `useLanguage`, `formatEuro`, `PLAYGROUND_KPI_MAPPINGS`
- Produces: `AbsorptionRateModelerPage` default export, route at `/app/playground/absorption-rate`

- [ ] **Step 1: Create `AbsorptionRateModelerPage.tsx`**

Follow `ReverseSalesFunnelPage.tsx` pattern exactly:
- Hooks at top
- DEFAULTS: serviceGrossProfit 45000, partsGrossProfit 25000, totalFixedOverhead 60000, all adjustments 0
- Base inputs (3 number fields) + what-if sliders (3 range inputs, native `<input type="range">`)
- Each slider: label, range -20 to +20, shows adjusted € value
- Output right card: absorption gauge (colored progress bar), stat rows, insight callout
- Wire into `PlaygroundCalculatorShell`

- [ ] **Step 2: Add KPI mapping**

In `playgroundKpiMappings.ts`:
```typescript
'absorption-rate': {},
```

- [ ] **Step 3: Update Playground catalog**

In `Playground.tsx`, set `absorption-rate` entry: `live: true`, `href: '/app/playground/absorption-rate'`

- [ ] **Step 4: Add route + import to App.tsx**

Import `AbsorptionRateModelerPage` and add `<Route path="playground/absorption-rate" element={<AbsorptionRateModelerPage />} />`

- [ ] **Step 5: Build check**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/pages/AbsorptionRateModelerPage.tsx src/data/playgroundKpiMappings.ts src/pages/Playground.tsx src/App.tsx
git commit -m "feat: add Absorption Rate Modeler calculator page"
```
