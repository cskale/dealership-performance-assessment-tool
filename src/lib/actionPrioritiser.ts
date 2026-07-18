/**
 * Action Prioritiser
 *
 * Ranks instantiated actions by a composite ROI score, floats dependency
 * prerequisites above their dependents, truncates to a dynamic count based
 * on overall assessment score, and tags quick wins.
 *
 * Deterministic: same input always produces the same output order.
 */

import type { InstantiatedAction } from '@/lib/signalEngine';
import { generateContextIntelligence } from '@/lib/contextIntelligence';
import type { KpiSignal } from '@/lib/kpiSignalEngine';
import type { SignalCode } from '@/data/signalTypes';

export interface PrioritisedAction extends InstantiatedAction {
  rank: number; // 1-based
  isQuickWin: boolean;
  roiScore: number; // for tests/debug
}

/** Priority order for tie-breaking, highest first. */
const PRIORITY_ORDER: Record<InstantiatedAction['priority'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Dependent signal code -> prerequisite signal code it depends on. */
const DEPENDS: Partial<Record<SignalCode, SignalCode>> = {
  KPI_NOT_REVIEWED: 'KPI_NOT_DEFINED',
  PROCESS_NOT_EXECUTED: 'PROCESS_NOT_STANDARDISED',
};

/** Dynamic truncation count based on overall assessment score. */
function maxActionsForScore(overallScore: number): number {
  if (overallScore < 50) return 15;
  if (overallScore < 70) return 10;
  if (overallScore < 85) return 6;
  return 4;
}

/** Largest gapPercent among KPI signals linked to this action, or 0 if none linked. */
function maxGapPercentOfLinkedKpis(action: InstantiatedAction, kpiSignals: KpiSignal[]): number {
  const linked = action.linkedKPIs;
  if (!linked || linked.length === 0) return 0;

  let maxGap = 0;
  for (const signal of kpiSignals) {
    if (linked.includes(signal.kpiKey) && signal.gapPercent > maxGap) {
      maxGap = signal.gapPercent;
    }
  }
  return maxGap;
}

interface ScoredAction {
  action: InstantiatedAction;
  roiScore: number;
  effortScore: number;
}

function scoreAction(action: InstantiatedAction, kpiSignals: KpiSignal[]): ScoredAction {
  const ci = generateContextIntelligence(action);
  const gapBonus = Math.min(2, maxGapPercentOfLinkedKpis(action, kpiSignals) / 50);
  const effort = Math.max(ci.effort_score, 1);
  const roiScore = ((ci.impact_score + gapBonus) * ci.urgency_score) / effort;

  return { action, roiScore, effortScore: ci.effort_score };
}

export function prioritiseActions(
  actions: InstantiatedAction[],
  kpiSignals: KpiSignal[],
  overallScore: number
): PrioritisedAction[] {
  // Step 1: score every action.
  const scored = actions.map((action) => scoreAction(action, kpiSignals));

  // Step 2: sort descending by roiScore; tie-break by priority (critical first), then templateId.
  scored.sort((a, b) => {
    if (b.roiScore !== a.roiScore) return b.roiScore - a.roiScore;
    const priorityDiff = PRIORITY_ORDER[a.action.priority] - PRIORITY_ORDER[b.action.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.action.templateId.localeCompare(b.action.templateId);
  });

  // Step 3: dependency bubble — single pass. If a dependent action sits above
  // its prerequisite (same department), move the prerequisite directly above it.
  let ordered = scored;
  for (let i = 0; i < ordered.length; i++) {
    const dependentCode = ordered[i].action.signalCode;
    const prerequisiteCode = DEPENDS[dependentCode];
    if (!prerequisiteCode) continue;

    const prereqIdx = ordered.findIndex(
      (entry, idx) =>
        idx > i &&
        entry.action.signalCode === prerequisiteCode &&
        entry.action.department === ordered[i].action.department
    );
    if (prereqIdx === -1) continue;

    const next = ordered.slice();
    const [prereq] = next.splice(prereqIdx, 1);
    // Re-find dependent's index in `next` (unchanged, since prereq was after it).
    next.splice(i, 0, prereq);
    ordered = next;
  }

  // Step 4: truncate by overallScore-derived cap.
  const cap = maxActionsForScore(overallScore);
  const truncated = ordered.slice(0, cap);

  // Step 5: tag quick wins and assign 1-based rank.
  return truncated.map((entry, index) => ({
    ...entry.action,
    rank: index + 1,
    isQuickWin: entry.effortScore <= 2 && entry.action.defaultTimeframeDays <= 30,
    roiScore: entry.roiScore,
  }));
}
