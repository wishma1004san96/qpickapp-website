/**
 * Vehicle pricing accessors.
 *
 * Single source of truth: data/fare-pricing.json (via pricing-store).
 * Seed catalog below is used only when the JSON file is missing / reset.
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
  DynamicVehiclePricing,
  FarePricingCatalog,
  StandardVehiclePricing,
  SurgeMultipliers,
  VehiclePricingSettings,
} from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";
import { TAXI_VEHICLE_IDS } from "@/lib/taxi-fare-vehicles";

export type { AdminPricingPatch };

const DEFAULT_SURGE: SurgeMultipliers = {
  peak: 1.25,
  rain: 1.15,
  highDemand: 1.4,
};

function dynamic(
  baseFare: number,
  perKmRate: number,
  waitingPerMinute: number,
  surge: Partial<SurgeMultipliers> = {},
): DynamicVehiclePricing {
  return {
    mode: "dynamic",
    baseFare,
    perKmRate,
    waitingPerMinute,
    freeWaitingMinutes: 5,
    surgeEnabled: true,
    surgeMultipliers: { ...DEFAULT_SURGE, ...surge },
  };
}

function standard(baseFare: number, perKmRate: number): StandardVehiclePricing {
  return {
    mode: "standard",
    baseFare,
    perKmRate,
  };
}

/**
 * Seed only — live rates come from data/fare-pricing.json.
 * Keep in sync with that file when changing defaults.
 */
export const DEFAULT_FARE_PRICING_CATALOG: FarePricingCatalog = {
  bike: dynamic(80, 55, 2),
  tuk: dynamic(100, 75, 2),
  miniCar: dynamic(140, 90, 3),
  wagon: dynamic(150, 95, 3),
  sedan: standard(130, 150),
  miniVan: standard(180, 200),
  van: standard(220, 240),
  longVan: standard(230, 250),
  suv: standard(240, 260),
  miniBus: standard(320, 340),
  longBus: standard(500, 520),
};

/** Seed calibration — live value is in data/fare-pricing.json. */
export const DEFAULT_FARE_CALIBRATION = {
  marketAdjustment: 0.95,
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
  const saved = saveFarePricingFile(seedFile());
  return saved.vehicles;
}

/**
 * Merge partial admin updates into the live JSON config and persist.
 */
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
