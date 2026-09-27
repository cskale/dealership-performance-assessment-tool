# Dealer Diagnostic — Performance Intelligence Platform

Enterprise dealership performance assessment and coaching platform for BMW, Mercedes, VW-group and multi-brand dealer networks.

**Production:** https://dealership-performance-assessment-t.vercel.app

---

## What It Does

Dealers complete a structured diagnostic across five departments. The platform scores the answers, benchmarks each department, tracks real KPIs month by month, and turns gaps into a prioritised action plan. Field coaches run visits against that plan, and OEM programme managers see the whole network in one place.

---

## Current State (September 2026)

### Assessment
- **61 questions** across 5 departments: New Vehicle Sales (NVS), Used Vehicle Sales (UVS), Service (SVC), Parts (PTS), Financial Operations (FIN)
- **Weighted scoring**: 1–5 per question, category weights, normalised to 0–100
- **KPI data questions**: real figures (e.g. lead response < 1h, days to sale, workshop loading) saved per assessment. They prefill from the dealer's latest value as a hint; nothing is saved until the dealer enters it.
- **Maturity scale** (DESIGN.md): Foundational 0–45 · Developing 46–69 · Performing 70–84 · Advanced 85–100
- **Signal engine**: `CRITICAL_GAP`, `HIGH_PRIORITY` and strength signals; `detectSystemicPatterns()` finds cross-department clusters
- **Executive narrative**: 32 variants (4 maturity × 8 signals × single/systemic)

### Results (`/app/results`)
Two tabs, with an assessment picker in the header to switch between past assessments.
- **Diagnosis**
  - Hero band: score ring, 4-step maturity ladder, 2-line summary with the full narrative on demand, **Biggest lever** (largest benchmark gap, linked to its top open action), and an honest coverage line (departments and questions assessed)
  - One row per department: score vs benchmark track, maturity chip, answer-consistency confidence. Expands to cross-validation alerts, ceiling insights and the department's tracked KPIs.
  - **KPI trend cards**: value vs benchmark, sparkline from 2 data points, and a line chart with a 3-month projection (±1σ band, on/off track to benchmark) from 3 months
  - Excellence gaps panel, shown only when there are insights
- **Action Plan**: see Action Management below
- PDF and Excel export. Coaches and OEM users see a "Viewing as" banner and no Retake button.

### Monthly KPI Check-ins
- 10 tracked KPIs, 2 per department, logged between assessments via **Log this month** (Results) or **Save as check-in** (Playground)
- Dealer members (not viewers) and assigned coaches can log; OEM users can read. Who entered and who last edited each value is recorded server-side.
- In-app reminder on the 1st of each month, one per organisation
- Check-ins feed the KPI trends, the forecast, the Playground prefill and the next assessment's KPI hints

### Action Management
- List, Kanban (HTML5 drag and drop) and 30/60/90-day Roadmap views; search, status tabs with counts, priority/department filters
- Progress ring and stat chips; cards with a priority-coloured border, department · owner · due date, and inline overdue marker
- **Linked KPI chip** with a mini trend when an action is tied to a tracked KPI
- Full edit sheet, activity feed (audit log + comments), realtime sync between dealer and coach
- 42 action templates with implementation steps, linked KPIs and business-model tags; generated automatically from signals and KPI gaps

### Dealer Dashboard (`/app/dashboard`)
- Stats bar, hero card (overall score, open actions, focus department), key-dates strip
- Department intelligence grid, open actions table, coaching visits section with visit confirmations and recaps

### Coach Portal (`/app/coach-dashboard`, `/app/coach-actions`)
- Field dashboard with portfolio hero card, dealer cards (score gauge, action progress, visit chip) and a dealer panel/briefing
- **Coach visit loop**: schedule and log visits, review previously agreed actions (done / in progress / blocked / not started, synced to action status), and send a recap notification to the dealer
- Network actions needing attention (overdue / stale / all), field notes, action tracker, KPI and playbook resources

### OEM Portal (`/app/oem-dashboard`, `/app/oem-settings`)
- Network command centre: stats bar, network hero card, dealer cards, momentum / coverage / insight cards, coaching stats
- Leaderboard with department heatmap and tier filter; drill into any dealer's Results
- Network settings: create the network, add dealers by email lookup, set programme tier, remove dealers (soft delete), invite further OEM users

### Knowledge Hub (`/app/knowledge`)
- **Recommended**: resources matched to the dealer's weakest departments, plus learning paths with progress
- **KPI Encyclopedia**: 111 KPIs, searchable by department; each opens a detail page at `/app/knowledge/kpi/:kpiKey`
- **Downloads**: articles, templates and case studies

### Playground (`/app/playground`)
- 12 calculators across Sales Optimization, Marketing Intelligence and Operational Models; **10 live**: Reverse Sales Funnel, Sales Velocity, Lead Quality Auditor, Marketing ROI, CAC Payback, F&I Penetration, Appointment Density, Absorption Rate Modeler, Tech Utilization, Vehicle Stock Turn
- Inputs prefill from the dealer's latest KPI value (check-in or assessment)
- Tracked-KPI fields can be saved straight back as a monthly check-in

### Notifications
- In-app bell for stale actions, milestones, digests, coach comments, visit recaps and KPI reminders; each opens the relevant page
- Email delivery via Resend is ready but sandboxed until a sending domain is verified

---

## Role Architecture

Actor types in `profiles.actor_type`:

| Actor | Landing | Access |
|---|---|---|
| `dealer` | `/app/dashboard` | Own dealership. Membership roles: owner / admin / member / viewer |
| `coach` | `/app/coach-dashboard` | Assigned dealerships only |
| `oem` | `/app/oem-dashboard` | Dealers in their OEM network |

**Provisioning**
- `dealer`: on accepting a dealer invite (`accept_dealership_invite` RPC)
- `coach`: on accepting a coach invite (Account → Team → Invite a Coach)
- `oem`: the first OEM user is set in SQL (`UPDATE profiles SET actor_type='oem' ...`). An OEM user with an active network can then invite others via `InviteOemUser`. Non-OEM users cannot create networks or self-grant OEM access.

---

## Security

- Row-level security on every table; cross-tenant checks go through `SECURITY DEFINER` helpers in the `private` schema
- Full audit in September 2026: 10 findings fixed (tenant isolation, privilege escalation, invite and edge-function hardening). Summary in `docs/changelog/enhancement-log.md`; policy in `docs/contributing/SECURITY.md`
- Edge functions: CORS allowlist, signed action tokens, no raw provider errors

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), Recharts, TanStack Query |
| Backend | Supabase (Postgres, Auth, Edge Functions, Realtime, RLS, pg_cron) |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Testing | Vitest + jsdom (80% coverage threshold); Playwright signed-in click-through |
| Export | jsPDF + jspdf-autotable (PDF), xlsx (Excel) |
| i18n | English, German, French, Spanish, Italian |

---

## Setup

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ENABLE_AUTO_ACTIONS

# 3. Dev server (port 8080)
npm run dev

# 4. Build, lint, test
npm run build
npm run lint
npx vitest run
npx vitest --coverage

# 5. Signed-in click-through as dealer, coach and OEM (needs git-ignored .env.test)
python scripts/qa_click_through.py http://localhost:8080 <out_dir>
```

---

## Repository Layout

```
src/                 app code (pages, components, hooks, lib, data, i18n)
supabase/            migrations and edge functions
scripts/             reusable scripts (QA click-through)
docs/product/        PRD, roadmap, improvement tracker (archive)
docs/architecture/   architecture, logic write-ups, diagrams
docs/changelog/      enhancement log (current), changelog (to June 2026)
docs/contributing/   contributing guide, security policy
docs/lovable/        UI handoff prompts for Lovable
docs/superpowers/    feature specs and implementation plans
```

Root holds only README, CLAUDE.md (engineering guide), AGENTS.md (Lovable rules), DESIGN.md (design system) and tool config.

---

## Working Model

- **Lovable** builds React/TSX UI; **Claude Code** owns logic, data, database migrations and edge functions.
- File ownership, hook rules, RLS pitfalls and conventions: see `CLAUDE.md`.
- All UI colours come from `DESIGN.md`; all user-facing text goes through `t()` in all five languages.

---

## Known Issues

| Issue | Status |
|---|---|
| No verified Resend sending domain; outbound email is sandboxed | Open |
| `useOnboarding` RLS false negatives on first load; hook preserves the stored value | Accepted, low priority |
| Clearing a typed KPI answer leaves the earlier auto-saved value | Open, minor |
| Monthly KPI reminder has no guard against a same-month re-run | Open, minor |
| `RadarBenchmarkChart.tsx` unused (Lovable-owned) | To remove via Lovable |

---

## Next Up

- Business-model branching (2S / 3S / 4S) in the assessment
- What-if simulator, ROI on actions, AI coaching narrative
- Coach assignment management UI
- OEM signal drill-down (signal → affected dealers) and network map
- Seasonal KPI forecasting once 12+ months of check-ins exist
