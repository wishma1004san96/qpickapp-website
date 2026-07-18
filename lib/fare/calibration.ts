/**
 * Market calibration — aligns Q Pick estimates with PickMe (±5% target).
 * Configurable via /api/admin/pricing — not hardcoded in the UI.
 */

export type FareCalibrationSettings = {
  /**
   * Applied to the fully calculated fare (after surge / toll / parking).
   * 1 = no adjustment · 0.95 ≈ slightly under raw catalog to track PickMe.
   */
  marketAdjustment: number;
};

export const DEFAULT_FARE_CALIBRATION: FareCalibrationSettings = {
  marketAdjustment: 0.95,
};

let calibration: FareCalibrationSettings = {
  ...DEFAULT_FARE_CALIBRATION,
};

export function getFareCalibration(): FareCalibrationSettings {
  return { ...calibration };
}

export function resetFareCalibration(): FareCalibrationSettings {
  calibration = { ...DEFAULT_FARE_CALIBRATION };
  return getFareCalibration();
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
      calibration.marketAdjustment = n;
    }
  }
  return getFareCalibration();
}

/** Apply calibration to a raw calculated total (LKR). */
export function applyMarketCalibration(
  calculatedFare: number,
  factor: number = calibration.marketAdjustment,
): { totalBeforeCalibration: number; marketAdjustment: number; totalLkr: number } {
  const totalBeforeCalibration = Number.isFinite(calculatedFare)
    ? calculatedFare
    : 0;
  const marketAdjustment =
    typeof factor === "number" && Number.isFinite(factor) && factor > 0
      ? factor
      : 1;
  return {
    totalBeforeCalibration,
    marketAdjustment,
    totalLkr: Math.round(totalBeforeCalibration * marketAdjustment),
  };
}
