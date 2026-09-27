# Lovable prompts — UX feedback round (2026-09-27)

Send each prompt as its own Lovable message, in order. Data/DB work is already done by Claude Code. Do **not** write migrations or edit Claude Code–owned files (see CLAUDE.md). Follow DESIGN.md tokens throughout.

---

## Prompt 1 — Coach visit workspace (items 8, 9, 10, 11, 13)

Implement `docs/superpowers/specs/2026-09-27-coach-visit-workspace-design.md`, screens 1–3, in `src/components/coach/DealerPanel.tsx` and `src/pages/CoachDealerPage.tsx`.

- Remove the pinned Pre-Visit Brief block and the Activity Log / Visit History / Coach Notes tabs.
- New layout: compact dark hero (shrinks on scroll) → two columns that scroll together. Left rail `w-72` shows the visit timeline (next visit + past visits; cancelled visits collapsed behind "N cancelled"). The main column shows the Pre-Visit Brief (default) or the selected visit's detail.
- Pre-Visit Brief = a one-page document (max-w-3xl), sections in this order: Headline sentence → Since last visit (agreed actions table; completed rows collapsed to a count) → Last visit notes → KPIs & departments (now vs last visit, delta chips; only movers ±5 or below benchmark in full) → Needs attention (max 5) → Suggested agenda (blocked, then overdue, then biggest score drops). Data: `supabase.rpc('get_visit_brief', { p_dealership_id })`. Add a "Start visit" button.
- Visit detail replaces `VisitLogSheet` (remove the modal). Data: `supabase.rpc('get_visit_detail', { p_visit_id })` returns `{ visit, reviews[], agreed_actions[], notes[] }`. The action review row = full title (wrap, never truncate), owner · due (hide when both empty), and a single-row segmented control `Done | In progress | Blocked | Not started`. The note input shows only for Blocked or In progress. Notes section: add-note box with an optional "About action" select. **Insert into `coach_notes` with `visit_id` and `action_id` set.** Agreed-for-next-visit multi-select + next date + summary. Read-only unless the viewer is the visit's coach.
- The coach dashboard/profile pages must use the same visual language: cards with soft borders, generous spacing, no dense tables where a list reads better.

## Prompt 2 — Dealer-side coaching (item 5)

- `src/components/CoachNotesPanel.tsx` (Dashboard): group notes by visit ("Visit 31 May 2026"; `visit_id` null → "General"). Show `action_id`'s action title as a chip linking to that action in the Action Plan. Show the coach's name, not "Your coach".
- Profile → Coaching visits (`src/components/CoachingVisitsSection.tsx`): replace the table with the visit timeline + read-only visit detail component from Prompt 1.

## Prompt 3 — Account / Profile redesign (items 2-organigram, 3, 4)

`src/pages/Account.tsx` and `src/components/OrganizationSettings.tsx`. Goal: a 2026 SaaS settings experience (Linear/Vercel/Stripe-dashboard feel), not form stacks.

- Left vertical settings nav (Profile, Organisation, Team, Security, Notifications, Activity) instead of top tabs on desktop; top tabs on mobile.
- **Organisation:** a hero card with the org name, logo/initials avatar, brand chips, and business model shown as a visual picker (2S / 3S / 4S cards with icons for which departments are included), not a dropdown. Group the remaining fields in titled sections with inline-edit and autosave toasts.
- **Team:** add an **organigram** view (toggle "List | Chart"): owner at the top, then admins/managers, then members/viewers. Coaches are shown in a separate "External" lane linked to the dealership. Node = avatar initials, name, role pill. Use plain flex/CSS lines, no new npm packages. Names come from the existing `orgMembers` (now real names via `get_org_member_profiles`).
- **Activity:** show only the last 3 completed assessments with score + delta vs previous, plus a "See all in Results →" link. Remove the full 9–10 row list.
- **Security:** the password strength meter is already a 4-segment bar; keep its style consistent with the new cards.

## Prompt 4 — Playground explainers (item 7)

In `src/components/playground/PlaygroundCalculatorShell.tsx`, add an optional `guideId` prop. When set, read `PLAYGROUND_GUIDES[guideId]` from `src/data/playgroundGuides.ts` (do not edit that file) and render, directly under the header card, a "How to use this calculator" panel: the `question` as a bold lead line, then three columns (stacked on mobile), **When to use**, **What you get** and **How to act on it**, plus a footer line "Where to find the numbers: {dataSources}". Collapsible, open by default on the first visit, state in localStorage (wrapped in try/catch). Pass `guideId` from every `src/pages/*Page.tsx` calculator (IDs match the Playground catalog: reverse-sales-funnel, sales-velocity, lead-quality, marketing-roi, cac-payback, tech-utilization, vehicle-stock-turn, absorption-rate, appointment-density, fi-penetration). Also add a one-line help hint under each input label explaining what to enter.
