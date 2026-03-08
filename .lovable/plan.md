

# Sophisticated Assessment & KPI Calculation Engine

## Current State (What's Wrong)

After inspecting the codebase, here are the key calculation weaknesses:

### Scoring Issues
1. **Question weights are ignored.** Each question has a `weight` field (ranging from 0.8 to 1.5), but `Assessment.tsx` line 69 computes a simple arithmetic average: `sum / count`. Weights are completely unused in scoring.

2. **Category weights are bypassed.** `scoringEngine.ts` defines proper weights (NVS 25%, UVS 20%, etc.), but `Assessment.tsx` line 88 computes overall score as a simple average of section scores — the weighted engine is never called during assessment.

3. **No sub-category analysis.** Each question has a `category` field (volume, conversion, satisfaction, profitability, efficiency, digital, training, etc.) that is never used in scoring or analytics. This data exists but is wasted.

4. **No answer consistency/confidence metric.** If a user scores 5,5,5,1 within a section, that's very different from 4,4,4,4 — both average to ~4, but the first has a reliability problem.

### KPI Issues
5. **KPIs are entirely synthetic.** `generateRealisticData()` creates fake values from scores using formula manipulation. No connection to real assessment responses.

6. **Third action generator still active.** `useAssessmentData.ts` lines 390-500 contains a hardcoded switch/case generator that duplicates the signal engine.

---

## Proposed Changes

### A. Weighted Section Scoring (High Impact, Safe)

**File: `src/pages/Assessment.tsx`** — Replace the `calculateScores` function (lines 60-75) with a weighted average that uses each question's `weight` field:

```text
Current:  average = sum(answers) / count
Proposed: average = sum(answer * weight) / sum(weights)
```

Also replace the overall score calculation (line 88) with a call to `calculateWeightedScore()` from `scoringEngine.ts` — the function already exists but is never used here.

### B. Sub-Category Scoring Breakdown (Medium Impact)

**File: `src/lib/scoringEngine.ts`** — Add a `calculateSubCategoryScores()` function that groups questions by their `category` field (volume, conversion, satisfaction, efficiency, digital, etc.) and computes weighted scores per sub-category within each department.

This enables:
- Identifying specific capability gaps (e.g., "Your conversion process is weak, but volume is strong")
- More targeted action generation
- Richer executive summary narratives

### C. Answer Consistency / Confidence Score (Medium Impact)

**File: `src/lib/scoringEngine.ts`** — Add a `calculateConfidenceMetrics()` function that computes:
- **Standard deviation** within each section (high variance = low confidence)
- **Consistency score** (0-100): sections where all answers cluster = high confidence; sections with wild swings = low confidence
- **Flags**: any section with stddev > 1.2 gets a "Review Recommended" flag

This shows up in the Executive Summary and PDF as: "Section confidence: High/Medium/Low — consider reviewing responses in [department]."

### D. Cross-Department Correlation Analysis (Medium Impact)

**File: `src/lib/scoringEngine.ts`** — Add a `detectSystemicPatterns()` function that identifies signals appearing across 3+ departments. For example, if TOOL_UNDERUTILISED triggers in NVS, Service, and Parts, flag it as a systemic issue rather than three isolated findings.

### E. Enhanced Maturity Model (Low-Medium Impact)

**File: `src/lib/scoringEngine.ts`** — Replace the simple threshold-based maturity (score > 85 = Advanced) with a multi-dimensional model:
- A department can only be "Advanced" if no sub-category scores below 60
- A department is "Basic" if any sub-category scores below 30, regardless of average
- Add "Inconsistent" maturity level for high-variance departments

### F. Remove Third Action Generator (Cleanup)

**File: `src/hooks/useAssessmentData.ts`** — The `generateImprovementActions()` function (lines 390-500) is a hardcoded switch/case that duplicates the signal engine. Replace its body with a call to the canonical signal engine (`generateActionsFromAssessment` from `signalEngine.ts`).

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Assessment.tsx` | Use weighted average + call `calculateWeightedScore()` |
| `src/lib/scoringEngine.ts` | Add sub-category scoring, confidence metrics, cross-department correlation, enhanced maturity |
| `src/hooks/useAssessmentData.ts` | Replace hardcoded action generator with signal engine |
| `src/components/ExecutiveSummary.tsx` | Display sub-category insights and confidence indicators |
| `src/components/MaturityScoring.tsx` | Use enhanced maturity model |

## What This Does NOT Change
- No new questions or question weights
- No database schema changes
- No benchmark value changes
- No new routes
- No UI redesign — only richer data flowing into existing components

