import { describe, it, expect } from 'vitest';
import {
  computeStatsBar,
  computeTrend,
  daysSince,
  isOverdue,
  isDueSoon,
  getScoreBand,
} from '@/lib/coachDashboardUtils';

interface MinDealer { latestScore: number | null; overdueCount: number; }
const d = (score: number | null, overdue = 0): MinDealer => ({ latestScore: score, overdueCount: overdue });

describe('computeStatsBar', () => {
  it('returns zeros for empty list', () => {
    expect(computeStatsBar([])).toEqual({ total: 0, avgScore: 0, overdueCount: 0, attentionNeeded: 0 });
  });
  it('counts attention needed as dealers with latestScore < 46', () => {
    expect(computeStatsBar([d(80), d(40), d(30)]).attentionNeeded).toBe(2);
  });
  it('excludes null scores from avg calculation', () => {
    expect(computeStatsBar([d(80), d(60), d(null)]).avgScore).toBe(70);
  });
  it('sums overdueCount across all dealers', () => {
    expect(computeStatsBar([d(70, 2), d(60, 3)]).overdueCount).toBe(5);
  });
  it('returns 0 avgScore when all scores are null', () => {
    expect(computeStatsBar([d(null)]).avgScore).toBe(0);
  });
  it('returns correct total', () => {
    expect(computeStatsBar([d(80), d(60), d(null)]).total).toBe(3);
  });
});

describe('computeTrend', () => {
  it('returns none when latest is null', () => {
    expect(computeTrend(null, 70)).toEqual({ delta: null, direction: 'none' });
  });
  it('returns none when previous is null', () => {
    expect(computeTrend(75, null)).toEqual({ delta: null, direction: 'none' });
  });
  it('detects improvement', () => {
    expect(computeTrend(75, 70)).toEqual({ delta: 5, direction: 'up' });
  });
  it('detects decline', () => {
    expect(computeTrend(65, 70)).toEqual({ delta: -5, direction: 'down' });
  });
  it('detects flat', () => {
    expect(computeTrend(70, 70)).toEqual({ delta: 0, direction: 'flat' });
  });
});

describe('isOverdue', () => {
  it('returns false for null', () => expect(isOverdue(null)).toBe(false));
  it('returns true for past date', () => expect(isOverdue('2020-01-01')).toBe(true));
  it('returns false for future date', () => {
    const future = new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0];
    expect(isOverdue(future)).toBe(false);
  });
});

describe('isDueSoon', () => {
  it('returns false for null', () => expect(isDueSoon(null)).toBe(false));
  it('returns true for date within 3 days', () => {
    const soon = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    expect(isDueSoon(soon)).toBe(true);
  });
  it('returns false for date beyond 3 days', () => {
    const far = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    expect(isDueSoon(far)).toBe(false);
  });
  it('returns false for past date (already overdue)', () => {
    expect(isDueSoon('2020-01-01')).toBe(false);
  });
});

describe('getScoreBand', () => {
  it('returns Advanced for >= 85', () => {
    expect(getScoreBand(85).label).toBe('Advanced');
    expect(getScoreBand(100).label).toBe('Advanced');
  });
  it('returns Performing for 70-84', () => {
    expect(getScoreBand(70).label).toBe('Performing');
    expect(getScoreBand(84).label).toBe('Performing');
  });
  it('returns Developing for 46-69', () => {
    expect(getScoreBand(46).label).toBe('Developing');
    expect(getScoreBand(69).label).toBe('Developing');
  });
  it('returns Foundational for < 46', () => {
    expect(getScoreBand(45).label).toBe('Foundational');
    expect(getScoreBand(0).label).toBe('Foundational');
  });
});
