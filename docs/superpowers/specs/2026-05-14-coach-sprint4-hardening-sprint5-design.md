# Coach Sprint 4 Hardening + Sprint 5 Design

**Date:** 2026-05-14  
**Author:** C Kale  
**Status:** Approved

---

## Context

Coach actor type exists in the system (`profiles.actor_type = 'coach'`) but the coach experience is broken and incomplete. This spec covers:

1. **Sprint 4 Hardening** — fix known bugs before adding features
2. **Sprint 5 Features** — multi-OEM grouping, visit scheduling, notes polish, resource panel
3. **Security fix** — privilege escalation via `profiles.actor_type` (already applied: `20260514000000_fix_profiles_actor_type_escalation.sql`)

Out of scope (Sprint 6): assessment templates / OEM-specific question weighting.

---

## Sprint 4 Hardening

### Bugs to Fix

| # | Bug | Root Cause | Fix | File(s) |
|---|-----|-----------|-----|---------|
| 1 | `action_audit_log` 403 | Client calls Supabase REST directly | Remove client insert; DB trigger only | Wherever client insert lives |
| 2 | ActionSheet PATCH body serialisation | `new_value` sent as URL-encoded query param | Fix `.update()` call to pass JSON body | ActionSheet component |
| 3 | `DialogContent` missing `DialogTitle` | Accessibility violation | Add `<DialogTitle className="sr-only">` to each dialog | Multiple dialogs |
| 4 | Coach sees dealer Dashboard in sidebar | No actorType guard on `/app/dashboard` nav item | Hide when `actorType === 'coach'` | `AppSidebar.tsx:61-70` |
| 5 | "View Results" broken for coach | `Results.tsx` query uses `.eq('user_id', user.id)` — blocks coach | Remove that filter when `routeAssessmentId` is present | `Results.tsx:72` |
| 6 | Coach auto-lands on dealer dashboard | No redirect on `/app/dashboard` for coaches | Add redirect: if `actorType === 'coach'` → navigate to `/app/coach-dashboard` | `Dashboard.tsx` |

**Estimated effort:** 1 day.

---

## Sprint 5 Features

### DB Schema Changes

**New table: `coach_visits`**

```sql
create table public.coach_visits (
  id               uuid primary key default gen_random_uuid(),
  coach_user_id    uuid references auth.users(id) not null,
  dealership_id    uuid references public.dealerships(id) not null,
  visit_date       date not null,
  status           text not null default 'proposed'
                     check (status in ('proposed','confirmed','cancelled','completed')),
  visit_notes      text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
```

**New column: `coach_notes.note_type`**

```sql
alter table public.coach_notes
  add column note_type text check (note_type in ('observation','action','follow-up'));
-- nullable, backward compatible
```

**No new tables needed for:** multi-OEM grouping (join existing tables), resource panel (client-side only).

---

### RLS: `coach_visits`

**Coach — full CRUD on own rows:**
```sql
create policy "coach_visits_coach_all" on public.coach_visits
  for all
  using (coach_user_id = auth.uid())
  with check (coach_user_id = auth.uid());
```

**Dealer — read + limited update (confirm/cancel only, no insert):**
```sql
create policy "coach_visits_dealer_select" on public.coach_visits
  for select
  using (
    dealership_id = (
      select active_dealership_id from public.profiles
      where user_id = auth.uid() and active_dealership_id is not null
    )
  );

create policy "coach_visits_dealer_update" on public.coach_visits
  for update
  using (
    dealership_id = (
      select active_dealership_id from public.profiles
      where user_id = auth.uid() and active_dealership_id is not null
    )
  )
  with check (status in ('confirmed', 'cancelled'));
```

**OEM — read-only for their network dealers:**
```sql
create policy "coach_visits_oem_select" on public.coach_visits
  for select
  using (
    dealership_id in (
      select dnm.dealership_id
      from public.dealer_network_memberships dnm
      join public.oem_networks on on.id = dnm.network_id
      where on.owner_org_id = (
        select active_organization_id from public.profiles
        where user_id = auth.uid()
      )
      and dnm.is_active = true
    )
  );
```

---

### Feature 1: Multi-OEM Grouping

**What changes:**
- `AssignedDealer` interface gains `networks: { id: string; name: string; brand: string }[]`
- Dashboard fetch adds join: `dealer_network_memberships` → `oem_networks`
- New `networkTabs` derived state: unique networks across all assigned dealers + "All Networks"
- New `activeNetworkId` state (default `'all'`)
- `filteredDealers` respects `activeNetworkId` before sort/status filter
- Stats bar recalculates for selected network only
- Score trend chart respects active network filter
- Actions section also filters by active network

**Tab strip renders above dealer cards:**
```
[ All Networks ]  [ BMW Network ]  [ Audi Tier 1 ]
```

Dealers with no network membership appear under "All Networks" only (not hidden).

---

### Feature 2: Visit Scheduling

**Flow:**
1. Coach clicks calendar icon on dealer card → `VisitSheet` opens
2. Coach picks date + optional note → "Propose Visit" → insert `coach_visits` row (`status='proposed'`)
3. Dealer sees "Upcoming Visit" banner on `/app/dashboard` — date, coach name, Confirm / Cancel buttons
4. Dealer confirms → UPDATE `status='confirmed'`
5. OEM dealer card shows "Next audit: 15 Jun ✓" (read-only)

**Edge case — new proposal while one is pending:**
Coach can only have one `proposed` or `confirmed` visit per dealership at a time. Enforce with unique partial index:
```sql
create unique index coach_visits_one_active_per_dealer
  on public.coach_visits (coach_user_id, dealership_id)
  where status in ('proposed', 'confirmed');
```
If coach wants to change date: they must cancel existing visit first, or system auto-cancels previous proposed visit on new insert (handled in `VisitSheet` logic).

**New component: `VisitSheet`**
- shadcn `Sheet` + `Calendar` (both already in project — no new packages)
- Shows: date picker, note field, status of current active visit, list of past visits
- Coach owned file

**UI touchpoints:**

| Location | Element |
|---|---|
| Coach dealer card | Next visit date chip + calendar icon button |
| `VisitSheet` | Full scheduling interface |
| Dealer `/app/dashboard` | "Your next coaching visit" banner with confirm button |
| OEM dealer card | "Next audit: DD Mon" read-only chip |

---

### Feature 3: Notes Polish

**Changes to `CoachNoteSheet`:**
- Add `note_type` selector (`observation` / `action` / `follow-up`) — stored in new `coach_notes.note_type` column
- Add delete button on each note (coach only — RLS already allows)

**Changes to notes feed in `CoachDashboard`:**
- Show `note_type` badge next to dealer badge in feed rows

---

### Feature 4: Resource Reference Panel

**New tab in `CoachDashboard`** — "Resources" (5th tab after existing sections).

Two sub-sections:

**KPI Reference**
- Searchable list sourced from `kpiDefinitions.ts`
- Shows: KPI name, definition, benchmark range, why it matters
- No DB — pure client-side

**Action Playbooks**
- Filter by department (NVS / UVS / SVC / PTS / FIN)
- Lists action templates from `actionTemplates.ts` with implementation steps
- No DB — pure client-side

Sidebar "Resources" at `/resources` remains dealer-facing `ResourceHub`. Coach resource panel is a tab inside `CoachDashboard`, not a separate route.

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Option A (additive) chosen over workspace redesign | Preserves existing coach dashboard structure, no new routes, ships faster |
| `coach_visits` separate table (not field on assignments) | Visit has its own lifecycle (proposed → confirmed → completed), needs RLS per stakeholder type, and will accumulate history |
| Assessment templates deferred to Sprint 6 | Add/remove questions breaks score comparability across dealers. Template approach (Option A: category weighting) needs its own spec |
| No new npm packages | Bundle already 1.3MB post-split |

---

## Files Owned by Claude Code (Sprint 5)

- `supabase/migrations/20260514000001_coach_visits_table.sql`
- `supabase/migrations/20260514000002_coach_notes_note_type.sql`
- `src/components/coach/VisitSheet.tsx` (new)
- `src/pages/CoachDashboard.tsx` (extend)
- `src/pages/Dashboard.tsx` (add coach redirect + visit banner)
- `src/components/AppSidebar.tsx` (hide Dashboard for coach)
- `src/pages/Results.tsx` (fix coach results access)
- `src/integrations/supabase/types.ts` (regenerate after migrations)

## Files Owned by Lovable (Sprint 5)

None — all changes are logic/data layer.
