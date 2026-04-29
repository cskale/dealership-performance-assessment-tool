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

- **Server state**: TanStack React Query (5-min stale time)
- **Auth/multi-tenant/role state**: React Context with custom hooks (`useAuth`, `useMultiTenant`, `useActiveRole`)
- **Forms**: React Hook Form + Zod validation schemas in `src/lib/validationSchemas.ts`

### UI Components

Base components come from shadcn/ui (`src/components/ui/`) — don't edit these directly; re-generate via `npx shadcn@latest add <component>`. Custom components live in `src/components/`.

### Exports

- PDF: `src/lib/pdfReportGenerator.ts` (html2canvas + jsPDF)
- Excel: `src/lib/excelExportGenerator.ts` (xlsx)

### Internationalization

`src/contexts/LanguageContext.tsx` (44KB) contains translations. English and German are complete; other languages (ES, FR, IT) are stubs. Use `useLanguage()` hook for translations.

## Testing

Tests live in `src/__tests__/`. The test setup is in `src/test-setup.ts`. Coverage thresholds are 80% for branches, functions, lines, and statements. Vitest uses jsdom environment.

## Loaded Skills

### artifacts-builder

To build powerful frontend claude.ai artifacts, follow these steps:
1. Initialize the frontend repo using `scripts/init-artifact.sh`
2. Develop your artifact by editing the generated code
3. Bundle all code into a single HTML file using `scripts/bundle-artifact.sh`
4. Display artifact to user
5. (Optional) Test the artifact

**Stack**: React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui

#### Design & Style Guidelines

VERY IMPORTANT: To avoid what is often referred to as "AI slop", avoid using excessive centered layouts, purple gradients, uniform rounded corners, and Inter font.

#### Quick Start

##### Step 1: Initialize Project

Run the initialization script to create a new React project:
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```

This creates a fully configured project with:
- ✅ React + TypeScript (via Vite)
- ✅ Tailwind CSS 3.4.1 with shadcn/ui theming system
- ✅ Path aliases (`@/`) configured
- ✅ 40+ shadcn/ui components pre-installed
- ✅ All Radix UI dependencies included
- ✅ Parcel configured for bundling (via .parcelrc)
- ✅ Node 18+ compatibility (auto-detects and pins Vite version)

##### Step 2: Develop Your Artifact

To build the artifact, edit the generated files. See **Common Development Tasks** below for guidance.

##### Step 3: Bundle to Single HTML File

To bundle the React app into a single HTML artifact:
```bash
bash scripts/bundle-artifact.sh
```

This creates `bundle.html` - a self-contained artifact with all JavaScript, CSS, and dependencies inlined. This file can be directly shared in Claude conversations as an artifact.

**Requirements**: Your project must have an `index.html` in the root directory.

**What the script does**:
- Installs bundling dependencies (parcel, @parcel/config-default, parcel-resolver-tspaths, html-inline)
- Creates `.parcelrc` config with path alias support
- Builds with Parcel (no source maps)
- Inlines all assets into single HTML using html-inline

##### Step 4: Share Artifact with User

Finally, share the bundled HTML file in conversation with the user so they can view it as an artifact.

##### Step 5: Testing/Visualizing the Artifact (Optional)

Note: This is a completely optional step. Only perform if necessary or requested.

To test/visualize the artifact, use available tools (including other Skills or built-in tools like Playwright or Puppeteer). In general, avoid testing the artifact upfront as it adds latency between the request and when the finished artifact can be seen. Test later, after presenting the artifact, if requested or if issues arise.

#### Reference

- **shadcn/ui components**: https://ui.shadcn.com/docs/components

---

### webapp-testing

To test local web applications, write native Python Playwright scripts.

**Helper Scripts Available**:
- `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)

**Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is absolutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window.

#### Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        │        Then use the helper + write simplified Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

#### Example: Using with_server.py

To start a server, run `--help` first, then use the helper:

**Single server:**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**Multiple servers (e.g., backend + frontend):**
```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

To create an automation script, include only Playwright logic (servers are managed automatically):
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True) # Always launch chromium in headless mode
    page = browser.new_page()
    page.goto('http://localhost:5173') # Server already running and ready
    page.wait_for_load_state('networkidle') # CRITICAL: Wait for JS to execute
    # ... your automation logic
    browser.close()
```

#### Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

#### Common Pitfall

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

#### Best Practices

- **Use bundled scripts as black boxes** - To accomplish a task, consider whether one of the scripts available in `scripts/` can help. These scripts handle common, complex workflows reliably without cluttering the context window. Use `--help` to see usage, then invoke directly.
- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`

#### Reference Files

- **examples/** - Examples showing common patterns:
  - `element_discovery.py` - Discovering buttons, links, and inputs on a page
  - `static_html_automation.py` - Using file:// URLs for local HTML
  - `console_logging.py` - Capturing console logs during automation

---

### mcp-builder

To create high-quality MCP (Model Context Protocol) servers that enable LLMs to effectively interact with external services, use this skill. An MCP server provides tools that allow LLMs to access external services and APIs. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks using the tools provided.

#### High-Level Workflow

Creating a high-quality MCP server involves four main phases:

**Phase 1: Deep Research and Planning**

- Understand agent-centric design principles: build for workflows (not just API endpoints), optimize for limited context, design actionable error messages, follow natural task subdivisions, use evaluation-driven development.
- Fetch the latest MCP protocol documentation via WebFetch: `https://modelcontextprotocol.io/llms-full.txt`
- For Python: fetch `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- For Node/TypeScript: fetch `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- Study all available API documentation exhaustively.
- Create a comprehensive implementation plan covering tool selection, shared utilities, input/output design, and error handling strategy.

**Phase 2: Implementation**

- Python: single `.py` file or modules, MCP Python SDK, Pydantic models, async/await.
- Node/TypeScript: proper project structure, `package.json`/`tsconfig.json`, MCP TypeScript SDK, Zod schemas.
- Implement core infrastructure first (API helpers, error handling, response formatting, pagination, auth).
- For each tool: define input schema with Pydantic/Zod, write comprehensive docstrings, implement logic with shared utilities, add tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`).

**Phase 3: Review and Refine**

- Review for DRY, composability, consistency, error handling, type safety, documentation.
- **Important**: MCP servers are long-running processes — running directly will hang. Safe testing: use evaluation harness, run in tmux, or use `timeout 5s python server.py`.
- Python: verify syntax with `python -m py_compile your_server.py`.
- Node/TypeScript: run `npm run build` and verify `dist/index.js` is created.

**Phase 4: Create Evaluations**

- Create 10 evaluation questions that are independent, read-only, complex, realistic, verifiable, and stable.
- Output as XML: `<evaluation><qa_pair><question>...</question><answer>...</answer></qa_pair></evaluation>`

#### Reference Files (load as needed)

- MCP Protocol: `https://modelcontextprotocol.io/llms-full.txt`
- Python SDK: `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- TypeScript SDK: `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- Language-specific guides: `./reference/python_mcp_server.md`, `./reference/node_mcp_server.md`
- Evaluation guide: `./reference/evaluation.md`

---

# Project Context — Dealership Performance Assessment Tool

## Identity
- **Product**: Enterprise Dealer Diagnostic & Performance Improvement Platform
- **Target users**: Dealer principals, field coaches, OEM programme managers (BMW, Mercedes, VW-group)
- **Repo**: `cskale/dealership-performance-assessment-tool` (private, GitHub)
- **Production URL**: `https://dealership-performance-assessment-t.vercel.app`
- **Current branch**: `main` — all changes commit here unless explicitly branching

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
- **Assessment questions**: `src/data/assessmentQuestions.ts`
- **KPI definitions**: `src/lib/kpiDefinitions.ts`
- **Signal engine**: `src/lib/signalEngine.ts`
- **Action templates**: `src/data/actionTemplates.ts`
- **Benchmark governance**: `src/lib/benchmarkGovernance.ts`
- **Narrative templates**: `src/lib/narrativeTemplates.ts`
- **Cross-validation rules**: `src/lib/crossValidationRules.ts`
- **Ceiling analysis**: `src/lib/ceilingAnalysis.ts`
- **PDF generator**: `src/lib/pdfReportGenerator.ts`
- **Active role hook**: `src/hooks/useActiveRole.tsx` — reads `actor_type` from profiles; use this for role-gating
- **Multi-tenant hook**: `src/hooks/useMultiTenant.tsx` — org-level scoping for dealer data
- **i18n**: `src/lib/i18n.ts` — EN + DE complete, FR/ES/IT partial
- **Supabase types**: `src/integrations/supabase/types.ts` — auto-generated, regenerate via Supabase MCP after schema changes
- **Edge functions**: `supabase/functions/` — CORS locked to allowlist
- **OEM dashboard**: `src/pages/OemDashboard.tsx` — live at `/app/oem-dashboard`, gated to `actor_type='oem'`
- **Coach dashboard**: `src/pages/CoachDashboard.tsx` — live at `/app/coach-dashboard`, gated to `actor_type='coach'`
- **Coach action tracker**: `src/pages/CoachActions.tsx` — live at `/app/coach-actions`, gated to `actor_type='coach'`
- **Invite team members**: `src/components/InviteTeamMembers.tsx` — dealer team invites (Account → Team tab)
- **Invite coach**: `src/components/InviteCoach.tsx` — coach invites (Account → Team tab, below InviteTeamMembers)
- **Protected route**: `src/components/ProtectedRoute.tsx` — supports `requiresActorType` prop

## Role Architecture (implemented as of 29 Apr 2026)

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
- Existing users without `actor_type`: migration `20260429090200` backfilled all to `'dealer'`

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

## Coach Invite Flow (implemented 29 Apr 2026)

1. Org owner opens Account → Team tab → "Invite a Coach" card
2. Enters coach email (+ dealership picker if org has multiple dealerships)
3. `send-invite` Edge Function creates a `dealership_invites` row with `invite_type='coach'` and sends a branded email
4. Coach clicks the link → `/invite/:token` → `AcceptInvite.tsx`
5. `accept_dealership_invite` RPC detects `invite_type='coach'`:
   - Inserts `coach_dealership_assignments` row (idempotent via `ON CONFLICT DO NOTHING`)
   - Sets `profiles.actor_type = 'coach'` (only if not already 'coach')
   - Does NOT create a `memberships` row
6. `AcceptInvite.tsx` reads `invite_type` from RPC response → redirects to `/app/coach-dashboard`

## Assessment Structure
- **5 departments**: New Vehicle Sales (NVS), Used Vehicle Sales (UVS), Service (SVC), Parts (PTS), Financial Operations (FIN)
- **Scoring**: 1–5 scale per question, weighted by category, normalised to 0–100
- **Weights**: defined in `CATEGORY_WEIGHTS` in scoring logic
- **Business models**: 2S (sales+service), 3S (+parts), 4S (+bodyshop) — branching not yet implemented

## Diagnostic Engine (implemented, partially wired)
- `signalEngine.ts` — generates signal codes from scores (CRITICAL_GAP, HIGH_PRIORITY, etc.)
- `detectSystemicPatterns()` — cross-department clustering (3+ depts = systemic, 2 = recurring)
- `calculateEnhancedMaturity()` — 5-level model, requires ≥85 AND no sub-cat below 60 for Advanced
- `confidenceInterval scoring` — implemented
- `buildExecutiveNarrative()` — 32 variants (4 maturity × 8 signals × single/systemic)
- `ACTION_TEMPLATES` — 22 templates with `relevantBusinessModels[]` and `implementationSteps[]`

**Still unwired**: `evaluateCrossValidations()` in `crossValidationRules.ts` (not called from signalEngine). `generateCeilingInsights()` in `ceilingAnalysis.ts` (not rendered on Results page).

## i18n
- Supported languages: EN, DE (complete), FR, ES, IT (schema exists, translations incomplete)
- Language context: `src/contexts/LanguageContext.tsx`
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

## Current Tracker Status (as of 29 Apr 2026)
- Total items: 58
- Done: ~36 (62%)
- Pending/Partial: ~22 (38%)
- **Completed this session**: #01 (role architecture — implemented), #38 (OEM/Coach dashboards — live), coach invite flow (new feature)
- **Remaining priorities**: #13 (2S/3S/4S branching), #29 (causal chain UI), #32 (5×5 heatmap), OEM provisioning UI (no UI yet — manual SQL only), coach assignment management UI

## Improvement Tracker File
- Location in repo: `improvement_tracker_updated.html`
- Open in browser to view full status — filterable by status, category, phase

## Loaded Skills (in this CLAUDE.md)
- `artifacts-builder` — multi-component React artifact generation
- `webapp-testing` — Playwright-based web app testing
- `mcp-builder` — MCP server creation patterns

## Global Skills (auto-loaded via stitch-skills CLI)
- `shadcn-ui` → `~\.agents\skills\shadcn-ui`
- `react:components` → `~\.agents\skills\react-components`
