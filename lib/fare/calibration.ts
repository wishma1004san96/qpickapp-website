/**
 * Market calibration — aligns Q Pick estimates with PickMe (±5% target).
 * Configurable via /api/admin/pricing — not hardcoded in the UI.
 *
 * Live reads always start from DEFAULT_FARE_CALIBRATION, then apply admin override.
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

/** Admin override for marketAdjustment (null = use default). */
let marketAdjustmentOverride: number | null = null;

export function getFareCalibration(): FareCalibrationSettings {
  return {
    marketAdjustment:
      marketAdjustmentOverride != null
        ? marketAdjustmentOverride
        : DEFAULT_FARE_CALIBRATION.marketAdjustment,
  };
}

export function resetFareCalibration(): FareCalibrationSettings {
  marketAdjustmentOverride = null;
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
      marketAdjustmentOverride = n;
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
  const resolved =
    factor ?? getFareCalibration().marketAdjustment;
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
