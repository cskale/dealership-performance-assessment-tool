# Results UI Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire four existing engine outputs (executive narrative, systemic patterns, ceiling insights, triage roadmap) into the Results page UI without touching any engine files.

**Architecture:** All rendering logic lives in child components (`ExecutiveSummary.tsx`, `CeilingInsightsPanel.tsx`, `ActionPlan.tsx`) — not in `Results.tsx`. Each task targets exactly one component. No new imports, no new npm packages, no engine file changes.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (Card, Badge already imported in all target files)

---

## File Map

| File | Change | Tasks |
|---|---|---|
| `src/components/ExecutiveSummary.tsx` | Restyle narrative card; expand pattern cards to include recurring | #34, #33 |
| `src/components/results/CeilingInsightsPanel.tsx` | Add overallScore prop; fix empty state; update heading + border | #15 |
| `src/components/ExecutiveSummary.tsx` | Pass overallScore to CeilingInsightsPanel | #15 |
| `src/components/ActionPlan.tsx` | Add getRoadmapBucket helper; add roadmap view mode | #35 |

**Not touched:** `Results.tsx`, `scoringEngine.ts`, `signalEngine.ts`, `ceilingAnalysis.ts`, `narrativeTemplates.ts`

---

## Task 1: Executive Narrative Styling (#34)

**File:** `src/components/ExecutiveSummary.tsx`

The narrative is already computed and rendered (~line 262). This task only changes the visual presentation: add an "Assessment Overview" label above the card and swap the card border to blue.

- [ ] **Step 1: Locate Section 1 in ExecutiveSummary.tsx**

Search for `SECTION 1 — Diagnostic Narrative`. The block looks like:

```tsx
{/* SECTION 1 — Diagnostic Narrative */}
{narrative && (
  <Card className="shadow-lg border">
    <CardContent className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Diagnostic Summary
        </h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.situation}</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.diagnosis}</p>
      <div className="border-l-2 border-primary pl-4">
        <p className="text-sm text-foreground leading-relaxed font-medium">{narrative.priority}</p>
      </div>
    </CardContent>
  </Card>
)}
```

- [ ] **Step 2: Replace Section 1 with the styled version**

Replace the entire block above with:

```tsx
{/* SECTION 1 — Diagnostic Narrative */}
{narrative && (
  <div>
    <p className="text-sm text-muted-foreground mb-2">Assessment Overview</p>
    <Card className="shadow-lg border border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.situation}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{narrative.diagnosis}</p>
        <div className="border-l-2 border-primary pl-4">
          <p className="text-sm text-foreground leading-relaxed font-medium">{narrative.priority}</p>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If errors appear, check that `CardContent` and `Card` are still imported at the top of the file (they were already there — do not add duplicate imports).

- [ ] **Step 4: Commit**

```bash
git add src/components/ExecutiveSummary.tsx
git commit -m "feat: restyle executive narrative card with Assessment Overview label — #34"
```

---

## Task 2: Systemic + Recurring Pattern Cards (#33)

**File:** `src/components/ExecutiveSummary.tsx`

Section 4 currently only shows `severity === 'systemic'` patterns. This task adds recurring (amber) patterns, updates the heading, adds per-pattern titles, and keeps each pattern as its own card.

- [ ] **Step 1: Locate Section 4 in ExecutiveSummary.tsx**

Search for `SECTION 4 — Systemic Patterns`. The block starts with:

```tsx
{/* SECTION 4 — Systemic Patterns (only when fired) */}
{systemicPatterns.filter(p => p.severity === 'systemic').length > 0 && (
  <Card className="shadow-lg border border-destructive/30 bg-destructive/5">
```

- [ ] **Step 2: Replace Section 4 with the expanded version**

Replace the entire Section 4 block with:

```tsx
{/* SECTION 4 — Systemic Issues Detected */}
{systemicPatterns.length > 0 && (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Systemic Issues Detected</p>
    {systemicPatterns.map((p, i) => {
      const isSystemic = p.severity === 'systemic';
      const borderClass = isSystemic
        ? 'border-l-4 border-l-red-500 border-red-200 bg-red-50'
        : 'border-l-4 border-l-amber-500 border-amber-200 bg-amber-50';
      const badgeClass = isSystemic
        ? 'bg-red-100 text-red-700 border-red-200'
        : 'bg-amber-100 text-amber-700 border-amber-200';
      const badgeLabel = isSystemic ? 'Organisation-wide' : 'Recurring';
      const title = p.signalCode
        .split('_')
        .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
      return (
        <Card key={i} className={`shadow-sm border ${borderClass}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <Badge variant="outline" className={`text-xs ${badgeClass}`}>{badgeLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
            <div className="flex flex-wrap gap-1">
              {p.departments.map((d: string) => (
                <Badge key={d} variant="outline" className="text-xs">
                  {getDepartmentName(d, language)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors. `getDepartmentName` is already imported. `SystemicPattern` fields `signalCode`, `departments`, `severity`, `description` are all used correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExecutiveSummary.tsx
git commit -m "feat: add recurring pattern cards alongside systemic — #33"
```

---

## Task 3: Ceiling Analysis Guard + Styling (#15)

**Files:** `src/components/results/CeilingInsightsPanel.tsx`, `src/components/ExecutiveSummary.tsx`

Two changes: (1) update `CeilingInsightsPanel` to accept `overallScore`, guard on it, fix empty state and heading; (2) pass `overallScore` from `ExecutiveSummary`.

- [ ] **Step 1: Update CeilingInsightsPanelProps interface**

In `src/components/results/CeilingInsightsPanel.tsx`, find:

```ts
interface CeilingInsightsPanelProps {
  insights: CeilingInsight[];
}
```

Replace with:

```ts
interface CeilingInsightsPanelProps {
  insights: CeilingInsight[];
  overallScore: number;
}
```

- [ ] **Step 2: Update the function signature and early return**

Find:

```tsx
export function CeilingInsightsPanel({ insights }: CeilingInsightsPanelProps) {
  const { t, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  if (insights.length === 0) {
    return (
      <Card className="shadow-lg border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Target className="h-5 w-5 text-primary" />
            {t('results.ceiling.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('results.ceiling.noInsights')}</p>
        </CardContent>
      </Card>
    );
  }
```

Replace with:

```tsx
export function CeilingInsightsPanel({ insights, overallScore }: CeilingInsightsPanelProps) {
  const { language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  if (overallScore < 55 || insights.length === 0) return null;
```

- [ ] **Step 3: Update the section heading and border colour**

Find the Card heading inside the return (the non-empty state render):

```tsx
  return (
    <Card className="shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Target className="h-5 w-5 text-primary" />
          {t('results.ceiling.title')}
        </CardTitle>
      </CardHeader>
```

Replace with:

```tsx
  return (
    <Card className="shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Target className="h-5 w-5 text-teal-500" />
          Ceiling Gap Analysis — Where Top-Quartile Dealers Gain
        </CardTitle>
      </CardHeader>
```

- [ ] **Step 4: Update insight card border to teal**

Find the insight card div:

```tsx
            <div
              key={i}
              className={`border-l-[6px] ${borderColor} rounded-r-lg border border-border p-4 transition-all`}
```

Replace with:

```tsx
            <div
              key={i}
              className="border-l-4 border-l-teal-500 rounded-r-lg border border-border p-4 transition-all"
```

Also remove the now-unused `DEPT_BORDER_COLORS` constant and `borderColor` variable from the map function. Find inside the `.map()`:

```tsx
          const prefix = insight.questionId.split('-')[0];
          const deptKey = PREFIX_TO_DEPT[prefix] ?? 'new-vehicle-sales';
          const deptLabel = getDepartmentName(deptKey, language);
          const borderColor = DEPT_BORDER_COLORS[deptKey] ?? 'border-l-primary';
```

Replace with:

```tsx
          const prefix = insight.questionId.split('-')[0];
          const deptKey = PREFIX_TO_DEPT[prefix] ?? 'new-vehicle-sales';
          const deptLabel = getDepartmentName(deptKey, language);
```

- [ ] **Step 5: Remove the unused `t` import usage**

Since `t` is no longer used (we removed `t('results.ceiling.title')` and `t('results.ceiling.noInsights')`), but `t` may still be referenced for `t('results.ceiling.badge')`, `t('results.ceiling.currentScore')`, `t('results.ceiling.viewAll')`, `t('results.ceiling.showLess')`. Check if `t` is still used elsewhere in the file. If it is, keep the `useLanguage` destructure including `t`. If not, remove `t` from the destructure. 

Search the file for `t('` — if any remain, keep `const { language } = useLanguage();` → `const { t, language } = useLanguage();`. If none remain, leave it as `const { language } = useLanguage();`.

- [ ] **Step 6: Remove unused DEPT_BORDER_COLORS constant**

Delete the entire `DEPT_BORDER_COLORS` object at the top of the file:

```ts
const DEPT_BORDER_COLORS: Record<string, string> = {
  'new-vehicle-sales': 'border-l-[hsl(var(--chart-2))]',
  'used-vehicle-sales': 'border-l-[hsl(var(--chart-1))]',
  'service-performance': 'border-l-destructive',
  'parts-inventory': 'border-l-warning',
  'financial-operations': 'border-l-[hsl(var(--chart-5))]',
};
```

- [ ] **Step 7: Pass overallScore from ExecutiveSummary**

In `src/components/ExecutiveSummary.tsx`, find:

```tsx
      {/* SECTION 5 — Excellence Gaps (upgraded) */}
      <CeilingInsightsPanel insights={ceilingInsights} />
```

Replace with:

```tsx
      {/* SECTION 5 — Excellence Gaps (upgraded) */}
      <CeilingInsightsPanel insights={ceilingInsights} overallScore={overallScore} />
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors. Common failure: `t` referenced but not destructured — fix by adding `t` back to the `useLanguage()` destructure if any `t(...)` calls remain in the file.

- [ ] **Step 9: Commit**

```bash
git add src/components/results/CeilingInsightsPanel.tsx src/components/ExecutiveSummary.tsx
git commit -m "feat: ceiling analysis guard + teal styling + correct empty state — #15"
```

---

## Task 4: 30/60/90 Day Roadmap View (#35)

**File:** `src/components/ActionPlan.tsx`

Add a 4th view mode (`'roadmap'`) with three time-bucketed columns. The bucketing uses `computeTriageScore` (already defined in the file, returns 0–20 scale) with thresholds adapted to match the existing triage badge scale.

- [ ] **Step 1: Add getRoadmapBucket helper function**

After the existing `isOverdue` function (around line 74), add:

```ts
function getRoadmapBucket(action: ActionRecord): '30' | '60' | '90' {
  const score = computeTriageScore(action);
  if (score !== null) {
    if (score >= 14) return '30';
    if (score >= 10) return '60';
    return '90';
  }
  if (action.priority === 'critical') return '30';
  if (action.priority === 'high') return '60';
  return '90';
}
```

- [ ] **Step 2: Expand the viewMode type**

Find (line 98):

```ts
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban');
```

Replace with:

```ts
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline' | 'roadmap'>('kanban');
```

- [ ] **Step 3: Add the Roadmap button to the view toggle**

Find the closing `</div>` of the view toggle block:

```tsx
            <button onClick={() => setViewMode('timeline')}
              className={cn("px-2 py-1.5 transition-colors",
                viewMode === 'timeline' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )} title="Timeline view">
              <GanttChart className="h-3.5 w-3.5" />
            </button>
          </div>
```

Replace with:

```tsx
            <button onClick={() => setViewMode('timeline')}
              className={cn("px-2 py-1.5 transition-colors",
                viewMode === 'timeline' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )} title="Timeline view">
              <GanttChart className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode('roadmap')}
              className={cn("px-2 py-1.5 transition-colors",
                viewMode === 'roadmap' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )} title="30/60/90 Roadmap">
              <CalendarIcon className="h-3.5 w-3.5" />
            </button>
          </div>
```

- [ ] **Step 4: Add the roadmap render block**

Find the content area switch (line ~629):

```tsx
      {/* Content area: Kanban, List, or Timeline */}
      {viewMode === 'timeline' ? (
        <TimelineView actions={filteredActions} onActionClick={openEditPanel} />
      ) : viewMode === 'kanban' ? (
```

Replace with:

```tsx
      {/* Content area: Kanban, List, Timeline, or Roadmap */}
      {viewMode === 'roadmap' ? (
        (() => {
          const buckets: { key: '30' | '60' | '90'; label: string; pillClass: string }[] = [
            { key: '30', label: '30 Days', pillClass: 'bg-red-100 text-red-700' },
            { key: '60', label: '60 Days', pillClass: 'bg-amber-100 text-amber-700' },
            { key: '90', label: '90 Days', pillClass: 'bg-blue-100 text-blue-700' },
          ];
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buckets.map(({ key, label, pillClass }) => {
                const bucketActions = filteredActions.filter(a => getRoadmapBucket(a) === key);
                return (
                  <div key={key} className="space-y-3">
                    <div className={cn('inline-flex px-3 py-1 rounded-full text-sm font-semibold', pillClass)}>
                      {label}
                    </div>
                    {bucketActions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No actions in this window</p>
                    ) : (
                      bucketActions.map(action => {
                        const displayTitle = cleanActionTitle(action.action_title);
                        const score = computeTriageScore(action);
                        return (
                          <div
                            key={action.id}
                            onClick={() => openEditPanel(action)}
                            className="rounded-lg border bg-card p-3 cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"
                          >
                            <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">{displayTitle}</p>
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="outline" className="text-xs">{action.department}</Badge>
                              {score !== null && (
                                <span className="text-xs text-muted-foreground">score: {score}</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()
      ) : viewMode === 'timeline' ? (
        <TimelineView actions={filteredActions} onActionClick={openEditPanel} />
      ) : viewMode === 'kanban' ? (
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors. `cleanActionTitle` is already imported. `computeTriageScore` is already defined in the file. `openEditPanel` is already in scope. `CalendarIcon` is already imported at line 14.

- [ ] **Step 6: Commit**

```bash
git add src/components/ActionPlan.tsx
git commit -m "feat: add 30/60/90 day roadmap as fourth view mode in ActionPlan — #35"
```

---

## Task 5: Final Verification + Push

- [ ] **Step 1: Run TypeScript check across full project**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Verify engine files are unmodified**

```bash
git diff HEAD~4 -- src/lib/scoringEngine.ts src/lib/signalEngine.ts src/lib/ceilingAnalysis.ts src/lib/narrativeTemplates.ts
```

Expected: empty output (no changes to any engine file).

- [ ] **Step 3: Verify Results.tsx is unmodified**

```bash
git diff HEAD~4 -- src/pages/Results.tsx
```

Expected: empty output.

- [ ] **Step 4: Push**

```bash
git push
```

- [ ] **Step 5: Post-push Lovable notice**

Paste this into Lovable:
> "Claude Code just pushed to main. Modified files: `src/components/ExecutiveSummary.tsx`, `src/components/results/CeilingInsightsPanel.tsx`, `src/components/ActionPlan.tsx` only.  
> DO NOT edit Results.tsx, scoringEngine.ts, signalEngine.ts, ceilingAnalysis.ts, narrativeTemplates.ts, or actionTemplatesTiered.ts."
