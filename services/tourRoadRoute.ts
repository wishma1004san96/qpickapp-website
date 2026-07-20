import { metersToKm } from "@/lib/fare/math";
import {
  summarizeLegs,
  type TourRoadLeg,
  type TourRoadRoute,
  type TourRouteWaypoint,
} from "@/lib/tours/road-route";
import {
  getOpenRouteServiceApiKey,
  openRouteService,
} from "@/services/openRouteService";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

type OsrmRouteResponse = {
  code?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: { coordinates?: number[][] };
  }>;
};

function nearlySame(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): boolean {
  return Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lng - b.lng) < 1e-5;
}

async function fetchOsrmLeg(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  signal?: AbortSignal,
): Promise<{ coordinates: [number, number][]; distanceKm: number; durationSeconds: number }> {
  const url = `${OSRM_BASE}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`OSRM request failed (${res.status})`);
  }
  const data = (await res.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];
  const line = route?.geometry?.coordinates;
  if (!route || !Array.isArray(line) || line.length === 0) {
    throw new Error("OSRM returned no geometry");
  }

  const coordinates: [number, number][] = [];
  for (const pair of line) {
    const lng = pair[0];
    const lat = pair[1];
    if (typeof lat === "number" && typeof lng === "number") {
      coordinates.push([lat, lng]);
    }
  }
  if (coordinates.length === 0) {
    throw new Error("OSRM returned empty coordinates");
  }

  const meters = typeof route.distance === "number" ? route.distance : 0;
  const seconds = typeof route.duration === "number" ? route.duration : 0;

  return {
    coordinates,
    distanceKm: metersToKm(meters),
    durationSeconds: Math.round(seconds),
  };
}

async function fetchOrsLeg(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  signal?: AbortSignal,
) {
  const route = await openRouteService.getDrivingRoute(origin, destination, signal);
  return {
    coordinates: route.coordinates,
    distanceKm: route.distanceKm,
    durationSeconds: route.durationSeconds,
  };
}

/**
 * Build a multi-leg road route through Sri Lanka following the real road network.
 * Prefers OpenRouteService when configured; falls back to public OSRM per leg.
 */
export async function buildTourRoadRoute(
  waypoints: TourRouteWaypoint[],
  signal?: AbortSignal,
): Promise<TourRoadRoute> {
  const cleaned = waypoints.filter(
    (w) => Number.isFinite(w.lat) && Number.isFinite(w.lng),
  );
  if (cleaned.length < 2) {
    return summarizeLegs([], "osrm");
  }

  const hasOrs = Boolean(getOpenRouteServiceApiKey());
  const legs: TourRoadLeg[] = [];
  let provider: "ors" | "osrm" = hasOrs ? "ors" : "osrm";

  for (let i = 0; i < cleaned.length - 1; i++) {
    const from = cleaned[i];
    const to = cleaned[i + 1];
    if (!from || !to) continue;
    if (nearlySame(from, to)) continue;

    let geometry: {
      coordinates: [number, number][];
      distanceKm: number;
      durationSeconds: number;
    };

    if (hasOrs) {
      try {
        geometry = await fetchOrsLeg(from, to, signal);
      } catch (error) {
        if (signal?.aborted) throw error;
        // Per-leg ORS failure → public OSRM (still real roads, never straight lines)
        geometry = await fetchOsrmLeg(from, to, signal);
        provider = "osrm";
      }
    } else {
      geometry = await fetchOsrmLeg(from, to, signal);
      provider = "osrm";
    }

    legs.push({
      fromId: from.id,
      toId: to.id,
      coordinates: geometry.coordinates,
      distanceKm: geometry.distanceKm,
      durationSeconds: geometry.durationSeconds,
    });
  }

  return summarizeLegs(legs, provider);
}
