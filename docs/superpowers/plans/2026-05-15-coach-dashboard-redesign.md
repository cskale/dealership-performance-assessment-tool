# Coach Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `CoachDashboard.tsx` to match the dealer dashboard design language — dark hero card, timeline strip, OEM brand-styled dealer cards with circular score gauges, and a richer actions table.

**Architecture:** Single-file redesign of `src/pages/CoachDashboard.tsx`. All existing data-fetching logic, state, and child components (`CoachNoteSheet`, `VisitSheet`) are preserved unchanged. New helpers (`getBrandStyle`, `ScoreGauge`) are defined at the top of the same file. One additional Supabase query is added to fetch the last completed visit for the timeline strip.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Supabase, recharts (existing), Clearbit Logo CDN (no package — `<img>` tag only), pure SVG gauge (no library)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/pages/CoachDashboard.tsx` | Modify | Entire redesign — all changes in this file |

No other files touched. No migrations. No new packages.

---

### Task 1: Add helper utilities — `getBrandStyle` + `ScoreGauge`

**Files:**
- Modify: `src/pages/CoachDashboard.tsx` (top of file, before interfaces)

- [ ] **Step 1: Add `BRAND_MAP` constant and `getBrandStyle` function**

Open `src/pages/CoachDashboard.tsx`. After the import block and before the `CHART_COLORS` constant (line 86), insert:

```tsx
const BRAND_MAP: Record<string, { accent: string; domain: string | null }> = {
  bmw:             { accent: '#1C69D4', domain: 'bmw.com' },
  mercedes:        { accent: '#2D3035', domain: 'mercedes-benz.com' },
  'mercedes-benz': { accent: '#2D3035', domain: 'mercedes-benz.com' },
  audi:            { accent: '#BB0A21', domain: 'audi.com' },
  volkswagen:      { accent: '#003399', domain: 'volkswagen.com' },
  vw:              { accent: '#003399', domain: 'volkswagen.com' },
  toyota:          { accent: '#EB0A1E', domain: 'toyota.com' },
  ford:            { accent: '#003087', domain: 'ford.com' },
};

function getBrandStyle(brand: string): { accent: string; domain: string | null } {
  const key = (brand ?? '').toLowerCase().trim();
  return BRAND_MAP[key] ?? { accent: 'hsl(var(--brand-500))', domain: null };
}
```

- [ ] **Step 2: Add `ScoreGauge` component**

Immediately after `getBrandStyle`, insert:

```tsx
function ScoreGauge({ score, size = 72 }: { score: number; size?: number }) {
  const r = size * 0.39;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(Math.max(score, 0), 100) / 100 * circ;
  const cx = size / 2;
  const cy = size / 2;

  const accent =
    score >= 85 ? '#16a34a' :
    score >= 70 ? '#2563eb' :
    score >= 46 ? '#d97706' :
                  '#dc2626';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score ${Math.round(score)}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={accent} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx} y={cy + 5}
        textAnchor="middle"
        fontSize={size * 0.19}
        fontWeight="700"
        fill="currentColor"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}
```

- [ ] **Step 3: Add `BrandLogo` component**

After `ScoreGauge`, insert:

```tsx
function BrandLogo({ brand, size = 24 }: { brand: string; size?: number }) {
  const { accent, domain } = getBrandStyle(brand);
  const initials = (brand ?? 'XX').slice(0, 2).toUpperCase();
  const [failed, setFailed] = React.useState(false);

  if (!domain || failed) {
    return (
      <div
        className="rounded-sm flex items-center justify-center text-[9px] font-bold shrink-0"
        style={{
          width: size, height: size,
          backgroundColor: accent + '26',
          color: accent,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      width={size} height={size}
      className="rounded-sm object-contain shrink-0"
      onError={() => setFailed(true)}
      alt={brand}
    />
  );
}
```

Note: `React` is already in scope via the JSX transform in this project. If TypeScript complains about `React.useState`, add `import React from 'react'` or change to `const [failed, setFailed] = useState(false)` — `useState` is already imported.

- [ ] **Step 4: Add quarter label utility**

After `BrandLogo`, insert:

```tsx
function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}
```

- [ ] **Step 5: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: build succeeds. If `React.useState` error, change `React.useState` → `useState` (already imported at top of file).

- [ ] **Step 6: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): add getBrandStyle, ScoreGauge, BrandLogo, getQuarterLabel helpers"
```

---

### Task 2: Add `lastCompletedVisit` state + fetch

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

The timeline strip needs "Last Visit" = most recent completed coach visit. Current query only fetches proposed/confirmed. Add one extra query.

- [ ] **Step 1: Add state variable**

In the `CoachDashboard` component, after `const [activeNetworkId, setActiveNetworkId] = useState<string>('all');` (current last useState, around line 229), add:

```tsx
const [lastCompletedVisit, setLastCompletedVisit] = useState<{ date: string; dealerName: string } | null>(null);
```

- [ ] **Step 2: Fetch last completed visit inside `fetchAssignments`**

Inside `fetchAssignments`, after `setActiveVisitsByDealer(visitMap);` (around line 422), add:

```tsx
// Fetch most recent completed visit for timeline strip
const { data: completedVisits } = await supabase
  .from('coach_visits')
  .select('dealership_id, visit_date')
  .eq('coach_user_id', user!.id)
  .in('dealership_id', dealershipIds)
  .eq('status', 'completed')
  .order('visit_date', { ascending: false })
  .limit(1);

if (completedVisits?.length) {
  const cv = completedVisits[0] as { dealership_id: string; visit_date: string };
  const dealerName = dealerships.find(d => d.id === cv.dealership_id)?.name ?? 'Unknown';
  setLastCompletedVisit({ date: cv.visit_date, dealerName });
} else {
  setLastCompletedVisit(null);
}
```

- [ ] **Step 3: Derive `nextVisit` from `activeVisitsByDealer`**

Add a derived constant just before the `return` statement of `CoachDashboard` (after all the `useMemo` hooks, around line 460):

```tsx
// Derive next upcoming visit (first entry in activeVisitsByDealer by date)
const nextVisit: { dateLabel: string; dealerName: string; status: string } | null = (() => {
  let earliest: { dateLabel: string; dealerName: string; status: string } | null = null;
  activeVisitsByDealer.forEach((label, dealershipId) => {
    const dealer = dealers.find(d => d.dealershipId === dealershipId);
    if (!earliest) {
      const parts = label.split(' · ');
      earliest = {
        dateLabel: parts[0] ?? label,
        dealerName: dealer?.dealerName ?? 'Unknown',
        status: parts[1] ?? 'proposed',
      };
    }
  });
  return earliest;
})();
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): add lastCompletedVisit state + nextVisit derivation for timeline strip"
```

---

### Task 3: Sticky top strip + page header

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

Replace the existing dark stats bar and page header JSX.

- [ ] **Step 1: Replace the dark stats bar**

Find this block (around line 517):

```tsx
<div className="h-9 bg-[#0b1f3a] flex items-center px-6 sticky top-0 z-10">
  {(() => {
    const s = computeStatsBar(dealers);
    const chips = [
      { label: 'Dealers',          value: String(s.total) },
      { label: 'Avg Score',        value: s.avgScore > 0 ? String(s.avgScore) : '—' },
      { label: 'Overdue Actions',  value: String(s.overdueCount) },
      { label: 'Attention Needed', value: String(s.attentionNeeded) },
    ];
```

Replace the `chips` array only — change `'Attention Needed'` → `'Critical Gaps'` and its value:

```tsx
const chips = [
  { label: 'Dealers',         value: String(s.total) },
  { label: 'Avg Score',       value: s.avgScore > 0 ? String(s.avgScore) : '—' },
  { label: 'Overdue Actions', value: String(s.overdueCount) },
  { label: 'Critical Gaps',   value: String(dealers.filter(d => (d.latestScore ?? 101) < 46).length) },
];
```

- [ ] **Step 2: Replace the page header block**

Find this block (around line 539):

```tsx
{/* Page header */}
<div>
  <h1 className="text-2xl font-semibold text-foreground">{t('coach.title')}</h1>
  <p className="text-sm text-muted-foreground mt-1">
    {dealers.length} {dealers.length === 1 ? 'dealership' : 'dealerships'} assigned
  </p>
</div>
```

Replace with:

```tsx
{/* Page header */}
<div className="flex items-start justify-between gap-4">
  <div>
    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
      COACHING PERSPECTIVE · {getQuarterLabel()}
    </p>
    <h1 className="text-2xl font-semibold text-foreground">Field Performance Dashboard</h1>
    <p className="text-sm text-muted-foreground mt-1">
      Active monitoring for {dealers.length} assigned {dealers.length === 1 ? 'dealership' : 'dealerships'}
    </p>
  </div>
  <Button
    variant="outline"
    size="sm"
    className="shrink-0 mt-1"
    onClick={() => console.log('Export Report — wired in future sprint')}
  >
    <span className="mr-1.5">↓</span> Export Report
  </Button>
</div>
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): update top strip label + new page header with quarter label"
```

---

### Task 4: Dark hero card (3-column)

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

Insert the dark hero card after the page header `</div>` and before the view tabs.

- [ ] **Step 1: Remove existing view tabs + insert hero card**

Find the view tabs block (around line 547):

```tsx
{/* View tabs */}
<div className="flex gap-1 border-b border-border">
```

**Before** this block, insert the hero card:

```tsx
{/* Dark hero card */}
{(() => {
  const s = computeStatsBar(dealers);
  const avgScore = s.avgScore > 0 ? s.avgScore : null;
  const belowBenchmark = dealers.filter(d => (d.latestScore ?? 101) < 70).length;
  const focusDealer = [...dealers]
    .filter(d => d.latestScore != null)
    .sort((a, b) => (a.latestScore ?? 0) - (b.latestScore ?? 0))[0] ?? null;

  const narrative = avgScore == null
    ? 'No assessments completed yet across the portfolio.'
    : avgScore >= 85
    ? 'Portfolio performing above benchmark across all departments.'
    : avgScore >= 70
    ? `Most dealers performing well — ${belowBenchmark} below benchmark threshold.`
    : avgScore >= 46
    ? `${belowBenchmark} dealers require active intervention this quarter.`
    : `${dealers.filter(d => (d.latestScore ?? 101) < 46).length} dealers at foundational level — priority coaching required.`;

  const topOverdue = overdueActions.slice(0, 2);

  return (
    <div className="rounded-xl bg-[#0b1f3a] text-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Col 1: Portfolio Score */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-white/50">Overall Portfolio Score</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold leading-none">
            {avgScore != null ? avgScore : '—'}
          </span>
          {avgScore != null && <span className="text-lg text-white/50">/ 100</span>}
        </div>
        {avgScore != null && (
          <div className="w-full h-1.5 rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full bg-[#2563eb] transition-all"
              style={{ width: `${avgScore}%` }}
            />
          </div>
        )}
        {avgScore != null && (() => {
          const band = getScoreBand(avgScore);
          return (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${band.className}`}>
              ● {band.label}
            </span>
          );
        })()}
        <p className="text-xs text-white/60 italic mt-2">"{narrative}"</p>
      </div>

      {/* Col 2: Active Actions */}
      <div className="space-y-3 md:border-l md:border-white/10 md:pl-6">
        <p className="text-[10px] uppercase tracking-widest text-white/50">Open Actions</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold leading-none">{allActions.length}</span>
        </div>
        <p className="text-xs text-white/50">items requiring attention</p>
        <div className="space-y-1.5 mt-2">
          {topOverdue.length === 0 ? (
            <p className="text-xs text-[#16a34a] font-medium">All actions on track ✓</p>
          ) : topOverdue.map(a => (
            <p key={a.id} className="text-xs text-white/70 truncate">
              <span className="text-white/40">•</span>{' '}
              <span className="font-medium text-white">{a.dealerName}:</span>{' '}
              {a.action_title}
              {a.target_completion_date && (
                <span className="text-[#dc2626] ml-1">
                  — due {format(new Date(a.target_completion_date), 'dd MMM')}
                </span>
              )}
            </p>
          ))}
        </div>
      </div>

      {/* Col 3: Focus Dealer */}
      <div className="space-y-3 md:border-l md:border-white/10 md:pl-6">
        <p className="text-[10px] uppercase tracking-widest text-white/50">Focus Dealer</p>
        {focusDealer ? (
          <>
            <p className="text-lg font-semibold leading-tight">{focusDealer.dealerName}</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{Math.round(focusDealer.latestScore!)}</span>
              {(() => {
                const band = getScoreBand(focusDealer.latestScore!);
                return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${band.className}`}>{band.label}</span>;
              })()}
            </div>
            <p className="text-xs text-white/50">{focusDealer.location}</p>
            <p className="text-xs font-medium mt-1">
              {(focusDealer.latestScore ?? 101) < 46
                ? <span className="text-[#dc2626]">Needs immediate attention</span>
                : <span className="text-[#d97706]">Monitor closely</span>
              }
            </p>
          </>
        ) : (
          <p className="text-sm text-white/50">No assessments yet</p>
        )}
      </div>
    </div>
  );
})()}
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: succeeds. If `getScoreBand` import is missing from the hero card scope — it's already imported from `@/lib/coachDashboardUtils` at line 33.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): add dark hero card with portfolio score, actions, focus dealer"
```

---

### Task 5: Timeline strip (5 chips)

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

Insert timeline strip after the hero card and before the view tabs.

- [ ] **Step 1: Insert timeline strip**

Immediately after the closing `})()}` of the hero card block (Task 4), insert:

```tsx
{/* Timeline strip */}
{(() => {
  const assessmentsDue = dealers.filter(d =>
    d.latestDate == null || daysSince(d.latestDate) == null || (daysSince(d.latestDate) ?? 0) > 90
  ).length;

  const chips = [
    {
      label: 'Last Visit',
      value: lastCompletedVisit
        ? format(new Date(lastCompletedVisit.date), 'dd MMM yyyy')
        : 'Not scheduled',
      sub: lastCompletedVisit?.dealerName ?? 'No visits recorded',
      status: lastCompletedVisit ? 'completed' : 'none',
    },
    {
      label: 'Next Visit',
      value: nextVisit ? nextVisit.dateLabel : 'Not scheduled',
      sub: nextVisit ? nextVisit.dealerName : 'Contact dealer',
      status: nextVisit
        ? nextVisit.status.toLowerCase().includes('confirmed') ? 'confirmed' : 'proposed'
        : 'none',
    },
    {
      label: 'Assessments Due',
      value: assessmentsDue > 0 ? String(assessmentsDue) : 'All current',
      sub: assessmentsDue > 0 ? 'dealers need assessment' : '✓ Up to date',
      status: assessmentsDue > 0 ? 'attention' : 'ok',
    },
    {
      label: 'Overdue Actions',
      value: overdueActions.length > 0 ? String(overdueActions.length) : 'On track',
      sub: overdueActions.some(a => a.priority === 'critical') ? 'incl. critical items' : 'actions past due date',
      status: overdueActions.length > 0 ? 'critical' : 'ok',
    },
    {
      label: 'Action Plan Review',
      value: `30 Jun ${new Date().getFullYear()}`,
      sub: 'End of quarter · all depts',
      status: 'upcoming',
    },
  ];

  const statusDot: Record<string, string> = {
    completed: 'bg-[#16a34a]',
    confirmed:  'bg-[#16a34a]',
    proposed:   'bg-[#d97706]',
    attention:  'bg-[#d97706]',
    critical:   'bg-[#dc2626]',
    ok:         'bg-[#16a34a]',
    upcoming:   'bg-[#2563eb]',
    none:       'bg-muted-foreground',
  };

  const statusLabel: Record<string, string> = {
    completed: '● Completed',
    confirmed:  '● Confirmed',
    proposed:   '● Proposed',
    attention:  '● Attention',
    critical:   '● Critical',
    ok:         '✓ On track',
    upcoming:   '○ Upcoming',
    none:       '○ Not scheduled',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {chips.map((chip, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-3 space-y-1"
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{chip.label}</p>
          <p className="text-sm font-semibold text-foreground">{chip.value}</p>
          <p className="text-[11px] text-muted-foreground">{chip.sub}</p>
          <div className="flex items-center gap-1 pt-0.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot[chip.status]}`} />
            <span className="text-[10px] text-muted-foreground">{statusLabel[chip.status]}</span>
          </div>
        </div>
      ))}
    </div>
  );
})()}
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: succeeds. `daysSince` and `format` already imported.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): add 5-chip timeline strip"
```

---

### Task 6: Network tabs + View Map link

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

Add "View Map →" link to the existing network tabs + controls block.

- [ ] **Step 1: Locate the sort + filter controls block**

Find (around line 596):

```tsx
{/* Sort + filter controls */}
<div className="flex flex-wrap items-center gap-3">
```

- [ ] **Step 2: Add View Map link**

Replace the sort + filter controls `<div>` wrapper to include the map link:

```tsx
{/* Sort + filter controls + map link */}
<div className="flex flex-wrap items-center gap-3">
  <div className="flex items-center gap-1">
    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    {(['score', 'name', 'overdue'] as const).map(s => (
      <Button
        key={s}
        variant={sortBy === s ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSortBy(s)}
      >
        {s === 'score' ? 'Score' : s === 'name' ? 'Name' : 'Overdue'}
      </Button>
    ))}
  </div>
  <div className="flex items-center gap-1">
    <Filter className="w-4 h-4 text-muted-foreground" />
    <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'completed' | 'in_progress')}>
      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('coach.filterAll')}</SelectItem>
        <SelectItem value="completed">{t('coach.filterCompleted')}</SelectItem>
        <SelectItem value="in_progress">{t('coach.filterInProgress')}</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="ml-auto">
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(filteredDealers.map(d => d.location).filter(Boolean).join(' OR '))}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-[hsl(var(--brand-500))] hover:underline font-medium"
    >
      View Map →
    </a>
  </div>
</div>
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): add View Map external link to controls bar"
```

---

### Task 7: Dealer card redesign

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

This is the largest task — replaces the dealer card JSX inside the `.map()`. The logic (handlers, state, navigation) is unchanged; only JSX changes.

- [ ] **Step 1: Replace the dealer card JSX**

Find the `return (` inside `filteredDealers.map((dealer, i) => {` (around line 630). Replace everything from `<Card` to the closing `</Card>` with:

```tsx
const { accent } = getBrandStyle(dealer.brand);
const trend = computeTrend(dealer.latestScore, dealer.previousScore);
const since = daysSince(dealer.latestDate);
const hasNotes = notes.some(n => n.dealership_id === dealer.dealershipId);
const visitLabel = activeVisitsByDealer.get(dealer.dealershipId);
const visitParts = visitLabel ? visitLabel.split(' · ') : null;
const visitConfirmed = visitParts?.[1]?.toLowerCase() === 'confirmed';

const openMinusOverdue = Math.max(0, dealer.openCount - dealer.overdueCount);
const progressPct = dealer.openCount > 0
  ? (openMinusOverdue / dealer.openCount) * 100
  : 100;

return (
  <Card
    key={dealer.dealershipId}
    className="opacity-0 animate-fade-in shadow-card rounded-xl overflow-hidden"
    style={{
      animationDelay: `${Math.min(i, 4) * 50}ms`,
      animationFillMode: 'forwards',
      borderTop: `3px solid ${accent}`,
    }}
  >
    <CardContent className="p-4 space-y-3">
      {/* Brand row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BrandLogo brand={dealer.brand} size={24} />
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: accent + '18', color: accent }}
          >
            {dealer.brand || 'Unknown'}
          </span>
        </div>
        {dealer.latestScore != null && (() => {
          const band = getScoreBand(dealer.latestScore);
          return (
            <Badge variant="outline" className={`text-[10px] shrink-0 ${band.className}`}>
              {band.label}
            </Badge>
          );
        })()}
      </div>

      {/* Dealer name + location */}
      <div>
        <p className="text-sm font-semibold leading-tight text-foreground">{dealer.dealerName}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <span>📍</span>
          {dealer.location}
          {since != null && <span className="text-[hsl(var(--neutral-400))] ml-1">· {since}d ago</span>}
        </p>
      </div>

      <div className="border-t border-border/50 pt-3 flex items-start gap-4">
        {/* Score gauge */}
        <div className="shrink-0">
          {dealer.latestScore != null ? (
            <ScoreGauge score={dealer.latestScore} size={72} />
          ) : (
            <div className="w-[72px] h-[72px] flex items-center justify-center text-[10px] text-muted-foreground text-center">
              No score yet
            </div>
          )}
        </div>

        {/* Action plan */}
        <div className="flex-1 space-y-1.5 pt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Action Plan</p>
          <div className="w-full h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-[hsl(var(--brand-500))] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-foreground font-medium">
            {dealer.openCount > 0
              ? `${openMinusOverdue} / ${dealer.openCount} on track`
              : 'No open actions'
            }
          </p>
          {dealer.overdueCount > 0 && (
            <p className="text-[11px] text-[#dc2626] font-medium">{dealer.overdueCount} overdue</p>
          )}
          {/* Trend */}
          {trend.direction !== 'none' && (
            <div className="flex items-center gap-1 pt-0.5">
              {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-[#16a34a]" />}
              {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-[#dc2626]" />}
              {trend.direction === 'flat' && <Minus className="w-3 h-3 text-muted-foreground" />}
              <span className={`text-[11px] font-medium ${
                trend.direction === 'up' ? 'text-[#16a34a]' :
                trend.direction === 'down' ? 'text-[#dc2626]' :
                'text-muted-foreground'
              }`}>
                {trend.delta != null && trend.delta !== 0
                  ? `${trend.delta > 0 ? '+' : ''}${trend.delta}`
                  : '—'
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visit chip */}
      <div className="text-xs flex items-center gap-1">
        <span>📅</span>
        {visitParts ? (
          <span className={visitConfirmed ? 'text-[#16a34a] font-medium' : 'text-[#d97706] font-medium'}>
            Next visit: {visitParts[0]} · {visitParts[1]}
          </span>
        ) : (
          <span className="text-muted-foreground">No visit scheduled</span>
        )}
      </div>

      {/* Bottom action row */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="relative h-7 w-7 p-0"
            onClick={() => { setNoteSheetDealer(dealer); setNoteSheetOpen(true); }}
            aria-label="Add note"
          >
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            {hasNotes && (
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-7 w-7 p-0"
            onClick={() => { setVisitSheetDealer(dealer); setVisitSheetOpen(true); }}
            aria-label="Schedule visit"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {activeVisitsByDealer.has(dealer.dealershipId) && (
              <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
            )}
          </Button>
        </div>
        {dealer.latestAssessmentId ? (
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs"
            onClick={() => navigate(`/app/results/${dealer.latestAssessmentId}`)}
          >
            Enter Dealership →
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
            No assessment yet
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);
```

Note: remove the old `const trend = ...` / `const band = ...` / `const since = ...` / `const hasNotes = ...` lines that were inside the old card's `return` — they're now at the top of the map callback. Also remove the old `<CardHeader>` usage since the new card uses `<CardContent>` only.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: succeeds. Common errors:
- `CardHeader` import still referenced elsewhere → fine, leave import
- `band` undefined → ensure `getScoreBand` is called inside the IIFE as shown

- [ ] **Step 3: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): redesign dealer cards — brand logo, score gauge, progress bar, Enter Dealership CTA"
```

---

### Task 8: Network Actions table redesign

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

Replace the Actions Requiring Attention card with the richer table layout.

- [ ] **Step 1: Replace the card header**

Find:
```tsx
<CardTitle className="text-base font-semibold">Actions Requiring Attention</CardTitle>
```

Replace with:
```tsx
<div className="flex items-center justify-between w-full flex-wrap gap-3">
  <CardTitle className="text-base font-semibold">Network Actions Requiring Attention</CardTitle>
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => console.log('Filter — future sprint')}>
      ≡ Filter
    </Button>
    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => console.log('Export — future sprint')}>
      ↓ Export List
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs text-[hsl(var(--brand-500))] hover:underline"
      onClick={() => navigate('/app/coach-actions')}
    >
      View all in Action Tracker →
    </Button>
  </div>
</div>
```

- [ ] **Step 2: Replace action row rendering**

Find the action row `<div` inside the `.map(action => {` (around line 844). Replace:

```tsx
return (
  <div
    key={action.id}
    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer items-center"
    onClick={() => navigate(`/app/results/${action.assessmentId}`)}
  >
    {/* Priority dot */}
    <span className={`w-2 h-2 rounded-full shrink-0 ${
      action.priority === 'critical' ? 'bg-[#dc2626]' :
      action.priority === 'high'     ? 'bg-[#d97706]' :
      action.priority === 'medium'   ? 'bg-[#2563eb]' :
                                       'bg-muted-foreground'
    }`} />

    {/* Action title */}
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{action.action_title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{action.dealerName}</p>
    </div>

    {/* Dealership logo chip */}
    <div
      className="flex items-center gap-1.5 cursor-pointer shrink-0"
      onClick={e => { e.stopPropagation(); navigate(`/app/results/${action.assessmentId}`); }}
    >
      <BrandLogo brand={dealers.find(d => d.dealershipId === action.dealershipId)?.brand ?? ''} size={16} />
      <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[100px]">{action.dealerName}</span>
    </div>

    {/* Due date */}
    <span className={`text-xs w-24 text-right shrink-0 ${
      tab === 'overdue'
        ? isOverdue(action.target_completion_date) ? 'text-[#dc2626] font-semibold' : 'text-muted-foreground'
        : action.daysStale >= 14 ? 'text-[#dc2626] font-semibold' : 'text-muted-foreground'
    }`}>
      {tab === 'overdue'
        ? (action.target_completion_date ? format(new Date(action.target_completion_date), 'dd MMM') : '—')
        : `${action.daysStale}d`
      }
    </span>

    {/* Status badge — derived display only, no DB change */}
    {(() => {
      const isBlocked = action.daysStale >= 21 && isOverdue(action.target_completion_date);
      const isStalled = !isBlocked && action.daysStale >= 14 && isOverdue(action.target_completion_date);
      const label = isBlocked ? 'BLOCKED' : isStalled ? 'STALLED' : action.status === 'In Progress' ? 'IN PROGRESS' : 'ASSIGNED';
      const cls = isBlocked
        ? 'bg-[#dc2626] text-white border-[#dc2626]'
        : isStalled
        ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'
        : action.status === 'In Progress'
        ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20'
        : 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20';
      return (
        <Badge variant="outline" className={`text-[10px] shrink-0 whitespace-nowrap ${cls}`}>
          {label}
        </Badge>
      );
    })()}

    {/* Priority badge */}
    <Badge variant="outline" className={`text-xs capitalize shrink-0 ${
      action.priority === 'critical' ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' :
      action.priority === 'high'     ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' :
      action.priority === 'medium'   ? 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' :
                                       'bg-muted text-muted-foreground border-border'
    }`}>{action.priority}</Badge>
  </div>
);
```

- [ ] **Step 3: Update table header row**

Find the header row `<div className="grid grid-cols-[1fr_auto_auto_auto]` and replace with:

```tsx
<div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-5 py-2 bg-muted/50">
  <span />
  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Action</span>
  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-28">Dealership</span>
  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-24 text-right">
    {tab === 'overdue' ? 'Due date' : 'Days stale'}
  </span>
  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-20">Status</span>
  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Priority</span>
</div>
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): richer actions table — brand logos, derived status badges, Export/Filter/ActionTracker CTAs"
```

---

### Task 9: Field Notes brand chip + Score Trend header

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

Minor restyling — brand accent colour on notes feed dealer chip + score trend header copy update.

- [ ] **Step 1: Update Field Notes dealer chip**

In the notes feed `.map(note => {`, find:

```tsx
<Badge variant="outline" className="text-xs bg-[hsl(var(--brand-050))] text-[hsl(var(--brand-600))] border-[hsl(var(--brand-200))]">
  {dealer?.dealerName ?? 'Unknown dealer'}
</Badge>
```

Replace with:

```tsx
{(() => {
  const noteDealer = dealers.find(d => d.dealershipId === note.dealership_id);
  const { accent } = getBrandStyle(noteDealer?.brand ?? '');
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: accent + '18',
        color: accent,
        borderColor: accent + '40',
      }}
    >
      {noteDealer?.dealerName ?? 'Unknown dealer'}
    </span>
  );
})()}
```

- [ ] **Step 2: Update Score Trend header**

Find:

```tsx
<CardTitle className="flex items-center gap-2 text-base font-semibold">
  <TrendingUp className="h-4 w-4 text-[hsl(var(--brand-500))]" />
  {t('coach.scoreTrend')}
</CardTitle>
<p className="text-xs text-muted-foreground">{t('coach.selectDealers')}</p>
```

Replace with:

```tsx
<CardTitle className="flex items-center gap-2 text-base font-semibold">
  <TrendingUp className="h-4 w-4 text-[hsl(var(--brand-500))]" />
  Score Trend
</CardTitle>
<p className="text-xs text-muted-foreground">Select up to 3 dealers to compare performance over time</p>
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach-dashboard): brand-accent chips in field notes feed + score trend header copy"
```

---

### Task 10: Final integration check

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: zero errors, zero TypeScript errors.

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:8080`. Log in as a coach account. Navigate to `/app/coach-dashboard`. Verify:

- [ ] Dark sticky top bar shows "Dealers / Avg Score / Overdue Actions / Critical Gaps"
- [ ] Page header shows "COACHING PERSPECTIVE · Q{N} {YEAR}" + "Field Performance Dashboard"
- [ ] Dark hero card renders 3 columns (Portfolio Score / Active Actions / Focus Dealer)
- [ ] Timeline strip shows 5 chips
- [ ] Network tabs appear if OEM networks assigned
- [ ] Dealer cards show brand logo (or initials fallback), circular gauge, progress bar, "Enter Dealership →"
- [ ] "View Map →" opens Google Maps in new tab
- [ ] Actions table shows priority dots, logo chip, status badges (BLOCKED/STALLED/IN PROGRESS/ASSIGNED)
- [ ] "View all in Action Tracker →" navigates to `/app/coach-actions`
- [ ] Field notes dealer chip uses brand accent colour
- [ ] Resources tab unchanged
- [ ] `CoachNoteSheet` opens on note icon click
- [ ] `VisitSheet` opens on calendar icon click

- [ ] **Step 3: Verify empty state unchanged**

Log in as a coach with no assignments. Confirm `SharedEmptyState` still renders (the early return guard before all new JSX is unchanged).

- [ ] **Step 4: Final commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: coach dashboard redesign complete — dealer dashboard design language, OEM brand logos, score gauges"
```

---

## Self-Review Against Spec

| Spec section | Task |
|---|---|
| Brand colour system + `getBrandStyle` | Task 1 |
| `ScoreGauge` SVG component | Task 1 |
| `BrandLogo` with Clearbit + initials fallback | Task 1 |
| Quarter label utility | Task 1 |
| `lastCompletedVisit` state + fetch | Task 2 |
| `nextVisit` derivation | Task 2 |
| Top strip — "Critical Gaps" label | Task 3 |
| Page header — COACHING PERSPECTIVE | Task 3 |
| Dark hero card — 3 cols | Task 4 |
| Timeline strip — 5 chips | Task 5 |
| Network tabs (unchanged logic) | existing, untouched |
| View Map → Google Maps link | Task 6 |
| Dealer card — brand top border, logo, chip, gauge, progress, visit chip, Enter Dealership | Task 7 |
| Actions table — priority dot, logo chip, due date, status badges, Export/Filter/ActionTracker | Task 8 |
| Field notes — brand accent chip | Task 9 |
| Score trend header copy | Task 9 |
| Resources tab — unchanged | no task needed |
| Export Report / Export List — no-op | Tasks 3, 8 |
| `CoachActions.tsx` — untouched | confirmed |
| No new packages | confirmed throughout |
| No schema changes | confirmed throughout |
