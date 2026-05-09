// src/components/assessment/AssessmentHeroNav.tsx
import { Section } from '@/data/questionnaire';
import { shortenSectionName, estimateTimeRemaining } from '@/lib/assessmentUtils';
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

  const getSectionProgress = (section: Section) => {
    const answered = section.questions.filter(q => answers[q.id] !== undefined).length;
    return section.questions.length > 0
      ? Math.round((answered / section.questions.length) * 100)
      : 0;
  };

  const isSectionComplete = (section: Section) =>
    section.questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="sticky top-0 z-20 mb-8">
      {/* ── Stat strip ── */}
      <div
        className="flex items-center h-9 px-6"
        style={{ background: '#0b1f3a' }}
      >
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
        style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)' }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-6 px-6 pt-6 pb-5 border-b border-[#f1f5f9]">
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] text-[12px] font-medium rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7AFC] badge-pulse flex-shrink-0" />
              Assessment in progress
            </div>

            {/* Active section title */}
            <h2
              className="text-[24px] font-bold text-[#0b1f3a] leading-[1.25] mb-1.5"
              style={{ letterSpacing: '-0.022em', fontOpticalSizing: 'auto' } as React.CSSProperties}
            >
              {activeSection?.title}
            </h2>

            {/* Active section description */}
            {activeSection?.description && (
              <p className="text-[13px] text-[#445166] leading-relaxed">
                {activeSection.description}
              </p>
            )}
          </div>

          {/* Overall % complete */}
          <div className="flex-shrink-0 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-7 py-4 text-center min-w-[160px]">
            <div
              className="text-[52px] font-extrabold text-[#0b1f3a] leading-none tabular-nums"
              style={{ letterSpacing: '-0.05em', fontOpticalSizing: 'auto' } as React.CSSProperties}
            >
              {overallPct}
              <sup className="text-[20px] font-bold align-super" style={{ letterSpacing: '-0.02em' }}>%</sup>
            </div>
            <p className="text-[12px] font-medium text-[#6e7e8a] mt-1.5 mb-2.5">Complete</p>
            <div className="w-full h-[5px] bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-animate"
                style={{
                  width: `${overallPct}%`,
                  background: 'linear-gradient(90deg, #1D7AFC 0%, #4fa8ff 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex px-6">
          {sections.map((section, idx) => {
            const pct = getSectionProgress(section);
            const complete = isSectionComplete(section);
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
                    active && 'text-[#1D7AFC]',
                    complete && !active && 'text-[#15803d]',
                    !active && !complete && 'text-[#adbcc7] hover:text-[#445166]'
                  )}
                >
                  {shortenSectionName(section.title)}
                </p>
                {/* Progress bar — the active indicator */}
                <div className="h-[4px] bg-[#eef0f3] rounded-full overflow-hidden mb-0">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: complete ? '#16a34a' : '#1D7AFC',
                    }}
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
