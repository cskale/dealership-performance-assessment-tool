import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { HomeHeader } from "@/components/Navigation/HomeHeader";
import { Footer } from "@/components/Home/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Lock, ChevronRight } from "lucide-react";
import ProductSneakPeek from "@/components/landing/ProductSneakPeek";
import { AnimatedCounter } from "@/components/Home/AnimatedCounter";

/* ── Scroll-reveal hook ──────────────────────────── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── Reveal wrapper ──────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const PIPELINE_STEPS = [
  { step: "01", title: "Assessment Answers", desc: "Questions scored 1–5 per item" },
  { step: "02", title: "Scoring Engine", desc: "Weighted scores + section aggregation" },
  { step: "03", title: "Signal Engine", desc: "Detect weak scores, group into signals" },
  { step: "04", title: "Template Lookup", desc: "Tiered → KPI-specific → Generic fallback" },
  { step: "05", title: "Context Intelligence", desc: "Enrich with drivers, impact, effort" },
  { step: "06", title: "Action Plan", desc: "Prioritised, owner-assigned, auditable" },
];

const METRICS = [
  { value: 5, suffix: "", label: "Departments\nfully assessed", sub: "NVS · UVS · Service · Finance · Parts" },
  { value: 100, suffix: "+", label: "Assessment\nquestions", sub: "Weighted, scored 1–5 per item" },
  { value: 3, suffix: "", label: "Maturity\nbands", sub: "Foundational · Developing · Optimising" },
  { value: 18, suffix: "", label: "Audit fields\nper action", sub: "Full traceability to source question" },
];

const PROOF_PILLARS = [
  {
    icon: TrendingUp,
    title: "Score-Band Intelligence",
    body: "A dealer at 38% and a dealer at 72% with the same weak signal receive different, maturity-appropriate actions. Foundational dealers get gap-closure. Optimising dealers get ceiling actions.",
    bottom: "3 score bands: Foundational · Developing · Optimising",
  },
  {
    icon: Shield,
    title: "Full Audit Trail",
    body: "Every action is fully traceable: Question ID → Signal Code → Template → Instantiated Action → Database Record. OEM-ready. Reproducible. Defensible in programme reviews.",
    bottom: "Stores 18 fields per action including all triggering question IDs",
  },
  {
    icon: Lock,
    title: "Deterministic by Design",
    body: "No generative AI. No randomness. Identical assessment answers always produce identical signals, identical template selection, and identical actions. Safe for network-level deployment.",
    bottom: "No AI hallucination risk · Network-consistent outputs",
  },
];

const Index = () => {
  const { user, loading } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem('completed_assessment_results');
    setHasCompletedAssessment(!!completedResults);
  }, []);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  const pipelineSection = useScrollReveal(0.1);
  const metricsSection = useScrollReveal(0.2);

  return (
    <div className="min-h-screen bg-background font-[Roboto]">
      <HomeHeader hasCompletedAssessment={hasCompletedAssessment} />

      {/* SECTION 2 — Hero (Dark navy + crosshatch grid) */}
      <section
        className="pt-16"
        style={{
          backgroundColor: '#0A0F1E',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column — copy */}
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/20">
                  Dealer Diagnostic &amp; Performance Platform
                </span>

                <h1 className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mt-4">
                  Diagnose. Prioritise.<br />
                  <span className="text-white underline decoration-brand-500 decoration-2 underline-offset-4">Improve.</span>
                </h1>

                <p className="mt-6 text-base lg:text-lg text-white/60 max-w-lg leading-relaxed">
                  The only dealer performance platform that turns
                  assessment answers into deterministic, auditable
                  action plans — built for OEM programme teams.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <Button size="lg" className="bg-white text-[#0A0F1E] hover:bg-white/90" asChild>
                    <Link to="/auth">
                      Request OEM Demo
                      <ArrowRight className="ml-1" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="border border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white" asChild>
                    <Link to="/methodology">View Methodology</Link>
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-widest text-white/40">
                  <span>Built for</span>
                  <span>Dealer Principals</span>
                  <span className="text-white/20">·</span>
                  <span>Field Coaches</span>
                  <span className="text-white/20">·</span>
                  <span>OEM Programme Managers</span>
                </div>
              </div>
            </Reveal>

            {/* Right column — product preview card */}
            <Reveal delay={200}>
              <div className="mt-12 lg:mt-0">
                <div className="bg-white/[0.08] border border-white/10 rounded-xl shadow-none p-6">
                  {/* Mini-panel 1: Department score */}
                  <Reveal delay={300}>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-3">SERVICE DEPARTMENT</p>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-white leading-none">68</span>
                        <span className="text-sm text-white/60 ml-1">/ 100</span>
                        <span className="inline-flex ml-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          DEVELOPING
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 mt-3">
                        <div className="w-[68%] h-full rounded-full bg-amber-400" />
                      </div>
                    </div>
                  </Reveal>

                  {/* Mini-panel 2: Signal detected */}
                  <Reveal delay={500}>
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-2">SIGNAL DETECTED</p>
                      <p className="text-sm font-semibold text-white">Capacity Misalignment</p>
                      <p className="text-xs text-white/60 mt-0.5">3 questions triggered · HIGH severity · service-performance</p>
                      <span className="inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        HIGH
                      </span>
                    </div>
                  </Reveal>

                  {/* Mini-panel 3: Action generated */}
                  <Reveal delay={700}>
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-2">ACTION GENERATED</p>
                      <p className="text-sm font-semibold text-white leading-snug">Implement structured throughput management</p>
                      <p className="text-xs text-white/60 mt-1">Service Manager · 60 days · Developing band</p>
                      <span className="inline-flex mt-2 text-xs px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 border border-white/10">
                        60-DAY
                      </span>
                    </div>
                  </Reveal>

                  {/* Audit trail */}
                  <Reveal delay={900}>
                    <div className="mt-4 pt-4 border-t border-white/[0.08]">
                      <p className="text-xs font-mono text-white/30 leading-relaxed">
                        Q17 → CAPACITY_MISALIGNED :: service-performance<br />
                        → SVC_WORKSHOP_UTILISATION (developing) → Action
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Pipeline Visual (Scroll-triggered) */}
      <section className="bg-white border-y border-border">
        <div ref={pipelineSection.ref} className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-8 text-center"
            style={{
              opacity: pipelineSection.visible ? 1 : 0,
              transform: pipelineSection.visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 600ms ease-out, transform 600ms ease-out',
            }}
          >
            THE ENGINE
          </p>

          {/* Desktop: flex row with arrows */}
          <div className="hidden lg:flex items-start justify-between gap-2">
            {PIPELINE_STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="flex-1 bg-white border border-border rounded-lg p-4 text-center hover:border-brand-500 hover:shadow-md transition-all duration-300"
                  style={{
                    opacity: pipelineSection.visible ? 1 : 0,
                    transform: pipelineSection.visible ? 'translateY(0)' : 'translateY(12px)',
                    transition: `opacity 500ms ease-out ${i * 150}ms, transform 500ms ease-out ${i * 150}ms`,
                  }}
                >
                  <p className="text-xs font-mono text-muted-foreground/50 mb-2">{s.step}</p>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
                {i < 5 && (
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground/30 flex-shrink-0"
                    style={{
                      opacity: pipelineSection.visible ? 1 : 0,
                      transition: `opacity 400ms ease-out ${i * 150 + 300}ms`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: grid without arrows */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:hidden">
            {PIPELINE_STEPS.map((s, i) => (
              <div
                key={s.step}
                className="bg-white border border-border rounded-lg p-4 text-center hover:border-brand-500 hover:shadow-md transition-all duration-300"
                style={{
                  opacity: pipelineSection.visible ? 1 : 0,
                  transform: pipelineSection.visible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 500ms ease-out ${i * 100}ms, transform 500ms ease-out ${i * 100}ms`,
                }}
              >
                <p className="text-xs font-mono text-muted-foreground/50 mb-2">{s.step}</p>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground text-center"
            style={{
              opacity: pipelineSection.visible ? 1 : 0,
              transition: `opacity 600ms ease-out 800ms`,
            }}
          >
            Deterministic · No AI · No randomness · Full audit trail per action
          </p>
        </div>
      </section>

      {/* SECTION 3b — Product Sneak Peek */}
      <ProductSneakPeek />

      {/* SECTION 4 — Three Proof Pillars */}
      <section className="bg-white py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
              WHY THIS IS DIFFERENT
            </p>
            <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
              Built different from every other tool in this category.
            </h2>
          </Reveal>

          <div className="lg:grid-cols-3 grid gap-8 mt-12">
            {PROOF_PILLARS.map((card, i) => (
              <Reveal key={card.title} delay={i * 150}>
                <div className="bg-white border border-border rounded-xl p-6 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                    <card.icon className="size-5 text-brand-500" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">{card.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-border">{card.bottom}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Metrics Trust Bar (Dark navy) */}
      <section
        style={{
          backgroundColor: '#0A0F1E',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div ref={metricsSection.ref} className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-between gap-8">
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                className={i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""}
                style={{
                  opacity: metricsSection.visible ? 1 : 0,
                  transform: metricsSection.visible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 500ms ease-out ${i * 100}ms, transform 500ms ease-out ${i * 100}ms`,
                }}
              >
                <p className="text-3xl font-bold text-white tabular-nums">
                  {metricsSection.visible ? <AnimatedCounter end={m.value} duration={1500} /> : "0"}
                </p>
                <p className="text-xs uppercase tracking-wider text-white/60 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Closing CTA Strip (Dark navy) */}
      <Reveal>
        <section
          style={{
            backgroundColor: '#0A0F1E',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              READY TO DEPLOY
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-tight">
              A diagnostic programme your dealers will trust.
            </h2>
            <p className="mt-4 text-base text-white/60 max-w-xl mx-auto">
              Request an OEM walkthrough. See the engine, the scoring logic,
              and the action plan output in a single 45-minute session.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button className="bg-white text-[#0A0F1E] hover:bg-white/90" size="lg" asChild>
                <Link to="/auth">
                  Request OEM Demo
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10 hover:text-white" size="lg" asChild>
                <Link to="/methodology">View Methodology</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      <Footer />
    </div>
  );
};

export default Index;
