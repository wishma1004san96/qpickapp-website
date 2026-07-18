/**
 * Market calibration — aligns Q Pick estimates with PickMe.
 *
 * Live value lives in data/fare-pricing.json (same file as vehicle rates).
 * Do not keep a second in-memory calibration source.
 */

import {
  getActiveCalibration,
  resetActiveCalibration,
  updateActiveCalibration,
  DEFAULT_FARE_CALIBRATION,
} from "@/lib/fare/pricing-settings";

export type FareCalibrationSettings = {
  /**
   * Applied to the fully calculated fare (after surge / toll / parking).
   * 1 = no adjustment · e.g. 0.95 / 1.18 = market alignment factor.
   */
  marketAdjustment: number;
};

export { DEFAULT_FARE_CALIBRATION };

export function getFareCalibration(): FareCalibrationSettings {
  return getActiveCalibration();
}

export function resetFareCalibration(): FareCalibrationSettings {
  return resetActiveCalibration();
}

/**
 * Update market adjustment. Values must be finite and within a safe band
 * so a bad admin patch cannot zero-out or explode fares.
 */
export function updateFareCalibration(
  patch: Partial<FareCalibrationSettings>,
): FareCalibrationSettings {
  if (patch.marketAdjustment != null) {
    const n = patch.marketAdjustment;
    if (typeof n === "number" && Number.isFinite(n) && n >= 0.5 && n <= 1.5) {
      return updateActiveCalibration(n);
    }
  }
  return getFareCalibration();
}

/** Apply calibration to a raw calculated total (LKR). */
export function applyMarketCalibration(
  calculatedFare: number,
  factor?: number,
): {
  totalBeforeCalibration: number;
  marketAdjustment: number;
  totalLkr: number;
} {
  const totalBeforeCalibration = Number.isFinite(calculatedFare)
    ? calculatedFare
    : 0;
  const resolved = factor ?? getFareCalibration().marketAdjustment;
  const marketAdjustment =
    typeof resolved === "number" && Number.isFinite(resolved) && resolved > 0
      ? resolved
      : 1;
  return {
    totalBeforeCalibration,
    marketAdjustment,
    totalLkr: Math.round(totalBeforeCalibration * marketAdjustment),
  };
}
