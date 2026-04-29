## Plan: KPI Deep Dive consistency + final design-system cleanup

I will start with the KPI deep dive pages, then do a focused cleanup pass for typography, badges, spacing, and colour-token compliance. I will keep this as UI/styling work only and avoid assessment/scoring/data logic.

### Scope

Files likely to be edited:
- `src/components/kpi-encyclopedia/KPIStudio.tsx`
- `src/components/kpi-encyclopedia/KPIExplorer.tsx`
- `src/components/kpi-encyclopedia/KPIBenchmarkStudio.tsx`
- `src/components/kpi-encyclopedia/ImprovementPlaybook.tsx`
- `src/components/kpi-encyclopedia/RootCauseIntelligenceBoard.tsx`
- `src/components/kpi-encyclopedia/KPIRootCauseTiles.tsx`
- `src/components/kpi-encyclopedia/KpiRelationshipMap.tsx`
- `src/components/kpi-encyclopedia/KPIBenchmarkBar.tsx`, if still used in the KPI flow

I will not touch core engine files, Supabase queries, routing, packages, or data definitions.

---

## 1. Standardise the KPI deep-dive layout

### Benchmark Position
I will make the benchmark section consistent for every KPI:
- Keep the same four-zone benchmark corridor structure across all KPI records.
- Ensure every KPI shows the same detail level below Benchmark Position:
  - Reference corridor / benchmark value
  - Direction: lower-is-better or higher-is-better
  - Four performance-zone labels
  - Consistent label typography using `text-caption` / `text-label`, not raw ad-hoc text sizes.
- Remove one-off special-case metric cards for `leadResponseTime` so it does not have a richer layout than other KPIs.
- Preserve the existing benchmark parsing and display logic; no KPI data changes.

### Metric summary row
I will standardise the three metric tiles so all KPIs show:
- Reference benchmark
- Measurement unit
- Performance direction

This removes the current visual inconsistency where one KPI has unique benchmark details and others look thinner.

---

## 2. Fix Improvement Actions badge typography

I will update Improvement Actions tags/badges to match `DESIGN.md`:
- `rounded-md`
- `px-2.5 py-1`
- `text-label` or `text-caption` depending on density
- Inter/system font through the existing design system
- No oversized raw `text-sm`/`text-xs` badge styling
- No off-system font classes unless already part of the Tailwind design tokens

I will keep the existing tag logic: Quick win / Structural / Capability.

---

## 3. Replace ad-hoc typography with DESIGN.md type utilities

I will audit KPI encyclopedia components and replace inconsistent raw sizes where appropriate:
- Section labels: `text-caption uppercase tracking-wider`
- Section/card headings: `text-h5` or `text-body-md font-medium`
- Descriptions: `text-body-md` or `text-body-sm`
- Metric values: `text-metric-lg tabular-nums`
- Metadata tags: `text-caption`

This mainly targets the visible KPI detail modal and related KPI cards/playbook sections.

---

## 4. Remove off-system visual patterns in KPI components

I will clean up visible inconsistencies such as:
- `rounded-full` on benchmark bars or badges where `rounded-md`/`rounded-xl` is specified.
- Raw arbitrary tiny text like `text-[9px]` / `text-[10px]` where `text-caption` is suitable.
- Department-coloured surfaces in card UI where department colour should not be used outside charts/data visualisations.
- Hardcoded semantic Tailwind colours in KPI bars, replacing them with existing HSL/token-based classes where practical.
- Oversized or mismatched tag styling.

I will not remove chart/data-viz colour logic where it is explicitly allowed by `DESIGN.md`.

---

## 5. Final design-system cleanup pass

After the KPI deep-dive fixes, I will run a targeted audit across KPI-related UI for:
- Hardcoded hex colours
- Raw red/amber/green/blue utility backgrounds outside approved score/status usage
- Inconsistent badge classes
- `shadow-lg` / `shadow-xl`
- Purple gradients
- Serif font usage
- Department abbreviations in display UI
- Non-standard spacing or ad-hoc arbitrary text sizes

Any cleanup will stay within the KPI encyclopedia/deep-dive surface unless a clearly related shared component is causing the inconsistency.

---

## Acceptance checks

After implementation, I will verify:
- No new npm packages installed.
- No Supabase queries, RPC calls, routes, or data-fetching logic changed.
- No core engine files modified.
- KPI pages have consistent Benchmark Position detail depth.
- Improvement Actions badges use design-system typography and sizing.
- Design tokens/classes from `DESIGN.md` are used instead of new colours/fonts/patterns.
- TypeScript check passes with zero errors.