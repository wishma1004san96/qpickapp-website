/**
 * Admin-editable fare catalog.
 *
 * Live reads ALWAYS start from DEFAULT_FARE_PRICING_CATALOG, then apply
 * in-memory admin patches. This prevents a stale module-level clone from
 * overriding source/default pricing updates (HMR / redeploy / code edits).
 *
 * Runtime patches: PUT /api/admin/pricing
 */

import type {
  DynamicVehiclePricing,
  FarePricingCatalog,
  StandardVehiclePricing,
  SurgeMultipliers,
  VehiclePricingSettings,
} from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";
import { TAXI_VEHICLE_IDS } from "@/lib/taxi-fare-vehicles";

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
 * Seed catalog for Ride bookings.
 * Dynamic (surge + waiting): Bike, Tuk, Mini Car, Wagon.
 * Standard (base + distance + toll/parking only): all others.
 */
export const DEFAULT_FARE_PRICING_CATALOG: FarePricingCatalog = {
  bike: dynamic(80, 55, 2),
  tuk: dynamic(100, 75, 2),
  miniCar: dynamic(140, 90, 3),
  wagon: dynamic(150, 95, 3),
  // Standard (no surge / no waiting)
  sedan: standard(130, 150),
  miniVan: standard(180, 200),
  van: standard(220, 240), // FR Van in product language
  longVan: standard(230, 250), // HR Van
  suv: standard(240, 260),
  miniBus: standard(320, 340),
  longBus: standard(500, 520), // Bus
};

export type AdminPricingPatch = {
  baseFare?: number;
  perKmRate?: number;
  waitingPerMinute?: number;
  freeWaitingMinutes?: number;
  surgeEnabled?: boolean;
  surgeMultipliers?: Partial<SurgeMultipliers>;
};

/** Admin overrides only — defaults are always read fresh from DEFAULT_*. */
let adminPatches: Partial<Record<TaxiVehicleId, AdminPricingPatch>> = {};

function applyPatch(
  base: VehiclePricingSettings,
  patch: AdminPricingPatch,
): VehiclePricingSettings {
  if (base.mode === "dynamic") {
    return {
      mode: "dynamic",
      baseFare: num(patch.baseFare, base.baseFare),
      perKmRate: num(patch.perKmRate, base.perKmRate),
      waitingPerMinute: num(patch.waitingPerMinute, base.waitingPerMinute),
      freeWaitingMinutes: num(patch.freeWaitingMinutes, base.freeWaitingMinutes),
      surgeEnabled:
        typeof patch.surgeEnabled === "boolean"
          ? patch.surgeEnabled
          : base.surgeEnabled,
      surgeMultipliers: {
        peak: num(patch.surgeMultipliers?.peak, base.surgeMultipliers.peak),
        rain: num(patch.surgeMultipliers?.rain, base.surgeMultipliers.rain),
        highDemand: num(
          patch.surgeMultipliers?.highDemand,
          base.surgeMultipliers.highDemand,
        ),
      },
    };
  }

  return {
    mode: "standard",
    baseFare: num(patch.baseFare, base.baseFare),
    perKmRate: num(patch.perKmRate, base.perKmRate),
  };
}

export function getFarePricingCatalog(): FarePricingCatalog {
  const next = {} as FarePricingCatalog;
  for (const id of TAXI_VEHICLE_IDS) {
    next[id] = getVehiclePricing(id);
  }
  return next;
}

export function getVehiclePricing(id: TaxiVehicleId): VehiclePricingSettings {
  const base = structuredClone(DEFAULT_FARE_PRICING_CATALOG[id]);
  const patch = adminPatches[id];
  if (!patch) return base;
  return applyPatch(base, patch);
}

export function resetFarePricingCatalog(): FarePricingCatalog {
  adminPatches = {};
  return getFarePricingCatalog();
}

/**
 * Merge partial admin updates. Unknown keys / invalid numbers are ignored.
 */
export function updateFarePricingCatalog(
  patch: Partial<Record<TaxiVehicleId, AdminPricingPatch>>,
): FarePricingCatalog {
  for (const id of Object.keys(patch) as TaxiVehicleId[]) {
    const next = patch[id];
    if (!next) continue;
    adminPatches[id] = { ...adminPatches[id], ...next };
  }
  return getFarePricingCatalog();
}

function num(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
}
