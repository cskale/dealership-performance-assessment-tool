# Coach Briefing Pack — Full-Width Two-Column Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the narrow `max-w-2xl` `DealerPanel` dialog with a full-width two-column command-centre modal and fix the broken `CoachDashboard.tsx` wiring that deleted the DealerPanel state/render.

**Architecture:** Single-file rewrite of `DealerPanel.tsx` — Dialog container widens to `w-[95vw] max-w-7xl h-[90vh]`; internal layout splits into left column (header stats + top focus actions + tabbed activity/visits/notes) and right sidebar (dept health + upcoming visit + conditional staleness insight). `BriefingTab` is removed; its data moves into persistent sidebar cards. `CoachDashboard.tsx` gets a targeted 4-line state restore + render block restore.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (`Dialog`, `Badge`, `Button`, `Textarea`, `Select`, `Calendar`), date-fns, Supabase client, existing utilities (`getScoreBand`, `STATIC_BENCHMARKS`, `sectionToModuleCode`, `getDepartmentName`, `VISIT_MODULES`)

---

## File Map

| File | Change |
|---|---|
| `src/pages/CoachDashboard.tsx` | Restore 3 deleted state vars, DealerPanel import, render block; update button tab names; make card clickable |
| `src/components/coach/DealerPanel.tsx` | Widen Dialog; new 4-stat header; delete `BriefingTab`; add `CoachNotesTab`; add `TopFocusActionsCard`; add `DeptHealthCard`; add `UpcomingVisitCard`; add `InsightCard`; assemble two-column layout |

---

## Task 1: Fix CoachDashboard.tsx Wiring

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

The last commit removed DealerPanel import, 3 state vars, and the render block while leaving button `onClick` handlers that call the deleted setters — the panel never opens. This task restores all of it.

- [ ] **Step 1.1: Restore import**

In `src/pages/CoachDashboard.tsx`, the import was removed. Add it back at the top of the imports section (after the existing component imports):

```tsx
import { DealerPanel } from '@/components/coach/DealerPanel';
```

- [ ] **Step 1.2: Restore state variables**

Find the block of `useState` calls around line 241 (after `lastCompletedVisit` state). Add these three lines immediately after:

```tsx
const [panelOpen, setPanelOpen] = useState(false);
const [panelDealer, setPanelDealer] = useState<AssignedDealer | null>(null);
const [panelInitialTab, setPanelInitialTab] = useState<'activity' | 'visits' | 'notes'>('activity');
```

- [ ] **Step 1.3: Update ghost button onClick handlers**

The three ghost buttons in the dealer card (around lines 953–976) call `setPanelInitialTab` with tab names. The `'briefing'` tab no longer exists — update to `'activity'`:

```tsx
// Notes button
onClick={() => { setPanelDealer(dealer); setPanelInitialTab('activity'); setPanelOpen(true); }}

// Visits button
onClick={() => { setPanelDealer(dealer); setPanelInitialTab('visits'); setPanelOpen(true); }}

// Briefing button — change tab to 'activity' (briefing tab is gone, activity is default)
onClick={() => { setPanelDealer(dealer); setPanelInitialTab('activity'); setPanelOpen(true); }}
```

- [ ] **Step 1.4: Make dealer card clickable**

The outer `<Card>` element (around line 858) should open the panel when clicked. Add `cursor-pointer` class and `onClick`:

```tsx
<Card
  key={dealer.dealershipId}
  className="opacity-0 animate-fade-in shadow-card rounded-xl overflow-hidden cursor-pointer"
  style={{
    animationDelay: `${Math.min(i, 4) * 50}ms`,
    animationFillMode: 'forwards',
    borderTop: `3px solid ${accent}`,
  }}
  onClick={() => { setPanelDealer(dealer); setPanelInitialTab('activity'); setPanelOpen(true); }}
>
```

Then add `e.stopPropagation()` to the "Enter Dealership →" button (around line 979) so it doesn't bubble to the card click:

```tsx
<Button
  variant="default"
  size="sm"
  className="h-7 text-xs flex-1"
  onClick={(e) => { e.stopPropagation(); navigate(`/app/results/${dealer.latestAssessmentId}`); }}
>
  Enter Dealership →
</Button>
```

- [ ] **Step 1.5: Restore DealerPanel render block**

Find the comment `{/* Unified dealer panel */}` (around line 999). After it, add:

```tsx
{panelDealer && (
  <DealerPanel
    open={panelOpen}
    onOpenChange={setPanelOpen}
    dealer={panelDealer}
    latestAssessmentId={panelDealer.latestAssessmentId}
    latestScore={panelDealer.latestScore}
    latestDate={panelDealer.latestDate}
    initialTab={panelInitialTab}
    onVisitSaved={async () => {
      if (!user?.id) return;
      const dealershipIds = dealers.map(d => d.dealershipId);
      const { data } = await supabase
        .from('coach_visits')
        .select('dealership_id, visit_date, status')
        .eq('coach_user_id', user.id)
        .in('dealership_id', dealershipIds)
        .in('status', ['proposed', 'confirmed'])
        .order('visit_date', { ascending: true });
      const map = new Map<string, string>();
      (data ?? []).forEach((v: any) => {
        map.set(v.dealership_id, `${format(new Date(v.visit_date), 'dd MMM')} · ${v.status}`);
      });
      setActiveVisitsByDealer(map);
    }}
    onNoteAdded={() => { /* no-op — notes badge removed from cards */ }}
  />
)}
```

- [ ] **Step 1.6: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `setPanelDealer`, `setPanelOpen`, `setPanelInitialTab`.

- [ ] **Step 1.7: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "fix(coach): restore DealerPanel wiring in CoachDashboard"
```

---

## Task 2: Widen Dialog Container and Rewrite Header

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx`

This task changes the Dialog to full-width and replaces the single-row header with a two-row header (dealer info + 4-stat chips).

- [ ] **Step 2.1: Widen the Dialog**

In `DealerPanel.tsx`, find the `DialogContent` element (around line 1104). Change its className:

```tsx
// Before:
<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">

// After:
<DialogContent className="w-[95vw] max-w-7xl h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
```

- [ ] **Step 2.2: Add criticalGaps derived value**

Inside the `DealerPanel` component function body, after the `fetchData` function definition (around line 1095), add:

```tsx
const criticalGaps = data
  ? Object.values(data.assessmentScores).filter(s => s < 46).length
  : 0;

const upcomingVisit = data?.visits.find(v =>
  ['proposed', 'confirmed', 'counter_proposed'].includes(v.status as string)
) ?? null;

const nextVisitLabel = upcomingVisit
  ? format(new Date(upcomingVisit.visit_date), 'dd MMM yyyy')
  : 'None scheduled';
```

- [ ] **Step 2.3: Replace DialogHeader content**

Replace the entire `<DialogHeader>` block (lines ~1106–1133) with:

```tsx
<DialogHeader className="px-6 py-4 border-b border-border shrink-0 space-y-3">
  {/* Row 1: dealer identity + score */}
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <DialogTitle className="text-base font-semibold leading-tight truncate">
        {dealer.dealerName}
      </DialogTitle>
      <p className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
        <MapPin className="h-3 w-3" />
        {dealer.location}
      </p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {latestScore != null && (() => {
        const band = getScoreBand(latestScore);
        return (
          <>
            <span className="text-lg font-bold text-foreground">{Math.round(latestScore)}</span>
            <Badge variant="outline" className={`text-[10px] ${band.className}`}>
              {band.label}
            </Badge>
          </>
        );
      })()}
    </div>
  </div>

  {/* Row 2: 4-stat chips */}
  <div className="flex items-center gap-4">
    {[
      { label: 'Overall Score', value: latestScore != null ? `${Math.round(latestScore)} / 100` : '—' },
      { label: 'Active Actions', value: data ? String(data.focusActions.length) : '—' },
      { label: 'Critical Gaps', value: String(criticalGaps) },
      { label: 'Next Visit', value: nextVisitLabel },
    ].map(chip => (
      <div key={chip.label} className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{chip.label}</span>
        <span className="text-sm font-semibold text-foreground">{chip.value}</span>
      </div>
    ))}
  </div>
</DialogHeader>
```

- [ ] **Step 2.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(coach): widen DealerPanel dialog + 4-stat header"
```

---

## Task 3: Add CoachNotesTab and Update Tab System

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx`

Remove the `'briefing'` tab, add a `'notes'` tab that shows only note-type entries with a compose box.

- [ ] **Step 3.1: Update TABS constant**

Find the `TABS` constant (around line 994). Change it:

```tsx
// Before:
const TABS = ['activity', 'visits', 'briefing'] as const;

// After:
const TABS = ['activity', 'visits', 'notes'] as const;
```

- [ ] **Step 3.2: Update DealerPanelProps initialTab type**

Find the `DealerPanelProps` interface and update `initialTab`:

```tsx
export interface DealerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: AssignedDealer;
  latestAssessmentId: string | null;
  latestScore: number | null;
  latestDate: string | null;
  initialTab?: 'activity' | 'visits' | 'notes';
  onVisitSaved: () => void;
  onNoteAdded: () => void;
}
```

- [ ] **Step 3.3: Update activeTab state type and default**

In the `DealerPanel` component function, update:

```tsx
const [activeTab, setActiveTab] = useState<'activity' | 'visits' | 'notes'>(initialTab ?? 'activity');
```

- [ ] **Step 3.4: Add CoachNotesTab component**

Insert this new component above the `TABS` constant (around line 990):

```tsx
// ── CoachNotesTab ──────────────────────────────────────────────────────────────

function CoachNotesTab({
  data,
  dataLoading,
  dealer,
  user,
  onNoteAdded,
  onNoteDeleted,
}: {
  data: PanelData | null;
  dataLoading: boolean;
  dealer: AssignedDealer;
  user: { id: string; email?: string } | null;
  onNoteAdded: () => void;
  onNoteDeleted: () => void;
}) {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'observation' | 'action' | 'follow-up' | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const coachInitials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'ME';

  const handleSaveNote = async () => {
    if (!noteText.trim() || !user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('coach_notes').insert({
      coach_user_id: user.id,
      dealership_id: dealer.dealershipId,
      note_text: noteText.trim(),
      note_type: noteType || null,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to save note'); return; }
    setNoteText('');
    setNoteType('');
    onNoteAdded();
  };

  const handleDeleteNote = async (noteId: string) => {
    await supabase.from('coach_notes').delete().eq('id', noteId);
    onNoteDeleted();
  };

  const notes = data?.notes ?? [];

  return (
    <div className="p-6 space-y-5">
      {/* Compose box */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <Select value={noteType} onValueChange={v => setNoteType(v as typeof noteType)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Note type (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="action">Action</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Add a field note…"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          maxLength={2000}
          rows={3}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{noteText.length}/2000</span>
          <Button
            size="sm"
            onClick={handleSaveNote}
            disabled={!noteText.trim() || submitting}
          >
            {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Save Note
          </Button>
        </div>
      </div>

      {/* Notes feed */}
      {dataLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p>
      ) : (
        <div className="divide-y divide-border">
          {notes.map(note => (
            <div key={note.id} className="flex gap-3 py-4">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-[hsl(var(--brand-500))] text-white">
                {coachInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">You</p>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDistanceToNowStrict(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
                {note.note_type && (
                  <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 mt-1">
                    {note.note_type}
                  </Badge>
                )}
                <p className="text-sm text-foreground mt-1.5">{note.note_text}</p>
              </div>
              <button
                className="shrink-0 text-muted-foreground hover:text-[#dc2626] transition-colors mt-0.5"
                onClick={() => handleDeleteNote(note.id)}
                aria-label="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3.5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3.6: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(coach): add CoachNotesTab, replace briefing tab with notes tab"
```

---

## Task 4: Build TopFocusActionsCard

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx`

This card sits above the tabs in the left column and shows the top 3 open actions with priority, due date, and staleness.

- [ ] **Step 4.1: Add TopFocusActionsCard component**

Insert this component above `CoachNotesTab` (just added in Task 3):

```tsx
// ── TopFocusActionsCard ────────────────────────────────────────────────────────

function TopFocusActionsCard({
  focusActions,
  latestAssessmentId,
}: {
  focusActions: FocusAction[];
  latestAssessmentId: string | null;
}) {
  const navigate = useNavigate();

  if (focusActions.length === 0) {
    return (
      <div className="mx-6 mt-6 rounded-lg border border-border px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Top Focus Actions
        </p>
        <p className="text-xs text-[#16a34a] font-medium">✓ All actions on track</p>
      </div>
    );
  }

  const getDaysUntilDue = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  };

  const getDaysStale = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  };

  const priorityIcon = (p: string) => {
    if (p === 'critical' || p === 'high') return <AlertCircle className="h-4 w-4 text-[#dc2626] shrink-0" />;
    return <AlertCircle className="h-4 w-4 text-[#d97706] shrink-0" />;
  };

  return (
    <div className="mx-6 mt-6 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Top Focus Actions
        </p>
        <span className="text-[10px] text-muted-foreground">Priority: High ({focusActions.filter(a => a.priority === 'high' || a.priority === 'critical').length})</span>
      </div>
      {focusActions.map(action => {
        const daysUntil = getDaysUntilDue((action as any).target_completion_date ?? null);
        const daysStale = getDaysStale(action.last_status_updated_at);
        const isUrgent = daysUntil !== null && daysUntil <= 14;

        return (
          <div key={action.id} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-start gap-2">
              {priorityIcon(action.priority)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug">{action.action_title}</p>
                  {isUrgent && daysUntil !== null && (
                    <span className="text-[10px] font-bold text-[#dc2626] shrink-0 whitespace-nowrap">
                      DUE IN {daysUntil}D
                    </span>
                  )}
                  {!isUrgent && (action.priority === 'high' || action.priority === 'critical') && (
                    <span className="text-[10px] font-bold text-[#d97706] shrink-0 whitespace-nowrap">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className={`text-[10px] capitalize ${PRIORITY_COLORS[action.priority] ?? ''}`}>
                  {action.priority}
                </Badge>
                {daysStale !== null && daysStale > 14 && (
                  <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                    <AlertCircle className="h-2.5 w-2.5" />{daysStale}d stale
                  </span>
                )}
              </div>
              {latestAssessmentId && (
                <button
                  className="text-[10px] text-[hsl(var(--brand-500))] hover:underline"
                  onClick={() => navigate(`/app/results/${latestAssessmentId}`)}
                >
                  Open Steps →
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

Note: `useNavigate` must be imported at the top of the file. It is already imported via `react-router-dom` in `CoachDashboard.tsx` but check that `DealerPanel.tsx` also imports it. If not, add to the imports:

```tsx
import { useNavigate } from 'react-router-dom';
```

- [ ] **Step 4.2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(coach): add TopFocusActionsCard above panel tabs"
```

---

## Task 5: Build DeptHealthCard

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx`

Dept health with 5 rows showing score bar, score number, benchmark gap, and status chip.

- [ ] **Step 5.1: Add DeptHealthCard component**

Insert this component above `TopFocusActionsCard`:

```tsx
// ── DeptHealthCard ─────────────────────────────────────────────────────────────

const DEPT_HEALTH_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
] as const;

function DeptHealthCard({
  assessmentScores,
  latestAssessmentId,
  dataLoading,
}: {
  assessmentScores: Record<string, number>;
  latestAssessmentId: string | null;
  dataLoading: boolean;
}) {
  const navigate = useNavigate();
  const hasScores = DEPT_HEALTH_ORDER.some(id => assessmentScores[id] !== undefined);

  const getStatusChip = (score: number) => {
    if (score >= 75) return { label: 'Performing', cls: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
    if (score >= 46) return { label: 'Developing', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Foundational', cls: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' };
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Department Health
      </p>

      {dataLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : !hasScores ? (
        <p className="text-xs text-muted-foreground">No assessment scores available.</p>
      ) : (
        <div className="space-y-2.5">
          {DEPT_HEALTH_ORDER.map(sectionId => {
            const score = assessmentScores[sectionId];
            if (score === undefined) return null;
            const benchmark = STATIC_BENCHMARKS[sectionToModuleCode(sectionId)]?.meanScore ?? 70;
            const gap = Math.round(score - benchmark);
            const { label, cls } = getStatusChip(score);
            const barColor = score >= 75 ? 'bg-[#16a34a]' : score >= 46 ? 'bg-amber-400' : 'bg-[#dc2626]';

            return (
              <div key={sectionId} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground truncate w-32 shrink-0">
                    {getDepartmentName(sectionId, 'en')}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold w-6 text-right">{Math.round(score)}</span>
                    <span className={`text-[10px] font-medium w-12 text-right ${gap >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                      {gap >= 0 ? `▲ +${gap}` : `▼ ${gap}`}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${cls} shrink-0`}>
                      {label}
                    </Badge>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.min(Math.round(score), 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {latestAssessmentId && (
        <button
          className="text-xs text-[hsl(var(--brand-500))] hover:underline font-medium block pt-1"
          onClick={() => navigate(`/app/results/${latestAssessmentId}`)}
        >
          Full Assessment →
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5.2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(coach): add DeptHealthCard to panel sidebar"
```

---

## Task 6: Build UpcomingVisitCard and InsightCard

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx`

Two remaining right-sidebar cards.

- [ ] **Step 6.1: Add UpcomingVisitCard component**

Insert above `DeptHealthCard`:

```tsx
// ── UpcomingVisitCard ──────────────────────────────────────────────────────────

function UpcomingVisitCard({
  upcomingVisit,
  onSwitchToVisits,
}: {
  upcomingVisit: CoachVisit | null;
  onSwitchToVisits: () => void;
}) {
  const STATUS_STYLES: Record<string, string> = {
    proposed:         'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
    confirmed:        'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20',
    cancelled:        'bg-muted text-muted-foreground border-border',
    completed:        'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
    counter_proposed: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Upcoming Visit
      </p>

      {!upcomingVisit ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">No visit scheduled</p>
          <button
            className="text-xs text-[hsl(var(--brand-500))] underline"
            onClick={onSwitchToVisits}
          >
            Schedule →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              {format(new Date(upcomingVisit.visit_date), 'dd MMM yyyy')}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] capitalize ${STATUS_STYLES[upcomingVisit.status] ?? ''}`}
            >
              {upcomingVisit.status === 'counter_proposed' ? 'Counter proposed' : upcomingVisit.status}
            </Badge>
          </div>
          {upcomingVisit.visit_type && (
            <p className="text-xs text-muted-foreground capitalize">{upcomingVisit.visit_type}</p>
          )}
          {upcomingVisit.visit_notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">{upcomingVisit.visit_notes}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="h-7 text-xs flex-1"
              disabled={upcomingVisit.status !== 'proposed'}
              onClick={onSwitchToVisits}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs flex-1"
              onClick={onSwitchToVisits}
            >
              Modify
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6.2: Add InsightCard component**

Insert above `UpcomingVisitCard`:

```tsx
// ── InsightCard ────────────────────────────────────────────────────────────────

function InsightCard({
  latestDate,
  latestAssessmentId,
}: {
  latestDate: string | null;
  latestAssessmentId: string | null;
}) {
  const navigate = useNavigate();

  const daysStale = latestDate
    ? Math.floor((Date.now() - new Date(latestDate).getTime()) / 86_400_000)
    : null;

  if (daysStale !== null && daysStale < 60) return null;

  const message = daysStale === null
    ? 'No assessment on record. A baseline assessment would unlock full coaching intelligence.'
    : `Assessment data is ${daysStale} days old. This may obscure current operational trends.`;

  return (
    <div className="rounded-lg bg-[#0b1f3a] text-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Insight</p>
        <Badge variant="outline" className="text-[10px] border-white/20 text-white/70">
          ALERT
        </Badge>
      </div>
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            {daysStale === null ? 'No Assessment' : 'High Staleness Risk'}
          </p>
          <p className="text-xs text-white/60">{message}</p>
        </div>
      </div>
      {latestAssessmentId && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs border-white/20 text-white hover:bg-white/10 hover:text-white"
          onClick={() => navigate(`/app/results/${latestAssessmentId}`)}
        >
          Request Reassessment →
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 6.3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6.4: Commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(coach): add UpcomingVisitCard and InsightCard sidebar components"
```

---

## Task 7: Assemble Two-Column Layout and Remove BriefingTab

**Files:**
- Modify: `src/components/coach/DealerPanel.tsx`

Wire all new sub-components into the Dialog body. Delete `BriefingTab`. Replace the single-column scrollable body with the two-column layout.

- [ ] **Step 7.1: Delete BriefingTab**

Remove the entire `BriefingTab` function (lines ~795–990 in the original file — from `function BriefingTab` to its closing `}`). It is fully replaced by the sidebar cards and TopFocusActionsCard.

Also remove `DEPT_ORDER` constant (it was only used inside `BriefingTab`; `DeptHealthCard` uses `DEPT_HEALTH_ORDER` instead). Remove `PRIORITY_COLORS` from near `BriefingTab` if it only exists there — but keep it if `TopFocusActionsCard` uses it. Since `TopFocusActionsCard` references `PRIORITY_COLORS`, keep the constant but move it above `TopFocusActionsCard`.

- [ ] **Step 7.2: Replace the Dialog body section**

Find the `{/* Tab bodies */}` section (around line 1152). Replace the single-column body with the two-column layout. The entire section from `{/* Tab strip */}` to the closing `</Dialog>` should become:

```tsx
        {/* Tab strip (left column only) */}
        <div className="flex border-b border-border px-6 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[hsl(var(--brand-500))] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'notes' ? 'Coach Notes' : tab === 'activity' ? 'Activity Log' : 'Visit History'}
            </button>
          ))}
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">

          {/* Left column: focus actions + tab content */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-border">
            {/* Top Focus Actions — above tabs, non-scrolling */}
            {data && (
              <TopFocusActionsCard
                focusActions={data.focusActions}
                latestAssessmentId={latestAssessmentId}
              />
            )}
            {/* Tab body — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'activity' && (
                <ActivityTab
                  data={data}
                  dataLoading={dataLoading}
                  dealer={dealer}
                  user={user}
                  onNoteAdded={() => { fetchData(); onNoteAdded(); }}
                  onNoteDeleted={fetchData}
                />
              )}
              {activeTab === 'visits' && (
                <VisitsTab
                  data={data}
                  dataLoading={dataLoading}
                  dealer={dealer}
                  latestAssessmentId={latestAssessmentId}
                  user={user}
                  onDataRefresh={fetchData}
                  onVisitSaved={() => { fetchData(); onVisitSaved(); }}
                />
              )}
              {activeTab === 'notes' && (
                <CoachNotesTab
                  data={data}
                  dataLoading={dataLoading}
                  dealer={dealer}
                  user={user}
                  onNoteAdded={() => { fetchData(); onNoteAdded(); }}
                  onNoteDeleted={fetchData}
                />
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full md:w-80 shrink-0 overflow-y-auto p-4 space-y-4">
            <DeptHealthCard
              assessmentScores={data?.assessmentScores ?? {}}
              latestAssessmentId={latestAssessmentId}
              dataLoading={dataLoading}
            />
            <UpcomingVisitCard
              upcomingVisit={upcomingVisit}
              onSwitchToVisits={() => setActiveTab('visits')}
            />
            <InsightCard
              latestDate={latestDate}
              latestAssessmentId={latestAssessmentId}
            />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
```

Note: The tab strip has moved — it no longer wraps the right sidebar. The right sidebar is always visible regardless of the active tab. The `{/* Tab strip */}` block that previously came before `{/* Tab bodies */}` should be removed since we're replacing both.

- [ ] **Step 7.3: Verify TypeScript compiles with zero errors**

```bash
npx tsc --noEmit 2>&1
```

Expected: zero errors. If there are errors, the most likely causes are:
- `useNavigate` not imported in `DealerPanel.tsx` — add `import { useNavigate } from 'react-router-dom';`
- `upcomingVisit` variable used in the render but derived in Task 2 — verify it is declared in the `DealerPanel` component body
- `PRIORITY_COLORS` moved — verify it is above `TopFocusActionsCard`
- `DEPT_ORDER` removed but still referenced somewhere — remove all references

- [ ] **Step 7.4: Run dev server and manually verify**

```bash
npm run dev
```

1. Navigate to `/app/coach-dashboard`
2. Click any dealer card — DealerPanel should open as a wide (95vw) centered dialog
3. Verify: 4-stat header row shows Overall Score, Active Actions, Critical Gaps, Next Visit
4. Verify: left column shows "Top Focus Actions" section above tabs
5. Verify: tabs show "Activity Log", "Visit History", "Coach Notes"
6. Verify: right sidebar shows Dept Health card, Upcoming Visit card
7. Verify: right sidebar shows dark Insight card only if assessment is >60 days old
8. Click "Enter Dealership →" — verify it navigates (not just opens panel)
9. On mobile viewport (<768px): verify sidebar stacks below left column

- [ ] **Step 7.5: Final commit**

```bash
git add src/components/coach/DealerPanel.tsx
git commit -m "feat(coach): two-column full-width DealerPanel redesign — briefing command centre"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Full-width dialog (`w-[95vw] max-w-7xl`) → Task 2
- [x] 4-stat header chips → Task 2
- [x] Top Focus Actions above tabs → Task 4
- [x] Activity Log / Visit History / Coach Notes tabs → Task 3
- [x] Department Health right sidebar → Task 5
- [x] Upcoming Visit right sidebar → Task 6
- [x] Staleness Insight conditional card → Task 6
- [x] BriefingTab deleted → Task 7
- [x] CoachDashboard wiring fix (3 state vars + render block) → Task 1
- [x] Card clickable, Enter Dealership stopPropagation → Task 1
- [x] Mobile stacking (flex-col) → Task 7
- [x] No new npm packages → verified (all shadcn components already installed)
- [x] No new DB queries → verified (all data from existing `PanelData`)

**Type consistency:**
- `activeTab` type: `'activity' | 'visits' | 'notes'` — consistent across Tasks 3 and 7
- `upcomingVisit` derived in Task 2 body, consumed in Task 7 render — consistent
- `focusActions` typed as `FocusAction[]` — `TopFocusActionsCard` receives same type
- `PRIORITY_COLORS` referenced in `TopFocusActionsCard` — kept in scope

**No placeholders:** All steps contain complete code. No TBDs.
