import { describe, it, expect } from 'vitest';
import {
  calculateReverseSalesFunnel,
  calculateMarketingRoi,
  calculateAbsorptionRate,
} from '@/lib/playgroundCalculators';

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

describe('calculateMarketingRoi', () => {
  const channels = [
    { name: 'Google Ads', monthlySpend: 5000, leadsGenerated: 100 },
    { name: 'Social', monthlySpend: 3000, leadsGenerated: 50 },
  ];

  it('computes per-channel CPL, CPS, ROAS, and totals', () => {
    const result = calculateMarketingRoi({
      avgGrossProfitPerUnit: 2000,
      overallCloseRate: 20,
      channels,
    });
    expect(result.totalSpend).toBe(8000);
    expect(result.totalLeads).toBe(150);
    expect(result.blendedCPL).toBeCloseTo(53.33, 1);
    expect(result.blendedCPS).toBeCloseTo(266.67, 1);
    expect(result.overallROAS).toBeCloseTo(7.5, 1);
    expect(result.breakEvenCPL).toBe(400);
    expect(result.channelResults).toHaveLength(2);
    expect(result.channelResults[0].costPerLead).toBe(50);
    expect(result.channelResults[0].roas).toBeCloseTo(8, 1);
    expect(result.channelResults[0].spendShare).toBeCloseTo(62.5, 1);
  });

  it('returns null for metrics when leads are zero', () => {
    const result = calculateMarketingRoi({
      avgGrossProfitPerUnit: 2000,
      overallCloseRate: 20,
      channels: [{ name: 'Empty', monthlySpend: 1000, leadsGenerated: 0 }],
    });
    expect(result.channelResults[0].costPerLead).toBeNull();
    expect(result.channelResults[0].costPerSale).toBeNull();
    expect(result.channelResults[0].roas).toBeNull();
  });

  it('returns null for CPS and ROAS when close rate is zero', () => {
    const result = calculateMarketingRoi({
      avgGrossProfitPerUnit: 2000,
      overallCloseRate: 0,
      channels: [{ name: 'Test', monthlySpend: 1000, leadsGenerated: 50 }],
    });
    expect(result.channelResults[0].costPerLead).toBe(20);
    expect(result.channelResults[0].costPerSale).toBeNull();
    expect(result.channelResults[0].roas).toBeNull();
    expect(result.breakEvenCPL).toBe(0);
  });
});

describe('calculateAbsorptionRate', () => {
  it('computes baseline absorption and surplus with no adjustments', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 45000,
      partsGrossProfit: 25000,
      totalFixedOverhead: 60000,
      serviceAdjustmentPct: 0,
      partsAdjustmentPct: 0,
      overheadAdjustmentPct: 0,
    });
    expect(result.baselineAbsorptionRate).toBeCloseTo(116.67, 1);
    expect(result.adjustedAbsorptionRate).toBeCloseTo(116.67, 1);
    expect(result.monthlySurplusDeficit).toBe(10000);
    expect(result.serviceGpShare).toBeCloseTo(64.29, 1);
    expect(result.partsGpShare).toBeCloseTo(35.71, 1);
  });

  it('applies percentage adjustments correctly', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 45000,
      partsGrossProfit: 25000,
      totalFixedOverhead: 60000,
      serviceAdjustmentPct: 10,
      partsAdjustmentPct: -10,
      overheadAdjustmentPct: 5,
    });
    expect(result.adjustedServiceGP).toBeCloseTo(49500, 0);
    expect(result.adjustedPartsGP).toBeCloseTo(22500, 0);
    expect(result.adjustedOverhead).toBeCloseTo(63000, 0);
    expect(result.adjustedAbsorptionRate).toBeCloseTo(114.29, 1);
    expect(result.monthlySurplusDeficit).toBe(9000);
  });

  it('returns null when overhead is zero', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 45000,
      partsGrossProfit: 25000,
      totalFixedOverhead: 0,
      serviceAdjustmentPct: 0,
      partsAdjustmentPct: 0,
      overheadAdjustmentPct: 0,
    });
    expect(result.baselineAbsorptionRate).toBeNull();
    expect(result.adjustedAbsorptionRate).toBeNull();
  });

  it('returns null GP shares when both GPs are zero', () => {
    const result = calculateAbsorptionRate({
      serviceGrossProfit: 0,
      partsGrossProfit: 0,
      totalFixedOverhead: 60000,
      serviceAdjustmentPct: 0,
      partsAdjustmentPct: 0,
      overheadAdjustmentPct: 0,
    });
    expect(result.serviceGpShare).toBeNull();
    expect(result.partsGpShare).toBeNull();
    expect(result.adjustedAbsorptionRate).toBeCloseTo(0, 1);
  });
});
