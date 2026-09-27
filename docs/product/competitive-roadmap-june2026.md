# Competitive Roadmap — June 2026

## Competitive Landscape

### Primary Competitor: Loop Software (loop-software.com)
- Enterprise OEM network management platform
- 25+ OEM customers (VW Group, Audi, Honda, Hyundai, Porsche, AGCO)
- 72,500 users, 45,000 dealers, 155 countries, 15+ languages
- ISO 27001, TISAX, Cyber Essentials Plus, SSO
- Funded by Stonehage Fleming
- Two products: Loop Operate (lifecycle) + Loop Perform (performance)
- Key modules: Dashboards, Scorecards, Visits, Audits, Bonus Programs

### Our Position: Dealer Diagnostic & Performance Intelligence Platform
- Diagnostic-first (not dashboard-first)
- Signal engine + maturity model + narrative intelligence
- 3 actor types: Dealer, Coach, OEM
- Self-serve deployment (Vercel), no 8-week implementation
- Built for independent coaches + smaller OEM networks

---

## Where We Already Win

| Capability | Loop | Our Tool |
|-----------|------|----------|
| **Diagnostic intelligence** | ❌ Tracks KPIs only | ✅ Signal engine, cross-validation, ceiling analysis, root-cause dimensions |
| **Maturity model** | ❌ Generic balanced scorecards | ✅ 5-level model with evidence-based thresholds |
| **Automated action generation** | ❌ Manual during visits | ✅ Signal → template → KPI-linked actions |
| **What-If simulators** | ❌ None | ✅ Playground with Reverse Sales Funnel (+ 11 planned) |
| **Executive narratives** | ❌ Numbers only | ✅ 32 variants (maturity × signal × pattern type) |
| **Deployment speed** | 8+ weeks implementation | Instant (Vercel auto-deploy) |
| **Cost barrier** | Enterprise SaaS pricing | Self-serve, low/no barrier |

---

## Differentiation Strategy

### Positioning: "Intelligence Layer, Not Another Dashboard"

Loop answers: **"How are my dealers performing?"**
We answer: **"Why are they performing that way, and what specifically should change?"**

### Three differentiators to defend and deepen

1. **Diagnostic Depth** — Signal engine detects systemic patterns across departments, identifies root causes (people/process/tools/structure/incentives), and generates contextual recommendations. No competitor does this. Deepen with cross-validation rules, ceiling analysis wiring, and causal chain visualization.

2. **Coaching Intelligence** — Coach dashboard isn't just a dealer list. It's a briefing command centre with visit workflows, field notes, action provenance, and dealer intelligence. Add visit templates + closed-loop tracking to make this unassailable.

3. **Playground Simulators** — What-If tools that let dealers experiment with scenarios before committing resources. Unique in this market. Ship remaining 11 calculators to build a moat.

---

## Roadmap: 4 Phases

### Phase 1: Foundation Gaps (July 2026)
Priority: Remove blockers for first OEM pilot

| # | Item | Source | Effort | Impact |
|---|------|--------|--------|--------|
| 1 | Seed `kpi_benchmark_thresholds` with real peer-group data | Diagnosis | Medium | High — turns placeholder benchmarks into credible corridors |
| 2 | Delta scoring across assessments (#36) | Tracker | Medium | High — trend arrows, trajectory cards, assessment-over-assessment comparison |
| 3 | CSV/bulk KPI import | Loop + Diagnosis | Medium | High — removes manual entry friction, first step toward DMS |
| 4 | Complete FR/ES/IT translations | Loop | Medium | Medium — multi-market readiness |
| 5 | Trust & Security public page (`/security`) | Loop | Low | Medium — enterprise credibility signal |

### Phase 2: Enterprise Readiness (Aug 2026)
Priority: OEM-grade features

| # | Item | Source | Effort | Impact |
|---|------|--------|--------|--------|
| 6 | SSO (SAML) via Supabase enterprise | Loop | Low (config) | Critical — table stakes for OEM pilots |
| 7 | Branded OEM tenants (brand color theming per network) | Loop | Medium | Medium — white-label feel per OEM |
| 8 | Visit templates by type (quarterly, onboarding, follow-up) | Loop | Low | Medium — structured coaching workflows |
| 9 | Closed-loop action tracking (KPI improved → action auto-confirmed) | Diagnosis | Medium | High — proves impact, closes feedback loop |
| 10 | Action Plan promoted to sidebar nav item | Loop UX | Low | Low — visibility improvement |

### Phase 3: Intelligence Moat (Sep–Oct 2026)
Priority: Deepen what competitors can't replicate

| # | Item | Source | Effort | Impact |
|---|------|--------|--------|--------|
| 11 | Remaining 11 Playground calculators | Tracker | High | High — unique simulator ecosystem |
| 12 | AI Coaching Narrative (Claude API) | Next Phase Ideas | High | High — personalized improvement narratives |
| 13 | ROI Layer on Actions (estimated € impact per action) | Next Phase Ideas | Medium | High — CFO-grade justification |
| 14 | What-If Simulator (score projection from hypothetical changes) | Next Phase Ideas | Medium | High — planning tool for dealer principals |
| 15 | Wire `evaluateCrossValidations()` into Results page | Tracker | Low | Medium — surface hidden contradictions |

### Phase 4: Scale & Integrate (Nov–Dec 2026)
Priority: Production-grade for multi-OEM deployment

| # | Item | Source | Effort | Impact |
|---|------|--------|--------|--------|
| 16 | DMS API integration (start with 1 provider) | Diagnosis | High | Critical — automated data flow |
| 17 | Bonus program tracking module | Loop | High | High — OEM commercial feature |
| 18 | Dealer onboarding workflow (contract + approval) | Loop | Medium | Medium — lifecycle management |
| 19 | Governance playbook (data retention, compliance docs) | Diagnosis | Medium | Medium — enterprise procurement |
| 20 | Multi-OEM deployment (separate tenants, shared infra) | Loop | High | Critical — scale architecture |

---

## Design & UX Improvements

| Area | Current State | Target State |
|------|--------------|--------------|
| Department headers (KPI panel) | Light grey bars | ✅ Done (June 2026) |
| Results page | Tab-heavy, multi-page | Single scrollable page (#44) |
| Action Plan | Tab in Results | Promoted sidebar nav item |
| Executive summary | Text-heavy narrative | Dark hero card with 3-4 headline metrics |
| Coach visit workflow | Basic form | Template-driven with pre/during/post phases |
| OEM dashboard | Leaderboard table | Add heatmap density + trend sparklines |
| Login/public pages | Generic | Trust signals (methodology link, security badges) |
| Data density | One KPI per row, wide spacing | Tighter scorecard layout, more KPIs per viewport |

---

## Key Metrics to Track

- **Time to first insight**: How fast can a new dealer go from signup → completed assessment → actionable results? Target: < 45 minutes.
- **Action completion rate**: % of generated actions marked complete within 90 days. Proves tool drives change.
- **Assessment repeat rate**: % of dealers who complete a second assessment. Proves ongoing value.
- **Coach adoption**: Actions created per coach per month. Proves coaching workflow works.
- **OEM pilot conversion**: Demo → paid pilot → expansion. Proves enterprise readiness.

---

## Bottom Line

We are NOT competing head-to-head with Loop on operational network management. We compete on **diagnostic intelligence and coaching effectiveness**. Loop is a reporting platform that became a performance tool. We are an intelligence platform built for performance improvement from day one.

The game plan: own the "why" and "what to do" layer. Let Loop (or DMS vendors) own the "what happened" data layer. When ready, integrate with them rather than replacing them.

Generated 2026-06-23 · Dealer Diagnostic Platform
