# Coach Visit Workspace — Screens 1–3

## Scope
Implement the approved visit-centred workspace without database, migration, package, or Claude-owned file changes. `origin/main` is already current at `9ff2fd8`; the existing local lint-safeguard change remains intact.

## Build

### 1. Shared visit workspace components
Create focused reusable components under `src/components/coach/` so the dealer Profile can consume them read-only later:
- `VisitTimeline`: fixed-width desktop rail (`w-72`), responsive stack on small screens, next-visit/schedule entry, newest-first past visits, status/count metadata, and a collapsed cancelled-visits group.
- `PreVisitBrief`: document-style `max-w-3xl` summary using `get_visit_brief`; render the required six sections in order, collapse completed actions to a count, filter full department rows to ±5 movers or below benchmark, cap attention items at five, and derive agenda ordering client-side from blocked, overdue, then score drops.
- `VisitDetail`: inline detail/editor using `get_visit_detail`; full wrapping action titles, one-row outcome control, conditional note fields, visit-linked/action-linked notes, agreed-next-actions selection, next date, and summary. Editing is enabled only when `visit.coach_user_id` matches the signed-in user.
- A small shared workspace shell will coordinate selected visit, brief/default state, scheduling, loading/error states, and refresh callbacks for both entry points.

### 2. Replace `DealerPanel` tabs and modal flow
In `src/components/coach/DealerPanel.tsx`:
- Keep the full-screen panel, existing visit scheduling/counter-proposal/cancel flows, notifications, and parent refresh callbacks.
- Replace the pinned brief, Activity Log / Visit History / Coach Notes tabs, right-side cards, and `VisitLogSheet` modal with the shared two-column workspace.
- Convert the dark header into a compact sticky hero that reduces its metrics footprint after scrolling.
- Make the rail and document/detail move in one shared scroll area; no independently scrolling columns.
- “Start visit” selects the upcoming visit inline in edit mode; selecting a past timeline item opens its inline detail.

### 3. Rebuild the dedicated coach dealer page
In `src/pages/CoachDealerPage.tsx`:
- Remove the duplicated activity-feed/dashboard/table presentation and render the same shared workspace components with route-loaded dealer data.
- Preserve coach-only access assumptions, navigation back to the network, assessment links, existing visit scheduling mutations, and refresh behavior.
- Use the same compact hero, soft-border cards, generous spacing, and list treatment as the panel and coach dashboard language.

### 4. Data and save behavior
- Call `supabase.rpc('get_visit_brief', { p_dealership_id })` through the existing read hook without editing it.
- Call `supabase.rpc('get_visit_detail', { p_visit_id })` in the new reusable detail component and define its UI-facing response type locally.
- Save reviews before the visit update, preserving the existing action-status synchronization behavior.
- Insert visit notes into `coach_notes` with both `visit_id` and optional `action_id`, plus the existing coach/dealership/type/text fields.
- Preserve existing completion behavior so completed summaries continue to trigger recap notifications server-side.

## Visual and content rules
- Use only DESIGN.md semantic tokens and existing shadcn controls; remove raw colour classes in the touched workspace.
- Use Inter typography, soft borders, restrained status colour, full action titles, and no nested dashboard-card clutter.
- Put all newly introduced user-facing strings through the existing language context and add matching keys to all five dictionaries only if required.

## Verification
- Add focused tests for cancelled grouping, agenda ordering, action-row metadata hiding, conditional review notes, and read-only ownership.
- Run TypeScript validation, lint with zero errors, targeted tests plus the full test suite, and the production build.
- Verify the panel and dedicated route at desktop and mobile widths; authenticated visual verification will use the available session path, or be reported unavailable if the external Supabase preview cannot be signed in.
