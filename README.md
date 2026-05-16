# Dealer Diagnostic — Performance Intelligence Platform

Enterprise dealership performance assessment and coaching platform. Designed for BMW, Mercedes, VW-group, and multi-brand dealer networks.

---

## What It Does

Dealers complete a structured diagnostic assessment across five departments. The platform scores results, surfaces KPI gaps and systemic patterns, generates prioritised action plans, and gives coaches and OEM programme managers a real-time view across their assigned portfolios.

---

## Current State (May 2026)

### Assessment Engine
- **61-question assessment** across 5 departments: New Vehicle Sales (NVS), Used Vehicle Sales (UVS), Service (SVC), Parts (PTS), Financial Operations (FIN)
- **Weighted scoring** — 1–5 scale per question, category weights, normalised 0–100
- **Signal engine** — generates `CRITICAL_GAP`, `HIGH_PRIORITY`, and strength signals from scores; `detectSystemicPatterns()` identifies cross-department clusters
- **5-level maturity model** — Foundational / Developing / Performing / Advanced / Leading; requires ≥85 AND no sub-category below 60 for Leading
- **Executive narrative** — 32 variants (4 maturity × 8 signal combinations × single/systemic)
- **Action plan** — 22 templates with implementation steps, linked KPIs, and relevant business model tags
- **PDF + Excel export** of results and action plan

### Dealer Dashboard (`/app/dashboard`)
- Dark stats bar: Overall Score, Assessment date, Critical gaps, Open actions
- Full-width dark hero card: Overall Diagnostic Score + Open Actions + Focus Department
- Key dates timeline strip: Last Assessment, Next Due, Last/Next Coach Visit, Action Plan Review
- Departmental Intelligence grid: per-department score, maturity, diagnostic finding
- Open Actions table: action · department · responsible · due date
- Visit confirmation banner when coach has proposed/confirmed a visit

### Coach Portal (`/app/coach-dashboard`, `/app/coach-actions`)
- **Field Performance Dashboard** — "COACHING PERSPECTIVE · Q{N} {YEAR}" with dark hero card (portfolio avg score / open actions / focus dealer) and 5-chip timeline strip
- **OEM brand-styled dealer cards** — Clearbit brand logo, circular SVG score gauge, action plan progress, visit chip, "Enter Dealership →" CTA
- **Network Actions Requiring Attention** — Overdue / Stale / All Open tabs, per-dealer filter, priority dots, derived status badges
- **Field Notes feed** — observation / action / follow-up notes per dealer, paginated
- **Visit scheduling** — propose, confirm, cancel coach visits via `VisitSheet`
- **Action Tracker** — full table of open actions across all assigned dealers (latest assessment only)
- **Resource panel** — KPI Reference (searchable) + Action Playbooks (filterable by department)

### OEM Portal (`/app/oem-dashboard`, `/app/oem-settings`)
- **Full-width command centre** matching Coach Dashboard design language — dark `bg-[#0b1f3a]` stats bar (Network / Avg Score / Critical Gaps / Enrolled Dealers), 3-column dark hero card (Network Performance score + Enrolled Dealers health + Dept Weaknesses)
- **Dealer cards grid** — responsive 1/2/3-col grid with ScoreGauge ring, TierBadge, top-3 weakest dept score bars, open action count, freshness, "Enter Dealership →" CTA
- **Network Insights cards** — Score Momentum (network avg trend), Assessment Coverage (stale/missing alert), Network Insights (dept weakness counts + recurring signal codes)
- **Leaderboard tab** — Network Portfolio Heatmap (all dealers × all depts), tier filter, rank arrows, dealer drill-down Sheet
- **Results page OEM context banner** — "Viewing as OEM · {Dealer Name}" with back navigation when viewing a dealer's results
- **Network management** — create/edit network, add dealers by email lookup (cross-org via SECURITY DEFINER), remove dealers (soft-delete)
- **OEM invite flow** — self-service invite via `InviteOemUser` card (Account → Team + OEM Settings); edge function guards on active `oem_network` ownership
- **OEM self-activation** — org owners with an active OEM network can invite OEM users without SQL

### Action Management
- Kanban board (HTML5 DnD) with Open / In Progress / Completed columns
- Full ActionSheet: all fields (title, description, status, priority, department, responsible, due date, KPIs, impact/effort/urgency scores)
- Activity feed: merged timeline of automatic audit log entries + manual comments; real-time via Supabase channels; Ctrl+Enter to post
- Real-time sync bidirectional: dealer and coach see each other's changes without page refresh

---

## Role Architecture

Three actor types in `profiles.actor_type`:

| Actor | Landing | Access |
|---|---|---|
| `dealer` | `/app/dashboard` | Own dealership only |
| `coach` | `/app/coach-dashboard` | Assigned dealerships only |
| `oem` | `/app/oem-dashboard` | All dealers in OEM network |

**Provisioning:**
- `dealer` — set on dealer invite acceptance (`accept_dealership_invite` RPC)
- `coach` — set on coach invite acceptance (via `InviteCoach` component → `send-invite` Edge Function)
- `oem` — set via `InviteOemUser` (Account → Team tab or OEM Settings); org owner with active `oem_network` can send invite; `accept_dealership_invite` RPC sets `actor_type='oem'` on acceptance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI) |
| Backend | Supabase (Postgres, Auth, Edge Functions, Realtime, RLS) |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Testing | Vitest, jsdom, 80% coverage threshold |
| Export | html2canvas + jsPDF (PDF), xlsx (Excel) |

---

## Setup

```bash
# 1. Clone + install
npm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ENABLE_AUTO_ACTIONS

# 3. Run dev server (port 8080)
npm run dev

# 4. Build
npm run build

# 5. Tests
npx vitest run
npx vitest --coverage
```

---

## Architecture Notes

### RLS recursion rule
Any RLS policy that joins `dealer_network_memberships` inside a policy on another table can cause infinite recursion. Always wrap cross-table OEM access logic in a `SECURITY DEFINER` function in the `private` schema (`private.user_is_member_of_network_owner`, `private.user_is_admin_of_network_owner`) and call that from the policy — never reference `oem_networks` directly inside `dealer_network_memberships` policies or vice versa.

### File ownership
- **Claude Code owned** (do not edit via Lovable): `src/data/questionnaire.ts`, `src/data/signalTypes.ts`, `src/data/signalMappings.ts`, `src/lib/signalEngine.ts`
- **Lovable owned** (do not edit via Claude Code): `src/components/results/RadarBenchmarkChart.tsx`, `src/components/action-plan/KanbanBoard.tsx`, `src/components/ui/FreshnessBadge.tsx`, `src/lib/assessmentFreshness.ts`

### Hook rules (critical)
Never add `useState` or `useEffect` after a conditional return. Hooks must be declared unconditionally at the top of the component body. Violation causes React error #300 and crashes the page at runtime without a build-time warning.

### Supabase join shape
`profiles!inner(field1, field2)` can return an array rather than an object depending on relationship direction. Prefer two separate queries with `.in()` when joining profiles.

---

## Known Issues (non-blocking)

| Issue | Status |
|---|---|
| `useOnboarding` RLS false negatives on first load — hook logs warning and preserves stored value | Accepted / low priority |

---

## Deferred

- Score delta / trajectory card (requires DB design for historical snapshots)
- Context intake questionnaire (#12)
- Coach assignment management UI
- Assessment templates / OEM question weighting
- Modular assessment (Lovable sprint)
- Network map view for OEM Dashboard
- OEM signal aggregation drill-down (click signal code → list of affected dealers)
- Tier gap analysis (needs real programme tier data across multiple OEMs)
