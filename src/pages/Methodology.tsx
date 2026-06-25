import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Reveal, Counter } from "@/components/landing/Reveal";

export default function Methodology() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    document.title = "Methodology — Dealer Diagnostic";
  }, []);

  const modules = [
    { label: "NVS", scope: "New Vehicle Sales — lead management, closing ratio, F&I, CSI", weight: 25 },
    { label: "UVS", scope: "Used Vehicle Sales — stock management, appraisal, age profile, margin", weight: 20 },
    { label: "Service", scope: "Aftersales — RO throughput, CSI, parts fill, workshop utilisation", weight: 20 },
    { label: "Finance", scope: "Financial health — profit trend, cash management, working capital", weight: 20 },
    { label: "Parts", scope: "Parts management — stock depth, obsolescence, turnover, fill rate", weight: 15 },
  ];

  const rootCauses = ["People", "Process", "Tools", "Structure", "Incentives"];

  const stats = [
    { n: 5, suffix: "", label: "Assessment modules" },
    { n: 100, suffix: "+", label: "Diagnostic questions" },
    { n: 4, suffix: "", label: "Maturity bands" },
    { n: 18, suffix: "", label: "Audit fields per action" },
    { n: 5, suffix: "", label: "Root-cause dimensions" },
  ];

  // Shared styles
  const eyebrow = "inline-flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-brand";
  const sectionH = "mt-3 font-sans font-black text-3xl tracking-tight text-foreground";
  const bigNum = "absolute -top-6 -left-2 text-8xl font-black text-foreground/5 leading-none select-none pointer-events-none";
  const innerCard = "rounded-xl ring-1 ring-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:ring-brand-500/40 hover:shadow-[0_0_30px_-10px_rgba(29,122,252,0.3)]";
  const innerLabel = "text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2";
  const innerBody = "text-[13px] text-muted-foreground leading-[1.7]";

  return (
    <div className="min-h-screen bg-background">
      {/* Back bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "de" ? "Zurück zur Startseite" : "Back to Home"}
          </Button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-midnight text-white">
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

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <Reveal>
            <span className={`${eyebrow} text-brand-500`}>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Methodology
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-5xl sm:text-6xl font-sans font-black tracking-tight leading-[1.05] text-white/95 max-w-3xl">
              How the assessment works
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-7 text-lg text-white/60 max-w-2xl leading-relaxed">
              The Dealer Diagnostic tool uses a deterministic, evidence-based assessment engine.
              The same answers always produce the same signals, the same recommendations, and the
              same benchmarks — making every output auditable, explainable, and defensible in OEM
              programme contexts.
            </p>
          </Reveal>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-10">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100} className="text-center md:text-left">
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  <Counter to={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-sm text-white/55">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 01 — Structure (white) ── */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-28">
          <Reveal>
            <div className="relative mb-12">
              <span className={bigNum}>01</span>
              <div className="relative">
                <span className={eyebrow}>Structure</span>
                <h2 className={sectionH}>Assessment architecture & module weighting</h2>
                <p className="mt-5 max-w-3xl text-muted-foreground leading-relaxed">
                  Assessments are structured across five functional modules reflecting the P&L and
                  operational structure of a European dealership. Each module carries a calibrated
                  weight that reflects its impact on total dealership profitability. Business model
                  branching ensures service-only (2S) dealers do not receive sales-specific
                  modules.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
            <Reveal>
              <div className={innerCard}>
                <div className={innerLabel}>Module weighting</div>
                <div className="space-y-4 mt-4">
                  {modules.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[13px] font-bold text-foreground">{m.label}</span>
                          <span className="text-[12px] text-muted-foreground">{m.scope}</span>
                        </div>
                        <span className="text-[13px] font-bold tabular-nums text-foreground">
                          {m.weight}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${m.weight * 4}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="grid gap-6">
              <Reveal delay={80}>
                <div className={innerCard}>
                  <div className={innerLabel}>Question scale</div>
                  <p className={innerBody}>
                    All questions use a 1–5 observable-criteria scale with specific measurable
                    labels at each point. High-diagnostic questions carry a 1.5× weight multiplier.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div className={innerCard}>
                  <div className={innerLabel}>Business model gating</div>
                  <p className={innerBody}>
                    2S, 3S, and 4S configurations suppress or activate modules accordingly. A
                    service-only dealer never receives NVS questions.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02 — Intelligence (fog) ── */}
      <section className="bg-dd-fog">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-28">
          <Reveal>
            <div className="relative mb-12">
              <span className={bigNum}>02</span>
              <div className="relative">
                <span className={eyebrow}>Intelligence</span>
                <h2 className={sectionH}>Deterministic signal engine & root-cause diagnostics</h2>
                <p className="mt-5 max-w-3xl text-muted-foreground leading-relaxed">
                  Signals are generated by a deterministic engine: identical answers always produce
                  identical signals. There is no AI black-box. Every output is fully auditable.
                  Cross-validation logic detects internal contradictions and flags them for coach
                  review.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {rootCauses.map((rc) => (
                <span
                  key={rc}
                  className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/60 hover:shadow-[0_0_30px_-10px_rgba(29,122,252,0.4)]"
                >
                  {rc}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                label: "Systemic pattern detection",
                body:
                  "Signal appearing in 3+ modules = systemic; 2 modules = recurring. Surfaced before individual signals.",
              },
              {
                label: "Cross-validation",
                body:
                  "Five ratio-pair rules detect contradictions — NVS productivity, service utilisation vs CSI, parts blocking service, profit-cash disconnect, hidden dead stock.",
              },
              {
                label: "Score threshold",
                body:
                  "Every answered question is evaluated against a weak score threshold of ≤ 3 out of 5. Questions scoring 4 or 5 are skipped — unless the ceiling signal pass logic applies.",
              },
              {
                label: "Severity escalation",
                body:
                  "When 3 or more questions trigger the same signal code, severity upgrades automatically: LOW → MEDIUM · MEDIUM → HIGH. A single HIGH-weight question scoring ≤ 2 fires HIGH severity immediately.",
              },
              {
                label: "Ceiling signal pass",
                body:
                  "When a question scores 4/5 on a high-weight item (≥ 1.2) inside a module where the section score is ≥ 65, the engine fires a soft PROCESS_NOT_STANDARDISED signal — generating a targeted excellence action.",
              },
              {
                label: "Audit trail depth",
                body:
                  "Every action is written to the database as an 18-field record — full triggering question IDs, signal code, score band, business model, template tier, 9 context fields, and the originating assessment.",
              },
            ].map((d, i) => (
              <Reveal key={d.label} delay={i * 60}>
                <div className={innerCard}>
                  <div className={innerLabel}>{d.label}</div>
                  <p className={innerBody}>{d.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 03 — Templates (white) ── */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-28">
          <Reveal>
            <div className="relative mb-12">
              <span className={bigNum}>03</span>
              <div className="relative">
                <span className={eyebrow}>Templates</span>
                <h2 className={sectionH}>Three-tier template selection & score-band gating</h2>
                <p className="mt-5 max-w-3xl text-muted-foreground leading-relaxed">
                  Every signal resolves to an action through a three-tier template lookup. The most
                  contextually precise template always wins — generic actions only fire when no
                  specific match is found. Within each tier, score-band gating ensures dealers at
                  different maturity levels receive maturity-appropriate actions.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {[
              {
                n: "1",
                title: "Tiered Templates",
                tag: "Highest priority",
                body:
                  "Business-model-aware templates covering all 5 departments. If a tiered match is found — it fires. Generic lookup is skipped entirely.",
              },
              {
                n: "2",
                title: "KPI-Specific Templates",
                tag: "",
                body:
                  "Used when Tier 1 finds no match. Selected when the signal carries linked KPI keys that overlap with a template's KPI set.",
              },
              {
                n: "3",
                title: "Generic Templates",
                tag: "Fallback",
                body:
                  "Activated only when Tiers 1 and 2 produce nothing. Ensures every signal receives an action of last resort.",
              },
            ].map((t, i) => (
              <Reveal key={t.n} delay={i * 80}>
                <div className={innerCard}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 grid place-items-center w-10 h-10 rounded-full bg-brand-500 text-white font-black text-base">
                      {t.n}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-bold text-foreground">{t.title}</span>
                        {t.tag && (
                          <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-muted-foreground">
                            · {t.tag}
                          </span>
                        )}
                      </div>
                      <p className={innerBody}>{t.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="rounded-xl ring-1 ring-border bg-white overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-dd-fog/50">
                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500 px-5 py-3">Band</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500 px-5 py-3">Section score</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500 px-5 py-3">Action focus</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { band: "Foundational", score: "≤ 45", focus: "Basic process establishment and gap-closure actions" },
                    { band: "Developing", score: "46–69", focus: "Process optimisation and KPI ownership actions" },
                    { band: "Performing", score: "70–84", focus: "Standardisation and consistency actions" },
                    { band: "Advanced", score: "≥ 85", focus: "Ceiling-gap and competitive-advantage actions" },
                  ].map((b) => (
                    <tr key={b.band} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 text-[14px] font-bold text-foreground">{b.band}</td>
                      <td className="px-5 py-4 text-[13px] font-mono text-muted-foreground tabular-nums">{b.score}</td>
                      <td className="px-5 py-4 text-[13px] text-muted-foreground">{b.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 04 — Benchmarks (fog) ── */}
      <section className="bg-dd-fog">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-28">
          <Reveal>
            <div className="relative mb-12">
              <span className={bigNum}>04</span>
              <div className="relative">
                <span className={eyebrow}>Benchmarks</span>
                <h2 className={sectionH}>Benchmark framework & peer segmentation</h2>
                <p className="mt-5 max-w-3xl text-muted-foreground leading-relaxed">
                  Benchmarks are the most sensitive element of any dealer diagnostic tool. All
                  benchmarks are — or will be — peer-segmented using a composite key across four
                  dimensions to ensure benchmark purity.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              {
                label: "Peer segmentation key",
                body:
                  "Brand tier × Business model × Network structure × Volume band. Benchmarks only fire when peer pool meets minimum sample size.",
              },
              {
                label: "Module benchmarks (Phase 1 seeds)",
                body:
                  "NVS: 72 · UVS: 70 · Service: 75 · Financial: 68 · Parts: 65. Sourced from publicly available OEM programme data.",
              },
              {
                label: "Benchmark evolution",
                body:
                  "Phase 1: static seeds. Phase 2: weighted blend. Phase 3: live peer-pool derivation. Quarterly refresh cadence minimum.",
              },
              {
                label: "Transparency",
                body:
                  "Every benchmark shows source classification, geographic scope, reference year, and peer pool size where available.",
              },
            ].map((d, i) => (
              <Reveal key={d.label} delay={i * 60}>
                <div className={innerCard}>
                  <div className={innerLabel}>{d.label}</div>
                  <p className={innerBody}>{d.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="rounded-xl ring-1 ring-border bg-white overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-white">
                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500 px-5 py-3">Confidence</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500 px-5 py-3">Std deviation</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500 px-5 py-3">Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: "High", sigma: "σ < 0.8", note: "Consistent assessment. No review required." },
                    { tier: "Medium", sigma: "σ 0.8–1.4", note: "Coach review recommended before action commitment." },
                    { tier: "Low", sigma: "σ > 1.4", note: "Results should not be shared externally without coach validation." },
                  ].map((c) => (
                    <tr key={c.tier} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 text-[14px] font-bold text-foreground">{c.tier}</td>
                      <td className="px-5 py-4 text-[13px] font-mono text-muted-foreground tabular-nums">{c.sigma}</td>
                      <td className="px-5 py-4 text-[13px] text-muted-foreground">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative overflow-hidden bg-midnight text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 40%, rgba(29,122,252,0.22), transparent 70%)",
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
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-24 lg:py-28 text-center">
          <Reveal>
            <span className={`${eyebrow} text-brand-500 justify-center`}>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Get Started
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mt-6 font-sans font-black text-3xl sm:text-4xl tracking-tight text-white/95">
              Ready to assess your dealership?
            </h2>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-9 flex justify-center">
              <Link
                to="/app/assessment"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(29,122,252,0.7)] hover:brightness-110 transition"
              >
                Start Assessment
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
