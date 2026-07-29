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

// --- Sales Velocity Instrument ---

export interface SalesVelocityInputs {
  monthlyLeads: number;
  overallCloseRate: number;
  avgGrossProfitPerUnit: number;
  leadToApptDays: number;
  apptToShowDays: number;
  showToCloseDays: number;
}

export interface StageDuration {
  stage: string;
  days: number;
}

export interface SalesVelocityOutputs {
  totalCycleDays: number;
  projectedSales: number;
  monthlyVelocity: number;
  dailyVelocity: number | null;
  stageDurations: StageDuration[];
  bottleneckStage: StageDuration | null;
}

/**
 * Sales Velocity = (opportunities x win rate x avg deal value) / cycle length.
 * Surfaces which pipeline stage consumes the most time so coaching can target
 * the actual bottleneck instead of the whole funnel.
 */
export function calculateSalesVelocity(inputs: SalesVelocityInputs): SalesVelocityOutputs {
  const {
    monthlyLeads, overallCloseRate, avgGrossProfitPerUnit,
    leadToApptDays, apptToShowDays, showToCloseDays,
  } = inputs;

  const closeRateFrac = overallCloseRate / 100;
  const projectedSales = monthlyLeads * closeRateFrac;
  const monthlyVelocity = projectedSales * avgGrossProfitPerUnit;
  const totalCycleDays = leadToApptDays + apptToShowDays + showToCloseDays;
  const dailyVelocity = totalCycleDays > 0 ? monthlyVelocity / totalCycleDays : null;

  const stageDurations: StageDuration[] = [
    { stage: 'Lead → Appointment', days: leadToApptDays },
    { stage: 'Appointment → Show', days: apptToShowDays },
    { stage: 'Show → Close', days: showToCloseDays },
  ];
  const bottleneckStage = stageDurations.some((s) => s.days > 0)
    ? stageDurations.reduce((a, b) => (b.days > a.days ? b : a))
    : null;

  return { totalCycleDays, projectedSales, monthlyVelocity, dailyVelocity, stageDurations, bottleneckStage };
}

// --- Lead Quality Auditor ---

export interface LeadSourceInput {
  name: string;
  leadsReceived: number;
  unitsClosed: number;
  avgDaysToClose: number;
  avgGrossProfitPerSale: number;
}

export interface LeadSourceResult {
  name: string;
  closeRate: number | null;
  gpPerLead: number | null;
  totalGp: number;
  avgDaysToClose: number;
  qualityScore: number | null;
}

export interface LeadQualityOutputs {
  results: LeadSourceResult[];
  bestSource: LeadSourceResult | null;
  worstSource: LeadSourceResult | null;
  totalLeads: number;
  blendedGpPerLead: number | null;
}

/**
 * Quality score blends close rate (50%), GP-per-lead relative to the best
 * source (30%), and close speed relative to the slowest source (20%) — so a
 * source with a fast, low-margin close doesn't rank above a slower, higher-GP one.
 */
export function calculateLeadQuality(inputs: { sources: LeadSourceInput[] }): LeadQualityOutputs {
  const { sources } = inputs;

  const raw = sources.map((s) => {
    const closeRate = s.leadsReceived > 0 ? (s.unitsClosed / s.leadsReceived) * 100 : null;
    const totalGp = s.unitsClosed * s.avgGrossProfitPerSale;
    const gpPerLead = s.leadsReceived > 0 ? totalGp / s.leadsReceived : null;
    return { name: s.name, closeRate, gpPerLead, totalGp, avgDaysToClose: s.avgDaysToClose };
  });

  const maxGpPerLead = Math.max(0, ...raw.map((r) => r.gpPerLead ?? 0));
  const maxDays = Math.max(1, ...raw.map((r) => r.avgDaysToClose));

  const results: LeadSourceResult[] = raw.map((r) => {
    if (r.closeRate === null || r.gpPerLead === null) {
      return { ...r, qualityScore: null };
    }
    const closeScore = Math.min(100, r.closeRate);
    const gpScore = maxGpPerLead > 0 ? (r.gpPerLead / maxGpPerLead) * 100 : 0;
    const speedScore = (1 - r.avgDaysToClose / maxDays) * 100;
    const qualityScore = closeScore * 0.5 + gpScore * 0.3 + speedScore * 0.2;
    return { ...r, qualityScore };
  });

  const scored = results.filter((r): r is LeadSourceResult & { qualityScore: number } => r.qualityScore !== null);
  const bestSource = scored.length ? scored.reduce((a, b) => (b.qualityScore > a.qualityScore ? b : a)) : null;
  const worstSource = scored.length ? scored.reduce((a, b) => (b.qualityScore < a.qualityScore ? b : a)) : null;

  const totalLeads = sources.reduce((s, x) => s + x.leadsReceived, 0);
  const totalGpAll = results.reduce((s, x) => s + x.totalGp, 0);
  const blendedGpPerLead = totalLeads > 0 ? totalGpAll / totalLeads : null;

  return { results, bestSource, worstSource, totalLeads, blendedGpPerLead };
}

// --- CAC Payback Calculator ---

export interface CacPaybackInputs {
  monthlyMarketingSpend: number;
  monthlySalesStaffCost: number;
  unitsSoldPerMonth: number;
  avgFrontEndGpPerUnit: number;
  avgMonthlyRecurringGpPerCustomer: number;
}

export interface CacPaybackOutputs {
  totalMonthlyCost: number;
  cac: number | null;
  netCacAfterFrontGp: number;
  paybackMonths: number | null;
  cumulativeRecovery: { month: number; cumulativeGp: number }[];
}

/**
 * CAC is recovered instantly at the point of sale if front-end gross profit
 * alone exceeds acquisition cost. Any remainder is recovered from recurring
 * service/parts gross profit over subsequent months.
 */
export function calculateCacPayback(inputs: CacPaybackInputs): CacPaybackOutputs {
  const {
    monthlyMarketingSpend, monthlySalesStaffCost, unitsSoldPerMonth,
    avgFrontEndGpPerUnit, avgMonthlyRecurringGpPerCustomer,
  } = inputs;

  const totalMonthlyCost = monthlyMarketingSpend + monthlySalesStaffCost;
  const cac = unitsSoldPerMonth > 0 ? totalMonthlyCost / unitsSoldPerMonth : null;
  const netCacAfterFrontGp = cac !== null ? Math.max(0, cac - avgFrontEndGpPerUnit) : 0;
  const paybackMonths = netCacAfterFrontGp === 0
    ? 0
    : avgMonthlyRecurringGpPerCustomer > 0
      ? netCacAfterFrontGp / avgMonthlyRecurringGpPerCustomer
      : null;

  const cumulativeRecovery: { month: number; cumulativeGp: number }[] = [];
  let cumulative = avgFrontEndGpPerUnit;
  for (let m = 0; m <= 12; m++) {
    cumulativeRecovery.push({ month: m, cumulativeGp: cumulative });
    cumulative += avgMonthlyRecurringGpPerCustomer;
  }

  return { totalMonthlyCost, cac, netCacAfterFrontGp, paybackMonths, cumulativeRecovery };
}

// --- F&I Penetration Calculator ---

export interface FiProductInput {
  name: string;
  attachRate: number;
  avgGpPerAttach: number;
}

export interface FiProductResult {
  name: string;
  unitsAttached: number;
  totalGp: number;
}

export interface FiPenetrationOutputs {
  productResults: FiProductResult[];
  totalFiGp: number;
  fiGpPerUnit: number | null;
  blendedAttachRate: number | null;
}

export function calculateFiPenetration(inputs: { unitsSoldPerMonth: number; products: FiProductInput[] }): FiPenetrationOutputs {
  const { unitsSoldPerMonth, products } = inputs;

  const productResults: FiProductResult[] = products.map((p) => {
    const unitsAttached = unitsSoldPerMonth * (p.attachRate / 100);
    return { name: p.name, unitsAttached, totalGp: unitsAttached * p.avgGpPerAttach };
  });

  const totalFiGp = productResults.reduce((s, p) => s + p.totalGp, 0);
  const fiGpPerUnit = unitsSoldPerMonth > 0 ? totalFiGp / unitsSoldPerMonth : null;
  const totalAttachedUnits = productResults.reduce((s, p) => s + p.unitsAttached, 0);
  const blendedAttachRate = unitsSoldPerMonth > 0 ? (totalAttachedUnits / unitsSoldPerMonth) * 100 : null;

  return { productResults, totalFiGp, fiGpPerUnit, blendedAttachRate };
}

// --- Appointment Density Optimizer ---

export interface AppointmentDensityInputs {
  numberOfBays: number;
  hoursOpenPerDay: number;
  avgServiceTimeHours: number;
  bufferMinutes: number;
  currentAppointmentsPerDay: number;
  avgRevenuePerAppointment: number;
}

export interface AppointmentDensityOutputs {
  maxCapacityPerDay: number;
  utilizationPct: number | null;
  additionalCapacity: number;
  currentDailyRevenue: number;
  maxDailyRevenue: number;
  revenueOpportunity: number;
}

export function calculateAppointmentDensity(inputs: AppointmentDensityInputs): AppointmentDensityOutputs {
  const {
    numberOfBays, hoursOpenPerDay, avgServiceTimeHours,
    bufferMinutes, currentAppointmentsPerDay, avgRevenuePerAppointment,
  } = inputs;

  const slotHours = avgServiceTimeHours + bufferMinutes / 60;
  const maxCapacityPerDay = slotHours > 0
    ? Math.floor((numberOfBays * hoursOpenPerDay) / slotHours) : 0;
  const utilizationPct = maxCapacityPerDay > 0
    ? (currentAppointmentsPerDay / maxCapacityPerDay) * 100 : null;
  const additionalCapacity = Math.max(0, maxCapacityPerDay - currentAppointmentsPerDay);
  const currentDailyRevenue = currentAppointmentsPerDay * avgRevenuePerAppointment;
  const maxDailyRevenue = maxCapacityPerDay * avgRevenuePerAppointment;
  const revenueOpportunity = Math.max(0, maxDailyRevenue - currentDailyRevenue);

  return {
    maxCapacityPerDay, utilizationPct, additionalCapacity,
    currentDailyRevenue, maxDailyRevenue, revenueOpportunity,
  };
}
