# Sprint 4: Coach Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `CoachDashboard.tsx` with Sprint 3 design language, add `coach_notes` DB table, and implement notes (sheet per dealer card + feed section) plus an upgraded actions section with overdue/stale/all tabs.

**Architecture:** Single-page redesign of `CoachDashboard.tsx`, self-contained `CoachNoteSheet` component extracted for clarity, pure utility functions in `coachDashboardUtils.ts` (TDD). One new Supabase migration for `coach_notes`. No routing changes, no new npm packages.

**Tech Stack:** React 18, TypeScript, Supabase (Postgres + RLS), shadcn/ui (Sheet ✓, Tabs ✓, RadioGroup ✓ — all already installed), Tailwind CSS, Vitest, date-fns (already in bundle)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260510120000_coach_notes.sql` | Create | `coach_notes` table + RLS policies |
| `src/integrations/supabase/types.ts` | Regenerate | Auto-generated types after migration |
| `src/lib/coachDashboardUtils.ts` | Create | Pure utility functions: stats bar, trend, overdue, score band |
| `src/__tests__/coachDashboardUtils.test.ts` | Create | Unit tests for all utility functions |
| `src/components/coach/CoachNoteSheet.tsx` | Create | Self-contained note sheet (own state, own Supabase queries) |
| `src/pages/CoachDashboard.tsx` | Modify | Full redesign — interfaces, data fetch, all sections |

---

## Task 1: DB Migration — coach_notes Table

**Files:**
- Create: `supabase/migrations/20260510120000_coach_notes.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260510120000_coach_notes.sql

CREATE TABLE public.coach_notes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id     uuid NOT NULL REFERENCES auth.users(id),
  dealership_id     uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  assessment_id     uuid REFERENCES assessments(id) ON DELETE SET NULL,
  action_id         uuid REFERENCES improvement_actions(id) ON DELETE SET NULL,
  note_text         text NOT NULL CHECK (char_length(note_text) <= 2000),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

-- Coach: full CRUD on own notes
CREATE POLICY "coach_notes_coach_all" ON public.coach_notes
  FOR ALL
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

-- Dealer: read notes where this is their active dealership
CREATE POLICY "coach_notes_dealer_read" ON public.coach_notes
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT active_dealership_id
      FROM profiles
      WHERE user_id = auth.uid()
        AND active_dealership_id IS NOT NULL
    )
  );

-- OEM: read notes for dealerships in their network
-- SECURITY DEFINER required — avoids RLS recursion (same pattern as get_dealership_details)
CREATE OR REPLACE FUNCTION private.oem_can_read_coach_note(p_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN oem_networks n ON n.owner_org_id = p.active_organization_id
    JOIN dealer_network_memberships dnm ON dnm.network_id = n.id
    WHERE p.user_id = auth.uid()
      AND p.actor_type = 'oem'
      AND dnm.dealership_id = p_dealership_id
      AND dnm.is_active = true
      AND n.status = 'active'
  )
$$;

CREATE POLICY "coach_notes_oem_read" ON public.coach_notes
  FOR SELECT
  USING (private.oem_can_read_coach_note(dealership_id));

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER coach_notes_updated_at
  BEFORE UPDATE ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `coach_notes`
- `query`: (full SQL above)

Verify: response contains no errors.

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/20260510120000_coach_notes.sql
git commit -m "feat: add coach_notes table with RLS"
```

---

## Task 2: Regenerate Supabase Types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Regenerate via MCP**

Use `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id: xrypgosuyfdkkqafftae`. Write full output to `src/integrations/supabase/types.ts`.

- [ ] **Step 2: Verify coach_notes type exists**

Open `src/integrations/supabase/types.ts` and confirm `coach_notes` appears in the `Tables` type with fields: `id`, `coach_user_id`, `dealership_id`, `assessment_id`, `action_id`, `note_text`, `created_at`, `updated_at`.

- [ ] **Step 3: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate supabase types after coach_notes migration"
```

---

## Task 3: Utility Functions + Tests (TDD)

**Files:**
- Create: `src/lib/coachDashboardUtils.ts`
- Create: `src/__tests__/coachDashboardUtils.test.ts`

- [ ] **Step 1: Write the failing test file**

```ts
// src/__tests__/coachDashboardUtils.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeStatsBar,
  computeTrend,
  daysSince,
  isOverdue,
  isDueSoon,
  getScoreBand,
} from '@/lib/coachDashboardUtils';

interface MinDealer { latestScore: number | null; overdueCount: number; }
const d = (score: number | null, overdue = 0): MinDealer => ({ latestScore: score, overdueCount: overdue });

describe('computeStatsBar', () => {
  it('returns zeros for empty list', () => {
    expect(computeStatsBar([])).toEqual({ total: 0, avgScore: 0, overdueCount: 0, attentionNeeded: 0 });
  });
  it('counts attention needed as dealers with latestScore < 46', () => {
    expect(computeStatsBar([d(80), d(40), d(30)]).attentionNeeded).toBe(2);
  });
  it('excludes null scores from avg calculation', () => {
    expect(computeStatsBar([d(80), d(60), d(null)]).avgScore).toBe(70);
  });
  it('sums overdueCount across all dealers', () => {
    expect(computeStatsBar([d(70, 2), d(60, 3)]).overdueCount).toBe(5);
  });
  it('returns 0 avgScore when all scores are null', () => {
    expect(computeStatsBar([d(null)]).avgScore).toBe(0);
  });
  it('returns correct total', () => {
    expect(computeStatsBar([d(80), d(60), d(null)]).total).toBe(3);
  });
});

describe('computeTrend', () => {
  it('returns none when latest is null', () => {
    expect(computeTrend(null, 70)).toEqual({ delta: null, direction: 'none' });
  });
  it('returns none when previous is null', () => {
    expect(computeTrend(75, null)).toEqual({ delta: null, direction: 'none' });
  });
  it('detects improvement', () => {
    expect(computeTrend(75, 70)).toEqual({ delta: 5, direction: 'up' });
  });
  it('detects decline', () => {
    expect(computeTrend(65, 70)).toEqual({ delta: -5, direction: 'down' });
  });
  it('detects flat', () => {
    expect(computeTrend(70, 70)).toEqual({ delta: 0, direction: 'flat' });
  });
});

describe('isOverdue', () => {
  it('returns false for null', () => expect(isOverdue(null)).toBe(false));
  it('returns true for past date', () => expect(isOverdue('2020-01-01')).toBe(true));
  it('returns false for future date', () => {
    const future = new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0];
    expect(isOverdue(future)).toBe(false);
  });
});

describe('isDueSoon', () => {
  it('returns false for null', () => expect(isDueSoon(null)).toBe(false));
  it('returns true for date within 3 days', () => {
    const soon = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    expect(isDueSoon(soon)).toBe(true);
  });
  it('returns false for date beyond 3 days', () => {
    const far = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    expect(isDueSoon(far)).toBe(false);
  });
  it('returns false for past date (already overdue)', () => {
    expect(isDueSoon('2020-01-01')).toBe(false);
  });
});

describe('getScoreBand', () => {
  it('returns Advanced for >= 85', () => {
    expect(getScoreBand(85).label).toBe('Advanced');
    expect(getScoreBand(100).label).toBe('Advanced');
  });
  it('returns Performing for 70-84', () => {
    expect(getScoreBand(70).label).toBe('Performing');
    expect(getScoreBand(84).label).toBe('Performing');
  });
  it('returns Developing for 46-69', () => {
    expect(getScoreBand(46).label).toBe('Developing');
    expect(getScoreBand(69).label).toBe('Developing');
  });
  it('returns Foundational for < 46', () => {
    expect(getScoreBand(45).label).toBe('Foundational');
    expect(getScoreBand(0).label).toBe('Foundational');
  });
});
```

- [ ] **Step 2: Run tests — verify all fail**

```bash
npx vitest run src/__tests__/coachDashboardUtils.test.ts
```

Expected: FAIL with `Cannot find module '@/lib/coachDashboardUtils'`.

- [ ] **Step 3: Create the utility file**

```ts
// src/lib/coachDashboardUtils.ts

export interface StatsBar {
  total: number;
  avgScore: number;
  overdueCount: number;
  attentionNeeded: number;
}

export interface TrendResult {
  delta: number | null;
  direction: 'up' | 'down' | 'flat' | 'none';
}

export function computeStatsBar(
  dealers: Array<{ latestScore: number | null; overdueCount: number }>
): StatsBar {
  const scored = dealers.filter(d => d.latestScore != null);
  const avg = scored.length
    ? Math.round(scored.reduce((sum, d) => sum + d.latestScore!, 0) / scored.length)
    : 0;
  return {
    total: dealers.length,
    avgScore: avg,
    overdueCount: dealers.reduce((sum, d) => sum + d.overdueCount, 0),
    attentionNeeded: dealers.filter(d => d.latestScore != null && d.latestScore < 46).length,
  };
}

export function computeTrend(latest: number | null, previous: number | null): TrendResult {
  if (latest == null || previous == null) return { delta: null, direction: 'none' };
  const delta = Math.round(latest - previous);
  if (delta > 0) return { delta, direction: 'up' };
  if (delta < 0) return { delta, direction: 'down' };
  return { delta: 0, direction: 'flat' };
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function isOverdue(targetDate: string | null): boolean {
  if (!targetDate) return false;
  return new Date(targetDate) < new Date();
}

export function isDueSoon(targetDate: string | null, withinDays = 3): boolean {
  if (!targetDate) return false;
  const target = new Date(targetDate);
  const now = new Date();
  const soon = new Date(now.getTime() + withinDays * 86400000);
  return target >= now && target <= soon;
}

export function getScoreBand(score: number): { label: string; className: string } {
  if (score >= 85) return { label: 'Advanced',     className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
  if (score >= 70) return { label: 'Performing',   className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
  if (score >= 46) return { label: 'Developing',   className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' };
  return             { label: 'Foundational', className: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' };
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npx vitest run src/__tests__/coachDashboardUtils.test.ts
```

Expected: all 22 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/coachDashboardUtils.ts src/__tests__/coachDashboardUtils.test.ts
git commit -m "feat: add coachDashboardUtils with unit tests"
```

---

## Task 4: CoachNoteSheet Component

**Files:**
- Create: `src/components/coach/CoachNoteSheet.tsx`

`Sheet`, `RadioGroup`, `Tabs` already confirmed present at `src/components/ui/`.

- [ ] **Step 1: Create directory**

```bash
mkdir -p src/components/coach
```

- [ ] **Step 2: Write CoachNoteSheet.tsx**

```tsx
// src/components/coach/CoachNoteSheet.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  created_at: string;
}

interface AssessmentOption { id: string; created_at: string; }
interface ActionOption { id: string; action_title: string; }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string | null;
  dealerName: string;
  onNoteAdded: () => void;
}

export function CoachNoteSheet({ open, onOpenChange, dealershipId, dealerName, onNoteAdded }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [actions, setActions] = useState<ActionOption[]>([]);
  const [contextType, setContextType] = useState<'general' | 'assessment' | 'action'>('general');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!open || !dealershipId || !user?.id) return;
    setContextType('general');
    setNoteText('');
    setSelectedAssessmentId('');
    setSelectedActionId('');
    fetchSheetData();
  }, [open, dealershipId, user?.id]);

  const fetchSheetData = async () => {
    if (!dealershipId || !user?.id) return;
    setLoadingHistory(true);

    const [notesRes, assessmentsRes] = await Promise.all([
      supabase
        .from('coach_notes')
        .select('*')
        .eq('dealership_id', dealershipId)
        .eq('coach_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('assessments')
        .select('id, created_at')
        .eq('dealership_id', dealershipId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    setNotes((notesRes.data as CoachNote[]) ?? []);
    const fetchedAssessments = assessmentsRes.data ?? [];
    setAssessments(fetchedAssessments);

    if (fetchedAssessments.length) {
      const { data: actionData } = await supabase
        .from('improvement_actions')
        .select('id, action_title')
        .eq('assessment_id', fetchedAssessments[0].id)
        .in('status', ['Open', 'In Progress'])
        .limit(20);
      setActions(actionData ?? []);
    }

    setLoadingHistory(false);
  };

  const handleSubmit = async () => {
    if (!noteText.trim() || !dealershipId || !user?.id) return;
    setSubmitting(true);

    const payload: Record<string, string> = {
      coach_user_id: user.id,
      dealership_id: dealershipId,
      note_text: noteText.trim(),
    };
    if (contextType === 'assessment' && selectedAssessmentId) payload.assessment_id = selectedAssessmentId;
    if (contextType === 'action' && selectedActionId) payload.action_id = selectedActionId;

    const { data } = await supabase.from('coach_notes').insert(payload).select().single();

    if (data) {
      setNotes(prev => [data as CoachNote, ...prev]);
      setNoteText('');
      setContextType('general');
      setSelectedAssessmentId('');
      setSelectedActionId('');
      onNoteAdded();
    }

    setSubmitting(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[480px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="text-base font-semibold">{dealerName}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Compose */}
          <div className="px-5 py-4 border-b border-border space-y-3">
            <RadioGroup
              value={contextType}
              onValueChange={v => setContextType(v as 'general' | 'assessment' | 'action')}
              className="flex gap-4"
            >
              {(['general', 'assessment', 'action'] as const).map(ctx => (
                <div key={ctx} className="flex items-center gap-1.5">
                  <RadioGroupItem value={ctx} id={`ctx-${ctx}`} />
                  <Label htmlFor={`ctx-${ctx}`} className="text-sm capitalize cursor-pointer">{ctx}</Label>
                </div>
              ))}
            </RadioGroup>

            {contextType === 'assessment' && assessments.length > 0 && (
              <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(a => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">
                      {format(new Date(a.created_at), 'dd MMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {contextType === 'action' && actions.length > 0 && (
              <Select value={selectedActionId} onValueChange={setSelectedActionId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map(a => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">{a.action_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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
              <Button size="sm" onClick={handleSubmit} disabled={!noteText.trim() || submitting}>
                {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Save Note
              </Button>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 px-5 py-3 space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notes yet</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), 'dd MMM yyyy')}
                    </span>
                    {note.assessment_id && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Assessment</Badge>
                    )}
                    {note.action_id && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Action</Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{note.note_text}</p>
                  <div className="border-b border-border/50" />
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/CoachNoteSheet.tsx
git commit -m "feat: add CoachNoteSheet component"
```

---

## Task 5: Update CoachDashboard Data Layer

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

This task replaces interfaces, state, and the data fetch function only. No JSX layout changes yet.

- [ ] **Step 1: Replace interfaces at top of file**

Remove `AssignedDealer`, `AssessmentRecord`, `StaleAction`. Add:

```ts
interface AssignedDealer {
  dealershipId: string;
  dealerName: string;
  location: string;
  brand: string;
  latestScore: number | null;
  previousScore: number | null;
  latestDate: string | null;
  latestStatus: string | null;
  latestAssessmentId: string | null;
  openCount: number;
  overdueCount: number;
}

interface AssessmentRecord {
  id: string;
  dealership_id: string;
  overall_score: number | null;
  created_at: string;
  status: string;
}

interface ActionItem {
  id: string;
  action_title: string;
  priority: string;
  status: string;
  last_status_updated_at: string | null;
  target_completion_date: string | null;
  dealerName: string;
  dealershipId: string;
  assessmentId: string;
  daysStale: number;
}

interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  created_at: string;
}
```

- [ ] **Step 2: Replace state declarations**

Remove all existing `useState` calls. Add:

```ts
const [dealers, setDealers] = useState<AssignedDealer[]>([]);
const [allAssessments, setAllAssessments] = useState<AssessmentRecord[]>([]);
const [allActions, setAllActions] = useState<ActionItem[]>([]);
const [notes, setNotes] = useState<CoachNote[]>([]);
const [loading, setLoading] = useState(true);
const [sortBy, setSortBy] = useState<'score' | 'name' | 'overdue'>('score');
const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
const [selectedDealerIds, setSelectedDealerIds] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState<'overdue' | 'stale' | 'all'>('overdue');
const [actionDealerFilter, setActionDealerFilter] = useState<string>('all');
const [noteSheetOpen, setNoteSheetOpen] = useState(false);
const [noteSheetDealer, setNoteSheetDealer] = useState<AssignedDealer | null>(null);
const [notesDealerFilter, setNotesDealerFilter] = useState<string>('all');
const [notesPage, setNotesPage] = useState(0);
```

- [ ] **Step 3: Add fetchNotes function (before the useEffect)**

```ts
const fetchNotes = async (page = 0) => {
  if (!user?.id) return;
  const { data } = await supabase
    .from('coach_notes')
    .select('*')
    .eq('coach_user_id', user.id)
    .order('created_at', { ascending: false })
    .range(page * 20, page * 20 + 19);
  if (page === 0) {
    setNotes((data as CoachNote[]) ?? []);
  } else {
    setNotes(prev => [...prev, ...((data as CoachNote[]) ?? [])]);
  }
};
```

- [ ] **Step 4: Replace fetchAssignments inside the useEffect**

Replace the entire body of the `useEffect(() => { if (!user?.id) return; ... }, [user?.id])` with:

```ts
const fetchAssignments = async () => {
  setLoading(true);

  const { data: assignments, error: assignErr } = await supabase
    .from('coach_dealership_assignments')
    .select('dealership_id')
    .eq('coach_user_id', user!.id)
    .eq('is_active', true);

  if (assignErr || !assignments?.length) {
    setDealers([]);
    setLoading(false);
    return;
  }

  const dealershipIds = assignments.map(a => a.dealership_id);

  const [dealershipsRes, assessmentsRes] = await Promise.all([
    supabase.from('dealerships').select('id, name, location, brand').in('id', dealershipIds),
    supabase
      .from('assessments')
      .select('id, overall_score, created_at, dealership_id, status')
      .in('dealership_id', dealershipIds)
      .order('created_at', { ascending: false }),
  ]);

  const dealerships = dealershipsRes.data ?? [];
  const assessments = assessmentsRes.data ?? [];

  setAllAssessments(
    assessments.map(a => ({
      id: a.id,
      dealership_id: a.dealership_id,
      overall_score: a.overall_score ? Number(a.overall_score) : null,
      created_at: a.created_at,
      status: a.status,
    }))
  );

  const assessmentIds = assessments.map(a => a.id);
  const today = new Date();

  let actionData: Array<{
    id: string; action_title: string; priority: string; status: string;
    last_status_updated_at: string | null; target_completion_date: string | null;
    assessment_id: string;
  }> = [];

  if (assessmentIds.length) {
    const { data } = await supabase
      .from('improvement_actions')
      .select('id, action_title, priority, status, last_status_updated_at, target_completion_date, assessment_id')
      .in('assessment_id', assessmentIds)
      .in('status', ['Open', 'In Progress'])
      .order('target_completion_date', { ascending: true, nullsFirst: false });
    actionData = data ?? [];
  }

  // Build assessment → dealer lookup
  const assessmentToDealer = new Map<string, { id: string; name: string }>();
  assessments.forEach(a => {
    const dealer = dealerships.find(d => d.id === a.dealership_id);
    if (dealer) assessmentToDealer.set(a.id, { id: dealer.id, name: dealer.name });
  });

  // Compute per-dealer counts while building ActionItem list
  const openByDealer = new Map<string, number>();
  const overdueByDealer = new Map<string, number>();
  const now = Date.now();

  const builtActions: ActionItem[] = actionData.map(ia => {
    const dealer = assessmentToDealer.get(ia.assessment_id);
    const dealerId = dealer?.id ?? '';
    const dealerName = dealer?.name ?? 'Unknown';

    openByDealer.set(dealerId, (openByDealer.get(dealerId) ?? 0) + 1);
    if (ia.target_completion_date && new Date(ia.target_completion_date) < today) {
      overdueByDealer.set(dealerId, (overdueByDealer.get(dealerId) ?? 0) + 1);
    }

    const lastMs = ia.last_status_updated_at
      ? new Date(ia.last_status_updated_at).getTime()
      : now - 8 * 86400000;
    const daysStale = Math.max(1, Math.floor((now - lastMs) / 86400000));

    return {
      id: ia.id,
      action_title: ia.action_title,
      priority: ia.priority,
      status: ia.status,
      last_status_updated_at: ia.last_status_updated_at,
      target_completion_date: ia.target_completion_date,
      dealerName,
      dealershipId: dealerId,
      assessmentId: ia.assessment_id,
      daysStale,
    };
  });

  setAllActions(builtActions);

  // Build dealer list with top-2 assessments per dealer
  const dealerAssessments = new Map<string, AssessmentRecord[]>();
  assessments.forEach(a => {
    const list = dealerAssessments.get(a.dealership_id) ?? [];
    list.push({
      id: a.id,
      dealership_id: a.dealership_id,
      overall_score: a.overall_score ? Number(a.overall_score) : null,
      created_at: a.created_at,
      status: a.status,
    });
    dealerAssessments.set(a.dealership_id, list);
  });

  const dealerList: AssignedDealer[] = dealerships.map(d => {
    const records = dealerAssessments.get(d.id) ?? [];
    const latest = records[0];
    const previous = records[1];
    return {
      dealershipId: d.id,
      dealerName: d.name,
      location: d.location,
      brand: d.brand,
      latestScore: latest?.overall_score ?? null,
      previousScore: previous?.overall_score ?? null,
      latestDate: latest?.created_at ?? null,
      latestStatus: latest?.status ?? null,
      latestAssessmentId: latest?.id ?? null,
      openCount: openByDealer.get(d.id) ?? 0,
      overdueCount: overdueByDealer.get(d.id) ?? 0,
    };
  });

  setDealers(dealerList);
  await fetchNotes(0);
  setLoading(false);
};

fetchAssignments();
```

- [ ] **Step 5: Update filteredDealers useMemo**

Replace existing `filteredDealers` useMemo:

```ts
const filteredDealers = useMemo(() => {
  let result = [...dealers];
  if (statusFilter === 'completed') result = result.filter(d => d.latestStatus === 'completed');
  else if (statusFilter === 'in_progress') result = result.filter(d => d.latestStatus === 'in_progress');
  if (sortBy === 'score') result.sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
  else if (sortBy === 'name') result.sort((a, b) => a.dealerName.localeCompare(b.dealerName));
  else result.sort((a, b) => b.overdueCount - a.overdueCount);
  return result;
}, [dealers, sortBy, statusFilter]);
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors (ignore any unused-variable warnings from JSX that still references old variables — those clear in the next task).

- [ ] **Step 7: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: update CoachDashboard data layer — interfaces, fetchAssignments, fetchNotes"
```

---

## Task 6: Dark Stats Bar + Page Header

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Add import for coachDashboardUtils**

At top of file, add:

```ts
import { computeStatsBar, computeTrend, daysSince, getScoreBand, isOverdue, isDueSoon } from '@/lib/coachDashboardUtils';
```

- [ ] **Step 2: Replace the outer return JSX wrapper**

Change the opening of the `return (...)` to this structure (keep all existing inner sections for now — replace only the outer wrapper and header):

```tsx
return (
  <div className="space-y-0">
    {/* Dark stats bar — matches Sprint 3 dealer dashboard */}
    <div className="h-9 bg-[#0b1f3a] flex items-center px-6 sticky top-0 z-10">
      {(() => {
        const s = computeStatsBar(dealers);
        const chips = [
          { label: 'Dealers',          value: String(s.total) },
          { label: 'Avg Score',        value: s.avgScore > 0 ? String(s.avgScore) : '—' },
          { label: 'Overdue Actions',  value: String(s.overdueCount) },
          { label: 'Attention Needed', value: String(s.attentionNeeded) },
        ];
        return chips.map((chip, i) => (
          <div
            key={chip.label}
            className={`flex items-center gap-2 px-4 h-full ${i < chips.length - 1 ? 'border-r border-white/[0.08]' : ''}`}
          >
            <span className="text-[11px] text-white/50 uppercase tracking-wider">{chip.label}</span>
            <span className="text-[11px] font-semibold text-white">{chip.value}</span>
          </div>
        ));
      })()}
    </div>

    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('coach.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {dealers.length} {dealers.length === 1 ? 'dealership' : 'dealerships'} assigned
        </p>
      </div>

      {/* PLACEHOLDER: sections from Tasks 7-10 go here */}

    </div>
  </div>
);
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Open `/app/coach-dashboard`. Verify: dark `h-9` bar at top with 4 chips, page header below.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: coach dashboard dark stats bar and page header"
```

---

## Task 7: Upgraded Dealer Cards Grid

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Add missing imports**

```ts
import { CoachNoteSheet } from '@/components/coach/CoachNoteSheet';
import { TrendingUp, TrendingDown, Minus, StickyNote } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

Remove import of `LineChart as LineChartIcon` if unused after this task (keep if still needed by trend chart).

- [ ] **Step 2: Replace the dealer cards section in JSX**

Inside `<div className="p-6 space-y-6 ...">`, after the page header and before the trend chart, add:

```tsx
{/* Sort + filter controls */}
<div className="flex flex-wrap items-center gap-3">
  <div className="flex items-center gap-1">
    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    {(['score', 'name', 'overdue'] as const).map(s => (
      <Button
        key={s}
        variant={sortBy === s ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSortBy(s)}
      >
        {s === 'score' ? 'Score' : s === 'name' ? 'Name' : 'Overdue'}
      </Button>
    ))}
  </div>
  <div className="flex items-center gap-1">
    <Filter className="w-4 h-4 text-muted-foreground" />
    <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'completed' | 'in_progress')}>
      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('coach.filterAll')}</SelectItem>
        <SelectItem value="completed">{t('coach.filterCompleted')}</SelectItem>
        <SelectItem value="in_progress">{t('coach.filterInProgress')}</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

{/* Dealer Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredDealers.map((dealer, i) => {
    const trend = computeTrend(dealer.latestScore, dealer.previousScore);
    const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;
    const since = daysSince(dealer.latestDate);
    const hasNotes = notes.some(n => n.dealership_id === dealer.dealershipId);

    return (
      <Card
        key={dealer.dealershipId}
        className="opacity-0 animate-fade-in shadow-card rounded-xl"
        style={{ animationDelay: `${Math.min(i, 4) * 50}ms`, animationFillMode: 'forwards' }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold leading-tight">{dealer.dealerName}</CardTitle>
            <Badge variant="outline" className="bg-[hsl(var(--neutral-100))] text-[hsl(var(--neutral-700))] border-[hsl(var(--neutral-300))] text-xs shrink-0 ml-2">
              {dealer.brand}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {dealer.location}
            {since != null && <span className="ml-1 text-[hsl(var(--neutral-400))]">· {since}d ago</span>}
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Score + trend */}
          <div className="flex items-center justify-between">
            {band ? (
              <div className={`inline-flex flex-col items-center rounded-lg border px-3 py-2 ${band.className}`}>
                <span className="text-2xl font-bold leading-none">{Math.round(dealer.latestScore!)}</span>
                <span className="mt-1 text-xs">{band.label}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No assessment yet</span>
            )}
            {trend.direction !== 'none' && (
              <div className="flex items-center gap-1">
                {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-[#16a34a]" />}
                {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-[#dc2626]" />}
                {trend.direction === 'flat' && <Minus className="w-4 h-4 text-muted-foreground" />}
                <span className={`text-xs font-medium ${
                  trend.direction === 'up' ? 'text-[#16a34a]'
                  : trend.direction === 'down' ? 'text-[#dc2626]'
                  : 'text-muted-foreground'
                }`}>
                  {trend.delta != null && trend.delta !== 0 ? `${trend.delta > 0 ? '+' : ''}${trend.delta}` : '—'}
                </span>
              </div>
            )}
          </div>

          {/* Action counts */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Open: <span className="font-medium text-foreground">{dealer.openCount}</span>
            </span>
            {dealer.overdueCount > 0 && (
              <Badge variant="outline" className="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 text-xs">
                {dealer.overdueCount} overdue
              </Badge>
            )}
          </div>

          {/* Bottom: note icon + CTA */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="relative h-7 w-7 p-0"
              onClick={() => { setNoteSheetDealer(dealer); setNoteSheetOpen(true); }}
              aria-label="Add note"
            >
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              {hasNotes && (
                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
              )}
            </Button>
            {dealer.latestAssessmentId ? (
              <Button variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => navigate(`/app/results/${dealer.latestAssessmentId}`)}>
                View Results →
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => navigate('/app/assessment')}>
                Start Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  })}
</div>

{/* Note sheet — rendered once, driven by noteSheetDealer state */}
<CoachNoteSheet
  open={noteSheetOpen}
  onOpenChange={setNoteSheetOpen}
  dealershipId={noteSheetDealer?.dealershipId ?? null}
  dealerName={noteSheetDealer?.dealerName ?? ''}
  onNoteAdded={() => fetchNotes(0)}
/>
```

- [ ] **Step 3: Verify in browser**

Reload `/app/coach-dashboard`. Confirm:
- Cards have score badge, brand badge, location + days ago, trend arrow, action counts
- Note icon present; tapping opens CoachNoteSheet with dealer name in header
- After saving a note, dot badge appears on card and notes feed updates
- Sort buttons Score/Name/Overdue all change card order
- "View Results →" navigates correctly; "Start Assessment" shown for no-assessment dealers

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: coach dashboard upgraded dealer cards with trend, counts, note icon"
```

---

## Task 8: Actions Requiring Attention Section

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Add action-specific useMemos**

Add after existing `filteredDealers` useMemo:

```ts
const overdueActions = useMemo(() => {
  const base = actionDealerFilter === 'all' ? allActions : allActions.filter(a => a.dealershipId === actionDealerFilter);
  return base.filter(a => isOverdue(a.target_completion_date));
}, [allActions, actionDealerFilter]);

const staleActions = useMemo(() => {
  const base = actionDealerFilter === 'all' ? allActions : allActions.filter(a => a.dealershipId === actionDealerFilter);
  return base.filter(a => a.daysStale >= 7);
}, [allActions, actionDealerFilter]);

const allOpenActions = useMemo(() => {
  if (actionDealerFilter === 'all') return allActions;
  return allActions.filter(a => a.dealershipId === actionDealerFilter);
}, [allActions, actionDealerFilter]);
```

- [ ] **Step 2: Add Actions section JSX**

After the dealer cards grid (and `CoachNoteSheet`), add:

```tsx
{/* Actions Requiring Attention */}
<Card className="shadow-card rounded-xl">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <CardTitle className="text-base font-semibold">Actions Requiring Attention</CardTitle>
      <Select value={actionDealerFilter} onValueChange={setActionDealerFilter}>
        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All dealers" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All dealers</SelectItem>
          {dealers.map(d => (
            <SelectItem key={d.dealershipId} value={d.dealershipId}>{d.dealerName}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'overdue' | 'stale' | 'all')}>
      <TabsList className="mx-5 mb-0 h-8">
        <TabsTrigger value="overdue" className="text-xs">
          Overdue
          {overdueActions.length > 0 && (
            <span className="ml-1 rounded-full bg-[#dc2626]/10 text-[#dc2626] px-1.5 text-[10px]">{overdueActions.length}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="stale" className="text-xs">
          Stale
          {staleActions.length > 0 && (
            <span className="ml-1 rounded-full bg-[#d97706]/10 text-[#d97706] px-1.5 text-[10px]">{staleActions.length}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="all" className="text-xs">All Open ({allOpenActions.length})</TabsTrigger>
      </TabsList>

      {(['overdue', 'stale', 'all'] as const).map(tab => {
        const items = tab === 'overdue' ? overdueActions : tab === 'stale' ? staleActions : allOpenActions;
        const emptyMsg = tab === 'overdue'
          ? 'No overdue actions — all on track'
          : tab === 'stale'
          ? 'No stale actions — all updated within 7 days'
          : 'No open actions';

        return (
          <TabsContent key={tab} value={tab} className="mt-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <span className="text-2xl text-[#16a34a]">✓</span>
                <p className="text-sm text-muted-foreground">{emptyMsg}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-2 bg-muted/50">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Action</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-36">Dealership</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-24 text-right">
                    {tab === 'overdue' ? 'Due date' : 'Days stale'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-20 text-right">Priority</span>
                </div>
                {items.map(action => {
                  const priorityClass =
                    action.priority === 'critical' ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' :
                    action.priority === 'high'     ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' :
                    action.priority === 'medium'   ? 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' :
                                                     'bg-muted text-muted-foreground border-border';
                  const dueDateClass = isOverdue(action.target_completion_date)
                    ? 'text-[#dc2626] font-semibold'
                    : isDueSoon(action.target_completion_date)
                    ? 'text-[#d97706] font-medium'
                    : 'text-muted-foreground';
                  const staleClass =
                    action.daysStale >= 21 ? 'text-[#dc2626] font-semibold' :
                    action.daysStale >= 14 ? 'text-[#d97706] font-medium' :
                                             'text-muted-foreground';
                  const dueDateLabel = action.target_completion_date
                    ? format(new Date(action.target_completion_date), 'dd MMM')
                    : '—';

                  return (
                    <div
                      key={action.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/results/${action.assessmentId}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{action.action_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.status}</p>
                      </div>
                      <span className="text-sm text-muted-foreground w-36 self-center truncate">{action.dealerName}</span>
                      <span className={`text-sm w-24 text-right self-center ${tab === 'overdue' ? dueDateClass : staleClass}`}>
                        {tab === 'overdue' ? dueDateLabel : `${action.daysStale}d`}
                      </span>
                      <div className="w-20 flex justify-end self-center">
                        <Badge variant="outline" className={`text-xs capitalize ${priorityClass}`}>{action.priority}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  </CardContent>
</Card>
```

- [ ] **Step 3: Verify in browser**

Reload. Check:
- Three tabs render with count badges
- Dealer filter dropdown persists across tab switches
- Row click navigates to `/app/results/:assessmentId`
- Empty state shows green checkmark message per tab

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: coach dashboard actions requiring attention — overdue/stale/all tabs"
```

---

## Task 9: Notes Feed Section

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Add filtered notes useMemo**

```ts
const filteredNotes = useMemo(() => {
  if (notesDealerFilter === 'all') return notes;
  return notes.filter(n => n.dealership_id === notesDealerFilter);
}, [notes, notesDealerFilter]);
```

- [ ] **Step 2: Add Notes Feed JSX**

After the Actions section card:

```tsx
{/* Notes Feed */}
<Card className="shadow-card rounded-xl">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-[hsl(var(--brand-500))]" />
        Field Notes
      </CardTitle>
      <div className="flex items-center gap-2">
        <Select value={notesDealerFilter} onValueChange={v => { setNotesDealerFilter(v); setNotesPage(0); }}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All dealers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dealers</SelectItem>
            {dealers.map(d => (
              <SelectItem key={d.dealershipId} value={d.dealershipId}>{d.dealerName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            const preselect = notesDealerFilter !== 'all'
              ? dealers.find(d => d.dealershipId === notesDealerFilter) ?? dealers[0] ?? null
              : dealers[0] ?? null;
            setNoteSheetDealer(preselect);
            setNoteSheetOpen(true);
          }}
        >
          + New Note
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    {filteredNotes.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <StickyNote className="h-7 w-7 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No field notes yet</p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {filteredNotes.map(note => {
          const dealer = dealers.find(d => d.dealershipId === note.dealership_id);
          return (
            <div key={note.id} className="px-5 py-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-[hsl(var(--brand-050))] text-[hsl(var(--brand-600))] border-[hsl(var(--brand-200))]">
                  {dealer?.dealerName ?? 'Unknown dealer'}
                </Badge>
                {note.assessment_id && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Assessment</Badge>
                )}
                {note.action_id && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Action</Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(note.created_at), 'dd MMM yyyy')}
                </span>
              </div>
              <p className="text-sm text-foreground">{note.note_text}</p>
            </div>
          );
        })}
        {filteredNotes.length > 0 && filteredNotes.length % 20 === 0 && (
          <div className="px-5 py-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = notesPage + 1;
                setNotesPage(next);
                fetchNotes(next);
              }}
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>
```

- [ ] **Step 3: Verify in browser**

Check:
- Feed shows notes with dealer chip, date, optional Assessment/Action badge
- Dealer filter works
- "+ New Note" opens sheet; after save, feed refreshes with new note at top
- "Load more" only shown when 20 notes returned

- [ ] **Step 4: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: coach dashboard notes feed section"
```

---

## Task 10: Move Trend Chart + Final Cleanup

**Files:**
- Modify: `src/pages/CoachDashboard.tsx`

- [ ] **Step 1: Move score trend chart to bottom**

The existing score trend chart JSX block (the `<Card>` with `LineChart`) should appear last in the sections list — after the Notes Feed card.

- [ ] **Step 2: Remove ActorContextBanner**

Delete the `{selectedDealer && <ActorContextBanner ... />}` block and remove the `ActorContextBanner` import. The `selectedDealer` state was already removed in Task 5.

- [ ] **Step 3: Remove old local getScoreBadge function**

Delete the `function getScoreBadge(...)` at top of file — replaced by `getScoreBand` from utils.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Run test suite**

```bash
npx vitest run
```

Expected: all tests pass including `coachDashboardUtils.test.ts`. No regressions.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CoachDashboard.tsx
git commit -m "feat: coach dashboard — move trend chart to bottom, remove legacy helpers"
```

---

## Task 11: Manual QA Checklist

No code changes. Verify each item in the running dev server at `/app/coach-dashboard`.

- [ ] Dark stats bar: 4 chips on `bg-[#0b1f3a]` — Dealers / Avg Score / Overdue Actions / Attention Needed
- [ ] Page header: "Coach Dashboard" title + "N dealerships assigned" subtitle
- [ ] Dealer cards: score badge + maturity label, brand badge, location + days ago, trend arrow + delta
- [ ] Action counts on card: "Open: N" + red "N overdue" badge when applicable
- [ ] Sort: Score / Name / Overdue all reorder cards correctly
- [ ] Status filter: All / Completed / In Progress filters correctly
- [ ] Note icon: tapping opens CoachNoteSheet with correct dealer name
- [ ] Note compose: General / Assessment / Action radio works; Assessment/Action dropdowns populate
- [ ] Note submit: note appears in sheet history immediately; dot badge appears on dealer card; notes feed refreshes
- [ ] Actions section — Overdue tab: shows actions past `target_completion_date`, red count badge
- [ ] Actions section — Stale tab: shows actions with daysStale ≥ 7, amber count badge
- [ ] Actions section — All Open tab: shows all open/in-progress actions with count
- [ ] Dealer filter in actions: persists across tab switches
- [ ] Action row click: navigates to `/app/results/:assessmentId`
- [ ] Actions empty state: per-tab message with checkmark
- [ ] Notes feed: dealer chip, date, optional Assessment/Action badge
- [ ] Notes "+ New Note": opens sheet; feed refreshes on save
- [ ] Notes dealer filter: filters feed to selected dealer
- [ ] Score trend chart: still renders at bottom, checkbox selector works
- [ ] Empty state (no assignments): `SharedEmptyState` preserved
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npx vitest run` → all tests pass

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: Sprint 4 coach dashboard complete"
```
