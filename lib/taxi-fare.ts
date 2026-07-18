/**
 * Taxi ride fare — server facade for Ride bookings.
 * Client UI must import from @/lib/taxi-fare-ui (no Node fs).
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
  type TimeOfDay,
} from "@/lib/taxi-fare-ui";

export { calculateFare } from "@/lib/fare/fare-engine";

export type TaxiFareInput = {
  vehicleId: TaxiVehicleId;
  distanceKm: number;
  waitingMinutes: number;
  extrasLkr?: number;
  tollCharges?: number;
  parkingCharges?: number;
  airportPickup?: boolean;
  at?: Date | string | number;
  conditions?: SurgeCondition[];
  surgeMultiplierOverride?: number;
};

export function getTaxiVehicleRates(): Record<TaxiVehicleId, TaxiVehicleRate> {
  const rates = {} as Record<TaxiVehicleId, TaxiVehicleRate>;
  for (const id of TAXI_VEHICLE_IDS) {
    const p = getVehiclePricing(id);
    rates[id] = {
      id,
      firstKm: p.dayBaseFare,
      afterFirstKm: p.dayPerKmRate,
    };
  }
  return rates;
}

export const TAXI_VEHICLE_RATES: Record<TaxiVehicleId, TaxiVehicleRate> =
  new Proxy({} as Record<TaxiVehicleId, TaxiVehicleRate>, {
    get(_target, prop: string) {
      if (prop === "id" || typeof prop === "symbol") return undefined;
      if (!(TAXI_VEHICLE_IDS as readonly string[]).includes(prop)) return undefined;
      const p = getVehiclePricing(prop as TaxiVehicleId);
      return {
        id: prop as TaxiVehicleId,
        firstKm: p.dayBaseFare,
        afterFirstKm: p.dayPerKmRate,
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
  return { id, firstKm: p.dayBaseFare, afterFirstKm: p.dayPerKmRate };
}

export function calculateBillableWaitingMinutes(waitingMinutes: number): number {
  return Math.max(0, waitingMinutes);
}

export function calculateWaitingCharge(waitingMinutes: number): number {
  return calculateBillableWaitingMinutes(waitingMinutes) * WAITING_RATE_PER_MIN;
}

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
    airportPickup: input.airportPickup,
    at: input.at,
    conditions: input.conditions,
    surgeMultiplierOverride: input.surgeMultiplierOverride,
  });

  return {
    vehicleId: result.vehicleId,
    distanceKm: result.distanceKm,
    firstKmFare: result.baseFare,
    additionalKmRate: result.perKmRate,
    additionalKm: result.distanceKm,
    additionalKmFare: result.distanceCharge,
    waitingMinutes: result.waitingMinutes,
    billableWaitingMinutes: result.billableWaitingMinutes,
    waitingCharge: result.waitingCharge,
    extrasLkr: extrasFromSplit || result.tollCharges + result.parkingCharges,
    distanceFare: result.baseFare + result.distanceCharge,
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
    timeOfDay: result.timeOfDay,
    bookingFee: result.bookingFee,
    airportPickupFee: result.airportPickupFee,
    longDistanceDiscount: result.longDistanceDiscount,
    minimumFareTopUp: result.minimumFareTopUp,
    distanceCharge: result.distanceCharge,
  };
}
