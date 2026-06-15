import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-1' }, loading: false, signOut: vi.fn(), session: null })),
}));

const { mockFrom, mockUpsert } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockUpsert: vi.fn(() => Promise.resolve({ error: null })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}));

import { useAssessmentData } from '@/hooks/useAssessmentData';
import type { DataQuestion } from '@/data/questionnaire';

const NVS_GROSS_PROFIT: DataQuestion = {
  id: 'nvs-kpi-4',
  kind: 'data',
  text: 'Gross profit per unit',
  category: 'New Vehicle Sales',
  type: 'currency',
  kpiKey: 'nvs_gross_profit_per_unit',
  unit: '€',
  referencePeriod: 'last_calendar_month',
};

const UVS_DAYS_TO_SALE: DataQuestion = {
  id: 'uvs-kpi-2',
  kind: 'data',
  text: 'Average days to sale',
  category: 'Used Vehicle Sales',
  type: 'numeric',
  kpiKey: 'uvs_days_to_sale',
  unit: 'days',
  referencePeriod: 'last_calendar_month',
};

function setupFromMock() {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: { active_organization_id: 'org-1', active_dealership_id: 'dealer-1' },
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === 'dealerships') {
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'dealer-1',
                name: 'Test Dealership',
                brand: 'BMW',
                country: 'DE',
                location: 'Berlin',
                organization_id: 'org-1',
              },
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === 'assessment_kpi_values') {
      return { upsert: mockUpsert };
    }
    throw new Error(`Unexpected table: ${table}`);
  });
}

describe('saveKpiAnswers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
    setupFromMock();
  });

  it('upserts provided and skipped KPI answers with onConflict on assessment_id,kpi_key', async () => {
    const { result } = renderHook(() => useAssessmentData());

    await act(async () => {
      await result.current.saveKpiAnswers(
        'assessment-1',
        [NVS_GROSS_PROFIT, UVS_DAYS_TO_SALE],
        {
          nvs_gross_profit_per_unit: { value: 1200, skipped: false },
          uvs_days_to_sale: { value: null, skipped: true },
        }
      );
    });

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const [rows, options] = (mockUpsert.mock.calls[0] as unknown) as [any, any];
    expect(options).toEqual({ onConflict: 'assessment_id,kpi_key' });
    expect(rows).toEqual([
      {
        assessment_id: 'assessment-1',
        dealership_id: 'dealer-1',
        question_id: 'nvs-kpi-4',
        kpi_key: 'nvs_gross_profit_per_unit',
        value: 1200,
        unit: '€',
        currency_code: 'EUR',
        reference_period: 'last_calendar_month',
        skipped: false,
      },
      {
        assessment_id: 'assessment-1',
        dealership_id: 'dealer-1',
        question_id: 'uvs-kpi-2',
        kpi_key: 'uvs_days_to_sale',
        value: null,
        unit: 'days',
        currency_code: null,
        reference_period: 'last_calendar_month',
        skipped: true,
      },
    ]);
  });

  it('does not call upsert when there are no KPI answers to persist', async () => {
    const { result } = renderHook(() => useAssessmentData());

    await act(async () => {
      await result.current.saveKpiAnswers('assessment-1', [NVS_GROSS_PROFIT, UVS_DAYS_TO_SALE], {});
    });

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
