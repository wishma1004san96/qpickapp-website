import { NextResponse } from "next/server";
import {
  getFareCalibration,
  resetFareCalibration,
  updateFareCalibration,
} from "@/lib/fare/calibration";
import {
  getFarePricingCatalog,
  resetFarePricingCatalog,
  updateFarePricingCatalog,
} from "@/lib/fare/pricing-settings";
import {
  DYNAMIC_PRICING_VEHICLE_IDS,
  TAXI_VEHICLE_IDS,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-vehicles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Admin pricing catalog + market calibration.
 * Single source of truth: data/fare-pricing.json
 * GET  /api/admin/pricing — vehicles + calibration
 * PUT  /api/admin/pricing — merge vehicle and/or calibration updates (persisted)
 * POST /api/admin/pricing { "action": "reset" } — restore seed defaults
 *
 * Secure this route with auth before production use.
 */

export async function GET() {
  return NextResponse.json(
    {
      vehicles: getFarePricingCatalog(),
      calibration: getFareCalibration(),
      source: "data/fare-pricing.json",
      dynamicVehicleIds: [...DYNAMIC_PRICING_VEHICLE_IDS],
      fields: {
        all: ["baseFare", "perKmRate"],
        dynamicOnly: [
          "waitingPerMinute",
          "freeWaitingMinutes",
          "surgeEnabled",
          "surgeMultipliers.peak",
          "surgeMultipliers.rain",
          "surgeMultipliers.highDemand",
        ],
        calibration: ["marketAdjustment"],
      },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

type VehiclePatch = {
  baseFare?: number;
  perKmRate?: number;
  waitingPerMinute?: number;
  freeWaitingMinutes?: number;
  surgeEnabled?: boolean;
  surgeMultipliers?: {
    peak?: number;
    rain?: number;
    highDemand?: number;
  };
};

type PricingPutBody = {
  vehicles?: Partial<Record<TaxiVehicleId, VehiclePatch>>;
  calibration?: { marketAdjustment?: number };
};

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Expected JSON object with vehicles and/or calibration." },
      { status: 400 },
    );
  }

  const payload = body as PricingPutBody &
    Partial<Record<TaxiVehicleId, VehiclePatch>>;

  const hasVehiclesKey = "vehicles" in payload;
  const hasCalibrationKey = "calibration" in payload;

  // Backward compatible: bare vehicle map still accepted
  const vehiclePatch: Partial<Record<TaxiVehicleId, VehiclePatch>> | null =
    hasVehiclesKey
      ? payload.vehicles && typeof payload.vehicles === "object"
        ? payload.vehicles
        : null
      : !hasCalibrationKey
        ? (payload as Partial<Record<TaxiVehicleId, VehiclePatch>>)
        : null;

  if (hasVehiclesKey && vehiclePatch == null) {
    return NextResponse.json(
      { error: "Expected { vehicles: { … } } patch object." },
      { status: 400 },
    );
  }

  if (vehiclePatch) {
    for (const key of Object.keys(vehiclePatch)) {
      if (!(TAXI_VEHICLE_IDS as readonly string[]).includes(key)) {
        return NextResponse.json(
          { error: `Unknown vehicle id: ${key}` },
          { status: 400 },
        );
      }
    }
    updateFarePricingCatalog(vehiclePatch);
  }

  if (hasCalibrationKey && payload.calibration) {
    updateFareCalibration(payload.calibration);
  }

  return NextResponse.json(
    {
      vehicles: getFarePricingCatalog(),
      calibration: getFareCalibration(),
      source: "data/fare-pricing.json",
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(request: Request) {
  let body: { action?: string } = {};
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    // require JSON
  }

  if (body.action === "reset") {
    return NextResponse.json({
      vehicles: resetFarePricingCatalog(),
      calibration: resetFareCalibration(),
    });
  }

  return NextResponse.json(
    { error: 'Unsupported action. Use { "action": "reset" }.' },
    { status: 400 },
  );
}
