/**
 * Long-distance per-km banding (base fare unchanged).
 * 0–30 km = 100% · 30–75 = 97% · 75–150 = 94% · 150+ = 90%
 */

import { clampNonNeg } from "@/lib/fare/math";

export const LONG_DISTANCE_BANDS = [
  { upToKm: 30, factor: 1 },
  { upToKm: 75, factor: 0.97 },
  { upToKm: 150, factor: 0.94 },
  { upToKm: Number.POSITIVE_INFINITY, factor: 0.9 },
] as const;

export function calculateBandedDistanceCharge(
  distanceKm: number,
  perKmRate: number,
  enabled: boolean,
): {
  distanceCharge: number;
  fullRateDistanceCharge: number;
  longDistanceDiscount: number;
  effectivePerKmRate: number;
} {
  const distance = clampNonNeg(distanceKm);
  const rate = clampNonNeg(perKmRate);
  const fullRateDistanceCharge = distance * rate;

  if (!enabled || distance === 0 || rate === 0) {
    return {
      distanceCharge: fullRateDistanceCharge,
      fullRateDistanceCharge,
      longDistanceDiscount: 0,
      effectivePerKmRate: rate,
    };
  }

  let charged = 0;
  let covered = 0;
  for (const band of LONG_DISTANCE_BANDS) {
    if (covered >= distance) break;
    const bandEnd = band.upToKm;
    const segment = Math.min(distance, bandEnd) - covered;
    if (segment <= 0) continue;
    charged += segment * rate * band.factor;
    covered += segment;
  }

  const longDistanceDiscount = Math.max(0, fullRateDistanceCharge - charged);
  return {
    distanceCharge: charged,
    fullRateDistanceCharge,
    longDistanceDiscount,
    effectivePerKmRate: distance > 0 ? charged / distance : rate,
  };
}
