export interface ReverseSalesFunnelInputs {
  /** Monthly new vehicle unit sales target */
  targetUnitSales: number;
  /** Average front-end gross profit per unit, EUR */
  avgGrossProfitPerUnit: number;
  /** Lead -> appointment conversion rate, 0-100 */
  leadToAppointmentRate: number;
  /** Appointment -> show conversion rate, 0-100 */
  appointmentShowRate: number;
  /** Show -> close conversion rate, 0-100 */
  showToCloseRate: number;
}

export interface ReverseSalesFunnelOutputs {
  requiredShows: number | null;
  requiredAppointments: number | null;
  requiredLeads: number | null;
  projectedGrossProfit: number;
}

/**
 * Divides `value` by `ratePercent` expressed as 0-100. Returns null when the
 * rate is 0 or negative — dividing by a zero conversion rate has no
 * meaningful "required volume" answer.
 */
function divideByRate(value: number, ratePercent: number): number | null {
  if (ratePercent <= 0) return null;
  return value / (ratePercent / 100);
}

/**
 * Reverse Sales Funnel Calculator: given a unit-sales target and the
 * dealership's current funnel conversion rates, works backward to the
 * required volume at each funnel stage, plus projected gross profit.
 */
export function calculateReverseSalesFunnel(
  inputs: ReverseSalesFunnelInputs
): ReverseSalesFunnelOutputs {
  const {
    targetUnitSales,
    avgGrossProfitPerUnit,
    leadToAppointmentRate,
    appointmentShowRate,
    showToCloseRate,
  } = inputs;

  const requiredShows = divideByRate(targetUnitSales, showToCloseRate);
  const requiredAppointments =
    requiredShows === null ? null : divideByRate(requiredShows, appointmentShowRate);
  const requiredLeads =
    requiredAppointments === null
      ? null
      : divideByRate(requiredAppointments, leadToAppointmentRate);

  return {
    requiredShows,
    requiredAppointments,
    requiredLeads,
    projectedGrossProfit: targetUnitSales * avgGrossProfitPerUnit,
  };
}

// --- Marketing ROI Engine ---

export interface MarketingChannel {
  name: string;
  monthlySpend: number;
  leadsGenerated: number;
}

export interface MarketingRoiInputs {
  avgGrossProfitPerUnit: number;
  overallCloseRate: number;
  channels: MarketingChannel[];
}

export interface MarketingChannelResult {
  name: string;
  costPerLead: number | null;
  costPerSale: number | null;
  roas: number | null;
  spendShare: number;
}

export interface MarketingRoiOutputs {
  channelResults: MarketingChannelResult[];
  totalSpend: number;
  totalLeads: number;
  blendedCPL: number | null;
  blendedCPS: number | null;
  overallROAS: number | null;
  breakEvenCPL: number | null;
}

export function calculateMarketingRoi(inputs: MarketingRoiInputs): MarketingRoiOutputs {
  const { avgGrossProfitPerUnit, overallCloseRate, channels } = inputs;
  const closeRateFrac = overallCloseRate / 100;

  const totalSpend = channels.reduce((s, c) => s + c.monthlySpend, 0);
  const totalLeads = channels.reduce((s, c) => s + c.leadsGenerated, 0);

  const channelResults: MarketingChannelResult[] = channels.map((ch) => {
    const cpl = ch.leadsGenerated > 0 ? ch.monthlySpend / ch.leadsGenerated : null;
    const salesFromChannel = ch.leadsGenerated * closeRateFrac;
    const cps = salesFromChannel > 0 ? ch.monthlySpend / salesFromChannel : null;
    const revenue = salesFromChannel * avgGrossProfitPerUnit;
    const roas = ch.monthlySpend > 0 && salesFromChannel > 0 ? revenue / ch.monthlySpend : null;
    const spendShare = totalSpend > 0 ? (ch.monthlySpend / totalSpend) * 100 : 0;
    return { name: ch.name, costPerLead: cpl, costPerSale: cps, roas, spendShare };
  });

  const blendedCPL = totalLeads > 0 ? totalSpend / totalLeads : null;
  const totalSales = totalLeads * closeRateFrac;
  const blendedCPS = totalSales > 0 ? totalSpend / totalSales : null;
  const totalRevenue = totalSales * avgGrossProfitPerUnit;
  const overallROAS = totalSpend > 0 && totalSales > 0 ? totalRevenue / totalSpend : null;
  const breakEvenCPL = avgGrossProfitPerUnit * closeRateFrac;

  return { channelResults, totalSpend, totalLeads, blendedCPL, blendedCPS, overallROAS, breakEvenCPL };
}

// --- Absorption Rate Modeler ---

export interface AbsorptionRateInputs {
  serviceGrossProfit: number;
  partsGrossProfit: number;
  totalFixedOverhead: number;
  serviceAdjustmentPct: number;
  partsAdjustmentPct: number;
  overheadAdjustmentPct: number;
}

export interface AbsorptionRateOutputs {
  baselineAbsorptionRate: number | null;
  adjustedAbsorptionRate: number | null;
  adjustedServiceGP: number;
  adjustedPartsGP: number;
  adjustedOverhead: number;
  monthlySurplusDeficit: number;
  serviceGpShare: number | null;
  partsGpShare: number | null;
}

export function calculateAbsorptionRate(inputs: AbsorptionRateInputs): AbsorptionRateOutputs {
  const {
    serviceGrossProfit, partsGrossProfit, totalFixedOverhead,
    serviceAdjustmentPct, partsAdjustmentPct, overheadAdjustmentPct,
  } = inputs;

  const adjustedServiceGP = serviceGrossProfit * (1 + serviceAdjustmentPct / 100);
  const adjustedPartsGP = partsGrossProfit * (1 + partsAdjustmentPct / 100);
  const adjustedOverhead = totalFixedOverhead * (1 + overheadAdjustmentPct / 100);

  const baselineGP = serviceGrossProfit + partsGrossProfit;
  const adjustedGP = adjustedServiceGP + adjustedPartsGP;

  const baselineAbsorptionRate = totalFixedOverhead > 0
    ? (baselineGP / totalFixedOverhead) * 100 : null;
  const adjustedAbsorptionRate = adjustedOverhead > 0
    ? (adjustedGP / adjustedOverhead) * 100 : null;

  const monthlySurplusDeficit = adjustedGP - adjustedOverhead;

  const serviceGpShare = adjustedGP > 0 ? (adjustedServiceGP / adjustedGP) * 100 : null;
  const partsGpShare = adjustedGP > 0 ? (adjustedPartsGP / adjustedGP) * 100 : null;

  return {
    baselineAbsorptionRate, adjustedAbsorptionRate,
    adjustedServiceGP, adjustedPartsGP, adjustedOverhead,
    monthlySurplusDeficit, serviceGpShare, partsGpShare,
  };
}

// --- Technician Utilization Calculator ---

export interface TechUtilizationInputs {
  numberOfTechnicians: number;
  availableHoursPerTechPerDay: number;
  workingDaysPerMonth: number;
  actualBilledHoursPerMonth: number;
  effectiveLabourRate: number;
}

export interface TechUtilizationOutputs {
  totalAvailableHours: number;
  utilizationPct: number | null;
  idleHours: number;
  revenueAtCurrentUtil: number;
  revenueAtFullUtil: number;
  revenueLost: number;
}

export function calculateTechUtilization(inputs: TechUtilizationInputs): TechUtilizationOutputs {
  const {
    numberOfTechnicians, availableHoursPerTechPerDay,
    workingDaysPerMonth, actualBilledHoursPerMonth, effectiveLabourRate,
  } = inputs;

  const totalAvailableHours = numberOfTechnicians * availableHoursPerTechPerDay * workingDaysPerMonth;
  const utilizationPct = totalAvailableHours > 0
    ? (actualBilledHoursPerMonth / totalAvailableHours) * 100 : null;
  const idleHours = Math.max(0, totalAvailableHours - actualBilledHoursPerMonth);
  const revenueAtCurrentUtil = actualBilledHoursPerMonth * effectiveLabourRate;
  const revenueAtFullUtil = totalAvailableHours * effectiveLabourRate;
  const revenueLost = Math.max(0, revenueAtFullUtil - revenueAtCurrentUtil);

  return {
    totalAvailableHours, utilizationPct, idleHours,
    revenueAtCurrentUtil, revenueAtFullUtil, revenueLost,
  };
}

// --- Vehicle Stock Turn Calculator ---

export interface VehicleStockTurnInputs {
  averageInventoryCount: number;
  vehiclesSoldPerMonth: number;
  avgVehicleCost: number;
  holdingCostPctPerMonth: number;
}

export interface VehicleStockTurnOutputs {
  annualStockTurn: number | null;
  avgDaysInStock: number | null;
  monthlyHoldingCost: number;
  holdingCostPerUnit: number | null;
  inventoryValueAtCost: number;
}

export function calculateVehicleStockTurn(inputs: VehicleStockTurnInputs): VehicleStockTurnOutputs {
  const { averageInventoryCount, vehiclesSoldPerMonth, avgVehicleCost, holdingCostPctPerMonth } = inputs;

  const annualSales = vehiclesSoldPerMonth * 12;
  const annualStockTurn = averageInventoryCount > 0
    ? annualSales / averageInventoryCount : null;
  const avgDaysInStock = vehiclesSoldPerMonth > 0
    ? (averageInventoryCount / vehiclesSoldPerMonth) * 30 : null;

  const inventoryValueAtCost = averageInventoryCount * avgVehicleCost;
  const monthlyHoldingCost = inventoryValueAtCost * (holdingCostPctPerMonth / 100);
  const holdingCostPerUnit = vehiclesSoldPerMonth > 0
    ? monthlyHoldingCost / vehiclesSoldPerMonth : null;

  return {
    annualStockTurn, avgDaysInStock, monthlyHoldingCost,
    holdingCostPerUnit, inventoryValueAtCost,
  };
}
