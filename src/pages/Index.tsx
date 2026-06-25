import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { HomeHeader } from "@/components/Navigation/HomeHeader";
import { Footer } from "@/components/Home/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Reveal, Counter } from "@/components/landing/Reveal";
import { ScrollShowcase, type ShowcasePanel } from "@/components/landing/ScrollShowcase";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  FileText,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Star,
  Activity,
  BookOpen,
  Calculator,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";

/* ────────────────────────────────────────────
   HERO
   ──────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-dd-midnight pt-16">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-500)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-500)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="lg:grid lg:grid-cols-2 gap-20 items-center">
          {/* Left — copy */}
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] uppercase tracking-[0.15em] font-semibold bg-white/5 text-white/60 border border-white/10">
                Dealer Diagnostic & Performance Platform
              </span>

              <h1 className="mt-6 font-black text-5xl md:text-6xl lg:text-[68px] leading-[1.04] tracking-tight text-white">
                Diagnose. Prioritise.{" "}
                <span className="underline decoration-brand-500 decoration-[3px] underline-offset-[6px]">
                  Improve.
                </span>
              </h1>

              <p className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed">
                The only dealer performance platform that turns assessment
                answers into deterministic, auditable action plans — built for
                OEM programme teams.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 items-center">
                <Button
                  size="lg"
                  className="bg-brand-500 text-white hover:bg-brand-500/90 h-12 px-7 text-[15px] font-semibold shadow-lg shadow-brand-500/25"
                  asChild
                >
                  <Link to="/auth">
                    Request OEM Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="border border-white/15 text-white/80 bg-transparent hover:bg-white/5 hover:text-white h-12 px-7"
                  asChild
                >
                  <Link to="/methodology">View Methodology</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
                <span>Built for</span>
                <span className="text-white/50">Dealer Principals</span>
                <span>·</span>
                <span className="text-white/50">Field Coaches</span>
                <span>·</span>
                <span className="text-white/50">OEM Programme Managers</span>
              </div>
            </div>
          </Reveal>

          {/* Right — floating cards */}
          <Reveal delay={200}>
            <div className="mt-16 lg:mt-0 relative">
              {/* Main card */}
              <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">
                {/* Score row */}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">
                    SERVICE DEPARTMENT
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-white tabular-nums">
                      68
                    </span>
                    <span className="text-sm text-white/40">/ 100</span>
                    <span className="ml-auto text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                      Developing
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>

                {/* Signal */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">
                    SIGNAL DETECTED
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Capacity Misalignment
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    3 questions triggered · HIGH severity · service-performance
                  </p>
                  <span className="inline-flex mt-2 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/20">
                    HIGH
                  </span>
                </div>

                {/* Action */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">
                    ACTION GENERATED
                  </p>
                  <p className="text-sm font-semibold text-white leading-snug">
                    Implement structured throughput management
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Service Manager · 60 days · Developing band
                  </p>
                </div>

                {/* Audit trail */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[11px] font-mono text-white/25 leading-relaxed">
                    Q17 → CAPACITY_MISALIGNED :: service-performance
                    <br />→ Service workshop utilisation (Developing) → Action
                  </p>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-4 -right-4 bg-brand-500 text-white rounded-xl px-5 py-3 shadow-lg shadow-brand-500/30 animate-float">
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold opacity-70">
                  Deterministic
                </p>
                <p className="text-sm font-bold mt-0.5">No AI. No randomness.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   HOW IT WORKS
   ──────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    icon: ClipboardCheck,
    title: "Assess",
    body: "100+ KPI questions across 5 departments. Scored 1–5 per item, weighted by category.",
  },
  {
    num: "02",
    icon: Activity,
    title: "Diagnose",
    body: "Scoring engine + signal engine detect weak scores and group them into named signals.",
  },
  {
    num: "03",
    icon: Target,
    title: "Prioritise",
    body: "Template lookup selects maturity-appropriate actions. Context intelligence adds drivers and effort.",
  },
  {
    num: "04",
    icon: FileText,
    title: "Act",
    body: "Auditable action plan with owners, timelines, and full traceability to source questions.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-dd-fog border-y border-border py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Four steps from assessment to action plan.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 100}>
              <div className="relative bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/[0.04] h-full group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/50">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
                {i < 3 && (
                  <ChevronRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 h-5 w-5" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   CAPABILITIES
   ──────────────────────────────────────────── */
const CAPABILITIES = [
  {
    icon: BarChart3,
    title: "Score-Band Intelligence",
    body: "A dealer at 38% and one at 72% with the same signal get different actions. Foundational gets gap-closure. Advanced gets ceiling actions.",
  },
  {
    icon: Shield,
    title: "Full Audit Trail",
    body: "Question ID → Signal Code → Template → Action → DB Record. OEM-ready. Reproducible. Defensible in programme reviews.",
  },
  {
    icon: Zap,
    title: "Deterministic Engine",
    body: "No generative AI. No randomness. Same answers always produce the same signals, templates, and actions.",
  },
  {
    icon: Users,
    title: "Multi-Role Architecture",
    body: "Dealers see their own data. Coaches see assigned dealers. OEM admins see the entire network leaderboard.",
  },
  {
    icon: TrendingUp,
    title: "Benchmark Governance",
    body: "KPI thresholds are version-controlled and auditable. Changes require governance approval and propagate network-wide.",
  },
  {
    icon: FileText,
    title: "Export-Ready Reports",
    body: "PDF and Excel exports with full scoring breakdowns, signal maps, and action plans. Ready for board presentations.",
  },
];

function Capabilities() {
  return (
    <section id="engine" className="bg-white py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">
            Capabilities
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Built different from every other tool in this category.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="bg-dd-fog/50 rounded-xl p-6 ring-1 ring-black/[0.04] h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                  <c.icon className="h-5 w-5 text-brand-500" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   SCROLL SHOWCASE PANELS
   ──────────────────────────────────────────── */

/* Panel 1 — Command Centre (OEM Dashboard) */
function PanelCommand() {
  const rows = [
    { name: "Autohaus Weber", score: 87, band: "Advanced", delta: "+4", color: "text-emerald-500" },
    { name: "Motoria Frankfurt", score: 72, band: "Performing", delta: "+2", color: "text-emerald-500" },
    { name: "Prestige Autos", score: 61, band: "Developing", delta: "-1", color: "text-red-500" },
    { name: "Eder & Sohn", score: 45, band: "Foundational", delta: "+6", color: "text-emerald-500" },
  ];
  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Network Leaderboard
        </span>
        <span className="text-[11px] text-muted-foreground">Q2 2026</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-3 p-3 rounded-lg bg-dd-fog/60 hover:bg-dd-fog transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
            <p className="text-[11px] text-muted-foreground">{r.band}</p>
          </div>
          <span className="text-lg font-black tabular-nums text-foreground">{r.score}</span>
          <span className={`text-xs font-semibold ${r.color}`}>{r.delta}</span>
        </div>
      ))}
    </div>
  );
}

/* Panel 2 — Department Breakdown */
function PanelDept() {
  const depts = [
    { name: "New Vehicle Sales", score: 74, w: "74%" },
    { name: "Used Vehicle Sales", score: 68, w: "68%" },
    { name: "Service", score: 81, w: "81%" },
    { name: "Parts", score: 59, w: "59%" },
    { name: "Finance", score: 72, w: "72%" },
  ];
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Department Scores
        </span>
        <span className="text-2xl font-black text-foreground tabular-nums">71</span>
      </div>
      {depts.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-foreground">{d.name}</span>
            <span className="font-bold tabular-nums text-foreground">{d.score}</span>
          </div>
          <div className="h-2 rounded-full bg-dd-fog overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: d.w,
                background:
                  d.score >= 75
                    ? "hsl(152, 65%, 42%)"
                    : d.score >= 60
                    ? "hsl(var(--warning))"
                    : "hsl(var(--destructive))",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Panel 3 — Action Plan */
function PanelActionPlan() {
  const actions = [
    {
      title: "Implement structured throughput management",
      owner: "Service Manager",
      days: 60,
      status: "In Progress",
      statusColor: "bg-brand-500",
    },
    {
      title: "Deploy customer follow-up workflow",
      owner: "Sales Director",
      days: 30,
      status: "Not Started",
      statusColor: "bg-muted-foreground",
    },
    {
      title: "Establish parts inventory review cycle",
      owner: "Parts Manager",
      days: 90,
      status: "Complete",
      statusColor: "bg-emerald-500",
    },
  ];
  return (
    <div className="p-5 space-y-3">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Action Plan
      </span>
      {actions.map((a) => (
        <div
          key={a.title}
          className="p-3 rounded-lg bg-dd-fog/60 space-y-2"
        >
          <p className="text-sm font-semibold text-foreground leading-snug">
            {a.title}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{a.owner}</span>
            <span>·</span>
            <span>{a.days} days</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${a.statusColor}`} />
              {a.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Panel 4 — Knowledge Hub */
function PanelKnowledge() {
  const articles = [
    {
      cat: "Best Practice",
      title: "Service throughput optimisation: A 12-week playbook",
      read: "8 min read",
    },
    {
      cat: "Case Study",
      title: "How Autohaus Weber improved NVS by 22 points",
      read: "5 min read",
    },
    {
      cat: "Framework",
      title: "The maturity model explained: From Foundational to Advanced",
      read: "12 min read",
    },
  ];
  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Knowledge Hub
        </span>
      </div>
      {articles.map((a) => (
        <div
          key={a.title}
          className="p-3 rounded-lg bg-dd-fog/60 hover:bg-dd-fog transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">
            {a.cat}
          </span>
          <p className="text-sm font-semibold text-foreground mt-1 leading-snug">
            {a.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{a.read}</p>
        </div>
      ))}
    </div>
  );
}

/* Panel 5 — Playground Calculator */
function PanelPlayground() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Reverse Sales Funnel
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Target units", value: "120" },
          { label: "Close rate", value: "18%" },
          { label: "Proposals needed", value: "667" },
          { label: "Leads required", value: "2,222" },
        ].map((f) => (
          <div key={f.label} className="bg-dd-fog/60 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {f.label}
            </p>
            <p className="text-lg font-black tabular-nums text-foreground mt-1">
              {f.value}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-brand-500/5 border border-brand-500/15 rounded-lg p-3">
        <p className="text-[11px] text-brand-500 font-semibold">
          KPI-seeded from your latest assessment data
        </p>
      </div>
    </div>
  );
}

/* Panel 6 — Assessment View */
function PanelAssessment() {
  const questions = [
    { q: "Workshop capacity utilisation rate", score: 3 },
    { q: "Customer appointment lead time", score: 2 },
    { q: "Technician productivity measurement", score: 4 },
    { q: "Service advisor upsell conversion", score: 2 },
  ];
  return (
    <div className="p-5 space-y-3">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Service Department — Assessment
      </span>
      {questions.map((q) => (
        <div
          key={q.q}
          className="flex items-center justify-between p-3 rounded-lg bg-dd-fog/60"
        >
          <p className="text-sm text-foreground pr-4">{q.q}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  background:
                    n <= q.score
                      ? "hsl(var(--brand-500))"
                      : "hsl(var(--neutral-100))",
                  color: n <= q.score ? "white" : "hsl(var(--neutral-500))",
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Panel 7 — Coach Visit */
function PanelCoachVisit() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Coach Visit Log
        </span>
      </div>
      <div className="space-y-3">
        <div className="bg-dd-fog/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Autohaus Weber
            </span>
            <span className="text-[11px] text-muted-foreground">15 Jun 2026</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reviewed throughput management progress. Service advisor upsell
            conversion needs attention — recommend workshop with team next week.
          </p>
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 font-semibold">
              Service
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-600 font-semibold">
              Follow-up needed
            </span>
          </div>
        </div>
        <div className="bg-dd-fog/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Motoria Frankfurt
            </span>
            <span className="text-[11px] text-muted-foreground">12 Jun 2026</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            NVS process audit complete. Strong lead management, weak on
            follow-up timing. Action plan updated.
          </p>
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 font-semibold">
              NVS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold">
              On track
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SHOWCASE_PANELS: ShowcasePanel[] = [
  {
    key: "command",
    chromeTitle: "OEM Command Centre — Network Overview",
    label: "OEM Dashboard",
    description: "Your entire dealer network in one leaderboard.",
    node: <PanelCommand />,
  },
  {
    key: "dept",
    chromeTitle: "Dealer Diagnostics — Department Breakdown",
    label: "Department Scores",
    description: "Five departments. One diagnostic truth.",
    node: <PanelDept />,
  },
  {
    key: "action",
    chromeTitle: "Action Plan — Prioritised Improvements",
    label: "Action Plans",
    description: "Maturity-appropriate actions, fully auditable.",
    node: <PanelActionPlan />,
  },
  {
    key: "knowledge",
    chromeTitle: "Knowledge Hub — Best Practices & Frameworks",
    label: "Knowledge Hub",
    description: "Curated playbooks for every maturity level.",
    node: <PanelKnowledge />,
  },
  {
    key: "playground",
    chromeTitle: "Playground — KPI Calculators",
    label: "Playground",
    description: "What-if calculators seeded from your KPIs.",
    node: <PanelPlayground />,
  },
  {
    key: "assessment",
    chromeTitle: "Assessment — Service Department",
    label: "Assessment",
    description: "100+ questions across every department.",
    node: <PanelAssessment />,
  },
  {
    key: "coach",
    chromeTitle: "Coach Dashboard — Visit Logs",
    label: "Coach Visits",
    description: "Field-coach logs tied to dealer performance.",
    node: <PanelCoachVisit />,
  },
];

/* ────────────────────────────────────────────
   INSIDE — ScrollShowcase wrapper
   ──────────────────────────────────────────── */
function Inside() {
  return (
    <section className="bg-dd-fog">
      <ScrollShowcase panels={SHOWCASE_PANELS} />
    </section>
  );
}

/* ────────────────────────────────────────────
   BUILT DIFFERENT
   ──────────────────────────────────────────── */
const DIFFERENTIATORS = [
  {
    icon: Shield,
    stat: "18",
    statLabel: "audit fields per action",
    title: "Full Audit Trail",
    body: "Every action traces back to the source question. OEM-ready. Reproducible. Defensible in programme reviews.",
  },
  {
    icon: Zap,
    stat: "0",
    statLabel: "AI hallucination risk",
    title: "Deterministic by Design",
    body: "No generative AI. Same answers → same signals → same actions. Safe for network-level deployment.",
  },
  {
    icon: Star,
    stat: "4",
    statLabel: "maturity score bands",
    title: "Score-Band Intelligence",
    body: "Foundational dealers get gap-closure. Advanced dealers get ceiling actions. The same signal produces different plans.",
  },
];

function BuiltDifferent() {
  return (
    <section className="bg-dd-midnight py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">
            Why This Is Different
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white">
            Built different from every other tool in this category.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {DIFFERENTIATORS.map((d, i) => (
            <Reveal key={d.title} delay={i * 120}>
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 h-full hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center">
                    <d.icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white tabular-nums">
                      <Counter to={Number(d.stat)} />
                    </span>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {d.statLabel}
                    </p>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{d.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   METRICS & CTA
   ──────────────────────────────────────────── */
const STATS = [
  { value: 5, suffix: "", label: "Departments assessed" },
  { value: 100, suffix: "+", label: "KPIs tracked" },
  { value: 22, suffix: "", label: "Action templates" },
  { value: 3, suffix: "", label: "Role types" },
];

function MetricsAndCTA() {
  return (
    <section className="bg-dd-midnight border-t border-white/5">
      {/* Metrics row */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <p className="text-5xl lg:text-6xl font-black text-white tabular-nums">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-white/50 mt-2 font-medium">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 text-center">
          <Reveal>
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500">
              Ready to Deploy
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
              A diagnostic programme your dealers will trust.
            </h2>
            <p className="mt-4 text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              Request an OEM walkthrough. See the engine, the scoring logic, and
              the action plan output in a single 45-minute session.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-brand-500 text-white hover:bg-brand-500/90 h-12 px-7 text-[15px] font-semibold shadow-lg shadow-brand-500/25"
                asChild
              >
                <Link to="/auth">
                  Request OEM Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border border-white/15 text-white/80 bg-transparent hover:bg-white/5 hover:text-white h-12 px-7"
                asChild
              >
                <Link to="/methodology">View Methodology</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   INDEX PAGE
   ──────────────────────────────────────────── */
const Index = () => {
  const { user, loading } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem("completed_assessment_results");
    setHasCompletedAssessment(!!completedResults);
  }, []);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader hasCompletedAssessment={hasCompletedAssessment} />
      <Hero />
      <HowItWorks />
      <Capabilities />
      <Inside />
      <BuiltDifferent />
      <MetricsAndCTA />
      <Footer />
    </div>
  );
};

export default Index;
