# DESIGN.md — Dealer Diagnostic Platform
## Visual Language & Component Specification
### Version 1.0 · 22 March 2026 · Reference this file in every Lovable prompt

---

## 0. HOW TO USE THIS FILE

Paste this line at the top of every Lovable prompt:
> "Follow DESIGN.md exactly. Do not introduce new colours, fonts, spacing values, or component patterns that are not defined here."

This file is the single source of truth for all visual decisions. Lovable must not deviate from it.

---

## 1. DESIGN PHILOSOPHY

**Product category:** Enterprise diagnostic SaaS — used by dealer principals, OEM programme managers, and field coaches in professional B2B contexts.

**Aesthetic direction:** Refined European precision. The visual language should feel like a McKinsey deck crossed with a Bloomberg terminal — authoritative, data-dense, zero decorative noise. Every element earns its place by communicating information.

**The one rule:** If a design element does not help the user understand data or take action faster, remove it.

**Tone:** Confident. Methodical. Premium without being flashy. This tool is used when a dealer's business is under scrutiny — the UI must project trust and credibility, not consumer-app friendliness.

---

## 2. COLOUR SYSTEM

### 2.1 Primary Palette (CSS Variables — already in index.css)

```css
/* Brand Blue — the only accent colour allowed */
--brand-700: 213 79% 41%;   /* #1a5fb4 — headers, active nav, primary CTA hover */
--brand-600: 214 81% 48%;   /* #1e6ec8 — links, secondary CTAs */
--brand-500: 213 97% 55%;   /* #1a8cf8 — primary buttons, active states */
--brand-400: 213 100% 67%;  /* #4fa8ff — icon fills, chart series 1 */
--brand-300: 213 100% 76%;  /* #7dc0ff — light accents */
--brand-200: 213 100% 87%;  /* #b3d9ff — backgrounds, hover fills */
--brand-100: 213 100% 93%;  /* #d6ecff — subtle backgrounds */
--brand-050: 214 100% 98%;  /* #f0f8ff — page section backgrounds */

/* Neutral Scale */
--neutral-1000: 216 77% 15%; /* #0b1f3a — page headers, primary text */
--neutral-900: 216 51% 20%;  /* #172d4d — body text */
--neutral-800: 215 37% 25%;  /* #263d57 — secondary headings */
--neutral-700: 215 23% 35%;  /* #445166 — secondary text */
--neutral-600: 215 17% 44%;  /* #5f7080 — muted text, placeholders */
--neutral-500: 213 13% 48%;  /* #6e7e8a — disabled text */
--neutral-400: 215 14% 64%;  /* #95a5b2 — borders (strong) */
--neutral-300: 215 14% 74%;  /* #adbcc7 — borders (default) */
--neutral-200: 214 16% 88%;  /* #d4dde4 — dividers */
--neutral-100: 220 13% 95%;  /* #eef0f3 — card backgrounds */
--neutral-050: 210 14% 97%;  /* #f4f6f8 — page background */
```

### 2.2 Semantic Colours (Do not override these)

| Token | HSL | Usage |
|-------|-----|-------|
| `--success` | 142 71% 45% | Score ≥70, completed actions, positive delta |
| `--warning` | 38 92% 50% | Score 50–69, partial, amber states |
| `--destructive` | 0 72% 51% | Score <50, critical alerts, blocked items |
| `--info` | 213 97% 55% | Informational, benchmarks, neutral data |
| `--discovery` | 270 67% 47% | New features, OEM insights, highlights |

### 2.3 Score Band Colours (Assessment-specific)

```
Foundational  (0–45):   #dc2626  (red-600)     — critical intervention needed
Developing    (46–69):  #d97706  (amber-600)   — improvement required
Performing    (70–84):  #2563eb  (blue-600)    — at benchmark
Advanced      (85–100): #16a34a  (green-600)   — above benchmark
```

### 2.4 Department Colours (Consistent across all charts and badges)

```
NVS (New Vehicle Sales):    #2563eb  blue-600
UVS (Used Vehicle Sales):   #7c3aed  violet-700
SVC (Service):              #0891b2  cyan-700
FIN (Financial):            #059669  emerald-600
PTS (Parts):                #d97706  amber-600
```

### 2.5 Colour Rules

- **Never** use purple gradients on white. This is a SaaS cliché.
- **Never** use more than 2 brand colours in any single component.
- Background pages use `--neutral-050` (#f4f6f8), not pure white.
- Cards use `--background` (white) on the neutral-050 page background.
- Dark mode uses the existing `.dark` variables — do not add new dark mode tokens.
- Data visualisations use the department colour scale above + neutral greys for non-highlighted series.

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

**Current font:** Roboto (Google Fonts) — already loaded.
**This is the only font.** Do not introduce additional font families.

```css
font-family: Roboto, system-ui, -apple-system, sans-serif;
```

**Why Roboto stays:** The tool is used on enterprise Windows laptops at dealerships. Roboto renders excellently at small sizes on Windows ClearType. Do not switch to a "more interesting" display font — this is a data tool, not a brand website.

### 3.2 Type Scale (Custom utilities already in index.css — use these, not Tailwind raw sizes)

| Class | Size | Weight | Line-height | Use |
|-------|------|--------|-------------|-----|
| `.text-h1` | 32px | 700 | 40px | Page titles only |
| `.text-h2` | 28px | 700 | 36px | Section headings |
| `.text-h3` | 24px | 700 | 32px | Card headings |
| `.text-h4` | 20px | 700 | 28px | Sub-section headings |
| `.text-h5` | 16px | 700 | 24px | Component headings |
| `.text-body-md` | 14px | 400 | 22px | Body text, descriptions |
| `.text-body-sm` | 12px | 400 | 18px | Secondary text, notes |
| `.text-label` | 12px | 500 | 16px | Form labels, badge text |
| `.text-caption` | 11px | 500 | 16px | Timestamps, metadata |
| `.text-metric-lg` | 28px | 700 | 32px | KPI numbers, score displays |

### 3.3 Typography Rules

- **Score numbers** always use `.text-metric-lg` with `tabular-nums` class
- **Department labels** always use `.text-label uppercase tracking-wider`
- **Action titles** use `.text-body-md font-medium` (not bold)
- **Section headings on results pages** use `.text-h3` max — never h1/h2 inside content panels
- Letter-spacing: use `tracking-tight` on h1/h2 only, `tracking-wider` on uppercase labels only

---

## 4. SPACING & LAYOUT

### 4.1 Spacing Scale (Tailwind defaults — use these only)

```
4px   = p-1, gap-1, m-1
8px   = p-2, gap-2, m-2
12px  = p-3, gap-3, m-3
16px  = p-4, gap-4, m-4   ← default card padding
24px  = p-6, gap-6        ← section spacing
32px  = p-8, gap-8        ← page section padding
```

### 4.2 Page Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px fixed) │  Main Content Area          │
│                        │  padding: px-6 lg:px-8      │
│  bg-sidebar            │  bg: neutral-050            │
│  border-r              │  max-w: 1400px mx-auto       │
└─────────────────────────────────────────────────────┘
```

- Sidebar width: 240px expanded, icon-only collapsed (matches existing `--sidebar-width`)
- Content max-width: 1400px
- Page top padding: `pt-6` (never more than 24px from header to first content)
- Card grid gaps: `gap-4` for dense dashboards, `gap-6` for relaxed layouts

### 4.3 Card Anatomy

```
┌─────────────────────────────────────┐  ← border border-border rounded-lg
│  px-4 pt-4 pb-2  (Card Header)     │  ← .text-h5 + optional badge/icon
│  ─────────────────────────────────  │  ← border-b border-border/50
│  px-4 py-4       (Card Content)    │  ← main data area
│  px-4 pb-4 pt-2  (Card Footer)     │  ← actions, timestamps (optional)
└─────────────────────────────────────┘
shadow-card (never shadow-lg or shadow-xl on cards)
```

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Score Ring / Gauge

The circular score display is the hero component of the tool.

```
Outer ring:    stroke-width 8, neutral-200 track
Score arc:     stroke-width 8, colour from score band (§2.3)
Score number:  .text-metric-lg, colour from score band
Label below:   .text-label uppercase tracking-wider, neutral-600
Confidence:    12px text below label, neutral-500, shown only if reviewRecommended=true
Size:          120px diameter (results page), 80px (dashboard cards), 48px (list items)
```

**Rule:** Never show a score ring without its label. Never animate the ring on every render — animate once on mount only (300ms ease-out).

### 5.2 Department Score Cards (Dashboard)

```
┌──────────────────────────────┐
│  [Dept colour bar, 4px top]  │
│  Score Ring (80px)  Dept name│  ← .text-h5
│                     NVS      │  ← .text-label uppercase dept colour
│  ── ── ── ── ── ── ── ── ──  │
│  3 key signal chips below    │  ← max 3, truncated
└──────────────────────────────┘
```

- Top border accent: 4px, department colour, `rounded-t-lg`
- No more than 3 signal chips per card
- Signal chips: `text-xs bg-muted rounded px-2 py-0.5`

### 5.3 Assessment Question Cards

**CRITICAL — Item 45 in tracker:** Neutral white tiles with left-border accent on selection only.

```
Unselected state:
┌────────────────────────────────────┐
│  border border-border              │
│  bg-white hover:bg-muted/20        │
│  Scale label (text-body-md)        │
│  Score indicator (text-label)      │
└────────────────────────────────────┘

Selected state:
┌────────────────────────────────────┐
│  border-l-4 border-l-primary      │  ← 4px left accent, brand-500
│  border border-primary/30         │
│  bg-primary/5                     │
│  Scale label (text-body-md font-medium)
│  Score indicator (text-label text-primary)
└────────────────────────────────────┘
```

**Never use coloured backgrounds (red/yellow/green) on unselected answer tiles.** This is anchoring bias. Colour appears only on the selected tile's left border.

### 5.4 Action Cards (Triage / Action Plan)

Priority indicator is a left border, not a coloured background.

```
Critical / Foundational:  border-l-4 border-l-destructive
High / Developing:        border-l-4 border-l-warning
Medium / Performing:      border-l-4 border-l-primary
Low:                      border-l-4 border-l-muted-foreground/30

Card body: bg-white, no coloured backgrounds
Time horizon badge: top-right, rounded-full, bg-muted text-label
```

Action card structure:
```
[Priority border] [Title .text-body-md font-medium]
                  [Context .text-body-sm text-muted-foreground, 2 lines max]
                  [Role chip] [KPI chip] [Time horizon badge]
                  [Expand chevron → steps by role]
```

### 5.5 KPI Benchmark Corridor Chart

This is the signature visual of the KPI Encyclopedia.

```
Layout:
[Min]  ─────[P25]▓▓▓▓▓▓▓▓▓▓▓[P75]─────  [Max]
                    ↑ Median
              [● Your estimated position]

Colour:  P25–P75 corridor = brand-200 fill
         Median tick = brand-600
         Dealer position = a dot, colour = score band colour
         Track = neutral-200

Height: 48px
Label row below: P25 / Median / P75 values in .text-caption
```

### 5.6 Systemic Pattern Cards

Surface BEFORE the action plan in results. These are the diagnostic insight layer.

```
Pattern type badge:
  Systemic (3+ depts):  bg-destructive/10 text-destructive border border-destructive/20
  Recurring (2 depts):  bg-warning/10 text-warning border border-warning/20

Card:
┌──────────────────────────────────────────┐
│  [Pattern badge]  [Signal name]          │
│  Affected: [Dept chip] [Dept chip]       │
│  One-line description .text-body-sm      │
└──────────────────────────────────────────┘
```

### 5.7 Navigation Sidebar

Current implementation is correct. Maintain:
- Active item: `bg-sidebar-accent text-sidebar-accent-foreground`
- Hover: `hover:bg-sidebar-accent/50`
- Icon size: 16px (`size-4`)
- Item height: 36px (`h-9`)
- Group label: `.text-caption uppercase tracking-wider text-sidebar-foreground/70`

Do not change the sidebar navigation structure — it is working.

### 5.8 Status Badges

```
Done:      bg-success/10 text-success border border-success/20
Partial:   bg-warning/10 text-warning border border-warning/20
Pending:   bg-info/10 text-info border border-info/20
Blocked:   bg-destructive/10 text-destructive border border-destructive/20
```

Always: `rounded-full px-2.5 py-0.5 text-label inline-flex items-center gap-1.5`
Status dot: `w-1.5 h-1.5 rounded-full bg-current`

### 5.9 Data Tables

```
Header row: bg-muted/50 text-label uppercase tracking-wider text-muted-foreground
Data rows:  bg-white hover:bg-muted/20 border-b border-border/50
Numbers:    text-right tabular-nums
Rank column: font-semibold text-muted-foreground (deemphasised)
Delta values: text-success (positive ↑) text-destructive (negative ↓) with arrow icon
```

---

## 6. CHART & DATA VIZ SPECIFICATIONS

### 6.1 Chart Library
Recharts — already bundled. Use only Recharts. Do not add Chart.js or D3 directly.

### 6.2 Colour Sequences

For multi-series charts, use department colours in this order:
1. NVS: #2563eb
2. UVS: #7c3aed
3. SVC: #0891b2
4. FIN: #059669
5. PTS: #d97706
6. Neutral series: #95a5b2 (neutral-400)

### 6.3 Chart Styling Rules

- Grid lines: `stroke="#e5e7eb" strokeDasharray="3 3"` (neutral-200, dashed)
- Axis labels: `.text-caption` equivalent (11px), `fill: hsl(var(--muted-foreground))`
- Tooltip: `bg-white border border-border shadow-elevated rounded-lg p-3`
- No chart titles inside the chart area — use card headers
- Legend: below chart only, horizontal, `.text-label`
- Bar charts: `radius={[4, 4, 0, 0]}` (rounded top only)
- Line charts: `strokeWidth={2}`, dots only on hover
- Radar/Spider: department fill with 20% opacity

### 6.4 The 5×5 Department × Root-Cause Heatmap (Item 32)

This is the most important missing visual. Specification:

```
           People  Process  Tools  Structure  Incentives
NVS        [cell]  [cell]   [cell]  [cell]    [cell]
UVS        [cell]  ...
SVC
FIN
PTS

Cell colours:
  Score ≥70:  bg-success/20 text-success
  Score 50–69: bg-warning/20 text-warning
  Score <50:  bg-destructive/20 text-destructive
  No data:    bg-muted/30 text-muted-foreground

Cell size: 72×56px minimum
Cell content: score number (text-metric variant, 18px) + optional icon
Header row/col: text-label uppercase bg-muted/50
```

---

## 7. ANIMATION & MOTION

### 7.1 Permitted Animations

```css
/* Page transitions */
.animate-fade-in { animation: fade-in 0.3s ease-out; }

/* Score ring mount */
stroke-dashoffset animation: 300ms ease-out, once on mount

/* Accordion (results page sections) */
accordion-down / accordion-up: 200ms ease-out (already defined)

/* Hover lift (cards only) */
.hover-lift: translateY(-2px) + shadow-md, 200ms
```

### 7.2 Animation Rules

- **Never** animate on every re-render — mount only
- **Never** use bounce, spin, or pulse on data elements (loading spinners excepted)
- Page load: stagger card reveals with `animation-delay: 50ms` increments, max 5 cards
- Score ring: draw once on results page load, do not re-animate on tab switch
- Transition duration: 150ms for hover states, 200ms for expand/collapse, 300ms for page transitions

---

## 8. ICONOGRAPHY

### 8.1 Icon Library
Lucide React — already bundled. Use only Lucide. No other icon libraries.

### 8.2 Icon Sizes

```
Navigation sidebar:  size-4 (16px)
Card headers:        size-4 (16px)
Inline with text:    size-3.5 (14px)
Hero / empty state:  size-8 (32px)
Alert / callout:     size-4 (16px)
```

### 8.3 Department Icons

```
NVS:  Car
UVS:  CarFront
SVC:  Wrench
FIN:  TrendingUp
PTS:  Package
```

### 8.4 Icon Rules

- Always pair icons with text labels (no icon-only buttons except sidebar collapsed state)
- Icon colour should match the text it accompanies — never add separate icon colours
- Stroke width: default (1.5) — do not override

---

## 9. FORMS & INPUTS

### 9.1 Input Fields

```
height: h-10 (40px)
border: border border-input rounded-md
focus: ring-2 ring-primary/30 border-primary
placeholder: text-muted-foreground
disabled: opacity-50 cursor-not-allowed
error: border-destructive ring-destructive/30
```

### 9.2 Select Dropdowns
Use shadcn/ui Select — already implemented. Do not replace with custom dropdowns.

### 9.3 Form Layout
- Label above input, always (never floating labels)
- Label: `.text-label mb-1.5`
- Helper text: `.text-caption text-muted-foreground mt-1`
- Error text: `.text-caption text-destructive mt-1`
- Form section gap: `space-y-4`

---

## 10. BUTTONS

### 10.1 Button Hierarchy

```
Primary:    bg-primary text-primary-foreground hover:bg-primary/90
Secondary:  bg-secondary text-secondary-foreground hover:bg-secondary/80
Outline:    border border-input bg-background hover:bg-accent hover:text-accent-foreground
Ghost:      hover:bg-accent hover:text-accent-foreground
Destructive: bg-destructive text-destructive-foreground hover:bg-destructive/90
```

### 10.2 Button Sizes

```
Default: h-10 px-4 py-2 text-sm
Small:   h-9 px-3 text-sm
Large:   h-11 px-8 text-base
Icon:    h-10 w-10 (square)
```

### 10.3 CTA Rules

- **One primary CTA per page section** maximum
- Assessment flow: primary button is always "Save & Continue" or "Complete Assessment"
- Results page: primary button is "Export PDF" — not "Start New Assessment" (that is secondary)
- Never use `bg-green-500` or `bg-red-500` directly on buttons — use semantic tokens

---

## 11. RESULTS PAGE LAYOUT (Item 47 — Critical UX Fix)

**Current problem:** 5-tab structure fragments the diagnostic narrative.
**Target state:** Single scrollable page with sticky section navigation.

### 11.1 Results Page Structure

```
┌─────────────────────────────────────────────────────┐
│  STICKY HEADER (64px)                               │
│  Dealer name · Assessment date · Export button      │
├─────────────────────────────────────────────────────┤
│  SECTION 1: Executive Narrative (no tab needed)     │
│  Overall score ring + 2-paragraph narrative         │
│  Score band badge + confidence indicator            │
├─────────────────────────────────────────────────────┤
│  SECTION 2: Department Heatmap (Hero Visual)        │
│  5×5 grid or 5 dept score bars                      │
│  THIS replaces the score ring as the hero           │
├─────────────────────────────────────────────────────┤
│  SECTION 3: Systemic Patterns (if any)              │
│  Pattern cards — BEFORE action plan                 │
├─────────────────────────────────────────────────────┤
│  SECTION 4: Action Plan (30/60/90 day columns)      │
│  Tiered by time horizon, role-addressable           │
├─────────────────────────────────────────────────────┤
│  SECTION 5: KPI Deep Dive (expandable)              │
│  Per-department, accordion                          │
└─────────────────────────────────────────────────────┘
```

**Sticky ToC** (right side, desktop only):
```
§1 Summary
§2 Departments
§3 Patterns
§4 Actions
§5 KPIs
```
Width: 160px, `text-caption`, active section highlighted with brand-500 left border.

---

## 12. EMPTY STATES (Item 48)

Every empty state must have:
1. A single icon (size-8, neutral-400)
2. A headline (`.text-h4`)
3. One-sentence description (`.text-body-md text-muted-foreground`)
4. One primary CTA button
5. Optional: 3 benefit callouts in a row below

```
Dashboard empty state:
Icon: BarChart3 (size-8)
Headline: "Start your first assessment"
Description: "Get a complete diagnostic of your dealership's performance in under 30 minutes."
CTA: "Begin Assessment" (primary button)
Benefits: [Weighted scoring] [Benchmark comparison] [Action plan]
```

---

## 13. LOVABLE PROMPT TEMPLATE

Use this template for every Lovable prompt:

```
DESIGN SYSTEM: Follow DESIGN.md exactly.
- Font: Roboto only
- Colours: Use CSS variables (--brand-500, --neutral-900, etc.), not hex values
- No new colour tokens, no gradients unless specified in DESIGN.md
- Cards: shadow-card, border, border-border, rounded-lg
- Score colours: success ≥70, warning 50–69, destructive <50
- Department colours: NVS=#2563eb, UVS=#7c3aed, SVC=#0891b2, FIN=#059669, PTS=#d97706
- Icons: Lucide React only, size-4 default
- Buttons: use shadcn/ui Button component with variant prop
- NO emoji in production UI (already fixed in items 42/43)

COMPONENT TASK:
[Your specific instruction here]

CONSTRAINTS:
- Do not touch files not mentioned in this prompt
- Do not modify tailwind.config.ts or index.css
- All new components go in src/components/[feature-name]/
```

---

## 14. WHAT NOT TO DO (Anti-Patterns)

These patterns have been explicitly identified as problems and must never be reintroduced:

| Anti-pattern | Why | Instead |
|---|---|---|
| Red/yellow/green coloured answer buttons | Anchoring bias | Neutral white tiles, left-border on selected only |
| Emoji in component UI | Unprofessional | Lucide React icons |
| "Time Sink" / "Fill-in" triage labels | Negative framing | "Low Priority" / "Maintenance" |
| "Assessment Complete — Here's What To Do Next" banner | Redundant | Clean results page |
| 5-tab results structure | Fragments narrative | Single scrollable page (pending) |
| Purple gradients on white | SaaS cliché | Brand blue accents on white/neutral-050 |
| Score ring as hero visual | Wrong hierarchy | Department heatmap as hero |
| Collapsed context accordions in assessment | Hidden information | Persistent right-column panel |
| Generic "Poor/Fair/Good/Very Good/Excellent" scale labels | Non-diagnostic | Specific measurable thresholds |

---

## 15. FILE LOCATIONS

```
src/
  components/
    ui/              ← shadcn/ui base components — do not modify
    assessment/      ← CategoryAssessment, QuestionCard, ScoreRing
    results/         ← ResultsPage, ActionSheet, ExecutiveNarrative
    dashboard/       ← DashboardPage, DepartmentCard, NetworkDashboard
    kpi/             ← KPIStudio, BenchmarkCorridor, CausalChain
    shared/          ← StatusBadge, DepartmentBadge, ConfidenceIndicator
  data/
    assessmentQuestions.ts   ← question bank with scale labels
    signalEngine.ts          ← deterministic signal → action mapping
    actionTemplatesTiered.ts ← NEW: tiered templates (items 20/21/22)
    kpiDefinitions.ts        ← KPI encyclopedia data
    narrativeTemplates.ts    ← executive narrative paragraph variants
    crossValidationRules.ts  ← cross-question validation logic
    ceilingAnalysis.ts       ← high-scorer ceiling insights
  lib/
    i18n.ts          ← translations (EN/DE complete, FR/ES/IT partial)
    scoring.ts       ← weighted scoring, confidence intervals
```

---

*This file was generated by analysing the live production CSS at dealership-performance-assessment-t.vercel.app and cross-referencing all 53 tracker items. Update this file before any major UI sprint.*
