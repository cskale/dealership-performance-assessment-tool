import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { HomeHeader } from "@/components/Navigation/HomeHeader";
import { Footer } from "@/components/Home/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Reveal, Counter } from "@/components/landing/Reveal";
import { ScrollShowcase, type ShowcasePanel } from "@/components/landing/ScrollShowcase";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Lock,
  ChevronRight,
  BarChart3,
  Layers,
  ListChecks,
  BookOpen,
  Wrench,
  ClipboardList,
  Users,
  Clock,
  User,
  TrendingDown,
  Zap,
  Target,
  Activity,
} from "lucide-react";

/* ── Panel chrome for ScrollShowcase previews ── */
function PanelChrome({
  label,
  chip,
  children,
}: {
  label: string;
  chip: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          {label}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          {chip}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── How-it-works steps ── */
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Run Assessment",
    desc: "Answer scored questions across 5 departments. KPI-calibrated, weighted by importance.",
    icon: ClipboardList,
  },
  {
    step: "02",
    title: "Engine Scores & Signals",
    desc: "Scoring engine aggregates. Signal engine detects gaps, clusters patterns, assigns severity.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Actions Generated",
    desc: "Template lookup, context intelligence, maturity-band matching. Deterministic. Auditable.",
    icon: Target,
  },
  {
    step: "04",
    title: "Track & Improve",
    desc: "Kanban board, coach visits, OEM leaderboards. Full lifecycle from diagnosis to results.",
    icon: Activity,
  },
];

/* ── Capabilities ── */
const CAPABILITIES = [
  {
    icon: BarChart3,
    title: "5-Department Scoring",
    body: "NVS, UVS, Service, Parts, Finance. Weighted, scored 1-5, normalised to 0-100.",
  },
  {
    icon: Layers,
    title: "Signal Detection",
    body: "Cross-department clustering. Systemic vs. recurring. Severity escalation.",
  },
  {
    icon: ListChecks,
    title: "Deterministic Actions",
    body: "Score-band templates. No AI. Same inputs always produce same outputs.",
  },
  {
    icon: Shield,
    title: "Full Audit Trail",
    body: "18 fields per action. Question ID to signal to template to action. OEM-ready.",
  },
  {
    icon: Users,
    title: "Multi-Role Platform",
    body: "Dealer, Coach, OEM views. Network leaderboards. Coach visit tracking.",
  },
  {
    icon: BookOpen,
    title: "KPI Encyclopedia",
    body: "100+ KPIs with benchmarks, formulas, and department mappings.",
  },
];

/* ── Built Different pillars ── */
const BUILT_DIFFERENT = [
  {
    icon: TrendingUp,
    title: "Score-Band Intelligence",
    body: "A dealer at 38% and a dealer at 72% with the same weak signal receive different, maturity-appropriate actions. Foundational dealers get gap-closure. Advanced dealers get ceiling actions.",
    bottom: "4 score bands: Foundational, Developing, Performing, Advanced",
  },
  {
    icon: Shield,
    title: "Full Audit Trail",
    body: "Every action is fully traceable: Question ID, Signal Code, Template, Instantiated Action, Database Record. OEM-ready. Reproducible. Defensible in programme reviews.",
    bottom: "Stores 18 fields per action including all triggering question IDs",
  },
  {
    icon: Lock,
    title: "Deterministic by Design",
    body: "No generative AI. No randomness. Identical assessment answers always produce identical signals, identical template selection, and identical actions. Safe for network-level deployment.",
    bottom: "No AI hallucination risk. Network-consistent outputs.",
  },
];

/* ── Metrics ── */
const METRICS = [
  { value: 5, suffix: "", label: "Departments", sub: "NVS, UVS, Service, Parts, Finance" },
  { value: 100, suffix: "+", label: "KPIs Tracked", sub: "Weighted, scored 1-5 per item" },
  { value: 4, suffix: "", label: "Score Bands", sub: "Foundational to Advanced" },
  { value: 18, suffix: "", label: "Audit Fields", sub: "Full traceability per action" },
];

/* ── ScrollShowcase panel content ── */
function buildShowcasePanels(): ShowcasePanel[] {
  return [
    {
      label: "OVERVIEW",
      title: "Dashboard",
      description:
        "Overall score, department breakdown, maturity band, and assessment freshness at a glance.",
      content: (
        <PanelChrome label="DASHBOARD" chip="Overview">
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-foreground">72</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                PERFORMING
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted">
              <div className="w-[72%] h-full rounded-full bg-brand-500" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { dept: "NVS", score: 78, color: "bg-emerald-400" },
                { dept: "Service", score: 68, color: "bg-amber-400" },
                { dept: "Parts", score: 43, color: "bg-red-400" },
              ].map((d) => (
                <div key={d.dept} className="text-center">
                  <p className="text-xs text-muted-foreground">{d.dept}</p>
                  <p className="text-lg font-bold text-foreground">{d.score}</p>
                  <div className="w-full h-1 rounded-full bg-muted mt-1">
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PanelChrome>
      ),
    },
    {
      label: "DEPARTMENTS",
      title: "Departmental Intelligence",
      description:
        "Drill into each department. Sub-category scores, signals detected, and gap analysis.",
      content: (
        <PanelChrome label="DEPARTMENT SCORES" chip="5 Departments">
          <div className="space-y-3">
            {[
              { code: "NVS", name: "New Vehicle Sales", score: 74, color: "bg-emerald-400", status: "Performing" },
              { code: "UVS", name: "Used Vehicle Sales", score: 58, color: "bg-amber-400", status: "Developing" },
              { code: "SVC", name: "Service", score: 68, color: "bg-amber-400", status: "Developing" },
              { code: "FIN", name: "Financial Ops", score: 81, color: "bg-emerald-400", status: "Performing" },
              { code: "PTS", name: "Parts", score: 43, color: "bg-red-400", status: "Foundational" },
            ].map((d) => (
              <div key={d.code} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-muted rounded px-1.5 py-0.5 text-muted-foreground w-10 text-center">
                  {d.code}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${d.color}`}
                    style={{ width: `${d.score}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground w-6 text-right">
                  {d.score}
                </span>
              </div>
            ))}
          </div>
        </PanelChrome>
      ),
    },
    {
      label: "ACTIONS",
      title: "Action Plan",
      description:
        "Kanban board with prioritised, owner-assigned actions. Each traceable to its source signal.",
      content: (
        <PanelChrome label="ACTION PLAN" chip="Kanban">
          <div className="space-y-3">
            {[
              {
                title: "Implement structured throughput management",
                owner: "Service Manager",
                days: "60 days",
                priority: "HIGH",
                priorityColor: "bg-red-50 text-red-700 border-red-200",
              },
              {
                title: "Parts age analysis and write-off protocol",
                owner: "Parts Manager",
                days: "30 days",
                priority: "HIGH",
                priorityColor: "bg-red-50 text-red-700 border-red-200",
              },
              {
                title: "Develop pre-owned vehicle sourcing strategy",
                owner: "UVS Manager",
                days: "90 days",
                priority: "MEDIUM",
                priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="border border-border rounded-lg p-3"
              >
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {a.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User size={11} /> {a.owner}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} /> {a.days}
                  </span>
                </div>
                <span
                  className={`inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${a.priorityColor}`}
                >
                  {a.priority}
                </span>
              </div>
            ))}
          </div>
        </PanelChrome>
      ),
    },
    {
      label: "REFERENCE",
      title: "KPI Encyclopedia",
      description:
        "100+ KPIs with formulas, benchmarks, department mappings, and trend indicators.",
      content: (
        <PanelChrome label="KPI ENCYCLOPEDIA" chip="100+ KPIs">
          <div className="space-y-3">
            {[
              { name: "Labour Efficiency", formula: "Sold Hours / Available Hours", benchmark: "> 85%", dept: "SVC" },
              { name: "Parts Fill Rate", formula: "Lines Filled / Lines Ordered", benchmark: "> 92%", dept: "PTS" },
              { name: "Gross Profit per Unit", formula: "Total GP / Units Sold", benchmark: "Varies", dept: "NVS" },
            ].map((kpi) => (
              <div key={kpi.name} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{kpi.name}</p>
                  <span className="text-xs font-mono bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                    {kpi.dept}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{kpi.formula}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Benchmark: {kpi.benchmark}
                </p>
              </div>
            ))}
          </div>
        </PanelChrome>
      ),
    },
    {
      label: "TOOLS",
      title: "Playground",
      description:
        "Interactive calculators pre-filled from your KPI data. Reverse sales funnel, utilisation, stock turn.",
      content: (
        <PanelChrome label="PLAYGROUND" chip="Calculators">
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-3 bg-brand-50/50">
              <div className="flex items-center gap-2">
                <Wrench size={14} className="text-brand-500" />
                <p className="text-sm font-semibold text-foreground">Reverse Sales Funnel</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Work backwards from target to required leads, appointments, and test drives.
              </p>
              <span className="inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                LIVE
              </span>
            </div>
            {["Technician Utilisation", "Vehicle Stock Turn", "F&I Penetration"].map((name) => (
              <div key={name} className="border border-border rounded-lg p-3 opacity-60">
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">{name}</p>
                </div>
                <span className="inline-flex mt-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  COMING SOON
                </span>
              </div>
            ))}
          </div>
        </PanelChrome>
      ),
    },
    {
      label: "ASSESSMENT",
      title: "Assessment",
      description:
        "Guided questionnaire with KPI-calibrated questions, progress tracking, and branching logic.",
      content: (
        <PanelChrome label="ASSESSMENT" chip="In Progress">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Service Department</span>
                <span className="text-xs font-semibold text-foreground">8 / 12</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted">
                <div className="w-[67%] h-full rounded-full bg-brand-500" />
              </div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                QUESTION 9 OF 12
              </p>
              <p className="text-sm font-semibold text-foreground leading-snug">
                How effectively does your workshop manage daily throughput and bay utilisation?
              </p>
              <div className="mt-3 grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`text-center py-1.5 rounded text-xs font-semibold border ${
                      n === 3
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-muted/50 text-muted-foreground border-border"
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PanelChrome>
      ),
    },
    {
      label: "COACHING",
      title: "Coach Visits",
      description:
        "Field coaches track visits, add notes, and monitor action plan progress per dealership.",
      content: (
        <PanelChrome label="COACH VISITS" chip="Field Coaching">
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Site Visit - BMW Westside</p>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reviewed Service throughput actions. Parts write-off protocol started.
              </p>
              <div className="mt-2 flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  3 actions on track
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  1 at risk
                </span>
              </div>
            </div>
            <div className="border border-border rounded-lg p-3 opacity-70">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Initial Assessment - Audi North</p>
                <span className="text-xs text-muted-foreground">1 week ago</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                First diagnostic run completed. Action plan generated.
              </p>
            </div>
          </div>
        </PanelChrome>
      ),
    },
  ];
}

/* ── Main Page ── */
const Index = () => {
  const { user, loading } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem("completed_assessment_results");
    setHasCompletedAssessment(!!completedResults);
  }, []);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  const showcasePanels = buildShowcasePanels();

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader hasCompletedAssessment={hasCompletedAssessment} />

      {/* ── HERO ── */}
      <section className="pt-16 bg-midnight">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-label uppercase tracking-wider bg-white/5 text-white/70 border border-white/10">
                  Dealer Diagnostic &amp; Performance Platform
                </span>

                <h1 className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mt-4">
                  Diagnose. Prioritise.
                  <br />
                  <span className="text-white underline decoration-brand-500 decoration-2 underline-offset-4">
                    Improve.
                  </span>
                </h1>

                <p className="mt-6 text-base lg:text-lg text-white/70 max-w-lg leading-relaxed">
                  The only dealer performance platform that turns assessment
                  answers into deterministic, auditable action plans — built for
                  OEM programme teams.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <Button
                    size="lg"
                    className="bg-brand-500 text-white hover:bg-brand-600"
                    asChild
                  >
                    <Link to="/auth">
                      Request OEM Demo
                      <ArrowRight className="ml-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border border-white/10 text-white bg-transparent hover:bg-white/5 hover:text-white"
                    asChild
                  >
                    <Link to="/methodology">View Methodology</Link>
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-widest text-white/40">
                  <span>Built for</span>
                  <span>Dealer Principals</span>
                  <span className="text-white/20">&#183;</span>
                  <span>Field Coaches</span>
                  <span className="text-white/20">&#183;</span>
                  <span>OEM Programme Managers</span>
                </div>
              </div>
            </Reveal>

            {/* Right — product preview card */}
            <Reveal delay={200}>
              <div className="mt-12 lg:mt-0">
                <div className="bg-white/5 border border-white/10 rounded-xl shadow-none p-6">
                  {/* Mini-panel 1: Department score */}
                  <Reveal delay={300}>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/50 mb-3">
                        SERVICE DEPARTMENT
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-white leading-none">
                          68
                        </span>
                        <span className="text-sm text-white/50 ml-1">/ 100</span>
                        <span className="inline-flex ml-3 text-xs font-semibold px-2 py-0.5 rounded-md bg-warning/10 text-warning border border-warning/20">
                          DEVELOPING
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-md bg-white/10 mt-3">
                        <div className="w-[68%] h-full rounded-md bg-warning" />
                      </div>
                    </div>
                  </Reveal>

                  {/* Mini-panel 2: Signal detected */}
                  <Reveal delay={500}>
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <p className="text-xs uppercase tracking-widest text-white/50 mb-2">
                        SIGNAL DETECTED
                      </p>
                      <p className="text-sm font-semibold text-white">
                        Capacity Misalignment
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        3 questions triggered &#183; HIGH severity &#183;
                        service-performance
                      </p>
                      <span className="inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                        HIGH
                      </span>
                    </div>
                  </Reveal>

                  {/* Mini-panel 3: Action generated */}
                  <Reveal delay={700}>
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <p className="text-xs uppercase tracking-widest text-white/50 mb-2">
                        ACTION GENERATED
                      </p>
                      <p className="text-sm font-semibold text-white leading-snug">
                        Implement structured throughput management
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        Service Manager &#183; 60 days &#183; Developing band
                      </p>
                      <span className="inline-flex mt-2 text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/10">
                        60-DAY
                      </span>
                    </div>
                  </Reveal>

                  {/* Audit trail */}
                  <Reveal delay={900}>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs font-mono text-white/30 leading-relaxed">
                        Q17 &rarr; CAPACITY_MISALIGNED :: service-performance
                        <br />
                        &rarr; Service workshop utilisation (Developing) &rarr;
                        Action
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="engine" className="bg-fog py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
              From assessment to action in four steps.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.step} delay={i * 100}>
                <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono font-bold text-brand-500 bg-brand-50 rounded-lg w-8 h-8 flex items-center justify-center">
                      {s.step}
                    </span>
                    <s.icon className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES GRID ── */}
      <section className="bg-background py-20 px-6 lg:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
              CAPABILITIES
            </p>
            <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
              Everything a diagnostic programme needs.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {CAPABILITIES.map((cap, i) => (
              <Reveal key={cap.title} delay={i * 80}>
                <div className="flex gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-card transition-all duration-200">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <cap.icon className="size-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      {cap.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCROLL SHOWCASE — "See It In Action" ── */}
      <section className="bg-fog">
        <div className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
              SEE IT IN ACTION
            </p>
            <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
              Seven views. One coherent diagnostic programme.
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              From department score to coach visit — every step visible, every
              decision auditable.
            </p>
          </Reveal>
        </div>
        <ScrollShowcase panels={showcasePanels} />
      </section>

      {/* ── BUILT DIFFERENT ── */}
      <section className="bg-background py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
              WHY THIS IS DIFFERENT
            </p>
            <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
              Built different from every other tool in this category.
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {BUILT_DIFFERENT.map((card, i) => (
              <Reveal key={card.title} delay={i * 150}>
                <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 h-full">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center mb-4">
                    <card.icon className="size-5 text-brand-500" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {card.body}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-border">
                    {card.bottom}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS & CTA (Dark) ── */}
      <section className="bg-midnight">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-center text-xs uppercase tracking-widest text-white/40 mb-12">
            BUILT TO SCALE ACROSS YOUR DEALER NETWORK
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 100}>
                <div
                  className={`text-center lg:text-left${
                    i > 0 ? " lg:border-l lg:border-white/10 lg:pl-10" : ""
                  }`}
                >
                  <p className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                    <Counter to={m.value} suffix={m.suffix} />
                  </p>
                  <p className="text-sm font-semibold text-white/80 mt-3 leading-snug">
                    {m.label}
                  </p>
                  <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                    {m.sub}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <Reveal>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center border-t border-white/5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              READY TO DEPLOY
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-tight">
              A diagnostic programme your dealers will trust.
            </h2>
            <p className="mt-4 text-base text-white/70 max-w-xl mx-auto">
              Request an OEM walkthrough. See the engine, the scoring logic, and
              the action plan output in a single 45-minute session.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button
                className="bg-brand-500 text-white hover:bg-brand-600"
                size="lg"
                asChild
              >
                <Link to="/auth">
                  Request OEM Demo
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="border border-white/10 text-white hover:bg-white/5 hover:text-white"
                size="lg"
                asChild
              >
                <Link to="/methodology">View Methodology</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
