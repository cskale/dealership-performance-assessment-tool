# Sprint 9 — OEM Dashboard Full Redesign

**Date:** 2026-05-16
**Design style:** Exact match to Coach Dashboard — `bg-[#0b1f3a]` stats bar + hero, `ScoreGauge`, `TierBadge`, `shadow-card rounded-xl` cards, maturity band colours.

---

## Goal

Transform the OEM Dashboard from a constrained-width table into a full-width command centre matching the Coach Dashboard's design language. Primary view switches from leaderboard table to dealer cards grid. Hero + stats bar added. One extra Supabase query for open action counts per dealer.

---

## Architecture

Single file change: `src/pages/OemDashboard.tsx` (full rewrite of render output, data layer extended).
Utility addtion: `DealerScore` interface extended with `openActionCount: number`.
No new files, no new migrations, no new DB schema.

---

## Section 1: Layout + Stats Bar + Hero

### Full Width

Remove `max-w-7xl mx-auto` from the outer container. Use `p-6 space-y-6` only — matches Coach Dashboard exactly.

### Top Stats Bar

```tsx
<div className="h-9 bg-[#0b1f3a] flex items-center px-6 sticky top-0 z-10">
  {/* chips: NETWORK | AVG SCORE | CRITICAL GAPS | ENROLLED DEALERS */}
</div>
```

Four chips pipe-separated:
| Label | Value |
|-------|-------|
| NETWORK | `{networks.find(n => n.id === selectedNetworkId)?.oem_brand ?? 'OEM Network'}` |
| AVG SCORE | `{stats.avg}` or `—` |
| CRITICAL GAPS | `{atRiskDealers.length}` |
| ENROLLED DEALERS | `{stats.total}` |

Style: `text-[11px] uppercase tracking-wider text-white/50` labels, `text-white font-semibold` values, `border-r border-white/[0.08]` dividers. Identical to Coach Dashboard strip.

### Dark Hero Card

```tsx
<div className="rounded-xl bg-[#0b1f3a] text-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
```

**Col 1 — Network Score:**
- Label: `NETWORK PERFORMANCE · {getQuarterLabel()}`
- Score: `text-5xl font-bold` — `{stats.avg}` / 100
- Progress bar: `bg-[#2563eb]` fill on `bg-white/10` track, width = `${stats.avg}%`
- Band badge: reuse existing `getScoreBand(stats.avg)` colours
- Delta: `↑ +{momentum.delta} pts` green / `↓ {momentum.delta} pts` red / `—` grey (from Sprint 8 `computeNetworkMomentum`)
- Narrative: same logic as Coach Dashboard — generated from avg score

**Col 2 — Network Health:**
- Label: `ENROLLED DEALERS`
- Large number: `text-5xl font-bold` — `{stats.total}`
- Sub-line: if `atRiskDealers.length > 0` → `{n} in Foundational band` in `text-[#dc2626]`; else → `"All dealers above threshold"` in `text-[#16a34a]`
- Preview: first 2 at-risk dealer names as small chips below

**Col 3 — Dept Velocity:**
- Label: `DEPT WEAKNESSES ACROSS NETWORK`
- Top 3 weakest depts from `deptWeaknessCounts` (Sprint 8), sorted desc by count
- Each row: dept label + horizontal bar + `{count}/{stats.total} dealers`
- Bar colour: `bg-[#dc2626]` if pct > 0.5, `bg-[#d97706]` if > 0.25, `bg-[#2563eb]` otherwise
- If no weakness data: `"No departments below threshold"` in green

---

## Section 2: Overview Tab — Dealer Cards Grid

### Data Extension

Add `openActionCount: number` to `DealerScore` interface.

After fetching dealership IDs, run one additional query:
```ts
const { data: openActions } = await supabase
  .from('improvement_actions')
  .select('dealership_id')
  .in('dealership_id', dealershipIds)
  .neq('status', 'Completed');

const openCountByDealer = new Map<string, number>();
for (const a of openActions ?? []) {
  openCountByDealer.set(a.dealership_id, (openCountByDealer.get(a.dealership_id) ?? 0) + 1);
}
```

Map into `DealerScore` initialisation: `openActionCount: openCountByDealer.get(d.id) ?? 0`.

### Dealer Cards Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {sortedDealers.map(dealer => <OemDealerCard key={dealer.dealershipId} dealer={dealer} onSelect={setSelectedDealer} navigate={navigate} />)}
</div>
```

Extract as inline function `OemDealerCard` (not a separate file — keep in OemDashboard.tsx).

**Card structure** (`rounded-xl shadow-card border p-4 space-y-3 hover:bg-muted/30 transition-colors cursor-pointer`):

```
Row 1: [TierBadge left] ........... [ScoreGauge size=56 right]
Row 2: dealer name (font-semibold) + maturity band badge inline
Row 3: MapPin icon + location text-xs text-muted-foreground
───────────────────────────────────────────────────────
Row 4: Top 3 dept score bars (2-per-row grid)
       Each: [LABEL] [bar] [score]
       getDeptBgClass() for bar colour, getDeptTextClass() for score colour
       Show — if null
───────────────────────────────────────────────────────
Row 5: {openActionCount} open actions · assessed {daysAgo}d ago
       (or "No assessment yet" if latestAssessmentId === null)
Row 6: [Enter Dealership →] button (outline, full width)
       disabled + opacity-50 if no assessment
```

**Dept bar selection:** Show top 3 depts by absolute score (lowest 3 — most informative for OEM). Use `DEPT_KEYS` slice of the 3 with lowest scores.

**daysAgo:** `Math.round((Date.now() - new Date(dealer.latestAssessmentDate).getTime()) / 86400000)` — already in `DealerScore.latestAssessmentDate` from Sprint 8.

**CTA:** `navigate('/app/results/${dealer.latestAssessmentId}')` — same as existing drill-down Sheet CTA.

**Card click:** clicking anywhere on card (except the button) opens the drill-down Sheet (`setSelectedDealer(dealer)`).

**Empty states:**
- 0 dealers enrolled: existing "Set up your OEM network" card — keep unchanged
- Dealers enrolled, no assessments: card renders with `ScoreGauge score={0}`, grey progress, "No assessment yet" footer, disabled CTA

### Content Order in Overview Tab

```
1. [Dealer Cards Grid]           ← NEW — primary content
2. [At-Risk Dealers card]        ← Sprint 8, unchanged
3. [Score Momentum card]         ← Sprint 8, unchanged
4. [Assessment Coverage card]    ← Sprint 8, unchanged
5. [Network Insights card]       ← Sprint 8, unchanged
```

---

## Section 3: Leaderboard Tab (Polish Only)

Three small changes to existing leaderboard:

**1 — Heatmap card title:** "Department Performance" → "Network Portfolio Heatmap"

**2 — Rank change indicator:** In the leaderboard `<TableRow>`, add a small arrow next to rank:
```tsx
{dealer.latestScore != null && dealer.previousScore != null ? (
  dealer.latestScore > dealer.previousScore
    ? <span className="text-[#16a34a] text-xs ml-1">▲</span>
    : dealer.latestScore < dealer.previousScore
    ? <span className="text-[#dc2626] text-xs ml-1">▼</span>
    : <span className="text-muted-foreground text-xs ml-1">—</span>
) : null}
```

**3 — Width:** Already fixed by removing `max-w-7xl` in Section 1.

---

## Page Header

Replace current generic header with Coach Dashboard style:

```tsx
<p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
  OEM PERSPECTIVE · {getQuarterLabel()}
</p>
<h1 className="text-2xl font-semibold text-foreground">Network Overview</h1>
<p className="text-sm text-muted-foreground mt-1">
  Active monitoring for {stats.total} enrolled {stats.total === 1 ? 'dealership' : 'dealerships'}
</p>
```

Define inline in OemDashboard.tsx (same as CoachDashboard — not exported from a shared util):
```ts
function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}
```

---

## DealerScore Interface (final)

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
  latestAssessmentDate: string | null;   // Sprint 8
  signalCodes: string[];                  // Sprint 8
  openActionCount: number;               // Sprint 9 NEW
}
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/OemDashboard.tsx` | Full render rewrite — stats bar, hero, dealer cards, polish |

---

## Out of Scope (Sprint 10+)

- Network map view
- Export Network Report button
- Multi-network tab switcher (BMW Network / Audi Tier 1 tabs)
- Coach strategic briefing / QBR section
- Inventory/capacity data (requires new DB tables)
