import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InstantiatedAction } from '@/lib/signalEngine';
import type { KpiSignal } from '@/lib/kpiSignalEngine';

// Deterministic, per-templateId control over generateContextIntelligence's
// scoring fields so tests can isolate actionPrioritiser's own logic without
// depending on contextIntelligence's internal formula.
const ciMap: Record<string, { impact_score: number; effort_score: number; urgency_score: number }> = {};

vi.mock('@/lib/contextIntelligence', () => ({
  generateContextIntelligence: vi.fn((action: InstantiatedAction) => {
    const ci = ciMap[action.templateId] ?? { impact_score: 3, effort_score: 3, urgency_score: 3 };
    return {
      action_context: '',
      business_impact: '',
      recommendation: '',
      expected_benefit: '',
      linked_kpis: [],
      likely_drivers: [],
      likely_consequences: [],
      ...ci,
    };
  }),
}));

import { prioritiseActions } from '@/lib/actionPrioritiser';

function makeAction(overrides: Partial<InstantiatedAction> & { templateId: string }): InstantiatedAction {
  return {
    signalCode: 'PROCESS_NOT_STANDARDISED',
    title: `Title for ${overrides.templateId}`,
    description: 'desc',
    department: 'New Vehicle Sales',
    priority: 'medium',
    defaultOwnerRole: 'Sales Manager',
    defaultTimeframeDays: 30,
    implementationSteps: [],
    triggeringQuestionIds: [],
    rationale: 'rationale',
    ...overrides,
  };
}

describe('prioritiseActions', () => {
  beforeEach(() => {
    for (const key of Object.keys(ciMap)) delete ciMap[key];
  });

  it('orders actions by ROI — high impact/low effort beats the inverse', () => {
    ciMap.A = { impact_score: 5, effort_score: 1, urgency_score: 3 };
    ciMap.B = { impact_score: 1, effort_score: 5, urgency_score: 3 };

    const actions = [
      makeAction({ templateId: 'B' }),
      makeAction({ templateId: 'A' }),
    ];

    const result = prioritiseActions(actions, [], 60);

    expect(result[0].templateId).toBe('A');
    expect(result[1].templateId).toBe('B');
    expect(result[0].roiScore).toBeGreaterThan(result[1].roiScore);
  });

  it('gapBonus lifts the rank of a KPI-linked action', () => {
    // Both actions start with identical impact/effort/urgency so ROI is tied
    // absent the gapBonus. C is linked to a KPI with a large gap; D is not linked.
    ciMap.C = { impact_score: 3, effort_score: 3, urgency_score: 3 };
    ciMap.D = { impact_score: 3, effort_score: 3, urgency_score: 3 };

    const kpiSignals: KpiSignal[] = [
      {
        kpiKey: 'nvs_gross_profit_per_unit',
        signalCode: 'KPI_NOT_REVIEWED',
        moduleKey: 'new-vehicle-sales',
        severity: 'HIGH',
        actualValue: 100,
        targetValue: 200,
        gapPercent: 50,
        unit: '£',
      },
    ];

    const actions = [
      // Give D priority 'high' > C's 'medium' so, absent gapBonus, D would
      // sort ahead on the tie-break (equal roiScore) — proving the bonus
      // (not the tie-break) is what lifts C.
      makeAction({ templateId: 'D', priority: 'high' }),
      makeAction({ templateId: 'C', priority: 'medium', linkedKPIs: ['nvs_gross_profit_per_unit'] }),
    ];

    const result = prioritiseActions(actions, kpiSignals, 60);

    expect(result[0].templateId).toBe('C');
    expect(result[0].roiScore).toBeGreaterThan(result[1].roiScore);
  });

  it('bubbles a prerequisite (PROCESS_NOT_STANDARDISED) above its dependent (PROCESS_NOT_EXECUTED) in the same department', () => {
    // Give the dependent a higher ROI so, before bubbling, it sorts above
    // its prerequisite.
    ciMap.DEP = { impact_score: 5, effort_score: 1, urgency_score: 5 };
    ciMap.PREREQ = { impact_score: 1, effort_score: 5, urgency_score: 1 };

    const actions = [
      makeAction({ templateId: 'DEP', signalCode: 'PROCESS_NOT_EXECUTED', department: 'Service' }),
      makeAction({ templateId: 'PREREQ', signalCode: 'PROCESS_NOT_STANDARDISED', department: 'Service' }),
    ];

    const result = prioritiseActions(actions, [], 60);
    const prereqIdx = result.findIndex((a) => a.templateId === 'PREREQ');
    const depIdx = result.findIndex((a) => a.templateId === 'DEP');

    expect(prereqIdx).toBeLessThan(depIdx);
  });

  it('leaves cross-department dependency pairs untouched', () => {
    ciMap.DEP2 = { impact_score: 5, effort_score: 1, urgency_score: 5 };
    ciMap.PREREQ2 = { impact_score: 1, effort_score: 5, urgency_score: 1 };

    const actions = [
      makeAction({ templateId: 'DEP2', signalCode: 'PROCESS_NOT_EXECUTED', department: 'Service' }),
      makeAction({ templateId: 'PREREQ2', signalCode: 'PROCESS_NOT_STANDARDISED', department: 'Parts & Inventory' }),
    ];

    const result = prioritiseActions(actions, [], 60);

    // Roi order unaffected by dependency logic since departments differ:
    // DEP2 (higher roi) stays above PREREQ2.
    expect(result[0].templateId).toBe('DEP2');
    expect(result[1].templateId).toBe('PREREQ2');
  });

  describe('truncation by overallScore', () => {
    function makeBulkActions(n: number): InstantiatedAction[] {
      const actions: InstantiatedAction[] = [];
      for (let i = 0; i < n; i++) {
        const id = `bulk-${i}`;
        ciMap[id] = { impact_score: 3, effort_score: 3, urgency_score: 3 };
        actions.push(makeAction({ templateId: id, department: `Dept ${i}` }));
      }
      return actions;
    }

    it('caps at 15 for overallScore 49 (<50 band)', () => {
      const result = prioritiseActions(makeBulkActions(20), [], 49);
      expect(result.length).toBe(15);
    });

    it('caps at 10 for overallScore 50 (50-69 band)', () => {
      const result = prioritiseActions(makeBulkActions(20), [], 50);
      expect(result.length).toBe(10);
    });

    it('caps at 6 for overallScore 70 (70-84 band)', () => {
      const result = prioritiseActions(makeBulkActions(20), [], 70);
      expect(result.length).toBe(6);
    });

    it('caps at 4 for overallScore 85 (>=85 band)', () => {
      const result = prioritiseActions(makeBulkActions(20), [], 85);
      expect(result.length).toBe(4);
    });
  });

  describe('quick-win tagging', () => {
    it('requires BOTH effort_score<=2 AND defaultTimeframeDays<=30', () => {
      ciMap.QW = { impact_score: 3, effort_score: 2, urgency_score: 3 }; // qualifies
      ciMap.LOW_EFFORT_LONG_TIMEFRAME = { impact_score: 3, effort_score: 2, urgency_score: 3 }; // effort ok, timeframe fails
      ciMap.HIGH_EFFORT_SHORT_TIMEFRAME = { impact_score: 3, effort_score: 3, urgency_score: 3 }; // timeframe ok, effort fails

      const actions = [
        makeAction({ templateId: 'QW', defaultTimeframeDays: 30 }),
        makeAction({ templateId: 'LOW_EFFORT_LONG_TIMEFRAME', defaultTimeframeDays: 45 }),
        makeAction({ templateId: 'HIGH_EFFORT_SHORT_TIMEFRAME', defaultTimeframeDays: 14 }),
      ];

      const result = prioritiseActions(actions, [], 60);
      const byId = Object.fromEntries(result.map((a) => [a.templateId, a]));

      expect(byId.QW.isQuickWin).toBe(true);
      expect(byId.LOW_EFFORT_LONG_TIMEFRAME.isQuickWin).toBe(false);
      expect(byId.HIGH_EFFORT_SHORT_TIMEFRAME.isQuickWin).toBe(false);
    });
  });

  it('is deterministic — the same input produces identical order twice', () => {
    ciMap.X1 = { impact_score: 4, effort_score: 2, urgency_score: 4 };
    ciMap.X2 = { impact_score: 4, effort_score: 2, urgency_score: 4 };
    ciMap.X3 = { impact_score: 2, effort_score: 4, urgency_score: 2 };

    const actions = [
      makeAction({ templateId: 'X3' }),
      makeAction({ templateId: 'X1' }),
      makeAction({ templateId: 'X2' }),
    ];

    const result1 = prioritiseActions(actions, [], 60).map((a) => a.templateId);
    const result2 = prioritiseActions(actions, [], 60).map((a) => a.templateId);

    expect(result1).toEqual(result2);
  });

  it('tie-breaks equal roiScore by priority order (critical > high > medium > low)', () => {
    // Identical impact/effort/urgency -> identical roiScore for both actions.
    // templateIds are chosen so that alphabetical (templateId) comparison
    // would rank 'A_MEDIUM' ahead of 'Z_CRITICAL' if priority tie-break were
    // not applied — proving the priority order (not templateId) decides.
    ciMap.A_MEDIUM = { impact_score: 3, effort_score: 3, urgency_score: 3 };
    ciMap.Z_CRITICAL = { impact_score: 3, effort_score: 3, urgency_score: 3 };

    const actions = [
      makeAction({ templateId: 'A_MEDIUM', priority: 'medium' }),
      makeAction({ templateId: 'Z_CRITICAL', priority: 'critical' }),
    ];

    const result = prioritiseActions(actions, [], 60);

    expect(result[0].roiScore).toBe(result[1].roiScore);
    expect(result[0].templateId).toBe('Z_CRITICAL');
    expect(result[1].templateId).toBe('A_MEDIUM');
  });

  describe('roiScore formula', () => {
    it('pins the exact roiScore for a KPI-linked action (gapBonus > 0)', () => {
      // gapBonus = min(2, gapPercent / 50) = min(2, 50/50) = 1
      // roiScore = (impact_score + gapBonus) * urgency_score / max(effort_score, 1)
      //          = (4 + 1) * 5 / 2 = 12.5
      ciMap.GAP_LINKED = { impact_score: 4, effort_score: 2, urgency_score: 5 };

      const kpiSignals: KpiSignal[] = [
        {
          kpiKey: 'nvs_gross_profit_per_unit',
          signalCode: 'KPI_NOT_REVIEWED',
          moduleKey: 'new-vehicle-sales',
          severity: 'HIGH',
          actualValue: 100,
          targetValue: 200,
          gapPercent: 50,
          unit: '£',
        },
      ];

      const actions = [
        makeAction({ templateId: 'GAP_LINKED', linkedKPIs: ['nvs_gross_profit_per_unit'] }),
      ];

      const result = prioritiseActions(actions, kpiSignals, 60);

      expect(result[0].roiScore).toBe(12.5);
    });

    it('pins the exact roiScore for an action with no linked KPI (gapBonus = 0)', () => {
      // gapBonus = 0 (no linkedKPIs)
      // roiScore = (impact_score + 0) * urgency_score / max(effort_score, 1)
      //          = (3 + 0) * 2 / 3 = 2
      ciMap.NO_GAP = { impact_score: 3, effort_score: 3, urgency_score: 2 };

      const actions = [makeAction({ templateId: 'NO_GAP' })];

      const result = prioritiseActions(actions, [], 60);

      expect(result[0].roiScore).toBe(2);
    });
  });

  it('assigns 1-based rank in final output order', () => {
    ciMap.R1 = { impact_score: 3, effort_score: 3, urgency_score: 3 };
    ciMap.R2 = { impact_score: 3, effort_score: 3, urgency_score: 3 };

    const actions = [makeAction({ templateId: 'R1' }), makeAction({ templateId: 'R2' })];
    const result = prioritiseActions(actions, [], 60);

    result.forEach((a, i) => expect(a.rank).toBe(i + 1));
  });
});
