import { describe, it, expect } from 'vitest';
import {
  mergeWhyThisMatters,
  shortenSectionName,
  estimateTimeRemaining,
} from '@/lib/assessmentUtils';

describe('mergeWhyThisMatters', () => {
  it('joins all three fields with a space', () => {
    expect(mergeWhyThisMatters('A.', 'B.', 'C.')).toBe('A. B. C.');
  });

  it('skips undefined fields', () => {
    expect(mergeWhyThisMatters('A.', undefined, 'C.')).toBe('A. C.');
  });

  it('skips empty string fields', () => {
    expect(mergeWhyThisMatters('', 'B.', '')).toBe('B.');
  });

  it('returns empty string when all fields are absent', () => {
    expect(mergeWhyThisMatters()).toBe('');
  });
});

describe('shortenSectionName', () => {
  it('strips trailing Performance', () => {
    expect(shortenSectionName('New Vehicle Sales Performance')).toBe('New Vehicle Sales');
  });

  it('strips & Overall Performance', () => {
    expect(
      shortenSectionName('Financial Operations & Overall Performance')
    ).toBe('Financial Operations');
  });

  it('handles Service Performance', () => {
    expect(shortenSectionName('Service Performance')).toBe('Service');
  });

  it('handles Parts and Inventory Performance', () => {
    expect(shortenSectionName('Parts and Inventory Performance')).toBe('Parts and Inventory');
  });

  it('leaves titles without suffix unchanged', () => {
    expect(shortenSectionName('New Vehicle Sales')).toBe('New Vehicle Sales');
  });
});

describe('estimateTimeRemaining', () => {
  it('returns < 1 min when fewer than 2 questions remain', () => {
    expect(estimateTimeRemaining(61, 60)).toBe('< 1 min');
    expect(estimateTimeRemaining(61, 61)).toBe('< 1 min');
  });

  it('rounds up to nearest minute', () => {
    // 3 questions × 30s = 90s → 2 min
    expect(estimateTimeRemaining(61, 58)).toBe('~2 min');
  });

  it('handles all questions remaining', () => {
    // 61 × 30 = 1830s → 31 min
    expect(estimateTimeRemaining(61, 0)).toBe('~31 min');
  });
});
