# Design: Question Discriminated Union (kpi-questions-p0)

## Objective

Refactor `Question` (src/data/questionnaire.ts) into a discriminated union
separating scorable questions (`ScoredQuestion`) from future data-collection
questions (`DataQuestion`). Zero behaviour change: every score, signal,
confidence metric, and rendered screen must be byte-identical before and
after. Eliminates the `q.weight || 1` silent-fallback hazard and prepares
for KPI input questions (added in a later task — not this one).

## Constraints

- Zero behaviour change — `scoringBaseline.test.ts` is the acceptance gate
- Do not add the 22 KPI questions in this task
- Do not touch Supabase
- One commit, plain ASCII message
- Never install new npm packages without confirmation (zod needs a check)

## Execution Order

1. Write `scoringBaseline.test.ts` against the CURRENT, untouched code.
   Run it, capture the actual output values, freeze them as literal
   expected constants, confirm green.
2. Only then begin the type refactor (Steps 2-7). Constants captured
   after any refactor work has started are invalid — the baseline must
   reflect pre-refactor behaviour exactly.

## Type Definitions (src/data/questionnaire.ts)

```ts
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
  scale: { min: number; max: number; labels: string[] }; // required — see below
  weight: number; // required, no fallback
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
  // NO weight, NO scale
}

export type Question = ScoredQuestion | DataQuestion;

export function isScoredQuestion(q: Question): q is ScoredQuestion {
  return q.kind === "scored";
}
export function isDataQuestion(q: Question): q is DataQuestion {
  return q.kind === "data";
}
```

Codemod: add `kind: "scored"` to all 61 existing question objects across the
5 sections. No other field changes — weights, scales, translations untouched.

**`scale` is REQUIRED, not optional** — verified by grep: all 61 questions
(nvs-1..13, uvs-1..13, svc-1..15, pts-1..10, fin-1..10 = 13+13+15+10+10=61)
have `type: "scale"` and a populated `scale: {...}` field. No question lacks
`scale`. This removes the need for `question.scale ?` guards in
`getTranslatedQuestion`, `QuestionCard.tsx`, and `CategoryAssessment.tsx`
(see below) — those guards become dead and are removed.

No questionnaire version metadata field exists currently — nothing to bump.

## Scoring Gateway (src/lib/scoringEngine.ts)

```ts
export function getScoredQuestions(questions: Question[]): ScoredQuestion[] {
  return questions.filter(isScoredQuestion);
}
```

Apply at the top of every function that iterates `section.questions` for
numeric scoring purposes, then delete the `|| 1.0` fallback (weight is now
type-guaranteed on `ScoredQuestion`):

- `calculateWeightedSectionScore` (line 77) — DELETE `q.weight || 1.0` fallback
- `calculateSubCategoryScores` (line 143) — DELETE `q.weight || 1.0` fallback
- `calculateAllConfidenceMetrics` — filter via `getScoredQuestions` before mapping answers
- `detectSystemicPatterns` — filter via `getScoredQuestions`

## Full Call-Site Inventory (validated against current code)

**`.weight` access building a `questionWeights` map — needs `getScoredQuestions` filter:**
- `src/components/ExecutiveSummary.tsx:220,234`
- `src/components/ActionPlan.tsx:262`
- `src/hooks/useAutoActionGeneration.ts:44`
- `src/hooks/useAssessmentData.ts:422`
- `src/utils/actionGenerator.ts:59,73-74,125` (dead file, see below)

**`.scale` / `.weight` access in rendering — needs `isScoredQuestion` narrowing
(and the now-redundant `question.scale &&` truthiness checks removed, since
`scale` is required on `ScoredQuestion`):**
- `src/components/assessment/QuestionCard.tsx:33-34,156-160,203` — narrow with
  `isScoredQuestion`, drop the `&& question.scale` checks (the `question.type
  === "scale"` check stays — it selects UI variant, not presence)
- `src/components/assessment/CategoryAssessment.tsx:189-194` — same: narrow,
  drop `&& question.scale`
- `src/data/questionnaire.ts:1926-1944` (`getTranslatedQuestion`, see below)

**No change needed (confirmed by inspection):**
- `src/lib/signalEngine.ts` — only touches `BaseQuestion` fields (category,
  primarySignalCode, rootCauseDimension, linkedKPIs); compiles as-is except
  for the Step 4 guard below
- `src/lib/pdfReportGenerator.ts:1006` — only touches `.id`/`.text`
- `src/lib/moduleGating.ts`, `src/lib/contextIntelligence.ts` — no
  Question/.weight/.scale touches
- `src/components/MaturityScoring.tsx:312` (`row.weight`) — operates on
  `SubCategoryScore.weight`, not `Question.weight` — unaffected
- `src/pages/Methodology.tsx:138` (`mod.weight`) — static local array,
  unrelated to `Question` — unaffected

## Signal Derivation Guard (src/lib/signalEngine.ts)

In `generateSignals`, at the top of the per-answer loop, add:

```ts
const question = allQuestions.get(questionId);
if (question && isDataQuestion(question)) continue;
```

No data questions exist yet so this is a no-op today, but establishes the
contract before KPI questions are added.

## getTranslatedQuestion Rewrite (src/data/questionnaire.ts:1926-1944)

Make generic so the return type matches the input branch:

```ts
export function getTranslatedQuestion<T extends Question>(
  question: T,
  language: Language
): T {
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

`getTranslatedSection` is unaffected (maps over questions, return type stays `Question`).

**New unit test** (in `src/__tests__/questionnaireIntegrity.test.ts` or a
small dedicated test): assert that `getTranslatedQuestion(questionnaire's
nvs-1, 'de')` produces `scale.labels` exactly equal to the current hardcoded
DE `scaleLabels` array for nvs-1 (`["<4 Einheiten/Monat", "4–6 Einheiten/Monat", ...]`).
Locks in current translation behaviour.

## actionGenerator.ts (dead file, 0 imports)

Confirmed unused (grep for `actionGenerator` finds only its own file), but
still type-checked by `tsc` — must compile.

- Apply `getScoredQuestions` filter inside `analyzeAssessmentAnswers`'s
  `section.questions.forEach` (skip `DataQuestion` entirely, matching the
  signal-engine guard's spirit)
- DELETE the `|| 1` fallbacks at lines 59, 73-74, 125 — weight is type-guaranteed
  on `ScoredQuestion`, same rule as scoringEngine
- Add a header comment marking it `DEAD CODE — do not extend, use
  src/lib/signalEngine.ts instead` (it already has a `@deprecated` doc
  comment; strengthen it)
- File deletion itself is out of scope for this task

## Zod Runtime Schema (new file: src/lib/questionSchema.ts)

Both schemas declare every `BaseQuestion` field explicitly (including
`translations`) — `.strict()` on `DataQuestionSchema` only rejects fields
NOT in its own schema, so all shared base fields must be spelled out in
both, or the next task's real KPI questions (which will carry purpose,
situationAnalysis, linkedKPIs, translations, etc.) get incorrectly rejected.

```ts
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
  formula: z.object({ expression: z.string(), example: z.string().optional(), dataSource: z.string().optional() }).optional(),
  benchmarkRef: z.string().optional(),
  subSection: z.string().optional(),
}).strict(); // rejects a stray `weight` or `scale` field

export const QuestionSchema = z.discriminatedUnion("kind", [ScoredQuestionSchema, DataQuestionSchema]);

export function validateQuestionSet(questions: unknown[]): Question[] {
  // parse each; on failure throw Error listing each invalid question's id + issue
}
```

`zod` is already a dependency (`^3.23.8` in package.json) — no install needed.

**New tests** (in questionSchema test or integrity suite):
- entire static `questionnaire` passes `validateQuestionSet`
- a `DataQuestion` carrying a stray `weight` field fails (`.strict()` rejection)
- a `ScoredQuestion` with `weight: 0` fails (`.positive()`)
- a fully-populated synthetic `DataQuestion` — every optional field present
  (description, purpose, situationAnalysis, linkedKPIs, benefits,
  primarySignalCode, secondarySignalCode, rootCauseDimension, translations,
  validRange, formula, benchmarkRef, subSection) — passes `validateQuestionSet`
  (guards against `.strict()` over-rejecting the real KPI questions in the
  next task)

## Integrity Test Suite (new file: src/__tests__/questionnaireIntegrity.test.ts)

- every `ScoredQuestion` has positive finite `weight`
- count of `DataQuestion` === 0 (will be updated in the next task)
- no `SIGNAL_MAPPINGS` entry references a question where `isDataQuestion(q)` is true
- full questionnaire passes `validateQuestionSet`
- `getTranslatedQuestion` DE scaleLabels regression test (see above)

## Baseline Snapshot (new file: src/__tests__/scoringBaseline.test.ts)

- Build deterministic fixture: `answer = (index % 5) + 1` for every question
  across all 5 sections, in iteration order
- Assert each section's fixture answers contain >= 3 distinct values (all 5
  sections have >= 10 questions, so `(index % 5) + 1` naturally cycles
  through 1-5 — this assertion protects the variance-based confidence
  baseline if section sizes ever shrink below 5 questions)
- Run against CURRENT code first (per Execution Order above), capture: all 5
  section scores, overall weighted score (`calculateWeightedScore`),
  confidence metrics per section (`calculateAllConfidenceMetrics`)
- Freeze these as literal expected constants
- This test must pass before AND after the refactor — the acceptance gate

## Verification

1. Full test suite — `scoringBaseline.test.ts` passes with frozen constants;
   all pre-existing tests pass with only `kind: "scored"` fixture shape
   updates allowed (no expected-value changes)
2. `npm run build` / `tsc` — zero type errors
3. No questionnaire version metadata to bump

## Commit

```
refactor: discriminated union for scored vs data questions, scoring gateway, zod schema - kpi-questions-p0
```

One commit, plain ASCII, pushed immediately after verification passes.
