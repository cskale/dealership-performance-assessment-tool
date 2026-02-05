/**
 * Signal Engine
 * 
 * Deterministic, rule-based engine that:
 * 1. Evaluates assessment answers against signal mappings
 * 2. Generates signals based on low scores
 * 3. Escalates severity when multiple questions trigger same signal
 * 
 * NO AI/ML. NO randomness. Same answers → same signals → same actions.
 */

import { Signal, SignalCode, Severity } from '@/data/signalTypes';
import { SIGNAL_MAPPINGS, getSignalMapping } from '@/data/signalMappings';
import { ACTION_TEMPLATES, getTemplatesForSignal } from '@/data/actionTemplates';
import { getTemplateIdsForSignal, getMaxActionsForSignal } from '@/data/signalToActionMap';

export interface SignalEngineConfig {
  enableAutoActions: boolean;
  weakScoreThreshold: number; // Score at or below this is considered weak (default: 3)
  criticalScoreThreshold: number; // Score at or below this is critical (default: 2)
}

export interface GeneratedSignal extends Signal {
  sourceQuestionScores: Record<string, number>;
}

export interface InstantiatedAction {
  templateId: string;
  signalCode: SignalCode;
  title: string;
  description: string;
  department: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  defaultOwnerRole: string;
  defaultTimeframeDays: number;
  implementationSteps: string[];
  triggeringQuestionIds: string[];
  rationale: string;
}

const DEFAULT_CONFIG: SignalEngineConfig = {
  enableAutoActions: true,
  weakScoreThreshold: 3,
  criticalScoreThreshold: 2
};

/**
 * Determine severity based on score and question weight
 */
function determineSeverity(
  score: number, 
  weight: number, 
  config: SignalEngineConfig
): Severity {
  // Critical: score ≤ 2 and weight ≥ 1.3
  if (score <= config.criticalScoreThreshold && weight >= 1.3) {
    return 'HIGH';
  }
  // High: score ≤ 2 and weight ≥ 1.0
  if (score <= config.criticalScoreThreshold && weight >= 1.0) {
    return 'MEDIUM';
  }
  // Medium: score = 3
  if (score === config.weakScoreThreshold) {
    return 'LOW';
  }
  // Default to LOW for borderline cases
  return 'LOW';
}

/**
 * Escalate severity based on count of triggering questions
 */
function escalateSeverity(baseSeverity: Severity, triggerCount: number): Severity {
  if (triggerCount >= 3) {
    // Multiple triggers → escalate one level
    if (baseSeverity === 'LOW') return 'MEDIUM';
    if (baseSeverity === 'MEDIUM') return 'HIGH';
  }
  return baseSeverity;
}

/**
 * Map severity to action priority
 */
function severityToPriority(severity: Severity): 'critical' | 'high' | 'medium' | 'low' {
  switch (severity) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    case 'LOW': return 'low';
    default: return 'medium';
  }
}

/**
 * Get module key for department name mapping
 */
const MODULE_TO_DEPARTMENT: Record<string, string> = {
  'new-vehicle-sales': 'New Vehicle Sales',
  'used-vehicle-sales': 'Used Vehicle Sales',
  'service-performance': 'Service',
  'parts-inventory': 'Parts & Inventory',
  'financial-operations': 'Financial Operations'
};

/**
 * Main signal generation function
 * 
 * @param answers - Map of questionId → score (1-5)
 * @param questionWeights - Map of questionId → weight
 * @param config - Engine configuration
 * @returns Array of generated signals
 */
export function generateSignals(
  answers: Record<string, number>,
  questionWeights: Record<string, number>,
  config: SignalEngineConfig = DEFAULT_CONFIG
): GeneratedSignal[] {
  if (!config.enableAutoActions) {
    return [];
  }

  // Group weak answers by signal code and module
  const signalGroups: Map<string, {
    signalCode: Exclude<SignalCode, 'NONE'>;
    moduleKey: string;
    questionIds: string[];
    scores: Record<string, number>;
    maxSeverity: Severity;
  }> = new Map();

  // Process each answer
  for (const [questionId, score] of Object.entries(answers)) {
    // Skip if score is good (above threshold)
    if (score > config.weakScoreThreshold) {
      continue;
    }

    // Get mapping for this question
    const mapping = getSignalMapping(questionId);
    if (!mapping || mapping.primarySignalCode === 'NONE') {
      continue;
    }

    const weight = questionWeights[questionId] || 1.0;
    const severity = determineSeverity(score, weight, config);

    // Create unique key for grouping: signalCode + moduleKey
    const groupKey = `${mapping.primarySignalCode}::${mapping.moduleKey}`;

    if (!signalGroups.has(groupKey)) {
      signalGroups.set(groupKey, {
        signalCode: mapping.primarySignalCode,
        moduleKey: mapping.moduleKey,
        questionIds: [],
        scores: {},
        maxSeverity: severity
      });
    }

    const group = signalGroups.get(groupKey)!;
    group.questionIds.push(questionId);
    group.scores[questionId] = score;
    
    // Track max severity
    if (severity === 'HIGH' || (severity === 'MEDIUM' && group.maxSeverity === 'LOW')) {
      group.maxSeverity = severity;
    }
  }

  // Convert groups to signals with escalation
  const signals: GeneratedSignal[] = [];

  for (const group of signalGroups.values()) {
    // Escalate severity based on number of triggering questions
    const finalSeverity = escalateSeverity(group.maxSeverity, group.questionIds.length);

    signals.push({
      signalCode: group.signalCode,
      severity: finalSeverity,
      moduleKey: group.moduleKey,
      triggeringQuestionIds: group.questionIds,
      rationale: `Detected in ${group.questionIds.length} question(s) in ${MODULE_TO_DEPARTMENT[group.moduleKey] || group.moduleKey}`,
      sourceQuestionScores: group.scores
    });
  }

  // Sort by severity (HIGH first) then by number of triggers
  signals.sort((a, b) => {
    const severityOrder: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.triggeringQuestionIds.length - a.triggeringQuestionIds.length;
  });

  return signals;
}

/**
 * Instantiate actions from signals
 * 
 * @param signals - Generated signals
 * @param maxActions - Maximum number of actions to generate
 * @returns Array of instantiated actions
 */
export function instantiateActions(
  signals: GeneratedSignal[],
  maxActions: number = 10
): InstantiatedAction[] {
  const actions: InstantiatedAction[] = [];
  const usedTemplateIds = new Set<string>();

  for (const signal of signals) {
    if (actions.length >= maxActions) break;
    if (signal.signalCode === 'NONE') continue;

    // Get templates for this signal
    const templates = getTemplatesForSignal(signal.signalCode);
    if (templates.length === 0) continue;

    // Get max actions allowed for this signal
    const maxForSignal = getMaxActionsForSignal(signal.signalCode);
    let actionsForSignal = 0;

    for (const template of templates) {
      if (actions.length >= maxActions) break;
      if (actionsForSignal >= maxForSignal) break;
      if (usedTemplateIds.has(template.templateId)) continue;

      // Determine priority based on signal severity
      const priority = severityToPriority(signal.severity);

      actions.push({
        templateId: template.templateId,
        signalCode: signal.signalCode,
        title: template.title,
        description: template.description,
        department: MODULE_TO_DEPARTMENT[signal.moduleKey] || signal.moduleKey,
        priority: priority,
        defaultOwnerRole: template.defaultOwnerRole,
        defaultTimeframeDays: template.defaultTimeframeDays,
        implementationSteps: template.implementationSteps,
        triggeringQuestionIds: signal.triggeringQuestionIds,
        rationale: signal.rationale
      });

      usedTemplateIds.add(template.templateId);
      actionsForSignal++;
    }
  }

  return actions;
}

/**
 * Main entry point: Generate actions from assessment answers
 * 
 * @param answers - Map of questionId → score (1-5)
 * @param questionWeights - Map of questionId → weight
 * @param config - Engine configuration
 * @returns Array of instantiated actions ready for database insertion
 */
export function generateActionsFromAssessment(
  answers: Record<string, number>,
  questionWeights: Record<string, number>,
  config: SignalEngineConfig = DEFAULT_CONFIG
): InstantiatedAction[] {
  const signals = generateSignals(answers, questionWeights, config);
  return instantiateActions(signals);
}

/**
 * Format actions for database insertion
 */
export function formatActionsForDatabaseInsert(
  actions: InstantiatedAction[],
  userId: string,
  assessmentId: string,
  organizationId: string
): any[] {
  return actions.map(action => ({
    user_id: userId,
    organization_id: organizationId,
    assessment_id: assessmentId,
    department: action.department,
    priority: action.priority,
    action_title: action.title,
    action_description: `${action.description}\n\nTriggered because: ${action.signalCode}\nRelated questions: ${action.triggeringQuestionIds.join(', ')}\nRationale: ${action.rationale}`,
    status: 'Open',
    responsible_person: action.defaultOwnerRole,
    target_completion_date: calculateTargetDate(action.defaultTimeframeDays),
    support_required_from: [],
    kpis_linked_to: []
  }));
}

/**
 * Calculate target completion date
 */
function calculateTargetDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}
