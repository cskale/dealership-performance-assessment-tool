

## Plan: Always-Visible Context Panel (#46)

Single-file change to `src/components/assessment/QuestionCard.tsx`. Replace the collapsible "Why This Question Matters" accordion with a persistent right-side context panel on desktop, stacked below on mobile. No data, scoring, or save logic touched.

### File modified

| File | Change |
|---|---|
| `src/components/assessment/QuestionCard.tsx` | Restructure root layout into a 2-column grid; convert accordion → persistent panel |

### Layout restructure

Wrap the existing content in a `grid grid-cols-1 md:grid-cols-5 gap-6` container:

- **Left column** (`md:col-span-3` ≈ 60%): Question header (title + description + category badge), rating-scale label, rating tiles, "Selected: X" confirmation, notes button + weight label, notes textarea. **Zero content/style changes** to any of these — only their wrapping parent changes.
- **Right column** (`md:col-span-2` ≈ 40%): New persistent context panel.

### Right column — context panel

Container: `sticky top-4 h-fit rounded-[10px] border border-border bg-muted/40 p-5`.

Panel header: `"Why This Matters"` (uses existing `t('assessment.whyThisMatters')` key) — `text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-4`. No icon, no chevron.

Four conditional sections, rendered in order, each separated by a `border-t border-border` divider (no divider before the first):

1. **Assessment Purpose** — icon `Target` (12px muted) + label (10px uppercase tracking muted) + body (12px foreground, leading-[1.6]). Source: `question.purpose`.
2. **Situation Analysis** — icon `Search` (Lucide) + label + body. Source: `question.situationAnalysis`.
3. **Linked KPIs** — icon `BarChart3` + label + flex-wrap row of pills. Pill: `bg-primary/10 text-primary text-[11px] rounded-[4px] px-2 py-0.5`. Source: `question.linkedKPIs`.
4. **Business Benefits** — icon `TrendingUp` + label + body. Source: `question.benefits`.

Each section: `py-3` vertical padding so dividers visually separate; skip silently when source is null/empty/zero-length.

If all four are empty: render single line `"No context available for this question."` — `text-[12px] text-muted-foreground text-center`.

### Removals

- `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` imports and usage (entire accordion block lines 108–179).
- The trigger `Button` and its chevron/`Award` icon used as the indicator.
- Outer `Card` + `CardContent` wrapper that previously held the accordion (panel uses a plain styled `div`).
- Unused imports after cleanup: `Collapsible*`, and `Award` if no longer used.

### Preserved (no changes)

- `useState` for `showNotes` and `notes` — kept (notes feature is unrelated to the accordion).
- All rating tile styling, "Selected" confirmation, notes textarea, weight badge.
- Category badge, question text, description.
- All `t()` translation keys already in use.

### Imports added

`Search`, `BarChart3` from `lucide-react`. `Target`, `TrendingUp` already imported.

### Responsive behavior

- `md` and above: 2-column grid, sticky panel.
- Below `md`: single column, panel renders below the rating tiles area (natural grid stacking — `grid-cols-1` default). Sticky has no effect on mobile single-column flow.

### Out of scope

- No changes to `Assessment.tsx`, questionnaire data, scoring, signal, or any hook.
- No new props on `QuestionCard`.
- No new translation keys (reuses existing `assessment.whyThisMatters`, `assessment.assessmentPurpose`, `assessment.situationAnalysis`, `assessment.linkedKPIs`, `assessment.businessBenefits`).

### Technical notes

- TypeScript: zero new types; all sources already typed via `Question` interface.
- The "Additional Features" row (notes button + weight label) and notes textarea remain inside the **left column** so they sit directly below the rating interaction, not under the context panel.

