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

export type {
  PricingMode,
  SurgeCondition,
  SurgeMultipliers,
  DynamicVehiclePricing,
  StandardVehiclePricing,
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
