import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Reveal } from "@/components/landing/Reveal";

export default function Methodology() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    document.title = 'Methodology — Dealer Diagnostic';
  }, []);

  const cardClass = "bg-white border border-[hsl(var(--dd-rule))] rounded-2xl overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-elevated";
  const detailCardClass = "bg-[hsl(var(--dd-fog))] border border-[hsl(var(--dd-rule))] rounded-xl p-4";
  const detailLabelClass = "text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] mb-1.5";
  const detailContentClass = "text-[13px] text-[hsl(var(--dd-ink))] leading-[1.55]";
  const sectionLabelClass = "text-sm font-bold tracking-[0.15em] uppercase text-brand-500";
  const sectionTitleClass = "font-sans font-black text-[20px] text-[hsl(var(--dd-ink))] leading-tight tracking-tight mt-1";
  const bodyClass = "text-[13px] text-[hsl(var(--dd-muted))] leading-[1.75]";


  const modules = [
    { badge: 'module-nvs' as const, label: 'NVS', scope: 'New Vehicle Sales — lead management, closing ratio, F&I, CSI', weight: 25, bar: 100 },
    { badge: 'module-uvs' as const, label: 'UVS', scope: 'Used Vehicle Sales — stock management, appraisal, age profile, margin', weight: 20, bar: 80 },
    { badge: 'module-service' as const, label: 'Service', scope: 'Aftersales — RO throughput, CSI, parts fill, workshop utilisation', weight: 20, bar: 80 },
    { badge: 'module-financial' as const, label: 'Finance', scope: 'Financial health — profit trend, cash management, working capital', weight: 20, bar: 80 },
    { badge: 'module-parts' as const, label: 'Parts', scope: 'Parts management — stock depth, obsolescence, turnover, fill rate', weight: 15, bar: 60 },
  ];

  const rootCauses = [
    { letter: 'P', label: 'People', bg: 'bg-[hsl(var(--dd-accent-light))]', text: 'text-[hsl(var(--dd-accent))]' },
    { letter: 'Pr', label: 'Process', bg: 'bg-[hsl(var(--dd-green-light))]', text: 'text-[hsl(var(--dd-green))]' },
    { letter: 'T', label: 'Tools', bg: 'bg-[hsl(var(--dd-amber-light))]', text: 'text-[hsl(var(--dd-amber))]' },
    { letter: 'S', label: 'Structure', bg: 'bg-[hsl(var(--dd-teal-light))]', text: 'text-[hsl(var(--dd-teal))]' },
    { letter: 'I', label: 'Incentives', bg: 'bg-[hsl(var(--dd-red-light))]', text: 'text-[hsl(var(--dd-red))]' },
  ];

  const stats = [
    { value: '5', label: 'Assessment modules' },
    { value: '100+', label: 'Diagnostic questions' },
    { value: '4', label: 'Maturity bands' },
    { value: '18', label: 'Audit fields per action' },
    { value: '5', label: 'Root-cause dimensions' },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--dd-fog))]">
      {/* Minimal back button */}
      <div className="border-b border-[hsl(var(--dd-rule))] bg-white/80 backdrop-blur">
        <div className="max-w-[960px] mx-auto px-12 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-[hsl(var(--dd-muted))] hover:text-[hsl(var(--dd-ink))]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
          </Button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div
        className="px-12 py-14 relative overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--dd-midnight))',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      >
        <div className="max-w-[960px] mx-auto relative">
          {/* Eyebrow */}
          <div className="text-sm font-bold tracking-[0.15em] uppercase text-brand-500 mb-4">
            <span className="inline-block w-5 h-px bg-brand-500 mr-2 align-middle" />
            Methodology
          </div>

          {/* Title */}
          <h1 className="font-sans font-black text-[44px] lg:text-[56px] text-white leading-[1.05] tracking-tight mb-5 max-w-[640px]">
            How the assessment works
          </h1>

          {/* Intro */}
          <p className="text-[15px] text-white/60 max-w-[620px] leading-relaxed mb-10">
            The Dealer Diagnostic tool uses a deterministic, evidence-based assessment engine. The same answers always produce the same signals, the same recommendations, and the same benchmarks — making every output auditable, explainable, and defensible in OEM programme contexts.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="text-[22px] font-semibold text-white leading-none">{stat.value}</div>
                <div className="text-[11px] text-white/50 tracking-wide mt-1.5">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── BODY SECTIONS ── */}
      <div className="px-8 py-10 grid gap-8">

        {/* ── SECTION 01 — Structure ── */}
        <Reveal><div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-black text-brand-500/30 leading-none mr-6 select-none">01</span>
              <div>
                <div className={sectionLabelClass}>Structure</div>
                <h2 className={sectionTitleClass}>Assessment architecture & module weighting</h2>
              </div>
            </div>

            <p className={bodyClass}>
              Assessments are structured across five functional modules reflecting the P&L and operational structure of a European dealership. Each module carries a calibrated weight that reflects its impact on total dealership profitability. Business model branching ensures service-only (2S) dealers do not receive sales-specific modules.
            </p>

            {/* Module weight table */}
            <table className="w-full border-collapse mt-6">
              <thead>
                <tr className="border-b border-[hsl(var(--dd-rule))]">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] pb-2 pr-4">Module</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] pb-2 pr-4">Scope</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] pb-2 pr-4 w-16">Weight</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] pb-2 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod.label} className="border-b border-[hsl(var(--dd-fog))]">
                    <td className="py-3 pr-4">
                      <Badge variant={mod.badge}>{mod.label}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-[12px] text-[hsl(var(--dd-muted))]">{mod.scope}</td>
                    <td className="py-3 pr-4 text-[13px] font-semibold text-[hsl(var(--dd-ink))]">{mod.weight}%</td>
                    <td className="py-3">
                      <div className="w-24 h-1 bg-[hsl(var(--dd-fog))] rounded-full">
                        <div className="h-1 bg-[hsl(var(--dd-accent))] rounded-full" style={{ width: `${mod.bar}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Detail cards */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Question scale</div>
                <div className={detailContentClass}>All questions use a 1–5 observable-criteria scale with specific measurable labels at each point. High-diagnostic questions carry a 1.5× weight multiplier.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Business model gating</div>
                <div className={detailContentClass}>2S, 3S, and 4S configurations suppress or activate modules accordingly. A service-only dealer never receives NVS questions.</div>
              </div>
            </div>
          </div>
        </div></Reveal>

        {/* ── SECTION 02 — Intelligence ── */}
        <Reveal><div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-black text-brand-500/30 leading-none mr-6 select-none">02</span>
              <div>
                <div className={sectionLabelClass}>Intelligence</div>
                <h2 className={sectionTitleClass}>Deterministic signal engine & root-cause diagnostics</h2>
              </div>
            </div>

            <p className={bodyClass}>
              Signals are generated by a deterministic engine: identical answers always produce identical signals. There is no AI black-box. Every output is fully auditable. Cross-validation logic detects internal contradictions and flags them for coach review.
            </p>

            {/* Root-cause chips */}
            <div className="flex flex-wrap gap-2.5 mt-4">
              {rootCauses.map((rc) => (
                <div key={rc.label} className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[hsl(var(--dd-rule))] rounded-full text-[12px] font-medium text-[hsl(var(--dd-ink))] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <span className={`w-[18px] h-[18px] rounded-full ${rc.bg} ${rc.text} text-[10px] flex items-center justify-center font-semibold`}>
                    {rc.letter}
                  </span>
                  {rc.label}
                </div>
              ))}
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Systemic pattern detection</div>
                <div className={detailContentClass}>Signal appearing in 3+ modules = systemic; 2 modules = recurring. Surfaced before individual signals.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Cross-validation</div>
                <div className={detailContentClass}>Five ratio-pair rules detect contradictions — NVS productivity, service utilisation vs CSI, parts blocking service, profit-cash disconnect, hidden dead stock.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Score threshold</div>
                <div className={detailContentClass}>Every answered question is evaluated against a weak score threshold of ≤ 3 out of 5. Questions scoring 4 or 5 are skipped — unless the ceiling signal pass logic applies. This threshold is consistent across all departments and all business models.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Severity escalation</div>
                <div className={detailContentClass}>Signals are not treated as isolated flags. When 3 or more questions trigger the same signal code, the escalateSeverity() function upgrades its severity automatically: LOW → MEDIUM · MEDIUM → HIGH. A single HIGH-weight question scoring ≤ 2 fires HIGH severity immediately, without needing 3 triggers.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Ceiling signal pass</div>
                <div className={detailContentClass}>Dealers are not penalised for strong performance. When a question scores 4 out of 5 on a high-weight item (weight ≥ 1.2) inside a module where the section score is ≥ 65, the engine fires a soft PROCESS_NOT_STANDARDISED signal. This generates a targeted excellence action — not a gap-closure action. Maximum one ceiling signal fires per module.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Audit trail depth</div>
                <div className={detailContentClass}>Every action is written to the database as an 18-field record — including the full array of triggering question IDs, signal code, score band, business model, template tier used, 9 context intelligence fields, and a link to the originating assessment. No information is discarded between question and action.</div>
              </div>
            </div>
          </div>
        </div></Reveal>

        {/* ── SECTION 03 — Templates (NEW) ── */}
        <Reveal><div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-black text-brand-500/30 leading-none mr-6 select-none">03</span>
              <div>
                <div className={sectionLabelClass}>Templates</div>
                <h2 className={sectionTitleClass}>Three-tier template selection & score-band gating</h2>
              </div>
            </div>

            <p className={bodyClass}>
              Every signal resolves to an action through a three-tier template lookup. The most contextually precise template always wins — generic actions only fire when no specific match is found. Within each tier, score-band gating ensures a dealer at 38% and a dealer at 72% with the same weak signal receive different, maturity-appropriate actions.
            </p>

            {/* Template tiers */}
            <div className="grid gap-3 mt-6">
              {[
                {
                  tier: '1',
                  priority: 'Highest priority',
                  label: 'Tiered Templates',
                  detail: 'Business-model-aware templates covering all 5 departments. If a tiered match is found — it fires. Generic lookup is skipped entirely.',
                },
                {
                  tier: '2',
                  priority: '',
                  label: 'KPI-Specific Templates',
                  detail: 'Used when Tier 1 finds no match. Selected when the signal carries linked KPI keys that overlap with a template\'s KPI set.',
                },
                {
                  tier: '3',
                  priority: 'Fallback',
                  label: 'Generic Templates',
                  detail: 'Activated only when Tiers 1 and 2 produce nothing. Ensures every signal receives an action of last resort.',
                },
              ].map((t) => (
                <div key={t.tier} className={`${detailCardClass} flex items-start gap-4`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[hsl(var(--dd-accent))]/10 text-[hsl(var(--dd-accent))] flex items-center justify-center text-[13px] font-bold">
                    {t.tier}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[hsl(var(--dd-ink))]">{t.label}</span>
                      {t.priority && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(var(--dd-ghost))]">— {t.priority}</span>
                      )}
                    </div>
                    <div className={detailContentClass}>{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Score bands — clean table */}
            <div className="mt-6 rounded-xl ring-1 ring-border bg-white overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[hsl(var(--dd-rule))]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 px-4 py-2.5">Band</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 px-4 py-2.5">Section score</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 px-4 py-2.5">Action focus</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { band: 'Foundational', score: '≤ 45', focus: 'Basic process establishment and gap-closure actions' },
                    { band: 'Developing', score: '46–69', focus: 'Process optimisation and KPI ownership actions' },
                    { band: 'Performing', score: '70–84', focus: 'Standardisation and consistency actions' },
                    { band: 'Advanced', score: '≥ 85', focus: 'Ceiling-gap and competitive-advantage actions' },
                  ].map((b) => (
                    <tr key={b.band} className="border-b border-[hsl(var(--dd-fog))] last:border-0">
                      <td className="px-4 py-3 text-[13px] font-semibold text-[hsl(var(--dd-ink))]">{b.band}</td>
                      <td className="px-4 py-3 text-[12px] font-mono text-[hsl(var(--dd-muted))]">{b.score}</td>
                      <td className="px-4 py-3 text-[12px] text-[hsl(var(--dd-muted))]">{b.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div></Reveal>

        {/* ── SECTION 04 — Benchmarks (renumbered from 03) ── */}
        <Reveal><div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-black text-brand-500/30 leading-none mr-6 select-none">04</span>
              <div>
                <div className={sectionLabelClass}>Benchmarks</div>
                <h2 className={sectionTitleClass}>Benchmark framework & peer segmentation</h2>
              </div>
            </div>

            <p className={bodyClass}>
              Benchmarks are the most sensitive element of any dealer diagnostic tool. All benchmarks are — or will be — peer-segmented using a composite key across four dimensions to ensure benchmark purity.
            </p>

            {/* Detail cards */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Peer segmentation key</div>
                <div className={detailContentClass}>Brand tier × Business model × Network structure × Volume band. Benchmarks only fire when peer pool meets minimum sample size.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Module benchmarks (Phase 1 seeds)</div>
                <div className={detailContentClass}>NVS: 72 · UVS: 70 · Service: 75 · Financial: 68 · Parts: 65. Sourced from publicly available OEM programme data.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Benchmark evolution</div>
                <div className={detailContentClass}>Phase 1: static seeds. Phase 2: weighted blend. Phase 3: live peer-pool derivation. Quarterly refresh cadence minimum.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Transparency</div>
                <div className={detailContentClass}>Every benchmark shows source classification, geographic scope, reference year, and peer pool size where available.</div>
              </div>
            </div>

            {/* Confidence tiers — clean table */}
            <div className="mt-5 rounded-xl ring-1 ring-border bg-white overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[hsl(var(--dd-rule))]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 px-4 py-2.5">Confidence</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 px-4 py-2.5">Std deviation</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-brand-500 px-4 py-2.5">Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: 'High', sigma: 'σ < 0.8', note: 'Consistent assessment. No review required.' },
                    { tier: 'Medium', sigma: 'σ 0.8–1.4', note: 'Coach review recommended before action commitment.' },
                    { tier: 'Low', sigma: 'σ > 1.4', note: 'Results should not be shared externally without coach validation.' },
                  ].map((c) => (
                    <tr key={c.tier} className="border-b border-[hsl(var(--dd-fog))] last:border-0">
                      <td className="px-4 py-3 text-[13px] font-semibold text-[hsl(var(--dd-ink))]">{c.tier}</td>
                      <td className="px-4 py-3 text-[12px] font-mono text-[hsl(var(--dd-muted))]">{c.sigma}</td>
                      <td className="px-4 py-3 text-[12px] text-[hsl(var(--dd-muted))]">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div></Reveal>

        {/* ── CTA FOOTER ── */}
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl bg-dd-midnight text-white text-center px-8 py-14 mt-4"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 0%, hsl(var(--brand-500) / 0.18), transparent 60%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: 'auto, 40px 40px, 40px 40px',
            }}
          >
            <div className="text-sm font-bold tracking-[0.15em] uppercase text-brand-400 mb-3">Get Started</div>
            <h3 className="font-sans font-black text-3xl lg:text-4xl tracking-tight mb-6">
              Ready to assess your dealership?
            </h3>
            <Link to="/app/assessment">
              <Button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white h-12 px-7 text-[15px]">
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Reveal>


      </div>
    </div>
  );
}
