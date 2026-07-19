/**
 * Human labels for fare debug logs (client-safe — no fs).
 */

import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export const VEHICLE_PRICING_LABELS: Record<TaxiVehicleId, string> = {
  bike: "Q Bike",
  tuk: "Q Tuk",
  miniCar: "Q Flex",
  wagon: "Q Mini",
  sedan: "Q Sedan",
  miniVan: "Q Minivan",
  van: "Q Flat Roof Van",
  longVan: "Q High Roof Van",
  suv: "Q SUV",
  miniBus: "Q Mini Bus",
  longBus: "Q Bus",
};
