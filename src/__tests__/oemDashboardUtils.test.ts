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
  computeNetworkMomentum,
  computeCoverage,
  computeDeptWeaknessCounts,
  extractTopSignals,
  STALE_THRESHOLD_DAYS,
  WEAKNESS_THRESHOLD,
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

describe('computeNetworkMomentum', () => {
  it('returns flat + sampleSize 0 when no dealers have two scores', () => {
    const r = computeNetworkMomentum([
      { latestScore: 70, previousScore: null },
      { latestScore: null, previousScore: null },
    ]);
    expect(r.sampleSize).toBe(0);
    expect(r.direction).toBe('flat');
    expect(r.delta).toBe(0);
  });

  it('returns flat + sampleSize 1 when only one dealer has two scores (insufficient)', () => {
    const r = computeNetworkMomentum([{ latestScore: 70, previousScore: 60 }]);
    expect(r.sampleSize).toBe(1);
    expect(r.direction).toBe('flat');
  });

  it('returns up direction and correct delta when avg improved', () => {
    const r = computeNetworkMomentum([
      { latestScore: 70, previousScore: 60 },
      { latestScore: 80, previousScore: 70 },
    ]);
    expect(r.direction).toBe('up');
    expect(r.delta).toBe(10);
    expect(r.fromAvg).toBe(65);
    expect(r.toAvg).toBe(75);
    expect(r.sampleSize).toBe(2);
  });

  it('returns down direction when avg declined', () => {
    const r = computeNetworkMomentum([
      { latestScore: 55, previousScore: 70 },
      { latestScore: 65, previousScore: 75 },
    ]);
    expect(r.direction).toBe('down');
    expect(r.delta).toBeLessThan(0);
  });

  it('excludes dealers missing a previous score from sample', () => {
    const r = computeNetworkMomentum([
      { latestScore: 70, previousScore: 60 },
      { latestScore: 80, previousScore: null },
      { latestScore: 90, previousScore: 80 },
    ]);
    expect(r.sampleSize).toBe(2);
    expect(r.toAvg).toBe(80);
    expect(r.fromAvg).toBe(70);
  });
});

describe('computeCoverage', () => {
  const makeDealer = (id: string, assessmentId: string | null, date: string | null) => ({
    dealershipId: id,
    dealerName: `Dealer ${id}`,
    location: 'Munich',
    programmeTier: null,
    latestAssessmentId: assessmentId,
    latestAssessmentDate: date,
  });

  it('puts dealer with null assessmentId in missing', () => {
    const r = computeCoverage([makeDealer('1', null, null)]);
    expect(r.missing).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
    expect(r.healthy).toHaveLength(0);
  });

  it('puts dealer assessed within 90 days in healthy', () => {
    const recent = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const r = computeCoverage([makeDealer('1', 'uuid-1', recent)]);
    expect(r.healthy).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
  });

  it('puts dealer assessed >90 days ago in stale', () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const r = computeCoverage([makeDealer('1', 'uuid-1', old)]);
    expect(r.stale).toHaveLength(1);
    expect(r.healthy).toHaveLength(0);
  });

  it('handles mixed dealers correctly', () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const old = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const r = computeCoverage([
      makeDealer('1', null, null),
      makeDealer('2', 'uuid-2', recent),
      makeDealer('3', 'uuid-3', old),
    ]);
    expect(r.missing).toHaveLength(1);
    expect(r.healthy).toHaveLength(1);
    expect(r.stale).toHaveLength(1);
  });
});

describe('computeDeptWeaknessCounts', () => {
  it('counts dealers below threshold per dept', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 55, 'used-vehicle-sales': 70, 'service-performance': 80, 'parts-inventory': 40, 'financial-operations': 55 } },
      { deptScores: { 'new-vehicle-sales': 65, 'used-vehicle-sales': 55, 'service-performance': 55, 'parts-inventory': 70, 'financial-operations': 65 } },
    ];
    const r = computeDeptWeaknessCounts(dealers, 60);
    expect(r['new-vehicle-sales']).toBe(1);
    expect(r['used-vehicle-sales']).toBe(1);
    expect(r['service-performance']).toBe(1);
    expect(r['parts-inventory']).toBe(1);
    expect(r['financial-operations']).toBe(1);
  });

  it('returns 0 counts when all depts above threshold', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 80, 'used-vehicle-sales': 75, 'service-performance': 70, 'parts-inventory': 85, 'financial-operations': 72 } },
    ];
    const r = computeDeptWeaknessCounts(dealers, 60);
    for (const key of ['new-vehicle-sales', 'used-vehicle-sales', 'service-performance', 'parts-inventory', 'financial-operations'] as const) {
      expect(r[key]).toBe(0);
    }
  });

  it('ignores null scores (not counted as weak)', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': null, 'used-vehicle-sales': 40, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
    ];
    const r = computeDeptWeaknessCounts(dealers, 60);
    expect(r['new-vehicle-sales']).toBe(0);
    expect(r['used-vehicle-sales']).toBe(1);
  });
});

describe('extractTopSignals', () => {
  it('counts signal occurrences and sorts by frequency', () => {
    const signals = [
      ['NVS_PROCESS_GAP', 'SVC_CAPACITY_LOW'],
      ['NVS_PROCESS_GAP', 'FIN_REPORTING_GAP'],
      ['NVS_PROCESS_GAP'],
    ];
    const r = extractTopSignals(signals);
    expect(r[0]).toEqual({ code: 'NVS_PROCESS_GAP', count: 3 });
    expect(r).toHaveLength(3);
  });

  it('returns at most 5 results', () => {
    const signals = Array.from({ length: 10 }, (_, i) => [`CODE_${i}`]);
    expect(extractTopSignals(signals)).toHaveLength(5);
  });

  it('returns empty array for empty input', () => {
    expect(extractTopSignals([])).toEqual([]);
  });

  it('handles dealers with no signals', () => {
    const signals = [[], ['NVS_PROCESS_GAP'], []];
    const r = extractTopSignals(signals);
    expect(r).toHaveLength(1);
    expect(r[0].count).toBe(1);
  });
});

describe('STALE_THRESHOLD_DAYS', () => {
  it('is 90', () => { expect(STALE_THRESHOLD_DAYS).toBe(90); });
});

describe('WEAKNESS_THRESHOLD', () => {
  it('is 60', () => { expect(WEAKNESS_THRESHOLD).toBe(60); });
});
