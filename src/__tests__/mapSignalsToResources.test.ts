import { describe, it, expect } from 'vitest';
import { mapSignalsToResources, GapCard, DEPT_DISPLAY_NAMES } from '@/lib/mapSignalsToResources';

describe('mapSignalsToResources', () => {
  it('returns CRITICAL_GAP for score < 50', () => {
    const result = mapSignalsToResources({ 'used-vehicle-sales': 42 });
    expect(result).toHaveLength(1);
    expect(result[0].signalType).toBe('CRITICAL_GAP');
    expect(result[0].deptKey).toBe('used-vehicle-sales');
    expect(result[0].deptName).toBe('Used Vehicle Sales');
    expect(result[0].score).toBe(42);
    expect(result[0].topicFilters).toContain('used-vehicle-sales');
  });

  it('returns HIGH_PRIORITY for score 50–64', () => {
    const result = mapSignalsToResources({ 'new-vehicle-sales': 58 });
    expect(result[0].signalType).toBe('HIGH_PRIORITY');
  });

  it('returns GROWTH_OPPORTUNITY for score 65–74', () => {
    const result = mapSignalsToResources({ 'service-performance': 70 });
    expect(result[0].signalType).toBe('GROWTH_OPPORTUNITY');
  });

  it('excludes healthy departments (score >= 75)', () => {
    const result = mapSignalsToResources({ 'financial-operations': 80 });
    expect(result).toHaveLength(0);
  });

  it('orders CRITICAL_GAP before HIGH_PRIORITY before GROWTH_OPPORTUNITY', () => {
    const result = mapSignalsToResources({
      'new-vehicle-sales': 70,        // GROWTH_OPPORTUNITY
      'used-vehicle-sales': 42,       // CRITICAL_GAP
      'service-performance': 55,      // HIGH_PRIORITY
    });
    expect(result[0].signalType).toBe('CRITICAL_GAP');
    expect(result[1].signalType).toBe('HIGH_PRIORITY');
    expect(result[2].signalType).toBe('GROWTH_OPPORTUNITY');
  });

  it('returns empty array for null or empty scores', () => {
    expect(mapSignalsToResources({})).toHaveLength(0);
    expect(mapSignalsToResources(null as any)).toHaveLength(0);
  });

  it('exposes DEPT_DISPLAY_NAMES for all 5 departments', () => {
    const keys = Object.keys(DEPT_DISPLAY_NAMES);
    expect(keys).toContain('new-vehicle-sales');
    expect(keys).toContain('used-vehicle-sales');
    expect(keys).toContain('service-performance');
    expect(keys).toContain('parts-inventory');
    expect(keys).toContain('financial-operations');
  });
});
