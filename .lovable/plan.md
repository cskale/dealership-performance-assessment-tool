# Prompt 2 plan: Results hero band

## Scope and files

- Update `src/pages/Results.tsx` to replace the Diagnosis placeholder with one responsive three-zone hero card.
- Make the smallest targeted update to `src/components/ActionPlan.tsx` needed for a hero link to focus/open the selected action; preserve all existing loading, filtering, editing, Kanban, and status-update behavior.
- Preserve the restored `prefer-const` suppression in `src/integrations/supabase/previewAuthStorage.ts`. The current workspace includes `6f0905d`, but its working copy has dropped that comment, so restore the exact comment before verification.
- Do not edit the protected files listed in the handoff, translations, migrations, department rows, or KPI cards.

## Hero data and behavior

### 1. Score ring
- Reuse the previous 120px SVG ring pattern with an 8px `neutral-200` track, tonal status arc, boundary ticks, count-up animation, and one-time terminus glow.
- Drive the ring only from `overallScore` for the currently selected assessment.
- Respect reduced-motion settings and keep status colour confined to the ring’s score encoding.

### 2. Maturity ladder and narrative
- Derive the current maturity through `getMaturityLevel`, keeping the helper call and all related memos above early returns and after `overallScore`.
- Render four ordered steps, with only the active label/marker using the maturity status colour; tracks, dividers, and inactive steps use neutral tokens.
- Recreate the existing real narrative pipeline from the selected assessment: questionnaire weights + `generateSignals(answers, weights)` + `detectSystemicPatterns(...)` feed `buildExecutiveNarrative(...)`.
- Show a two-line collapsed preview, then expand the full generated situation, diagnosis, and priority inline using `t('results.hero.readNarrative')`; no navigation and no fabricated summary copy.

### 3. Biggest lever and coverage
- Load module benchmarks with the existing `fetchModuleBenchmarks` fallback pattern and use the displayed assessment’s `scores`.
- For every assessed department, map its section ID with `sectionToModuleCode`, calculate `score - benchmark.meanScore`, filter to negative gaps, and choose the most negative value. If no department is below benchmark, do not invent a lever.
- Extend the existing assessment-action read to include action ID/title/department/status/priority. For the lever department, select the highest-priority non-completed action using `critical → high → medium → low`, with stable database order as the tie-breaker.
- Link that real action to `?tab=action-plan&action=<id>`. `ActionPlan` will consume only this optional parameter after its existing action load, reveal/open that matching action, and otherwise behave exactly as before.
- Build coverage from `Object.keys(scores).length`, `Object.keys(answers).length`, and `TOTAL_QUESTIONS`, replacing the three placeholders in `t('results.hero.coverage')`.
- Keep selected-assessment identity throughout: scores, answers, actions, benchmarks, coverage, and narrative all derive from `resultsData`, so dealer, coach, and OEM views use the dealership result currently on screen.

## Verified translation constraint

The existing dictionaries contain `results.hero.*` and `maturity.foundational/developing/advanced/leading`, but no `maturity.performing` key. To honor “existing keys only,” the ladder will use the repository’s translated four-level names returned by the mandated helper: Foundational, Developing, Advanced, Leading. No hard-coded or newly added user-facing translation text will be introduced.

## Validation

- Confirm the hero updates when selecting another assessment.
- Confirm narrative expansion stays inline.
- Confirm a lever action link opens the matching non-completed action in Action Plan and a missing eligible action does not produce a false link.
- Check desktop and 390px layouts for stacking and overflow.
- Run focused type checking, lint, production build, and relevant tests; confirm the `prefer-const` suppression remains present.
