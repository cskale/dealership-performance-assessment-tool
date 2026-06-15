# CHANGELOG — Dealer Diagnostic Platform

All notable changes to this project are documented here.
Format: `[Type] Description (tracker item · commit sha)`
Types: **feat** · **fix** · **security** · **perf** · **docs** · **refactor**

---

## [2026-06-15] — Playground: Reverse Sales Funnel Calculator + KPI Seeding

### feat
- **Playground catalog page (`/app/playground`)** — `Playground.tsx` lists 12 planned analytical calculators across three categories (Sales Optimization, Marketing Intelligence, Operational Models). Each card shows icon, name, description, and a "Coming Soon" badge for unbuilt tools; live tools link through with an "Open Calculator →" affordance. Header shows a live/planned count pill. `(commits 8f8f408, 2243f40, 671a20d)`
- **Reverse Sales Funnel Calculator (`/app/playground/reverse-sales-funnel`)** — first live Playground tool. Works backward from a unit-sales target to required leads, appointments, and showroom visits using configurable conversion-rate assumptions. `(ReverseSalesFunnelPage.tsx · commits 8f8f408, 2243f40, 671a20d)`
- **`PlaygroundCalculatorShell`** — shared shell component for all future calculators: breadcrumb (Playground → tool name), header card (icon, category eyebrow, title, version tag, scenario label, "Documentation"/"Save Model"/"Recalculate" actions), KPI summary strip, two-column main grid (`leftCard`/`rightCard`), optional bottom stats row. `(src/components/playground/PlaygroundCalculatorShell.tsx · commit 671a20d)`
- **KPI-seeded pre-fill** — `usePlaygroundPrefill()` fetches each calculator's mapped fields from the dealership's most recent `assessment_kpi_values` via `PLAYGROUND_KPI_MAPPINGS` (`src/data/playgroundKpiMappings.ts`). Reverse Sales Funnel's `avgGrossProfitPerUnit` field pre-fills from `nvs_gross_profit_per_unit` when available, shown as a dismissible "Pre-filled from your assessment ({month year}) — editable" chip (EN+DE via `playground.prefillChip`). User edits override freely; no write-back to `assessment_kpi_values`. Unmapped fields remain manual entry. `(src/hooks/usePlaygroundPrefill.ts, src/data/playgroundKpiMappings.ts · commit 8f8f408)`

### db
- **`kpi_benchmark_thresholds` table (schema scaffold)** — `kpi_key`, `segmentation_key` (positioning + business_model composite, matching `benchmark_snapshots` convention), `healthy_min/max`, `warning_min/max`, `critical_min/max`, `source`, `updated_at`. RLS: read for all authenticated, no write policy (admin/migration-managed). No values seeded; not yet wired to any UI beyond the existing "Benchmark coming soon" state. `(supabase/migrations/20260615000001_kpi_benchmark_thresholds.sql · commit 8f8f408)`

### fix
- **Design-language restyle** — `Playground.tsx`, `PlaygroundCalculatorShell.tsx`, and `ReverseSalesFunnelPage.tsx` updated to match the app's standard tokens: Inter font, `text-[#172B4D]` headings, `border-[#DFE1E6]` card borders, `shadow-card`, `bg-[#1D7AFC]` brand blue, `text-[10px] font-semibold uppercase tracking-[0.08em]` eyebrow labels, and shadcn `Button`/`Badge` components. No logic, routing, or prefill changes. `(commit 0ed73c7)`

### Notes
- All 259 tests pass; build clean (~24-25s, pre-existing chunk-size warnings only)
- No new npm packages
- 11 of 12 Playground calculators remain "Coming Soon" (planned, not built)

---

## [2026-06-02] — DealerPanel Hero Refinement

### feat
- **Pill-style tab strip** — active tab chip uses `bg-white/10 text-white rounded-full px-4 py-1.5`; inactive tabs render as `text-white/50`; strip uses `bg-background border-b border-border` creating a visual break between the dark hero and the scrollable body. `(DealerPanel.tsx · commit 3a2328f)`
- **Action counts added to PanelData** — new `actionCounts` query in `fetchData` counts all `improvement_actions` by status (Open / In Progress / Completed) across the dealer's completed assessment IDs. `PanelData` interface extended: `{ pending: number; inProgress: number; completed: number }`. Queries run in parallel with `Promise.all`. `(DealerPanel.tsx · commit 0649c07)`

### fix
- **DealerPanel dark hero card** — `DialogHeader` replaced with `bg-[#0b1f3a] text-white px-6 py-5` four-column grid matching the dealer and coach dashboard dark hero design. Columns: Overall Score (score number + progress bar + maturity badge) · Actions Status (pending / in-progress / completed counts) · Next Visit (date + status chip + "Schedule →" link) · Critical Gaps (count of depts with score <46 + "dept(s) below benchmark" label). Dealer name + location shown as `text-lg font-semibold text-white` row above the grid. `(DealerPanel.tsx · commit 0db4a0c)`
- **TopFocusActionsCard removed from above-tab zone** — static focus action cards removed from the non-scrolling hero area; the hero now shows action counts (pending/in-progress/completed) instead. Focus actions remain visible in the Activity Log tab. `(DealerPanel.tsx · commit a195ad7)`
- **Department health badge overflow** — single-row dept flex layout replaced with two-row layout. Row 1: `flex justify-between` (dept name left, score + delta right). Row 2: full-width progress bar + `flex-shrink-0` status badge on its own line. Badge no longer clips outside the 256px sidebar card boundary at any viewport. `(DealerPanel.tsx · commit 5ca94e9)`
- **actionCounts null/error guard** — null status values excluded from count query; `handleActionCountsError` added; all `fetchData` sub-queries parallelised with `Promise.all` reducing load time by ~40%. `(DealerPanel.tsx · commit 5fd3b2b)`
- **Duplicate `AlertCircle` import removed** — stale import cleaned up after component refactor. `(commit 5ca94e9)`

### Notes
- No schema changes
- No new npm packages
- Zero TypeScript errors

---

## [2026-05-29] — Sprint 13: Coach Briefing Pack Full-Width Redesign

### feat
- **Full-width DealerPanel command centre** — `DealerPanel` completely rewritten from `Dialog max-w-2xl` (narrow ~672px box) to `Dialog w-[95vw] max-w-7xl h-[90vh] flex flex-col gap-0 p-0 overflow-hidden`, centered in viewport. Fixes the dialog appearing off-centre on wide viewports. Header and tab strip are sticky / non-scrolling; the two-column body scrolls independently. `(DealerPanel.tsx · commit c85064c)`
- **Two-column body layout** — Left column `flex-1 min-w-0 overflow-y-auto border-r border-border` (focus actions + tab feed). Right column `w-80 shrink-0 overflow-y-auto p-4 space-y-4` (sidebar cards). Below `md` breakpoint the columns stack vertically. `(DealerPanel.tsx · commit c85064c)`
- **TopFocusActionsCard** — Top 3 focus actions rendered above the tab strip in the left column. Each card shows: priority icon (AlertTriangle = critical/high · Square = medium), action title, due-date badge ("DUE IN X DAYS" red when ≤14 days remaining · "HIGH PRIORITY" amber otherwise), department tag chip, stale warning when >14 days without a status update, "Open Steps →" link navigating to `/app/results/:assessmentId`. `(DealerPanel.tsx · commit c85064c)`
- **DeptHealthCard** — Right sidebar Card 1. Per-department row: truncated dept name (`w-28`) · score progress bar (colour-banded per §2.3) · score number · gap vs STATIC_BENCHMARKS (▲/▼ with colour) · status chip (Performing / Developing / Foundational). "Full Assessment →" link navigates to `/app/results/:latestAssessmentId`; disabled when null. `(DealerPanel.tsx · commit c85064c)`
- **UpcomingVisitCard** — Right sidebar Card 2. If `upcomingVisit` exists: shows date, status badge, notes preview, visit type. "Confirm" button marks a proposed visit as confirmed (shown only when status = proposed); "Modify" button switches to the Visit History tab. If no upcoming visit: muted placeholder + "Schedule →" link. `(DealerPanel.tsx · commit c85064c)`
- **InsightCard** — Right sidebar Card 3 (conditional). Dark background with "INSIGHT" badge. Shown only when the latest assessment is >60 days old or null. "Request Reassessment →" navigates to `/app/results/:latestAssessmentId` (disabled if null). `(DealerPanel.tsx · commit c85064c)`
- **CoachNotesTab extracted** — Notes-only filtered feed + compose box extracted into its own tab (Coach Notes). Replaces the previous Briefing tab. No visit or assessment entries appear in this tab. `(DealerPanel.tsx · commit c85064c)`
- **BriefingTab deleted** — All content redistributed: dept health and upcoming visit → right sidebar cards; top actions → left column above tabs. Tab order changed from `['activity', 'visits', 'briefing']` to `['activity', 'visits', 'notes']`. `initialTab` default changed to `'activity'`. `(DealerPanel.tsx · commit c85064c)`
- **criticalGaps computed client-side** — `criticalGaps = count of depts where assessmentScores[dept] < 46` derived from existing PanelData; no additional DB query. `(DealerPanel.tsx · commit c85064c)`

### fix
- **CoachDashboard DealerPanel wiring restored** — A prior unstaged change had deleted the `DealerPanel` import, three state vars (`panelOpen`, `panelDealer`, `panelInitialTab`), the full render block, and the `onVisitSaved` handler — while leaving the ghost button `onClick` handlers that called the deleted setters (silent runtime errors, no TypeScript warning). All restored with `onVisitSaved` re-fetching `coach_visits` on save. `(CoachDashboard.tsx · commit f5024fb)`
- **Dealer card click-to-open** — Entire dealer card is now `cursor-pointer` with `onClick` setting `panelDealer` + `panelOpen`. "Enter Dealership →" CTA uses `e.stopPropagation()` to prevent double-trigger. `(CoachDashboard.tsx · commit f5024fb)`
- **Ghost button targets corrected** — Notes button → `'activity'` · Visits button → `'visits'` · Briefing button → `'activity'` (briefing tab removed). `(CoachDashboard.tsx · commit f5024fb)`
- **Merge conflict markers cleared** — Leftover `<<<<<<<` / `=======` / `>>>>>>>` markers removed from `CoachDashboard.tsx` after a botched merge. `(commit e316855, f5024fb)`

### db
- No schema changes this sprint

### Notes
- No new npm packages
- Zero TypeScript errors

---

## [2026-05-25] — Sprint 12: Coach Dashboard UX Overhaul

### feat
- **Sheet → Dialog conversion (all 4 coach sheets)** — `VisitSheet`, `CoachNoteSheet`, `VisitLogSheet`, `VisitBriefingSheet` converted from `<Sheet side="right">` (slides from the right edge) to `<Dialog>` (centered modal overlay). `max-w-md` for simple forms, `max-w-lg` for content-heavy dialogs. Import changed from `Sheet / SheetContent / SheetHeader / SheetTitle` to `Dialog / DialogContent / DialogHeader / DialogTitle` from `@/components/ui/dialog`. Fixes the "opening on the right hand side" UX complaint on wide monitors. `(VisitSheet.tsx · CoachNoteSheet.tsx · VisitLogSheet.tsx · VisitBriefingSheet.tsx)`
- **Visit negotiation (dealer side)** — Dealer can Accept, Decline, or Counter-propose visit dates from the dashboard banner. Counter-propose opens a date picker inline. Coach receives a notification badge when dealer responds. Confirmed visits sync status to the OEM read-only view. `(Dashboard.tsx · VisitSheet.tsx)`
- **Briefing hub coherence** — All four coach dialogs (Notes, Calendar, History, Briefing) cross-reference each other via navigation links. Briefing tab reframed as a read-only intelligence hub summarising all interaction history, rather than a standalone form. `(VisitBriefingSheet.tsx · CoachDashboard.tsx)`

### fix
- **Field Notes removed from CoachDashboard main view** — Entire Field Notes section (section heading, note list, "+ New Note" row) removed from the main `CoachDashboard.tsx` page. Notes remain accessible via the dealer panel's Coach Notes tab. Removes the redundant bottom section that duplicated panel-level data. `(CoachDashboard.tsx · commit 5c7f28d)`
- **Dealer card score ring prominence** — `ScoreGauge` ring resized for visual hierarchy; score number updated to `.text-metric-lg .numeric` class for better readability at card size. `(CoachDashboard.tsx)`
- **BriefingTab layout rebuilt** — Replaced the vertical data-dump layout with card-based sections (department health summary, upcoming visit, top 3 actions). Structural predecessor to the full-width two-column redesign in Sprint 13. `(DealerPanel.tsx · commit 832e718)`
- **Tab strip padding increased** — Pill tab horizontal padding increased to `px-4 py-1.5` for touch-target compliance (minimum 44px hit area). `(commit c29cebe)`

### db
- No schema changes this sprint

### Notes
- Zero new npm packages
- Lovable-led UI sprint; Claude Code owned: visit negotiation DB/logic
- Full-width DealerPanel command centre deferred to Sprint 13 (scoped separately)

---

## [2026-05-19] — Security Audit + Benchmark Methodology (#50)

### security
- **Unauthenticated email relay patched (HIGH)** — `send-notification` Edge Function had zero auth; any external caller could send arbitrary emails via our Resend account. Fixed: `verify_jwt=true` added to `config.toml` + explicit `role === 'service_role'` check inside the function. Only server-to-server service-role callers can now invoke the raw email relay. `(commit a841a22)`
- **`notify-dispatcher` arbitrary email_to patched (HIGH)** — notification hub accepted any `email_to` value, enabling spam relay to arbitrary addresses. Fixed: `verify_jwt=true` added; `email_to` now validated against the recipient user's registered email via `supabaseAdmin.auth.admin.getUserById()` before any email is sent. `(commit a841a22)`
- **HTML injection in invite emails patched (MEDIUM)** — `send-invite` interpolated `inviterName`, `dealershipName`, and `roleLabel` (from DB profile/dealership records) directly into HTML email templates without escaping. A malicious org owner could inject HTML event handlers via their display name or dealership name. Fixed: `escapeHtml()` helper added; all user-controlled values escaped before template interpolation. `(commit a841a22)`
- **Cross-org dealer enumeration patched (MEDIUM)** — `lookup_dealer_by_email` RPC (SECURITY DEFINER) returned `organization_id` for any dealer on the platform by email, allowing a verified OEM admin to map competitor email addresses to org identities. Fixed: `organization_id` removed from RPC response (migration `20260519140000`); `OemNetworkSettings` now fetches `organization_id` separately via the additive OEM RLS policy on `dealerships`. Add-dealer flow unaffected. `(commit a841a22)`

### docs
- **Benchmark methodology document (#50)** — full 1-pager drafted covering: source categories (generic / verified / OEM-specific / estimated), geographic scope (Western Europe + NADA reference), date range (Q4 2024), update cadence (annual), full KPI benchmark inventory across NVS / Service / Parts / Financial with confidence levels and sample sizes, scoring/benchmark interaction model, limitations and governance contacts. Ready to paste into Google Docs for OEM procurement.

### security-audit findings cleared as false positives
- Invite token reuse — email match enforced at DB level, FOR UPDATE lock, 7-day expiry, single-use status flag — well hardened
- ActionSheet PATCH query-param bug — not found in current codebase, likely resolved in earlier sprint
- Client writes to `action_audit_log` — RLS correctly returns 403; no data leak, functional issue only
- CoachDashboard actor_type enforcement — client-side check is defence-in-depth; RLS on `coach_dealership_assignments` enforces server-side

### notes
- No new npm packages
- SQL migration applied live: `20260519140000_fix_lookup_dealer_network_guard`
- Anon key remains hardcoded in `cron_use_anon_key.sql` — accepted low risk (anon key is public by design; service_role key and Resend key confirmed absent from all git history)

---

## [2026-05-19] — Sprint 11: Notification System Full Build (#70–#73, #77–#78)

### feat
- **Notification infrastructure (#70)** — `notifications` + `notification_preferences` tables, `notify-dispatcher` Edge Function (Resend), Supabase Realtime bell with unread badge, notification preferences UI (email / weekly digest / stale nudge / milestone toggles). pg_cron schedules live: stale action check daily 08:00 UTC, weekly digest Monday 07:00 UTC.
- **Stale action nudge engine (#71)** — `process_stale_actions()` SECURITY DEFINER function flags actions with no status update in Critical=7d / High=14d / Medium=21d. Inserts in-app notification + fires email via Edge Function. `stale_nudge_sent_at` + `last_status_updated_at` columns on `improvement_actions`.
- **Tokenised one-click email reply (#72)** — Stale action nudge emails include [Mark In Progress] / [Mark Complete] buttons. HMAC-SHA-256 signed tokens (action_id + user_id + 72h expiry). New `action-token-update` Edge Function validates token, single-use nonce guard, updates `improvement_actions.status`, returns HTML confirmation page. `token_nonce` + `token_expires_at` columns added to `improvement_actions`.
- **Weekly action digest email (#73)** — `send_weekly_digests()` runs every Monday 07:00 UTC. Aggregates open/overdue count + top 3 actions per org, sends in-app + email to all active members (respects `weekly_digest` preference). React Email `WeeklyDigestEmail` template with open/overdue stat tiles and priority action table.
- **Coach commentary layer (#77)** — `coach_notes` table (coach_user_id, dealership_id, assessment_id, action_id, note_text) with 3-way RLS (coach CRUD / dealer read own dealership / OEM read network). **Coach Notes panel** added to dealer dashboard: shows latest 5 notes with coach name, relative timestamp, action badge. Anchored at `#coach-notes` for bell navigation.
- **Coach commentary notifications (#78)** — `notify_on_coach_comment()` SECURITY DEFINER trigger fires AFTER INSERT on `coach_notes`. Inserts one `in_app` / `coach_comment` notification per active owner/admin member of the dealership's org. In-app bell updates in real time via Supabase Realtime.
- **React Email templates** — 5 Deno-compatible TSX components in `supabase/functions/_templates/`: `BaseEmail` (brand wrapper), `StaleActionEmail` (priority badge + one-click buttons), `WeeklyDigestEmail` (stat tiles + action table), `MilestoneEmail` (progress bar + reassess CTA), `CoachCommentEmail` (reserved). Replaced 120 lines of raw HTML string builders in `notify-dispatcher`.
- **Notification bell routing** — `handleMarkRead` extended: `coach_note` entities check `action_id` → `/app/actions` or `/app/dashboard#coach-notes`; `digest` / `milestone` / `stale_action` → `/app/actions`.

### fix
- **Cron email dispatch** — `ALTER DATABASE` restricted in Supabase SQL editor (no superuser). Fixed by embedding anon key directly in cron functions as a constant. `notify-dispatcher` has `verify_jwt=false`; Edge Function uses its own `SUPABASE_SERVICE_ROLE_KEY` env var for all admin DB ops.
- **Action-token-update base URL** — `tokenBaseUrl` corrected to use `SUPABASE_URL` (Supabase Edge Functions host) instead of `SITE_URL` (frontend host). Broken one-click email links would have 404'd in production.

### db
- `notifications` table + RLS (sprint already had this; now fully wired)
- `notification_preferences` table + RLS
- `improvement_actions`: `stale_nudge_sent_at`, `last_status_updated_at`, `token_nonce` (UNIQUE), `token_expires_at` columns
- `coach_notes` table + RLS (coach/dealer/OEM)
- `notify_on_coach_comment()` trigger function + trigger on `coach_notes`
- `process_stale_actions()` + `send_weekly_digests()` updated to use anon key
- Supabase types regenerated

### infra
- `notify-dispatcher` Edge Function — v3 deployed (React Email templates)
- `action-token-update` Edge Function — v1 deployed (public, `verify_jwt=false`)

### Notes
- 186 tests passing (4 new `CoachNotesPanel` tests added), zero TypeScript errors
- No new npm packages (React Email imports via `esm.sh` in Deno Edge Functions only — zero frontend bundle impact)
- Tracker items completed: #70, #71, #72, #73, #77, #78

---

## [2026-05-18] — Sprint 10: Knowledge Hub + Results/Action Plan Polish

### feat
- **Knowledge Hub** — unified `/app/knowledge` section replacing separate `/resources` and `/kpi-encyclopedia` routes. Single sidebar item ("Knowledge") with 3 tabs:
  - **Recommended** — score-driven gap cards: `mapSignalsToResources()` classifies department scores (CRITICAL_GAP <50 / HIGH_PRIORITY 50–64 / GROWTH_OPPORTUNITY 65–74), fetches matching resources from Supabase `resources` table via `topics[]` overlap, groups by department with signal badge. Dark `bg-slate-900` hero strip with 5 department score pills (health-coloured) and dynamic headline. Learning Paths section below gap cards: courses matching gap departments, with `user_learning_progress` progress bars and Start/Resume CTA.
  - **KPI Encyclopedia** — searchable grid of all 111 KPIs. Single-row filter: search input + department dropdown (all departments from data, sentence-cased). Uniform blue left border on all cards. No score overlay — pure knowledge base, equal for all users. "View details →" links to `/app/knowledge/kpi/:kpiKey`.
  - **Downloads** — filterable grid of articles, templates, case studies. Pill-based Type filter (All / Templates / Guides / Case Studies) + Sort (Most Recent / A–Z). Recommended Downloads strip above grid when assessment gaps exist.
- **`mapSignalsToResources` utility** (`src/lib/mapSignalsToResources.ts`) — pure function, 7 unit tests. Exports `GapCard`, `SignalType`, `DEPT_DISPLAY_NAMES`, `ResourceType`.
- **`useLatestAssessment` hook** (`src/hooks/useLatestAssessment.ts`) — TanStack Query hook; fetches latest completed assessment by `dealership_id` with fallback to `user_id` for org owners.
- **`user_learning_progress` DB table** — composite PK `(user_id, resource_id)`, FK cascade on user + resource delete, RLS: user reads/writes own rows only. (migration `20260517120000`)
- **KPI detail route** — `/app/knowledge/kpi/:kpiKey` renders existing `KPIExplorer` with breadcrumb and back navigation. `onKpiClose` prop added to `KPIExplorer`; fires `navigate('/app/knowledge?tab=kpi')` on ESC/X, preventing the old KPIExplorer list view from showing.
- **Old routes preserved as redirects** — `/resources` → `/app/knowledge`, `/kpi-encyclopedia` → `/app/knowledge?tab=kpi`.

### fix
- **Recommended tab empty state** — `useLatestAssessment` queried by `dealership_id` from `useActiveRole().dealerId`, which is null for org owners (uxRole='coach'). Added `user_id` fallback query when `dealerId` is null.
- **Knowledge Hub full-width** — removed `max-w-7xl` constraint from `KnowledgeHub.tsx` and `KpiDetailPage.tsx`.
- **KPI detail back-navigation** — closing KPI detail dialog (ESC or X) now navigates to `/app/knowledge?tab=kpi` instead of revealing KPIExplorer's own list view.
- **Kanban priority dots** — all dots now uniform blue (`#378ADD`); removed red/yellow priority colouring to match Roadmap view's consistent blue left border.
- **KPI Encyclopedia department dropdown** — kebab-case dept keys (e.g. `sales-process`, `ev-readiness`) now converted to sentence case via `toSentenceCase()` helper.

### removed
- **Results page Resources tab** — removed from Results 5-tab layout (now 4 tabs: Summary / KPI Analysis / Maturity Level / Action Plan). KPI encyclopedia links in Results updated to `/app/knowledge/kpi/:key` and `/app/knowledge?tab=kpi`.
- **Learning Paths tab** — merged into Recommended tab as a "Learning Paths" section; Knowledge Hub reduced from 4 to 3 tabs.
- **Timeline view** — removed from Action Plan view switcher (List / Kanban / Roadmap remain); `TimelineView` import and render branch removed from `ActionPlan.tsx`.
- **ResourceHub page** (`src/pages/ResourceHub.tsx`) — retired.
- **KPIEncyclopediaPage** (`src/pages/KPIEncyclopediaPage.tsx`) — retired.

### ui
- **Results header** — Export PDF + Retake Assessment buttons moved inline with "ASSESSMENT RESULTS" label row; "Current" freshness badge removed (stale banner below handles this).
- **Results duplicate stat strip** — removed Overall Score / Modules / Questions / Maturity Band row above the 4 summary cards (info was duplicated).
- **Downloads filter bar** — removed Department filter; Type and Sort unified as consistent pills.

### db
- `user_learning_progress` table added (see feat above)
- No other schema changes

### Notes
- 182 tests passing, zero TypeScript errors
- No new npm packages

---

## [2026-05-16] — Sprint 9: OEM Dashboard Full Redesign

### feat
- **OEM Dashboard — full visual redesign** — `OemDashboard.tsx` completely rewritten to match the Coach Dashboard design language. All changes are single-file, zero new packages, zero schema changes.
  - **Dark stats bar** — `bg-[#0b1f3a]` strip with 4 chips: NETWORK · AVG SCORE · CRITICAL GAPS · ENROLLED DEALERS; sticky top-0; identical pattern to Coach Dashboard
  - **Page header** — "OEM PERSPECTIVE · Q{N} {YEAR}" eyebrow + "Network Overview" H1 + enrolled dealership count subline
  - **Dark hero card** — Three-column `bg-[#0b1f3a]` card: (1) Network Performance — avg score, progress bar, maturity band, momentum delta from last cycle, contextual narrative; (2) Enrolled Dealers — total count, at-risk dealer count/names, all-clear state; (3) Dept Weaknesses — top 3 weakest depts across network with colour-coded prevalence bars (red >50%, amber >25%, blue otherwise)
  - **Dealer cards grid** — responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` replacing the old 4 stat cards; each card shows TierBadge + ScoreGauge (56px), dealer name + maturity band, location, top-3 weakest dept score bars, open action count + freshness ("assessed Nd ago"), "Enter Dealership →" CTA; skeleton loading state (3 placeholder cards); SharedEmptyState for 0 enrolled dealers
  - **`OemDealerCard` inline component** — self-contained card renderer; `onSelect` opens drill-down Sheet; `onNavigate` routes to Results page
  - **`getHeroNarrative()`** — 5-variant contextual narrative matching Coach Dashboard pattern (0 dealers / ≥85 / ≥70 / ≥46 / below 46)
  - **`getQuarterLabel()`** — derives current quarter label (Q2 2026 etc.)
  - **Full-width layout** — `max-w-7xl mx-auto` removed; matches Coach Dashboard width
  - **Leaderboard tab** — rank change arrows (▲/▼/—) added to rank column; Network Portfolio Heatmap title
  - **`openActionCount` data layer** — extra query to `improvement_actions` grouped by dealership; non-Completed actions counted per dealer and hydrated into `DealerScore`

- **OEM Network Settings — full width** — removed `max-w-4xl mx-auto` constraint from `OemSettings.tsx`; matches other portal pages

### fix
- **Dealer roster table** — removed Programme Tier column (badge + Select dropdown) from OEM Network Settings dealer roster; table now shows Dealer · Location · Enrolled · Remove only
- **Dealer roster table alignment** — Location, Enrolled columns centre-aligned in both headers and data cells
- **OEM sidebar nav** — Dashboard and entire Diagnostic section (New Assessment, History, Action Plans) hidden from `actorType === 'oem'` users; OEM users see only OEM Dashboard + Network Settings + Reference

### db
- No schema changes this sprint

### Notes
- 175 tests passing, zero TypeScript errors
- No new npm packages

---

## [2026-05-16] — Sprint 8: OEM Dashboard Polish + Bug Fixes + RLS Fix

### feat
- **OEM Dashboard — 3 new insight cards** (Sprint 8):
  - **Network Momentum** — computes avg score delta across all dealers with 2+ assessments; shows ↑/↓/— direction, delta pts, from→to avg; "not enough data" fallback when <2 dealers have trend
  - **Assessment Coverage** — categorises enrolled dealers into healthy (<90d), stale (>90d), missing (no assessment); green all-clear or amber alert list with "Manage" CTA
  - **Network Insights** — dept weakness bar chart (top 3 depts below threshold 60, colour-coded by network prevalence) + recurring signal codes dot-matrix (top 5 signal codes across network, amber dots)
- **OEM Dashboard — visual polish** — skeleton loading shapes in heatmap/at-risk sections; `min-w-[600px]` on heatmap table for mobile; empty state when dealers enrolled but no assessments; filtered leaderboard avg uses `filteredDealers` (not all dealers) when tier filter active
- **Results page — OEM context banner** — when `actorType === 'oem'` views a dealer's results via OEM drill-down, a sticky info banner renders: Globe icon + "Viewing as OEM · {dealer name}" + TierBadge + "← Back to OEM Dashboard" button

### fix
- **KPIExplorer DialogContent** — missing `DialogTitle` added (sr-only); resolves React accessibility warning. All other `DialogContent` usages were already correctly titled.
- **action_audit_log 403** — verified no client-side INSERT calls exist; inserts handled by DB trigger only. Bug already resolved.
- **ActionSheet PATCH body** — verified `performUpdate` in `ActionPlan.tsx` uses Supabase client `.update()` correctly. Bug already resolved.

### security
- **OEM ↔ dealer_network_memberships RLS circular recursion fixed** — `oem_networks` had a SELECT policy ("Members can read their networks") that joined `dealer_network_memberships`; `dealer_network_memberships` had SELECT/UPDATE/DELETE policies that joined `oem_networks` back — creating an infinite recursion loop that returned 403 on any `oem_networks` client query. Fixed by:
  1. Dropping the recursive `oem_networks` policy
  2. Creating `private.user_is_member_of_network_owner(uuid)` and `private.user_is_admin_of_network_owner(uuid)` SECURITY DEFINER functions in the `private` schema (bypass RLS by design)
  3. Recreating all `dealer_network_memberships` policies to call the private functions instead of directly joining `oem_networks` `(migration 20260516090000)`

### feat (utilities)
- **`oemDashboardUtils.ts` — 4 new functions** (TDD, all tested):
  - `computeNetworkMomentum(dealers)` — avg score delta, direction, sampleSize, fromAvg, toAvg; requires sampleSize ≥ 2
  - `computeCoverage(dealers)` — categorises into missing/stale/healthy using `STALE_THRESHOLD_DAYS = 90`
  - `computeDeptWeaknessCounts(dealers, threshold)` — count of dealers below threshold per dept; ignores null scores
  - `extractTopSignals(signalCodes[][])` — top 5 most frequent signal codes across network; `WEAKNESS_THRESHOLD = 60`
- **`ScoreGauge` extracted to shared component** — `src/components/shared/ScoreGauge.tsx`; previously inline in `CoachDashboard.tsx`; now reused by `OemDashboard.tsx`

### db
- `dealership_invites.dealership_id` — column made nullable (migration `20260515213746`); OEM invites don't belong to a specific dealership

### Notes
- 175 tests passing (39 new utility tests), zero TypeScript errors
- No new npm packages

---

## [2026-05-15] — Sprint 7: OEM Invite System + OEM Dashboard v1

### feat
- **OEM invite flow** — end-to-end email invite for `actor_type='oem'` users
  - `InviteOemUser` component (mirrors `InviteCoach` pattern) — email input, pending invite list with copy/revoke; placed in Account → Team tab and OEM Settings
  - `send-invite` edge function extended — `invite_type='oem'` branch; `dealership_id` optional for OEM; auth guard: org owner/admin + active `oem_network`; OEM-specific email template ("Accept OEM Invitation")
  - `accept_dealership_invite` RPC — new `'oem'` branch sets `actor_type='oem'` + `active_organization_id`; redirects to `/app/oem-dashboard`
  - `AcceptInvite.tsx` — `invite_type === 'oem'` case added to redirect switch
  - `OemSettings.tsx` — `InviteOemUser` rendered below `OemNetworkSettings` for OEM actors

- **OEM Dashboard v1** — tabs layout (Overview / Leaderboard), dept weakness heatmap, at-risk dealer list, leaderboard with tier filter + weakest dept column, dealer drill-down Sheet (score ring, dept bars, score history, "Open Full Report")
- **`oemDashboardUtils.ts`** — `DeptKey` type, `DEPT_KEYS`, `DEPT_LABELS`, `AT_RISK_THRESHOLD = 46`, `parseDeptScores`, `getDeptCellClass/BgClass/TextClass`, `networkAvgByDept`, `getWeakestDept` (21 tests)
- **OEM sidebar** — Dashboard and Diagnostic sections hidden from OEM users in `AppSidebar.tsx` (`actorType !== 'oem'`)

### db
- `dealership_invites.invite_type` — `'oem'` added as valid value (no column change, string type)
- `accept_dealership_invite` RPC — `'oem'` branch added via Supabase MCP `execute_sql`
- Supabase TypeScript types regenerated

### Notes
- 157 tests passing, zero TypeScript errors
- No new npm packages

---

## [2026-05-14] — Sprint 4 Hardening + Sprint 5: Coach Capabilities

### security
- **profiles actor_type privilege escalation patched** — `UPDATE` policy on `profiles` lacked a `WITH CHECK` clause. Any authenticated user could call `supabase.from('profiles').update({ actor_type: 'oem' })` and silently escalate their own role. Fixed by adding `WITH CHECK` that prevents `actor_type` from being modified via direct client calls — changes must go through SECURITY DEFINER functions only. `(migration 20260514000000)`

### fix
- **action_audit_log 403** — client was making direct REST inserts that returned 403 due to RLS. Replaced all three client-side insert blocks in `ActionPlan.tsx` with a SECURITY DEFINER DB trigger (`trg_improvement_action_audit`) that fires on INSERT/UPDATE of `improvement_actions`. Trigger logs `created`, `status`, and `action_title` field changes automatically. `(migration 20260514000001 · ActionPlan.tsx)`
- **Coach sidebar duplicate "Dashboard"** — coaches saw both "Dashboard" (dealer UI) and "Coach Dashboard" in the sidebar. Entire Diagnostic section (History, Action Plans, New Assessment) also visible to coaches, causing confusing redirects. Fixed: Dashboard item hidden for `actorType === 'coach'`; Diagnostic section hidden entirely for coaches. `(AppSidebar.tsx)`
- **Coach auto-lands on dealer dashboard** — navigating to `/app/dashboard` as a coach showed the dealer UI. Added redirect: `if (actorType === 'coach') return <Navigate to="/app/coach-dashboard" replace />`. `(Dashboard.tsx)`
- **"View Results" broken for coach** — `Results.tsx` queried assessments with `.eq('user_id', user.id)` unconditionally. Coaches have a different `user_id` than the dealer, so results were never found. Fixed: `.eq('user_id')` filter only applies when no `routeAssessmentId` is present (history browse). Direct URL access uses RLS for authorization. `(Results.tsx)`
- **"View Results" pointing to in-progress assessment** — `latestAssessmentId` in CoachDashboard used `records[0]` (latest assessment regardless of status). If dealer had an in-progress assessment on top, the button pointed to it, which Results.tsx then filtered out. Fixed: `latestAssessmentId` now uses first **completed** assessment only. `(CoachDashboard.tsx)`
- **"Start Assessment" CTA on coach dealer cards** — coaches should not start dealer assessments. Button replaced with "No assessment yet" text. `(CoachDashboard.tsx)`
- **Action Tracker showing all historical actions** — `CoachActions.tsx` fetched all `improvement_actions` across all assessments ever. Fixed: now fetches assigned dealerships → latest completed assessment per dealer → actions for those IDs only. `(CoachActions.tsx)`
- **Action status mismatch (open count = 0, badges blank)** — `CoachActions.tsx` used lowercase status values (`'open'`, `'in_progress'`, `'completed'`) while the DB stores titlecase (`'Open'`, `'In Progress'`, `'Completed'`). All status comparisons, filter options, and badge styles fixed to match DB values. Open count now counts anything ≠ `'Completed'`. `(CoachActions.tsx)`
- **"In Progress" badge wrapping to two lines** — status badge lacked `whitespace-nowrap`. Added to all status style classes. `(CoachActions.tsx)`
- **Coach action updates not saving (silent RLS block)** — coaches had a SELECT policy on `improvement_actions` but no UPDATE policy. Supabase silently returns 0 rows updated when RLS blocks — no error thrown. Coach edits via ActionSheet were accepted client-side but never persisted to DB. Added UPDATE policy matching the existing SELECT policy (coach must be actively assigned to the dealership). `(migration 20260514000005)`

### feat
- **Multi-OEM network grouping tabs** — coach dashboard now fetches `dealer_network_memberships → oem_networks` for all assigned dealers. Dealer cards grouped by OEM programme with pill tabs: `All Networks | BMW Network | Audi Tier 1 | …`. Selecting a tab filters dealer cards, stats bar, and actions section. `(CoachDashboard.tsx)`
- **Visit scheduling** — new `coach_visits` table with full RLS: coach can propose visits; dealer can confirm or cancel; OEM can view read-only. Unique partial index enforces one active visit per coach+dealer pair. New `VisitSheet` component (shadcn Sheet + Calendar) opens from dealer card calendar icon. Active visit shown as green chip on card. `(migration 20260514000002 · VisitSheet.tsx · CoachDashboard.tsx)`
- **Dealer visit confirmation banner** — dealer dashboard shows a coloured banner when a coach has proposed or confirmed a visit. Blue = proposed (with Confirm button); green = confirmed. Banner fetches `coach_visits` for the dealer's `active_dealership_id`. Real-time update on confirm. `(Dashboard.tsx)`
- **Notes polish** — `CoachNoteSheet` now includes a note type selector (`observation | action | follow-up`) stored in new `coach_notes.note_type` column. Type badge shown in Field Notes feed. Delete button added to each note (own notes only). `(migration 20260514000003 · CoachNoteSheet.tsx · CoachDashboard.tsx)`
- **Resource reference panel** — new "Resources" tab in CoachDashboard. Two sub-panels: (1) KPI Reference — searchable list sourced from `kpiDefinitions.ts` with label, definition, benchmark; (2) Action Playbooks — `actionTemplates.ts` filterable by department with implementation steps. Pure client-side, no new DB queries. `(CoachDashboard.tsx)`
- **Identical ActionSheet for coach and dealer** — coaches can now click any action row in Action Tracker to open the same full ActionSheet the dealer uses (context intelligence, KPI panel, triage scores, all fields). Replaced the inline status dropdown. `(CoachActions.tsx)`
- **Real-time action sync (bidirectional)** — `CoachActions.tsx` subscribes to `improvement_actions` changes via Supabase Realtime; `ActionPlan.tsx` (dealer) subscribes filtered to the current `assessment_id`. Changes by either party reflect in the other's view without page refresh. `(CoachActions.tsx · ActionPlan.tsx)`
- **Action activity feed — comments + audit trail** — new `action_comments` table (RLS: org members + assigned coaches can read/write; users can only delete their own). New `ActionActivityFeed` component renders inside ActionSheet (edit mode only): merged chronological timeline of automatic audit log entries (field changes) and manual comments. `action_audit_log` now has a SELECT policy so clients can read it. Author display uses `profiles.display_name / full_name / email`. Real-time via Supabase channels. Ctrl+Enter to post. Delete own comments on hover. Both dealer and coach see the same feed. `(migration 20260514000004 · ActionActivityFeed.tsx · ActionSheet.tsx)`

### db
- `coach_visits` — new table, 4-policy RLS, partial unique index for one active visit per coach+dealer, `updated_at` trigger `(migration 20260514000002)`
- `coach_notes.note_type` — nullable column, check constraint `(observation | action | follow-up)` `(migration 20260514000003)`
- `action_comments` — new table, 3-policy RLS (select/insert/delete) `(migration 20260514000004)`
- `action_audit_log` — SELECT policy added (was insert-only via trigger, unreadable by clients) `(migration 20260514000004)`
- `get_actor_label(uuid)` — new SECURITY DEFINER function returning role label for a user_id `(migration 20260514000004)`
- `improvement_actions` — UPDATE policy added for coaches `(migration 20260514000005)`
- Supabase TypeScript types regenerated after all migrations `(types.ts)`

### Notes
- 136 tests passing, zero TypeScript errors
- No new npm packages
- Coach dashboard visual redesign deferred to next sprint (Stitch mockups ready)
- OEM dashboard redesign deferred to next sprint
- Assessment templates / OEM question weighting deferred to Sprint 6

---

## [2026-05-15] — Sprint 6: Coach Dashboard Redesign

### feat
- **Coach dashboard — full visual redesign** — `CoachDashboard.tsx` completely rewritten to match the dealer dashboard design language. Single-file change, zero new packages, zero schema changes.
  - **Dark stats bar** — "Dealers / Avg Score / Overdue Actions / Critical Gaps" chips (renamed from "Attention Needed"; Critical Gaps counts dealers with score < 46)
  - **Page header** — "COACHING PERSPECTIVE · Q{N} {YEAR}" eyebrow + "Field Performance Dashboard" H1 + Export Report placeholder button
  - **Dark hero card** — Three-column `bg-[#0b1f3a]` card: (1) Portfolio Score — avg score, progress bar, maturity band, 5-variant narrative; (2) Open Actions — total count + top 2 overdue items; (3) Focus Dealer — lowest-scoring dealer with severity label
  - **5-chip timeline strip** — Last Visit / Next Visit / Assessments Due / Overdue Actions / Action Plan Review; data sourced from `coach_visits` + existing state; status dots colour-coded
  - **OEM brand-styled dealer cards** — card border top `3px solid {accent}` per brand colour (BMW blue, Audi red, Mercedes charcoal, VW blue, etc.); Clearbit OEM logo via `<img>` (no new package) with branded initials fallback; circular SVG score gauge; action plan progress bar (X / Y on track); visit chip with confirmed/proposed colour; "Enter Dealership →" CTA
  - **Compact sort + filter controls** — replaced button group + separate filter icon with two compact Select dropdowns; "View Map →" external Google Maps link derived from dealer locations
  - **Network Actions Requiring Attention** — richer 6-column table: priority dot · action · dealership (full name, brand logo) · due date/days stale · derived status badge (BLOCKED/STALLED/IN PROGRESS/ASSIGNED) · priority badge; Overdue/Stale/All Open tabs + All dealers select + View all → on one unified row; all columns centre-aligned
  - **Field Notes** — dealer name chip uses brand accent colour instead of generic blue Badge
  - **Score Trend card removed** — recharts + Checkbox imports also removed (bundle −65 kB)
  - **Full-width layout** — `max-w-7xl mx-auto` constraint removed; matches dealer dashboard width

- **Action Tracker — layout and alignment fixes** — `CoachActions.tsx`: full-width layout (removed `max-w-7xl mx-auto`); Status and Due Date columns header + cell now `text-center` / `flex justify-center`

### fix
- **Actions scoped to latest assessment** — `CoachDashboard.tsx` and `CoachActions.tsx` were fetching `improvement_actions` across all historical assessment IDs per dealer. Inflated action counts to 400+. Fixed: actions query now uses only the latest completed assessment ID per dealer, computed before the query runs.
- **Dealer card icon language** — replaced 📍/📅 emojis with `MapPin`/`Calendar` lucide icons to match app design language
- **Dealer card bottom row** — note/calendar icon buttons and "Enter Dealership →" CTA consolidated onto a single `flex items-center justify-between` row (was two separate rows)
- **VW Clearbit logo** — Clearbit domain updated from `volkswagen.com` → `vw.com` for correct logo resolution
- **Active visits sort order** — `coach_visits` query for proposed/confirmed visits now includes `.order('visit_date', { ascending: true })` so "Next Visit" timeline chip always shows the soonest upcoming visit (was non-deterministic Map insertion order)
- **Unused import removed** — `isDueSoon` removed from `coachDashboardUtils` import (was imported but never used after table refactor)

### db
- No schema changes this sprint

### Notes
- Zero new npm packages
- Zero TypeScript errors
- Bundle size reduced by ~65 kB (recharts removed from CoachDashboard)
- OEM dashboard redesign deferred to Sprint 7
- Network Pattern Detection (cross-dealer signal intelligence) deferred — intelligence layer planned for Sprint 7
- Assessment templates / OEM question weighting deferred to Sprint 7

---

## [2026-05-10] — Sprint 3: Dashboard Redesign

### feat
- **Dashboard — full redesign** — `src/pages/Dashboard.tsx` completely rewritten. Static placeholder KPI grid (fake €values, 3 of 5 departments) replaced with a real-data layout wired to Supabase assessment scores, improvement actions, and coach assignments.
- **dashboardUtils.ts** — New `src/lib/dashboardUtils.ts`. 16 pure utility functions: `deptScoreColour`, `deptMaturityColour`, `isOverdue`, `formatDisplayDate`, `formatDueDate`, `quarterLabel`, `nextAssessmentDue`, `endOfCurrentQuarter`, `relativeDays`, `deptFindingText`, `focusDepartment`, `criticalGapCount`, `heroNarrative`. Two constants: `DEPT_DISPLAY_NAMES`, `DEPT_ORDER`. 38 unit tests in `src/__tests__/dashboardUtils.test.ts`.
- **Dark stats bar** — `#0b1f3a` strip matching AssessmentHeroNav. Four chips: Overall Score, Assessment date, Critical gaps (red when > 0), Open actions. Avatar shows first letter of user email.
- **Full-width hero card** — Three equal dark columns on `#0b1f3a` background. Col 1: 72px overall score, gradient progress bar, maturity pill, executive narrative. Col 2: open action count (white, not amber), top 3 action bullets with full dept names. Col 3: lowest-scoring department name + score + maturity + finding text. All text white — no yellow, no amber, no orange.
- **Key dates timeline** — 5-slot horizontal strip: Last Assessment, Next Assessment Due (+90 days), Last Coach Visit, Next Coach Visit, Action Plan Review (end of quarter). Each slot has a coloured dot, date, sub-detail, and status badge. Coach slots read from `coach_dealership_assignments.valid_from/valid_to`.
- **Priority Intervention card** — Only rendered when a department scores < 45 (Foundational). Red left-border card with "Priority Intervention Required" label, focus dept context, "Resolve Now" → `/actions?filter=critical`.
- **Departmental Intelligence grid** — Renders only assessed departments (skips unassessed depts for sales-only 2S/3S dealerships). Each column: full dept name, 38px score, maturity label, diagnostic finding paragraph. Colour rules: green = Leading (≥85), brand blue = Advanced + Developing (45–84), red = Foundational (<45). No yellow/amber anywhere.
- **Open Actions table** — Borderless table: Action | Department | Responsible | Due. Dot: red = overdue, brand blue = pending (exactly two colours). Due cell appends "· Overdue" in red. Full dept names via `DEPT_DISPLAY_NAMES`. Filters `.neq('status', 'Completed')` matching the kanban's actual status values. Navigates to `/actions`.
- **Strategic Findings** — Score-derived signals: critical finding for any dept < 45, systemic finding when 2+ assessed depts below 65. Lucide `AlertCircle` (red) and `Info` (blue) icons. Badges in sentence case ("Critical risk", "Medium impact"). No blue caps links.
- **Empty state preserved** — "Run your first dealership diagnostic" card shown when no completed assessments exist.

### fix
- **Action status filter** — Was `.neq('status', 'completed')` (lowercase). Kanban stores `'Completed'` (capital). Completed actions now correctly excluded from the dashboard count and table.
- **"View all in Action Plans" navigation** — Route corrected to `/actions` (was `/app/actions` — wrong path).
- **Hero narrative invisible** — `text-white/38` (38% opacity) was unreadable against the dark hero. Changed to `text-white/60`.
- **Performance Matrix label removed** — Decorative "Performance Matrix ⓘ" text with no functionality removed from Departmental Intelligence section header.
- **Unassessed departments showing 0** — Sales-only 2S dealerships were showing "Service Operations 0 — Foundational" and "Parts & Accessories 0 — Foundational". DeptGrid and deriveFindings now skip any department key absent from `assessment.scores`.
- **Full width layout** — `max-w-7xl mx-auto` constraint removed. Dashboard now uses full available width.
- **Coach query scoped** — `coach_dealership_assignments` query filtered by `dealership_id` from `useActiveRole()`. Previously unscoped — potential cross-tenant data issue.
- **Dynamic quarter label** — "before the Q2 deadline" text in Priority card now derives from actual assessment quarter. `heroNarrative` no longer hardcodes "Q2".
- **Coach visit status logic** — "Last Coach Visit" slot now checks `valid_from` against today to determine done/upcoming — not just whether a coach exists.

### refactor
- Removed static KPI grid (NVS/UVS/Service with fake €values), static AI Insights card, static Overall Performance card, assessment period selector dropdown, export button dropdown from old layout.

### docs
- Sprint 3 design spec: `docs/superpowers/specs/2026-05-10-sprint3-dashboard-design.md`
- Sprint 3 implementation plan: `docs/superpowers/plans/2026-05-10-sprint3-dashboard.md`

### Notes
- 114 tests passing, zero TypeScript errors on push
- No new npm packages, no schema changes, no Edge Functions
- Benchmark corridor deferred (needs live peer data)
- Delta scoring / trend arrows deferred (needs #36 DB design)

---

## [2026-05-09] — Sprint 2: Assessment Flow Redesign

### feat
- **AssessmentHeroNav** — New `src/components/assessment/AssessmentHeroNav.tsx`. Replaces the 320px left sidebar. Comprises: dark navy stat strip (est. time remaining + dealership name), hero header (section title · description · pulsing "Assessment in progress" badge), large 52px % complete metric card with gradient fill bar, and 5-tab section navigation. Tab progress bar is the sole active indicator — no border underline. Blue fill = in progress, green = complete.
- **Question card redesign** — `CategoryAssessment.tsx` fully refactored. Each card now has: `#D6E3FF` top bar with filled Q-badge + category + "Question N of M"; 18px/700 question text; 5 centered rating tiles with left-border + tint + checkmark on selection (no "Level X" labels); 2-column context strip (`#f4f6f8` bg) showing merged "Why this matters" prose and Linked KPI chips linking to KPI Encyclopedia in a new tab; "Add field coach notes" inline expand footer.
- **assessmentUtils.ts** — Three pure utility functions extracted to `src/lib/assessmentUtils.ts`: `mergeWhyThisMatters` (joins purpose + situationAnalysis + benefits into a single paragraph), `shortenSectionName` (strips "Performance"/"& Overall Performance" suffixes for tab labels), `estimateTimeRemaining` (30s per unanswered question). 12 unit tests in `src/__tests__/assessmentUtils.test.ts`.
- **Full-width layout** — Left sidebar removed from assessment page. Question cards span the full content width. Assessment page manages its own internal scroll so the hero nav is always visible.
- **Notification bell relocated** — Moved from top bar to sidebar footer (above user profile link). Visible as icon when sidebar collapsed.
- **Top bar removed** — Entire header strip (search field + bell) eliminated. Content fills from top of the canvas. Sprint 7 search placeholder removed with it.

### fix
- **CSS circular dependency** — `src/index.css:234` used `@apply gap-4` inside `.density-compact .gap-6` while `.density-compact .gap-4` was also defined, creating a PostCSS circular reference. Replaced with raw CSS values (`gap: 0.75rem` / `gap: 1rem`). Was blocking all production builds since Sprint 1 merge.
- **Merge conflict marker** — `src/pages/CoachDashboard.tsx` had an unresolved `<<<<<<< HEAD` marker (no `=======` / `>>>>>>>` pair) left from the Sprint 1 Lovable merge. Removed marker, restored missing `</div>` closing tag.
- **Sidebar collapse button** — Button was positioned `right-2` in both collapsed and expanded states, causing it to overlap the logo when the sidebar is collapsed to icon-only mode (56px wide). Fixed to `translate-x-1/2` when collapsed — button now pokes out from the sidebar's right edge, always visible.
- **"My Dealership" nav item** — Removed from sidebar Overview section; it was a duplicate of the user profile link already present in the sidebar footer.
- **User avatar in top bar** — Removed; avatar is available in the sidebar footer. Bell icon only was redundant after also moving bell to sidebar.
- **Assessment hero nav always visible** — `sticky` positioning inside `<main overflow-y-auto>` was not resolving correctly due to `min-h-screen` on the layout root. Fixed by: (1) changing layout root to `h-screen overflow-hidden`, (2) restructuring Assessment page to `h-full flex-col` with hero nav as `shrink-0` and questions in `flex-1 overflow-y-auto`. Hero nav now never enters the scroll flow.

### refactor
- `Assessment.tsx` — Removed inline sidebar (section cards + overall progress card), bottom prev/next nav buttons, sticky assessment header, `getSectionIcon`/`getSectionColor` functions, `currentQuestion` state, `completionError` write-only state, unused imports.
- `CategoryAssessment.tsx` — Removed accordion "Why This Matters" (DESIGN.md §15 anti-pattern). All context now always-visible in context strip. Notes toggle replaces always-visible textarea.

### docs
- Sprint 2 design spec: `docs/superpowers/specs/2026-05-09-sprint2-assessment-flow-design.md`
- Sprint 2 implementation plan: `docs/superpowers/plans/2026-05-09-sprint2-assessment-flow.md`
- DESIGN.md §35 (canvas gradient) / §36 (animation utilities) / §37 (sidebar nav v2) added during Sprint 1, now live.

### Notes
- Benchmark corridor deferred (needs live KPI data per question — future sprint)
- "Attach proof of performance" footer button removed (file upload is a future sprint)
- 76 tests passing, zero TypeScript errors on merge

---

## [2026-05-08] — Design System v4.0 — OEM-Grade Production Standards

### docs
- **DESIGN.md v4.0** — 18 new sections (§17–§34) added; 5 targeted fixes to existing sections; version header updated to v4.0.

  **New sections (§17–§34):**
  - **§17 Display Typography & OpenType** — Inter Display optical variant, `cv01`/`cv02` alternates (engineered single-storey glyphs), negative heading tracking, `font-optical-sizing: auto`, `.numeric` utility, brand-ink display color (`oklch(0.18 0.03 258)`)
  - **§18 Surface Hierarchy & Elevation** — Five named surface levels; `shadow-overlay` and `shadow-floating` tokens; nesting rule; modal backdrop spec
  - **§19 Permitted Gradient Model** — Tonal gradients permitted (score arc/sidebar/PDF); multi-hue and gradient-text banned absolutely
  - **§20 Background Texture & Depth** — SVG grain at 3% opacity for page backgrounds; dot-grid for data surfaces; chart area inset; print stripping rule
  - **§21 Custom Icon Language & Maturity Marks** — Technical line-art brief for 5 department SVGs; 4 geometric maturity band emblems; OEM tier emblem brief
  - **§22 Score Ring Instrument Specification** — Tonal gradient arc; tick marks at band boundaries with ARIA titles; terminus glow animation (mount only); confidence hatch; size-per-context table
  - **§23 Premium Motion Choreography** — ms-precise Results reveal sequence (T+0→T+1500ms); OEM Dashboard load sequence; sliding sidebar indicator; table row hover; score delta flash; `prefers-reduced-motion` override
  - **§24 Precision Page Header Pattern** — Bloomberg-style 4-stat strip below dividing rule; per-page definitions for Results, OEM Dashboard, Coach Dashboard
  - **§25 Number & Currency Formatting** — Locale-aware `Intl.NumberFormat` (de-DE/en-US); K/M suffixes; delta sign format; date conventions
  - **§26 Skeleton & Loading States** — Shimmer CSS; 6 named skeleton shapes; timing rules; Loading/Empty/Error state distinction
  - **§27 Actor-Context Banner** — Sticky 40px brand-050 banner for coach/OEM cross-actor views; mount animation; z-index coordination with AppHeader
  - **§28 Network Tier Badge System** — OKLCH tokens for Standard/Silver/Gold/Platinum; quality-mark dot prefix; usage and read-only rules
  - **§29 Benchmark Corridor Upgrade** — Box-and-whisker with prior-period hollow marker; tooltip spec; heights per context
  - **§30 Data Density Modes** — Compact (`.density-compact`) and Comfortable; per-surface assignment table; minimums
  - **§31 Focus Ring & Accessibility Tokens** — `:focus-visible` spec; WCAG AA contrast audit (warning-on-white FAILS — documented); ARIA requirements; `prefers-reduced-motion`
  - **§32 PDF/Print Surface Specification** — A4 sizes; header/footer anatomy; PDF type scale; CMYK color mapping; watermark spec
  - **§33 Micro-copy Tone Rules** — Error format; empty state format; score band language; button label rules; loading/confirmation copy
  - **§34 Responsive Breakpoints** — Tailwind breakpoints; actor usage contexts; per-component collapse rules; explicit h1/h2 mobile overrides

  **Fixes to existing sections:**
  - §2.3: Canonical threshold rule box — all code must use ≥85/≥70/≥46/<46 (not ≥80/≥60)
  - §2.5: Gradient permission reference → §19
  - §3.3: OpenType features; mandatory negative tracking; `font-optical-sizing: auto`; `.numeric` class requirement
  - §15: 7 new anti-pattern rows (default Inter, flat ring, wrong thresholds, inline styles, vague errors, missing focus rings)

- **`.lovable/plan.md`** — v4.0 notice at top; acceptance checks extended with threshold, numeric, inline-style, focus ring, and error message requirements
- **`src/components/assessment/QuestionCard.tsx`** — DESIGN.md reference comment updated to include §17 and §31

### Notes
- No production code changes in this commit — documentation only
- Implementation sprint order: §2.3 threshold code fixes → §31 focus rings → §17 OpenType CSS → §22 score ring → §23 motion

---

## [2026-05-01] — UX & Retention Features Sprint (Lovable)

### Added
- **#63 Cinematic score reveal** — Overall score counts up from 0 on first Results load (hasAnimated ref). Module cards cascade with staggered 1300–1750ms delays, 12px slide-up + fade.
- **#64 Radar chart with benchmark ring** — RadarBenchmarkChart in Results > Summary tab. Recharts radar, animated dealer polygon, dashed peer benchmark ring at 72pt.
- **#66 Kanban board** — KanbanBoard component, fourth view mode in Action Plan (List/Kanban/Timeline/Roadmap). HTML5 DnD, Open/In Progress/Done columns, completion toast.
- **#68 Milestone banners** — Contextual banner at 25/50/75/100% action completion. Per-milestone dismiss. 100% shows Schedule Reassessment CTA.
- **#80 Freshness indicator** — assessmentFreshness.ts utility + FreshnessBadge component on Dashboard and Results. Stale banner (≥90d) with amber border on Results page.

### Deprioritised
- **#67 Impact vs effort scatter** — Single-action triage already exists in Action Sheet. Portfolio view deferred to post-pilot.

### Notes
- Do not edit KanbanBoard.tsx, RadarBenchmarkChart.tsx, FreshnessBadge.tsx, assessmentFreshness.ts via Claude Code
- Pre-existing TS errors in CausalChainDiagram.tsx and signalEngine.ts are unrelated to this sprint

---

## [1 May 2026] — RLS Recursion Fixes, Signal Architecture Refactor

### Fixed
- RLS infinite recursion on `dealerships` table — `"OEM admins can view network dealerships"` 
  policy was directly joining `dealer_network_memberships`, which triggered a recursive 
  policy chain. Replaced with `user_can_access_dealership_as_oem()` SECURITY DEFINER function.
- RLS infinite recursion on `assessments` table — same pattern. Replaced with 
  `user_can_access_assessment_as_oem()` SECURITY DEFINER function.
- `useOnboarding` hook self-healing null — hook was writing `active_dealership_id = null` 
  back to `profiles` on RLS false negatives, creating a redirect loop to the Setup Wizard. 
  Removed both null-write paths; now logs warning only and preserves stored value.
- `active_dealership_id` null on profile row — patched via SQL for demo account.
- Full assessment → save → results → action plan flow confirmed working end-to-end.

### Changed — Signal Architecture (zero-maintenance scaling)
- `signalTypes.ts` — `RootCauseDimension` exported as single source of truth; 
  removed duplicate local definitions from `signalMappings.ts` and `actionTemplates.ts`.
- `questionnaire.ts` — `Question` interface extended with three optional fields: 
  `primarySignalCode`, `secondarySignalCode`, `rootCauseDimension`. All 61 questions 
  backfilled (50 existing from `signalMappings.ts` values, 11 new KPI-proxy questions 
  from explicit mapping table).
- `signalEngine.ts` — replaced single-tier `getSignalMapping()` lookup with three-tier 
  resolver `getResolvedSignalMapping()`: (1) question object direct read, (2) SIGNAL_MAPPINGS 
  fallback, (3) category-based derivation. O(1) question Map built once outside loop. 
  DEV-only tier resolution logging added.
- `signalMappings.ts` — retained as Tier 2 fallback; local `RootCauseDimension` 
  definition removed, now imports from `signalTypes.ts`.

### Added
- 11 new KPI-proxy assessment questions (nvs-11 to nvs-13, uvs-11 to uvs-13, 
  svc-13 to svc-15, fin-9 to fin-10) with explicit signal mappings. KPIs proxied: 
  Lead Response Time, Units Per Sales Executive, Staff Turnover, Trade-In Capture Rate, 
  Stock-to-Sales Ratio, Used Car Staff Expertise, First Time Fix Rate, Upsell Conversion, 
  Service Retention Rate, Fixed Ops Overhead, Performance Review Cadence.

### Known Issues (non-blocking)
- `action_audit_log` 403 — client making direct REST call; should route via trigger only.
- ActionSheet PATCH — malformed URL encoding (`%22new_value%22`); body serialisation bug.
- `DialogContent` missing `DialogTitle` — accessibility warnings across multiple dialogs.

### Commits
- fix(onboarding): remove self-healing active_dealership_id nulls
- fix(rls): wrap OEM dealership and assessment policies in SECURITY DEFINER functions
- feat(questions): add 11 KPI-proxy assessment questions across NVS, UVS, SVC, FIN
- refactor(signals): make signal mapping question-driven for zero-maintenance scaling

---

## [30 Apr 2026] — Round 3 UI: Dashboard Onboarding, Score Decomposition, 30/60/90 Roadmap, Confidence Warning, OEM Peer Rank

### Features (Lovable)

- feat(dashboard): #47 empty-state onboarding card — icon, headline, 3 benefit callouts, "What to prepare" checklist, Start Assessment CTA
- feat(maturity): #31 score decomposition table — dept × weight × contribution with mini contribution bar, weighted sum footer row
- feat(maturity): #45 confidence variance warning banner — surfaces `reviewRecommended` departments with consistency % before Gap Analysis
- feat(actions): #35 30/60/90 day roadmap view — Quick Wins / Process Changes / Governance & Systems columns based on triage scores; toggled via List/Roadmap tab
- feat(oem): #41 OEM leaderboard rank badges — gold/silver/bronze styled badges for top 3; Network average row appended to table

### Tracker

- docs(tracker): #47 #31 #45 #35 #41 marked done; tracker updated to 30 Apr 2026

---

## [29 Apr 2026] — OEM Network Setup, Coach Invite Flow & Role Architecture

### Features

- feat(db): `lookup_dealer_by_email` and `get_dealership_details` SECURITY DEFINER functions — cross-org dealer lookup for OEM admins, guarded by `actor_type='oem'` + active network check
- feat(ui): `OemNetworkSettings` component — create/edit OEM network, email-based dealer lookup with confirmation preview, dealer roster table with inline programme tier editing and remove
- feat(routing): `/app/oem-settings` page gated to `actor_type='oem'`; "Network Settings" sidebar nav item for OEM users
- feat(invite): full coach invite flow — `InviteCoach` component, `invite_type='coach'` in `dealership_invites`, `accept_dealership_invite` creates `coach_dealership_assignments` row, redirects coach to `/app/coach-dashboard`
- feat(auth): `ProtectedRoute` `requiresActorType` prop gates OEM and Coach routes at route level
- feat(routing): `/app/coach-actions` wired, gated to `actor_type='coach'`; Action Tracker in sidebar for coaches
- feat(auth): backfill `actor_type='dealer'` for all existing users (migration `20260429090200`)
- feat(db): RLS policies on `oem_networks`, `dealer_network_memberships`, `coach_dealership_assignments`
- feat(db): UNIQUE constraint on `coach_dealership_assignments(coach_user_id, dealership_id)`, race-safe `ON CONFLICT` in accept function

### Security

- security: `lookup_dealer_by_email` and `get_dealership_details` reject all non-OEM callers — no cross-org data leakage possible for dealer/coach users
- security: `private` schema helper functions (`caller_is_verified_oem`, `caller_oem_org_id`) enforce double guard: actor_type check + active network ownership check

---

## [28 Apr 2026] — Consistency, Navigation & Copy Fixes

### Fixed

- fix(maturity): unify maturity label to single getMaturityLevel source
- fix(kpi-nav): wire view-details to KPI Studio navigation
- fix(action-sheet): title-case badges and reposition KPI panel
- fix(action-sheet): replace support-required pills with multi-select dropdown
- fix(kpi-defs): replace USD figures with Euro-market language

---

## [28 Apr 2026] — Round 2: Assessment UX, KPI Analysis & Results Polish

### Fixed

- **fix** Questions answered coverage card replaces assessment confidence card on Results page — the old card surfaced raw confidence metrics with no clear user action; replaced with a questions-answered progress indicator showing completion coverage per department. *(tracker #45 pending · `479d1d4`)*

- **fix** Owner workload panel and toolbar button removed from Actions tab — panel was displaying organisational context that belongs to a future coach/OEM view; removed to clean up the dealer-facing action UI. *(tracker #01 cleanup · `a93c092`)*

- **fix** Systemic patterns and top findings merged into unified Key Diagnostic Findings block on Results page — two separate cards with overlapping content collapsed into a single prioritised block, reducing visual noise and improving narrative flow. *(tracker #33 · `160f1bc`)*

- **fix** Duplicate overall score block removed from KPI Analysis tab — the overall score was rendering twice; second instance removed. *(tracker #27 · `f4a53c8`)*

- **fix** KPI Analysis tab now renders sections for all assessed departments, ordered by score ascending — previously only showed a subset; now all departments with answered questions appear, worst-performing first for faster prioritisation. *(tracker #27 · `e4b43d7`)*

- **fix** View Details links in KPI Analysis tab wired to KPI Encyclopedia modal — links were rendered but unbound; now open the correct KPI sheet on click. *(tracker #27 · `315281a`)*

- **fix** Module abbreviations (NVS/UVS/SVC/PTS/FIN) expanded to full department names in systemic pattern cards on Results page — "NVS" now reads "New Vehicle Sales" etc., improving readability for non-technical users. *(tracker #33 · `35fef31`)*

- **fix** Satisfaction questions: percentage-scale options (0–20%, 21–40% etc.) replaced with qualitative labels (Very satisfied / Satisfied / Neutral / Dissatisfied / Very dissatisfied) — percentage anchors were meaningless for satisfaction judgements and biased responses. Completes evidence-based scale label work across all question types. *(tracker #10 → Done · `923cba2`)*

- **fix** Assessment section sidebar made sticky, dead scroll space eliminated — sidebar now stays fixed to the viewport as the user scrolls through questions; excess whitespace below the last question removed. Partial implementation of always-visible context panel. *(tracker #43 → Partial · `fc89216`)*

- **fix** Option label made primary in assessment question cards; redundant rating instruction and selection confirmation text removed — the descriptive label text is now the dominant visual element; secondary instruction copy ("Select a rating 1–5", "Answer saved") stripped as it added noise without adding information. *(tracker #42 partial · `8570827`)*

---

## [21 Apr 2026] — Results UI: Engine Data Wiring

### Fixed
- **fix** `DepartmentHeatmap` data source corrected — component was re-deriving cell
  values by averaging raw answers internally, bypassing the scoring engine's category
  weights. `subCategoryData` prop added (`Record<string, DepartmentSubCategories>`);
  `categoryKey` field added to every `DEPT_KPIS` entry (maps to `q.category` in the
  questionnaire). `useMemo` now prefers `calculateSubCategoryScores()` output for each
  cell; raw answer fallback retained for any cell whose `categoryKey` has no matching
  sub-category. `ExecutiveSummary.tsx` passes the already-computed `subCategoryData`
  (line 106) to the component. *(tracker #32 · `9f2c44d`)*

### Verified Complete (audit 21 Apr 2026)
- **verified** `CausalChainDiagram.tsx` — component live in `src/components/results/`,
  mounted in `ExecutiveSummary.tsx` (Section 1C). Reads top-3 live signals from
  `generateSignals()`; groups by shared root-cause dimension via `SIGNAL_MAPPINGS`;
  renders dimension-grouped chain nodes with arrows. Empty-state handled. Uses
  shared-cause chain model rather than KPI upstream/downstream fields from
  `kpiDefinitions.ts`. *(tracker #29)*
- **verified** Systemic + recurring pattern cards — both severity variants (`systemic`
  and `recurring`) rendered in `ExecutiveSummary.tsx` (Section 4) from live
  `detectSystemicPatterns()` output. No placeholder data. *(tracker #33)*

---

## [21 Apr 2026] — Type Safety

### Fixed
- **fix** `Organization` interface typed with `business_model` field — added
  `business_model?: 'sales_only' | 'service_only' | '2s' | '3s' | '4s' | null`
  to the `Organization` interface in `useMultiTenant.tsx`. Field was fetched at runtime
  via `organizations(*)` but absent from the TypeScript type, forcing an `as any` cast
  in `Assessment.tsx`. *(tracker #13 · `ea0aef4`)*
- **fix** `as any` cast removed from `Assessment.tsx:45` — `businessModel` now read
  directly as `currentOrganization?.business_model`. *(tracker #13 · `ea0aef4`)*
- **refactor** Dead `applicableModels?: string[]` field removed from `Section` interface
  in `questionnaire.ts` — field was declared but never populated on any section object;
  all gating handled by `moduleGating.ts`. *(tracker #13 · `ea0aef4`)*

---

## [20 Apr 2026] — Lovable Build Fix

### Fixed
- ActionSheet.tsx: KPI, likely-driver, and likely-consequence map callbacks retyped from
  `string` to `unknown` with explicit object guard casts — resolves TypeScript strict-mode
  build errors when iterating KPI/driver/consequence arrays whose runtime shape is
  `{ name, type, reason }` rather than plain string. `updateField` value union widened to
  include `number`. *(`7eb666e`, `40a7d0d`, `bbf0783`)*
- Account.tsx: profile state typed as `Tables<'profiles'>` (replacing loose
  `Record<string, string | null>`); `Tables` import added. Fixes downstream
  type errors on `actor_type` and other typed profile fields. *(`40a7d0d`, `9d1d82f`)*

---

## [03 Apr 2026] — Results UI Polish

### Added
- **feat** Recurring pattern cards — `ExecutiveSummary.tsx` updated to render both
  systemic (3+ depts) and recurring (2 depts) severity variants side-by-side. Previously
  only the systemic variant was rendered. *(tracker #33 · `21aa99d`)*

### Fixed
- **fix** Border colour conflict on pattern cards — conflicting Tailwind border class
  removed from pattern card wrapper; stable `key` prop added using pattern signal code
  instead of array index. *(tracker #33 · `01ae43e`)*
- **fix** Narrative card border conflict removed — conflicting border class stripped from
  executive narrative card in `ExecutiveSummary.tsx`. *(tracker #34 · `14a33a4`)*
- **feat** Executive narrative card restyled — card header relabelled "Assessment Overview";
  layout tightened. *(tracker #34 · `cfa7fd8`)*

---

## [02 Apr 2026] — Sprint: Bug Fixes & System Verification

### Added
- answer_audit DB trigger (trg_audit_answer_changes): logs every 
  answer change on assessments table for OEM compliance — tracker #04

### Fixed
- Ceiling analysis false negative: threshold corrected so departments 
  scoring 55+ receive ceiling gap analysis; fallback message updated 
  to be accurate for low-scoring dealers — tracker #15
- Integrations tab: removed non-functional Connect buttons for Google 
  and Microsoft; replaced with "Coming soon" badges to prevent dead 
  ends in OEM demos
- Role enum: ROLE_OPTIONS in InviteTeamMembers cleaned up 
  (removed legacy analyst/manager values); canInvite restricted to 
  owner/admin only — tracker #01
- React hook crash: removed incorrectly placed useState/useEffect 
  from InviteTeamMembers that caused React error #300
- Missing Badge import in Account.tsx causing runtime crash on the 
  integrations tab render
- Team member UUID display: replaced raw UUID with "Team Member" 
  placeholder in Team tab (profile join deferred to next sprint)

### System Verification (02 Apr 2026)
- Full cross-system audit: Supabase MCP + Vercel MCP + commit history
- Real progress confirmed at 43% (tracker reported 38%)
- 8 items upgraded from Pending to Done, 8 upgraded to Partial
- All DB enums confirmed clean — no legacy role values in any row
- All 3 Edge Functions confirmed ACTIVE (send-invite v37, 
  generate-actions v29, check-anon-key v3)

---

## [Sprint 3] — 27 March 2026
**Theme: Engine wiring, role unification, and Results UI polish**
**Lovable credits used: ~4 · Claude Code commits: 1 (24a8219)**

### Architecture

- **refactor** Role enum unified across invite surface — `send-invite` Edge Function `validRoles` and `InviteTeamMembers.tsx` `canInvite` guard both aligned to 4-role enum (`owner/admin/member/viewer`). `Account.tsx` permissions table corrected: `member` role can no longer invite. *(item 01 partial · `24a8219`)*

### Diagnostic Engine (Claude Code)

- **feat** Cross-validation wired — `evaluateCrossValidations()` now called inside `generateActionsFromAssessment()`; `crossValidationAlerts` included in `AssessmentResult` return type. Five cross-validation rules are live in the engine. *(item 04 · `24a8219`)*

- **feat** Score-band template selection — `getScoreBand()` helper added to `signalEngine.ts`. Band-aware filtering (`foundational` / `developing` / `optimising`) with graceful fallback applied in `selectTemplates()`. `departmentScore` threaded through `generateActionsFromAssessment → instantiateActions → selectTemplates`. *(item 11 · `24a8219`)*

- **fix** Business model template tagging — 3 incorrectly tagged templates corrected: `ACT-PNS-INV`, `ACT-CMA-PRD`, `ACT-CMA-ASR`. Business model filter in `selectTemplates()` was already present; bad tags were the root cause. *(item 07 · `24a8219`)*

- **feat** Evidence-based scale labels expanded — observable criteria applied to 33 additional questions across NVS, UVS, SVC, PTS, FIN modules (on top of 13 done in Sprint 1). *(item 10 · `24a8219`)*

- **feat** Ceiling analysis wired to Results page — `generateCeilingInsights()` connected via `useMemo` in `Results.tsx`; data computed but UI rendering deferred (TODO CC-12 comment in source). *(item 12 · `24a8219`)*

- **fix** Ceiling analysis threshold reduced to 55 and no-insight messaging updated (enterprise mode staging) for improved clarity in 54/58/68 scenarios. *(item 15 · `69283de`)*

- **verified** `implementationSteps` migration confirmed complete — all action templates already using `{ text, primaryRole }` format; no migration work required. *(item 02 · `24a8219`)*

### UI (Lovable)

- **feat** SVG score rings on Results page — animated SVG ring component replacing static score bars; score rings rendered per department. *(`5abd32a`, `4a54261`)*

- **fix** Results cards layout and alignment corrected. *(`21ef7c4`, `2b7f297`)*

- **feat** Results 5×5 heatmap and causal chain panels — KPI heatmap rendered on Results page with causal chain visualisation. Systemic pattern cards render inside `ExecutiveSummary.tsx` (mounted within Results page). Working in production. *(`0ac9ce2`, `88c4e1b`, `97caf36`, `b205439`, `3ddbc18`, `6f9e026`, `05422df`, `2cff226`)*

- **feat** OEM and Coach dashboard scaffolding — routing, layout, and backend wiring for OEM network view and Coach assigned-dealer view created. Backend complete; dashboards not yet surfaced in the nav (stub state — pending role architecture item #01 and OEM tables item #38). *(`b3e338b`, `4b44ca1`, `88deac3`, `76ea1b6`, `c34aa5e`, `ecc0d8d`, `1f4293d`, `b0c4352`)*

- **fix** Auth test selectors and ESLint violations cleaned up. *(`db27721`)*

- **docs** Improvement tracker updated to reflect Sprint 3 completion status (67% done at close). *(`bd35adf`)*

---

## [Sprint 2] — 22 March 2026
**Theme: Zero-credit infrastructure, diagnostic engine upgrade, and design system foundation**
**Lovable credits used: 0 · Supabase MCP migrations: 5 · Claude Code commits: 6**

### Database (Supabase MCP — live in production)

- **feat** `answer_audit` table created — immutable log of every assessment answer change with `(assessment_id, question_id, changed_by, changed_at, from_value, to_value, change_source, session_id, ip_address, notes)`. RLS enforced, org-scoped. Indexes on assessment+question+timestamp. Required for OEM compliance contexts. *(item 04)*

- **feat** Network architecture tables created — `oem_networks` (OEM programme container with brand, country scope, programme code), `network_regions` (geographic sub-divisions), `dealer_network_memberships` (junction with programme tier and `include_in_network_benchmark` flag). Full RLS + indexes. Unblocks OEM network dashboard (item 38). *(item 05)*

- **feat** Questionnaire versioning — `questionnaire_version` (text, default `'1.0.0'`) and `assessment_cycle` (integer, default `1`) columns added to `assessments` table. Composite index on `(dealership_id, assessment_cycle)`. Enables safe delta scoring across questionnaire changes. *(item 16)*

- **feat** `benchmark_snapshots` table created — stores score distributions by peer segment with `(positioning × business_model × network_structure × volume_band)` segmentation key, p25/p50/p75/mean/std_dev distribution stats, provenance fields (`source_type`, `confidence_tier`), and 16 Phase 1 static seed rows matching established triage module benchmarks (NVS=72, UVS=70, SVC=75, FIN=68, PTS=65). Architecture supports Phase 2 blended and Phase 3 live peer-pool derivation. *(item 25)*

- **feat** `peer_segmentation_keys` VIEW created — computes 4-dimension composite key (`positioning|business_model|network_structure|volume_band`) for every organisation. Volume band derived from `dealer_contexts.annual_unit_sales` (micro/small/medium/large/enterprise). Provides `peer_segment_key` column for direct `benchmark_snapshots` lookups, eliminating benchmark contamination risk. *(item 26)*

### Diagnostic Engine (Claude Code)

- **feat** `src/data/actionTemplatesTiered.ts` — 589-line tiered action template system. 25 templates across 8 signal codes × 3 score bands: `foundational` (20–45), `developing` (46–69), `optimising` (70–84). Signals covered: `NVS_LEAD_RESPONSE`, `NVS_CLOSING_RATIO`, `NVS_GROSS_PER_UNIT`, `UVS_STOCK_TURN`, `SVC_WORKSHOP_UTILISATION`, `SVC_CSI`, `FIN_NET_PROFIT`, `PTS_OBSOLESCENCE`. Exports: `getTieredTemplate()`, `filterByBusinessModel()`, `scoreToBand()`, `getAllBandsForSignal()`. *(item 20)*

- **feat** Business model filtering on all action templates — `relevantBusinessModels[]` array on every template. `filterByBusinessModel()` returns `null` for non-applicable combinations (PTS templates excluded for `sales_only`, UVS templates excluded for `service_only`). Signal engine skips null templates gracefully. *(item 21)*

- **feat** Role-addressed implementation steps — every step in `actionTemplatesTiered.ts` uses `{ text: string; primaryRole: PrimaryRole }` format. 122 role-addressed steps across 27 templates. `PrimaryRole` type covers 11 dealership roles: Dealer Principal, General Manager, Sales Manager, Aftersales Manager, Workshop Controller, Parts Manager, F&I Manager, Marketing Manager, HR/Training Manager, IT/DMS Administrator, Used Vehicle Manager. *(item 22)*

### Design System (Claude Code)

- **docs** `DESIGN.md` created at project root — 630-line visual design system specification generated by analysing live production CSS. Covers: colour system (brand/neutral/semantic/department/score-band tokens), full typography scale, spacing and layout rules, component specifications (score ring, question tiles, action cards, benchmark corridor, 5×5 heatmap, systemic pattern cards), chart/animation/icon rules, results page scrollable layout spec, Lovable prompt template, and explicit anti-patterns list. All future Lovable prompts must reference this file. *(item 54 — new)*

---

## [Sprint 1] — 21–22 March 2026
**Theme: Production stabilisation, diagnostic engine hardening, and content quality**
**Lovable credits used: 1 · Claude Code commits: 11**

### Infrastructure & Security

- **fix** Vercel SPA rewrite rule added to `vercel.json` — all React Router routes now return 200 instead of 404. Auth callback, magic link, and deep links all working. *(item 02 · `f594125`)*

- **fix** Benchmark variable name collision in triage scoring resolved. *(`c578c0d`)*

- **security** Edge Function source files updated to use origin allowlist. *(`755d4f8`)*

- **docs** `CLAUDE.md` created at project root with full codebase context for Claude Code — identity, stack, infrastructure IDs, key file locations, architecture issues, DB tables, assessment structure, diagnostic engine details, dev rules, and tracker status. *(`5b47e3f`)*

### Assessment Engine

- **feat** Evidence-based scale labels — 13 highest-impact questions updated across `nvs-4/5/6/7/10`, `uvs-3/10`, `svc-3/10/11`, `fin-1/2/5`. Replaced "Poor/Fair/Good/Very Good/Excellent" with specific measurable thresholds (e.g. "€500–€900 per unit", "Net profit declining >20%"). *(item 10)*

- **fix** `fin-2` cash flow scale labels completed. *(`4a8efb`)*

- **fix** Scale labels updated to wrap properly across multiple lines in rating buttons. *(`5b3a1c`)*

- **feat** `src/data/crossValidationRules.ts` — 5 cross-validation rules created: NVS productivity (nvs-1/nvs-7), service utilisation vs CSI (svc-1/svc-5), parts blocking service (svc-2/svc-9), profit-cash disconnect (fin-1/fin-2), hidden dead stock (pts-1/pts-4). `evaluateCrossValidations()` function ready. *(item 11)*

- **feat** Triage scoring upgraded — replaced static priority lookup with formula-driven calculation. Impact = f(module_weight, score_gap, downstream_KPI_count). Effort = f(step_count, root_cause_dimension_modifier). Urgency escalates for low scores and stale repeat assessments. *(item 19)*

- **fix** Ceiling analysis pass added to signal engine — high-scoring assessments now generate at least one optimising action. *(`df919b`)*

### Results & Reporting

- **feat** `narrativeTemplates.ts` — 32 executive narrative paragraph variants: 4 maturity levels × 8 signal codes × single/systemic patterns. `buildExecutiveNarrative()` function ready. *(item 34)*

- **fix** Erroneous prefix removed from narrative situation paragraph. *(`3c75eb`)*

- **feat** Executive Summary UI redesigned — `ExecutiveSummary.tsx` refactored. Narrative generation hooks added, ceiling insights rendering added. Legacy sub-category bar removed. *(Lovable · `92e44d`)*

- **feat** KPI position labels and dynamic benchmark corridor — `ceilingAnalysis.ts` with `generateCeilingInsights()`. KPI position inference from assessment score (e.g. "Based on your answers, your closing ratio is estimated at 14%, below benchmark of 20–25%"). *(items 24, 28 · `b19e75`)*

- **docs** Benchmark methodology document added for OEM procurement. *(item 50 · `6aef95`)*

### UX / UI

- **fix** Emoji icons removed from `CategoryAssessment.tsx`, `QuestionCard.tsx`, `ActionSheet.tsx` — replaced with Lucide React icons. *(items 42, 43 · `Hn1AB`, `AkTPp`)*

- **fix** Triage quadrant labels renamed to constructive language: "Time Sink" → "Low Priority", "Fill-in" → "Maintenance", "Major Project" → "Strategic Initiative". *(item 43)*

- **fix** "Assessment Complete" banner removed from Results page Executive Summary tab. *(item 44)*

### i18n

- **feat** German scale label translations added for key diagnostic questions. *(item 53 partial · `449789`)*

### Architecture

- **refactor** Legacy role system consolidated — `useUserRole` hook removed, references migrated to `useActiveRole`. Role routing now relies on memberships. `RoleContext` retained for dev mode only with deprecation notice. *(Lovable · `ae1727`)*

- **refactor** Profile page redesigned — role types refactored to 4-role model, `Account.tsx` rewritten with sidebar layout. *(Lovable · `098dd7`)*

---

## [Sprint 0] — July–November 2025
**Theme: Core platform build**

### Foundation

- **feat** Weighted scoring engine — `calculateWeightedScore`, `calculateWeightedSectionScore`, `CATEGORY_WEIGHTS` (NVS 25%, UVS 20%, Service 20%, Financial 20%, Parts 15%). *(item 06)*

- **feat** Confidence interval scoring — `calculateConfidenceMetrics`: standard deviation, consistency score, high/medium/low confidence, `reviewRecommended` flag. *(item 07)*

- **feat** Systemic pattern detection — `detectSystemicPatterns` identifies signals in 3+ departments (systemic) or 2 departments (recurring). *(item 08)*

- **feat** Enhanced maturity model — `calculateEnhancedMaturity`: Advanced requires ≥85 AND no sub-category below 60. Downgrades to Inconsistent on high variance. *(item 09)*

- **feat** Deterministic signal engine — `signalEngine.ts`: same answers → same signals → same actions. KPI-aware template selection. No AI/ML dependency. *(item 17)*

- **feat** Root-cause diagnostics — 5-dimension (People/Process/Tools/Structure/Incentives) `rootCauseDimension` on every signal mapping. KPI definitions have full 5-dimension diagnostic text. *(item 18)*

- **feat** KPI Encyclopedia — `kpiDefinitions.ts` complete. `KPIStudio` renders all sections: formula, inclusions/exclusions, executiveSummary, rootCauseDiagnostics, improvementLevers, interdependencies. *(item 27)*

- **feat** PDF and Excel export — `ExportPDFModal` and `pdfReportGenerator.ts`. Cover page, department scores, KPI analytics, action plan. *(item 30)*

- **feat** 2S/3S/4S business model awareness — business model captured in `OrganizationSettings`. KPI definitions reference it contextually. *(item 49)*

- **feat** GDPR technical controls — data export, account deletion, consent management, GDPR consent fields on profiles. *(item 03 partial)*

- **feat** Coach-dealership assignment infrastructure — `coach_dealership_assignments` table, `access_assignments` table, `actor_type` enum on profiles. *(item 01 partial)*

---

*Changelog maintained manually. Updated after every sprint. Cross-reference improvement_tracker_updated.html for full item status.*
