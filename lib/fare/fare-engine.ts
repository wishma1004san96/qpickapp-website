/**
 * Q Pick Fare Engine — Day & Night pricing for every Ride vehicle.
 *
 * Final =
 *   Base + Distance×PerKM + Waiting + Booking + Airport + Toll + Parking
 *   × Surge (optional) · then Minimum Fare floor
 *
 * Long-distance discount reduces Per KM only.
 * Waiting is rider idle time only.
 */

import { applyMarketCalibration, getFareCalibration } from "@/lib/fare/calibration";
import { calculateDayNightFare } from "@/lib/fare/engines/day-night";
import {
  getFarePricingCatalog,
  getVehiclePricing,
  resetFarePricingCatalog,
  updateFarePricingCatalog,
} from "@/lib/fare/pricing-settings";
import { VEHICLE_PRICING_LABELS } from "@/lib/fare/vehicle-labels";
import type { FareBreakdown, FareEngineInput } from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

/** @deprecated Unified day/night engine — always "dayNight". */
export function getPricingMode(_vehicleId: TaxiVehicleId): "dayNight" {
  return "dayNight";
}

export function calculateFare(input: FareEngineInput): FareBreakdown {
  const settings = getVehiclePricing(input.vehicleId);
  const raw = calculateDayNightFare(input.vehicleId, settings, {
    distanceKm: input.distanceKm,
    waitingMinutes: input.waitingMinutes,
    tollCharges: input.tollCharges,
    parkingCharges: input.parkingCharges,
    airportPickup: input.airportPickup,
    surgeMultiplierOverride: input.surgeMultiplierOverride,
    at: input.at,
  });

  const { marketAdjustment } = getFareCalibration();
  const calibrated = applyMarketCalibration(raw.totalLkr, marketAdjustment);

  console.info(
    [
      `Vehicle: ${VEHICLE_PRICING_LABELS[input.vehicleId]}`,
      `Period: ${raw.timeOfDay}`,
      `Base Fare: ${raw.baseFare}`,
      `Per KM: ${raw.perKmRate}`,
      `Distance Charge: ${raw.distanceCharge}`,
      `Waiting: ${raw.waitingCharge}`,
      `Discount: ${raw.longDistanceDiscount}`,
      `Calibration: ${calibrated.marketAdjustment}`,
      `Final Fare: ${calibrated.totalLkr}`,
    ].join("\n"),
  );

  return {
    ...raw,
    totalBeforeCalibration: calibrated.totalBeforeCalibration,
    marketAdjustment: calibrated.marketAdjustment,
    totalLkr: calibrated.totalLkr,
  };
}

export const fareEngine = {
  calculate: calculateFare,
  getPricingMode,
  getVehiclePricing,
  getCatalog: getFarePricingCatalog,
  updateCatalog: updateFarePricingCatalog,
  resetCatalog: resetFarePricingCatalog,
  getCalibration: getFareCalibration,
};
