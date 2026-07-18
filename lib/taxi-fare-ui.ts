/**
 * Client-safe taxi fare helpers (no Node fs / pricing store).
 * Live fare math runs on the server via POST /api/ride/fare.
 */

import type { FareBreakdown, SurgeCondition, TimeOfDay } from "@/lib/fare/types";
import {
  TAXI_VEHICLE_IDS,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-vehicles";

export { TAXI_VEHICLE_IDS, type TaxiVehicleId };
export {
  DYNAMIC_PRICING_VEHICLE_IDS,
  isDynamicPricingVehicle,
} from "@/lib/taxi-fare-vehicles";
export type { FareBreakdown, SurgeCondition, TimeOfDay };

export type TaxiVehicleRate = {
  id: TaxiVehicleId;
  firstKm: number;
  afterFirstKm: number;
};

/** Waiting is charged from the first minute in the day/night engine. */
export const FREE_WAITING_MINUTES = 0;
/** Display fallback — live rate comes from the pricing catalog. */
export const WAITING_RATE_PER_MIN = 3;

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
  timeOfDay?: TimeOfDay;
  bookingFee?: number;
  airportPickupFee?: number;
  longDistanceDiscount?: number;
  minimumFareTopUp?: number;
  distanceCharge?: number;
};

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
