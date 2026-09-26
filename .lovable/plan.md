# Prompt 4 — Action Plan visual restyle

## Scope

Restyle the Action Plan tab without changing its data, state, permissions, mutations, filtering, navigation, or drag-and-drop behavior. Before editing, recheck the latest local `main` revision and incorporate it if the branch is behind.

The visual direction will follow the Prompt 4 specification with semantic tokens from `DESIGN.md`: neutral surfaces, a compact progress instrument, quiet status chips, a neutral milestone strip, and no new raw colours or gradients. Prompt 4 explicitly asks for priority-coloured left borders, although the general Action Card section of `DESIGN.md` says borders are uniformly brand blue; for this task, the newer task-specific Prompt 4 instruction will control, using only existing semantic palette roles.

## Implementation

### 1. Header and controls
- Replace the current linear progress summary with a compact circular progress ring showing completed/total and the existing calculated percentage.
- Show Open, In progress, Done, and Overdue counts as restrained stat chips; only Overdue uses the destructive treatment.
- Preserve the existing search field, status tabs and counts, view switcher, Add Action button, Filter popover, and view-only notice; restyle only their surrounding layout.
- Route every visible label, helper, empty state, tooltip, and status string touched by this work through `t()`, adding matching keys to EN, DE, FR, ES, and IT.

### 2. Shared action-card treatment
- Apply the same neutral card anatomy to List, Roadmap, and Kanban cards while keeping each view's current structure and interaction model.
- Use a thin left priority accent from existing semantic/design tokens, without colour-washing the card body.
- Consolidate metadata into `department · owner · due date`; when overdue, render a small Clock icon and localized overdue text inline instead of a red badge.
- Retain existing quick-win, coaching-visit, field-note, completion, edit affordance, and deep-link focus indicators, restyled with semantic tokens only.
- Keep full department names and existing date/priority values; do not infer or alter business data.

### 3. Linked KPI chip and mini trend
- Add a small reusable linked-KPI chip with a Recharts mini sparkline and a link to `/app/knowledge/kpi/:kpiKey`.
- Fetch KPI timelines once in `ActionPlan` with `useKpiTimelines(dealershipId)`, then pass the relevant timeline into List, Roadmap, and Kanban card presentation. `Results` will pass the viewed assessment's `resultsData.dealershipId`, so coaches and OEMs see the viewed dealer's history.
- The action does not have a singular `kpiKey` column. Its canonical keys come from the persisted `improvement_actions.kpis_linked_to` string array, populated from `action.linkedKPIs` when generated; `linked_kpis` is structured display metadata and will not be treated as a key source.
- Render a chip only for a persisted `kpis_linked_to` value that is both in the action department's `trackedKpisFor(dept)` result and recognized as a tracked KPI. If no exact persisted match exists, render nothing—never infer a KPI from department, title, description, or metadata.
- Clicking the KPI link will stop card-click propagation so it navigates to KPI detail rather than opening the action editor.

### 4. Neutral completion strip
- Restyle the existing milestone banner as a neutral information strip.
- Preserve milestone thresholds and messages, reassessment navigation, CTA visibility, and dismiss behavior exactly.

## Existing behavior preservation checklist

No handlers, calculations, query semantics, or mutation wiring will be rewritten. The implementation will explicitly preserve:

- Debounced search across action title, description, and department.
- All/Open/In Progress/Completed/Overdue status filters and their live counts.
- Priority and department filters, plus priority/date/triage sorting in the Filter panel.
- List, Kanban, and Roadmap switching and the current Roadmap categorization rules.
- Native HTML5 Kanban drag start/over/leave/drop/end behavior and `handleKanbanStatusChange` persistence.
- Add Action permissions and create drawer flow.
- Card click/edit button behavior, edit drawer, validation, save/delete, and read-only handling.
- Concurrent-edit detection and its Review Latest/Overwrite dialog.
- Overdue date comparison and exclusion of completed actions.
- Completed/total progress calculation and milestone thresholds.
- Milestone CTA and banner dismissal state.
- Load More pagination and its current page size/query range.
- Realtime refresh subscription and reload behavior.
- `focusActionId` one-time filter reset, List switch, focus ring, and scroll-to-action deep link.
- Action generation/regeneration, cooldown, confirmation, and notifications.
- Existing quick-win, coaching-source, and field-note indicators.

## Files

- Update `src/components/ActionPlan.tsx` for the header, List/Roadmap card presentation, neutral banner, timeline hookup, and translated labels.
- Update `src/components/action-plan/KanbanBoard.tsx` only for presentation and KPI-chip props; leave all native drag-and-drop functions and status callbacks byte-for-byte unchanged where practical.
- Add a focused reusable KPI chip/sparkline under `src/components/action-plan/`.
- Update `src/pages/Results.tsx` only to pass the viewed assessment's dealership ID into `ActionPlan`.
- Add required Action Plan keys to all five locale dictionaries.
- Do not edit any file in the handoff's protected list, any Supabase migration/type file, action-generation logic, KPI timeline/forecast logic, or Kanban status mutation logic.

## Verification

- TypeScript validation and full lint with zero errors.
- Full Vitest suite and production build.
- Authenticated manual click-through covering search, every status filter/count, Filter controls, all three views, Add/Edit, banner dismissal, pagination where available, realtime-safe refresh, and `focusActionId` deep link.
- Desktop and 390px visual checks for card metadata, progress ring/chips, KPI navigation, no overflow, and no layout collisions.
- Kanban drag-and-drop check across all status columns, confirming the same status update and refresh behavior.
