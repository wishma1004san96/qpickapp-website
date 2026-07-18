/**
 * Q Pick Fare Engine — routes to Dynamic or Standard pricing by vehicle.
 *
 * Dynamic (Bike / Tuk / Mini Car / Wagon):
 *   (Base + Distance×PerKM + Waiting) × Surge + Toll + Parking
 *
 * Standard (all other ride vehicles):
 *   Base + Distance×PerKM + Toll + Parking
 */

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
 * Automatically selects the correct pricing engine.
 */
export function calculateFare(input: FareEngineInput): FareBreakdown {
  const settings = getVehiclePricing(input.vehicleId);
  const ctx = {
    distanceKm: input.distanceKm,
    waitingMinutes: input.waitingMinutes,
    tollCharges: input.tollCharges,
    parkingCharges: input.parkingCharges,
    conditions: input.conditions,
    surgeMultiplierOverride: input.surgeMultiplierOverride,
  };

  if (settings.mode === "dynamic" && isDynamicPricingVehicle(input.vehicleId)) {
    return calculateDynamicFare(input.vehicleId, settings, ctx);
  }

  if (settings.mode === "standard") {
    return calculateStandardFare(input.vehicleId, settings, ctx);
  }

  // Safety: treat mismatched settings as standard
  return calculateStandardFare(
    input.vehicleId,
    {
      mode: "standard",
      baseFare: settings.baseFare,
      perKmRate: settings.perKmRate,
    },
    ctx,
  );
}

/** Convenience namespace for services / API routes. */
export const fareEngine = {
  calculate: calculateFare,
  getPricingMode,
  getVehiclePricing,
  getCatalog: getFarePricingCatalog,
  updateCatalog: updateFarePricingCatalog,
  resetCatalog: resetFarePricingCatalog,
};
