

## Further UX/UI Improvements — DESIGN.md Compliance Audit

After reviewing the codebase against DESIGN.md, here are the remaining violations that can be fixed without touching Claude Code-owned files.

---

### Task 1: HeroSection — Remove anti-patterns (§14, §2.5, §7.2)

**File:** `src/components/Home/HeroSection.tsx`

**Violations:**
- Purple gradient background (`from-purple-600 via-purple-700 to-blue-600`) — §14 explicitly bans "Purple gradients on white" as a SaaS cliche
- Emoji in badge text (`🔬`) — §14 bans "Emoji in component UI"
- `animate-pulse` on background blobs — §7.2 bans bounce/spin/pulse on non-loading elements
- CTA button uses `text-purple-700` — should use brand tokens

**Changes:**
- Replace purple gradient with brand-blue gradient (`from-[hsl(var(--brand-700))] to-[hsl(var(--brand-500))]`)
- Replace emoji with Lucide `FlaskConical` icon (already imported but unused)
- Remove `animate-pulse` from background blobs, use static opacity
- CTA button text color: `text-primary` instead of `text-purple-700`

---

### Task 2: KPIExplorer heading — Use type scale (§3.2)

**File:** `src/components/kpi-encyclopedia/KPIExplorer.tsx`

**Violation:** Heading uses raw `text-xl sm:text-2xl font-bold` instead of design system class.

**Change:** Replace with `text-h3` (24px/32px bold) which is the correct class for card/section headings.

---

### Task 3: Dashboard icon sizes — Match §8.2

**File:** `src/pages/Dashboard.tsx`

**Violation:** Section header icons use `h-5 w-5` (20px). §8.2 specifies card headers should use `size-4` (16px).

**Change:** Update `SectionHeader` icon container and the icons passed to it from `h-5 w-5` to `h-4 w-4`.

---

### Task 4: Results page typography — Use design system classes

**File:** `src/pages/Results.tsx`

**Violations:**
- Score card uses raw `text-[32px] font-semibold` instead of `.text-metric-lg`
- Label uses raw `text-[10px] uppercase` instead of `.text-caption`
- Page title uses raw `text-[22px]` instead of `.text-h3`

**Changes:** Replace raw sizing with design system utility classes (`text-metric-lg`, `text-caption`, `text-h3`).

---

### Task 5: SmartAssistant dialog — Typography alignment

**File:** `src/components/SmartAssistant.tsx`

Quick pass to ensure dialog content uses `text-body-md` for tips and `text-h5` for section labels instead of raw sizes.

---

### Summary

| # | File | Issue | DESIGN.md Section |
|---|------|-------|-------------------|
| 1 | HeroSection | Purple gradient, emoji, pulse animation | §14, §2.5, §7.2 |
| 2 | KPIExplorer | Raw heading sizes | §3.2 |
| 3 | Dashboard | Oversized icons | §8.2 |
| 4 | Results.tsx | Raw typography on score cards | §3.2, §3.3 |
| 5 | SmartAssistant | Raw text sizes | §3.2 |

All changes are visual styling only. No data logic, routing, or Claude Code-owned files are modified.

