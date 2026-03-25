import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { HomeHeader } from "@/components/Navigation/HomeHeader";
import { Footer } from "@/components/Home/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Lock } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const completedResults = localStorage.getItem('completed_assessment_results');
    setHasCompletedAssessment(!!completedResults);
  }, []);

  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background font-[Roboto]">
      <HomeHeader hasCompletedAssessment={hasCompletedAssessment} />

      {/* SECTION 2 — Hero */}
      <section className="bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column — copy */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-500/10 text-brand-500 border border-brand-500/20">
                Dealer Diagnostic &amp; Performance Platform
              </span>

              <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground mt-4">
                From Assessment<br />
                to <span className="text-brand-500">Auditable</span> Action Plan.
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
                Deterministic signal detection. Maturity-aware scoring.
                Consultant-grade action plans. No AI hallucination.
                Built for dealer networks that require reproducible,
                defensible, auditable performance programmes.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Request OEM Demo
                    <ArrowRight className="ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/methodology">View Methodology</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-widest text-muted-foreground">
                <span>Built for</span>
                <span>Dealer Principals</span>
                <span className="text-muted-foreground/40">·</span>
                <span>Field Coaches</span>
                <span className="text-muted-foreground/40">·</span>
                <span>OEM Programme Managers</span>
              </div>
            </div>

            {/* Right column — product preview card */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-white border border-border rounded-xl shadow-card p-6">
                {/* Mini-panel 1: Department score */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">SERVICE DEPARTMENT</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-foreground leading-none">68</span>
                    <span className="text-sm text-muted-foreground ml-1">/ 100</span>
                    <span className="inline-flex ml-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      DEVELOPING
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted mt-3">
                    <div className="w-[68%] h-full rounded-full bg-amber-400" />
                  </div>
                </div>

                {/* Mini-panel 2: Signal detected */}
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">SIGNAL DETECTED</p>
                  <p className="text-sm font-semibold text-foreground">Capacity Misalignment</p>
                  <p className="text-xs text-muted-foreground mt-0.5">3 questions triggered · HIGH severity · service-performance</p>
                  <span className="inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    HIGH
                  </span>
                </div>

                {/* Mini-panel 3: Action generated */}
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">ACTION GENERATED</p>
                  <p className="text-sm font-semibold text-foreground leading-snug">Implement structured throughput management</p>
                  <p className="text-xs text-muted-foreground mt-1">Service Manager · 60 days · Developing band</p>
                  <span className="inline-flex mt-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    60-DAY
                  </span>
                </div>

                {/* Audit trail */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-mono text-muted-foreground/50 leading-relaxed">
                    Q17 → CAPACITY_MISALIGNED :: service-performance<br />
                    → SVC_WORKSHOP_UTILISATION (developing) → Action
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Pipeline Visual */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-8 text-center">
            THE ENGINE
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: "01", title: "Assessment Answers", desc: "Questions scored 1–5 per item" },
              { step: "02", title: "Scoring Engine", desc: "Weighted scores + section aggregation" },
              { step: "03", title: "Signal Engine", desc: "Detect weak scores, group into signals" },
              { step: "04", title: "Template Lookup", desc: "Tiered → KPI-specific → Generic fallback" },
              { step: "05", title: "Context Intelligence", desc: "Enrich with drivers, impact, effort" },
              { step: "06", title: "Action Plan", desc: "Prioritised, owner-assigned, auditable" },
            ].map((s) => (
              <div key={s.step} className="bg-white border border-border rounded-lg p-4 text-center">
                <p className="text-xs font-mono text-muted-foreground/50 mb-2">{s.step}</p>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground text-center">
            Deterministic · No AI · No randomness · Full audit trail per action
          </p>
        </div>
      </section>

      {/* SECTION 4 — Three Proof Pillars */}
      <section className="bg-background py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
            WHY THIS IS DIFFERENT
          </p>
          <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
            Built different from every other tool in this category.
          </h2>

          <div className="lg:grid-cols-3 grid gap-8 mt-12">
            {[
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
            ].map((card) => (
              <div key={card.title} className="bg-white border border-border rounded-xl p-6 shadow-card">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                  <card.icon className="size-5 text-brand-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{card.body}</p>
                <p className="text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-border">{card.bottom}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Metrics Trust Bar */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-between gap-8">
            {[
              { value: "5", label: "Departments Assessed" },
              { value: "355KB", label: "KPI Definitions Library" },
              { value: "27", label: "Tiered Action Templates" },
              { value: "22", label: "Signal Codes" },
              { value: "18", label: "Fields per Action Record" },
            ].map((m, i) => (
              <div key={m.label} className={i > 0 ? "lg:border-l lg:border-border lg:pl-8" : ""}>
                <p className="text-3xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Closing CTA Strip */}
      <section className="bg-foreground">
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
            <Button className="bg-white text-foreground hover:bg-white/90" size="lg" asChild>
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

      <Footer />
    </div>
  );
};

export default Index;
