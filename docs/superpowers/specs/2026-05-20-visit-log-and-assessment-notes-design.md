# Design Spec: #79 Visit Log + #81 Assessment Notes Surfaces
**Date:** 2026-05-20  
**Status:** Approved  
**Tracker items:** #79 (Site visit / coaching session log), #81 (Assessment notes surfaced in Results + Actions)

---

## Overview

Two independent features sharing a single implementation cycle:

- **#79**: Extend existing `coach_visits` table and `VisitSheet` infrastructure with a rich post-visit session log. Coaches capture what happened, which modules were reviewed, and what actions were agreed — linked back to `improvement_actions` with visit provenance.
- **#81**: Wire the existing `assessment_notes` table (already populated, already hooked) into three downstream surfaces: Results department cards, action cards/ActionSheet, and the PDF report appendix.

---

## #79 — Site Visit / Coaching Session Log

### Data Layer

**Migration:** Extend `coach_visits` with 5 nullable columns. No new table.

```sql
ALTER TABLE coach_visits
  ADD COLUMN visit_type        text CHECK (visit_type IN ('in-person','remote','phone')),
  ADD COLUMN modules_reviewed  text[]    DEFAULT '{}',
  ADD COLUMN summary           text,
  ADD COLUMN next_visit_date   date,
  ADD COLUMN agreed_action_ids uuid[]    DEFAULT '{}';
```

- Existing RLS (`coach_user_id = auth.uid()`) covers all new columns — no policy changes needed.
- After migration: regenerate `src/integrations/supabase/types.ts` via Supabase MCP.

**Provenance on `improvement_actions`:** Two nullable columns added via migration:
```sql
ALTER TABLE improvement_actions
  ADD COLUMN source_visit_id    uuid REFERENCES coach_visits(id),
  ADD COLUMN source_question_id text;
```
- `source_visit_id`: set when a coach creates an action from `VisitLogSheet`. Enables "Agreed in visit [date]" badge.
- `source_question_id`: set when signal engine creates an action from a scored question (future wiring — column added now, populated later). Enables note icon on action cards. Existing actions will have `null` — note icon is hidden for those (graceful degradation).

### New Files

#### `src/lib/coachVisitUtils.ts`
Shared types and helpers:
```ts
export type VisitStatus = 'proposed' | 'confirmed' | 'cancelled' | 'completed';
export type VisitType   = 'in-person' | 'remote' | 'phone';
export const VISIT_MODULES = ['NVS', 'UVS', 'SVC', 'PTS', 'FIN'] as const;

export interface CoachVisit {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  visit_date: string;
  status: VisitStatus;
  visit_notes: string | null;
  visit_type: VisitType | null;
  modules_reviewed: string[];
  summary: string | null;
  next_visit_date: string | null;
  agreed_action_ids: string[];
  created_at: string | null;
  updated_at: string | null;
}
```

#### `src/components/coach/VisitLogSheet.tsx`
Sheet opened by "Log Session" / "Edit Log" button on a completed visit.

**Props:**
```ts
interface VisitLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: CoachVisit;
  dealershipId: string;
  dealerName: string;
  onLogSaved: () => void;
}
```

**Form sections (in order):**

1. **Visit type** — radio group: In-person / Remote / Phone
2. **Modules reviewed** — checkbox group: NVS, UVS, SVC, PTS, FIN (multi-select)
3. **Session summary** — textarea, max 3000 chars
4. **Next visit date** — date picker (optional)
5. **Agreed actions** — two sub-sections:
   - *Link existing*: fetches open `improvement_actions` for `dealership_id`, renders as searchable multi-select. Selecting an action appends its `id` to `agreed_action_ids` on `coach_visits`.
   - *Add new*: title (required) + department select + priority select → on save, inserts new row into `improvement_actions` with `source_visit_id = visit.id` and standard defaults.

**Save behaviour:** PATCH `coach_visits` row with all log fields. New actions are inserted first, then their IDs appended to `agreed_action_ids`.

### Modified Files

#### `src/components/coach/VisitSheet.tsx`
- Add "Mark as completed" button on confirmed visits (currently only Cancel exists).
- On mark-complete: UPDATE `coach_visits SET status = 'completed'`, call `onVisitSaved()`.
- No log capture in this sheet — that's `VisitLogSheet`'s job.

#### `src/pages/CoachDashboard.tsx`
- Add **"Visit History"** as a new tab alongside existing dealer tabs (or within the dealer card expanded view).
- Each history row: date chip | visit type badge | modules reviewed chips | summary excerpt (truncated 80 chars) | "Log Session" CTA (if completed + `summary` is null) or "View / Edit Log" (if summary exists).
- "Log Session" / "View / Edit Log" opens `VisitLogSheet`.
- VisitSheet (scheduling) button remains on dealer card header — unchanged entry point.

### Provenance Badge

On action cards (in `ActionPlan.tsx` / `KanbanBoard` view) where `source_visit_id` is non-null:
- Small badge: `Agreed in visit · [formatted date]`
- Date fetched via JOIN or passed as prop from parent query that already loads visits.

---

## #81 — Assessment Notes Surfaced in Results + Actions

### Data Flow

`useAssessmentNotes()` already loads all notes as `Record<questionId, noteText>` for the current user. The hook is extended slightly and passed down to three callsites.

```
useAssessmentNotes() → notes: Record<string, string>
  ↓
  ├── Results dept cards   → filter by dept question IDs → Field Notes collapsible
  ├── Action cards         → check source_question_id → note icon + tooltip
  ├── ActionSheet          → show raw note from triggering question
  └── pdfReportGenerator   → iterate all notes → Appendix table
```

### Surface 1: Results Department Cards

**File:** whichever component renders per-department score cards in `src/components/results/`.

- Add `notes: Record<string, string>` prop.
- At bottom of each card: `<FieldNotesCollapsible notes={deptNotes} />` — only renders when dept has ≥1 note.
- `deptNotes` = `notes` filtered to question IDs belonging to that department (derived from `questionnaire.ts` dept groupings).
- Collapsible shows: per-question label + note text. Collapsed by default. Trigger: "Field Notes (N)" where N = count.

**New component:** `src/components/results/FieldNotesCollapsible.tsx`
```ts
interface FieldNotesCollapsibleProps {
  notes: Record<string, string>; // questionId → text, pre-filtered to dept
  questionLabels: Record<string, string>; // questionId → short label
}
```
Uses shadcn `Collapsible`. Renders a list of `<dt>` label + `<dd>` note text pairs.

### Surface 2: Action Cards + ActionSheet

**Action card note indicator:**
- `improvement_actions` rows have a `source_question_id` column (check types — if not present, this is a nullable column to add or derive from the signal mapping).
- If `notes[action.source_question_id]` exists: render `<StickyNote className="h-3 w-3" />` icon with a `Tooltip` showing the note text (max 120 chars, truncated).
- Icon sits inline with priority badge on the action card.

**ActionSheet note section:**
- When `action.source_question_id` is set and `notes[action.source_question_id]` exists:
- Render a read-only "Note from assessment" section above the description field.
- Styled as a subtle inset panel: light amber background, `StickyNote` icon, note text.

### Surface 3: PDF Appendix

**File:** `src/lib/pdfReportGenerator.ts`

- New section appended after the existing action plan section: **"Dealer Field Notes"**.
- Table format: three columns — Department | Question | Field Note.
- Rows: one per note, sorted by department order (NVS → UVS → SVC → PTS → FIN).
- Only included in PDF when `Object.keys(notes).length > 0`.
- Question labels derived from `questionnaire.ts` lookups by `question_id`.
- Section header matches existing PDF section heading style.

---

## Implementation Order

1. **DB migration** — `coach_visits` new columns + `improvement_actions.source_visit_id` + `improvement_actions.source_question_id`
2. **Regenerate types**
3. **`coachVisitUtils.ts`** — shared types
4. **`VisitSheet.tsx`** — add Mark as Completed button
5. **`VisitLogSheet.tsx`** — full session log form
6. **`CoachDashboard.tsx`** — Visit History tab + wire VisitLogSheet
7. **`FieldNotesCollapsible.tsx`** — new component
8. **Results dept cards** — add Field Notes collapsible
9. **Action cards** — note indicator icon
10. **`ActionSheet.tsx`** — "Note from assessment" inset panel
11. **`pdfReportGenerator.ts`** — Dealer Field Notes appendix

---

## Out of Scope

- #82 sentiment analysis (separate task)
- Coach assignment management UI
- Visit notifications / reminders
- `source_question_id` on `improvement_actions` — if column doesn't exist in current schema, the action card icon and ActionSheet note panel are skipped (graceful degradation, not a blocker).
