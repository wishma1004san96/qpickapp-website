/**
 * Admin-editable fare catalog (defaults).
 * Runtime updates via /api/admin/pricing — no UI change required.
 */

import type {
  DynamicVehiclePricing,
  FarePricingCatalog,
  StandardVehiclePricing,
  SurgeMultipliers,
} from "@/lib/fare/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

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
  miniCar: dynamic(150, 95, 3),
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

let catalog: FarePricingCatalog = structuredClone(DEFAULT_FARE_PRICING_CATALOG);

export function getFarePricingCatalog(): FarePricingCatalog {
  return structuredClone(catalog);
}

export function getVehiclePricing(id: TaxiVehicleId) {
  return structuredClone(catalog[id]);
}

export function resetFarePricingCatalog(): FarePricingCatalog {
  catalog = structuredClone(DEFAULT_FARE_PRICING_CATALOG);
  return getFarePricingCatalog();
}

type AdminPricingPatch = {
  baseFare?: number;
  perKmRate?: number;
  waitingPerMinute?: number;
  freeWaitingMinutes?: number;
  surgeEnabled?: boolean;
  surgeMultipliers?: Partial<SurgeMultipliers>;
};

/**
 * Merge partial admin updates into the live catalog.
 * Unknown keys / invalid numbers are ignored for safety.
 */
export function updateFarePricingCatalog(
  patch: Partial<Record<TaxiVehicleId, AdminPricingPatch>>,
): FarePricingCatalog {
  for (const id of Object.keys(patch) as TaxiVehicleId[]) {
    const current = catalog[id];
    const next = patch[id];
    if (!current || !next) continue;

    if (current.mode === "dynamic") {
      catalog[id] = {
        mode: "dynamic",
        baseFare: num(next.baseFare, current.baseFare),
        perKmRate: num(next.perKmRate, current.perKmRate),
        waitingPerMinute: num(next.waitingPerMinute, current.waitingPerMinute),
        freeWaitingMinutes: num(
          next.freeWaitingMinutes,
          current.freeWaitingMinutes,
        ),
        surgeEnabled:
          typeof next.surgeEnabled === "boolean"
            ? next.surgeEnabled
            : current.surgeEnabled,
        surgeMultipliers: {
          peak: num(next.surgeMultipliers?.peak, current.surgeMultipliers.peak),
          rain: num(next.surgeMultipliers?.rain, current.surgeMultipliers.rain),
          highDemand: num(
            next.surgeMultipliers?.highDemand,
            current.surgeMultipliers.highDemand,
          ),
        },
      };
    } else {
      catalog[id] = {
        mode: "standard",
        baseFare: num(next.baseFare, current.baseFare),
        perKmRate: num(next.perKmRate, current.perKmRate),
      };
    }
  }

  return getFarePricingCatalog();
}

function num(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
}
