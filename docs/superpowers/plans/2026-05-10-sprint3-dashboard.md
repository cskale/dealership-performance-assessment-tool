# Sprint 3: Dashboard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static placeholder KPI dashboard with a real-data layout wired to Supabase assessment scores, signal engine output, and improvement actions — following the approved design in `.superpowers/brainstorm/371-1778385763/content/dash-v4.html`.

**Architecture:** Pure utility functions extracted to `src/lib/dashboardUtils.ts` for testability; `Dashboard.tsx` rewritten with local sub-components that consume those utilities. Two Supabase queries on mount (assessment + actions); coach data from `coach_dealership_assignments`. No new Edge Functions, no schema changes.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS client, Lucide React, Vitest/jsdom

**Spec:** `docs/superpowers/specs/2026-05-10-sprint3-dashboard-design.md`
**Reference mockup:** `.superpowers/brainstorm/371-1778385763/content/dash-v4.html`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/dashboardUtils.ts` | **Create** | Pure functions: score colour, maturity label, overdue check, date formatting, dept finding text, quarter label |
| `src/__tests__/dashboardUtils.test.ts` | **Create** | Unit tests for all dashboardUtils exports |
| `src/pages/Dashboard.tsx` | **Rewrite** | Data fetching + all sub-components as local functions |

No other files touched.

---

## Maturity thresholds (from `src/lib/maturityConfig.ts` — authoritative)

```
leading    ≥ 85   label: "Leading"
advanced   ≥ 65   label: "Advanced"
developing ≥ 45   label: "Developing"
foundational < 45  label: "Foundational"
```

Use `getMaturityLevel(score)` from `@/lib/maturityConfig` — do **not** define local thresholds.

## Department key map (from questionnaire section IDs → display names)

```typescript
export const DEPT_DISPLAY_NAMES: Record<string, string> = {
  'new-vehicle-sales':    'New Vehicle Sales',
  'used-vehicle-sales':   'Used Vehicle Sales',
  'service-performance':  'Service Operations',
  'financial-operations': 'Financial Operations',
  'parts-inventory':      'Parts & Accessories',
};

// Canonical order for display
export const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];
```

---

## Task 1: Create `dashboardUtils.ts` with pure utility functions

**Files:**
- Create: `src/lib/dashboardUtils.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/dashboardUtils.ts
import { getMaturityLevel } from '@/lib/maturityConfig';

// ─── Department metadata ────────────────────────────────────────────────────

export const DEPT_DISPLAY_NAMES: Record<string, string> = {
  'new-vehicle-sales':    'New Vehicle Sales',
  'used-vehicle-sales':   'Used Vehicle Sales',
  'service-performance':  'Service Operations',
  'financial-operations': 'Financial Operations',
  'parts-inventory':      'Parts & Accessories',
};

export const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

// ─── Score colour class ─────────────────────────────────────────────────────

/**
 * Returns a Tailwind text colour class based on maturity level.
 * Advanced (≥65) → brand blue. Leading (≥85) → green. Below 45 → red.
 * No yellow/amber anywhere — per design system rules.
 */
export function deptScoreColour(score: number): string {
  const level = getMaturityLevel(score);
  if (level === 'leading')      return 'text-[#22c55e]';
  if (level === 'advanced')     return 'text-[#1D7AFC]';
  if (level === 'developing')   return 'text-[#1D7AFC]';
  return 'text-[#ef4444]'; // foundational
}

export function deptMaturityColour(score: number): string {
  return deptScoreColour(score); // same colour for label
}

// ─── Overdue detection ──────────────────────────────────────────────────────

/**
 * Returns true when target_completion_date is a past date (today not overdue).
 * Null/undefined dates are never overdue.
 */
export function isOverdue(targetDate: string | null | undefined): boolean {
  if (!targetDate) return false;
  const target = new Date(targetDate);
  target.setHours(23, 59, 59, 999); // end of due day
  return target < new Date();
}

// ─── Date formatting ────────────────────────────────────────────────────────

/** "14 Apr 2026" */
export function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** "1 Jun 2026" (for action due dates) */
export function formatDueDate(iso: string | null | undefined): string {
  if (!iso) return 'No date set';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** Returns "Q2 2026" style label from a date string */
export function quarterLabel(iso: string): string {
  const d = new Date(iso);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

/** Returns ISO date string 90 days after the given ISO date */
export function nextAssessmentDue(completedAt: string): string {
  const d = new Date(completedAt);
  d.setDate(d.getDate() + 90);
  return d.toISOString();
}

/** Returns the last day of the current quarter as ISO string */
export function endOfCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  const endMonth = q * 3; // March=3, June=6, Sep=9, Dec=12
  const d = new Date(now.getFullYear(), endMonth, 0); // day 0 = last of previous month
  return d.toISOString();
}

/** "18 days away" / "3 days ago" relative label */
export function relativeDays(iso: string): string {
  const diff = Math.round(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'today';
  if (diff > 0) return `${diff} day${diff === 1 ? '' : 's'} away`;
  return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} ago`;
}

// ─── Departmental finding text ──────────────────────────────────────────────

/**
 * Returns a one-paragraph diagnostic finding for a department based on its
 * score. Used in the Departmental Intelligence grid when signal engine data
 * is not available (i.e. assessment.answers is null).
 */
export function deptFindingText(deptKey: string, score: number): string {
  const level = getMaturityLevel(score);
  const name = DEPT_DISPLAY_NAMES[deptKey] ?? deptKey;

  const texts: Record<string, Record<string, string>> = {
    'new-vehicle-sales': {
      leading:     'Lead capture, test-drive conversion, and prospecting cadence are all performing above the network benchmark. The department represents a model for other outlets.',
      advanced:    'Core sales processes are consistently executed. Lead conversion and customer journey scores are above benchmark — prospecting cadence has room for further improvement.',
      developing:  'Sales processes are in place but execution is inconsistent. Prospecting cadence and CRM discipline need reinforcement across the team.',
      foundational:'Fundamental sales process gaps identified. Prospecting, lead management, and customer journey processes require immediate definition and implementation.',
    },
    'used-vehicle-sales': {
      leading:     'Stock management and margin control are operating at benchmark-leading levels. Disposition process and pricing discipline are both strong.',
      advanced:    'Stock ageing and margin management are broadly sound. Monitor vehicle age profile and wholesale margin floor to maintain current performance.',
      developing:  'Stock ageing is above the 45-day benchmark and margin compression is evident. A formal disposition protocol and pricing review are the recommended interventions.',
      foundational:'Critical gaps in stock management — no formal disposition gate, ageing well above benchmark, and margin below acceptable floor across all used lines.',
    },
    'service-performance': {
      leading:     'Labour utilisation and fixed-first-visit rate are both leading the network benchmark. Retention and upsell processes are functioning at the highest level.',
      advanced:    'Labour utilisation is above benchmark. Fixed-first-visit performance and customer retention are strong — minor efficiency gains available in upsell processes.',
      developing:  'Labour utilisation is below benchmark. Fixed-first-visit rate and service advisor upsell process need structured improvement.',
      foundational:'Core service delivery processes are inconsistently applied. Labour efficiency, technician productivity, and customer retention all require immediate attention.',
    },
    'parts-inventory': {
      leading:     'Fill rate on all key lines is at benchmark-leading levels. Obsolete stock is actively managed and the purchasing process is efficient.',
      advanced:    'Fill rate on fast-moving lines is strong. Obsolete stock management is adequate — a structured write-down cycle would improve the score further.',
      developing:  'Fill rate is adequate but obsolete stock is accumulating without a structured write-down cycle. This is the primary drag on the department score.',
      foundational:'Significant inventory management gaps. Fill rate, obsolete stock accumulation, and purchasing process all require immediate structured intervention.',
    },
    'financial-operations': {
      leading:     'Finance and Insurance penetration, cash cycle management, and reporting processes are all performing above the network benchmark.',
      advanced:    'Core cash management and reporting processes are well-documented. F&I penetration on primary lines is strong — ancillary product penetration has scope for improvement.',
      developing:  'F&I product penetration on ancillary lines is below standard. Core cash management processes are documented but inconsistently followed.',
      foundational:'Fundamental financial operations gaps. F&I penetration, cash cycle management, and reporting processes all require immediate definition and enforcement.',
    },
  };

  return texts[deptKey]?.[level]
    ?? `${name} scored ${score}/100 (${level}). Review department processes against the benchmark criteria.`;
}

// ─── Focus department ───────────────────────────────────────────────────────

/** Returns the department key with the lowest score from a scores record. */
export function focusDepartment(scores: Record<string, number>): string {
  const ordered = DEPT_ORDER.filter(k => k in scores);
  if (ordered.length === 0) return '';
  return ordered.reduce((worst, k) =>
    (scores[k] ?? 100) < (scores[worst] ?? 100) ? k : worst
  );
}

// ─── Critical gap count ─────────────────────────────────────────────────────

/** Count of departments with score below 45 (foundational). */
export function criticalGapCount(scores: Record<string, number>): number {
  return Object.values(scores).filter(s => s < 45).length;
}

// ─── Hero narrative ─────────────────────────────────────────────────────────

/**
 * Derives a short one-sentence executive narrative for the hero card
 * without calling the full signal engine.
 */
export function heroNarrative(
  scores: Record<string, number>,
  overallScore: number
): string {
  const level = getMaturityLevel(overallScore);
  const aboveBenchmark = DEPT_ORDER.filter(k => (scores[k] ?? 0) >= 65).map(
    k => DEPT_DISPLAY_NAMES[k]
  );
  const focusDept = DEPT_DISPLAY_NAMES[focusDepartment(scores)] ?? 'one department';

  if (level === 'leading') {
    return `All departments are performing above benchmark — ${focusDept} has the most room for further improvement.`;
  }
  if (aboveBenchmark.length >= 3) {
    return `${aboveBenchmark.slice(0, 2).join(' and ')} are above benchmark. ${focusDept} is the primary focus for Q2 improvement.`;
  }
  if (aboveBenchmark.length >= 1) {
    return `${aboveBenchmark[0]} is above benchmark. ${focusDept} requires the most urgent attention this quarter.`;
  }
  return `${focusDept} has the lowest score and requires immediate intervention. All departments are developing — structured process improvement is the priority.`;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dashboardUtils.ts
git commit -m "feat: add dashboardUtils — pure utility functions for dashboard redesign"
```

---

## Task 2: Test `dashboardUtils.ts`

**Files:**
- Create: `src/__tests__/dashboardUtils.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/__tests__/dashboardUtils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  deptScoreColour,
  isOverdue,
  formatDisplayDate,
  formatDueDate,
  quarterLabel,
  nextAssessmentDue,
  endOfCurrentQuarter,
  relativeDays,
  deptFindingText,
  focusDepartment,
  criticalGapCount,
  heroNarrative,
  DEPT_DISPLAY_NAMES,
  DEPT_ORDER,
} from '@/lib/dashboardUtils';

describe('deptScoreColour', () => {
  it('returns green for leading score (≥85)', () => {
    expect(deptScoreColour(85)).toBe('text-[#22c55e]');
    expect(deptScoreColour(100)).toBe('text-[#22c55e]');
  });
  it('returns brand blue for advanced score (65–84)', () => {
    expect(deptScoreColour(65)).toBe('text-[#1D7AFC]');
    expect(deptScoreColour(84)).toBe('text-[#1D7AFC]');
  });
  it('returns brand blue for developing score (45–64)', () => {
    expect(deptScoreColour(45)).toBe('text-[#1D7AFC]');
    expect(deptScoreColour(64)).toBe('text-[#1D7AFC]');
  });
  it('returns red for foundational score (<45)', () => {
    expect(deptScoreColour(44)).toBe('text-[#ef4444]');
    expect(deptScoreColour(0)).toBe('text-[#ef4444]');
  });
});

describe('isOverdue', () => {
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false);
    expect(isOverdue(undefined)).toBe(false);
  });
  it('returns false for future date', () => {
    const future = new Date(Date.now() + 86400000 * 10).toISOString();
    expect(isOverdue(future)).toBe(false);
  });
  it('returns true for past date', () => {
    const past = new Date(Date.now() - 86400000 * 2).toISOString();
    expect(isOverdue(past)).toBe(true);
  });
});

describe('formatDisplayDate', () => {
  it('formats ISO date as "14 Apr 2026"', () => {
    expect(formatDisplayDate('2026-04-14T00:00:00Z')).toBe('14 Apr 2026');
  });
});

describe('formatDueDate', () => {
  it('returns "No date set" for null', () => {
    expect(formatDueDate(null)).toBe('No date set');
  });
  it('formats a date string', () => {
    expect(formatDueDate('2026-06-01T00:00:00Z')).toBe('1 Jun 2026');
  });
});

describe('quarterLabel', () => {
  it('returns Q2 for April', () => {
    expect(quarterLabel('2026-04-14T00:00:00Z')).toBe('Q2 2026');
  });
  it('returns Q1 for January', () => {
    expect(quarterLabel('2026-01-01T00:00:00Z')).toBe('Q1 2026');
  });
  it('returns Q4 for December', () => {
    expect(quarterLabel('2026-12-01T00:00:00Z')).toBe('Q4 2026');
  });
});

describe('nextAssessmentDue', () => {
  it('adds 90 days', () => {
    const result = nextAssessmentDue('2026-04-14T00:00:00Z');
    const expected = new Date('2026-04-14');
    expected.setDate(expected.getDate() + 90);
    expect(new Date(result).toDateString()).toBe(expected.toDateString());
  });
});

describe('deptFindingText', () => {
  it('returns a non-empty string for all depts at all maturity levels', () => {
    const scores = [20, 50, 70, 90];
    for (const key of Object.keys(DEPT_DISPLAY_NAMES)) {
      for (const score of scores) {
        const text = deptFindingText(key, score);
        expect(text.length).toBeGreaterThan(20);
      }
    }
  });
  it('returns fallback for unknown dept key', () => {
    const text = deptFindingText('unknown-dept', 60);
    expect(text).toContain('unknown-dept');
  });
});

describe('focusDepartment', () => {
  it('returns the key with the lowest score', () => {
    const scores = {
      'new-vehicle-sales': 72,
      'used-vehicle-sales': 45,
      'service-performance': 81,
      'parts-inventory': 69,
      'financial-operations': 66,
    };
    expect(focusDepartment(scores)).toBe('used-vehicle-sales');
  });
  it('returns empty string for empty scores', () => {
    expect(focusDepartment({})).toBe('');
  });
});

describe('criticalGapCount', () => {
  it('counts depts below 45', () => {
    expect(criticalGapCount({ a: 44, b: 45, c: 20 })).toBe(2);
  });
  it('returns 0 when all depts above threshold', () => {
    expect(criticalGapCount({ a: 65, b: 80 })).toBe(0);
  });
});

describe('heroNarrative', () => {
  it('returns a non-empty string', () => {
    const scores = {
      'new-vehicle-sales': 72,
      'used-vehicle-sales': 45,
      'service-performance': 81,
      'parts-inventory': 69,
      'financial-operations': 66,
    };
    const text = heroNarrative(scores, 67);
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(20);
  });
  it('mentions "all departments" when score is leading', () => {
    const scores = { 'new-vehicle-sales': 88, 'used-vehicle-sales': 90 };
    expect(heroNarrative(scores, 90)).toContain('All departments');
  });
});

describe('DEPT_ORDER', () => {
  it('contains exactly 5 keys', () => {
    expect(DEPT_ORDER).toHaveLength(5);
  });
  it('all keys exist in DEPT_DISPLAY_NAMES', () => {
    for (const k of DEPT_ORDER) {
      expect(DEPT_DISPLAY_NAMES).toHaveProperty(k);
    }
  });
});
```

- [ ] **Step 2: Run tests — expect all to pass**

```bash
npx vitest run src/__tests__/dashboardUtils.test.ts
```

Expected: all tests green.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/dashboardUtils.test.ts
git commit -m "test: dashboardUtils unit tests — score colour, dates, finding text, focus dept"
```

---

## Task 3: Rewrite `Dashboard.tsx` — data fetching layer

**Files:**
- Modify: `src/pages/Dashboard.tsx` (full rewrite of the filled-state logic)

Remove all the old static KPI grid code. Preserve only:
1. The empty state (the "Run your first diagnostic" card — lines ~185–220 in current file)
2. The `useEffect` that checks `hasAssessments` (simplify it to also fetch scores)
3. Actor-type redirect logic (line ~139)

- [ ] **Step 1: Replace the top of Dashboard.tsx with this new version**

```tsx
// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, ClipboardList, ArrowRight, BarChart3, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateWeightedScore } from '@/lib/scoringEngine';
import { getMaturityLevel, MATURITY_LEVELS } from '@/lib/maturityConfig';
import {
  DEPT_DISPLAY_NAMES,
  DEPT_ORDER,
  deptScoreColour,
  deptMaturityColour,
  isOverdue,
  formatDisplayDate,
  formatDueDate,
  quarterLabel,
  nextAssessmentDue,
  endOfCurrentQuarter,
  relativeDays,
  deptFindingText,
  focusDepartment,
  criticalGapCount,
  heroNarrative,
} from '@/lib/dashboardUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentRow {
  id: string;
  completed_at: string;
  overall_score: number | null;
  scores: Record<string, number>;
  answers: Record<string, number>;
}

interface ActionRow {
  id: string;
  action_title: string;
  action_description: string;
  department: string;
  responsible_person: string | null;
  target_completion_date: string | null;
  priority: string;
  status: string | null;
}

interface CoachRow {
  coach_user_id: string;
  assigned_at: string;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
}

interface DashboardData {
  assessment: AssessmentRow;
  actions: ActionRow[];
  coach: CoachRow | null;
}
```

- [ ] **Step 2: Add the data-fetching `useEffect` below the type declarations**

```tsx
export default function Dashboard() {
  const { actorType } = useActiveRole();
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [hasAssessments, setHasAssessments] = useState<boolean | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      // Query 1: latest completed assessment
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, completed_at, overall_score, scores, answers')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (cancelled) return;

      if (!assessments || assessments.length === 0) {
        setHasAssessments(false);
        setLoading(false);
        return;
      }

      const assessment = assessments[0] as AssessmentRow;
      setHasAssessments(true);

      // Query 2: open actions for this assessment
      const { data: actions } = await supabase
        .from('improvement_actions')
        .select('id, action_title, action_description, department, responsible_person, target_completion_date, priority, status')
        .eq('assessment_id', assessment.id)
        .neq('status', 'completed')
        .order('target_completion_date', { ascending: true });

      // Query 3: coach assignment (if any) for the dealer
      const { data: coachRows } = await supabase
        .from('coach_dealership_assignments')
        .select('coach_user_id, assigned_at, valid_from, valid_to, is_active')
        .eq('is_active', true)
        .limit(1);

      if (cancelled) return;

      setData({
        assessment,
        actions: (actions ?? []) as ActionRow[],
        coach: coachRows?.[0] as CoachRow ?? null,
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Derived values — computed once, used by sub-components
  const derived = useMemo(() => {
    if (!data) return null;
    const { assessment, actions } = data;
    const scores = assessment.scores as Record<string, number> ?? {};
    const overallScore = assessment.overall_score
      ?? calculateWeightedScore(scores);
    const maturityKey = getMaturityLevel(overallScore);
    const maturityLabel = MATURITY_LEVELS[maturityKey].label;
    const focusDeptKey = focusDepartment(scores);
    const focusDeptName = DEPT_DISPLAY_NAMES[focusDeptKey] ?? '—';
    const focusDeptScore = scores[focusDeptKey] ?? 0;
    const gapCount = criticalGapCount(scores);
    const openCount = actions.length;
    const overdueCount = actions.filter(a => isOverdue(a.target_completion_date)).length;
    const narrative = heroNarrative(scores, overallScore);
    const quarter = quarterLabel(assessment.completed_at);

    return {
      scores, overallScore, maturityKey, maturityLabel,
      focusDeptKey, focusDeptName, focusDeptScore,
      gapCount, openCount, overdueCount, narrative, quarter,
    };
  }, [data]);

  // Redirect non-dealer actors
  if (actorType === 'coach') return <Navigate to="/app/coach-dashboard" replace />;
  if (actorType === 'oem')   return <Navigate to="/app/oem-dashboard"   replace />;

  if (loading || hasAssessments === null) {
    return <div className="min-h-screen bg-[#F7F8F9]" />;
  }
```

- [ ] **Step 3: Verify TypeScript compiles (file is incomplete but should have no type errors in added code)**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit work in progress**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard data layer — assessment, actions, coach queries + derived values"
```

---

## Task 4: Empty state + Stats Bar + Page Header sub-components

**Files:**
- Modify: `src/pages/Dashboard.tsx`

Add the empty state JSX (preserved from original) and the two new components. All go inside `Dashboard.tsx` as local components defined before the `export default`.

- [ ] **Step 1: Add `StatsBadge` and `StatsBar` local components above the `export default`**

```tsx
// ─── Stats Bar ────────────────────────────────────────────────────────────────

interface StatsBadgeProps {
  label: string;
  value: string;
  alert?: boolean;
}

function StatsBadge({ label, value, alert }: StatsBadgeProps) {
  return (
    <div className="flex items-center gap-2 pr-5 mr-5 border-r border-white/[0.08] h-9">
      <span className="text-[10px] font-medium text-white/35 tracking-[0.06em]">{label}</span>
      <span className={cn(
        'text-[11px] font-bold tabular-nums',
        alert ? 'text-[#f87171]' : 'text-white/85'
      )}>{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Add the `EmptyState` local component**

```tsx
// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  const benefits = [
    { icon: BarChart3, label: 'Scored across 5 departments' },
    { icon: Zap,       label: 'Diagnostic signals in minutes' },
    { icon: Award,     label: 'Prioritised action plan' },
  ];
  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      <div className="max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-card border border-[#DFE1E6] p-8 space-y-6 text-center">
        <ClipboardList className="h-14 w-14 text-[#85B8FF] mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#091E42]">
            Run your first dealership diagnostic
          </h1>
          <p className="text-sm text-[#5E6C84] leading-relaxed">
            A 45-minute structured assessment across 5 departments. Get a scored
            performance profile, diagnostic signals, and a prioritised action plan.
          </p>
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={onStart}>
          Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <div className="grid grid-cols-3 gap-4">
          {benefits.map(b => (
            <div key={b.label} className="bg-[#F7FAFF] rounded-lg p-3 flex flex-col items-center gap-2">
              <b.icon className="h-5 w-5 text-[#579DFF]" />
              <span className="text-xs text-[#5E6C84]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add the `return` statement of `Dashboard` for the empty state, and start the filled-state return with stats bar and page header**

```tsx
  // ── Render ──────────────────────────────────────────────────────────────────

  if (!hasAssessments || !data || !derived) {
    return (
      <div className="min-h-screen bg-[#F7F8F9]">
        <EmptyState onStart={() => navigate('/app/assessment')} />
      </div>
    );
  }

  const { assessment, actions, coach } = data;
  const {
    scores, overallScore, maturityLabel,
    focusDeptKey, focusDeptName, focusDeptScore,
    gapCount, openCount, narrative, quarter,
  } = derived;

  return (
    <div className="min-h-screen bg-[#F7F8F9]">

      {/* ── Dark stats bar ── */}
      <div
        className="flex items-center h-9 px-6"
        style={{ background: '#0b1f3a' }}
      >
        <StatsBadge label="Overall Score" value={`${Math.round(overallScore)} / 100`} />
        <StatsBadge label="Assessment date" value={formatDisplayDate(assessment.completed_at)} />
        <StatsBadge
          label="Critical gaps"
          value={gapCount > 0 ? `${gapCount} department${gapCount > 1 ? 's' : ''}` : 'None'}
          alert={gapCount > 0}
        />
        <StatsBadge label="Open actions" value={`${openCount} item${openCount !== 1 ? 's' : ''}`} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-semibold text-white/60">Dealer Principal</span>
          <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#1D7AFC] to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
            DP
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-4">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B778C] mb-1">
              Performance Intelligence · {quarter}
            </p>
            <h1
              className="text-[28px] font-extrabold text-[#091E42]"
              style={{ letterSpacing: '-0.022em', fontOpticalSizing: 'auto' } as React.CSSProperties}
            >
              Diagnostic Command
            </h1>
          </div>
          <button
            onClick={() => navigate('/app/results')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0b1f3a] text-white rounded-lg text-[12px] font-semibold hover:bg-[#122a4a] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>
            View Full Report
          </button>
        </div>

        {/* Sub-components rendered here in Tasks 5–8 */}

      </main>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard empty state, stats bar, page header"
```

---

## Task 5: Hero Card sub-component

**Files:**
- Modify: `src/pages/Dashboard.tsx`

Add `HeroCard` as a local component and render it in the `main` section.

- [ ] **Step 1: Add `HeroCard` local component above `export default`**

```tsx
// ─── Hero Card ────────────────────────────────────────────────────────────────

interface HeroCardProps {
  overallScore: number;
  maturityLabel: string;
  narrative: string;
  openActions: ActionRow[];
  focusDeptName: string;
  focusDeptScore: number;
  focusDeptKey: string;
}

function HeroCard({
  overallScore, maturityLabel, narrative,
  openActions, focusDeptName, focusDeptScore, focusDeptKey,
}: HeroCardProps) {
  const topActions = openActions.slice(0, 3);
  const focusMaturity = MATURITY_LEVELS[getMaturityLevel(focusDeptScore)].label;

  return (
    <div
      className="rounded-2xl overflow-hidden grid grid-cols-3"
      style={{ background: '#0b1f3a' }}
    >
      {/* Col 1 — Overall score */}
      <div className="p-7 border-r border-white/[0.07]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-4">
          Overall Diagnostic Score
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="text-[72px] font-extrabold text-white leading-none tabular-nums"
            style={{ letterSpacing: '-0.05em', fontOpticalSizing: 'auto' } as React.CSSProperties}
          >
            {Math.round(overallScore)}
          </span>
          <span className="text-[18px] font-medium text-white/35">/ 100</span>
        </div>
        <div className="mt-4 h-[5px] rounded-full bg-white/10">
          <div
            className="h-[5px] rounded-full"
            style={{
              width: `${Math.min(100, Math.round(overallScore))}%`,
              background: 'linear-gradient(90deg, #1D7AFC 0%, #85B8FF 100%)',
            }}
          />
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-[rgba(29,122,252,0.2)] text-[#85B8FF] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#579DFF]" />
          {maturityLabel}
        </div>
        <p className="mt-4 text-[11px] italic text-white/38 leading-relaxed border-t border-white/[0.07] pt-4">
          "{narrative}"
        </p>
      </div>

      {/* Col 2 — Open actions */}
      <div className="p-7 border-r border-white/[0.07]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-4">
          Open Actions
        </p>
        <span
          className="text-[72px] font-extrabold text-white leading-none tabular-nums"
          style={{ letterSpacing: '-0.05em', fontOpticalSizing: 'auto' } as React.CSSProperties}
        >
          {openActions.length}
        </span>
        <p className="text-[13px] text-white/40 mt-2 mb-5">items requiring attention</p>
        <div className="space-y-2">
          {topActions.map(a => (
            <div key={a.id} className="flex items-start gap-2">
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
              <p className="text-[11px] text-white/50 leading-snug">
                <strong className="text-white/80 font-semibold">
                  {DEPT_DISPLAY_NAMES[a.department] ?? a.department}:
                </strong>{' '}
                {a.action_title}
                {a.target_completion_date && ` — due ${formatDueDate(a.target_completion_date)}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3 — Focus department */}
      <div className="p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-4">
          Focus Department
        </p>
        <p
          className="text-[20px] font-extrabold text-white mb-2"
          style={{ letterSpacing: '-0.02em', fontOpticalSizing: 'auto' } as React.CSSProperties}
        >
          {focusDeptName}
        </p>
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className="text-[56px] font-extrabold text-white leading-none tabular-nums"
            style={{ letterSpacing: '-0.04em', fontOpticalSizing: 'auto' } as React.CSSProperties}
          >
            {Math.round(focusDeptScore)}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-white/40">
            {focusMaturity}
          </span>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed border-t border-white/[0.07] pt-4">
          {deptFindingText(focusDeptKey, focusDeptScore)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the `{/* Sub-components rendered here */}` comment with the actual renders, starting with `HeroCard`**

```tsx
        {/* ── Hero card ── */}
        <HeroCard
          overallScore={overallScore}
          maturityLabel={maturityLabel}
          narrative={narrative}
          openActions={actions}
          focusDeptName={focusDeptName}
          focusDeptScore={focusDeptScore}
          focusDeptKey={focusDeptKey}
        />
```

- [ ] **Step 3: TypeScript check + dev server visual check**

```bash
npx tsc --noEmit
npm run dev
```

Open `http://localhost:8080/app/dashboard` — hero card should render with real data.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard hero card — 3-col dark card with real score, actions, focus dept"
```

---

## Task 6: Timeline Strip + Priority Card sub-components

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add `TimelineStrip` local component**

```tsx
// ─── Timeline Strip ───────────────────────────────────────────────────────────

type TimelineStatus = 'done' | 'upcoming' | 'overdue';

interface TimelineSlotProps {
  label: string;
  date: string;
  sub: string;
  status: TimelineStatus;
  badgeText: string;
}

function TimelineSlot({ label, date, sub, status, badgeText }: TimelineSlotProps) {
  const dotColor = {
    done:     'bg-[#22c55e]',
    upcoming: 'bg-[#579DFF]',
    overdue:  'bg-[#ef4444]',
  }[status];

  const badgeStyle = {
    done:     'bg-[#f0fdf4] text-[#15803d]',
    upcoming: 'bg-[#E9F2FF] text-[#1558BC]',
    overdue:  'bg-[#fef2f2] text-[#ef4444]',
  }[status];

  return (
    <div className="px-5 py-4 border-r border-[#F1F2F4] last:border-r-0 relative">
      <span className={cn('absolute top-4 right-4 w-2 h-2 rounded-full', dotColor)} />
      <p className="text-[10px] font-semibold text-[#6B778C] mb-1">{label}</p>
      <p className="text-[13px] font-bold text-[#172B4D] mb-0.5">{date}</p>
      <p className="text-[10px] text-[#6B778C] mb-2">{sub}</p>
      <span className={cn('inline-block text-[9px] font-bold px-2 py-0.5 rounded-full', badgeStyle)}>
        {badgeText}
      </span>
    </div>
  );
}

function TimelineStrip({
  assessment,
  coach,
}: {
  assessment: AssessmentRow;
  coach: CoachRow | null;
}) {
  const nextDue = nextAssessmentDue(assessment.completed_at);
  const qEnd    = endOfCurrentQuarter();
  const nextDueOverdue = isOverdue(nextDue);

  const coachAssignedDate = coach?.assigned_at
    ? formatDisplayDate(coach.assigned_at)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] grid grid-cols-5 overflow-hidden">
      <TimelineSlot
        label="Last Assessment"
        date={formatDisplayDate(assessment.completed_at)}
        sub="61 questions · completed"
        status="done"
        badgeText="Completed"
      />
      <TimelineSlot
        label="Next Assessment Due"
        date={formatDisplayDate(nextDue)}
        sub={relativeDays(nextDue)}
        status={nextDueOverdue ? 'overdue' : 'upcoming'}
        badgeText={nextDueOverdue ? 'Overdue' : 'Upcoming'}
      />
      <TimelineSlot
        label="Last Coach Visit"
        date={coachAssignedDate ?? 'Not scheduled'}
        sub={coach ? 'Field coach assigned' : 'No coach assigned'}
        status={coach ? 'done' : 'upcoming'}
        badgeText={coach ? 'Assigned' : 'Not scheduled'}
      />
      <TimelineSlot
        label="Next Coach Visit"
        date={coach?.valid_to ? formatDisplayDate(coach.valid_to) : 'Not scheduled'}
        sub={coach?.valid_to ? relativeDays(coach.valid_to) : 'Contact your programme manager'}
        status="upcoming"
        badgeText={coach?.valid_to ? 'Scheduled' : 'Not scheduled'}
      />
      <TimelineSlot
        label="Action Plan Review"
        date={formatDisplayDate(qEnd)}
        sub="End of quarter · all departments"
        status="upcoming"
        badgeText="Upcoming"
      />
    </div>
  );
}
```

- [ ] **Step 2: Add `PriorityCard` local component**

```tsx
// ─── Priority Intervention Card ───────────────────────────────────────────────

function PriorityCard({
  focusDeptName,
  focusDeptScore,
}: {
  focusDeptName: string;
  focusDeptScore: number;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-[#fef2f2] border border-[#fecaca] border-l-[3px] border-l-[#ef4444] rounded-xl shadow-card">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-[#ef4444] mb-1">
          Priority Intervention Required
        </p>
        <p className="text-[12px] text-[#253858] leading-relaxed">
          {focusDeptName} scored {Math.round(focusDeptScore)}/100 and requires immediate
          attention. Review the open actions and assign ownership before the Q2 deadline.
        </p>
      </div>
      <button
        onClick={() => navigate('/app/actions')}
        className="flex-shrink-0 px-5 py-2 bg-[#ef4444] text-white rounded-lg text-[12px] font-bold hover:bg-[#dc2626] transition-colors"
      >
        Resolve Now
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add both to the `main` render section after `HeroCard`**

```tsx
        {/* ── Timeline strip ── */}
        <TimelineStrip assessment={assessment} coach={coach} />

        {/* ── Priority card — only when a critical gap exists ── */}
        {gapCount > 0 && (
          <PriorityCard
            focusDeptName={focusDeptName}
            focusDeptScore={focusDeptScore}
          />
        )}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard timeline strip and priority intervention card"
```

---

## Task 7: Departmental Intelligence Grid sub-component

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add `DeptGrid` local component**

```tsx
// ─── Departmental Intelligence Grid ──────────────────────────────────────────

function DeptGrid({ scores }: { scores: Record<string, number> }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#172B4D]">Departmental Intelligence</h2>
        <span className="text-[11px] font-semibold text-[#6B778C]">Performance matrix ⓘ</span>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] grid grid-cols-5 overflow-hidden">
        {DEPT_ORDER.map((key, i) => {
          const score = scores[key] ?? 0;
          const maturity = MATURITY_LEVELS[getMaturityLevel(score)].label;
          const scoreColour   = deptScoreColour(score);
          const maturityColour = deptMaturityColour(score);
          const finding = deptFindingText(key, score);

          return (
            <div
              key={key}
              className={cn(
                'p-4 pb-4',
                i < DEPT_ORDER.length - 1 && 'border-r border-[#F1F2F4]'
              )}
            >
              <p className="text-[10px] font-bold text-[#5E6C84] mb-2 leading-tight">
                {DEPT_DISPLAY_NAMES[key]}
              </p>
              <p
                className={cn(
                  'text-[38px] font-extrabold leading-none tabular-nums mb-0.5',
                  scoreColour
                )}
                style={{ letterSpacing: '-0.03em', fontOpticalSizing: 'auto' } as React.CSSProperties}
              >
                {Math.round(score)}
              </p>
              <p className={cn('text-[10px] font-bold uppercase tracking-[0.05em] mb-3', maturityColour)}>
                {maturity}
              </p>
              <p className="text-[10.5px] text-[#5E6C84] leading-relaxed border-t border-[#F1F2F4] pt-2">
                {finding}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Render in `main` after the priority card**

```tsx
        {/* ── Departmental intelligence ── */}
        <DeptGrid scores={scores} />
```

- [ ] **Step 3: TypeScript check + visual check**

```bash
npx tsc --noEmit && npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard departmental intelligence grid — real scores, brand blue, no amber"
```

---

## Task 8: Open Actions Table sub-component

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add `ActionsTable` local component**

```tsx
// ─── Open Actions Table ───────────────────────────────────────────────────────

function ActionsTable({
  actions,
  onViewAll,
}: {
  actions: ActionRow[];
  onViewAll: () => void;
}) {
  if (actions.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#172B4D]">Open Actions</h2>
        <button
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[#6B778C] hover:text-[#1D7AFC] transition-colors"
        >
          View all in Action Plans →
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] px-5 py-5">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Action', 'Department', 'Responsible', 'Due'].map(h => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#97A0AF] pb-3"
                  style={{ paddingRight: h !== 'Due' ? '20px' : undefined }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map(action => {
              const overdue = isOverdue(action.target_completion_date);
              const deptName = DEPT_DISPLAY_NAMES[action.department] ?? action.department;

              return (
                <tr key={action.id}>
                  <td
                    className="text-[12px] text-[#253858] font-medium py-[10px] border-t border-[#F1F2F4] align-top"
                    style={{ paddingRight: '20px' }}
                  >
                    <span
                      className={cn(
                        'inline-block w-[7px] h-[7px] rounded-full mr-2 flex-shrink-0 align-middle',
                        overdue ? 'bg-[#ef4444]' : 'bg-[#1D7AFC]'
                      )}
                    />
                    {action.action_title}
                  </td>
                  <td
                    className="text-[12px] text-[#5E6C84] py-[10px] border-t border-[#F1F2F4] align-top whitespace-nowrap"
                    style={{ paddingRight: '20px' }}
                  >
                    {deptName}
                  </td>
                  <td
                    className="text-[12px] text-[#5E6C84] py-[10px] border-t border-[#F1F2F4] align-top whitespace-nowrap"
                    style={{ paddingRight: '20px' }}
                  >
                    {action.responsible_person ?? '—'}
                  </td>
                  <td
                    className={cn(
                      'text-[11px] font-semibold py-[10px] border-t border-[#F1F2F4] align-top whitespace-nowrap',
                      overdue ? 'text-[#ef4444]' : 'text-[#6B778C]'
                    )}
                  >
                    {formatDueDate(action.target_completion_date)}
                    {overdue && ' · Overdue'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Render in `main` after the dept grid**

```tsx
        {/* ── Open actions table ── */}
        <ActionsTable
          actions={actions}
          onViewAll={() => navigate('/app/actions')}
        />
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard open actions table — red/blue dot only, overdue detection, full dept names"
```

---

## Task 9: Strategic Findings sub-component

**Files:**
- Modify: `src/pages/Dashboard.tsx`

The findings are derived from scores — no full signal engine call needed. Two rules:
1. Any dept with score < 45 → critical finding for that dept
2. If 2+ depts below 65 → systemic cross-dept process finding

- [ ] **Step 1: Add `deriveFindings` helper at the top of the file (in dashboardUtils.ts is not needed — this logic is dashboard-specific)**

Add this function inside `Dashboard.tsx`, before the `FindingsCard` component:

```tsx
// ─── Strategic Findings ───────────────────────────────────────────────────────

interface Finding {
  id: string;
  severity: 'critical' | 'medium';
  title: string;
  description: string;
}

function deriveFindings(scores: Record<string, number>): Finding[] {
  const findings: Finding[] = [];

  // Critical findings — foundational departments
  for (const key of DEPT_ORDER) {
    const score = scores[key] ?? 0;
    if (score < 45) {
      const name = DEPT_DISPLAY_NAMES[key];
      findings.push({
        id: `critical-${key}`,
        severity: 'critical',
        title: `${name} — Critical Performance Gap`,
        description: `${name} scored ${Math.round(score)}/100 (Foundational). Core processes are undefined or inconsistently applied, creating a significant drag on overall dealership performance. Immediate structured intervention is required before the next assessment cycle.`,
      });
    }
  }

  // Systemic finding — 2+ depts below Advanced threshold
  const weakDepts = DEPT_ORDER.filter(k => (scores[k] ?? 0) < 65);
  if (weakDepts.length >= 2) {
    const names = weakDepts.map(k => DEPT_DISPLAY_NAMES[k]).join(', ');
    findings.push({
      id: 'systemic-process',
      severity: 'medium',
      title: 'Cross-Department Process Consistency Gap',
      description: `Below-benchmark performance identified in ${weakDepts.length} departments: ${names}. This pattern suggests an organisation-wide process discipline issue — likely inconsistent CRM usage, role ownership gaps, or absence of a regular operational review cadence — rather than isolated department failures.`,
    });
  }

  return findings.slice(0, 3); // cap at 3
}
```

- [ ] **Step 2: Add `FindingsCard` local component**

```tsx
function FindingsCard({ scores }: { scores: Record<string, number> }) {
  const findings = deriveFindings(scores);
  if (findings.length === 0) return null;

  return (
    <>
      <h2 className="text-[15px] font-bold text-[#172B4D]">Strategic Findings</h2>
      <div className="bg-white rounded-xl shadow-card border border-[#DFE1E6] px-5 py-5">
        {findings.map((f, i) => (
          <div
            key={f.id}
            className={cn('py-4 flex items-start gap-3', i > 0 && 'border-t border-[#F1F2F4]')}
          >
            {/* Icon — AlertCircle for critical, Info for medium */}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                f.severity === 'critical' ? 'bg-[#fef2f2]' : 'bg-[#E9F2FF]'
              )}
            >
              {f.severity === 'critical' ? (
                <AlertCircle size={16} strokeWidth={2} className="text-[#ef4444]" />
              ) : (
                <Info size={16} strokeWidth={2} className="text-[#1D7AFC]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-[13px] font-bold text-[#172B4D]">{f.title}</p>
                <span
                  className={cn(
                    'flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    f.severity === 'critical'
                      ? 'bg-[#fef2f2] text-[#ef4444]'
                      : 'bg-[#E9F2FF] text-[#1558BC]'
                  )}
                >
                  {f.severity === 'critical' ? 'Critical risk' : 'Medium impact'}
                </span>
              </div>
              <p className="text-[11px] text-[#5E6C84] leading-relaxed">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Render in `main` as the final section**

```tsx
        {/* ── Strategic findings ── */}
        <FindingsCard scores={scores} />
```

- [ ] **Step 4: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass (76 existing + new dashboardUtils tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard strategic findings — score-derived critical + systemic signals"
```

---

## Task 10: Remove dead code + lint + final commit

**Files:**
- Modify: `src/pages/Dashboard.tsx` — remove any remaining imports that are now unused

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Fix any unused import warnings — common culprits: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `Badge`, `Progress`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `Sparkles`, `Target`, `ChevronRight`, `TrendingUp`, `Car`, `RotateCw`, `Wrench`, `Download`, `Info`, `FreshnessBadge`, `getAssessmentFreshness`, `calculateWeightedScore` (if inlined), `TOTAL_QUESTIONS`.

Remove each unused import. Add any missing ones.

- [ ] **Step 2: Final test run with coverage**

```bash
npx vitest run --coverage 2>&1 | tail -20
```

Expected: coverage thresholds met (80% branches/functions/lines/statements).

- [ ] **Step 3: Manual smoke test**

Start dev server:
```bash
npm run dev
```

Check at `http://localhost:8080/app/dashboard`:
- [ ] Stats bar shows real assessment date and score
- [ ] Hero card: score number renders, all 3 cols present, all white text
- [ ] Timeline strip: 5 slots render, dates correct
- [ ] Priority card: visible only if a dept scores < 45
- [ ] Dept grid: 5 columns, full dept names (no "NVS" etc.), brand blue for performing scores
- [ ] Open actions table: red dot for overdue, blue for pending, no yellow
- [ ] Strategic findings: AlertCircle / Info Lucide icons, badges in sentence case
- [ ] Empty state: navigate to `/app/dashboard` before any assessments — "Run your first diagnostic" shows

- [ ] **Step 4: Final commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: Sprint 3 dashboard complete — real data, design system compliant, no static KPIs"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Task |
|---|---|
| Dark stats bar | Task 4 |
| Page header + Export button | Task 4 |
| Full-width hero card — 3 cols, white only | Task 5 |
| Key dates / timeline strip | Task 6 |
| Priority intervention card (conditional) | Task 6 |
| Departmental Intelligence grid — brand blue for performing | Task 7 |
| Open actions borderless table — red/blue only | Task 8 |
| Strategic findings — Lucide icons, sentence-case badges, no caps links | Task 9 |
| Empty state preserved | Task 4 |
| No shortforms anywhere | enforced in DEPT_DISPLAY_NAMES (Task 1) |
| No yellow/amber anywhere | enforced in deptScoreColour (Task 1) |
| No new files except dashboardUtils | ✓ |
| No new npm packages | ✓ |
| No schema changes | ✓ |

**Placeholder scan:** No TBDs, TODOs, or "similar to" references. All code blocks complete.

**Type consistency:** `ActionRow`, `CoachRow`, `AssessmentRow` defined in Task 3 and used consistently in Tasks 5–9. `DEPT_ORDER` and `DEPT_DISPLAY_NAMES` from Task 1 used throughout. `getMaturityLevel` always from `@/lib/maturityConfig`.
