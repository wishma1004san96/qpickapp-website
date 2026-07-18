/**
 * Shared types for the Q Pick hybrid fare engine.
 * Ride bookings only — not for Airport / Tours.
 */

import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export type PricingMode = "dynamic" | "standard";

/** Market conditions that can raise dynamic fares. */
export type SurgeCondition = "normal" | "peak" | "rain" | "highDemand";

export type SurgeMultipliers = {
  peak: number;
  rain: number;
  highDemand: number;
};

/** Admin-editable rates for dynamic vehicles (Bike / Tuk / Mini Car / Wagon). */
export type DynamicVehiclePricing = {
  mode: "dynamic";
  baseFare: number;
  perKmRate: number;
  waitingPerMinute: number;
  /** Free waiting window before per-minute charge applies */
  freeWaitingMinutes: number;
  surgeEnabled: boolean;
  surgeMultipliers: SurgeMultipliers;
};

/** Admin-editable rates for standard vehicles. */
export type StandardVehiclePricing = {
  mode: "standard";
  baseFare: number;
  perKmRate: number;
};

export type VehiclePricingSettings =
  | DynamicVehiclePricing
  | StandardVehiclePricing;

export type FarePricingCatalog = Record<TaxiVehicleId, VehiclePricingSettings>;

/** Runtime conditions supplied when calculating a fare. */
export type FareContext = {
  /** Driving distance in kilometres (metres / 1000). */
  distanceKm: number;
  /**
   * Rider-entered idle / waiting minutes only.
   * Must NOT be route duration / driving time.
   */
  waitingMinutes?: number;
  tollCharges?: number;
  parkingCharges?: number;
  /** Active market conditions (ignored for standard vehicles) */
  conditions?: SurgeCondition[];
  /**
   * Optional explicit multiplier override from backend.
   * When set, replaces condition-derived multiplier (still respects surgeEnabled).
   */
  surgeMultiplierOverride?: number;
};

export type FareEngineInput = FareContext & {
  vehicleId: TaxiVehicleId;
};

export type FareBreakdown = {
  vehicleId: TaxiVehicleId;
  pricingMode: PricingMode;
  distanceKm: number;

  baseFare: number;
  perKmRate: number;
  distanceCharge: number;

  waitingMinutes: number;
  billableWaitingMinutes: number;
  waitingCharge: number;

  /** Applied surge multiplier (1 = none). Dynamic vehicles only. */
  surgeMultiplier: number;
  /** Amount attributed to surge (core × multiplier − core) */
  surgeAmount: number;
  activeConditions: SurgeCondition[];

  tollCharges: number;
  parkingCharges: number;

  /** base + distance (+ waiting) before surge */
  subtotalBeforeSurge: number;
  /** After surge, before toll/parking */
  subtotalAfterSurge: number;

  /** Raw total before market calibration */
  totalBeforeCalibration: number;
  /** Configurable PickMe-alignment factor (e.g. 0.95) */
  marketAdjustment: number;
  /** Final estimated fare after calibration */
  totalLkr: number;
};
