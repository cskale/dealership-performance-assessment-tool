# Visit Log (#79) + Assessment Notes Surfaces (#81) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the coaching platform with a rich post-visit session log and surface existing assessment field notes across Results, ActionSheet, and PDF export.

**Architecture:** Two independent feature tracks sharing one DB migration. #79 adds 5 columns to `coach_visits` and 2 columns to `improvement_actions`, then builds a new `VisitLogSheet` component wired into CoachDashboard. #81 wires the already-populated `assessment_notes` table into MaturityScoring dept cards, ActionSheet, and the PDF appendix using the existing `useAssessmentNotes` hook with a new question→section mapping utility.

**Tech Stack:** React 18 + TypeScript + Vite + Supabase MCP + Tailwind + shadcn/ui + sonner (toast) + date-fns

---

## File Map

### New files
- `src/lib/coachVisitUtils.ts` — shared types (CoachVisit, VisitType) + question→section map utilities
- `src/components/coach/VisitLogSheet.tsx` — post-visit session log sheet
- `src/components/results/FieldNotesCollapsible.tsx` — collapsible field notes per department

### Modified files
- `src/components/coach/VisitSheet.tsx` — add "Mark as Completed" button on confirmed visits
- `src/pages/CoachDashboard.tsx` — add Visit History tab per dealer card + wire VisitLogSheet
- `src/components/MaturityScoring.tsx` — accept `notes` prop, render FieldNotesCollapsible per dept
- `src/pages/Results.tsx` — load notes via hook, pass to MaturityScoring + ActionPlan + PDF data
- `src/components/ActionSheet.tsx` — "Field Notes from dept" inset panel
- `src/lib/pdfReportGenerator.ts` — add `fieldNotes` to PDFExportData, append notes table
- `src/integrations/supabase/types.ts` — regenerated (do not hand-edit)

---

## Part A — Database

### Task 1: Migrate coach_visits — add session log columns

**Files:**
- Run via: Supabase MCP `apply_migration`

- [ ] **Step 1: Apply migration**

Run via Supabase MCP tool `mcp__claude_ai_Supabase__apply_migration` with project_id `xrypgosuyfdkkqafftae` and this SQL:

```sql
ALTER TABLE public.coach_visits
  ADD COLUMN IF NOT EXISTS visit_type       text
    CHECK (visit_type IN ('in-person', 'remote', 'phone')),
  ADD COLUMN IF NOT EXISTS modules_reviewed text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS summary          text,
  ADD COLUMN IF NOT EXISTS next_visit_date  date,
  ADD COLUMN IF NOT EXISTS agreed_action_ids uuid[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.coach_visits.visit_type IS 'How the visit was conducted';
COMMENT ON COLUMN public.coach_visits.modules_reviewed IS 'Array of section IDs reviewed, e.g. new-vehicle-sales';
COMMENT ON COLUMN public.coach_visits.summary IS 'Coach narrative summary of the session';
COMMENT ON COLUMN public.coach_visits.next_visit_date IS 'Proposed date for next visit';
COMMENT ON COLUMN public.coach_visits.agreed_action_ids IS 'IDs of improvement_actions agreed in this visit';
```

Expected: migration applies without error. Existing RLS (`coach_user_id = auth.uid()`) covers all new columns.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(db): extend coach_visits with session log columns"
```

---

### Task 2: Migrate improvement_actions — add provenance columns

**Files:**
- Run via: Supabase MCP `apply_migration`

- [ ] **Step 1: Apply migration**

Run via Supabase MCP `apply_migration` with project_id `xrypgosuyfdkkqafftae`:

```sql
ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS source_visit_id    uuid
    REFERENCES public.coach_visits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_question_id text;

COMMENT ON COLUMN public.improvement_actions.source_visit_id IS 'Visit in which this action was agreed — enables provenance badge';
COMMENT ON COLUMN public.improvement_actions.source_question_id IS 'Question ID that triggered this action — set by signal engine (future wiring)';
```

Expected: migration applies without error.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(db): add source_visit_id + source_question_id provenance to improvement_actions"
```

---

### Task 3: Regenerate Supabase TypeScript types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Regenerate types**

Run Supabase MCP tool `mcp__claude_ai_Supabase__generate_typescript_types` with project_id `xrypgosuyfdkkqafftae`. Write the full output to `src/integrations/supabase/types.ts`.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate supabase types after coach_visits + improvement_actions migrations"
```

---

## Part B — #79 Visit Log

### Task 4: Create src/lib/coachVisitUtils.ts

**Files:**
- Create: `src/lib/coachVisitUtils.ts`
- Test: `src/__tests__/coachVisitUtils.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/coachVisitUtils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildQuestionSectionMap, buildQuestionLabelMap, getDeptNoteCount } from '@/lib/coachVisitUtils';

describe('buildQuestionSectionMap', () => {
  it('maps each question id to its parent section id', () => {
    const map = buildQuestionSectionMap();
    const entries = Object.entries(map);
    expect(entries.length).toBeGreaterThan(0);
    // Every value should be one of the known section IDs
    const knownSections = ['new-vehicle-sales', 'used-vehicle-sales', 'service-performance', 'parts-inventory', 'financial-operations'];
    for (const [, sectionId] of entries) {
      expect(knownSections).toContain(sectionId);
    }
  });
});

describe('buildQuestionLabelMap', () => {
  it('maps each question id to its text label', () => {
    const map = buildQuestionLabelMap();
    const entries = Object.entries(map);
    expect(entries.length).toBeGreaterThan(0);
    for (const [, label] of entries) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('getDeptNoteCount', () => {
  it('counts notes belonging to the given section', () => {
    const sectionMap = buildQuestionSectionMap();
    // Find any question in new-vehicle-sales
    const nvsQuestion = Object.entries(sectionMap).find(([, s]) => s === 'new-vehicle-sales')?.[0];
    if (!nvsQuestion) return; // skip if no questions found
    const notes: Record<string, string> = { [nvsQuestion]: 'test note' };
    expect(getDeptNoteCount('new-vehicle-sales', notes, sectionMap)).toBe(1);
    expect(getDeptNoteCount('service-performance', notes, sectionMap)).toBe(0);
  });

  it('returns 0 when notes is empty', () => {
    const sectionMap = buildQuestionSectionMap();
    expect(getDeptNoteCount('new-vehicle-sales', {}, sectionMap)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/coachVisitUtils.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement coachVisitUtils.ts**

Create `src/lib/coachVisitUtils.ts`:

```ts
import { questionnaire } from '@/data/questionnaire';

export type VisitStatus = 'proposed' | 'confirmed' | 'cancelled' | 'completed';
export type VisitType = 'in-person' | 'remote' | 'phone';

export const VISIT_MODULES: { id: string; label: string }[] = [
  { id: 'new-vehicle-sales',  label: 'New Vehicle Sales' },
  { id: 'used-vehicle-sales', label: 'Used Vehicle Sales' },
  { id: 'service-performance', label: 'Service' },
  { id: 'parts-inventory',    label: 'Parts & Inventory' },
  { id: 'financial-operations', label: 'Financial Operations' },
];

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

export interface OpenAction {
  id: string;
  action_title: string;
  department: string;
  priority: string;
  status: string;
}

// Builds a map of questionId → section.id from the questionnaire
export function buildQuestionSectionMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const section of questionnaire.sections) {
    for (const question of section.questions) {
      map[question.id] = section.id;
    }
  }
  return map;
}

// Builds a map of questionId → question text (truncated to 80 chars)
export function buildQuestionLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const section of questionnaire.sections) {
    for (const question of section.questions) {
      map[question.id] = question.text.length > 80
        ? question.text.slice(0, 80) + '…'
        : question.text;
    }
  }
  return map;
}

// Returns the count of notes that belong to the given sectionId
export function getDeptNoteCount(
  sectionId: string,
  notes: Record<string, string>,
  sectionMap: Record<string, string>
): number {
  return Object.entries(notes).filter(
    ([questionId, text]) => sectionMap[questionId] === sectionId && text.trim().length > 0
  ).length;
}

// Returns notes entries belonging to the given sectionId
export function getDeptNotes(
  sectionId: string,
  notes: Record<string, string>,
  sectionMap: Record<string, string>
): Array<{ questionId: string; text: string }> {
  return Object.entries(notes)
    .filter(([questionId, text]) => sectionMap[questionId] === sectionId && text.trim().length > 0)
    .map(([questionId, text]) => ({ questionId, text }));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/coachVisitUtils.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/coachVisitUtils.ts src/__tests__/coachVisitUtils.test.ts
git commit -m "feat(coach): add coachVisitUtils — shared types + question-section mapping"
```

---

### Task 5: Extend VisitSheet — add Mark as Completed button

**Files:**
- Modify: `src/components/coach/VisitSheet.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/coach/VisitSheet.tsx` in full before editing.

- [ ] **Step 2: Add handleMarkCompleted function and CheckCircle import**

In `src/components/coach/VisitSheet.tsx`, add `CheckCircle` to the lucide import and add this function inside the component body, after `handleCancel`:

```tsx
import { CalendarIcon, X, CheckCircle } from 'lucide-react';

// Inside component, after handleCancel:
const handleMarkCompleted = async (visitId: string) => {
  const { error } = await supabase
    .from('coach_visits')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', visitId);
  if (error) { toast.error('Failed to mark visit as completed'); return; }
  toast.success('Visit marked as completed');
  await fetchVisits();
  onVisitSaved();
};
```

- [ ] **Step 3: Add the button in the active visit card**

In the active visit display block (inside the `{activeVisit && ...}` section), add the Mark Completed button after the Cancel button. The confirmed visit should show both options; proposed should only show Cancel:

```tsx
{activeVisit.status === 'confirmed' && (
  <Button
    variant="ghost"
    size="sm"
    className="h-7 text-xs text-[#16a34a] hover:text-[#16a34a]"
    onClick={() => handleMarkCompleted(activeVisit.id)}
  >
    <CheckCircle className="h-3 w-3 mr-1" />Mark as completed
  </Button>
)}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/coach/VisitSheet.tsx
git commit -m "feat(coach): add mark-as-completed button to VisitSheet"
```

---

### Task 6: Create VisitLogSheet — core form

**Files:**
- Create: `src/components/coach/VisitLogSheet.tsx`

- [ ] **Step 1: Create the component with core fields**

Create `src/components/coach/VisitLogSheet.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CalendarIcon, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { VISIT_MODULES, type CoachVisit, type VisitType, type OpenAction } from '@/lib/coachVisitUtils';

interface VisitLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: CoachVisit;
  dealershipId: string;
  dealerName: string;
  onLogSaved: () => void;
}

const VISIT_TYPE_OPTIONS: { value: VisitType; label: string }[] = [
  { value: 'in-person', label: 'In-person' },
  { value: 'remote',    label: 'Remote (video)' },
  { value: 'phone',     label: 'Phone call' },
];

export function VisitLogSheet({ open, onOpenChange, visit, dealershipId, dealerName, onLogSaved }: VisitLogSheetProps) {
  const { user } = useAuth();

  // Form state — pre-fill from existing visit log if present
  const [visitType, setVisitType]           = useState<VisitType | ''>(visit.visit_type ?? '');
  const [modulesReviewed, setModulesReviewed] = useState<string[]>(visit.modules_reviewed ?? []);
  const [summary, setSummary]               = useState(visit.summary ?? '');
  const [nextVisitDate, setNextVisitDate]   = useState<Date | undefined>(
    visit.next_visit_date ? new Date(visit.next_visit_date) : undefined
  );
  const [saving, setSaving]                 = useState(false);

  // Open actions for "link existing" section (Task 7)
  const [openActions, setOpenActions]       = useState<OpenAction[]>([]);
  const [linkedActionIds, setLinkedActionIds] = useState<string[]>(visit.agreed_action_ids ?? []);

  // New action form (Task 7)
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDept, setNewActionDept]   = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (open) {
      // Reset form to current visit values when sheet opens
      setVisitType(visit.visit_type ?? '');
      setModulesReviewed(visit.modules_reviewed ?? []);
      setSummary(visit.summary ?? '');
      setNextVisitDate(visit.next_visit_date ? new Date(visit.next_visit_date) : undefined);
      setLinkedActionIds(visit.agreed_action_ids ?? []);
      fetchOpenActions();
    }
  }, [open, visit]);

  const fetchOpenActions = async () => {
    // Get all assessments for this dealership
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id')
      .eq('dealership_id', dealershipId);
    if (!assessments?.length) return;

    const assessmentIds = assessments.map(a => a.id);
    const { data } = await supabase
      .from('improvement_actions')
      .select('id, action_title, department, priority, status')
      .in('assessment_id', assessmentIds)
      .in('status', ['Open', 'In Progress'])
      .order('priority');
    setOpenActions((data ?? []) as OpenAction[]);
  };

  const toggleModule = (moduleId: string) => {
    setModulesReviewed(prev =>
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleLinkedAction = (actionId: string) => {
    setLinkedActionIds(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    );
  };

  const handleSave = async () => {
    if (!visitType) { toast.error('Select a visit type'); return; }
    setSaving(true);
    try {
      // 1. Create any new agreed action
      let newlyCreatedActionId: string | null = null;
      if (newActionTitle.trim()) {
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id, organization_id')
          .eq('dealership_id', dealershipId)
          .order('created_at', { ascending: false })
          .limit(1);
        const latestAssessment = assessments?.[0];
        if (!latestAssessment) {
          toast.error('No assessment found for this dealership to attach the new action to');
          setSaving(false);
          return;
        }
        const { data: created, error: actionError } = await supabase
          .from('improvement_actions')
          .insert({
            action_title: newActionTitle.trim(),
            action_description: '',
            assessment_id: latestAssessment.id,
            organization_id: latestAssessment.organization_id,
            department: newActionDept || 'General',
            priority: newActionPriority,
            status: 'Open',
            source_visit_id: visit.id,
            user_id: user?.id ?? null,
          })
          .select('id')
          .single();
        if (actionError) throw actionError;
        newlyCreatedActionId = created.id;
      }

      // 2. Build final agreed_action_ids
      const allAgreedIds = newlyCreatedActionId
        ? [...linkedActionIds, newlyCreatedActionId]
        : linkedActionIds;

      // 3. Update coach_visits with log fields
      const { error } = await supabase
        .from('coach_visits')
        .update({
          visit_type: visitType,
          modules_reviewed: modulesReviewed,
          summary: summary.trim() || null,
          next_visit_date: nextVisitDate ? format(nextVisitDate, 'yyyy-MM-dd') : null,
          agreed_action_ids: allAgreedIds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', visit.id);
      if (error) throw error;

      toast.success('Session log saved');
      setNewActionTitle('');
      setNewActionDept('');
      setNewActionPriority('medium');
      onLogSaved();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save session log');
    } finally {
      setSaving(false);
    }
  };

  const PRIORITY_OPTIONS: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  const DEPT_OPTIONS = ['New Vehicle Sales', 'Used Vehicle Sales', 'Service', 'Parts & Inventory', 'Financial Operations'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Session Log — {dealerName}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Visit on {format(new Date(visit.visit_date), 'dd MMM yyyy')}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Visit type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Visit type</Label>
            <div className="flex gap-2 flex-wrap">
              {VISIT_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisitType(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    visitType === opt.value
                      ? 'border-[hsl(var(--brand-500))] bg-[hsl(var(--brand-500))]/10 text-[hsl(var(--brand-500))]'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modules reviewed */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Modules reviewed</Label>
            <div className="flex flex-wrap gap-2">
              {VISIT_MODULES.map(mod => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    modulesReviewed.includes(mod.id)
                      ? 'border-[hsl(var(--brand-500))] bg-[hsl(var(--brand-500))]/10 text-[hsl(var(--brand-500))]'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {mod.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session summary</Label>
            <Textarea
              placeholder="What was discussed? Key observations, decisions made, dealer's response…"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="resize-none text-sm"
              rows={4}
              maxLength={3000}
            />
            <p className="text-xs text-muted-foreground text-right">{summary.length}/3000</p>
          </div>

          {/* Next visit date */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next visit date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-sm font-normal">
                  <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {nextVisitDate ? format(nextVisitDate, 'dd MMM yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextVisitDate}
                  onSelect={setNextVisitDate}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
            {nextVisitDate && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => setNextVisitDate(undefined)}
              >
                Clear date
              </button>
            )}
          </div>

          <Separator />

          {/* Agreed actions — link existing */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Link existing open actions ({linkedActionIds.length} selected)
            </Label>
            {openActions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No open actions for this dealership.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-border rounded-lg border">
                {openActions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => toggleLinkedAction(action.id)}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors ${
                      linkedActionIds.includes(action.id) ? 'bg-[hsl(var(--brand-500))]/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center ${
                        linkedActionIds.includes(action.id)
                          ? 'bg-[hsl(var(--brand-500))] border-[hsl(var(--brand-500))]'
                          : 'border-border'
                      }`}
                    >
                      {linkedActionIds.includes(action.id) && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug">{action.action_title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{action.department} · {action.priority}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agreed actions — add new */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add new agreed action (optional)</Label>
            <input
              type="text"
              placeholder="Action title…"
              value={newActionTitle}
              onChange={e => setNewActionTitle(e.target.value)}
              maxLength={200}
              className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
            />
            {newActionTitle.trim() && (
              <div className="flex gap-2">
                <select
                  value={newActionDept}
                  onChange={e => setNewActionDept(e.target.value)}
                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
                >
                  <option value="">Department…</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={newActionPriority}
                  onChange={e => setNewActionPriority(e.target.value as typeof newActionPriority)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            disabled={saving || !visitType}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save session log'}
          </Button>
        </div>
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
git add src/components/coach/VisitLogSheet.tsx
git commit -m "feat(coach): create VisitLogSheet — post-visit session log form"
```

---

### Task 7: Wire VisitLogSheet into CoachDashboard — Visit History tab

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Read CoachDashboard.tsx in full before editing**

Read the entire file (it's large — use offset/limit if needed). Understand: where dealer cards are rendered, how VisitSheet is currently opened, where state lives.

- [ ] **Step 2: Add state and imports**

At the top of `CoachDashboard.tsx`, add:

```tsx
import { VisitLogSheet } from '@/components/coach/VisitLogSheet';
import { type CoachVisit } from '@/lib/coachVisitUtils';
```

Inside the component, after existing state declarations, add:

```tsx
const [visitHistoryDealerId, setVisitHistoryDealerId]   = useState<string | null>(null);
const [visitLogSheetOpen, setVisitLogSheetOpen]         = useState(false);
const [selectedVisitForLog, setSelectedVisitForLog]     = useState<CoachVisit | null>(null);
const [dealerVisits, setDealerVisits]                   = useState<Record<string, CoachVisit[]>>({});
const [visitHistoryLoading, setVisitHistoryLoading]     = useState(false);
```

- [ ] **Step 3: Add fetchDealerVisits function**

Add this inside the component body after existing fetch functions:

```tsx
const fetchDealerVisits = async (dealershipId: string) => {
  if (!user?.id) return;
  setVisitHistoryLoading(true);
  const { data } = await supabase
    .from('coach_visits')
    .select('*')
    .eq('coach_user_id', user.id)
    .eq('dealership_id', dealershipId)
    .order('visit_date', { ascending: false });
  setDealerVisits(prev => ({
    ...prev,
    [dealershipId]: (data ?? []) as CoachVisit[],
  }));
  setVisitHistoryLoading(false);
};
```

- [ ] **Step 4: Add the Visit History tab UI to each dealer card**

Find the section in CoachDashboard where individual dealer cards are rendered. Each dealer card has action buttons (Notes, Visits, etc.). Add a "History" button that:
1. Sets `visitHistoryDealerId` to `dealer.dealershipId`
2. Calls `fetchDealerVisits(dealer.dealershipId)`

Then, conditionally render a visit history panel below the dealer card when `visitHistoryDealerId === dealer.dealershipId`. Inside this panel, map over `dealerVisits[dealer.dealershipId]` and render each completed visit as a row:

```tsx
{visitHistoryDealerId === dealer.dealershipId && (
  <div className="mt-3 border-t border-border pt-3 space-y-2">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1">Visit history</p>
    {visitHistoryLoading ? (
      <p className="text-xs text-muted-foreground px-1">Loading…</p>
    ) : (dealerVisits[dealer.dealershipId] ?? []).length === 0 ? (
      <p className="text-xs text-muted-foreground px-1">No visits recorded.</p>
    ) : (
      (dealerVisits[dealer.dealershipId] ?? []).map(v => (
        <div
          key={v.id}
          className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium">
                {format(new Date(v.visit_date), 'dd MMM yyyy')}
              </span>
              {v.status === 'completed' && v.visit_type && (
                <Badge variant="outline" className="text-[10px] capitalize">
                  {v.visit_type}
                </Badge>
              )}
              {v.modules_reviewed?.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {v.modules_reviewed.length} module{v.modules_reviewed.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {v.summary && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{v.summary}</p>
            )}
          </div>
          {v.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => {
                setSelectedVisitForLog(v);
                setVisitLogSheetOpen(true);
              }}
            >
              {v.summary ? 'Edit log' : 'Log session'}
            </Button>
          )}
        </div>
      ))
    )}
  </div>
)}
```

- [ ] **Step 5: Add VisitLogSheet to the component render**

At the bottom of the JSX, alongside the existing `<VisitSheet>` and `<CoachNoteSheet>`, add:

```tsx
{selectedVisitForLog && visitHistoryDealerId && (
  <VisitLogSheet
    open={visitLogSheetOpen}
    onOpenChange={setVisitLogSheetOpen}
    visit={selectedVisitForLog}
    dealershipId={visitHistoryDealerId}
    dealerName={
      dealers.find(d => d.dealershipId === visitHistoryDealerId)?.dealerName ?? ''
    }
    onLogSaved={() => {
      setVisitLogSheetOpen(false);
      fetchDealerVisits(visitHistoryDealerId);
    }}
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
git commit -m "feat(coach): wire VisitLogSheet into CoachDashboard visit history panel"
```

---

## Part C — #81 Assessment Notes Surfaces

### Task 8: Create FieldNotesCollapsible component

**Files:**
- Create: `src/components/results/FieldNotesCollapsible.tsx`
- Test: `src/__tests__/FieldNotesCollapsible.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/FieldNotesCollapsible.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldNotesCollapsible } from '@/components/results/FieldNotesCollapsible';

const mockNotes = [
  { questionId: 'nvs-1', text: 'Sales team needs training' },
  { questionId: 'nvs-2', text: 'Low follow-up rate observed' },
];

const mockLabels: Record<string, string> = {
  'nvs-1': 'Monthly new vehicle sales volume',
  'nvs-2': 'Lead follow-up process',
};

describe('FieldNotesCollapsible', () => {
  it('renders trigger with note count', () => {
    render(<FieldNotesCollapsible notes={mockNotes} questionLabels={mockLabels} />);
    expect(screen.getByText(/Field Notes \(2\)/i)).toBeTruthy();
  });

  it('shows notes after clicking trigger', async () => {
    const user = userEvent.setup();
    render(<FieldNotesCollapsible notes={mockNotes} questionLabels={mockLabels} />);
    await user.click(screen.getByText(/Field Notes \(2\)/i));
    expect(screen.getByText('Sales team needs training')).toBeTruthy();
  });

  it('renders nothing when notes array is empty', () => {
    const { container } = render(
      <FieldNotesCollapsible notes={[]} questionLabels={mockLabels} />
    );
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/FieldNotesCollapsible.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement FieldNotesCollapsible**

Create `src/components/results/FieldNotesCollapsible.tsx`:

```tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, StickyNote } from 'lucide-react';

interface NoteEntry {
  questionId: string;
  text: string;
}

interface FieldNotesCollapsibleProps {
  notes: NoteEntry[];
  questionLabels: Record<string, string>;
}

export function FieldNotesCollapsible({ notes, questionLabels }: FieldNotesCollapsibleProps) {
  const [open, setOpen] = useState(false);

  if (notes.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <StickyNote className="h-3 w-3" />
          Field Notes ({notes.length})
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <dl className="mt-3 space-y-2">
          {notes.map(({ questionId, text }) => (
            <div key={questionId} className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
              {questionLabels[questionId] && (
                <dt className="text-[10px] font-medium text-amber-700 uppercase tracking-wide mb-0.5">
                  {questionLabels[questionId]}
                </dt>
              )}
              <dd className="text-xs text-amber-900 leading-relaxed">{text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/FieldNotesCollapsible.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/results/FieldNotesCollapsible.tsx src/__tests__/FieldNotesCollapsible.test.tsx
git commit -m "feat(results): create FieldNotesCollapsible component for dept field notes"
```

---

### Task 9: Wire notes into MaturityScoring department cards

**Files:**
- Modify: `src/components/MaturityScoring.tsx`

- [ ] **Step 1: Read MaturityScoring.tsx in full**

Read the entire file before editing. Identify: where `MaturityScoringProps` is defined, where individual dept cards are rendered in the JSX.

- [ ] **Step 2: Update props interface and add imports**

In `src/components/MaturityScoring.tsx`:

Add imports:
```tsx
import { FieldNotesCollapsible } from '@/components/results/FieldNotesCollapsible';
import { buildQuestionSectionMap, buildQuestionLabelMap, getDeptNotes } from '@/lib/coachVisitUtils';
```

Add `notes` to the props interface:
```tsx
interface MaturityScoringProps {
  scores: Record<string, number>;
  answers: Record<string, any>;
  benchmarks?: Record<string, any>;
  notes?: Record<string, string>; // questionId → note text (optional — no notes shown if omitted)
}
```

- [ ] **Step 3: Add memoized maps inside the component**

Add these two `useMemo` calls inside the component body, after existing `useMemo` calls:

```tsx
const questionSectionMap = useMemo(() => buildQuestionSectionMap(), []);
const questionLabelMap   = useMemo(() => buildQuestionLabelMap(), []);
```

- [ ] **Step 4: Add FieldNotesCollapsible to each dept card**

Find the JSX where individual department score cards are rendered (look for `.map(([dept, score]) =>` or similar). Inside each dept card, before the closing element, add:

```tsx
{notes && (
  <FieldNotesCollapsible
    notes={getDeptNotes(dept, notes, questionSectionMap)}
    questionLabels={questionLabelMap}
  />
)}
```

Where `dept` is the department key (e.g., `'new-vehicle-sales'`) from the `.map()` iteration. If the variable name differs in the actual file, adjust accordingly.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors. The `notes` prop is optional so existing callers without it are unaffected.

- [ ] **Step 6: Commit**

```bash
git add src/components/MaturityScoring.tsx
git commit -m "feat(results): add field notes collapsible to MaturityScoring dept cards"
```

---

### Task 10: Load notes in Results.tsx and pass to MaturityScoring

**Files:**
- Modify: `src/pages/Results.tsx`

- [ ] **Step 1: Read Results.tsx in full**

Read the entire file. Identify: where `<MaturityScoring>` is rendered and what props it receives, where `pdfActions` is set (for future Task 12).

- [ ] **Step 2: Add useAssessmentNotes hook**

In `src/pages/Results.tsx`, add import:
```tsx
import { useAssessmentNotes } from '@/hooks/useAssessmentNotes';
```

Inside the component, add (near other hook calls at the top):
```tsx
const { notes } = useAssessmentNotes();
```

- [ ] **Step 3: Pass notes to MaturityScoring**

Find the `<MaturityScoring ... />` JSX. Add the `notes` prop:
```tsx
<MaturityScoring
  scores={resultsData.scores}
  answers={resultsData.answers}
  benchmarks={benchmarks}
  notes={notes}
/>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Results.tsx
git commit -m "feat(results): load assessment notes and pass to MaturityScoring"
```

---

### Task 11: Add "Field Notes from dept" panel to ActionSheet

**Files:**
- Modify: `src/components/ActionSheet.tsx`

- [ ] **Step 1: Read ActionSheet.tsx in full**

Read the entire file. Identify: the props interface (already has `action: ActionRecord | null`), where the action description/body is rendered, what `ActionRecord` type looks like (`type { ActionRecord } from "./ActionPlan"`).

- [ ] **Step 2: Add notes prop and imports**

Add to `ActionSheet.tsx` imports:
```tsx
import { StickyNote } from 'lucide-react';
import { buildQuestionSectionMap, buildQuestionLabelMap, getDeptNotes } from '@/lib/coachVisitUtils';
```

Add `notes` to `ActionSheetProps`:
```tsx
interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionRecord | null;
  mode: 'create' | 'edit';
  onSave: (action: Partial<ActionRecord>) => void;
  onDelete?: (actionId: string) => void;
  readOnly?: boolean;
  notes?: Record<string, string>; // questionId → note text
}
```

- [ ] **Step 3: Add memoized maps and dept notes inside component**

Inside `ActionSheet` component body:
```tsx
const questionSectionMap = useMemo(() => buildQuestionSectionMap(), []);
const questionLabelMap   = useMemo(() => buildQuestionLabelMap(), []);

// Find section ID that matches action's department string
// action.department values are like 'New Vehicle Sales', 'Service', etc.
// VISIT_MODULES has the label→id mapping
const DEPT_LABEL_TO_ID: Record<string, string> = {
  'New Vehicle Sales':     'new-vehicle-sales',
  'Used Vehicle Sales':    'used-vehicle-sales',
  'Service':               'service-performance',
  'Parts':                 'parts-inventory',
  'Parts & Inventory':     'parts-inventory',
  'Financial Operations':  'financial-operations',
};

const deptNotes = useMemo(() => {
  if (!notes || !action?.department) return [];
  const sectionId = DEPT_LABEL_TO_ID[action.department];
  if (!sectionId) return [];
  return getDeptNotes(sectionId, notes, questionSectionMap);
}, [notes, action?.department, questionSectionMap]);
```

- [ ] **Step 4: Render the field notes panel**

Find where the action description or body section is rendered in ActionSheet's JSX. Add the notes panel directly above the description field, conditionally:

```tsx
{deptNotes.length > 0 && (
  <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2.5 space-y-1.5">
    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
      <StickyNote className="h-3 w-3" />
      Field notes — {action?.department}
    </p>
    {deptNotes.slice(0, 3).map(({ questionId, text }) => (
      <div key={questionId}>
        {questionLabelMap[questionId] && (
          <p className="text-[10px] text-amber-600">{questionLabelMap[questionId]}</p>
        )}
        <p className="text-xs text-amber-900 leading-relaxed">{text}</p>
      </div>
    ))}
    {deptNotes.length > 3 && (
      <p className="text-[10px] text-amber-600">+{deptNotes.length - 3} more notes</p>
    )}
  </div>
)}
```

- [ ] **Step 5: Pass notes from Results.tsx to ActionSheet**

Find where `<ActionSheet>` is rendered in the codebase (likely in `ActionPlan.tsx` or `Results.tsx`). Add `notes={notes}` prop. Check what file opens ActionSheet — read it first.

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/ActionSheet.tsx
git commit -m "feat(results): add field notes panel to ActionSheet for dept context"
```

---

### Task 12: Add note indicator icon to action list cards

**Files:**
- Modify: `src/components/ActionPlan.tsx` (list/roadmap view only — KanbanBoard.tsx is Lovable-owned, do not edit)

- [ ] **Step 1: Read ActionPlan.tsx in full**

Read the entire file. Identify: how actions are rendered in list/roadmap mode (not the kanban), what props the component accepts, where individual action rows/cards are rendered.

- [ ] **Step 2: Add notes prop to ActionPlan**

Find the `ActionPlanProps` interface and add:
```tsx
notes?: Record<string, string>;
```

- [ ] **Step 3: Add StickyNote icon to action rows**

Import from lucide-react if not already imported:
```tsx
import { StickyNote } from 'lucide-react';
```

In the list/roadmap view where action cards render, add this inline indicator next to the priority badge when the action's department has notes:

```tsx
{notes && (() => {
  const DEPT_LABEL_TO_ID: Record<string, string> = {
    'New Vehicle Sales': 'new-vehicle-sales',
    'Used Vehicle Sales': 'used-vehicle-sales',
    'Service': 'service-performance',
    'Parts': 'parts-inventory',
    'Parts & Inventory': 'parts-inventory',
    'Financial Operations': 'financial-operations',
  };
  // Build section map once — this is inside a render; move to useMemo in parent if perf is a concern
  // For now, use a simple dept-prefix check
  const sectionId = DEPT_LABEL_TO_ID[action.department];
  const hasDeptNotes = sectionId
    ? Object.entries(notes).some(([qId, text]) => {
        // Check if questionId starts with dept prefix
        return text.trim() && buildQuestionSectionMap()[qId] === sectionId;
      })
    : false;
  return hasDeptNotes ? (
    <span title="Field notes available for this department">
      <StickyNote className="h-3 w-3 text-amber-500" />
    </span>
  ) : null;
})()}
```

**NOTE:** The inline `buildQuestionSectionMap()` call inside render is acceptable for now but should be moved to a `useMemo` if performance becomes a concern. If `ActionPlan.tsx` already uses `useMemo`, add it there.

- [ ] **Step 4: Add "Agreed in visit" provenance badge**

In the same action row/card JSX, also show a provenance badge when `action.source_visit_id` is non-null. The `source_visit_id` column is now in the type after Task 3. Add alongside the existing priority badge:

```tsx
{(action as any).source_visit_id && (
  <Badge variant="outline" className="text-[10px] text-violet-700 border-violet-200 bg-violet-50">
    From coaching visit
  </Badge>
)}
```

Cast to `any` only if TypeScript hasn't picked up the regenerated type — after Task 3 runs properly, the field will be typed.

- [ ] **Step 5: Pass notes from Results.tsx to ActionPlan**

In `Results.tsx`, find the `<ActionPlan ... />` JSX and add `notes={notes}`.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ActionPlan.tsx src/pages/Results.tsx
git commit -m "feat(results): add dept field notes indicator icon to action list cards"
```

---

### Task 13: Add Dealer Field Notes appendix to PDF

**Files:**
- Modify: `src/lib/pdfReportGenerator.ts`
- Modify: `src/pages/Results.tsx` (to pass notes to PDF data)
- Modify: `src/components/ExportPDFModal.tsx` (if it constructs PDFExportData)

- [ ] **Step 1: Read pdfReportGenerator.ts — the PDFExportData interface and generatePDFReport function structure**

Read the file from the top to understand where the action plan section ends (that's where the notes appendix goes).

- [ ] **Step 2: Add fieldNotes to PDFExportData**

In `src/lib/pdfReportGenerator.ts`, update `PDFExportData`:

```ts
export interface PDFExportData {
  organization: { name: string; logo_url?: string | null; default_language?: string | null; } | null;
  user: { fullName: string; role: string; };
  assessment: {
    id: string;
    completedAt: string;
    overallScore: number;
    scores: Record<string, number>;
    answers: Record<string, any>;
  };
  actions: Array<{
    action_title: string;
    action_description: string;
    priority: string;
    status: string;
    responsible_person?: string | null;
    target_completion_date?: string | null;
    department: string;
  }>;
  includeWatermark: boolean;
  fieldNotes?: Record<string, string>; // questionId → note text
}
```

- [ ] **Step 3: Add static import and Field Notes appendix in generatePDFReport**

At the top of `src/lib/pdfReportGenerator.ts`, add:

```ts
import { questionnaire } from '@/data/questionnaire';
```

Then at the end of `generatePDFReport`, before the final `doc.save(...)` call, add:

```ts
// ── Dealer Field Notes appendix ──────────────────────────────────────────
if (data.fieldNotes && Object.keys(data.fieldNotes).length > 0) {
  // Build maps from questionnaire (static import at file top)
  const sectionMap: Record<string, string> = {};
  const labelMap: Record<string, string> = {};
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      sectionMap[q.id] = section.id;
      labelMap[q.id] = q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text;
    }
  }

  const DEPT_ORDER = ['new-vehicle-sales', 'used-vehicle-sales', 'service-performance', 'parts-inventory', 'financial-operations'];
  const DEPT_LABELS: Record<string, string> = {
    'new-vehicle-sales': DEPT_NAMES['new-vehicle-sales'][lang] ?? 'New Vehicle Sales',
    'used-vehicle-sales': DEPT_NAMES['used-vehicle-sales'][lang] ?? 'Used Vehicle Sales',
    'service-performance': DEPT_NAMES['service-performance'][lang] ?? 'Service Performance',
    'parts-inventory': DEPT_NAMES['parts-inventory'][lang] ?? 'Parts & Inventory',
    'financial-operations': DEPT_NAMES['financial-operations'][lang] ?? 'Financial Operations',
  };

  // Build rows with sectionId kept for sorting
  type NoteRow = { sectionId: string; dept: string; questionLabel: string; text: string };
  const rows: NoteRow[] = [];
  for (const [questionId, noteText] of Object.entries(data.fieldNotes)) {
    if (!noteText.trim()) continue;
    const sectionId = sectionMap[questionId];
    if (!sectionId) continue;
    rows.push({
      sectionId,
      dept: DEPT_LABELS[sectionId] ?? sectionId,
      questionLabel: labelMap[questionId] ?? questionId,
      text: noteText.trim(),
    });
  }
  // Sort by canonical dept order
  rows.sort((a, b) => DEPT_ORDER.indexOf(a.sectionId) - DEPT_ORDER.indexOf(b.sectionId));

  if (rows.length > 0) {
    doc.addPage();
    let ny = margin;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'de' ? 'Beobachtungsnotizen' : 'Dealer Field Notes', margin, ny);
    ny += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(lang === 'de' ? 'Notizen aus der Bewertungsdurchführung' : 'Notes captured during assessment', margin, ny);
    ny += 10;
    doc.setTextColor(0, 0, 0);

    // Table header
    const colDept = margin;
    const colQ = margin + 45;
    const colNote = margin + 110;
    const tableWidth = pageW - margin * 2;

    doc.setFillColor(245, 245, 242);
    doc.rect(margin, ny, tableWidth, 7, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Department', colDept + 2, ny + 5);
    doc.text('Question', colQ + 2, ny + 5);
    doc.text('Field Note', colNote + 2, ny + 5);
    ny += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    for (const row of rows) {
      const noteLines = doc.splitTextToSize(row.text, pageW - colNote - margin);
      const rowH = Math.max(8, noteLines.length * 4 + 4);
      if (ny + rowH > pageH - margin) { doc.addPage(); ny = margin; }
      doc.setDrawColor(230, 228, 220);
      doc.line(margin, ny, margin + tableWidth, ny);
      doc.text(doc.splitTextToSize(row.dept, 43), colDept + 2, ny + 4);
      doc.text(doc.splitTextToSize(row.questionLabel, 63), colQ + 2, ny + 4);
      doc.text(noteLines, colNote + 2, ny + 4);
      ny += rowH;
    }
  }
}
```

**Note:** You will need access to `pageW`, `pageH`, `margin`, `doc`, and `lang` variables — these are already defined in `generatePDFReport`. Place this block after the action plan section but before `doc.save(...)`. If `DEPT_NAMES` is defined at module scope (it is — verify by reading the file), it is directly accessible.

- [ ] **Step 4: Pass notes to PDF from Results.tsx**

In `src/pages/Results.tsx`, find where `pdfData` or `PDFExportData` is constructed (likely inside the ExportPDFModal handler or passed as props). Add `fieldNotes: notes` to the data object.

Find where `<ExportPDFModal>` is rendered and how it receives data. Read `ExportPDFModal.tsx` first to understand the interface, then update accordingly.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/pdfReportGenerator.ts src/pages/Results.tsx
git commit -m "feat(pdf): add Dealer Field Notes appendix to PDF report"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass (80% coverage threshold maintained).

- [ ] **Build**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Manual smoke test checklist**

1. As a coach: open CoachDashboard → click "History" on a dealer → mark a confirmed visit as completed → click "Log session" → fill in type, modules, summary, next visit date → link an existing action → add a new action → save. Verify: visit row updates with summary excerpt, new action appears in that dealer's action plan with "Agreed in visit" source_visit_id set.
2. As a dealer: complete an assessment with at least 3 notes → view Results → open MaturityScoring tab → verify "Field Notes (N)" collapsible appears on relevant dept cards, expands correctly.
3. Open ActionSheet for an action in a dept that has notes → verify amber field notes panel appears.
4. Export PDF → verify last page is "Dealer Field Notes" table with dept/question/note columns.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: #79 visit session log + #81 assessment notes surfaces — complete"
```
