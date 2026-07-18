/**
 * Vehicle pricing accessors.
 * Single source of truth: data/fare-pricing.json
 */

import {
  applyVehiclePatch,
  clearFarePricingMemoryOverlay,
  loadFarePricingFile,
  saveFarePricingFile,
  type AdminPricingPatch,
  type FarePricingFile,
} from "@/lib/fare/pricing-store";
import type {
  FarePricingCatalog,
  VehiclePricingSettings,
} from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";
import { TAXI_VEHICLE_IDS } from "@/lib/taxi-fare-vehicles";

export type { AdminPricingPatch };

function vehicle(
  dayBaseFare: number,
  dayPerKmRate: number,
  nightBaseFare: number,
  nightPerKmRate: number,
  waitingPerMinute: number,
  minimumFare: number,
): VehiclePricingSettings {
  return {
    dayBaseFare,
    dayPerKmRate,
    nightBaseFare,
    nightPerKmRate,
    waitingPerMinute,
    minimumFare,
    bookingFee: 0,
    airportPickupFee: 0,
    surgeEnabled: false,
    surgeMultiplier: 1,
    longDistanceDiscountEnabled: true,
  };
}

/**
 * Seed catalog — keep in sync with data/fare-pricing.json.
 */
export const DEFAULT_FARE_PRICING_CATALOG: FarePricingCatalog = {
  bike: vehicle(100, 60, 140, 80, 2, 150),
  tuk: vehicle(200, 95, 260, 120, 2, 300),
  miniCar: vehicle(250, 110, 320, 140, 3, 400), // Flex
  wagon: vehicle(300, 120, 390, 155, 3, 450),
  sedan: vehicle(500, 155, 650, 195, 3, 600),
  suv: vehicle(1000, 250, 1300, 310, 4, 1200),
  miniVan: vehicle(330, 130, 420, 165, 4, 500),
  van: vehicle(900, 200, 1150, 240, 5, 1200), // FR Van
  longVan: vehicle(1350, 235, 1700, 280, 5, 1700), // HR Van
  miniBus: vehicle(3500, 400, 4500, 450, 6, 3500),
  longBus: vehicle(6000, 600, 7500, 700, 8, 6000), // Bus
};

/** Day/night rates already encode market positioning — calibration default is 1. */
export const DEFAULT_FARE_CALIBRATION = {
  marketAdjustment: 1,
} as const;

function seedFile(): FarePricingFile {
  return {
    calibration: { marketAdjustment: DEFAULT_FARE_CALIBRATION.marketAdjustment },
    vehicles: structuredClone(DEFAULT_FARE_PRICING_CATALOG),
  };
}

function activeFile(): FarePricingFile {
  return loadFarePricingFile(seedFile());
}

export function getFarePricingCatalog(): FarePricingCatalog {
  return activeFile().vehicles;
}

export function getVehiclePricing(id: TaxiVehicleId): VehiclePricingSettings {
  return structuredClone(activeFile().vehicles[id]);
}

export function getActiveCalibration(): { marketAdjustment: number } {
  return { ...activeFile().calibration };
}

export function resetFarePricingCatalog(): FarePricingCatalog {
  clearFarePricingMemoryOverlay();
  return saveFarePricingFile(seedFile()).vehicles;
}

export function updateFarePricingCatalog(
  patch: Partial<Record<TaxiVehicleId, AdminPricingPatch>>,
): FarePricingCatalog {
  const current = activeFile();
  const vehicles = structuredClone(current.vehicles);

  for (const id of Object.keys(patch) as TaxiVehicleId[]) {
    if (!(TAXI_VEHICLE_IDS as readonly string[]).includes(id)) continue;
    const next = patch[id];
    if (!next) continue;
    vehicles[id] = applyVehiclePatch(vehicles[id], next);
  }

  return saveFarePricingFile({
    calibration: current.calibration,
    vehicles,
  }).vehicles;
}

export function updateActiveCalibration(marketAdjustment: number): {
  marketAdjustment: number;
} {
  const current = activeFile();
  return saveFarePricingFile({
    calibration: { marketAdjustment },
    vehicles: current.vehicles,
  }).calibration;
}

export function resetActiveCalibration(): { marketAdjustment: number } {
  const current = activeFile();
  return saveFarePricingFile({
    calibration: {
      marketAdjustment: DEFAULT_FARE_CALIBRATION.marketAdjustment,
    },
    vehicles: current.vehicles,
  }).calibration;
}
