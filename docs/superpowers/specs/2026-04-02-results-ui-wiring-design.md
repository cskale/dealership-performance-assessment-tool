# Design Spec — Results UI Wiring Sprint
**Date:** 2026-04-02  
**Tasks:** #33 (Systemic Patterns), #34 (Executive Narrative), #15 (Ceiling Analysis), #35 (30/60/90 Roadmap)  
**Status:** Approved

---

## Context

`Results.tsx` is a thin orchestrator. It delegates:
- Executive tab → `<ExecutiveSummary>` component
- Action Plan tab → `<ActionPlan>` component

All four engine functions are already imported and called inside these child components. Implementing the tasks in `Results.tsx` would duplicate existing logic. **All work targets the child components, not `Results.tsx` directly.**

No engine files are modified: `scoringEngine.ts`, `signalEngine.ts`, `ceilingAnalysis.ts`, `narrativeTemplates.ts` are read-only.

---

## Actual State (pre-flight audit)

| Task | Expected | Found | Gap |
|---|---|---|---|
| #34 Narrative | Not rendered | ✅ Rendered as "Diagnostic Summary" in `ExecutiveSummary.tsx` | Styling only |
| #33 Systemic | Not rendered | ⚠️ Systemic (3+ depts) rendered; recurring (2 depts) missing | Add recurring; update heading |
| #15 Ceiling | Not rendered | ⚠️ `CeilingInsightsPanel` renders; empty state wrong; no overall score guard | Fix empty state + score guard |
| #35 Roadmap | Not rendered | ❌ Not implemented; triageScore scale mismatch | Add as 4th view mode |

---

## Function Signatures (actual)

```ts
// scoringEngine.ts
detectSystemicPatterns(sections: Section[], answers: Record<string, number>, weakThreshold?: number): SystemicPattern[]
// SystemicPattern: { signalCode: string, departments: string[], severity: 'systemic' | 'recurring', description: string }

// narrativeTemplates.ts
buildExecutiveNarrative(input: NarrativeInput): NarrativeBlock
// NarrativeInput: { maturityLevel, primarySignal, dealerName?, department?, score?, benchmark?, isSystemic? }
// NarrativeBlock: { situation: string, diagnosis: string, priority: string }

// ceilingAnalysis.ts
generateCeilingInsights(answers: Record<string, number>, sectionScores: Record<string, number>): CeilingInsight[]
// CeilingInsight: { questionId, currentScore, bestInClassDescription, nextLevelAction }

// ActionPlan.tsx (local)
computeTriageScore(action: ActionRecord): number | null
// Returns: impact_score * 2 + urgency_score * 2 - effort_score (max ~20, NOT 0–100)
// actionTemplatesTiered.ts does NOT exist
```

---

## Task Designs

### Task #34 — Executive Narrative (file: `ExecutiveSummary.tsx`)

Section 1 already renders `buildExecutiveNarrative`. Changes:
- Replace the "Diagnostic Summary" `CardTitle` with a plain `<p className="text-sm text-muted-foreground">Assessment Overview</p>` label above the Card
- Add `border-l-4 border-blue-500` to the Card className
- Keep existing rendering of `narrative.situation`, `narrative.diagnosis`, `narrative.priority`
- Guard: if narrative is null/undefined, render nothing

### Task #33 — Systemic Pattern Cards (file: `ExecutiveSummary.tsx`)

Section 4 currently only renders `severity === 'systemic'`. Changes:
- Update condition to render when `systemicPatterns.length > 0` (either severity)
- Change heading to "Systemic Issues Detected"
- For `severity === 'systemic'`: red border (`border-l-red-500`), red badge
- For `severity === 'recurring'`: amber border (`border-l-amber-500`), amber badge
- Card title per pattern: `signalCode` formatted (replace `_` with space, title-case)
- Body: `pattern.description`
- Department badges: `pattern.departments.map(d => getDepartmentName(d, language))`

### Task #15 — Ceiling Analysis (files: `CeilingInsightsPanel.tsx` + `ExecutiveSummary.tsx`)

`CeilingInsightsPanel` changes:
- Accept new prop: `overallScore: number`
- Guard: if `overallScore < 55` OR `insights.length === 0` → return `null` (render nothing — no empty state card)
- Section heading: "Ceiling Gap Analysis — Where Top-Quartile Dealers Gain"
- Left border colour: `border-l-teal-500` (override per-dept colour map)
- Keep: `bestInClassDescription`, `nextLevelAction`, department label, `currentScore/5` badge

`ExecutiveSummary.tsx` change:
- Pass `overallScore` prop to `<CeilingInsightsPanel insights={ceilingInsights} overallScore={overallScore} />`

### Task #35 — 30/60/90 Day Roadmap (file: `ActionPlan.tsx`)

Add `'roadmap'` to `viewMode` type. Add Roadmap button (use `CalendarIcon` from existing imports) to view switcher.

**Bucketing logic** (adapted to actual triageScore scale of 0–20):
```ts
function getRoadmapBucket(action: ActionRecord): '30' | '60' | '90' {
  const score = computeTriageScore(action);
  if (score !== null) {
    if (score >= 14) return '30';
    if (score >= 10) return '60';
    return '90';
  }
  // fallback to priority when scores are null
  if (action.priority === 'critical') return '30';
  if (action.priority === 'high') return '60';
  return '90';
}
```

**Layout:**
- Three columns (`grid-cols-1 md:grid-cols-3`), each with a colour pill header
  - 30 days: `bg-red-100 text-red-700`
  - 60 days: `bg-amber-100 text-amber-700`
  - 90 days: `bg-blue-100 text-blue-700`
- Each action card: title (`cleanActionTitle`), department badge, triage score as `text-xs text-muted-foreground`
- `onClick={() => openEditPanel(action)}` preserved on every card
- Empty bucket: `<p className="text-sm text-muted-foreground">No actions in this window</p>`

---

## Files Modified

| File | Tasks |
|---|---|
| `src/components/ExecutiveSummary.tsx` | #34, #33, #15 (pass overallScore) |
| `src/components/results/CeilingInsightsPanel.tsx` | #15 |
| `src/components/ActionPlan.tsx` | #35 |

**Not modified:** `Results.tsx`, `scoringEngine.ts`, `signalEngine.ts`, `ceilingAnalysis.ts`, `narrativeTemplates.ts`, `actionTemplatesTiered.ts`

---

## Post-work Checklist

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] No unused imports added
- [ ] No engine files modified
- [ ] All sections render nothing (not empty cards) when data is absent
- [ ] Roadmap `onClick` preserved
- [ ] `CeilingInsightsPanel` renders null when `overallScore < 55` or `insights.length === 0`
