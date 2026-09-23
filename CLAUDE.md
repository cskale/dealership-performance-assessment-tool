# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build

# Testing (Vitest)
npx vitest                        # Run all tests
npx vitest run                    # Run once (no watch)
npx vitest run src/__tests__/scoringEngine.test.ts  # Run single test file
npx vitest --coverage             # With coverage (80% threshold enforced)
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENABLE_AUTO_ACTIONS=true
```

## Architecture

**Stack**: React 18 + TypeScript + Vite + Supabase + Tailwind + shadcn/ui

**Path alias**: `@/` maps to `./src/`

### Provider Stack (App.tsx)

Providers are nested in this order — understand this when adding new context-dependent features:
```
QueryClientProvider (TanStack React Query)
  AuthProvider → MultiTenantProvider → LanguageProvider → RoleProvider
    → TooltipProvider → Router
```

### Routing

All app routes are under `/app/*` and protected by `ProtectedRoute`. Public routes: `/auth`, `/auth/callback`, `/methodology`, `/invite/:token`.

### Data Architecture

- **Supabase** handles auth, database (PostgreSQL with RLS), and real-time. Client is in `src/integrations/supabase/client.ts`. TypeScript types (auto-generated) are in `src/integrations/supabase/types.ts`.
- **Multi-tenancy**: Organization-scoped via `useMultiTenant`. All data queries should be scoped to the active organization.
- **RBAC**: 5 roles (Owner, Admin, Manager, Analyst, Viewer) managed via `RoleContext` and `useActiveRole`.

### Assessment Engine

The core business logic lives in `src/lib/`:
- `scoringEngine.ts` — calculates scores from questionnaire answers
- `signalEngine.ts` — generates insights/signals from scores
- `contextIntelligence.ts` — context-aware recommendations
- `kpiDefinitions.ts` — KPI metadata (355KB, largest file — treat as data, not logic)
- `actionRationaleMap.ts` — action plan templates

`src/data/questionnaire.ts` (100KB) contains all assessment questions. `src/data/actionTemplates.ts` contains action plan templates.

### State Pattern

- **Server state**: TanStack React Query (5-min stale time). New page-level data fetching goes through `useQuery`, not `useEffect` + `supabase`.
- **Routes**: page components are `lazy()`-loaded in `App.tsx` — keep new pages lazy.
- **Auth/multi-tenant/role state**: React Context with custom hooks (`useAuth`, `useMultiTenant`, `useActiveRole`)
- **Forms**: React Hook Form + Zod validation schemas in `src/lib/validationSchemas.ts`

### UI Components

Base components come from shadcn/ui (`src/components/ui/`) — don't edit these directly; re-generate via `npx shadcn@latest add <component>`. Custom components live in `src/components/`.

### Exports

- PDF: `src/lib/pdfReportGenerator.ts` (html2canvas + jsPDF)
- Excel: `src/lib/excelExportGenerator.ts` (xlsx)

## Testing

Tests live in `src/__tests__/`. The test setup is in `src/test-setup.ts`. Coverage thresholds are 80% for branches, functions, lines, and statements. Vitest uses jsdom environment.

# Project Context — Dealership Performance Assessment Tool

## Identity
- **Product**: Enterprise Dealer Diagnostic & Performance Improvement Platform
- **Target users**: Dealer principals, field coaches, OEM programme managers (BMW, Mercedes, VW-group)
- **Repo**: `cskale/dealership-performance-assessment-tool` (private, GitHub)
- **Production URL**: `https://dealership-performance-assessment-t.vercel.app`

## Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (Postgres, Auth, Edge Functions, RLS)
- **Deployment**: Vercel (auto-deploys on push to main)
- **Dev platform**: Lovable AI (UI scaffolding) + Claude Code (logic, data, DB)
- **Package manager**: npm (not bun, not yarn)

## Infrastructure IDs
- **Supabase project ID**: `xrypgosuyfdkkqafftae`
- **Supabase URL**: `https://xrypgosuyfdkkqafftae.supabase.co`
- **Vercel project ID**: `prj_mZ0wgESKAmV5MiR8UwMrtZIipTVR`
- **Vercel team ID**: `team_cdH1L9KDYd3JzW48BrxrKkQq`

## Key File Locations
- **Assessment questions**: `src/data/questionnaire.ts`
- **KPI definitions**: `src/lib/kpiDefinitions.ts`
- **Signal engine**: `src/lib/signalEngine.ts`
- **Action templates**: `src/data/actionTemplates.ts`
- **Benchmark governance**: `src/lib/benchmarkGovernance.ts`
- **Narrative templates**: `src/lib/narrativeTemplates.ts`
- **Cross-validation rules**: `src/data/crossValidationRules.ts`
- **Ceiling analysis**: `src/lib/ceilingAnalysis.ts`
- **PDF generator**: `src/lib/pdfReportGenerator.ts`
- **Active role hook**: `src/hooks/useActiveRole.tsx` — reads `actor_type` from profiles; use this for role-gating
- **Multi-tenant hook**: `src/hooks/useMultiTenant.tsx` — org-level scoping for dealer data
- **Supabase types**: `src/integrations/supabase/types.ts` — auto-generated, regenerate via Supabase MCP after schema changes
- **Edge functions**: `supabase/functions/` — CORS locked to allowlist
- **OEM dashboard**: `src/pages/OemDashboard.tsx` — live at `/app/oem-dashboard`, gated to `actor_type='oem'`
- **OEM settings**: `src/pages/OemSettings.tsx` + `src/components/OemNetworkSettings.tsx` — live at `/app/oem-settings`, gated to `actor_type='oem'`. Create network, email-lookup dealer add/remove.
- **Coach dashboard**: `src/pages/CoachDashboard.tsx` — live at `/app/coach-dashboard`, gated to `actor_type='coach'`
- **Coach action tracker**: `src/pages/CoachActions.tsx` — live at `/app/coach-actions`, gated to `actor_type='coach'`
- **Invite team members**: `src/components/InviteTeamMembers.tsx` — dealer team invites (Account → Team tab)
- **Invite coach**: `src/components/InviteCoach.tsx` — coach invites (Account → Team tab, below InviteTeamMembers)
- **Protected route**: `src/components/ProtectedRoute.tsx` — supports `requiresActorType` prop
- **Playground catalog**: `src/pages/Playground.tsx` — live at `/app/playground`, lists all calculators; each live one has its own `src/pages/*Page.tsx` built on `PlaygroundCalculatorShell`
- **Playground calculator shell**: `src/components/playground/PlaygroundCalculatorShell.tsx` — shared layout for all Playground tools
- **Playground calculator logic**: `src/lib/playgroundCalculators.ts`
- **Playground KPI mappings**: `src/data/playgroundKpiMappings.ts` — maps calculator input fields to `kpiKey`s for prefill
- **Playground prefill hook**: `src/hooks/usePlaygroundPrefill.ts` — fetches latest KPI values for mapped fields

## Role Architecture

Three actor types exist in `profiles.actor_type` enum: `'dealer' | 'coach' | 'oem' | 'internal'`

```
OEM Admin  (actor_type='oem')   →  /app/oem-dashboard — network leaderboard across all dealers
Coach      (actor_type='coach') →  /app/coach-dashboard + /app/coach-actions — assigned dealers only
Dealer     (actor_type='dealer')→  /app/dashboard — own dealership only
```

**Route gating**: `ProtectedRoute` accepts `requiresActorType="oem"|"coach"` — redirects to `/app/dashboard` if wrong type. Both dashboard pages ALSO have an internal `actorType` check for defence-in-depth.

**Sidebar**: `AppSidebar.tsx` already shows/hides OEM and Coach nav items based on `actorType`.

**Provisioning**:
- `actor_type='dealer'` — set automatically when a user accepts a dealer invite (via `accept_dealership_invite` RPC)
- `actor_type='coach'` — set when a user accepts a coach invite (sent via `InviteCoach` component → `send-invite` Edge Function → `/invite/:token` → `accept_dealership_invite` with `invite_type='coach'`)
- `actor_type='oem'` — set manually via Supabase SQL: `UPDATE profiles SET actor_type='oem' WHERE user_id='<uuid>';`

**`useActiveRole` hook**: reads `actor_type` + `memberships.role` from DB. Returns `{ actorType, uxRole, membershipRole, organizationId, dealerId, loading }`. Use `actorType` for role gating (not `uxRole` — `uxRole` can be null when `active_organization_id` is null, which is intentional for coaches).

**Known gap**: `useMultiTenant` does not handle network-level (OEM) queries — it is org-scoped only. OEM and Coach dashboards query `coach_dealership_assignments` / `dealer_network_memberships` directly, not through `useMultiTenant`.

## Database Tables

### Core assessment tables
- `assessments` — dealer assessment records, answers (jsonb), scores (jsonb), overall_score. RLS: `auth.uid() = user_id` OR coach assigned to `dealership_id`.
- `improvement_actions` — action plan items per assessment, linked by assessment_id
- `organizations` — dealer org records with business_model, brand_mode, network_structure enums
- `memberships` — user ↔ org join with role enum (owner/admin/member/viewer)
- `profiles` — user profiles: `active_organization_id`, `active_dealership_id`, `actor_type`
- `dealerships` — individual outlet records under organizations

### Network & coach tables (all have RLS)
- `oem_networks` — OEM network records (`oem_brand`, `owner_org_id`, `status`). RLS: org members of `owner_org_id` can read/write; `owner` role required to delete.
- `dealer_network_memberships` — dealership ↔ network join. RLS: scoped to owning org members.
- `coach_dealership_assignments` — coach ↔ dealership join (`coach_user_id`, `dealership_id`, `is_active`). UNIQUE constraint on `(coach_user_id, dealership_id)`. RLS: coach reads own rows; org owner/admin reads all for their dealerships.

### Invite table
- `dealership_invites` — token, invited_email, dealership_id, organization_id, membership_role, status, expires_at, `invite_type` ('dealer'|'coach'). `invite_type='coach'` invites create a `coach_dealership_assignments` row on acceptance instead of a `memberships` row.

## OEM Network Setup

OEM admins manage their network at `/app/oem-settings` (Network Settings in sidebar).

**Key files:**
- `src/components/OemNetworkSettings.tsx` — owns all state/queries; two cards: Network Details form + Dealer Roster
- `src/pages/OemSettings.tsx` — thin wrapper page

**DB functions (cross-org, SECURITY DEFINER):**
- `public.lookup_dealer_by_email(p_email)` — looks up a dealer by email across org boundaries. Guards: caller must be `actor_type='oem'` AND their org must own an active `oem_networks` row. Returns `{ found, dealership_id, dealership_name, location, organization_id }` or error.
- `public.get_dealership_details(p_ids uuid[])` — returns `[{ id, name, location }]` for a list of dealership UUIDs. Same guards. Used to load the dealer roster (cross-org JOIN to `dealerships` is blocked by RLS, so this function is the only safe way to get dealership names for the roster).
- Both call `private.caller_is_verified_oem()` as the first guard — this helper checks `actor_type='oem'` AND active network in one call.

**How it works:**
1. OEM admin fills in Network Details (name, brand, country scope) → creates/updates `oem_networks` row
2. OEM admin enters a dealer's email → system calls `lookup_dealer_by_email` → shows confirmation chip with dealer name + location
3. OEM admin selects Programme Tier (Standard/Silver/Gold/Platinum) → clicks "Add to network" → upsert into `dealer_network_memberships`
4. Dealer appears on OEM Dashboard leaderboard immediately

**Removing a dealer:** soft-delete — sets `dealer_network_memberships.is_active = false`. Dealer disappears from leaderboard. Re-adding re-activates the row via `ON CONFLICT DO UPDATE`.

## Coach Invite Flow

1. Org owner opens Account → Team tab → "Invite a Coach" card
2. Enters coach email (+ dealership picker if org has multiple dealerships)
3. `send-invite` Edge Function creates a `dealership_invites` row with `invite_type='coach'` and sends a branded email
4. Coach clicks the link → `/invite/:token` → `AcceptInvite.tsx`
5. `accept_dealership_invite` RPC detects `invite_type='coach'`:
   - Inserts `coach_dealership_assignments` row (idempotent via `ON CONFLICT DO NOTHING`)
   - Sets `profiles.actor_type = 'coach'` (only if not already 'coach')
   - Does NOT create a `memberships` row
6. `AcceptInvite.tsx` reads `invite_type` from RPC response → redirects to `/app/coach-dashboard`

## Coach Visit Loop

- Tables: `coach_visits` (scheduling + log: summary, agreed_action_ids, next_visit_date, recap_sent_at), `visit_action_reviews` (per-visit outcome for previously agreed actions: done/in_progress/blocked/not_started; a trigger syncs `improvement_actions.status`).
- RPCs: `get_visit_brief(dealership_id)` (coach, dealer members, network OEM), `get_network_coaching_stats()` (OEM only). Access guard: `private.can_view_dealership()`.
- Saving a completed visit with a summary fires a one-time in-app `visit_recap` notification to the dealer org (email pending Resend domain).
- Hooks: `src/hooks/useCoachVisitLoop.ts`. UI handoff prompts: `docs/lovable/coach-visit-loop.md`.

## Assessment Structure
- **5 departments**: New Vehicle Sales (NVS), Used Vehicle Sales (UVS), Service (SVC), Parts (PTS), Financial Operations (FIN)
- **Scoring**: 1–5 scale per question, weighted by category, normalised to 0–100
- **Weights**: defined in `CATEGORY_WEIGHTS` in scoring logic
- **Business models**: 2S (sales+service), 3S (+parts), 4S (+bodyshop) — branching not yet implemented

## Diagnostic Engine
- `signalEngine.ts` — generates signal codes from scores (CRITICAL_GAP, HIGH_PRIORITY, etc.)
- `detectSystemicPatterns()` — cross-department clustering (3+ depts = systemic, 2 = recurring)
- `calculateEnhancedMaturity()` — 5-level model, requires ≥85 AND no sub-cat below 60 for Advanced
- `confidenceInterval scoring` — implemented
- `buildExecutiveNarrative()` — 32 variants (4 maturity × 8 signals × single/systemic)
- `ACTION_TEMPLATES` — 22 templates with `relevantBusinessModels[]` and `implementationSteps[]`

`evaluateCrossValidations()` from `src/data/crossValidationRules.ts` and `generateCeilingInsights()` from `ceilingAnalysis.ts` are both computed via `useMemo` in `Results.tsx` and rendered inline (`CeilingInsightsPanel`, cross-validation alert cards).

## i18n
- EN + DE complete; FR, ES, IT incomplete.
- Two systems coexist: `src/contexts/LanguageContext.tsx` (`useLanguage()`, bulk of UI strings) and `src/lib/i18n.ts` (i18next, JSON in `src/i18n/*.json`). Add new keys where the surrounding component already reads from.
- All `oem.*` and `coach.*` i18n keys are present in EN and DE.

## Development Rules
- **Never install new npm packages** without explicit confirmation — bundle is already 1.3MB post-split
- **Never commit directly to main** for large multi-file changes — create a branch and PR
- **Lovable handles**: React/TSX component builds and UI-only changes
- **Claude Code handles**: logic files, data files, DB migrations, Edge Functions, config
- **Supabase MCP**: use for all schema changes, RLS policies, SQL migrations — never ask Lovable to write DB migrations
- **Vercel MCP**: use for deployments and environment variable management
- **Supabase types**: regenerate via `mcp__claude_ai_Supabase__generate_typescript_types` (project_id: `xrypgosuyfdkkqafftae`) after any schema change — write output to `src/integrations/supabase/types.ts`
- **actor_type gating**: always use `actorType` from `useActiveRole()`, not `uxRole` — `uxRole` is null when `active_organization_id` is null (valid for coaches)
- **Claude Code owned files** (Lovable must not edit): `src/data/questionnaire.ts`, `src/data/signalTypes.ts`, `src/data/signalMappings.ts`, `src/lib/signalEngine.ts`, `src/components/assessment/KpiQuestionInput.tsx`, `src/components/results/PerformanceDataPanel.tsx`, `src/lib/kpiCrossValidation.ts`, `src/hooks/useKpiValues.ts`, `src/lib/playgroundCalculators.ts`, `src/data/playgroundKpiMappings.ts`, `src/hooks/usePlaygroundPrefill.ts`, `src/hooks/useCoachVisitLoop.ts` — any changes require TypeScript validation and signal mapping consistency check
- **Lovable owned files** (Claude Code must not edit): `src/components/results/RadarBenchmarkChart.tsx` (radar chart with benchmark ring), `src/components/action-plan/KanbanBoard.tsx` (kanban drag-and-drop board), `src/components/ui/FreshnessBadge.tsx` (assessment freshness pill), `src/lib/assessmentFreshness.ts` (freshness utility, no scoring logic)

## Known Pitfalls

### React Hook Rules
- NEVER add useState or useEffect inside a component after a 
  conditional check. Hooks must always be declared unconditionally 
  at the top of the component body, before any if/return statements.
- Violation causes React error #300 (invalid hook call) which 
  crashes the entire page at runtime — it does NOT fail at build time.

### Missing Imports  
- ALWAYS import every UI component used in JSX (Badge, Button, 
  Tooltip, etc.). Missing imports pass TypeScript compilation but 
  throw ReferenceError crashes in the minified production bundle.
- After adding any new JSX element, verify its import exists at the 
  top of the file before committing.

### Supabase Join Syntax
- profiles!inner(field1, field2) join syntax can return profiles as 
  an array rather than an object depending on the relationship 
  direction. Prefer two separate queries with an .in() lookup when 
  joining profiles to avoid shape mismatches.

### Vitest + fake timers
- `vi.useFakeTimers()` breaks `waitFor()` from `@testing-library/react` because it mocks `setInterval` which the library uses for polling. Workaround: reorder tests so slow tests (those needing real timers) run last, and give all `waitFor()` calls an explicit `{ timeout: 3000 }`.

### KanbanBoard — HTML5 DnD
- KanbanBoard uses the HTML5 Drag and Drop API — do not replace with `@dnd-kit` or any external DnD library without a full rewrite. Status updates write directly to `improvement_actions` via `handleKanbanStatusChange` in `ActionPlan.tsx`.

### RLS Recursion (dealer_network_memberships)
- Any RLS policy that directly joins `dealer_network_memberships` inside a policy on `dealerships` or `assessments` causes infinite recursion — the policy re-evaluates itself. Always wrap such logic in a `SECURITY DEFINER` function in the `private` schema and call that from the policy instead.

### Results page memo ordering
- `useMemo`/derived values in `Results.tsx` must be declared after everything they reference. Referencing a later `const` throws a TDZ ReferenceError at runtime and blanks Results, History and Action Plans.

### Known Non-Blocking Issues
- `useOnboarding` RLS false negatives: RLS timing can make a valid `active_dealership_id` appear inaccessible on first load. The hook now logs a warning and preserves the stored value instead of nulling it — but the root cause (RLS propagation delay) is not fixed.

## Improvement Tracker
- Status and priorities: `improvement_tracker_updated.html` (open in browser). Don't duplicate status here.

## Project skills
- Engineering skills (mattpocock set + `brag`) live in `.claude/skills/`.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `cskale/dealership-performance-assessment-tool`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root (not yet created — create via the `domain-modeling` skill when first needed). See `docs/agents/domain.md`.
