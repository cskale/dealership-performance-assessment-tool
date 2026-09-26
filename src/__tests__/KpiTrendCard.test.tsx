import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { KpiTrendCard } from '@/components/results/KpiTrendCard';
import type { DataQuestion } from '@/data/questionnaire';
import type { KpiBenchmark } from '@/lib/kpiBenchmarks';

const question: DataQuestion = {
  id: 'nvs-kpi-1',
  kind: 'data',
  type: 'percentage',
  category: 'sales-process',
  kpiKey: 'nvs_lead_response_1h_pct',
  unit: '%',
  referencePeriod: 'last_calendar_month',
  text: 'What percentage of internet leads received a first response within 1 hour last month?',
};

const benchmark: KpiBenchmark = {
  kpiKey: 'nvs_lead_response_1h_pct',
  unit: '%',
  target: 80,
  warning: 60,
  critical: 40,
  direction: 'higher-better',
};

function renderCard(history: Parameters<typeof KpiTrendCard>[0]['history']) {
  return render(
    <LanguageProvider>
      <KpiTrendCard
        question={question}
        history={history}
        benchmark={benchmark}
        canLog={false}
        saving={false}
        onSave={vi.fn()}
      />
    </LanguageProvider>,
  );
}

describe('KpiTrendCard', () => {
  beforeEach(() => {
    // recharts' ResponsiveContainer needs a non-zero measured size to render children in jsdom.
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 400 });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 200 });
  });


  it('shows the short KPI label as the title, not the full question text', () => {
    renderCard([]);
    expect(screen.getByText('Lead Response (1h)')).toBeInTheDocument();
    expect(screen.queryByText(question.text)).not.toBeInTheDocument();
  });

  it('falls back to the question text when no short label exists', () => {
    renderCard([]);
    const unmapped = { ...question, kpiKey: 'nvs_totally_unmapped_kpi' };
    render(
      <LanguageProvider>
        <KpiTrendCard question={unmapped} history={[]} benchmark={benchmark} canLog={false} saving={false} onSave={vi.fn()} />
      </LanguageProvider>,
    );
    expect(screen.getByText(unmapped.text)).toBeInTheDocument();
  });

  it('labels the value-vs-benchmark bars in the 0/1-point state', () => {
    renderCard([{ month: '2026-08-01', value: 40, source: 'checkin-dealer' } as never]);
    expect(screen.getAllByText('Benchmark').length).toBeGreaterThan(0);
    expect(screen.getByText('Your value')).toBeInTheDocument();
  });
});
