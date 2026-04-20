

## Plan: Three Isolated UI Tasks (#45 · #31 · #48)

Three fully isolated UI changes. No logic files touched. No new packages. All strings localised via the existing `language === 'de' ? ... : ...` pattern already in use.

---

### File path correction

The prompt names `src/components/QuestionCard.tsx`, but the file actually lives at `src/components/assessment/QuestionCard.tsx`. Task 1 will modify the real path. No other file is moved or renamed.

### Files modified

| File | Task | Change |
|---|---|---|
| `src/components/assessment/QuestionCard.tsx` | 1 | Replace coloured rating tiles with neutral white tiles + left-border accent on selected |
| `src/components/results/ScoreDecomposition.tsx` | 2 | **CREATE** — stacked bar + legend |
| `src/components/ExecutiveSummary.tsx` | 2 | Add import + render `<ScoreDecomposition>` directly under the Diagnostic Narrative card |
| `src/pages/Dashboard.tsx` | 3 | Add empty-state onboarding panel rendered when no assessments exist |

---

### Task 1 — Neutral question tiles (#45)

**File:** `src/components/assessment/QuestionCard.tsx`

The current tiles are already mostly neutral (no red/yellow/green hardcoded — they use `border-l-primary` already). However, the selected state needs to match the spec exactly, and content layout needs adjustment so the **scale label is dominant** and the **number is the small secondary label above it**.

Replace the `<button>` block (lines ~74-95) with:

- **Unselected tile:** `bg-background border border-border rounded-[8px] hover:border-primary/30 hover:bg-muted/40 transition-all duration-150`
- **Selected tile:** `bg-primary/[0.04] border border-primary/30 border-l-[3px] border-l-primary rounded-[8px]`
- **Padding:** `px-4 py-3` (12px 16px)
- **Content layout (top → bottom, left-aligned):**
  - Number: `text-[11px] font-mono text-muted-foreground` (DM Mono is the project mono token)
  - Scale label: `text-[13px] font-medium text-foreground` — dominant
- **Layout grid:** keep existing `grid grid-cols-1 sm:grid-cols-5 gap-3` (already responsive). Per spec: "match existing layout logic" — preserved.
- **Removed:** centered alignment (`items-center`), the `tabular-nums` number-as-hero styling, the rating-summary card below the grid (the "Selected: X — label" block) is kept as-is since it's not colour-coded.

No other changes to the file. The `getWeightLabel` helper, notes section, context expander, and `onChange` handler remain untouched.

---

### Task 2 — Score decomposition (#31)

**Create:** `src/components/results/ScoreDecomposition.tsx`

```text
Props: { scores: Record<string, number>; overallScore: number }
```

**Hardcoded weights** (per spec, no import from scoringEngine):
```ts
const WEIGHTS = { 'new-vehicle-sales': 0.25, 'used-vehicle-sales': 0.20,
  'service-performance': 0.20, 'financial-operations': 0.20, 'parts-inventory': 0.15 };
```

**Department colours** (HSL per spec):
- NVS `hsl(217 91% 60%)`, UVS `hsl(263 70% 63%)`, Service `hsl(160 84% 39%)`, Financial `hsl(38 92% 50%)`, Parts `hsl(215 16% 47%)`

**Layout:**
1. Section header: `text-[11px] uppercase tracking-wider text-muted-foreground` — text "Score Breakdown" / "Punkteverteilung"
2. Stacked bar: `relative h-7 w-full rounded-[6px] bg-muted overflow-hidden flex` — each segment is a `<div>` with inline `width` = `(score * weight)` % and inline `backgroundColor` = dept token, separated by `border-r border-white` (1px gap)
3. Legend: `flex flex-wrap gap-4 mt-3 text-[12px]` — each item: 8px coloured dot + dept name + `score ×weight% = (score×weight/100).toFixed(1)pts`
4. Tooltip: shadcn `<Tooltip>` wrapping each segment — content shows `Department — Score: X · Weight: Y% · Contribution: Z pts`
5. Wrapped in a Card to match other Executive Summary sections (matching existing visual rhythm).

Department display names use existing `getDepartmentName(dept, language)` helper from `@/lib/departmentNames`.

**Modify:** `src/components/ExecutiveSummary.tsx`

- Add import: `import { ScoreDecomposition } from "@/components/results/ScoreDecomposition";`
- Add prop wiring: `ExecutiveSummary` already receives `overallScore` and `scores` — no new props needed.
- Render placement: directly **after** the Diagnostic Narrative card (after line ~278, before `<DepartmentHeatmap>`). The spec says "below the overall score ring and above the executive narrative paragraph" — but the score ring lives in the parent `Results.tsx` (which is read-only and untouchable), and inside `ExecutiveSummary` the first content block is the narrative. Placing it immediately after the narrative card keeps it as the first visible breakdown right under the score ring rendered by `Results.tsx` above. This is the closest legal position to the spec without touching `Results.tsx`.

Single-line insertion:
```tsx
<ScoreDecomposition scores={scores} overallScore={overallScore} />
```

---

### Task 3 — Dashboard empty state (#48)

**File:** `src/pages/Dashboard.tsx`

The current Dashboard renders **static sample KPI data** with no real assessment query. There is no existing `assessments.length === 0` check. Approach:

1. Add a lightweight Supabase query at the top of the component using the existing `useAuth` hook + supabase client (already imported elsewhere in the project — same pattern used in other dashboard-style pages). Query: `select id from assessments where user_id = auth.uid() limit 1` to determine empty state. Store as `hasAssessments: boolean | null` (null = loading).
2. While `hasAssessments === null`: render existing dashboard (no flash).
3. When `hasAssessments === false`: render the **onboarding panel only**, replacing the entire `<main>` content (keep the context bar above it untouched so global navigation still works, but the empty-state panel takes over the main content area).
4. When `hasAssessments === true`: render existing dashboard exactly as today — zero changes.

**Onboarding panel structure** (centred card, `max-w-[640px] mx-auto`, `p-10 px-12`, `border rounded-[12px] bg-card`):

- **Hero:** `text-[20px] font-semibold` headline + `text-[14px] text-muted-foreground mt-2` sub-text
- **Three benefit columns:** `grid grid-cols-1 md:grid-cols-3 gap-6 mt-8` — each: Lucide icon (`TrendingUp` / `Target` / `FileText`) at 20px, primary colour, then 13px medium heading, then 12px muted description
- **Checklist heading:** `text-[12px] uppercase tracking-wider text-muted-foreground mt-8` — "Before you start, have these to hand:" / "Vor dem Start — halten Sie folgendes bereit:"
- **Checklist:** 5 items, each `<CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />` + `text-[13px]`
- **CTA:** `<Button size="lg" className="w-full mt-8" onClick={() => navigate('/app/assessment')}>` — "Begin Assessment" / "Bewertung starten"
- **Footer line:** `text-[11px] text-muted-foreground text-center mt-2` — "Takes approximately 25–30 minutes" / "Dauer ca. 25–30 Minuten"

Route confirmed: `/app/assessment` is the canonical start-assessment route (used by 8+ existing components).

All strings use the inline `language === 'de' ? '...' : '...'` pattern already used throughout `Dashboard.tsx` (e.g., the Preview banner block, lines 154-159).

---

### Out of scope / explicitly NOT touching

- `signalEngine.ts`, `scoringEngine.ts`, `ceilingAnalysis.ts`, `narrativeTemplates.ts`, `actionTemplatesTiered.ts`, `crossValidationRules.ts`
- `Results.tsx`, `useMultiTenant.tsx`, `useActiveRole.tsx`
- Any Supabase migration
- No existing logic in `QuestionCard.tsx`, `ExecutiveSummary.tsx`, `Dashboard.tsx` is refactored — only the changes above

### Technical notes

- Zero new packages
- Zero new i18n keys (uses inline `language ===` ternaries to match the existing Dashboard pattern; ExecutiveSummary's section header for ScoreDecomposition follows the same inline pattern already used elsewhere in the file)
- TypeScript: ScoreDecomposition typed strictly, no `any`
- Mobile: ScoreDecomposition legend wraps; Dashboard onboarding benefit grid stacks 1-col below `md`

