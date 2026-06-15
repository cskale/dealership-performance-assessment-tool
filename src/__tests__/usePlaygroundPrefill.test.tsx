import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const { mockFrom, mockMaybeSingle } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockMaybeSingle: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}));

import { usePlaygroundPrefill, formatPlaygroundPeriod } from '@/hooks/usePlaygroundPrefill';

function setupFromMock() {
  const chain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: mockMaybeSingle,
  };
  mockFrom.mockImplementation(() => chain);
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePlaygroundPrefill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFromMock();
  });

  it('returns the latest value for a mapped field when one exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: 'kpi-1',
        kpi_key: 'nvs_gross_profit_per_unit',
        value: 3200,
        skipped: false,
        assessments: { created_at: '2026-05-10T00:00:00Z' },
      },
      error: null,
    });

    const { result } = renderHook(
      () => usePlaygroundPrefill('reverse-sales-funnel', 'dealer-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.values.avgGrossProfitPerUnit).toEqual({
      value: 3200,
      kpiKey: 'nvs_gross_profit_per_unit',
      assessmentDate: '2026-05-10T00:00:00Z',
    });
  });

  it('returns an empty values map when no KPI value has been recorded', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(
      () => usePlaygroundPrefill('reverse-sales-funnel', 'dealer-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.values).toEqual({});
  });

  it('returns an empty values map for a calculator with no KPI mappings', () => {
    const { result } = renderHook(
      () => usePlaygroundPrefill('unmapped-calculator', 'dealer-1'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.values).toEqual({});
  });
});

describe('formatPlaygroundPeriod', () => {
  it('formats an ISO date as Month Year in English', () => {
    expect(formatPlaygroundPeriod('2026-05-10T00:00:00Z', 'en')).toBe('May 2026');
  });

  it('formats an ISO date as Month Year in German', () => {
    expect(formatPlaygroundPeriod('2026-05-10T00:00:00Z', 'de')).toBe('Mai 2026');
  });
});
