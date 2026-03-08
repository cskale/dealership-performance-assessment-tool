

# Professional Hardening Plan — Implementation Sprint

## Confirmed Changes (1A, 1B, 2A, 3A, 4A, 4B, 4C)

### 1A. Label Synthetic KPIs as Estimated
- Add a prominent info banner at top of `IndustrialKPIDashboard.tsx`: "Values shown are illustrative estimates derived from your assessment responses — not actual dealership data."
- Add `(estimated)` suffix to each KPI card value display

### 1B. Consolidate Action Generators
- In `ActionPlan.tsx`, replace the import of `analyzeAssessmentAnswers`, `generateActionsFromContext`, `formatActionsForDatabase` from `actionGenerator.ts` with the signal engine from `signalEngine.ts` + `useAutoActionGeneration`
- The `generateIntelligentActions` function (line ~143) currently uses the legacy generator — rewire to use `generateSignals()` + `mapSignalsToActions()` from the canonical engine
- Add deprecation header comment to `src/utils/actionGenerator.ts`

### 2A. Unify Actions Pages
- Replace `/actions` route content: instead of the legacy `actions` table UI, redirect to `/app/results` with the Action Plan tab active
- In `App.tsx`, change the `/actions` route to render a redirect component: `Navigate to="/app/results?tab=actions"`

### 3A. DB-First Results Loading
- In `Results.tsx`, modify `loadData` (line ~41) to first attempt loading from the `assessments` table (most recent completed assessment for user/org), then fall back to `localStorage`
- This ensures results survive browser data clears

### 4A. Remove Bouncy SmartAssistant FAB
- Convert `SmartAssistant.tsx` from a floating animated bot into a static help panel triggered from the assessment header
- Remove `animate-pulse` from the Bot icon
- Keep the contextual guidance content but present it as a calm, inline tooltip or collapsible panel

### 4B. Executive Summary Narrative Structure
- Restructure `ExecutiveSummary.tsx` strengths/weaknesses from bare department names to consulting-style statements:
  - Instead of "New Vehicle Sales Performance", render: "New Vehicle Sales scored 72/100 — performing above average. Continue optimizing lead conversion processes."
  - Instead of "Parts and Inventory Performance", render: "Parts & Inventory scored 38/100 — significantly below target. Prioritize inventory management and supplier processes."
- Replace emoji markers (✓, ⚠, 🚨, 📊) with Lucide icons for clean rendering

### 4C. Maturity Score Calculation Tooltips
- Add `Tooltip` wrappers around the overall score and department scores in `MaturityScoring.tsx` and `ExecutiveSummary.tsx`
- Tooltip content: "Weighted score: New Vehicle Sales (25%) + Used Vehicle Sales (20%) + Service (20%) + Financial Ops (20%) + Parts (15%)"
- Uses data already in `scoringEngine.ts` `CATEGORY_WEIGHTS`

---

## Additional Improvements (Recommended)

### 5. Clean Up Emoji Usage Across UI
The Executive Summary uses raw emoji characters (✓, ⚠, 🚨, 📊) that render inconsistently. Replace all with Lucide icons (`CheckCircle`, `AlertTriangle`, `AlertCircle`, `BarChart3`) for professional consistency.

**Files:** `ExecutiveSummary.tsx`

### 6. Dashboard Static Data Disclaimer
The Dashboard page uses entirely hardcoded KPI values ("Main Dealership", "North Branch", static revenue figures). Add a clear banner: "Dashboard Preview — Connect real dealership data to activate live analytics." Disable the Export button.

**Files:** `Dashboard.tsx`

### 7. Auth Callback Redirect Validation
The `AuthCallback.tsx` has no path validation on redirects — it redirects based on DB role data to arbitrary paths. Add validation that redirect targets start with `/` and don't contain protocol schemes to prevent open-redirect attacks.

**Files:** `AuthCallback.tsx`

### 8. Department Name DRY Refactor
The same `deptNames` mapping object is duplicated 6+ times across `ExecutiveSummary.tsx` (lines 55-61, 80-85, 99-105, 137-143, 147-153, 266-272). Extract to a shared constant in a utility file to eliminate duplication and ensure consistency.

**Files:** New `src/lib/departmentNames.ts`, then update `ExecutiveSummary.tsx`, `MaturityScoring.tsx`

---

## Files to Change

| File | Changes |
|------|---------|
| `src/components/IndustrialKPIDashboard.tsx` | Add estimated data disclaimer banner |
| `src/components/ActionPlan.tsx` | Replace legacy generator with signal engine |
| `src/utils/actionGenerator.ts` | Add deprecation comment |
| `src/pages/Actions.tsx` | Replace with redirect to results |
| `src/App.tsx` | Update `/actions` route |
| `src/pages/Results.tsx` | DB-first data loading |
| `src/components/SmartAssistant.tsx` | Remove animation, make static |
| `src/components/ExecutiveSummary.tsx` | Consulting narrative + replace emojis + extract dept names |
| `src/components/MaturityScoring.tsx` | Add calculation tooltips |
| `src/pages/Dashboard.tsx` | Add preview disclaimer |
| `src/pages/AuthCallback.tsx` | Redirect validation |
| `src/lib/departmentNames.ts` | New shared dept name constants |

No database changes. No scoring changes. No new routes.

