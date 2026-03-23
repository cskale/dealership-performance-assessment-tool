import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

export default function Methodology() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    document.title = 'Methodology — Dealer Diagnostic';
  }, []);

  const cardClass = "bg-white border border-[hsl(var(--dd-rule))] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]";
  const detailCardClass = "bg-[hsl(var(--dd-fog))] border border-[hsl(var(--dd-rule))] rounded-xl p-4";
  const detailLabelClass = "text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--dd-ghost))] mb-1.5";
  const detailContentClass = "text-[13px] text-[hsl(var(--dd-ink))] leading-[1.55]";
  const sectionLabelClass = "text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--dd-accent))]";
  const sectionTitleClass = "text-[20px] font-semibold text-[hsl(var(--dd-ink))] leading-tight";
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
    { value: '50', label: 'Diagnostic questions' },
    { value: '22', label: 'Action templates' },
    { value: '5', label: 'Root-cause dimensions' },
    { value: '5', label: 'Maturity levels' },
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
      <div className="bg-[hsl(var(--dd-midnight))] px-12 py-14 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(26,86,232,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-[960px] mx-auto relative">
          {/* Eyebrow */}
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(221,82%,65%)] mb-3">
            <span className="inline-block w-5 h-px bg-[hsl(var(--dd-accent))] mr-2 align-middle" />
            Methodology
          </div>

          {/* Title */}
          <h1 className="font-display text-[36px] text-white leading-[1.15] tracking-tight mb-4 max-w-[560px]">
            How the assessment <em className="italic text-white/60">works</em>
          </h1>

          {/* Intro */}
          <p className="text-[14px] text-white/55 max-w-[580px] leading-relaxed mb-8">
            The Dealer Diagnostic tool uses a deterministic, evidence-based assessment engine. The same answers always produce the same signals, the same recommendations, and the same benchmarks — making every output auditable, explainable, and defensible in OEM programme contexts.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 flex-wrap">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-8">
                <div>
                  <div className="text-[24px] font-semibold text-white">{stat.value}</div>
                  <div className="text-[11px] text-white/35 tracking-wide">{stat.label}</div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-8 bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY SECTIONS ── */}
      <div className="px-8 py-10 grid gap-8">

        {/* ── SECTION 01 ── */}
        <div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-display text-[hsl(var(--dd-rule))] leading-none mr-6 select-none">01</span>
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
        </div>

        {/* ── SECTION 02 ── */}
        <div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-display text-[hsl(var(--dd-rule))] leading-none mr-6 select-none">02</span>
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
                <div className={detailLabelClass}>Triage scoring</div>
                <div className={detailContentClass}>Formula-driven. Impact = f(module weight, score gap, downstream KPI count). Urgency escalates for low scores and stale assessments.</div>
              </div>
              <div className={detailCardClass}>
                <div className={detailLabelClass}>Confidence intervals</div>
                <div className={detailContentClass}>σ &lt; 0.8 = High, 0.8–1.4 = Medium, &gt; 1.4 = Low. Low-confidence assessments trigger coach review flag.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 03 ── */}
        <div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-display text-[hsl(var(--dd-rule))] leading-none mr-6 select-none">03</span>
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

            {/* Confidence tier row */}
            <div className="flex gap-3 mt-5">
              <div className="flex-1 bg-[hsl(var(--dd-green-light))] border border-[#6ee7b7] rounded-xl p-4">
                <div className="text-[11px] font-semibold text-[hsl(160,60%,22%)] mb-1">High confidence</div>
                <div className="text-[12px] text-[hsl(160,40%,30%)] leading-relaxed">σ &lt; 0.8. Consistent assessment. No review required.</div>
              </div>
              <div className="flex-1 bg-[hsl(var(--dd-amber-light))] border border-[#fcd34d] rounded-xl p-4">
                <div className="text-[11px] font-semibold text-[hsl(38,70%,28%)] mb-1">Medium confidence</div>
                <div className="text-[12px] text-[hsl(38,50%,30%)] leading-relaxed">σ 0.8–1.4. Coach review recommended before action commitment.</div>
              </div>
              <div className="flex-1 bg-[hsl(var(--dd-red-light))] border border-[#fca5a5] rounded-xl p-4">
                <div className="text-[11px] font-semibold text-[hsl(0,60%,35%)] mb-1">Low confidence</div>
                <div className="text-[12px] text-[hsl(0,40%,35%)] leading-relaxed">σ &gt; 1.4. Results should not be shared externally without coach validation.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 04 ── */}
        <div className={cardClass}>
          <div className="p-8">
            <div className="grid grid-cols-[auto_1fr] items-center mb-6">
              <span className="text-[48px] font-display text-[hsl(var(--dd-rule))] leading-none mr-6 select-none">04</span>
              <div>
                <div className={sectionLabelClass}>Scoring</div>
                <h2 className={sectionTitleClass}>Five-level maturity model with sub-category guards</h2>
              </div>
            </div>

            <p className={bodyClass}>
              A high overall score does not guarantee a high maturity level if sub-categories fall below minimum thresholds. This prevents one exceptional department masking systemic weakness elsewhere.
            </p>

            {/* Maturity rows */}
            <div className="divide-y divide-[hsl(var(--dd-fog))] mt-6">
              {[
                { variant: 'maturity-advanced' as const, label: 'Advanced', desc: 'Score ≥ 85 AND no sub-category below 60. Ceiling analysis active.', range: '≥ 85' },
                { variant: 'maturity-developing' as const, label: 'Developing', desc: 'Score 70–84. Good foundations with identifiable improvement areas.', range: '70–84' },
                { variant: 'maturity-inconsistent' as const, label: 'Inconsistent', desc: 'Score 50–69, OR score ≥ 70 with σ > 1.4 detected across sub-categories.', range: '50–69' },
                { variant: 'maturity-foundational' as const, label: 'Foundational', desc: 'Score 30–49. Core operational gaps. Coach visit recommended.', range: '30–49' },
                { variant: 'maturity-critical' as const, label: 'Critical', desc: 'Score below 30. Immediate intervention. OEM escalation triggered if network active.', range: '< 30' },
              ].map((level) => (
                <div key={level.label} className="grid grid-cols-[120px_1fr_auto] items-center gap-4 py-3">
                  <Badge variant={level.variant}>{level.label}</Badge>
                  <span className="text-[13px] text-[hsl(var(--dd-muted))]">{level.desc}</span>
                  <span className="text-[12px] font-mono text-[hsl(var(--dd-ghost))]">{level.range}</span>
                </div>
              ))}
            </div>

            {/* Guard condition detail */}
            <div className={`${detailCardClass} mt-5`}>
              <div className={detailLabelClass}>Sub-category guard condition</div>
              <div className={detailContentClass}>
                Advanced maturity requires overall ≥ 85 AND no individual sub-category below 60. A dealer scoring 87 overall but 42 in Parts is classified as Developing. This guard prevents high-performing departments masking critical failures elsewhere.
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA FOOTER ── */}
        <div className="text-center py-8">
          <p className="text-[18px] font-semibold text-[hsl(var(--dd-ink))] mb-4">
            Ready to assess your dealership?
          </p>
          <Link to="/app/assessment">
            <Button>Start Assessment →</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
