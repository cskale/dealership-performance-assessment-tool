# Knowledge Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/resources` and `/kpi-encyclopedia` with a unified `/app/knowledge` hub — four tabs (Recommended, KPI Encyclopedia, Learning Paths, Downloads) — where the Recommended tab surfaces resources matched to the dealer's latest assessment gaps.

**Architecture:** A new `KnowledgeHub` page hosts a shadcn/ui `Tabs` shell. The Recommended tab reads the dealer's latest completed assessment from Supabase, runs scores through `mapSignalsToResources()` (a pure scoring utility), and queries the existing `resources` table using the returned filters. The three other tabs are presentation-only reorganisations of existing data. One new DB table (`user_learning_progress`) tracks learning path progress.

**Tech Stack:** React 18, TypeScript, Vite, Supabase (Postgres + RLS), Tailwind CSS, shadcn/ui, TanStack React Query, Vitest + Testing Library.

**Owner split:** Tasks 1–6 are Claude Code (DB, logic, routing). Tasks 7–11 are Lovable (UI components). Task 12 is Claude Code (wiring). Claude Code must not edit Lovable-owned files listed in CLAUDE.md.

---

## File Map

| File | Action | Owner |
|------|--------|-------|
| `supabase/migrations/20260517120000_knowledge_hub.sql` | Create | Claude Code |
| `src/integrations/supabase/types.ts` | Regenerate after migration | Claude Code |
| `src/lib/mapSignalsToResources.ts` | Create | Claude Code |
| `src/__tests__/mapSignalsToResources.test.ts` | Create | Claude Code |
| `src/hooks/useLatestAssessment.ts` | Create | Claude Code |
| `src/App.tsx` | Modify — routing | Claude Code |
| `src/components/AppSidebar.tsx` | Modify — Reference section | Claude Code |
| `src/pages/KnowledgeHub.tsx` | Create — tab shell | Claude Code |
| `src/pages/KpiDetailPage.tsx` | Create — thin wrapper for KPIExplorer | Claude Code |
| `src/components/knowledge/RecommendedTab.tsx` | Create | Lovable |
| `src/components/knowledge/KpiEncyclopediaTab.tsx` | Create | Lovable |
| `src/components/knowledge/LearningPathsTab.tsx` | Create | Lovable |
| `src/components/knowledge/DownloadsTab.tsx` | Create | Lovable |

---

## Task 1: DB Migration — user_learning_progress table

**Files:**
- Create: `supabase/migrations/20260517120000_knowledge_hub.sql`

The `resource_type` column on `resources` is already `text` (not a Postgres enum), so no enum migration is needed — new values `'template'` and `'case_study'` just work. We only need the new progress table.

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260517120000_knowledge_hub.sql

create table if not exists public.user_learning_progress (
  user_id            uuid not null references auth.users on delete cascade,
  resource_id        uuid not null references public.resources on delete cascade,
  modules_completed  int  not null default 0,
  total_modules      int  not null default 1,
  started_at         timestamptz not null default now(),
  last_accessed_at   timestamptz not null default now(),
  primary key (user_id, resource_id)
);

alter table public.user_learning_progress enable row level security;

create policy "users manage own progress"
  on public.user_learning_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with project_id `xrypgosuyfdkkqafftae` and the SQL above.

- [ ] **Step 3: Regenerate TypeScript types**

Use `mcp__claude_ai_Supabase__generate_typescript_types` with project_id `xrypgosuyfdkkqafftae`. Write output to `src/integrations/supabase/types.ts`. Verify `user_learning_progress` appears in the generated types.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260517120000_knowledge_hub.sql src/integrations/supabase/types.ts
git commit -m "feat(db): add user_learning_progress table with RLS"
```

---

## Task 2: mapSignalsToResources utility

**Files:**
- Create: `src/lib/mapSignalsToResources.ts`
- Create: `src/__tests__/mapSignalsToResources.test.ts`

This is a pure function — no Supabase calls, no hooks. It takes department scores and returns an ordered list of gap descriptors that the Recommended tab uses to build Supabase queries.

Department keys from `scoringEngine.ts`:
- `'new-vehicle-sales'` → display: `'New Vehicle Sales'`
- `'used-vehicle-sales'` → display: `'Used Vehicle Sales'`
- `'service-performance'` → display: `'Service'`
- `'parts-inventory'` → display: `'Parts'`
- `'financial-operations'` → display: `'Financial Operations'`

Score thresholds for gap classification:
- `< 50` → `CRITICAL_GAP`
- `50–64` → `HIGH_PRIORITY`
- `65–74` → `GROWTH_OPPORTUNITY`
- `≥ 75` → healthy (excluded from Recommended tab)

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/mapSignalsToResources.test.ts
import { describe, it, expect } from 'vitest';
import { mapSignalsToResources, GapCard, DEPT_DISPLAY_NAMES } from '@/lib/mapSignalsToResources';

describe('mapSignalsToResources', () => {
  it('returns CRITICAL_GAP for score < 50', () => {
    const result = mapSignalsToResources({ 'used-vehicle-sales': 42 });
    expect(result).toHaveLength(1);
    expect(result[0].signalType).toBe('CRITICAL_GAP');
    expect(result[0].deptKey).toBe('used-vehicle-sales');
    expect(result[0].deptName).toBe('Used Vehicle Sales');
    expect(result[0].score).toBe(42);
    expect(result[0].topicFilters).toContain('used-vehicle-sales');
  });

  it('returns HIGH_PRIORITY for score 50–64', () => {
    const result = mapSignalsToResources({ 'new-vehicle-sales': 58 });
    expect(result[0].signalType).toBe('HIGH_PRIORITY');
  });

  it('returns GROWTH_OPPORTUNITY for score 65–74', () => {
    const result = mapSignalsToResources({ 'service-performance': 70 });
    expect(result[0].signalType).toBe('GROWTH_OPPORTUNITY');
  });

  it('excludes healthy departments (score >= 75)', () => {
    const result = mapSignalsToResources({ 'financial-operations': 80 });
    expect(result).toHaveLength(0);
  });

  it('orders CRITICAL_GAP before HIGH_PRIORITY before GROWTH_OPPORTUNITY', () => {
    const result = mapSignalsToResources({
      'new-vehicle-sales': 70,        // GROWTH_OPPORTUNITY
      'used-vehicle-sales': 42,       // CRITICAL_GAP
      'service-performance': 55,      // HIGH_PRIORITY
    });
    expect(result[0].signalType).toBe('CRITICAL_GAP');
    expect(result[1].signalType).toBe('HIGH_PRIORITY');
    expect(result[2].signalType).toBe('GROWTH_OPPORTUNITY');
  });

  it('returns empty array for null or empty scores', () => {
    expect(mapSignalsToResources({})).toHaveLength(0);
    expect(mapSignalsToResources(null as any)).toHaveLength(0);
  });

  it('exposes DEPT_DISPLAY_NAMES for all 5 departments', () => {
    const keys = Object.keys(DEPT_DISPLAY_NAMES);
    expect(keys).toContain('new-vehicle-sales');
    expect(keys).toContain('used-vehicle-sales');
    expect(keys).toContain('service-performance');
    expect(keys).toContain('parts-inventory');
    expect(keys).toContain('financial-operations');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/mapSignalsToResources.test.ts
```

Expected: FAIL — `mapSignalsToResources` not found.

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/mapSignalsToResources.ts

export type SignalType = 'CRITICAL_GAP' | 'HIGH_PRIORITY' | 'GROWTH_OPPORTUNITY';

export interface GapCard {
  deptKey: string;
  deptName: string;
  score: number;
  signalType: SignalType;
  topicFilters: string[];
}

export const DEPT_DISPLAY_NAMES: Record<string, string> = {
  'new-vehicle-sales': 'New Vehicle Sales',
  'used-vehicle-sales': 'Used Vehicle Sales',
  'service-performance': 'Service',
  'parts-inventory': 'Parts',
  'financial-operations': 'Financial Operations',
};

const SIGNAL_ORDER: Record<SignalType, number> = {
  CRITICAL_GAP: 0,
  HIGH_PRIORITY: 1,
  GROWTH_OPPORTUNITY: 2,
};

function classifyScore(score: number): SignalType | null {
  if (score < 50) return 'CRITICAL_GAP';
  if (score < 65) return 'HIGH_PRIORITY';
  if (score < 75) return 'GROWTH_OPPORTUNITY';
  return null;
}

export function mapSignalsToResources(
  scores: Record<string, number> | null | undefined
): GapCard[] {
  if (!scores || typeof scores !== 'object') return [];

  const cards: GapCard[] = [];

  for (const [deptKey, score] of Object.entries(scores)) {
    if (typeof score !== 'number' || isNaN(score)) continue;
    const deptName = DEPT_DISPLAY_NAMES[deptKey];
    if (!deptName) continue;

    const signalType = classifyScore(score);
    if (!signalType) continue;

    cards.push({
      deptKey,
      deptName,
      score,
      signalType,
      topicFilters: [deptKey],
    });
  }

  return cards.sort(
    (a, b) => SIGNAL_ORDER[a.signalType] - SIGNAL_ORDER[b.signalType]
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/mapSignalsToResources.test.ts
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mapSignalsToResources.ts src/__tests__/mapSignalsToResources.test.ts
git commit -m "feat(lib): add mapSignalsToResources utility with tests"
```

---

## Task 3: useLatestAssessment hook

**Files:**
- Create: `src/hooks/useLatestAssessment.ts`

Fetches the most recently completed assessment for the active dealer. Returns scores (as `Record<string, number>`), completed_at, and overall_score. Used by RecommendedTab and KpiEncyclopediaTab (for per-KPI score overlays).

- [ ] **Step 1: Write the hook**

```typescript
// src/hooks/useLatestAssessment.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveRole } from '@/hooks/useActiveRole';

export interface LatestAssessment {
  id: string;
  overallScore: number;
  departmentScores: Record<string, number>;
  completedAt: string;
}

export function useLatestAssessment() {
  const { dealerId } = useActiveRole();

  return useQuery({
    queryKey: ['latest-assessment', dealerId],
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<LatestAssessment | null> => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, overall_score, scores, completed_at')
        .eq('dealership_id', dealerId!)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // scores jsonb is stored as { 'new-vehicle-sales': 72, ... }
      const departmentScores =
        data.scores && typeof data.scores === 'object'
          ? (data.scores as Record<string, number>)
          : {};

      return {
        id: data.id,
        overallScore: data.overall_score ?? 0,
        departmentScores,
        completedAt: data.completed_at!,
      };
    },
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLatestAssessment.ts
git commit -m "feat(hooks): add useLatestAssessment for knowledge hub"
```

---

## Task 4: KnowledgeHub page shell + KPI detail page

**Files:**
- Create: `src/pages/KnowledgeHub.tsx`
- Create: `src/pages/KpiDetailPage.tsx`

The shell owns the `Tabs` component and reads the active tab from a `?tab=` URL search param so the back-button from the KPI detail view restores the correct tab.

- [ ] **Step 1: Create KnowledgeHub.tsx**

```tsx
// src/pages/KnowledgeHub.tsx
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecommendedTab } from '@/components/knowledge/RecommendedTab';
import { KpiEncyclopediaTab } from '@/components/knowledge/KpiEncyclopediaTab';
import { LearningPathsTab } from '@/components/knowledge/LearningPathsTab';
import { DownloadsTab } from '@/components/knowledge/DownloadsTab';

const VALID_TABS = ['recommended', 'kpi', 'learning', 'downloads'] as const;
type TabValue = (typeof VALID_TABS)[number];

function isValidTab(v: string | null): v is TabValue {
  return VALID_TABS.includes(v as TabValue);
}

export default function KnowledgeHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isValidTab(tabParam) ? tabParam : 'recommended';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Knowledge & Resources
        </p>
        <h1 className="text-2xl font-semibold">Knowledge Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated resources, KPI references, and learning paths matched to your dealership.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="kpi">KPI Encyclopedia</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <RecommendedTab />
        </TabsContent>
        <TabsContent value="kpi">
          <KpiEncyclopediaTab />
        </TabsContent>
        <TabsContent value="learning">
          <LearningPathsTab />
        </TabsContent>
        <TabsContent value="downloads">
          <DownloadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Create KpiDetailPage.tsx**

```tsx
// src/pages/KpiDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { KPIExplorer } from '@/components/kpi-encyclopedia/KPIExplorer';
import { useLatestAssessment } from '@/hooks/useLatestAssessment';

export default function KpiDetailPage() {
  const { kpiKey } = useParams<{ kpiKey: string }>();
  const { data: assessment } = useLatestAssessment();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/app/knowledge?tab=kpi" className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" />
          Knowledge
        </Link>
        <span>/</span>
        <span>KPI Encyclopedia</span>
        {kpiKey && (
          <>
            <span>/</span>
            <span className="text-foreground capitalize">{kpiKey.replace(/-/g, ' ')}</span>
          </>
        )}
      </nav>
      <KPIExplorer scores={assessment?.departmentScores ?? {}} initialKpiKey={kpiKey} />
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors. Note: `RecommendedTab`, `KpiEncyclopediaTab`, `LearningPathsTab`, `DownloadsTab` don't exist yet — TS will error on imports until Task 7. Temporarily create empty stub files to unblock compilation:

```bash
mkdir -p src/components/knowledge
for tab in RecommendedTab KpiEncyclopediaTab LearningPathsTab DownloadsTab; do
  echo "export function ${tab}() { return null; }" > src/components/knowledge/${tab}.tsx
done
```

Then re-run `npx tsc --noEmit` — should pass.

- [ ] **Step 4: Commit stubs + pages**

```bash
git add src/pages/KnowledgeHub.tsx src/pages/KpiDetailPage.tsx src/components/knowledge/
git commit -m "feat(pages): add KnowledgeHub shell + KpiDetailPage + tab stubs"
```

---

## Task 5: Routing — App.tsx

**Files:**
- Modify: `src/App.tsx`

Replace the two old routes (`/resources`, `/kpi-encyclopedia`) with new ones inside `/app/*`. Add redirects for the old paths.

- [ ] **Step 1: Add imports at top of App.tsx**

Add these two imports alongside the existing page imports:

```tsx
import { Navigate } from "react-router-dom";
import KnowledgeHub from "./pages/KnowledgeHub";
import KpiDetailPage from "./pages/KpiDetailPage";
```

Remove these two existing imports:
```tsx
import ResourceHub from "./pages/ResourceHub";        // DELETE
import KPIEncyclopediaPage from "./pages/KPIEncyclopediaPage"; // DELETE
```

- [ ] **Step 2: Add new routes inside the `/app/*` Routes block**

Inside the `<Routes>` nested under `<Route path="/app/*">`, add after the existing `results/:assessmentId` route:

```tsx
<Route path="knowledge" element={<KnowledgeHub />} />
<Route path="knowledge/kpi/:kpiKey" element={<KpiDetailPage />} />
```

- [ ] **Step 3: Replace old standalone routes with redirects**

Replace the existing `/resources` and `/kpi-encyclopedia` route blocks with:

```tsx
<Route path="/resources" element={<Navigate to="/app/knowledge" replace />} />
<Route path="/kpi-encyclopedia" element={<Navigate to="/app/knowledge?tab=kpi" replace />} />
```

- [ ] **Step 4: Verify TypeScript compiles and no console errors**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(routing): add /app/knowledge routes, redirect old /resources + /kpi-encyclopedia"
```

---

## Task 6: Sidebar — AppSidebar.tsx

**Files:**
- Modify: `src/components/AppSidebar.tsx`

Replace the two Reference section items with a single "Knowledge" entry. Update the import to include `GraduationCap` and remove `Database` (no longer needed).

- [ ] **Step 1: Update the import line**

Find line 8 in `src/components/AppSidebar.tsx`:
```tsx
  BarChart3, Plus, ClipboardList, CheckSquare,
  BookOpen, FileText, LogOut, Database, Globe, Users, Settings,
  ChevronLeft, ChevronRight,
```

Replace with:
```tsx
  BarChart3, Plus, ClipboardList, CheckSquare,
  GraduationCap, FileText, LogOut, Globe, Users, Settings,
  ChevronLeft, ChevronRight,
```

- [ ] **Step 2: Update the Reference section items**

Find the `sections` array Reference entry (lines 81–88):
```tsx
    {
      label: 'Reference',
      items: [
        { path: '/kpi-encyclopedia', label: 'KPI Encyclopedia', icon: Database },
        { path: '/resources', label: 'Resource Hub', icon: BookOpen },
        { path: '/methodology', label: 'Methodology', icon: FileText },
      ],
    },
```

Replace with:
```tsx
    {
      label: 'Reference',
      items: [
        { path: '/app/knowledge', label: 'Knowledge', icon: GraduationCap },
        { path: '/methodology', label: 'Methodology', icon: FileText },
      ],
    },
```

- [ ] **Step 3: Update the isActive helper to handle nested /app/knowledge routes**

The existing `isActive` function uses `location.pathname.startsWith(path)` so `/app/knowledge/kpi/lcr` will correctly highlight the "Knowledge" sidebar item — no change needed.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "feat(sidebar): consolidate Resource Hub + KPI Encyclopedia into Knowledge"
```

---

## Task 7: RecommendedTab component (Lovable)

**File:** `src/components/knowledge/RecommendedTab.tsx`

> **Lovable task.** Replace the stub. Use the data interfaces below — do not change them.

**Data interfaces Lovable must use:**

```tsx
import { useLatestAssessment } from '@/hooks/useLatestAssessment';
import { mapSignalsToResources, GapCard, SignalType } from '@/lib/mapSignalsToResources';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';
```

**Hero strip (`bg-slate-900`, min-height 180px):**
- Left: dealer name (from `useAuth().user?.email` split at `@`) + assessment date
- Dynamic headline: `"${topGap.deptName} is your highest-priority gap — ${matchedResources.length} resources matched."`
- Right: 5 department score pills (full department names, coloured red/amber/green by score band)
- Score band thresholds: `< 50` = red, `50–74` = amber, `≥ 75` = green
- `FreshnessBadge` shown at top of hero when `completedAt` is > 90 days ago
- No assessment: show neutral state with CTA to `/app/assessment`

**Gap card groups (below hero):**
- Grouped by `GapCard.deptKey`, ordered as returned by `mapSignalsToResources()`
- Signal badge colour: `CRITICAL_GAP` = red, `HIGH_PRIORITY` = amber, `GROWTH_OPPORTUNITY` = blue
- Each resource card: type chip (VIDEO/GUIDE/TEMPLATE), title, description, "why this matters" line, action CTA, bookmark icon

**Resource query (Supabase, inside RecommendedTab):**

```tsx
// For each gap card, fetch resources matching that department's topics
const { data: resources } = useQuery({
  queryKey: ['knowledge-recommended', dealerId, gapCards.map(g => g.deptKey)],
  enabled: gapCards.length > 0,
  queryFn: async () => {
    const topicFilters = gapCards.flatMap(g => g.topicFilters);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .overlaps('topics', topicFilters)
      .order('is_featured', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
```

**Resource type order within each group:** `video` → `article` / `course` / `webinar` → `tool` / `template`.

**All-healthy empty state:** shown when `mapSignalsToResources()` returns `[]`. Text: *"Your dealership is performing well across all areas."* with links to the other three tabs using `useSearchParams` to switch tab.

---

## Task 8: KpiEncyclopediaTab component (Lovable)

**File:** `src/components/knowledge/KpiEncyclopediaTab.tsx`

> **Lovable task.** Replace the stub. Use the data interfaces below.

**Data interfaces Lovable must use:**

```tsx
import { useLatestAssessment } from '@/hooks/useLatestAssessment';
import { kpiDefinitions } from '@/lib/kpiDefinitions'; // existing export
import { Link } from 'react-router-dom';
```

**Filter bar:**
- Search input, ~60% width. Filters `kpiDefinitions` by name + description client-side.
- Department filter pills: `All | New Vehicle Sales | Used Vehicle Sales | Service | Parts | Financial Operations`
- Stat strip: `Total KPIs: 61 | Departments: 5`

**KPI card grid (3-col / 2-col / 1-col):**
- Department badge: **blue** (`bg-blue-100 text-blue-700`)
- KPI name + 2-line truncated definition
- Score overlay from `assessment?.departmentScores`: display `score / 100` with a coloured dot if available; dash if no assessment
- Left border accent amber/red when score below benchmark (use `< 65` as threshold for amber, `< 50` for red)
- `"View Details →"` links to `/app/knowledge/kpi/${kpiKey}` (use `Link` from react-router-dom)

**Note:** `kpiDefinitions` in `src/lib/kpiDefinitions.ts` is 355KB — do not import the entire file inline. Import the named export `kpiDefinitions` and access `Object.entries(kpiDefinitions)` for the list.

---

## Task 9: LearningPathsTab component (Lovable)

**File:** `src/components/knowledge/LearningPathsTab.tsx`

> **Lovable task.** Replace the stub. Use the data interfaces below.

**Data interfaces Lovable must use:**

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
```

**Learning paths query (resources with `resource_type = 'course'`):**

```tsx
const { data: paths } = useQuery({
  queryKey: ['learning-paths'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('resource_type', 'course')
      .order('is_featured', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
```

**Progress query:**

```tsx
const { data: progress } = useQuery({
  queryKey: ['learning-progress', user?.id],
  enabled: !!user?.id,
  queryFn: async () => {
    const { data, error } = await supabase
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', user!.id);
    if (error) throw error;
    return data ?? [];
  },
});
```

**Progress update mutation (called when user clicks "Start" or "Continue"):**

```tsx
const queryClient = useQueryClient();
const startPath = useMutation({
  mutationFn: async (resourceId: string) => {
    const { error } = await supabase
      .from('user_learning_progress')
      .upsert({
        user_id: user!.id,
        resource_id: resourceId,
        last_accessed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,resource_id' });
    if (error) throw error;
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-progress'] }),
});
```

**Layout:**
- Featured hero card: first `is_featured=true` course. Full-width, dark overlay background, large title, Start/Resume CTA, thin progress bar if in progress.
- Active paths grid (3-col): paths where `progress` contains an entry. Show `modules_completed / total_modules` progress bar.
- All paths section below: filter tabs `All Modules / Strategic / Operational`. Map `topics[]` — if a path has `'strategic'` in topics it appears under Strategic, etc.
- Empty state (no paths started): hero still shows, add *"Start your first learning path"* prompt.

**Progress percentage helper:**
```tsx
function progressPct(resourceId: string): number {
  const entry = progress?.find(p => p.resource_id === resourceId);
  if (!entry || entry.total_modules === 0) return 0;
  return Math.round((entry.modules_completed / entry.total_modules) * 100);
}
```

---

## Task 10: DownloadsTab component (Lovable)

**File:** `src/components/knowledge/DownloadsTab.tsx`

> **Lovable task.** Replace the stub. Use the data interfaces below.

**Data interfaces Lovable must use:**

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLatestAssessment } from '@/hooks/useLatestAssessment';
import { mapSignalsToResources } from '@/lib/mapSignalsToResources';
```

**Downloads query (resource_type in 'article', 'template', 'case_study'):**

```tsx
const { data: downloads } = useQuery({
  queryKey: ['downloads'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .in('resource_type', ['article', 'template', 'case_study'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
```

**Filter state (client-side, no extra DB calls):**
```tsx
const [typeFilter, setTypeFilter] = useState<'all' | 'article' | 'template' | 'case_study'>('all');
const [deptFilter, setDeptFilter] = useState<string>('all');
const [sortOrder, setSortOrder] = useState<'recent' | 'az'>('recent');
```

Department filter maps `deptFilter` value (e.g. `'used-vehicle-sales'`) against `resource.topics.includes(deptFilter)`.

Sort:
- `'recent'` → already ordered by `created_at desc` from query
- `'az'` → `[...downloads].sort((a,b) => a.title.localeCompare(b.title))`

**Recommended Downloads strip (above main grid):**
- Shown when `assessment` exists and `gapCards.length > 0`
- Horizontally scrollable row of 3 cards: first 3 from `downloads` filtered by `gapCards[0].topicFilters`
- Collapsed / hidden when no assessment

**Download card:**
- Type badge top-right: `TEMPLATES` / `GUIDES` / `CASE STUDIES` (muted caps)
- Department icon (use `BookOpen` for all if no per-dept icon needed)
- Title + 2-line description
- Bottom row: format chip from `resource.duration` field (repurposed to store `PDF · 1.2 MB` etc.) + "Download" button linking to `resource.url`
- Featured variant: `FEATURED` badge (brand blue), subtle blue border, bullet list from `resource.description` split by `\n`

---

## Task 11: Wire tabs + smoke test

**Files:**
- Modify: `src/components/knowledge/RecommendedTab.tsx` (Lovable delivers this)
- Modify: `src/components/knowledge/KpiEncyclopediaTab.tsx` (Lovable delivers this)
- Modify: `src/components/knowledge/LearningPathsTab.tsx` (Lovable delivers this)
- Modify: `src/components/knowledge/DownloadsTab.tsx` (Lovable delivers this)

Once Lovable delivers all four tab components, remove the stubs and replace with the real files. Then:

- [ ] **Step 1: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass, coverage ≥ 80%.

- [ ] **Step 3: Start dev server and manually verify**

```bash
npm run dev
```

Manually verify:
1. Sidebar shows "Knowledge" (single item), "KPI Encyclopedia" and "Resource Hub" are gone
2. `/resources` redirects to `/app/knowledge`
3. `/kpi-encyclopedia` redirects to `/app/knowledge?tab=kpi`
4. Recommended tab shows hero strip and gap cards (or no-assessment CTA if no assessment exists)
5. KPI Encyclopedia tab shows search + card grid
6. "View Details →" navigates to `/app/knowledge/kpi/:kpiKey` and back button works
7. Learning Paths tab shows featured hero + paths
8. Downloads tab shows filter grid

- [ ] **Step 4: Commit**

```bash
git add src/components/knowledge/
git commit -m "feat(knowledge-hub): wire all four tab components"
```

---

## Task 12: Final cleanup + TypeScript types for resource_type

**Files:**
- Delete: `src/pages/ResourceHub.tsx` (after confirming nothing else imports it)
- Delete: `src/pages/KPIEncyclopediaPage.tsx` (after confirming nothing else imports it)

- [ ] **Step 1: Check for remaining imports of old pages**

```bash
grep -r "ResourceHub\|KPIEncyclopediaPage" src/ --include="*.tsx" --include="*.ts"
```

Expected: no results. If any found, update those imports.

- [ ] **Step 2: Delete old page files**

```bash
rm src/pages/ResourceHub.tsx src/pages/KPIEncyclopediaPage.tsx
```

- [ ] **Step 3: Add Resource type to local types for IDE support**

In `src/lib/mapSignalsToResources.ts`, also export the resource type union so tab components can use it:

```typescript
export type ResourceType = 'video' | 'article' | 'course' | 'webinar' | 'tool' | 'template' | 'case_study';
```

- [ ] **Step 4: Final type check + test run**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: clean compile, all tests pass.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(knowledge-hub): complete — retire ResourceHub + KPIEncyclopediaPage"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| Route `/app/knowledge` | Task 5 |
| Route `/app/knowledge/kpi/:kpiKey` | Tasks 4, 5 |
| Old routes redirect | Task 5 |
| Sidebar: single "Knowledge" item | Task 6 |
| Recommended tab — hero strip | Task 7 |
| Recommended tab — score pills | Task 7 |
| Recommended tab — gap cards ordered by signal | Tasks 2, 7 |
| Recommended tab — FreshnessBadge reuse | Task 7 |
| Recommended tab — no-assessment empty state | Task 7 |
| Recommended tab — all-healthy empty state | Tasks 2, 7 |
| KPI Encyclopedia tab — search + dept filter | Task 8 |
| KPI Encyclopedia tab — per-KPI score overlay | Tasks 3, 8 |
| KPI Encyclopedia tab — score accent borders | Task 8 |
| KPI detail breadcrumb + back button | Task 4 |
| Learning Paths tab — featured hero | Task 9 |
| Learning Paths tab — progress tracking | Tasks 1, 9 |
| Learning Paths tab — All/Strategic/Operational filter | Task 9 |
| Downloads tab — type/dept/sort filters | Task 10 |
| Downloads tab — Recommended Downloads strip | Tasks 2, 10 |
| Downloads tab — featured card variant | Task 10 |
| DB: user_learning_progress table + RLS | Task 1 |
| resource_type: 'template' + 'case_study' | Tasks 1, 10, 12 |
| Department badges — all blue | Tasks 7, 8, 9, 10 |
| Signal badge colours (CRITICAL/HIGH/GROWTH) | Task 7 |
| Hero strip — dark slate bg-slate-900 | Task 7 |
| No new npm packages | ✓ (all shadcn/ui + existing deps) |

All spec requirements covered. ✓
