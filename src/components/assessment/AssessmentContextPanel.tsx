import { useEffect, useState } from "react";
import { Check, LayoutPanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import type { Section } from "@/data/questionnaire";
import { getScoredQuestionCount, getAnsweredScoredCount, isSectionComplete } from "@/lib/assessmentUtils";

interface Props {
  sections: Section[];
  currentSection: number;
  answers: Record<string, number>;
  onSelectSection: (idx: number) => void;
  disabled?: boolean;
}

function useVisibleQuestionIndex(total: number) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(0);
    if (total === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const i = Number((visible.target as HTMLElement).dataset.qIndex);
          if (!Number.isNaN(i)) setIdx(i);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    // Wait a tick for refs to mount
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-q-index]").forEach((el) => obs.observe(el));
    }, 50);
    return () => {
      clearTimeout(t);
      obs.disconnect();
    };
  }, [total]);
  return idx;
}

function PanelBody({ sections, currentSection, answers, onSelectSection, disabled }: Props) {
  const section = sections[currentSection];
  const scoredCount = section ? getScoredQuestionCount(section) : 0;
  const answeredInSection = section ? getAnsweredScoredCount(section, answers) : 0;
  const visibleIdx = useVisibleQuestionIndex(scoredCount);
  const currentQ = Math.min(visibleIdx + 1, Math.max(scoredCount, 1));
  const pct = scoredCount ? Math.round((answeredInSection / scoredCount) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
          Current department
        </p>
        <h3 className="text-[15px] font-semibold text-[#0b1f3a] leading-tight">
          {section?.title ?? "—"}
        </h3>
        <p className="text-[12px] text-[#6e7e8a] mt-1 tabular-nums">
          Question {currentQ} of {scoredCount}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-[#6e7e8a] mb-1.5">
          <span>Section progress</span>
          <span className="tabular-nums font-medium text-[#172d4d]">
            {answeredInSection}/{scoredCount}
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
          Departments
        </p>
        <ul className="space-y-1">
          {sections.map((s, i) => {
            const complete = isSectionComplete(s, answers);
            const isCurrent = i === currentSection;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSection(i)}
                  className={`w-full flex items-center gap-2 text-left rounded-md px-2 py-1.5 text-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrent
                      ? "bg-[#D6E3FF] text-[#0b1f3a] font-medium"
                      : "text-[#445166] hover:bg-[#f4f6f8]"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center h-4 w-4 rounded-full flex-shrink-0 ${
                      complete
                        ? "bg-[#1D7AFC] text-white"
                        : isCurrent
                        ? "bg-white border border-[#1D7AFC] text-[#1D7AFC]"
                        : "bg-[#e2e8f0] text-[#94a3b8]"
                    }`}
                  >
                    {complete ? (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : (
                      <span className="text-[9px] font-semibold tabular-nums">{i + 1}</span>
                    )}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function AssessmentContextPanel(props: Props) {
  return (
    <aside className="hidden lg:block w-[280px] flex-shrink-0">
      <div className="sticky top-6 bg-white border border-[#d4dde4] rounded-xl p-5 shadow-card">
        <PanelBody {...props} />
      </div>
    </aside>
  );
}

export function AssessmentContextDrawer(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open assessment progress"
          className="lg:hidden fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 bg-[#1D7AFC] text-white text-[12px] font-semibold rounded-full pl-3 pr-4 py-2.5 shadow-lg hover:bg-[#1a5fb4] transition-colors"
        >
          <LayoutPanelLeft className="h-4 w-4" />
          Progress
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="text-[14px]">Assessment progress</SheetTitle>
        </SheetHeader>
        <PanelBody
          {...props}
          onSelectSection={(i) => {
            props.onSelectSection(i);
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
