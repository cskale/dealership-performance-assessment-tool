# Product Requirements Document
## Dealer Diagnostic — Enterprise Performance Intelligence Platform

**Version:** 1.0  
**Date:** 2 June 2026  
**Status:** Active  
**Audience:** OEM Programme Managers · Network Development Directors · Procurement Committees · Strategic Investors

---

## Executive Summary

Dealer Diagnostic is an enterprise SaaS platform that systematically measures, benchmarks, and improves franchised dealership performance across five core business areas. It gives OEM programme teams a structured, data-consistent view of network health that previously required bespoke consulting engagements or imprecise self-reported surveys.

**The core problem it solves:** OEM field teams currently lack a consistent, scalable method to diagnose dealership underperformance. Coaching relationships are informal. Action accountability is tracked in spreadsheets. Network-wide patterns are invisible until they appear in financial results — by which point the cost of intervention is significantly higher.

**The platform delivers:**
- Structured 61-question diagnostic assessment across 5 departments, calibrated to Western European industry benchmarks
- Automated signal detection identifying critical gaps, systemic cross-department patterns, and leading-indicator KPIs
- Prioritised action plans with 30/60/90-day implementation roadmaps, tied directly to assessment findings
- Real-time coach–dealer collaboration layer with field visit management, note-taking, and action accountability
- OEM-level network dashboard showing portfolio health, leaderboard rankings, tier performance, and risk signals — across all enrolled dealers simultaneously

**Deployed production URL:** `https://dealership-performance-assessment-t.vercel.app`

---

## 1. Market Problem

### 1.1 The Diagnosis Gap

Franchised dealership performance varies significantly within OEM networks. The top quartile typically outperforms the bottom quartile by 15–25 points on composite operational metrics. Yet most OEM field programmes lack the instrumentation to consistently identify *why* underperforming dealers lag, which departments are the root cause, and which interventions produce sustained improvement.

The current state for most networks:
- **Field coaches operate on instinct.** Coaching visit quality depends entirely on individual coach experience. There is no structured diagnostic framework, no pre-visit data preparation, and no post-visit accountability mechanism.
- **Benchmarks are opaque.** Dealers do not know how they compare to their peer group, their OEM programme standards, or Western European industry averages. Without reference points, performance conversations default to anecdote.
- **Action plans are disconnected from diagnosis.** Where action plans exist, they are typically generated separately from any formal assessment — meaning the actions may not address the actual root cause.
- **Systemic patterns go undetected.** A dealer with moderate scores in three separate departments may have an underlying cross-departmental management issue. Without correlated data, this pattern is invisible to both the coach and the OEM.
- **Network health requires manual aggregation.** OEM programme managers currently aggregate dealer performance data by hand across spreadsheets, CRM exports, and DMS reports — a process that is both time-consuming and inconsistent.

### 1.2 Cost of Inaction

Industry research from NADA and JATO indicates that underperforming dealers operate at 60–70% of their addressable profit potential. For a mid-size OEM network of 50 dealers, bringing the bottom quartile to median performance represents an estimated €8–15M in incremental gross profit annually. The cost of structured diagnostic and coaching infrastructure is a fraction of this figure.

### 1.3 The Opportunity

No dedicated SaaS platform exists for franchise dealer diagnostics at the network level. The competitive set is fragmented: generic survey tools (SurveyMonkey, Typeform) lack industry-specific benchmarks and signal intelligence; OEM proprietary tools (where they exist) are monolithic, expensive to maintain, and inaccessible to smaller network operators; consulting-led diagnostic programmes are one-time engagements with no persistent data layer.

Dealer Diagnostic occupies a defensible position: dealer-specific, benchmark-calibrated, multi-tenant, and built for ongoing operational use rather than a single diagnostic moment.

---

## 2. Target Users

### 2.1 Primary Personas

**Dealer Principal / General Manager**
- *Context:* Runs one or more franchise outlets. Accountable to the OEM for performance targets. May manage a team of 20–120 staff across sales, service, parts, and finance.
- *Pain point:* Receives performance feedback reactively (end-of-month results, quarterly reviews). Lacks a structured internal diagnostic capability.
- *Goal:* Understand where the business is underperforming before the OEM does. Have a credible, evidence-based action plan ready for coaching visits.
- *How they use the platform:* Completes the 61-question assessment. Reviews the results page with the executive narrative and action plan. Tracks action progress via the Kanban board. Receives coach visit confirmations and notification nudges.

**OEM Field Coach / Development Manager**
- *Context:* Responsible for 5–15 assigned dealerships within an OEM network. Conducts quarterly or monthly field visits. Accountable to the OEM for dealer development KPIs.
- *Pain point:* Pre-visit preparation is time-consuming and inconsistent. Post-visit action follow-up is tracked informally. Difficult to maintain a portfolio view across all assigned dealers simultaneously.
- *Goal:* Walk into every dealer visit with a structured, data-driven briefing. Leave every visit with an agreed, tracked action plan. Surface network-wide patterns across the portfolio.
- *How they use the platform:* Reviews the coach dashboard for portfolio overview. Opens the dealer panel command centre for pre-visit preparation. Posts field notes and coach commentary. Schedules and confirms visits. Monitors action progress across the portfolio in the action tracker.

**OEM Programme Manager / Network Development Director**
- *Context:* Senior role overseeing network performance, programme compliance, and dealer development strategy. May manage a team of coaches. Reports to VP Sales or MD.
- *Pain point:* Network health data requires manual aggregation. Cross-dealer comparisons are inconsistent. Identifying systemic network-wide patterns requires bespoke analysis.
- *Goal:* Real-time visibility into network health. Leaderboard by performance tier. Early warning when dealers fall below programme thresholds. Evidence base for investment decisions (training, capital support, dealer transitions).
- *How they use the platform:* OEM dashboard for network-level heatmap, score distribution, and tier performance. Enrols dealers via email lookup. Reviews network insights cards for systemic signal patterns. Drills into individual dealer results for programme review meetings.

### 2.2 Secondary Personas

**Dealer Department Head** (Sales Manager, Service Manager, Parts Manager)  
Uses the platform to review department-level scores, benchmark position, and assigned action items. Primarily a consumer of the action plan, not a driver of the assessment.

**Dealer Group / Multi-Franchise Operator**  
Manages multiple dealerships under one organisation. Uses the platform to compare performance across outlets and identify which locations need priority coaching resource.

---

## 3. Product Capabilities

### 3.1 Diagnostic Assessment Engine

**61-question structured assessment** covering five departments:

| Department | Code | Questions |
|------------|------|-----------|
| New Vehicle Sales | NVS | 13 |
| Used Vehicle Sales | UVS | 12 |
| Service | SVC | 14 |
| Parts | PTS | 11 |
| Financial Operations | FIN | 11 |

Assessment structure:
- 1–5 Likert scale per question, weighted by category importance
- Category weights defined per department; scores normalised to 0–100
- Questions are neutral white tiles (no anchoring-bias colour coding until selection)
- Assessment progress is auto-saved; can be completed across multiple sessions
- Estimated completion time: 25–35 minutes for a thorough first assessment

**Scoring model:**
- Overall score: weighted composite across all 5 departments
- Department scores: weighted category composites
- Sub-category scores: granular diagnostic breakdowns
- Confidence interval: calculated based on question coverage and response consistency; displayed as `reviewRecommended` flag when variance is high

### 3.2 Signal Intelligence Engine

Automated post-assessment analysis generating structured diagnostic signals:

**Signal types:**
- `CRITICAL_GAP` — department score <50; requires immediate intervention
- `HIGH_PRIORITY` — department score 50–64; improvement required within 30 days
- `GROWTH_OPPORTUNITY` — department score 65–74; structured improvement programme recommended
- `STRENGTH` — department score ≥85; benchmarked strength signal

**Pattern detection:**
- `SYSTEMIC` — 3+ departments sharing the same signal type → cross-functional root cause indicated
- `RECURRING` — 2 departments sharing the same signal → management-level pattern

**Maturity model (5 levels):**

| Level | Score range | Condition |
|-------|-------------|-----------|
| Foundational | 0–45 | Critical intervention required |
| Developing | 46–69 | Improvement programme in progress |
| Performing | 70–84 | At or above benchmark |
| Advanced | 85–100 | Above benchmark, no sub-category below 60 |
| Leading | 85–100 | Advanced AND all sub-categories ≥60 (strict threshold) |

**Executive narrative:** 32 variants generated from maturity × signal × pattern combinations. Plain-language paragraphs interpretable by non-technical dealer principals.

### 3.3 Benchmarking

All scores are contextualised against a tiered benchmark hierarchy:

| Tier | Source | Confidence |
|------|--------|------------|
| 1 — OEM-Specific | Manufacturer programme data | High |
| 2 — Verified Industry | NADA, JATO, DAT, EurotaxGlass's, Cox Automotive Europe | High |
| 3 — Estimated | Statistical models from available data | Medium |
| 4 — Generic | Cross-industry operational benchmarks | Low |

111 KPIs fully documented in the KPI Encyclopedia with benchmark position, corridor chart (P25–P75), explanation, and improvement playbook. Geographic scope: Western Europe primary, NADA North America reference. Annual refresh cadence.

### 3.4 Action Plan System

**22 action templates** mapped to specific signal types, departments, and business model variants (2S/3S/4S). Each template includes:
- Title and strategic objective
- 3–5 implementation steps with role assignments
- Linked KPIs (what will improve if this action succeeds)
- Implementation time horizon (30/60/90-day categorisation)
- Business model relevance tags (e.g. "relevant to service + bodyshop models only")

**Action management views:**
- **Kanban board** — Open / In Progress / Completed columns with HTML5 drag-and-drop
- **30/60/90 roadmap** — Three-column time-horizon grouping
- **ActionSheet** — Full action detail: title, description, status, priority, department, responsible person, due date, linked KPIs, triage scores (impact/effort/urgency)
- **Activity feed** — Merged timeline of audit log entries (automatic field-change events) and manual comments from dealer and coach; real-time via Supabase Realtime; Ctrl+Enter to post

### 3.5 Coach Portal

**Coach Dashboard** — Portfolio-level view for assigned dealers:
- Dark stats bar: Assigned dealers · Portfolio average score · Overdue actions · Critical gaps
- Precision header strip with quarter label and date context
- Dark hero card (3 columns): Portfolio Score + maturity narrative · Open Actions + top overdue items · Focus Dealer (lowest score)
- 5-chip timeline strip: Last Visit · Next Visit · Assessments Due · Overdue Actions · Action Plan Review
- OEM brand-styled dealer cards with Clearbit brand logo, circular score gauge, action plan progress bar, visit chip, "Enter Dealership →" CTA
- Dealer cards grouped by OEM network with pill tab switcher
- Network Actions Requiring Attention table: 6-column, Overdue/Stale/All Open tabs, derived status badges (BLOCKED/STALLED/IN PROGRESS/ASSIGNED)

**Dealer Panel command centre** — Full-width two-column modal (95vw × 90vh) for deep-dive per-dealer preparation:
- Dark hero header: dealer name, location, 4-metric grid (Overall Score / Actions Status / Next Visit / Critical Gaps)
- Left column: Top 3 Focus Actions (priority icons, due-date badges, stale warnings) + tabbed activity feed
- Right sidebar: Department Health card (per-dept score bar, gap vs benchmark, status chip) · Upcoming Visit card · Insight card (conditional on data staleness)
- Tabs: Activity Log · Visit History · Coach Notes

**Action Tracker** (`/app/coach-actions`) — Unified table of all open actions across all assigned dealers (scoped to latest completed assessment per dealer). Full ActionSheet on row click. Real-time sync bidirectional with dealer view.

**Field visit management:**
- Propose, confirm, cancel coach visits via Visit dialog
- Dealer can accept, decline, or counter-propose visit dates
- Visit confirmation banner on dealer dashboard with one-click confirm
- Visit history per dealer

### 3.6 OEM Network Portal

**OEM Dashboard** (`/app/oem-dashboard`) — Network command centre:
- Dark stats bar: Network size · Average score · Critical gaps · Enrolled dealers
- Dark 3-column hero card: Network Performance Score · Enrolled Dealer Health distribution · Top 3 Department Weaknesses
- Dealer cards grid (1/2/3-col responsive): ScoreGauge ring, Tier badge, top-3 weakest dept score bars, open action count, freshness chip, "Enter Dealership →" CTA
- Network Insights cards: Score Momentum (network avg trend) · Assessment Coverage (stale/missing alert) · Network Insights (dept weakness counts + recurring signal codes)
- Leaderboard tab: Network Portfolio Heatmap (all dealers × all departments), tier filter, rank arrows, dealer drill-down sheet
- Results page OEM context banner: "Viewing as OEM · {Dealer Name}" with back navigation

**OEM Network Settings** (`/app/oem-settings`):
- Create/edit OEM network (name, brand, country scope)
- Add dealers by email lookup (cross-org, via SECURITY DEFINER RPC — no org boundary violation)
- Programme Tier assignment (Standard / Silver / Gold / Platinum)
- Soft-remove dealers (sets `is_active = false`; re-adding reactivates)

**OEM user provisioning:**
- Self-service: org owner with an active OEM network can invite OEM users from Account → Team or OEM Settings
- No manual SQL required for standard OEM onboarding

### 3.7 Knowledge Hub (`/app/knowledge`)

Three tabs replacing the previously separate Resource Hub and KPI Encyclopedia:
- **Recommended** — Score-driven gap cards: classifies department scores into CRITICAL_GAP / HIGH_PRIORITY / GROWTH_OPPORTUNITY, fetches matching resources from Supabase, groups by department with signal badge. Learning paths with progress tracking.
- **KPI Encyclopedia** — 111 KPIs searchable by name + filterable by department. Each KPI has: definition, benchmark position (P25/P75 corridor), improvement playbook, root cause tiles, relationship map.
- **Downloads** — Templates, guides, case studies. Pill filters by type + sort. Recommended downloads strip when assessment gaps exist.

### 3.8 Notification System

- **In-app notification bell** with real-time unread badge (Supabase Realtime)
- **Email notifications** via Resend (React Email templates with brand wrapper)
- **Stale action nudge** — pg_cron checks daily at 08:00 UTC; fires after Critical=7d / High=14d / Medium=21d without status update
- **One-click email action update** — Stale nudge emails include [Mark In Progress] / [Mark Complete] buttons; HMAC-SHA-256 signed tokens, 72-hour expiry, single-use nonce
- **Weekly digest** — Monday 07:00 UTC; aggregates open/overdue count + top 3 actions per org
- **Coach commentary notifications** — real-time in-app alert when coach posts a note on your dealership's action

### 3.9 Export

- **PDF report** — Full results export (html2canvas + jsPDF). A4 portrait and landscape. Branded header, score ring, department heatmap, executive narrative, action plan.
- **Excel export** — Action plan and KPI data (xlsx)

---

## 4. Business Outcomes

### 4.1 Value Proposition by Persona

**For the OEM Programme Manager:**
- Replace manual spreadsheet aggregation with a real-time network dashboard
- Standardise coaching quality across all field coaches — every coach works from the same diagnostic framework
- Evidence base for tier assignment, investment decisions, and dealer transitions
- Early warning system: catch underperformance trends at the signal level, not the financial-results level

**For the Field Coach:**
- Eliminate pre-visit preparation time: full dealer briefing available in the command centre
- Post-visit action accountability built into the platform — coaches no longer need to chase via email
- Portfolio pattern detection: identify which dealers are systemic risks vs individual outliers
- Demonstrate field performance to OEM management with quantified metrics (avg portfolio score, overdue actions, critical gaps)

**For the Dealer Principal:**
- Objective external benchmark for self-assessment — removes ambiguity about "how are we doing?"
- Structured action plan with role assignments and time horizons — replaces ad-hoc improvement conversations
- Transparent preparation for OEM coaching visits — dealer and coach work from the same data
- Progress tracking over time — maturity progression visible across successive assessments

### 4.2 Indicative ROI Framework

For a mid-size OEM network of 30 enrolled dealers using the platform consistently (quarterly assessment cycle, active coaching):

| Metric | Conservative estimate | Basis |
|--------|----------------------|-------|
| Average score improvement per dealer per year | +8–12 points | Assuming structured coaching + action accountability vs informal coaching |
| Bottom-quartile dealers reaching median performance | 2–4 dealers per year | Action plan completion rate assumption |
| Incremental gross profit per dealer per year (bottom → median) | €250K–€600K | Based on NADA dealer composite data |
| Network-level annual incremental gross profit | €500K–€2.4M | Range across conservative/optimistic assumptions |
| Platform cost as % of incremental GP | <5% at any reasonable pricing | Order-of-magnitude calculation |

These projections assume consistent platform usage. The platform does not generate outcomes without dealer engagement and active coaching.

---

## 5. Technical Foundation

### 5.1 Architecture Summary

```
Frontend:   React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
Backend:    Supabase (PostgreSQL 15, Row Level Security, Auth, Realtime, Edge Functions)
Deployment: Vercel (auto-deploy on push to main; CDN-distributed globally)
Testing:    Vitest, jsdom, 80% branch/function/line/statement coverage enforced
```

### 5.2 Multi-Tenancy

The platform is fully multi-tenant. Data isolation is enforced at the database layer via Supabase Row Level Security — not at the application layer. Each organisation's data is scoped by `organization_id`. Cross-organisation queries (for OEM networks spanning multiple dealer organisations) are performed exclusively via SECURITY DEFINER functions in a restricted `private` schema, preventing any RLS bypass.

### 5.3 Scalability

- Supabase Postgres scales vertically; horizontal read replicas available on Pro/Team plans
- Vercel serverless deployment: no fixed infrastructure to provision
- Assessment engine is a pure client-side computation (no server round-trip for scoring) — response time is independent of user count
- Current test suite: 186 tests, <10s execution time

### 5.4 Internationalisation

- **English and German:** Complete translations for all UI strings
- **French, Spanish, Italian:** Schema exists; translations are stubs — suitable for roadmap expansion
- All OEM and coach interface strings include EN and DE translations
- Language selection persists per user session

### 5.5 Integrations

| System | Type | Status |
|--------|------|--------|
| Supabase | Backend (database, auth, realtime, edge functions) | Production |
| Vercel | Frontend deployment + CDN | Production |
| Resend | Transactional email (notifications, digests, invite emails) | Production |
| Clearbit | OEM brand logo lookup (no API key — public image endpoint) | Production |

---

## 6. Security & Compliance Posture

Full detail in [SECURITY.md](SECURITY.md). Summary for procurement:

- **Authentication:** Supabase Auth (GoTrue) with JWT validation on every request
- **Authorisation:** PostgreSQL Row Level Security on all tables; no RLS-disabled tables in production
- **Cross-org data access:** Only via SECURITY DEFINER functions in a restricted private schema
- **Privilege escalation prevention:** `actor_type` field changes blocked at DB policy level; only permissible via named RPCs
- **Secrets:** Service role key and Resend API key stored in platform secrets only — confirmed absent from all git history
- **Email relay security:** All transactional email endpoints require JWT validation + recipient email verification before dispatch
- **Invite security:** Single-use tokens, 7-day expiry, `FOR UPDATE` lock, email match enforced at DB level

**Compliance readiness:**
- Data residency: Supabase EU region available on request
- SOC 2 Type I: Planned — target 12 months from contract
- GDPR: Data deletion via `auth.users` cascade on account deletion; no personal data stored outside Supabase
- Penetration test: Planned pre-OEM enterprise network launch

---

## 7. Roadmap

### 7.1 Committed Near-Term (Q3 2026)

| Item | Description | Tracker |
|------|-------------|---------|
| Score delta / trajectory card | Historical snapshot model enabling score-over-time trending per dealer and department | #36 |
| Assessment templates (OEM question weighting) | OEM admins can adjust question weights and add programme-specific questions | #14 |
| Context intake questionnaire | Pre-assessment context capture (business model, headcount, market conditions) | #12 |
| Coach assignment management UI | Assign/unassign coaches to dealers from the OEM dashboard without SQL | – |
| What-If Simulator | Model the score impact of resolving specific gaps before committing to an action plan | Approved |

### 7.2 Medium-Term (Q4 2026 – Q1 2027)

| Item | Description |
|------|-------------|
| ROI Layer on Actions | Quantify the estimated financial impact of each action plan item; surface as "estimated uplift" per action |
| AI Coaching Narrative (Claude API) | Use Claude Sonnet to generate contextualised, dealership-specific coaching narratives beyond the 32-variant template model |
| Network map view | Geographic visualisation of dealer network health |
| OEM signal aggregation drill-down | Click on a signal code in the OEM dashboard → list of all affected dealers in that network |
| Tier gap analysis | Structured view of what each dealer needs to achieve the next programme tier |
| Modular assessment | Allow dealers to complete department-by-department (e.g. Service only) rather than full assessment |

### 7.3 Deferred / Under Evaluation

| Item | Status |
|------|--------|
| DMS integration (CDK, Reynolds) | Evaluating — complexity of DMS APIs significant; would enable automated KPI pre-fill |
| Multi-language full completion (FR/ES/IT) | Deferred — requires translation resource |
| Mobile app (React Native) | Deferred — web responsive sufficient for current users |

---

## 8. Commercial Considerations

Pricing model not yet finalised. The following frameworks are under consideration:

| Model | Description | Fit |
|-------|-------------|-----|
| **Per-dealer, per-network** | €X/dealer/month billed to OEM | Aligns cost with network size; OEM owns the commercial relationship |
| **Per-seat (coach)** | €Y/coach/month + free dealer access | Aligns cost with coaching programme investment |
| **Enterprise flat fee** | Annual licence per OEM brand | Simplest procurement; suitable for large network contracts |

**Indicative positioning:** Mid-market SaaS for OEM network development programmes. Target: €8K–€25K/year per OEM network (30–100 dealers). Above the threshold of informal tooling budgets; well below the cost of a consulting-led diagnostic programme.

---

## 9. Assumptions & Constraints

- Platform assumes the primary user device is a desktop or laptop browser (1280px+ viewport). Mobile is functional but not the primary design target.
- The platform does not connect to DMS systems for automated KPI data collection. All assessment answers are user-entered.
- Benchmark data reflects Western European franchised dealer benchmarks as of Q4 2024. OEM-specific benchmarks require manual configuration per programme.
- The current technical architecture is optimised for networks of up to ~500 dealers. Horizontal scaling for larger networks would require Supabase infrastructure upgrade (within the Supabase platform — no code changes needed).
- The coaching model assumes OEM-employed field coaches. Third-party coaching organisations can be supported but have not been the primary design focus.
