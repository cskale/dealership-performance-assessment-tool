# UX/UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a premium, coherent visual identity — Inter font, brand-blue accent, soft-shadow cards, full department names, and two unwired engine outputs rendered in Results.

**Architecture:** Two phases. Phase 1 (Claude Code) fixes the design token foundation and wires two engine outputs. Phase 2 (Lovable) propagates the new language through components and pages using precise prompts that reference DESIGN.md.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Vite. Tests: Vitest.

**Design reference:** `DESIGN.md` — read it before every task.

---

## Phase 1 — Foundation (Claude Code)

### Task 1: CSS token consolidation + font swap

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Swap font import**

Replace the Roboto import at the top of `src/index.css`:

```css
/* REMOVE this line */
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;...');

/* ADD this line */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

- [ ] **Step 2: Remove duplicate dd-accent tokens**

Inside `:root { }` in `src/index.css`, delete these three lines:
```css
--dd-accent: 221 82% 51%;
--dd-accent-light: 221 100% 95%;
--dd-accent-mid: 221 72% 82%;
```

- [ ] **Step 3: Add signal semantic aliases**

Inside `:root { }`, replace the existing dd-amber/green/red block:
```css
/* REMOVE */
--dd-amber: 38 92% 45%;
--dd-amber-light: 43 96% 90%;
--dd-green: 160 84% 39%;
--dd-green-light: 153 85% 91%;
--dd-red: 0 84% 50%;
--dd-red-light: 0 86% 95%;

/* ADD */
--signal-warning:       38 92% 45%;   /* #d97706 — Moderate */
--signal-warning-light: 43 96% 90%;
--signal-success:       160 84% 39%;  /* #22c55e — Strength */
--signal-success-light: 153 85% 91%;
--signal-critical:      0 84% 50%;    /* #ef4444 — Critical gap */
--signal-critical-light:0 86% 95%;
/* Keep dd-amber/green/red as aliases during transition */
--dd-amber:       var(--signal-warning);
--dd-amber-light: var(--signal-warning-light);
--dd-green:       var(--signal-success);
--dd-green-light: var(--signal-success-light);
--dd-red:         var(--signal-critical);
--dd-red-light:   var(--signal-critical-light);
```

- [ ] **Step 4: Update body font**

In the `@layer base` body rule, change:
```css
/* BEFORE */
font-family: 'Roboto', system-ui, -apple-system, sans-serif;

/* AFTER */
font-family: 'Inter', system-ui, sans-serif;
```

- [ ] **Step 5: Verify build is clean**

```bash
npm run build
```
Expected: no errors. If you see font-related warnings, check the import URL.

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "feat: swap Roboto → Inter, consolidate dd-accent tokens, add signal aliases"
```

---

### Task 2: Tailwind config — font and shadow tokens

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update fontFamily.sans to Inter**

In `tailwind.config.ts`, change the `fontFamily` block:
```ts
fontFamily: {
  sans: ['"Inter"', 'system-ui', 'sans-serif'],
  display: ['"Instrument Serif"', 'Georgia', 'serif'], // keep, not active
  mono: ['"DM Mono"', 'monospace'],
},
```

- [ ] **Step 2: Update shadow tokens**

Replace the existing `boxShadow` block:
```ts
boxShadow: {
  'soft':     '0 1px 3px 0 hsl(var(--neutral-1000) / 0.06), 0 1px 2px -1px hsl(var(--neutral-1000) / 0.06)',
  'card':     '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 4px 12px 0 rgb(15 23 42 / 0.05)',
  'elevated': '0 4px 16px 0 rgb(15 23 42 / 0.08), 0 1px 4px 0 rgb(15 23 42 / 0.04)',
  'overlay':  '0 10px 15px -3px hsl(var(--neutral-1000) / 0.08), 0 4px 6px -4px hsl(var(--neutral-1000) / 0.04)',
},
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: Inter font token, updated shadow-card and shadow-elevated values"
```

---

### Task 3: Render CeilingInsightsPanel in Results

The `ceilingInsights` value is already computed in `Results.tsx` (line 139) but never rendered. `CeilingInsightsPanel` component is ready at `src/components/results/CeilingInsightsPanel.tsx`.

**Files:**
- Modify: `src/pages/Results.tsx`

- [ ] **Step 1: Add CeilingInsightsPanel import**

At the top of `src/pages/Results.tsx`, add:
```tsx
import { CeilingInsightsPanel } from "@/components/results/CeilingInsightsPanel";
```

- [ ] **Step 2: Remove the TODO comment**

Find and remove this comment on line ~138:
```tsx
// TODO CC-12: ceilingInsights ready — render in Results UI (next session)
```

- [ ] **Step 3: Render CeilingInsightsPanel in the executive tab**

Inside the `<TabsContent value="executive">` block, add after the `<ExecutiveSummary />` ErrorBoundary:

```tsx
{ceilingInsights.length > 0 && (
  <ErrorBoundary fallbackTitle={language === 'de' ? 'Deckenanalyse nicht verfügbar' : 'Ceiling analysis unavailable'}>
    <CeilingInsightsPanel insights={ceilingInsights} />
  </ErrorBoundary>
)}
```

- [ ] **Step 4: Verify build and visual check**

```bash
npm run build
npm run dev
```
Load a completed assessment in Results → Executive tab. If overall score ≥70 and any question scores 4, you should see the Ceiling Insights panel. If no ceiling insights exist for the test data, the panel correctly renders nothing.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Results.tsx
git commit -m "feat: render CeilingInsightsPanel in Results executive tab — tracker #15"
```

---

### Task 4: Display cross-validation alerts in Results

`evaluateCrossValidations()` is already called in `generateActionsFromAssessment()` but the findings are never shown in the Results UI. Add an inline alert strip to the executive tab.

**Files:**
- Modify: `src/pages/Results.tsx`

- [ ] **Step 1: Add import**

```tsx
import { evaluateCrossValidations } from "@/data/crossValidationRules";
import type { CrossValidationFinding } from "@/data/crossValidationRules";
```

- [ ] **Step 2: Derive cross-validation alerts via useMemo**

After the existing `ceilingInsights` useMemo (line ~145), add:

```tsx
const crossValidationAlerts = useMemo((): CrossValidationFinding[] => {
  if (!resultsData?.answers) return [];
  return evaluateCrossValidations(resultsData.answers as Record<string, number>);
}, [resultsData]);
```

- [ ] **Step 3: Render alert strips in executive tab**

After the CeilingInsightsPanel block added in Task 3, add:

```tsx
{crossValidationAlerts.length > 0 && (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
      {language === 'de' ? 'Quervalidierungen' : 'Cross-Validation Findings'}
    </h3>
    {crossValidationAlerts.map((alert) => (
      <div
        key={alert.ruleId}
        className={cn(
          'flex items-start gap-3 px-4 py-3 rounded-r-md border-l-[3px]',
          alert.severity === 'HIGH'   && 'bg-destructive/8 border-l-destructive',
          alert.severity === 'MEDIUM' && 'bg-[hsl(var(--signal-warning))]/8 border-l-[hsl(var(--signal-warning))]',
          alert.severity === 'LOW'    && 'bg-muted border-l-muted-foreground/30',
        )}
      >
        <div className={cn(
          'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
          alert.severity === 'HIGH'   && 'bg-destructive',
          alert.severity === 'MEDIUM' && 'bg-[hsl(var(--signal-warning))]',
          alert.severity === 'LOW'    && 'bg-muted-foreground/50',
        )} />
        <div>
          <p className="text-[11px] font-medium text-foreground">{alert.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{alert.description}</p>
        </div>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 4: Verify build and visual check**

```bash
npm run build
npm run dev
```
Load a completed assessment. If any answer pairs trigger cross-validation rules, the strips appear. No findings = nothing rendered.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Results.tsx
git commit -m "feat: display cross-validation findings in Results executive tab — tracker #11"
```

---

## Phase 2 — UI Components (Lovable)

> **How to use:** Copy each prompt block below and paste it into Lovable. Send one task at a time. Do not combine tasks. Reference: "Follow DESIGN.md exactly."

---

### Task 5: Cards + page background (Lovable)

**Lovable prompt:**
```
Follow DESIGN.md exactly (v2, April 2026).

Task: Update all Card component usages and the authenticated layout background.

Changes required:
1. In `src/components/AuthenticatedLayout.tsx`: add `bg-neutral-100` (Tailwind) to the main content wrapper div. This is the page background — cards float on it.

2. Grep for every `<Card` usage in `src/pages/` and `src/components/` (excluding `src/components/ui/`). For each one:
   - Remove any `border`, `border-border`, `border-gray-*`, or similar border classes
   - Add `shadow-card` class
   - Ensure `rounded-xl` (not `rounded-lg`)
   - Keep `bg-white` or `bg-card`

3. Do NOT touch `src/components/ui/card.tsx` itself.
4. Do NOT change any component logic, only className strings.
5. Department KPI mini-cards that already have `border-2 border-brand-500` or similar blue border — leave those alone.
```

---

### Task 6: AppSidebar — replace hardcoded values (Lovable)

**Lovable prompt:**
```
Follow DESIGN.md exactly (v2, April 2026).

Task: Refine AppSidebar active state and remove hardcoded colour values.

File: `src/components/AppSidebar.tsx`

Changes:
1. Find every instance of `hsl(221,82%,51%)` or `hsl(221, 82%, 51%)` — replace with `hsl(var(--brand-500))`.
2. Find every instance of `hsl(var(--dd-accent))` — replace with `hsl(var(--brand-500))`.
3. Active nav item classes should be: `bg-[hsl(var(--brand-500))]/10 border-r-2 border-[hsl(var(--brand-500))] text-white`
4. Inactive nav item: `text-white/55`
5. Inactive hover: `hover:bg-white/[0.05] hover:text-white/85`
6. Section group labels: `text-[9px] uppercase tracking-widest text-white/25`

Do NOT change the sidebar's structure, collapse behaviour, or any logic.
```

---

### Task 7: Badge + SharedStatusBadge token alignment (Lovable)

**Lovable prompt:**
```
Follow DESIGN.md exactly (v2, April 2026).

Task: Align Badge and SharedStatusBadge to the v2 token set.

Files:
- `src/components/ui/badge.tsx`
- `src/components/shared/SharedStatusBadge.tsx`

Changes to badge.tsx:
- The default/outline variant border and text should use `border-border` and `text-foreground` — no hardcoded hex.
- The primary variant: `bg-[hsl(var(--brand-500))] text-white`.

Changes to SharedStatusBadge.tsx:
- Any reference to `dd-accent`, `dd-green`, `dd-amber`, `dd-red` — replace:
  - dd-accent  → brand-500
  - dd-green   → signal-success
  - dd-amber   → signal-warning
  - dd-red     → signal-critical
- Keep the same component interface (props unchanged).
```

---

### Task 8: Dashboard, Results, Assessment page spacing cleanup (Lovable)

**Lovable prompt:**
```
Follow DESIGN.md exactly (v2, April 2026).

Task: Normalise spacing and replace hardcoded colour values across three pages.

Scope: `src/pages/Dashboard.tsx`, `src/pages/Results.tsx`, `src/pages/Assessment.tsx`

Rules:
1. Page content area padding: use `px-6 py-6` on the outermost content div (not the sidebar wrapper).
2. Section gaps between cards: `gap-6` for relaxed layouts, `gap-4` for dense grids.
3. Replace any hardcoded hex colours (#1D7AFC, #1558BC, etc.) with CSS var equivalents:
   - #1D7AFC → hsl(var(--brand-500))
   - #1558BC → hsl(var(--brand-700))
4. Replace any `py-[9px]`, `text-[13px]`, `text-[10px]` arbitrary values with the nearest standard Tailwind class (py-2, text-sm, text-xs).
5. Department labels in any card or table: replace abbreviated labels (NVS, UVS, SVC, PTS, FIN) with full names:
   - NVS → New Vehicle Sales
   - UVS → Used Vehicle Sales
   - SVC → Service
   - PTS → Parts
   - FIN → Financial Operations
6. Do NOT change any component logic, routing, or data-fetching code.
```

---

## Self-Review

**Spec coverage check:**
- ✅ Font swap (Inter) → Task 1 + Task 2
- ✅ Token consolidation (dd-accent removal) → Task 1
- ✅ Shadow-card + no-border cards → Task 2 + Task 5
- ✅ Page background neutral-100 → Task 5
- ✅ Sidebar active state → Task 6
- ✅ Department full names → Task 8
- ✅ Badge/SharedStatusBadge token alignment → Task 7
- ✅ CeilingInsightsPanel wired → Task 3
- ✅ Cross-validation alerts rendered → Task 4
- ✅ Dashboard spacing cleanup → Task 8
- ✅ Results layout cleanup → Task 8
- ✅ Assessment spacing cleanup → Task 8

**Out of scope confirmed not in plan:** Role architecture, OEM dashboard, 2S/3S/4S branching, dark mode, new npm packages.
