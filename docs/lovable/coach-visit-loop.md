# Lovable handoff: coach visit loop

The backend and data hooks are done. Everything below is UI only. Paste one prompt per Lovable message, in order.
**Do not edit** `src/hooks/useCoachVisitLoop.ts` or any Supabase migration. Import the hooks as they are.

All hooks use TanStack Query and return `{ data, isLoading, error }`. Types are exported from the same file.

---

## Prompt 1: Pre-visit brief (coach)

> In `src/components/coach/DealerPanel.tsx` (the coach's per-dealer view), add a **"Pre-visit brief"** card at the top, above the existing visit controls.
>
> Data: `const { data: brief, isLoading } = useVisitBrief(dealershipId)` from `@/hooks/useCoachVisitLoop`. Declare the hook at the top of the component with the other hooks, before any early return.
>
> Show, in this order:
> 1. **Header line:** "Last visit {brief.last_visit.visit_date} · {brief.days_since_last_visit} days ago". If `last_visit` is null, show "No visit logged yet" instead. If `days_since_last_visit` > 45, show an amber "Overdue for a visit" badge.
> 2. **Score movement:** `score.current` with a delta chip when `score.delta` is not null (green ▲ for positive, red ▼ for negative, e.g. "▼ 25 since last visit"). If delta is null, show "No new assessment since last visit" in muted text. Under it, a compact per-department row comparing `departments_current` and `departments_at_last_visit` (only departments present in both).
> 3. **Agreed at last visit:** list `agreed_actions` with title, owner (`responsible_person`), due date and a status pill (Open / In Progress / Completed). If `last_review` exists, show its outcome and note in small muted text. Empty state: "No actions were agreed at the last visit."
> 4. **Needs attention:** "{overdue_count} overdue · {stale_count} with no update in 21+ days · {completed_since_last_visit} completed since last visit", then up to 5 `overdue_actions` showing "{days_overdue}d overdue".
> 5. **Last visit notes:** `last_visit.summary` collapsed to 3 lines with "Show more".
>
> Use the existing card, badge and typography styles from DealerPanel. Show skeleton rows while loading. Import every component you use (Badge, Button, etc.).

## Prompt 2: Follow-up review in the visit log

> In `src/components/coach/VisitLogSheet.tsx`, add a first section titled **"Review last visit's actions"**, above "Visit type".
>
> Data: `useVisitBrief(visit.dealership_id)` gives `agreed_actions` from the previous completed visit. If the current `visit.id` equals `brief.last_visit?.id`, the coach is editing that same visit, so hide this section.
>
> For each agreed action that is not already `Completed`, show a row with the title, owner and due date, a 4-option segmented control (**Done / In progress / Blocked / Not started**, defaulting to the action's `last_review?.outcome`, or unselected) and an optional one-line note input (placeholder "What's blocking it / what changed?").
>
> On save, before the existing `coach_visits` update, call `useSaveVisitReviews(visit.dealership_id).mutateAsync({ visitId: visit.id, reviews })` with only the rows that have an outcome selected. "Done" automatically completes the action and "In progress" sets it to In Progress. Say this in helper text under the section header: "Marking Done completes the action in the dealer's plan."
>
> If the save fails, keep the existing error toast behaviour.

## Prompt 3: Dealer visit history

> On the dealer side, add a **"Coaching visits"** section to `src/pages/Dashboard.tsx`, below the existing upcoming-visit card. Only show it when the dealer has an active dealership. Give it the anchor id `coaching-visits`.
>
> Data: `useVisitHistory(activeDealershipId)` from `@/hooks/useCoachVisitLoop`, newest first.
>
> Render a vertical timeline. Each visit shows:
> - The date and visit type (In person / Remote / Phone) and the departments reviewed as small chips (`modules_reviewed` holds section ids; map them with `VISIT_MODULES` from `@/lib/coachVisitUtils`).
> - The summary text.
> - **"Agreed actions"**: each with its status pill, owner and due date. If there's a matching entry in `reviews` (by `action_id`), show the outcome badge (Done / In progress / Blocked / Not started) and the note.
> - The next visit date if set: "Next visit planned: {next_visit_date}".
>
> Show the latest visit expanded and older ones collapsed to date + summary first line. Empty state: "No coaching visits logged yet. Your coach's visit notes and agreed actions will appear here."
>
> Also add a compact version of the **pre-visit brief** (Prompt 1, sections 2–4 only) at the top of this section, titled "Since your last coaching visit", using `useVisitBrief(activeDealershipId)`. Dealers see the same data as their coach.

## Prompt 4: Visit recap notifications

> In `src/components/NotificationBell.tsx`, handle the new notification type `visit_recap` (entity_type `coach_visit`). Clicking it should mark it read and navigate to `/app/dashboard#coaching-visits`. Give it a distinct icon (e.g. `ClipboardCheck` from lucide-react) and show its body text (the visit summary) truncated to 2 lines. Leave all other notification types unchanged.

## Prompt 5: OEM coaching effectiveness

> In `src/pages/OemDashboard.tsx`, add a **"Coaching coverage"** card below the leaderboard.
>
> Data: `useNetworkCoachingStats(actorType === 'oem')` from `@/hooks/useCoachVisitLoop`. Rows arrive sorted least-recently-visited first.
>
> 1. Top KPI row: "% of dealers visited in last 90 days" (rows with `visits_last_90d > 0` ÷ total), "Avg days since last visit" (ignoring nulls), and "Agreed-action completion" (sum of `agreed_actions_completed` ÷ sum of `agreed_actions`).
> 2. A table with Dealer, Last visit (date, or a red "Never" badge when null), Days since (amber > 45, red > 90), Visits (90d), Agreed actions, and Completion % (with a small progress bar; "—" when null).
>
> Empty state: "No dealers in your network yet."
