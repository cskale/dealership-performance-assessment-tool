# KPI Data Questions Phase 1 (kpi-questions-p1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `assessment_kpi_values` Supabase table (with RLS) and add 22 `DataQuestion` entries to `questionnaire.ts`, bringing the questionnaire from 61 to 83 questions while keeping all scoring output byte-for-byte identical.

**Architecture:** A new Postgres table stores numeric KPI inputs per assessment, with RLS mirroring the existing `assessments` table policies (owner via `user_id`, coach via `coach_dealership_assignments`, OEM via the existing `user_can_access_assessment_as_oem` function). The 22 `DataQuestion` entries are appended to the end of each module's `questions[]` array using the `kind: "data"` discriminant from the `kpi-questions-p0` refactor — they carry no `weight` and are excluded from scoring by the existing `getScoredQuestions` gateway.

**Tech Stack:** React 18 + TypeScript + Vite, Supabase (Postgres + RLS), Vitest, Zod (`questionSchema.ts`).

**Spec:** `docs/superpowers/specs/2026-06-13-kpi-questions-p1-design.md`

---

## Commit policy (deviation from default)

Per the spec, this work lands as a **single commit and push** at the end (Task 9):
`feat: assessment_kpi_values table and 22 KPI data questions — kpi-questions-p1`

Tasks 1–8 do **not** commit individually. Each task still ends with a verification step so problems are caught early, but `git add`/`git commit` only happens in Task 9.

---

### Task 1: Supabase migration — `assessment_kpi_values` table + RLS

**Files:** None (Supabase migration via MCP — no local files)

- [ ] **Step 1: Apply the migration**

Use `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `create_assessment_kpi_values`
- `query`:

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

ALTER TABLE public.assessment_kpi_values ENABLE ROW LEVEL SECURITY;

-- Dealer (owner) full CRUD — mirrors assessments_select/insert/update/delete (auth.uid() = user_id)
CREATE POLICY kpi_values_select ON public.assessment_kpi_values
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_kpi_values.assessment_id
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY kpi_values_insert ON public.assessment_kpi_values
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_kpi_values.assessment_id
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY kpi_values_update ON public.assessment_kpi_values
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_kpi_values.assessment_id
        AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_kpi_values.assessment_id
        AND a.user_id = auth.uid()
    )
  );

CREATE POLICY kpi_values_delete ON public.assessment_kpi_values
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_kpi_values.assessment_id
        AND a.user_id = auth.uid()
    )
  );

-- Coach SELECT — mirrors "Coaches can view assessments for assigned dealerships"
CREATE POLICY "Coaches can view kpi values for assigned dealerships" ON public.assessment_kpi_values
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_dealership_assignments cda
      WHERE cda.dealership_id = assessment_kpi_values.dealership_id
        AND cda.coach_user_id = auth.uid()
        AND cda.is_active = true
    )
  );

-- OEM SELECT — reuses existing SECURITY DEFINER function, no new function needed
CREATE POLICY "OEM admins can view network kpi values" ON public.assessment_kpi_values
  FOR SELECT
  USING (public.user_can_access_assessment_as_oem(dealership_id));
```

- [ ] **Step 2: Verify policies and indexes were created**

Use `mcp__claude_ai_Supabase__execute_sql` with `project_id`: `xrypgosuyfdkkqafftae`:

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'assessment_kpi_values' ORDER BY policyname;
SELECT indexname FROM pg_indexes WHERE tablename = 'assessment_kpi_values' ORDER BY indexname;
```

Expected: 6 policies (`kpi_values_select`, `kpi_values_insert`, `kpi_values_update`, `kpi_values_delete`, `Coaches can view kpi values for assigned dealerships`, `OEM admins can view network kpi values`) and 3 indexes (`assessment_kpi_values_pkey`, `idx_kpi_values_dealership_kpi`, `idx_kpi_values_assessment`).

- [ ] **Step 3: Run advisors and fix any findings**

Use `mcp__claude_ai_Supabase__get_advisors` with `project_id`: `xrypgosuyfdkkqafftae`, `type`: `security`, then again with `type`: `performance`. If anything is flagged for `assessment_kpi_values`, fix it with a follow-up `apply_migration` call (e.g. `fix_assessment_kpi_values_advisors`) before proceeding. If nothing is flagged for this table, proceed.

---

### Task 2: Make `scoringBaseline.test.ts` fixture robust to non-scored questions

**Why this task exists:** `buildFixtureAnswers()` currently assigns `answers[q.id] = (index % 5) + 1` to **every** question in iteration order, incrementing a single global `index`. Tasks 3–7 append `DataQuestion` entries to the end of each section's `questions[]`. Once those exist, the global index would shift for every section that comes after the one being modified, changing the `(index % 5) + 1` cycle fed to scored questions in later sections — silently changing `EXPECTED_SECTION_SCORES` / `EXPECTED_OVERALL_SCORE` / `EXPECTED_CONFIDENCE` even though no scored question changed. This is the "leak" the spec warns about. Fix it now, before any data questions exist, so the fixture is correct throughout Tasks 3–7.

**Files:**
- Modify: `src/__tests__/scoringBaseline.test.ts:1-19`
- Test: `src/__tests__/scoringBaseline.test.ts` (existing tests — must stay green)

- [ ] **Step 1: Run the existing baseline test to confirm it's currently green**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests) — this is the "before" state with 0 data questions.

- [ ] **Step 2: Update `buildFixtureAnswers` to iterate only scored questions**

In `src/__tests__/scoringBaseline.test.ts`, change the import and the function body:

```typescript
import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import {
  calculateAllSectionScores,
  calculateWeightedScore,
  calculateAllConfidenceMetrics,
  getScoredQuestions,
} from '@/lib/scoringEngine';

function buildFixtureAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  let index = 0;
  for (const section of questionnaire.sections) {
    for (const q of getScoredQuestions(section.questions)) {
      answers[q.id] = (index % 5) + 1;
      index++;
    }
  }
  return answers;
}
```

This is the only change — `EXPECTED_SECTION_SCORES`, `EXPECTED_OVERALL_SCORE`, `EXPECTED_CONFIDENCE`, and all `it(...)` blocks stay exactly as they are.

- [ ] **Step 3: Run the test again to confirm it's still green**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests) — identical output, since `getScoredQuestions` returns the same set as `section.questions` while there are 0 data questions. This confirms the refactor is behavior-preserving *before* Tasks 3–7 add data questions.

---

### Task 3: Add 2 KPI data questions to New Vehicle Sales (NVS)

**Files:**
- Modify: `src/data/questionnaire.ts` (end of `new-vehicle-sales` section's `questions[]`, immediately after question `nvs-13`)
- Test: `src/__tests__/scoringBaseline.test.ts` (regression check only, no edits)

- [ ] **Step 1: Insert `nvs-kpi-4` and `nvs-kpi-7` after `nvs-13`**

Find this exact text (the end of `nvs-13` and the start of the `used-vehicle-sales` section):

```typescript
        }
      ]
    },
    {
      id: "used-vehicle-sales",
```

Replace it with:

```typescript
        },
        {
          id: "nvs-kpi-4",
          kind: "data",
          text: "What is your average front-end gross profit per new vehicle retailed?",
          description: "Average front-end gross profit (selling price minus invoice cost minus discounts) per new vehicle retailed, before finance and insurance income.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "nvs_gross_profit_per_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 15000 },
          formula: {
            expression: "Total front-end gross profit on new vehicles sold ÷ number of new vehicles retailed",
            example: "€420,000 total front-end gross ÷ 120 units sold = €3,500 per unit",
            dataSource: "DMS sales journal — new vehicle deals report (front-end gross by unit)"
          },
          translations: {
            en: {
              text: "What is your average front-end gross profit per new vehicle retailed?",
              description: "Average front-end gross profit (selling price minus invoice cost minus discounts) per new vehicle retailed, before finance and insurance income."
            },
            de: {
              text: "Wie hoch ist Ihr durchschnittlicher Frontend-Bruttoertrag pro verkauftem Neufahrzeug?",
              description: "Durchschnittlicher Frontend-Bruttoertrag (Verkaufspreis minus Einstandspreis minus Rabatte) pro verkauftem Neufahrzeug, vor Finanzierungs- und Versicherungserträgen."
            }
          }
        },
        {
          id: "nvs-kpi-7",
          kind: "data",
          text: "What percentage of your new vehicle leads receive a response within 1 hour?",
          description: "Share of all new vehicle sales leads (phone, web form, third-party portals) that receive a first response from a sales consultant within 60 minutes of arrival.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "nvs_lead_response_1h_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Number of new vehicle leads responded to within 1 hour ÷ total new vehicle leads received × 100",
            example: "342 leads responded to within 1 hour ÷ 480 total leads × 100 = 71.3%",
            dataSource: "CRM lead response time report (lead arrival timestamp vs. first outbound activity timestamp)"
          },
          translations: {
            en: {
              text: "What percentage of your new vehicle leads receive a response within 1 hour?",
              description: "Share of all new vehicle sales leads (phone, web form, third-party portals) that receive a first response from a sales consultant within 60 minutes of arrival."
            },
            de: {
              text: "Welcher Anteil Ihrer Neuwagen-Leads erhält innerhalb von 1 Stunde eine Antwort?",
              description: "Anteil aller Neuwagen-Verkaufsanfragen (Telefon, Webformular, Drittportale), die innerhalb von 60 Minuten nach Eingang eine erste Antwort von einem Verkaufsberater erhalten."
            }
          }
        }
      ]
    },
    {
      id: "used-vehicle-sales",
```

- [ ] **Step 2: Verify the scoring baseline is unaffected**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests). The 2 new questions are `kind: "data"`, so `getScoredQuestions` (used by `buildFixtureAnswers` after Task 2) excludes them — NVS scored question indices and all downstream section indices are unchanged.

Note: `npx vitest run src/__tests__/questionnaireIntegrity.test.ts` will now FAIL (the old "contains no data questions yet" test expects 0). This is expected — it's fixed in Task 8.

---

### Task 4: Add 5 KPI data questions to Used Vehicle Sales (UVS)

**Files:**
- Modify: `src/data/questionnaire.ts` (end of `used-vehicle-sales` section's `questions[]`, immediately after question `uvs-13`)
- Test: `src/__tests__/scoringBaseline.test.ts` (regression check only, no edits)

- [ ] **Step 1: Insert `uvs-kpi-2`, `uvs-kpi-3`, `uvs-kpi-5`, `uvs-kpi-6`, `uvs-kpi-7` after `uvs-13`**

Find this exact text (the end of `uvs-13` and the start of the `service-performance` section):

```typescript
        }
      ]
    },
    {
      id: "service-performance",
```

Replace it with:

```typescript
        },
        {
          id: "uvs-kpi-2",
          kind: "data",
          text: "What is your average days-to-sale for used vehicle stock?",
          description: "Average number of days a used vehicle remains in stock from intake to retail sale (Standtage).",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_days_to_sale",
          unit: "days",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 365 },
          formula: {
            expression: "Sum of days in stock for all used vehicles sold in the period ÷ number of used vehicles sold",
            example: "2,640 total stock-days across 60 units sold ÷ 60 = 44 days average days-to-sale",
            dataSource: "DMS used vehicle inventory aging report"
          },
          translations: {
            en: {
              text: "What is your average days-to-sale for used vehicle stock?",
              description: "Average number of days a used vehicle remains in stock from intake to retail sale (Standtage)."
            },
            de: {
              text: "Wie hoch sind Ihre durchschnittlichen Standtage für Gebrauchtwagenbestand?",
              description: "Durchschnittliche Anzahl der Tage, die ein Gebrauchtwagen von der Einlagerung bis zum Verkauf im Bestand verbleibt (Standtage)."
            }
          }
        },
        {
          id: "uvs-kpi-3",
          kind: "data",
          text: "What is your average front-end gross profit per used vehicle retailed?",
          description: "Average front-end gross profit per used vehicle retailed (sale price minus acquisition cost and reconditioning, before finance and insurance income).",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_gross_profit_per_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 15000 },
          formula: {
            expression: "Total front-end gross profit on used vehicles sold ÷ number of used vehicles retailed",
            example: "€180,000 total front-end gross ÷ 60 units sold = €3,000 per unit",
            dataSource: "DMS used vehicle deals report (Bruttoertrag per unit)"
          },
          translations: {
            en: {
              text: "What is your average front-end gross profit per used vehicle retailed?",
              description: "Average front-end gross profit per used vehicle retailed (sale price minus acquisition cost and reconditioning, before finance and insurance income)."
            },
            de: {
              text: "Wie hoch ist Ihr durchschnittlicher Frontend-Bruttoertrag pro verkauftem Gebrauchtwagen?",
              description: "Durchschnittlicher Frontend-Bruttoertrag pro verkauftem Gebrauchtwagen (Verkaufspreis minus Einkaufspreis und Aufbereitungskosten, vor F&I-Erträgen)."
            }
          }
        },
        {
          id: "uvs-kpi-5",
          kind: "data",
          text: "What is your average vehicle reconditioning cost per unit?",
          description: "Average reconditioning cost (parts, labour, and outsourced services) per used vehicle prepared for retail sale.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_recon_cost_per_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 10000 },
          formula: {
            expression: "Total reconditioning cost across all used vehicles prepared ÷ number of used vehicles prepared",
            example: "€42,000 total reconditioning cost ÷ 60 units = €700 per unit",
            dataSource: "DMS reconditioning work order costs, summed by stock number"
          },
          translations: {
            en: {
              text: "What is your average vehicle reconditioning cost per unit?",
              description: "Average reconditioning cost (parts, labour, and outsourced services) per used vehicle prepared for retail sale."
            },
            de: {
              text: "Wie hoch sind Ihre durchschnittlichen Aufbereitungskosten pro Gebrauchtfahrzeug?",
              description: "Durchschnittliche Aufbereitungskosten (Teile, Arbeitszeit und Fremdleistungen) pro für den Verkauf vorbereitetem Gebrauchtfahrzeug."
            }
          }
        },
        {
          id: "uvs-kpi-6",
          kind: "data",
          text: "What is your used-to-new retail ratio (UV units / NV units)?",
          description: "Ratio of used vehicle retail units sold to new vehicle retail units sold in the same period.",
          type: "ratio",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_used_to_new_ratio",
          unit: "x:1",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 10 },
          formula: {
            expression: "Used vehicle units retailed ÷ new vehicle units retailed",
            example: "60 used units ÷ 120 new units = 0.5:1",
            dataSource: "DMS sales summary — new vs. used unit counts"
          },
          translations: {
            en: {
              text: "What is your used-to-new retail ratio (UV units / NV units)?",
              description: "Ratio of used vehicle retail units sold to new vehicle retail units sold in the same period."
            },
            de: {
              text: "Wie hoch ist Ihr Verhältnis von Gebrauchtwagen- zu Neuwagenverkäufen (GW-Einheiten / NW-Einheiten)?",
              description: "Verhältnis der verkauften Gebrauchtwagen-Einheiten zu den verkauften Neuwagen-Einheiten im selben Zeitraum."
            }
          }
        },
        {
          id: "uvs-kpi-7",
          kind: "data",
          text: "What percentage of used vehicle appraisals result in a purchase?",
          description: "Share of used vehicle appraisals (trade-ins and outright purchase offers) that convert into an actual purchase by the dealership.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_appraisal_to_buy_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Number of appraisals resulting in a purchase ÷ total appraisals conducted × 100",
            example: "45 appraisals purchased ÷ 150 appraisals conducted × 100 = 30%",
            dataSource: "Appraisal tool / CRM appraisal log outcome report"
          },
          translations: {
            en: {
              text: "What percentage of used vehicle appraisals result in a purchase?",
              description: "Share of used vehicle appraisals (trade-ins and outright purchase offers) that convert into an actual purchase by the dealership."
            },
            de: {
              text: "Welcher Anteil Ihrer Gebrauchtwagen-Bewertungen führt zu einem Ankauf?",
              description: "Anteil der Gebrauchtwagen-Bewertungen (Inzahlungnahmen und Ankaufsangebote), die zu einem tatsächlichen Ankauf durch den Betrieb führen."
            }
          }
        }
      ]
    },
    {
      id: "service-performance",
```

- [ ] **Step 2: Verify the scoring baseline is unaffected**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests).

---

### Task 5: Add 3 KPI data questions to Service Performance (SVC)

**Files:**
- Modify: `src/data/questionnaire.ts` (end of `service-performance` section's `questions[]`, immediately after the last SVC question)
- Test: `src/__tests__/scoringBaseline.test.ts` (regression check only, no edits)

- [ ] **Step 1: Insert `svc-kpi-2`, `svc-kpi-5`, `svc-kpi-6` at the end of the SVC section**

Find this exact text (the end of the last SVC question and the start of the `parts-inventory` section):

```typescript
        }
      ]
    },
    {
      id: "parts-inventory",
```

Replace it with:

```typescript
        },
        {
          id: "svc-kpi-2",
          kind: "data",
          text: "What is your average hours sold per repair order?",
          description: "Average number of labour hours sold per repair order (RO) across all workshop visits.",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "svc_hours_per_ro",
          unit: "hours",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 20 },
          formula: {
            expression: "Total labour hours sold ÷ number of repair orders",
            example: "2,850 labour hours sold ÷ 1,500 repair orders = 1.9 hours per RO",
            dataSource: "DMS service invoicing report (sold hours by repair order)"
          },
          translations: {
            en: {
              text: "What is your average hours sold per repair order?",
              description: "Average number of labour hours sold per repair order (RO) across all workshop visits."
            },
            de: {
              text: "Wie viele Arbeitsstunden verkaufen Sie durchschnittlich pro Reparaturauftrag?",
              description: "Durchschnittliche Anzahl verkaufter Arbeitsstunden pro Reparaturauftrag (RO) über alle Werkstattbesuche."
            }
          }
        },
        {
          id: "svc-kpi-5",
          kind: "data",
          text: "What is your effective labour rate (total labour revenue / hours sold)?",
          description: "Effective labour rate realised across all service work — total labour revenue divided by total hours sold, reflecting the blended rate after discounts and goodwill.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "svc_effective_labour_rate",
          unit: "EUR/hr",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 500 },
          formula: {
            expression: "Total labour revenue ÷ total labour hours sold",
            example: "€299,250 labour revenue ÷ 2,850 hours sold = €105/hr effective rate",
            dataSource: "DMS service invoicing report — labour revenue and sold hours totals"
          },
          translations: {
            en: {
              text: "What is your effective labour rate (total labour revenue / hours sold)?",
              description: "Effective labour rate realised across all service work — total labour revenue divided by total hours sold, reflecting the blended rate after discounts and goodwill."
            },
            de: {
              text: "Wie hoch ist Ihr effektiver Stundenverrechnungssatz (Gesamtarbeitserlös / verkaufte Stunden)?",
              description: "Effektiv erzielter Stundenverrechnungssatz über alle Werkstattaufträge: Gesamtarbeitserlös geteilt durch verkaufte Stunden, einschließlich Rabatten und Kulanz."
            }
          }
        },
        {
          id: "svc-kpi-6",
          kind: "data",
          text: "What percentage of your service capacity is currently booked?",
          description: "Current workshop capacity utilisation — booked technician hours as a percentage of available productive technician hours.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "svc_workshop_loading_pct",
          unit: "%",
          referencePeriod: "current",
          validRange: { min: 0, max: 150 },
          formula: {
            expression: "Booked technician hours for the period ÷ available productive technician hours × 100",
            example: "1,680 booked hours ÷ 1,600 available hours × 100 = 105%",
            dataSource: "Service scheduling / DMS workshop loading report (booked vs. available technician hours)"
          },
          translations: {
            en: {
              text: "What percentage of your service capacity is currently booked?",
              description: "Current workshop capacity utilisation — booked technician hours as a percentage of available productive technician hours."
            },
            de: {
              text: "Wie hoch ist Ihre aktuelle Werkstattauslastung (gebuchte Stunden / verfügbare Kapazität)?",
              description: "Aktuelle Auslastung der Werkstattkapazität: gebuchte Technikerstunden als Prozentsatz der verfügbaren produktiven Technikerstunden."
            }
          }
        }
      ]
    },
    {
      id: "parts-inventory",
```

- [ ] **Step 2: Verify the scoring baseline is unaffected**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests).

---

### Task 6: Add 5 KPI data questions to Parts & Inventory (PRT)

**Files:**
- Modify: `src/data/questionnaire.ts` (end of `parts-inventory` section's `questions[]`, immediately after question `pts-10`)
- Test: `src/__tests__/scoringBaseline.test.ts` (regression check only, no edits)

- [ ] **Step 1: Insert `prt-kpi-1`, `prt-kpi-3`, `prt-kpi-5`, `prt-kpi-6`, `prt-kpi-7` after `pts-10`**

Find this exact text (the end of `pts-10` and the start of the `financial-operations` section):

```typescript
        }
      ]
    },
    {
      id: "financial-operations",
```

Replace it with:

```typescript
        },
        {
          id: "prt-kpi-1",
          kind: "data",
          text: "What is your parts department gross profit margin?",
          description: "Gross profit margin on parts sales — gross profit as a percentage of total parts revenue.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_gross_margin_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Parts gross profit ÷ parts sales revenue × 100",
            example: "€58,000 parts gross profit ÷ €200,000 parts revenue × 100 = 29%",
            dataSource: "DMS parts department P&L (gross profit and revenue)"
          },
          translations: {
            en: {
              text: "What is your parts department gross profit margin?",
              description: "Gross profit margin on parts sales — gross profit as a percentage of total parts revenue."
            },
            de: {
              text: "Wie hoch ist Ihre Bruttomarge im Teileverkauf?",
              description: "Bruttoertragsmarge im Teilegeschäft: Bruttoertrag als Prozentsatz des gesamten Teileumsatzes."
            }
          }
        },
        {
          id: "prt-kpi-3",
          kind: "data",
          text: "What is your parts inventory turn rate (annualised)?",
          description: "Annualised parts inventory turn rate — how many times the parts inventory value is sold through and replenished per year.",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_inventory_turns",
          unit: "turns/yr",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 30 },
          formula: {
            expression: "Annual cost of parts sold ÷ average parts inventory value (at cost)",
            example: "€1,800,000 annual cost of parts sold ÷ €300,000 average inventory value = 6 turns/year",
            dataSource: "DMS parts inventory valuation + annual parts cost of sales from management accounts"
          },
          translations: {
            en: {
              text: "What is your parts inventory turn rate (annualised)?",
              description: "Annualised parts inventory turn rate — how many times the parts inventory value is sold through and replenished per year."
            },
            de: {
              text: "Wie hoch ist Ihr Teile-Lagerumschlag (Teileumschlag) pro Jahr?",
              description: "Annualisierter Lagerumschlag im Teilebereich: wie oft der Wert des Teilebestands pro Jahr verkauft und wieder aufgefüllt wird."
            }
          }
        },
        {
          id: "prt-kpi-5",
          kind: "data",
          text: "What is your average parts sales value per repair order?",
          description: "Average value of parts sold per repair order in the workshop.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_sales_per_ro",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 5000 },
          formula: {
            expression: "Total parts revenue from workshop repair orders ÷ number of repair orders",
            example: "€112,500 parts revenue ÷ 1,500 repair orders = €75 per RO",
            dataSource: "DMS service invoicing report — parts revenue by repair order"
          },
          translations: {
            en: {
              text: "What is your average parts sales value per repair order?",
              description: "Average value of parts sold per repair order in the workshop."
            },
            de: {
              text: "Wie hoch ist Ihr durchschnittlicher Teileumsatz pro Reparaturauftrag?",
              description: "Durchschnittlicher Wert der verkauften Teile pro Reparaturauftrag in der Werkstatt."
            }
          }
        },
        {
          id: "prt-kpi-6",
          kind: "data",
          text: "What percentage of your parts sales come from wholesale/external customers?",
          description: "Share of total parts sales revenue generated from wholesale/trade customers and external workshops, rather than the dealership's own service department or retail counter.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_wholesale_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Wholesale parts revenue ÷ total parts revenue × 100",
            example: "€60,000 wholesale revenue ÷ €200,000 total parts revenue × 100 = 30%",
            dataSource: "DMS parts sales report segmented by customer type (internal / retail / wholesale)"
          },
          translations: {
            en: {
              text: "What percentage of your parts sales come from wholesale/external customers?",
              description: "Share of total parts sales revenue generated from wholesale/trade customers and external workshops, rather than the dealership's own service department or retail counter."
            },
            de: {
              text: "Welcher Anteil Ihres Teileumsatzes entfällt auf Großhandel/externe Kunden?",
              description: "Anteil des gesamten Teileumsatzes, der von Großhandels- und externen Werkstattkunden stammt, im Gegensatz zur eigenen Werkstatt oder dem Einzelhandelsverkauf."
            }
          }
        },
        {
          id: "prt-kpi-7",
          kind: "data",
          text: "How many days does a typical parts back-order take to resolve?",
          description: "Typical number of days it takes to resolve a parts back-order (from order placement to part availability) for a part not currently in stock.",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_backorder_days",
          unit: "days",
          referencePeriod: "current",
          validRange: { min: 0, max: 60 },
          formula: {
            expression: "Average elapsed days between back-order placement and parts receipt across recent back-orders",
            example: "Average of 6 days across the last 20 back-orders resolved = 6 days",
            dataSource: "DMS parts ordering system — back-order open/close timestamps"
          },
          translations: {
            en: {
              text: "How many days does a typical parts back-order take to resolve?",
              description: "Typical number of days it takes to resolve a parts back-order (from order placement to part availability) for a part not currently in stock."
            },
            de: {
              text: "Wie viele Tage dauert die Bearbeitung einer typischen Teile-Nachbestellung?",
              description: "Typische Anzahl an Tagen, die die Bearbeitung einer Teile-Nachbestellung (von Bestellung bis Verfügbarkeit) für ein nicht vorrätiges Teil in Anspruch nimmt."
            }
          }
        }
      ]
    },
    {
      id: "financial-operations",
```

- [ ] **Step 2: Verify the scoring baseline is unaffected**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests).

---

### Task 7: Add 7 KPI data questions to Financial Operations (FIN)

**Files:**
- Modify: `src/data/questionnaire.ts` (end of `financial-operations` section's `questions[]`, immediately after question `fin-10` — this is the end of the `questionnaire` object)
- Test: `src/__tests__/scoringBaseline.test.ts` (regression check only, no edits)

- [ ] **Step 1: Insert `fin-kpi-1` through `fin-kpi-7` after `fin-10`**

Find this exact text (the end of `fin-10` and the close of the `questionnaire` object):

```typescript
        }
      ]
    }
  ]
};
```

Replace it with:

```typescript
        },
        {
          id: "fin-kpi-1",
          kind: "data",
          text: "What is your dealership's net profit as a percentage of total revenue?",
          description: "Dealership net profit (after all operating expenses, before tax) as a percentage of total revenue for the last financial year.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_net_profit_pct",
          unit: "%",
          referencePeriod: "last_financial_year",
          validRange: { min: -20, max: 25 },
          formula: {
            expression: "Net profit before tax ÷ total revenue × 100",
            example: "€450,000 net profit ÷ €18,000,000 total revenue × 100 = 2.5%",
            dataSource: "Annual management accounts / profit and loss statement"
          },
          translations: {
            en: {
              text: "What is your dealership's net profit as a percentage of total revenue?",
              description: "Dealership net profit (after all operating expenses, before tax) as a percentage of total revenue for the last financial year."
            },
            de: {
              text: "Wie hoch ist der Nettogewinn Ihres Betriebs in Prozent des Gesamtumsatzes?",
              description: "Nettogewinn des Betriebs (nach allen Betriebskosten, vor Steuern) als Prozentsatz des Gesamtumsatzes im letzten Geschäftsjahr."
            }
          }
        },
        {
          id: "fin-kpi-2",
          kind: "data",
          text: "What is your total variable gross profit per new vehicle unit (front + back combined)?",
          description: "Total variable gross profit per new vehicle unit retailed, combining front-end (vehicle sale) and back-end (finance, insurance, accessories) gross profit.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_total_gp_per_nv_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 20000 },
          formula: {
            expression: "(Front-end gross profit + back-end/F&I gross profit on new vehicles) ÷ new vehicle units retailed",
            example: "(€420,000 front-end + €180,000 back-end) ÷ 120 units = €5,000 per unit",
            dataSource: "DMS new vehicle deals report — combined front and back gross by unit"
          },
          translations: {
            en: {
              text: "What is your total variable gross profit per new vehicle unit (front + back combined)?",
              description: "Total variable gross profit per new vehicle unit retailed, combining front-end (vehicle sale) and back-end (finance, insurance, accessories) gross profit."
            },
            de: {
              text: "Wie hoch ist Ihr gesamter variabler Bruttoertrag pro Neuwagen-Einheit (Front- und Backend kombiniert)?",
              description: "Gesamter variabler Bruttoertrag pro verkaufter Neuwagen-Einheit, bestehend aus Frontend (Fahrzeugverkauf) und Backend (Finanzierung, Versicherung, Zubehör)."
            }
          }
        },
        {
          id: "fin-kpi-3",
          kind: "data",
          text: "What is your floorplan interest cost as a percentage of new vehicle gross profit?",
          description: "Floorplan (inventory financing) interest cost as a percentage of new vehicle gross profit, indicating how much new vehicle margin is consumed by financing stock.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_floorplan_cost_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Floorplan interest expense on new vehicle stock ÷ total new vehicle gross profit × 100",
            example: "€21,000 floorplan interest ÷ €420,000 new vehicle gross profit × 100 = 5%",
            dataSource: "Management accounts — floorplan interest expense line vs. new vehicle department gross profit"
          },
          translations: {
            en: {
              text: "What is your floorplan interest cost as a percentage of new vehicle gross profit?",
              description: "Floorplan (inventory financing) interest cost as a percentage of new vehicle gross profit, indicating how much new vehicle margin is consumed by financing stock."
            },
            de: {
              text: "Wie hoch sind Ihre Einstandsfinanzierungskosten (Floorplan) im Verhältnis zum Neuwagen-Bruttoertrag?",
              description: "Zinskosten der Einstandsfinanzierung (Floorplan) für den Neuwagenbestand als Prozentsatz des gesamten Neuwagen-Bruttoertrags."
            }
          }
        },
        {
          id: "fin-kpi-4",
          kind: "data",
          text: "What is your revenue per employee across the whole dealership?",
          description: "Total dealership revenue divided by total headcount (full-time equivalent employees) for the last financial year.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_revenue_per_employee",
          unit: "EUR",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 2000000 },
          formula: {
            expression: "Total annual revenue ÷ average full-time equivalent (FTE) headcount",
            example: "€18,000,000 total revenue ÷ 45 FTE = €400,000 revenue per employee",
            dataSource: "Annual management accounts (revenue) + HR/payroll FTE headcount records"
          },
          translations: {
            en: {
              text: "What is your revenue per employee across the whole dealership?",
              description: "Total dealership revenue divided by total headcount (full-time equivalent employees) for the last financial year."
            },
            de: {
              text: "Wie hoch ist Ihr Umsatz pro Mitarbeiter über den gesamten Betrieb?",
              description: "Gesamtumsatz des Betriebs geteilt durch die durchschnittliche Anzahl der Vollzeitäquivalente (VZÄ) im letzten Geschäftsjahr."
            }
          }
        },
        {
          id: "fin-kpi-5",
          kind: "data",
          text: "What is your current debtor days outstanding (accounts receivable)?",
          description: "Current debtor days outstanding — the average number of days it takes to collect accounts receivable (Debitorenlaufzeit).",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_debtor_days",
          unit: "days",
          referencePeriod: "current",
          validRange: { min: 0, max: 180 },
          formula: {
            expression: "(Accounts receivable ÷ annual credit sales) × 365",
            example: "(€450,000 receivables ÷ €18,000,000 annual sales) × 365 = 9.1 days",
            dataSource: "Balance sheet (accounts receivable) + annual revenue from management accounts"
          },
          translations: {
            en: {
              text: "What is your current debtor days outstanding (accounts receivable)?",
              description: "Current debtor days outstanding — the average number of days it takes to collect accounts receivable (Debitorenlaufzeit)."
            },
            de: {
              text: "Wie hoch ist Ihre aktuelle Debitorenlaufzeit (Forderungslaufzeit)?",
              description: "Aktuelle Debitorenlaufzeit: die durchschnittliche Anzahl an Tagen, die zum Einzug offener Forderungen benötigt wird."
            }
          }
        },
        {
          id: "fin-kpi-6",
          kind: "data",
          text: "What percentage of your total gross profit comes from aftersales (service + parts)?",
          description: "Share of total dealership gross profit generated by aftersales (service plus parts departments combined), versus vehicle sales departments.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_aftersales_gp_share_pct",
          unit: "%",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "(Service gross profit + parts gross profit) ÷ total dealership gross profit × 100",
            example: "(€620,000 service GP + €580,000 parts GP) ÷ €2,400,000 total GP × 100 = 50%",
            dataSource: "Annual departmental profit and loss — gross profit by department"
          },
          translations: {
            en: {
              text: "What percentage of your total gross profit comes from aftersales (service + parts)?",
              description: "Share of total dealership gross profit generated by aftersales (service plus parts departments combined), versus vehicle sales departments."
            },
            de: {
              text: "Welcher Anteil Ihres Gesamtbruttoertrags stammt aus dem Aftersales-Geschäft (Service und Teile)?",
              description: "Anteil des gesamten Bruttoertrags des Betriebs, der aus dem Aftersales-Geschäft (Service- und Teileabteilung zusammen) stammt, im Vergleich zu den Verkaufsabteilungen."
            }
          }
        },
        {
          id: "fin-kpi-7",
          kind: "data",
          text: "What is your selling expense as a percentage of total variable gross profit?",
          description: "Total selling (sales department operating) expenses as a percentage of total variable gross profit, indicating how much of the gross margin is consumed by sales overhead.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_selling_expense_pct",
          unit: "%",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 200 },
          formula: {
            expression: "Total selling expenses ÷ total variable gross profit × 100",
            example: "€1,080,000 selling expenses ÷ €2,400,000 total variable gross profit × 100 = 45%",
            dataSource: "Annual departmental profit and loss — selling expense lines vs. total variable gross profit"
          },
          translations: {
            en: {
              text: "What is your selling expense as a percentage of total variable gross profit?",
              description: "Total selling (sales department operating) expenses as a percentage of total variable gross profit, indicating how much of the gross margin is consumed by sales overhead."
            },
            de: {
              text: "Wie hoch sind Ihre Vertriebskosten im Verhältnis zum gesamten variablen Bruttoertrag?",
              description: "Gesamte Vertriebskosten (Betriebskosten der Verkaufsabteilung) als Prozentsatz des gesamten variablen Bruttoertrags."
            }
          }
        }
      ]
    }
  ]
};
```

- [ ] **Step 2: Verify the scoring baseline is unaffected**

Run: `npx vitest run src/__tests__/scoringBaseline.test.ts`
Expected: PASS (4 tests).

---

### Task 8: Update `questionnaireIntegrity.test.ts` for the 22 data questions

**Files:**
- Modify: `src/__tests__/questionnaireIntegrity.test.ts` (entire file)
- Test: `src/__tests__/questionnaireIntegrity.test.ts`

- [ ] **Step 1: Replace the "contains no data questions yet" test and extend the SIGNAL_MAPPINGS test**

Replace the full contents of `src/__tests__/questionnaireIntegrity.test.ts` with:

```typescript
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

  it('contains exactly 22 data questions with unique kpiKeys, referencePeriod, unit, and subSection "performance_data"', () => {
    const dataQuestions = allQuestions.filter(isDataQuestion);
    expect(dataQuestions.length).toBe(22);

    const kpiKeys = dataQuestions.map(q => q.kpiKey);
    expect(new Set(kpiKeys).size).toBe(22);

    for (const q of dataQuestions) {
      expect(q.referencePeriod).toBeTruthy();
      expect(q.unit).toBeTruthy();
      expect(q.subSection).toBe('performance_data');
    }
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

- [ ] **Step 2: Run the integrity tests**

Run: `npx vitest run src/__tests__/questionnaireIntegrity.test.ts`
Expected: PASS (4 tests).

---

### Task 9: Full verification, commit, and push

**Files:** None (verification + git only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All test files PASS, including `scoringBaseline.test.ts` (frozen constants unchanged) and `questionnaireIntegrity.test.ts` (22 data questions). If `scoringBaseline.test.ts` fails here, do not edit `EXPECTED_SECTION_SCORES` / `EXPECTED_OVERALL_SCORE` / `EXPECTED_CONFIDENCE` — find and fix the leak (most likely cause: a question was inserted in the wrong place, or `category: "performance_data"` collided with an existing category somewhere it shouldn't).

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: Clean build, no TypeScript errors. (`DataQuestionSchema` and the `Question` union from `kpi-questions-p0` will type-check the 22 new entries — `validRange`, `formula`, `kpiKey`, `referencePeriod`, `unit`, `subSection` are all valid optional/required `DataQuestion` fields, and none of the 22 entries include `weight` or `scale`.)

- [ ] **Step 3: Stage and commit**

```bash
git add src/data/questionnaire.ts src/__tests__/scoringBaseline.test.ts src/__tests__/questionnaireIntegrity.test.ts
git status
```

Expected `git status` output: only these 3 files staged as modified (the Supabase migration from Task 1 has no local file footprint).

```bash
git commit -m "$(cat <<'EOF'
feat: assessment_kpi_values table and 22 KPI data questions — kpi-questions-p1

Adds the assessment_kpi_values table (RLS mirroring assessments: owner
CRUD, coach + OEM read) and 22 DataQuestion entries across all 5 modules,
bringing the questionnaire from 61 to 83 questions. Scoring output is
unchanged (scoringBaseline.test.ts frozen constants still pass).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push to main**

```bash
git push
```

Expected: push succeeds, `git status` shows a clean working tree relative to `origin/main`.
