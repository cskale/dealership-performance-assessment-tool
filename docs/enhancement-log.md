# Enhancement Log — Small Improvements & Tweaks

Quick-reference log of incremental enhancements, UI fixes, and small quality-of-life improvements made outside of major feature sprints.

---

## 2026-09-26 — Results redesign + KPI check-ins (Task 10 cleanup)

Lovable rebuilt the Results page around a 2-tab layout (Diagnosis / Action Plan) with a hero band and per-department rows, replacing DepartmentHeatmap, CausalChainDiagram, ScoreDecomposition, ExecutiveSummary and MaturityScoring. Monthly KPI check-ins (between assessments) shipped alongside. This entry covers the post-Lovable cleanup and verification pass.

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Dead component removal | Deleted `PerformanceDataPanel.tsx` and `KpiInsightPanel.tsx` (zero importers after the Results rebuild). `RadarBenchmarkChart.tsx` is also unused but is Lovable-owned — left in place, flagged for Lovable to remove. | `chore: remove dead results components` |
| 2 | Data-layer integrity check | Verified Lovable made no changes to Claude-owned data-layer files (`questionnaire.ts`, `signalEngine.ts`, `useKpiTimeline.ts`, `kpiForecast.ts`, `kpiTimeline.ts`, `useKpiValues.ts`, `usePlaygroundPrefill.ts`, `playgroundCalculators.ts`, `playgroundKpiMappings.ts`) since the data-layer merge — diff was empty. | — |
| 3 | Resumed KPI check-in reminder | The monthly `kpi-checkin-reminder` cron job (1st of month, 07:00) had been paused; resumed via `cron.alter_job(..., active := true)`. | `fix(db): resume KPI check-in reminder` |
| 4 | Notification bell routing | Clicking a `kpi_checkin_reminder` notification fell through to the generic "action plan" branch. Now routes to `/app/results` (latest assessment, Diagnosis tab). | `fix: route KPI reminder notifications to Results` |
| 5 | Verification | `npx vitest run` (44 files / 376 tests) pass, `npm run lint` 0 errors (117 pre-existing warnings), `npm run build` succeeds. Signed-in QA click-through (dealer/coach/OEM) against local dev build: no page errors or failed requests; dashboards render cleanly. The QA script does not currently visit `/app/results` for any role, so the 2-tab Results layout wasn't screenshotted end-to-end this pass. | — |

---

## 2026-09-24/25 — Security audit and fixes

Full security audit (Cloudflare `security-audit` skill, standard profile) of the repo and the live Supabase policies/functions. 16 leads verified independently: 10 confirmed, 3 unresolved (fixed anyway), 3 rejected. No evidence any hole was used (data checked before fixing). All fixes live in DB, edge functions and Vercel. Report: `~/security-audit-skill/dealership-performance-assessment-tool/run-1/REPORT.md`.

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Org owner takeover (high) | `memberships_insert` bootstrap branch let a user add themselves as owner of an existing org. Removed; inserts need owner/admin, and only owners can grant `owner`. | `510f022` |
| 2 | OEM self-enrolment (high) | Any org owner could create an OEM network, enrol any dealership and read its data. Network/enrolment writes and OEM read helpers now require `actor_type='oem'` and an active network. | `510f022` |
| 3 | Profile-based tenancy | Coach notes/visits policies trusted self-editable `profiles.active_*`. Replaced with membership checks; `caller_oem_org_id()` verifies membership. | `510f022` |
| 4 | Unbound coach visits | Visits and visit reviews required no coach assignment. Now bound to an active assignment; review-driven status sync limited to the visit's dealership. | `510f022` |
| 5 | Unbound assessment/action/KPI/comment writes | Tenant columns weren't checked on write. Writes now bound to the caller's org/assessment; org-sync trigger also fires on `organization_id` changes. | `510f022` |
| 6 | Privilege escalation inside an org | Members could mint owner invites, admins could demote/delete owners, and a live-only policy let members self-assign as coach. All closed. | `510f022` |
| 7 | GDPR export scope | `export_user_data` returned other members' assessments. Now caller's own rows, active memberships only. | `510f022` |
| 8 | Edge functions | `send-invite`: owner-only owner invites, dealership must belong to org, org-scoped reuse. `action-token-update`: no input reflection, constant-time signature check, signed status enforced. `send-notification`: no raw provider errors. | `510f022`, `a63e30e` |
| 9 | Coach invites failing | `actor_type` guard trigger blocked every change, including invite acceptance. Now blocks only direct client edits. OEM mode toggle removed and `toggle_oem_mode` revoked (it let any owner self-grant OEM). | `a63e30e` |
| 10 | Hardening | Anon write grants revoked on public tables; logo bucket limited to raster images ≤ 2 MB; duplicate logo policies dropped; `get_dealership_details` scoped to caller's network; CSP `script-src` drops `'unsafe-inline'`; unused `netlify.toml` removed; vite 5.4.21; `qa-screens/` ignored. | `a63e30e` |
| 11 | Lint errors 100 → 0 | Small fixes; `no-explicit-any` set to warn (92 to clean up as files are touched); shadcn `ui/` override. 15 hook-dependency warnings reviewed: all intentional, no bugs. | `206ec63` |

Side effect: the "CSK Demo Org" pilot network lost OEM visibility (its owner isn't an OEM). Open follow-ups: enable leaked-password protection + MFA in the Supabase dashboard; test one real coach invite end to end; localhost CORS origins and a dedicated action-token key left as-is.

---

## 2026-09-23/24 — Production trust fixes, coach visit loop, signed-in QA

Production audit (Supabase logs/advisors, Vercel, CSP) followed by fixes, a new coach visit loop, and end-to-end testing as real signed-in QA users (dealer/coach/OEM).

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Stale-action notification flood | One user got 1,868 in-app + 245 email "Action overdue" nudges in 30 days: 557 of 597 open actions sat on superseded assessments. Nudges and weekly digests now only consider each dealership's latest assessment; one nudge email per user per run. Repo migration re-synced with the drifted live function. | `296e1a5` |
| 2 | Sentry blocked by CSP | Added Sentry ingest domains to `connect-src` and `worker-src 'self' blob:` (session replay worker was blocked). | `296e1a5` |
| 3 | Anonymous access to SECURITY DEFINER fn | Revoked `anon` EXECUTE on `user_can_access_dealership_as_coach`. | `296e1a5` |
| 4 | Dead code + unused deps | Removed 18 unreferenced files and 6 packages (react-hook-form, @hookform/resolvers, html2canvas, radix avatar/toggle, tailwind typography). | `5e9b40d` |
| 5 | Single i18n source | Removed unused i18next setup; dictionaries moved to `src/i18n/<lang>.ts`, non-English lazy-loaded; no English flash on first load. | `2a39194`, `0d7d80e` |
| 6 | Failing tests | Auth tests aligned with current sign-in page; translation test made data-independent. All tests green. | `08c6008` |
| 7 | Coach visit loop (backend) | `visit_action_reviews` (Done/In progress/Blocked/Not started, syncs action status), `get_visit_brief()`, one-time `visit_recap` in-app notification to the dealer org, `get_network_coaching_stats()` for OEMs, `useCoachVisitLoop` hooks. | `742fe33` |
| 8 | Coach visit loop (UI, Lovable) | Pre-visit brief card, review step in visit log, dealer "Coaching visits" timeline, recap notifications, OEM "Coaching coverage" card. | `3d9a425` … `43f720d` |
| 9 | Recap notifications misrouted | Bell matched `visit_recap` on `entity_type` instead of `type`. | `4a2ff52` |
| 10 | Coach notes never loaded for dealers | Embedded `profiles:coach_user_id` join has no FK → PostgREST 400, swallowed silently. Split into two queries. | `2014b93` |
| 11 | Signed-in QA click-through | `scripts/qa_click_through.py` signs in as QA dealer/coach/OEM, screenshots key screens, flags page errors + failed requests. Stale `.env.test` password corrected. | `2014b93` |
| 12 | Fake visit dates on dealer timeline | "Last/Next Coach Visit" showed coach *assignment* dates; now the latest logged visit and next scheduled visit. | `44f09b8` |
| 13 | OEM saw 0 open actions | No OEM read policy on `improvement_actions`; added network-scoped read policy via SECURITY DEFINER helper; count latest assessment only. | `44f09b8` |
| 14 | Review step never shown (found by E2E) | Coaches mark a visit completed before logging it, so it became the "last visit". Brief now uses the latest *logged* visit. Dealer timeline now shows each agreed action's latest review. | `fe99bda` |
| 15 | `/app/actions` blank page | Bell, coach notes, stale-action emails and token pages linked to a non-existent route; redirect to `/actions`. | `82de77c` |
| 16 | "1 day ago" for today | `relativeDays` now uses local calendar days; regression test added. | `fe99bda` |
| 17 | Calculator gauges misreported values | New shared `ScaleGauge`: scale extends past its default max (227.8% no longer clipped at 150%) and the target tick sits at its true position. Absorption tile hard-coded "100%" replaced by the service/parts GP split. | `5145f8c` |
| 18 | Raw JSON in notifications | Bell now lists only `in_app` rows (email delivery rows hold template JSON). 1,158 stale/incorrect notifications from the flood marked read (data fix, no deletions). | `5145f8c` |
| 19 | Premium calculator UI (Lovable) | Animated numbers, status-accented KPI strip, restyled gauge with target pin, what-if delta chips + reset, recharts visuals, insight callouts, entrance motion; calculation logic untouched. | `655b22e` … `95a5fd1` |

Open follow-ups: Resend sending domain not verified (no email is delivered); `VITE_SENTRY_DSN` in Vercel unverified; leaked-password protection + TOTP MFA to enable in Supabase dashboard; app sidebar not responsive at phone width; `[QA TEST]` visit data on QA Test Dealership.

---

## 2026-08-01 — Full-profile QA pass (dealer/coach/OEM)

Finished wiring `qa.coach.test@` and `qa.oem.test@dealershipdiagnostic.qa` (previously only the dealer QA account was fully set up) and manually tested every route across all three roles. Found and fixed 5 bugs:

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Coach Dashboard showed "No assigned dealers" for every coach | `dealerships` table had no RLS SELECT policy for coaches — `coach_dealership_assignments` and `assessments` granted coach access, but `dealerships` never did. Added `user_can_access_dealership_as_coach()` + policy "Coaches can view assigned dealerships" (Supabase migration `coach_can_view_assigned_dealerships`), mirroring the existing `user_can_access_dealership_as_oem()` pattern. | live migration (no app commit) |
| 2 | Dealer dashboard never showed an assigned coach | `useActiveRole.tsx` only set `dealerId` when the membership-role-derived `uxRole` was `'dealer'` — but `toUXRole()` maps `'owner'`/`'admin'` membership roles to `uxRole: 'coach'`, and every dealer who owns their own org has role `'owner'`. So `dealerId` silently stayed `null` for the primary dealer persona, breaking `Dashboard.tsx`'s coach-assignment lookup and anything else reading `dealerId`. Fixed by reading `dealerId` directly from `profiles.active_dealership_id`, independent of membership role. | `2380afa` |
| 3 | Coach's Knowledge Hub showed dealer-oriented "No assessment yet — Start Assessment" | Coaches don't take assessments themselves. `RecommendedTab.tsx` now branches on `actorType`: coach/OEM users without a single active dealer get a "No dealer assessment selected" state pointing them at their dashboard + KPI Encyclopedia/Downloads, instead of a dead-end CTA to start an assessment they can't take. | `2380afa` |
| 4 | Pluralization bug in dashboard narrative text | "1 dealers require active intervention this quarter" (verb never agreed with count) on both Coach and OEM dashboards. Fixed noun+verb agreement in `CoachDashboard.tsx` and `OemDashboard.tsx`. | `2380afa` |
| 5 | React key warning on every Results page load | `DepartmentHeatmap.tsx` mapped rows into an unkeyed `<>` fragment. Swapped to `<Fragment key={row.departmentKey}>`. | `2380afa` |

Shipped via PR #5 "fix: role-gating and dashboard bugs from full-profile QA pass", merged to `main` as `353aeb2`, deployed to production by Vercel auto-deploy. Re-verified all 5 fixes live against `qa.dealer.test@` / `qa.coach.test@` / `qa.oem.test@dealershipdiagnostic.qa` post-deploy (Playwright, prod URL) — all pass, zero runtime errors in Vercel's error monitor.

Also found (documented, not code): the `trg_prevent_actor_type_self_edit` trigger blocks the CLAUDE.md-documented admin path (`UPDATE profiles SET actor_type=...`) unconditionally — its comment claims a service-role bypass that doesn't exist in the trigger body. Provisioning now requires disabling/re-enabling the trigger in the same transaction. Left as-is (out of scope for this pass); worth a follow-up if OEM/coach provisioning via SQL becomes routine.

Unrelated pre-existing issue noticed during prod verification (not introduced by this PR, not fixed): Results page throws a CSP violation for a blob-based web worker (likely the PDF/Excel export worker) and Sentry's error beacon gets a 400. Flagged for a separate look.

## 2026-07-29 — Performance + UX Audit

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Route-level lazy loading | Converted all page imports in `App.tsx` (except Index/NotFound) to `React.lazy()` + `Suspense`. Entry bundle dropped from ~1.99MB to ~803KB — vendor-pdf, vendor-excel, kpi-definitions, scoring-engine, and Results now load on-demand per route instead of on every page load. | `f434952` |
| 2 | Coach profile role badge + dead Organization tab | Coaches have no org membership, so the Account header fell back to showing "Member" and the Organization tab rendered blank. Role label now derives from `actorType` first; Organization nav item hidden for coaches. | `e3f6b45` |
| 3 | Debounced search filtering | Added `useDebouncedValue` hook, wired into 4 text-search filters (ActionPlan, KpiEncyclopediaTab, KPIExplorer, Coach Dashboard KPI panel) so filtering doesn't re-run every keystroke. Coach Dashboard's KPI panel was also re-deriving `Object.entries()` over the full KPI dataset on every render — now memoized. | `a25c825` |
| 4 | Dead "Export Report" button | Coach Dashboard button silently logged to console with no user feedback. Now disabled with a native tooltip until the feature ships. | `a25c825` |
| 5 | CLAUDE.md doc correction | Corrected a stale "still unwired" note — `evaluateCrossValidations`/`generateCeilingInsights` are already live in `Results.tsx`. | `a25c825` |
| 6 | TanStack Query migration | Dashboard, CoachDashboard, OemDashboard, Results, CoachActions, CoachDealerPage, and Account all rolled their own `useEffect` + Supabase fetch with zero caching — every page re-fetched from scratch on every mount, even navigating away and back with no server-side change. Migrated all 7 to `useQuery`, keyed per page and per dependent param (assessmentId/networkId/dealershipId). Mutations now update the cache via `setQueryData` or a scoped `refetch()`. OemDashboard's networks → dealer scores → next-visits chain is now three dependent queries instead of three useEffects keyed off each other's state. | `ba4b875` |

---

## 2026-07-18

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Action Plan Engine v2 | KPI values now drive quantitative signals (`kpiSignalEngine.ts` + `kpiBenchmarks.ts`) merged into the qualitative signal engine; 22 KPI-specific action templates interpolate the dealer's actual numbers; new `actionPrioritiser.ts` ranks actions by ROI, floats dependency prerequisites, dynamically caps count by overall score, tags quick wins; `rank`/`is_quick_win` persisted and shown in Action Plan UI. | branch `feat/action-engine-v2` |

---

## 2026-06-24

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Visit date in-app notifications | Coach propose/re-propose → notify dealer. Dealer counter-propose/decline → notify coach. Dealer/coach confirm → notify other party + OEM (in-app via NotificationBell). Uses existing notify-dispatcher pipeline. | pending |

---

## 2026-06-23

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Marketing ROI Engine calculator | New Playground calculator: 5 fixed channels (Google Ads, Social, OEM Co-op, Direct Mail, Events), per-channel ROAS/CPL/CPS, break-even insight callout. KPI prefill from assessment data. | `415ea61` |
| 2 | Absorption Rate Modeler calculator | New Playground calculator: Service GP + Parts GP vs Fixed Overhead. Color-coded gauge (green/amber/red), ±20% what-if sliders with real-time adjusted values. | `415ea61` |
| 3 | Remove non-functional shell chrome | Removed Save Model button (stub toast), Recalculate button (no-op), Documentation button (linked to unrelated KPI page), v4.2 version tag (meaningless), "Default Scenario" text (no scenario system). Applies to all Playground calculators. | `efd4069` |
| 4 | Technician Utilization Calculator | New Playground calculator: utilization gauge (green ≥85%, amber ≥70%, red <70%), idle hours, revenue at current vs full utilization, revenue opportunity lost. KPI prefill for effective labour rate. | pending |
| 5 | Vehicle Stock Turn Calculator | New Playground calculator: days in stock (color-coded target <45 days), annual stock turn, holding cost analysis with floorplan tooltip, per-unit holding cost, inventory reduction savings insight. | pending |

---

## 2026-06-22

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Ponytail audit — dead code cleanup | Deleted 27 unused files: 10 dead components/pages (IndustrialKPIDashboard, DealerActions, DealershipInfoForm, DealerContextForm, SmartAssistant, LanguageSelector, RoleSelector, UsefulResources, ResourceCard, AppHeader) + 17 unused shadcn/ui components (accordion, aspect-ratio, breadcrumb, carousel, checkbox, context-menu, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, radio-group, resizable, signal-card, toggle-group). | pending |
| 2 | Ponytail audit — unused npm deps | Uninstalled 13 packages: embla-carousel-react, react-resizable-panels, input-otp, vaul, and 9 Radix UI packages (@radix-ui/react-accordion, aspect-ratio, checkbox, context-menu, hover-card, menubar, navigation-menu, radio-group, toggle-group). Build verified clean. | pending |
| 11 | KPI Analysis tab visual enhancement | Short KPI names (EN+DE), per-KPI icons, benchmark corridors + formula in tooltip, Playground link in header, light grey department headers, skipped KPIs same row format at 50% opacity, values in primary blue. | `1226959` |
| 3 | Sidebar expand button restyle | Moved collapse/expand toggle from absolute overlay to between header and nav. Full white background with dark icon — clear, visible click target. | `e790864` |
| 2 | Fix dashboard score fonts | Dashboard hero scores (overall "63" and focus dept "59") were using `font-display` (Instrument Serif) instead of Inter. Changed to `font-sans` to match design system. | `e790864` |
| 3 | Clean radial score ring | Removed 3 grey tick-mark rectangles at 46/70/85 positions on the SVG score ring in Results summary cards. Ring is now clean and professional. | `e790864` |
| 4 | Fix score breakdown math display | When only 3/5 departments assessed, legend showed raw contributions summing to 41.1 while overall was 63. Now normalizes weights so contributions sum correctly to overall score. | `e790864` |
| 5 | Remove duplicate Performance Radar from Summary tab | Radar chart on Summary tab was identical to the one on Maturity Level tab. Removed from Summary — single source on Maturity tab. | `e790864` |
| 6 | Move Performance Data to KPI Analysis tab | Moved `PerformanceDataPanel` (user-entered KPI values) from Summary tab into KPI Analysis tab. Replaced generic `IndustrialKPIDashboard` which showed static benchmark info. | `e790864` |
| 7 | Remove Score Decomposition from Maturity tab | Removed collapsible score decomposition table from Maturity tab. Redundant with stacked bar on Summary tab. Cleaned up unused memos. | `e790864` |
| 8 | Scope field notes to assessment | `useAssessmentNotes` now accepts optional `assessmentId` — filters notes to that assessment only. On completion, unlinked notes get stamped with new assessment ID. | `e790864` |
| 9 | Fix List/Kanban/Roadmap button radius | Container `rounded-xl` (12px), inner buttons `rounded-lg` (8px) with 2px padding gap. Corners now visually flush. | `f39e235` |
| 10 | Collapsible filter sections in Action Plan | Filter popover now shows Priority/Department/Sort as collapsed `<details>` headers. Click to expand. Cleaner initial view. | `e790864` |

---

## 2026-06-20

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Deferred status in improvement tracker | Added `.s-deferred` CSS class, Deferred counter in summary bar, progress % excludes deferred items, filter support. 9 items deferred. | `d2df185` |
| 2 | Language selector moved to Account profile | Removed globe icon from header. Language dropdown now in Account → Preferences. Single source of truth — instant apply, syncs to DB + localStorage. | `748884e` |
| 3 | Remove duplicate profile bubble from stats bar | Dashboard top stats bar had a redundant user avatar circle — removed. Sidebar footer already shows user identity. | pending |
| 4 | Improve sidebar collapse toggle visibility | Moved collapsed-state toggle button further right so it doesn't overlap text. Increased border/icon contrast. | `d952433` |
| 5 | Wire i18n into sidebar navigation | AppSidebar now uses `t()` for all nav labels. Added 12 new `nav.*` keys across EN, DE, FR, ES, IT. | `8e0d0a4` |
| 6 | Fix i18n dual-system desync | Synced both localStorage keys. Removed direct `i18next` import from LanguageContext. | `529c711` |
| 7 | Fix assessment crash (missing `cn` import) | Lovable CSS changes used `cn()` calls without importing it. Added `import { cn }`. | `ba75522` |

---

## 2026-06-15

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Playground — Reverse Sales Funnel Calculator | Built first calculator at `/app/playground`. Reusable `PlaygroundCalculatorShell`, KPI-seeded pre-fill. | `8f8f408` |
| 2 | Playground design restyle | Applied design-language tokens — consistent card patterns, shadows, typography. | `0ed73c7` |
| 3 | Forgot password link | Added forgot password link to sign-in form. | `6135dc6` |
| 4 | Remove 21 unused source files | Cleaned up dead code from prior sprints — unused components, hooks, and utilities. | `cd426fb` |
| 5 | Context panel feature | Context intelligence panel for assessment questions — shows relevant background info while answering. | `234785c` |

---

## 2026-06-12 – 2026-06-14 — KPI Questions Sprint

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Question discriminated union | Scored vs. data questions now use TypeScript discriminated union. Scoring gateway ensures only scored questions enter calculation. | `4ad9692` |
| 2 | assessment_kpi_values table | New DB table + 22 KPI data questions added to questionnaire. | `068e116` |
| 3 | KPI input UI | Minimal KPI input UI with unit labels, reference period selectors, and formula helpers. | `b611024` |
| 4 | Exclude KPI from TOTAL_QUESTIONS | Data questions were inflating progress counts. Separated scored-only completion tracking. | `43fdc5f` |
| 5 | Performance Data sub-section | New assessment sub-section UI with KPI inputs grouped by department. Inline formula helper tooltips. | `0a2330b` |
| 6 | Results KPI panel | KPI values displayed in Results with perception-gap cross-validation. PDF appendix for exported reports. | `b03250c` |
| 7 | saveKpiAnswers persistence | Upsert KPI values to `assessment_kpi_values` table on assessment save. | `2d65ebf` |
| 8 | i18n keys for KPI input | Added translation keys for KPI input UI across all supported languages. | `36fab9a` |

---

## 2026-05-29 – 2026-05-30 — Coach Dashboard Overhaul

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Full-width DealerPanel | Two-column briefing command centre for coaches. Replaced old drawer-style dealer view. | `c85064c` |
| 2 | Dark hero card with 4-column metrics | DealerPanel hero matches dealer dashboard design language — score, maturity, actions, coverage. | `0db4a0c` |
| 3 | Pill-style tab strip | DealerPanel tabs redesigned with pill active state for visual consistency. | `3a2328f` |
| 4 | Dept health badge overflow fix | Badge wrapping issue on small screens — switched to 2-row layout. | `5ca94e9` |
| 5 | Action count error handling | Handle null status, exclude null from counts, parallelize queries. | `5fd3b2b` |
| 6 | Merge conflict markers cleanup | Cleared all remaining merge conflict markers from CoachDashboard.tsx. | `e316855` |
| 7 | BriefingTab redesign | Overhauled briefing tab layout for better information hierarchy. | `832e718` |
| 8 | Sidebar layout bugs | Fixed sidebar layout issues affecting collapsed/expanded states. | `e8fe004` |
| 9 | Tab padding | Increased padding on coach dashboard tabs for better touch targets. | `c29cebe` |

---

## 2026-05-22 — Coach Visit Workflow

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Counter-proposal response UI | Coaches can see and respond to dealer counter-proposed visit dates. | `3a79779` |
| 2 | Dealer decline + counter-propose | Dealers can decline or counter-propose coaching visit dates from dashboard banner. | `542d5a7` |
| 3 | VisitBriefingSheet hub | Made briefing sheet a hub — upcoming visit info + cross-dialog links. | `0182740` |
| 4 | OEM Next Visit column | Added Next Visit column to OEM dealer leaderboard table. | `7c8ff1f` |
| 5 | Coach sheets centering | Changed coach Sheet components to Dialog for proper centered display. | `f85f0e5` |
| 6 | Field Notes + score gauge fix | Removed Field Notes from coach view, increased score gauge size, filtered actions to current assessment. | `841d245` |
| 7 | Migration + RLS fixes | Fixed migration file, RLS counter_proposed policy, VisitStatus type, Briefing filter. | `de2030b` |
| 8 | Counter-propose badges | Show counter_proposed + declined status badges on dealer cards. | `b57ec4d` |

---

## 2026-05-20 – 2026-05-21 — Field Notes + Visit Reports

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | VisitLogSheet | Post-visit session log form for coaches — notes, outcomes, follow-ups. | `29a73c5` |
| 2 | FieldNotesCollapsible | Collapsible field notes panel in MaturityScoring department cards. | `a245e32` |
| 3 | Field notes in ActionSheet | Department field notes now visible in action edit panel for context. | `3cb22d7` |
| 4 | PDF Field Notes appendix | Dealer field notes appended to exported PDF reports. | `8067f6e` |
| 5 | Visit provenance badge | Action cards show visit provenance indicator + dept field notes indicator. | `a1e5cc6` |
| 6 | VisitBriefingSheet | Pre-visit dealer intelligence briefing for coaches. | `361fe76` |
| 7 | Download Visit Report | Post-visit coaching PDF report generation + download. | `310a3df` |
| 8 | Mark-as-completed button | Coaches can mark visits as completed directly from VisitSheet. | `ee6137b` |
| 9 | DB: coach_visits session log columns | Extended coach_visits table with session log fields + provenance columns. | `03cad95` |
| 10 | Download report error handling | Added error handling + removed redundant status check in downloadVisitReport. | `c24d3e6` |

---

## 2026-05-18 – 2026-05-19 — Notifications + Knowledge Hub

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | React Email templates | Replaced raw HTML email builders with React Email components for all notification types. | `02e868e` |
| 2 | Tokenised email status links | One-click email links for updating action status (Open → In Progress → Done). | `4781748` |
| 3 | Coach Notes notification trigger | In-app notification triggered on coach note insert. | `8056518` |
| 4 | Cron anon key fix | Cron functions use anon key instead of superuser-only ALTER DATABASE setting. | `1fe0975` |
| 5 | Knowledge Hub — complete | Merged Resource Hub + KPI Encyclopedia into unified Knowledge Hub at `/app/knowledge`. | `74aa961` |
| 6 | KPI dropdown + Results cleanup | Fixed KPI dropdown, Downloads filters, removed Timeline, Results header polish. | `712dae0` |
| 7 | Uniform blue dots in Kanban | Consistent dot indicators in Kanban cards. KPI cards made score-agnostic. Sentence case dept dropdown. | `55f28f3` |
| 8 | 3 vulnerability patches | Fixed 3 security vulnerabilities found in full application audit. | `a841a22` |
| 9 | KPI detail navigation | Navigate back to Knowledge Hub on KPI detail dialog close. | `9aac3fb` |

---

## 2026-05-15 – 2026-05-16 — Coach + OEM Dashboard Polish

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Coach dark hero card | Portfolio score, open actions count, focus dealer — matching dealer dashboard design language. | `9379344` |
| 2 | Coach dealer card redesign | Brand logo, score gauge, progress bar, Enter Dealership CTA. | `f046bd0` |
| 3 | Coach timeline strip | 5-chip timeline showing last assessment, next coach visit, action plan review milestones. | `1744940` |
| 4 | Coach actions scope | Scoped actions to latest assessment per dealer. Decluttered filters. | `81de2a7` |
| 5 | Coach role nav gating | Fixed nav gating for coach role, role labels, brand display, action RLS, dashboard redirect. | `c54b117` |
| 6 | OEM dashboard redesign | Tabs layout, department heatmap, at-risk dealers, leaderboard with drill-down sheet. | `7ecc977` |
| 7 | OEM dashboard polish | Skeletons, heatmap mobile support, empty state, filtered average calculation. | `ec54292` |
| 8 | OEM invite flow | InviteOemUser component + accept redirect. Any org owner/admin can invite OEM users. | `6420db1` |
| 9 | OEM context banner on Results | Results page shows OEM context banner when viewing dealer assessments (#58). | `0d9c335` |
| 10 | RLS circular recursion fix | Broke oem_networks ↔ dealer_network_memberships circular RLS policy dependency. | `f2454a9` |
| 11 | OEM nav gating | Hide Dashboard + Diagnostic nav from OEM users who don't need them. | `d41d9d5` |
| 12 | DialogTitle accessibility | Added missing `DialogTitle` to all `DialogContent` components for screen readers. | `a823eab` |
| 13 | ScoreGauge shared component | Extracted score gauge into reusable shared component used across coach + OEM dashboards. | `48f310e` |
| 14 | Remove bun lock files | Removed bun.lockb, structure.txt. Updated .gitignore. | `7bec6a7` |

---

## 2026-05-09 – 2026-05-14 — Sprint 5 Coach + Assessment UX

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Notification bell → sidebar | Moved notification bell from top bar into sidebar. Full-width content layout. | `05910e9` |
| 2 | AssessmentHeroNav | Removed sidebar from assessment. Added hero navigation with progress tracking. | `5b36519` |
| 3 | Assessment UX polish | Spacing, sticky nav, sidebar collapse, removed duplicate elements. | `3d8c1ff` |
| 4 | Assessment scroll fix | Used `h-screen` on layout root so assessment internal scroll resolves correctly. | `918b622` |
| 5 | Sidebar pill active state | Sidebar navigation with pill-style active state, collapse button, section label styling. | `676458d` |
| 6 | Coach redirect + dashboard fix | Redirect coach from dealer dashboard. Fix Results access for coach view. Hide dealer nav for coaches. | `697cdf0` |
| 7 | DB trigger for audit log | Replaced client-side audit log inserts with DB trigger — fixes 403 errors. | `528bbd2` |
| 8 | Action activity feed | Comments + audit trail in ActionSheet for tracking action history. | `424991b` |
| 9 | Action sync bugs | Badge wrapping, dealer real-time sync, coach save refresh. | `ee90ba6` |
| 10 | Dashboard six-issue hotfix | Batch fix for 6 dashboard display issues found during QA. | `3b5f7d7` |
| 11 | Dashboard hardcoded values | Removed hardcoded avatar/Q2 label. Added `?filter=critical` to priority card navigation. | `1ba2c58` |
| 12 | Coach UPDATE RLS policy | Added missing UPDATE RLS policy for coaches on improvement_actions table. | `bfc60f1` |

---

## 2026-04-20 – 2026-04-22 — Design System v2 + Results Wiring

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Swap Roboto → Inter | Consolidated font stack to Inter. Added dd-accent tokens and signal color aliases. | `9586fa1` |
| 2 | Inter font token + shadow values | Updated shadow-card and shadow-elevated CSS variables for design system v2. | `9875225` |
| 3 | Cross-validation findings in Results | Display cross-validation findings in Results executive tab — tracker #11. | `2356d16` |
| 4 | CeilingInsightsPanel in Results | Render ceiling insights panel in Results executive tab — tracker #15. | `732ef1e` |
| 5 | Two-column context panel | Replaced accordion with persistent two-column layout for assessment questions — tracker #46. | `5e5c917` |
| 6 | KPI position statement on cards | Added KPI position statement to department result cards — tracker #28. | `24ef946` |
| 7 | Dynamic benchmark lookup | Replaced hardcoded benchmark 75 with `benchmark_snapshots` table lookup — tracker #24. | `3c020aa` |
| 8 | SubCategory scores → Heatmap | Wired `calculateSubCategoryScores` output into DepartmentHeatmap — tracker #32. | `4899e98` |
| 9 | Organization type safety | Typed Organization interface with `business_model`, removed `as any` cast — tracker #13. | `ea0aef4` |
| 10 | Question card grid + Lovable regressions | Restored question-card-grid media query and reverted Lovable package regressions. | `baf5309` |

---

## 2026-04-02 – 2026-04-03 — Results UI + Sprint 3 Fixes

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Executive narrative card restyle | Restyled with Assessment Overview label — cleaner hierarchy. | `cfa7fd8` |
| 2 | Recurring pattern cards | Added recurring pattern cards alongside systemic patterns in Results. | `21aa99d` |
| 3 | Border color conflict in pattern cards | Fixed conflicting border class + added stable keys to pattern card list. | `01ae43e` |
| 4 | UUID display + CLAUDE.md pitfalls | Fixed UUID display formatting. Added React hook rules and missing import pitfalls to CLAUDE.md. | `264ea9f` |
| 5 | Missing Badge import | Added missing `Badge` import in integrations tab — would crash in production. | `bfa52b0` |
| 6 | React hook crash revert | Reverted member display query that caused React hook ordering violation. | `b0ba6b9` |
| 7 | Ceiling analysis threshold | Fixed threshold calculation + accurate fallback message — tracker #15. | `69283de` |
| 8 | Team member display + role cleanup | Fixed team member display name resolution + legacy role enum cleanup — tracker #01. | `f246796` |
