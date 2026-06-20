// src/components/assessment/AssessmentHeroNav.tsx
import { Section } from '@/data/questionnaire';
import { shortenSectionName, estimateTimeRemaining, getSectionProgress, isSectionComplete } from '@/lib/assessmentUtils';
import { cn } from '@/lib/utils';

interface AssessmentHeroNavProps {
  sections: Section[];
  currentSection: number;
  answers: Record<string, number>;
  onSectionChange: (index: number) => void;
  totalQuestions: number;
  answeredQuestions: number;
  dealershipName?: string;
  disabled?: boolean;
}

export function AssessmentHeroNav({
  sections,
  currentSection,
  answers,
  onSectionChange,
  totalQuestions,
  answeredQuestions,
  dealershipName,
  disabled = false,
}: AssessmentHeroNavProps) {
  const overallPct = totalQuestions > 0
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;

  const timeRemaining = estimateTimeRemaining(totalQuestions, answeredQuestions);

  const activeSection = sections[currentSection];

  return (
    <div className="shrink-0 z-20">
      {/* ── Stat strip ── */}
      <div className="flex items-center h-9 px-6 bg-dd-midnight">

        <div className="flex items-center gap-2 pr-5 border-r border-white/[0.08] h-full">
          <span className="text-[10px] font-medium text-white/35 tracking-[0.06em]">
            Est. time remaining
          </span>
          <span className="text-[11px] font-bold text-amber-400 tabular-nums">
            {timeRemaining}
          </span>
        </div>
        <div className="flex-1" />
        {dealershipName && (
          <div className="text-[11px] text-white/50 font-medium pl-5 border-l border-white/[0.08] h-full flex items-center">
            <span className="text-white/75 font-semibold">{dealershipName}</span>
          </div>
        )}
      </div>

      {/* ── Hero card ── */}
      <div
        className="bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 3px hsl(var(--neutral-1000) / 0.06), 0 8px 24px hsl(var(--neutral-1000) / 0.08)' }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-6 px-6 pt-6 pb-5 border-b border-neutral-100">
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-brand-100 border border-brand-200 text-brand-700 text-[12px] font-medium rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 badge-pulse flex-shrink-0" />
              Assessment in progress
            </div>

            {/* Active section title */}
            <h2
              className="text-[24px] font-bold text-neutral-1000 leading-[1.25] mb-1.5"
              style={{ letterSpacing: '-0.022em', fontOpticalSizing: 'auto' } as React.CSSProperties}
            >
              {activeSection?.title}
            </h2>

            {/* Active section description */}
            {activeSection?.description && (
              <p className="text-[13px] text-neutral-700 leading-relaxed">
                {activeSection.description}
              </p>
            )}
          </div>

          {/* Overall % complete */}
          <div className="flex-shrink-0 bg-neutral-50 border border-neutral-200 rounded-xl px-7 py-4 text-center min-w-[160px]">
            <div
              className="text-[52px] font-extrabold text-neutral-1000 leading-none tabular-nums font-display"
              style={{ letterSpacing: '-0.05em' } as React.CSSProperties}
            >
              {overallPct}
              <sup className="text-[20px] font-bold align-super" style={{ letterSpacing: '-0.02em' }}>%</sup>
            </div>
            <p className="text-[12px] font-medium text-neutral-600 mt-1.5 mb-2.5">Complete</p>
            <div className="w-full h-[5px] bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-animate"
                style={{
                  width: `${overallPct}%`,
                  background: 'linear-gradient(90deg, hsl(var(--brand-500)) 0%, hsl(var(--brand-400)) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex px-6">
          {sections.map((section, idx) => {
            const pct = getSectionProgress(section, answers);
            const complete = isSectionComplete(section, answers);
            const active = idx === currentSection;

            return (
              <button
                key={section.id}
                onClick={() => !disabled && onSectionChange(idx)}
                disabled={disabled}
                className={cn(
                  'flex-1 text-left pt-3 pb-0 transition-colors duration-100',
                  idx > 0 && 'ml-5',
                  disabled && 'cursor-not-allowed'
                )}
              >
                <p
                  className={cn(
                    'text-[12px] font-semibold mb-2 truncate transition-colors duration-100',
                    active && 'text-brand-500',
                    complete && !active && 'text-emerald-700',
                    !active && !complete && 'text-neutral-400 hover:text-neutral-700'
                  )}
                >
                  {shortenSectionName(section.title)}
                </p>
                {/* Progress bar — the active indicator */}
                <div className="h-[4px] bg-neutral-200 rounded-full overflow-hidden mb-0">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-500 ease-out',
                      complete ? 'bg-emerald-500' : 'bg-brand-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
