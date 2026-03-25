import { useState, useEffect, useRef } from "react";
import { User, Clock, TrendingDown } from "lucide-react";

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

const DEPARTMENTS = [
  { code: 'NVS', name: 'New Vehicle Sales', score: 74, status: 'Optimising' as const, barColor: 'bg-emerald-400' },
  { code: 'UVS', name: 'Used Vehicle Sales', score: 58, status: 'Developing' as const, barColor: 'bg-amber-400' },
  { code: 'SVC', name: 'Service', score: 68, status: 'Developing' as const, barColor: 'bg-amber-400' },
  { code: 'FIN', name: 'Financial Ops', score: 81, status: 'Optimising' as const, barColor: 'bg-emerald-400' },
  { code: 'PTS', name: 'Parts', score: 43, status: 'Foundational' as const, barColor: 'bg-red-400' },
];

const STATUS_STYLES: Record<string, string> = {
  Optimising: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Developing: 'bg-amber-50 text-amber-700 border-amber-200',
  Foundational: 'bg-red-50 text-red-700 border-red-200',
};

const AUDIT_NODES = [
  { type: 'input' as const, title: 'Assessment Answer', detail: 'Q-PTS-008 · Score: 2 / 5 · Weight: 1.3' },
  { type: 'process' as const, title: 'Signal Mapping', detail: 'q-pts-008 → STOCK_RISK :: parts-inventory' },
  { type: 'process' as const, title: 'Signal Group Formed', detail: 'Triggers: [q-pts-008, q-pts-011, q-pts-014]\nSeverity: HIGH (escalated from MEDIUM)' },
  { type: 'process' as const, title: 'Template Selected', detail: 'PTS_OBSOLESCENCE_MANAGEMENT\nBand: foundational · Model: 4S ✔' },
  { type: 'process' as const, title: 'Context Intelligence', detail: 'impact_score: 8 · effort_score: 5\nurgency_score: 9' },
  { type: 'output' as const, title: 'Action Inserted', detail: 'fields written · assessment_id linked\nstatus: pending' },
];

const DOT_STYLES: Record<string, string> = {
  input: 'border-muted-foreground bg-background',
  process: 'border-brand-500 bg-brand-500',
  output: 'border-emerald-500 bg-emerald-500',
};

function PanelHeader({ label, chip }: { label: string; chip: string }) {
  return (
    <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
      <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{chip}</span>
    </div>
  );
}

export default function ProductSneakPeek() {
  const section = useScrollReveal(0.1);

  return (
    <section ref={section.ref} className="py-20 px-6 lg:px-8" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          style={{
            opacity: section.visible ? 1 : 0,
            transform: section.visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 600ms ease-out, transform 600ms ease-out',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
            INSIDE THE PLATFORM
          </p>
          <h2 className="text-3xl font-bold text-foreground max-w-2xl leading-tight mt-2">
            Three views. One coherent diagnostic programme.
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl">
            From department score to prioritised action plan — every step visible, every decision auditable.
          </p>
        </div>

        {/* Three Panel Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mt-12">

          {/* PANEL 1 — Department Score Overview */}
          <div
            className="bg-white border border-border rounded-xl shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            style={{
              opacity: section.visible ? 1 : 0,
              transform: section.visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 600ms ease-out 100ms, transform 600ms ease-out 100ms, box-shadow 300ms, translate 300ms',
            }}
          >
            <PanelHeader label="DEPARTMENT SCORES" chip="5 Departments" />
            <div className="px-5 py-4 space-y-4">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.code} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[120px] shrink-0">
                    <span className="text-xs font-mono font-bold bg-muted rounded px-1.5 py-0.5 text-muted-foreground">{dept.code}</span>
                    <span className="text-sm font-medium text-foreground ml-1 truncate">{dept.name}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-muted">
                    <div className={`h-full rounded-full ${dept.barColor}`} style={{ width: `${dept.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-foreground w-6 text-right">{dept.score}</span>
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_STYLES[dept.status]}`}>
                    {dept.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL 2 — Signal & Action Detail */}
          <div
            className="bg-white border border-border rounded-xl shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            style={{
              opacity: section.visible ? 1 : 0,
              transform: section.visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 600ms ease-out 250ms, transform 600ms ease-out 250ms, box-shadow 300ms, translate 300ms',
            }}
          >
            <PanelHeader label="SIGNAL → ACTION" chip="Parts Department" />
            <div className="px-5 py-4">
              {/* Signal block */}
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">SIGNAL DETECTED</p>
                <p className="text-sm font-semibold text-foreground mt-1">Stock Obsolescence Risk</p>
                <p className="text-xs text-muted-foreground mt-0.5">4 questions triggered · HIGH severity</p>
                <div className="mt-3 space-y-1.5">
                  {[
                    'Q-PTS-008: Stock age review frequency (Score: 2)',
                    'Q-PTS-011: Obsolescence write-off process (Score: 2)',
                    'Q-PTS-014: Slow-mover identification system (Score: 3)',
                  ].map((q) => (
                    <div key={q} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action block */}
              <div className="border border-border rounded-lg p-4 mt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">ACTION GENERATED</p>
                <p className="text-sm font-semibold text-foreground mt-1 leading-snug">
                  Implement parts age analysis and write-off protocol
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User size={12} /> Parts Manager
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> 30 days
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingDown size={12} /> Foundational band
                  </span>
                </div>
                <span className="inline-flex mt-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  HIGH PRIORITY
                </span>
              </div>
            </div>
          </div>

          {/* PANEL 3 — Audit Trail View */}
          <div
            className="bg-white border border-border rounded-xl shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            style={{
              opacity: section.visible ? 1 : 0,
              transform: section.visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 600ms ease-out 400ms, transform 600ms ease-out 400ms, box-shadow 300ms, translate 300ms',
            }}
          >
            <PanelHeader label="AUDIT TRAIL" chip="Full traceability" />
            <div className="px-5 py-4">
              <div className="border-l-2 border-border ml-1">
                {AUDIT_NODES.map((node, i) => (
                  <div key={i} className={`flex items-start gap-3 ${i < AUDIT_NODES.length - 1 ? 'pb-5' : ''} relative`}>
                    <span className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-0.5 -ml-[5px] ${DOT_STYLES[node.type]}`} />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{node.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono leading-relaxed whitespace-pre-line">{node.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground/60 italic">
                Every action is fully traceable to its source questions. Reproducible. Auditable. OEM-ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
