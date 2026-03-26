

## Production Bug Fixes — 8 Issues

### Constraint check

Per the collaborative development boundary, these files are **read-only** and cannot be modified by this agent:
- `src/components/ActionPlan.tsx` — blocks Issue 5 (color legend) and Issue 6 (generate button removal)
- `src/pages/Assessment.tsx` — blocks Issue 7 (sidebar → horizontal strip)

These 3 issues must be handled by Claude Code. The remaining **5 fixes** can proceed now.

---

### Files to modify

| # | File | Issue |
|---|---|---|
| 1–2 | `src/pages/Account.tsx` | Profile polish + tag casing |
| 3 | `src/components/IndustrialKPIDashboard.tsx` | Remove yellow Strategic Recommendations box |
| 4 | `src/components/action-plan/OwnerLoadPanel.tsx` | Fix scroll leak on Owner Workload panel |
| 8 | `src/components/ExportPDFModal.tsx` | Fix clipped Export PDF modal |

---

### Fix 1 & 2 — Profile polish + consistent tag casing (`Account.tsx`)

**Tag casing (line 301):** The role badge renders `{currentMembership?.role || 'member'}` raw from the database (lowercase "owner"). Fix by capitalizing: replace with a helper that does `role.charAt(0).toUpperCase() + role.slice(1)`.

Apply the same capitalisation to line 297 (`{currentMembership?.role} · {user.email}`).

**Profile polish:**
- Avatar: increase from `w-16 h-16` → `w-20 h-20`, text from `text-xl` → `text-2xl`
- Name: increase from `text-lg` → `text-xl font-semibold`
- Stats cards: increase value text from `text-xl` → `text-2xl font-semibold`
- Hero card padding: `p-5` → `p-6`

### Fix 3 — Remove Strategic Recommendations (`IndustrialKPIDashboard.tsx`)

Delete lines 252–286 (the entire `Card` with `bg-warning/10` that renders the yellow "Strategic Recommendations" box). The content is generic filler and illegible due to poor contrast.

### Fix 4 — Owner Workload scroll fix (`OwnerLoadPanel.tsx`)

Add a `useEffect` that sets `document.body.style.overflow = 'hidden'` when `open` is true and restores it on close/unmount. This prevents the background page from scrolling while the modal is open.

Add `import { useEffect }` alongside the existing `useMemo` import.

### Fix 8 — Export PDF modal clipping (`ExportPDFModal.tsx`)

**Line 131:** Change `sm:max-w-md overflow-hidden` → `sm:max-w-lg` (remove `overflow-hidden`, widen the dialog).

**Line 184:** Add `flex-wrap` to `DialogFooter` so buttons wrap on narrow screens instead of being clipped.

---

### Blocked issues (require Claude Code)

| Issue | File | Action needed |
|---|---|---|
| 5 — Color legend | `ActionPlan.tsx` | Add priority color legend row below toolbar |
| 6 — Generate button | `ActionPlan.tsx` | Remove manual "Generate Actions" button and related dialog |
| 7 — Assessment sidebar | `Assessment.tsx` | Replace sidebar with horizontal section strip |

