# Sprint 1: Layout Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Leapsome-quality layout shell — warm canvas gradient, sidebar pill active state + always-visible collapse toggle + section labels, and a richer top bar with search trigger — across all authenticated routes.

**Architecture:** Three independent files with zero shared state. Each task commits independently. `index.css` adds utility classes consumed by the other two files. `AppSidebar.tsx` replaces hover-collapse with a button and upgrades the active nav state. `AuthenticatedLayout.tsx` gains a richer top bar and the canvas gradient on `<main>`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, shadcn/ui, Lucide React, React Router v6

**Spec:** `docs/superpowers/specs/2026-05-09-sprint1-layout-shell-design.md`

---

## File Map

| File | Change type | What changes |
|---|---|---|
| `src/index.css` | Modify | Add `.bg-canvas-warm`, `.sidebar-pill-active`, 3 animation keyframe sets |
| `src/components/AppSidebar.tsx` | Modify | Pill active state, always-visible collapse button, taller logo header, remove hover-collapse timer |
| `src/components/AuthenticatedLayout.tsx` | Modify | Search trigger + user avatar top bar, apply `.bg-canvas-warm` to `<main>` |

**Do NOT touch:** any page component, any `src/components/ui/` file, any Supabase query, any routing logic, `scoringEngine.ts`, `questionnaire.ts`, or Lovable-owned files (`RadarBenchmarkChart.tsx`, `KanbanBoard.tsx`, `FreshnessBadge.tsx`).

---

## Task 1: CSS Utilities (`src/index.css`)

**Files:**
- Modify: `src/index.css`

### Context

The file already has an `@layer utilities` block containing `.text-h1` through `.text-h5`, `.font-display`, `.numeric`, `.density-compact`, and more. The heading tracking (`letter-spacing`) was already added in an earlier session. This task adds the canvas gradient and four brand-blue animation utilities into that same `@layer utilities` block.

The file also has an `@layer base` block with `:focus-visible` and body styles — **do not touch that block**.

---

- [ ] **Step 1: Add canvas gradient + animation utilities**

Open `src/index.css`. Find the **end** of the `@layer utilities { ... }` block (it ends just before or after `.density-compact`). Insert the following CSS block **inside** `@layer utilities`, after the existing density-compact rules:

```css
  /* ── Canvas gradient — DESIGN.md §35 ── */
  /* Apply to <main> in AuthenticatedLayout ONLY. Never on cards or sidebar. */
  .bg-canvas-warm {
    background:
      radial-gradient(
        ellipse 65% 50% at 100% 0%,
        oklch(0.95 0.04 50) 0%,
        oklch(0.96 0.03 30) 35%,
        oklch(0.97 0.01 20) 60%,
        oklch(0.97 0 0) 85%
      ),
      hsl(var(--neutral-050));
  }

  /* ── Brand blue animations — DESIGN.md §36 ── */

  /* Sidebar active pill tonal gradient fill */
  .sidebar-pill-active {
    background: linear-gradient(
      135deg,
      hsl(var(--brand-500) / 0.15) 0%,
      hsl(var(--brand-500) / 0.07) 100%
    );
  }

  /* Notification badge pulse — fires once on new notification */
  @keyframes badgePulse {
    0%   { box-shadow: 0 0 0 0   hsl(var(--destructive) / 0.5); }
    70%  { box-shadow: 0 0 0 6px hsl(var(--destructive) / 0);   }
    100% { box-shadow: 0 0 0 0   hsl(var(--destructive) / 0);   }
  }
  .badge-pulse {
    animation: badgePulse 600ms ease-out 1;
  }

  /* Progress bar fill — grows from 0 on first render */
  @keyframes progressGrow {
    from { width: 0%; }
  }
  .progress-animate {
    animation: progressGrow 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  /* Tab active indicator slide */
  @keyframes tabSlide {
    from { opacity: 0; transform: scaleX(0.6); }
    to   { opacity: 1; transform: scaleX(1);   }
  }
  .tab-indicator {
    animation: tabSlide 120ms ease-out forwards;
    transform-origin: left center;
  }
```

- [ ] **Step 2: TypeScript + build check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add canvas gradient + brand-blue animation utilities (Sprint 1)"
```

---

## Task 2: Sidebar Upgrade (`src/components/AppSidebar.tsx`)

**Files:**
- Modify: `src/components/AppSidebar.tsx`

### Context

Current file (211 lines). Key things to know before editing:

- `collapseTimer`, `handleMouseLeave`, `handleMouseEnter` — **all removed** in this task. The sidebar collapses only via button click from now on.
- `navItemClass(path)` — currently returns a `border-r-2` (right border) active style. Replace with pill style using `.sidebar-pill-active`.
- The header is currently a `py-4` div — replace with `h-14` fixed-height div containing the collapse button.
- Section labels currently use `text-[9px] uppercase tracking-widest text-white/25` — keep the same text but adjust spacing to `pt-4 pb-0.5 tracking-[0.12em]`.
- `useRef` and `useCallback` imports are only used for the hover-collapse logic. Remove them after removing that logic.

---

- [ ] **Step 1: Update imports**

Replace the current import block at the top of the file:

```tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useActiveRole } from '@/hooks/useActiveRole';
import {
  BarChart3, Building2, Plus, ClipboardList, CheckSquare,
  BookOpen, FileText, LogOut, Database, Globe, Users, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
```

Changes from current:
- Remove `useRef, useCallback` (no longer needed)
- Add `ChevronLeft, ChevronRight` to lucide-react import

- [ ] **Step 2: Remove hover-collapse state and handlers**

Delete these three blocks entirely (lines ~20–59 in the current file):

```tsx
// DELETE: collapseTimer ref
const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

// DELETE: cleanup useEffect
useEffect(() => {
  return () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
  };
}, []);

// DELETE: handleMouseLeave
const handleMouseLeave = useCallback(() => {
  if (collapseTimer.current) clearTimeout(collapseTimer.current);
  collapseTimer.current = setTimeout(() => {
    setCollapsed(true);
  }, 4000);
}, []);

// DELETE: handleMouseEnter
const handleMouseEnter = useCallback(() => {
  if (collapseTimer.current) {
    clearTimeout(collapseTimer.current);
    collapseTimer.current = null;
  }
  setCollapsed(false);
}, []);
```

Keep `const [collapsed, setCollapsed] = useState(false);` — the state itself stays, driven by button click.

- [ ] **Step 3: Replace `navItemClass` with pill style**

Replace the current `navItemClass` function:

```tsx
// REMOVE THIS:
const navItemClass = (path: string) =>
  cn(
    'flex items-center gap-2.5 py-[9px] text-[13px] transition-all cursor-pointer',
    collapsed ? 'px-0 justify-center' : 'px-5',
    isActive(path)
      ? 'bg-[hsl(var(--brand-500))]/10 border-r-2 border-[hsl(var(--brand-500))] text-white'
      : 'text-white/55 hover:bg-white/[0.05] hover:text-white/85'
  );

// REPLACE WITH:
const navItemClass = (path: string) =>
  cn(
    'flex items-center gap-2.5 h-9 text-[13px] transition-colors duration-100 mr-3',
    collapsed ? 'px-0 justify-center rounded-md' : 'px-3 rounded-r-md',
    isActive(path)
      ? 'sidebar-pill-active border-l-2 border-brand-500 text-white'
      : 'text-white/55 hover:text-white/85 hover:bg-white/5 border-l-2 border-transparent'
  );
```

Keep `iconClass` unchanged — it still reads `isActive(path)` for the icon color.

- [ ] **Step 4: Replace header area**

Find and replace the current header block:

```tsx
// REMOVE THIS (current header):
{/* Header */}
<div className={cn('py-4 border-b border-white/[0.06]', collapsed ? 'px-2' : 'px-5')}>
  <Link to="/app/dashboard" className="flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-[hsl(var(--brand-500))] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
        <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
        <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
        <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
      </svg>
    </div>
    {!collapsed && (
      <div>
        <div className="text-[13px] font-semibold text-white leading-tight">Dealer Diagnostic</div>
        <div className="text-[10px] uppercase tracking-widest text-white/35 leading-tight">Performance Intelligence</div>
      </div>
    )}
  </Link>
</div>

// REPLACE WITH:
{/* Header — h-14 with always-visible collapse button */}
<div className={cn(
  'flex items-center h-14 border-b border-white/[0.06] shrink-0 relative',
  collapsed ? 'px-3 justify-center' : 'px-5'
)}>
  <Link to="/app/dashboard" className="flex items-center gap-2.5 flex-1 min-w-0">
    <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
        <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
        <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
        <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
      </svg>
    </div>
    {!collapsed && (
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-white leading-tight truncate">Dealer Diagnostic</div>
        <div className="text-[10px] uppercase tracking-widest text-white/35 leading-tight">Performance Intelligence</div>
      </div>
    )}
  </Link>
  {/* Collapse toggle — always visible */}
  <button
    type="button"
    onClick={() => setCollapsed(prev => !prev)}
    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full
               bg-white/10 flex items-center justify-center
               hover:bg-white/20 transition-colors shrink-0"
    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {collapsed
      ? <ChevronRight className="h-3 w-3 text-white/60" />
      : <ChevronLeft  className="h-3 w-3 text-white/60" />}
  </button>
</div>
```

- [ ] **Step 5: Replace section label rendering**

Find and replace the section label block inside the `sections.map`:

```tsx
// REMOVE THIS:
{!collapsed && (
  <div className="px-5 pt-5 pb-1.5 text-[9px] uppercase tracking-widest text-white/25">
    {section.label}
  </div>
)}
{collapsed && <div className="pt-3" />}

// REPLACE WITH:
{!collapsed && (
  <p className="px-5 pt-4 pb-0.5 text-[9px] uppercase tracking-[0.12em] text-white/25 font-medium select-none">
    {section.label}
  </p>
)}
{collapsed && <div className="pt-2" />}
```

- [ ] **Step 6: Remove event handlers from `<aside>`**

Find the `<aside>` opening tag and remove `onMouseEnter` and `onMouseLeave`:

```tsx
// REMOVE these two props from <aside>:
onMouseEnter={handleMouseEnter}
onMouseLeave={handleMouseLeave}

// Result — <aside> should look like:
<aside
  className={cn(
    'shrink-0 bg-[hsl(var(--dd-midnight))] flex flex-col h-screen sticky top-0 transition-all duration-300 overflow-hidden',
    collapsed ? 'w-14' : 'w-60'
  )}
>
```

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 8: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "feat: sidebar pill active state, collapse button, section label style (Sprint 1)"
```

---

## Task 3: Layout Top Bar (`src/components/AuthenticatedLayout.tsx`)

**Files:**
- Modify: `src/components/AuthenticatedLayout.tsx`

### Context

Current file is minimal (16 lines). Full replacement. Adds:
- `useAuth` hook for user initials
- `Search` icon from Lucide
- `Link` from React Router
- `NotificationBell` (already imported in the existing file — keep it)
- Top bar `<header>` with search trigger on left, bell + avatar on right
- `.bg-canvas-warm` class on `<main>`

The search button's `onClick` is intentionally a no-op — Ctrl+K search ships in Sprint 7.

---

- [ ] **Step 1: Replace entire file**

Replace the full contents of `src/components/AuthenticatedLayout.tsx` with:

```tsx
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user } = useAuth();

  const initials: string = (() => {
    const fullName = user?.user_metadata?.full_name as string | undefined;
    if (fullName) {
      return fullName
        .split(' ')
        .map((n: string) => n[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return (user?.email ?? 'U').substring(0, 2).toUpperCase();
  })();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="h-12 shrink-0 flex items-center justify-between px-6
                     border-b border-border/40 bg-background/95 backdrop-blur-sm
                     sticky top-0 z-30"
        >
          {/* Search trigger — wired to Ctrl+K in Sprint 7 */}
          <button
            type="button"
            aria-label="Search (⌘K)"
            className="flex items-center gap-2 h-8 w-56 px-3 rounded-lg border
                       border-border text-muted-foreground hover:border-brand-300
                       transition-colors"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-body-sm flex-1 text-left">Search...</span>
            <kbd className="text-caption bg-muted rounded px-1.5 py-0.5 font-mono leading-none">
              ⌘K
            </kbd>
          </button>

          {/* Right: notification bell + user avatar */}
          <div className="flex items-center gap-3">
            <NotificationBell headerMode />
            <Link
              to="/account"
              title="Account settings"
              className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500
                         flex items-center justify-center text-[11px] font-semibold text-white
                         hover:opacity-90 transition-opacity"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page canvas with warm gradient */}
        <main className="flex-1 overflow-y-auto bg-canvas-warm">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/AuthenticatedLayout.tsx
git commit -m "feat: top bar with search trigger + avatar, warm canvas gradient (Sprint 1)"
```

---

## Task 4: DESIGN.md — Document New Tokens

**Files:**
- Modify: `DESIGN.md`

- [ ] **Step 1: Add §35 and §36 to DESIGN.md**

Open `DESIGN.md`. Find the line `*Last updated: 8 May 2026. Update this file before any major UI sprint.*` at the very bottom.

Replace that line with:

```markdown
---

## 35. WARM CANVAS GRADIENT

### 35.1 Token

```css
.bg-canvas-warm {
  background:
    radial-gradient(
      ellipse 65% 50% at 100% 0%,
      oklch(0.95 0.04 50) 0%,
      oklch(0.96 0.03 30) 35%,
      oklch(0.97 0.01 20) 60%,
      oklch(0.97 0 0) 85%
    ),
    hsl(var(--neutral-050));
}
```

### 35.2 Rules

- Apply to `<main>` in `AuthenticatedLayout` only.
- Never on cards, sidebar, top bar, or `<aside>` elements.
- The warm peach-to-cream tone intentionally contrasts with brand blue — do not replace it with a blue gradient.
- Stripped from PDF/print surfaces (§32.6).

---

## 36. BRAND BLUE ANIMATION RULES

All brand-blue animations are purposeful instrument signals, not decoration.

| Class | Purpose | Fires |
|---|---|---|
| `.sidebar-pill-active` | Active nav item tonal fill | Always-on (selected state) |
| `.badge-pulse` | New notification ring | Once per new notification |
| `.progress-animate` | Progress bar grow | Once on first render |
| `.tab-indicator` | Tab underline slide | Once on tab change |

### Rules

- All four classes are defined in `src/index.css` `@layer utilities`.
- `.badge-pulse` must never loop — `animation-iteration-count: 1` is set via `ease-out 1` shorthand.
- `.progress-animate` uses `forwards` fill-mode — the bar stays at its final width after animation.
- All respect `prefers-reduced-motion` via the global override in `@layer base`.

---

## 37. SIDEBAR NAVIGATION v2 (replaces §5.7)

| State | Classes |
|---|---|
| Active item | `sidebar-pill-active border-l-2 border-brand-500 text-white rounded-r-md mr-3` |
| Inactive item | `text-white/55 border-l-2 border-transparent` |
| Inactive hover | `hover:text-white/85 hover:bg-white/5` |

The `border-l-2 border-transparent` on inactive items prevents layout shift when the active border-left appears. The `mr-3` right margin creates the pill shape without full-bleed.

The collapse toggle is a `24×24px` circular button (`rounded-full bg-white/10`) positioned `absolute right-2` in the sidebar header. Always visible — not hover-dependent.

---

*Last updated: 9 May 2026. Update this file before any major UI sprint.*
```

- [ ] **Step 2: Commit**

```bash
git add DESIGN.md
git commit -m "docs: add DESIGN.md §35 canvas gradient, §36 animations, §37 sidebar nav v2 (Sprint 1)"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 2: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:8080/app/dashboard` in browser. Verify:

| Check | Expected |
|---|---|
| Page background | Warm peach-to-cream gradient visible in top-right corner, fading to neutral gray |
| Sidebar active item | Pill fill (faint blue tonal gradient) with 2px brand-500 left accent. NOT a right border. |
| Inactive sidebar items | `border-l-2 border-transparent` keeps left edge aligned with active state |
| Collapse button | Circular white/10 button visible in sidebar header top-right at all times |
| Clicking collapse button | Sidebar shrinks to 56px icon rail; clicking again expands to 240px |
| No hover-collapse | Moving mouse off sidebar does NOT trigger collapse |
| Section labels | "OVERVIEW", "DIAGNOSTIC", "REFERENCE" visible in muted uppercase caps above each group |
| Top bar | `h-12` bar with search trigger (left) + bell + avatar (right) |
| Search trigger | 224px wide button with Search icon + "Search..." + "⌘K" chip |
| Avatar | 28px circle with user initials, links to `/account` |
| Canvas gradient | Present on Dashboard, Results, Assessment, OEM Dashboard — every authenticated route |
| Lovable pages | No visible changes to page content — only background and layout shell changed |

- [ ] **Step 3: Confirm no regressions**

Navigate to each of these routes and confirm they render correctly:
- `/app/dashboard`
- `/app/results`
- `/app/assessment`
- `/app/oem-dashboard` (if OEM account available)
- `/account`
- `/actions`

- [ ] **Step 4: Final commit if any fixup needed**

If any minor tweaks were made during verification:

```bash
git add -p   # stage only the fixup changes
git commit -m "fix: sprint 1 shell verification fixups"
```

---

## Parallel Dispatch Option

Tasks 1, 2, and 3 have **zero shared state** and edit different files. They can be dispatched to three parallel agents simultaneously:

- **Agent 1** → Task 1 (`src/index.css`)
- **Agent 2** → Task 2 (`src/components/AppSidebar.tsx`)
- **Agent 3** → Task 3 (`src/components/AuthenticatedLayout.tsx`)

After all three agents return: run Task 4 (DESIGN.md) and Task 5 (verification) sequentially.

**Constraint for parallel agents:** Each agent must run `npx tsc --noEmit` before committing and report zero errors.
