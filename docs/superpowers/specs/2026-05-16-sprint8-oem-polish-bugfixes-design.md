# Sprint 8 — OEM Dashboard Polish + Bug Fixes

**Date:** 2026-05-16
**Design style:** Match Sprint 5–7 exactly — `shadow-card rounded-xl`, `SharedLoadingState/EmptyState`, `Skeleton`, exact maturity band hex values, `SharedEmptyState`.

---

## Scope

Two workstreams in one plan, OEM dashboard first:

1. **OEM Dashboard** — visual polish + 3 new feature cards + Results page OEM context banner
2. **Bug fixes** — ActionSheet PATCH body, `action_audit_log` 403, DialogContent accessible titles

---

## Workstream A: OEM Dashboard

### A1 — Visual Polish (`src/pages/OemDashboard.tsx`)

**Loading skeletons:**
- Replace `SharedLoadingState` spinner in heatmap and at-risk sections with shaped `<Skeleton>` rows
- Heatmap skeleton: 5 rows × 6 columns (dealer name col + 5 dept cols)
- At-risk skeleton: 3 rows of dealer name + score badge shape
- `Skeleton` is in `src/components/ui/skeleton.tsx` (shadcn, already installed)

**Heatmap mobile fix:**
- Add `min-w-[600px]` to inner `<table>` element so columns don't collapse on narrow screens
- Add right-edge fade gradient overlay on the `overflow-x-auto` wrapper to hint horizontal scroll

**Empty state for heatmap:**
- When `sortedDealers.length > 0` but all `latestScore === null` (enrolled but no assessments): show `SharedEmptyState` with "No assessments recorded yet" inside the heatmap card body instead of blank space

**Leaderboard filtered avg fix:**
- Network average footer row currently always shows `stats.avg` (all dealers)
- Fix: compute `filteredAvg` from `filteredDealers` only — show filtered network avg when a tier filter is active

### A2 — New Feature Cards (all in Overview tab, below At-Risk card)

All three cards read from data already fetched in the existing `useEffect` hooks. No new DB queries. Two new fields needed on `DealerScore` interface:
- `latestAssessmentDate: string | null` — ISO date of latest assessment (already available in `assessments.created_at`, just not stored)
- `signalCodes: string[]` — signal codes from `assessments.scores.signals` array (if present)

Assessment fetch query extended to include `scores` (already fetched for dept scores) — signal codes parsed from `scores.signals` if that key exists.

---

#### Card: Score Momentum

**Location:** Overview tab, first card below At-Risk

**Logic:**
- For each dealer with both `latestScore` and `previousScore`, compute delta = latest − previous
- Network momentum = average of all per-dealer deltas (only dealers with 2 scores)
- `direction`: `'up'` if delta > 0, `'down'` if delta < 0, `'flat'` if delta === 0
- `sampleSize`: count of dealers with 2 assessments

**Renders:**
```
Card: "Network Momentum"
  If sampleSize < 2:
    Minus icon + "Not enough data — need 2+ assessment cycles per dealer"
  Else:
    TrendingUp/TrendingDown/Minus icon (colour-coded green/red/muted)
    Large delta: "+4.2 pts" or "−2.1 pts"
    Sub: "Network avg improved from 61 → 65 · based on N dealers"
```

**Utility function:** `computeNetworkMomentum(dealers: DealerScore[])` in `oemDashboardUtils.ts`
```ts
export function computeNetworkMomentum(dealers: DealerScore[]): {
  delta: number;
  direction: 'up' | 'down' | 'flat';
  sampleSize: number;
  fromAvg: number;
  toAvg: number;
}
```

---

#### Card: Assessment Coverage

**Location:** Overview tab, second card below At-Risk

**Constants:**
```ts
export const STALE_THRESHOLD_DAYS = 90;
```

**Logic:**
- `missing`: dealers where `latestAssessmentId === null`
- `stale`: dealers where `latestAssessmentDate` is >90 days ago
- `healthy`: all others

**Renders:**
```
Card: "Assessment Coverage"
  If all healthy:
    Green checkmark: "All N dealers assessed within 90 days"
  Else:
    ⚠ "X of N dealers need attention"
    List rows per missing/stale dealer:
      dealer name | "No assessment yet" or "Last: N days ago" | TierBadge
      [Manage] button → navigate('/app/oem-settings')
    ✓ "N dealers assessed within 90 days" footer line
```

**Utility function:** `computeCoverage(dealers: DealerScore[])` in `oemDashboardUtils.ts`
```ts
export function computeCoverage(dealers: DealerScore[]): {
  missing: DealerScore[];
  stale: DealerScore[];
  healthy: DealerScore[];
}
```

---

#### Card: Network Insights

**Location:** Overview tab, third card below At-Risk

**Two sections in one card:**

**Section A — Dept weakness counts** (always shown if dealers exist):
- For each dept key, count dealers where `deptScores[key] !== null && deptScores[key] < 60`
- Threshold: `WEAKNESS_THRESHOLD = 60` constant in `oemDashboardUtils.ts`
- Render top 3 depts by count as horizontal bar rows:
  ```
  SVC  8/12 dealers below 60  ████████░░░░
  PTS  5/12 dealers below 60  █████░░░░░░░
  FIN  3/12 dealers below 60  ███░░░░░░░░░
  ```
- Bar colour matches dept cell class (red if >50% of network, amber if 25–50%, blue otherwise)
- Only show depts with count > 0
- Empty: "No departments below threshold — strong network performance"

**Section B — Top signal codes** (shown only if any dealer has signal data):
- Parse `assessments.scores.signals` array per dealer (array of signal code strings)
- Aggregate: count how many dealers have each code
- Show top 5 by count:
  ```
  NVS_PROCESS_GAP    7 dealers  ●●●●●●●○○○○○
  SVC_CAPACITY_LOW   5 dealers
  ```
- Dot indicator: filled dots = affected dealers, empty = not affected (max 12 dots)
- If no signal data in any assessment: section B hidden entirely

**Utility functions** in `oemDashboardUtils.ts`:
```ts
export const WEAKNESS_THRESHOLD = 60;

export function computeDeptWeaknessCounts(
  dealers: DealerScore[],
  threshold: number
): Record<DeptKey, number>

export function extractTopSignals(
  signalCodes: string[][]  // one array per dealer
): { code: string; count: number }[]
```

---

### A3 — Results Page OEM Context Banner (`src/pages/Results.tsx`)

**Trigger:** `actorType === 'oem'` (from `useActiveRole()`)

**Data needed:** dealership name + programme tier for the assessment being viewed. Fetch via:
```ts
const { data: dealership } = await supabase
  .from('dealerships')
  .select('name, id')
  .eq('id', assessment.dealership_id)
  .maybeSingle();

const { data: membership } = await supabase
  .from('dealer_network_memberships')
  .select('programme_tier')
  .eq('dealership_id', assessment.dealership_id)
  .eq('is_active', true)
  .maybeSingle();
```

**Renders** (below page header, above score section):
```
bg-[hsl(var(--brand-50))] border-b border-[hsl(var(--brand-200))] px-6 py-3
  Globe icon  "Viewing as OEM · {dealershipName}"  TierBadge
  ← Back to OEM Dashboard (Button variant="ghost" size="sm")
```

- `navigate('/app/oem-dashboard')` on back button click
- Only renders when `actorType === 'oem'`
- Does not render for dealer/coach viewing own results

---

## Workstream B: Bug Fixes

### B1 — ActionSheet PATCH body serialisation (`src/components/ActionSheet.tsx`)

**Problem:** `new_value` sent as URL-encoded query param instead of JSON body in action update call.

**Fix:** Read the exact update call. Supabase `.update()` handles serialisation correctly — the bug is likely a manual `fetch`/REST call elsewhere. Find it, replace with Supabase client `.update()` or fix the `Content-Type: application/json` header + `JSON.stringify(body)`.

**Verification:** After fix, update an action's status/title and confirm `action_audit_log` shows a correctly formatted `new_value` (plain string, not `%22value%22`).

---

### B2 — `action_audit_log` 403 client call (`src/components/ActionActivityFeed.tsx` or `ActionSheet.tsx`)

**Problem:** Client attempts a direct REST INSERT to `action_audit_log` which RLS blocks. Inserts are handled by a DB trigger on `improvement_actions` updates.

**Fix:** Find and delete all client-side insert calls to `action_audit_log`. The `SELECT` call in `ActionActivityFeed.tsx` (reading audit log for display) is correct and should stay — only remove any `INSERT`/`.from('action_audit_log').insert()` calls.

**Verification:** Update an action, confirm no 403 in browser console, confirm audit log entry appears via the trigger.

---

### B3 — DialogContent missing accessible titles

**Problem:** 8 custom component files use `DialogContent` without `DialogTitle`, causing React accessibility warnings.

**Fix per file:**

| File | Action |
|------|--------|
| `src/components/ActionSheet.tsx` | Has visible title — wrap in `<DialogTitle>` |
| `src/components/ActionPlan.tsx` | Add `<DialogTitle className="sr-only">Action Plan</DialogTitle>` |
| `src/components/kpi-encyclopedia/KPIExplorer.tsx` | Has visible title — wrap in `<DialogTitle>` |
| `src/components/OemModeToggle.tsx` | Add `<DialogTitle className="sr-only">OEM Mode</DialogTitle>` |
| `src/pages/DealerActions.tsx` | Has visible title — wrap in `<DialogTitle>` |
| `src/components/SmartAssistant.tsx` | Add `<DialogTitle className="sr-only">Smart Assistant</DialogTitle>` |
| `src/components/ExportPDFModal.tsx` | Has visible title — wrap in `<DialogTitle>` |
| `src/components/DealershipInfoForm.tsx` | Has visible title — wrap in `<DialogTitle>` |

**Skip:** `src/components/ui/dialog.tsx`, `command.tsx`, `alert-dialog.tsx` — shadcn-managed, do not edit.

**Verification:** `npm run build` produces no accessibility warnings.

---

## New Utility Functions Summary (`src/lib/oemDashboardUtils.ts`)

Add to existing file (do not rewrite):

```ts
// Score Momentum
export function computeNetworkMomentum(dealers: DealerScore[]): {
  delta: number; direction: 'up' | 'down' | 'flat'; sampleSize: number;
  fromAvg: number; toAvg: number;
}

// Assessment Coverage
export const STALE_THRESHOLD_DAYS = 90;
// DealerCoverageInput is a subset — avoids importing the full DealerScore interface
export interface DealerCoverageInput {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestAssessmentId: string | null;
  latestAssessmentDate: string | null;
}
export function computeCoverage(dealers: DealerCoverageInput[]): {
  missing: DealerCoverageInput[]; stale: DealerCoverageInput[]; healthy: DealerCoverageInput[];
}

// Network Insights
export const WEAKNESS_THRESHOLD = 60;
export function computeDeptWeaknessCounts(dealers: DealerScore[], threshold: number): Record<DeptKey, number>
export function extractTopSignals(signalCodes: string[][]): { code: string; count: number }[]
```

All new functions require tests in `src/__tests__/oemDashboardUtils.test.ts`.

---

## DealerScore Interface Extension

```ts
interface DealerScore {
  // existing fields unchanged...
  latestAssessmentDate: string | null;  // NEW — from assessments.created_at
  signalCodes: string[];                // NEW — from assessments.scores.signals ?? []
}
```

Assessment fetch query: already selects `scores` and `created_at` — just map them into `DealerScore`.

---

## Files Summary

| File | Change |
|------|--------|
| `src/pages/OemDashboard.tsx` | Visual polish + 3 new cards + skeleton loading + filtered avg fix |
| `src/lib/oemDashboardUtils.ts` | 4 new utility functions + 2 new constants |
| `src/__tests__/oemDashboardUtils.test.ts` | Tests for all 4 new functions |
| `src/pages/Results.tsx` | OEM context banner (#58) |
| `src/components/ActionSheet.tsx` | PATCH body fix + DialogTitle |
| `src/components/ActionActivityFeed.tsx` | Remove client-side audit_log insert if present |
| `src/components/ActionPlan.tsx` | DialogTitle sr-only |
| `src/components/kpi-encyclopedia/KPIExplorer.tsx` | DialogTitle |
| `src/components/OemModeToggle.tsx` | DialogTitle sr-only |
| `src/pages/DealerActions.tsx` | DialogTitle |
| `src/components/SmartAssistant.tsx` | DialogTitle sr-only |
| `src/components/ExportPDFModal.tsx` | DialogTitle |
| `src/components/DealershipInfoForm.tsx` | DialogTitle |

---

## Out of Scope (Sprint 9+)

- Tier gap analysis (needs real programme tier data)
- Signal aggregation drill-down (click signal code → list of affected dealers)
- Configurable weakness/staleness thresholds per network
- Delta scoring DB design (#36)
