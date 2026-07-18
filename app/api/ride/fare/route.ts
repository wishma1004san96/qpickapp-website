import { NextResponse } from "next/server";
import { getVehiclePricing } from "@/lib/fare/pricing-settings";
import { getFareCalibration } from "@/lib/fare/calibration";
import { calculateTaxiFare } from "@/lib/taxi-fare";
import type { SurgeCondition } from "@/lib/fare/types";
import { TAXI_VEHICLE_IDS, type TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export const runtime = "nodejs";
/** Never cache fare responses — pricing/calibration must be live. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

type FareBody = {
  vehicleId?: string;
  distanceKm?: number;
  waitingMinutes?: number;
  tollCharges?: number;
  parkingCharges?: number;
  conditions?: SurgeCondition[];
  surgeMultiplierOverride?: number;
};

/**
 * POST /api/ride/fare
 * Server-side fare calculation using the live pricing catalog + calibration.
 * Body: { vehicleId, distanceKm, waitingMinutes?, tollCharges?, parkingCharges?, conditions? }
 */
export async function POST(request: Request) {
  let body: FareBody;
  try {
    body = (await request.json()) as FareBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const vehicleId = body.vehicleId;
  if (
    !vehicleId ||
    !(TAXI_VEHICLE_IDS as readonly string[]).includes(vehicleId)
  ) {
    return NextResponse.json(
      { error: "Valid vehicleId is required." },
      { status: 400 },
    );
  }

  if (
    typeof body.distanceKm !== "number" ||
    !Number.isFinite(body.distanceKm) ||
    body.distanceKm < 0
  ) {
    return NextResponse.json(
      { error: "Valid distanceKm is required." },
      { status: 400 },
    );
  }

  const id = vehicleId as TaxiVehicleId;
  const settings = getVehiclePricing(id);
  const calibration = getFareCalibration();

  const breakdown = calculateTaxiFare({
    vehicleId: id,
    distanceKm: body.distanceKm,
    waitingMinutes: body.waitingMinutes ?? 0,
    tollCharges: body.tollCharges,
    parkingCharges: body.parkingCharges,
    conditions: body.conditions,
    surgeMultiplierOverride: body.surgeMultiplierOverride,
  });

  // Temporary debug — remove after pricing updates are verified live
  console.info("[Ride fare debug]", {
    selectedVehicle: id,
    pricingMode: settings.mode,
    baseFare: settings.baseFare,
    perKmRate: settings.perKmRate,
    waitingPerMinute:
      settings.mode === "dynamic" ? settings.waitingPerMinute : 0,
    distanceKm: body.distanceKm,
    waitingMinutes: body.waitingMinutes ?? 0,
    waitingCharge: breakdown.waitingCharge,
    calibrationFactor: calibration.marketAdjustment,
    totalBeforeCalibration:
      "totalBeforeCalibration" in breakdown
        ? (breakdown as { totalBeforeCalibration?: number }).totalBeforeCalibration
        : undefined,
    finalFare: breakdown.totalLkr,
  });

  return NextResponse.json(
    {
      ...breakdown,
      marketAdjustment: calibration.marketAdjustment,
      baseFare: settings.baseFare,
      perKmRate: settings.perKmRate,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
