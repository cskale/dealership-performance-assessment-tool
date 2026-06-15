# KPI Questions P2 — Persistence & Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire DataQuestion (KPI) answers into `assessment_kpi_values`, and make completion/progress logic ignore KPI questions so assessments complete with zero KPI rows.

**Architecture:** New pure module `kpiAnswerPersistence.ts` builds upsert rows from in-memory `kpiAnswers` state. New completion/progress helpers in `assessmentUtils.ts` filter `section.questions` down to `ScoredQuestion`s via `isDataQuestion`. `Assessment.tsx` gains `kpiAnswers` state, a `handleKpiAnswer` handler, and autosaves KPI rows alongside scale answers. `CategoryAssessment.tsx` gets a minimal number-input + skip-checkbox UI for `DataQuestion`s and fixed progress counts. `AssessmentHeroNav.tsx` switches to the shared helpers.

**Tech Stack:** React 18 + TypeScript, Supabase (`assessment_kpi_values` table), Vitest.

---

### Task 1: Regenerate Supabase types for `assessment_kpi_values`

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Regenerate types via Supabase MCP**

Call `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id: "xrypgosuyfdkkqafftae"`. Write the full returned output to `src/integrations/supabase/types.ts`, overwriting the file.

- [ ] **Step 2: Verify `assessment_kpi_values` is present**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -50` (or just grep the file)

Expected: `src/integrations/supabase/types.ts` contains a `assessment_kpi_values: { Row: {...}; Insert: {...}; Update: {...} }` entry with columns `id, assessment_id, dealership_id, question_id, kpi_key, value, unit, currency_code, reference_period, skipped, created_at, updated_at`.

- [ ] **Step 3: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate Supabase types for assessment_kpi_values — kpi-questions-p2"
```

---

### Task 2: `kpiAnswerPersistence.ts` — build upsert rows from KPI answer state

**Files:**
- Create: `src/lib/kpiAnswerPersistence.ts`
- Test: `src/__tests__/kpiAnswerPersistence.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/kpiAnswerPersistence.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildKpiValueRows, type KpiAnswerState } from '@/lib/kpiAnswerPersistence';
import type { DataQuestion } from '@/data/questionnaire';

const currencyQuestion: DataQuestion = {
  id: 'nvs-kpi-4',
  kind: 'data',
  text: 'gross profit per unit',
  category: 'performance_data',
  type: 'currency',
  kpiKey: 'nvs_gross_profit_per_unit',
  unit: 'EUR',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

const percentageQuestion: DataQuestion = {
  id: 'nvs-kpi-7',
  kind: 'data',
  text: 'lead response within 1 hour',
  category: 'performance_data',
  type: 'percentage',
  kpiKey: 'nvs_lead_response_1h_pct',
  unit: '%',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

const numericQuestion: DataQuestion = {
  id: 'uvs-kpi-2',
  kind: 'data',
  text: 'days to sale',
  category: 'performance_data',
  type: 'numeric',
  kpiKey: 'uvs_days_to_sale',
  unit: 'days',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

const dataQuestions: DataQuestion[] = [currencyQuestion, percentageQuestion, numericQuestion];

describe('buildKpiValueRows', () => {
  it('builds a row with value set and currency_code EUR for a provided currency answer', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      nvs_gross_profit_per_unit: { value: 1200, skipped: false },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toEqual([
      {
        assessment_id: 'assessment-1',
        dealership_id: 'dealership-1',
        question_id: 'nvs-kpi-4',
        kpi_key: 'nvs_gross_profit_per_unit',
        value: 1200,
        unit: 'EUR',
        currency_code: 'EUR',
        reference_period: 'last_calendar_month',
        skipped: false,
      },
    ]);
  });

  it('builds a row with value null and currency_code null for a skipped non-currency answer', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      nvs_lead_response_1h_pct: { value: null, skipped: true },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toEqual([
      {
        assessment_id: 'assessment-1',
        dealership_id: 'dealership-1',
        question_id: 'nvs-kpi-7',
        kpi_key: 'nvs_lead_response_1h_pct',
        value: null,
        unit: '%',
        currency_code: null,
        reference_period: 'last_calendar_month',
        skipped: true,
      },
    ]);
  });

  it('produces no row for a question never present in kpiAnswers', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      uvs_days_to_sale: { value: 45, skipped: false },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toHaveLength(1);
    expect(rows[0].kpi_key).toBe('uvs_days_to_sale');
  });

  it('produces no row for an entry that is neither skipped nor has a value', () => {
    const kpiAnswers: Record<string, KpiAnswerState> = {
      uvs_days_to_sale: { value: null, skipped: false },
    };

    const rows = buildKpiValueRows('assessment-1', 'dealership-1', dataQuestions, kpiAnswers);

    expect(rows).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/kpiAnswerPersistence.test.ts`
Expected: FAIL — `Cannot find module '@/lib/kpiAnswerPersistence'`

- [ ] **Step 3: Write the implementation**

Create `src/lib/kpiAnswerPersistence.ts`:

```ts
import type { DataQuestion } from '@/data/questionnaire';

export interface KpiAnswerState {
  value: number | null;
  skipped: boolean;
}

export interface KpiValueRow {
  assessment_id: string;
  dealership_id: string;
  question_id: string;
  kpi_key: string;
  value: number | null;
  unit: string;
  currency_code: string | null;
  reference_period: string;
  skipped: boolean;
}

/**
 * Builds upsert rows for assessment_kpi_values from in-memory KPI answer state.
 * - Never shown / untouched (no entry in kpiAnswers) -> no row.
 * - Touched but neither skipped nor given a value -> no row (avoids violating
 *   the table's CHECK constraint on partial input).
 * - Skipped -> value null, skipped true.
 * - Provided -> value set, skipped false.
 */
export function buildKpiValueRows(
  assessmentId: string,
  dealershipId: string,
  dataQuestions: DataQuestion[],
  kpiAnswers: Record<string, KpiAnswerState>
): KpiValueRow[] {
  const rows: KpiValueRow[] = [];

  for (const q of dataQuestions) {
    const answer = kpiAnswers[q.kpiKey];
    if (!answer) continue;
    if (!answer.skipped && answer.value === null) continue;

    rows.push({
      assessment_id: assessmentId,
      dealership_id: dealershipId,
      question_id: q.id,
      kpi_key: q.kpiKey,
      value: answer.skipped ? null : answer.value,
      unit: q.unit,
      // TODO: read currency from org/locale settings once available — hardcoded EUR for now
      currency_code: q.type === 'currency' ? 'EUR' : null,
      reference_period: q.referencePeriod,
      skipped: answer.skipped,
    });
  }

  return rows;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/kpiAnswerPersistence.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/kpiAnswerPersistence.ts src/__tests__/kpiAnswerPersistence.test.ts
git commit -m "feat: add buildKpiValueRows for assessment_kpi_values persistence — kpi-questions-p2"
```

---

### Task 3: Completion & progress helpers in `assessmentUtils.ts`

**Files:**
- Modify: `src/lib/assessmentUtils.ts`
- Test: `src/__tests__/assessmentCompletion.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/assessmentCompletion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import { getScoredQuestions } from '@/lib/scoringEngine';
import {
  getScoredQuestionCount,
  getAnsweredScoredCount,
  isSectionComplete,
  getSectionProgress,
  isAssessmentComplete,
} from '@/lib/assessmentUtils';

function buildFullScoredAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const section of questionnaire.sections) {
    for (const q of getScoredQuestions(section.questions)) {
      answers[q.id] = 3;
    }
  }
  return answers;
}

describe('assessment completion helpers', () => {
  it('getScoredQuestionCount excludes data questions', () => {
    const section = questionnaire.sections.find(s => s.id === 'new-vehicle-sales')!;
    const dataCount = section.questions.filter(q => q.kind === 'data').length;
    expect(getScoredQuestionCount(section)).toBe(section.questions.length - dataCount);
  });

  it('an assessment with all scored questions answered and zero KPI answers is complete', () => {
    const answers = buildFullScoredAnswers();
    expect(isAssessmentComplete(questionnaire.sections, answers)).toBe(true);
  });

  it('a section is incomplete if any scored question is missing, regardless of KPI questions', () => {
    const answers = buildFullScoredAnswers();
    const firstSection = questionnaire.sections[0];
    const firstScored = getScoredQuestions(firstSection.questions)[0];
    delete answers[firstScored.id];

    expect(isSectionComplete(firstSection, answers)).toBe(false);
    expect(isAssessmentComplete(questionnaire.sections, answers)).toBe(false);
  });

  it('getAnsweredScoredCount and getSectionProgress ignore data questions', () => {
    const section = questionnaire.sections.find(s => s.id === 'new-vehicle-sales')!;
    const scored = getScoredQuestions(section.questions);
    const answers: Record<string, number> = {};
    answers[scored[0].id] = 5;

    expect(getAnsweredScoredCount(section, answers)).toBe(1);
    expect(getSectionProgress(section, answers)).toBe(Math.round((1 / scored.length) * 100));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/assessmentCompletion.test.ts`
Expected: FAIL — `getScoredQuestionCount is not exported` (or similar)

- [ ] **Step 3: Write the implementation**

Add to `src/lib/assessmentUtils.ts` (append at end of file, after `estimateTimeRemaining`):

```ts

import { Section, isDataQuestion } from '@/data/questionnaire';

/**
 * Number of scored (non-KPI) questions in a section.
 * DataQuestions are excluded — they have no weight and are optional.
 */
export function getScoredQuestionCount(section: Section): number {
  return section.questions.filter(q => !isDataQuestion(q)).length;
}

/**
 * Number of scored questions in a section that have a recorded answer.
 */
export function getAnsweredScoredCount(
  section: Section,
  answers: Record<string, number>
): number {
  return section.questions.filter(q => !isDataQuestion(q) && answers[q.id] !== undefined).length;
}

/**
 * A section is complete once every scored (non-KPI) question is answered.
 * DataQuestions never block completion.
 */
export function isSectionComplete(section: Section, answers: Record<string, number>): boolean {
  return section.questions.every(q => isDataQuestion(q) || answers[q.id] !== undefined);
}

/**
 * Percentage (0-100) of scored questions in a section that are answered.
 */
export function getSectionProgress(section: Section, answers: Record<string, number>): number {
  const total = getScoredQuestionCount(section);
  if (total === 0) return 0;
  return Math.round((getAnsweredScoredCount(section, answers) / total) * 100);
}

/**
 * An assessment is complete once every scored question across all sections is answered.
 */
export function isAssessmentComplete(sections: Section[], answers: Record<string, number>): boolean {
  return sections.every(section => isSectionComplete(section, answers));
}
```

Move the new `import { Section, isDataQuestion } from '@/data/questionnaire';` line to the top of the file (above the existing JSDoc comment for `mergeWhyThisMatters`), since the file currently has no imports.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/assessmentCompletion.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/assessmentUtils.ts src/__tests__/assessmentCompletion.test.ts
git commit -m "feat: add scored-only completion and progress helpers — kpi-questions-p2"
```

---

### Task 4: Fix `TOTAL_QUESTIONS` to count scored questions only

**Files:**
- Modify: `src/lib/constants.ts:1-16`

- [ ] **Step 1: Update the import and the calculation**

In `src/lib/constants.ts`, change:

```ts
import { questionnaire } from "@/data/questionnaire";
import { getMaturityLevel as _getMaturityKey, MATURITY_LEVELS as MATURITY_CONFIG } from "@/lib/maturityConfig";

/**
 * Total number of questions in the assessment
 * Dynamically calculated from the questionnaire schema
 */
export const TOTAL_QUESTIONS = questionnaire.sections.reduce(
  (total, section) => total + section.questions.length,
  0
);
```

to:

```ts
import { questionnaire } from "@/data/questionnaire";
import { getMaturityLevel as _getMaturityKey, MATURITY_LEVELS as MATURITY_CONFIG } from "@/lib/maturityConfig";
import { getScoredQuestions } from "@/lib/scoringEngine";

/**
 * Total number of scored questions in the assessment.
 * DataQuestions (KPI questions) are excluded — they are optional and
 * never appear in `answers`, so they must not be in this denominator.
 */
export const TOTAL_QUESTIONS = questionnaire.sections.reduce(
  (total, section) => total + getScoredQuestions(section.questions).length,
  0
);
```

- [ ] **Step 2: Verify no circular import**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (same as before — confirms `scoringEngine` import into `constants.ts` doesn't break module resolution)

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts
git commit -m "fix: exclude KPI questions from TOTAL_QUESTIONS — kpi-questions-p2"
```

---

### Task 5: `AssessmentHeroNav.tsx` — use shared completion helpers

**Files:**
- Modify: `src/components/assessment/AssessmentHeroNav.tsx:1-44`

- [ ] **Step 1: Replace local progress helpers with shared imports**

In `src/components/assessment/AssessmentHeroNav.tsx`, change line 3 from:

```ts
import { shortenSectionName, estimateTimeRemaining } from '@/lib/assessmentUtils';
```

to:

```ts
import { shortenSectionName, estimateTimeRemaining, getSectionProgress, isSectionComplete } from '@/lib/assessmentUtils';
```

Then delete the local definitions at lines 35-43:

```ts
  const getSectionProgress = (section: Section) => {
    const answered = section.questions.filter(q => answers[q.id] !== undefined).length;
    return section.questions.length > 0
      ? Math.round((answered / section.questions.length) * 100)
      : 0;
  };

  const isSectionComplete = (section: Section) =>
    section.questions.every(q => answers[q.id] !== undefined);

```

- [ ] **Step 2: Update call sites to pass `answers`**

In the tab navigation loop (around line 122-124), change:

```ts
            const pct = getSectionProgress(section);
            const complete = isSectionComplete(section);
```

to:

```ts
            const pct = getSectionProgress(section, answers);
            const complete = isSectionComplete(section, answers);
```

- [ ] **Step 3: Run the test suite to confirm nothing else uses the removed locals**

Run: `npx vitest run`
Expected: PASS (full suite green — these are UI-only changes with no dedicated component test)

- [ ] **Step 4: Commit**

```bash
git add src/components/assessment/AssessmentHeroNav.tsx
git commit -m "refactor: AssessmentHeroNav uses shared scored-only progress helpers — kpi-questions-p2"
```

---

### Task 6: i18n keys for the KPI input UI

**Files:**
- Modify: `src/contexts/LanguageContext.tsx:54` (EN), `src/contexts/LanguageContext.tsx:456` (DE)

- [ ] **Step 1: Add EN keys**

In `src/contexts/LanguageContext.tsx`, after line 54 (`'assessment.saveAndContinue': 'Save & Continue',`), insert:

```ts
    'assessment.dontHaveFigure': "I don't have this figure",
    'assessment.kpiInputPlaceholder': 'Enter value',
```

- [ ] **Step 2: Add DE keys**

After line 456 (`'assessment.saveAndContinue': 'Speichern & Weiter',`), insert:

```ts
    'assessment.dontHaveFigure': 'Mir liegt diese Kennzahl nicht vor',
    'assessment.kpiInputPlaceholder': 'Wert eingeben',
```

- [ ] **Step 3: Commit**

```bash
git add src/contexts/LanguageContext.tsx
git commit -m "feat: add i18n keys for KPI input UI — kpi-questions-p2"
```

---

### Task 7: `CategoryAssessment.tsx` — fix progress counts and add minimal KPI input UI

**Files:**
- Modify: `src/components/assessment/CategoryAssessment.tsx`

- [ ] **Step 1: Update imports**

Change line 3 from:

```ts
import { Question, Section, isScoredQuestion } from "@/data/questionnaire";
```

to:

```ts
import { Question, Section, isScoredQuestion, isDataQuestion } from "@/data/questionnaire";
```

Change line 7 from:

```ts
import { mergeWhyThisMatters } from "@/lib/assessmentUtils";
```

to:

```ts
import { mergeWhyThisMatters, getScoredQuestionCount, getAnsweredScoredCount } from "@/lib/assessmentUtils";
import type { KpiAnswerState } from "@/lib/kpiAnswerPersistence";
```

- [ ] **Step 2: Add new props**

Change the props interface (lines 9-16) from:

```ts
interface CategoryAssessmentProps {
  section: Section;
  answers: Record<string, number>;
  onAnswer: (questionId: string, value: number) => void;
  onContinue: () => void;
  canContinue: boolean;
  isLastSection: boolean;
}
```

to:

```ts
interface CategoryAssessmentProps {
  section: Section;
  answers: Record<string, number>;
  onAnswer: (questionId: string, value: number) => void;
  kpiAnswers: Record<string, KpiAnswerState>;
  onKpiAnswer: (kpiKey: string, value: number | null, skipped: boolean) => void;
  onContinue: () => void;
  canContinue: boolean;
  isLastSection: boolean;
}
```

And the destructured params (lines 18-25) from:

```ts
export function CategoryAssessment({
  section,
  answers,
  onAnswer,
  onContinue,
  canContinue,
  isLastSection
}: CategoryAssessmentProps) {
```

to:

```ts
export function CategoryAssessment({
  section,
  answers,
  onAnswer,
  kpiAnswers,
  onKpiAnswer,
  onContinue,
  canContinue,
  isLastSection
}: CategoryAssessmentProps) {
```

- [ ] **Step 3: Replace the progress counts**

Change line 54 from:

```ts
  const answeredQuestions = section.questions.filter(q => answers[q.id] !== undefined).length;
```

to:

```ts
  const scoredCount = getScoredQuestionCount(section);
  const answeredQuestions = getAnsweredScoredCount(section, answers);
```

- [ ] **Step 4: Fix the "next unanswered question" scroll logic to skip DataQuestions**

Change the two search loops inside `handleRatingClick` (lines 65-79) from:

```ts
    // First, look for the next unanswered question after the current one
    for (let i = currentIndex + 1; i < section.questions.length; i++) {
      if (answers[section.questions[i].id] === undefined) {
        nextQuestion = section.questions[i];
        break;
      }
    }

    // If no unanswered question found after current, check from the beginning
    if (!nextQuestion) {
      for (let i = 0; i < currentIndex; i++) {
        if (answers[section.questions[i].id] === undefined) {
          nextQuestion = section.questions[i];
          break;
        }
      }
    }
```

to:

```ts
    // First, look for the next unanswered scored question after the current one
    for (let i = currentIndex + 1; i < section.questions.length; i++) {
      const candidate = section.questions[i];
      if (isScoredQuestion(candidate) && answers[candidate.id] === undefined) {
        nextQuestion = candidate;
        break;
      }
    }

    // If no unanswered scored question found after current, check from the beginning
    if (!nextQuestion) {
      for (let i = 0; i < currentIndex; i++) {
        const candidate = section.questions[i];
        if (isScoredQuestion(candidate) && answers[candidate.id] === undefined) {
          nextQuestion = candidate;
          break;
        }
      }
    }
```

- [ ] **Step 5: Update the header progress text**

Change line 125 from:

```tsx
          {answeredQuestions} of {section.questions.length} questions answered
```

to:

```tsx
          {answeredQuestions} of {scoredCount} questions answered
```

- [ ] **Step 6: Add the KPI input UI block**

Immediately after the closing `})()}` of the rating-tiles block (currently line 246, right before the closing `</div>` of the question body at line 247), insert a new block for `DataQuestion`s:

```tsx
                {isDataQuestion(question) && (() => {
                  const kpiAnswer = kpiAnswers[question.kpiKey] ?? { value: null, skipped: false };
                  const unitLabel = question.type === 'currency' ? '€' : question.unit;

                  return (
                    <div className="mt-4 mb-2">
                      <div className="flex items-center gap-2 max-w-[240px]">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          value={kpiAnswer.value ?? ''}
                          disabled={kpiAnswer.skipped}
                          onChange={(e) => {
                            const raw = e.target.value;
                            onKpiAnswer(question.kpiKey, raw === '' ? null : Number(raw), false);
                          }}
                          placeholder={t('assessment.kpiInputPlaceholder')}
                          className="w-full rounded-lg border border-[#d4dde4] px-3 py-2 text-[14px] text-[#0b1f3a] focus:outline-none focus:border-[#1D7AFC] focus:ring-2 focus:ring-[#1D7AFC]/20 disabled:bg-[#f4f6f8] disabled:text-[#94a3b8]"
                        />
                        <span className="text-[13px] font-medium text-[#6e7e8a] whitespace-nowrap">
                          {unitLabel}
                        </span>
                      </div>
                      <label className="mt-2 inline-flex items-center gap-2 text-[12px] text-[#6e7e8a] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={kpiAnswer.skipped}
                          onChange={(e) => onKpiAnswer(question.kpiKey, null, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-[#d4dde4]"
                        />
                        {t('assessment.dontHaveFigure')}
                      </label>
                    </div>
                  );
                })()}
```

- [ ] **Step 7: Update the footer completion checks**

Change lines 339-348 from:

```tsx
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
```

to:

```tsx
            <h3 className="text-[15px] font-semibold text-[#0b1f3a]">
              {answeredQuestions === scoredCount
                ? t('assessment.sectionComplete')
                : `${answeredQuestions} / ${scoredCount} ${t('assessment.questionsAnswered')}`}
            </h3>
            <p className="text-[13px] text-[#6e7e8a] mt-0.5">
              {answeredQuestions === scoredCount
                ? isLastSection
                  ? t('assessment.readyToView')
                  : t('assessment.continueToNext')
                : t('assessment.pleaseAnswer')}
            </p>
```

- [ ] **Step 8: Run full suite and build**

Run: `npx vitest run`
Expected: PASS (full suite green)

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no type errors

- [ ] **Step 9: Commit**

```bash
git add src/components/assessment/CategoryAssessment.tsx
git commit -m "feat: add minimal KPI input UI and fix scored-only progress counts — kpi-questions-p2"
```

---

### Task 8: `saveKpiAnswers` in `useAssessmentData.ts`

**Files:**
- Modify: `src/hooks/useAssessmentData.ts`
- Test: `src/__tests__/saveKpiAnswers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/saveKpiAnswers.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

const mockFrom = vi.hoisted(() => vi.fn());
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mockFrom } }));
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));

import { renderHook } from '@testing-library/react';
import { useAssessmentData } from '@/hooks/useAssessmentData';
import type { DataQuestion } from '@/data/questionnaire';

const numericQuestion: DataQuestion = {
  id: 'uvs-kpi-2',
  kind: 'data',
  text: 'days to sale',
  category: 'performance_data',
  type: 'numeric',
  kpiKey: 'uvs_days_to_sale',
  unit: 'days',
  referencePeriod: 'last_calendar_month',
  subSection: 'performance_data',
};

function makeUpsertChain() {
  const chain = {
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return chain;
}

describe('saveKpiAnswers', () => {
  it('upserts rows keyed on assessment_id + kpi_key', async () => {
    const chain = makeUpsertChain();
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useAssessmentData());

    await result.current.saveKpiAnswers(
      'assessment-1',
      'dealership-1',
      [numericQuestion],
      { uvs_days_to_sale: { value: 45, skipped: false } }
    );

    expect(mockFrom).toHaveBeenCalledWith('assessment_kpi_values');
    expect(chain.upsert).toHaveBeenCalledWith(
      [
        {
          assessment_id: 'assessment-1',
          dealership_id: 'dealership-1',
          question_id: 'uvs-kpi-2',
          kpi_key: 'uvs_days_to_sale',
          value: 45,
          unit: 'days',
          currency_code: null,
          reference_period: 'last_calendar_month',
          skipped: false,
        },
      ],
      { onConflict: 'assessment_id,kpi_key' }
    );
  });

  it('does not call supabase when there are no rows to write', async () => {
    const chain = makeUpsertChain();
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useAssessmentData());

    await result.current.saveKpiAnswers('assessment-1', 'dealership-1', [numericQuestion], {});

    expect(chain.upsert).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/saveKpiAnswers.test.ts`
Expected: FAIL — `result.current.saveKpiAnswers is not a function`

- [ ] **Step 3: Implement `saveKpiAnswers`**

In `src/hooks/useAssessmentData.ts`, add to the imports at the top (line 3), changing:

```ts
import { DealershipInfo, AssessmentData, BenchmarkData, ImprovementAction } from '@/types/dealership';
```

to:

```ts
import { DealershipInfo, AssessmentData, BenchmarkData, ImprovementAction } from '@/types/dealership';
import type { DataQuestion } from '@/data/questionnaire';
import { buildKpiValueRows, type KpiAnswerState } from '@/lib/kpiAnswerPersistence';
```

Then add a new callback after `saveAssessment` (after the closing `}, [assessment, user, getSessionId, validateAssessmentContext]);` on line 321):

```ts

  /**
   * Upsert KPI (DataQuestion) answers into assessment_kpi_values, keyed on
   * (assessment_id, kpi_key). No-op if there are no rows to write.
   */
  const saveKpiAnswers = useCallback(async (
    assessmentId: string,
    dealershipId: string,
    dataQuestions: DataQuestion[],
    kpiAnswers: Record<string, KpiAnswerState>
  ): Promise<void> => {
    const rows = buildKpiValueRows(assessmentId, dealershipId, dataQuestions, kpiAnswers);
    if (rows.length === 0) return;

    const { error } = await supabase
      .from('assessment_kpi_values')
      .upsert(rows, { onConflict: 'assessment_id,kpi_key' });

    if (error) throw error;
  }, []);
```

Finally, add `saveKpiAnswers` to the returned object (around line 483, after `saveAssessment,`):

```ts
    saveAssessment,
    saveKpiAnswers,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/saveKpiAnswers.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAssessmentData.ts src/__tests__/saveKpiAnswers.test.ts
git commit -m "feat: add saveKpiAnswers upsert to useAssessmentData — kpi-questions-p2"
```

---

### Task 9: Wire `kpiAnswers` state into `Assessment.tsx`

**Files:**
- Modify: `src/pages/Assessment.tsx`

- [ ] **Step 1: Update imports**

Change line 8 from:

```ts
import { questionnaire, getTranslatedSection } from "@/data/questionnaire";
```

to:

```ts
import { questionnaire, getTranslatedSection, isDataQuestion } from "@/data/questionnaire";
```

Change line 10 from:

```ts
import { calculateAllSectionScores, calculateWeightedScore } from "@/lib/scoringEngine";
```

to:

```ts
import { calculateAllSectionScores, calculateWeightedScore, getScoredQuestions } from "@/lib/scoringEngine";
```

Add a new import after line 15 (`import { getActiveSections, getSuppressedSectionCount } from "@/lib/moduleGating";`):

```ts
import type { KpiAnswerState } from "@/lib/kpiAnswerPersistence";
```

- [ ] **Step 2: Add `kpiAnswers` state and `allDataQuestions`**

Change line 22 from:

```ts
  const [answers, setAnswers] = useState<Record<string, number>>({});
```

to:

```ts
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [kpiAnswers, setKpiAnswers] = useState<Record<string, KpiAnswerState>>({});
```

Change the `useAssessmentData()` destructure (lines 28-32) from:

```ts
  const {
    assessment,
    saveAssessment,
    loadAssessment,
  } = useAssessmentData();
```

to:

```ts
  const {
    assessment,
    saveAssessment,
    saveKpiAnswers,
    loadAssessment,
  } = useAssessmentData();
```

After the `translatedSections` memo (lines 47-49), add a new memo:

```ts
  const allDataQuestions = useMemo(() => {
    return translatedSections.flatMap(section => section.questions.filter(isDataQuestion));
  }, [translatedSections]);
```

- [ ] **Step 3: Fix `totalQuestions` to count scored questions only**

Change line 51 from:

```ts
  const totalQuestions = translatedSections.reduce((sum, section) => sum + section.questions.length, 0);
```

to:

```ts
  const totalQuestions = translatedSections.reduce((sum, section) => sum + getScoredQuestions(section.questions).length, 0);
```

- [ ] **Step 4: Fix `canContinue` to ignore DataQuestions**

Change lines 103-106 from:

```ts
  const canContinue = () => {
    const sectionQuestions = currentSectionData.questions;
    return sectionQuestions.every(q => answers[q.id] !== undefined);
  };
```

to:

```ts
  const canContinue = () => {
    return getScoredQuestions(currentSectionData.questions).every(q => answers[q.id] !== undefined);
  };
```

- [ ] **Step 5: Add `handleKpiAnswer` and persist KPI answers from `handleAnswer`**

Change `handleAnswer` (lines 61-92) from:

```ts
  const handleAnswer = async (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Calculate real-time scores
    const newScores = calculateScores(newAnswers);

    // Auto-save to local storage (in-progress, non-blocking)
    try {
      const overallScore = Object.values(newScores).length > 0 
        ? calculateWeightedScore(newScores)
        : 0;
        
      await saveAssessment({
        answers: newAnswers,
        scores: newScores,
        overallScore,
        status: 'in_progress' as const
      });
    } catch (error) {
      // Don't show error for in-progress saves - just log
      if (import.meta.env.DEV) {
        console.warn('Failed to auto-save assessment:', error);
      }
    }
    
    toast({
      title: t('assessment.answerSaved'),
      description: t('assessment.responseRecorded'),
      duration: 1000,
    });
  };
```

to:

```ts
  const handleAnswer = async (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Calculate real-time scores
    const newScores = calculateScores(newAnswers);

    // Auto-save to local storage (in-progress, non-blocking)
    try {
      const overallScore = Object.values(newScores).length > 0 
        ? calculateWeightedScore(newScores)
        : 0;
        
      const saved = await saveAssessment({
        answers: newAnswers,
        scores: newScores,
        overallScore,
        status: 'in_progress' as const
      });

      // Persist KPI answers in the same autosave cadence as scale answers
      if (Object.keys(kpiAnswers).length > 0 && saved.dealershipId) {
        const assessmentId = saved.dbId || saved.id;
        if (assessmentId) {
          await saveKpiAnswers(assessmentId, saved.dealershipId, allDataQuestions, kpiAnswers);
        }
      }
    } catch (error) {
      // Don't show error for in-progress saves - just log
      if (import.meta.env.DEV) {
        console.warn('Failed to auto-save assessment:', error);
      }
    }
    
    toast({
      title: t('assessment.answerSaved'),
      description: t('assessment.responseRecorded'),
      duration: 1000,
    });
  };

  const handleKpiAnswer = async (kpiKey: string, value: number | null, skipped: boolean) => {
    const newKpiAnswers = { ...kpiAnswers, [kpiKey]: { value, skipped } };
    setKpiAnswers(newKpiAnswers);

    try {
      const newScores = calculateScores(answers);
      const overallScore = Object.values(newScores).length > 0
        ? calculateWeightedScore(newScores)
        : 0;

      const saved = await saveAssessment({
        answers,
        scores: newScores,
        overallScore,
        status: 'in_progress' as const
      });

      if (saved.dealershipId) {
        const assessmentId = saved.dbId || saved.id;
        if (assessmentId) {
          await saveKpiAnswers(assessmentId, saved.dealershipId, allDataQuestions, newKpiAnswers);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to auto-save KPI answer:', error);
      }
    }
  };
```

- [ ] **Step 6: Fix `handleFinishAssessment` question counts and persist KPI answers on completion**

Change lines 152-154 from:

```ts
      // Check if all questions are answered
      const totalQs = translatedSections.reduce((total, section) => total + section.questions.length, 0);
      const answeredQs = Object.keys(answers).length;
```

to:

```ts
      // Check if all scored questions are answered (DataQuestions are optional)
      const totalQs = translatedSections.reduce((total, section) => total + getScoredQuestions(section.questions).length, 0);
      const answeredQs = Object.keys(answers).length;
```

Then, after the DEV log block (lines 183-185):

```ts
      if (import.meta.env.DEV) {
        console.log('[Assessment] Saved with DB ID:', realAssessmentId);
      }
```

insert a new block to persist KPI answers:

```ts

      // Persist any KPI answers alongside the completed assessment
      if (Object.keys(kpiAnswers).length > 0 && savedAssessment.dealershipId) {
        try {
          await saveKpiAnswers(realAssessmentId, savedAssessment.dealershipId, allDataQuestions, kpiAnswers);
        } catch (kpiError) {
          console.warn('[Assessment] Failed to save KPI answers:', kpiError);
        }
      }
```

- [ ] **Step 7: Pass new props to `CategoryAssessment`**

Change the `<CategoryAssessment>` usage (lines 347-354) from:

```tsx
          <CategoryAssessment
            section={currentSectionData}
            answers={answers}
            onAnswer={handleAnswer}
            onContinue={nextSection}
            canContinue={canContinue()}
            isLastSection={currentSection === translatedSections.length - 1}
          />
```

to:

```tsx
          <CategoryAssessment
            section={currentSectionData}
            answers={answers}
            onAnswer={handleAnswer}
            kpiAnswers={kpiAnswers}
            onKpiAnswer={handleKpiAnswer}
            onContinue={nextSection}
            canContinue={canContinue()}
            isLastSection={currentSection === translatedSections.length - 1}
          />
```

- [ ] **Step 8: Run full suite and build**

Run: `npx vitest run`
Expected: PASS (full suite green)

Run: `npm run build`
Expected: build succeeds with no errors

- [ ] **Step 9: Commit**

```bash
git add src/pages/Assessment.tsx
git commit -m "feat: wire kpiAnswers state and fix completion logic in Assessment page — kpi-questions-p2"
```

---

### Task 10: Final verification and push

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all test files PASS, including `scoringBaseline.test.ts`, `questionnaireIntegrity.test.ts`, `kpiAnswerPersistence.test.ts`, `assessmentCompletion.test.ts`, `saveKpiAnswers.test.ts`

- [ ] **Step 2: Run lint and build**

Run: `npm run lint`
Expected: no new errors

Run: `npm run build`
Expected: production build succeeds

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage:**
- STEP 1 (persistence): Task 2 (`buildKpiValueRows`), Task 8 (`saveKpiAnswers` upsert on `(assessment_id, kpi_key)`), Task 9 (autosave cadence in `handleAnswer`/`handleKpiAnswer`/`handleFinishAssessment`). Currency `'EUR'` with TODO comment: Task 2. `reference_period` from question: Task 2.
- STEP 2 (completion): Task 3 (helpers), Task 4 (`TOTAL_QUESTIONS`), Task 5 (`AssessmentHeroNav`), Task 7 (`CategoryAssessment` counts), Task 9 (`canContinue`/`handleFinishAssessment` counts).
- STEP 3 (tests): Task 2 (KPI row tests incl. skip/provide/no-row), Task 3 (0-KPI-answers reaches "complete" via `isAssessmentComplete`), Task 8 (upsert keyed on `assessment_id, kpi_key` — "resubmit updates not duplicates" demonstrated via `onConflict`), Task 4 confirms `scoringBaseline` stays green.
- Minimal KPI input UI (user-selected scope): Task 6 (i18n), Task 7 (number input + unit + skip checkbox).

**Placeholder scan:** none — every step has complete code.

**Type consistency:** `KpiAnswerState` defined once in `kpiAnswerPersistence.ts`, imported in `useAssessmentData.ts`, `CategoryAssessment.tsx`, and `Assessment.tsx`. `buildKpiValueRows(assessmentId, dealershipId, dataQuestions, kpiAnswers)` signature consistent across Task 2 and Task 8. `onKpiAnswer(kpiKey, value, skipped)` signature consistent across Task 7 and Task 9.
