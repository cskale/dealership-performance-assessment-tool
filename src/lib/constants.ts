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
 */
export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 65,
  developing: 50,
  critical: 0,
} as const;

/**
 * Maturity level definitions based on score ranges
 */
export const MATURITY_LEVELS = {
  advanced: { min: 85, label: { en: 'Advanced', de: 'Fortgeschritten' } },
  mature: { min: 70, label: { en: 'Mature', de: 'Ausgereift' } },
  developing: { min: 50, label: { en: 'Developing', de: 'Entwickelnd' } },
  basic: { min: 0, label: { en: 'Basic', de: 'Basis' } },
} as const;
