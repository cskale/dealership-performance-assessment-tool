# Sprint 2: Assessment Flow Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the assessment page — remove the left sidebar, add a full-width hero nav card at the top, and upgrade question cards with a new top bar, improved rating tiles, merged context strip, and two-action footer.

**Architecture:** Three-file change. A new `AssessmentHeroNav` component replaces the inline sidebar. `Assessment.tsx` adopts a full-width single-column layout. `CategoryAssessment.tsx` gets a new question card structure. Pure utility functions extracted to a testable module first.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/assessmentUtils.ts` | **Create** | Pure utility functions — merge prose, shorten section name, estimate time remaining |
| `src/__tests__/assessmentUtils.test.ts` | **Create** | Unit tests for the three utilities |
| `src/components/assessment/AssessmentHeroNav.tsx` | **Create** | Stat strip + hero header row + tab navigation |
| `src/pages/Assessment.tsx` | **Modify** | Remove inline sidebar, adopt full-width layout, wire AssessmentHeroNav |
| `src/components/assessment/CategoryAssessment.tsx` | **Modify** | New question card: top bar, tiles, context strip, footer |
| `src/components/assessment/SectionNavigation.tsx` | **Keep, no edit** | No longer rendered — do not touch |
| `src/components/assessment/QuestionCard.tsx` | **Keep, no edit** | No longer rendered — do not touch |

---

## Task 1: Pure utility functions + tests

**Files:**
- Create: `src/lib/assessmentUtils.ts`
- Create: `src/__tests__/assessmentUtils.test.ts`

- [ ] **Step 1: Create the utility module**

```ts
// src/lib/assessmentUtils.ts

/**
 * Merges purpose, situationAnalysis, and benefits into a single prose paragraph
 * for display in the "Why this matters" context strip column.
 * Concatenation happens at render time — source data is untouched.
 */
export function mergeWhyThisMatters(
  purpose?: string,
  situationAnalysis?: string,
  benefits?: string
): string {
  return [purpose, situationAnalysis, benefits].filter(Boolean).join(' ');
}

/**
 * Strips trailing "Performance", "& Overall Performance", and similar suffixes
 * from section titles so they fit comfortably in the tab navigation.
 *
 * Examples:
 *   "New Vehicle Sales Performance"              → "New Vehicle Sales"
 *   "Financial Operations & Overall Performance" → "Financial Operations"
 *   "Service Performance"                        → "Service"
 *   "Parts and Inventory Performance"            → "Parts and Inventory"
 */
export function shortenSectionName(title: string): string {
  return title
    .replace(/\s*&\s*Overall\b.*$/, '')   // strip "& Overall ..." first
    .replace(/\s+Performance\s*$/, '')     // then strip trailing "Performance"
    .trim();
}

/**
 * Estimates time remaining in the assessment.
 * Assumes ~30 seconds per unanswered question.
 * Returns a human-readable string e.g. "~12 min" or "< 1 min".
 */
export function estimateTimeRemaining(
  totalQuestions: number,
  answeredQuestions: number
): string {
  const remaining = Math.max(0, totalQuestions - answeredQuestions);
  const seconds = remaining * 30;
  if (seconds < 60) return '< 1 min';
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} min`;
}
```

- [ ] **Step 2: Write the tests**

```ts
// src/__tests__/assessmentUtils.test.ts
import { describe, it, expect } from 'vitest';
import {
  mergeWhyThisMatters,
  shortenSectionName,
  estimateTimeRemaining,
} from '@/lib/assessmentUtils';

describe('mergeWhyThisMatters', () => {
  it('joins all three fields with a space', () => {
    expect(mergeWhyThisMatters('A.', 'B.', 'C.')).toBe('A. B. C.');
  });

  it('skips undefined fields', () => {
    expect(mergeWhyThisMatters('A.', undefined, 'C.')).toBe('A. C.');
  });

  it('skips empty string fields', () => {
    expect(mergeWhyThisMatters('', 'B.', '')).toBe('B.');
  });

  it('returns empty string when all fields are absent', () => {
    expect(mergeWhyThisMatters()).toBe('');
  });
});

describe('shortenSectionName', () => {
  it('strips trailing Performance', () => {
    expect(shortenSectionName('New Vehicle Sales Performance')).toBe('New Vehicle Sales');
  });

  it('strips & Overall Performance', () => {
    expect(
      shortenSectionName('Financial Operations & Overall Performance')
    ).toBe('Financial Operations');
  });

  it('handles Service Performance', () => {
    expect(shortenSectionName('Service Performance')).toBe('Service');
  });

  it('handles Parts and Inventory Performance', () => {
    expect(shortenSectionName('Parts and Inventory Performance')).toBe('Parts and Inventory');
  });

  it('leaves titles without suffix unchanged', () => {
    expect(shortenSectionName('New Vehicle Sales')).toBe('New Vehicle Sales');
  });
});

describe('estimateTimeRemaining', () => {
  it('returns < 1 min when fewer than 2 questions remain', () => {
    expect(estimateTimeRemaining(61, 60)).toBe('< 1 min');
    expect(estimateTimeRemaining(61, 61)).toBe('< 1 min');
  });

  it('rounds up to nearest minute', () => {
    // 3 questions × 30s = 90s → 2 min
    expect(estimateTimeRemaining(61, 58)).toBe('~2 min');
  });

  it('handles all questions remaining', () => {
    // 61 × 30 = 1830s → 31 min
    expect(estimateTimeRemaining(61, 0)).toBe('~31 min');
  });
});
```

- [ ] **Step 3: Run tests — expect all to pass**

```bash
npx vitest run src/__tests__/assessmentUtils.test.ts
```

Expected: 11 tests pass, 0 fail.

- [ ] **Step 4: Commit**

```bash
git add src/lib/assessmentUtils.ts src/__tests__/assessmentUtils.test.ts
git commit -m "feat: add assessment utility functions with tests (Sprint 2)"
```

---

## Task 2: Create AssessmentHeroNav component

**Files:**
- Create: `src/components/assessment/AssessmentHeroNav.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
    <div className="sticky top-12 z-20 mb-4">
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors. Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/components/assessment/AssessmentHeroNav.tsx
git commit -m "feat: add AssessmentHeroNav component - stat strip, hero header, tab nav (Sprint 2)"
```

---

## Task 3: Refactor Assessment.tsx

**Files:**
- Modify: `src/pages/Assessment.tsx`

The goal: remove the inline sidebar and bottom section-nav buttons, import `AssessmentHeroNav`, adopt full-width single-column layout.

- [ ] **Step 1: Add the import at the top of Assessment.tsx**

Find the existing import block and add:

```tsx
import { AssessmentHeroNav } from "@/components/assessment/AssessmentHeroNav";
```

- [ ] **Step 2: Remove unused imports**

Remove from the import line these icons that are only used in the sidebar: `Car`, `BarChart3`, `Package`. Only remove them if they appear nowhere else in the file. Keep `ChevronLeft`, `ChevronRight`, `ArrowLeft`, `Check`, `Loader2`, `AlertCircle`, `Bot`, `Wrench` if still used.

After editing the lucide-react import line should look like:
```tsx
import { ChevronLeft, ChevronRight, ArrowLeft, Check, Loader2, AlertCircle, Bot, Wrench } from "lucide-react";
```

- [ ] **Step 3: Remove getSectionIcon and getSectionColor functions**

Delete these two functions entirely from Assessment.tsx (they served the coloured icon sidebar):

```tsx
// DELETE these two functions:
const getSectionIcon = (sectionTitle: string) => { ... }
const getSectionColor = (index: number) => { ... }
```

- [ ] **Step 4: Replace the render section**

Find the block starting at `return (` and replace everything from the outer page `<div>` wrapper down to and including the closing `</div>` — keeping the completion overlay, but replacing the header, sidebar, and layout.

The new render body (replace everything after the completion overlay):

```tsx
  return (
    <div className="min-h-screen">
      {/* Completion overlay — unchanged */}
      {isCompleting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 shadow-card rounded-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div>
                  <h3 className="text-h5">
                    {completionState === 'saving' && 'Saving Assessment...'}
                    {completionState === 'generating_actions' && 'Generating Action Plan...'}
                    {completionState === 'complete' && 'Complete!'}
                  </h3>
                  <p className="text-body-sm text-muted-foreground mt-1">
                    {completionState === 'saving' && 'Please wait while we save your assessment results.'}
                    {completionState === 'generating_actions' && 'Analysing responses and creating improvement actions.'}
                    {completionState === 'complete' && 'Redirecting to your results...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero nav — sticky, full width */}
      <AssessmentHeroNav
        sections={translatedSections}
        currentSection={currentSection}
        answers={answers}
        onSectionChange={(idx) => !isCompleting && handleNavigateToSection(idx, 0)}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        dealershipName={onboardingContext.dealershipName ?? undefined}
        disabled={isCompleting}
      />

      {/* Page content */}
      <div className="px-6 pb-8">
        {/* Business model suppressed sections banner */}
        {(() => {
          const suppressedCount = getSuppressedSectionCount(questionnaire.sections, businessModel);
          const modelLabel = businessModel?.toUpperCase() ?? '';
          if (suppressedCount === 0 || !businessModel) return null;
          return (
            <div className="mb-4 px-4 py-3 bg-muted border border-border rounded-md text-sm text-muted-foreground">
              {suppressedCount} section{suppressedCount > 1 ? 's are' : ' is'} not shown based on your business model ({modelLabel}). You can update this in{' '}
              <a href="/account" className="underline text-foreground">Settings</a>.
            </div>
          );
        })()}

        {/* Questions — full width, animate on section switch */}
        <div
          key={currentSection}
          className="animate-in fade-in slide-in-from-right-4 duration-200"
        >
          <CategoryAssessment
            section={currentSectionData}
            answers={answers}
            onAnswer={handleAnswer}
            onContinue={nextSection}
            canContinue={canContinue()}
            isLastSection={currentSection === translatedSections.length - 1}
          />
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 5: Remove the currentQuestion state** (was only used by SectionNavigation, now unused)

Find and delete:
```tsx
// DELETE this line:
const [currentQuestion, setCurrentQuestion] = useState(0);
```

Also remove it from `handleNavigateToSection` if referenced:
```tsx
const handleNavigateToSection = (sectionIndex: number, questionIndex: number) => {
  setCurrentSection(sectionIndex);
  // DELETE: setCurrentQuestion(questionIndex);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors. Fix any before continuing.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Assessment.tsx
git commit -m "feat: remove sidebar, add AssessmentHeroNav, full-width layout (Sprint 2)"
```

---

## Task 4: Refactor CategoryAssessment.tsx

**Files:**
- Modify: `src/components/assessment/CategoryAssessment.tsx`

This is the largest change. The existing component keeps its props interface, scroll-to-next logic, notes hook, and auto-save behaviour. What changes: the render output for each question card.

- [ ] **Step 1: Add imports at the top**

Add to the existing import block:

```tsx
import { ExternalLink, Upload } from "lucide-react";
import { mergeWhyThisMatters } from "@/lib/assessmentUtils";
```

Remove from imports: `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` (accordion is gone), `AlertCircle`, `Briefcase`, `Target`, `Search`, `BarChart3` if only used in context accordion.

The final import block should be:

```tsx
import { useState, useEffect, useRef } from "react";
import { MessageSquare, Save, ChevronRight, StickyNote, Check, ExternalLink, Upload } from "lucide-react";
import { Question, Section } from "@/data/questionnaire";
import { useAssessmentNotes } from "@/hooks/useAssessmentNotes";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { mergeWhyThisMatters } from "@/lib/assessmentUtils";
```

- [ ] **Step 2: Remove expandedQuestions state**

The accordion is gone. Delete:
```tsx
// DELETE:
const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
```

And delete the `toggleQuestionExpansion` function entirely.

- [ ] **Step 3: Replace the section header card**

Find the section header `<Card>` (the card showing section title + progress bar at the top of `CategoryAssessment`). Replace it with a simpler header — the hero nav already shows the section title, so we just need a thin progress indicator:

```tsx
{/* Section progress — thin bar + count */}
<div className="flex items-center justify-between mb-4">
  <p className="text-[12px] font-medium text-[#6e7e8a]">
    {answeredQuestions} of {section.questions.length} questions answered
  </p>
  {noteCount > 0 && (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5">
      <StickyNote className="h-3 w-3" />
      {noteCount} {noteCount === 1 ? 'note' : 'notes'}
    </span>
  )}
</div>
```

- [ ] **Step 4: Add expandedNotes state and toggleNote** *(do this BEFORE step 5 to avoid reference errors)*

Add near the top of the `CategoryAssessment` function body:

```tsx
const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

const toggleNote = (questionId: string) => {
  setExpandedNotes(prev => {
    const next = new Set(prev);
    if (next.has(questionId)) next.delete(questionId);
    else next.add(questionId);
    return next;
  });
};
```

- [ ] **Step 5: Replace the question card render**

Find the `{section.questions.map((question, index) => {` block and replace the entire card JSX inside the map. The new question card:

```tsx
{section.questions.map((question, index) => {
  const value = answers[question.id];
  const isNoteOpen = expandedNotes.has(question.id);
  const whyThisMatters = mergeWhyThisMatters(
    question.purpose,
    question.situationAnalysis,
    question.benefits
  );

  return (
    <div
      key={question.id}
      ref={(el) => { questionRefs.current[question.id] = el; }}
      className="bg-white border border-[#d4dde4] rounded-xl overflow-hidden mb-4 opacity-0 animate-fade-in"
      style={{
        animationDelay: `${index * 45}ms`,
        animationFillMode: 'forwards',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.05)',
      }}
    >
      {/* ── Top bar: #D6E3FF background ── */}
      <div
        className="flex items-center justify-between px-5 py-2.5 border-b border-[#c7d4f0]"
        style={{ background: '#D6E3FF' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-[#1D7AFC] text-white text-[11px] font-bold rounded-[5px] px-2 py-1 leading-none flex-shrink-0">
            Q{index + 1}
          </span>
          <span className="text-[12px] font-medium text-[#172d4d]">
            {question.category}
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#94a3b8] tabular-nums">
          Question {index + 1} of {section.questions.length}
        </span>
      </div>

      {/* ── Question body ── */}
      <div className="px-5 pt-5 pb-0">
        {/* Question text */}
        <h3
          className="text-[18px] font-bold text-[#0b1f3a] leading-[1.4] mb-1"
          style={{ letterSpacing: '-0.018em' } as React.CSSProperties}
        >
          {question.text}
        </h3>
        {question.description && (
          <p className="text-[13px] text-[#445166] leading-relaxed mb-4">
            {question.description}
          </p>
        )}

        {/* ── Rating tiles ── */}
        {question.type === 'scale' && question.scale && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            {Array.from({ length: question.scale.max }, (_, i) => {
              const rating = i + 1;
              const isSelected = value === rating;
              const label = question.scale!.labels[i] || '';

              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(question.id, rating)}
                  className="relative min-h-[80px] w-full flex flex-col items-center justify-center rounded-[10px] px-2.5 py-4 text-center transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#1D7AFC] focus-visible:outline-offset-2"
                  style={
                    isSelected
                      ? {
                          border: '1.5px solid #1D7AFC',
                          borderLeft: '4px solid #1D7AFC',
                          background: 'rgba(29,122,252,0.04)',
                          boxShadow: '0 0 0 3px rgba(29,122,252,0.08)',
                        }
                      : {
                          border: '1px solid #d4dde4',
                          background: 'white',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(29,122,252,0.35)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(29,122,252,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#d4dde4';
                      (e.currentTarget as HTMLButtonElement).style.background = 'white';
                    }
                  }}
                >
                  {/* Checkmark — visible only when selected */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1D7AFC] flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                    </span>
                  )}
                  <span
                    className="text-[13px] font-semibold leading-[1.35] break-words"
                    style={{ color: isSelected ? '#0b1f3a' : '#263d57' }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Context strip: Why this matters | Linked KPIs ── */}
      {(whyThisMatters || (question.linkedKPIs && question.linkedKPIs.length > 0)) && (
        <div
          className="grid mt-4 items-start"
          style={{
            background: '#f4f6f8',
            borderTop: '1px solid #e2e8f0',
            gridTemplateColumns: '1fr 1px 1fr',
          }}
        >
          {/* Why this matters */}
          <div className="px-5 py-4">
            <p className="text-[12px] font-semibold text-[#172d4d] mb-1.5">Why this matters</p>
            <p className="text-[12px] text-[#445166] leading-relaxed">
              {whyThisMatters || 'No context available for this question.'}
            </p>
          </div>

          {/* Divider */}
          <div className="bg-[#d4dde4] self-stretch" />

          {/* Linked KPIs */}
          <div className="px-5 py-4">
            <p className="text-[12px] font-semibold text-[#172d4d] mb-1.5">Linked KPIs</p>
            {question.linkedKPIs && question.linkedKPIs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {question.linkedKPIs.map((kpi) => (
                  <a
                    key={kpi}
                    href="/app/kpi-encyclopedia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-[#dbeafe] text-[#1e40af] text-[11px] font-medium rounded px-2 py-1 no-underline hover:bg-[#bfdbfe] transition-colors"
                  >
                    {kpi}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-muted-foreground">No linked KPIs</p>
            )}
          </div>
        </div>
      )}

      {/* ── Footer: two actions ── */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-[#eef0f3] bg-white">
        <button
          type="button"
          onClick={() => toggleNote(question.id)}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6e7e8a] hover:text-[#1D7AFC] transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {hasNotes(question.id) ? 'Edit field coach notes' : 'Add field coach notes'}
        </button>
        <div className="w-px h-3.5 bg-[#e2e8f0]" />
        <button
          type="button"
          onClick={() => {/* file upload — future sprint */}}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6e7e8a] hover:text-[#1D7AFC] transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <Upload className="h-3.5 w-3.5" />
          Attach proof of performance
        </button>
      </div>

      {/* Notes textarea — expands inline when open */}
      {isNoteOpen && (
        <div className="px-5 pb-4 border-t border-[#eef0f3]">
          <div className="flex items-center gap-1.5 py-3">
            <Save className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{t('assessment.autoSaves')}</span>
            {hasNotes(question.id) && (
              <span className="text-[11px] text-[#1D7AFC] font-medium ml-1">{t('assessment.saved')}</span>
            )}
          </div>
          <textarea
            value={notesText[question.id] || ''}
            onChange={(e) => handleNotesChange(question.id, e.target.value)}
            placeholder={t('assessment.placeholder.notes')}
            rows={3}
            maxLength={5000}
            className="w-full bg-white border border-[#d4dde4] rounded-lg text-[13px] text-[#172d4d] px-3 py-2.5 resize-none focus:outline-none focus:border-[#1D7AFC] focus:ring-2 focus:ring-[#1D7AFC]/20"
          />
          <p className="text-[11px] text-muted-foreground text-right mt-1">
            {5000 - (notesText[question.id]?.length ?? 0)} characters remaining
          </p>
        </div>
      )}
    </div>
  );
})}
```

- [ ] **Step 6: Replace the bottom "Save & Continue" card**

The existing bottom card (`bg-primary text-primary-foreground`) stays but should be updated to match the new style:

```tsx
<div className="bg-white border border-[#d4dde4] rounded-xl p-6 mt-4"
  style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.05)' }}>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-[15px] font-semibold text-[#0b1f3a]">
        {answeredQuestions === section.questions.length
          ? t('assessment.sectionComplete')
          : `${answeredQuestions} / ${section.questions.length} ${t('assessment.questionsAnswered')}`}
      </h3>
      <p className="text-[13px] text-[#6e7e8a] mt-0.5">
        {answeredQuestions === section.questions.length
          ? isLastSection
            ? t('assessment.readyToView')
            : t('assessment.continueToNext')
          : t('assessment.pleaseAnswer')}
      </p>
    </div>
    <button
      onClick={onContinue}
      disabled={!canContinue}
      className="inline-flex items-center gap-2 bg-[#1D7AFC] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1a5fb4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLastSection ? t('assessment.viewResults') : t('assessment.saveAndContinue')}
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
</div>
```

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors. Fix any type issues — the most likely error is the `as React.CSSProperties` cast on `fontOpticalSizing`. If needed, add `import type React from 'react'` or use the existing React import.

- [ ] **Step 9: Commit**

```bash
git add src/components/assessment/CategoryAssessment.tsx
git commit -m "feat: refactor question cards - top bar, tiles, context strip, footer (Sprint 2)"
```

---

## Task 5: Run full test suite + dev server verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all existing tests pass, new assessmentUtils tests pass. If coverage check runs, it must meet the 80% threshold.

- [ ] **Step 2: TypeScript full check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:8080/app/assessment` (sign in first if needed). Verify:

- [ ] Hero nav card is visible at top — stat strip (dark navy) + section title + large % + tabs
- [ ] Tabs switch sections — title/description updates, scroll resets to top
- [ ] Active tab name turns blue, complete tab turns green, progress bar fills
- [ ] Question cards span full width (no left sidebar)
- [ ] Q1 badge (blue filled) visible in card top bar with `#D6E3FF` background
- [ ] Tiles: centered text, no "Level X" prefix, selected tile shows left border + tint + checkmark
- [ ] Context strip: `#f4f6f8` background, "Why this matters" + "Linked KPIs" side by side
- [ ] KPI chips are `<a>` links — clicking opens `/app/kpi-encyclopedia` in new tab
- [ ] "Add field coach notes" button expands inline textarea; auto-saves after 2 seconds
- [ ] "Attach proof of performance" button renders but does nothing (no-op)
- [ ] Completing all questions in a section enables "Save & Continue"
- [ ] Final section shows "View Results", completion overlay appears, navigates to `/app/results`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Sprint 2 assessment flow complete - hero nav, question cards, full-width layout"
```

---

## Acceptance Criteria (from spec)

- [ ] `npx tsc --noEmit` — zero errors
- [ ] Left sidebar gone — question cards span full available width
- [ ] Hero nav card sticky at top — stat strip + header + tabs visible
- [ ] Tabs switch active section, scroll to top, section title/description updates
- [ ] Rating tiles: centered text, correct selected state (left border + tint + checkmark)
- [ ] Context strip: `#f4f6f8` background, 2-col layout, merged prose + KPI chips
- [ ] KPI chips open `/app/kpi-encyclopedia` in new tab
- [ ] "Add field coach notes" expands inline textarea with auto-save
- [ ] "Attach proof of performance" renders as no-op placeholder
- [ ] Completion overlay still works — navigate to `/app/results` after save
- [ ] No Lovable-owned files modified
- [ ] No new npm packages installed
