// src/__tests__/dashboardUtils.test.ts
import { describe, it, expect } from 'vitest';
import {
  deptScoreColour,
  isOverdue,
  formatDisplayDate,
  formatDueDate,
  quarterLabel,
  nextAssessmentDue,
  endOfCurrentQuarter,
  relativeDays,
  deptFindingText,
  focusDepartment,
  criticalGapCount,
  heroNarrative,
  DEPT_DISPLAY_NAMES,
  DEPT_ORDER,
} from '@/lib/dashboardUtils';

describe('deptScoreColour', () => {
  it('returns green for leading score (≥85)', () => {
    expect(deptScoreColour(85)).toBe('text-[#22c55e]');
    expect(deptScoreColour(100)).toBe('text-[#22c55e]');
  });
  it('returns brand blue for advanced score (65–84)', () => {
    expect(deptScoreColour(65)).toBe('text-[#1D7AFC]');
    expect(deptScoreColour(84)).toBe('text-[#1D7AFC]');
  });
  it('returns brand blue for developing score (45–64)', () => {
    expect(deptScoreColour(45)).toBe('text-[#1D7AFC]');
    expect(deptScoreColour(64)).toBe('text-[#1D7AFC]');
  });
  it('returns red for foundational score (<45)', () => {
    expect(deptScoreColour(44)).toBe('text-[#ef4444]');
    expect(deptScoreColour(0)).toBe('text-[#ef4444]');
  });
});

describe('isOverdue', () => {
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false);
    expect(isOverdue(undefined)).toBe(false);
  });
  it('returns false for future date', () => {
    const future = new Date(Date.now() + 86400000 * 10).toISOString();
    expect(isOverdue(future)).toBe(false);
  });
  it('returns true for past date', () => {
    const past = new Date(Date.now() - 86400000 * 2).toISOString();
    expect(isOverdue(past)).toBe(true);
  });
});

describe('formatDisplayDate', () => {
  it('formats ISO date as "14 Apr 2026"', () => {
    expect(formatDisplayDate('2026-04-14T12:00:00Z')).toBe('14 Apr 2026');
  });
});

describe('formatDueDate', () => {
  it('returns "No date set" for null', () => {
    expect(formatDueDate(null)).toBe('No date set');
  });
  it('formats a date string', () => {
    expect(formatDueDate('2026-06-01T12:00:00Z')).toBe('1 Jun 2026');
  });
});

describe('quarterLabel', () => {
  it('returns Q2 for April', () => {
    expect(quarterLabel('2026-04-14T12:00:00Z')).toBe('Q2 2026');
  });
  it('returns Q1 for January', () => {
    expect(quarterLabel('2026-01-01T12:00:00Z')).toBe('Q1 2026');
  });
  it('returns Q4 for December', () => {
    expect(quarterLabel('2026-12-01T12:00:00Z')).toBe('Q4 2026');
  });
});

describe('nextAssessmentDue', () => {
  it('adds 90 days', () => {
    const result = nextAssessmentDue('2026-04-14T12:00:00Z');
    const expected = new Date('2026-04-14');
    expected.setDate(expected.getDate() + 90);
    expect(new Date(result).toDateString()).toBe(expected.toDateString());
  });
});

describe('deptFindingText', () => {
  it('returns a non-empty string for all depts at all maturity levels', () => {
    const scores = [20, 50, 70, 90];
    for (const key of Object.keys(DEPT_DISPLAY_NAMES)) {
      for (const score of scores) {
        const text = deptFindingText(key, score);
        expect(text.length).toBeGreaterThan(20);
      }
    }
  });
  it('returns fallback for unknown dept key', () => {
    const text = deptFindingText('unknown-dept', 60);
    expect(text).toContain('unknown-dept');
  });
});

describe('focusDepartment', () => {
  it('returns the key with the lowest score', () => {
    const scores = {
      'new-vehicle-sales': 72,
      'used-vehicle-sales': 45,
      'service-performance': 81,
      'parts-inventory': 69,
      'financial-operations': 66,
    };
    expect(focusDepartment(scores)).toBe('used-vehicle-sales');
  });
  it('returns empty string for empty scores', () => {
    expect(focusDepartment({})).toBe('');
  });
});

describe('criticalGapCount', () => {
  it('counts depts below 45', () => {
    expect(criticalGapCount({ a: 44, b: 45, c: 20 })).toBe(2);
  });
  it('returns 0 when all depts above threshold', () => {
    expect(criticalGapCount({ a: 65, b: 80 })).toBe(0);
  });
});

describe('heroNarrative', () => {
  it('returns a non-empty string', () => {
    const scores = {
      'new-vehicle-sales': 72,
      'used-vehicle-sales': 45,
      'service-performance': 81,
      'parts-inventory': 69,
      'financial-operations': 66,
    };
    const text = heroNarrative(scores, 67);
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(20);
  });
  it('mentions "All departments" when score is leading', () => {
    const scores = { 'new-vehicle-sales': 88, 'used-vehicle-sales': 90 };
    expect(heroNarrative(scores, 90)).toContain('All departments');
  });
});

describe('DEPT_ORDER', () => {
  it('contains exactly 5 keys', () => {
    expect(DEPT_ORDER).toHaveLength(5);
  });
  it('all keys exist in DEPT_DISPLAY_NAMES', () => {
    for (const k of DEPT_ORDER) {
      expect(DEPT_DISPLAY_NAMES).toHaveProperty(k);
    }
  });
});
