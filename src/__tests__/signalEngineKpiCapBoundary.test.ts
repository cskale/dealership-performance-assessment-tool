import { describe, it, expect } from 'vitest';
import {
  generateSignals,
  instantiateActions,
  generateActionsFromAssessment,
} from '@/lib/signalEngine';

/**
 * Parity boundary test — Task 6 (action prioritiser) relaxed the Global Constraint
 * from "byte-identical to today" to "count + ordering unchanged for ≤10-candidate
 * assessments; for >10-candidate assessments the prioritiser's ROI ranking (not the
 * old severity-ordered first-10) decides which actions survive truncation".
 *
 * This fixture deliberately triggers weak answers across all 5 modules/50 questions
 * so that instantiateActions (capped at 15 internally) produces MORE than 10
 * candidate actions with no kpiValues/benchmarks supplied — the boundary the original
 * "byte-identical" language never covered.
 */
describe('generateActionsFromAssessment — parity above the 10-action cap', () => {
  const moduleIds = {
    nvs: 10, // nvs-1..nvs-10
    uvs: 10, // uvs-1..uvs-10
    svc: 12, // svc-1..svc-12
    pts: 10, // pts-1..pts-10
    fin: 8,  // fin-1..fin-8
  };

  const answers: Record<string, number> = {};
  const weights: Record<string, number> = {};
  for (const [prefix, count] of Object.entries(moduleIds)) {
    for (let i = 1; i <= count; i++) {
      const id = `${prefix}-${i}`;
      answers[id] = 2; // weak + critical (<= criticalScoreThreshold)
      weights[id] = 1.5; // high weight -> HIGH severity
    }
  }

  it('produces more than 10 candidate actions before the prioritiser truncates (no kpiValues/benchmarks)', () => {
    const signals = generateSignals(answers, weights);
    const candidates = instantiateActions(signals, 15);
    expect(candidates.length).toBeGreaterThan(10);
  });

  it('caps the final result at exactly 10 actions (overallScore defaults to the 50-69 band)', () => {
    const result = generateActionsFromAssessment(answers, weights);
    expect(result.actions).toHaveLength(10);
  });

  it('is deterministic — same input twice produces the same surviving set and order', () => {
    const first = generateActionsFromAssessment(answers, weights);
    const second = generateActionsFromAssessment(answers, weights);
    expect(second.actions.map((a) => a.templateId)).toEqual(
      first.actions.map((a) => a.templateId)
    );
    expect(second.actions.map((a) => a.rank)).toEqual(first.actions.map((a) => a.rank));
    expect(second.actions.map((a) => a.isQuickWin)).toEqual(
      first.actions.map((a) => a.isQuickWin)
    );
  });
});
