/**
 * Q Pick Day & Night fare types — Ride bookings only.
 * Single vehicle pricing shape for every fleet type.
 */

import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export type TimeOfDay = "day" | "night";

/** @deprecated Kept for API compatibility — engine is unified day/night. */
export type PricingMode = "dayNight";

/** @deprecated Legacy surge condition labels — prefer surgeMultiplier on vehicle. */
export type SurgeCondition = "normal" | "peak" | "rain" | "highDemand";

/** Admin-editable rates for every vehicle. */
export type VehiclePricingSettings = {
  dayBaseFare: number;
  dayPerKmRate: number;
  nightBaseFare: number;
  nightPerKmRate: number;
  waitingPerMinute: number;
  minimumFare: number;
  /** Optional flat fee (0 = off). */
  bookingFee: number;
  /** Optional flat fee when airport pickup is flagged (0 = off). */
  airportPickupFee: number;
  /** When true, apply surgeMultiplier to the fare subtotal. */
  surgeEnabled: boolean;
  /** Multiplier used when surgeEnabled (1 = no change). */
  surgeMultiplier: number;
  /** When true, apply automatic long-distance per-km bands. */
  longDistanceDiscountEnabled: boolean;
};

export type FarePricingCatalog = Record<TaxiVehicleId, VehiclePricingSettings>;

export type FareContext = {
  distanceKm: number;
  /** Rider-entered idle minutes only — never route duration. */
  waitingMinutes?: number;
  tollCharges?: number;
  parkingCharges?: number;
  /** When true, include vehicle airportPickupFee. */
  airportPickup?: boolean;
  /** Explicit surge override (still requires surgeEnabled). */
  surgeMultiplierOverride?: number;
  /** Instant used for day/night (defaults to now, Asia/Colombo). */
  at?: Date | string | number;
  /** @deprecated Ignored by day/night engine. */
  conditions?: SurgeCondition[];
};

export type FareEngineInput = FareContext & {
  vehicleId: TaxiVehicleId;
};

export type FareBreakdown = {
  vehicleId: TaxiVehicleId;
  pricingMode: PricingMode;
  timeOfDay: TimeOfDay;
  distanceKm: number;

  baseFare: number;
  perKmRate: number;
  /** Distance-only charge after long-distance banding (excludes base). */
  distanceCharge: number;
  /** Savings from long-distance banding (0 if disabled). */
  longDistanceDiscount: number;

  waitingMinutes: number;
  billableWaitingMinutes: number;
  waitingCharge: number;

  bookingFee: number;
  airportPickupFee: number;

  surgeEnabled: boolean;
  surgeMultiplier: number;
  surgeAmount: number;

  tollCharges: number;
  parkingCharges: number;

  subtotalBeforeSurge: number;
  subtotalAfterSurge: number;
  /** Amount added to reach minimumFare, if any. */
  minimumFareTopUp: number;
  minimumFare: number;

  /** Alias for pre-calibration total (calibration usually 1). */
  totalBeforeCalibration: number;
  marketAdjustment: number;
  totalLkr: number;

  /** @deprecated Always empty / normal for compatibility. */
  activeConditions: SurgeCondition[];
};
