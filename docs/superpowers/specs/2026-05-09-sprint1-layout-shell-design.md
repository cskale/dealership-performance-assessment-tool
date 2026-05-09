# Sprint 1: Layout Shell Redesign
**Date:** 2026-05-09
**Status:** Approved — ready for implementation
**Owner:** Claude Code
**Scope:** 3 files only — `src/index.css`, `src/components/AppSidebar.tsx`, `src/components/AuthenticatedLayout.tsx`

---

## Context

Part of the 7-sprint Leapsome-style quality bar raise across the full product.
Sprint 1 is the foundation — every subsequent Lovable sprint builds on this shell.
No page content, routing, Supabase queries, or assessment logic is touched.

Reference screenshots: Leapsome dashboard, profile, goals, learning, analytics pages.
Key insight: The shell earns trust before a single pixel of content renders.

---

## Goals

1. Apply warm canvas gradient to every authenticated page's background.
2. Upgrade sidebar: pill active state, always-visible collapse toggle, section labels, taller logo area.
3. Upgrade top bar: search trigger (⌘K), user avatar link, richer height.
4. Add brand-blue animation utilities: pill gradient, badge pulse, progress grow, tab slide.
5. Apply correct negative heading tracking (already in DESIGN.md §17.3, needs CSS application).

---

## What Does NOT Change

- No routing or navigation logic
- No Supabase queries
- No assessment / scoring engine files
- No Lovable-owned files (RadarBenchmarkChart, KanbanBoard, FreshnessBadge)
- No page-level components (Dashboard, Results, Assessment, OemDashboard, CoachDashboard)
- No shadcn `src/components/ui/` files
- TypeScript must compile with zero errors after changes
- No new npm packages

---

## File 1: `src/index.css`

### 1a. Warm Canvas Gradient Utility

Add to `@layer utilities` block:

```css
/* Warm canvas gradient — DESIGN.md §35
   Apply to <main> in AuthenticatedLayout. NOT on cards or sidebar. */
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

### 1b. Brand Blue Animation Utilities — DESIGN.md §36

Add to `@layer utilities` block:

```css
/* Sidebar active pill — tonal gradient fill */
.sidebar-pill-active {
  background: linear-gradient(
    135deg,
    hsl(var(--brand-500) / 0.15) 0%,
    hsl(var(--brand-500) / 0.07) 100%
  );
}

/* Notification badge pulse — fires once on new notification arrival */
@keyframes badgePulse {
  0%   { box-shadow: 0 0 0 0   hsl(var(--destructive) / 0.5); }
  70%  { box-shadow: 0 0 0 6px hsl(var(--destructive) / 0); }
  100% { box-shadow: 0 0 0 0   hsl(var(--destructive) / 0); }
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
  to   { opacity: 1; transform: scaleX(1); }
}
.tab-indicator {
  animation: tabSlide 120ms ease-out forwards;
  transform-origin: left center;
}

/* Reduced motion overrides — already in base layer, these utilities respect it */
```

### 1c. Heading Tracking (DESIGN.md §17.3 — already specified, needs applying)

Update the existing `.text-h1` through `.text-h4` in `@layer utilities`:

```css
.text-h1 {
  @apply text-[32px] leading-[40px] font-extrabold;
  letter-spacing: -0.030em;
  font-optical-sizing: auto;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "cv01" 1, "cv02" 1;
}
.text-h2 {
  @apply text-[28px] leading-[36px] font-bold;
  letter-spacing: -0.025em;
  font-optical-sizing: auto;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "cv01" 1, "cv02" 1;
}
.text-h3 {
  @apply text-[24px] leading-[32px] font-bold;
  letter-spacing: -0.015em;
}
.text-h4 {
  @apply text-[20px] leading-[28px] font-bold;
  letter-spacing: -0.010em;
}
```

> Note: These classes already exist — update their `letter-spacing` and add `font-optical-sizing`. Do not change the `@apply` font-size/line-height values.

---

## File 2: `src/components/AppSidebar.tsx`

Four targeted changes. No logic, hooks, routing, or data fetching touched.

### 2a. Logo / Brand Header Area

Replace the current compact logo area with a taller `h-14` header:

```tsx
{/* Logo area — h-14 with bottom rule */}
<div className={cn(
  'flex items-center gap-2.5 h-14 border-b border-white/[0.06] shrink-0 relative',
  collapsed ? 'px-3 justify-center' : 'px-5'
)}>
  <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
    <span className="text-white font-bold text-sm leading-none">D</span>
  </div>
  {!collapsed && (
    <span className="text-[13px] font-semibold text-white tracking-tight">
      Dealer Diagnostic
    </span>
  )}
  {/* Collapse toggle — always visible */}
  <button
    onClick={() => setCollapsed(!collapsed)}
    className={cn(
      'absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/10',
      'flex items-center justify-center hover:bg-white/20 transition-colors',
      collapsed ? 'right-1/2 translate-x-1/2 mt-px' : 'right-3'
    )}
    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {collapsed
      ? <ChevronRight className="h-3 w-3 text-white/60" />
      : <ChevronLeft  className="h-3 w-3 text-white/60" />}
  </button>
</div>
```

Add `ChevronLeft` and `ChevronRight` to the lucide-react import if not already present.

### 2b. Active Nav Item — Pill Replaces Border

Replace the existing active/inactive className logic:

```tsx
// Before (border-based):
// className="bg-brand-500/10 border-r-2 border-brand-500 text-white"

// After (pill-based):
const navItemClass = (path: string) => {
  const isActive = location.pathname === path ||
    (path !== '/app/dashboard' && location.pathname.startsWith(path));
  return cn(
    'flex items-center gap-2.5 px-3 h-9 rounded-r-md transition-colors duration-100',
    'mx-0 mr-3',           // pill extends to right edge minus 12px margin
    isActive
      ? 'sidebar-pill-active border-l-2 border-brand-500 text-white'
      : 'text-white/55 hover:text-white/85 hover:bg-white/5 border-l-2 border-transparent'
  );
};
```

The `border-l-2 border-transparent` on inactive items maintains layout stability so the pill left-border doesn't cause a shift on hover.

### 2c. Section Group Labels

Above each group of nav items, add a label (hidden when collapsed):

```tsx
{!collapsed && section.label && (
  <p className="px-5 pt-4 pb-0.5 text-[9px] uppercase tracking-[0.12em] text-white/25 font-medium select-none">
    {section.label}
  </p>
)}
{collapsed && <div className="pt-2" />}
```

The existing `section.label` value from the nav config is used directly. No new data needed.

### 2d. Remove the Hover-Triggered Collapse

The current sidebar collapses on `onMouseLeave` with a timer. Replace this with the always-visible collapse button from 2a. Remove the `handleMouseLeave`, `handleMouseEnter`, and `collapseTimer` refs/logic entirely. `collapsed` state remains, driven only by the button click.

---

## File 3: `src/components/AuthenticatedLayout.tsx`

Two changes: richer top bar and canvas gradient on `<main>`.

### 3a. Full Replacement

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

  const initials = user?.email
    ? user.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header className="h-12 shrink-0 flex items-center justify-between px-6
                           border-b border-border/40 bg-background/95
                           backdrop-blur-sm sticky top-0 z-30">

          {/* Search trigger */}
          <button
            type="button"
            className="flex items-center gap-2 h-8 w-56 px-3 rounded-lg
                       border border-border text-muted-foreground
                       hover:border-brand-300 transition-colors"
            onClick={() => {/* Ctrl+K search — Sprint 7 */}}
            aria-label="Search (⌘K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-body-sm flex-1 text-left">Search...</span>
            <kbd className="text-caption bg-muted rounded px-1.5 py-0.5 font-mono leading-none">
              ⌘K
            </kbd>
          </button>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-3">
            <NotificationBell headerMode />
            <Link
              to="/account"
              className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500
                         flex items-center justify-center text-[11px] font-semibold text-white
                         hover:opacity-90 transition-opacity"
              title="Account settings"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Content canvas with warm gradient */}
        <main className="flex-1 overflow-y-auto bg-canvas-warm">
          {children}
        </main>

      </div>
    </div>
  );
}
```

---

## DESIGN.md Updates Required

After implementation, add the following to DESIGN.md:

**§35 Warm Canvas Gradient** — `.bg-canvas-warm` token definition and rules:
- Apply to `<main>` in AuthenticatedLayout only
- Never on cards, sidebar, or top bar
- Stripped from PDF/print surfaces

**§36 Brand Blue Animation Rules** — full list of permitted brand-blue animations:
- `.sidebar-pill-active` — pill fill gradient
- `.badge-pulse` — one-time notification ring
- `.progress-animate` — bar grow on first render
- `.tab-indicator` — sliding underline

**Update §5.7 Sidebar Navigation** — replace border-based active state with pill spec.

---

## Acceptance Criteria

- [ ] `npx tsc --noEmit` — zero errors
- [ ] Warm peach-to-cream gradient visible top-right on every `/app/*` route
- [ ] Sidebar active item shows pill fill + 2px brand-500 left accent, NOT right border
- [ ] Collapse button always visible (circular, top-right of sidebar header)
- [ ] Sidebar section labels visible when expanded, hidden when collapsed
- [ ] Top bar shows search trigger (56px wide, ⌘K chip) + bell + avatar
- [ ] Avatar navigates to `/account` on click
- [ ] No changes to any page content, routing, or data logic
- [ ] No Lovable-owned files modified
