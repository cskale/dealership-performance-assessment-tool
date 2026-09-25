# Results Redesign + Monthly KPI Check-ins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two-tab Results page (Diagnosis, Action Plan) backed by monthly KPI check-ins with trend + forecast, single KPI entry across assessment/check-ins/Playground, History nav removed.

**Architecture:** Claude Code builds the data layer (table, RLS, pure forecast/merge libs, React Query hooks, prefill wiring, sidebar, i18n) and a Lovable handoff doc; Lovable builds the UI consuming those hooks; Claude Code then deletes dead components and verifies.

**Tech Stack:** React 18 + TS + Vite, Supabase (Postgres/RLS/pg_cron), TanStack Query, Recharts (installed), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-25-results-redesign-design.md`

## Global Constraints

- No new npm packages.
- Colours only from `DESIGN.md`; maturity colours (red <46, amber 46–69, blue 70–84, green ≥85) encode status only.
- All new user-facing text via `t()`; keys added to all 5 dictionaries in `src/i18n/`.
- Page data via `useQuery`, 5-min staleTime.
- RLS must not join `dealer_network_memberships` directly — use `private.can_view_dealership()` / existing SECURITY DEFINER helpers.
- Schema changes via Supabase MCP (`apply_migration`, project `xrypgosuyfdkkqafftae`), migration file also committed under `supabase/migrations/`.
- Claude-owned files touched here: `src/hooks/usePlaygroundPrefill.ts`, `src/hooks/useKpiValues.ts` (read only). Lovable-owned (do not edit in Claude tasks): `RadarBenchmarkChart.tsx`, `KanbanBoard.tsx`, `FreshnessBadge.tsx`, `assessmentFreshness.ts`.
- Work on branch `feat/results-redesign`; PR to main.

## Review Focus

1. KPI with `lower-better` direction (e.g. `uvs_days_to_sale`): "on track to benchmark" must mean trending *down* to target — test in Task 3.
2. Check-in and assessment snapshot in the same month: check-in wins, no duplicate point — test in Task 4.
3. Viewer/OEM attempting a check-in write: DB rejects even if UI hides the button — SQL check in Task 1.
4. Client sends `entered_by_role: 'coach'` as a dealer: trigger overwrites to `dealer` — SQL check in Task 1.
5. Playground prefill when a check-in is newer than the last assessment: prefill uses the check-in and labels its month — test in Task 5.

---

### Task 1: `kpi_checkins` table, RLS, trigger, monthly reminder

**Files:**
- Create: `supabase/migrations/20260926090000_kpi_checkins.sql`

**Interfaces:**
- Produces: table `public.kpi_checkins(id, dealership_id, kpi_key, period_month, value, entered_by, entered_by_role, created_at, updated_at)`, UNIQUE `(dealership_id, kpi_key, period_month)`; notification type `'kpi_checkin_reminder'`; function `public.process_kpi_checkin_reminders()`; cron job `kpi-checkin-reminder`.

- [ ] **Step 1: Write the migration**

```sql
-- Monthly KPI check-ins between assessments (spec 2026-09-25 §2)
CREATE TABLE IF NOT EXISTS public.kpi_checkins (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  kpi_key         text NOT NULL,
  period_month    date NOT NULL CHECK (EXTRACT(DAY FROM period_month) = 1),
  value           numeric NOT NULL,
  entered_by      uuid NOT NULL DEFAULT auth.uid(),
  entered_by_role text NOT NULL DEFAULT 'dealer' CHECK (entered_by_role IN ('dealer','coach')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dealership_id, kpi_key, period_month)
);
CREATE INDEX IF NOT EXISTS kpi_checkins_dealer_kpi_idx
  ON public.kpi_checkins (dealership_id, kpi_key, period_month DESC);

-- Server decides who entered it; client values ignored.
CREATE OR REPLACE FUNCTION private.kpi_checkins_set_actor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.entered_by := auth.uid();
  NEW.entered_by_role := CASE
    WHEN (SELECT actor_type FROM public.profiles WHERE user_id = auth.uid()) = 'coach'
    THEN 'coach' ELSE 'dealer' END;
  NEW.updated_at := now();
  IF TG_OP = 'UPDATE' THEN NEW.created_at := OLD.created_at; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER kpi_checkins_set_actor
  BEFORE INSERT OR UPDATE ON public.kpi_checkins
  FOR EACH ROW EXECUTE FUNCTION private.kpi_checkins_set_actor();

-- Write access: active dealer member with owner/admin/member role, or assigned coach.
CREATE OR REPLACE FUNCTION private.can_write_kpi_checkin(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.user_can_access_dealership_as_coach(_dealership_id)
      OR EXISTS (
        SELECT 1 FROM public.dealerships d
        JOIN public.memberships m ON m.organization_id = d.organization_id
        WHERE d.id = _dealership_id AND m.user_id = auth.uid()
          AND m.is_active AND m.role IN ('owner','admin','member'));
$$;

CREATE OR REPLACE FUNCTION private.can_delete_kpi_checkin(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dealerships d
    JOIN public.memberships m ON m.organization_id = d.organization_id
    WHERE d.id = _dealership_id AND m.user_id = auth.uid()
      AND m.is_active AND m.role IN ('owner','admin'));
$$;

REVOKE ALL ON FUNCTION private.can_write_kpi_checkin(uuid), private.can_delete_kpi_checkin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_write_kpi_checkin(uuid), private.can_delete_kpi_checkin(uuid) TO authenticated;

ALTER TABLE public.kpi_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY kpi_checkins_select ON public.kpi_checkins FOR SELECT TO authenticated
  USING (private.can_view_dealership(dealership_id));
CREATE POLICY kpi_checkins_insert ON public.kpi_checkins FOR INSERT TO authenticated
  WITH CHECK (private.can_write_kpi_checkin(dealership_id));
CREATE POLICY kpi_checkins_update ON public.kpi_checkins FOR UPDATE TO authenticated
  USING (private.can_write_kpi_checkin(dealership_id))
  WITH CHECK (private.can_write_kpi_checkin(dealership_id));
CREATE POLICY kpi_checkins_delete ON public.kpi_checkins FOR DELETE TO authenticated
  USING (private.can_delete_kpi_checkin(dealership_id));

-- Reminder notification type
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY['stale_action','milestone','digest','coach_comment',
                           'google_review_alert','visit_recap','kpi_checkin_reminder']));

-- 1st of month: remind active org owners/admins of dealerships that have ever been assessed.
CREATE OR REPLACE FUNCTION public.process_kpi_checkin_reminders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prev_month text := to_char(date_trunc('month', now()) - interval '1 month', 'FMMonth YYYY');
BEGIN
  INSERT INTO public.notifications
    (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
  SELECT DISTINCT m.user_id, d.organization_id, 'kpi_checkin_reminder', 'in_app',
         'dealership', d.id,
         'Log your ' || prev_month || ' KPIs',
         'Add last month''s figures to keep your trend lines and projections current.'
  FROM public.dealerships d
  JOIN public.memberships m ON m.organization_id = d.organization_id
  WHERE m.is_active AND m.role IN ('owner','admin')
    AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.dealership_id = d.id);
END $$;
REVOKE ALL ON FUNCTION public.process_kpi_checkin_reminders() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('kpi-checkin-reminder', '0 7 1 * *',
                     'SELECT public.process_kpi_checkin_reminders()');
```

Before applying, confirm the constraint name: `SELECT conname FROM pg_constraint WHERE conrelid='public.notifications'::regclass AND contype='c';` — use the returned name in the DROP.

- [ ] **Step 2: Apply** via `mcp__claude_ai_Supabase__apply_migration` (name `kpi_checkins`, query = file contents).

- [ ] **Step 3: RLS checks** via `execute_sql`, each in a transaction rolled back. Pick real ids from QA accounts (`.env.test` emails → `auth.users`):

```sql
BEGIN;
SET LOCAL role authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub','<dealer_member_uuid>')::text, true);
INSERT INTO public.kpi_checkins (dealership_id,kpi_key,period_month,value,entered_by_role)
VALUES ('<dealer_dealership_uuid>','nvs_lead_response_1h_pct','2026-08-01',70,'coach')
RETURNING entered_by_role;   -- expect 'dealer'
ROLLBACK;
```
Repeat with: coach uuid (expect insert ok, role 'coach'); OEM uuid (expect RLS violation on insert, SELECT returns rows); unrelated user uuid (expect 0 rows on SELECT). A viewer-role member if one exists (expect insert RLS violation).

- [ ] **Step 4: Run advisors** `mcp__claude_ai_Supabase__get_advisors` (security) — expect no new warnings for `kpi_checkins`.

- [ ] **Step 5: Regenerate types** via `generate_typescript_types`, write to `src/integrations/supabase/types.ts`. Run `npx tsc --noEmit -p tsconfig.app.json`; expect PASS.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260926090000_kpi_checkins.sql src/integrations/supabase/types.ts
git commit -m "feat(db): kpi_checkins table, RLS, monthly reminder"
```

---

### Task 2: Tracked KPI registry

**Files:**
- Create: `src/data/trackedKpis.ts`
- Test: `src/__tests__/trackedKpis.test.ts`

**Interfaces:**
- Produces: `type DepartmentKey = 'nvs'|'uvs'|'svc'|'prt'|'fin'`; `TRACKED_KPIS: { kpiKey: string; department: DepartmentKey }[]`; `isTrackedKpi(key: string): boolean`; `trackedKpisFor(dept: DepartmentKey): string[]`.

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { TRACKED_KPIS, isTrackedKpi, trackedKpisFor } from '@/data/trackedKpis';
import { STATIC_BENCHMARKS } from '@/lib/kpiBenchmarks';

describe('TRACKED_KPIS', () => {
  it('has 10 KPIs, 2 per department, each with a benchmark', () => {
    expect(TRACKED_KPIS).toHaveLength(10);
    for (const d of ['nvs', 'uvs', 'svc', 'prt', 'fin'] as const) {
      expect(trackedKpisFor(d)).toHaveLength(2);
    }
    for (const k of TRACKED_KPIS) expect(STATIC_BENCHMARKS[k.kpiKey]).toBeDefined();
  });
  it('isTrackedKpi', () => {
    expect(isTrackedKpi('uvs_days_to_sale')).toBe(true);
    expect(isTrackedKpi('prt_backorder_days')).toBe(false);
  });
});
```

- [ ] **Step 2:** `npx vitest run src/__tests__/trackedKpis.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// Core KPI set for monthly check-ins (spec 2026-09-25 §2). All are assessment
// data questions; includes every KPI overlapping a Playground calculator.
export type DepartmentKey = 'nvs' | 'uvs' | 'svc' | 'prt' | 'fin';

export const TRACKED_KPIS: { kpiKey: string; department: DepartmentKey }[] = [
  { kpiKey: 'nvs_lead_response_1h_pct', department: 'nvs' },
  { kpiKey: 'nvs_gross_profit_per_unit', department: 'nvs' },
  { kpiKey: 'uvs_days_to_sale', department: 'uvs' },
  { kpiKey: 'uvs_gross_profit_per_unit', department: 'uvs' },
  { kpiKey: 'svc_workshop_loading_pct', department: 'svc' },
  { kpiKey: 'svc_effective_labour_rate', department: 'svc' },
  { kpiKey: 'prt_inventory_turns', department: 'prt' },
  { kpiKey: 'prt_gross_margin_pct', department: 'prt' },
  { kpiKey: 'fin_net_profit_pct', department: 'fin' },
  { kpiKey: 'fin_aftersales_gp_share_pct', department: 'fin' },
];

export const isTrackedKpi = (key: string) => TRACKED_KPIS.some((k) => k.kpiKey === key);
export const trackedKpisFor = (dept: DepartmentKey) =>
  TRACKED_KPIS.filter((k) => k.department === dept).map((k) => k.kpiKey);
```

- [ ] **Step 4:** re-run → PASS.
- [ ] **Step 5: Commit** `git add src/data/trackedKpis.ts src/__tests__/trackedKpis.test.ts && git commit -m "feat: tracked KPI registry"`

---

### Task 3: Forecast library

**Files:**
- Create: `src/lib/kpiForecast.ts`
- Test: `src/__tests__/kpiForecast.test.ts`

**Interfaces:**
- Consumes: `KpiBenchmark` from `@/lib/kpiBenchmarks`.
- Produces:
  ```ts
  interface MonthPoint { month: string /* 'YYYY-MM-01' */; value: number }
  interface Forecast {
    basedOnMonths: number;
    points: { month: string; value: number; low: number; high: number }[]; // next 3 months
    reachesTargetMonth: string | null; // first projected month meeting target, else null
    onTrack: boolean;                  // true if reachesTargetMonth !== null or already at target
  }
  function forecastKpi(history: MonthPoint[], benchmark: KpiBenchmark): Forecast | null
  ```

- [ ] **Step 1: Failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { forecastKpi } from '@/lib/kpiForecast';
import { STATIC_BENCHMARKS } from '@/lib/kpiBenchmarks';

const pts = (start: string, vals: number[]) =>
  vals.map((value, i) => {
    const d = new Date(start); d.setUTCMonth(d.getUTCMonth() + i);
    return { month: d.toISOString().slice(0, 10), value };
  });

const lead = STATIC_BENCHMARKS.nvs_lead_response_1h_pct; // higher-better, target 80, %
const days = STATIC_BENCHMARKS.uvs_days_to_sale;         // lower-better, target 45

describe('forecastKpi', () => {
  it('returns null with fewer than 3 points', () => {
    expect(forecastKpi(pts('2026-01-01', [60, 65]), lead)).toBeNull();
  });
  it('returns null if consecutive points are more than 3 months apart', () => {
    const h = [...pts('2026-01-01', [60, 62]), { month: '2026-07-01', value: 70 }];
    expect(forecastKpi(h, lead)).toBeNull();
  });
  it('projects a perfect linear trend with zero-width band', () => {
    const f = forecastKpi(pts('2026-01-01', [60, 65, 70]), lead)!;
    expect(f.basedOnMonths).toBe(3);
    expect(f.points.map((p) => p.month)).toEqual(['2026-04-01', '2026-05-01', '2026-06-01']);
    expect(f.points.map((p) => Math.round(p.value))).toEqual([75, 80, 85]);
    expect(f.points[0].high - f.points[0].low).toBeCloseTo(0);
    expect(f.reachesTargetMonth).toBe('2026-05-01');
    expect(f.onTrack).toBe(true);
  });
  it('clamps percentages to 0..100', () => {
    const f = forecastKpi(pts('2026-01-01', [80, 90, 100]), lead)!;
    for (const p of f.points) { expect(p.high).toBeLessThanOrEqual(100); expect(p.value).toBeLessThanOrEqual(100); }
  });
  it('lower-better: falling days-to-sale reaches target', () => {
    const f = forecastKpi(pts('2026-01-01', [60, 55, 50]), days)!;
    expect(f.reachesTargetMonth).toBe('2026-04-01');
    expect(f.onTrack).toBe(true);
  });
  it('lower-better: rising days-to-sale is off track', () => {
    const f = forecastKpi(pts('2026-01-01', [50, 55, 60]), days)!;
    expect(f.reachesTargetMonth).toBeNull();
    expect(f.onTrack).toBe(false);
  });
  it('uses only the last 6 points', () => {
    const f = forecastKpi(pts('2026-01-01', [0, 0, 0, 10, 20, 30, 40, 50, 60]), lead)!;
    expect(f.basedOnMonths).toBe(6);
  });
  it('non-percentage values are clamped at 0', () => {
    const f = forecastKpi(pts('2026-01-01', [3, 2, 1]), STATIC_BENCHMARKS.prt_inventory_turns)!;
    for (const p of f.points) expect(p.low).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2:** `npx vitest run src/__tests__/kpiForecast.test.ts` → FAIL.

- [ ] **Step 3: Implement**

```ts
import type { KpiBenchmark } from '@/lib/kpiBenchmarks';

export interface MonthPoint { month: string; value: number }
export interface Forecast {
  basedOnMonths: number;
  points: { month: string; value: number; low: number; high: number }[];
  reachesTargetMonth: string | null;
  onTrack: boolean;
}

const monthIndex = (m: string) => { const d = new Date(m); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
const monthFromIndex = (i: number) =>
  new Date(Date.UTC(Math.floor(i / 12), i % 12, 1)).toISOString().slice(0, 10);

// ponytail: OLS line + ±1σ residual band over ≤6 months. Seasonal model once ≥12 months are common.
export function forecastKpi(history: MonthPoint[], benchmark: KpiBenchmark): Forecast | null {
  const h = [...history].sort((a, b) => monthIndex(a.month) - monthIndex(b.month)).slice(-6);
  if (h.length < 3) return null;
  const xs = h.map((p) => monthIndex(p.month));
  for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 3) return null;

  const n = h.length;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = h.reduce((s, p) => s + p.value, 0) / n;
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (h[i].value - my), 0) / sxx;
  const at = (x: number) => my + slope * (x - mx);
  const sd = Math.sqrt(h.reduce((s, p, i) => s + (p.value - at(xs[i])) ** 2, 0) / n);

  const max = benchmark.unit === '%' ? 100 : Infinity;
  const clamp = (v: number) => Math.min(max, Math.max(0, v));
  const meets = (v: number) =>
    benchmark.direction === 'higher-better' ? v >= benchmark.target : v <= benchmark.target;

  const last = xs[n - 1];
  const points = [1, 2, 3].map((k) => {
    const v = at(last + k);
    return { month: monthFromIndex(last + k), value: clamp(v), low: clamp(v - sd), high: clamp(v + sd) };
  });
  const reachesTargetMonth = points.find((p) => meets(p.value))?.month ?? null;
  return { basedOnMonths: n, points, reachesTargetMonth, onTrack: meets(h[n - 1].value) || reachesTargetMonth !== null };
}
```

- [ ] **Step 4:** re-run → PASS.
- [ ] **Step 5: Commit** `git add src/lib/kpiForecast.ts src/__tests__/kpiForecast.test.ts && git commit -m "feat: KPI linear forecast"`

---

### Task 4: KPI timeline merge + hooks

**Files:**
- Create: `src/lib/kpiTimeline.ts` (pure merge)
- Create: `src/hooks/useKpiTimeline.ts` (queries + save mutation)
- Test: `src/__tests__/kpiTimeline.test.ts`

**Interfaces:**
- Consumes: `AssessmentKpiValue` from `@/hooks/useKpiValues`; `forecastKpi`, `MonthPoint` from Task 3.
- Produces:
  ```ts
  type TimelineSource = 'assessment' | 'checkin-dealer' | 'checkin-coach';
  interface TimelinePoint { month: string; value: number; source: TimelineSource; enteredAt: string }
  interface CheckinRow { kpi_key: string; period_month: string; value: number; entered_by_role: 'dealer'|'coach'; updated_at: string }
  interface SnapshotRow { kpi_key: string; value: number | null; skipped: boolean; assessment_created_at: string }
  function mergeTimeline(kpiKey: string, checkins: CheckinRow[], snapshots: SnapshotRow[]): TimelinePoint[]
  function toMonth(iso: string): string // 'YYYY-MM-01'
  function useKpiTimelines(dealershipId: string | null | undefined): UseQueryResult<Record<string, TimelinePoint[]>> // all tracked KPIs, one query pair
  function useSaveKpiCheckin(dealershipId: string | null | undefined): UseMutationResult<void, Error, { kpiKey: string; month: string; value: number }>
  ```
  Query key `['kpi-timelines', dealershipId]`; mutation invalidates it and `['latest-kpi-value', dealershipId]`.

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { mergeTimeline, toMonth } from '@/lib/kpiTimeline';

describe('mergeTimeline', () => {
  const k = 'nvs_lead_response_1h_pct';
  it('check-in wins over assessment in same month; sorted ascending', () => {
    const r = mergeTimeline(
      k,
      [{ kpi_key: k, period_month: '2026-07-01', value: 72, entered_by_role: 'coach', updated_at: '2026-08-02T00:00:00Z' },
       { kpi_key: k, period_month: '2026-08-01', value: 74, entered_by_role: 'dealer', updated_at: '2026-09-01T00:00:00Z' }],
      [{ kpi_key: k, value: 67, skipped: false, assessment_created_at: '2026-07-27T10:00:00Z' },
       { kpi_key: k, value: 60, skipped: false, assessment_created_at: '2026-04-10T10:00:00Z' }],
    );
    expect(r.map((p) => [p.month, p.value, p.source])).toEqual([
      ['2026-04-01', 60, 'assessment'],
      ['2026-07-01', 72, 'checkin-coach'],
      ['2026-08-01', 74, 'checkin-dealer'],
    ]);
  });
  it('ignores skipped/null snapshots and other KPIs', () => {
    const r = mergeTimeline(k, [], [
      { kpi_key: k, value: null, skipped: true, assessment_created_at: '2026-07-27T10:00:00Z' },
      { kpi_key: 'x', value: 5, skipped: false, assessment_created_at: '2026-07-27T10:00:00Z' },
    ]);
    expect(r).toEqual([]);
  });
  it('toMonth', () => expect(toMonth('2026-07-27T23:59:00Z')).toBe('2026-07-01'));
});
```

- [ ] **Step 2:** run → FAIL.

- [ ] **Step 3: Implement `src/lib/kpiTimeline.ts`**

```ts
export type TimelineSource = 'assessment' | 'checkin-dealer' | 'checkin-coach';
export interface TimelinePoint { month: string; value: number; source: TimelineSource; enteredAt: string }
export interface CheckinRow { kpi_key: string; period_month: string; value: number; entered_by_role: 'dealer' | 'coach'; updated_at: string }
export interface SnapshotRow { kpi_key: string; value: number | null; skipped: boolean; assessment_created_at: string }

export const toMonth = (iso: string) => `${iso.slice(0, 7)}-01`;

export function mergeTimeline(kpiKey: string, checkins: CheckinRow[], snapshots: SnapshotRow[]): TimelinePoint[] {
  const byMonth = new Map<string, TimelinePoint>();
  for (const s of snapshots) {
    if (s.kpi_key !== kpiKey || s.skipped || s.value === null) continue;
    const month = toMonth(s.assessment_created_at);
    const prev = byMonth.get(month);
    if (!prev || prev.enteredAt < s.assessment_created_at)
      byMonth.set(month, { month, value: s.value, source: 'assessment', enteredAt: s.assessment_created_at });
  }
  for (const c of checkins) {
    if (c.kpi_key !== kpiKey) continue;
    byMonth.set(c.period_month, { month: c.period_month, value: Number(c.value), source: `checkin-${c.entered_by_role}`, enteredAt: c.updated_at });
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}
```

- [ ] **Step 4: Implement `src/hooks/useKpiTimeline.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TRACKED_KPIS } from '@/data/trackedKpis';
import { mergeTimeline, type CheckinRow, type SnapshotRow, type TimelinePoint } from '@/lib/kpiTimeline';

const KEYS = TRACKED_KPIS.map((k) => k.kpiKey);

export function useKpiTimelines(dealershipId: string | null | undefined) {
  return useQuery({
    queryKey: ['kpi-timelines', dealershipId],
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, TimelinePoint[]>> => {
      const [checkins, snaps] = await Promise.all([
        supabase.from('kpi_checkins')
          .select('kpi_key, period_month, value, entered_by_role, updated_at')
          .eq('dealership_id', dealershipId!).in('kpi_key', KEYS),
        supabase.from('assessment_kpi_values')
          .select('kpi_key, value, skipped, assessments!inner(created_at)')
          .eq('dealership_id', dealershipId!).in('kpi_key', KEYS),
      ]);
      if (checkins.error) throw checkins.error;
      if (snaps.error) throw snaps.error;
      const snapshots: SnapshotRow[] = (snaps.data ?? []).map((r: any) => ({
        kpi_key: r.kpi_key, value: r.value, skipped: r.skipped,
        assessment_created_at: r.assessments.created_at,
      }));
      return Object.fromEntries(
        KEYS.map((k) => [k, mergeTimeline(k, (checkins.data ?? []) as CheckinRow[], snapshots)]),
      );
    },
  });
}

export function useSaveKpiCheckin(dealershipId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ kpiKey, month, value }: { kpiKey: string; month: string; value: number }) => {
      if (!dealershipId) throw new Error('No dealership selected');
      const { error } = await supabase.from('kpi_checkins').upsert(
        { dealership_id: dealershipId, kpi_key: kpiKey, period_month: month, value },
        { onConflict: 'dealership_id,kpi_key,period_month' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kpi-timelines', dealershipId] });
      qc.invalidateQueries({ queryKey: ['latest-kpi-value', dealershipId] });
    },
  });
}
```

- [ ] **Step 5:** `npx vitest run src/__tests__/kpiTimeline.test.ts` → PASS; `npx tsc --noEmit -p tsconfig.app.json` → PASS.
- [ ] **Step 6: Commit** `git add src/lib/kpiTimeline.ts src/hooks/useKpiTimeline.ts src/__tests__/kpiTimeline.test.ts && git commit -m "feat: KPI timeline merge and check-in hooks"`

---

### Task 5: Latest value from check-ins for Playground + assessment prefill

**Files:**
- Modify: `src/hooks/useKpiValues.ts` (`fetchLatestKpiValue`)
- Test: `src/__tests__/fetchLatestKpiValue.test.ts`

**Interfaces:**
- Produces: `fetchLatestKpiValue(dealershipId, kpiKey): Promise<LatestKpiValue | null>` unchanged signature; `LatestKpiValue` gains `source: 'assessment' | 'checkin'`. When a check-in's month ≥ the latest assessment's month, returns a synthetic `row` with `value` from the check-in and `assessmentCreatedAt = period_month`. `usePlaygroundPrefill` needs no change (uses `assessmentCreatedAt` for the chip month).

- [ ] **Step 1: Failing test** (mock supabase per `src/__tests__/saveKpiAnswers.test.ts` pattern — read that file first and copy its `vi.mock('@/integrations/supabase/client', ...)` shape)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const results: Record<string, any> = {};
vi.mock('@/integrations/supabase/client', () => {
  const chain = (table: string) => {
    const c: any = {};
    for (const m of ['select', 'eq', 'order', 'limit']) c[m] = () => c;
    c.maybeSingle = async () => results[table];
    return c;
  };
  return { supabase: { from: (t: string) => chain(t) } };
});

import { fetchLatestKpiValue } from '@/hooks/useKpiValues';

describe('fetchLatestKpiValue', () => {
  beforeEach(() => { for (const k in results) delete results[k]; });
  it('prefers a newer check-in', async () => {
    results.assessment_kpi_values = { data: { value: 67, kpi_key: 'k', assessments: { created_at: '2026-07-27T10:00:00Z' } }, error: null };
    results.kpi_checkins = { data: { value: 74, period_month: '2026-08-01' }, error: null };
    const r = await fetchLatestKpiValue('d', 'k');
    expect(r?.row.value).toBe(74);
    expect(r?.source).toBe('checkin');
    expect(r?.assessmentCreatedAt).toBe('2026-08-01');
  });
  it('falls back to assessment when no check-in', async () => {
    results.assessment_kpi_values = { data: { value: 67, kpi_key: 'k', assessments: { created_at: '2026-07-27T10:00:00Z' } }, error: null };
    results.kpi_checkins = { data: null, error: null };
    const r = await fetchLatestKpiValue('d', 'k');
    expect(r?.row.value).toBe(67);
    expect(r?.source).toBe('assessment');
  });
});
```

- [ ] **Step 2:** run → FAIL.

- [ ] **Step 3: Implement** — replace `fetchLatestKpiValue` and `LatestKpiValue` in `src/hooks/useKpiValues.ts`:

```ts
export interface LatestKpiValue {
  row: AssessmentKpiValue;
  /** Date the value applies to: assessment created_at, or check-in period_month */
  assessmentCreatedAt: string;
  source: 'assessment' | 'checkin';
}

export async function fetchLatestKpiValue(dealershipId: string, kpiKey: string): Promise<LatestKpiValue | null> {
  const [snap, checkin] = await Promise.all([
    supabase.from('assessment_kpi_values')
      .select('*, assessments!inner(created_at)')
      .eq('dealership_id', dealershipId).eq('kpi_key', kpiKey).eq('skipped', false)
      .order('created_at', { referencedTable: 'assessments', ascending: false })
      .limit(1).maybeSingle(),
    supabase.from('kpi_checkins')
      .select('value, period_month')
      .eq('dealership_id', dealershipId).eq('kpi_key', kpiKey)
      .order('period_month', { ascending: false })
      .limit(1).maybeSingle(),
  ]);
  if (snap.error) throw snap.error;
  if (checkin.error) throw checkin.error;

  const s = snap.data as (AssessmentKpiValue & { assessments: { created_at: string } }) | null;
  const c = checkin.data as { value: number; period_month: string } | null;
  const snapMonth = s ? s.assessments.created_at.slice(0, 7) : '';

  if (c && c.period_month.slice(0, 7) >= snapMonth) {
    const base = s ? (({ assessments, ...r }) => r)(s) : ({ kpi_key: kpiKey, dealership_id: dealershipId } as AssessmentKpiValue);
    return { row: { ...base, value: Number(c.value) } as AssessmentKpiValue, assessmentCreatedAt: c.period_month, source: 'checkin' };
  }
  if (!s) return null;
  const { assessments, ...row } = s;
  return { row: row as AssessmentKpiValue, assessmentCreatedAt: assessments.created_at, source: 'assessment' };
}
```

- [ ] **Step 4:** run new test + `npx vitest run src/__tests__` → all PASS (existing Playground prefill tests must still pass).
- [ ] **Step 5: Commit** `git add src/hooks/useKpiValues.ts src/__tests__/fetchLatestKpiValue.test.ts && git commit -m "feat: latest KPI value prefers newer check-in"`

---

### Task 6: Assessment KPI questions prefill from latest value

**Files:**
- Modify: `src/pages/Assessment.tsx` (around `kpiAnswers` state, line ~25)
- Test: `src/__tests__/assessmentKpiPrefill.test.ts`

**Interfaces:**
- Consumes: `fetchLatestKpiValue` (Task 5).
- Produces: `prefillKpiAnswers(existing: Record<string, KpiAnswerState>, latest: Record<string, number | null>): Record<string, KpiAnswerState>` exported from `src/lib/kpiAnswerPersistence.ts` — fills only keys not already answered.

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { prefillKpiAnswers } from '@/lib/kpiAnswerPersistence';

describe('prefillKpiAnswers', () => {
  it('fills unanswered keys only, never overwrites', () => {
    const r = prefillKpiAnswers({ a: { value: 5, skipped: false } }, { a: 9, b: 7, c: null });
    expect(r).toEqual({ a: { value: 5, skipped: false }, b: { value: 7, skipped: false } });
  });
});
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** in `src/lib/kpiAnswerPersistence.ts`:

```ts
export function prefillKpiAnswers(
  existing: Record<string, KpiAnswerState>,
  latest: Record<string, number | null>,
): Record<string, KpiAnswerState> {
  const out = { ...existing };
  for (const [k, v] of Object.entries(latest)) {
    if (v !== null && !(k in out)) out[k] = { value: v, skipped: false };
  }
  return out;
}
```

In `Assessment.tsx`, after the dealership id is known and before the user answers, add (hooks at top of component, unconditional):

```ts
const prefilledRef = useRef(false);
useEffect(() => {
  if (prefilledRef.current || !dealershipId) return;
  prefilledRef.current = true;
  const keys = allDataQuestions.map((q) => q.kpiKey);
  Promise.all(keys.map((k) => fetchLatestKpiValue(dealershipId, k).catch(() => null)))
    .then((res) => {
      const latest = Object.fromEntries(keys.map((k, i) => [k, res[i]?.row.value ?? null]));
      setKpiAnswers((prev) => prefillKpiAnswers(prev, latest));
    });
}, [dealershipId, allDataQuestions]);
```
Read `Assessment.tsx` first to find the actual variable holding the active dealership id (`useOnboarding`/profile `active_dealership_id`) and use it for `dealershipId`; import `useRef` and `fetchLatestKpiValue`.

- [ ] **Step 4:** `npx vitest run` → PASS; `npm run build` → PASS.
- [ ] **Step 5: Commit** `git add src/lib/kpiAnswerPersistence.ts src/pages/Assessment.tsx src/__tests__/assessmentKpiPrefill.test.ts && git commit -m "feat: prefill assessment KPI answers from latest values"`

---

### Task 7: Remove History nav; assessment list hook for header picker

**Files:**
- Modify: `src/components/AppSidebar.tsx:78`
- Create: `src/hooks/useDealershipAssessments.ts`

**Interfaces:**
- Produces: `useDealershipAssessments(dealershipId): UseQueryResult<{ id: string; completed_at: string | null; created_at: string; overall_score: number | null }[]>` newest first, `status = 'completed'`. Query key `['dealership-assessments', dealershipId]`.

- [ ] **Step 1:** Delete the line `{ path: '/app/results', label: t('nav.history'), icon: ClipboardList },` in `AppSidebar.tsx`. Remove `ClipboardList` from imports if now unused.
- [ ] **Step 2: Create hook**

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDealershipAssessments(dealershipId: string | null | undefined) {
  return useQuery({
    queryKey: ['dealership-assessments', dealershipId],
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from('assessments')
        .select('id, completed_at, created_at, overall_score')
        .eq('dealership_id', dealershipId!).eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
```

- [ ] **Step 3:** `npm run lint && npx tsc --noEmit -p tsconfig.app.json` → PASS.
- [ ] **Step 4: Commit** `git add src/components/AppSidebar.tsx src/hooks/useDealershipAssessments.ts && git commit -m "feat: drop History nav, add assessment list hook"`

---

### Task 8: i18n keys

**Files:** `src/i18n/en.ts`, `de.ts`, and the other three dictionaries in `src/i18n/`.

- [ ] **Step 1:** Add these keys to `en.ts` (and translated equivalents to all four others; DE given, others translate):

| key | en | de |
|---|---|---|
| `results.tab.diagnosis` | Diagnosis | Diagnose |
| `results.tab.actionPlan` | Action Plan | Maßnahmenplan |
| `results.hero.biggestLever` | Biggest lever | Größter Hebel |
| `results.hero.coverage` | {assessed} of 5 departments assessed · {answered}/{total} questions | {assessed} von 5 Bereichen bewertet · {answered}/{total} Fragen |
| `results.hero.readNarrative` | Read full narrative | Vollständige Analyse lesen |
| `results.dept.notAssessed` | Not assessed — include in next assessment | Nicht bewertet – in nächste Bewertung aufnehmen |
| `results.picker.label` | Assessment | Bewertung |
| `kpi.logMonth` | Log {month} | {month} erfassen |
| `kpi.trendUnlocks` | Trend unlocks after 2 check-ins | Trend ab 2 Erfassungen verfügbar |
| `kpi.projectionBasis` | Projection based on {n} months | Prognose auf Basis von {n} Monaten |
| `kpi.onTrack` | On track to reach benchmark by {month} | Auf Kurs, Benchmark bis {month} zu erreichen |
| `kpi.offTrack` | Off track to reach benchmark | Benchmark wird voraussichtlich nicht erreicht |
| `kpi.enteredByCoach` | Entered by coach | Vom Coach erfasst |
| `kpi.saveAsCheckin` | Save as {month} check-in | Als Erfassung für {month} speichern |
| `kpi.saved` | KPI saved | KPI gespeichert |

Check how existing keys with placeholders are formatted in `en.ts` (grep `{` in the file) and match that syntax.

- [ ] **Step 2:** run existing i18n completeness test if present (`npx vitest run src/__tests__ -t i18n`) → PASS.
- [ ] **Step 3: Commit** `git add src/i18n && git commit -m "i18n: results redesign and KPI check-in keys"`

---

### Task 9: Lovable handoff doc + send

**Files:**
- Create: `docs/lovable/results-redesign.md`

- [ ] **Step 1: Write the doc** containing, verbatim from spec §1, §3, §4: layout of Diagnosis tab (hero band three zones, department rows, excellence gaps), Action Plan visual changes, colour rules, and this hook contract:

```
useKpiTimelines(dealershipId) -> Record<kpiKey, TimelinePoint[]>   (src/hooks/useKpiTimeline.ts)
useSaveKpiCheckin(dealershipId).mutate({ kpiKey, month:'YYYY-MM-01', value })
forecastKpi(points, STATIC_BENCHMARKS[kpiKey]) -> Forecast | null  (src/lib/kpiForecast.ts)
trackedKpisFor(dept) -> kpiKey[]                                     (src/data/trackedKpis.ts)
useDealershipAssessments(dealershipId) -> header picker list
Benchmarks: STATIC_BENCHMARKS / loadBenchmarks() in src/lib/kpiBenchmarks.ts
Labels: KPI_LABELS in src/lib/kpiDefinitions.ts
i18n keys: results.* and kpi.* (Task 8)
```

Plus explicit rules: do not edit Claude-owned files (list from CLAUDE.md); do not change Action Plan behaviour (search, filters, List/Kanban/Roadmap, Add/Edit, overdue, progress); hide "Log" button when `actorType === 'oem'` or membership role `viewer`; Playground calculators touching a tracked KPI get a "Save as {month} check-in" button calling `useSaveKpiCheckin` (fields: reverse-sales-funnel/marketing-roi/sales-velocity `avgGrossProfitPerUnit` → `nvs_gross_profit_per_unit`; tech-utilization `effectiveLabourRate` → `svc_effective_labour_rate` and output `utilizationPct` → `svc_workshop_loading_pct`; vehicle-stock-turn output `avgDaysInStock` → `uvs_days_to_sale`); remove `DepartmentHeatmap`, `CausalChainDiagram`, Key Diagnostic Findings, Department Performance cards, Score Breakdown bar, Gap Analysis table, Maturity tab, Development Roadmap, top 4 tiles from `Results.tsx`; keep `useMemo`s in `Results.tsx` declared after what they reference.

- [ ] **Step 2: Commit** `git add docs/lovable/results-redesign.md && git commit -m "docs: Lovable handoff for results redesign"`; push branch `git push -u origin feat/results-redesign`.
- [ ] **Step 3: Human checkpoint** — ask the user before sending to Lovable (consumes credits). On approval, `mcp__lovable__send_message` to the existing connected project (never create a new one) with the doc content, `plan_mode=true` first.

---

### Task 10: Post-Lovable cleanup + verification

**Files:** delete unused `src/components/results/DepartmentHeatmap.tsx`, `CausalChainDiagram.tsx`, `ScoreDecomposition.tsx` and any other component with zero importers after Lovable's change.

- [ ] **Step 1:** Pull Lovable's commits. For each candidate: `grep -rn "<ComponentName>" src` → delete only if no importers (including `pdfReportGenerator.ts`).
- [ ] **Step 2:** Verify Lovable followed rules: `git diff main --stat -- src/data/questionnaire.ts src/lib/signalEngine.ts src/hooks/useKpiTimeline.ts src/lib/kpiForecast.ts` → empty.
- [ ] **Step 3:** `npx vitest run && npm run lint && npm run build` → all PASS.
- [ ] **Step 4:** `npm run dev` then `python scripts/qa_click_through.py http://localhost:8080 <scratchpad>/qa` → no page errors for dealer/coach/OEM; view screenshots of Results for each role. Confirm: 2 tabs, no History nav, OEM sees no Log button, coach can log.
- [ ] **Step 5:** Log changes in `docs/enhancement-log.md`; commit `chore: remove dead results components`; open PR with `gh pr create`.
