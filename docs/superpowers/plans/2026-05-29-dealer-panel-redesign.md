# DealerPanel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the DealerPanel dialog to match the dealer/coach dashboard design system — dark hero card with action counts, fix dept health badge overflow, improve tab strip visibility, and hand off tab content polish to Lovable MCP.

**Architecture:** Single file rewrite of `src/components/coach/DealerPanel.tsx`. All logic and layout changes are self-contained in this file. Data layer gains one additional query (action counts by status). Lovable MCP handles tab content visual polish as a separate parallel task.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (Badge, Button, Dialog), Supabase client, date-fns

---

## File Map

| File | Change |
|------|--------|
| `src/components/coach/DealerPanel.tsx` | Primary: hero rewrite, data extension, DeptHealthCard fix, tab strip, TopFocusActionsCard removal |
| Lovable (MCP send_message) | Tab content polish: ActivityTab, CoachNotesTab, VisitsTab entry cards |

---

## Task 1: Extend PanelData + add actionCounts query

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx` — `PanelData` interface (line ~55), `fetchData` function (line ~1251)

- [ ] **Step 1: Add `actionCounts` to the `PanelData` interface**

In `DealerPanel.tsx`, find the `PanelData` interface (around line 55) and add the `actionCounts` field:

```ts
interface PanelData {
  notes: CoachNote[];
  visits: CoachVisit[];
  assessmentScores: Record<string, number>;
  focusActions: FocusAction[];
  completedAssessments: CompletedAssessment[];
  actionCounts: { pending: number; inProgress: number; completed: number };
}
```

- [ ] **Step 2: Add the status count query in `fetchData`**

Inside `fetchData`, after building `assessmentIds` (around line 1279), add a query to count actions by status. Insert this block **after** the `assessmentIds` are defined but **before** the `assessmentScores` fetch:

```ts
let actionCounts = { pending: 0, inProgress: 0, completed: 0 };
if (assessmentIds.length) {
  const { data: allActionsData } = await supabase
    .from('improvement_actions')
    .select('status')
    .in('assessment_id', assessmentIds);

  actionCounts = {
    pending:    (allActionsData ?? []).filter(a => a.status === 'Open').length,
    inProgress: (allActionsData ?? []).filter(a => a.status === 'In Progress').length,
    completed:  (allActionsData ?? []).filter(a => a.status === 'Completed').length,
  };
}
```

- [ ] **Step 3: Include `actionCounts` in the `setData` call**

Find `setData({` near the end of `fetchData` and add `actionCounts`:

```ts
setData({
  notes: (notesRes.data ?? []) as CoachNote[],
  visits: (visitsRes.data ?? []) as CoachVisit[],
  assessmentScores,
  focusActions,
  completedAssessments,
  actionCounts,
});
```

- [ ] **Step 4: Fix TypeScript — verify no errors**

Run:
```
npx tsc --noEmit
```
Expected: 0 errors. If `data?.actionCounts` references appear before this task completes the hero rewrite, TypeScript may complain about missing property — that's fine, will be fixed in Task 2.

- [ ] **Step 5: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(dealer-panel): add actionCounts query to PanelData"
```

---

## Task 2: Rewrite hero section (dark `bg-[#0b1f3a]` card)

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx` — `DealerPanel` component return, lines ~1332–1377 (the `<DialogHeader>` block)

The current `<DialogHeader>` renders a white header with plain text chips. Replace it with a dark 4-column hero card matching the dealer/coach dashboard design.

- [ ] **Step 1: Replace the entire `<DialogHeader>` block**

Find this block (approximately lines 1336–1377):
```tsx
{/* Header */}
<DialogHeader className="px-6 py-4 border-b border-border shrink-0 space-y-3">
  ...
</DialogHeader>
```

Replace it entirely with:

```tsx
{/* Hero — dark card matching dealer/coach dashboard */}
<DialogHeader className="bg-[#0b1f3a] text-white px-6 pt-5 pb-0 shrink-0 space-y-0 [&>button]:text-white [&>button]:opacity-70 [&>button:hover]:opacity-100">
  {/* Row 1: dealer identity */}
  <div className="flex items-center gap-2.5 mb-4 pr-8">
    <DialogTitle className="text-base font-semibold text-white leading-tight truncate">
      {dealer.dealerName}
    </DialogTitle>
    <span className="text-xs text-white/50 flex items-center gap-1 shrink-0">
      <MapPin className="h-3 w-3" />
      {dealer.location}
    </span>
  </div>

  {/* Row 2: 4-column metrics grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 pb-5">
    {/* Col 1: Overall Score */}
    <div className="pr-6 md:border-r md:border-white/10">
      <p className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-semibold">
        Overall Score
      </p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-5xl font-extrabold text-white leading-none">
          {latestScore != null ? Math.round(latestScore) : '—'}
        </span>
        {latestScore != null && (
          <span className="text-sm text-white/40 font-medium">/100</span>
        )}
      </div>
      {latestScore != null && (
        <div className="mt-2 h-[5px] rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1d7afc] to-[#60aafb]"
            style={{ width: `${Math.min(Math.round(latestScore), 100)}%` }}
          />
        </div>
      )}
      {latestScore != null && (() => {
        const darkCls = latestScore >= 75
          ? 'bg-[#16a34a]/20 text-[#4ade80] border-[#16a34a]/30'
          : latestScore >= 46
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          : 'bg-[#dc2626]/20 text-red-300 border-[#dc2626]/30';
        const band = getScoreBand(latestScore);
        return (
          <Badge variant="outline" className={`mt-2 text-[10px] font-semibold ${darkCls}`}>
            {band.label}
          </Badge>
        );
      })()}
    </div>

    {/* Col 2: Actions Status */}
    <div className="pl-6 md:border-r md:border-white/10">
      <p className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-semibold">
        Actions
      </p>
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-white/50">Pending</span>
          <span className="text-2xl font-bold text-white leading-none">
            {data?.actionCounts.pending ?? '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-white/50">In Progress</span>
          <span className="text-2xl font-bold text-amber-400 leading-none">
            {data?.actionCounts.inProgress ?? '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-white/50">Completed</span>
          <span className="text-2xl font-bold text-[#4ade80] leading-none">
            {data?.actionCounts.completed ?? '—'}
          </span>
        </div>
      </div>
    </div>

    {/* Col 3: Next Visit */}
    <div className="pl-6 md:border-r md:border-white/10 mt-4 md:mt-0">
      <p className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-semibold">
        Next Visit
      </p>
      <div className="mt-1">
        {upcomingVisit ? (
          <>
            <p className="text-xl font-bold text-white leading-snug">
              {format(new Date(upcomingVisit.visit_date), 'dd MMM yyyy')}
            </p>
            <Badge
              variant="outline"
              className="mt-1 text-[10px] capitalize border-white/20 text-white/70"
            >
              {upcomingVisit.status === 'counter_proposed' ? 'Counter proposed' : upcomingVisit.status}
            </Badge>
          </>
        ) : (
          <>
            <p className="text-sm text-white/40 mt-1">None scheduled</p>
            <button
              className="text-xs text-[#60aafb] hover:underline mt-1 block"
              onClick={() => setActiveTab('visits')}
            >
              Schedule →
            </button>
          </>
        )}
      </div>
    </div>

    {/* Col 4: Critical Gaps */}
    <div className="pl-6 mt-4 md:mt-0">
      <p className="text-[10px] uppercase tracking-[0.1em] text-white/50 font-semibold">
        Critical Gaps
      </p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-5xl font-extrabold leading-none text-white">
          {criticalGaps}
        </span>
      </div>
      <p className="text-[10px] text-white/40 mt-1.5">
        dept{criticalGaps !== 1 ? 's' : ''} below benchmark
      </p>
    </div>
  </div>
</DialogHeader>
```

> **Note:** `upcomingVisit` and `criticalGaps` are already computed in `DealerPanel` scope (lines ~1320–1326 in the original file). `setActiveTab` is the state setter already in scope. `getScoreBand` is already imported. `Badge` and `MapPin` and `format` are already imported.

- [ ] **Step 2: Run TypeScript check**

```
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Start dev server and visually verify hero**

```
npm run dev
```

Open `http://localhost:8080`, log in as a coach, click any dealer card to open DealerPanel. Verify:
- Dark blue hero background (`#0b1f3a`)
- Score shows in large bold white text with progress bar + maturity badge
- Action counts (Pending / In Progress / Completed) show with colour-coded numbers
- Next Visit date OR "None scheduled" + Schedule link
- Critical Gaps count displays
- Close (X) button is white/visible on dark background
- Dealer name + location in first row

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(dealer-panel): dark hero card with 4-column metrics matching dashboard design"
```

---

## Task 3: Remove TopFocusActionsCard from above-tab position

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx` — two-column body section, lines ~1396–1408

The `TopFocusActionsCard` currently renders between the tab strip and the scrollable tab body (non-scrolling, always visible). Now that the hero shows action counts, remove it from this position. The focus action detail is accessible via the Activity tab.

- [ ] **Step 1: Remove the TopFocusActionsCard render block**

In the two-column body, find and delete this block entirely:

```tsx
{/* Top Focus Actions — above tabs, non-scrolling */}
{data && data.focusActions.length > 0 && (
  <TopFocusActionsCard
    focusActions={data.focusActions}
    latestAssessmentId={latestAssessmentId}
  />
)}
```

The `TopFocusActionsCard` function definition itself (lines ~910–992) can remain — it costs nothing unused and may be useful later. Just remove its render site.

- [ ] **Step 2: TypeScript check**

```
npx tsc --noEmit
```
Expected: 0 errors. (Unused `TopFocusActionsCard` will not trigger a TS error — it's just not rendered.)

- [ ] **Step 3: Visually verify**

With dev server running, open DealerPanel. Confirm the focus action cards no longer appear above the tab body. The tab body (Activity Log / Visit History / Coach Notes) should now start immediately below the tab strip with no gap/card between them.

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(dealer-panel): remove TopFocusActionsCard from above-tab — counts now in hero"
```

---

## Task 4: Tab strip — pill-style active state

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx` — tab strip block, lines ~1379–1394

The current tab strip uses a thin blue underline border for the active tab (`border-b-2 border-[hsl(var(--brand-500))]`). Replace with pill-style active highlighting.

- [ ] **Step 1: Replace tab strip JSX**

Find the tab strip block:
```tsx
{/* Tab strip */}
<div className="flex border-b border-border px-6 shrink-0">
  {TABS.map(tab => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        activeTab === tab
          ? 'border-[hsl(var(--brand-500))] text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {tab === 'activity' ? 'Activity Log' : tab === 'visits' ? 'Visit History' : 'Coach Notes'}
    </button>
  ))}
</div>
```

Replace with:
```tsx
{/* Tab strip */}
<div className="flex items-center gap-1 border-b border-border px-4 py-2 shrink-0 bg-background">
  {TABS.map(tab => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-[hsl(var(--brand-500))] text-white'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {tab === 'activity' ? 'Activity Log' : tab === 'visits' ? 'Visit History' : 'Coach Notes'}
    </button>
  ))}
</div>
```

- [ ] **Step 2: TypeScript check**

```
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Visually verify**

In the running dev server, switch between tabs. Active tab should show a filled blue pill. Inactive tabs should be muted text, with a subtle hover highlight.

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(dealer-panel): pill-style tab strip active state"
```

---

## Task 5: Fix DeptHealthCard badge overflow

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx` — `DeptHealthCard` component, the per-department row render inside `DEPT_HEALTH_ORDER.map(...)` (lines ~1035–1066)

The badge ("Developing" / "Foundational" / "Performing") overflows the right boundary of the sidebar card because the right-side flex container is `shrink-0`. Fix with a 2-row layout: row 1 = name + score + delta, row 2 = progress bar + badge.

- [ ] **Step 1: Replace the per-department render inside `DeptHealthCard`**

Find the department map block (inside `DEPT_HEALTH_ORDER.map(sectionId => {`):

```tsx
return (
  <div key={sectionId} className="space-y-1">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground truncate w-28 shrink-0">
        {getDepartmentName(sectionId, 'en')}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold w-6 text-right">{Math.round(score)}</span>
        <span className={`text-[10px] font-medium w-12 text-right ${gap >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          {gap >= 0 ? `▲ +${gap}` : `▼ ${gap}`}
        </span>
        <Badge variant="outline" className={`text-[10px] ${cls} shrink-0`}>
          {label}
        </Badge>
      </div>
    </div>
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${barColor}`}
        style={{ width: `${Math.min(Math.round(score), 100)}%` }}
      />
    </div>
  </div>
);
```

Replace with:
```tsx
return (
  <div key={sectionId} className="space-y-1">
    {/* Row 1: dept name + score + delta */}
    <div className="flex items-center justify-between gap-1 min-w-0">
      <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
        {getDepartmentName(sectionId, 'en')}
      </span>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <span className="text-xs font-semibold">{Math.round(score)}</span>
        <span className={`text-[10px] font-medium ${gap >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          {gap >= 0 ? `▲+${gap}` : `▼${gap}`}
        </span>
      </div>
    </div>
    {/* Row 2: progress bar + badge */}
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(Math.round(score), 100)}%` }}
        />
      </div>
      <Badge variant="outline" className={`text-[10px] shrink-0 whitespace-nowrap ${cls}`}>
        {label}
      </Badge>
    </div>
  </div>
);
```

The badge now sits next to the progress bar on row 2 with `shrink-0 whitespace-nowrap`. The progress bar is `flex-1` and compresses to give the badge room. No more overflow.

- [ ] **Step 2: TypeScript check**

```
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Visually verify**

In the dev server, open DealerPanel for a dealer with assessment data. Expand the Department Health sidebar card. Verify:
- All badges ("Developing", "Foundational", "Performing") are fully visible within the card boundary
- Progress bar shows on its own row below the name/score row
- No horizontal clipping at any dialog width

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "fix(dealer-panel): dept health badge overflow — 2-row layout with flex-1 progress bar"
```

---

## Task 6: Hand off tab content polish to Lovable MCP

**Files:**
- Send message via `mcp__lovable__send_message` to the Lovable project

This task sends a targeted polish request to Lovable for visual improvements to the Activity, Notes, and Visit tab content areas. Claude Code does NOT touch these — Lovable owns the UI-only styling.

- [ ] **Step 1: Get the Lovable project ID**

Use the Lovable MCP to list projects and identify the dealership-performance-assessment-tool project:

```
mcp__lovable__list_projects
```

Note the project `id` for the dealership tool.

- [ ] **Step 2: Send the polish message to Lovable**

Send via `mcp__lovable__send_message` with this message body:

```
In `src/components/coach/DealerPanel.tsx`, please polish the visual styling of the three tab content areas — ActivityTab, CoachNotesTab, and VisitsTab — without changing any logic, data fetching, or function signatures.

Specific improvements needed:

1. **ActivityTab entries** (`ActivityEntryRow` component):
   - Increase padding around each entry to `py-5` (currently `py-4`)
   - Avatar circle: increase to `h-9 w-9`, keep existing colour logic
   - Timestamp: change from `text-[11px]` to `text-xs` for legibility
   - Add a subtle `bg-muted/30` background on hover for each row (use `group` + `group-hover` or wrap in a div with hover state)

2. **CoachNotesTab note entries** (the `notes.map(note => ...)` block):
   - Same avatar and padding improvements as ActivityTab
   - Note text: change from `text-sm` to `text-[13px]` with `leading-relaxed`

3. **VisitsTab past visits list**:
   - The `rounded-lg border border-border divide-y divide-border` container for past visits looks correct — no change needed
   - Each past visit row: increase inner padding to `px-4 py-3.5` (currently `px-4 py-3`)
   - Visit date: change to `text-sm font-semibold` (currently already this — confirm unchanged)
   - Status badge on past visits: ensure `capitalize` is applied (it already is — confirm)

Do NOT change: any Supabase queries, TypeScript interfaces, function logic, import statements, or the structure/positioning of the tab content within the dialog. Only change className strings in the JSX of these three sub-components.
```

- [ ] **Step 3: Review Lovable diff**

After Lovable responds, use `mcp__lovable__get_diff` to review what changed. Confirm only className strings were modified, not logic.

- [ ] **Step 4: Pull Lovable changes into repo**

Lovable changes are auto-synced to the repo. Run:
```
git pull
```
Verify the diff in `DealerPanel.tsx` is only className changes in the three sub-components.

- [ ] **Step 5: TypeScript check + visual verify**

```
npx tsc --noEmit
```

Then in dev server, verify each tab (Activity, Coach Notes, Visit History) looks cleaner with the improved spacing and text sizes.

- [ ] **Step 6: Commit if Lovable changes needed adjustment**

If you manually fixed anything after reviewing the Lovable diff:
```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "style(dealer-panel): tab content visual polish — activity, notes, visits"
```

---

## Task 7: Final integration check

- [ ] **Step 1: Run TypeScript**

```
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 2: Run tests**

```
npx vitest run
```
Expected: all tests pass. DealerPanel has no unit tests — any failures are pre-existing.

- [ ] **Step 3: Full visual walkthrough**

In dev server at `http://localhost:8080`, as a coach user:

1. Open any dealer panel → hero shows dark background, 4 columns, all data loaded
2. Action counts: verify Pending/In Progress/Completed numbers match actual actions for that dealer
3. Click tab strip pills — each switches cleanly with filled pill highlighting
4. Department Health sidebar card — no badge overflow at any dialog width (try resizing)
5. Activity Log tab — entries readable, adequate spacing
6. Visit History tab — past visits clean, status badges visible
7. Coach Notes tab — note text readable, compose box clear
8. Score badge on hero is colour-correct: Foundational=red, Developing=amber, Performing=green
9. Close button (X) is white and visible on dark hero

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(dealer-panel): complete redesign — dark hero, action counts, badge overflow fix, pill tabs"
```
