import { NextResponse } from "next/server";
import { calculateFare, fareEngine } from "@/lib/fare/fare-engine";
import type { SurgeCondition } from "@/lib/fare/types";
import { TAXI_VEHICLE_IDS, type TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export const runtime = "nodejs";

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

  const breakdown = calculateFare({
    vehicleId: vehicleId as TaxiVehicleId,
    distanceKm: body.distanceKm,
    waitingMinutes: body.waitingMinutes,
    tollCharges: body.tollCharges,
    parkingCharges: body.parkingCharges,
    conditions: body.conditions,
    surgeMultiplierOverride: body.surgeMultiplierOverride,
  });

  return NextResponse.json({
    ...breakdown,
    pricingMode: fareEngine.getPricingMode(vehicleId as TaxiVehicleId),
  });
}
