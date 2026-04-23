/**
 * Global constants for the Dealership Assessment Tool
 * Single source of truth for values used across the application
 */

import { questionnaire } from "@/data/questionnaire";
import { getMaturityLevel as _getMaturityKey, MATURITY_LEVELS as MATURITY_CONFIG } from "@/lib/maturityConfig";

/**
 * Total number of questions in the assessment
 * Dynamically calculated from the questionnaire schema
 */
export const TOTAL_QUESTIONS = questionnaire.sections.reduce(
  (total, section) => total + section.questions.length,
  0
);

/**
 * Industry average benchmark score (percentage)
 */
export const INDUSTRY_BENCHMARK = 75;

/**
 * Score thresholds for categorization
 * CANONICAL SOURCE for all score interpretation
 */
export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 65,
  developing: 50,
  critical: 0,
} as const;

/**
 * Maturity level definitions — re-exported from maturityConfig.
 * Canonical source of truth is src/lib/maturityConfig.ts.
 */
export { MATURITY_LEVELS } from "@/lib/maturityConfig";

/** Returns the canonical maturity key ('leading' | 'advanced' | 'developing' | 'foundational'). */
export function getMaturityLevelKey(score: number) {
  return _getMaturityKey(score);
}

const DE_LABELS: Record<string, string> = {
  leading:      'Führend',
  advanced:     'Fortgeschritten',
  developing:   'Entwickelnd',
  foundational: 'Grundlegend',
};

/**
 * Get score label based on canonical thresholds
 */
export function getScoreLabel(score: number, language: 'en' | 'de' = 'en'): string {
  if (score >= SCORE_THRESHOLDS.excellent) {
    return language === 'de' ? 'Ausgezeichnet' : 'Excellent';
  }
  if (score >= SCORE_THRESHOLDS.good) {
    return language === 'de' ? 'Gut' : 'Good';
  }
  if (score >= SCORE_THRESHOLDS.developing) {
    return language === 'de' ? 'Entwickelnd' : 'Developing';
  }
  return language === 'de' ? 'Fokus erforderlich' : 'Needs Focus';
}

/**
 * Get score color class based on canonical thresholds
 */
export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return 'text-success';
  if (score >= SCORE_THRESHOLDS.good) return 'text-warning-foreground';
  return 'text-destructive';
}

/**
 * Get maturity level label (localised) based on canonical thresholds.
 */
export function getMaturityLevel(score: number, language: 'en' | 'de' = 'en'): string {
  const key = _getMaturityKey(score);
  return language === 'de' ? DE_LABELS[key] : MATURITY_CONFIG[key].label;
}

/**
 * Get score band variant for badges
 */
export function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= SCORE_THRESHOLDS.excellent) return 'default';
  if (score >= SCORE_THRESHOLDS.good) return 'secondary';
  return 'destructive';
}
