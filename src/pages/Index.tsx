import { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Reveal, Counter } from "@/components/landing/Reveal";
import { ScrollShowcase, type ShowcasePanel } from "@/components/landing/ScrollShowcase";
import {
  ClipboardCheck,
  Gauge,
  ListChecks,
  Building2,
  Library,
  Calculator,
  Users,
  Network,
  KanbanSquare,
  ShieldCheck,
  History,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────── */

function scoreColor(score: number) {
  if (score >= 70) return "var(--color-success)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] font-medium text-foreground/80">
        <span>{label}</span>
        <span className="tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
        />
      </div>
    </div>
  );
}

/* ── Nav + Hero ───────────────────────────────────────────── */

function Nav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-12 py-5 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
          <Gauge size={18} />
        </div>
        <span className="font-bold tracking-tight">Dealer Diagnostic</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
        <a href="#engine" className="hover:text-white transition">How it works</a>
        <a href="#capabilities" className="hover:text-white transition">Platform</a>
        <a href="#inside" className="hover:text-white transition">Inside</a>
        <a href="#cta" className="hover:text-white transition">Methodology</a>
      </div>
      <Link
        to="/auth"
        className="text-sm font-medium text-white/90 hover:text-white border border-white/15 hover:border-white/30 rounded-full px-4 py-1.5 transition"
      >
        Request Demo
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-midnight text-white">
      <Nav />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 10%, rgba(29,122,252,0.25), transparent 70%), radial-gradient(40% 30% at 90% 30%, rgba(29,122,252,0.12), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12 pt-32 pb-24 lg:pt-40 lg:pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Enterprise Dealership Intelligence
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-white/95">
              Diagnose.<br />Prioritise.<br />
              <span className="text-brand">Improve.</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-7 text-lg text-white/60 max-w-xl leading-relaxed">
              The enterprise platform that turns dealership assessments into deterministic,
              auditable action plans — built for OEM programme teams, field coaches, and dealer
              principals.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(29,122,252,0.7)] hover:brightness-110 transition"
              >
                Request a Demo
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/methodology"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition"
              >
                View Methodology
              </Link>
            </div>
          </Reveal>
          <Reveal delay={420}>
            <p className="mt-8 text-xs text-white/40 tracking-wide">
              Built for Dealer Principals · Field Coaches · OEM Programme Managers
            </p>
          </Reveal>
        </div>

        <Reveal delay={300} className="relative">
          <div className="relative animate-float">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-3xl blur-3xl opacity-40"
              style={{ background: "radial-gradient(50% 50% at 50% 50%, #1D7AFC, transparent)" }}
            />
            <div className="relative rounded-2xl bg-white text-foreground shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-fog/60">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="ml-3 text-[11px] font-medium text-muted-foreground">Dealer Diagnostic · Overview</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Overall Performance</div>
                    <div className="mt-1 text-4xl font-black tracking-tight">65<span className="text-base font-semibold text-muted-foreground">/100</span></div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold" style={{ color: "var(--color-success)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" /> Developing
                  </span>
                </div>
                <div className="mt-6 space-y-3.5">
                  <ScoreBar label="New Vehicle Sales" score={74} />
                  <ScoreBar label="Used Vehicle Sales" score={58} />
                  <ScoreBar label="Service" score={68} />
                  <ScoreBar label="Parts" score={43} />
                  <ScoreBar label="Finance" score={81} />
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Last assessed · 3 days ago</span>
                  <span className="font-medium text-brand">12 actions open →</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── How it works ─────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { icon: ClipboardCheck, title: "Assess", desc: "Answer 100+ KPI-driven questions across 5 departments." },
    { icon: Gauge, title: "Analyse", desc: "Scoring engine detects signals, gaps, and systemic patterns." },
    { icon: ListChecks, title: "Act", desc: "Get a prioritised, owner-assigned action plan with full audit trail." },
  ];
  return (
    <section id="engine" className="bg-fog py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <div className="text-center">
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand">The Engine</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              From answers to action, deterministically.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              A repeatable diagnostic loop. Same inputs, same outputs — every time, across every dealer.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-20 grid md:grid-cols-3 gap-8">
          <div aria-hidden className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px">
            <div className="h-full w-full bg-border" />
            <div
              className="absolute inset-0 h-full bg-brand origin-left scale-x-0"
              style={{ animation: "drawLine 1.4s ease-out 300ms forwards" }}
            />
          </div>

          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 150} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-border">
                  <s.icon size={28} className="text-brand" />
                  <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-midnight text-white text-[11px] font-bold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Capabilities ─────────────────────────────────────────── */

function Capabilities() {
  const caps = [
    { icon: Building2, title: "5-Department Assessment", desc: "New Vehicle Sales, Used Vehicle Sales, Service, Parts, and Financial Operations — fully scored and weighted." },
    { icon: Library, title: "100+ KPI Library", desc: "Industry-standard metrics with benchmark corridors, formulas, and department-level tracking." },
    { icon: Calculator, title: "Playground Calculators", desc: "Interactive tools: Reverse Sales Funnel, Marketing ROI, Absorption Rate, Stock Turn, and more." },
    { icon: Users, title: "Coach Dashboard", desc: "Assigned dealer oversight, visit scheduling, session logging, and progress notes for field coaches." },
    { icon: Network, title: "OEM Network View", desc: "Cross-dealer leaderboard, programme tier management, and network-wide performance analytics." },
    { icon: KanbanSquare, title: "Action Plan Engine", desc: "Deterministic action generation with Kanban board, 30/60/90-day roadmap, and full audit trail." },
  ];
  return (
    <section id="capabilities" className="bg-midnight text-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand">Platform Capabilities</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-white/95">
              Everything your network programme needs.
            </h2>
            <p className="mt-4 text-white/60">
              One platform for assessment, analysis, coaching oversight, and accountability —
              built for enterprise rollout.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {caps.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/60 hover:bg-white/[0.04] hover:shadow-[0_0_40px_-10px_rgba(29,122,252,0.5)]">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20">
                  <c.icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white/95">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── See It In Action — shared chrome ─────────────────────── */

function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" | "grey" | "red" }) {
  const tones: Record<string, string> = {
    blue: "bg-brand/10 text-brand",
    green: "bg-success/10 text-[hsl(152_65%_32%)]",
    amber: "bg-warning/15 text-[hsl(28_85%_38%)]",
    grey: "bg-foreground/[0.08] text-muted-foreground",
    red: "bg-danger/10 text-[hsl(0_75%_45%)] ring-1 ring-danger/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* Panel 1 — Diagnostic Command */
function PanelCommand() {
  return (
    <div>
      <div className="bg-midnight text-white px-5 py-4">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">Performance Intelligence · Q2 2026</div>
        <div className="mt-1 text-xl font-serif font-semibold tracking-tight" style={{ fontFamily: "ui-serif, Georgia, serif" }}>Diagnostic Command</div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-lg bg-white/[0.04] ring-1 ring-white/10 p-3">
            <div className="text-[9px] font-bold tracking-wider uppercase text-white/50">Overall Diagnostic Score</div>
            <div className="mt-1.5 text-2xl font-black">65<span className="text-xs text-white/40"> / 100</span></div>
            <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: "65%" }} />
            </div>
            <div className="mt-2"><span className="inline-flex items-center gap-1 rounded bg-success/20 px-1.5 py-px text-[9px] font-bold text-[hsl(152_75%_60%)]"><span className="h-1 w-1 rounded-full bg-current" />ADVANCED</span></div>
            <p className="mt-1.5 text-[9px] italic text-white/55 leading-snug">New Vehicle Sales above benchmark. Financial Ops requires urgent attention.</p>
          </div>
          <div className="rounded-lg bg-white/[0.04] ring-1 ring-white/10 p-3">
            <div className="text-[9px] font-bold tracking-wider uppercase text-white/50">Open Actions</div>
            <div className="mt-1.5 text-2xl font-black">10</div>
            <div className="text-[9px] text-white/50">items requiring attention</div>
            <ul className="mt-2 space-y-1 text-[9px] text-white/70">
              <li className="flex gap-1.5"><span className="text-brand">›</span>F&amp;I penetration · 30 Jun</li>
              <li className="flex gap-1.5"><span className="text-brand">›</span>BDC rollout · Sales · 12 Jul</li>
              <li className="flex gap-1.5"><span className="text-brand">›</span>Bay scheduling · Svc · 18 Jul</li>
            </ul>
          </div>
          <div className="rounded-lg bg-white/[0.04] ring-1 ring-white/10 p-3">
            <div className="text-[9px] font-bold tracking-wider uppercase text-white/50">Focus Department</div>
            <div className="mt-1 text-sm font-bold">Financial Operations</div>
            <div className="mt-0.5 text-2xl font-black">51</div>
            <div className="mt-1"><span className="inline-flex items-center gap-1 rounded bg-warning/20 px-1.5 py-px text-[9px] font-bold text-[hsl(38_92%_70%)]">DEVELOPING</span></div>
            <p className="mt-1.5 text-[9px] italic text-white/55 leading-snug">F&amp;I product penetration below corridor.</p>
          </div>
        </div>
      </div>
      <div className="bg-fog/40 px-5 py-3 grid grid-cols-5 gap-2">
        {[
          ["Last Assessment", "24 Jun 2026", "Completed", "green"],
          ["Next Assessment", "22 Sept 2026", "Upcoming", "blue"],
          ["Last Coach Visit", "Not scheduled", "—", "grey"],
          ["Next Coach Visit", "Not scheduled", "—", "grey"],
          ["Action Plan Review", "30 Jun 2026", "Upcoming", "blue"],
        ].map(([t, d, b, tone]) => (
          <div key={t} className="rounded-md bg-white ring-1 ring-border p-2">
            <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground truncate">{t}</div>
            <div className="mt-0.5 text-[10px] font-semibold truncate">{d}</div>
            <div className="mt-1"><Pill tone={tone as any}>{b}</Pill></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelDept() {
  const depts = [
    { name: "New Vehicle Sales", score: 66, tag: "ADVANCED", tone: "blue" as const, desc: "Strong lead-to-sale conversion. Test drive ratio above industry corridor." },
    { name: "Used Vehicle Sales", score: 79, tag: "ADVANCED", tone: "blue" as const, desc: "Stock turn healthy. Pricing strategy aligned with market velocity." },
    { name: "Financial Operations", score: 51, tag: "DEVELOPING", tone: "amber" as const, desc: "F&I product penetration below benchmark. Compliance documentation needs work." },
  ];
  return (
    <div className="p-5">
      <div className="text-sm font-bold mb-3">Departmental Intelligence</div>
      <div className="grid grid-cols-3 gap-2.5">
        {depts.map((d) => (
          <div key={d.name} className="rounded-lg ring-1 ring-border bg-white p-3">
            <div className="text-[10px] font-bold text-foreground/80 truncate">{d.name}</div>
            <div className="mt-2 text-3xl font-black text-brand tabular-nums">{d.score}</div>
            <div className="mt-1.5"><Pill tone={d.tone}>{d.tag}</Pill></div>
            <p className="mt-2 text-[10px] text-muted-foreground leading-snug">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelActionPlan() {
  const tabs = ["Summary", "KPI Analysis", "Maturity Level", "Action Plan"];
  const filters = [["All", 10], ["Open", 8], ["In Progress", 2], ["Completed", 0], ["Overdue", 0]] as const;
  const actions = [
    { t: "Implement BDC to optimize sales executive productivity", d: "Centralise lead handling & appointment setting.", dept: "Sales", own: "GM", kpi: "Lead Conv." },
    { t: "Restructure F&I product training programme", d: "Quarterly certification & shadow sessions.", dept: "F&I", own: "F&I Mgr", kpi: "PVR" },
    { t: "Optimise service bay scheduling cadence", d: "Move to 15-min slot model with overflow buffer.", dept: "Service", own: "SM", kpi: "Bay Util." },
    { t: "Used vehicle pricing audit weekly", d: "Velocity-based reprice every Monday.", dept: "Used", own: "UCM", kpi: "Days-to-Sale" },
  ];
  return (
    <div>
      <div className="border-b border-border px-5 pt-3">
        <div className="flex gap-5 text-[11px] font-medium text-muted-foreground">
          {tabs.map((t, i) => (
            <div key={t} className={`pb-2 ${i === 3 ? "text-brand border-b-2 border-brand -mb-px font-semibold" : ""}`}>{t}</div>
          ))}
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-sm font-bold">Action Plan</div>
            <div className="text-[10px] text-muted-foreground">0 of 10 actions complete — 0%</div>
          </div>
          <div className="flex gap-1">
            <span className="rounded bg-brand text-white px-2 py-0.5 text-[9px] font-semibold">List</span>
            <span className="rounded bg-fog text-muted-foreground px-2 py-0.5 text-[9px] font-semibold">Kanban</span>
            <span className="rounded bg-fog text-muted-foreground px-2 py-0.5 text-[9px] font-semibold">Roadmap</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <div className="h-6 flex-1 min-w-[80px] rounded border border-border bg-fog/40 px-2 text-[10px] text-muted-foreground flex items-center">Search…</div>
          {filters.map(([n, c]) => (
            <span key={n} className="rounded-md bg-fog px-1.5 py-0.5 text-[9px] font-medium text-foreground/70">{n} ({c})</span>
          ))}
        </div>
        <div className="mt-2.5 space-y-1.5">
          {actions.map((a) => (
            <div key={a.t} className="rounded-lg bg-white ring-1 ring-border pl-2 pr-3 py-2 border-l-4 border-l-brand flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold leading-snug truncate">{a.t}</div>
                <div className="text-[9px] text-muted-foreground truncate">{a.d}</div>
                <div className="mt-1 flex gap-1 flex-wrap">
                  <Pill tone="blue">{a.dept}</Pill>
                  <Pill tone="grey">{a.own}</Pill>
                  <Pill tone="grey">{a.kpi}</Pill>
                  <Pill tone="red">High</Pill>
                </div>
              </div>
              <div className="text-[9px] font-bold text-muted-foreground shrink-0 tabular-nums">30 Days</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelKnowledge() {
  const kpis = [
    "Lead Response Time", "Lead Conversion Rate", "Showroom Traffic Conv.",
    "Test Drive Ratio", "Appointment Show Rate", "Sales Cycle Length",
    "Closing Ratio", "Units Sold per SE", "Revenue per SE",
  ];
  return (
    <div>
      <div className="px-5 pt-4 pb-3" style={{ background: "linear-gradient(180deg, #fde7e0 0%, transparent 100%)" }}>
        <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Knowledge &amp; Resources</div>
        <div className="mt-1 text-lg font-black tracking-tight">Knowledge Hub</div>
        <div className="text-[10px] text-muted-foreground">Curated resources, KPI definitions, downloads.</div>
        <div className="mt-3 flex gap-4 text-[10px] font-medium text-muted-foreground border-b border-border/70">
          <span className="pb-1.5">Recommended</span>
          <span className="pb-1.5 text-brand border-b-2 border-brand -mb-px font-semibold">KPI Encyclopedia</span>
          <span className="pb-1.5">Downloads</span>
        </div>
      </div>
      <div className="px-5 pb-4">
        <div className="flex gap-2 mb-2.5">
          <div className="h-6 flex-1 rounded border border-border bg-white px-2 text-[10px] text-muted-foreground flex items-center">Search KPIs by name or definition…</div>
          <div className="h-6 rounded border border-border bg-white px-2 text-[10px] text-muted-foreground flex items-center">All Depts ▾</div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {kpis.map((k) => (
            <div key={k} className="rounded-md bg-white ring-1 ring-border p-2">
              <Pill tone="blue">New Vehicle Sales</Pill>
              <div className="mt-1 text-[10px] font-bold leading-tight">{k}</div>
              <div className="text-[8px] text-muted-foreground leading-snug line-clamp-2">Definition, formula, and benchmark corridor.</div>
              <div className="mt-1 text-[9px] font-semibold text-brand">View details →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelPlayground() {
  const funnel = [
    { l: "Leads", v: 770, w: 100 },
    { l: "Appointments", v: 308, w: 72 },
    { l: "Shows", v: 200, w: 52 },
    { l: "Sales", v: 50, w: 30 },
  ];
  return (
    <div>
      <div className="px-5 pt-3 pb-4" style={{ background: "linear-gradient(180deg, #fde7e0 0%, transparent 100%)" }}>
        <div className="text-[9px] text-muted-foreground">Playground › Reverse Sales Funnel Calculator</div>
        <div className="mt-2 flex items-start gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-brand text-white text-[11px] font-black">▲</div>
          <div>
            <div className="text-[9px] font-bold tracking-wider uppercase text-brand">Sales Optimization</div>
            <div className="text-base font-black tracking-tight">Reverse Sales Funnel</div>
            <div className="text-[10px] text-muted-foreground">Work backward from gross profit target to required lead volume.</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[["Projected Gross Profit", "100.000 €"], ["Lead Efficiency", "6.5%"], ["Required Lead Volume", "770"]].map(([l, v]) => (
            <div key={l} className="rounded-md bg-white ring-1 ring-border p-2">
              <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{l}</div>
              <div className="text-sm font-black text-brand tabular-nums">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-white ring-1 ring-border p-2.5">
          <div className="text-[10px] font-bold mb-1.5">Operational Inputs</div>
          <div className="space-y-1.5">
            {[["Target Unit Sales", "50"], ["Avg Gross Profit / Unit", "2000"], ["Lead → Appt %", "40"], ["Appt → Show %", "65"], ["Show → Sale %", "25"]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between gap-2 rounded border border-border bg-fog/40 px-1.5 py-1">
                <span className="text-[9px] text-muted-foreground truncate">{l}</span>
                <span className="text-[10px] font-bold tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-white ring-1 ring-border p-2.5">
          <div className="text-[10px] font-bold mb-1.5">Required Funnel Volume</div>
          <div className="space-y-1">
            {funnel.map((f) => (
              <div key={f.l} className="flex items-center gap-1.5">
                <div className="rounded-md bg-brand h-5 flex items-center px-1.5 text-[9px] font-bold text-white tabular-nums" style={{ width: `${f.w}%` }}>{f.v}</div>
                <div className="text-[9px] text-muted-foreground truncate">{f.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded bg-brand/10 ring-1 ring-brand/20 px-2 py-1 text-[9px] text-brand font-semibold leading-snug">
            Generate 770 qualified leads/quarter to hit target.
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelAssessment() {
  const questions = [
    { n: "Q6", cat: "digital", of: 6, q: "What % of online leads result in actual showroom visits?", linked: ["Lead Conv.", "Show Rate"] },
    { n: "Q7", cat: "training", of: 7, q: "How frequently do sales executives complete certifications?", linked: ["Units/SE", "Closing Ratio"] },
  ];
  return (
    <div className="p-3.5 space-y-2.5" style={{ background: "linear-gradient(180deg, #eef2fb 0%, #fafafa 100%)" }}>
      {questions.map((q) => (
        <div key={q.n} className="rounded-lg bg-white ring-1 ring-border overflow-hidden shadow-sm">
          <div className="bg-brand text-white px-3 py-1.5 flex items-center gap-2">
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-black">{q.n}</span>
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold">{q.cat}</span>
            <span className="ml-auto text-[9px] text-white/80">Question {q.of} of 13</span>
          </div>
          <div className="p-3">
            <div className="text-[11px] font-bold leading-snug">{q.q}</div>
            <div className="text-[9px] text-muted-foreground">Select the option that best matches your current process.</div>
            <div className="mt-2 grid grid-cols-5 gap-1">
              {["Basic", "Emerging", "Defined", "Managed", "Advanced"].map((o, i) => (
                <div key={o} className={`rounded border px-1 py-1.5 text-center text-[8px] font-semibold ${i === 2 ? "border-brand bg-brand/5 text-brand" : "border-border bg-fog/40 text-muted-foreground"}`}>
                  {o}
                </div>
              ))}
            </div>
            <div className="mt-2 rounded bg-fog/60 px-2 py-1.5">
              <div className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Why this matters</div>
              <p className="text-[9px] text-foreground/75 leading-snug">Conversion from digital lead to showroom visit is the highest-leverage point in the funnel.</p>
            </div>
            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
              <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Linked KPIs:</span>
              {q.linked.map((k) => <Pill key={k} tone="blue">{k}</Pill>)}
            </div>
            <div className="mt-1.5 text-[9px] font-semibold text-brand">+ Add field coach notes</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PanelCoachVisit() {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-brand/10 text-brand">
          <ClipboardCheck size={14} />
        </div>
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Coach Visits</div>
      </div>
      <div className="rounded-xl ring-1 ring-border bg-white p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Visit proposed by Field Coach</div>
            <div className="mt-0.5 text-base font-black tracking-tight">28 Jun 2026</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">Bjorn Andersson · Nordic Region</div>
          </div>
          <Pill tone="blue">Proposed</Pill>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: "var(--color-success)" }}>Confirm</button>
          <button className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-foreground/80">Propose New Date</button>
        </div>
      </div>
      <div className="mt-3 rounded-xl ring-1 ring-border bg-fog/50 p-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" style={{ color: "var(--color-success)" }} />
          <div className="text-[11px] font-semibold">Last visit: 15 Jun 2026</div>
        </div>
        <div className="mt-0.5 ml-6 text-[10px] text-muted-foreground">Session logged · 3 actions agreed</div>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground leading-snug">
        Visit notes, modules reviewed, and agreed actions tracked per session.
      </p>
    </div>
  );
}

function Inside() {
  const panels: ShowcasePanel[] = [
    { key: "command", chromeTitle: "Dealer Diagnostic · Diagnostic Command", label: "Executive Dashboard", description: "Real-time diagnostic score, open actions, and focus department at a glance.", node: <PanelCommand /> },
    { key: "dept", chromeTitle: "Dealer Diagnostic · Departmental Intelligence", label: "Department Scores", description: "Per-department performance with AI-free narrative intelligence.", node: <PanelDept /> },
    { key: "actions", chromeTitle: "Dealer Diagnostic · Action Plan", label: "Action Plan", description: "Prioritised, owner-assigned actions with List, Kanban, and Roadmap views.", node: <PanelActionPlan /> },
    { key: "knowledge", chromeTitle: "Dealer Diagnostic · Knowledge Hub", label: "KPI Encyclopedia", description: "100+ industry KPIs searchable by name, department, and definition.", node: <PanelKnowledge /> },
    { key: "playground", chromeTitle: "Dealer Diagnostic · Playground", label: "Playground Tools", description: "Interactive calculators: Sales Funnel, Marketing ROI, Absorption Rate, and more.", node: <PanelPlayground /> },
    { key: "assessment", chromeTitle: "Dealer Diagnostic · Assessment", label: "Smart Assessment", description: "KPI-linked questions with coach notes, benchmarks, and 5-level scoring.", node: <PanelAssessment /> },
    { key: "coach", chromeTitle: "Dealer Diagnostic · Coach Visits", label: "Coach Visits", description: "Schedule, confirm, and log field coaching sessions with action tracking.", node: <PanelCoachVisit /> },
  ];
  return (
    <section id="inside" className="bg-fog">
      <ScrollShowcase panels={panels} />
    </section>
  );
}

/* ── Built Different ──────────────────────────────────────── */

function BuiltDifferent() {
  const items = [
    { icon: ShieldCheck, title: "Deterministic by Design", desc: "No generative AI. No randomness. Same answers always produce same actions. Safe for network-wide deployment." },
    { icon: History, title: "Full Audit Trail", desc: "Every action traces back to its source: Question → Signal → Template → Action. 18 fields per action record." },
    { icon: Layers, title: "Score-Band Intelligence", desc: "Maturity-appropriate actions: foundational dealers get gap-closure, advanced dealers get ceiling-breaking strategies." },
  ];
  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-sm font-bold tracking-[0.15em] uppercase text-brand">Built Different</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight">
              The trust engineering behind every action.
            </h2>
          </div>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 120}>
              <div className="h-full rounded-2xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                  <it.icon size={22} />
                </div>
                <h3 className="mt-6 text-lg font-bold">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--color-success)" }}>
                  <CheckCircle2 size={14} /> Enterprise-grade
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Metrics + CTA ────────────────────────────────────────── */

function MetricsAndCTA() {
  const metrics = [
    { n: 5, suffix: "", label: "Departments fully assessed" },
    { n: 100, suffix: "+", label: "KPIs tracked" },
    { n: 4, suffix: "", label: "Score bands · Foundational → Advanced" },
    { n: 18, suffix: "", label: "Audit fields per action" },
  ];
  return (
    <section id="cta" className="bg-midnight text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-24 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 100} className="text-center md:text-left">
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                <Counter to={m.n} suffix={m.suffix} />
              </div>
              <div className="mt-2 text-sm text-white/55">{m.label}</div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-28 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 60% at 50% 40%, rgba(29,122,252,0.22), transparent 70%)" }}
        />
        <Reveal>
          <h2 className="relative text-4xl sm:text-6xl font-black tracking-tight text-white/95 max-w-3xl mx-auto leading-[1.05]">
            A diagnostic programme your dealers will trust.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="relative mt-6 max-w-xl mx-auto text-white/60">
            Request an OEM walkthrough. See the engine, the scoring logic, and the action plan output.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(29,122,252,0.7)] hover:brightness-110 transition" to="/auth">
              Request OEM Demo <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-white/30 px-7 py-3.5 text-sm font-semibold text-white/90 transition" to="/methodology">
              View Methodology
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-midnight text-white/50 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span>© 2026 Dealer Diagnostic Tool. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link to="/methodology" className="hover:text-white transition">Methodology</Link>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "Dealer Diagnostic — Diagnose. Prioritise. Improve.";
  }, []);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  return (
    <main>
      <Hero />
      <HowItWorks />
      <Capabilities />
      <Inside />
      <BuiltDifferent />
      <MetricsAndCTA />
      <LandingFooter />
    </main>
  );
}
