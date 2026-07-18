/**
 * Dynamic Pricing Engine — Bike / Tuk / Mini Car / Wagon.
 *
 * Core (normal, no surge):
 *   baseFare + (distanceKm × perKmRate) + waitingCharge + toll + parking
 *
 * With surge (dynamic vehicles only):
 *   (baseFare + distanceCharge + waitingCharge) × surge
 *   + toll + parking
 *
 * Waiting = rider-entered idle minutes only (never driving duration).
 * Market calibration is applied by the fare engine after this step.
 */

import {
  calculateDistanceCharge,
  calculateWaitingCharge,
  clampNonNeg,
  roundLkr,
} from "@/lib/fare/math";
import { applySurge, resolveSurgeMultiplier } from "@/lib/fare/surge";
import type {
  DynamicVehiclePricing,
  FareBreakdown,
  FareContext,
} from "@/lib/fare/types";
import type { DynamicPricingVehicleId } from "@/lib/taxi-fare-vehicles";

export function calculateDynamicFare(
  vehicleId: DynamicPricingVehicleId,
  settings: DynamicVehiclePricing,
  ctx: FareContext,
): FareBreakdown {
  const { distanceKm, baseFare, perKmRate, distanceCharge } =
    calculateDistanceCharge(ctx.distanceKm, settings.baseFare, settings.perKmRate);

  // Idle waiting only — callers must not pass route duration here
  const waitingMinutes = clampNonNeg(ctx.waitingMinutes);
  const { billableWaitingMinutes, waitingCharge } = calculateWaitingCharge(
    waitingMinutes,
    settings.freeWaitingMinutes,
    settings.waitingPerMinute,
  );

  const tollCharges = clampNonNeg(ctx.tollCharges);
  const parkingCharges = clampNonNeg(ctx.parkingCharges);

  // Core before surge (no hidden multipliers)
  const subtotalBeforeSurge = distanceCharge + waitingCharge;

  const { multiplier, activeConditions } = resolveSurgeMultiplier(
    settings,
    ctx.conditions,
    ctx.surgeMultiplierOverride,
  );

  const { afterSurge, surgeAmount } = applySurge(
    subtotalBeforeSurge,
    multiplier,
  );

  const rawTotal = roundLkr(afterSurge + tollCharges + parkingCharges);

  return {
    vehicleId,
    pricingMode: "dynamic",
    distanceKm,
    baseFare,
    perKmRate,
    distanceCharge: roundLkr(distanceCharge),
    waitingMinutes,
    billableWaitingMinutes,
    waitingCharge: roundLkr(waitingCharge),
    surgeMultiplier: multiplier,
    surgeAmount: roundLkr(surgeAmount),
    activeConditions,
    tollCharges: roundLkr(tollCharges),
    parkingCharges: roundLkr(parkingCharges),
    subtotalBeforeSurge: roundLkr(subtotalBeforeSurge),
    subtotalAfterSurge: roundLkr(afterSurge),
    totalBeforeCalibration: rawTotal,
    marketAdjustment: 1,
    totalLkr: rawTotal,
  };
}
