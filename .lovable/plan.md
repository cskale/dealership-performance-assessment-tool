

## Verification Summary

- **Methodology file:** `src/pages/Methodology.tsx` — renders at `/methodology` route
- **Landing page hero:** Uses `backgroundColor: '#0A0F1E'` with crosshatch grid via `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)` at `40px 40px`
- **Brand token:** `brand-500` / `dd-accent`
- **Background token:** `bg-background` / `dd-fog`

### Target findings:
- **T1 (Stats bar):** Lines 40–46 — shows "22 Action templates" and "5 Maturity levels" (wrong)
- **T2 (5-level maturity):** Lines 261–301 — Section 04 with Critical/Foundational/Inconsistent/Developing/Advanced
- **T3 (Guard condition):** Lines 294–299
- **T4 (Action templates "22"):** Line 43 in stats array
- **T5 (Audit fields):** Absent
- **T6 (Triage scoring):** Lines 196–198
- **T7 (Score threshold):** Absent
- **T8 (Severity escalation):** Absent
- **T9 (Ceiling signal):** Line 279 — inside Advanced maturity row text
- **T10 (Template selection):** Absent
- **T11 (Root cause dims):** Lines 174–183 — in Section 02
- **T12 (Hero bg):** Line 61 — uses `bg-[hsl(var(--dd-midnight))]` with decorative radial blob, NOT crosshatch

**VERIFICATION 4 CONFIRMED** — only `src/pages/Methodology.tsx` modified

---

## Plan: Methodology Page Overhaul (11 Fixes)

**Single file:** `src/pages/Methodology.tsx`

### Fix 1 — Hero background: match landing page
Replace `bg-[hsl(var(--dd-midnight))]` with inline style `backgroundColor: '#0A0F1E'` + same crosshatch grid. Remove decorative radial blob div. Change headline from `font-display` with italic `<em>` to `font-black tracking-tight text-white` plain text.

### Fix 2 — Hero stats bar: correct values
Replace stats array with 5 items:
- 5 / Assessment modules
- 50 / Diagnostic questions
- 3 / Maturity bands
- 18 / Audit fields per action
- 5 / Root-cause dimensions

### Fix 3 — Remove 5-level maturity section (Section 04)
Delete the entire Section 04 card (lines 261–301) including all 5 maturity rows and guard condition.

### Fix 4 — Remove sub-category guard condition
Deleted as part of Fix 3 (lines 294–299).

### Fix 5 — Remove "22 action templates"
Already handled in Fix 2 (stats array replacement).

### Fix 6 — Add template selection section
Insert new section between current Section 02 (signal engine) and Section 03 (benchmarks). Renumber benchmarks to 04. New section numbered 03 with label "TEMPLATES", title "Three-tier template selection & score-band gating". Contains:
- Intro paragraph about deterministic template lookup
- 3 priority-ordered tier cards (Tiered → KPI-Specific → Generic)
- 3 side-by-side score-band cards (Foundational ≤45 / Developing 46–69 / Optimising ≥70)

Uses existing `cardClass`, `detailCardClass`, `sectionLabelClass` etc.

### Fix 7 — Remove triage scoring
Delete the "Triage scoring" sub-card from Section 02 detail grid (lines 196–198).

### Fix 8 — Add score threshold + severity escalation
Add 2 new sub-cards to Section 02 detail grid (before Confidence intervals):
- **SCORE THRESHOLD**: weak score threshold ≤3, questions scoring 4–5 skipped unless ceiling logic applies
- **SEVERITY ESCALATION**: ≥3 questions same signal → LOW→MEDIUM, MEDIUM→HIGH; single HIGH-weight question ≤2 fires HIGH immediately

### Fix 9 — Add ceiling signal pass
Add sub-card to Section 02 after severity escalation:
- **CEILING SIGNAL PASS**: score=4, weight ≥1.2, section ≥65 → PROCESS_NOT_STANDARDISED soft signal, max 1 per module

### Fix 10 — Add 18 audit fields
Add sub-card to Section 02:
- **AUDIT TRAIL DEPTH**: 18-field record per action with full traceability

### Fix 11 — Root cause dimensions retained
No change — already in Section 02.

### Section order after changes:
1. 01 — Structure (unchanged)
2. 02 — Intelligence (triage removed, 4 sub-cards added)
3. 03 — Templates (NEW)
4. 04 — Benchmarks (renumbered from 03, unchanged content)
5. CTA footer (unchanged)

