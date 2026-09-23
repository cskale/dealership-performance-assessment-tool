import { describe, it, expect, vi, afterEach } from 'vitest';
import { relativeDays } from '@/lib/dashboardUtils';

describe('relativeDays', () => {
  afterEach(() => vi.useRealTimers());

  it('treats a date-only string for today as "today", even late in the day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 23, 23, 30)); // 23 Sep 2026, 23:30 local
    expect(relativeDays('2026-09-23')).toBe('today');
    expect(relativeDays('2026-09-22')).toBe('1 day ago');
    expect(relativeDays('2026-09-26')).toBe('3 days away');
  });
});
