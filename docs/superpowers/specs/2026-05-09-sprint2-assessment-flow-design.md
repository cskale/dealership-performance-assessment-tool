# Sprint 2: Assessment Flow Redesign
**Date:** 2026-05-09
**Status:** Approved — ready for implementation
**Owner:** Claude Code
**Scope:** Assessment page layout, section navigation, question cards

---

## Context

Part of the 7-sprint Leapsome-style quality bar raise. Sprint 1 delivered the layout shell (sidebar, top bar, canvas gradient). Sprint 2 redesigns the assessment flow — the most-used surface in the product.

Key constraints agreed during design:
- Scroll-through-all-questions model stays (61 next-clicks would be brutal UX)
- No one-question-at-a-time navigation
- No diagnostic weight indicator shown to users (gaming risk)
- Benchmark corridor deferred (needs live KPI data)
- "Attach proof of performance" is UI-only placeholder (file upload is a future sprint)

Reference mockup: `.superpowers/brainstorm/1215-1778344347/content/wow-v2.html`

---

## What Changes

### 1. Layout — left sidebar removed

The current 320px left sidebar (`SectionNavigation.tsx`) is replaced by the hero nav card at the top of the page. Assessment content becomes full-width.

**Current:**
```
[SectionNavigation 320px sticky] | [CategoryAssessment — constrained width]
```

**Sprint 2:**
```
[HeroNavCard — full width, sticky]
[Question cards — full width]
```

---

### 2. Hero Nav Card

A new component: `src/components/assessment/AssessmentHeroNav.tsx`

Floats on the `bg-canvas-warm` background. `shadow-elevated`. `rounded-2xl`. Sticky below the authenticated layout top bar (`top-12`).

#### 2a. Stat strip (dark navy)

```
bg: #0b1f3a   height: 36px
```

Contents (left to right):
- "Est. time remaining" label + amber value (calculated from unanswered questions × avg 30s)
- Spacer
- Dealership name · Brand (e.g. "Oakwood Motors · BMW") — right-aligned

No question counts, no section fractions — removed entirely.

#### 2b. Header row

```
padding: 24px 24px 20px
border-bottom: 1px solid #f1f5f9
```

**Left block:**
- "Assessment in progress" badge: `bg-#eff6ff border-#bfdbfe text-#1e40af` pill, sentence case, pulsing brand-500 dot (uses `.badge-pulse` from Sprint 1)
- Section title: `text-h2` (24px / 700 / −0.022em) — updates on tab switch
- Section description: 13px / 400 / `#445166`, key terms wrapped in `text-brand-600` spans — updates on tab switch

**Right block — single large % complete:**
```
bg: #f8fafc   border: 1px solid #e2e8f0   rounded-xl   padding: 16px 28px
```
- Percentage number: 52px / 800 / −0.05em / `tabular-nums` / `font-optical-sizing: auto`
- "Complete" label: 12px / 500 / `#6e7e8a`
- Gradient fill bar: `linear-gradient(90deg, #1D7AFC, #4fa8ff)`, 5px height

No "X of 61 questions" or "X of 5 sections" fractions anywhere.

#### 2c. Tab navigation

```
padding: 0 24px
```

5 tabs, one per section. `flex` with equal widths.

**Tab anatomy:**
```
Section name     ← 12px / 600 / colour depends on state
[progress bar]   ← 4px height, rounded, fills as questions answered
```

**States:**

| State | Name colour | Bar fill | Border |
|---|---|---|---|
| Not started | `#adbcc7` | empty `#eef0f3` | none |
| Active | `#1D7AFC` | `#1D7AFC` proportional fill | none |
| Complete | `#15803d` | `#16a34a` full | none |

No `border-bottom` underline on tabs — the progress bar is the sole active indicator. No question fractions (0/13 etc) shown in tabs.

Section names (truncated to remove "Performance" suffix for tab space):
- New Vehicle Sales
- Used Vehicle Sales
- Service
- Parts
- Financial Operations

---

### 3. Question Cards

`CategoryAssessment.tsx` is refactored. Each question renders a `QuestionCard` block directly (no wrapper accordion, no collapsible context).

#### 3a. Question card top bar

```
background: #D6E3FF
border-bottom: 1px solid #c7d4f0
padding: 10px 20px
```

Left: `Q{n}` filled badge (`bg-#1D7AFC text-white rounded-md px-2 py-1 text-xs font-700`) + category name plain text (`12px / 500 / #172d4d`)

Right: "Question {n} of {total}" — `11px / 500 / #94a3b8 tabular-nums`

#### 3b. Question text

```
font-size: 18px
font-weight: 700
color: #0b1f3a
letter-spacing: -0.018em
line-height: 1.4
padding: 20px 20px 0
font-optical-sizing: auto
font-feature-settings: "kern" 1, "liga" 1, "calt" 1
```

#### 3c. Rating tiles

```
display: grid
grid-template-columns: repeat(5, 1fr)
gap: 8px
padding: 20px
```

**Tile anatomy — no "Level X" labels:**
```
border: 1px solid #d4dde4
border-radius: 10px
padding: 16px 10px
min-height: 80px
display: flex, align-items: center, justify-content: center
```

Option label: `13px / 600 / #263d57 / text-align: center / line-height: 1.35`

**Selected state:**
```
border: 1.5px solid #1D7AFC
border-left: 4px solid #1D7AFC
background: rgba(29,122,252,0.04)
box-shadow: 0 0 0 3px rgba(29,122,252,0.08)
```

Checkmark: 16×16px filled brand-500 circle, top-right corner, appears on selection (opacity 0→1, 150ms ease).

**Hover (unselected):**
```
border-color: rgba(29,122,252,0.35)
background: rgba(29,122,252,0.02)
box-shadow: 0 2px 8px rgba(29,122,252,0.08)
```

#### 3d. Context strip

```
background: #f4f6f8   (--neutral-050)
border-top: 1px solid #e2e8f0
padding: 16px 20px
display: grid
grid-template-columns: 1fr 1px 1fr
```

**Column 1 — "Why this matters"**

Heading: `12px / 600 / #172d4d`

Body: merged prose from `question.purpose` + `question.situationAnalysis` + `question.benefits`. Rendered as a single paragraph — concatenated at render time, no data migration. `12px / 400 / #445166 / line-height: 1.6`

Merge format:
```ts
const whyThisMatters = [question.purpose, question.situationAnalysis, question.benefits]
  .filter(Boolean)
  .join(' ')
```

**Divider:** `1px / #d4dde4 / align-self: stretch`

**Column 2 — "Linked KPIs"**

Heading: `12px / 600 / #172d4d`

KPI chips: `bg-#dbeafe text-#1e40af 11px / 500 rounded-md px-2 py-1`

Each chip is an `<a>` tag: `href="/app/kpi-encyclopedia" target="_blank"` with a small `↗` SVG arrow (9×9px, stroke `#1e40af`, stroke-width 1.8).

If `question.linkedKPIs` is empty or undefined: show "No linked KPIs" in `text-muted-foreground`.

#### 3e. Card footer

```
display: flex
align-items: center
gap: 16px
padding: 12px 20px
border-top: 1px solid #eef0f3
background: white
```

Two ghost buttons, left-aligned:

1. **"Add field coach notes"** — `MessageSquare` icon (14px) + text. On click: expands an inline `Textarea` below the footer (same auto-save behaviour as current notes implementation in `useAssessmentNotes`).

2. **"Attach proof of performance"** — `Upload` icon (14px) + text. UI-only placeholder for now — `onClick` is a no-op with a `// file upload — future sprint` comment. Does NOT render a file input yet.

Divider between buttons: `1px / 14px height / #e2e8f0`.

Button style: `12px / 500 / #6e7e8a`. Hover: `#1D7AFC`. No border, no background.

---

### 4. Context data — merged "Why this matters"

The accordion "Why This Matters" with 4 sub-cards (Purpose, Situation Analysis, Linked KPIs, Business Benefits) is removed entirely.

Purpose + Situation Analysis + Business Benefits → merged into single prose paragraph rendered in the "Why this matters" column.

Linked KPIs → rendered as chips in the "Linked KPIs" column.

The `question.description` field (subtitle under question text) remains rendered below the question text if present.

---

### 5. Completion overlay

No change to the existing completion overlay (`completionState` → saving/generating/complete). It sits above the new layout unchanged.

---

### 6. Scroll behaviour

On section tab switch: `window.scrollTo({ top: 0, behavior: 'smooth' })` — unchanged from current behaviour.

Auto-scroll to next unanswered question after answering: unchanged from current `handleRatingClick` logic in `CategoryAssessment.tsx`.

---

## Files Touched

| File | Change |
|---|---|
| `src/pages/Assessment.tsx` | Remove sidebar column, render `AssessmentHeroNav` above `CategoryAssessment`, remove `SectionNavigation` import |
| `src/components/assessment/AssessmentHeroNav.tsx` | **New file** — stat strip + header row + tab navigation |
| `src/components/assessment/CategoryAssessment.tsx` | New question card structure — top bar, tiles, context strip, footer |
| `src/components/assessment/SectionNavigation.tsx` | No longer rendered — keep file, do not delete (may be reused elsewhere) |
| `src/components/assessment/QuestionCard.tsx` | No longer used — keep file, do not delete, do not edit |
| `src/index.css` | No new utilities needed — all colours used inline or via existing tokens |

## Files NOT Touched

- `src/lib/scoringEngine.ts`
- `src/data/questionnaire.ts`
- `src/hooks/useAssessmentData.ts`
- `src/hooks/useAssessmentNotes.ts`
- `src/hooks/useAutoActionGeneration.ts`
- All shadcn `src/components/ui/` files
- All Lovable-owned files

---

## Acceptance Criteria

- [ ] `npx tsc --noEmit` — zero errors
- [ ] Left sidebar is gone — question cards span full available width
- [ ] Hero nav card sticky at top — stat strip + header + tabs visible
- [ ] Tabs switch active section, scroll to top, section title/description updates
- [ ] Rating tiles: centered text, correct selected state (left border + tint + checkmark)
- [ ] Context strip: `#f4f6f8` background, 2-col layout, merged prose + KPI chips
- [ ] KPI chips open `/app/kpi-encyclopedia` in new tab
- [ ] "Add field coach notes" expands inline textarea with auto-save
- [ ] "Attach proof of performance" renders as no-op placeholder
- [ ] Completion overlay still works — navigate to `/app/results` after save
- [ ] No Lovable-owned files modified
- [ ] No new npm packages installed
