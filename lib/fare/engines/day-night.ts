/**
 * Day & Night Pricing Engine — every Q Pick Ride vehicle.
 *
 * Final =
 *   Base + (Distance×PerKM) + (Waiting×Rate) + Booking + Airport + Toll + Parking
 * If surge enabled: Final × SurgeMultiplier
 * Then enforce Minimum Fare.
 *
 * Long-distance discount reduces Per KM only (progressive bands).
 */

import { calculateBandedDistanceCharge } from "@/lib/fare/long-distance";
import { clampNonNeg, roundLkr } from "@/lib/fare/math";
import {
  resolvePeriodRates,
  resolveTimeOfDay,
} from "@/lib/fare/time-of-day";
import type {
  FareBreakdown,
  FareContext,
  VehiclePricingSettings,
} from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export function calculateDayNightFare(
  vehicleId: TaxiVehicleId,
  settings: VehiclePricingSettings,
  ctx: FareContext,
): FareBreakdown {
  const timeOfDay = resolveTimeOfDay(ctx.at);
  const { baseFare, perKmRate } = resolvePeriodRates(timeOfDay, settings);
  const distanceKm = clampNonNeg(ctx.distanceKm);

  const banded = calculateBandedDistanceCharge(
    distanceKm,
    perKmRate,
    settings.longDistanceDiscountEnabled,
  );

  const waitingMinutes = clampNonNeg(ctx.waitingMinutes);
  // Formula: Waiting Minutes × Waiting Charge (no free window)
  const waitingCharge = waitingMinutes * clampNonNeg(settings.waitingPerMinute);

  const bookingFee = clampNonNeg(settings.bookingFee);
  const airportPickupFee =
    ctx.airportPickup === true
      ? clampNonNeg(settings.airportPickupFee)
      : 0;
  const tollCharges = clampNonNeg(ctx.tollCharges);
  const parkingCharges = clampNonNeg(ctx.parkingCharges);

  const subtotalBeforeSurge =
    clampNonNeg(baseFare) +
    banded.distanceCharge +
    waitingCharge +
    bookingFee +
    airportPickupFee +
    tollCharges +
    parkingCharges;

  const surgeEnabled = settings.surgeEnabled === true;
  let surgeMultiplier = 1;
  if (surgeEnabled) {
    const override = ctx.surgeMultiplierOverride;
    if (override != null && Number.isFinite(override) && override >= 1) {
      surgeMultiplier = override;
    } else {
      surgeMultiplier = Math.max(1, clampNonNeg(settings.surgeMultiplier, 1));
    }
  }

  const subtotalAfterSurge = subtotalBeforeSurge * surgeMultiplier;
  const surgeAmount = subtotalAfterSurge - subtotalBeforeSurge;

  const minimumFare = clampNonNeg(settings.minimumFare);
  const minimumFareTopUp = Math.max(0, minimumFare - subtotalAfterSurge);
  const rawTotal = roundLkr(subtotalAfterSurge + minimumFareTopUp);

  return {
    vehicleId,
    pricingMode: "dayNight",
    timeOfDay,
    distanceKm,
    baseFare: roundLkr(baseFare),
    perKmRate: roundLkr(perKmRate * 100) / 100,
    distanceCharge: roundLkr(banded.distanceCharge),
    longDistanceDiscount: roundLkr(banded.longDistanceDiscount),
    waitingMinutes,
    billableWaitingMinutes: waitingMinutes,
    waitingCharge: roundLkr(waitingCharge),
    bookingFee: roundLkr(bookingFee),
    airportPickupFee: roundLkr(airportPickupFee),
    surgeEnabled,
    surgeMultiplier,
    surgeAmount: roundLkr(surgeAmount),
    tollCharges: roundLkr(tollCharges),
    parkingCharges: roundLkr(parkingCharges),
    subtotalBeforeSurge: roundLkr(subtotalBeforeSurge),
    subtotalAfterSurge: roundLkr(subtotalAfterSurge),
    minimumFareTopUp: roundLkr(minimumFareTopUp),
    minimumFare: roundLkr(minimumFare),
    totalBeforeCalibration: rawTotal,
    marketAdjustment: 1,
    totalLkr: rawTotal,
    activeConditions: ["normal"],
  };
}
