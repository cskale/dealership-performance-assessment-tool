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
  // Group scores by category
  const categoryScores: Record<string, number[]> = {};
  
  for (const [dept, score] of Object.entries(departmentScores)) {
    // Validate score
    if (typeof score !== 'number' || isNaN(score)) {
      console.warn(`Invalid score for ${dept}:`, score);
      continue;
    }
    
    const category = DEPARTMENT_TO_CATEGORY[dept];
    if (!category) {
      console.warn(`Department ${dept} not mapped to a category`);
      continue;
    }
    
    if (!categoryScores[category]) {
      categoryScores[category] = [];
    }
    categoryScores[category].push(score);
  }
  
  // If no valid scores, return 0
  if (Object.keys(categoryScores).length === 0) {
    console.error('No valid department scores found');
    return 0;
  }
  
  // Calculate category averages and apply weights
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const [category, scores] of Object.entries(categoryScores)) {
    const categoryAvg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const weight = CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS];
    
    if (weight) {
      weightedScore += categoryAvg * weight;
      totalWeight += weight;
    }
  }
  
  // Normalize if some categories are missing
  if (totalWeight > 0 && totalWeight < 1) {
    weightedScore = weightedScore / totalWeight;
  }
  
  return Math.round(Math.max(0, Math.min(100, weightedScore))); // Clamp 0-100
}

/**
 * Calculate individual category scores with weights
 */
export function calculateCategoryScores(departmentScores: Record<string, number>): Record<string, {
  score: number;
  weight: number;
  weightedContribution: number;
}> {
  const categoryScores: Record<string, {
    score: number;
    weight: number;
    weightedContribution: number;
  }> = {};
  
  for (const [dept, score] of Object.entries(departmentScores)) {
    if (typeof score !== 'number' || isNaN(score)) continue;
    
    const category = DEPARTMENT_TO_CATEGORY[dept];
    if (!category) continue;
    
    const weight = CATEGORY_WEIGHTS[category];
    
    categoryScores[category] = {
      score: Math.round(score),
      weight: weight,
      weightedContribution: Math.round(score * weight * 100) / 100
    };
  }
  
  return categoryScores;
}

/**
 * Get the weight for a specific department
 */
export function getDepartmentWeight(department: string): number {
  const category = DEPARTMENT_TO_CATEGORY[department];
  if (!category) return 0;
  return CATEGORY_WEIGHTS[category];
}

/**
 * Format weights as percentage string
 */
export function getWeightPercentage(department: string): string {
  const weight = getDepartmentWeight(department);
  return `${Math.round(weight * 100)}%`;
}
