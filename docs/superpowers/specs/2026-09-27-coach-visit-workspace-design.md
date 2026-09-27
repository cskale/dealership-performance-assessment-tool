# Coach Visit Workspace — Design Spec

Date: 2026-09-27 · Covers user feedback items 5, 8, 9, 10, 11, 12, 13

## Problem

The coach experience is fragmented. One visit's content is spread across five places: the Pre-Visit Brief, the Activity Log, Visit History, Coach Notes and the Session Log modal. A coach can't see "what happened at visit X" in one place. Dealers see coach notes with no context: which visit, which action. The Pre-Visit Brief is pinned at the top of `DealerPanel` and eats half the screen, and the Session Log modal is a wall of repeated button rows.

## Principle

**The visit is the unit.** Everything a coach does (reviewing actions, writing notes, agreeing on next steps) belongs to one visit. The UI opens a visit and shows all of it. Nothing about a visit lives anywhere else.

## Data (done, live)

- `coach_notes.visit_id` (nullable FK to `coach_visits`, `on delete set null`). New notes written during a visit must set it. Old notes stay `null` and show as "General notes".
- `coach_notes.action_id` already existed. Set it whenever a note is about a specific action.
- RPC `get_visit_detail(p_visit_id)` returns `{ visit, reviews[], agreed_actions[], notes[] }`. It is guarded by `private.can_view_dealership`, so coaches, dealer members and the network's OEM can all call it.
- RPC `get_visit_brief(p_dealership_id)` is unchanged and is the data source for the brief.

## Screens

### 1. Dealer workspace (`DealerPanel` / `CoachDealerPage`)

Replace the fixed brief and the 3 tabs with a **two-column layout that scrolls as one page** (nothing sticky except the dark hero header, which gets smaller on scroll).

- **Left rail (w-72): Visit timeline.** Next visit (scheduled or "Schedule" CTA) on top, then past visits newest first. Each row shows date, status pill, a one-line summary, and counts (`3 actions reviewed · 2 notes`). Cancelled visits are collapsed into one "N cancelled" toggle; they add no value by default.
- **Main column:** shows either
  - **Pre-Visit Brief** (the default when the next visit is upcoming), or
  - **Visit detail** (when a past visit is selected).
- **Removed:** the Activity Log tab (system events duplicate the visit timeline and the assessment history), the standalone Coach Notes tab (notes now live inside visits), and the pinned brief block.

### 2. Pre-Visit Brief (a document, not a dashboard)

Reads top to bottom like a one-page management summary, with print/PDF-friendly typography (max-w-3xl, serif-free, `text-body`, section rules). The sections, in order:

1. **Headline:** dealer, visit date, days since last visit, overall score and delta since last visit (one sentence: "Score 60 (▼14 since 21 May). 2 actions overdue.").
2. **Since last visit:** agreed actions table (title · owner · due · status · last review outcome). Completed rows are struck through and collapsed to a count.
3. **Last visit notes:** the summary plus notes from that visit.
4. **KPIs & departments:** department scores now vs last visit (delta chips). Only departments that moved ±5 or are below benchmark are listed in full; the rest are one line.
5. **Needs attention:** overdue plus stale (21+ days) actions, max 5.
6. **Suggested agenda:** generated from 2, 4 and 5 (blocked actions first, then overdue, then the biggest score drops). This is plain client-side ordering, not AI.

A "Start visit" button opens the Visit detail in edit mode.

### 3. Visit detail (replaces the Session Log modal)

This is an inline page section, not a modal. Header: date, type, status, `Edit` / `Complete visit`.

- **Action review:** one compact row per agreed action: title (full, wraps; no truncation), owner · due, then a **segmented control** `Done | In progress | Blocked | Not started` (single row, the selected state is filled). The "what changed / blocker" input appears **only** when Blocked or In progress is chosen. The redundant "No owner · Due —" line is hidden when both are empty.
- **Notes:** an add-note box with an optional "About action" select (sets `action_id`) and a type select. Notes list chronologically, each tagged with its action title if linked.
- **Agreed for next visit:** multi-select of open actions (writes `agreed_action_ids`), plus next visit date.
- **Summary:** textarea; saving with status `completed` fires the existing recap notification.

Read-only for dealers and OEM, editable for the coach who owns the visit.

### 4. Dealer side (item 5)

- The Dashboard "Coach Notes" card groups notes by visit ("Visit 31 May 2026") and shows the linked action title as a chip that opens that action in the Action Plan. Notes with no visit show under "General".
- Profile → "Coaching visits": the same visit timeline plus read-only visit detail, reusing the component from screen 3. Remove the current table.

### 5. Action tracker (item 12, done in code)

`CoachActions` hides `Completed` by default ("Open & in progress" filter). Completed actions stay reachable through the status filter and the full assessment / Action Plan.

## Out of scope

- AI-written brief narrative (see the "AI Coaching Narrative" idea)
- Backfilling `visit_id` on old notes
- Email recap (blocked on the Resend domain)

## Acceptance

- A coach can click any past visit and see reviews, notes and agreed actions without switching tabs.
- A dealer can tell which visit and which action any coach note belongs to.
- On a 1440×900 screen the brief never takes more than one scroll-screen, and the visit timeline is visible alongside it.
- No truncated action titles in the review UI.
