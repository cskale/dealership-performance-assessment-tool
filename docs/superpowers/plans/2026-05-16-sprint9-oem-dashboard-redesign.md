# Sprint 9 — OEM Dashboard Full Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the OEM Dashboard from a constrained-width table into a full-width command centre matching the Coach Dashboard's exact design language — dark navy stats bar, 3-column hero, dealer cards grid, rank arrows.

**Architecture:** Single file rewrite of `src/pages/OemDashboard.tsx`. Data layer extended with one extra Supabase query for open action counts. Six helper functions/components added inline. No new files, no migrations.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (Card, Badge, Button, Sheet, Tabs, Skeleton, Select, Table), Supabase, lucide-react.

---

## File Map

| File | Change |
|------|--------|
| `src/pages/OemDashboard.tsx` | Full rewrite — 6 incremental commits |

---

## Task 1: Data Layer — Add `openActionCount` to `DealerScore`

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Extend `DealerScore` interface**

Find the `interface DealerScore` block (around line 44). Add one field:

```tsx
interface DealerScore {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestScore: number | null;
  previousScore: number | null;
  latestAssessmentId: string | null;
  deptScores: Record<DeptKey, number | null>;
  latestAssessmentDate: string | null;
  signalCodes: string[];
  openActionCount: number;   // NEW
}
```

- [ ] **Step 2: Initialise `openActionCount` in `dealerMap`**

In the `fetchDealerScores` useEffect, find the `dealerMap.set(d.id, {...})` block. Add the new field with default 0:

```tsx
dealerMap.set(d.id, {
  dealershipId: d.id,
  dealerName: d.name,
  location: d.location,
  programmeTier: tierByDealer.get(d.id) ?? null,
  latestScore: null,
  previousScore: null,
  latestAssessmentId: null,
  deptScores: parseDeptScores(null),
  latestAssessmentDate: null,
  signalCodes: [],
  openActionCount: 0,   // NEW
});
```

- [ ] **Step 3: Add open-action-count query after assessments fetch**

In `fetchDealerScores`, after the `const { data: assessments }` query and before `const dealerMap = new Map`, add:

```tsx
const { data: openActions } = await supabase
  .from('improvement_actions')
  .select('dealership_id')
  .in('dealership_id', dealershipIds)
  .neq('status', 'Completed');

const openCountByDealer = new Map<string, number>();
for (const a of openActions ?? []) {
  if (a.dealership_id) {
    openCountByDealer.set(
      a.dealership_id,
      (openCountByDealer.get(a.dealership_id) ?? 0) + 1,
    );
  }
}
```

- [ ] **Step 4: Map `openActionCount` when building `dealerMap`**

In the `dealerMap.set` call updated in Step 2, change `openActionCount: 0` to:

```tsx
openActionCount: openCountByDealer.get(d.id) ?? 0,
```

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add openActionCount to DealerScore data layer

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Helper Functions — `getQuarterLabel`, `getHeroNarrative`, `OemDealerCard`

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

Add all three before the `export default function OemDashboard()` line.

- [ ] **Step 1: Add `getQuarterLabel` after existing helper functions**

After `getRankBadgeClass` (around line 83), add:

```tsx
function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

function getHeroNarrative(avgScore: number, dealerCount: number, atRiskCount: number): string {
  if (dealerCount === 0) return 'No dealers enrolled in the network yet.';
  if (avgScore >= 85) return 'Network performing above benchmark across all departments.';
  if (avgScore >= 70) return `Most dealers performing well — ${atRiskCount} below Foundational threshold.`;
  if (avgScore >= 46) return `${atRiskCount} dealer${atRiskCount !== 1 ? 's' : ''} require active intervention this quarter.`;
  return `${atRiskCount} dealer${atRiskCount !== 1 ? 's' : ''} at Foundational level — priority coaching required.`;
}
```

- [ ] **Step 2: Add `OemDealerCard` inline component**

After `getHeroNarrative`, add:

```tsx
function OemDealerCard({
  dealer,
  onSelect,
  onNavigate,
}: {
  dealer: DealerScore;
  onSelect: (d: DealerScore) => void;
  onNavigate: (path: string) => void;
}) {
  const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;

  const rankedDepts = DEPT_KEYS
    .map(k => ({ key: k, score: dealer.deptScores[k] }))
    .filter((d): d is { key: DeptKey; score: number } => d.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const daysAgo = dealer.latestAssessmentDate
    ? Math.round((Date.now() - new Date(dealer.latestAssessmentDate).getTime()) / 86400000)
    : null;

  return (
    <div
      className="rounded-xl shadow-card border p-4 space-y-3 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => onSelect(dealer)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <TierBadge
            tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null}
            size="sm"
          />
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {dealer.dealerName}
          </p>
          {band && (
            <Badge variant="outline" className={`${band.className} text-xs py-0`}>
              {band.label}
            </Badge>
          )}
        </div>
        <div className="shrink-0">
          <ScoreGauge score={dealer.latestScore ?? 0} size={56} />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{dealer.location}</span>
      </div>

      {/* Dept score bars — top 3 weakest */}
      {rankedDepts.length > 0 ? (
        <div className="space-y-1.5 pt-2 border-t border-border">
          {rankedDepts.map(({ key, score }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground w-8 shrink-0 uppercase">
                {DEPT_LABELS[key]}
              </span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${getDeptBgClass(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-xs font-semibold w-6 text-right shrink-0 ${getDeptTextClass(score)}`}>
                {Math.round(score)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground italic">No assessment data yet</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border pt-2 space-y-2">
        <p className="text-xs text-muted-foreground">
          {dealer.latestAssessmentId
            ? `${dealer.openActionCount} open action${dealer.openActionCount !== 1 ? 's' : ''} · assessed ${daysAgo}d ago`
            : 'No assessment yet'}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7"
          disabled={!dealer.latestAssessmentId}
          onClick={e => {
            e.stopPropagation();
            if (dealer.latestAssessmentId) {
              onNavigate(`/app/results/${dealer.latestAssessmentId}`);
            }
          }}
        >
          Enter Dealership →
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add OemDealerCard + hero narrative helpers

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Stats Bar + Layout Restructure + Page Header

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Restructure the outer return container**

Find the main `return (` block (around line 281). The current outer div is:
```tsx
<div className="p-6 space-y-6 max-w-7xl mx-auto">
```

Replace the **entire return** with this new wrapper structure (keep all inner content — just change the outer shell):

```tsx
return (
  <div className="flex flex-col">
    {/* ── Top stats bar ── */}
    <div className="h-9 bg-[#0b1f3a] flex items-center px-6 sticky top-0 z-10">
      {(() => {
        const brand = networks.find(n => n.id === selectedNetworkId)?.oem_brand ?? 'OEM Network';
        const chips = [
          { label: 'NETWORK',          value: brand },
          { label: 'AVG SCORE',        value: stats.avg > 0 ? String(stats.avg) : '—' },
          { label: 'CRITICAL GAPS',    value: String(atRiskDealers.length) },
          { label: 'ENROLLED DEALERS', value: String(stats.total) },
        ];
        return chips.map((chip, i) => (
          <div
            key={chip.label}
            className={`flex items-center gap-2 px-4 h-full ${i < chips.length - 1 ? 'border-r border-white/[0.08]' : ''}`}
          >
            <span className="text-[11px] text-white/50 uppercase tracking-wider">{chip.label}</span>
            <span className="text-[11px] font-semibold text-white">{chip.value}</span>
          </div>
        ));
      })()}
    </div>

    <div className="p-6 space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
            OEM PERSPECTIVE · {getQuarterLabel()}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Network Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active monitoring for {stats.total} enrolled {stats.total === 1 ? 'dealership' : 'dealerships'}
          </p>
        </div>
        {networks.length > 1 && (
          <Select value={selectedNetworkId ?? ''} onValueChange={setSelectedNetworkId}>
            <SelectTrigger className="w-56 shrink-0">
              <Globe className="w-4 h-4 mr-2 shrink-0" />
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map(n => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Rest of content (hero + tabs) goes here — see Tasks 4 & 5 ── */}

    </div>
  </div>
);
```

At this stage the Tabs content (hero, overview, leaderboard) will be temporarily missing. That is expected — Tasks 4 and 5 will add them back.

- [ ] **Step 2: Build check — expect missing content but no type errors**

```bash
npm run build
```

Expected: no TypeScript errors (empty body is valid JSX).

- [ ] **Step 3: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): full-width layout + coach-style stats bar + page header

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Dark Hero Card

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Add hero card inside `<div className="p-6 space-y-6">`**

After the page header block and before the closing `</div>` of `<div className="p-6 space-y-6">`, add:

```tsx
{/* ── Dark hero card ── */}
<div className="rounded-xl bg-[#0b1f3a] text-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Col 1 — Network Score */}
  <div className="space-y-3">
    <p className="text-[10px] uppercase tracking-widest text-white/50">
      NETWORK PERFORMANCE · {getQuarterLabel()}
    </p>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-bold leading-none">
        {stats.avg > 0 ? stats.avg : '—'}
      </span>
      {stats.avg > 0 && <span className="text-lg text-white/50">/ 100</span>}
    </div>
    {stats.avg > 0 && (
      <>
        <div className="w-full h-1.5 rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-[#2563eb] transition-all"
            style={{ width: `${stats.avg}%` }}
          />
        </div>
        {(() => {
          const band = getScoreBand(stats.avg);
          return (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${band.className}`}>
              ● {band.label}
            </span>
          );
        })()}
        {momentum.sampleSize >= 2 && (
          <p className={`text-xs font-medium ${
            momentum.direction === 'up' ? 'text-[#16a34a]' :
            momentum.direction === 'down' ? 'text-[#dc2626]' :
            'text-white/50'
          }`}>
            {momentum.direction === 'up' ? '↑' : momentum.direction === 'down' ? '↓' : '—'}{' '}
            {momentum.delta > 0 ? '+' : ''}{momentum.delta} pts from last cycle
          </p>
        )}
        <p className="text-xs text-white/60 italic mt-1">
          "{getHeroNarrative(stats.avg, stats.total, atRiskDealers.length)}"
        </p>
      </>
    )}
  </div>

  {/* Col 2 — Network Health */}
  <div className="space-y-3 md:border-l md:border-white/10 md:pl-6">
    <p className="text-[10px] uppercase tracking-widest text-white/50">ENROLLED DEALERS</p>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-bold leading-none">{stats.total}</span>
    </div>
    {atRiskDealers.length > 0 ? (
      <p className="text-xs font-medium text-[#dc2626]">
        {atRiskDealers.length} in Foundational band
      </p>
    ) : stats.total > 0 ? (
      <p className="text-xs font-medium text-[#16a34a]">All dealers above threshold</p>
    ) : (
      <p className="text-xs text-white/40">No dealers enrolled yet</p>
    )}
    <div className="flex flex-wrap gap-1 mt-1">
      {atRiskDealers.slice(0, 2).map(d => (
        <span
          key={d.dealershipId}
          className="inline-block text-[11px] bg-white/10 rounded px-2 py-0.5 truncate max-w-[140px]"
        >
          {d.dealerName}
        </span>
      ))}
    </div>
  </div>

  {/* Col 3 — Dept Velocity */}
  <div className="space-y-3 md:border-l md:border-white/10 md:pl-6">
    <p className="text-[10px] uppercase tracking-widest text-white/50">
      DEPT WEAKNESSES ACROSS NETWORK
    </p>
    {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0).length === 0 ? (
      <p className="text-xs text-[#16a34a]">No departments below threshold</p>
    ) : (
      <div className="space-y-2">
        {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0)
          .sort((a, b) => deptWeaknessCounts[b] - deptWeaknessCounts[a])
          .slice(0, 3)
          .map(key => {
            const count = deptWeaknessCounts[key];
            const pct = stats.total > 0 ? count / stats.total : 0;
            const barClass =
              pct > 0.5 ? 'bg-[#dc2626]' : pct > 0.25 ? 'bg-[#d97706]' : 'bg-[#2563eb]';
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[11px] text-white/70 w-8 shrink-0">{DEPT_LABELS[key]}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10">
                  <div
                    className={`h-1.5 rounded-full ${barClass}`}
                    style={{ width: `${Math.round(pct * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-white/50 w-12 shrink-0 text-right">
                  {count}/{stats.total}
                </span>
              </div>
            );
          })}
      </div>
    )}
  </div>
</div>
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add dark hero card — score, health, dept velocity columns

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Overview Tab — Dealer Cards Grid + Restore Insight Cards

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Add Tabs structure with Overview + Leaderboard after the hero card**

After the dark hero card block, add the full tabs structure. The Overview tab now starts with dealer cards, followed by Sprint 8 insight cards. The Leaderboard tab contains the existing heatmap + table + Sheet.

Add this block after the hero card:

```tsx
<Tabs defaultValue="overview">
  <TabsList className="mb-4">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
  </TabsList>

  {/* ── Overview Tab ── */}
  <TabsContent value="overview" className="space-y-6">

    {/* Dealer Cards Grid */}
    {loadingDealers ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl shadow-card border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-14 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-28" />
            <div className="pt-2 border-t border-border space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-3/4" />
            </div>
            <Skeleton className="h-7 w-full" />
          </div>
        ))}
      </div>
    ) : sortedDealers.length === 0 ? (
      <SharedEmptyState
        title="No dealers enrolled"
        description="Add dealers from Network Settings to see performance data here."
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDealers.map(dealer => (
          <OemDealerCard
            key={dealer.dealershipId}
            dealer={dealer}
            onSelect={setSelectedDealer}
            onNavigate={navigate}
          />
        ))}
      </div>
    )}

    {/* At-Risk Dealers */}
    {!loadingDealers && sortedDealers.length > 0 && (
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">At-Risk Dealers</CardTitle>
        </CardHeader>
        <CardContent>
          {atRiskDealers.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-[#16a34a]/5 rounded-lg border border-[#16a34a]/20">
              <CheckCircle className="h-5 w-5 text-[#16a34a] shrink-0" />
              <p className="text-sm text-[#16a34a] font-medium">
                All dealers performing above Foundational threshold
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#dc2626] mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {atRiskDealers.length} dealer{atRiskDealers.length > 1 ? 's' : ''} in Foundational band (score &lt; {AT_RISK_THRESHOLD})
                </span>
              </div>
              {atRiskDealers.map(dealer => (
                <div key={dealer.dealershipId} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{dealer.dealerName}</p>
                      <p className="text-xs text-muted-foreground">{dealer.location}</p>
                    </div>
                    <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    {dealer.latestScore !== null && (
                      <Badge variant="outline" className="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 text-xs">
                        {Math.round(dealer.latestScore)}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedDealer(dealer)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )}

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
                <p className={`text-3xl font-semibold ${
                  momentum.direction === 'up' ? 'text-[#16a34a]' :
                  momentum.direction === 'down' ? 'text-[#dc2626]' :
                  'text-muted-foreground'
                }`}>
                  {momentum.delta > 0 ? '+' : ''}{momentum.delta} pts
                </p>
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

    {/* Network Insights */}
    {!loadingDealers && sortedDealers.length > 0 && (
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Network Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Departments below {WEAKNESS_THRESHOLD} — most common weaknesses
            </p>
            {DEPT_KEYS.filter(k => deptWeaknessCounts[k] > 0).length === 0 ? (
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
                    const pct = sortedDealers.length > 0 ? count / sortedDealers.length : 0;
                    const barClass = pct > 0.5 ? 'bg-[#dc2626]' : pct > 0.25 ? 'bg-[#d97706]' : 'bg-[#2563eb]';
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-10 text-xs font-medium text-muted-foreground shrink-0">
                          {DEPT_LABELS[key]}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${Math.round(pct * 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-24 shrink-0">
                          {count}/{sortedDealers.length} dealers
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
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
                      {Array.from({ length: Math.min(sortedDealers.length, 12) }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < count ? 'bg-[#d97706]' : 'bg-muted'}`} />
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

  </TabsContent>

  {/* ── Leaderboard Tab (see Task 6) ── */}
  <TabsContent value="leaderboard" className="space-y-4">
    {/* content added in Task 6 */}
  </TabsContent>

</Tabs>
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): add dealer cards grid + overview insight cards

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Leaderboard Tab Polish + Drill-Down Sheet + Final Build

**Files:**
- Modify: `src/pages/OemDashboard.tsx`

- [ ] **Step 1: Replace `{/* content added in Task 6 */}` placeholder**

Replace the Leaderboard `<TabsContent>` placeholder with the full leaderboard, drill-down Sheet, and closing tags:

```tsx
  <TabsContent value="leaderboard" className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {filteredDealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''}
        {tierFilter !== 'all' ? ` · ${tierFilter}` : ''}
      </p>
      <Select value={tierFilter} onValueChange={setTierFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter by tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tiers</SelectItem>
          <SelectItem value="Standard">Standard</SelectItem>
          <SelectItem value="Silver">Silver</SelectItem>
          <SelectItem value="Gold">Gold</SelectItem>
          <SelectItem value="Platinum">Platinum</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Network Portfolio Heatmap */}
    {loadingDealers ? (
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3"><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-6 w-36" />
              {[1,2,3,4,5].map(j => <Skeleton key={j} className="h-6 w-10" />)}
            </div>
          ))}
        </CardContent>
      </Card>
    ) : sortedDealers.length > 0 ? (
      <Card className="shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Network Portfolio Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground w-48">Dealer</th>
                  {DEPT_KEYS.map(key => (
                    <th key={key} className="text-center py-2 px-2 font-medium text-muted-foreground w-16">
                      {DEPT_LABELS[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedDealers.map(dealer => (
                  <tr
                    key={dealer.dealershipId}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedDealer(dealer)}
                  >
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate max-w-[160px]">{dealer.dealerName}</span>
                        <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                      </div>
                    </td>
                    {DEPT_KEYS.map(key => {
                      const score = dealer.deptScores[key];
                      return (
                        <td key={key} className="py-2 px-2 text-center">
                          {score !== null ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(score)}`}>
                              {Math.round(score)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-muted/30">
                  <td className="py-2 px-4 text-sm italic text-muted-foreground">Network avg</td>
                  {DEPT_KEYS.map(key => {
                    const score = networkAvg[key];
                    return (
                      <td key={key} className="py-2 px-2 text-center">
                        {score !== null ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(score)}`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    ) : (
      <SharedEmptyState title="No assessments recorded yet" description="Enrolled dealers haven't completed an assessment." />
    )}

    {/* Leaderboard table */}
    <Card className="shadow-card rounded-xl">
      <CardContent className="p-0">
        {loadingDealers ? (
          <div className="p-6"><SharedLoadingState /></div>
        ) : filteredDealers.length === 0 ? (
          <div className="py-12 space-y-3 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-[hsl(var(--neutral-400))]" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[hsl(var(--neutral-900))]">
                {tierFilter !== 'all' ? `No ${tierFilter} tier dealers` : 'No assessments yet'}
              </h3>
              <p className="mx-auto max-w-md text-sm text-[hsl(var(--neutral-600))]">
                {tierFilter !== 'all' ? 'Try a different tier filter.' : "Enrolled dealers haven't completed an assessment yet."}
              </p>
            </div>
            {tierFilter !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => setTierFilter('all')}>Clear filter</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">{t('oem.rank')}</TableHead>
                  <TableHead>{t('oem.dealerName')}</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Weakest Dept</TableHead>
                  <TableHead className="text-right">{t('oem.latestScore')}</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">{t('oem.previousScore')}</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">{t('oem.trend')}</TableHead>
                  <TableHead className="text-center">{t('oem.benchmarkBand')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDealers.map(dealer => {
                  const rank = sortedDealers.indexOf(dealer) + 1;
                  const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;
                  const rankBadgeClass = getRankBadgeClass(rank);
                  const weakest = getWeakestDept(dealer.deptScores);
                  const rankArrow =
                    dealer.latestScore != null && dealer.previousScore != null
                      ? dealer.latestScore > dealer.previousScore ? <span className="text-[#16a34a] text-[10px] ml-0.5">▲</span>
                      : dealer.latestScore < dealer.previousScore ? <span className="text-[#dc2626] text-[10px] ml-0.5">▼</span>
                      : <span className="text-muted-foreground text-[10px] ml-0.5">—</span>
                      : null;
                  return (
                    <TableRow
                      key={dealer.dealershipId}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${getRankStyle(rank)}`}
                      onClick={() => setSelectedDealer(dealer)}
                    >
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center">
                          {rankBadgeClass ? (
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${rankBadgeClass}`}>
                              {rank === 1 && <Trophy className="h-3 w-3" />}
                              {rank}
                            </span>
                          ) : (
                            <span className="text-[hsl(var(--neutral-500))]">{rank}</span>
                          )}
                          {rankArrow}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{dealer.dealerName}</span>
                          <span className="text-xs text-muted-foreground">{dealer.location}</span>
                          <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {weakest ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(weakest.score)}`}>
                            {DEPT_LABELS[weakest.key]} {Math.round(weakest.score)}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {dealer.latestScore != null ? (
                          <span className="font-semibold text-foreground">{Math.round(dealer.latestScore)}</span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {dealer.previousScore != null ? (
                          <span className="text-muted-foreground">{Math.round(dealer.previousScore)}</span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {getTrendIcon(dealer.latestScore, dealer.previousScore)}
                      </TableCell>
                      <TableCell className="text-center">
                        {band ? (
                          <Badge variant="outline" className={band.className}>{band.label}</Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-[hsl(var(--neutral-050))] hover:bg-[hsl(var(--neutral-050))]">
                  <TableCell className="text-[hsl(var(--neutral-500))]">—</TableCell>
                  <TableCell><span className="italic text-[hsl(var(--neutral-600))]">Network average</span></TableCell>
                  <TableCell className="hidden md:table-cell" />
                  <TableCell className="text-right font-semibold text-foreground">{filteredStats.avg}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-muted-foreground">—</TableCell>
                  <TableCell className="text-center hidden sm:table-cell text-muted-foreground">—</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={getScoreBand(filteredStats.avg).className}>
                      {getScoreBand(filteredStats.avg).label}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  </TabsContent>

</Tabs>

{/* ── Dealer Drill-down Sheet ── */}
<Sheet open={!!selectedDealer} onOpenChange={open => { if (!open) setSelectedDealer(null); }}>
  <SheetContent side="right" className="w-[480px] sm:w-[540px] overflow-y-auto">
    {selectedDealer && (
      <>
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between pr-6">
            <div>
              <SheetTitle className="text-lg font-semibold">{selectedDealer.dealerName}</SheetTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {selectedDealer.location}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ScoreGauge score={selectedDealer.latestScore ?? 0} size={64} />
              <TierBadge tier={selectedDealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
            </div>
          </div>
        </SheetHeader>
        <div className="space-y-6 pt-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Department Scores</h3>
            <div className="space-y-2">
              {DEPT_KEYS.map(key => {
                const score = selectedDealer.deptScores[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-medium text-muted-foreground">{DEPT_LABELS[key]}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      {score !== null && (
                        <div className={`h-2 rounded-full ${getDeptBgClass(score)}`} style={{ width: `${score}%` }} />
                      )}
                    </div>
                    <span className={`text-xs font-semibold w-8 text-right ${score !== null ? getDeptTextClass(score) : 'text-muted-foreground'}`}>
                      {score !== null ? Math.round(score) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Score History</h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Latest</p>
                <p className="text-2xl font-semibold text-foreground">
                  {selectedDealer.latestScore !== null ? Math.round(selectedDealer.latestScore) : '—'}
                </p>
              </div>
              <div className="flex items-center">
                {getTrendIcon(selectedDealer.latestScore, selectedDealer.previousScore)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="text-lg font-medium text-muted-foreground">
                  {selectedDealer.previousScore !== null ? Math.round(selectedDealer.previousScore) : '—'}
                </p>
              </div>
            </div>
          </div>
          {selectedDealer.latestAssessmentId && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/app/results/${selectedDealer.latestAssessmentId}`)}
            >
              Open Full Report →
            </Button>
          )}
        </div>
      </>
    )}
  </SheetContent>
</Sheet>
```

This completes the closing `</div>` for `<div className="p-6 space-y-6">` and `</div>` for the outer `<div className="flex flex-col">`.

- [ ] **Step 2: Final build check**

```bash
npm run build
```

Expected: no TypeScript errors, no missing imports.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all 175 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): leaderboard tab polish + drill-down sheet + full redesign complete

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```

Expected: Vercel auto-deploys within ~2 minutes.
