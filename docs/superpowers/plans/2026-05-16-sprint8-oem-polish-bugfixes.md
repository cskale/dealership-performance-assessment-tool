# Sprint 8 — OEM Dashboard Polish + Bug Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the OEM Dashboard with loading skeletons, 3 new insight cards (Score Momentum, Assessment Coverage, Network Insights), an OEM context banner on the Results page, and fix 3 known bugs (action_audit_log 403, ActionSheet PATCH body, DialogContent titles).

**Architecture:** Extend `oemDashboardUtils.ts` with 4 new utility functions (TDD first), then update `OemDashboard.tsx` incrementally (data layer → visual polish → each card). Results page OEM banner added to `Results.tsx`. Bug fixes are mechanical, independent of dashboard work.

**Tech Stack:** React 18, TypeScript, Vite, Supabase, shadcn/ui (Skeleton, Card, Badge, Button), Vitest, Tailwind CSS.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/oemDashboardUtils.ts` | Extend | 4 new functions + 3 new constants + `DealerCoverageInput` interface |
| `src/__tests__/oemDashboardUtils.test.ts` | Extend | Tests for all 4 new functions |
| `src/pages/OemDashboard.tsx` | Modify | Data layer + polish + 3 new cards |
| `src/pages/Results.tsx` | Modify | OEM context banner |
| `src/components/ActionSheet.tsx` | Verify + fix | PATCH body serialisation + DialogTitle |
| `src/components/ActionPlan.tsx` | Verify + fix | DialogTitle |
| `src/components/kpi-encyclopedia/KPIExplorer.tsx` | Fix | DialogTitle |
| `src/components/OemModeToggle.tsx` | Fix | DialogTitle sr-only |
| `src/pages/DealerActions.tsx` | Fix | DialogTitle |
| `src/components/SmartAssistant.tsx` | Fix | DialogTitle sr-only |
| `src/components/ExportPDFModal.tsx` | Fix | DialogTitle |
| `src/components/DealershipInfoForm.tsx` | Fix | DialogTitle |

---

## Task 1: New Utility Functions + Tests (TDD)

**Files:**
- Extend: `src/lib/oemDashboardUtils.ts`
- Extend: `src/__tests__/oemDashboardUtils.test.ts`

- [ ] **Step 1: Write failing tests — append to existing test file**

Open `src/__tests__/oemDashboardUtils.test.ts`. Append these new `describe` blocks after the existing ones (do not touch existing tests):

```ts
import {
  // add to existing imports:
  computeNetworkMomentum,
  computeCoverage,
  computeDeptWeaknessCounts,
  extractTopSignals,
  STALE_THRESHOLD_DAYS,
  WEAKNESS_THRESHOLD,
} from '@/lib/oemDashboardUtils';

describe('computeNetworkMomentum', () => {
  it('returns flat + sampleSize 0 when no dealers have two scores', () => {
    const r = computeNetworkMomentum([
      { latestScore: 70, previousScore: null },
      { latestScore: null, previousScore: null },
    ]);
    expect(r.sampleSize).toBe(0);
    expect(r.direction).toBe('flat');
    expect(r.delta).toBe(0);
  });

  it('returns flat + sampleSize 1 when only one dealer has two scores (insufficient)', () => {
    const r = computeNetworkMomentum([{ latestScore: 70, previousScore: 60 }]);
    expect(r.sampleSize).toBe(1);
    expect(r.direction).toBe('flat');
  });

  it('returns up direction and correct delta when avg improved', () => {
    const r = computeNetworkMomentum([
      { latestScore: 70, previousScore: 60 },
      { latestScore: 80, previousScore: 70 },
    ]);
    expect(r.direction).toBe('up');
    expect(r.delta).toBe(10);
    expect(r.fromAvg).toBe(65);
    expect(r.toAvg).toBe(75);
    expect(r.sampleSize).toBe(2);
  });

  it('returns down direction when avg declined', () => {
    const r = computeNetworkMomentum([
      { latestScore: 55, previousScore: 70 },
      { latestScore: 65, previousScore: 75 },
    ]);
    expect(r.direction).toBe('down');
    expect(r.delta).toBeLessThan(0);
  });

  it('excludes dealers missing a previous score from sample', () => {
    const r = computeNetworkMomentum([
      { latestScore: 70, previousScore: 60 },
      { latestScore: 80, previousScore: null },
      { latestScore: 90, previousScore: 80 },
    ]);
    expect(r.sampleSize).toBe(2);
    expect(r.toAvg).toBe(80);
    expect(r.fromAvg).toBe(70);
  });
});

describe('computeCoverage', () => {
  const makeDealer = (
    id: string,
    assessmentId: string | null,
    date: string | null,
  ) => ({
    dealershipId: id,
    dealerName: `Dealer ${id}`,
    location: 'Munich',
    programmeTier: null,
    latestAssessmentId: assessmentId,
    latestAssessmentDate: date,
  });

  it('puts dealer with null assessmentId in missing', () => {
    const r = computeCoverage([makeDealer('1', null, null)]);
    expect(r.missing).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
    expect(r.healthy).toHaveLength(0);
  });

  it('puts dealer assessed within 90 days in healthy', () => {
    const recent = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const r = computeCoverage([makeDealer('1', 'uuid-1', recent)]);
    expect(r.healthy).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
  });

  it('puts dealer assessed >90 days ago in stale', () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const r = computeCoverage([makeDealer('1', 'uuid-1', old)]);
    expect(r.stale).toHaveLength(1);
    expect(r.healthy).toHaveLength(0);
  });

  it('handles mixed dealers correctly', () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const old = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const r = computeCoverage([
      makeDealer('1', null, null),
      makeDealer('2', 'uuid-2', recent),
      makeDealer('3', 'uuid-3', old),
    ]);
    expect(r.missing).toHaveLength(1);
    expect(r.healthy).toHaveLength(1);
    expect(r.stale).toHaveLength(1);
  });
});

describe('computeDeptWeaknessCounts', () => {
  it('counts dealers below threshold per dept', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 55, 'used-vehicle-sales': 70, 'service-performance': 80, 'parts-inventory': 40, 'financial-operations': 55 } },
      { deptScores: { 'new-vehicle-sales': 65, 'used-vehicle-sales': 55, 'service-performance': 55, 'parts-inventory': 70, 'financial-operations': 65 } },
    ];
    const r = computeDeptWeaknessCounts(dealers, 60);
    expect(r['new-vehicle-sales']).toBe(1);  // 55 < 60
    expect(r['used-vehicle-sales']).toBe(1); // 55 < 60
    expect(r['service-performance']).toBe(1); // 55 < 60
    expect(r['parts-inventory']).toBe(1);    // 40 < 60
    expect(r['financial-operations']).toBe(1); // 55 < 60
  });

  it('returns 0 counts when all depts above threshold', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 80, 'used-vehicle-sales': 75, 'service-performance': 70, 'parts-inventory': 85, 'financial-operations': 72 } },
    ];
    const r = computeDeptWeaknessCounts(dealers, 60);
    for (const key of ['new-vehicle-sales', 'used-vehicle-sales', 'service-performance', 'parts-inventory', 'financial-operations'] as const) {
      expect(r[key]).toBe(0);
    }
  });

  it('ignores null scores (not counted as weak)', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': null, 'used-vehicle-sales': 40, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
    ];
    const r = computeDeptWeaknessCounts(dealers, 60);
    expect(r['new-vehicle-sales']).toBe(0);
    expect(r['used-vehicle-sales']).toBe(1);
  });
});

describe('extractTopSignals', () => {
  it('counts signal occurrences and sorts by frequency', () => {
    const signals = [
      ['NVS_PROCESS_GAP', 'SVC_CAPACITY_LOW'],
      ['NVS_PROCESS_GAP', 'FIN_REPORTING_GAP'],
      ['NVS_PROCESS_GAP'],
    ];
    const r = extractTopSignals(signals);
    expect(r[0]).toEqual({ code: 'NVS_PROCESS_GAP', count: 3 });
    expect(r).toHaveLength(3);
  });

  it('returns at most 5 results', () => {
    const signals = Array.from({ length: 10 }, (_, i) => [`CODE_${i}`]);
    expect(extractTopSignals(signals)).toHaveLength(5);
  });

  it('returns empty array for empty input', () => {
    expect(extractTopSignals([])).toEqual([]);
  });

  it('handles dealers with no signals', () => {
    const signals = [[], ['NVS_PROCESS_GAP'], []];
    const r = extractTopSignals(signals);
    expect(r).toHaveLength(1);
    expect(r[0].count).toBe(1);
  });
});

describe('STALE_THRESHOLD_DAYS', () => {
  it('is 90', () => {
    expect(STALE_THRESHOLD_DAYS).toBe(90);
  });
});

describe('WEAKNESS_THRESHOLD', () => {
  it('is 60', () => {
    expect(WEAKNESS_THRESHOLD).toBe(60);
  });
});
```

**Important:** The import at the top of the test file already imports some symbols. Add `computeNetworkMomentum`, `computeCoverage`, `computeDeptWeaknessCounts`, `extractTopSignals`, `STALE_THRESHOLD_DAYS`, `WEAKNESS_THRESHOLD` to the existing import statement.

- [ ] **Step 2: Run tests — expect failures**

```bash
npx vitest run src/__tests__/oemDashboardUtils.test.ts
```

Expected: new tests fail with "is not exported" or "not a function".

- [ ] **Step 3: Add new exports to `src/lib/oemDashboardUtils.ts`**

Append to the end of the existing file (do not modify existing exports):

```ts
// ── Sprint 8 additions ──────────────────────────────────────────────────────

export const STALE_THRESHOLD_DAYS = 90;
export const WEAKNESS_THRESHOLD = 60;

export interface DealerCoverageInput {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestAssessmentId: string | null;
  latestAssessmentDate: string | null;
}

export function computeNetworkMomentum(
  dealers: Array<{ latestScore: number | null; previousScore: number | null }>
): { delta: number; direction: 'up' | 'down' | 'flat'; sampleSize: number; fromAvg: number; toAvg: number } {
  const paired = dealers.filter(d => d.latestScore !== null && d.previousScore !== null);
  if (paired.length < 2) {
    return { delta: 0, direction: 'flat', sampleSize: paired.length, fromAvg: 0, toAvg: 0 };
  }
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const toVals = paired.map(d => d.latestScore!);
  const fromVals = paired.map(d => d.previousScore!);
  const toAvg = Math.round((sum(toVals) / toVals.length) * 10) / 10;
  const fromAvg = Math.round((sum(fromVals) / fromVals.length) * 10) / 10;
  const delta = Math.round((toAvg - fromAvg) * 10) / 10;
  const direction: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return { delta, direction, sampleSize: paired.length, fromAvg, toAvg };
}

export function computeCoverage(dealers: DealerCoverageInput[]): {
  missing: DealerCoverageInput[];
  stale: DealerCoverageInput[];
  healthy: DealerCoverageInput[];
} {
  const now = Date.now();
  const missing: DealerCoverageInput[] = [];
  const stale: DealerCoverageInput[] = [];
  const healthy: DealerCoverageInput[] = [];
  for (const d of dealers) {
    if (!d.latestAssessmentId || !d.latestAssessmentDate) {
      missing.push(d);
    } else {
      const daysSince = (now - new Date(d.latestAssessmentDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > STALE_THRESHOLD_DAYS) {
        stale.push(d);
      } else {
        healthy.push(d);
      }
    }
  }
  return { missing, stale, healthy };
}

export function computeDeptWeaknessCounts(
  dealers: Array<{ deptScores: Record<DeptKey, number | null> }>,
  threshold: number
): Record<DeptKey, number> {
  const result: Record<DeptKey, number> = {
    'new-vehicle-sales': 0,
    'used-vehicle-sales': 0,
    'service-performance': 0,
    'parts-inventory': 0,
    'financial-operations': 0,
  };
  for (const dealer of dealers) {
    for (const key of DEPT_KEYS) {
      const score = dealer.deptScores[key];
      if (score !== null && score < threshold) {
        result[key]++;
      }
    }
  }
  return result;
}

export function extractTopSignals(signalCodes: string[][]): { code: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const codes of signalCodes) {
    for (const code of codes) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
npx vitest run src/__tests__/oemDashboardUtils.test.ts
```

Expected: all tests pass (existing 21 + new ~20).

- [ ] **Step 5: Commit**

```bash
git add src/lib/oemDashboardUtils.ts src/__tests__/oemDashboardUtils.test.ts
git commit -m "feat(utils): add Sprint 8 oem utility functions — momentum, coverage, insights

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: OemDashboard — Data Layer Extension

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

Extend `DealerScore` with two new fields and map them from the assessment fetch. The assessment query already selects `created_at` and `scores`.

- [ ] **Step 1: Update `DealerScore` interface**

Find the `interface DealerScore` block (around line 36) and add two new fields:

```ts
interface DealerScore {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestScore: number | null;
  previousScore: number | null;
  latestAssessmentId: string | null;
  deptScores: Record<DeptKey, number | null>;
  latestAssessmentDate: string | null;   // NEW
  signalCodes: string[];                  // NEW
}
```

- [ ] **Step 2: Update `dealerMap` initialisation in the fetch `useEffect`**

Find the loop that builds `dealerMap` entries (where `parseDeptScores(null)` is called). Update the initial entry to include the new fields:

```ts
dealerMap.set(d.id, {
  dealershipId: d.id,
  dealerName: d.name,
  location: d.location,
  programmeTier: tierByDealer.get(d.id) ?? null,
  latestScore: null,
  previousScore: null,
  latestAssessmentId: null,
  deptScores: parseDeptScores(null),
  latestAssessmentDate: null,   // NEW
  signalCodes: [],               // NEW
});
```

- [ ] **Step 3: Map new fields when processing assessments**

Find the `if (count === 0)` block that assigns `latestScore` and `deptScores`. Add the two new fields:

```ts
if (count === 0) {
  dealer.latestScore = a.overall_score ? Number(a.overall_score) : null;
  dealer.latestAssessmentId = a.id;
  dealer.deptScores = parseDeptScores(a.scores);
  dealer.latestAssessmentDate = a.created_at ?? null;                          // NEW
  dealer.signalCodes = (a.scores as any)?.signals ?? [];                        // NEW
}
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): extend DealerScore with assessmentDate + signalCodes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: OemDashboard — Visual Polish

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

Four targeted changes: loading skeletons, heatmap mobile fix, heatmap empty state, filtered avg in leaderboard footer.

- [ ] **Step 1: Add `Skeleton` import**

Add to the imports at the top of `OemDashboard.tsx`:

```tsx
import { Skeleton } from '@/components/ui/skeleton';
```

- [ ] **Step 2: Replace heatmap loading spinner with skeletons**

Find the heatmap section inside `<TabsContent value="overview">`. Currently it shows `<SharedLoadingState />` when `loadingDealers`. Replace that block:

```tsx
{loadingDealers ? (
  <Card className="shadow-card rounded-xl">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-48" />
    </CardHeader>
    <CardContent className="space-y-2 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </CardContent>
  </Card>
) : sortedDealers.length > 0 ? (
  // ... existing heatmap card
) : null}
```

- [ ] **Step 3: Add heatmap empty state**

When `sortedDealers.length === 0` and `!loadingDealers` (dealers enrolled but none have assessments), show an empty state instead of nothing. Replace the trailing `null` in the condition above:

```tsx
) : (
  <Card className="shadow-card rounded-xl">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold">Department Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <SharedEmptyState
        title="No assessments recorded yet"
        description="Enrolled dealers haven't completed an assessment. Share the assessment link to get started."
      />
    </CardContent>
  </Card>
)}
```

- [ ] **Step 4: Add `min-w-[600px]` to heatmap inner table**

Find the `<table className="w-full text-sm">` inside the heatmap `<div className="overflow-x-auto">`. Change to:

```tsx
<table className="w-full text-sm min-w-[600px]">
```

- [ ] **Step 5: Fix leaderboard filtered average**

In the Leaderboard tab, the network average footer row uses `stats.avg`. When `tierFilter !== 'all'`, this shows the unfiltered average. Fix:

Add this `useMemo` after the existing `stats` memo:

```tsx
const filteredStats = useMemo(() => {
  const scored = filteredDealers.filter(d => d.latestScore != null);
  const scores = scored.map(d => d.latestScore!);
  return {
    avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
  };
}, [filteredDealers]);
```

Then in the leaderboard footer `<TableRow>`, replace `{stats.avg}` and `{getScoreBand(stats.avg)...}` with `{filteredStats.avg}` and `{getScoreBand(filteredStats.avg)...}`.

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): dashboard visual polish — skeletons, heatmap mobile, empty state, filtered avg

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: OemDashboard — Score Momentum Card

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Add imports**

Add to the import block at the top:

```tsx
import {
  // ... existing imports from oemDashboardUtils ...
  computeNetworkMomentum,
  STALE_THRESHOLD_DAYS,
  WEAKNESS_THRESHOLD,
  computeCoverage,
  computeDeptWeaknessCounts,
  extractTopSignals,
  type DealerCoverageInput,
} from '@/lib/oemDashboardUtils';
```

Add `Activity` to the lucide-react imports (for momentum icon alternative — we use `TrendingUp`/`TrendingDown`/`Minus` which are already imported).

- [ ] **Step 2: Add momentum memo**

Add after the existing `networkAvg` memo:

```tsx
const momentum = useMemo(
  () => computeNetworkMomentum(sortedDealers),
  [sortedDealers],
);
```

- [ ] **Step 3: Add Score Momentum card to Overview tab**

In the Overview tab, after the At-Risk Dealers card and before `</TabsContent>`, add:

```tsx
{/* Score Momentum */}
{!loadingDealers && sortedDealers.length > 0 && (
  <Card className="shadow-card rounded-xl">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold">Network Momentum</CardTitle>
    </CardHeader>
    <CardContent>
      {momentum.sampleSize < 2 ? (
        <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
          <Minus className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Not enough data — need 2+ assessment cycles per dealer
            {momentum.sampleSize === 1 && ` (1 dealer has trend data)`}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {momentum.direction === 'up' && <TrendingUp className="h-8 w-8 text-[#16a34a]" />}
            {momentum.direction === 'down' && <TrendingDown className="h-8 w-8 text-[#dc2626]" />}
            {momentum.direction === 'flat' && <Minus className="h-8 w-8 text-muted-foreground" />}
            <div>
              <p className={`text-3xl font-semibold ${
                momentum.direction === 'up' ? 'text-[#16a34a]' :
                momentum.direction === 'down' ? 'text-[#dc2626]' :
                'text-muted-foreground'
              }`}>
                {momentum.delta > 0 ? '+' : ''}{momentum.delta} pts
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Network avg {momentum.direction === 'up' ? 'improved' : momentum.direction === 'down' ? 'declined' : 'unchanged'} from{' '}
              <span className="font-medium text-foreground">{momentum.fromAvg}</span> →{' '}
              <span className="font-medium text-foreground">{momentum.toAvg}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on {momentum.sampleSize} dealers with 2+ assessments
            </p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add Score Momentum card to OEM Overview tab

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: OemDashboard — Assessment Coverage Card

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Add coverage memo**

Add after the `momentum` memo:

```tsx
const coverage = useMemo(
  () => computeCoverage(sortedDealers as DealerCoverageInput[]),
  [sortedDealers],
);
```

- [ ] **Step 2: Add Assessment Coverage card to Overview tab**

After the Score Momentum card, add:

```tsx
{/* Assessment Coverage */}
{!loadingDealers && sortedDealers.length > 0 && (
  <Card className="shadow-card rounded-xl">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold">Assessment Coverage</CardTitle>
    </CardHeader>
    <CardContent>
      {coverage.missing.length === 0 && coverage.stale.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-[#16a34a]/5 rounded-lg border border-[#16a34a]/20">
          <CheckCircle className="h-5 w-5 text-[#16a34a] shrink-0" />
          <p className="text-sm text-[#16a34a] font-medium">
            All {sortedDealers.length} dealers assessed within {STALE_THRESHOLD_DAYS} days
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#d97706]">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {coverage.missing.length + coverage.stale.length} of {sortedDealers.length} dealers need attention
            </span>
          </div>
          {[...coverage.missing, ...coverage.stale].map(dealer => {
            const isStale = coverage.stale.some(s => s.dealershipId === dealer.dealershipId);
            const daysAgo = dealer.latestAssessmentDate
              ? Math.round((Date.now() - new Date(dealer.latestAssessmentDate).getTime()) / (1000 * 60 * 60 * 24))
              : null;
            return (
              <div key={dealer.dealershipId} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{dealer.dealerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {isStale && daysAgo ? `Last assessed: ${daysAgo} days ago` : 'No assessment yet'}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/app/oem-settings')}>
                  Manage
                </Button>
              </div>
            );
          })}
          {coverage.healthy.length > 0 && (
            <p className="text-xs text-muted-foreground pt-1">
              ✓ {coverage.healthy.length} dealer{coverage.healthy.length > 1 ? 's' : ''} assessed within {STALE_THRESHOLD_DAYS} days
            </p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
)}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add Assessment Coverage card to OEM Overview tab

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: OemDashboard — Network Insights Card

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Add weakness + signal memos**

Add after the `coverage` memo:

```tsx
const deptWeaknessCounts = useMemo(
  () => computeDeptWeaknessCounts(sortedDealers, WEAKNESS_THRESHOLD),
  [sortedDealers],
);

const topSignals = useMemo(
  () => extractTopSignals(sortedDealers.map(d => d.signalCodes)),
  [sortedDealers],
);

const totalDealers = sortedDealers.length;
```

- [ ] **Step 2: Add Network Insights card to Overview tab**

After the Assessment Coverage card, add:

```tsx
{/* Network Insights */}
{!loadingDealers && sortedDealers.length > 0 && (
  <Card className="shadow-card rounded-xl">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold">Network Insights</CardTitle>
    </CardHeader>
    <CardContent className="space-y-5">
      {/* Section A — Dept weakness counts */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Departments below {WEAKNESS_THRESHOLD} — most common weaknesses
        </p>
        {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0)
          .sort((a, b) => deptWeaknessCounts[b] - deptWeaknessCounts[a])
          .slice(0, 3)
          .length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No departments below {WEAKNESS_THRESHOLD} — strong network performance
          </p>
        ) : (
          <div className="space-y-2">
            {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0)
              .sort((a, b) => deptWeaknessCounts[b] - deptWeaknessCounts[a])
              .slice(0, 3)
              .map(key => {
                const count = deptWeaknessCounts[key];
                const pct = totalDealers > 0 ? count / totalDealers : 0;
                const barClass = pct > 0.5 ? 'bg-[#dc2626]' : pct > 0.25 ? 'bg-[#d97706]' : 'bg-[#2563eb]';
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-medium text-muted-foreground shrink-0">
                      {DEPT_LABELS[key]}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${barClass}`}
                        style={{ width: `${Math.round(pct * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-24 shrink-0">
                      {count}/{totalDealers} dealers
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Section B — Top signal codes (only if signal data exists) */}
      {topSignals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recurring signals
          </p>
          <div className="space-y-2">
            {topSignals.map(({ code, count }) => (
              <div key={code} className="flex items-center gap-3">
                <span className="text-xs font-mono text-foreground flex-1 truncate">{code}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(totalDealers, 12) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < count ? 'bg-[#d97706]' : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">
                  {count} dealer{count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add Network Insights card — dept weakness counts + signal aggregation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Results.tsx — OEM Context Banner (#58)

**Files:**
- Modify: `src/pages/Results.tsx`

When `actorType === 'oem'` and the user is viewing a specific assessment, show a banner with dealer name and back navigation.

- [ ] **Step 1: Add imports to Results.tsx**

Add to the existing import block:

```tsx
import { useActiveRole } from '@/hooks/useActiveRole';
```

Add `Globe` to the existing lucide-react imports.

- [ ] **Step 2: Add hook call + state**

After the existing `const { user } = useAuth();` line, add:

```tsx
const { actorType } = useActiveRole();
const [oemDealerContext, setOemDealerContext] = useState<{
  name: string;
  tier: string | null;
} | null>(null);
```

- [ ] **Step 3: Add assessmentId to the assessment select query**

The assessment query at line ~70 currently selects:
```ts
.select('id, answers, scores, overall_score, completed_at, status')
```

Change to:
```ts
.select('id, answers, scores, overall_score, completed_at, status, dealership_id')
```

Then after `setResultsData({...})`, store `dealership_id`:
```ts
setResultsData({
  assessmentId: dbAssessment.id,
  answers: dbAssessment.answers,
  scores: dbAssessment.scores,
  completedAt: dbAssessment.completed_at || new Date().toISOString(),
  dealershipId: (dbAssessment as any).dealership_id ?? null,   // NEW
});
```

- [ ] **Step 4: Add useEffect for OEM dealer context**

Add after the existing `useEffect` for `loadActions`:

```tsx
useEffect(() => {
  if (actorType !== 'oem' || !(resultsData as any)?.dealershipId) return;
  const dealershipId = (resultsData as any).dealershipId;
  supabase
    .from('dealerships')
    .select('name')
    .eq('id', dealershipId)
    .maybeSingle()
    .then(({ data }) => {
      if (data) setOemDealerContext({ name: data.name, tier: null });
    });
  supabase
    .from('dealer_network_memberships')
    .select('programme_tier')
    .eq('dealership_id', dealershipId)
    .eq('is_active', true)
    .maybeSingle()
    .then(({ data }) => {
      if (data) setOemDealerContext(prev => prev ? { ...prev, tier: data.programme_tier } : null);
    });
}, [actorType, (resultsData as any)?.dealershipId]);
```

- [ ] **Step 5: Add OEM context banner to render**

The main return starts at line ~295:
```tsx
return (
  <div className="min-h-screen bg-muted">
    <div className="px-6 py-6" id="results-content">
```

Insert the banner between those two divs:

```tsx
return (
  <div className="min-h-screen bg-muted">
    {/* OEM context banner — only shown to OEM users viewing a dealer's results */}
    {actorType === 'oem' && oemDealerContext && (
      <div className="bg-[hsl(var(--brand-50))] border-b border-[hsl(var(--brand-200))] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--brand-700))]">
          <Globe className="h-4 w-4 shrink-0" />
          <span>Viewing as OEM</span>
          <span className="text-[hsl(var(--brand-400))]">·</span>
          <span className="font-medium">{oemDealerContext.name}</span>
          {oemDealerContext.tier && (
            <TierBadge tier={oemDealerContext.tier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[hsl(var(--brand-700))] hover:text-[hsl(var(--brand-900))] gap-1"
          onClick={() => navigate('/app/oem-dashboard')}
        >
          ← Back to OEM Dashboard
        </Button>
      </div>
    )}
    <div className="px-6 py-6" id="results-content">
```

Add `TierBadge` import at the top:
```tsx
import { TierBadge } from '@/components/shared/TierBadge';
```

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Results.tsx
git commit -m "feat(oem): add OEM context banner to Results page (#58)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Bug Fix — action_audit_log + ActionSheet PATCH Verification

**Files:**
- Verify: `src/components/ActionSheet.tsx`
- Verify: `src/components/ActionPlan.tsx`

These bugs are documented in CLAUDE.md but may already be fixed. Verify before fixing.

- [ ] **Step 1: Verify action_audit_log 403**

Run the app (`npm run dev`). Open an action in ActionSheet. Open browser DevTools → Network tab. Filter by `action_audit_log`. Save the action.

Expected: only `GET` requests to `action_audit_log` (SELECT for display in ActivityFeed). No `POST`/`PATCH` requests with 403.

If a 403 exists: find the client-side insert call and delete it — the DB trigger handles inserts automatically.

If no 403: the bug is already resolved. Move on.

- [ ] **Step 2: Verify ActionSheet PATCH body serialisation**

In DevTools → Network, filter by `improvement_actions`. Edit an action field (e.g. change status). Click Save.

Check the PATCH request payload. Expected: `Content-Type: application/json` body with `{"status":"In Progress", ...}`.

If `new_value` appears as `%22In+Progress%22` in query params: the bug exists. The fix is in `ActionPlan.tsx`'s `performUpdate` function — ensure `.update({...})` uses the Supabase client, not a raw `fetch()`. The current `performUpdate` at line ~351 already uses `.from('improvement_actions').update({...})` which is correct.

If the request looks correct: the bug is already resolved. Move on.

- [ ] **Step 3: Commit if any fixes were made**

If fixes were needed:
```bash
git add src/components/ActionSheet.tsx src/components/ActionPlan.tsx
git commit -m "fix: remove client-side action_audit_log insert + fix PATCH body serialisation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

If no fixes needed, skip this commit — no empty commits.

---

## Task 9: Bug Fix — DialogContent Accessible Titles

**Files:**
- Modify: `src/components/ActionPlan.tsx`, `src/components/kpi-encyclopedia/KPIExplorer.tsx`, `src/components/OemModeToggle.tsx`, `src/pages/DealerActions.tsx`, `src/components/SmartAssistant.tsx`, `src/components/ExportPDFModal.tsx`, `src/components/DealershipInfoForm.tsx`

`ActionSheet.tsx` already has `DialogTitle` (it imports and uses it). Skip it.

For each file: read the file, find the `<DialogContent>` block, add `DialogTitle` if missing.

- [ ] **Step 1: Fix `src/components/ActionPlan.tsx`**

Read the file. Find `<DialogContent`. Ensure `DialogTitle` is imported from `@/components/ui/dialog`. If the dialog has no visible heading, add inside `<DialogHeader>`:
```tsx
<DialogTitle className="sr-only">Action Plan</DialogTitle>
```

- [ ] **Step 2: Fix `src/components/kpi-encyclopedia/KPIExplorer.tsx`**

Read the file. Find `<DialogContent`. If a visible heading exists (h2, h3, CardTitle), wrap it in `<DialogTitle>`. If no visible heading:
```tsx
<DialogTitle className="sr-only">KPI Encyclopedia</DialogTitle>
```

- [ ] **Step 3: Fix `src/components/OemModeToggle.tsx`**

Read the file. Find `<DialogContent`. Add inside `<DialogHeader>`:
```tsx
<DialogTitle className="sr-only">OEM Mode Settings</DialogTitle>
```

- [ ] **Step 4: Fix `src/pages/DealerActions.tsx`**

Read the file. Find `<DialogContent`. If a visible heading exists, wrap it in `<DialogTitle>`. If not:
```tsx
<DialogTitle className="sr-only">Action Details</DialogTitle>
```

- [ ] **Step 5: Fix `src/components/SmartAssistant.tsx`**

Read the file. Find `<DialogContent`. Add inside `<DialogHeader>`:
```tsx
<DialogTitle className="sr-only">Smart Assistant</DialogTitle>
```

- [ ] **Step 6: Fix `src/components/ExportPDFModal.tsx`**

Read the file. Find `<DialogContent`. If a visible heading exists, wrap it in `<DialogTitle>`. If not:
```tsx
<DialogTitle className="sr-only">Export Report</DialogTitle>
```

- [ ] **Step 7: Fix `src/components/DealershipInfoForm.tsx`**

Read the file. Find `<DialogContent`. If a visible heading exists, wrap it in `<DialogTitle>`. If not:
```tsx
<DialogTitle className="sr-only">Dealership Information</DialogTitle>
```

- [ ] **Step 8: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, no accessibility warnings about missing DialogTitle.

- [ ] **Step 9: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/components/ActionPlan.tsx src/components/kpi-encyclopedia/KPIExplorer.tsx src/components/OemModeToggle.tsx src/pages/DealerActions.tsx src/components/SmartAssistant.tsx src/components/ExportPDFModal.tsx src/components/DealershipInfoForm.tsx
git commit -m "fix(a11y): add missing DialogTitle to all DialogContent components

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Notes

- `computeNetworkMomentum` requires `sampleSize >= 2` — intentional. One dealer's trend is not a network trend.
- `DealerCoverageInput` is a subset interface — `sortedDealers as DealerCoverageInput[]` cast is safe because `DealerScore` is a superset.
- `(a.scores as any)?.signals ?? []` — signal codes may not exist in older assessments; the `?? []` ensures graceful degradation.
- OEM context banner only renders when both `actorType === 'oem'` AND `oemDealerContext !== null`. If the dealer fetch fails, the banner is simply absent — no broken UI.
- Bug verification steps (Task 8) may produce no code changes if bugs are already fixed. That is correct — do not commit empty changes.
