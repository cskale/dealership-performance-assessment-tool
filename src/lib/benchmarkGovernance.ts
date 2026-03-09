/**
 * Benchmark Governance Module
 * 
 * Provides source confidence handling and governance rules for benchmark data.
 * Ensures benchmark claims are transparent, cautious, and enterprise-appropriate.
 */

export type BenchmarkSourceType = 'generic' | 'oem_specific' | 'estimated' | 'verified';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface BenchmarkMetadata {
  sourceType: BenchmarkSourceType;
  confidenceLevel: ConfidenceLevel;
  confidenceNote?: string;
  sourceLabel?: string;
  lastUpdated?: string;
  sampleSize?: number;
}

export interface GovernedBenchmark {
  value: string;
  directionality: 'higher_better' | 'lower_better';
  referenceRange?: { min: number; max: number };
  topQuartile?: number;
  metadata: BenchmarkMetadata;
}

/**
 * Default benchmark metadata for KPIs without explicit governance
 */
export const DEFAULT_BENCHMARK_METADATA: BenchmarkMetadata = {
  sourceType: 'generic',
  confidenceLevel: 'medium',
  confidenceNote: 'Generic industry reference. Actual benchmarks vary by OEM, market, and operating model.',
};

/**
 * Enhanced benchmark metadata per KPI key
 */
export const KPI_BENCHMARK_GOVERNANCE: Record<string, BenchmarkMetadata> = {
  // New Vehicle Sales
  leadResponseTime: {
    sourceType: 'verified',
    confidenceLevel: 'high',
    confidenceNote: 'Industry research consensus. Response time impact well-documented.',
    sourceLabel: 'Industry Research',
  },
  leadConversion: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Benchmark range varies by lead source quality and market conditions.',
  },
  showroomConversion: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Range reflects well-optimized vs. average dealerships.',
  },
  testDriveRatio: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target range for proactive sales processes.',
  },
  appointmentShowRate: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Best-practice range. Results depend on confirmation protocols.',
  },
  salesCycleLength: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target assumes standard retail process. Fleet/commercial sales differ.',
  },
  
  // Service KPIs
  serviceAbsorption: {
    sourceType: 'verified',
    confidenceLevel: 'high',
    confidenceNote: 'Well-established industry metric. 100% = fixed operations cover fixed expenses.',
    sourceLabel: 'NADA/Industry Standard',
  },
  labourEfficiency: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target varies by labor rate structure and service mix.',
  },
  technicianUtilization: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Benchmark assumes standard 8-hour shift with reasonable workflow.',
  },
  serviceRetention: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Retention varies significantly by vehicle age and warranty status.',
  },
  effectiveLabourRate: {
    sourceType: 'estimated',
    confidenceLevel: 'low',
    confidenceNote: 'Highly market-dependent. Use dealer-specific market data for accuracy.',
  },
  
  // Parts KPIs
  partsGrossProfit: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Margin benchmark. Varies by OEM pricing policies and mix.',
  },
  partsInventoryTurnover: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target turnover. Fast-moving vs. slow-moving parts differ significantly.',
  },
  partsFillRate: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'First-time fill rate target. Excludes special orders.',
  },
  
  // Financial KPIs
  netProfitMargin: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target range for well-managed dealerships. Excludes exceptional market conditions.',
  },
  returnOnAssets: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Asset-heavy businesses may differ. Adjust for real estate ownership.',
  },
  variableSelling: {
    sourceType: 'estimated',
    confidenceLevel: 'low',
    confidenceNote: 'Expense benchmark. Market and brand positioning significantly affect this.',
  },
};

/**
 * Get governed benchmark metadata for a KPI
 */
export function getBenchmarkGovernance(kpiKey: string): BenchmarkMetadata {
  return KPI_BENCHMARK_GOVERNANCE[kpiKey] || DEFAULT_BENCHMARK_METADATA;
}

/**
 * Format confidence note for display
 */
export function formatConfidenceNote(
  metadata: BenchmarkMetadata,
  language: 'en' | 'de' = 'en'
): string {
  if (metadata.confidenceNote) {
    return metadata.confidenceNote;
  }

  const defaultNotes: Record<BenchmarkSourceType, Record<string, string>> = {
    generic: {
      en: 'Generic industry reference. Actual benchmarks vary by OEM, market, and operating model.',
      de: 'Allgemeine Branchenreferenz. Benchmarks variieren nach OEM, Markt und Betriebsmodell.',
    },
    oem_specific: {
      en: 'OEM-specific benchmark. Validated for this brand/network.',
      de: 'OEM-spezifischer Benchmark. Validiert für diese Marke/Netzwerk.',
    },
    estimated: {
      en: 'Estimated reference. Use with dealer-specific context for accuracy.',
      de: 'Geschätzte Referenz. Mit händlerspezifischem Kontext verwenden.',
    },
    verified: {
      en: 'Verified industry benchmark with strong research support.',
      de: 'Verifizierter Branchenbenchmark mit starker Forschungsunterstützung.',
    },
  };

  return defaultNotes[metadata.sourceType][language] || defaultNotes[metadata.sourceType].en;
}

/**
 * Get source type badge label
 */
export function getSourceTypeLabel(
  sourceType: BenchmarkSourceType,
  language: 'en' | 'de' = 'en'
): string {
  const labels: Record<BenchmarkSourceType, Record<string, string>> = {
    generic: { en: 'Industry Reference', de: 'Branchenreferenz' },
    oem_specific: { en: 'OEM Specific', de: 'OEM-spezifisch' },
    estimated: { en: 'Estimated', de: 'Geschätzt' },
    verified: { en: 'Verified', de: 'Verifiziert' },
  };
  return labels[sourceType][language] || labels[sourceType].en;
}

/**
 * Get confidence level badge variant
 */
export function getConfidenceBadgeVariant(
  level: ConfidenceLevel
): 'default' | 'secondary' | 'outline' {
  switch (level) {
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Check if a benchmark should show a caution note
 */
export function shouldShowCaution(metadata: BenchmarkMetadata): boolean {
  return (
    metadata.confidenceLevel === 'low' ||
    metadata.sourceType === 'estimated' ||
    (metadata.sourceType === 'generic' && metadata.confidenceLevel !== 'high')
  );
}

/**
 * Generate benchmark disclaimer text for exports
 */
export function generateBenchmarkDisclaimer(language: 'en' | 'de' = 'en'): string {
  const disclaimers = {
    en: 'Benchmarks are reference ranges based on industry data and may vary by OEM, market conditions, and operating model. Use in conjunction with dealer-specific context for accurate interpretation.',
    de: 'Benchmarks sind Referenzbereiche basierend auf Branchendaten und können je nach OEM, Marktbedingungen und Betriebsmodell variieren. Für genaue Interpretation mit händlerspezifischem Kontext verwenden.',
  };
  return disclaimers[language] || disclaimers.en;
}

/**
 * Format benchmark value with appropriate caution language
 */
export function formatGovernedBenchmark(
  benchmark: string,
  metadata: BenchmarkMetadata,
  language: 'en' | 'de' = 'en'
): string {
  if (metadata.sourceType === 'verified' && metadata.confidenceLevel === 'high') {
    return benchmark;
  }

  const prefixes = {
    generic: { en: 'Ref: ', de: 'Ref: ' },
    estimated: { en: '~', de: '~' },
    oem_specific: { en: '', de: '' },
    verified: { en: '', de: '' },
  };

  return `${prefixes[metadata.sourceType][language] || ''}${benchmark}`;
}
