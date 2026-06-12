import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import {
  calculateAllSectionScores,
  calculateWeightedScore,
  calculateAllConfidenceMetrics,
} from '@/lib/scoringEngine';

function buildFixtureAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  let index = 0;
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      answers[q.id] = (index % 5) + 1;
      index++;
    }
  }
  return answers;
}

// Frozen baseline captured from pre-refactor code (kpi-questions-p0).
// This is the zero-behaviour-change acceptance gate — must pass before AND after the refactor.
const EXPECTED_SECTION_SCORES = {
  "new-vehicle-sales": 55,
  "used-vehicle-sales": 63,
  "service-performance": 60,
  "parts-inventory": 60,
  "financial-operations": 60,
};
const EXPECTED_OVERALL_SCORE = 59;
const EXPECTED_CONFIDENCE = {
  "new-vehicle-sales": {
    standardDeviation: 1.37,
    consistencyScore: 32,
    confidence: "low",
    reviewRecommended: true,
  },
  "used-vehicle-sales": {
    standardDeviation: 1.49,
    consistencyScore: 25,
    confidence: "low",
    reviewRecommended: true,
  },
  "service-performance": {
    standardDeviation: 1.41,
    consistencyScore: 29,
    confidence: "low",
    reviewRecommended: true,
  },
  "parts-inventory": {
    standardDeviation: 1.41,
    consistencyScore: 29,
    confidence: "low",
    reviewRecommended: true,
  },
  "financial-operations": {
    standardDeviation: 1.41,
    consistencyScore: 29,
    confidence: "low",
    reviewRecommended: true,
  },
};

describe('scoringBaseline (frozen)', () => {
  const answers = buildFixtureAnswers();

  it('fixture has at least 3 distinct answer values per section', () => {
    for (const section of questionnaire.sections) {
      const values = section.questions.map(q => answers[q.id]);
      expect(new Set(values).size).toBeGreaterThanOrEqual(3);
    }
  });

  it('section scores match frozen baseline', () => {
    const sectionScores = calculateAllSectionScores(questionnaire.sections, answers);
    expect(sectionScores).toEqual(EXPECTED_SECTION_SCORES);
  });

  it('overall weighted score matches frozen baseline', () => {
    const sectionScores = calculateAllSectionScores(questionnaire.sections, answers);
    const overallScore = calculateWeightedScore(sectionScores);
    expect(overallScore).toBe(EXPECTED_OVERALL_SCORE);
  });

  it('confidence metrics match frozen baseline', () => {
    const confidence = calculateAllConfidenceMetrics(questionnaire.sections, answers);
    expect(confidence).toEqual(EXPECTED_CONFIDENCE);
  });
});
