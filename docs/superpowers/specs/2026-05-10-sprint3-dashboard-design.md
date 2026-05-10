# Sprint 3: Dashboard Redesign
**Date:** 2026-05-10
**Status:** Approved — ready for implementation
**Owner:** Claude Code
**Scope:** `src/pages/Dashboard.tsx` only. No routing, no sidebar, no scoring engine files touched.

---

## Context

Part of the 7-sprint Leapsome-style quality bar raise. Sprint 1 delivered the layout shell. Sprint 2 redesigned the assessment flow. Sprint 3 redesigns the dealer dashboard — the single most important screen for dealer principals, coaches reviewing a dealer, and OEM programme managers spot-checking an outlet.

The current dashboard shows static placeholder KPI grids (fake €values) with no real assessment data surfaced. This sprint replaces it entirely with a data-driven layout wired to real Supabase assessment scores, signal engine output, and improvement actions.

Reference mockup: `.superpowers/brainstorm/371-1778385763/content/dash-v4.html`

Sprint 4 will apply the same design language to the OEM dashboard. Sprint 5 to the coach dashboard.

---

## What Does NOT Change

- Sidebar (`AppSidebar.tsx`) — Sprint 1 work, untouched
- Authenticated layout (`AuthenticatedLayout.tsx`) — untouched
- Routing — `/app/dashboard` route stays
- Scoring engine, signal engine, action templates — untouched
- Supabase schema — no migrations required
- No new npm packages

---

## Layout Structure

The page renders in two states: **empty** (no completed assessments) and **filled** (at least one completed assessment). The empty state from the current implementation is preserved unchanged.

### Filled state — section order

```
[Dark stats bar]
[Page header]
[Full-width hero card — 3 equal columns]
[Key Dates / Timeline strip]
[Priority Intervention card]   ← only rendered if critical gap exists
[Departmental Intelligence grid]
[Open Actions table]
[Strategic Findings]
```

---

## Section Specifications

### 1. Dark Stats Bar

A `h-9` strip using `bg-[#0b1f3a]` — exact match to `AssessmentHeroNav` stat strip.

Four chips separated by `border-r border-white/[0.08]`:

| Label | Value source |
|---|---|
| Overall Score | `assessment.overall_score` / 100 |
| Assessment date | `assessment.completed_at` formatted `DD MMM YYYY` |
| Critical gaps | Count of departments with score < 46. Text: "N department(s)". Color: `text-[#f87171]` when > 0, else `rgba(255,255,255,0.85)` |
| Open actions | Count of `improvement_actions` with `status != 'completed'`. Text: "N items" |

Right side: user name + avatar (same treatment as current layout).

---

### 2. Page Header

```
[eyebrow]  Performance Intelligence · Q[n] [YYYY]     [Export Report button]
[h1]       Diagnostic Command
```

- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B778C]`
- Title: `text-[28px] font-extrabold text-[#091E42]` with `letterSpacing: '-0.022em'`
- Quarter derived from `assessment.completed_at` month
- Export Report button: `bg-[#0b1f3a] text-white rounded-lg px-4 py-2 text-[12px] font-semibold` — triggers existing PDF export flow

---

### 3. Full-Width Hero Card

`background: #0b1f3a`, `rounded-2xl`, CSS grid `grid-cols-3`, columns separated by `border-r border-white/[0.07]`.

**All text in this card is white. No yellow, no orange, no amber.**

#### Column 1 — Overall Diagnostic Score

- Eyebrow: "Overall Diagnostic Score" — `text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35`
- Score number: `text-[72px] font-extrabold text-white` with `letterSpacing: '-0.05em'`, `font-variant-numeric: tabular-nums`
- Denominator: "/ 100" — `text-[18px] font-medium text-white/35`
- Progress bar: `h-[5px]` track `bg-white/10`, fill `bg-gradient-to-r from-[#1D7AFC] to-[#85B8FF]`, width = `${score}%`
- Maturity pill: `bg-[rgba(29,122,252,0.2)] text-[#85B8FF] rounded-full px-[10px] py-[3px] text-[10px] font-bold uppercase tracking-[0.05em]` with a 6px dot
- Maturity levels: Advanced ≥85, Performing ≥70, Developing ≥46, Foundational <46
- Narrative: italic, `text-[11px] text-white/38`, `border-t border-white/[0.07]`, generated from `buildExecutiveNarrative()` in `src/lib/narrativeTemplates.ts`

#### Column 2 — Open Actions

- Eyebrow: "Open Actions"
- Count: `text-[72px] font-extrabold text-white` — same size/weight as score, white only
- Sub-label: "items requiring attention" — `text-[13px] text-white/40`
- Below: up to 3 most urgent actions as small rows (dot + text). Dot: `w-[6px] h-[6px] rounded-full bg-white/40`. Text: `text-[11px] text-white/50`, department in `text-white/80 font-semibold`. Full department name, no shortforms.
- Source: `improvement_actions` ordered by `target_completion_date` ascending, status != 'completed'

#### Column 3 — Focus Department

The department with the lowest score.

- Eyebrow: "Focus Department"
- Department name: `text-[20px] font-extrabold text-white` with `letterSpacing: '-0.02em'`
- Score: `text-[56px] font-extrabold text-white` with `letterSpacing: '-0.04em'`
- Maturity label beside score: `text-[11px] font-bold uppercase tracking-[0.06em] text-white/40`
- Narrative: `text-[11px] text-white/40`, `border-t border-white/[0.07]` — the top signal finding for this department from `signalEngine.ts` output
- **All white — no red, no orange for the score number**

---

### 4. Key Dates / Timeline Strip

A white card (`rounded-xl shadow-card border border-[#DFE1E6]`) with `grid-cols-5`. Each column has `border-r border-[#F1F2F4]`.

Five fixed slots:

| Slot | Label | Data source |
|---|---|---|
| 1 | Last Assessment | `assessment.completed_at` |
| 2 | Next Assessment Due | `completed_at + 90 days` |
| 3 | Last Coach Visit | `coach_dealership_assignments` latest visit date (if exists) — show "Not yet scheduled" if none |
| 4 | Next Coach Visit | Coach visit scheduled date (if exists) — show "Not yet scheduled" if none |
| 5 | Action Plan Review | End of current quarter |

Each slot:
- Label: `text-[10px] font-semibold text-[#6B778C]`
- Date: `text-[13px] font-bold text-[#172B4D]`
- Sub-detail: `text-[10px] text-[#6B778C]`
- Status badge: `rounded-full text-[9px] font-bold px-[8px] py-[2px]`
  - Completed: `bg-[#f0fdf4] text-[#15803d]`
  - Upcoming/Scheduled: `bg-[#E9F2FF] text-[#1558BC]`
  - Overdue: `bg-[#fef2f2] text-[#ef4444]`
- Coloured dot (top-right): 8px circle, same semantic color

**Coach visit data:** Query `coach_dealership_assignments` for the current `dealership_id`. If no coach is assigned, render slots 3 and 4 with "Not yet scheduled" and no badge.

---

### 5. Priority Intervention Card

Only rendered when at least one department score < 46 (critical gap).

```
bg-[#fef2f2]  border border-[#fecaca]  border-l-[3px] border-l-[#ef4444]  rounded-xl
```

Layout: `flex items-center gap-4`

- Left: label `"Priority Intervention Required"` — `text-[12px] font-bold text-[#ef4444]` + description text from the top critical signal in `signalEngine.ts` output — `text-[12px] text-[#253858] leading-relaxed`
- Right: `"Resolve Now"` button — `bg-[#ef4444] text-white rounded-lg px-[18px] py-[9px] text-[12px] font-bold` — navigates to `/app/actions?filter=critical`

If no critical gap exists, this card is not rendered at all (no empty state needed).

---

### 6. Departmental Intelligence Grid

White card, `rounded-xl shadow-card border border-[#DFE1E6]`, `grid-cols-5`, columns separated by `border-r border-[#F1F2F4]`.

Each column — full department name, no shortforms:
- New Vehicle Sales
- Used Vehicle Sales
- Service Operations
- Parts & Accessories
- Financial Operations

Per column:
- Department name: `text-[10px] font-bold text-[#5E6C84]`
- Score: `text-[38px] font-extrabold` with `letterSpacing: '-0.03em'`, `font-variant-numeric: tabular-nums`
  - Advanced (≥85): `text-[#22c55e]` — green
  - Performing (≥70): `text-[#1D7AFC]` — brand blue
  - Developing (≥46): `text-[#1D7AFC]` — brand blue (**not amber/orange**)
  - Foundational (<46): `text-[#ef4444]` — red

- Maturity label: `text-[10px] font-bold uppercase tracking-[0.05em]` — same color as score
- Diagnostic finding: `text-[10.5px] text-[#5E6C84] leading-relaxed`, `border-t border-[#F1F2F4] pt-[10px] mt-[10px]`

**Finding text source:** The top signal from `signalEngine.ts` for that department, falling back to a generated summary based on the score if no signal exists. This is the primary data-wiring work for this section.

Score data source: `assessment.scores` jsonb — keyed by department id (`new-vehicle-sales`, `used-vehicle-sales`, `service-performance`, `financial-operations`, `parts-inventory`).

---

### 7. Open Actions Table

White card, `rounded-xl shadow-card border border-[#DFE1E6]`, padding `p-5`.

Borderless table (`border-collapse: collapse`, no `border` on `td` or `tr`).

Column headers: `text-[10px] font-semibold uppercase tracking-[0.08em] text-[#97A0AF]`

Columns: Action | Department | Responsible | Due

Row divider: `border-t border-[#F1F2F4]` on `td`, padding `py-[10px]`

**Dot indicator — exactly two colors:**
- `bg-[#ef4444]` (red): `target_completion_date < today`
- `bg-[#1D7AFC]` (brand blue): `target_completion_date >= today` or null

Due date cell:
- Overdue: `text-[#ef4444] font-semibold text-[11px]` — append "· Overdue"
- Not yet due: `text-[#6B778C] text-[11px]`

**No yellow anywhere in this table.**

Data source: `improvement_actions` where `assessment_id = latest assessment id` and `status != 'completed'`, ordered by `target_completion_date` ascending nulls last.

Display all open actions (no artificial cap — scroll naturally).

Department and Responsible Person columns: full text, no shortforms.

---

### 8. Strategic Findings

White card, `rounded-xl shadow-card border border-[#DFE1E6]`, padding `p-5`.

Items separated by `border-t border-[#F1F2F4]`. No border on the first item.

Per finding:
- Icon wrap: `w-[32px] h-[32px] rounded-lg flex items-center justify-center flex-shrink-0`
  - Critical: `bg-[#fef2f2]` + `AlertCircle` Lucide icon, `stroke="#ef4444"`, `size={16}`, `strokeWidth={2}`
  - Medium: `bg-[#E9F2FF]` + `Info` Lucide icon, `stroke="#1D7AFC"`, `size={16}`, `strokeWidth={2}`
- Finding title: `text-[13px] font-bold text-[#172B4D]`
- Badge (right of title row):
  - Text: sentence case — "Critical risk", "Medium impact" — **no uppercase transform**
  - `text-[10px] font-semibold rounded-full px-[8px] py-[2px]`
  - Critical: `bg-[#fef2f2] text-[#ef4444]`
  - Medium: `bg-[#E9F2FF] text-[#1558BC]`
- Description: `text-[11px] text-[#5E6C84] leading-relaxed`
- **No blue caps links** — "Trigger Resolution Protocol →" etc. are removed entirely

**Data source:** `detectSystemicPatterns()` + top signals from `signalEngine.ts`. Render the top 2–3 signals ordered by severity. If fewer than 2 signals exist, render what's available (no placeholder rows).

---

## Data Fetching

All fetched on mount via a single `useEffect` (or two parallel queries), scoped to `user.id`:

```typescript
// Query 1: latest completed assessment with scores + actions
supabase
  .from('assessments')
  .select('id, completed_at, overall_score, scores, department_scores')
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('completed_at', { ascending: false })
  .limit(1)

// Query 2: open improvement actions for that assessment
supabase
  .from('improvement_actions')
  .select('id, action_title, department, responsible_person, target_completion_date, priority, status')
  .eq('assessment_id', assessmentId)
  .neq('status', 'completed')
  .order('target_completion_date', { ascending: true, nullsFirst: false })
```

Signal engine called client-side: `generateSignals(answers, questionWeights, config, questionLinkedKPIs)` from `src/lib/signalEngine.ts` — same call used by the Results page. No new Edge Function needed. Assessment `answers` jsonb column contains the raw question→score map.

Coach visit dates: query `coach_dealership_assignments` for `dealership_id` from `useActiveRole()`. If the table has a `last_visit_date` / `next_visit_date` column — use it. If not, render "Not yet scheduled" for both coach slots. **No schema change required to ship Sprint 3.**

---

## Empty State

Preserved from current implementation — the "Run your first dealership diagnostic" card shown when `hasAssessments === false`. No changes.

---

## Component Structure

All new UI lives inside `Dashboard.tsx`. No new files created — the page is currently 375 lines and will grow to ~500. This is acceptable given it's a single-page view component.

Extracted sub-components (defined in the same file as local functions, not separate files):
- `HeroCard` — the 3-col dark card
- `TimelineStrip` — the key dates row
- `DeptGrid` — the 5-col intelligence grid
- `ActionsTable` — the borderless table
- `FindingsCard` — strategic findings

---

## Typography Rules (enforced throughout)

- Section titles: `text-[15px] font-bold text-[#172B4D]` — title case, no uppercase transform
- Eyebrow labels inside dark card only: `text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35`
- Badge text: sentence case, no `text-transform: uppercase`
- No shortforms: always "New Vehicle Sales", "Used Vehicle Sales", "Service Operations", "Parts & Accessories", "Financial Operations"

---

## Color Rules (enforced throughout)

| Semantic | Color | Use |
|---|---|---|
| Primary dark | `#0b1f3a` | Hero card bg, stats bar bg, export button |
| Brand blue | `#1D7AFC` | Performing score, pending action dot, medium finding badge bg-text, progress fill start |
| Success green | `#22c55e` | Advanced score, completed timeline badge |
| Danger red | `#ef4444` | Critical score, overdue dot, priority card, critical finding |
| **No yellow/amber** | — | Banned in hero and dept intelligence |

---

## Out of Scope for Sprint 3

- Delta scoring / trend arrows (blocked — needs #36)
- Coach visit date write-back (coach visit dates are read-only display)
- OEM dashboard (Sprint 4)
- Coach dashboard (Sprint 5)
- Benchmark corridor (deferred — needs live peer data)
- Results page OEM context (#58)
