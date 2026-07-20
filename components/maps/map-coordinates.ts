/** Shared lat/lng guards for Leaflet / map UI — SSR-safe, no Leaflet imports. */

export type LatLngLiteral = { lat: number; lng: number };

/** Bandaranaike International Airport (CMB) — default airport-transfer map center. */
export const CMB_MAP_CENTER: LatLngLiteral = {
  lat: 7.1808,
  lng: 79.8841,
};

/** @deprecated Prefer CMB_MAP_CENTER — kept for task/docs naming */
export const DEFAULT_CENTER = CMB_MAP_CENTER;

/** Leaflet tuple form of CMB center. */
export const CMB_MAP_CENTER_TUPLE: [number, number] = [
  CMB_MAP_CENTER.lat,
  CMB_MAP_CENTER.lng,
];

export function isValidCoordinate(
  lat?: number | null,
  lng?: number | null,
): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function isValidLatLng(
  point: { lat?: number | null; lng?: number | null } | null | undefined,
): point is LatLngLiteral {
  return Boolean(point && isValidCoordinate(point.lat, point.lng));
}

/** Leaflet positions are [lat, lng]. */
export function isValidLatLngTuple(
  point: unknown,
): point is [number, number] {
  return (
    Array.isArray(point) &&
    point.length >= 2 &&
    isValidCoordinate(point[0], point[1])
  );
}

export function filterValidLatLngTuples(
  points: readonly (readonly number[])[] | null | undefined,
): [number, number][] {
  if (!points?.length) return [];
  const out: [number, number][] = [];
  for (const point of points) {
    if (isValidLatLngTuple(point)) {
      out.push([point[0], point[1]]);
    }
  }
  return out;
}

export function toLatLngTuple(
  place: { lat: number; lng: number } | null | undefined,
): [number, number] | null {
  if (!isValidLatLng(place)) return null;
  return [place.lat, place.lng];
}
