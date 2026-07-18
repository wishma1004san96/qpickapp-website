/**
 * Client helper — always calculate fares on the server so live catalog
 * updates apply immediately (no stale client bundle rates).
 */

import type {
  SurgeCondition,
  TaxiFareBreakdown,
  TaxiVehicleId,
} from "@/lib/taxi-fare-ui";

export type FetchRideFareInput = {
  vehicleId: TaxiVehicleId;
  distanceKm: number;
  waitingMinutes?: number;
  tollCharges?: number;
  parkingCharges?: number;
  airportPickup?: boolean;
  at?: string;
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
      airportPickup: input.airportPickup === true,
      at: input.at,
      conditions: input.conditions,
      surgeMultiplierOverride: input.surgeMultiplierOverride,
    }),
  });

  const data = (await res.json()) as TaxiFareBreakdown & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Unable to calculate fare.");
  }

  console.info(
    [
      `Vehicle: ${data.vehicleId}`,
      `Period: ${data.timeOfDay ?? "—"}`,
      `Base Fare: ${data.baseFare ?? data.firstKmFare}`,
      `Per KM: ${data.perKmRate ?? data.additionalKmRate}`,
      `Distance Charge: ${data.distanceCharge ?? data.additionalKmFare}`,
      `Waiting: ${data.waitingCharge}`,
      `Discount: ${data.longDistanceDiscount ?? 0}`,
      `Final Fare: ${data.totalLkr}`,
    ].join("\n"),
  );

  return data;
}
