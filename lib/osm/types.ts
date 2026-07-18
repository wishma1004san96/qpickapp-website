/** Shared place / route types for OpenStreetMap ride booking. */

export type SelectedPlace = {
  /** Compact UI label (place, city, district, country) */
  label: string;
  /** Exact Nominatim display_name — never re-geocode from city alone */
  displayName: string;
  /** Exact coordinates from the selected Nominatim result */
  lat: number;
  lng: number;
  osmId?: string;
  name?: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
};

export type PlaceSuggestion = SelectedPlace & {
  id: string;
  primary: string;
  secondary: string;
  category?: string;
  type?: string;
  addressType?: string;
};

/** Highway vs normal road classification when extras are available */
export type RouteRoadType = "highway" | "normal";

export type DrivingRouteEstimate = {
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  distanceText: string;
  /** Leaflet [lat, lng] positions along the driving route */
  coordinates: [number, number][];
  /** Stable id when returned as part of an alternatives set */
  id?: string;
  /** True for the fastest / default-selected route */
  isRecommended?: boolean;
  roadType?: RouteRoadType;
  /**
   * Display tag key — resolve via i18n (`taxiFare.routes.tags.*`).
   * fastest | avoidHighway | highway | scenic | alternative
   */
  tagKey?: string;
  /** 0–1 share of distance on highway / state road (ORS waytype) */
  highwayShare?: number;
};

/** Multi-route directions response from `/api/ride/directions`. */
export type DrivingRoutesResponse = {
  routes: DrivingRouteEstimate[];
  /** Flattened primary route fields (routes[0]) for older clients */
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  distanceText: string;
  coordinates: [number, number][];
};

export function formatDuration(totalSeconds: number): string {
  const mins = Math.max(1, Math.round(totalSeconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function formatDistanceKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
