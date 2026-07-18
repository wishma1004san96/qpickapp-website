/**
 * Client helper — always calculate fares on the server so live catalog
 * + calibration updates apply immediately (no stale client bundle rates).
 */

import type { SurgeCondition, TaxiFareBreakdown, TaxiVehicleId } from "@/lib/taxi-fare";

export type FetchRideFareInput = {
  vehicleId: TaxiVehicleId;
  distanceKm: number;
  waitingMinutes?: number;
  tollCharges?: number;
  parkingCharges?: number;
  conditions?: SurgeCondition[];
  surgeMultiplierOverride?: number;
  signal?: AbortSignal;
};

export async function fetchRideFare(
  input: FetchRideFareInput,
): Promise<TaxiFareBreakdown> {
  const res = await fetch("/api/ride/fare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal: input.signal,
    body: JSON.stringify({
      vehicleId: input.vehicleId,
      distanceKm: input.distanceKm,
      waitingMinutes: input.waitingMinutes ?? 0,
      tollCharges: input.tollCharges,
      parkingCharges: input.parkingCharges,
      conditions: input.conditions,
      surgeMultiplierOverride: input.surgeMultiplierOverride,
    }),
  });

  const data = (await res.json()) as TaxiFareBreakdown & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Unable to calculate fare.");
  }

  // Temporary client debug — confirms values reaching the UI
  console.info("[Ride fare debug:client]", {
    selectedVehicle: data.vehicleId,
    baseFare: data.baseFare ?? data.firstKmFare,
    perKmRate: data.perKmRate ?? data.additionalKmRate,
    distance: data.distanceKm,
    waitingCharge: data.waitingCharge,
    calibrationFactor: data.marketAdjustment,
    finalFare: data.totalLkr,
  });

  return data;
}
