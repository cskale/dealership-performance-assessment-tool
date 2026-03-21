/**
 * KPI Position Estimator
 *
 * Maps question scores (1–5) to estimated real-world KPI ranges and a
 * benchmark position label. Used to give quick, calibrated context
 * alongside assessment results without requiring live data.
 */

export type BenchmarkPosition = 'below_average' | 'average' | 'above_average' | 'top_quartile';

export interface EstimatedRange {
  min: number;
  max: number;
  unit: string;
}

export interface PositionEstimate {
  kpiKey: string;
  questionScore: number;
  estimatedRange: EstimatedRange;
  position: BenchmarkPosition;
  positionLabel: string;
}

interface ScoreBand {
  range: EstimatedRange;
  position: BenchmarkPosition;
}

interface KpiScoreMap {
  kpiKey: string;
  bands: Record<1 | 2 | 3 | 4 | 5, ScoreBand>;
}

const POSITION_LABELS: Record<BenchmarkPosition, string> = {
  below_average: 'Below Average',
  average: 'Average',
  above_average: 'Above Average',
  top_quartile: 'Top Quartile',
};

/**
 * Score-to-range mappings for the 7 primary diagnostic KPIs.
 * Ranges are calibrated against industry reference data (see benchmarkGovernance.ts).
 */
const KPI_SCORE_MAPS: KpiScoreMap[] = [
  {
    kpiKey: 'leadResponseTime',
    bands: {
      1: { range: { min: 24, max: 72, unit: 'hours' }, position: 'below_average' },
      2: { range: { min: 8, max: 24, unit: 'hours' }, position: 'below_average' },
      3: { range: { min: 2, max: 8, unit: 'hours' }, position: 'average' },
      4: { range: { min: 0.5, max: 2, unit: 'hours' }, position: 'above_average' },
      5: { range: { min: 0, max: 0.5, unit: 'hours' }, position: 'top_quartile' },
    },
  },
  {
    kpiKey: 'leadConversion',
    bands: {
      1: { range: { min: 1, max: 5, unit: '%' }, position: 'below_average' },
      2: { range: { min: 6, max: 10, unit: '%' }, position: 'below_average' },
      3: { range: { min: 11, max: 15, unit: '%' }, position: 'average' },
      4: { range: { min: 16, max: 20, unit: '%' }, position: 'above_average' },
      5: { range: { min: 21, max: 30, unit: '%' }, position: 'top_quartile' },
    },
  },
  {
    kpiKey: 'showroomConversion',
    bands: {
      1: { range: { min: 10, max: 20, unit: '%' }, position: 'below_average' },
      2: { range: { min: 20, max: 30, unit: '%' }, position: 'below_average' },
      3: { range: { min: 30, max: 40, unit: '%' }, position: 'average' },
      4: { range: { min: 40, max: 55, unit: '%' }, position: 'above_average' },
      5: { range: { min: 55, max: 70, unit: '%' }, position: 'top_quartile' },
    },
  },
  {
    kpiKey: 'serviceAbsorption',
    bands: {
      1: { range: { min: 40, max: 60, unit: '%' }, position: 'below_average' },
      2: { range: { min: 60, max: 75, unit: '%' }, position: 'below_average' },
      3: { range: { min: 75, max: 90, unit: '%' }, position: 'average' },
      4: { range: { min: 90, max: 110, unit: '%' }, position: 'above_average' },
      5: { range: { min: 110, max: 130, unit: '%' }, position: 'top_quartile' },
    },
  },
  {
    kpiKey: 'labourEfficiency',
    bands: {
      1: { range: { min: 50, max: 70, unit: '%' }, position: 'below_average' },
      2: { range: { min: 70, max: 85, unit: '%' }, position: 'below_average' },
      3: { range: { min: 85, max: 100, unit: '%' }, position: 'average' },
      4: { range: { min: 100, max: 115, unit: '%' }, position: 'above_average' },
      5: { range: { min: 115, max: 130, unit: '%' }, position: 'top_quartile' },
    },
  },
  {
    kpiKey: 'technicianUtilization',
    bands: {
      1: { range: { min: 50, max: 65, unit: '%' }, position: 'below_average' },
      2: { range: { min: 65, max: 75, unit: '%' }, position: 'below_average' },
      3: { range: { min: 75, max: 85, unit: '%' }, position: 'average' },
      4: { range: { min: 85, max: 95, unit: '%' }, position: 'above_average' },
      5: { range: { min: 95, max: 105, unit: '%' }, position: 'top_quartile' },
    },
  },
  {
    kpiKey: 'serviceRetention',
    bands: {
      1: { range: { min: 20, max: 35, unit: '%' }, position: 'below_average' },
      2: { range: { min: 35, max: 50, unit: '%' }, position: 'below_average' },
      3: { range: { min: 50, max: 65, unit: '%' }, position: 'average' },
      4: { range: { min: 65, max: 80, unit: '%' }, position: 'above_average' },
      5: { range: { min: 80, max: 95, unit: '%' }, position: 'top_quartile' },
    },
  },
];

const SCORE_MAP_BY_KPI: Map<string, KpiScoreMap> = new Map(
  KPI_SCORE_MAPS.map((m) => [m.kpiKey, m])
);

/**
 * Estimate a KPI's real-world performance range from an assessment question score.
 * Returns null if no mapping exists for the given KPI key.
 */
export function estimateKpiPosition(
  kpiKey: string,
  questionScore: number
): PositionEstimate | null {
  const scoreMap = SCORE_MAP_BY_KPI.get(kpiKey);
  if (!scoreMap) return null;

  const clampedScore = Math.min(5, Math.max(1, Math.round(questionScore))) as 1 | 2 | 3 | 4 | 5;
  const band = scoreMap.bands[clampedScore];
  if (!band) return null;

  return {
    kpiKey,
    questionScore: clampedScore,
    estimatedRange: band.range,
    position: band.position,
    positionLabel: POSITION_LABELS[band.position],
  };
}

/**
 * Format the estimated range as a human-readable string.
 * e.g. "2–8 hours" or "~30 min"
 */
export function formatEstimatedRange(range: EstimatedRange): string {
  if (range.min === 0) {
    return `<${range.max} ${range.unit}`;
  }
  return `${range.min}–${range.max} ${range.unit}`;
}

/**
 * Returns the set of KPI keys that have position estimator coverage.
 */
export function getSupportedKpiKeys(): string[] {
  return KPI_SCORE_MAPS.map((m) => m.kpiKey);
}
