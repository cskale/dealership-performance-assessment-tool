# Enhancement Log — Small Improvements & Tweaks

Quick-reference log of incremental enhancements, UI fixes, and small quality-of-life improvements made outside of major feature sprints.

---

## 2026-06-22

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Ponytail audit — dead code cleanup | Deleted 27 unused files: 10 dead components/pages (IndustrialKPIDashboard, DealerActions, DealershipInfoForm, DealerContextForm, SmartAssistant, LanguageSelector, RoleSelector, UsefulResources, ResourceCard, AppHeader) + 17 unused shadcn/ui components (accordion, aspect-ratio, breadcrumb, carousel, checkbox, context-menu, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, radio-group, resizable, signal-card, toggle-group). | pending |
| 2 | Ponytail audit — unused npm deps | Uninstalled 13 packages: embla-carousel-react, react-resizable-panels, input-otp, vaul, and 9 Radix UI packages (@radix-ui/react-accordion, aspect-ratio, checkbox, context-menu, hover-card, menubar, navigation-menu, radio-group, toggle-group). Build verified clean. | pending |
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
