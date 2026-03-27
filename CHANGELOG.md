# CHANGELOG — Dealer Diagnostic Platform

All notable changes to this project are documented here.
Format: `[Type] Description (tracker item · commit sha)`
Types: **feat** · **fix** · **security** · **perf** · **docs** · **refactor**

Production URL: https://dealership-performance-assessment-t.vercel.app
Repository: https://github.com/cskale/dealership-performance-assessment-tool

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

- **feat** Ceiling analysis wired to Results page — `generateCeilingInsights()` connected via `useMemo` in `Results.tsx`; data ready for UI rendering (render TODO added). *(item 12 · `24a8219`)*

- **verified** `implementationSteps` migration confirmed complete — all action templates already using `{ text, primaryRole }` format; no migration work required. *(item 02 · `24a8219`)*

### UI (Lovable)

- **feat** SVG score rings on Results page — animated SVG ring component replacing static score bars; score rings rendered per department. *(`5abd32a`, `4a54261`)*

- **fix** Results cards layout and alignment corrected. *(`21ef7c4`, `2b7f297`)*

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

- **feat** `src/data/actionTemplatesTiered.ts` — 688-line tiered action template system. 27 templates across 9 signal codes × 3 score bands: `foundational` (20–45), `developing` (46–69), `optimising` (70–84). Signals covered: `NVS_LEAD_RESPONSE`, `NVS_CLOSING_RATIO`, `NVS_GROSS_PER_UNIT`, `UVS_STOCK_TURN`, `SVC_WORKSHOP_UTILISATION`, `SVC_CSI`, `FIN_NET_PROFIT`, `PTS_OBSOLESCENCE`. Exports: `getTieredTemplate()`, `filterByBusinessModel()`, `scoreToBand()`, `getAllBandsForSignal()`. *(item 20)*

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

- **feat** `crossValidationRules.ts` — 5 cross-validation rules created: NVS productivity (nvs-1/nvs-7), service utilisation vs CSI (svc-1/svc-5), parts blocking service (svc-2/svc-9), profit-cash disconnect (fin-1/fin-2), hidden dead stock (pts-1/pts-4). `evaluateCrossValidations()` function ready. *(item 11)*

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
