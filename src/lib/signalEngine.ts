/**
 * Signal Engine
 * 
 * Deterministic, rule-based engine that:
 * 1. Evaluates assessment answers against signal mappings
 * 2. Generates signals based on low scores
 * 3. Escalates severity when multiple questions trigger same signal
 * 4. Selects KPI-specific action templates when linkedKPIs are available
 * 
 * NO AI/ML. NO randomness. Same answers → same signals → same actions.
 */

import { Signal, SignalCode, Severity } from '@/data/signalTypes';
import { SIGNAL_MAPPINGS, getSignalMapping } from '@/data/signalMappings';
import { ACTION_TEMPLATES, getTemplatesForSignal, ActionTemplate } from '@/data/actionTemplates';
import { getTemplateIdsForSignal, getMaxActionsForSignal, getKPISpecificTemplateIds } from '@/data/signalToActionMap';
import { generateContextIntelligence } from '@/lib/contextIntelligence';
import { KPI_DEFINITIONS } from '@/lib/kpiDefinitions';

export interface SignalEngineConfig {
  enableAutoActions: boolean;
  weakScoreThreshold: number; // Score at or below this is considered weak (default: 3)
  criticalScoreThreshold: number; // Score at or below this is critical (default: 2)
}

export interface GeneratedSignal extends Signal {
  sourceQuestionScores: Record<string, number>;
  /** KPI keys linked to the triggering questions */
  linkedKPIs?: string[];
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
  /** KPI keys this action is designed to improve */
  linkedKPIs?: string[];
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
  if (score <= config.criticalScoreThreshold && weight >= 1.3) {
    return 'HIGH';
  }
  if (score <= config.criticalScoreThreshold && weight >= 1.0) {
    return 'MEDIUM';
  }
  if (score === config.weakScoreThreshold) {
    return 'LOW';
  }
  return 'LOW';
}

/**
 * Escalate severity based on count of triggering questions
 */
function escalateSeverity(baseSeverity: Severity, triggerCount: number): Severity {
  if (triggerCount >= 3) {
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
 * Build KPI interdependency rationale when linkedKPIs are available
 */
function buildKPIRationale(linkedKPIs: string[], moduleKey: string): string {
  const kpiNames: string[] = [];
  const downstreamImpacts: string[] = [];

  for (const kpiKey of linkedKPIs) {
    const def = KPI_DEFINITIONS[kpiKey]?.en;
    if (def) {
      kpiNames.push(def.title);
      if (def.interdependencies?.downstreamImpacts) {
        downstreamImpacts.push(...def.interdependencies.downstreamImpacts.slice(0, 2));
      }
    }
  }

  const dept = MODULE_TO_DEPARTMENT[moduleKey] || moduleKey;
  let rationale = `Detected in ${dept}`;
  if (kpiNames.length > 0) {
    rationale += `. Impacts: ${kpiNames.join(', ')}`;
  }
  if (downstreamImpacts.length > 0) {
    const uniqueImpacts = [...new Set(downstreamImpacts)].slice(0, 3);
    rationale += `. Downstream effects: ${uniqueImpacts.join('; ')}`;
  }
  return rationale;
}

/**
 * Main signal generation function
 */
export function generateSignals(
  answers: Record<string, number>,
  questionWeights: Record<string, number>,
  config: SignalEngineConfig = DEFAULT_CONFIG,
  questionLinkedKPIs?: Record<string, string[]>
): GeneratedSignal[] {
  if (!config.enableAutoActions) {
    return [];
  }

  const signalGroups: Map<string, {
    signalCode: Exclude<SignalCode, 'NONE'>;
    moduleKey: string;
    questionIds: string[];
    scores: Record<string, number>;
    maxSeverity: Severity;
    linkedKPIs: Set<string>;
  }> = new Map();

  for (const [questionId, score] of Object.entries(answers)) {
    if (score > config.weakScoreThreshold) {
      continue;
    }

    const mapping = getSignalMapping(questionId);
    if (!mapping || mapping.primarySignalCode === 'NONE') {
      continue;
    }

    const weight = questionWeights[questionId] || 1.0;
    const severity = determineSeverity(score, weight, config);

    const groupKey = `${mapping.primarySignalCode}::${mapping.moduleKey}`;

    if (!signalGroups.has(groupKey)) {
      signalGroups.set(groupKey, {
        signalCode: mapping.primarySignalCode,
        moduleKey: mapping.moduleKey,
        questionIds: [],
        scores: {},
        maxSeverity: severity,
        linkedKPIs: new Set()
      });
    }

    const group = signalGroups.get(groupKey)!;
    group.questionIds.push(questionId);
    group.scores[questionId] = score;
    
    if (severity === 'HIGH' || (severity === 'MEDIUM' && group.maxSeverity === 'LOW')) {
      group.maxSeverity = severity;
    }

    // Collect linked KPIs from question metadata
    const kpis = questionLinkedKPIs?.[questionId];
    if (kpis) {
      kpis.forEach(k => group.linkedKPIs.add(k));
    }
  }

  const signals: GeneratedSignal[] = [];

  for (const group of signalGroups.values()) {
    const finalSeverity = escalateSeverity(group.maxSeverity, group.questionIds.length);
    const kpiArray = Array.from(group.linkedKPIs);

    const rationale = kpiArray.length > 0
      ? buildKPIRationale(kpiArray, group.moduleKey)
      : `Detected in ${group.questionIds.length} question(s) in ${MODULE_TO_DEPARTMENT[group.moduleKey] || group.moduleKey}`;

    signals.push({
      signalCode: group.signalCode,
      severity: finalSeverity,
      moduleKey: group.moduleKey,
      triggeringQuestionIds: group.questionIds,
      rationale,
      sourceQuestionScores: group.scores,
      linkedKPIs: kpiArray.length > 0 ? kpiArray : undefined
    });
  }

  signals.sort((a, b) => {
    const severityOrder: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.triggeringQuestionIds.length - a.triggeringQuestionIds.length;
  });

  return signals;
}

/**
 * Find the best matching template for a signal, preferring KPI-specific over generic
 */
function selectTemplates(
  signal: GeneratedSignal,
  usedTemplateIds: Set<string>,
  maxForSignal: number
): ActionTemplate[] {
  const selected: ActionTemplate[] = [];
  
  // 1. Try KPI-specific templates first if linkedKPIs exist
  if (signal.linkedKPIs && signal.linkedKPIs.length > 0 && signal.signalCode !== 'NONE') {
    const kpiSpecificIds = getKPISpecificTemplateIds(signal.signalCode as Exclude<SignalCode, 'NONE'>);
    for (const templateId of kpiSpecificIds) {
      if (selected.length >= maxForSignal) break;
      if (usedTemplateIds.has(templateId)) continue;
      
      const template = ACTION_TEMPLATES.find(t => t.templateId === templateId);
      if (!template) continue;
      
      // Check if this template's linkedKPIs overlap with signal's linkedKPIs
      if (template.linkedKPIs) {
        const hasOverlap = template.linkedKPIs.some(k => signal.linkedKPIs!.includes(k));
        if (hasOverlap) {
          selected.push(template);
          usedTemplateIds.add(templateId);
        }
      }
    }
  }

  // 2. Fall back to generic templates if not enough KPI-specific ones found
  if (selected.length < maxForSignal) {
    const genericTemplates = getTemplatesForSignal(signal.signalCode as Exclude<SignalCode, 'NONE'>)
      .filter(t => !t.linkedKPIs); // Only truly generic templates
    
    for (const template of genericTemplates) {
      if (selected.length >= maxForSignal) break;
      if (usedTemplateIds.has(template.templateId)) continue;
      
      selected.push(template);
      usedTemplateIds.add(template.templateId);
    }
  }

  // 3. If still not enough, use any remaining templates for this signal
  if (selected.length < maxForSignal) {
    const allTemplates = getTemplatesForSignal(signal.signalCode as Exclude<SignalCode, 'NONE'>);
    for (const template of allTemplates) {
      if (selected.length >= maxForSignal) break;
      if (usedTemplateIds.has(template.templateId)) continue;
      
      selected.push(template);
      usedTemplateIds.add(template.templateId);
    }
  }

  return selected;
}

/**
 * Instantiate actions from signals with KPI-aware template selection
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

    const maxForSignal = getMaxActionsForSignal(signal.signalCode);
    const remaining = maxActions - actions.length;
    const limit = Math.min(maxForSignal, remaining);

    const templates = selectTemplates(signal, usedTemplateIds, limit);

    for (const template of templates) {
      const priority = severityToPriority(signal.severity);

      actions.push({
        templateId: template.templateId,
        signalCode: signal.signalCode,
        title: template.title,
        description: template.description,
        department: MODULE_TO_DEPARTMENT[signal.moduleKey] || signal.moduleKey,
        priority,
        defaultOwnerRole: template.defaultOwnerRole,
        defaultTimeframeDays: template.defaultTimeframeDays,
        implementationSteps: template.implementationSteps,
        triggeringQuestionIds: signal.triggeringQuestionIds,
        rationale: signal.rationale,
        linkedKPIs: template.linkedKPIs || signal.linkedKPIs
      });
    }
  }

  return actions;
}

/**
 * Main entry point: Generate actions from assessment answers
 */
export function generateActionsFromAssessment(
  answers: Record<string, number>,
  questionWeights: Record<string, number>,
  config: SignalEngineConfig = DEFAULT_CONFIG,
  questionLinkedKPIs?: Record<string, string[]>
): InstantiatedAction[] {
  const signals = generateSignals(answers, questionWeights, config, questionLinkedKPIs);
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
  return actions.map(action => {
    const cleanTitle = action.title
      .replace(/^(Assess|Address|Evaluate):\s*/i, '')
      .trim();

    // Clean description — no more "Triggered because:" in user-visible fields
    const cleanDesc = action.description
      .replace(/^Triggered because:.*?\.\s*/i, '')
      .replace(/\s*Triggered because:.*$/si, '')
      .trim();

    // Generate context intelligence fields
    const ci = generateContextIntelligence(action);

    return {
      user_id: userId,
      organization_id: organizationId,
      assessment_id: assessmentId,
      department: action.department,
      priority: action.priority,
      action_title: cleanTitle,
      action_description: cleanDesc,
      status: 'Open',
      responsible_person: action.defaultOwnerRole,
      target_completion_date: calculateTargetDate(action.defaultTimeframeDays),
      support_required_from: [],
      kpis_linked_to: action.linkedKPIs || [],
      // Context Intelligence fields
      action_context: ci.action_context,
      business_impact: ci.business_impact,
      recommendation: ci.recommendation,
      expected_benefit: ci.expected_benefit,
      linked_kpis: ci.linked_kpis,
      likely_drivers: ci.likely_drivers,
      likely_consequences: ci.likely_consequences,
      impact_score: ci.impact_score,
      effort_score: ci.effort_score,
      urgency_score: ci.urgency_score,
    };
  });
}

/**
 * Calculate target completion date
 */
function calculateTargetDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}
