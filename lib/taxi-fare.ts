/**
 * Taxi ride fare — public facade for Ride UI.
 * Calculation is delegated to the hybrid Fare Engine
 * (Dynamic: Bike/Tuk/Mini Car/Wagon · Standard: all others).
 *
 * Do NOT reuse for Airport Transfers or Tour bookings.
 */

import { calculateFare } from "@/lib/fare/fare-engine";
import { getVehiclePricing } from "@/lib/fare/pricing-settings";
import type { FareBreakdown, SurgeCondition } from "@/lib/fare/types";
import {
  TAXI_VEHICLE_IDS,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-vehicles";

export { TAXI_VEHICLE_IDS, type TaxiVehicleId };
export {
  DYNAMIC_PRICING_VEHICLE_IDS,
  isDynamicPricingVehicle,
} from "@/lib/taxi-fare-vehicles";
export { calculateFare } from "@/lib/fare/fare-engine";
export type { FareBreakdown, SurgeCondition } from "@/lib/fare/types";

/** @deprecated Prefer baseFare / perKmRate from admin catalog */
export type TaxiVehicleRate = {
  id: TaxiVehicleId;
  /** Maps to base fare */
  firstKm: number;
  /** Maps to per-km rate */
  afterFirstKm: number;
};

/** Default free waiting (dynamic vehicles) — overridable per vehicle in admin catalog. */
export const FREE_WAITING_MINUTES = 5;

/**
 * Fallback waiting rate for legacy helpers.
 * Dynamic vehicles use per-vehicle waitingPerMinute from the catalog.
 */
export const WAITING_RATE_PER_MIN = 30;

/** Legacy rate table derived from the live admin catalog (UI-compatible). */
export function getTaxiVehicleRates(): Record<TaxiVehicleId, TaxiVehicleRate> {
  const rates = {} as Record<TaxiVehicleId, TaxiVehicleRate>;
  for (const id of TAXI_VEHICLE_IDS) {
    const p = getVehiclePricing(id);
    rates[id] = {
      id,
      firstKm: p.baseFare,
      afterFirstKm: p.perKmRate,
    };
  }
  return rates;
}

/** @deprecated Use getTaxiVehicleRates() or getVehiclePricing() */
export const TAXI_VEHICLE_RATES: Record<TaxiVehicleId, TaxiVehicleRate> =
  new Proxy({} as Record<TaxiVehicleId, TaxiVehicleRate>, {
    get(_target, prop: string) {
      if (prop === "id" || typeof prop === "symbol") return undefined;
      if (!(TAXI_VEHICLE_IDS as readonly string[]).includes(prop)) return undefined;
      const p = getVehiclePricing(prop as TaxiVehicleId);
      return {
        id: prop as TaxiVehicleId,
        firstKm: p.baseFare,
        afterFirstKm: p.perKmRate,
      } satisfies TaxiVehicleRate;
    },
    ownKeys() {
      return [...TAXI_VEHICLE_IDS];
    },
    getOwnPropertyDescriptor(_t, prop) {
      if (!(TAXI_VEHICLE_IDS as readonly string[]).includes(String(prop))) {
        return undefined;
      }
      return { enumerable: true, configurable: true };
    },
  });

export type TaxiFareInput = {
  vehicleId: TaxiVehicleId;
  distanceKm: number;
  waitingMinutes: number;
  /** Combined extras — split into toll + parking when possible */
  extrasLkr?: number;
  tollCharges?: number;
  parkingCharges?: number;
  conditions?: SurgeCondition[];
  surgeMultiplierOverride?: number;
};

/**
 * UI-compatible breakdown. Prefer FareBreakdown from the fare engine for new code.
 */
export type TaxiFareBreakdown = {
  vehicleId: TaxiVehicleId;
  distanceKm: number;
  firstKmFare: number;
  additionalKmRate: number;
  additionalKm: number;
  additionalKmFare: number;
  waitingMinutes: number;
  billableWaitingMinutes: number;
  waitingCharge: number;
  extrasLkr: number;
  distanceFare: number;
  totalLkr: number;
  pricingMode: FareBreakdown["pricingMode"];
  surgeMultiplier: number;
  surgeAmount: number;
  tollCharges: number;
  parkingCharges: number;
  totalBeforeCalibration?: number;
  marketAdjustment?: number;
  baseFare?: number;
  perKmRate?: number;
};

export function getTaxiVehicleRate(id: TaxiVehicleId): TaxiVehicleRate {
  const p = getVehiclePricing(id);
  return { id, firstKm: p.baseFare, afterFirstKm: p.perKmRate };
}

export function calculateBillableWaitingMinutes(waitingMinutes: number): number {
  const mins = Math.max(0, waitingMinutes);
  return Math.max(0, mins - FREE_WAITING_MINUTES);
}

export function calculateWaitingCharge(waitingMinutes: number): number {
  return calculateBillableWaitingMinutes(waitingMinutes) * WAITING_RATE_PER_MIN;
}

/**
 * Full taxi fare estimate for Ride bookings.
 * Routes through the hybrid Fare Engine automatically.
 */
export function calculateTaxiFare(input: TaxiFareInput): TaxiFareBreakdown {
  const toll =
    input.tollCharges ??
    (input.parkingCharges != null ? 0 : Math.max(0, input.extrasLkr ?? 0));
  const parking = input.parkingCharges ?? 0;
  const extrasFromSplit =
    input.tollCharges != null || input.parkingCharges != null
      ? (input.tollCharges ?? 0) + (input.parkingCharges ?? 0)
      : Math.max(0, input.extrasLkr ?? 0);

  const result = calculateFare({
    vehicleId: input.vehicleId,
    distanceKm: input.distanceKm,
    waitingMinutes: input.waitingMinutes,
    tollCharges: toll,
    parkingCharges: parking,
    conditions: input.conditions,
    surgeMultiplierOverride: input.surgeMultiplierOverride,
  });

  // Distance-only portion of charge beyond base (for legacy summary fields)
  const additionalKmFare = Math.max(
    0,
    result.distanceCharge - result.baseFare,
  );
  const additionalKm =
    result.perKmRate > 0 ? additionalKmFare / result.perKmRate : 0;

  return {
    vehicleId: result.vehicleId,
    distanceKm: result.distanceKm,
    firstKmFare: result.baseFare,
    additionalKmRate: result.perKmRate,
    additionalKm,
    additionalKmFare,
    waitingMinutes: result.waitingMinutes,
    billableWaitingMinutes: result.billableWaitingMinutes,
    waitingCharge: result.waitingCharge,
    extrasLkr: extrasFromSplit || result.tollCharges + result.parkingCharges,
    distanceFare: result.distanceCharge,
    totalLkr: result.totalLkr,
    pricingMode: result.pricingMode,
    surgeMultiplier: result.surgeMultiplier,
    surgeAmount: result.surgeAmount,
    tollCharges: result.tollCharges,
    parkingCharges: result.parkingCharges,
    totalBeforeCalibration: result.totalBeforeCalibration,
    marketAdjustment: result.marketAdjustment,
    baseFare: result.baseFare,
    perKmRate: result.perKmRate,
  };
}

export function formatLkr(amount: number): string {
  const rounded = Math.round(amount);
  return `LKR ${rounded.toLocaleString("en-LK")}`;
}

export function formatLkrCompact(amount: number): string {
  return Math.round(amount).toLocaleString("en-LK");
}

export function formatRs(amount: number): string {
  return `Rs.${Math.round(amount).toLocaleString("en-LK")}`;
}

export type TaxiVehicleMeta = {
  passengers: number;
  luggage: number;
  airConditioning: boolean;
  available: boolean;
  rating: number;
};

/** Capacity / comfort meta for the ride vehicle picker (display only). */
export const TAXI_VEHICLE_META: Record<TaxiVehicleId, TaxiVehicleMeta> = {
  bike: {
    passengers: 1,
    luggage: 1,
    airConditioning: false,
    available: true,
    rating: 4.6,
  },
  tuk: {
    passengers: 3,
    luggage: 2,
    airConditioning: false,
    available: true,
    rating: 4.5,
  },
  miniCar: {
    passengers: 3,
    luggage: 2,
    airConditioning: true,
    available: true,
    rating: 4.7,
  },
  wagon: {
    passengers: 4,
    luggage: 3,
    airConditioning: true,
    available: true,
    rating: 4.6,
  },
  sedan: {
    passengers: 4,
    luggage: 2,
    airConditioning: true,
    available: true,
    rating: 4.9,
  },
  miniVan: {
    passengers: 6,
    luggage: 4,
    airConditioning: true,
    available: true,
    rating: 4.7,
  },
  van: {
    passengers: 8,
    luggage: 6,
    airConditioning: true,
    available: true,
    rating: 4.8,
  },
  longVan: {
    passengers: 10,
    luggage: 8,
    airConditioning: true,
    available: true,
    rating: 4.7,
  },
  suv: {
    passengers: 5,
    luggage: 4,
    airConditioning: true,
    available: true,
    rating: 4.9,
  },
  miniBus: {
    passengers: 14,
    luggage: 8,
    airConditioning: true,
    available: true,
    rating: 4.6,
  },
  longBus: {
    passengers: 30,
    luggage: 12,
    airConditioning: true,
    available: true,
    rating: 4.5,
  },
};
