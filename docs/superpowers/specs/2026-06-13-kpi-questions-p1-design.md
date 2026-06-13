# KPI Data Questions — Phase 1 (kpi-questions-p1)

## Context

Phase 0 (`kpi-questions-p0`, commit `4ad9692`) introduced the `Question = ScoredQuestion | DataQuestion` discriminated union, the `getScoredQuestions` gateway, the `QuestionSchema` zod validators, and integrity tests that currently assert "no data questions exist."

Phase 1 adds the real KPI data-collection layer on top of that foundation:
1. A new Supabase table, `assessment_kpi_values`, to store numeric KPI inputs per assessment.
2. 22 `DataQuestion` entries in `questionnaire.ts` — one per KPI — covering all 5 assessment modules.
3. Updated integrity tests reflecting the new question set.

## Goals

- Persist structured KPI values (currency, percentage, ratio, numeric) separately from the 1–5 scored questionnaire answers.
- Add the 22 specified KPI questions to the questionnaire with full EN/DE content and a `formula` block per question.
- Keep the existing scoring pipeline byte-for-byte unchanged (`scoringBaseline.test.ts` must pass with frozen constants).

## Non-goals

- No UI work (forms, results display) for these questions — that's Lovable's responsibility in a later phase.
- No write path / API wiring from the assessment flow into `assessment_kpi_values` — table only, in this phase.
- No changes to `CATEGORY_WEIGHTS`, `DEPARTMENT_TO_CATEGORY`, or any scored-question content.

## 1. Database: `assessment_kpi_values`

### Schema

```sql
CREATE TABLE public.assessment_kpi_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  dealership_id uuid NOT NULL REFERENCES public.dealerships(id),
  question_id text NOT NULL,
  kpi_key text NOT NULL,
  value numeric,
  unit text NOT NULL,
  currency_code text,
  reference_period text NOT NULL,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, kpi_key),
  CHECK ((skipped = true AND value IS NULL) OR (skipped = false AND value IS NOT NULL))
);

CREATE INDEX idx_kpi_values_dealership_kpi ON public.assessment_kpi_values (dealership_id, kpi_key);
CREATE INDEX idx_kpi_values_assessment ON public.assessment_kpi_values (assessment_id);
```

### RLS

Enable RLS. Policies mirror the **actual** policies on `assessments` (verified via `pg_policies`), not the org-based description in CLAUDE.md — `assessments` is `auth.uid() = user_id` scoped, not org-scoped.

- **Dealer (owner) — full CRUD**, via a subquery to `assessments`:
  ```sql
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_kpi_values.assessment_id
      AND a.user_id = auth.uid()
  )
  ```
  Applied as `USING` for SELECT/UPDATE/DELETE and `WITH CHECK` for INSERT/UPDATE — four policies (`kpi_values_select`, `kpi_values_insert`, `kpi_values_update`, `kpi_values_delete`), matching the naming style of `assessments_select` etc.

- **Coach — SELECT only**, via `coach_dealership_assignments` (same pattern as the existing "Coaches can view assessments for assigned dealerships" policy):
  ```sql
  EXISTS (
    SELECT 1 FROM public.coach_dealership_assignments cda
    WHERE cda.dealership_id = assessment_kpi_values.dealership_id
      AND cda.coach_user_id = auth.uid()
      AND cda.is_active = true
  )
  ```

- **OEM — SELECT only**, reusing the existing `public.user_can_access_assessment_as_oem(dealership_id)` SECURITY DEFINER function (already used by the "OEM admins can view network assessments" policy on `assessments`). No new function needed, no recursion risk — this function is already proven safe.

### Indexes vs. policies

- `idx_kpi_values_assessment (assessment_id)` covers the dealer-owner subquery join.
- `idx_kpi_values_dealership_kpi (dealership_id, kpi_key)` covers the coach and OEM policy lookups on `dealership_id`.

No additional indexes required.

### Post-apply

Run `get_advisors` (security + performance) against the project after applying the migration and resolve anything flagged for this table.

## 2. Questionnaire: 22 `DataQuestion` entries

### Placement

Each module (section) gets its KPI questions appended to the **end** of its `questions[]` array:

| Section (id) | New questions | Count |
|---|---|---|
| `new-vehicle-sales` | nvs-kpi-4, nvs-kpi-7 | 2 |
| `used-vehicle-sales` | uvs-kpi-2, uvs-kpi-3, uvs-kpi-5, uvs-kpi-6, uvs-kpi-7 | 5 |
| `service-performance` | svc-kpi-2, svc-kpi-5, svc-kpi-6 | 3 |
| `parts-inventory` | prt-kpi-1, prt-kpi-3, prt-kpi-5, prt-kpi-6, prt-kpi-7 | 5 |
| `financial-operations` | fin-kpi-1..7 | 7 |

Section `id` values confirmed against `questionnaire.ts` (lines 1419, 1697) and match `DEPARTMENT_TO_CATEGORY` keys.

Total: 22, bringing the questionnaire from 61 → 83 questions.

### Shared field conventions (all 22)

- `kind: "data"`
- `category: "performance_data"` — distinct from all existing scored-question categories (volume, conversion, retention, etc.), so it can never collide with `calculateSubCategoryScores` groupings even though that function already filters to `getScoredQuestions` only.
- `subSection: "performance_data"`
- No `weight` field (forbidden by `DataQuestionSchema.strict()`).
- No `primarySignalCode` / `secondarySignalCode` / `rootCauseDimension` — these questions are not signal-mapped.
- `type`, `unit`, `referencePeriod`, `validRange` exactly as specified in the task table (22 rows, given).
- `formula: { expression, example, dataSource }` — written per-question with domain-correct content (realistic European premium-segment figures, correct DMS/management-accounts/CRM data source per KPI).
- Full `translations.en` and `translations.de` blocks (`text`, `description`). German translations use DACH terminology where applicable: Standtage (days-to-sale), Bruttoertrag (gross profit), Stundenverrechnungssatz (effective labour rate), Werkstattauslastung (workshop loading), Debitorenlaufzeit (debtor days), Teileumschlag (parts turns).

### The 22 questions

IDs, `kpiKey`, question text, `type`, `unit`, `referencePeriod`, `validRange` are exactly as enumerated in the task brief (NVS ×2, UVS ×5, SVC ×3, PRT ×5, FIN ×7). Not repeated here in full — see brief for the canonical list. Formula content (expression/example/dataSource) and DE translations are authored during implementation.

## 3. Integrity test updates (`questionnaireIntegrity.test.ts`)

Replace the "contains no data questions yet" test with:

- Exactly 22 `DataQuestion` entries exist (`isDataQuestion` count === 22).
- All 22 `kpiKey` values are unique.
- All 22 have `referencePeriod` and `unit` set.
- All 22 have `subSection === "performance_data"`.
- No `SIGNAL_MAPPINGS` entry references a data-question ID (extend the existing "no SIGNAL_MAPPINGS entry references a data question" test to run over the full 83-question set — it already does, just needs data to exercise it).

The "full questionnaire passes `validateQuestionSet`" test continues to run over all 83 questions unchanged.

## 4. Verification

- `npx vitest run` — full suite green, including `scoringBaseline.test.ts` with **unchanged frozen constants**. If it fails, the failure indicates the new data questions are leaking into a scoring path (e.g. via `category` collision or a missing `isDataQuestion` filter) — fix the leak in the consuming code, never the frozen constants.
- `npm run build` — clean.
- `get_advisors` on Supabase project `xrypgosuyfdkkqafftae` — clean for `assessment_kpi_values`.

## 5. Execution order

1. Apply Supabase migration (independent of code changes).
2. Add 22 `DataQuestion` entries to `questionnaire.ts`.
3. Update `questionnaireIntegrity.test.ts`.
4. Run full test suite + build.
5. Single commit: `feat: assessment_kpi_values table and 22 KPI data questions — kpi-questions-p1`.
6. Push to `main`.
