/**
 * Global constants for the Dealership Assessment Tool
 * Single source of truth for values used across the application
 */

import { questionnaire } from "@/data/questionnaire";

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
 * Maturity level definitions based on score ranges
 * CANONICAL SOURCE for all maturity interpretation
 */
export const MATURITY_LEVELS = {
  advanced: { min: 85, label: { en: 'Advanced', de: 'Fortgeschritten' } },
  mature: { min: 70, label: { en: 'Mature', de: 'Ausgereift' } },
  developing: { min: 50, label: { en: 'Developing', de: 'Entwickelnd' } },
  basic: { min: 0, label: { en: 'Basic', de: 'Basis' } },
} as const;

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
 * Get maturity level based on canonical thresholds
 */
export function getMaturityLevel(score: number, language: 'en' | 'de' = 'en'): string {
  if (score >= MATURITY_LEVELS.advanced.min) {
    return MATURITY_LEVELS.advanced.label[language];
  }
  if (score >= MATURITY_LEVELS.mature.min) {
    return MATURITY_LEVELS.mature.label[language];
  }
  if (score >= MATURITY_LEVELS.developing.min) {
    return MATURITY_LEVELS.developing.label[language];
  }
  return MATURITY_LEVELS.basic.label[language];
}

/**
 * Get maturity level key based on canonical thresholds
 */
export function getMaturityLevelKey(score: number): 'advanced' | 'mature' | 'developing' | 'basic' {
  if (score >= MATURITY_LEVELS.advanced.min) return 'advanced';
  if (score >= MATURITY_LEVELS.mature.min) return 'mature';
  if (score >= MATURITY_LEVELS.developing.min) return 'developing';
  return 'basic';
}

/**
 * Get score band variant for badges
 */
export function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= SCORE_THRESHOLDS.excellent) return 'default';
  if (score >= SCORE_THRESHOLDS.good) return 'secondary';
  return 'destructive';
}
