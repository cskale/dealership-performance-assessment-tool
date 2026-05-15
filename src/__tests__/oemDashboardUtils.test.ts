import { describe, it, expect } from 'vitest';
import {
  parseDeptScores,
  getDeptCellClass,
  getDeptBgClass,
  getDeptTextClass,
  networkAvgByDept,
  getWeakestDept,
  AT_RISK_THRESHOLD,
  DEPT_KEYS,
} from '@/lib/oemDashboardUtils';

describe('parseDeptScores', () => {
  it('returns nulls for null input', () => {
    const result = parseDeptScores(null);
    expect(result['new-vehicle-sales']).toBeNull();
    expect(result['service-performance']).toBeNull();
  });

  it('parses all five dept keys correctly', () => {
    const input = {
      'new-vehicle-sales': 72,
      'used-vehicle-sales': 55,
      'service-performance': 40,
      'parts-inventory': 88,
      'financial-operations': 65,
    };
    const result = parseDeptScores(input);
    expect(result['new-vehicle-sales']).toBe(72);
    expect(result['used-vehicle-sales']).toBe(55);
    expect(result['service-performance']).toBe(40);
    expect(result['parts-inventory']).toBe(88);
    expect(result['financial-operations']).toBe(65);
  });

  it('ignores non-number values', () => {
    const result = parseDeptScores({ 'new-vehicle-sales': 'high', 'used-vehicle-sales': 55 });
    expect(result['new-vehicle-sales']).toBeNull();
    expect(result['used-vehicle-sales']).toBe(55);
  });

  it('ignores unrecognised keys', () => {
    const result = parseDeptScores({ unknown: 99, 'new-vehicle-sales': 70 });
    expect(result['new-vehicle-sales']).toBe(70);
  });
});

describe('getDeptCellClass', () => {
  it('returns muted class for null', () => {
    expect(getDeptCellClass(null)).toBe('text-muted-foreground');
  });
  it('returns green class for score >= 85', () => {
    expect(getDeptCellClass(85)).toContain('#16a34a');
    expect(getDeptCellClass(100)).toContain('#16a34a');
  });
  it('returns blue class for score 70–84', () => {
    expect(getDeptCellClass(70)).toContain('#2563eb');
    expect(getDeptCellClass(84)).toContain('#2563eb');
  });
  it('returns amber class for score 46–69', () => {
    expect(getDeptCellClass(46)).toContain('#d97706');
    expect(getDeptCellClass(69)).toContain('#d97706');
  });
  it('returns red class for score < 46', () => {
    expect(getDeptCellClass(45)).toContain('#dc2626');
    expect(getDeptCellClass(0)).toContain('#dc2626');
  });
});

describe('getDeptBgClass', () => {
  it('returns solid green bg for >= 85', () => {
    expect(getDeptBgClass(90)).toBe('bg-[#16a34a]');
  });
  it('returns solid red bg for < 46', () => {
    expect(getDeptBgClass(30)).toBe('bg-[#dc2626]');
  });
});

describe('getDeptTextClass', () => {
  it('returns green text for >= 85', () => {
    expect(getDeptTextClass(85)).toBe('text-[#16a34a]');
  });
  it('returns red text for < 46', () => {
    expect(getDeptTextClass(0)).toBe('text-[#dc2626]');
  });
});

describe('networkAvgByDept', () => {
  it('averages scores correctly across dealers', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 80, 'used-vehicle-sales': 60, 'service-performance': 40, 'parts-inventory': 70, 'financial-operations': 50 } },
      { deptScores: { 'new-vehicle-sales': 60, 'used-vehicle-sales': 80, 'service-performance': 60, 'parts-inventory': 50, 'financial-operations': 70 } },
    ];
    const avg = networkAvgByDept(dealers);
    expect(avg['new-vehicle-sales']).toBe(70);
    expect(avg['used-vehicle-sales']).toBe(70);
    expect(avg['service-performance']).toBe(50);
  });

  it('returns null when all values for a dept are null', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': null, 'used-vehicle-sales': null, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
    ];
    expect(networkAvgByDept(dealers)['new-vehicle-sales']).toBeNull();
  });

  it('ignores null values when computing average', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 80, 'used-vehicle-sales': null, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
      { deptScores: { 'new-vehicle-sales': null, 'used-vehicle-sales': null, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
    ];
    expect(networkAvgByDept(dealers)['new-vehicle-sales']).toBe(80);
  });
});

describe('getWeakestDept', () => {
  it('returns the dept with lowest score', () => {
    const scores = {
      'new-vehicle-sales': 80,
      'used-vehicle-sales': 60,
      'service-performance': 30,
      'parts-inventory': 70,
      'financial-operations': 55,
    };
    const result = getWeakestDept(scores);
    expect(result).toEqual({ key: 'service-performance', score: 30 });
  });

  it('returns null when all scores are null', () => {
    const scores = {
      'new-vehicle-sales': null,
      'used-vehicle-sales': null,
      'service-performance': null,
      'parts-inventory': null,
      'financial-operations': null,
    };
    expect(getWeakestDept(scores)).toBeNull();
  });

  it('ignores null scores when finding weakest', () => {
    const scores = {
      'new-vehicle-sales': 70,
      'used-vehicle-sales': null,
      'service-performance': null,
      'parts-inventory': 55,
      'financial-operations': null,
    };
    const result = getWeakestDept(scores);
    expect(result).toEqual({ key: 'parts-inventory', score: 55 });
  });
});

describe('AT_RISK_THRESHOLD', () => {
  it('is 46', () => {
    expect(AT_RISK_THRESHOLD).toBe(46);
  });
});

describe('DEPT_KEYS', () => {
  it('has exactly 5 dept keys', () => {
    expect(DEPT_KEYS).toHaveLength(5);
    expect(DEPT_KEYS).toContain('new-vehicle-sales');
    expect(DEPT_KEYS).toContain('financial-operations');
  });
});
