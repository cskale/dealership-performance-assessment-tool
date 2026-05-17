# Knowledge Hub — Design Spec
**Date:** 2026-05-17  
**Section:** Dealer Experience  
**Replaces:** `/resources` (ResourceHub) + `/kpi-encyclopedia` (KPIEncyclopediaPage)

---

## Overview

Unify the KPI Encyclopedia, Resource Hub, Learning Paths, and Support Materials into a single **Knowledge Hub** section under one sidebar item and one route. Primary user intent: find resources that directly address their latest assessment gaps.

---

## 1. Architecture & Routing

### Route changes

| Before | After |
|--------|-------|
| `/resources` | `/app/knowledge` (KnowledgeHub page) |
| `/kpi-encyclopedia` | `/app/knowledge/kpi/:kpiKey` (existing KPIExplorer, new route) |

Both old routes redirect to `/app/knowledge` to preserve bookmarks.

### Sidebar

Remove "Resource Hub" and "KPI Encyclopedia" entries. Add single item: **"Knowledge"** with `GraduationCap` or `Library` icon. Gated to `actor_type='dealer'` visibility (coaches and OEM see it too — no actor restriction needed).

### Tab structure

```
/app/knowledge
  ├── Tab: Recommended        ← default
  ├── Tab: KPI Encyclopedia
  ├── Tab: Learning Paths
  └── Tab: Downloads
```

KPI detail view at `/app/knowledge/kpi/:kpiKey` renders the existing `KPIExplorer` component unchanged. Breadcrumb: `Knowledge > KPI Encyclopedia > [KPI Name]`. Back button returns to `/app/knowledge?tab=kpi`.

### New files

- `src/pages/KnowledgeHub.tsx` — tab shell + Recommended tab logic
- `src/components/knowledge/RecommendedTab.tsx`
- `src/components/knowledge/KpiEncyclopediaTab.tsx`
- `src/components/knowledge/LearningPathsTab.tsx`
- `src/components/knowledge/DownloadsTab.tsx`
- `src/lib/mapSignalsToResources.ts` — pure utility

### Data flow (Recommended tab)

```
useActiveRole()           → organizationId, dealershipId
useLatestAssessment()     → scores{}, signals[], maturityLevel
  ↓
mapSignalsToResources()   → gapCards[] with resource query filters
  ↓
Supabase resources table  → filtered by related_kpis[] + topics[]
```

`mapSignalsToResources()` is a pure function. Takes signal codes (CRITICAL_GAP, HIGH_PRIORITY, GROWTH_OPPORTUNITY) + department codes → returns ordered resource query filters. No new DB tables required for this tab.

---

## 2. Recommended Tab

### Hero strip

Dark navy background (`bg-slate-900`), ~180px tall.

**Left side:**
- Dealer name + latest assessment date (muted text)
- Dynamic headline from top signal: *"Used Vehicle Sales is your highest-priority gap — 3 resources matched."*

**Right side:**
- 5 department score pills in a row: New Vehicle Sales / Used Vehicle Sales / Service / Parts / Financial Operations
- Each pill coloured by maturity band: red (Foundational), amber (Developing), green (Performing/Advanced)
- Note: these score pills use health colours (red/amber/green). Department *badge labels* elsewhere in the hub are all blue — these are distinct elements.
- Clicking a pill scrolls to that department's gap card group

**No assessment state:**
Hero shows neutral state — *"Complete your first assessment to get personalised recommendations"* + CTA → `/app/assessment`.

**Stale assessment banner (>90 days):**
Reuse existing `FreshnessBadge` component. Shown at top of hero: *"Based on assessment from [date] — retake for updated recommendations."*

### Gap cards

Grouped by department. Each group has:
- Department heading with signal badge (CRITICAL_GAP / HIGH_PRIORITY / GROWTH_OPPORTUNITY) and impact label

Each resource card:
- Resource type chip top-left: VIDEO / GUIDE / TEMPLATE
- Title + one-line description
- "Why this matters" line — pulled from signal engine narrative text
- Action CTA: "Watch" / "Read" / "Download" by type
- Bookmark icon top-right (saves to user saved list, existing behaviour)

**Ordering:**
1. CRITICAL_GAP departments first
2. Within each department: videos → guides → templates
3. Departments scoring ≥ 70 with no signals are hidden

**All-healthy empty state:**
*"Your dealership is performing well across all areas. Browse the full library in the other tabs."* with shortcut links to the three other tabs.

---

## 3. KPI Encyclopedia Tab

### Filter bar

- Search input (~60% width): *"Search KPIs, metrics, or departments..."*
- Department filter pills (right of search): All / New Vehicle Sales / Used Vehicle Sales / Service / Parts / Financial Operations — single select
- Stat strip (light grey): Total KPIs: 61 | Departments: 5 | Last Updated: [date]

### KPI card grid

3-column grid (2 tablet, 1 mobile).

Each card:
- Department badge top-left — blue for all departments
- KPI name (bold, 1 line)
- Functional definition (2 lines max, truncated)
- Dealer's current score for this KPI: `88 / 100` with coloured dot if assessment exists; dash if not
- "View Details →" link → `/app/knowledge/kpi/:kpiKey`

**Score accent:**
Cards where the dealer's score is below benchmark get a left border accent in amber/red matching the signal colour. Healthy-range cards have no accent.

### KPI detail route

`/app/knowledge/kpi/:kpiKey` renders existing `KPIExplorer` component. No changes to KPIExplorer internals.

---

## 4. Learning Paths Tab

### Featured path hero card

Full-width card (~320px tall), dark overlay image background (Mockup 3 pattern).

Overlaid content:
- Tag chips top-left: department badge + content type (e.g. `NEW RELEASE`)
- Large title + one-line subtitle
- CTA: "Start Learning Path" or "Resume" if in progress
- Thin progress bar at bottom of card if in progress

### Active learning paths grid

3-column grid of paths the dealer has started:
- Department icon + label top-right
- Path title + truncated description
- Progress bar: `X of Y Modules Completed`
- CTA: "Continue Path" (in progress) or "Start Path" (not started)

### All paths section

Full catalogue below active paths. Filter tabs: All Modules / Strategic / Operational. Same card format, no progress bar until started.

### New DB table required

```sql
user_learning_progress (
  user_id       uuid references auth.users,
  resource_id   uuid references resources,
  modules_completed  int default 0,
  total_modules      int,
  started_at         timestamptz,
  last_accessed_at   timestamptz,
  PRIMARY KEY (user_id, resource_id)
)
```

RLS: user reads/writes own rows only.

**Empty state:** Hero card still displays. Prompt beneath: *"Start your first learning path"* pointing at All Paths section.

---

## 5. Downloads Tab

### Filter bar

Three filter groups:
- **Type:** All / Templates / Guides / Case Studies
- **Department:** All / New Vehicle Sales / Used Vehicle Sales / Service / Parts / Financial Operations
- **Sort:** Most Recent / Most Downloaded / A–Z

Result count right-aligned: *"Showing 18 of 142 assets"*.

### Card grid

3-column grid (Mockup 1 pattern).

Each card:
- Type badge top-right: TEMPLATES / GUIDES / CASE STUDIES (muted caps)
- Department icon top-left
- Title (bold) + 2-line description
- Bottom row: format chip (PDF / XLSX / ZIP) + file size + "Download" button

**Featured variant:** `FEATURED` badge replaces type badge (brand blue), subtle blue border, bullet list of key contents.

### Recommended Downloads strip

Narrow horizontal strip above main grid — 3 horizontally scrollable cards pulled from Recommended tab logic: *"Based on your gaps, these templates are most relevant."* Collapses if no assessment exists.

### Backend

Downloads use existing `resources` table. Two new `resource_type` enum values needed: `template` and `case_study` (currently only `video`, `article`, `course`, `webinar`, `tool` exist).

---

## 6. Visual Language

### Department badges

All department badges: **blue**. No colour differentiation by department.

### Signal badge colours

| Signal | Colour |
|--------|--------|
| CRITICAL_GAP | Red / destructive |
| HIGH_PRIORITY | Amber |
| GROWTH_OPPORTUNITY | Blue |
| STRENGTH | Green |

### Hero strip

Dark slate (`bg-slate-900`) — matches redesigned dashboard pattern.

### Typography & spacing

Existing shadcn/ui + Tailwind conventions. No new fonts or palette entries.

### Component reuse

- `FreshnessBadge` — reused in Recommended hero for stale assessment warning
- `ResourceCard` — extended (not replaced) to support department badge + "why this matters" line
- `KanbanBoard`, `RadarBenchmarkChart` — untouched
- shadcn/ui `Tabs` — same pattern as current `ResourceHub.tsx`

---

## 7. Out of Scope

- Learning path content authoring UI (OEM/coach side)
- Search across all content types simultaneously (Approach C — future)
- Delta scoring (#36)
- Results page redesign (separate sprint)
