# Contributing Guide — Dealer Diagnostic Platform

**Last updated:** 2 June 2026

This project uses a two-tool development model. Read the entire guide before making changes — particularly the [File Ownership](#4-file-ownership) and [Known Pitfalls](#10-known-pitfalls) sections. Violating file ownership or hook rules can break the entire application at runtime without a compile-time warning.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Two-Tool Development Model](#2-two-tool-development-model)
3. [Branch and Commit Strategy](#3-branch-and-commit-strategy)
4. [File Ownership](#4-file-ownership)
5. [Environment Setup](#5-environment-setup)
6. [Coding Standards](#6-coding-standards)
7. [Testing Requirements](#7-testing-requirements)
8. [Database Changes](#8-database-changes)
9. [Edge Function Deployment](#9-edge-function-deployment)
10. [Known Pitfalls](#10-known-pitfalls)
11. [Pull Request Checklist](#11-pull-request-checklist)
12. [Getting Help](#12-getting-help)

---

## 1. Quick Start

```bash
# Clone and install
git clone https://github.com/cskale/dealership-performance-assessment-tool
cd dealership-performance-assessment-tool
npm install

# Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ENABLE_AUTO_ACTIONS

# Start dev server (port 8080)
npm run dev

# Run tests
npx vitest run

# Lint
npm run lint
```

---

## 2. Two-Tool Development Model

This project is built and maintained using two AI tools with **distinct, non-overlapping responsibilities**. Understanding this model is essential before making any changes.

### Lovable AI

**Role:** UI/UX scaffolding, component layout, visual styling  
**Trigger:** Every Lovable prompt must begin with `DESIGN SYSTEM: Follow DESIGN.md v4.1 exactly.`  
**Access:** [lovable.dev](https://lovable.dev) — connects to this repository  

Lovable is used for:
- React/TSX component creation and visual redesigns
- Tailwind CSS class adjustments
- UI-only changes with no business logic
- shadcn/ui component additions

**Lovable must not be asked to:**
- Write Supabase migrations or modify database schema
- Write or deploy Edge Functions
- Modify scoring or signal engine logic
- Edit the files listed in [§4 File Ownership — Claude Code Owned](#claude-code-owned)

### Claude Code (AI CLI)

**Role:** Business logic, data layer, database migrations, Edge Functions  
**Access:** Claude Code CLI (`claude` command) or this repository's Claude session  

Claude Code is used for:
- `src/lib/` scoring, signal, and context intelligence logic
- `src/data/` questionnaire and signal mapping files
- Supabase migrations (via Supabase MCP)
- Edge Functions (`supabase/functions/`)
- RBAC logic and RLS policies
- TypeScript type regeneration after schema changes

**Claude Code must not be asked to edit the files listed in [§4 File Ownership — Lovable Owned](#lovable-owned).**

### Why This Matters

Modifying a Lovable-owned file with Claude Code (or vice versa) can:
- Produce conflicting changes that break the component on the next Lovable sync
- Lose carefully crafted Tailwind class patterns that Lovable maintains
- Create duplicate or misaligned component implementations

When in doubt: check the ownership table before making a change.

---

## 3. Branch and Commit Strategy

### Branch Policy

| Change type | Branch required? | Notes |
|-------------|-----------------|-------|
| Single-file fix | No — commit directly to `main` | Only for isolated, low-risk changes |
| Multi-file feature | **Yes** — create a feature branch | PR required |
| Schema migration | **Yes** — test on a Supabase branch first | See §8 |
| Edge Function changes | **Yes** | Deploy to staging before main |
| Large refactors | **Yes** | Never on main directly |

```bash
# Feature branch naming
git checkout -b feat/coach-briefing-pack-redesign
git checkout -b fix/dealer-panel-badge-overflow
git checkout -b chore/supabase-types-regen
```

### Commit Message Format

Follow the Conventional Commits standard:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `security` — security patch
- `perf` — performance improvement
- `docs` — documentation only
- `refactor` — code change without behaviour change
- `chore` — maintenance (deps, types regen, config)
- `test` — test additions or fixes

**Scope** (optional but recommended): component, module, or subsystem affected.

```
# Good examples
feat(dealer-panel): dark hero card with 4-column metrics
fix(coach-dashboard): restore DealerPanel wiring after merge conflict
security: patch unauthenticated email relay in send-notification function
chore(types): regenerate Supabase TypeScript types after migration 20260529
```

### CHANGELOG Updates

Every sprint or significant batch of changes must be documented in [CHANGELOG.md](CHANGELOG.md). Format:

```markdown
## [YYYY-MM-DD] — Sprint N: Descriptive Name

### feat
- **Feature name** — description. `(file.tsx · commit sha)`

### fix
- **Fix name** — description and root cause. `(file.tsx · commit sha)`

### security
- **Finding name (SEVERITY)** — what it was, how it was fixed. `(commit sha)`

### db
- table/function/migration changes

### Notes
- Test count, TS errors, package changes
```

---

## 4. File Ownership

### Claude Code Owned

These files contain business logic, data definitions, or infrastructure code. **Lovable must never edit them.** Changes require TypeScript validation and (for `signalEngine.ts`) signal mapping consistency check.

| File | Why Claude Code owns it |
|------|------------------------|
| `src/data/questionnaire.ts` | 100KB assessment question data; precise structure required for scoring |
| `src/data/signalTypes.ts` | Signal type definitions; must stay in sync with signalMappings |
| `src/data/signalMappings.ts` | Question → signal mappings; drives the entire diagnostic engine |
| `src/lib/signalEngine.ts` | Core signal detection logic; requires TypeScript strictness |
| `src/lib/scoringEngine.ts` | Assessment scoring calculation; category weights and normalisation |
| `src/lib/kpiDefinitions.ts` | 355KB KPI metadata; treat as data, not logic |
| `src/lib/contextIntelligence.ts` | Context-aware recommendation engine |
| `src/lib/actionRationaleMap.ts` | Action plan template logic |
| `src/lib/benchmarkGovernance.ts` | Benchmark validation and governance rules |
| `src/lib/narrativeTemplates.ts` | 32-variant executive narrative generation |
| `src/lib/crossValidationRules.ts` | Cross-department validation logic |
| `src/lib/ceilingAnalysis.ts` | Ceiling analysis and plateau detection |
| `src/data/actionTemplates.ts` | 22 action plan templates with implementation steps |
| `supabase/functions/` | All Edge Functions |
| `supabase/migrations/` | All database migrations |
| `src/integrations/supabase/types.ts` | Auto-generated; regenerate via Supabase MCP after schema changes |

### Lovable Owned

These files contain carefully crafted UI components with Lovable-maintained class patterns. **Claude Code must not edit them.**

| File | Why Lovable owns it |
|------|---------------------|
| `src/components/results/RadarBenchmarkChart.tsx` | Radar chart with benchmark ring; complex Recharts implementation |
| `src/components/action-plan/KanbanBoard.tsx` | Kanban with HTML5 DnD; do not replace with @dnd-kit without full rewrite |
| `src/components/ui/FreshnessBadge.tsx` | Assessment freshness pill; Lovable design system component |
| `src/lib/assessmentFreshness.ts` | Freshness utility; no scoring logic — Lovable-maintained |

### Shared (Both Tools Can Touch)

Page-level components, hooks, and utility files that neither tool has a strict claim on. Coordinate before making overlapping changes.

| Area | Notes |
|------|-------|
| `src/pages/` | Page components — Claude Code for data/logic, Lovable for layout/style |
| `src/components/` (except owned files above) | Coordinate on structure; Claude Code for logic, Lovable for appearance |
| `src/hooks/` | Claude Code preferred for hooks with DB/auth logic; Lovable for UI state hooks |
| `src/contexts/` | Claude Code (auth, multi-tenant, role); coordinate for others |

---

## 5. Environment Setup

### Required Environment Variables

```env
VITE_SUPABASE_URL=https://xrypgosuyfdkkqafftae.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase project settings>
VITE_ENABLE_AUTO_ACTIONS=true
```

The anon key is intentionally public (standard Supabase pattern). Do not add the service role key to `.env` — it must never appear in any file tracked by git.

### Supabase CLI (for local development)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref xrypgosuyfdkkqafftae

# Pull remote schema to local
supabase db pull
```

### Recommended IDE Extensions

- **ESLint** — enforces project linting rules (`eslint.config.js`)
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **TypeScript** (built-in or enhanced) — strict mode is enabled

---

## 6. Coding Standards

### TypeScript

- **Strict mode is on** (`tsconfig.app.json`). No `any` without explicit justification.
- All new components must be typed — no implicit `any` props.
- Use the Supabase generated types (`src/integrations/supabase/types.ts`) for all DB queries. Regenerate after schema changes.
- Prefer `type` over `interface` for simple object shapes; `interface` for extendable contracts.

### React

- **Hook rules are mandatory and critical** — see §10 Known Pitfalls. Violation causes runtime crash with no compile-time error.
- **No new npm packages** without explicit confirmation. Current bundle is ~1.3MB post-split. Every new dependency must justify its addition.
- Server state: **TanStack React Query** with 5-minute stale time. Do not use `useEffect` + `useState` for data fetching.
- Client state: React Context for auth/tenant/role; component state for purely local UI state.
- Forms: **React Hook Form** + Zod validation schemas in `src/lib/validationSchemas.ts`.

### Tailwind CSS

- Use **CSS variable tokens** (`hsl(var(--brand-500))`, `hsl(var(--neutral-900))`) rather than raw hex values inside Tailwind classes.
- Do not modify `tailwind.config.ts` or `src/index.css` without understanding the design system impact.
- Follow the spacing scale from DESIGN.md §4 — do not use arbitrary `p-[17px]` values unless there is a precise layout reason.
- Follow DESIGN.md exactly. If a design pattern isn't in DESIGN.md, add it there first.

### Imports

- Use the `@/` path alias for all imports from `src/`. Never use relative paths like `../../components`.
- Always import every UI component used in JSX — see §10 Known Pitfalls for why this is critical in production.
- Group imports: (1) React + third-party, (2) `@/components/ui`, (3) `@/components`, (4) `@/lib`, (5) `@/hooks`, (6) types.

### Comments

Write no comments except when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug. Do not comment what the code does — well-named identifiers already do that. Do not reference task numbers, PR numbers, or caller names in comments (these belong in commit messages and CHANGELOG).

---

## 7. Testing Requirements

### Coverage Thresholds

Coverage is enforced at build time. The following thresholds must pass:

| Metric | Threshold |
|--------|-----------|
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |
| Statements | 80% |

### Running Tests

```bash
npx vitest run                         # Run all tests once
npx vitest                             # Watch mode
npx vitest --coverage                  # With coverage report
npx vitest run src/__tests__/foo.test.ts  # Single file
```

### Test Location and Naming

- Tests live in `src/__tests__/`
- Test files: `<moduleName>.test.ts` or `<ComponentName>.test.tsx`
- Test setup: `src/test-setup.ts`
- Environment: jsdom (configured in `vitest.config.ts`)

### What to Test

- **Always:** Pure utility functions in `src/lib/` — scoring, signal detection, KPI mapping
- **Always:** New hooks that contain business logic
- **When complexity warrants it:** Complex component interactions
- **Not required:** Simple presentational components, generated types, trivial wrappers

### Fake Timer Warning

`vi.useFakeTimers()` breaks `waitFor()` from `@testing-library/react` because it mocks `setInterval`, which the library uses internally for polling. Workaround: place tests needing real timers last in the file, and give all `waitFor()` calls an explicit `{ timeout: 3000 }`.

---

## 8. Database Changes

All schema changes follow a migration-first workflow. **Never alter the production database directly via the Supabase Studio UI** — changes made outside migrations are not reproducible and will be overwritten on next migration run.

### Migration Workflow

```bash
# 1. Create a new migration file
supabase migration new <description>
# Creates: supabase/migrations/<timestamp>_<description>.sql

# 2. Write your SQL in the migration file

# 3. Test locally (requires local Supabase stack running)
supabase db reset            # Reset local DB and run all migrations
supabase db diff             # Preview changes

# 4. Apply to remote (production)
# Use Supabase MCP apply_migration tool, or:
supabase db push

# 5. Regenerate TypeScript types
# Use Supabase MCP generate_typescript_types tool (project_id: xrypgosuyfdkkqafftae)
# Write output to: src/integrations/supabase/types.ts
```

### Migration Naming Convention

```
<YYYYMMDDHHMMSS>_<description>.sql

# Examples
20260601120000_add_score_snapshots_table.sql
20260601120001_add_rls_policy_score_snapshots.sql
```

### RLS Policy Rules

Every new table must have RLS enabled and at least one SELECT policy before deployment. Key rules:

1. **No cross-table joins inside a policy on the same table** — causes infinite recursion. Wrap in a SECURITY DEFINER function in the `private` schema.
2. **`actor_type` checks in policies** — use `(SELECT actor_type FROM profiles WHERE user_id = auth.uid())` with a subquery, not a direct join.
3. **Test both grant AND deny cases** — RLS silent failures (returns empty, not error) are the most common source of bugs.
4. **`WITH CHECK` on UPDATE policies** — always include `WITH CHECK` to prevent unauthorised field modifications. The `actor_type` self-escalation bug (May 2026) was caused by a missing `WITH CHECK`.

### SECURITY DEFINER Functions

For cross-org queries (e.g. OEM admin looking up a dealer in another org):
- Function goes in the `private` schema — not `public`
- First line: validate the caller's identity (`private.caller_is_verified_oem()` or equivalent)
- Return minimum required fields only — never expose `organization_id` or other cross-org identifiers unless explicitly needed
- Document the function in CLAUDE.md under the relevant section

---

## 9. Edge Function Deployment

Edge Functions live in `supabase/functions/`. They run on Deno (not Node.js).

### Development

```bash
# Run a function locally
supabase functions serve <function-name> --env-file supabase/.env.local

# Deploy to production
supabase functions deploy <function-name>
```

### Security Requirements

Every new Edge Function must:
1. Set `verify_jwt = true` in `supabase/config.toml` (or explicitly justify why it is `false`)
2. Validate the caller's role inside the function body (do not rely on JWT alone for privileged operations)
3. Never log sensitive data (emails, tokens, user IDs in plaintext)
4. Use `SUPABASE_SERVICE_ROLE_KEY` from environment for admin DB operations — never hardcode

### CORS

CORS is locked to an allowlist in each function. Do not set `Access-Control-Allow-Origin: *` in production functions.

### Templates

React Email templates (Deno-compatible TSX) live in `supabase/functions/_templates/`. Import via `esm.sh` — no npm install in Edge Functions.

---

## 10. Known Pitfalls

These are documented runtime failures that TypeScript **will not catch at compile time**. Read them carefully.

### React Hook Rules — CRITICAL

**Never add `useState` or `useEffect` after a conditional check.** Hooks must be declared unconditionally at the top of the component body, before any `if` / early `return` statements.

```tsx
// WRONG — will crash in production with React error #300
function MyComponent({ data }) {
  if (!data) return <Spinner />;  // ← conditional return BEFORE hooks
  const [count, setCount] = useState(0);  // ← hook after conditional
}

// CORRECT
function MyComponent({ data }) {
  const [count, setCount] = useState(0);  // ← hook at top, unconditionally
  if (!data) return <Spinner />;
}
```

This violation:
- **Does not fail at build time**
- **Does not fail in development** (unless strict mode catches it)
- **Crashes the entire page in production** with "Invalid hook call (Error #300)"

### Missing Imports — CRITICAL

**Always import every JSX element you use.** Missing imports pass TypeScript compilation but throw `ReferenceError` crashes in the minified production bundle.

```tsx
// WRONG — passes tsc, crashes in production
import { Button } from '@/components/ui/button';
// Badge is used below but not imported
<Badge variant="outline">{label}</Badge>  // ← ReferenceError in prod
```

After adding any new JSX element, verify its import exists at the top of the file before committing.

### Supabase Join Shape

`profiles!inner(field1, field2)` join syntax can return profiles as an array rather than an object depending on the relationship direction. **Prefer two separate queries with `.in()` lookup** when joining profiles to avoid shape mismatches.

```ts
// Fragile — shape depends on FK direction
const { data } = await supabase
  .from('memberships')
  .select('id, profiles!inner(display_name)');
// data[0].profiles might be an array

// Safer
const memberIds = members.map(m => m.user_id);
const { data: profiles } = await supabase
  .from('profiles')
  .select('user_id, display_name')
  .in('user_id', memberIds);
```

### RLS Recursion

Any RLS policy that directly joins `dealer_network_memberships` inside a policy on `dealerships` or `assessments` will cause **infinite recursion**. The policy re-evaluates itself on every row, looping forever.

Solution: always wrap such logic in a `SECURITY DEFINER` function in the `private` schema and call that from the policy — never reference `oem_networks` or `dealer_network_memberships` directly inside each other's policies.

### KanbanBoard — HTML5 DnD

`KanbanBoard` uses the HTML5 Drag and Drop API. **Do not replace it with `@dnd-kit` or any other DnD library without a full component rewrite.** Status updates write directly to `improvement_actions` via `handleKanbanStatusChange` in `ActionPlan.tsx`. The `@dnd-kit` API is fundamentally different and the replacement would break status persistence.

### `useActiveRole` — Use `actorType`, Not `uxRole`

When gating UI features by actor type, always use `actorType` from `useActiveRole()`, **not** `uxRole`. `uxRole` can be `null` when `active_organization_id` is `null` — this is intentional for coaches (who have no org membership). Using `uxRole` for role-gating will silently pass coaches through gates intended to block them.

```ts
// WRONG
const { uxRole } = useActiveRole();
if (uxRole !== 'admin') return null;  // Coaches with null uxRole pass this check

// CORRECT
const { actorType } = useActiveRole();
if (actorType !== 'oem') return null;
```

### Bundle Size — No New Packages

The production bundle is ~1.3MB post-split. Every new npm package must be explicitly justified. Do not install packages without confirmation. Large packages (Recharts, etc.) have been removed in past sprints specifically to reduce bundle size.

---

## 11. Pull Request Checklist

Before opening a PR, verify:

**Code quality:**
- [ ] `npm run lint` passes with zero errors
- [ ] `npx vitest run` passes (all tests green)
- [ ] `npx vitest --coverage` passes (80% thresholds met)
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] No new npm packages added without confirmation

**Data layer:**
- [ ] Any schema changes include a migration file in `supabase/migrations/`
- [ ] `src/integrations/supabase/types.ts` regenerated if schema changed
- [ ] New tables have RLS enabled with at least SELECT policy
- [ ] UPDATE policies include `WITH CHECK` clause

**Code standards:**
- [ ] No hooks added after conditional returns
- [ ] All JSX elements have corresponding imports
- [ ] CSS variable tokens used (not raw hex) for colours
- [ ] No inline `style={{}}` blocks on UI surfaces (see DESIGN.md §15)
- [ ] Department names use full names, not abbreviations (in display UI)
- [ ] Score thresholds use canonical values: ≥85 / ≥70 / ≥46 / <46

**Documentation:**
- [ ] CHANGELOG.md updated with new entries
- [ ] DESIGN.md updated if new component patterns introduced
- [ ] CLAUDE.md updated if new files, patterns, or known issues introduced

**Security:**
- [ ] No secrets committed (service role key, Resend key, etc.)
- [ ] New Edge Functions have `verify_jwt = true` (or documented exception)
- [ ] New SECURITY DEFINER functions are in `private` schema with identity validation

---

## 12. Getting Help

- **CLAUDE.md** — Primary reference for Claude Code sessions. Contains architecture, data model, known pitfalls, and development rules.
- **DESIGN.md** — Visual language and component specification (v4.1). Required reading before any UI change.
- **ARCHITECTURE.md** — System design, data flow, and multi-tenancy model.
- **SECURITY.md** — Security architecture and vulnerability reporting.
- **Supabase docs** — [supabase.com/docs](https://supabase.com/docs)
- **shadcn/ui docs** — [ui.shadcn.com](https://ui.shadcn.com) — do not edit components in `src/components/ui/` directly; regenerate via `npx shadcn@latest add <component>`
