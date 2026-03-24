

## Implementable DESIGN.md Tasks (UI Components Only)

Based on cross-referencing DESIGN.md specifications against the current codebase, here are tasks that can be implemented without touching Claude Code-owned files.

---

### Task 1: QuestionCard — Neutral Tile Pattern (§5.3, §14 Anti-Pattern Fix)

**File:** `src/components/assessment/QuestionCard.tsx`

**Current state:** Answer options render as `<Button>` components with full primary-colored backgrounds when selected. This is the #1 anti-pattern listed in DESIGN.md §14: "Red/yellow/green coloured answer buttons → Anchoring bias."

**Target state per DESIGN.md:**
- Unselected: `border border-border bg-white hover:bg-muted/20`, plain tile with score number + label
- Selected: `border-l-4 border-l-primary border border-primary/30 bg-primary/5`, label in `text-body-md font-medium`, score in `text-label text-primary`
- No colored backgrounds on unselected tiles — color appears only on the selected tile's left border

**Changes:**
- Replace the `<Button>` grid with `<button>` tiles using the neutral/selected pattern
- Remove `text-2xl font-bold` score number — use `text-body-md` for label, `text-label` for score
- Selected value display below can stay but should use `bg-primary/5` not `bg-primary/10`

---

### Task 2: SharedStatusBadge — Match §5.8 Spec

**File:** `src/components/shared/SharedStatusBadge.tsx`

**Current state:** Uses custom size classes (`text-[10px] px-1.5 py-0`), no status dot.

**Target per DESIGN.md §5.8:**
- Always: `rounded-full px-2.5 py-0.5 text-label inline-flex items-center gap-1.5`
- Status dot: `w-1.5 h-1.5 rounded-full bg-current` before the label text
- Colors: Done=`bg-success/10 text-success border-success/20`, Partial=`bg-warning/10`, Pending=`bg-info/10`, Blocked=`bg-destructive/10`

**Changes:**
- Update size classes to match spec
- Add a colored status dot circle before the text label
- Remove the Lucide icon option (or keep as fallback) — the dot is the primary indicator

---

### Task 3: SharedEmptyState — Match §12 Spec

**File:** `src/components/shared/SharedEmptyState.tsx`

**Current state:** Icon in a small 12×12 box, heading uses `text-sm`, description uses `text-xs`. Undersized relative to spec.

**Target per DESIGN.md §12:**
- Icon: `size-8` (32px), `neutral-400` color — not in a box
- Headline: `.text-h4` (20px bold)
- Description: `.text-body-md text-muted-foreground`
- CTA button slot (already exists as `action` prop)

**Changes:**
- Increase icon to `h-8 w-8 text-muted-foreground` without the surrounding box
- Heading → `text-h4`
- Description → `text-body-md text-muted-foreground max-w-md`

---

### Task 4: Typography Audit on ExecutiveSummary

**File:** `src/components/ExecutiveSummary.tsx`

Quick audit to replace raw Tailwind sizes with design system utility classes where mismatched:
- Score numbers should use `.text-metric-lg` with `tabular-nums`
- Department labels should use `.text-label uppercase tracking-wider`
- Section headings inside the panel should max at `.text-h3`

---

### Summary

| # | Component | DESIGN.md Section | Scope |
|---|-----------|------------------|-------|
| 1 | QuestionCard | §5.3, §14 | Replace colored buttons with neutral tiles + left-border selection |
| 2 | SharedStatusBadge | §5.8 | Status dot, rounded-full, correct sizing |
| 3 | SharedEmptyState | §12 | Larger icon/heading per spec |
| 4 | ExecutiveSummary | §3.2, §3.3 | Typography class alignment |

All changes are purely visual styling within `src/components/`. No data logic, routing, or Claude Code-owned files are touched.

