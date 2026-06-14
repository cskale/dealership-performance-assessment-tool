import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

import { LanguageProvider } from '@/contexts/LanguageContext';
import { KpiQuestionInput } from '@/components/assessment/KpiQuestionInput';
import type { DataQuestion } from '@/data/questionnaire';
import type { KpiAnswerState } from '@/lib/kpiAnswerPersistence';

const baseQuestion = {
  id: 'nvs-kpi-test',
  kind: 'data' as const,
  text: 'Test KPI question',
  category: 'performance_data',
  subSection: 'performance_data',
  referencePeriod: 'last_calendar_month' as const,
};

const currencyQuestion: DataQuestion = {
  ...baseQuestion,
  type: 'currency',
  kpiKey: 'nvs_gross_profit_per_unit',
  unit: 'EUR',
  validRange: { min: 0, max: 15000 },
  formula: {
    expression: 'Total gross ÷ units sold',
    example: '€420,000 ÷ 120 = €3,500',
    dataSource: 'DMS sales journal',
  },
};

const percentageQuestion: DataQuestion = {
  ...baseQuestion,
  type: 'percentage',
  kpiKey: 'nvs_lead_response_1h_pct',
  unit: '%',
  validRange: { min: 0, max: 100 },
};

const numericQuestion: DataQuestion = {
  ...baseQuestion,
  type: 'numeric',
  kpiKey: 'uvs_days_to_sale',
  unit: 'days',
  validRange: { min: 0, max: 120 },
};

const ratioQuestion: DataQuestion = {
  ...baseQuestion,
  type: 'ratio',
  kpiKey: 'uvs_used_to_new_ratio',
  unit: 'x:1',
};

const emptyValue: KpiAnswerState = { value: null, skipped: false };

function renderInput(question: DataQuestion, value: KpiAnswerState, onChange = vi.fn()) {
  render(
    <LanguageProvider>
      <KpiQuestionInput question={question} value={value} onChange={onChange} />
    </LanguageProvider>
  );
  return onChange;
}

describe('KpiQuestionInput', () => {
  it('renders a currency input with EUR symbol', () => {
    renderInput(currencyQuestion, emptyValue);
    expect(screen.getByText('€')).toBeTruthy();
  });

  it('renders a percentage input with % symbol', () => {
    renderInput(percentageQuestion, emptyValue);
    expect(screen.getByText('%')).toBeTruthy();
  });

  it('renders a numeric input with its unit', () => {
    renderInput(numericQuestion, emptyValue);
    expect(screen.getByText('days')).toBeTruthy();
  });

  it('renders a ratio input with its unit', () => {
    renderInput(ratioQuestion, emptyValue);
    expect(screen.getByText('x:1')).toBeTruthy();
  });

  it('normalises comma decimal input to a dot before calling onChange', () => {
    const onChange = renderInput(numericQuestion, emptyValue);
    const input = screen.getByPlaceholderText('Enter value');

    fireEvent.change(input, { target: { value: '12,5' } });

    expect(onChange).toHaveBeenCalledWith(12.5, false);
  });

  it('marks the answer as skipped and shows Undo when "I don\'t have this figure" is clicked', () => {
    const onChange = renderInput(numericQuestion, emptyValue);

    fireEvent.click(screen.getByText("I don't have this figure"));

    expect(onChange).toHaveBeenCalledWith(null, true);
  });

  it('shows the Undo affordance and collapses the input once skipped', () => {
    renderInput(numericQuestion, { value: null, skipped: true });

    expect(screen.queryByPlaceholderText('Enter value')).toBeNull();
    expect(screen.getByText('Undo')).toBeTruthy();
  });

  it('restores the input when Undo is clicked after skipping', () => {
    const onChange = renderInput(numericQuestion, { value: null, skipped: true });

    fireEvent.click(screen.getByText('Undo'));

    expect(onChange).toHaveBeenCalledWith(null, false);
  });

  it('shows a soft warning but does not disable the input when value is out of range', () => {
    renderInput(percentageQuestion, { value: 150, skipped: false });

    const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(screen.getByText(/unusually high or low/i)).toBeTruthy();
  });

  it('does not show a warning when value is within range', () => {
    renderInput(percentageQuestion, { value: 50, skipped: false });

    expect(screen.queryByText(/unusually high or low/i)).toBeNull();
  });

  it('shows the "How to calculate this" collapsible with formula details', () => {
    renderInput(currencyQuestion, emptyValue);

    fireEvent.click(screen.getByText('How to calculate this'));

    expect(screen.getByText('Total gross ÷ units sold')).toBeTruthy();
    expect(screen.getByText(/DMS sales journal/)).toBeTruthy();
  });
});
