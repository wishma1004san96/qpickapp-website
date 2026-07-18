/**
 * Resolve surge multiplier from admin settings + active conditions.
 * Multipliers stack by taking the max of enabled condition factors
 * (avoids compounding peak × rain × demand into extreme fares).
 * Backend can override with an explicit multiplier.
 */

import type {
  DynamicVehiclePricing,
  SurgeCondition,
} from "@/lib/fare/types";
import { clampNonNeg } from "@/lib/fare/math";

export function resolveSurgeMultiplier(
  settings: DynamicVehiclePricing,
  conditions: SurgeCondition[] = ["normal"],
  override?: number,
): { multiplier: number; activeConditions: SurgeCondition[] } {
  if (!settings.surgeEnabled) {
    return { multiplier: 1, activeConditions: ["normal"] };
  }

  if (override != null && Number.isFinite(override) && override >= 1) {
    return {
      multiplier: override,
      activeConditions: conditions.length ? conditions : ["normal"],
    };
  }

  const active = conditions.filter((c) => c !== "normal");
  if (active.length === 0) {
    return { multiplier: 1, activeConditions: ["normal"] };
  }

  const factors: number[] = [];
  for (const condition of active) {
    if (condition === "peak") factors.push(settings.surgeMultipliers.peak);
    if (condition === "rain") factors.push(settings.surgeMultipliers.rain);
    if (condition === "highDemand") {
      factors.push(settings.surgeMultipliers.highDemand);
    }
  }

  const multiplier = clampNonNeg(Math.max(1, ...factors), 1);
  return { multiplier, activeConditions: active };
}

/** Apply surge to a core subtotal: returns surged total + surge delta. */
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
