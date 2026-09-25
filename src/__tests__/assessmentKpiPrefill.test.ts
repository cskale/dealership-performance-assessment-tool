import { describe, it, expect } from 'vitest';
import { prefillKpiAnswers } from '@/lib/kpiAnswerPersistence';

describe('prefillKpiAnswers', () => {
  it('fills unanswered keys only, never overwrites', () => {
    const r = prefillKpiAnswers({ a: { value: 5, skipped: false } }, { a: 9, b: 7, c: null });
    expect(r).toEqual({ a: { value: 5, skipped: false }, b: { value: 7, skipped: false, prefilled: true } });
  });

  it('marks prefilled entries with prefilled: true', () => {
    const r = prefillKpiAnswers({}, { a: 9 });
    expect(r.a).toEqual({ value: 9, skipped: false, prefilled: true });
  });
});
