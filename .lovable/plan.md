# Prompt 1 plan: Results shell, header, tabs, and assessment picker

## Scope and prerequisite

- Before implementation, confirm the working copy is based on the latest `main`. The current sandbox is on managed branch `edit/edt-041e70ba-3c63-41cb-ab20-82531fcc8b1b` at `248eba7`; Lovable manages Git state, so synchronization must use the platform-supported latest-main flow rather than a direct stateful Git command.
- Implement Prompt 1 only. Do not build the hero band, department rows, KPI cards, forecasting, check-ins, or Action Plan restyle from Prompts 2–5.
- Do not install packages, edit the sidebar, modify translations, or touch any Claude-owned/protected file listed in the handoff.

## Files to change

### `src/pages/Results.tsx`

This is the only source file to modify.

1. **Add URL-backed tab state safely**
   - Add `useSearchParams` beside the existing router hooks and call it unconditionally before every early return.
   - Accept only `diagnosis` and `action-plan`; normalize a missing or invalid value to `diagnosis`.
   - Update `?tab=` when the user switches tabs, preserving shareable/reloadable state.

2. **Add the completed-assessment picker**
   - Read `dealerId` from the existing top-level `useActiveRole()` call.
   - Call `useDealershipAssessments(dealerId)` unconditionally with the other hooks.
   - Render the existing shadcn `Select` in the header, with `t('results.picker.label')` as its accessible label.
   - Show every completed assessment returned by the hook in its existing newest-first order, label it with `completed_at ?? created_at` using the active language locale, select the current assessment ID, and navigate selections to `/app/results/:id`.

3. **Rebuild the header row within existing behavior**
   - Present the current organization/dealership name, assessment picker, existing Export PDF control/modal, and existing Retake control in a responsive header.
   - Reuse current data and handlers; use existing translation keys such as `results.title`, `results.completedOn`, `results.exportPDF`, and `results.retakeAssessment` for modified UI text.
   - Style only with existing DESIGN.md semantic brand/neutral classes, Inter typography, shadcn controls, and existing shadow/radius tokens.

4. **Replace the old Results navigation**
   - Replace the four triggers and contents (`executive`, `kpi`, `maturity`, `action-plan`) with exactly two: `t('results.tab.diagnosis')` and `t('results.tab.actionPlan')`.
   - Leave the Action Plan content and its props/behavior unchanged.
   - Put only the requested empty placeholder `<div>` in Diagnosis for the future hero band; do not invent temporary content.

5. **Remove superseded Prompt 1 code from this page**
   - Remove the four summary tiles and their score-ring animation/state used only by those tiles.
   - Remove the old Executive Summary, standalone KPI Analysis, and Maturity tab render blocks plus imports/derived values that become unused in `Results.tsx`.
   - Keep the underlying component files in place: Prompt 1 is limited to `Results.tsx`, later prompts own relocation/restyling, and no repo-wide component deletion is required yet.
   - Keep `ExportPDFModal`, assessment freshness handling, OEM context, PDF data preparation, notes/KPI data needed by PDF or Action Plan, and the complete `ActionPlan` component call intact.

## Hook and safety guarantees

- All hooks remain unconditional and above loading/error/no-data returns.
- Derived values stay after the data they reference; no temporal-dead-zone ordering risk is introduced.
- Every JSX control/icon is explicitly imported.
- No changes to `ActionPlan.tsx`, `KanbanBoard.tsx`, fetching logic, Supabase files, migrations, protected hooks, design tokens, or i18n dictionaries.

## Verification against Prompt 1 acceptance

- Run the TypeScript check and production build without installing dependencies.
- In the preview, verify both result routes load with exactly two tabs.
- Verify missing/invalid `?tab=` resolves to Diagnosis, switching tabs updates the URL, and reload restores Action Plan.
- Verify the picker contains all returned completed assessments in newest-first order, displays localized dates, changes the assessment route, and loads the selected result.
- Verify Export PDF and Retake remain present.
- Smoke-test the existing Action Plan tab controls and confirm its rendering/behavior is unchanged.
- Check desktop and 390px layouts for clipping or horizontal overflow, then confirm the latest observability build entry is clean.
