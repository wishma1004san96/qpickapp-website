/**
 * Vehicle ID catalog for Ride bookings.
 * Kept separate so the fare engine can import IDs without circular deps.
 * Do not change these IDs — they power the existing UI.
 */

export const TAXI_VEHICLE_IDS = [
  "bike",
  "tuk",
  "miniCar",
  "wagon",
  "sedan",
  "miniVan",
  "van",
  "longVan",
  "suv",
  "miniBus",
  "longBus",
] as const;

export type TaxiVehicleId = (typeof TAXI_VEHICLE_IDS)[number];

/** Vehicles that use the Dynamic Pricing Engine (surge + waiting). */
export const DYNAMIC_PRICING_VEHICLE_IDS = [
  "bike",
  "tuk",
  "miniCar",
  "wagon",
] as const;

export type DynamicPricingVehicleId = (typeof DYNAMIC_PRICING_VEHICLE_IDS)[number];

export function isDynamicPricingVehicle(
  id: TaxiVehicleId,
): id is DynamicPricingVehicleId {
  return (DYNAMIC_PRICING_VEHICLE_IDS as readonly string[]).includes(id);
}
