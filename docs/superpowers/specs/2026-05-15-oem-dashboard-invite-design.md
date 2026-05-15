# Sprint 7 — OEM Dashboard Redesign + OEM Invite System

**Date:** 2026-05-15  
**Approach:** Extend existing invite/accept patterns (Approach 1)  
**Design style:** Match Sprint 5–6 Coach/Dealer dashboard exactly — `shadow-card rounded-xl`, `SharedLoadingState/EmptyState`, `TierBadge`, `ScoreGauge` SVG, exact maturity band hex values.

---

## Scope

Two parallel workstreams:

1. **OEM Invite System** — email-based invite flow for onboarding OEM users (no SQL required)
2. **OEM Dashboard Redesign** — tabs layout, dept weakness heatmap, at-risk list, leaderboard with tier filter + slide-in drill-down

---

## 1. OEM Invite System

### Goal

Any existing OEM admin (B) or org owner with active `oem_network` (C) can invite a new or existing user as `actor_type='oem'` via email invite. Recipient clicks link → accepts → redirected to `/app/oem-dashboard`.

### DB Migration

**File:** `supabase/migrations/<timestamp>_oem_invite_nullable_dealership.sql`

```sql
-- dealership_id is not applicable for OEM invites
ALTER TABLE dealership_invites
  ALTER COLUMN dealership_id DROP NOT NULL;
```

No other schema changes. `invite_type` column already accepts arbitrary strings.

### Edge Function: `send-invite`

Add `invite_type='oem'` branch:

- **Auth check:** Two valid caller types — (1) existing `actor_type='oem'` user with `role='owner'|'admin'` in the target org, OR (2) org `owner`/`admin` with an active `oem_network` (covers the bootstrap case where the first OEM user is being invited by an org owner who is not yet `actor_type='oem'`). Check membership role + `oem_networks` existence in the edge function directly rather than relying solely on `private.caller_is_verified_oem()` which requires `actor_type='oem'`.
- **`dealership_id` not required** when `invite_type='oem'` — skip that validation branch.
- **Email:** new `'oem'` branch in `buildInviteEmailHtml()`:
  - Subject: `"You've been invited as an OEM user for <network name>"`
  - Heading: `"You've been invited as an OEM Programme Manager"`
  - Body: `"<inviterName> has invited you to access the OEM dashboard for <network name>."`
  - CTA: `"Accept OEM Invitation"`

### RPC: `accept_dealership_invite`

Add `invite_type='oem'` branch (alongside existing `'dealer'` and `'coach'`):

```sql
WHEN invite_type = 'oem' THEN
  -- Set actor type
  UPDATE profiles SET actor_type = 'oem' WHERE user_id = auth.uid();
  -- Set active org to invite's organization_id
  UPDATE profiles SET active_organization_id = v_invite.organization_id WHERE user_id = auth.uid();
  -- No memberships row, no coach_dealership_assignments row
  RETURN jsonb_build_object('invite_type', 'oem', 'organization_id', v_invite.organization_id);
```

### UI: `InviteOemUser` component

**File:** `src/components/InviteOemUser.tsx` (new)

- Structure mirrors `InviteCoach.tsx` exactly.
- Card title: "Invite OEM User", icon: `Globe`
- Description: "OEM users can access the network dashboard and manage all enrolled dealerships."
- No dealership picker (OEM-level, not outlet-level).
- Email input + "Send OEM Invitation" button.
- Pending invites list with copy/revoke (same pattern as `InviteCoach`).
- Visibility: rendered only when `actorType === 'oem'` AND `role === 'owner' || 'admin'`.

**File:** `src/pages/OemSettings.tsx` (update)

- Import and render `<InviteOemUser />` below `<OemNetworkSettings />`.

### `AcceptInvite.tsx` (update)

Add `'oem'` to redirect switch — one line:

```tsx
case 'oem': navigate('/app/oem-dashboard'); break;
```

---

## 2. OEM Dashboard Redesign

### File Changes

| File | Action |
|------|--------|
| `src/pages/OemDashboard.tsx` | Full rewrite |
| `src/lib/oemDashboardUtils.ts` | New utility file |

### Layout

```
Header: title + network selector (existing)
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    Row 1: 4 stat cards
    Row 2: Department Weakness Heatmap
    Row 3: At-Risk Dealers alert card
  </TabsContent>

  <TabsContent value="leaderboard">
    Tier filter Select
    Leaderboard table (existing + slide-in Sheet on row click)
  </TabsContent>
</Tabs>
```

### Tab 1 — Overview

#### Stat Cards (Row 1)

Existing 4 cards — unchanged:
- Total Dealers (`Users` icon)
- Network Avg Score (`Award` icon)
- Highest Score (`ArrowUp` icon)
- Lowest Score (`ArrowDown` icon)

Same `shadow-card rounded-xl` card + `p-4` + icon in `bg-primary/10 rounded-lg`.

#### Department Weakness Heatmap (Row 2, Feature A)

```
Card: "Department Performance" — shadow-card rounded-xl
Table layout:
  Header row: [Dealer] [NVS] [UVS] [SVC] [PTS] [FIN]
  Data rows:  dealer name | score cell per dept
  Footer row: "Network avg" | avg score per dept
```

Each score cell:
- Background + text colour from existing 4-band hex values:
  - `≥85` → `bg-[#16a34a]/10 text-[#16a34a]` (Advanced)
  - `≥70` → `bg-[#2563eb]/10 text-[#2563eb]` (Performing)
  - `≥46` → `bg-[#d97706]/10 text-[#d97706]` (Developing)
  - `<46` → `bg-[#dc2626]/10 text-[#dc2626]` (Foundational)
- Score shown as integer, centred.
- `—` when no assessment.

Data source: `assessments.scores` jsonb (already fetched). Dept keys: `nvs`, `uvs`, `svc`, `pts`, `fin`.

Utility function in `oemDashboardUtils.ts`:
```ts
parseDeptScores(scoresJsonb): Record<'nvs'|'uvs'|'svc'|'pts'|'fin', number | null>
getDeptCellClass(score: number | null): string
networkAvgByDept(dealers: DealerScore[]): Record<string, number | null>
```

#### At-Risk Dealers (Row 3, Feature D)

```
Card: "At-Risk Dealers" — shadow-card rounded-xl
  If none at risk:
    SharedEmptyState variant: green checkmark icon
    "All dealers performing above Foundational threshold"
  If at-risk dealers exist:
    Alert header: "<N> dealer(s) in Foundational band (score < 46)"
    List rows per at-risk dealer:
      dealer name | location | score badge | TierBadge | "View" button
    "View" button → opens drill-down Sheet (same Sheet component)
```

Threshold: hardcoded `46` in `oemDashboardUtils.ts` as `const AT_RISK_THRESHOLD = 46`.

### Tab 2 — Leaderboard

#### Tier Filter

```tsx
<Select value={tierFilter} onValueChange={setTierFilter}>
  <SelectItem value="all">All tiers</SelectItem>
  <SelectItem value="Standard">Standard</SelectItem>
  <SelectItem value="Silver">Silver</SelectItem>
  <SelectItem value="Gold">Gold</SelectItem>
  <SelectItem value="Platinum">Platinum</SelectItem>
</Select>
```

Filters `sortedDealers` client-side. No extra query.

#### Leaderboard Table

Existing table — one change: row `onClick` opens `Sheet` instead of `navigate('/app/results/:id')`.

Add column: **Dept Weakness** — shows the single lowest-scoring dept as a coloured `Badge` (e.g. `SVC 38` in red). Gives at-a-glance weakness without opening the sheet.

#### Dealer Drill-Down Sheet

```
<Sheet open={!!selectedDealer} onOpenChange={...}>
  <SheetContent side="right" className="w-[480px] sm:w-[540px]">
    Header:
      dealer name (h2) + location (muted)
      TierBadge + ScoreGauge (reuse from CoachDashboard, size=72)
    
    Section: "Department Scores"
      5 rows: dept label | score bar (coloured) | score value
    
    Section: "Score History"
      Latest score | Previous score | Trend icon + delta
    
    Footer:
      <Button variant="outline"> Open Full Report → </Button>
        → navigate('/app/results/:latestAssessmentId')
  </SheetContent>
</Sheet>
```

Pattern mirrors `CoachNoteSheet` / `VisitSheet` exactly. `ScoreGauge` imported from `CoachDashboard` logic — extract to `src/components/shared/ScoreGauge.tsx` as shared component.

---

## Data Flow

All data already fetched in existing `useEffect` hooks. Additions:

1. `assessments` query already selects `overall_score` — extend to also select `scores` (jsonb dept breakdown).
2. Dept scores parsed client-side in `oemDashboardUtils.ts` — no new DB queries.
3. At-risk filter: `sortedDealers.filter(d => (d.latestScore ?? 100) < AT_RISK_THRESHOLD)` — pure client-side.
4. Tier filter: `sortedDealers.filter(d => tierFilter === 'all' || d.programmeTier === tierFilter)`.

---

## Regenerate Supabase Types

After migration: run `mcp__claude_ai_Supabase__generate_typescript_types` (project `xrypgosuyfdkkqafftae`) → write to `src/integrations/supabase/types.ts`.

---

## Out of Scope (Sprint 8+)

- Signal code aggregation across network (Feature B — `CRITICAL_GAP` pattern detection)
- Tier gap analysis / programme ROI chart (Feature C)
- Configurable at-risk threshold per network
- OEM sub-roles (`oem_network_admin` vs `oem_regional_viewer`)
- `/app/admin` internal panel

---

## Files Summary

| File | Change |
|------|--------|
| `supabase/migrations/<ts>_oem_invite_nullable_dealership.sql` | New — make `dealership_id` nullable |
| `supabase/functions/send-invite/index.ts` | Update — add `oem` invite type branch |
| `src/components/InviteOemUser.tsx` | New — OEM invite card |
| `src/pages/OemSettings.tsx` | Update — add `InviteOemUser` |
| `src/pages/AcceptInvite.tsx` | Update — add `oem` redirect case |
| `src/pages/OemDashboard.tsx` | Rewrite — tabs, heatmap, at-risk, drill-down |
| `src/lib/oemDashboardUtils.ts` | New — dept parsing, at-risk filter, heatmap colours |
| `src/components/shared/ScoreGauge.tsx` | New — extract from CoachDashboard, make shared |
| `src/integrations/supabase/types.ts` | Regenerate after migration |
