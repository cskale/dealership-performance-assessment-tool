import { describe, it, expect } from 'vitest';
import { prefillKpiAnswers, resolveKpiAnswerChange } from '@/lib/kpiAnswerPersistence';

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

describe('resolveKpiAnswerChange', () => {
  it('restores the prefilled hint when a field is cleared (skip → undo) and a prior value exists', () => {
    const r = resolveKpiAnswerChange('a', null, false, { a: 42 });
    expect(r).toEqual({ value: 42, skipped: false, prefilled: true });
  });

  it('leaves the field genuinely empty when no prefill value exists', () => {
    const r = resolveKpiAnswerChange('a', null, false, { a: null });
    expect(r).toEqual({ value: null, skipped: false });
  });

  it('leaves the field genuinely empty when the key was never prefilled at all', () => {
    const r = resolveKpiAnswerChange('a', null, false, {});
    expect(r).toEqual({ value: null, skipped: false });
  });

  it('does not resurrect the prefill hint when the dealer explicitly skips', () => {
    const r = resolveKpiAnswerChange('a', null, true, { a: 42 });
    expect(r).toEqual({ value: null, skipped: true });
  });

  it('passes through a real typed value unchanged', () => {
    const r = resolveKpiAnswerChange('a', 17, false, { a: 42 });
    expect(r).toEqual({ value: 17, skipped: false });
  });
});
