

## Plan: Advanced Visualizations & Ceiling Insights Rendering

### Constraint Check

Per the collaborative development boundary, these files are **read-only**:
- `src/pages/Assessment.tsx` — **Feature 4 (business model branching) is BLOCKED**
- `src/data/questionnaire.ts` — **Feature 4 is BLOCKED**
- `src/lib/scoringEngine.ts`, `src/lib/signalEngine.ts` — cannot modify

**Feature 4 must be handled via Claude Code.** This plan covers Features 1, 2, and 3 only.

---

### Files to Create

| File | Purpose |
|---|---|
| `src/components/results/DepartmentHeatmap.tsx` | 5×5 KPI heatmap grid |
| `src/components/results/CausalChainDiagram.tsx` | Root-cause causal chain flow |
| `src/components/results/CeilingInsightsPanel.tsx` | Ceiling analysis cards (extracted from ExecutiveSummary) |

### Files to Modify

| File | Change |
|---|---|
| `src/components/ExecutiveSummary.tsx` | Insert heatmap, causal chain, and ceiling panel components above/below existing sections |
| `src/i18n/en.json` | Add i18n keys for all new UI strings |
| `src/i18n/de.json` | Add German translations |
| `src/contexts/LanguageContext.tsx` | Add matching translation keys |

---

### Feature 1 — 5×5 Department KPI Heatmap

**Component:** `DepartmentHeatmap.tsx`

**Data source:** Uses `scores` (department-level) and `answers` (question-level) props. Maps each department's questions to 5 representative KPIs using `linkedKPIs` from `questionnaire.ts` and `KPI_DEFINITIONS` from `kpiDefinitions.ts`. Computes per-KPI score as the average of questions linked to that KPI within each department.

**Layout:**
- 6-column grid (1 label column + 5 KPI columns) with department rows
- Cell: 48px square (32px on mobile), colored by 5-band scale from DESIGN.md §2.3:
  - 0-45: `#dc2626`, 46-69: `#d97706`, 70-84: `#2563eb`, 85-100: `#16a34a`
- Score text centered in cell (12px bold, white on dark cells, foreground on light)
- Column headers: KPI short names (rotated 45° on mobile for space)
- Row headers: Department abbreviations (NVS, UVS, SVC, PTS, FIN)
- Color legend below grid: 4 colored blocks with score range labels
- Hover: shadcn Tooltip showing KPI name, score, benchmark band

**Placement:** Inside `ExecutiveSummary`, inserted as new section between Diagnostic Narrative (Section 1) and Department Score Cards (Section 2).

### Feature 2 — Causal Chain Diagram

**Component:** `CausalChainDiagram.tsx`

**Data source:** Receives `signals` (from `generateSignals()` already computed in ExecutiveSummary) and `signalMappings` with `rootCauseDimension`. Groups signals that share the same `rootCauseDimension` across different departments into causal chains.

**Layout:**
- Horizontal flow (left to right) on desktop; vertical stack on mobile
- Each signal rendered as a rounded box (120×60px) colored by department hex (DESIGN.md §2.4)
- White text, 12px bold showing signal label
- SVG arrows between boxes sharing a `rootCauseDimension`, arrow label in 10px italic grey
- Arrow color: `#9ca3af`
- Maximum 2 chains displayed; if more exist, show "View all" toggle
- Fallback: If <2 signals, show i18n message "No causal chains detected"

**Placement:** Inside `ExecutiveSummary`, new section after heatmap and before Top Findings (Section 3).

### Feature 3 — Ceiling Insights Panel (Upgraded)

**Component:** `CeilingInsightsPanel.tsx`

**Current state:** Ceiling insights already render in ExecutiveSummary Section 5 with basic styling. This extracts them into a dedicated component with enhanced styling per the prompt spec.

**Enhancements:**
- 8px department color bar on left side of each card (using DESIGN.md §2.4 dept colors)
- Green "Optimization Opportunity" badge
- Body text: "Current score: X. Best-in-class: [description]"
- Footer: "→ [next level action]" with primary accent
- Max 3 cards shown; "View all" link if >3, expanding to show remainder
- Staggered entrance animation (50ms increments per §7.2)
- Fallback i18n message when no insights

**Placement:** Replaces current Section 5 in ExecutiveSummary.

---

### i18n Keys to Add

```
results.kpiMatrix.title / results.kpiMatrix.noData
results.causalChain.title / results.causalChain.noChains / results.causalChain.viewAll
results.ceiling.title / results.ceiling.noInsights / results.ceiling.viewAll / results.ceiling.badge
results.ceiling.currentScore / results.ceiling.nextLevel
```

With German equivalents.

---

### Technical Notes

- Zero new packages — pure JSX/SVG for heatmap cells and causal chain arrows
- Recharts NOT used for heatmap or causal chain (plain inline SVG + CSS grid)
- All components receive data as props from ExecutiveSummary (no new queries)
- Signals already computed via `generateSignals()` in ExecutiveSummary — reuse that
- `rootCauseDimension` available on every `EnrichedSignalMapping` in `signalMappings.ts`
- No modifications to restricted files
- Department colors from DESIGN.md §2.4, score bands from §2.3

### Blocked — Feature 4 (Business Model Branching)

Requires modifications to `Assessment.tsx` and `questionnaire.ts`, both on the read-only list. Must be implemented via Claude Code. The changes needed are:
1. Add `applicableBusinessModels` field to each question in `questionnaire.ts`
2. Filter questions in `Assessment.tsx` based on `organization.business_model`
3. Update progress bar count

