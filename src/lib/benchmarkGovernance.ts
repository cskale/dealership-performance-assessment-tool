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
    sampleSize: 1200,
    lastUpdated: '2024-Q4',
  },
  leadConversion: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Benchmark range varies by lead source quality and market conditions.',
    sampleSize: 380,
    lastUpdated: '2024-Q4',
  },
  showroomConversion: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Range reflects well-optimized vs. average dealerships.',
    sampleSize: 290,
    lastUpdated: '2024-Q4',
  },
  testDriveRatio: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target range for proactive sales processes.',
    sampleSize: 210,
    lastUpdated: '2024-Q4',
  },
  appointmentShowRate: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Best-practice range. Results depend on confirmation protocols.',
    sampleSize: 175,
    lastUpdated: '2024-Q4',
  },
  salesCycleLength: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target assumes standard retail process. Fleet/commercial sales differ.',
    sampleSize: 160,
    lastUpdated: '2024-Q4',
  },

  // Service KPIs
  serviceAbsorption: {
    sourceType: 'verified',
    confidenceLevel: 'high',
    confidenceNote: 'Well-established industry metric. 100% = fixed operations cover fixed expenses.',
    sourceLabel: 'NADA/Industry Standard',
    sampleSize: 2400,
    lastUpdated: '2024-Q4',
  },
  labourEfficiency: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target varies by labor rate structure and service mix.',
    sampleSize: 310,
    lastUpdated: '2024-Q4',
  },
  technicianUtilization: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Benchmark assumes standard 8-hour shift with reasonable workflow.',
    sampleSize: 280,
    lastUpdated: '2024-Q4',
  },
  serviceRetention: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Retention varies significantly by vehicle age and warranty status.',
    sampleSize: 195,
    lastUpdated: '2024-Q4',
  },
  effectiveLabourRate: {
    sourceType: 'estimated',
    confidenceLevel: 'low',
    confidenceNote: 'Highly market-dependent. Use dealer-specific market data for accuracy.',
    sampleSize: 90,
    lastUpdated: '2024-Q4',
  },

  // Parts KPIs
  partsGrossProfit: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Margin benchmark. Varies by OEM pricing policies and mix.',
    sampleSize: 220,
    lastUpdated: '2024-Q4',
  },
  partsInventoryTurnover: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target turnover. Fast-moving vs. slow-moving parts differ significantly.',
    sampleSize: 190,
    lastUpdated: '2024-Q4',
  },
  partsFillRate: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'First-time fill rate target. Excludes special orders.',
    sampleSize: 210,
    lastUpdated: '2024-Q4',
  },

  // Financial KPIs
  netProfitMargin: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Target range for well-managed dealerships. Excludes exceptional market conditions.',
    sampleSize: 340,
    lastUpdated: '2024-Q4',
  },
  returnOnAssets: {
    sourceType: 'generic',
    confidenceLevel: 'medium',
    confidenceNote: 'Asset-heavy businesses may differ. Adjust for real estate ownership.',
    sampleSize: 160,
    lastUpdated: '2024-Q4',
  },
  variableSelling: {
    sourceType: 'estimated',
    confidenceLevel: 'low',
    confidenceNote: 'Expense benchmark. Market and brand positioning significantly affect this.',
    sampleSize: 75,
    lastUpdated: '2024-Q4',
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

/**
 * Per-KPI position labels mapping assessment score bands to estimated real-world ranges.
 * Each band (critical/weak/developing/strong/leading) maps to bilingual statements.
 */
export const KPI_POSITION_LABELS: Record<string, Record<string, {
  en: string;
  de: string;
  positionOnSpectrum: 'well_below' | 'below' | 'at' | 'above' | 'leading';
}>> = {
  leadResponseTime: {
    critical:   { en: 'Likely responding in 4+ hours — far outside the benchmark of <1 hr', de: 'Vermutlich >4 Std. Reaktionszeit — deutlich außerhalb des Benchmarks', positionOnSpectrum: 'well_below' },
    weak:       { en: 'Likely 1–4 hours — below the benchmark of <1 hr', de: '1–4 Std. — unterhalb des Benchmarks', positionOnSpectrum: 'below' },
    developing: { en: 'Likely 30–60 minutes — approaching the benchmark', de: '30–60 Min. — nahe am Benchmark', positionOnSpectrum: 'at' },
    strong:     { en: 'Likely <30 minutes — within benchmark range', de: '<30 Min. — im Benchmarkbereich', positionOnSpectrum: 'above' },
    leading:    { en: 'Likely <5 minutes — leading practice', de: '<5 Min. — führende Praxis', positionOnSpectrum: 'leading' },
  },
  showroomConversion: {
    critical:   { en: 'Estimated below 10% — well below benchmark of 20–30%', de: 'Geschätzt unter 10% — deutlich unter Benchmark', positionOnSpectrum: 'well_below' },
    weak:       { en: 'Estimated 10–15% — below benchmark of 20–30%', de: 'Geschätzt 10–15% — unter Benchmark', positionOnSpectrum: 'below' },
    developing: { en: 'Estimated 15–20% — approaching benchmark', de: 'Geschätzt 15–20% — nahe Benchmark', positionOnSpectrum: 'at' },
    strong:     { en: 'Estimated 20–28% — within benchmark range', de: 'Geschätzt 20–28% — im Benchmarkbereich', positionOnSpectrum: 'above' },
    leading:    { en: 'Estimated >28% — top-quartile performance', de: 'Geschätzt >28% — Top-Quartil', positionOnSpectrum: 'leading' },
  },
  serviceAbsorption: {
    critical:   { en: 'Estimated below 50% — fixed ops not covering fixed expenses', de: 'Geschätzt unter 50% — Fixkosten nicht gedeckt', positionOnSpectrum: 'well_below' },
    weak:       { en: 'Estimated 50–70% — below benchmark of 80–100%', de: 'Geschätzt 50–70% — unter Benchmark', positionOnSpectrum: 'below' },
    developing: { en: 'Estimated 70–85% — approaching benchmark', de: 'Geschätzt 70–85% — nahe Benchmark', positionOnSpectrum: 'at' },
    strong:     { en: 'Estimated 85–100% — within benchmark range', de: 'Geschätzt 85–100% — im Benchmarkbereich', positionOnSpectrum: 'above' },
    leading:    { en: 'Estimated >100% — fixed ops self-funding, top-quartile', de: 'Geschätzt >100% — Service finanziert sich selbst', positionOnSpectrum: 'leading' },
  },
  technicianUtilization: {
    critical:   { en: 'Estimated below 60% — significant productivity loss', de: 'Geschätzt unter 60% — erheblicher Produktivitätsverlust', positionOnSpectrum: 'well_below' },
    weak:       { en: 'Estimated 60–72% — below benchmark of 75–85%', de: 'Geschätzt 60–72% — unter Benchmark', positionOnSpectrum: 'below' },
    developing: { en: 'Estimated 72–78% — approaching benchmark', de: 'Geschätzt 72–78% — nahe Benchmark', positionOnSpectrum: 'at' },
    strong:     { en: 'Estimated 78–85% — within benchmark range', de: 'Geschätzt 78–85% — im Benchmarkbereich', positionOnSpectrum: 'above' },
    leading:    { en: 'Estimated >85% — leading utilisation', de: 'Geschätzt >85% — führende Auslastung', positionOnSpectrum: 'leading' },
  },
  partsFillRate: {
    critical:   { en: 'Estimated below 75% — service delays likely', de: 'Geschätzt unter 75% — Serviceverzögerungen wahrscheinlich', positionOnSpectrum: 'well_below' },
    weak:       { en: 'Estimated 75–85% — below benchmark of 90–95%', de: 'Geschätzt 75–85% — unter Benchmark', positionOnSpectrum: 'below' },
    developing: { en: 'Estimated 85–90% — approaching benchmark', de: 'Geschätzt 85–90% — nahe Benchmark', positionOnSpectrum: 'at' },
    strong:     { en: 'Estimated 90–95% — within benchmark range', de: 'Geschätzt 90–95% — im Benchmarkbereich', positionOnSpectrum: 'above' },
    leading:    { en: 'Estimated >95% — top-quartile availability', de: 'Geschätzt >95% — Top-Quartil Verfügbarkeit', positionOnSpectrum: 'leading' },
  },
  netProfitMargin: {
    critical:   { en: 'Estimated below 0% — dealership operating at a loss', de: 'Geschätzt unter 0% — Verlustbetrieb', positionOnSpectrum: 'well_below' },
    weak:       { en: 'Estimated 0–1.5% — below benchmark of 2–4%', de: 'Geschätzt 0–1,5% — unter Benchmark', positionOnSpectrum: 'below' },
    developing: { en: 'Estimated 1.5–2.5% — approaching benchmark', de: 'Geschätzt 1,5–2,5% — nahe Benchmark', positionOnSpectrum: 'at' },
    strong:     { en: 'Estimated 2.5–4% — within benchmark range', de: 'Geschätzt 2,5–4% — im Benchmarkbereich', positionOnSpectrum: 'above' },
    leading:    { en: 'Estimated >4% — top-quartile profitability', de: 'Geschätzt >4% — Top-Quartil Profitabilität', positionOnSpectrum: 'leading' },
  },
};

/**
 * Infer a KPI's estimated position on the performance spectrum from an assessment score.
 * Returns null if no mapping exists for the KPI or the score is undefined.
 */
export function inferKPIPosition(
  kpiKey: string,
  assessmentScore: number | undefined,
  language: 'en' | 'de' = 'en'
): { statement: string; positionOnSpectrum: 'well_below' | 'below' | 'at' | 'above' | 'leading' } | null {
  if (assessmentScore === undefined || assessmentScore === null) return null;
  const labels = KPI_POSITION_LABELS[kpiKey];
  if (!labels) return null;
  let band: string;
  if (assessmentScore <= 1)      band = 'critical';
  else if (assessmentScore <= 2) band = 'weak';
  else if (assessmentScore <= 3) band = 'developing';
  else if (assessmentScore <= 4) band = 'strong';
  else                           band = 'leading';
  const entry = labels[band];
  if (!entry) return null;
  return { statement: entry[language], positionOnSpectrum: entry.positionOnSpectrum };
}
