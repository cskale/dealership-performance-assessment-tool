// European number and currency formatting utilities

export const formatEuro = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatEuroLarge = (amount: number): string => {
  if (amount >= 1000000) {
    return formatEuro(amount / 1000000) + 'M';
  } else if (amount >= 1000) {
    return formatEuro(amount / 1000) + 'K';
  }
  return formatEuro(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

// Deterministic pseudo-random based on score (NOT Math.random())
// This ensures values stay constant for a given score
const seededValue = (base: number, variance: number, seed: number): number => {
  // Use a simple hash of seed to create consistent "random" offset
  const offset = ((seed * 9301 + 49297) % 233280) / 233280;
  return base + (variance * offset);
};

// Generate realistic automotive industry data for European markets
// CRITICAL: Values are DETERMINISTIC based on score - no randomness!
export const generateRealisticData = (baseScore: number, category: string) => {
  const baseMultiplier = baseScore / 100;
  const seed = baseScore; // Use score as seed for deterministic values
  
  switch (category) {
    case 'new-vehicle-sales':
      return {
        monthlyRevenue: Math.round(seededValue(250000, 200000, seed) * baseMultiplier),
        averageMargin: 8.5 + (baseScore - 50) * 0.1,
        customerSatisfaction: Math.min(95, 70 + baseScore * 0.3),
        leadConversion: Math.min(35, 15 + baseScore * 0.25),
        averageTransactionValue: Math.round(seededValue(35000, 7000, seed) * baseMultiplier),
      };
    
    case 'used-vehicle-sales':
      return {
        monthlyRevenue: Math.round(seededValue(180000, 120000, seed + 1) * baseMultiplier),
        averageMargin: 12.2 + (baseScore - 50) * 0.15,
        turnoverRate: Math.max(6, 12 - (baseScore - 50) * 0.1),
        customerSatisfaction: Math.min(92, 68 + baseScore * 0.28),
        averageTransactionValue: Math.round(seededValue(22000, 6000, seed + 1) * baseMultiplier),
      };
    
    case 'service-performance':
      return {
        monthlyRevenue: Math.round(seededValue(120000, 80000, seed + 2) * baseMultiplier),
        laborEfficiency: Math.min(95, 60 + baseScore * 0.4),
        customerRetention: Math.min(88, 55 + baseScore * 0.4),
        averageRO: Math.round(seededValue(180, 60, seed + 2) * baseMultiplier),
        technicianUtilization: Math.min(92, 65 + baseScore * 0.3),
      };
    
    case 'parts-inventory':
      return {
        monthlyRevenue: Math.round(seededValue(80000, 50000, seed + 3) * baseMultiplier),
        turnoverRate: Math.min(8, 3 + baseScore * 0.08),
        grossMargin: Math.min(45, 25 + baseScore * 0.25),
        stockoutRate: Math.max(2, 15 - baseScore * 0.15),
        supplierPerformance: Math.min(96, 70 + baseScore * 0.3),
      };
    
    case 'financial-operations':
      return {
        profitMargin: Math.min(12, 2 + baseScore * 0.12),
        cashFlowDays: Math.max(15, 45 - baseScore * 0.4),
        costPerSale: Math.max(450, 800 - baseScore * 4),
        roiMarketing: Math.min(350, 100 + baseScore * 3),
        operationalEfficiency: Math.min(94, 60 + baseScore * 0.4),
      };
    
    default:
      return {};
  }
};

// Industry benchmarks for European automotive market
export const industryBenchmarks = {
  'new-vehicle-sales': {
    monthlyRevenue: 420000,
    averageMargin: 9.2,
    customerSatisfaction: 84,
    leadConversion: 23,
    averageTransactionValue: 42000,
  },
  'used-vehicle-sales': {
    monthlyRevenue: 290000,
    averageMargin: 15.8,
    turnoverRate: 8.5,
    customerSatisfaction: 81,
    averageTransactionValue: 28000,
  },
  'service-performance': {
    monthlyRevenue: 185000,
    laborEfficiency: 78,
    customerRetention: 72,
    averageRO: 245,
    technicianUtilization: 82,
  },
  'parts-inventory': {
    monthlyRevenue: 125000,
    turnoverRate: 6.2,
    grossMargin: 38,
    stockoutRate: 8,
    supplierPerformance: 85,
  },
  'financial-operations': {
    profitMargin: 6.8,
    cashFlowDays: 28,
    costPerSale: 580,
    roiMarketing: 220,
    operationalEfficiency: 79,
  },
};
