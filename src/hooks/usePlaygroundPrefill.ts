import { useQueries } from '@tanstack/react-query';
import { fetchLatestKpiValue } from './useKpiValues';
import { PLAYGROUND_KPI_MAPPINGS } from '@/data/playgroundKpiMappings';

export interface PlaygroundPrefillValue {
  value: number;
  kpiKey: string;
  /** created_at of the assessment this value came from (ISO string) */
  assessmentDate: string;
}

export interface PlaygroundPrefillResult {
  isLoading: boolean;
  values: Record<string, PlaygroundPrefillValue>;
}

/**
 * For each input field mapped to a kpiKey in PLAYGROUND_KPI_MAPPINGS, fetches
 * the dealership's most recent recorded value. Fields with no mapping, or no
 * recorded (non-skipped) value, are simply absent from `values` — callers
 * leave those inputs for manual entry.
 *
 * Uses useQueries (not a per-field useLatestKpiValue) so the number of
 * queries can vary by calculator without violating the rules of hooks.
 */
export function usePlaygroundPrefill(
  calculatorId: string,
  dealershipId: string | null | undefined
): PlaygroundPrefillResult {
  const mapping = PLAYGROUND_KPI_MAPPINGS[calculatorId] ?? {};
  const entries = Object.entries(mapping);

  const results = useQueries({
    queries: entries.map(([, kpiKey]) => ({
      queryKey: ['latest-kpi-value', dealershipId, kpiKey],
      enabled: !!dealershipId,
      staleTime: 5 * 60 * 1000,
      queryFn: () => fetchLatestKpiValue(dealershipId!, kpiKey),
    })),
  });

  const values: Record<string, PlaygroundPrefillValue> = {};
  let isLoading = false;

  entries.forEach(([fieldId, kpiKey], index) => {
    const result = results[index];
    if (result.isLoading) isLoading = true;

    const latest = result.data;
    if (latest && latest.row.value !== null) {
      values[fieldId] = {
        value: latest.row.value,
        kpiKey,
        assessmentDate: latest.assessmentCreatedAt,
      };
    }
  });

  return { isLoading, values };
}

/**
 * Formats an assessment's created_at date as "{Month} {Year}" for the
 * Playground prefill chip, e.g. "May 2026" / "Mai 2026".
 */
export function formatPlaygroundPeriod(isoDate: string, language: 'en' | 'de'): string {
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}
