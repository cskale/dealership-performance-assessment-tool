# DESIGN.md — Dealer Diagnostic Platform
## Visual Language & Component Specification
### Version 4.0 · 8 May 2026 · Reference this file in every Lovable prompt

> **v4 changes (May 2026):** 18 new sections added (§17–§34): display typography & OpenType features, surface hierarchy, permitted gradient model, background texture, custom icon language & maturity marks, score ring instrument spec, premium motion choreography, precision header pattern, number formatting, skeleton states, actor-context banner, tier badge system, benchmark corridor upgrade, data density modes, focus ring & accessibility, PDF/print spec, micro-copy tone rules, responsive breakpoints. Canonical score threshold rule added to §2.3. Seven new anti-patterns added to §15. See §16 for full change log.
>
> **v3 changes (Apr 2026):** Action card priority borders → uniform brand blue only; department abbreviations removed from display UI (full names everywhere); card top-bar accents → uniform brand blue; heatmap cell colours → soft tint palette; question tile font sizes increased + centre-aligned; Inter confirmed as primary font; department badges removed from UI. See §16 for full change log.

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
--brand-500: 213 97% 55%;   /* #1D7AFC — primary buttons, active states */
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

> **CANONICAL THRESHOLD RULE — all components must use exactly these boundaries.**
> Score ring, dashboard cards, heatmap cells, status badges, PDF export — every component in the codebase derives its color from this table and no other. `score >= 85` → Advanced · `score >= 70` → Performing · `score >= 46` → Developing · `score < 46` → Foundational. If you see `score >= 80` or `score >= 60` anywhere in the code it is a bug. See §22 for the full score ring instrument specification.

### 2.4 Department Colours (Charts only — NOT used in card UI accents)

```
NVS (New Vehicle Sales):    #2563eb  blue-600
UVS (Used Vehicle Sales):   #7c3aed  violet-700
SVC (Service):              #0891b2  cyan-700
FIN (Financial):            #059669  emerald-600
PTS (Parts):                #d97706  amber-600
```

**v3 rule:** Department colours are used ONLY in charts, data visualisations, and the heatmap row labels. They must NOT be used for card top-bar accents or left-border priority indicators — those use brand blue (`--brand-500`) only.

### 2.5 Colour Rules

- **Never** use purple gradients on white. This is a SaaS cliché.
- **Never** use more than 2 brand colours in any single component.
- Background pages use `--neutral-050` (#f4f6f8), not pure white.
- Cards use `--background` (white) on the neutral-050 page background.
- Dark mode uses the existing `.dark` variables — do not add new dark mode tokens.
- Data visualisations use the department colour scale above + neutral greys for non-highlighted series.
- **Department card top-bar accents:** always `--brand-500` (#1D7AFC), never per-department colour.
- **Gradient permission model:** tonal (same-hue lightness variation) gradients are permitted in specific instrument contexts — score ring arc, sidebar active indicator, PDF header band. Multi-hue decorative gradients are banned absolutely. Full specification in §19.

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

**Primary font: Inter** (v3 confirmation — Inter is the canonical font).

```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
body { font-family: 'Inter', system-ui, sans-serif; }
```

```ts
// tailwind.config.ts
fontFamily: { sans: ['"Inter"', 'system-ui', 'sans-serif'], mono: ['"DM Mono"', 'monospace'] }
```

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
- **Department labels** when shown: always use `.text-label uppercase tracking-wider` with full name, never abbreviation
- **Action titles** use `.text-body-md font-medium` (not bold)
- **Section headings on results pages** use `.text-h3` max — never h1/h2 inside content panels
- Letter-spacing: use `tracking-tight` on h1/h2 only, `tracking-wider` on uppercase labels only
- **OpenType features:** enable `font-feature-settings: "kern" 1, "liga" 1, "calt" 1` on body. Add `"cv01" 1, "cv02" 1` on display headings (single-storey 'a' and 'g' — reads as more engineered). Full specification in §17.
- **Negative tracking on headings is mandatory:** h1 `−0.03em`, h2 `−0.025em`, h3 `−0.015em`, h4 `−0.01em`. Positive tracking is for `text-label uppercase` only.
- **font-optical-sizing: auto** must be set on h1 and h2 to activate Inter Display optical corrections at large sizes.
- **All numeric values** (scores, KPIs, currency, percentages, deltas) must carry `font-variant-numeric: tabular-nums lining-nums`. Apply `.numeric` utility class. See §25 for full number formatting rules.

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
┌─────────────────────────────────────┐  ← NO border · shadow-card · rounded-xl · bg-white
│  px-5 pt-5 pb-2  (Card Header)     │  ← .text-h5 + optional badge/icon
│  ─────────────────────────────────  │  ← border-b border-border/50
│  px-5 py-5       (Card Content)    │  ← main data area
│  px-5 pb-5 pt-2  (Card Footer)     │  ← actions, timestamps (optional)
└─────────────────────────────────────┘
```

Cards float on `bg-neutral-100` page background. Never use `shadow-lg` or `shadow-xl` on cards.

```
shadow-card:    0 1px 3px 0 rgb(15 23 42 / 0.06), 0 4px 12px 0 rgb(15 23 42 / 0.05)
shadow-elevated:0 4px 16px 0 rgb(15 23 42 / 0.08), 0 1px 4px 0 rgb(15 23 42 / 0.04)
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
│  [Brand blue bar, 4px top]   │  ← always --brand-500, never per-dept colour
│  Score Ring (80px)  Dept name│  ← .text-h5, full name (e.g. "New Vehicle Sales")
│  ── ── ── ── ── ── ── ── ──  │
│  3 key signal chips below    │  ← max 3, truncated
└──────────────────────────────┘
```

- Top border accent: 4px, **brand-500 only** (`#1D7AFC`), `rounded-t-lg`
- Department name: always full name ("New Vehicle Sales", not "NVS")
- No more than 3 signal chips per card
- Signal chips: `text-xs bg-muted rounded px-2 py-0.5`

### 5.3 Assessment Question Cards

**CRITICAL:** Neutral white tiles with left-border accent on selection only.

```
Unselected state:
┌────────────────────────────────────┐
│  border border-border              │
│  bg-white hover:bg-muted/20        │
│  Scale label (text-body-md 12.5px) │  ← min 12.5px, centre-aligned
│  Score indicator (text-label)      │
└────────────────────────────────────┘

Selected state:
┌────────────────────────────────────┐
│  border-l-4 border-l-primary      │  ← 4px left accent, brand-500
│  border border-primary/30         │
│  bg-primary/5                     │
│  Scale label (text-body-md font-medium, centre-aligned)
│  Score indicator (text-label text-primary)
└────────────────────────────────────┘
```

- Question text: minimum **16px / font-weight 700**
- Option label text: minimum **12.5px**, centre-aligned within tile
- Rating number: top-centre, `text-caption text-muted-foreground`
- **Never use coloured backgrounds (red/yellow/green) on unselected answer tiles.** Colour appears only on the selected tile's left border.

### 5.4 Action Cards (Triage / Action Plan)

**v3 rule:** All action cards use a single uniform left border colour. No priority colour-coding on the border.

```
All priorities:  border-l-4 border-l-brand-500   ← always #1D7AFC, uniform

Card body: bg-white, no coloured backgrounds
Time horizon badge: top-right, rounded-full, bg-muted text-label
Department chip: full name only ("New Vehicle Sales", not "NVS")
```

Action card structure:
```
[Brand blue border] [Title .text-body-md font-medium]
                    [Context .text-body-sm text-muted-foreground, 2 lines max]
                    [Full dept name chip] [Role chip] [Time horizon badge]
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

Surface BEFORE the action plan in results.

```
Pattern type badge:
  Systemic (3+ depts):  bg-destructive/10 text-destructive border border-destructive/20
  Recurring (2 depts):  bg-warning/10 text-warning border border-warning/20

Card:
┌──────────────────────────────────────────┐
│  [Pattern badge]  [Signal name]          │
│  Affected: [Full dept name] [Full dept name]
│  One-line description .text-body-sm      │
└──────────────────────────────────────────┘
```

Affected department chips: full names only, brand-500 tint background.

### 5.7 Navigation Sidebar

Shell `bg-[hsl(var(--dd-midnight))]` — unchanged. Active state refined in v2.

| State | Classes |
|---|---|
| Active item | `bg-brand-500/10 border-r-2 border-brand-500 text-white` |
| Inactive item | `text-white/55` |
| Inactive hover | `bg-white/5 text-white/85` |

- Icon size: 16px (`size-4`). Item height: 36px (`h-9`).
- Group label: `.text-caption uppercase tracking-wider text-white/25`
- Never hardcode `hsl(221,82%,51%)` — use `hsl(var(--brand-500))`.

### 5.8 Status Badges

```
Done:      bg-success/10 text-success border border-success/20
Partial:   bg-warning/10 text-warning border border-warning/20
Pending:   bg-info/10 text-info border border-info/20
Blocked:   bg-destructive/10 text-destructive border border-destructive/20
```

Style: `rounded-md px-2.5 py-1 text-label inline-flex items-center gap-1.5`
(Note v3: `rounded-md` preferred over `rounded-full` for a more enterprise look)
Status dot: `w-1.5 h-1.5 rounded-full bg-current`

**No department abbreviation badges.** Department identity is communicated via full name chips only.

### 5.9 Data Tables

```
Header row: bg-muted/50 text-label uppercase tracking-wider text-muted-foreground
Data rows:  bg-white hover:bg-muted/20 border-b border-border/50
Numbers:    text-right tabular-nums
Rank column: font-semibold text-muted-foreground (deemphasised)
Delta values: text-success (positive ↑) text-destructive (negative ↓) with arrow icon
```

### 5.10 Department × KPI Heatmap

**v3:** Heatmap cells use soft tint palette — never full-saturation score band colours.

```
Cell colours (v3 — soft tints):
  Score ≥85:  bg:#dcf3e8  text:#166534  border:#bbdece  (soft green)
  Score 70–84: bg:#dbeafe  text:#1e40af  border:#bfdbfe  (soft blue)
  Score 46–69: bg:#fef3c7  text:#92400e  border:#fde68a  (soft amber)
  Score 0–45:  bg:#fee2e2  text:#991b1b  border:#fecaca  (soft red)
  No data:     bg:#F1F2F4  text:#97A0AF  border:transparent

Cell size: 72×56px minimum
Cell content: score number (12px bold tabular-nums)
Header row/col: text-label uppercase bg-muted/50
Row labels: department abbreviation in dept colour (chart context only — acceptable here)
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

## 11. RESULTS PAGE LAYOUT

**Target state:** Single scrollable page with sticky section navigation.

### 11.1 Results Page Structure

```
┌─────────────────────────────────────────────────────┐
│  STICKY HEADER (64px)                               │
│  Dealer name · Assessment date · Export button      │
├─────────────────────────────────────────────────────┤
│  SECTION 1: Executive Narrative                     │
│  Overall score ring + 2-paragraph narrative         │
│  Score band badge + confidence indicator            │
├─────────────────────────────────────────────────────┤
│  SECTION 2: Department Performance (Hero Visual)    │
│  5×5 KPI heatmap (soft tint colours — see §5.10)   │
├─────────────────────────────────────────────────────┤
│  SECTION 3: Systemic Patterns (if any)              │
│  Pattern cards — BEFORE action plan                 │
├─────────────────────────────────────────────────────┤
│  SECTION 4: Action Plan (30/60/90 day columns)      │
│  Uniform blue left border · full dept names         │
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

## 12. EMPTY STATES

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

## 13. NAMING & COPY CONVENTIONS

**Department names — always use full names in UI:**

| Full name | Abbreviation (charts/heatmap row labels only) |
|---|---|
| New Vehicle Sales | NVS |
| Used Vehicle Sales | UVS |
| Service | SVC |
| Financial Operations | FIN |
| Parts | PTS |

**Score bands — always use these names:**

| Score | Band name |
|---|---|
| 0–45 | Foundational |
| 46–69 | Developing |
| 70–84 | Performing |
| 85–100 | Advanced |

Never: "Poor", "Fair", "Good", "Excellent", "Very Good"

---

## 14. LOVABLE PROMPT TEMPLATE

Use this template for every Lovable prompt:

```
DESIGN SYSTEM: Follow DESIGN.md v3 exactly.
- Font: Inter only
- Colours: Use CSS variables (--brand-500, --neutral-900, etc.), not hex values
- No new colour tokens, no gradients unless specified in DESIGN.md
- Cards: shadow-card, NO border prop, rounded-xl, bg-white on bg-neutral-100 page
- Department labels: FULL NAMES only (New Vehicle Sales, Used Vehicle Sales, Service, Parts, Financial Operations)
- NO department abbreviation badges (NVS/UVS/SVC/FIN/PTS chips are chart-context only)
- Score colours: success ≥70, warning 50–69, destructive <50
- Brand blue #1D7AFC (--brand-500) is the sole metric, accent, and UI border colour
- Action card left borders: always brand-500 only — no priority colour-coding
- Department card top bars: always brand-500 only — no per-department colour
- Heatmap cells: soft tint palette (see §5.10) — never full-saturation colours
- Question tiles: 16px question text, 12.5px option text, centre-aligned content
- Icons: Lucide React only, size-4 default
- Buttons: use shadcn/ui Button component with variant prop
- NO emoji in production UI

COMPONENT TASK:
[Your specific instruction here]

CONSTRAINTS:
- Do not touch files not mentioned in this prompt
- Do not modify tailwind.config.ts or index.css
- All new components go in src/components/[feature-name]/
```

---

## 15. WHAT NOT TO DO (Anti-Patterns)

| Anti-pattern | Why | Instead |
|---|---|---|
| Red/yellow/green coloured answer buttons | Anchoring bias | Neutral white tiles, left-border on selected only |
| Emoji in component UI | Unprofessional | Lucide React icons |
| "Time Sink" / "Fill-in" triage labels | Negative framing | "Low Priority" / "Maintenance" |
| 5-tab results structure | Fragments narrative | Single scrollable page |
| Purple gradients on white | SaaS cliché | Brand blue accents on white/neutral-050 |
| Score ring as hero visual | Wrong hierarchy | Department heatmap as hero |
| Collapsed context accordions in assessment | Hidden information | Persistent right-column panel |
| Generic "Poor/Fair/Good/Very Good/Excellent" scale labels | Non-diagnostic | Specific measurable thresholds |
| Department abbreviations (NVS/UVS/SVC/FIN/PTS) in display UI | Jargon | Full department names |
| Per-department coloured card top bars | Visual noise, inconsistent | Uniform brand-500 blue |
| Priority colour-coded action card borders (red/amber/blue) | Distracting, inconsistent | Uniform brand-500 blue border |
| Full-saturation heatmap cell colours | Harsh, unprofessional | Soft tint palette (see §5.10) |
| Department abbreviation badges as UI chips | Jargon | Full name chips in neutral style |
| Small question tile text (<12px options) | Legibility | Min 12.5px, centre-aligned |
| Default Inter without OpenType features | Reads as generic SaaS | Enable `cv01`, `cv02`, `kern`, `liga`, `calt` — see §17 |
| Flat stroke color on score ring arc | Looks like a progress bar, not an instrument | Tonal gradient arc — see §22 |
| `score >= 80` or `score >= 60` thresholds in code | Drifts from canonical bands | Always use ≥85/≥70/≥46 from §2.3 |
| Inline styles for banners, alerts, callouts | Bypasses design system, unresponsive | Use design token classes; raw `style={{}}` blocks are banned on UI surfaces |
| "Something went wrong" error messages | Destroys trust in a professional context | State exactly what failed and what to do — see §33 |
| Missing `:focus-visible` outline on interactive elements | Breaks keyboard navigation for power users | `outline: 2px solid hsl(var(--brand-500)); outline-offset: 2px` on all interactive elements — see §31 |

---

## 16. CHANGE LOG

### v4.0 — 8 May 2026

**System-level additions for OEM-grade production quality:**

- **§17 Display Typography & OpenType Features** — Inter Display optical variant, `cv01`/`cv02` alternates, negative heading tracking, `font-optical-sizing: auto`, `.numeric` utility class
- **§18 Surface Hierarchy & Elevation System** — Five named surface levels replacing the two-shadow system; `shadow-overlay` and `shadow-floating` tokens added
- **§19 Permitted Gradient Model** — Tonal gradients permitted (score arc, sidebar indicator, PDF header); multi-hue decorative gradients banned absolutely
- **§20 Background Texture & Depth** — SVG noise grain at 3% opacity for page backgrounds; dot-grid for data surfaces; chart area inset spec
- **§21 Custom Icon Language & Maturity Marks** — Technical line-art spec for 5 department SVG icons; 4 maturity band geometric emblems; OEM tier emblem brief
- **§22 Score Ring Instrument Specification** — Tonal gradient arc, track tick marks at band thresholds, terminus glow animation, confidence hatch fill, size-per-context table
- **§23 Premium Motion Choreography** — Full ms-precise sequences for Results page reveal and OEM Dashboard load; sidebar nav transition; table row hover; score delta flash; reduced-motion override
- **§24 Precision Page Header Pattern** — Bloomberg-style stat strip below dividing rule; per-page stat definitions for Results, OEM Dashboard, Coach Dashboard
- **§25 Number & Currency Formatting** — Locale-aware currency (de-DE vs en-US), K/M suffixes, delta sign rules, date display formats
- **§26 Skeleton & Loading State Specification** — Shimmer animation CSS, named skeleton shapes, timing rules, Loading vs Empty vs Error distinction
- **§27 Actor-Context Banner** — Sticky 40px banner for coach/OEM cross-actor navigation; visual spec, mount animation, z-index coordination
- **§28 Network Tier Badge System** — OKLCH color tokens for Standard/Silver/Gold/Platinum; `rounded-md` shape; quality-mark dot prefix
- **§29 Benchmark Corridor Upgrade** — Box-and-whisker with prior period hollow marker; prior period tooltip spec; height-per-context table
- **§30 Data Density Modes** — Compact and Comfortable variants; `.density-compact` CSS modifier; per-surface density assignment table
- **§31 Focus Ring & Accessibility Tokens** — `:focus-visible` spec; WCAG AA contrast audit (warning color on white fails — fix documented); ARIA requirements per component type; `prefers-reduced-motion` override
- **§32 PDF/Print Surface Specification** — A4 portrait/landscape; header/footer anatomy; PDF typography sizes; CMYK-safe color mapping; watermark spec
- **§33 Micro-copy Tone Rules** — Error message format (`[what failed] — [cause] · [action]`); empty state format; score band language; button label rules; confirmation message rules
- **§34 Responsive Breakpoints** — Named breakpoints; primary usage contexts; per-component collapse rules; explicit h1/h2 mobile type scaling (no `clamp()` elsewhere)

**Fixes to existing sections:**
- §2.3: Canonical threshold rule box added — locks all components to ≥85/≥70/≥46/\<46
- §2.5: Gradient permission reference added (tonal permitted, see §19)
- §3.3: OpenType feature rules, negative tracking mandates, `font-optical-sizing: auto`, `.numeric` class requirement
- §15: Seven new anti-pattern rows: default Inter, flat score ring, wrong thresholds, inline styles on UI surfaces, vague error messages, missing focus rings

### v3.0 — 28 April 2026
- **Action card borders:** Changed from priority colour-coding (red/amber/blue) to uniform `--brand-500` on all cards
- **Department card top bars:** Changed from per-department colour to uniform `--brand-500`
- **Department abbreviations:** Removed from all display UI. Full names required everywhere. Abbreviations remain valid only in chart axis labels and heatmap row labels
- **Department abbreviation badges:** Removed entirely from badge system
- **Heatmap cell colours:** Changed from full-saturation score band colours to soft tint palette (§5.10)
- **Question tile typography:** Increased question text to 16px/700, option text to 12.5px, content centre-aligned
- **Font:** Inter confirmed as canonical primary font (Roboto not used)
- **Status badge shape:** Updated preference to `rounded-md` over `rounded-full` for enterprise consistency

### v2.0 — 22 April 2026
- Font → Inter (replaced Roboto)
- Cards → soft shadow (no border)
- Page background → `neutral-100`
- Sidebar active state refined
- Department labels → full names in results/action context
- Brand blue `#1D7AFC` confirmed as sole accent metric colour

---

---

## 17. DISPLAY TYPOGRAPHY & OPENTYPE FEATURES

### 17.1 Inter Display Optical Variant

For headings at ≥32px (`text-h1`, `text-h2`), request the Inter variable font with the `opsz` optical-size axis. It produces tighter stroke contrast and reduced spacing optimised for large display sizes. Update the Google Fonts import:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..800;1,14..32,400..800&display=swap');
```

Set `font-optical-sizing: auto` on `h1` and `h2` elements to activate the optical corrections automatically.

### 17.2 OpenType Feature Settings

Apply per context — not globally:

```css
/* Hero headings (h1, h2, score display) */
.font-display {
  font-optical-sizing: auto;
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "cv01" 1, "cv02" 1;
  /* cv01 = single-storey 'a'  ·  cv02 = single-storey 'g'  — reads as more engineered */
}

/* All numeric values — scores, KPIs, currency, percentages, deltas */
.numeric {
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}

/* Body text — baseline legibility */
body {
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 17.3 Heading Tracking Rules

```
.text-h1  { letter-spacing: -0.030em;  font-weight: 800; font-optical-sizing: auto; }
.text-h2  { letter-spacing: -0.025em;  font-weight: 700; font-optical-sizing: auto; }
.text-h3  { letter-spacing: -0.015em;  font-weight: 700; }
.text-h4  { letter-spacing: -0.010em;  font-weight: 700; }
.text-h5  { letter-spacing:  0;        font-weight: 700; }
```

Negative tracking on headings is mandatory. Positive tracking (`tracking-wider`) is reserved exclusively for `text-label uppercase` contexts.

### 17.4 Brand Ink Color

A near-black with a cold blue tint distinct from the neutral scale. Used exclusively for the most authoritative display text: overall score headline, OEM network name, PDF report title.

```css
--brand-ink: oklch(0.18 0.03 258);
```

Apply as `color: oklch(var(--brand-ink))` on `.text-h1` within Results hero, OEM dashboard title, and PDF cover. Never on body text or secondary headings.

### 17.5 Anti-Pattern Note

The "AI slop" test flags **Inter at default settings** — weight 400, zero letter-spacing, no OpenType features, uniform padding everywhere. This is not a flag against Inter the font. Inter with the settings above is correct. Inter without them reads as generic SaaS. The distinction: **default Inter = slop · configured Inter = precision instrument.**

---

## 18. SURFACE HIERARCHY & ELEVATION SYSTEM

Five named surface levels replace the previous two-shadow system. Every component must declare which surface it occupies.

### 18.1 Surface Levels

| Level | Name | Background | Shadow token | Use cases |
|---|---|---|---|---|
| 0 | Page | `neutral-050` | none | Page background, main layout |
| 1 | Section | `white` | `shadow-card` | Content cards, data panels |
| 2 | Elevated | `white` | `shadow-elevated` | Focused cards, active/selected states |
| 3 | Overlay | `white` | `shadow-overlay` | Modals, side sheets, drawers |
| 4 | Floating | `white` | `shadow-floating` | Tooltips, dropdowns, popovers, command menus |

### 18.2 New Shadow Tokens (add to `index.css`)

```css
--shadow-card:     0 1px 3px 0 rgb(15 23 42 / 0.06), 0 4px 12px 0 rgb(15 23 42 / 0.05);
--shadow-elevated: 0 4px 16px 0 rgb(15 23 42 / 0.08), 0 1px 4px 0 rgb(15 23 42 / 0.04);
--shadow-overlay:  0 8px 32px 0 rgb(15 23 42 / 0.12), 0 2px 8px 0 rgb(15 23 42 / 0.06);
--shadow-floating: 0 4px 6px -1px rgb(15 23 42 / 0.10), 0 2px 4px -1px rgb(15 23 42 / 0.06);
```

### 18.3 Nesting Rule

Never nest two components at the same surface level. A card (Surface 1) inside another card (Surface 1) is always wrong. A panel (Surface 1) containing an elevated selection card (Surface 2) is correct.

### 18.4 Modal Backdrop

```css
.modal-backdrop {
  background: rgb(15 23 42 / 0.40);
  backdrop-filter: blur(4px);
}
```

Heavy frosted glass (`blur(20px)` or above) is banned per §15.

---

## 19. PERMITTED GRADIENT MODEL

This section supersedes the blanket gradient prohibition and replaces it with a precise permission model.

### 19.1 Permitted

**Tonal gradients** — same hue, lightness variation only. Permitted in specific instrument contexts:

```css
/* Score ring arc — tonal, same hue */
/* SVG linearGradient: brand-500 at 0% → brand-500 at 60% opacity at 100% */

/* Sidebar active indicator */
.sidebar-active-indicator {
  background: linear-gradient(180deg,
    hsl(var(--brand-500)) 0%,
    hsl(var(--brand-600)) 100%
  );
}

/* PDF report header band */
.pdf-header-rule {
  background: linear-gradient(90deg,
    hsl(var(--brand-500)) 0%,
    hsl(var(--brand-600)) 100%
  );
  height: 4px;
}
```

**Directional noise grain** — SVG `feTurbulence` filter at ≤3% opacity over page backgrounds only. See §20.

**Radial terminus glow** — score ring only, mount animation only, fades to transparent. See §22.3.

### 19.2 Banned Absolutely

- Multi-hue decorative gradients (blue → purple, blue → teal, any rainbow)
- Gradient text (`background-clip: text` + gradient)
- Mesh gradients
- Glassmorphism cards (blur + gradient + transparency combined)
- Any gradient on card backgrounds, button faces, or body text
- Looping animated gradients

### 19.3 Rule of Thumb

If the gradient would look at home in a generic SaaS landing page, it is banned here. Permitted gradients add depth to a specific instrument element — they are not decoration.

---

## 20. BACKGROUND TEXTURE & DEPTH

Flat color on large surfaces reads as unfinished at high resolution. Subtle texture adds material depth without visual noise.

### 20.1 Page Background Grain

Applied to `<main>` page background only — never on cards, interactive elements, or text.

```css
.bg-surface-grain {
  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"),
    hsl(var(--neutral-050));
}
```

Opacity is calibrated at `0.03`. At `0.04` it is visible as texture; at `0.02` it is imperceptible; `0.03` is the correct value and must not be changed.

### 20.2 Data Surface Grid

For OEM Dashboard and table-heavy pages, a subtle dot grid adds spatial structure to wide data areas. Apply as a `::before` pseudo-element on chart container backgrounds — not on the page itself.

```css
.bg-data-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, hsl(var(--neutral-300)) 0.5px, transparent 0.5px);
  background-size: 24px 24px;
  opacity: 0.35;
  pointer-events: none;
}
```

### 20.3 Chart Area Inset

Charts sit in a slightly recessed surface to signal they are a data display area, not a floating card.

```css
.chart-area {
  background: hsl(var(--neutral-100));
  box-shadow: inset 0 1px 3px rgb(15 23 42 / 0.04);
  border-radius: 8px;
  padding: 16px;
}
```

### 20.4 Rules

- Grain texture: page backgrounds only
- Grid texture: data/chart surfaces only  
- Never stack grain + grid on the same surface
- Print/PDF: all texture stripped — print surfaces are flat (see §32)

---

## 21. CUSTOM ICON LANGUAGE & MATURITY MARKS

### 21.1 Department Icons

The five department icons are the most-viewed custom graphics in the tool. They must not look like generic Lucide icons repurposed from an icon pack. The design language is **technical line art** — 0.8px effective stroke, architectural, drawn on a 24×24 grid with 8px safe margin. Pure SVG outlines, no fills.

| Department | Icon concept | Geometry |
|---|---|---|
| New Vehicle Sales | Premium sedan front elevation | Contour only: hood line, A-pillar, roofline arc. No wheels, no windows. |
| Used Vehicle Sales | Rotation arc with two vehicle silhouettes | Two simplified vehicle profiles on a 180° rotation arc |
| Service | Torque wrench in isometric elevation | Single-stroke, angular construction — no fills |
| Financial Operations | Stepped area chart with rising terminal | Bloomberg-chart thumbnail aesthetic, not a generic arrow |
| Parts | Exploded assembly diagram | Three components separated by gap lines with dimension arrows |

Storage: `src/assets/icons/dept/` — SVG only, no PNG exports.

Lucide icons remain for all utility purposes (navigation, actions, status). Only the five department identity icons receive custom treatment.

### 21.2 Maturity Band Marks

Four geometric emblems used in Results page department headers, maturity scoring component, and PDF exports. Each is a 32×32 SVG, monochrome, filled with the score band color at point of use.

| Band | Mark | Description |
|---|---|---|
| Foundational | Concentric squares | Three nested squares — building blocks, foundation metaphor |
| Developing | Upward spiral | Archimedean spiral with upward terminus — momentum |
| Performing | Interlocking rings | Two circles overlapping at center — machine precision |
| Advanced | Diamond with internal grid | Diamond outline with 3×3 internal grid lines — crystalline structure |

Storage: `src/assets/icons/maturity/`

Rules: never animated, never colored with anything other than the §2.3 score band color, minimum display size 24×24px.

### 21.3 OEM Tier Emblems (future)

Four small emblems for the network tier system (Standard/Silver/Gold/Platinum). When designed, they should reference precision manufacturing quality marks — not generic star/medal iconography. Design brief: "quality assurance mark from a German engineering standard." Storage: `src/assets/icons/tiers/`.

---

## 22. SCORE RING INSTRUMENT SPECIFICATION

This section supersedes the basic ring description in §5.1.

### 22.1 Tonal Gradient Arc

The score arc uses a tonal gradient (§19) rather than a flat stroke color, adding visual depth to the swept area.

```jsx
// SVG defs — place once per ring instance
<defs>
  <linearGradient id={`scoreGrad-${id}`} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stopColor={bandColor} stopOpacity="1" />
    <stop offset="100%" stopColor={bandColor} stopOpacity="0.6" />
  </linearGradient>
</defs>
// Arc stroke: stroke={`url(#scoreGrad-${id})`}
```

### 22.2 Track Tick Marks

Four calibration marks on the background ring track at band boundaries:

```
Position 46/100  → Foundational/Developing boundary
Position 70/100  → Developing/Performing boundary
Position 85/100  → Performing/Advanced boundary
Position 100/100 → Maximum
```

Each tick: `2px × 4px` rect, `neutral-300`, positioned via SVG transform rotate. Include `<title>` for screen readers: "Benchmark threshold: [Band name]."

### 22.3 Terminus Glow

On mount animation completion, emit a single radial glow at the arc terminus — one-time per assessment load, never on re-render or tab switch:

```css
@keyframes scoreGlow {
  0%   { opacity: 0.6; r: 3px; }
  100% { opacity: 0;   r: 8px; }
}
.score-terminus-glow { animation: scoreGlow 400ms ease-out forwards; }
```

### 22.4 Confidence Hatch

When `reviewRecommended: true`, render a hatched region over the background track in the uncertainty range (±8 points around the score):

```
Hatch fill: diagonal lines, 45°, 1px stroke, neutral-300, 20% opacity
Range:      [score − 8] to [score + 8] on the track arc
```

### 22.5 Sizes and Contexts

```
Results page hero:    120px diameter — gradient arc, tick marks, terminus glow
Department summary:   80px diameter  — gradient arc, no ticks, no glow
Dashboard card:       80px diameter  — flat arc (no gradient), no ticks
List / leaderboard:   48px diameter  — flat arc, no ticks, no glow
OEM leaderboard row:  40px diameter  — flat arc colored by band, no extras
```

---

## 23. PREMIUM MOTION CHOREOGRAPHY

This section specifies exact animation sequences for the two primary user moments. All other animations follow §7.

### 23.1 Results Page Reveal Sequence

```
T +   0ms  Page background fades in (150ms ease-out)
T + 100ms  Score ring track appears — background circle only, no arc (80ms fade)
T + 100ms  Page title + date slide up: translateY(8px → 0) + opacity(0 → 1), 200ms ease-out
T + 100ms  Score arc begins drawing from 0 → final score (1200ms ease-out-quint)
T + 500ms  Summary metric card 1 cascades in
T + 600ms  Summary metric card 2 cascades in
T + 700ms  Summary metric card 3 cascades in
T + 800ms  Summary metric card 4 cascades in
           Each card: translateY(12px → 0) + opacity(0 → 1), 250ms ease-out
T + 800ms  FreshnessBadge fades in (150ms)
T + 900ms  Executive narrative block fades in (250ms)
T +1300ms  Score arc reaches final position
T +1300ms  Terminus glow fires — 400ms, once (§22.3)
T +1500ms+ Section headers below fold: visible on scroll-enter, 100ms each
```

### 23.2 OEM Dashboard Load Sequence

```
T +   0ms  Network summary strip fades in (200ms ease-out)
T + 150ms  Leaderboard rows cascade in — 30ms stagger for rows 1–5, 20ms for rows 6–10
           Each row: translateY(6px → 0) + opacity(0 → 1), 180ms ease-out
T + 300ms  Rank number counters start (0 → value, 600ms ease-out-quart)
T + 500ms  Benchmark corridors draw left-to-right (400ms ease-out-quint, 50ms stagger)
T + 700ms  Score band badges fade in (100ms each, 30ms stagger)
```

### 23.3 Sidebar Navigation Transition

When the active route changes, the active indicator slides vertically rather than snapping:

```css
.sidebar-active-indicator {
  transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 23.4 Table Row Hover

```css
tr:hover {
  background: hsl(var(--brand-050));
  border-left: 2px solid hsl(var(--brand-500));
  transition: background 100ms, border-left-color 100ms;
}
```

No lift (`translateY`), no shadow increase. Tables do not float.

### 23.5 Score Delta Flash

When a score loads alongside a prior-period value, the delta briefly highlights before settling:

```
Positive delta: flashes text-success-foreground → settles to normal delta display (200ms)
Negative delta: flashes text-destructive-foreground → settles (200ms)
No prior data:  no animation
```

One-time per page load. Never on user interaction.

### 23.6 Absolute Animation Bans

- No bounce, elastic, or spring easing on data elements
- No looping animations on any dashboard element (loading spinners during load only)
- No scroll-jacking or parallax
- All animations must respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduced-motion users see the final state immediately — not a frozen mid-animation frame.

---

## 24. PRECISION PAGE HEADER PATTERN

For the three primary analytical pages (Results, OEM Dashboard, Coach Dashboard), replace the bare page title with a precision header styled after Bloomberg Terminal and McKinsey slide headers.

### 24.1 Structure

```
┌───────────────────────────────────────────────────────────────────┐
│  PAGE LABEL (text-caption uppercase)    [Freshness/Status]  [CTA]│
│  Main heading (text-h2 font-display brand-ink)                    │
│  Context subtitle (text-body-sm text-muted-foreground)            │
│  ─────────────────────────────────────────────────────────────── │  ← 1px border-t neutral-200
│  STAT LABEL    STAT LABEL    STAT LABEL    STAT LABEL             │
│  stat value    stat value    stat value    stat value             │
└───────────────────────────────────────────────────────────────────┘
```

### 24.2 Typography Mapping

```
PAGE LABEL:   .text-caption uppercase tracking-wider text-muted-foreground
Main heading: .text-h2 + font-display class (§17) + brand-ink color (§17.4)
Subtitle:     .text-body-sm text-muted-foreground
Dividing rule: border-t border-neutral-200, my-3
Stat labels:  .text-caption uppercase tracking-wider text-muted-foreground
Stat values:  .text-metric-lg numeric + contextual color (band or brand-500)
```

### 24.3 Per-Page Stat Strips (exactly 4 stats each)

**Results page:**
```
OVERALL SCORE  |  MODULES  |  QUESTIONS  |  MATURITY BAND
74 / 100       |  5 / 5    |  61 / 61    |  ◈ Performing
```

**OEM Dashboard:**
```
NETWORK SIZE   |  AVG SCORE  |  TOP PERFORMER   |  BELOW BENCHMARK
14 dealers     |  71.4       |  Northside BMW   |  3 dealers
```

**Coach Dashboard:**
```
ASSIGNED       |  ACTIVE ACTIONS  |  CRITICAL GAPS  |  LAST VISIT
6 dealers      |  23              |  2 dealers      |  3 days ago
```

### 24.4 Rules

- Exactly 4 stats in the strip — never 3 or 5
- Stat values use `.text-metric-lg numeric` — they are numbers, not sentences
- No icons in the stat strip — numbers only, labels below
- The dividing rule is `border-t` only — never a full card or box
- Maturity band uses the geometric mark from §21.2 (◈) as a prefix glyph

---

## 25. NUMBER & CURRENCY FORMATTING

### 25.1 Scores

```
Display:    Integer only — no decimal places, no trailing ".0"
Class:      .text-metric-lg .numeric
Color:      Score band color from §2.3 (canonical thresholds)
In strips:  "[score] / 100"   In rings: "[score]"
```

### 25.2 Percentages

```
Display:    1 decimal place, "%" appended, no space before "%"
Example:    87.3%   (not "87%" or "87.3 %")
Zero:       0.0%    (not "0%")
```

### 25.3 Currency

```
Locale-aware via Intl.NumberFormat with active locale:
  de-DE:  €1.234,56  (period thousands separator, comma decimal)
  en-US:  €1,234.56  (comma thousands separator, period decimal)

K/M suffixes:
  ≥ €10,000:   K suffix  →  €91K   (not €91,000)
  ≥ €1,000,000: M suffix →  €1.2M
  < €10,000:   Full display, no cents for round numbers (€8,400 not €8,400.00)
```

### 25.4 Deltas

```
Always show sign:   +4.3%   −8.2%
Arrow prefix:       ArrowUp (Lucide) for positive · ArrowDown for negative
Color:              text-success-foreground (positive) · text-destructive-foreground (negative)
Zero:               text-muted-foreground · no arrow
Format:             [arrow icon] [±][value][unit]
```

### 25.5 Dates

```
Short (badges, table cells):   "8 May 2026"   — not "05/08/26"
Long (report headers):         "8 May 2026" (en) · "8. Mai 2026" (de)
Relative (freshness):          "3 days ago" · "2 weeks ago" — not "72 hours ago"
Staleness threshold:           ≥ 90 days → stale state
```

---

## 26. SKELETON & LOADING STATE SPECIFICATION

### 26.1 Shimmer Animation

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--neutral-100)) 25%,
    hsl(var(--neutral-050)) 50%,
    hsl(var(--neutral-100)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
  border-radius: 4px;
}
```

### 26.2 Named Skeleton Shapes

```
skeleton-score-ring:
  80×80px circle  (border-radius: 50%)

skeleton-kpi-card:
  Full card height (~120px)
  Row 1: h-3, w-32  (title)
  Row 2: h-6, w-16  (metric value)
  Row 3: h-3, w-24  (benchmark)
  Row 4: h-1.5, full width  (progress bar)

skeleton-table-row:
  h-12 full width · 3 cells: w-8 (rank) · w-48 (name) · w-24 (score)
  border-b border-border

skeleton-heatmap:
  5×5 grid of 72×56px cells

skeleton-chart:
  Full chart height, single rounded rectangle

skeleton-narrative:
  3 rows: h-3 w-full · h-3 w-4/5 · h-3 w-3/5 · gap-2
```

### 26.3 Timing Rules

```
Minimum display:  Add 200ms delay before showing skeleton — prevents flash on fast connections
Maximum display:  If skeleton visible > 3s, replace with error state + retry option
Page transitions: Skeleton on navigation, not on in-page state changes
Incremental:      Reveal page sections as they load — don't wait for everything
```

### 26.4 State Distinction

```
Loading:  Shimmer skeleton — animated, neutral backgrounds, no content
Empty:    Static illustration + call to action (§12) — never a skeleton
Error:    AlertCircle icon + specific message (§33) + retry button — never a skeleton
```

---

## 27. ACTOR-CONTEXT BANNER

When a coach or OEM admin views a dealer's data, a persistent banner signals the viewing context and provides a one-click exit.

### 27.1 Visual Spec

```css
.actor-context-banner {
  background: hsl(var(--brand-050));
  border-left: 4px solid hsl(var(--brand-500));
  border-bottom: 1px solid hsl(var(--brand-200));
  padding: 0 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;          /* Sits directly below AppHeader */
  z-index: 40;     /* AppHeader is z-50 — do not conflict */
}
```

Mount animation: `height: 0 → 40px` + `opacity: 0 → 1`, 200ms ease-out.

### 27.2 Content

```
Left:   Eye icon (size-3.5) + "Viewing [Dealer Name]" (.text-body-sm font-medium)
        · text separator ·  location if available (.text-body-sm text-muted-foreground)
Right:  "Back to [Overview / Network / Dashboard]" — ghost Button size="sm"
```

### 27.3 When to Show

| Actor | Trigger |
|---|---|
| Coach | Navigating to a specific dealer's Results or Assessment data |
| OEM Admin | Drilling into a specific network member's data |
| Dealer | Never — dealers always view their own data |

### 27.4 Rules

- Does not appear on list/overview pages — only on individual dealer data pages
- Must not displace other sticky elements — z-index 40 (AppHeader is z-50)
- Remove from print/PDF surfaces

---

## 28. NETWORK TIER BADGE SYSTEM

OEM programme tiers require a dedicated badge system distinct from the generic status badges in §5.8.

### 28.1 Tier Badge Tokens

```css
.tier-standard {
  background: hsl(var(--neutral-100));
  color: hsl(var(--neutral-700));
  border: 1px solid hsl(var(--neutral-300));
}
.tier-silver {
  background: oklch(0.96 0.01 220);
  color: oklch(0.30 0.02 220);
  border: 1px solid oklch(0.82 0.02 220);
}
.tier-gold {
  background: oklch(0.96 0.08 85);
  color: oklch(0.40 0.10 70);
  border: 1px solid oklch(0.80 0.10 80);
}
.tier-platinum {
  background: oklch(0.97 0.04 250);
  color: oklch(0.25 0.05 250);
  border: 1px solid hsl(var(--brand-300));
}
```

### 28.2 Shape and Typography

```
Shape:      rounded-md (not rounded-full)
Padding:    px-2.5 py-0.5
Typography: .text-label (12px weight 500)
Prefix:     4×4px filled circle in tier color, mr-1.5 — quality-mark dot
```

### 28.3 Usage

```
OEM Dashboard leaderboard:  right-aligned in dealer name cell
Network member list:         inline with dealer name
OEM Settings roster:         "Tier" column, editable via Select
PDF report:                  adjacent to network name in header
```

Tier badges are read-only everywhere except OEM Settings. They must never use the semantic status colors (success/warning/destructive).

---

## 29. BENCHMARK CORRIDOR UPGRADE

This section supersedes §5.5 with a box-and-whisker specification that adds prior-period tracking.

### 29.1 Layout

```
[Min] ────[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]──── [Max]
           P25             P75
                    │
                  Median
              △ Prior period (hollow marker)
          ● Current position (filled, band color)

Labels below track:  P25 · Median · P75  (.text-caption)
```

### 29.2 Color Spec

```
Track:          h-1.5, neutral-200
P25–P75 fill:   h-3, brand-200, rounded
Median tick:    2px wide × 20px tall, brand-600
Current:        10px filled circle, §2.3 band color
Prior period:   10px hollow circle, 1.5px stroke, §2.3 band color at 60% opacity
                (shown only when prior assessment data exists)
```

### 29.3 Prior Period Marker Rules

- Show only when a prior assessment score is available
- Position on the same track as the current marker
- Include tooltip: "Previous assessment: [score] ([date])"
- If prior score equals current score, overlay with current marker on top

### 29.4 Heights by Context

```
KPI Encyclopedia full view:   64px total (track + labels)
Results page KPI deep dive:   48px total
Dashboard KPI card:           24px total (no labels, current marker only)
```

---

## 30. DATA DENSITY MODES

### 30.1 Two Modes

**Comfortable** (default) — current spec. All padding as defined in §4.

**Compact** — reduced padding and type scale for information-dense surfaces.

```css
.density-compact {
  --row-height:    36px;     /* vs default 48px */
  --cell-padding:  8px 12px; /* vs default 12px 16px */
}
.density-compact * {
  font-size: calc(var(--font-size, 1em) * 0.875);
}
.density-compact .gap-4 { gap: 12px; }
.density-compact .gap-6 { gap: 16px; }
```

### 30.2 Density by Surface

| Surface | Density |
|---|---|
| OEM Dashboard leaderboard | Compact |
| Coach Dashboard dealer list | Compact |
| KPI Encyclopedia table view | Compact |
| Dealer Dashboard KPI cards | Comfortable |
| Results page | Comfortable |
| Assessment questions | Comfortable |

### 30.3 Rules

- Density is set per surface, not globally
- Never apply compact mode to form inputs or assessment question tiles
- Minimum card padding in compact mode: 8px
- Minimum text size in compact mode: 11px (`.text-caption`) — no smaller

---

## 31. FOCUS RING & ACCESSIBILITY TOKENS

### 31.1 Focus Ring Specification

Every interactive element must have a visible `:focus-visible` ring. No exceptions.

```css
/* Add to index.css */
:focus-visible {
  outline: 2px solid hsl(var(--brand-500));
  outline-offset: 2px;
  border-radius: 4px;
}
.rounded-full:focus-visible  { border-radius: 9999px; }
.rounded-xl:focus-visible    { border-radius: 12px; }
.rounded-lg:focus-visible    { border-radius: 8px; }
```

### 31.2 Color Contrast Audit

| Context | Contrast | WCAG AA |
|---|---|---|
| neutral-900 on white | 14.5:1 | Pass |
| neutral-900 on neutral-050 | 13.2:1 | Pass |
| neutral-600 on white | 4.7:1 | Pass |
| neutral-600 on neutral-050 | borderline | Check per use |
| success (#16a34a) on white | 5.9:1 | Pass |
| warning (#d97706) on white | 3.1:1 | **Fail** |
| destructive (#dc2626) on white | 4.7:1 | Pass |

**Critical:** Warning color text on white FAILS WCAG AA. Never use `text-warning-foreground` on a white background. Always pair with `bg-warning/10` background or use `neutral-900` text instead.

### 31.3 ARIA Requirements by Component

```
Score rings:    aria-label="[Department] score: [n] out of 100, [Band name]"
Progress bars:  role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={100}
Custom buttons: type="button" explicitly on all non-submit buttons
Dialogs:        DialogTitle required (current known issue — see CLAUDE.md)
Icon-only:      aria-label always, even with semantic icon meaning
Heatmap:        role="grid" with proper row/cell ARIA
```

### 31.4 Reduced Motion Override

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Users see the final state immediately — not a frozen mid-animation frame.

---

## 32. PDF/PRINT SURFACE SPECIFICATION

### 32.1 Page Specifications

```
Dealer diagnostic report:   A4 portrait  (210 × 297mm)
OEM network report:         A4 landscape (297 × 210mm)
Margins:                    20mm all sides
```

### 32.2 PDF Header

```
Left:  Organization logo (max 40×40mm); fallback: org name in brand-ink text
Right: Report date (.text-caption equivalent)
Below: 4px brand-500 horizontal rule
```

### 32.3 PDF Typography

```
Body:       Inter 9pt, leading 14pt
Headings:   Inter 11pt bold, leading 16pt
Captions:   Inter 8pt, neutral-600 equivalent
Score nums: Inter 18pt bold tabular-nums
Labels:     ALL CAPS 7pt letter-spacing 0.08em
```

PDF type runs ~2pt smaller than screen to compensate for print DPI and improve legibility on printed A4.

### 32.4 PDF Color Mapping (CMYK-safe)

```
brand-500 (#1D7AFC):   CMYK 88/51/0/1
success   (#16a34a):   CMYK 82/0/55/36
warning   (#d97706):   CMYK 0/42/97/15
destructive (#dc2626): CMYK 0/83/83/14
```

Score band colors must match screen exactly — OEM managers compare printed and screen versions side by side.

### 32.5 PDF Footer

```
Left:   [Organization name] · [Dealership name]
Center: Page X of Y
Right:  "Dealer Diagnostic Platform — Confidential"
```

### 32.6 Texture and Grain

All background texture (§20), noise grain, and grid patterns are stripped from PDF output. Print surfaces are flat.

### 32.7 Watermark (optional)

When `includeWatermark: true` (see `pdfReportGenerator.ts`): SVG text element at 5% opacity, rotated 45°, centered on each page. Text: "CONFIDENTIAL — [Date]".

---

## 33. MICRO-COPY TONE RULES

### 33.1 The Standard

This tool is used when a dealer's business is under formal review by principals and OEM programme managers. Vague, consumer-app copy destroys trust immediately. Every word must project competence.

### 33.2 Error Messages

```
Never:   "Something went wrong"
Never:   "Oops! We couldn't load your data"
Never:   "Hmm, that's odd"

Format:  "[What failed] — [cause if known] · [what to do]"

Examples:
  "Assessment data could not be loaded — check your connection and try again."
  "PDF export failed — your browser may be blocking downloads · Try Chrome."
  "This assessment is no longer accessible — it may have been deleted or you lack permission."
```

### 33.3 Empty States

```
Never:   "No data"  ·  "Nothing to see here"  ·  "No results found"

Format:  "[What's empty] · [What to do to fill it]"

Examples:
  "No assessments completed · Start your first diagnostic to see results here."
  "No dealers in your network · Add dealers from OEM Settings to see the leaderboard."
  "No actions assigned · Prioritise actions from the Results page to begin tracking."
```

### 33.4 Score Band Language

```
Never:   Poor · Fair · Good · Very Good · Excellent · Below average · Above average
Always:  Foundational · Developing · Performing · Advanced  (§13 canonical names)
```

### 33.5 Button and CTA Labels

```
Rule:    Verb first, present tense, specific not generic
Never:   "Submit" → use "Save Assessment" or "Export PDF"
Never:   "OK" → use "Got it", "Continue", or a specific label
Never:   "Click here" in prose
Never:   "Please" (professional tools do not beg)
Always:  "Export PDF" · "Start Assessment" · "Add to Network" · "View Results"
```

### 33.6 Loading Copy

```
Never:   "Loading..."  (too vague)
Better:  "Loading results..." · "Fetching network data..." · "Generating PDF..."
Best:    Skeleton (§26) with no text for loads < 1s
```

### 33.7 Confirmation Messages

```
Never:   "Success!" alone  ·  "Done!" alone
Always:  Name what succeeded.

Examples:
  "Assessment saved · Your progress is stored and will resume when you return."
  "Action status updated · Moved to In Progress."
  "Dealer added to network · They will appear in the leaderboard within a minute."
```

---

## 34. RESPONSIVE BREAKPOINTS

### 34.1 Named Breakpoints (Tailwind defaults)

```
sm:   640px   — tablet portrait, large phone landscape
md:   768px   — tablet landscape
lg:   1024px  — small laptop
xl:   1280px  — standard laptop / HD display
2xl:  1536px  — large monitor / 4K display
```

### 34.2 Primary Usage Contexts

```
Dealer principal:   Desktop 1440px · occasionally tablet 768–1024px
OEM manager:        Desktop 1280–1920px · large monitor
Field coach:        Tablet 768–1024px · occasionally mobile
```

Design optimum: **1024–1440px**. Mobile is supported but not the primary context.

### 34.3 Per-Component Collapse Rules

**Dashboard KPI grid:**
```
2xl–lg:  4 columns
md:      2 columns
sm:      1 column
```

**Results stat strip (§24):**
```
lg+:   4 columns inline
md–sm: 2 × 2 grid, slightly smaller type
```

**Assessment QuestionCard:**
```
md+:  3fr + 2fr side-by-side (question + context panel)
sm:   Single column, context panel below
```

**OEM leaderboard:**
```
xl+:   Full table — all columns visible
lg:    Hide Tier column, show Score
md:    Name + Score only
sm:    Not the primary context — guide coaches/OEM to desktop
```

**Sidebar:**
```
lg+:   240px expanded
md:    Icon-only collapsed
sm:    Sheet overlay — slide-in on hamburger tap
```

### 34.4 Typography at Mobile

Do not use fluid `clamp()` typography globally — it makes the scale unpredictable for design review. Apply explicit overrides only for the two largest heading sizes:

```css
@media (max-width: 768px) {
  .text-h1 { font-size: 24px; line-height: 32px; }
  .text-h2 { font-size: 22px; line-height: 30px; }
}
```

All other type sizes stay fixed across breakpoints.

---

---

## 35. WARM CANVAS GRADIENT

### 35.1 Token

```css
.bg-canvas-warm {
  background:
    radial-gradient(
      ellipse 65% 50% at 100% 0%,
      oklch(0.95 0.04 50) 0%,
      oklch(0.96 0.03 30) 35%,
      oklch(0.97 0.01 20) 60%,
      oklch(0.97 0 0) 85%
    ),
    hsl(var(--neutral-050));
}
```

### 35.2 Rules

- Apply to `<main>` in `AuthenticatedLayout` only.
- Never on cards, sidebar, top bar, or `<aside>` elements.
- The warm peach-to-cream tone intentionally contrasts with brand blue — do not replace with a blue gradient.
- Stripped from PDF/print surfaces (§32.6).

---

## 36. BRAND BLUE ANIMATION RULES

All brand-blue animations are purposeful instrument signals, not decoration.

| Class | Purpose | Fires |
|---|---|---|
| `.sidebar-pill-active` | Active nav item tonal fill | Always-on (selected state) |
| `.badge-pulse` | New notification ring | Once per new notification |
| `.progress-animate` | Progress bar grow | Once on first render |
| `.tab-indicator` | Tab underline slide | Once on tab change |

### Rules

- All four classes defined in `src/index.css` `@layer utilities`.
- `.badge-pulse` must never loop — `animation-iteration-count: 1` set via `ease-out 1` shorthand.
- `.progress-animate` uses `forwards` fill-mode — bar stays at final width after animation.
- All respect `prefers-reduced-motion` via global override in `@layer base`.

---

## 37. SIDEBAR NAVIGATION v2 (supersedes §5.7)

| State | Classes |
|---|---|
| Active item | `sidebar-pill-active border-l-2 border-brand-500 text-white rounded-r-md mr-3` |
| Inactive item | `text-white/55 border-l-2 border-transparent` |
| Inactive hover | `hover:text-white/85 hover:bg-white/5` |

The `border-l-2 border-transparent` on inactive items prevents layout shift when the active border-left appears. The `mr-3` right margin creates the pill shape without full-bleed.

The collapse toggle is a `24×24px` circular button (`rounded-full bg-white/10`) positioned `absolute right-2` in the sidebar header. Always visible — not hover-dependent.

---

*Last updated: 9 May 2026. Update this file before any major UI sprint.*
