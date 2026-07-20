import { NextResponse } from "next/server";
import type { TourRouteWaypoint } from "@/lib/tours/road-route";
import { buildTourRoadRoute } from "@/services/tourRoadRoute";

export const runtime = "nodejs";

type TourRouteBody = {
  waypoints?: TourRouteWaypoint[];
};

/**
 * Multi-leg tour driving route along Sri Lankan roads.
 * Uses OpenRouteService when keyed; otherwise OSRM public routing.
 * Never returns straight-line polylines between stops.
 */
export async function POST(request: Request) {
  let body: TourRouteBody;
  try {
    body = (await request.json()) as TourRouteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const waypoints = body.waypoints;
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return NextResponse.json(
      { error: "At least two waypoints are required." },
      { status: 400 },
    );
  }

  for (const w of waypoints) {
    if (
      !w ||
      typeof w.id !== "string" ||
      !Number.isFinite(w.lat) ||
      !Number.isFinite(w.lng)
    ) {
      return NextResponse.json(
        { error: "Each waypoint needs id, lat, and lng." },
        { status: 400 },
      );
    }
  }

  try {
    const route = await buildTourRoadRoute(waypoints);
    if (route.legs.length === 0 || route.coordinates.length < 2) {
      return NextResponse.json(
        { error: "Unable to calculate the tour route." },
        { status: 422 },
      );
    }
    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request aborted." }, { status: 499 });
    }
    console.error("[tour-route]", error);
    return NextResponse.json(
      { error: "Unable to calculate the tour route. Please try again." },
      { status: 502 },
    );
  }
}
