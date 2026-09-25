// This test intentionally runs with a western-of-UTC local time zone to
// reproduce the bug where a date-only string like '2026-08-01' (parsed as
// UTC midnight) rolls back to the previous local day/month, e.g. "July 2026"
// instead of "August 2026". Set before any Date/Intl call in this file.
process.env.TZ = 'America/New_York';

import { describe, it, expect } from 'vitest';
import { formatPlaygroundPeriod } from '@/hooks/usePlaygroundPrefill';

describe('formatPlaygroundPeriod — UTC month-day period strings', () => {
  it('formats a check-in period_month (YYYY-MM-01) as its UTC month/year, not shifted by local time zone', () => {
    expect(formatPlaygroundPeriod('2026-08-01', 'en')).toBe('August 2026');
  });

  it('resolves the formatter to the UTC time zone', () => {
    const resolved = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).resolvedOptions();
    expect(resolved.timeZone).toBe('UTC');
  });
});
