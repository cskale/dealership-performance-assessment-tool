

## Plan: Executive Summary Polish (#32 · #29 · #33)

Three visual-polish changes to components inside Executive Summary. No engine logic touched. No new packages. No new data sources — all data comes from hooks already wired in `ExecutiveSummary.tsx`.

### Files modified

| File | Task | Change type |
|---|---|---|
| `src/components/results/DepartmentHeatmap.tsx` | 1 | Re-purpose to a 5×5 dept × root-cause grid (visual + cell-derivation rewrite) |
| `src/components/results/CausalChainDiagram.tsx` | 2 | Visual refinement — pill chain, dimension icons, implication line, empty state |
| `src/components/ExecutiveSummary.tsx` | 3 + ordering | Refactor inline systemic-pattern cards to match spec; reorder JSX |

### Important note on the heatmap (read first)

The current `DepartmentHeatmap.tsx` renders a **dept × KPI** grid (Volume, Conversion, etc.). The spec describes a **dept × root-cause-dimension** grid (People · Process · Tools · Structure · Incentives). These are two different views. The spec wins — Task 1 replaces the KPI grid with the root-cause grid.

The component receives `scores` and `answers` props (already wired by `ExecutiveSummary.tsx`). The spec mentions a `subCategoryData` prop that does not currently exist. Rather than change the prop interface (forbidden), the component will **derive root-cause dimension scores internally** from `answers` using the existing `SIGNAL_MAPPINGS` lookup (the same source `CausalChainDiagram` already uses). This keeps the prop contract stable and avoids touching `ExecutiveSummary.tsx`'s data wiring.

---

### Task 1 — Dept × Root-Cause Heatmap (#32)

**File:** `src/components/results/DepartmentHeatmap.tsx` — full rewrite of render + cell derivation, props unchanged (`{ scores, answers }`).

**Cell derivation (replaces existing `DEPT_KPIS` block):**

For each `(department, dimension)` pair:
1. Find all questions in that department whose `SIGNAL_MAPPINGS` entry has `rootCauseDimension === dimension`
2. Average the answered values (1–5 scale), normalise to 0–100: `Math.round(((avg - 1) / 4) * 100)`
3. If no answered questions in that intersection → `null` (not 0)

Result: 5 columns (NVS · UVS · SVC · FIN · PTS) × 5 rows (People · Process · Tools · Structure · Incentives).

**Colour bands** (4-band diverging, no gradients):
- 0–44 → `hsl(0 72% 51%)` "Critical"
- 45–64 → `hsl(38 92% 50%)` "Developing"
- 65–79 → `hsl(213 97% 55%)` "Progressing"
- 80–100 → `hsl(160 84% 39%)` "Strong"
- `null` → `hsl(var(--muted))` with `—` label

**Cells:** equal-width columns, equal-height rows, min-height 44px, padding 4px. Score centred, 12px white font-weight 500. On widths < 48px hide the number (use Tailwind `text-[0]` at the small breakpoint and re-show in tooltip).

**Column headers:** `NVS · UVS · SVC · FIN · PTS` — 11px uppercase tracking-wider muted, with a 6px coloured dot before each abbreviation using the canonical dept colours (NVS `hsl(217 91% 60%)`, UVS `hsl(263 70% 63%)`, SVC `hsl(160 84% 39%)`, FIN `hsl(38 92% 50%)`, PTS `hsl(215 16% 47%)` — same as `ScoreDecomposition`).

**Row headers:** Full dimension names (`People · Process · Tools · Structure · Incentives`), 12px foreground font-weight 500, left-aligned, min-width 80px. German labels via the existing `DIMENSION_LABELS` style (added inline in this file).

**Tooltip** (shadcn `<Tooltip>`): `"<Department full name> — <Dimension> — <Score> — <Band label>"`.

**Section header:** `"Performance Dimensions"` / `"Leistungsdimensionen"` — 11px uppercase tracking-wider muted (replaces the existing `t('results.kpiMatrix.title')` CardTitle for consistency with other section headers in ExecutiveSummary).

**Legend:** Below grid, single row of four 10px coloured squares + band label + range, 11px muted.

**Empty state:** If every cell is `null`, render a single line `"Sub-category data unavailable for this assessment."` (DE: `"Unterkategorie-Daten für diese Bewertung nicht verfügbar."`) — 13px muted centred. No crash.

**Removed:** the entire `DEPT_KPIS` constant block, `getBenchmarkBand`, the existing `getScoreBand` (replaced with the 4-band scale above), and the KPI-name column-header rotation logic.

---

### Task 2 — Causal Chain Diagram (#29)

**File:** `src/components/results/CausalChainDiagram.tsx` — visual rewrite of the chain rendering. Chain-grouping logic in `useMemo` is preserved as-is (still groups signals by shared `rootCauseDimension`).

**Section header:** `"Shared Root Causes"` / `"Gemeinsame Ursachen"` — 11px uppercase tracking-wider muted (replaces current CardTitle text).

**Per-chain card layout:**
1. **Header row:** Lucide icon (16px) + dimension label (14px font-weight 600). Icon mapping: People→`Users`, Process→`GitBranch`, Tools→`Wrench`, Structure→`Building2`, Incentives→`TrendingUp`.
2. **Pill chain:** horizontal flex row of department pills separated by `→` (12px muted). Pill style: bg = dept colour @ 10% opacity, border = dept colour @ 40% opacity, text = dept colour, abbreviated name (NVS/UVS/SVC/FIN/PTS), 11px, `rounded-[20px] px-2.5 py-[3px]`. Dept colours match Task 1 / ScoreDecomposition.
3. **Implication line:** one sentence per dimension, 12px muted. Hardcoded EN/DE templates (5 dimensions × 2 languages = 10 strings) inside the component using the existing `language === 'de' ? ... : ...` pattern.

**Empty state** (when `chains.length === 0`): single muted card with `CheckCircle2` (20px green) and `"No systemic patterns detected — department issues appear isolated."` / `"Keine systemischen Muster erkannt — Abteilungsprobleme erscheinen isoliert."` — 13px. Soft green border (`border-success/30 bg-success/5`).

**Max chains:** 3 (already enforced by `slice(0, 2)` + show-more — switch to `slice(0, 3)` and remove the show-more toggle since spec caps at 3).

**Removed:** the `DEPT_COLORS` Tailwind class map (replaced with inline HSL via `style={{ backgroundColor, borderColor, color }}`), the SVG arrows (replaced with `→` glyph), the `SIGNAL_LABELS` block (no longer rendered — chains now display by dimension, not by signal label), the show-more toggle, the mobile vertical-arrow SVG block.

---

### Task 3 — Systemic Pattern Cards (#33)

**File:** `src/components/ExecutiveSummary.tsx` lines 378–415 only. No data logic, no hook changes.

**Section header:** `"Systemic Patterns"` / `"Systemische Muster"` — 11px uppercase tracking-wider muted (replaces the current `<p>Systemic Issues Detected</p>`).

**Card variants:**
- `severity === 'systemic'`: `border-l-[3px]` with `style={{ borderLeftColor: 'hsl(0 72% 51%)', backgroundColor: 'hsl(0 72% 51% / 0.04)' }}`. Badge `"Systemic"` — red bg, white text, 10px.
- `severity === 'recurring'`: `border-l-[3px]` with amber HSL `38 92% 50%`. Badge `"Recurring"` — amber bg, white text, 10px.

**Card content:**
1. Top row: badge + signal title (13px font-weight 500). Title derived from existing `p.signalCode` via the existing capitalisation logic — kept.
2. Affected-departments row: pills using the **same pill style as Task 2** (dept colour @ 10% bg / 40% border / full text, abbreviated name, rounded-[20px]). Replaces the current `Badge variant="outline"` rendering.
3. Description: `p.description` from the pattern object (already populated by `detectSystemicPatterns`). Fallback string only used if `!p.description`: `"This signal appears across multiple departments, suggesting a structural cause rather than isolated execution."` / DE equivalent. 12px muted.

**Visibility:** Already gated by `systemicPatterns.length > 0` — keep. Header hides with section.

**No truncation** — render all patterns as-is.

---

### JSX ordering inside ExecutiveSummary.tsx

Reorder only — no logic changes. Target order:

1. Diagnostic Narrative (existing — lines 263–279) — unchanged
2. **Score Decomposition** (line 282) — unchanged
3. **Department Heatmap** (line 285) — unchanged position
4. **Causal Chain Diagram** (line 288) — unchanged position
5. **Systemic Pattern Cards** (currently line 378) — **move up** to sit immediately after CausalChainDiagram
6. Department Performance score cards (lines 291–328) — moves down after systemic patterns
7. Top Findings (lines 331–376) — unchanged relative order
8. CeilingInsightsPanel (line 418) — unchanged

Per the spec ("Score Decomposition → Department Heatmap → Shared Root Causes → Systemic Pattern Cards → Executive narrative paragraph"), the existing diagnostic narrative card is treated as the "executive narrative paragraph" and stays at the top (the spec says it's "already placed — do not move"). Items 6–8 (department score cards, top findings, ceiling insights) are not addressed by the spec and remain after the polished section in their existing relative order.

---

### Out of scope

- No changes to `signalEngine.ts`, `scoringEngine.ts`, `narrativeTemplates.ts`, `ceilingAnalysis.ts`, `signalMappings.ts`, `kpiDefinitions.ts`, `moduleGating.ts`, `Results.tsx`, `useMultiTenant.tsx`, `useActiveRole.tsx`, `ScoreDecomposition.tsx`
- No new packages
- No prop interface changes to `DepartmentHeatmap` or `CausalChainDiagram`
- No `useMemo` computation logic changes — only the cell-derivation block in DepartmentHeatmap (visual repurposing) is rewritten, and that block is presentation-side derivation, not engine logic

### Technical notes

- All new strings inline-localised via `language === 'de' ? '...' : '...'` (matches existing pattern in these files)
- Dept colours hardcoded as inline HSL strings to keep parity with `ScoreDecomposition.tsx`
- All Lucide icons (`Users`, `GitBranch`, `Wrench`, `Building2`, `TrendingUp`, `CheckCircle2`) are tree-shaken individual imports
- TypeScript: no `any`; existing `RootCauseDimension` and `Signal` types reused

