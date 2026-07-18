/**
 * Taxi ride fare — server facade for Ride bookings.
 * Client UI must import from @/lib/taxi-fare-ui (no Node fs).
 *
 * Do NOT reuse for Airport Transfers or Tour bookings.
 */

import { calculateFare } from "@/lib/fare/fare-engine";
import { getVehiclePricing } from "@/lib/fare/pricing-settings";
import type { SurgeCondition } from "@/lib/fare/types";
import {
  FREE_WAITING_MINUTES,
  WAITING_RATE_PER_MIN,
  type TaxiFareBreakdown,
  type TaxiVehicleRate,
} from "@/lib/taxi-fare-ui";
import {
  TAXI_VEHICLE_IDS,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-vehicles";

export {
  TAXI_VEHICLE_IDS,
  type TaxiVehicleId,
  DYNAMIC_PRICING_VEHICLE_IDS,
  isDynamicPricingVehicle,
  FREE_WAITING_MINUTES,
  WAITING_RATE_PER_MIN,
  formatLkr,
  formatLkrCompact,
  formatRs,
  TAXI_VEHICLE_META,
  type TaxiVehicleMeta,
  type TaxiFareBreakdown,
  type TaxiVehicleRate,
  type FareBreakdown,
  type SurgeCondition,
} from "@/lib/taxi-fare-ui";

export { calculateFare } from "@/lib/fare/fare-engine";

export type TaxiFareInput = {
  vehicleId: TaxiVehicleId;
  distanceKm: number;
  waitingMinutes: number;
  extrasLkr?: number;
  tollCharges?: number;
  parkingCharges?: number;
  conditions?: SurgeCondition[];
  surgeMultiplierOverride?: number;
};

/** Legacy rate table derived from the live catalog (server-only). */
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
 * Routes through the hybrid Fare Engine (server-only live catalog).
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

  const additionalKmFare = Math.max(0, result.distanceCharge - result.baseFare);
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
