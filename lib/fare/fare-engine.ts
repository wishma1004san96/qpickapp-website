/**
 * Q Pick Fare Engine — routes to Dynamic or Standard pricing by vehicle.
 *
 * Core formula (normal conditions):
 *   baseFare + (distanceKm × perKmRate) + waitingCharge + toll + parking
 *
 * Dynamic (Bike / Tuk / Mini Car / Wagon):
 *   (Base + Distance×PerKM + Waiting) × Surge + Toll + Parking
 *
 * Standard (Sedan and above):
 *   Base + Distance×PerKM + Toll + Parking
 *
 * Then:
 *   finalFare = calculatedFare × marketAdjustment
 *
 * Waiting is rider-entered idle time only — never driving duration.
 */

import { applyMarketCalibration, getFareCalibration } from "@/lib/fare/calibration";
import { calculateDynamicFare } from "@/lib/fare/engines/dynamic";
import { calculateStandardFare } from "@/lib/fare/engines/standard";
import {
  getFarePricingCatalog,
  getVehiclePricing,
  resetFarePricingCatalog,
  updateFarePricingCatalog,
} from "@/lib/fare/pricing-settings";
import type { FareBreakdown, FareEngineInput } from "@/lib/fare/types";
import {
  isDynamicPricingVehicle,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-vehicles";

export function getPricingMode(
  vehicleId: TaxiVehicleId,
): "dynamic" | "standard" {
  return isDynamicPricingVehicle(vehicleId) ? "dynamic" : "standard";
}

/**
 * Calculate a ride fare for the selected vehicle.
 * Automatically selects the correct pricing engine, then applies market calibration.
 */
export function calculateFare(input: FareEngineInput): FareBreakdown {
  const settings = getVehiclePricing(input.vehicleId);
  const ctx = {
    distanceKm: input.distanceKm,
    // Idle waiting only — never pass route durationSeconds here
    waitingMinutes: input.waitingMinutes,
    tollCharges: input.tollCharges,
    parkingCharges: input.parkingCharges,
    conditions: input.conditions,
    surgeMultiplierOverride: input.surgeMultiplierOverride,
  };

  let raw: FareBreakdown;

  if (settings.mode === "dynamic" && isDynamicPricingVehicle(input.vehicleId)) {
    raw = calculateDynamicFare(input.vehicleId, settings, ctx);
  } else if (settings.mode === "standard") {
    raw = calculateStandardFare(input.vehicleId, settings, ctx);
  } else {
    // Safety: treat mismatched settings as standard
    raw = calculateStandardFare(
      input.vehicleId,
      {
        mode: "standard",
        baseFare: settings.baseFare,
        perKmRate: settings.perKmRate,
      },
      ctx,
    );
  }

  const { marketAdjustment } = getFareCalibration();
  const calibrated = applyMarketCalibration(raw.totalLkr, marketAdjustment);

  return {
    ...raw,
    totalBeforeCalibration: calibrated.totalBeforeCalibration,
    marketAdjustment: calibrated.marketAdjustment,
    totalLkr: calibrated.totalLkr,
  };
}

/** Convenience namespace for services / API routes. */
export const fareEngine = {
  calculate: calculateFare,
  getPricingMode,
  getVehiclePricing,
  getCatalog: getFarePricingCatalog,
  updateCatalog: updateFarePricingCatalog,
  resetCatalog: resetFarePricingCatalog,
  getCalibration: getFareCalibration,
};
