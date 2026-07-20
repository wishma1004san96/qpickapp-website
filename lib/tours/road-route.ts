import {
  formatDistanceKm,
  formatDuration,
} from "@/lib/osm/types";

export type TourRouteWaypoint = {
  id: string;
  lat: number;
  lng: number;
};

export type TourRoadLeg = {
  fromId: string;
  toId: string;
  coordinates: [number, number][];
  distanceKm: number;
  durationSeconds: number;
};

export type TourRoadRoute = {
  provider: "ors" | "osrm";
  legs: TourRoadLeg[];
  /** Full stitched road geometry (Leaflet [lat, lng]) */
  coordinates: [number, number][];
  distanceKm: number;
  durationSeconds: number;
  distanceText: string;
  durationText: string;
};

export function emptyTourRoadRoute(): TourRoadRoute {
  return {
    provider: "osrm",
    legs: [],
    coordinates: [],
    distanceKm: 0,
    durationSeconds: 0,
    distanceText: formatDistanceKm(0),
    durationText: formatDuration(0),
  };
}

export function summarizeLegs(legs: TourRoadLeg[], provider: "ors" | "osrm"): TourRoadRoute {
  const coordinates: [number, number][] = [];
  let distanceKm = 0;
  let durationSeconds = 0;

  for (const leg of legs) {
    distanceKm += leg.distanceKm;
    durationSeconds += leg.durationSeconds;
    if (leg.coordinates.length === 0) continue;
    if (coordinates.length === 0) {
      coordinates.push(...leg.coordinates);
    } else {
      // Avoid duplicating shared endpoint between legs
      coordinates.push(...leg.coordinates.slice(1));
    }
  }

  return {
    provider,
    legs,
    coordinates,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationSeconds,
    distanceText: formatDistanceKm(distanceKm),
    durationText: formatDuration(durationSeconds),
  };
}

/** Google Maps multi-stop directions from ordered tour stops. */
export function getTourGoogleMapsUrl(
  stops: { lat: number; lng: number }[],
): string {
  if (stops.length === 0) return "https://maps.google.com/?q=Sri+Lanka";
  // Skip consecutive duplicates (airport bookends)
  const unique: { lat: number; lng: number }[] = [];
  for (const s of stops) {
    const prev = unique[unique.length - 1];
    if (
      prev &&
      Math.abs(prev.lat - s.lat) < 1e-5 &&
      Math.abs(prev.lng - s.lng) < 1e-5
    ) {
      continue;
    }
    unique.push(s);
  }
  const path = unique.map((s) => `${s.lat},${s.lng}`).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}
