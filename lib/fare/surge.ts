/**
 * Resolve optional surge multiplier for day/night vehicles.
 */

import { clampNonNeg } from "@/lib/fare/math";
import type { VehiclePricingSettings } from "@/lib/fare/types";

export function resolveVehicleSurgeMultiplier(
  settings: VehiclePricingSettings,
  override?: number,
): number {
  if (!settings.surgeEnabled) return 1;
  if (override != null && Number.isFinite(override) && override >= 1) {
    return override;
  }
  return Math.max(1, clampNonNeg(settings.surgeMultiplier, 1));
}

export function applySurge(
  coreAmount: number,
  multiplier: number,
): { afterSurge: number; surgeAmount: number } {
  const m = Math.max(1, clampNonNeg(multiplier, 1));
  const afterSurge = coreAmount * m;
  return {
    afterSurge,
    surgeAmount: afterSurge - coreAmount,
  };
}
