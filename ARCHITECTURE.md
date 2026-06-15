# Architecture — Dealer Diagnostic Platform

**Last updated:** 2 June 2026  
**Stack:** React 18 · TypeScript · Vite · Supabase · Tailwind CSS · shadcn/ui · Vercel

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Application Layer](#2-application-layer)
3. [Provider and Context Stack](#3-provider-and-context-stack)
4. [Routing Architecture](#4-routing-architecture)
5. [Multi-Tenancy Model](#5-multi-tenancy-model)
6. [Actor Type and Authorisation System](#6-actor-type-and-authorisation-system)
7. [Assessment Engine](#7-assessment-engine)
8. [Database Architecture](#8-database-architecture)
9. [Row Level Security Strategy](#9-row-level-security-strategy)
10. [Edge Functions](#10-edge-functions)
11. [Real-Time Architecture](#11-real-time-architecture)
12. [Notification System](#12-notification-system)
13. [File Ownership Model](#13-file-ownership-model)
14. [Build and Deployment](#14-build-and-deployment)
15. [Known Constraints and Limitations](#15-known-constraints-and-limitations)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL CDN                                    │
│  React SPA (static assets)  ·  Serverless edge                       │
│  Build: Vite + TypeScript   ·  Auto-deploy on push to main           │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE PROJECT                                │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Auth (GoTrue)   │  │  PostgreSQL 15   │  │  Edge Functions  │  │
│  │  JWT issuance    │  │  RLS-enforced    │  │  Deno runtime    │  │
│  │  OAuth / Email   │  │  All app data    │  │  send-invite     │  │
│  └──────────────────┘  └────────┬─────────┘  │  notify-dispatch │  │
│                                  │ Realtime   │  action-token    │  │
│  ┌──────────────────┐            │ channels   │  send-notif      │  │
│  │  Storage         │  ┌─────────▼────────┐  └──────────────────┘  │
│  │  (future use)    │  │  Realtime engine │                         │
│  └──────────────────┘  └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘

External services:
  Resend (transactional email)
  Clearbit (OEM brand logo images — no API key, public CDN)
```

The frontend is a fully client-side React SPA. It communicates directly with Supabase using the `@supabase/supabase-js` client. There is no intermediary backend API layer — all data access goes through Supabase's PostgREST API (for database queries) and Edge Functions (for privileged operations).

---

## 2. Application Layer

### Key Directories

```
src/
├── __tests__/          Unit tests (Vitest + jsdom)
├── assets/             Static assets (SVG icons)
├── components/         React components
│   ├── ui/             shadcn/ui base components — do not edit directly
│   ├── coach/          Coach portal components (DealerPanel, VisitSheet, etc.)
│   ├── oem/            OEM portal components
│   ├── action-plan/    Kanban, ActionSheet, ActivityFeed
│   ├── results/        Results page components (RadarChart, etc.)
│   ├── kpi-encyclopedia/ KPI deep-dive components
│   └── ...
├── contexts/           React Context providers (Auth, MultiTenant, Language, Role)
├── data/               Static data files (questionnaire, action templates, signal types)
├── docs/               Internal documentation (benchmark methodology)
├── hooks/              Custom React hooks
├── integrations/
│   └── supabase/
│       ├── client.ts   Supabase client singleton
│       └── types.ts    Auto-generated TypeScript types from DB schema
├── lib/                Business logic (scoring, signals, KPIs, PDF, Excel)
├── pages/              Route-level page components
└── ...

supabase/
├── functions/          Deno Edge Functions
│   ├── _templates/     React Email TSX components (shared across functions)
│   ├── send-invite/    Invite email sender
│   ├── notify-dispatcher/ Email notification relay
│   ├── send-notification/ Single notification sender
│   └── action-token-update/ One-click email action updater
└── migrations/         Timestamped SQL migration files
```

### Supabase Client

Single client instance at `src/integrations/supabase/client.ts`. Initialised with anon key. The client is safe to use directly in components — RLS enforces data isolation. Do not create additional client instances.

---

## 3. Provider and Context Stack

Providers are nested in this strict order in `App.tsx`. The order matters — each layer depends on the one above it.

```
QueryClientProvider (TanStack React Query — server state, 5-min stale time)
  └─ AuthProvider (src/contexts/AuthContext.tsx)
       └─ MultiTenantProvider (src/contexts/MultiTenantContext.tsx)
            └─ LanguageProvider (src/contexts/LanguageContext.tsx)
                 └─ RoleProvider (src/contexts/RoleContext.tsx)
                      └─ TooltipProvider (shadcn/ui)
                           └─ BrowserRouter
                                └─ Routes
```

### AuthProvider

Manages Supabase Auth session. Exposes `{ user, session, loading }` via `useAuth()`. Handles `onAuthStateChange` subscription. All providers below it depend on `user.id`.

### MultiTenantProvider

Manages the active organisation and dealership context. Reads `profiles.active_organization_id` and `profiles.active_dealership_id`. Exposes `{ organizationId, dealershipId, organizationName, ... }` via `useMultiTenant()`.

**Important limitation:** `useMultiTenant` is org-scoped only. It does NOT handle network-level (OEM/coach) queries. OEM and Coach portals query `coach_dealership_assignments` / `dealer_network_memberships` directly, not through `useMultiTenant`.

### RoleProvider

Reads `actor_type` and `memberships.role` from DB. Exposes `{ actorType, uxRole, membershipRole, organizationId, dealerId, loading }` via `useActiveRole()`. This is the primary hook for role-gating — always use `actorType`, not `uxRole` (uxRole can be null for coaches, which is intentional).

### LanguageProvider

Provides `{ language, setLanguage, t }` via `useLanguage()`. Reads from `src/contexts/LanguageContext.tsx` (44KB — full EN + DE translations). Language is persisted in `localStorage`.

---

## 4. Routing Architecture

All application routes are under `/app/*` and protected by `ProtectedRoute`.

```
/                        → Redirect to /app/dashboard (if authenticated) or /auth
/auth                    → AuthPage (login / signup)
/auth/callback           → OAuth callback handler
/methodology             → Public methodology page
/invite/:token           → AcceptInvite — public invite acceptance page

/app/*                   → ProtectedRoute (requires authenticated session)
  /app/dashboard         → Dealer dashboard
  /app/assessment        → Assessment flow
  /app/assessment/:id    → Resume assessment
  /app/results/:id       → Assessment results
  /app/actions           → Action plan (Kanban + Roadmap)
  /app/knowledge         → Knowledge Hub (unified resource centre)
  /app/knowledge/kpi/:key → KPI deep-dive
  /app/account           → Account settings + team management
  /app/coach-dashboard   → Coach portal (requiresActorType="coach")
  /app/coach-actions     → Coach action tracker (requiresActorType="coach")
  /app/oem-dashboard     → OEM network dashboard (requiresActorType="oem")
  /app/oem-settings      → OEM network management (requiresActorType="oem")
```

### ProtectedRoute

`src/components/ProtectedRoute.tsx` handles:
1. Redirect to `/auth` if not authenticated
2. Optional `requiresActorType="oem"|"coach"` prop — redirects to `/app/dashboard` if wrong actor type
3. Loading state while auth resolves

Actor-gated pages also have an internal `actorType` check as defence-in-depth (the route guard alone is not the only layer).

---

## 5. Multi-Tenancy Model

The platform uses a hierarchical multi-tenancy model with three levels:

```
Organization (org)
    └── Dealership (outlet)
         └── Assessment (diagnostic run)
              └── ImprovementActions (action plan items)
```

### Organisation

Top-level tenant. A dealer group may have one `organization` with multiple `dealerships`. An OEM network may span multiple organisations (via `dealer_network_memberships`).

```sql
organizations (
  id            uuid PRIMARY KEY,
  name          text,
  business_model text,  -- '2S' | '3S' | '4S'
  brand_mode    text,
  network_structure text
)
```

### Dealership

Individual outlet. Multiple dealerships can belong to one organisation. Each dealer user has an `active_dealership_id` in their profile.

```sql
dealerships (
  id              uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations,
  name            text,
  location        text,
  brand           text
)
```

### Memberships

Maps users to organisations with a role.

```sql
memberships (
  user_id         uuid REFERENCES auth.users,
  organization_id uuid REFERENCES organizations,
  role            text  -- 'owner' | 'admin' | 'member' | 'viewer'
)
```

### Data Scoping Pattern

Every Supabase query in the application is scoped by one of:
- `dealership_id = profile.active_dealership_id` (dealer context)
- `dealership_id IN (SELECT dealership_id FROM coach_dealership_assignments WHERE coach_user_id = auth.uid())` (coach context)
- `dealership_id IN (SELECT dealership_id FROM dealer_network_memberships WHERE network_id = ...)` (OEM context — via SECURITY DEFINER)

---

## 6. Actor Type and Authorisation System

### Actor Types

`profiles.actor_type` is an enum with four values:

```
'dealer'   — franchise dealer staff; access own org only
'coach'    — OEM field coach; access assigned dealerships only
'oem'      — OEM programme manager; access all dealers in their network
'internal' — internal admin (reserved)
```

### Actor Type Provisioning

| Actor | How set | Notes |
|-------|---------|-------|
| `dealer` | On invite acceptance via `accept_dealership_invite` RPC | Default for all new users accepting a dealer invite |
| `coach` | On invite acceptance via `accept_dealership_invite` RPC (invite_type='coach') | Also creates `coach_dealership_assignments` row |
| `oem` | On invite acceptance via `accept_dealership_invite` RPC (invite_type='oem') | Requires inviting org to own an active `oem_networks` row |
| `internal` | Manual SQL | Not exposed in UI |

### Privilege Escalation Prevention

`actor_type` cannot be changed via direct client calls. The `profiles` UPDATE policy includes a `WITH CHECK` clause that prevents any client-side modification of `actor_type`. Changes are only permitted through named SECURITY DEFINER RPCs (`accept_dealership_invite`).

### Role vs Actor Type

Two distinct concepts:
- `actor_type` — which portal the user belongs to (dealer / coach / oem)
- `memberships.role` — within-org permission level (owner / admin / member / viewer)

`useActiveRole()` returns both. Use `actorType` for portal gating; use `membershipRole` for within-org feature gating (e.g. only org owners can invite coaches).

---

## 7. Assessment Engine

The assessment engine is a pure client-side computation. No server round-trip is needed for scoring — all logic runs in the browser after loading the assessment answers from Supabase.

### Data Flow

```
questionnaire.ts     →   Assessment questions (100KB)
        │
        ▼
User completes assessment (61 questions, 1–5 Likert scale)
        │
        ▼
scoringEngine.ts     →   Calculates scores
  - Per-question weighted scores
  - Per-category aggregation
  - Per-department normalisation (0–100)
  - Overall composite score
  - Confidence interval calculation
        │
        ▼
signalEngine.ts      →   Generates diagnostic signals
  - CRITICAL_GAP / HIGH_PRIORITY / GROWTH_OPPORTUNITY / STRENGTH per dept
  - detectSystemicPatterns() — cross-dept clustering
  - calculateEnhancedMaturity() — 5-level model
  - buildExecutiveNarrative() — 32 variants
        │
        ▼
contextIntelligence.ts → Context-aware recommendations
  - Business model awareness (2S/3S/4S)
  - Confidence variance warnings
        │
        ▼
actionRationaleMap.ts  → Action plan generation
  - Maps signals to ACTION_TEMPLATES
  - 22 templates with implementation steps
  - 30/60/90-day time horizon assignment
  - relevantBusinessModels[] filtering
```

### Key Files

| File | Responsibility | Size |
|------|---------------|------|
| `src/data/questionnaire.ts` | 61-question data structure | 100KB |
| `src/lib/scoringEngine.ts` | Scoring calculation | — |
| `src/lib/signalEngine.ts` | Signal detection and pattern analysis | — |
| `src/lib/kpiDefinitions.ts` | 111 KPI definitions with benchmarks | 355KB |
| `src/data/actionTemplates.ts` | 22 action templates | — |
| `src/data/signalTypes.ts` | Signal type constants | — |
| `src/data/signalMappings.ts` | Question → signal mappings | — |
| `src/lib/contextIntelligence.ts` | Context-aware recommendation layer | — |
| `src/lib/narrativeTemplates.ts` | 32 executive narrative variants | — |
| `src/lib/benchmarkGovernance.ts` | Benchmark validation | — |
| `src/lib/crossValidationRules.ts` | Cross-department validation (partially wired) | — |
| `src/lib/ceilingAnalysis.ts` | Ceiling analysis (not yet rendered in UI) | — |

### Scoring Model

```
Question score:    1–5 user-selected value × question weight
Category score:    Σ(question scores) / Σ(max scores) × 100
Department score:  Σ(category scores × CATEGORY_WEIGHTS[dept][category]) / Σ(weights) × 100
Overall score:     Weighted mean of department scores (equal weights currently)
```

Score band thresholds (canonical — all components must use exactly these):
```
Foundational:  score < 46
Developing:    score >= 46 AND score < 70
Performing:    score >= 70 AND score < 85
Advanced:      score >= 85
Leading:       score >= 85 AND all sub-categories >= 60
```

### Unwired Components (Not Yet Called)

- `evaluateCrossValidations()` in `crossValidationRules.ts` — not called from signalEngine
- `generateCeilingInsights()` in `ceilingAnalysis.ts` — not rendered on Results page

---

## 8. Database Architecture

### Core Tables

```
assessments
  id, dealership_id, user_id, organization_id
  answers (jsonb — question_id → value)
  scores  (jsonb — dept_id → score)
  overall_score, status ('in_progress' | 'completed')
  created_at, completed_at

improvement_actions
  id, assessment_id, dealership_id, organization_id
  action_title, description, status ('Open' | 'In Progress' | 'Completed')
  priority ('Critical' | 'High' | 'Medium' | 'Low')
  department, responsible, target_completion_date
  stale_nudge_sent_at, last_status_updated_at
  token_nonce (UNIQUE), token_expires_at

organizations        — top-level tenant
memberships          — user ↔ org join, role
dealerships          — individual outlets
profiles             — user profile: active_organization_id, active_dealership_id, actor_type
```

### Network and Coach Tables

```
oem_networks
  id, owner_org_id, oem_brand, status, name, country_scope

dealer_network_memberships
  network_id, dealership_id, is_active, programme_tier
  UNIQUE (network_id, dealership_id)

coach_dealership_assignments
  coach_user_id, dealership_id, is_active
  UNIQUE (coach_user_id, dealership_id)

coach_visits
  coach_user_id, dealership_id, visit_date, status, visit_type, notes
  Partial UNIQUE index: one active visit per coach+dealer pair
```

### Communication and Activity Tables

```
dealership_invites
  token (UUID), invited_email, dealership_id, organization_id
  membership_role, status, expires_at, invite_type ('dealer' | 'coach' | 'oem')

coach_notes
  coach_user_id, dealership_id, assessment_id, action_id
  note_text, note_type ('observation' | 'action' | 'follow-up')

action_comments
  action_id, user_id, comment_text
  RLS: org members + assigned coaches can read; own comments only to delete

action_audit_log
  action_id, changed_by, field_changed, old_value, new_value
  Populated by trigger trg_improvement_action_audit (AFTER INSERT/UPDATE on improvement_actions)
  Never written by client code — trigger only
```

### Notification Tables

```
notifications
  user_id, type, entity_type, entity_id, message, is_read, created_at

notification_preferences
  user_id, email_enabled, weekly_digest, stale_nudge, milestone, coach_comment
```

### Knowledge Tables

```
resources
  title, type ('article' | 'template' | 'case_study' | 'course')
  topics[] (text array — matched against department names for gap recommendations)
  url, description

user_learning_progress
  (user_id, resource_id) — composite PK
  progress (integer 0–100), completed_at
```

### Security Definer Functions

Cross-org operations that cannot be performed via standard RLS policies:

| Function | Schema | Purpose |
|----------|--------|---------|
| `lookup_dealer_by_email(p_email)` | public | OEM admin finds a dealer by email (cross-org). Returns `{ found, dealership_id, dealership_name, location }`. Guards: caller must be `actor_type='oem'` AND own an active `oem_networks` row. |
| `get_dealership_details(p_ids uuid[])` | public | Returns `[{ id, name, location }]` for a list of dealership UUIDs. Same guards. Used to populate the OEM roster (cross-org JOIN to `dealerships` blocked by RLS). |
| `accept_dealership_invite(p_token)` | public | Validates invite token, sets actor_type, creates memberships or coach assignments based on `invite_type`. |
| `caller_is_verified_oem()` | private | Guard function: checks `actor_type='oem'` AND active network ownership in one call. Used by all cross-org RPCs. |
| `user_is_member_of_network_owner(network_id)` | private | RLS helper for `dealer_network_memberships` policies. |
| `user_is_admin_of_network_owner(network_id)` | private | RLS helper for delete/modify operations on network membership. |

---

## 9. Row Level Security Strategy

### Principles

1. **Every table has RLS enabled** — no exceptions in production.
2. **RLS is the authorisation layer** — the application layer adds convenience checks (redirects, hidden UI), but RLS is the actual enforcement.
3. **Cross-table joins inside policies cause infinite recursion** — always use SECURITY DEFINER functions in the `private` schema for cross-table guards.
4. **Deny by default** — if no policy matches, access is denied. Policies are additive grants, not restrictions.
5. **Test both grant AND deny cases** — RLS silent failures (returns empty rows, not an error) are the most common source of data bugs.

### Policy Patterns

```sql
-- Simple user-scoped (most common)
CREATE POLICY "users_own_rows" ON table_name
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Org-scoped via memberships
CREATE POLICY "org_members_read" ON table_name
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

-- Actor type gated (coach read own assignments)
CREATE POLICY "coach_reads_own_assignments" ON coach_dealership_assignments
  FOR SELECT TO authenticated
  USING (coach_user_id = auth.uid());

-- UPDATE with WITH CHECK (prevents field tampering)
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    actor_type = (SELECT actor_type FROM profiles WHERE user_id = auth.uid())
    -- Prevents client from changing their own actor_type
  );

-- Cross-org via SECURITY DEFINER guard (OEM networks)
CREATE POLICY "oem_reads_network_memberships" ON dealer_network_memberships
  FOR SELECT TO authenticated
  USING (private.user_is_member_of_network_owner(network_id));
```

### RLS Recursion Protection

The following pairs of tables have RLS policies that could cause infinite recursion if they reference each other directly:
- `oem_networks` ↔ `dealer_network_memberships`
- `dealerships` ↔ `dealer_network_memberships`

Solution: all cross-reference logic is wrapped in `private.user_is_member_of_network_owner()` and `private.user_is_admin_of_network_owner()`. These functions use `SET LOCAL` to avoid re-entering the RLS evaluation loop.

---

## 10. Edge Functions

Edge Functions run on Deno in the Supabase Edge Runtime. All functions use `verify_jwt = true` unless documented otherwise.

### Function Inventory

| Function | Auth | Purpose |
|----------|------|---------|
| `send-invite` | `verify_jwt=true` | Validates org ownership + dealership membership, creates `dealership_invites` row, sends branded invite email via Resend |
| `notify-dispatcher` | `verify_jwt=true` | Notification hub: receives structured notification payloads, routes to in-app or email, validates recipient email before dispatch |
| `send-notification` | `verify_jwt=true` | Single notification sender (used by cron jobs via service role) |
| `action-token-update` | `verify_jwt=false` | Public endpoint for one-click email action updates. HMAC-SHA-256 signed single-use tokens, 72h expiry, validates nonce before writing |

### Email Templates

React Email components (Deno-compatible TSX) in `supabase/functions/_templates/`:

| Template | Used by |
|----------|---------|
| `BaseEmail.tsx` | Wrapper for all emails (brand header, footer) |
| `StaleActionEmail.tsx` | Stale action nudge with one-click buttons |
| `WeeklyDigestEmail.tsx` | Monday digest: stat tiles + top 3 actions |
| `MilestoneEmail.tsx` | Progress milestone: progress bar + CTA |
| `CoachCommentEmail.tsx` | Coach commentary notification (reserved) |

Templates import React Email via `esm.sh` — zero frontend bundle impact.

### CORS

All functions lock CORS to an explicit origin allowlist. `Access-Control-Allow-Origin: *` is never used in production functions.

---

## 11. Real-Time Architecture

The platform uses Supabase Realtime for bidirectional live updates between dealer and coach views.

### Active Subscriptions

| Component | Table | Channel type | Filter |
|-----------|-------|-------------|--------|
| `ActionPlan.tsx` | `improvement_actions` | postgres_changes (UPDATE) | `assessment_id = <current assessment>` |
| `CoachActions.tsx` | `improvement_actions` | postgres_changes (UPDATE) | None (all assigned dealer assessments) |
| `ActionActivityFeed.tsx` | `action_comments` | postgres_changes (INSERT) | `action_id = <current action>` |
| Notification bell | `notifications` | postgres_changes (INSERT) | `user_id = <current user>` |
| `Dashboard.tsx` (visit banner) | `coach_visits` | postgres_changes (UPDATE) | `dealership_id = <active dealership>` |

### Subscription Pattern

```ts
// Standard pattern — channel must be explicitly removed on unmount
const channel = supabase
  .channel(`actions-${assessmentId}`)
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'improvement_actions',
      filter: `assessment_id=eq.${assessmentId}` },
    (payload) => {
      queryClient.invalidateQueries(['actions', assessmentId]);
    }
  )
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

### Bidirectional Sync

When a dealer updates an action status via the Kanban board, `ActionPlan.tsx` writes to Supabase. The `CoachActions.tsx` subscription fires immediately — the coach sees the update without refreshing. The reverse is also true: coach edits in `ActionSheet` propagate to the dealer's `ActionPlan.tsx` in real time.

---

## 12. Notification System

### Architecture

```
DB event (action update / coach note / etc.)
    │
    ▼
pg_cron (scheduled: 08:00 UTC daily, 07:00 UTC Monday)
    │    — OR —
DB trigger (notify_on_coach_comment AFTER INSERT on coach_notes)
    │
    ▼
process_stale_actions() / send_weekly_digests()   [SECURITY DEFINER functions]
    │
    ├─── INSERT into notifications (in-app)
    │         │
    │         └─── Supabase Realtime → notification bell updates live
    │
    └─── HTTP call to send-notification Edge Function
              │
              └─── Resend API → branded email

One-click email reply (stale actions only):
    email → [Mark In Progress] / [Mark Complete] button
           → action-token-update Edge Function
           → HMAC token validation + nonce check
           → UPDATE improvement_actions
           → HTML confirmation page
```

### Notification Types

| Type | Trigger | Email? |
|------|---------|--------|
| `stale_action` | pg_cron daily: action without update past threshold | Yes |
| `weekly_digest` | pg_cron Monday 07:00 UTC | Yes |
| `coach_comment` | DB trigger on `coach_notes` INSERT | Planned |
| `milestone` | (reserved) | Planned |

### User Preferences

`notification_preferences` table allows per-user toggles for: `email_enabled`, `weekly_digest`, `stale_nudge`, `milestone`, `coach_comment`. The `send_weekly_digests()` and `process_stale_actions()` functions respect these preferences before sending.

---

## 13. File Ownership Model

The project uses a two-tool model (Lovable AI for UI, Claude Code for logic). See [CONTRIBUTING.md](CONTRIBUTING.md) for the full ownership table and rationale.

**Summary:**

| Owner | Files | Rule |
|-------|-------|------|
| Claude Code | `src/data/questionnaire.ts`, `src/data/signalTypes.ts`, `src/data/signalMappings.ts`, `src/lib/signalEngine.ts`, all `supabase/` | Lovable must not edit |
| Lovable | `src/components/results/RadarBenchmarkChart.tsx`, `src/components/action-plan/KanbanBoard.tsx`, `src/components/ui/FreshnessBadge.tsx`, `src/lib/assessmentFreshness.ts` | Claude Code must not edit |
| Shared | All other `src/pages/`, `src/components/`, `src/hooks/` | Coordinate before overlapping edits |

---

## 14. Build and Deployment

### Build Pipeline

```bash
npm run build    # Vite production build → dist/
                 # TypeScript compilation (strict)
                 # Tree-shaking + code splitting
                 # Current bundle: ~1.3MB post-split
```

### Deployment

Vercel is connected to the `main` branch. Every push to `main` triggers:
1. `npm run build` on Vercel's build infrastructure
2. Deployment to CDN if build succeeds
3. Production URL: `https://dealership-performance-assessment-t.vercel.app`

No staging environment exists currently. Feature branches can be previewed via Vercel preview deployments (automatic for PRs).

### Environment Variables

Set in Vercel project settings. Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENABLE_AUTO_ACTIONS`

Edge Function secrets set in Supabase project:
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### Testing

```bash
npx vitest run            # 186 tests, ~10s
npx vitest --coverage     # 80% thresholds enforced
npm run lint              # ESLint
```

---

## 15. Known Constraints and Limitations

### Assessment Engine

- `evaluateCrossValidations()` in `crossValidationRules.ts` is implemented but not called from signalEngine. Cross-validation insights are not surfaced in the current UI.
- `generateCeilingInsights()` in `ceilingAnalysis.ts` is implemented but not rendered on the Results page.
- Score delta / trajectory requires a DB design for historical snapshots (`assessments` currently does not store point-in-time snapshots in a queryable format). This is tracker item #36.

### Multi-Tenancy

- `useMultiTenant` is org-scoped only. It does not handle network-level (OEM) queries. OEM and Coach portals query network tables directly.
- Coach users have no `memberships` row (intentional) — `active_organization_id` is null for coaches. This means `useMultiTenant` returns null context for coaches. Do not use `useMultiTenant` in coach-gated views.

### DMS Integration

No DMS integration exists. All assessment answers are user-entered. KPI pre-fill from CDK/Reynolds/Kerridge DMS systems is a future roadmap item requiring separate architecture work.

### Scalability

- Current architecture is tested for networks up to ~500 dealers. Beyond this, `dealer_network_memberships` RLS policy evaluation may require query optimisation.
- Assessment engine scoring is client-side; no server load from concurrent assessments.
- Realtime subscriptions are per-user. High concurrent user count on the same channel (e.g. 50 coaches viewing the same dealer simultaneously) has not been load-tested.

### Bundle Size

The production bundle is ~1.3MB post-split. `kpiDefinitions.ts` (355KB) and `questionnaire.ts` (100KB) are the largest files — they are loaded on demand for the relevant pages. No new npm packages should be added without explicit justification.

### Known Non-Blocking Issues (as of June 2026)

| Issue | Impact | Status |
|-------|--------|--------|
| `useOnboarding` RLS false negatives on first load | Hook logs warning and preserves stored value; root cause is RLS propagation delay | Accepted / low priority |
| `DialogContent` without `DialogTitle` in some dialogs | React accessibility warning in dev; no functional impact | Backlog |
| `action_audit_log` 403 on direct client inserts | By design — inserts go via trigger; no data loss | Accepted |
