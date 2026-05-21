# Coach Visit Workflow (#40) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the coaching visit cycle by adding a pre-visit dealer intelligence briefing sheet and a full multi-page post-visit PDF report.

**Architecture:** Two independent additions. `VisitBriefingSheet` is a self-contained sheet component fetching 4 parallel data sources (scores, actions, last visit, coach notes) mounted in CoachDashboard. `generateVisitReport` is a new exported function in the existing `pdfReportGenerator.ts` using the same jsPDF instance pattern — no new file needed. Both are wired into CoachDashboard's visit history row.

**Tech Stack:** React 18 + TypeScript + Vite + Supabase + jsPDF + Tailwind + shadcn/ui + date-fns

---

## File Map

### New files
- `src/components/coach/VisitBriefingSheet.tsx` — pre-visit intelligence sheet (4 sections)

### Modified files
- `src/pages/CoachDashboard.tsx` — Briefing button + VisitBriefingSheet mount + Download Visit Report button
- `src/lib/pdfReportGenerator.ts` — `VisitReportData` interface + `generateVisitReport()` function

---

## Task 1: Create VisitBriefingSheet component

**Files:**
- Create: `src/components/coach/VisitBriefingSheet.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/coach/VisitBriefingSheet.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, AlertCircle, StickyNote, CalendarDays } from 'lucide-react';
import { STATIC_BENCHMARKS, sectionToModuleCode } from '@/lib/benchmarkUtils';
import { getDepartmentName } from '@/lib/departmentNames';
import { VISIT_MODULES } from '@/lib/coachVisitUtils';

interface VisitBriefingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string;
  dealerName: string;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
}

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

interface BriefingData {
  scores: Record<string, number>;
  topActions: Array<{
    id: string;
    action_title: string;
    priority: string;
    last_status_updated_at: string | null;
  }>;
  lastVisit: {
    visit_date: string;
    visit_type: string | null;
    modules_reviewed: string[];
    summary: string | null;
  } | null;
  recentNotes: Array<{
    id: string;
    note_text: string;
    created_at: string;
  }>;
}

export function VisitBriefingSheet({
  open,
  onOpenChange,
  dealershipId,
  dealerName,
  latestAssessmentId,
  latestScore,
  latestDate,
}: VisitBriefingSheetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BriefingData | null>(null);

  useEffect(() => {
    if (open) fetchBriefingData();
  }, [open, dealershipId, latestAssessmentId]);

  const fetchBriefingData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch all 4 data sources in parallel
      const [scoresResult, assessmentsResult, visitResult, notesResult] = await Promise.all([
        // 1. Assessment scores
        latestAssessmentId
          ? supabase.from('assessments').select('scores').eq('id', latestAssessmentId).single()
          : Promise.resolve({ data: null }),

        // 2. Assessment IDs for this dealership (to filter actions)
        supabase
          .from('assessments')
          .select('id')
          .eq('dealership_id', dealershipId),

        // 3. Last completed visit with summary
        supabase
          .from('coach_visits')
          .select('visit_date, visit_type, modules_reviewed, summary')
          .eq('coach_user_id', user.id)
          .eq('dealership_id', dealershipId)
          .eq('status', 'completed')
          .not('summary', 'is', null)
          .order('visit_date', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // 4. Recent coach notes
        supabase
          .from('coach_notes')
          .select('id, note_text, created_at')
          .eq('dealership_id', dealershipId)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const assessmentIds = (assessmentsResult.data ?? []).map((a: { id: string }) => a.id);

      // Top 3 open/overdue actions — separate query after getting assessment IDs
      const actionsResult = assessmentIds.length > 0
        ? await supabase
            .from('improvement_actions')
            .select('id, action_title, priority, last_status_updated_at')
            .in('assessment_id', assessmentIds)
            .in('status', ['Open', 'In Progress'])
            .order('urgency_score', { ascending: false, nullsFirst: false })
            .limit(3)
        : { data: [] };

      setData({
        scores: (scoresResult.data as any)?.scores ?? {},
        topActions: (actionsResult.data ?? []) as BriefingData['topActions'],
        lastVisit: (visitResult.data as BriefingData['lastVisit']) ?? null,
        recentNotes: (notesResult.data ?? []) as BriefingData['recentNotes'],
      });
    } catch {
      // Silently fail — briefing shows empty sections rather than crashing
    } finally {
      setLoading(false);
    }
  };

  const getDaysStale = (lastUpdated: string | null): number | null => {
    if (!lastUpdated) return null;
    return Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86_400_000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Pre-Visit Briefing — {dealerName}
          </SheetTitle>
          {latestScore !== null && latestDate && (
            <p className="text-xs text-muted-foreground">
              Assessment {format(new Date(latestDate), 'dd MMM yyyy')} · Overall{' '}
              <span className="font-semibold text-foreground">{Math.round(latestScore)}/100</span>
            </p>
          )}
        </SheetHeader>

        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading briefing…</p>
          </div>
        ) : data && (
          <div className="mt-6 space-y-6">

            {/* Section 1: Dept Scores vs Benchmark */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Dept scores vs benchmark
              </p>
              <div className="space-y-2.5">
                {DEPT_ORDER.map(sectionId => {
                  const score = data.scores[sectionId];
                  if (score === undefined) return null;
                  const benchmark = STATIC_BENCHMARKS[sectionToModuleCode(sectionId)]?.meanScore ?? 70;
                  const gap = Math.round(score - benchmark);
                  return (
                    <div key={sectionId} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">
                        {getDepartmentName(sectionId, 'en')}
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score >= 75 ? 'bg-emerald-500' :
                            score >= 55 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-7 text-right">{Math.round(score)}</span>
                      <span className={`text-[10px] w-10 text-right font-medium ${
                        gap >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {gap >= 0 ? `▲ +${gap}` : `▼ ${gap}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Focus Actions */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Focus actions
              </p>
              {data.topActions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No open actions — dealer is on track.</p>
              ) : (
                <div className="space-y-2">
                  {data.topActions.map(action => {
                    const daysStale = getDaysStale(action.last_status_updated_at);
                    return (
                      <div key={action.id} className="flex items-start gap-2 rounded-md border border-border px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-snug truncate">{action.action_title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className={`text-[10px] capitalize ${PRIORITY_COLORS[action.priority] ?? ''}`}>
                            {action.priority}
                          </Badge>
                          {daysStale !== null && daysStale > 14 && (
                            <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {daysStale}d
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Section 3: Last Visit */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Last visit
              </p>
              {!data.lastVisit ? (
                <p className="text-xs text-muted-foreground">No previous visit logged.</p>
              ) : (
                <div className="rounded-md border border-border px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">
                      {format(new Date(data.lastVisit.visit_date), 'dd MMM yyyy')}
                    </span>
                    {data.lastVisit.visit_type && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {data.lastVisit.visit_type}
                      </Badge>
                    )}
                    {data.lastVisit.modules_reviewed.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {data.lastVisit.modules_reviewed
                          .map(id => VISIT_MODULES.find(m => m.id === id)?.label ?? id)
                          .join(', ')}
                      </span>
                    )}
                  </div>
                  {data.lastVisit.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {data.lastVisit.summary}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Section 4: Coach Notes */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Recent coach notes
              </p>
              {data.recentNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentNotes.map(note => (
                    <div key={note.id} className="flex items-start gap-2">
                      <StickyNote className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed">{note.note_text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNowStrict(new Date(note.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/VisitBriefingSheet.tsx
git commit -m "feat(coach): create VisitBriefingSheet — pre-visit dealer intelligence"
```

---

## Task 2: Wire VisitBriefingSheet into CoachDashboard

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Read CoachDashboard.tsx in full before editing**

Read the entire file (in chunks if needed). Understand: where dealer card action buttons are rendered, where existing sheets (VisitSheet, CoachNoteSheet, VisitLogSheet) are mounted at the bottom of the JSX.

- [ ] **Step 2: Add import**

Add to the imports at the top of `CoachDashboard.tsx`:

```tsx
import { VisitBriefingSheet } from '@/components/coach/VisitBriefingSheet';
```

- [ ] **Step 3: Add state**

Inside the component body, alongside existing state declarations, add:

```tsx
const [briefingDealerId, setBriefingDealerId]   = useState<string | null>(null);
const [briefingSheetOpen, setBriefingSheetOpen] = useState(false);
```

- [ ] **Step 4: Add the Briefing button to each dealer card**

Find where dealer card action buttons are rendered (the row with Notes/Visit/History buttons). Add a "Briefing" button in that row:

```tsx
<Button
  variant="ghost"
  size="sm"
  className="h-7 text-xs gap-1"
  onClick={() => {
    setBriefingDealerId(dealer.dealershipId);
    setBriefingSheetOpen(true);
  }}
>
  <CalendarDays className="h-3 w-3" />
  Briefing
</Button>
```

`CalendarDays` is already imported in CoachDashboard (check — if not, add it to the lucide import line).

- [ ] **Step 5: Mount VisitBriefingSheet at the bottom of the JSX**

At the bottom of the dashboard JSX, alongside the existing `<VisitSheet>`, `<CoachNoteSheet>`, `<VisitLogSheet>` mounts, add:

```tsx
{briefingDealerId && (
  <VisitBriefingSheet
    open={briefingSheetOpen}
    onOpenChange={setBriefingSheetOpen}
    dealershipId={briefingDealerId}
    dealerName={dealers.find(d => d.dealershipId === briefingDealerId)?.dealerName ?? ''}
    latestAssessmentId={dealers.find(d => d.dealershipId === briefingDealerId)?.latestAssessmentId ?? null}
    latestScore={dealers.find(d => d.dealershipId === briefingDealerId)?.latestScore ?? null}
    latestDate={dealers.find(d => d.dealershipId === briefingDealerId)?.latestDate ?? null}
  />
)}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach): add Briefing button to CoachDashboard dealer cards"
```

---

## Task 3: Add generateVisitReport to pdfReportGenerator.ts

**Files:**
- Modify: `src/lib/pdfReportGenerator.ts`

- [ ] **Step 1: Read pdfReportGenerator.ts top section**

Read the first 20 lines to confirm current imports, then skim to find the end of the file (after `generatePDFReport`).

- [ ] **Step 2: Add missing imports at the top of the file**

Add to the existing imports in `pdfReportGenerator.ts`:

```ts
import { format } from 'date-fns';
import { sectionToModuleCode, STATIC_BENCHMARKS } from '@/lib/benchmarkUtils';
import { VISIT_MODULES, type CoachVisit } from '@/lib/coachVisitUtils';
```

- [ ] **Step 3: Add VisitReportData interface**

Add this interface after the existing `PDFExportData` interface (around line 290):

```ts
export interface VisitReportData {
  dealerName: string;
  dealerLocation: string;
  coachName: string;
  visit: Pick<CoachVisit, 'id' | 'visit_date' | 'visit_type' | 'modules_reviewed' | 'summary' | 'next_visit_date' | 'agreed_action_ids'>;
  scores: Record<string, number>;
  benchmarks: Record<string, { meanScore: number }>;
  agreedActions: Array<{
    action_title: string;
    department: string;
    priority: string;
    status: string;
  }>;
  lang?: string;
}
```

- [ ] **Step 4: Add generateVisitReport function**

Add this function at the END of `pdfReportGenerator.ts`, after `generatePDFReport`:

```ts
export async function generateVisitReport(data: VisitReportData): Promise<void> {
  const lang = data.lang ?? 'en';
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW  = pdf.internal.pageSize.getWidth();
  const pageH  = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  const footerY  = pageH - 10;

  let pageNum = 1;

  const addFooter = (num: number) => {
    pdf.setFontSize(7);
    pdf.setTextColor(130, 130, 130);
    pdf.setFont('helvetica', 'normal');
    const visitDateStr = format(new Date(data.visit.visit_date), 'dd MMM yyyy');
    pdf.text(
      `${data.coachName}  |  ${data.dealerName}  |  ${visitDateStr}  |  Page ${num}`,
      margin,
      footerY
    );
  };

  // ── PAGE 1: VISIT SUMMARY ──────────────────────────────────────────────
  // Dark header band
  pdf.setFillColor(24, 24, 27);
  pdf.rect(0, 0, pageW, 44, 'F');
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Coaching Visit Report', margin, 18);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${data.dealerName}  ·  ${format(new Date(data.visit.visit_date), 'dd MMMM yyyy')}`, margin, 28);
  pdf.text(`Coach: ${data.coachName}`, margin, 36);
  pdf.setTextColor(0, 0, 0);

  let ny = 54;

  // Visit type
  if (data.visit.visit_type) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Visit type', margin, ny);
    pdf.setFont('helvetica', 'normal');
    const typeLabel = data.visit.visit_type.charAt(0).toUpperCase() + data.visit.visit_type.slice(1);
    pdf.text(typeLabel, margin + 38, ny);
    ny += 8;
  }

  // Modules reviewed
  if (data.visit.modules_reviewed.length > 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Modules reviewed', margin, ny);
    const moduleLabels = data.visit.modules_reviewed
      .map(id => VISIT_MODULES.find(m => m.id === id)?.label ?? id)
      .join(', ');
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(moduleLabels, contentW - 38);
    pdf.text(lines, margin + 38, ny);
    ny += lines.length * 5 + 5;
  }

  // Session summary
  if (data.visit.summary) {
    ny += 4;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Session Summary', margin, ny);
    ny += 7;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = pdf.splitTextToSize(data.visit.summary, contentW);
    for (const line of summaryLines) {
      if (ny > pageH - 25) {
        addFooter(pageNum);
        pdf.addPage();
        pageNum++;
        ny = margin;
      }
      pdf.text(line, margin, ny);
      ny += 5;
    }
  }

  // Next visit date
  if (data.visit.next_visit_date) {
    ny += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Next visit', margin, ny);
    pdf.setFont('helvetica', 'normal');
    pdf.text(format(new Date(data.visit.next_visit_date), 'dd MMMM yyyy'), margin + 38, ny);
  }

  addFooter(pageNum);

  // ── PAGE 2: PERFORMANCE SNAPSHOT ─────────────────────────────────────
  pdf.addPage();
  pageNum++;
  ny = margin;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Performance at Time of Visit', margin, ny);
  ny += 5;
  pdf.setDrawColor(210, 210, 210);
  pdf.line(margin, ny, pageW - margin, ny);
  ny += 10;

  const DEPT_ORDER_PDF = [
    'new-vehicle-sales',
    'used-vehicle-sales',
    'service-performance',
    'parts-inventory',
    'financial-operations',
  ] as const;

  for (const sectionId of DEPT_ORDER_PDF) {
    const score = data.scores[sectionId];
    if (score === undefined) continue;
    const benchmark = data.benchmarks[sectionToModuleCode(sectionId)]?.meanScore ?? 70;
    const gap = Math.round(score - benchmark);
    const deptLabel = DEPT_NAMES[sectionId]?.[lang] ?? sectionId;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(deptLabel, margin, ny);

    const barX = margin + 58;
    const barW = 75;
    const barH = 4;

    pdf.setFillColor(235, 235, 235);
    pdf.rect(barX, ny - 3.5, barW, barH, 'F');

    const fillW = (Math.min(Math.max(score, 0), 100) / 100) * barW;
    if (score >= 75) pdf.setFillColor(22, 163, 74);
    else if (score >= 55) pdf.setFillColor(234, 179, 8);
    else pdf.setFillColor(220, 38, 38);
    pdf.rect(barX, ny - 3.5, fillW, barH, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.text(String(Math.round(score)), barX + barW + 4, ny);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    if (gap >= 0) pdf.setTextColor(22, 163, 74);
    else pdf.setTextColor(220, 38, 38);
    pdf.text(gap >= 0 ? `▲ +${gap}` : `▼ ${gap}`, barX + barW + 18, ny);
    pdf.setTextColor(0, 0, 0);

    ny += 13;
  }

  ny += 4;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  pdf.text('Gap vs indicative industry benchmark. Scores from most recent assessment at time of visit.', margin, ny);

  addFooter(pageNum);

  // ── PAGE 3: AGREED ACTIONS ────────────────────────────────────────────
  pdf.addPage();
  pageNum++;
  ny = margin;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Agreed Actions', margin, ny);
  ny += 5;
  pdf.setDrawColor(210, 210, 210);
  pdf.line(margin, ny, pageW - margin, ny);
  ny += 10;

  if (data.agreedActions.length === 0) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(130, 130, 130);
    pdf.text('No actions were formally agreed in this session.', margin, ny);
  } else {
    // Table header
    pdf.setFillColor(245, 245, 242);
    pdf.rect(margin, ny - 4, contentW, 7, 'F');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    const colAction = margin + 2;
    const colDept   = margin + 95;
    const colPriority = margin + 130;
    const colStatus   = margin + 155;
    pdf.text('Action', colAction, ny);
    pdf.text('Department', colDept, ny);
    pdf.text('Priority', colPriority, ny);
    pdf.text('Status', colStatus, ny);
    ny += 6;

    pdf.setFont('helvetica', 'normal');
    for (const action of data.agreedActions) {
      if (ny > pageH - 20) {
        addFooter(pageNum);
        pdf.addPage();
        pageNum++;
        ny = margin;
      }
      pdf.setDrawColor(230, 228, 220);
      pdf.line(margin, ny - 3, margin + contentW, ny - 3);
      const titleLines = pdf.splitTextToSize(action.action_title ?? '', 90);
      pdf.text(titleLines, colAction, ny);
      pdf.text(action.department ?? '', colDept, ny);
      pdf.text((action.priority ?? '').charAt(0).toUpperCase() + (action.priority ?? '').slice(1), colPriority, ny);
      pdf.text(action.status ?? '', colStatus, ny);
      ny += Math.max(titleLines.length * 4.5, 7) + 2;
    }
  }

  addFooter(pageNum);

  // ── Save ──────────────────────────────────────────────────────────────
  const safeDealer = data.dealerName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const visitDateFile = data.visit.visit_date.replace(/-/g, '');
  pdf.save(`Visit_Report_${safeDealer}_${visitDateFile}.pdf`);
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pdfReportGenerator.ts
git commit -m "feat(pdf): add generateVisitReport — post-visit coaching PDF report"
```

---

## Task 4: Wire Download Visit Report into CoachDashboard

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Add import**

Add to the imports at the top of `CoachDashboard.tsx`:

```tsx
import { generateVisitReport, type VisitReportData } from '@/lib/pdfReportGenerator';
import { STATIC_BENCHMARKS } from '@/lib/benchmarkUtils';
```

- [ ] **Step 2: Add downloadVisitReport handler**

Inside the component body, add this function (place it near other handler functions like `fetchDealerVisits`):

```tsx
const downloadVisitReport = async (visit: CoachVisit, dealer: AssignedDealer) => {
  // 1. Fetch latest assessment scores for this dealership
  const { data: assessments } = await supabase
    .from('assessments')
    .select('scores')
    .eq('dealership_id', dealer.dealershipId)
    .order('created_at', { ascending: false })
    .limit(1);
  const scores = (assessments?.[0] as any)?.scores ?? {};

  // 2. Fetch agreed actions by IDs (if any)
  let agreedActions: VisitReportData['agreedActions'] = [];
  if (visit.agreed_action_ids.length > 0) {
    const { data: actions } = await supabase
      .from('improvement_actions')
      .select('action_title, department, priority, status')
      .in('id', visit.agreed_action_ids);
    agreedActions = (actions ?? []) as VisitReportData['agreedActions'];
  }

  // 3. Build report data
  const reportData: VisitReportData = {
    dealerName: dealer.dealerName,
    dealerLocation: dealer.location,
    coachName: user?.email ?? 'Coach',
    visit,
    scores,
    benchmarks: STATIC_BENCHMARKS,
    agreedActions,
    lang: 'en',
  };

  await generateVisitReport(reportData);
};
```

IMPORTANT: `AssignedDealer` type has a `location` field — verify this when reading the file. If the field is named differently (e.g., `dealerLocation`), adjust accordingly.

- [ ] **Step 3: Add Download Visit Report button to visit history rows**

Find the visit history panel rendered when `visitHistoryDealerId === dealer.dealershipId`. This was added in the #79 implementation. Find the existing row that shows a completed visit and has the "Edit log" / "Log session" button. Add a "Download Report" button next to it, visible only when `v.status === 'completed' && v.summary`:

```tsx
{v.status === 'completed' && v.summary && (
  <Button
    variant="ghost"
    size="sm"
    className="h-7 text-xs shrink-0"
    onClick={() => downloadVisitReport(v, dealer)}
  >
    ↓ Report
  </Button>
)}
```

Place this button in the same `flex` row as the existing "Edit log" / "Log session" button.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Run tests**

```bash
npx vitest run
```

Expected: all 193 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat(coach): wire Download Visit Report into CoachDashboard visit history"
```

---

## Final Verification

- [ ] **Manual smoke test checklist**

1. As a coach on CoachDashboard: click "Briefing" on a dealer — verify sheet opens with 4 sections. Check a dealer that has no visits or notes — verify empty states show correctly.
2. Open visit history for a dealer with a completed + logged visit — verify "Download Report" button appears.
3. Click "Download Report" — verify PDF downloads. Open PDF and confirm: 3 pages, correct dealer name/coach name/date, dept score bars visible, agreed actions table present (or empty state).
4. Verify "Briefing" button does NOT appear on dealers with no `latestAssessmentId` — or gracefully shows score sections empty.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: #40 coach visit workflow — pre-visit briefing + post-visit PDF report"
```
