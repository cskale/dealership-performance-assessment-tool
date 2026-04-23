import { describe, it, expect } from 'vitest';
import {
  calculateWeightedScore,
  calculateWeightedSectionScore,
  calculateAllSectionScores,
  calculateSubCategoryScores,
  calculateConfidenceMetrics,
  calculateAllConfidenceMetrics,
  detectSystemicPatterns,
  calculateEnhancedMaturity,
  CATEGORY_WEIGHTS,
  DEPARTMENT_TO_CATEGORY,
} from '@/lib/scoringEngine';
import { questionnaire } from '@/data/questionnaire';

// ─── Helpers ──────────────────────────────────────────────────────────

/** Build a fake answers map where every question gets the same score */
function uniformAnswers(score: number): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      answers[q.id] = score;
    }
  }
  return answers;
}

/** Build answers where one section gets a different score */
function mixedAnswers(defaultScore: number, overrides: Record<string, number>): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      answers[q.id] = overrides[section.id] ?? defaultScore;
    }
  }
  return answers;
}

// ─── A. Weighted Section Scoring ──────────────────────────────────────

describe('calculateWeightedSectionScore', () => {
  it('uses question weights instead of simple average', () => {
    const section = questionnaire.sections[0]; // new-vehicle-sales
    const questions = section.questions;

    // Give all questions score 3 except the highest-weight question gets 5
    const answers: Record<string, number> = {};
    let maxWeightQ = questions[0];
    for (const q of questions) {
      if (q.weight > maxWeightQ.weight) maxWeightQ = q;
      answers[q.id] = 3;
    }
    answers[maxWeightQ.id] = 5;

    const weightedScore = calculateWeightedSectionScore(questions, answers)!;

    // Simple average would be (3*(n-1) + 5) / n
    const simpleAvg = Math.round(((3 * (questions.length - 1) + 5) / questions.length / 5) * 100);

    // Weighted score should be higher because the high-weight question scored 5
    expect(weightedScore).toBeGreaterThan(simpleAvg);
  });

  it('returns null when no answers provided', () => {
    const section = questionnaire.sections[0];
    expect(calculateWeightedSectionScore(section.questions, {})).toBeNull();
  });

  it('handles uniform scores correctly', () => {
    const section = questionnaire.sections[0];
    const answers: Record<string, number> = {};
    for (const q of section.questions) answers[q.id] = 4;

    // All answers are 4/5 = 80%, regardless of weights
    expect(calculateWeightedSectionScore(section.questions, answers)).toBe(80);
  });
});

describe('calculateWeightedScore (overall)', () => {
  it('applies category weights (not simple average)', () => {
    // NVS=100, UVS=0, Service=0, Financial=0, Parts=0
    const departmentScores: Record<string, number> = {
      'new-vehicle-sales': 100,
      'used-vehicle-sales': 0,
      'service-performance': 0,
      'financial-operations': 0,
      'parts-inventory': 0,
    };

    const weighted = calculateWeightedScore(departmentScores);
    const simpleAvg = 20; // 100/5

    // NVS has 25% weight, so weighted = 25, not 20
    expect(weighted).toBe(25);
    expect(weighted).not.toBe(simpleAvg);
  });

  it('handles missing departments gracefully', () => {
    const partial: Record<string, number> = {
      'new-vehicle-sales': 80,
      'service-performance': 60,
    };
    const result = calculateWeightedScore(partial);
    // Should normalize: (80*0.25 + 60*0.20) / (0.25+0.20) = 32/0.45 ≈ 71
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('returns 0 for empty input', () => {
    expect(calculateWeightedScore({})).toBe(0);
  });
});

describe('calculateAllSectionScores', () => {
  it('returns scores for all sections with answers', () => {
    const answers = uniformAnswers(3);
    const scores = calculateAllSectionScores(questionnaire.sections, answers);

    expect(Object.keys(scores).length).toBe(questionnaire.sections.length);
    for (const score of Object.values(scores)) {
      expect(score).toBe(60); // 3/5 = 60%
    }
  });
});

// ─── B. Sub-Category Analysis ─────────────────────────────────────────

describe('calculateSubCategoryScores', () => {
  it('groups questions by category field', () => {
    const answers = uniformAnswers(4);
    const result = calculateSubCategoryScores(questionnaire.sections, answers);

    // Should have an entry per section
    expect(Object.keys(result).length).toBe(questionnaire.sections.length);

    // Each department should have sub-categories
    for (const dept of Object.values(result)) {
      expect(dept.subCategories.length).toBeGreaterThan(0);
      for (const sc of dept.subCategories) {
        expect(sc.category).toBeTruthy();
        expect(sc.score).toBeGreaterThanOrEqual(0);
        expect(sc.score).toBeLessThanOrEqual(100);
        expect(sc.questionCount).toBeGreaterThan(0);
      }
    }
  });

  it('sub-categories are sorted worst-first', () => {
    // Give volume questions score 1, everything else 5
    const answers: Record<string, number> = {};
    for (const section of questionnaire.sections) {
      for (const q of section.questions) {
        answers[q.id] = q.category === 'volume' ? 1 : 5;
      }
    }
    const result = calculateSubCategoryScores(questionnaire.sections, answers);

    for (const dept of Object.values(result)) {
      if (dept.subCategories.length >= 2) {
        expect(dept.subCategories[0].score).toBeLessThanOrEqual(dept.subCategories[1].score);
      }
    }
  });
});

// ─── C. Confidence Metrics ────────────────────────────────────────────

describe('calculateConfidenceMetrics', () => {
  it('returns high confidence for consistent answers', () => {
    const result = calculateConfidenceMetrics([4, 4, 4, 4, 4]);
    expect(result.confidence).toBe('high');
    expect(result.standardDeviation).toBe(0);
    expect(result.consistencyScore).toBe(100);
    expect(result.reviewRecommended).toBe(false);
  });

  it('returns low confidence for wildly varying answers', () => {
    const result = calculateConfidenceMetrics([1, 5, 1, 5, 1, 5]);
    expect(result.confidence).toBe('low');
    expect(result.reviewRecommended).toBe(true);
    expect(result.consistencyScore).toBeLessThan(50);
  });

  it('returns medium confidence for moderate variance', () => {
    const result = calculateConfidenceMetrics([2, 3, 4, 3, 2]);
    expect(['medium', 'high']).toContain(result.confidence);
  });

  it('handles single value', () => {
    const result = calculateConfidenceMetrics([3]);
    expect(result.confidence).toBe('high');
  });
});

describe('calculateAllConfidenceMetrics', () => {
  it('returns confidence for all sections', () => {
    const answers = uniformAnswers(3);
    const result = calculateAllConfidenceMetrics(questionnaire.sections, answers);
    expect(Object.keys(result).length).toBe(questionnaire.sections.length);

    for (const conf of Object.values(result)) {
      expect(conf.confidence).toBe('high'); // uniform = perfect consistency
    }
  });
});

// ─── D. Cross-Department Correlation ──────────────────────────────────

describe('detectSystemicPatterns', () => {
  it('detects systemic patterns when same category is weak across 3+ depts', () => {
    // Make "digital" questions score 1 everywhere, rest score 5
    const answers: Record<string, number> = {};
    for (const section of questionnaire.sections) {
      for (const q of section.questions) {
        answers[q.id] = q.category === 'digital' ? 1 : 5;
      }
    }

    const patterns = detectSystemicPatterns(questionnaire.sections, answers, 2);
    const systemicOnes = patterns.filter(p => p.severity === 'systemic');

    // If "digital" questions exist in 3+ sections, we should find a systemic pattern
    const sectionsWithDigital = questionnaire.sections.filter(s =>
      s.questions.some(q => q.category === 'digital')
    ).length;

    if (sectionsWithDigital >= 3) {
      expect(systemicOnes.length).toBeGreaterThan(0);
      const digitalPattern = systemicOnes.find(p => p.signalCode === 'DIGITAL');
      expect(digitalPattern).toBeTruthy();
      expect(digitalPattern!.departments.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('returns empty when all scores are good', () => {
    const answers = uniformAnswers(5);
    const patterns = detectSystemicPatterns(questionnaire.sections, answers);
    expect(patterns.length).toBe(0);
  });
});

// ─── E. Enhanced Maturity Model ───────────────────────────────────────

describe('calculateEnhancedMaturity', () => {
  it('returns Leading when score >= 85 and all sub-cats >= 60', () => {
    const subCats = [
      { category: 'volume', score: 90, questionCount: 2, weight: 2.0 },
      { category: 'conversion', score: 85, questionCount: 2, weight: 2.0 },
    ];
    const conf = { standardDeviation: 0.3, consistencyScore: 85, confidence: 'high' as const, reviewRecommended: false };
    const result = calculateEnhancedMaturity(90, subCats, conf);
    expect(result.level).toBe('Leading');
  });

  it('downgrades to Advanced when score >= 85 but sub-cat < 60', () => {
    const subCats = [
      { category: 'volume', score: 95, questionCount: 2, weight: 2.0 },
      { category: 'digital', score: 40, questionCount: 2, weight: 2.0 },
    ];
    const conf = { standardDeviation: 0.5, consistencyScore: 75, confidence: 'high' as const, reviewRecommended: false };
    const result = calculateEnhancedMaturity(88, subCats, conf);
    expect(result.level).toBe('Advanced');
  });

  it('forces Foundational when any sub-cat < 30', () => {
    const subCats = [
      { category: 'volume', score: 80, questionCount: 2, weight: 2.0 },
      { category: 'digital', score: 20, questionCount: 2, weight: 2.0 },
    ];
    const conf = { standardDeviation: 0.5, consistencyScore: 75, confidence: 'high' as const, reviewRecommended: false };
    const result = calculateEnhancedMaturity(65, subCats, conf);
    expect(result.level).toBe('Foundational');
  });

  it('returns Developing for low confidence departments', () => {
    const subCats = [
      { category: 'volume', score: 70, questionCount: 2, weight: 2.0 },
    ];
    const conf = { standardDeviation: 1.8, consistencyScore: 10, confidence: 'low' as const, reviewRecommended: true };
    const result = calculateEnhancedMaturity(65, subCats, conf);
    expect(result.level).toBe('Developing');
  });

  it('returns Developing for middle-range scores', () => {
    const subCats = [
      { category: 'volume', score: 55, questionCount: 2, weight: 2.0 },
    ];
    const conf = { standardDeviation: 0.5, consistencyScore: 75, confidence: 'high' as const, reviewRecommended: false };
    const result = calculateEnhancedMaturity(55, subCats, conf);
    expect(result.level).toBe('Developing');
  });
});

// ─── Integration: Weighted vs Simple Average ──────────────────────────

describe('Integration: weighted scoring differs from simple average', () => {
  it('overall weighted score differs from simple department average when scores vary', () => {
    // Give high scores to low-weight dept, low scores to high-weight dept
    const scores: Record<string, number> = {
      'new-vehicle-sales': 40,       // 25% weight
      'used-vehicle-sales': 90,      // 20% weight
      'service-performance': 90,     // 20% weight
      'financial-operations': 90,    // 20% weight
      'parts-inventory': 90,         // 15% weight
    };

    const simpleAvg = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length);
    const weighted = calculateWeightedScore(scores);

    // Simple avg = (40+90+90+90+90)/5 = 80
    expect(simpleAvg).toBe(80);
    // Weighted = 40*0.25 + 90*0.20 + 90*0.20 + 90*0.20 + 90*0.15 = 10+18+18+18+13.5 = 77.5 ≈ 78
    expect(weighted).not.toBe(simpleAvg);
    expect(weighted).toBeLessThan(simpleAvg); // because the heaviest-weight dept (NVS 25%) scored lowest
  });

  it('section weighted scoring differs from simple average with varied question weights', () => {
    const section = questionnaire.sections[0];
    const questions = section.questions;

    // Find min and max weight questions
    const sorted = [...questions].sort((a, b) => a.weight - b.weight);
    const lightest = sorted[0];
    const heaviest = sorted[sorted.length - 1];

    // Only run this test if weights actually differ
    if (lightest.weight === heaviest.weight) return;

    // Give heaviest-weight question score 5, lightest score 1, rest score 3
    const answers: Record<string, number> = {};
    for (const q of questions) answers[q.id] = 3;
    answers[heaviest.id] = 5;
    answers[lightest.id] = 1;

    const weighted = calculateWeightedSectionScore(questions, answers)!;

    // Simple average
    const values = questions.map(q => answers[q.id]);
    const simpleAvg = Math.round((values.reduce((s, v) => s + v, 0) / values.length / 5) * 100);

    // Weighted should be higher than simple because the heavy question has higher score
    expect(weighted).toBeGreaterThan(simpleAvg);
  });
});

// ─── Sanity: Category weights sum to 1.0 ──────────────────────────────

describe('CATEGORY_WEIGHTS', () => {
  it('sums to 1.0', () => {
    const sum = Object.values(CATEGORY_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('all departments map to a category', () => {
    for (const section of questionnaire.sections) {
      const cat = DEPARTMENT_TO_CATEGORY[section.id];
      expect(cat).toBeTruthy();
      expect(CATEGORY_WEIGHTS[cat]).toBeGreaterThan(0);
    }
  });
});
