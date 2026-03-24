import type { Question, Section } from '@/data/questionnaire';
import type { SignalCode } from '@/data/signalTypes';
import { BusinessModel, isSectionSuppressed } from '@/lib/moduleGating';

// Fixed category weights (must sum to 1.0)
export const CATEGORY_WEIGHTS = {
  newVehicleSales: 0.25,
  usedVehicleSales: 0.20,
  servicePerformance: 0.20,
  financialOperations: 0.20,
  partsInventory: 0.15
} as const;

// Map department keys to category weights
export const DEPARTMENT_TO_CATEGORY: Record<string, keyof typeof CATEGORY_WEIGHTS> = {
  'new-vehicle-sales': 'newVehicleSales',
  'used-vehicle-sales': 'usedVehicleSales',
  'service-performance': 'servicePerformance',
  'financial-operations': 'financialOperations',
  'parts-inventory': 'partsInventory'
};

/**
 * Calculate weighted overall score from department scores
 * Handles missing categories gracefully
 */
export function calculateWeightedScore(departmentScores: Record<string, number>): number {
  const categoryScores: Record<string, number[]> = {};
  
  for (const [dept, score] of Object.entries(departmentScores)) {
    if (typeof score !== 'number' || isNaN(score)) continue;
    
    const category = DEPARTMENT_TO_CATEGORY[dept];
    if (!category) continue;
    
    if (!categoryScores[category]) categoryScores[category] = [];
    categoryScores[category].push(score);
  }
  
  if (Object.keys(categoryScores).length === 0) return 0;
  
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const [category, scores] of Object.entries(categoryScores)) {
    const categoryAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const weight = CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS];
    if (weight) {
      weightedScore += categoryAvg * weight;
      totalWeight += weight;
    }
  }
  
  if (totalWeight > 0 && totalWeight < 1) {
    weightedScore = weightedScore / totalWeight;
  }
  
  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}

/**
 * Calculate weighted section score using question weights
 * 
 * weighted_avg = sum(answer * weight) / sum(weights)
 */
export function calculateWeightedSectionScore(
  questions: Question[],
  answers: Record<string, number>
): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const q of questions) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    
    const weight = q.weight || 1.0;
    weightedSum += answer * weight;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) return null;
  
  const weightedAvg = weightedSum / totalWeight;
  // Convert from 1-5 scale to 0-100
  return Math.round((weightedAvg / 5) * 100);
}

/**
 * Calculate all section scores using question weights
 */
export function calculateAllSectionScores(
  sections: Section[],
  answers: Record<string, number>
): Record<string, number> {
  const scores: Record<string, number> = {};
  
  for (const section of sections) {
    const score = calculateWeightedSectionScore(section.questions, answers);
    if (score !== null) {
      scores[section.id] = score;
    }
  }
  
  return scores;
}

// ─── Sub-Category Analysis ───────────────────────────────────────────

export interface SubCategoryScore {
  category: string;
  score: number;
  questionCount: number;
  weight: number;
}

export interface DepartmentSubCategories {
  department: string;
  overallScore: number;
  subCategories: SubCategoryScore[];
}

/**
 * Calculate sub-category scores within each department
 * Groups questions by their `category` field (volume, conversion, satisfaction, etc.)
 */
export function calculateSubCategoryScores(
  sections: Section[],
  answers: Record<string, number>
): Record<string, DepartmentSubCategories> {
  const result: Record<string, DepartmentSubCategories> = {};
  
  for (const section of sections) {
    const groups: Record<string, { weightedSum: number; totalWeight: number; count: number }> = {};
    
    for (const q of section.questions) {
      const answer = answers[q.id];
      if (answer === undefined) continue;
      
      const cat = q.category || 'general';
      if (!groups[cat]) groups[cat] = { weightedSum: 0, totalWeight: 0, count: 0 };
      
      const w = q.weight || 1.0;
      groups[cat].weightedSum += answer * w;
      groups[cat].totalWeight += w;
      groups[cat].count++;
    }
    
    const subCategories: SubCategoryScore[] = Object.entries(groups).map(([cat, g]) => ({
      category: cat,
      score: Math.round((g.weightedSum / g.totalWeight / 5) * 100),
      questionCount: g.count,
      weight: g.totalWeight
    }));
    
    // Sort worst-first
    subCategories.sort((a, b) => a.score - b.score);
    
    const overallScore = calculateWeightedSectionScore(section.questions, answers);
    
    result[section.id] = {
      department: section.id,
      overallScore: overallScore ?? 0,
      subCategories
    };
  }
  
  return result;
}

// ─── Confidence Metrics ──────────────────────────────────────────────

export interface ConfidenceMetrics {
  standardDeviation: number;
  consistencyScore: number; // 0-100, higher = more consistent
  confidence: 'high' | 'medium' | 'low';
  reviewRecommended: boolean;
}

/**
 * Calculate answer consistency / confidence for a set of answers
 */
export function calculateConfidenceMetrics(values: number[]): ConfidenceMetrics {
  if (values.length < 2) {
    return { standardDeviation: 0, consistencyScore: 100, confidence: 'high', reviewRecommended: false };
  }
  
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Max possible stdDev on 1-5 scale ≈ 2.0
  // Consistency = 100 * (1 - stdDev / 2.0)
  const consistencyScore = Math.round(Math.max(0, Math.min(100, 100 * (1 - stdDev / 2.0))));
  
  let confidence: 'high' | 'medium' | 'low';
  if (stdDev <= 0.8) confidence = 'high';
  else if (stdDev <= 1.2) confidence = 'medium';
  else confidence = 'low';
  
  return {
    standardDeviation: Math.round(stdDev * 100) / 100,
    consistencyScore,
    confidence,
    reviewRecommended: stdDev > 1.2
  };
}

/**
 * Calculate confidence metrics for all sections
 */
export function calculateAllConfidenceMetrics(
  sections: Section[],
  answers: Record<string, number>
): Record<string, ConfidenceMetrics> {
  const result: Record<string, ConfidenceMetrics> = {};
  
  for (const section of sections) {
    const values = section.questions
      .map(q => answers[q.id])
      .filter((v): v is number => v !== undefined);
    
    result[section.id] = calculateConfidenceMetrics(values);
  }
  
  return result;
}

// ─── Cross-Department Correlation ────────────────────────────────────

export interface SystemicPattern {
  signalCode: string;
  departments: string[];
  severity: 'systemic' | 'recurring';
  description: string;
}

/**
 * Detect systemic patterns — signals appearing across 3+ departments
 * 
 * Works by mapping each question's category to a generic "signal type" and
 * detecting when the same type of weakness spans multiple departments.
 */
export function detectSystemicPatterns(
  sections: Section[],
  answers: Record<string, number>,
  weakThreshold: number = 2 // answers at or below this are "weak"
): SystemicPattern[] {
  // Group weak answers by category across departments
  const categoryWeakness: Record<string, string[]> = {};
  
  for (const section of sections) {
    for (const q of section.questions) {
      const answer = answers[q.id];
      if (answer === undefined || answer > weakThreshold) continue;
      
      const cat = q.category || 'general';
      if (!categoryWeakness[cat]) categoryWeakness[cat] = [];
      if (!categoryWeakness[cat].includes(section.id)) {
        categoryWeakness[cat].push(section.id);
      }
    }
  }
  
  const patterns: SystemicPattern[] = [];
  
  for (const [category, departments] of Object.entries(categoryWeakness)) {
    if (departments.length >= 3) {
      patterns.push({
        signalCode: category.toUpperCase(),
        departments,
        severity: 'systemic',
        description: `${capitalize(category)} weakness detected across ${departments.length} departments — indicates an organization-wide issue, not isolated incidents.`
      });
    } else if (departments.length === 2) {
      patterns.push({
        signalCode: category.toUpperCase(),
        departments,
        severity: 'recurring',
        description: `${capitalize(category)} weakness detected in ${departments.length} departments — emerging pattern to monitor.`
      });
    }
  }
  
  // Sort systemic first, then by department count
  patterns.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'systemic' ? -1 : 1;
    return b.departments.length - a.departments.length;
  });
  
  return patterns;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Enhanced Maturity Model ─────────────────────────────────────────

export type MaturityLevelName = 'Advanced' | 'Mature' | 'Developing' | 'Basic' | 'Inconsistent';

export interface EnhancedMaturityResult {
  level: MaturityLevelName;
  numericLevel: 1 | 2 | 3 | 4;
  reason: string;
}

/**
 * Enhanced maturity model using sub-category analysis
 * 
 * Rules:
 * - "Advanced" requires score ≥ 85 AND no sub-category below 60
 * - "Basic" if any sub-category below 30, regardless of average
 * - "Inconsistent" if confidence is low (high variance)
 * - Otherwise standard thresholds: ≥70 Mature, ≥50 Developing, else Basic
 */
export function calculateEnhancedMaturity(
  overallScore: number,
  subCategories: SubCategoryScore[],
  confidence: ConfidenceMetrics
): EnhancedMaturityResult {
  const minSubCat = subCategories.length > 0 
    ? Math.min(...subCategories.map(sc => sc.score)) 
    : overallScore;
  
  // Inconsistent: high variance overrides other levels
  if (confidence.confidence === 'low' && overallScore >= 50) {
    return {
      level: 'Inconsistent',
      numericLevel: 2,
      reason: 'High answer variance detected — responses suggest inconsistent performance across areas.'
    };
  }
  
  // Advanced: needs high score AND all sub-categories above 60
  if (overallScore >= 85 && minSubCat >= 60) {
    return {
      level: 'Advanced',
      numericLevel: 4,
      reason: 'Consistently high performance across all capability areas.'
    };
  }
  
  // Downgrade if score looks high but has a very weak sub-category
  if (overallScore >= 85 && minSubCat < 60) {
    return {
      level: 'Mature',
      numericLevel: 3,
      reason: `Overall score is strong but ${subCategories.find(sc => sc.score < 60)?.category || 'a sub-category'} needs attention.`
    };
  }
  
  // Basic: any sub-category critically weak
  if (minSubCat < 30) {
    return {
      level: 'Basic',
      numericLevel: 1,
      reason: `Critical weakness in ${subCategories.find(sc => sc.score < 30)?.category || 'a sub-category'} (${minSubCat}%) requires immediate attention.`
    };
  }
  
  // Standard thresholds
  if (overallScore >= 70) {
    return { level: 'Mature', numericLevel: 3, reason: 'Solid performance with room for optimization.' };
  }
  if (overallScore >= 50) {
    return { level: 'Developing', numericLevel: 2, reason: 'Processes are being established. Focus on consistency.' };
  }
  
  return { level: 'Basic', numericLevel: 1, reason: 'Foundational processes need to be established.' };
}

// ─── Legacy exports (kept for backwards compatibility) ───────────────

export function calculateCategoryScores(departmentScores: Record<string, number>): Record<string, {
  score: number;
  weight: number;
  weightedContribution: number;
}> {
  const categoryScores: Record<string, { score: number; weight: number; weightedContribution: number }> = {};
  
  for (const [dept, score] of Object.entries(departmentScores)) {
    if (typeof score !== 'number' || isNaN(score)) continue;
    const category = DEPARTMENT_TO_CATEGORY[dept];
    if (!category) continue;
    const weight = CATEGORY_WEIGHTS[category];
    categoryScores[category] = {
      score: Math.round(score),
      weight,
      weightedContribution: Math.round(score * weight * 100) / 100
    };
  }
  
  return categoryScores;
}

export function getDepartmentWeight(department: string): number {
  const category = DEPARTMENT_TO_CATEGORY[department];
  if (!category) return 0;
  return CATEGORY_WEIGHTS[category];
}

export function getWeightPercentage(department: string): string {
  return `${Math.round(getDepartmentWeight(department) * 100)}%`;
}

export function getAdjustedCategoryWeights(
  businessModel: BusinessModel
): Record<string, number> {
  // Map section IDs to their CATEGORY_WEIGHTS keys
  const SECTION_TO_WEIGHT_KEY: Record<string, string> = {
    'new-vehicle-sales': 'newVehicleSales',
    'used-vehicle-sales': 'usedVehicleSales',
    'service-performance': 'servicePerformance',
    'parts-inventory': 'partsInventory',
    'financial-operations': 'financialOperations'
  };

  if (!businessModel) return { ...CATEGORY_WEIGHTS };

  // Find suppressed sections and their weights
  const suppressedKeys: string[] = [];
  let suppressedWeight = 0;

  for (const [sectionId, weightKey] of Object.entries(SECTION_TO_WEIGHT_KEY)) {
    const { suppressed } = isSectionSuppressed(sectionId, businessModel);
    if (suppressed) {
      suppressedKeys.push(weightKey);
      suppressedWeight += (CATEGORY_WEIGHTS as Record<string, number>)[weightKey] || 0;
    }
  }

  if (suppressedKeys.length === 0) return { ...CATEGORY_WEIGHTS };

  // Redistribute suppressed weight proportionally among active sections
  const activeKeys = Object.keys(CATEGORY_WEIGHTS).filter(k => !suppressedKeys.includes(k));
  const totalActiveWeight = activeKeys.reduce(
    (sum, k) => sum + (CATEGORY_WEIGHTS as Record<string, number>)[k], 0
  );

  const adjusted: Record<string, number> = {};
  for (const key of Object.keys(CATEGORY_WEIGHTS)) {
    if (suppressedKeys.includes(key)) {
      adjusted[key] = 0;
    } else {
      const original = (CATEGORY_WEIGHTS as Record<string, number>)[key];
      adjusted[key] = original + (suppressedWeight * (original / totalActiveWeight));
    }
  }

  return adjusted;
}
