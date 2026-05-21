# Design Spec: #40 Coach Visit Workflow
**Date:** 2026-05-21  
**Status:** Approved  
**Tracker item:** #40 (Coach visit workflow — pre-visit briefing + post-visit PDF)

---

## Overview

#40 completes the coaching visit cycle. #79 built the data layer (session log, agreed actions, visit history panel). #40 adds the two remaining pieces:

1. **Pre-visit briefing** — a dealer intelligence sheet coaches open before a visit to refresh context: dept scores vs benchmark, top open/overdue actions, last visit summary, recent coach notes.
2. **Post-visit PDF** — a full multi-page coaching visit report exportable after a session log is saved: visit summary, performance snapshot, agreed actions table.

No new DB tables or columns required. All data is already available via existing tables and utilities.

---

## Part A — Pre-Visit Briefing

### Entry point

A "Briefing" button added to each dealer card in `CoachDashboard.tsx`, alongside the existing History / Notes / Visit buttons. Opens `VisitBriefingSheet` as a right-side sheet.

### New file: `src/components/coach/VisitBriefingSheet.tsx`

**Props:**
```ts
interface VisitBriefingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string;
  dealerName: string;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
}
```

**Data fetched on open (4 parallel queries):**

1. **Assessment scores** — `assessments.select('scores, created_at').eq('id', latestAssessmentId)` → dept breakdown
2. **Top 3 actions** — `improvement_actions` filtered to dealership's assessments, status IN ('Open','In Progress'), ordered by `urgency_score desc nulls last`, limit 3
3. **Last completed visit** — `coach_visits` where `coach_user_id = user.id AND dealership_id = X AND status = 'completed' AND summary IS NOT NULL`, order by `visit_date desc`, limit 1
4. **Recent coach notes** — `coach_notes` where `dealership_id = X`, order by `created_at desc`, limit 3

Benchmarks: use `STATIC_BENCHMARKS` from `@/lib/benchmarkUtils` (no async fetch needed — static data is sufficient for a briefing).

**Sheet layout (top to bottom):**

```
SheetTitle: "Pre-Visit Briefing — [Dealer Name]"
Subtext: "Assessment [formatted date] · Overall [score]/100"

Section 1: Dept Scores vs Benchmark
─────────────────────────────────────
5 rows, one per dept (NVS, UVS, SVC, PTS, FIN):
  [Dept name]   [score bar 0–100]   [score]   [gap chip: ▲+N or ▼-N vs benchmark]
Gap chip: green if score > benchmark, amber if within 5, red if below

Section 2: Focus Actions (top 3)
─────────────────────────────────────
Each row: action title | priority badge | "N days stale" chip (if last_status_updated_at > 14 days)
Empty state: "No open actions — dealer is on track."

Section 3: Last Visit
─────────────────────────────────────
Date + visit type badge + modules reviewed chips
Summary excerpt (max 200 chars, truncated with "…")
Empty state: "No previous visit logged."

Section 4: Coach Notes
─────────────────────────────────────
Last 3 coach_notes entries — note text + relative date
Empty state: "No notes yet."
```

**State:** `loading: boolean` shown during parallel fetches. Each section renders independently (no waterfall).

---

## Part B — Post-Visit PDF

### Entry point

"Download Visit Report" button in the visit history row in CoachDashboard, visible only when `visit.status === 'completed' && visit.summary !== null`. Clicking triggers `generateVisitReport(data)`.

### Modified file: `src/lib/pdfReportGenerator.ts`

**New interface:**
```ts
export interface VisitReportData {
  dealerName: string;
  dealerLocation: string;
  coachName: string;
  visit: {
    id: string;
    visit_date: string;
    visit_type: string | null;
    modules_reviewed: string[];
    summary: string | null;
    next_visit_date: string | null;
    agreed_action_ids: string[];
  };
  scores: Record<string, number>;
  benchmarks: Record<string, { meanScore: number }>;
  agreedActions: Array<{
    action_title: string;
    department: string;
    priority: string;
    status: string;
  }>;
  lang: string;
}
```

**New function: `generateVisitReport(data: VisitReportData): Promise<void>`**

Uses same jsPDF instance pattern as `generatePDFReport`. Filename: `Visit_Report_[DealerName]_[Date].pdf`.

**PDF structure:**

**Page 1 — Visit Summary**
- Header bar: dealership name (large) + coach name (small) + date
- Visit type badge row: In-person / Remote / Phone
- Modules reviewed: chips for each reviewed module
- "Session Summary" heading + full summary text (word-wrapped)
- "Next Visit" row (if `next_visit_date` set): formatted date

**Page 2 — Performance Snapshot**
- Section heading: "Performance at Time of Visit"
- 5 dept rows with horizontal score bar + score value + benchmark gap indicator
- Uses same `DEPT_NAMES` + `STATIC_BENCHMARKS` as existing PDF

**Page 3 — Agreed Actions**
- Section heading: "Agreed Actions"
- Table with 4 columns: Action | Department | Priority | Status
- One row per action in `agreedActions[]`
- If `agreedActions` is empty: "No actions were formally agreed in this session."
- Footer on each page: coach name + dealer name + visit date + page N of M

### Data assembly in CoachDashboard

When the "Download Visit Report" button is clicked, CoachDashboard:
1. Fetches `assessments.select('scores').eq('dealership_id', X).order('created_at', desc).limit(1)` for scores
2. Fetches `improvement_actions.select('action_title,department,priority,status').in('id', visit.agreed_action_ids)` for agreed actions
3. Uses `STATIC_BENCHMARKS` from `@/lib/benchmarkUtils` — add this import to CoachDashboard if not already present
4. Calls `generateVisitReport(data)`

---

## Modified Files Summary

| File | Change |
|---|---|
| `src/components/coach/VisitBriefingSheet.tsx` | **New** — pre-visit briefing sheet |
| `src/pages/CoachDashboard.tsx` | Add Briefing button + wire VisitBriefingSheet + Download Visit Report button + generateVisitReport call |
| `src/lib/pdfReportGenerator.ts` | Add `VisitReportData` interface + `generateVisitReport()` function |

---

## Out of Scope

- Real-time benchmark fetch (static benchmarks sufficient for briefing)
- Briefing PDF export (the post-visit PDF covers this)
- Push notifications on visit day (separate notification feature)
- OEM-level visit reporting (future: visit history feeds SteerCo reports)
