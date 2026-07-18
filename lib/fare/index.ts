/**
 * Q Pick Fare Engine — public entry.
 */

export {
  calculateFare,
  getPricingMode,
  fareEngine,
} from "@/lib/fare/fare-engine";

export {
  getFarePricingCatalog,
  getVehiclePricing,
  updateFarePricingCatalog,
  resetFarePricingCatalog,
  DEFAULT_FARE_PRICING_CATALOG,
} from "@/lib/fare/pricing-settings";

export { VEHICLE_PRICING_LABELS } from "@/lib/fare/vehicle-labels";

export {
  getFareCalibration,
  updateFareCalibration,
  resetFareCalibration,
  applyMarketCalibration,
  DEFAULT_FARE_CALIBRATION,
} from "@/lib/fare/calibration";

export type { FareCalibrationSettings } from "@/lib/fare/calibration";

export type {
  PricingMode,
  TimeOfDay,
  SurgeCondition,
  VehiclePricingSettings,
  FarePricingCatalog,
  FareContext,
  FareEngineInput,
  FareBreakdown,
} from "@/lib/fare/types";

export {
  DYNAMIC_PRICING_VEHICLE_IDS,
  isDynamicPricingVehicle,
} from "@/lib/taxi-fare-vehicles";

export { metersToKm } from "@/lib/fare/math";
export { resolveTimeOfDay } from "@/lib/fare/time-of-day";
export { LONG_DISTANCE_BANDS } from "@/lib/fare/long-distance";
