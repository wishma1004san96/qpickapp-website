import { NextResponse } from "next/server";
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

/**
 * Admin pricing catalog.
 * GET  /api/admin/pricing — full editable catalog
 * PUT  /api/admin/pricing — merge updates (baseFare, perKmRate, surge, …)
 * POST /api/admin/pricing { "action": "reset" } — restore defaults
 *
 * Secure this route with auth before production use.
 */

export async function GET() {
  return NextResponse.json({
    vehicles: getFarePricingCatalog(),
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
    },
  });
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

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw =
    body &&
    typeof body === "object" &&
    "vehicles" in body &&
    (body as { vehicles: unknown }).vehicles &&
    typeof (body as { vehicles: unknown }).vehicles === "object"
      ? ((body as { vehicles: Partial<Record<TaxiVehicleId, VehiclePatch>> })
          .vehicles)
      : (body as Partial<Record<TaxiVehicleId, VehiclePatch>>);

  if (!raw || typeof raw !== "object") {
    return NextResponse.json(
      { error: "Expected { vehicles: { … } } patch object." },
      { status: 400 },
    );
  }

  for (const key of Object.keys(raw)) {
    if (!(TAXI_VEHICLE_IDS as readonly string[]).includes(key)) {
      return NextResponse.json(
        { error: `Unknown vehicle id: ${key}` },
        { status: 400 },
      );
    }
  }

  const updated = updateFarePricingCatalog(raw);
  return NextResponse.json({ vehicles: updated });
}

export async function POST(request: Request) {
  let body: { action?: string } = {};
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    // require JSON
  }

  if (body.action === "reset") {
    return NextResponse.json({ vehicles: resetFarePricingCatalog() });
  }

  return NextResponse.json(
    { error: 'Unsupported action. Use { "action": "reset" }.' },
    { status: 400 },
  );
}
