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
