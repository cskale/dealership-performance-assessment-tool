

# KPI Encyclopedia Redesign — Production-Grade UX/UI

## Summary

Transform the KPI Encyclopedia tab from a dense accordion layout into a 3-layer intelligence library: split-pane browser (desktop), preview panel, and full detail workspace. Uses existing `react-resizable-panels`, `Sheet`, `Tabs`, `Badge`, and `Card` components — no new dependencies.

## Architecture

```text
┌─ UsefulResources.tsx ──────────────────────────────────────┐
│  (keeps Learning Library + Support Materials tabs)         │
│  Encyclopedia tab → renders <KPIIntelligenceLibrary>       │
└────────────────────────────────────────────────────────────┘

┌─ KPIIntelligenceLibrary.tsx ──────────────────────────────┐
│  Header · Search · Department Chips · A-Z Nav             │
│  ┌─ ResizablePanelGroup (horizontal) ──────────────────┐  │
│  │  Left 40%: <KPIListPane>  │  Right 60%: <KPIPreview>│  │
│  └─────────────────────────────────────────────────────┘  │
│  Mobile: single column, preview opens as <Sheet>          │
│  Full detail: <KPIDetailWorkspace> (dialog/sheet)         │
└───────────────────────────────────────────────────────────┘
```

## New Files

| File | Purpose |
|------|---------|
| `src/components/kpi-encyclopedia/KPIIntelligenceLibrary.tsx` | Main orchestrator: header, search, chips, split-pane layout, state management |
| `src/components/kpi-encyclopedia/KPIListPane.tsx` | Left pane: filtered/grouped KPI list rows with hover/select states |
| `src/components/kpi-encyclopedia/KPIDetailPreview.tsx` | Right pane: lightweight preview (summary, benchmark bar, root cause mini-tiles, top levers, related chips) |
| `src/components/kpi-encyclopedia/KPIDetailWorkspace.tsx` | Full deep-dive: 4-tab workspace (Overview, Diagnose, Improve, Related) opened via Sheet/Dialog |
| `src/components/kpi-encyclopedia/KPIBenchmarkBar.tsx` | Horizontal benchmark visualization with zone bands and marker |
| `src/components/kpi-encyclopedia/KPIRootCauseTiles.tsx` | 5-dimension diagnostic tiles (People/Process/Tools/Structure/Incentives) with pastel accents |
| `src/components/kpi-encyclopedia/KPIImprovementLevers.tsx` | Structured lever cards with numbering, optional effort/impact badges |
| `src/components/kpi-encyclopedia/departmentConfig.ts` | Department icon map, color map, and shared constants |

## Modified Files

| File | Change |
|------|---------|
| `src/components/UsefulResources.tsx` | Replace encyclopedia tab content (~60 lines) with `<KPIIntelligenceLibrary scores={scores} />`. Remove `KPIDetailCard` component and encyclopedia-specific state/logic. Keep Learning Library and Support Materials tabs unchanged. |

## Implementation Details

### Department Config (`departmentConfig.ts`)
- Icon map: `Car`, `CarFront`, `Wrench`, `Package`, `DollarSign`, `HeartHandshake`, `Megaphone`, `Users`, `Zap`, `GitBranch`
- Color map: 10 soft pastel accent classes (e.g., `bg-blue-50 text-blue-700 border-blue-200`)
- Reuses existing `DEPARTMENT_MAP` from UsefulResources for labels

### KPIIntelligenceLibrary (orchestrator)
- State: `selectedKpiKey`, `searchTerm`, `activeDepartment`, `detailOpen`
- Header: title "KPI Encyclopedia" + subtitle + search input (right-aligned)
- Filter row: horizontal scrollable department chips using `Badge` with selected/unselected states
- Optional A-Z letter row (sticky, disabled letters for missing initials)
- Desktop: `ResizablePanelGroup` with `ResizablePanel` (40%) + `ResizableHandle` + `ResizablePanel` (60%)
- Mobile: uses `useIsMobile()` hook → single column list, preview opens as `Sheet` (side="right")
- Search: matches title, definition, formula, department; shows result count; highlight matched text via `<mark>`
- Empty state: `Search` icon + friendly copy

### KPIListPane
- Clean list rows (not cards): KPI title, one-line definition (truncated), department badge, optional "Deep Dive" badge
- Hover: `bg-muted/30` tint
- Selected: `bg-primary/5 border-l-2 border-primary`
- Click → selects KPI, updates preview
- Groups KPIs by department with subtle section headers
- Receives filtered/grouped data from parent

### KPIDetailPreview
- Hero: KPI title, department badge, executive summary
- `KPIBenchmarkBar`: horizontal bar with benchmark value and unit
- "Why it matters" section (2-3 lines)
- `KPIRootCauseTiles` in compact/preview mode (icon + dimension + 1-line truncated text)
- Top 3 improvement levers as numbered snippets
- Related KPI chips (clickable → changes selection)
- CTA: "Open KPI Deep Dive" button → opens `KPIDetailWorkspace`
- Placeholder state when nothing selected: icon + "Select a KPI to explore..."

### KPIDetailWorkspace
- Opens as `Sheet` (side="right", large width) or `Dialog` on desktop
- Hero: KPI title, department, executive summary, benchmark badge, unit badge
- 4 shadcn `Tabs`:
  - **Overview**: definition, formula (mono), unit, inclusions/exclusions, why it matters
  - **Diagnose**: `KPIRootCauseTiles` in expanded mode (full diagnostic text per dimension)
  - **Improve**: `KPIImprovementLevers` (full list, grouped if data supports it)
  - **Related**: upstream/downstream cards with directional icons + clickable KPI chips

### KPIBenchmarkBar
- Slim horizontal bar (8px height) with soft pastel zone bands (red/amber/green)
- Benchmark marker (vertical line) with label
- Shows "Higher is better" / "Lower is better" text based on context
- Benchmark value displayed as text beside bar

### KPIRootCauseTiles
- Two modes: `compact` (preview) and `expanded` (detail workspace)
- 5 tiles in horizontal wrap layout
- Each: colored icon circle (pastel bg) + dimension name + text
- Compact: 1-line truncated text
- Expanded: full text, click-to-expand not needed
- Colors: People=blue-50, Process=green-50, Tools=purple-50, Structure=orange-50, Incentives=amber-50

### KPIImprovementLevers
- Numbered cards with step badge (circled number)
- Each: lever text, subtle alternating bg (`bg-muted/30` on even rows)
- Optional "Create Action" ghost button per lever (links to existing action plan navigation)

## Visual Design Compliance
- White surfaces, `#F9FAFB` backgrounds, `rounded-2xl` cards
- `text-[#1F2937]` for dark text (no pure black)
- Roboto via existing font stack
- Subtle `shadow-sm`, `border` (1px), generous padding
- No glassmorphism, no bounce animations, no emoji in headings (replaced with Lucide icons)
- Transitions: `transition-colors duration-150` for hovers, `transition-all duration-200` for panel content changes

## Delivery Phases (implemented in single pass, structured internally)
1. departmentConfig + KPIListPane + KPIIntelligenceLibrary (split-pane + search + chips)
2. KPIBenchmarkBar + KPIRootCauseTiles + KPIImprovementLevers
3. KPIDetailPreview + KPIDetailWorkspace (tabs) + UsefulResources integration
4. Mobile responsive (Sheet for preview/detail) + empty/loading states

