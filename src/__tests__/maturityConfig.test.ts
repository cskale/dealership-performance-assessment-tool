import { describe, it, expect } from 'vitest';
import { getMaturityLevel, MATURITY_LEVELS, type MaturityLevel } from '@/lib/maturityConfig';

describe('getMaturityLevel', () => {
  it.each([
    [0, 'foundational'],
    [45, 'foundational'],
    [46, 'developing'],
    [69, 'developing'],
    [70, 'performing'],
    [84, 'performing'],
    [85, 'advanced'],
    [100, 'advanced'],
  ] as [number, MaturityLevel][])('score %i -> %s', (score, expected) => {
    expect(getMaturityLevel(score)).toBe(expected);
  });
});

describe('MATURITY_LEVELS', () => {
  it('has exactly the four DESIGN.md levels with correct ranges', () => {
    expect(Object.keys(MATURITY_LEVELS).sort()).toEqual(
      ['advanced', 'developing', 'foundational', 'performing'].sort()
    );
    expect(MATURITY_LEVELS.foundational.scoreRange).toEqual([0, 45]);
    expect(MATURITY_LEVELS.developing.scoreRange).toEqual([46, 69]);
    expect(MATURITY_LEVELS.performing.scoreRange).toEqual([70, 84]);
    expect(MATURITY_LEVELS.advanced.scoreRange).toEqual([85, 100]);
  });

  it('does not include a "leading" level', () => {
    expect((MATURITY_LEVELS as Record<string, unknown>).leading).toBeUndefined();
  });
});
