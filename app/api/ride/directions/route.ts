import { NextResponse } from "next/server";
import type { DrivingRoutesResponse } from "@/lib/osm/types";
import {
  OpenRouteServiceError,
  getOpenRouteServiceApiKey,
  openRouteService,
} from "@/services/openRouteService";

export const runtime = "nodejs";

type DirectionsBody = {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
};

/**
 * Ride directions proxy — returns up to 3 routes (recommended + alternatives).
 * Reads NEXT_PUBLIC_OPENROUTESERVICE_API_KEY at request time.
 */
export async function POST(request: Request) {
  const apiKey = getOpenRouteServiceApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouteService API Key is missing." },
      { status: 503 },
    );
  }

  let body: DirectionsBody;
  try {
    body = (await request.json()) as DirectionsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const origin = body.origin;
  const destination = body.destination;
  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Valid origin and destination coordinates are required." },
      { status: 400 },
    );
  }

  try {
    const routes = await openRouteService.getDrivingRoutes(origin, destination);
    const primary = routes[0];
    if (!primary) {
      return NextResponse.json(
        { error: "Unable to calculate the route. Please try again." },
        { status: 422 },
      );
    }

    const payload: DrivingRoutesResponse = {
      routes,
      distanceKm: primary.distanceKm,
      durationSeconds: primary.durationSeconds,
      durationText: primary.durationText,
      distanceText: primary.distanceText,
      coordinates: primary.coordinates,
    };

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof OpenRouteServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "missing_key" ? 503 : 422 },
      );
    }
    return NextResponse.json(
      { error: "Unable to calculate the route. Please try again." },
      { status: 502 },
    );
  }
}
