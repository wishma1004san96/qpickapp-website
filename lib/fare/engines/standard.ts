/**
 * Standard Pricing Engine — Sedan / Minivan / FR Van / HR Van / SUV / Mini Bus / Bus.
 *
 * Final (before market calibration) =
 *   baseFare + (distanceKm × perKmRate) + toll + parking
 *
 * No waiting · no surge · no hidden multipliers.
 */

import {
  calculateDistanceCharge,
  clampNonNeg,
  roundLkr,
} from "@/lib/fare/math";
import type {
  FareBreakdown,
  FareContext,
  StandardVehiclePricing,
} from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export function calculateStandardFare(
  vehicleId: TaxiVehicleId,
  settings: StandardVehiclePricing,
  ctx: FareContext,
): FareBreakdown {
  const { distanceKm, baseFare, perKmRate, distanceCharge } =
    calculateDistanceCharge(ctx.distanceKm, settings.baseFare, settings.perKmRate);

  const tollCharges = clampNonNeg(ctx.tollCharges);
  const parkingCharges = clampNonNeg(ctx.parkingCharges);

  const subtotal = distanceCharge;
  const rawTotal = roundLkr(subtotal + tollCharges + parkingCharges);

  return {
    vehicleId,
    pricingMode: "standard",
    distanceKm,
    baseFare,
    perKmRate,
    distanceCharge: roundLkr(distanceCharge),
    waitingMinutes: 0,
    billableWaitingMinutes: 0,
    waitingCharge: 0,
    surgeMultiplier: 1,
    surgeAmount: 0,
    activeConditions: ["normal"],
    tollCharges: roundLkr(tollCharges),
    parkingCharges: roundLkr(parkingCharges),
    subtotalBeforeSurge: roundLkr(subtotal),
    subtotalAfterSurge: roundLkr(subtotal),
    totalBeforeCalibration: rawTotal,
    marketAdjustment: 1,
    totalLkr: rawTotal,
  };
}
