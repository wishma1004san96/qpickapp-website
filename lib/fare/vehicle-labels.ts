/**
 * Human labels for fare debug logs (client-safe — no fs).
 */

import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export const VEHICLE_PRICING_LABELS: Record<TaxiVehicleId, string> = {
  bike: "Bike",
  tuk: "Tuk",
  miniCar: "Mini Car",
  wagon: "Wagon",
  sedan: "Sedan",
  miniVan: "Mini Van",
  van: "Van",
  longVan: "Long Van",
  suv: "SUV",
  miniBus: "Mini Bus",
  longBus: "Long Bus",
};
