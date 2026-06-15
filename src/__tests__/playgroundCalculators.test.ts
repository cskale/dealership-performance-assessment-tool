import { describe, it, expect } from 'vitest';
import { calculateReverseSalesFunnel } from '@/lib/playgroundCalculators';

describe('calculateReverseSalesFunnel', () => {
  it('computes required funnel volumes and projected gross profit for normal inputs', () => {
    const result = calculateReverseSalesFunnel({
      targetUnitSales: 20,
      avgGrossProfitPerUnit: 3500,
      leadToAppointmentRate: 25,
      appointmentShowRate: 50,
      showToCloseRate: 40,
    });

    expect(result.requiredShows).toBe(50);
    expect(result.requiredAppointments).toBe(100);
    expect(result.requiredLeads).toBe(400);
    expect(result.projectedGrossProfit).toBe(70000);
  });

  it('returns null for all required-volume fields when showToCloseRate is 0', () => {
    const result = calculateReverseSalesFunnel({
      targetUnitSales: 20,
      avgGrossProfitPerUnit: 3500,
      leadToAppointmentRate: 25,
      appointmentShowRate: 50,
      showToCloseRate: 0,
    });

    expect(result.requiredShows).toBeNull();
    expect(result.requiredAppointments).toBeNull();
    expect(result.requiredLeads).toBeNull();
    expect(result.projectedGrossProfit).toBe(70000);
  });

  it('returns null only for requiredLeads when leadToAppointmentRate is 0', () => {
    const result = calculateReverseSalesFunnel({
      targetUnitSales: 20,
      avgGrossProfitPerUnit: 3500,
      leadToAppointmentRate: 0,
      appointmentShowRate: 50,
      showToCloseRate: 40,
    });

    expect(result.requiredShows).toBe(50);
    expect(result.requiredAppointments).toBe(100);
    expect(result.requiredLeads).toBeNull();
    expect(result.projectedGrossProfit).toBe(70000);
  });
});
