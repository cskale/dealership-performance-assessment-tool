# Question Discriminated Union (kpi-questions-p0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `Question` (src/data/questionnaire.ts) into a discriminated union (`ScoredQuestion` | `DataQuestion`) with zero behaviour change, eliminate the `weight || 1` fallback hazard, and add a Zod runtime schema for future KPI question ingestion.

**Architecture:** Add `BaseQuestion`/`ScoredQuestion`/`DataQuestion`/`Question` types + `isScoredQuestion`/`isDataQuestion` guards to `questionnaire.ts`. Codemod all 61 existing questions to `kind: "scored"`. Add a `getScoredQuestions` gateway in `scoringEngine.ts` used everywhere `.weight` is read. Add a Zod schema in `src/lib/questionSchema.ts`. A frozen baseline test (`scoringBaseline.test.ts`), written FIRST against the untouched code, is the zero-behaviour-change acceptance gate.

**Tech Stack:** React 18 + TypeScript + Vite, Vitest, Zod (already a dependency, `^3.23.8`).

---

## IMPORTANT: Single-Commit Constraint

This plan deliberately **deviates from the usual "commit per task" pattern**. Per the approved design spec (`docs/superpowers/specs/2026-06-12-question-discriminated-union-design.md`), this refactor must land as **ONE commit with a plain ASCII message**, pushed immediately after Task 11's verification passes.

- Do **NOT** run `git commit` after Tasks 1-10.
- Stage-and-verify only. Task 11 performs the single commit + push.
- If a task's tests fail, fix forward within that task — do not commit partial work.

---

## Task 1: Baseline Snapshot Test (run against CURRENT code)

**Files:**
- Create: `src/__tests__/scoringBaseline.test.ts`

This test freezes the current scoring output. It MUST be written and run against the untouched codebase before any type changes happen (Execution Order, step 1 of the design spec).

- [ ] **Step 1: Write the capture version of the test**

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import {
  calculateAllSectionScores,
  calculateWeightedScore,
  calculateAllConfidenceMetrics,
} from '@/lib/scoringEngine';

function buildFixtureAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  let index = 0;
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      answers[q.id] = (index % 5) + 1;
      index++;
    }
  }
  return answers;
}

describe('scoringBaseline (capture)', () => {
  it('prints baseline values for freezing', () => {
    const answers = buildFixtureAnswers();
    const sectionScores = calculateAllSectionScores(questionnaire.sections, answers);
    const overallScore = calculateWeightedScore(sectionScores);
    const confidence = calculateAllConfidenceMetrics(questionnaire.sections, answers);

    console.log('SECTION_SCORES_JSON=' + JSON.stringify(sectionScores));
    console.log('OVERALL_SCORE_JSON=' + JSON.stringify(overallScore));
    console.log('CONFIDENCE_JSON=' + JSON.stringify(confidence));

    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and capture the three printed JSON lines**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`

Expected: 1 test passes, and stdout contains three lines starting with `SECTION_SCORES_JSON=`, `OVERALL_SCORE_JSON=`, and `CONFIDENCE_JSON=`. Copy each JSON value verbatim — these become the frozen constants in Step 3.

- [ ] **Step 3: Replace the capture test with the frozen acceptance-gate test**

Rewrite the entire file. Paste the three captured JSON values from Step 2 in place of `EXPECTED_SECTION_SCORES`, `EXPECTED_OVERALL_SCORE`, and `EXPECTED_CONFIDENCE` below (these are the literal values printed in Step 2 — not placeholders to design, just to transcribe):

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import {
  calculateAllSectionScores,
  calculateWeightedScore,
  calculateAllConfidenceMetrics,
} from '@/lib/scoringEngine';

function buildFixtureAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  let index = 0;
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      answers[q.id] = (index % 5) + 1;
      index++;
    }
  }
  return answers;
}

// Frozen baseline captured from pre-refactor code (kpi-questions-p0).
// This is the zero-behaviour-change acceptance gate — must pass before AND after the refactor.
const EXPECTED_SECTION_SCORES = /* paste SECTION_SCORES_JSON value from Step 2, parsed as a JS object literal */;
const EXPECTED_OVERALL_SCORE = /* paste OVERALL_SCORE_JSON value from Step 2 (a number) */;
const EXPECTED_CONFIDENCE = /* paste CONFIDENCE_JSON value from Step 2, parsed as a JS object literal */;

describe('scoringBaseline (frozen)', () => {
  const answers = buildFixtureAnswers();

  it('fixture has at least 3 distinct answer values per section', () => {
    for (const section of questionnaire.sections) {
      const values = section.questions.map(q => answers[q.id]);
      expect(new Set(values).size).toBeGreaterThanOrEqual(3);
    }
  });

  it('section scores match frozen baseline', () => {
    const sectionScores = calculateAllSectionScores(questionnaire.sections, answers);
    expect(sectionScores).toEqual(EXPECTED_SECTION_SCORES);
  });

  it('overall weighted score matches frozen baseline', () => {
    const sectionScores = calculateAllSectionScores(questionnaire.sections, answers);
    const overallScore = calculateWeightedScore(sectionScores);
    expect(overallScore).toBe(EXPECTED_OVERALL_SCORE);
  });

  it('confidence metrics match frozen baseline', () => {
    const confidence = calculateAllConfidenceMetrics(questionnaire.sections, answers);
    expect(confidence).toEqual(EXPECTED_CONFIDENCE);
  });
});
```

- [ ] **Step 4: Run and confirm green**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: 4 tests pass (PASS).

This test must stay green through every subsequent task. Re-run it after each task below.

---

## Task 2: Discriminated Union Type Definitions + Codemod

**Files:**
- Modify: `src/data/questionnaire.ts:1-34`
- Create (temporary, deleted at end of task): `scripts/tmp-add-question-kind.mjs`

- [ ] **Step 1: Replace the `Question` interface with the discriminated union**

In `src/data/questionnaire.ts`, replace lines 1-34 (the imports through the end of the `Question` interface):

```ts
import { Language } from '@/contexts/LanguageContext';
import { SignalCode, RootCauseDimension } from '@/data/signalTypes';

export interface QuestionTranslation {
  text: string;
  description?: string;
  purpose?: string;
  situationAnalysis?: string;
  benefits?: string;
  scaleLabels?: string[];
}

export interface Question {
  id: string;
  text: string;
  description?: string;
  type: "scale" | "multiple_choice" | "rating";
  options?: string[];
  scale?: {
    min: number;
    max: number;
    labels: string[];
  };
  weight: number;
  category: string;
  purpose?: string;
  situationAnalysis?: string;
  linkedKPIs?: string[];
  benefits?: string;
  primarySignalCode?: SignalCode;
  secondarySignalCode?: SignalCode;
  rootCauseDimension?: RootCauseDimension;
  translations?: Record<Language, QuestionTranslation>;
}
```

with:

```ts
import { Language } from '@/contexts/LanguageContext';
import { SignalCode, RootCauseDimension } from '@/data/signalTypes';

export interface QuestionTranslation {
  text: string;
  description?: string;
  purpose?: string;
  situationAnalysis?: string;
  benefits?: string;
  scaleLabels?: string[];
}

export interface BaseQuestion {
  id: string;
  text: string;
  description?: string;
  category: string;
  purpose?: string;
  situationAnalysis?: string;
  linkedKPIs?: string[];
  benefits?: string;
  primarySignalCode?: SignalCode;
  secondarySignalCode?: SignalCode;
  rootCauseDimension?: RootCauseDimension;
  translations?: Record<Language, QuestionTranslation>;
}

export interface ScoredQuestion extends BaseQuestion {
  kind: "scored";
  type: "scale" | "multiple_choice" | "rating";
  options?: string[];
  scale: {
    min: number;
    max: number;
    labels: string[];
  };
  weight: number;
}

export interface DataQuestion extends BaseQuestion {
  kind: "data";
  type: "numeric" | "percentage" | "currency" | "ratio";
  kpiKey: string;
  unit: string;
  referencePeriod: "last_calendar_month" | "last_financial_year" | "current";
  validRange?: { min: number; max: number };
  formula?: { expression: string; example?: string; dataSource?: string };
  benchmarkRef?: string;
  subSection?: string;
}

export type Question = ScoredQuestion | DataQuestion;

export function isScoredQuestion(q: Question): q is ScoredQuestion {
  return q.kind === "scored";
}

export function isDataQuestion(q: Question): q is DataQuestion {
  return q.kind === "data";
}
```

- [ ] **Step 2: Write the codemod script**

Create `scripts/tmp-add-question-kind.mjs`:

```js
import fs from 'fs';

const filePath = 'src/data/questionnaire.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Matches the `id: "nvs-1"` style lines belonging to question objects
// (section objects use ids like "new-vehicle-sales", which this pattern does not match).
const pattern = /^(\s*)id: "((?:nvs|uvs|svc|pts|fin)-\d+)",$/gm;

let count = 0;
content = content.replace(pattern, (match, indent, id) => {
  count++;
  return `${indent}id: "${id}",\n${indent}kind: "scored",`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Inserted kind: "scored" into ${count} question objects`);
```

- [ ] **Step 3: Run the codemod**

Run: `node scripts/tmp-add-question-kind.mjs`
Expected output: `Inserted kind: "scored" into 61 question objects`

- [ ] **Step 4: Verify the count and delete the script**

Run: `(Select-String -Path src/data/questionnaire.ts -Pattern 'kind: "scored"').Count`
Expected: `61`

Then delete the temporary script:
Run: `Remove-Item scripts/tmp-add-question-kind.mjs`

- [ ] **Step 5: Re-run the baseline test**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: 4 tests pass (the `kind` field is additive data — runtime behaviour is unchanged because Vitest does not type-check).

---

## Task 3: `getTranslatedQuestion` Generic Rewrite + DE Regression Test

**Files:**
- Modify: `src/data/questionnaire.ts` (the `getTranslatedQuestion` function, originally lines 1925-1944)
- Create: `src/__tests__/getTranslatedQuestion.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/getTranslatedQuestion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire, getTranslatedQuestion, isScoredQuestion } from '@/data/questionnaire';

describe('getTranslatedQuestion', () => {
  it('translates nvs-1 scale labels to German, matching the hardcoded DE translation', () => {
    const nvs1 = questionnaire.sections[0].questions.find(q => q.id === 'nvs-1');
    if (!nvs1) throw new Error('nvs-1 not found in questionnaire');

    const translated = getTranslatedQuestion(nvs1, 'de');

    if (!isScoredQuestion(translated)) throw new Error('nvs-1 should be a scored question');

    expect(translated.scale.labels).toEqual([
      "<4 Einheiten/Monat",
      "4–6 Einheiten/Monat",
      "7–9 Einheiten/Monat",
      "10–12 Einheiten/Monat",
      ">12 Einheiten/Monat"
    ]);
  });

  it('returns the question unchanged when no translation exists for the language', () => {
    const nvs1 = questionnaire.sections[0].questions.find(q => q.id === 'nvs-1');
    if (!nvs1) throw new Error('nvs-1 not found in questionnaire');

    // Cast through unknown: 'fr' is a valid Language but nvs-1 has no 'fr' translation entry
    const translated = getTranslatedQuestion(nvs1, 'fr' as Parameters<typeof getTranslatedQuestion>[1]);
    expect(translated).toBe(nvs1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/__tests__/getTranslatedQuestion.test.ts`
Expected: FAIL — `translated.scale` does not exist on type `Question` (compile-time issue surfaces as a runtime test failure or TS error depending on how the union currently resolves; if `getTranslatedQuestion` still returns `scale: undefined` for the union today, the labels assertion fails with `undefined` not matching the expected array).

- [ ] **Step 3: Rewrite `getTranslatedQuestion`**

In `src/data/questionnaire.ts`, replace:

```ts
// Helper function to get translated question content
export function getTranslatedQuestion(question: Question, language: Language): Question {
  if (!question.translations || !question.translations[language]) {
    return question;
  }

  const translation = question.translations[language];
  return {
    ...question,
    text: translation.text || question.text,
    description: translation.description || question.description,
    purpose: translation.purpose || question.purpose,
    situationAnalysis: translation.situationAnalysis || question.situationAnalysis,
    benefits: translation.benefits || question.benefits,
    scale: question.scale ? {
      ...question.scale,
      labels: translation.scaleLabels || question.scale.labels
    } : undefined
  };
}
```

with:

```ts
// Helper function to get translated question content
export function getTranslatedQuestion<T extends Question>(question: T, language: Language): T {
  if (!question.translations || !question.translations[language]) {
    return question;
  }

  const translation = question.translations[language];
  const base = {
    ...question,
    text: translation.text || question.text,
    description: translation.description || question.description,
    purpose: translation.purpose || question.purpose,
    situationAnalysis: translation.situationAnalysis || question.situationAnalysis,
    benefits: translation.benefits || question.benefits,
  };

  if (isScoredQuestion(question)) {
    return {
      ...base,
      scale: {
        ...question.scale,
        labels: translation.scaleLabels || question.scale.labels
      }
    } as T;
  }

  return base as T;
}
```

- [ ] **Step 4: Run and confirm green**

Run: `npx vitest run src/__tests__/getTranslatedQuestion.test.ts`
Expected: 2 tests pass.

- [ ] **Step 5: Re-run the baseline test**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: 4 tests pass.

---

## Task 4: Scoring Gateway in `scoringEngine.ts`

**Files:**
- Modify: `src/lib/scoringEngine.ts:1`, `:66-87`, `:127-169`, `:212-227`, `:244-292`

- [ ] **Step 1: Update the import and add `getScoredQuestions`**

Replace line 1:

```ts
import type { Question, Section } from '@/data/questionnaire';
```

with:

```ts
import { isScoredQuestion, type Question, type Section, type ScoredQuestion } from '@/data/questionnaire';
```

Then, immediately before `calculateWeightedSectionScore` (before the current line 66 comment block `/** Calculate weighted section score using question weights ... */`), add:

```ts
/**
 * Filter a question list down to scored (numeric-weight) questions only.
 * Use this before any calculation that reads `.weight` — DataQuestion
 * has no weight field, and this is the single gateway that excludes it.
 */
export function getScoredQuestions(questions: Question[]): ScoredQuestion[] {
  return questions.filter(isScoredQuestion);
}

```

- [ ] **Step 2: Update `calculateWeightedSectionScore` (remove the `|| 1.0` fallback)**

Replace:

```ts
export function calculateWeightedSectionScore(
  questions: Question[],
  answers: Record<string, number>
): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const q of questions) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    
    const weight = q.weight || 1.0;
    weightedSum += answer * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) return null;
  
  const weightedAvg = weightedSum / totalWeight;
  // Convert from 1-5 scale to 0-100
  return Math.round((weightedAvg / 5) * 100);
}
```

with:

```ts
export function calculateWeightedSectionScore(
  questions: Question[],
  answers: Record<string, number>
): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const q of getScoredQuestions(questions)) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    
    weightedSum += answer * q.weight;
    totalWeight += q.weight;
  }
  
  if (totalWeight === 0) return null;
  
  const weightedAvg = weightedSum / totalWeight;
  // Convert from 1-5 scale to 0-100
  return Math.round((weightedAvg / 5) * 100);
}
```

- [ ] **Step 3: Update `calculateSubCategoryScores` (remove the `|| 1.0` fallback)**

Replace:

```ts
    for (const q of section.questions) {
      const answer = answers[q.id];
      if (answer === undefined) continue;
      
      const cat = q.category || 'general';
      if (!groups[cat]) groups[cat] = { weightedSum: 0, totalWeight: 0, count: 0 };
      
      const w = q.weight || 1.0;
      groups[cat].weightedSum += answer * w;
      groups[cat].totalWeight += w;
      groups[cat].count++;
    }
```

with:

```ts
    for (const q of getScoredQuestions(section.questions)) {
      const answer = answers[q.id];
      if (answer === undefined) continue;
      
      const cat = q.category || 'general';
      if (!groups[cat]) groups[cat] = { weightedSum: 0, totalWeight: 0, count: 0 };
      
      groups[cat].weightedSum += answer * q.weight;
      groups[cat].totalWeight += q.weight;
      groups[cat].count++;
    }
```

- [ ] **Step 4: Update `calculateAllConfidenceMetrics`**

Replace:

```ts
  for (const section of sections) {
    const values = section.questions
      .map(q => answers[q.id])
      .filter((v): v is number => v !== undefined);
    
    result[section.id] = calculateConfidenceMetrics(values);
  }
```

with:

```ts
  for (const section of sections) {
    const values = getScoredQuestions(section.questions)
      .map(q => answers[q.id])
      .filter((v): v is number => v !== undefined);
    
    result[section.id] = calculateConfidenceMetrics(values);
  }
```

- [ ] **Step 5: Update `detectSystemicPatterns`**

Replace:

```ts
  for (const section of sections) {
    for (const q of section.questions) {
      const answer = answers[q.id];
      if (answer === undefined || answer > weakThreshold) continue;
      
      const cat = q.category || 'general';
      if (!categoryWeakness[cat]) categoryWeakness[cat] = [];
      if (!categoryWeakness[cat].includes(section.id)) {
        categoryWeakness[cat].push(section.id);
      }
    }
  }
```

with:

```ts
  for (const section of sections) {
    for (const q of getScoredQuestions(section.questions)) {
      const answer = answers[q.id];
      if (answer === undefined || answer > weakThreshold) continue;
      
      const cat = q.category || 'general';
      if (!categoryWeakness[cat]) categoryWeakness[cat] = [];
      if (!categoryWeakness[cat].includes(section.id)) {
        categoryWeakness[cat].push(section.id);
      }
    }
  }
```

- [ ] **Step 6: Re-run the baseline test**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: 4 tests pass (all 61 questions are `kind: "scored"`, so `getScoredQuestions` returns the full set — identical to before).

---

## Task 5: Fix `scoringEngine.test.ts` Compile Errors

**Files:**
- Modify: `src/__tests__/scoringEngine.test.ts:1-14`, `:42-63`, `:318-344`

The test file accesses `q.weight` on `section.questions` (typed `Question[]`, now a union). Narrow with `getScoredQuestions`.

- [ ] **Step 1: Update the import**

Replace:

```ts
import {
  calculateWeightedScore,
  calculateWeightedSectionScore,
  calculateAllSectionScores,
  calculateSubCategoryScores,
  calculateConfidenceMetrics,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  calculateEnhancedMaturity,
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
} from '@/lib/scoringEngine';
```

with:

```ts
import {
  calculateWeightedScore,
  calculateWeightedSectionScore,
  calculateAllSectionScores,
  calculateSubCategoryScores,
  calculateConfidenceMetrics,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  calculateEnhancedMaturity,
  getScoredQuestions,
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
} from '@/lib/scoringEngine';
```

- [ ] **Step 2: Fix the `calculateWeightedSectionScore` weight-comparison test**

Replace:

```ts
  it('uses question weights instead of simple average', () => {
    const section = questionnaire.sections[0]; // new-vehicle-sales
    const questions = section.questions;

    // Give all questions score 3 except the highest-weight question gets 5
    const answers: Record<string, number> = {};
    let maxWeightQ = questions[0];
    for (const q of questions) {
      if (q.weight > maxWeightQ.weight) maxWeightQ = q;
      answers[q.id] = 3;
    }
    answers[maxWeightQ.id] = 5;

    const weightedScore = calculateWeightedSectionScore(questions, answers)!;

    // Simple average would be (3*(n-1) + 5) / n
    const simpleAvg = Math.round(((3 * (questions.length - 1) + 5) / questions.length / 5) * 100);

    // Weighted score should be higher because the high-weight question scored 5
    expect(weightedScore).toBeGreaterThan(simpleAvg);
  });
```

with:

```ts
  it('uses question weights instead of simple average', () => {
    const section = questionnaire.sections[0]; // new-vehicle-sales
    const questions = section.questions;
    const scoredQuestions = getScoredQuestions(questions);

    // Give all questions score 3 except the highest-weight question gets 5
    const answers: Record<string, number> = {};
    let maxWeightQ = scoredQuestions[0];
    for (const q of scoredQuestions) {
      if (q.weight > maxWeightQ.weight) maxWeightQ = q;
      answers[q.id] = 3;
    }
    answers[maxWeightQ.id] = 5;

    const weightedScore = calculateWeightedSectionScore(questions, answers)!;

    // Simple average would be (3*(n-1) + 5) / n
    const simpleAvg = Math.round(((3 * (questions.length - 1) + 5) / questions.length / 5) * 100);

    // Weighted score should be higher because the high-weight question scored 5
    expect(weightedScore).toBeGreaterThan(simpleAvg);
  });
```

- [ ] **Step 3: Fix the section-level weighted-vs-simple-average integration test**

Replace:

```ts
  it('section weighted scoring differs from simple average with varied question weights', () => {
    const section = questionnaire.sections[0];
    const questions = section.questions;

    // Find min and max weight questions
    const sorted = [...questions].sort((a, b) => a.weight - b.weight);
    const lightest = sorted[0];
    const heaviest = sorted[sorted.length - 1];

    // Only run this test if weights actually differ
    if (lightest.weight === heaviest.weight) return;

    // Give heaviest-weight question score 5, lightest score 1, rest score 3
    const answers: Record<string, number> = {};
    for (const q of questions) answers[q.id] = 3;
    answers[heaviest.id] = 5;
    answers[lightest.id] = 1;

    const weighted = calculateWeightedSectionScore(questions, answers)!;

    // Simple average
    const values = questions.map(q => answers[q.id]);
    const simpleAvg = Math.round((values.reduce((s, v) => s + v, 0) / values.length / 5) * 100);

    // Weighted should be higher than simple because the heavy question has higher score
    expect(weighted).toBeGreaterThan(simpleAvg);
  });
```

with:

```ts
  it('section weighted scoring differs from simple average with varied question weights', () => {
    const section = questionnaire.sections[0];
    const questions = section.questions;
    const scoredQuestions = getScoredQuestions(questions);

    // Find min and max weight questions
    const sorted = [...scoredQuestions].sort((a, b) => a.weight - b.weight);
    const lightest = sorted[0];
    const heaviest = sorted[sorted.length - 1];

    // Only run this test if weights actually differ
    if (lightest.weight === heaviest.weight) return;

    // Give heaviest-weight question score 5, lightest score 1, rest score 3
    const answers: Record<string, number> = {};
    for (const q of questions) answers[q.id] = 3;
    answers[heaviest.id] = 5;
    answers[lightest.id] = 1;

    const weighted = calculateWeightedSectionScore(questions, answers)!;

    // Simple average
    const values = questions.map(q => answers[q.id]);
    const simpleAvg = Math.round((values.reduce((s, v) => s + v, 0) / values.length / 5) * 100);

    // Weighted should be higher than simple because the heavy question has higher score
    expect(weighted).toBeGreaterThan(simpleAvg);
  });
```

- [ ] **Step 4: Run the full scoringEngine test suite**

Run: `npx vitest run src/__tests__/scoringEngine.test.ts`
Expected: all tests pass (PASS), no expected-value changes — only the fixture-derivation lines changed.

---

## Task 6: Signal Derivation Guard in `signalEngine.ts`

**Files:**
- Modify: `src/lib/signalEngine.ts:15`, `:285-291`

- [ ] **Step 1: Import `isDataQuestion`**

Replace line 15:

```ts
import { questionnaire, Question } from '@/data/questionnaire';
```

with:

```ts
import { questionnaire, Question, isDataQuestion } from '@/data/questionnaire';
```

- [ ] **Step 2: Add the early-return guard in `generateSignals`**

Replace:

```ts
  for (const [questionId, score] of Object.entries(answers)) {
    if (score > config.weakScoreThreshold) {
      continue;
    }

    const resolved = getResolvedSignalMapping(questionId, allQuestions);
    if (!resolved) continue;
    tierCounts[resolved.tier - 1]++;
```

with:

```ts
  for (const [questionId, score] of Object.entries(answers)) {
    if (score > config.weakScoreThreshold) {
      continue;
    }

    const question = allQuestions.get(questionId);
    if (question && isDataQuestion(question)) continue;

    const resolved = getResolvedSignalMapping(questionId, allQuestions);
    if (!resolved) continue;
    tierCounts[resolved.tier - 1]++;
```

- [ ] **Step 3: Re-run the baseline test**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: 4 tests pass. No data questions exist yet, so `isDataQuestion(question)` is always `false` — this guard is a no-op today.

---

## Task 7: Component Compile Fixes — `QuestionCard.tsx` and `CategoryAssessment.tsx`

**Files:**
- Modify: `src/components/assessment/QuestionCard.tsx:7`, `:32-35`, `:155-187`, `:200-205`
- Modify: `src/components/assessment/CategoryAssessment.tsx:3`, `:188-243`

- [ ] **Step 1: `QuestionCard.tsx` — import `isScoredQuestion`**

Replace line 7:

```ts
import { Question } from "@/data/questionnaire";
```

with:

```ts
import { Question, isScoredQuestion } from "@/data/questionnaire";
```

- [ ] **Step 2: `QuestionCard.tsx` — narrow `getRatingText`**

Replace:

```ts
  const getRatingText = (rating: number) => {
    if (!question.scale) return "";
    return question.scale.labels[rating - 1] || "";
  };
```

with:

```ts
  const getRatingText = (rating: number) => {
    if (!isScoredQuestion(question)) return "";
    return question.scale.labels[rating - 1] || "";
  };
```

- [ ] **Step 3: `QuestionCard.tsx` — narrow the Rating Scale block**

Replace:

```tsx
        {/* Rating Scale */}
        {question.type === "scale" && question.scale && (
          <div className="space-y-4">
            {/* Rating Tiles — DESIGN.md §5.3 neutral tiles · §14 Lovable template · §17 OpenType/tracking · §31 focus rings */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {Array.from({ length: question.scale.max }, (_, i) => {
                const rating = i + 1;
                const isSelected = value === rating;
                const label = getRatingText(rating);

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={`min-h-[80px] h-auto px-4 py-3 flex flex-col items-start justify-start gap-1 rounded-[8px] text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-primary/[0.04] border border-primary/30 border-l-[3px] border-l-primary"
                        : "bg-background border border-border hover:border-primary/30 hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground font-mono">
                      {rating}
                    </span>
                    <span className="text-sm font-semibold text-foreground leading-snug whitespace-normal break-words w-full">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
```

with:

```tsx
        {/* Rating Scale */}
        {isScoredQuestion(question) && question.type === "scale" && (() => {
          const scale = question.scale;
          return (
            <div className="space-y-4">
              {/* Rating Tiles — DESIGN.md §5.3 neutral tiles · §14 Lovable template · §17 OpenType/tracking · §31 focus rings */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {Array.from({ length: scale.max }, (_, i) => {
                  const rating = i + 1;
                  const isSelected = value === rating;
                  const label = getRatingText(rating);

                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      className={`min-h-[80px] h-auto px-4 py-3 flex flex-col items-start justify-start gap-1 rounded-[8px] text-left transition-all duration-150 ${
                        isSelected
                          ? "bg-primary/[0.04] border border-primary/30 border-l-[3px] border-l-primary"
                          : "bg-background border border-border hover:border-primary/30 hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground font-mono">
                        {rating}
                      </span>
                      <span className="text-sm font-semibold text-foreground leading-snug whitespace-normal break-words w-full">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
```

- [ ] **Step 4: `QuestionCard.tsx` — narrow the weight label**

Replace:

```tsx
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-3 w-3" />{getWeightLabel(question.weight)}</span>
          </div>
```

with:

```tsx
          {isScoredQuestion(question) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-3 w-3" />{getWeightLabel(question.weight)}</span>
            </div>
          )}
```

- [ ] **Step 5: `CategoryAssessment.tsx` — import `isScoredQuestion`**

Replace line 3:

```ts
import { Question, Section } from "@/data/questionnaire";
```

with:

```ts
import { Question, Section, isScoredQuestion } from "@/data/questionnaire";
```

- [ ] **Step 6: `CategoryAssessment.tsx` — narrow the Rating tiles block**

Replace:

```tsx
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
```

with:

```tsx
                {/* ── Rating tiles ── */}
                {isScoredQuestion(question) && question.type === 'scale' && (() => {
                  const scale = question.scale;
                  return (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {Array.from({ length: scale.max }, (_, i) => {
                        const rating = i + 1;
                        const isSelected = value === rating;
                        const label = scale.labels[i] || '';

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
                  );
                })()}
```

- [ ] **Step 7: Re-run the baseline test**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: 4 tests pass.

---

## Task 8: Call-Site Updates — `questionWeights` Maps and `actionGenerator.ts`

**Files:**
- Modify: `src/components/ExecutiveSummary.tsx:16-25`, `:219-220`, `:233-234`
- Modify: `src/components/ActionPlan.tsx:22`, `:260-263`
- Modify: `src/hooks/useAutoActionGeneration.ts:17`, `:39-49`
- Modify: `src/hooks/useAssessmentData.ts:400-424`
- Modify: `src/utils/actionGenerator.ts:1-6`, `:43-77`

- [ ] **Step 1: `ExecutiveSummary.tsx` — add `getScoredQuestions` to the scoringEngine import**

Replace:

```ts
import {
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
  calculateSubCategoryScores,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  type ConfidenceMetrics,
  type DepartmentSubCategories,
  type SystemicPattern,
} from "@/lib/scoringEngine";
```

with:

```ts
import {
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
  calculateSubCategoryScores,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  getScoredQuestions,
  type ConfidenceMetrics,
  type DepartmentSubCategories,
  type SystemicPattern,
} from "@/lib/scoringEngine";
```

- [ ] **Step 2: `ExecutiveSummary.tsx` — apply the filter to both `questionWeights` builders**

This exact two-line snippet appears twice (in the `narrative` memo and the `topSignals` memo). Replace both occurrences:

Replace:

```ts
    const questionWeights: Record<string, number> = {};
    questionnaire.sections.forEach(s => s.questions.forEach(q => { questionWeights[q.id] = q.weight; }));
```

with (use `replace_all`):

```ts
    const questionWeights: Record<string, number> = {};
    questionnaire.sections.forEach(s => getScoredQuestions(s.questions).forEach(q => { questionWeights[q.id] = q.weight; }));
```

- [ ] **Step 3: `ActionPlan.tsx` — import `getScoredQuestions`**

Replace:

```ts
import { questionnaire } from '@/data/questionnaire';
```

with:

```ts
import { questionnaire } from '@/data/questionnaire';
import { getScoredQuestions } from '@/lib/scoringEngine';
```

- [ ] **Step 4: `ActionPlan.tsx` — apply the filter**

Replace:

```ts
      const questionWeights: Record<string, number> = {};
      for (const section of questionnaire.sections) {
        for (const question of section.questions) questionWeights[question.id] = question.weight;
      }
```

with:

```ts
      const questionWeights: Record<string, number> = {};
      for (const section of questionnaire.sections) {
        for (const question of getScoredQuestions(section.questions)) questionWeights[question.id] = question.weight;
      }
```

- [ ] **Step 5: `useAutoActionGeneration.ts` — import `getScoredQuestions`**

Replace:

```ts
import { questionnaire } from '@/data/questionnaire';
```

with:

```ts
import { questionnaire } from '@/data/questionnaire';
import { getScoredQuestions } from '@/lib/scoringEngine';
```

- [ ] **Step 6: `useAutoActionGeneration.ts` — apply the filter**

Replace:

```ts
  const getQuestionWeights = useCallback((): Record<string, number> => {
    const weights: Record<string, number> = {};
    
    for (const section of questionnaire.sections) {
      for (const question of section.questions) {
        weights[question.id] = question.weight;
      }
    }
    
    return weights;
  }, []);
```

with:

```ts
  const getQuestionWeights = useCallback((): Record<string, number> => {
    const weights: Record<string, number> = {};
    
    for (const section of questionnaire.sections) {
      for (const question of getScoredQuestions(section.questions)) {
        weights[question.id] = question.weight;
      }
    }
    
    return weights;
  }, []);
```

- [ ] **Step 7: `useAssessmentData.ts` — add a dynamic import for `getScoredQuestions`**

Replace:

```ts
    // Import signal engine dynamically to avoid circular deps
    const { generateActionsFromAssessment, formatActionsForDatabaseInsert } = await import('@/lib/signalEngine');
    const { questionnaire } = await import('@/data/questionnaire');
```

with:

```ts
    // Import signal engine dynamically to avoid circular deps
    const { generateActionsFromAssessment, formatActionsForDatabaseInsert } = await import('@/lib/signalEngine');
    const { getScoredQuestions } = await import('@/lib/scoringEngine');
    const { questionnaire } = await import('@/data/questionnaire');
```

- [ ] **Step 8: `useAssessmentData.ts` — apply the filter and remove the `|| 1.0` fallback**

Replace:

```ts
    // Build question weight map from questionnaire
    const questionWeights: Record<string, number> = {};
    for (const section of questionnaire.sections) {
      for (const q of section.questions) {
        questionWeights[q.id] = q.weight || 1.0;
      }
    }
```

with:

```ts
    // Build question weight map from questionnaire
    const questionWeights: Record<string, number> = {};
    for (const section of questionnaire.sections) {
      for (const q of getScoredQuestions(section.questions)) {
        questionWeights[q.id] = q.weight;
      }
    }
```

- [ ] **Step 9: `actionGenerator.ts` — strengthen the dead-code header and import `getScoredQuestions`**

Replace:

```ts
/**
 * @deprecated Use src/lib/signalEngine.ts instead.
 * This legacy generator is kept for reference only.
 * All action generation should go through the canonical signal engine.
 */
import { Question, Section } from '@/data/questionnaire';
```

with:

```ts
/**
 * @deprecated DEAD CODE — do not extend. Use src/lib/signalEngine.ts instead.
 * This legacy generator has zero imports anywhere in the codebase and is kept
 * for reference only. All action generation goes through the canonical signal engine.
 */
import { Question, Section } from '@/data/questionnaire';
import { getScoredQuestions } from '@/lib/scoringEngine';
```

- [ ] **Step 10: `actionGenerator.ts` — apply the filter and remove the `|| 1` fallback in `analyzeAssessmentAnswers`**

Replace:

```ts
export function analyzeAssessmentAnswers(
  sections: Section[],
  answers: Record<string, number>
): ActionContext[] {
  const weakPoints: ActionContext[] = [];

  sections.forEach((section) => {
    section.questions.forEach((question) => {
      const score = answers[question.id];
      
      // Consider questions with score 1-3 as needing attention
      if (score && score <= 3) {
        weakPoints.push({
          questionId: question.id,
          questionText: question.text,
          score,
          weight: question.weight || 1,
          purpose: question.purpose,
          situationAnalysis: question.situationAnalysis,
          linkedKPIs: question.linkedKPIs,
          benefits: question.benefits,
          category: question.category,
          department: section.title,
        });
      }
    });
  });

  // Sort by priority: lowest score * highest weight first
  return weakPoints.sort((a, b) => {
    const priorityA = a.score * (1 / a.weight);
    const priorityB = b.score * (1 / b.weight);
    return priorityA - priorityB;
  });
}
```

with:

```ts
export function analyzeAssessmentAnswers(
  sections: Section[],
  answers: Record<string, number>
): ActionContext[] {
  const weakPoints: ActionContext[] = [];

  sections.forEach((section) => {
    getScoredQuestions(section.questions).forEach((question) => {
      const score = answers[question.id];
      
      // Consider questions with score 1-3 as needing attention
      if (score && score <= 3) {
        weakPoints.push({
          questionId: question.id,
          questionText: question.text,
          score,
          weight: question.weight,
          purpose: question.purpose,
          situationAnalysis: question.situationAnalysis,
          linkedKPIs: question.linkedKPIs,
          benefits: question.benefits,
          category: question.category,
          department: section.title,
        });
      }
    });
  });

  // Sort by priority: lowest score * highest weight first
  return weakPoints.sort((a, b) => {
    const priorityA = a.score * (1 / a.weight);
    const priorityB = b.score * (1 / b.weight);
    return priorityA - priorityB;
  });
}
```

- [ ] **Step 11: Re-run the baseline test and the scoringEngine suite**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts src/__tests__/scoringEngine.test.ts`
Expected: all tests pass.

---

## Task 9: Zod Runtime Schema — `src/lib/questionSchema.ts`

**Files:**
- Create: `src/lib/questionSchema.ts`
- Create: `src/__tests__/questionSchema.test.ts`

`zod@^3.23.8` is already a dependency — no install needed.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/questionSchema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import { ScoredQuestionSchema, QuestionSchema, validateQuestionSet } from '@/lib/questionSchema';

describe('questionSchema', () => {
  it('validates the entire static questionnaire', () => {
    const allQuestions = questionnaire.sections.flatMap(s => s.questions);
    expect(() => validateQuestionSet(allQuestions)).not.toThrow();
  });

  it('rejects a data question carrying a stray weight field', () => {
    const dataQuestionWithWeight = {
      kind: 'data',
      id: 'test-data-1',
      text: 'Test data question',
      category: 'test',
      type: 'numeric',
      kpiKey: 'test_kpi',
      unit: 'units',
      referencePeriod: 'current',
      weight: 1.5, // stray field — not allowed on DataQuestion
    };

    const result = QuestionSchema.safeParse(dataQuestionWithWeight);
    expect(result.success).toBe(false);
  });

  it('rejects a scored question with weight 0', () => {
    const scoredQuestionZeroWeight = {
      kind: 'scored',
      id: 'test-scored-1',
      text: 'Test scored question',
      category: 'test',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['a', 'b', 'c', 'd', 'e'] },
      weight: 0,
    };

    const result = ScoredQuestionSchema.safeParse(scoredQuestionZeroWeight);
    expect(result.success).toBe(false);
  });

  it('accepts a fully-populated synthetic data question', () => {
    const fullyPopulatedDataQuestion = {
      kind: 'data',
      id: 'kpi-test-1',
      text: 'What was your monthly new vehicle sales volume?',
      description: 'Enter the total units sold last month',
      category: 'volume',
      purpose: 'Measures sales volume',
      situationAnalysis: 'Volume drives revenue',
      linkedKPIs: ['Monthly Revenue'],
      benefits: 'Better forecasting',
      primarySignalCode: 'CAPACITY_MISALIGNED',
      secondarySignalCode: 'KPI_NOT_REVIEWED',
      rootCauseDimension: 'structure',
      translations: {
        en: { text: 'What was your monthly new vehicle sales volume?' },
      },
      type: 'numeric',
      kpiKey: 'nvs_monthly_units',
      unit: 'units',
      referencePeriod: 'last_calendar_month',
      validRange: { min: 0, max: 1000 },
      formula: { expression: 'sum(units_sold)', example: '42', dataSource: 'DMS' },
      benchmarkRef: 'nvs_monthly_units_benchmark',
      subSection: 'volume-metrics',
    };

    expect(() => validateQuestionSet([fullyPopulatedDataQuestion])).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/__tests__/questionSchema.test.ts`
Expected: FAIL with "Failed to resolve import @/lib/questionSchema" (module does not exist yet).

- [ ] **Step 3: Create `src/lib/questionSchema.ts`**

```ts
import { z } from 'zod';
import type { Question } from '@/data/questionnaire';

const baseQuestionFields = {
  id: z.string(),
  text: z.string(),
  description: z.string().optional(),
  category: z.string(),
  purpose: z.string().optional(),
  situationAnalysis: z.string().optional(),
  linkedKPIs: z.array(z.string()).optional(),
  benefits: z.string().optional(),
  primarySignalCode: z.string().optional(),    // SignalCode
  secondarySignalCode: z.string().optional(),  // SignalCode
  rootCauseDimension: z.string().optional(),   // RootCauseDimension
  translations: z.record(z.string(), z.object({
    text: z.string(),
    description: z.string().optional(),
    purpose: z.string().optional(),
    situationAnalysis: z.string().optional(),
    benefits: z.string().optional(),
    scaleLabels: z.array(z.string()).optional(),
  })).optional(),
};

export const ScoredQuestionSchema = z.object({
  ...baseQuestionFields,
  kind: z.literal("scored"),
  type: z.enum(["scale", "multiple_choice", "rating"]),
  options: z.array(z.string()).optional(),
  scale: z.object({ min: z.number(), max: z.number(), labels: z.array(z.string()) }),
  weight: z.number().positive().finite(),
}).strict();

export const DataQuestionSchema = z.object({
  ...baseQuestionFields,
  kind: z.literal("data"),
  type: z.enum(["numeric", "percentage", "currency", "ratio"]),
  kpiKey: z.string(),
  unit: z.string(),
  referencePeriod: z.enum(["last_calendar_month", "last_financial_year", "current"]),
  validRange: z.object({ min: z.number(), max: z.number() }).optional(),
  formula: z.object({
    expression: z.string(),
    example: z.string().optional(),
    dataSource: z.string().optional(),
  }).optional(),
  benchmarkRef: z.string().optional(),
  subSection: z.string().optional(),
}).strict(); // rejects a stray `weight` or `scale` field

export const QuestionSchema = z.discriminatedUnion("kind", [ScoredQuestionSchema, DataQuestionSchema]);

export function validateQuestionSet(questions: unknown[]): Question[] {
  const errors: string[] = [];
  const result: Question[] = [];

  questions.forEach((q, index) => {
    const parsed = QuestionSchema.safeParse(q);
    if (!parsed.success) {
      const id = typeof q === 'object' && q !== null && 'id' in q
        ? String((q as { id: unknown }).id)
        : `index ${index}`;
      errors.push(`Question "${id}": ${parsed.error.message}`);
    } else {
      result.push(parsed.data as Question);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Invalid question set:\n${errors.join('\n')}`);
  }

  return result;
}
```

- [ ] **Step 4: Run and confirm green**

Run: `npx vitest run src/__tests__/questionSchema.test.ts`
Expected: 4 tests pass.

---

## Task 10: Integrity Test Suite — `src/__tests__/questionnaireIntegrity.test.ts`

**Files:**
- Create: `src/__tests__/questionnaireIntegrity.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { questionnaire, isScoredQuestion, isDataQuestion } from '@/data/questionnaire';
import { SIGNAL_MAPPINGS } from '@/data/signalMappings';
import { validateQuestionSet } from '@/lib/questionSchema';

const allQuestions = questionnaire.sections.flatMap(s => s.questions);

describe('questionnaire integrity', () => {
  it('every scored question has a positive finite weight', () => {
    for (const q of allQuestions) {
      if (isScoredQuestion(q)) {
        expect(Number.isFinite(q.weight)).toBe(true);
        expect(q.weight).toBeGreaterThan(0);
      }
    }
  });

  it('contains no data questions yet', () => {
    const dataQuestions = allQuestions.filter(isDataQuestion);
    expect(dataQuestions.length).toBe(0);
  });

  it('no SIGNAL_MAPPINGS entry references a data question', () => {
    const byId = new Map(allQuestions.map(q => [q.id, q]));
    for (const mapping of SIGNAL_MAPPINGS) {
      const q = byId.get(mapping.questionId);
      if (q) {
        expect(isDataQuestion(q)).toBe(false);
      }
    }
  });

  it('the full questionnaire passes validateQuestionSet', () => {
    expect(() => validateQuestionSet(allQuestions)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run and confirm green**

Run: `npx vitest run src/__tests__/questionnaireIntegrity.test.ts`
Expected: 4 tests pass.

---

## Task 11: Full Verification, Single Commit, Push

**Files:** none (verification + commit only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all test files pass, including:
- `src/__tests__/scoringBaseline.test.ts` (4 tests, frozen constants from Task 1)
- `src/__tests__/scoringEngine.test.ts` (all pre-existing tests, unchanged expected values)
- `src/__tests__/getTranslatedQuestion.test.ts` (2 tests)
- `src/__tests__/questionSchema.test.ts` (4 tests)
- `src/__tests__/questionnaireIntegrity.test.ts` (4 tests)

- [ ] **Step 2: Run coverage and confirm the 80% threshold still holds**

Run: `npx vitest --coverage run`
Expected: branches/functions/lines/statements all ≥ 80%.

- [ ] **Step 3: Production build — zero type errors**

Run: `npm run build`
Expected: build completes with exit code 0, no TypeScript errors.

- [ ] **Step 4: Confirm no questionnaire version metadata needs bumping**

Run: `(Select-String -Path src/data/questionnaire.ts -Pattern 'version').Count`
Expected: `0` (confirmed in the design spec — no version field exists; nothing to bump).

- [ ] **Step 5: Stage all changes**

Run: `git add src/data/questionnaire.ts src/lib/scoringEngine.ts src/lib/signalEngine.ts src/lib/questionSchema.ts src/components/assessment/QuestionCard.tsx src/components/assessment/CategoryAssessment.tsx src/components/ExecutiveSummary.tsx src/components/ActionPlan.tsx src/hooks/useAutoActionGeneration.ts src/hooks/useAssessmentData.ts src/utils/actionGenerator.ts src/__tests__/scoringBaseline.test.ts src/__tests__/scoringEngine.test.ts src/__tests__/getTranslatedQuestion.test.ts src/__tests__/questionSchema.test.ts src/__tests__/questionnaireIntegrity.test.ts`

Run: `git status`
Expected: all 16 files staged, nothing else (the temporary codemod script from Task 2 was already deleted and is not tracked).

- [ ] **Step 6: Single commit**

Run:
```bash
git commit -m "refactor: discriminated union for scored vs data questions, scoring gateway, zod schema - kpi-questions-p0"
```

- [ ] **Step 7: Push**

Run: `git push`
Expected: push succeeds to `main`.

---

## Self-Review Notes

**Spec coverage:**
- Execution Order (baseline first) — Task 1 ✅
- Type definitions, `scale` required, `isScoredQuestion`/`isDataQuestion` — Task 2 ✅
- Codemod 61 questions — Task 2 ✅
- `getTranslatedQuestion` generic rewrite + DE regression test — Task 3 ✅
- Scoring gateway + fallback removal in `calculateWeightedSectionScore`/`calculateSubCategoryScores` — Task 4 ✅
- `getScoredQuestions` applied to confidence metrics + systemic patterns — Task 4 ✅
- Full call-site inventory (ExecutiveSummary, ActionPlan, useAutoActionGeneration, useAssessmentData, actionGenerator, QuestionCard, CategoryAssessment) — Tasks 7-8 ✅
- Signal derivation guard — Task 6 ✅
- Zod schema with shared `baseQuestionFields`, both `.strict()`, fully-populated synthetic DataQuestion test — Task 9 ✅
- Integrity test suite — Task 10 ✅
- Baseline distinct-values assertion — Task 1 ✅
- Verification (full suite, coverage, build, version bump check) — Task 11 ✅
- One commit, plain ASCII, push — Task 11 ✅

**No-change-needed files** (confirmed during design, not touched): `src/lib/pdfReportGenerator.ts`, `src/lib/moduleGating.ts`, `src/lib/contextIntelligence.ts`, `src/components/MaturityScoring.tsx`, `src/pages/Methodology.tsx`.
