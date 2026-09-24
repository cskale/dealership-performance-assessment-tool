import { describe, it, expect } from 'vitest';
import { niceScaleMax } from '@/components/playground/ScaleGauge';

describe('niceScaleMax', () => {
  it('keeps the default max when the value fits', () => {
    expect(niceScaleMax(98.3, 150)).toBe(150);
    expect(niceScaleMax(null, 120)).toBe(120);
  });

  it('extends the scale so an over-range value is never clipped', () => {
    const max = niceScaleMax(227.8, 150);
    expect(max).toBeGreaterThanOrEqual(227.8);
    expect(max % 50).toBe(0); // 250
  });
});
