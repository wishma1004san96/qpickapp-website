/**
 * Standard Pricing Engine — Sedan / Minivan / FR Van / HR Van / SUV / Mini Bus / Bus
 * (and Mini Car — kept for existing UI).
 *
 * Final Fare = Base + (Distance × Per KM) + Toll + Parking
 * No waiting · no surge.
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
  const totalLkr = roundLkr(subtotal + tollCharges + parkingCharges);

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
    totalLkr,
  };
}
