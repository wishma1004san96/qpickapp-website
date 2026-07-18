import { enrichRouteOptions } from "@/lib/osm/route-options";
import {
  formatDistanceKm,
  formatDuration,
  type DrivingRouteEstimate,
} from "@/lib/osm/types";

export type LatLng = {
  lat: number;
  lng: number;
};

export type OpenRouteErrorCode = "missing_key" | "request_failed";

export class OpenRouteServiceError extends Error {
  readonly code: OpenRouteErrorCode;

  constructor(code: OpenRouteErrorCode, message: string) {
    super(message);
    this.name = "OpenRouteServiceError";
    this.code = code;
  }
}

/** ORS waytype value 1 = State Road (treated as highway for labeling). */
const ORS_WAYTYPE_STATE_ROAD = 1;

type OrsWaytypeSummary = {
  value?: number;
  distance?: number;
  amount?: number;
};

type OrsGeoJsonFeature = {
  geometry?: { coordinates?: number[][] };
  properties?: {
    summary?: { distance?: number; duration?: number };
    extras?: {
      waytypes?: {
        summary?: OrsWaytypeSummary[];
      };
    };
  };
};

type OrsGeoJson = {
  error?: { code?: number; message?: string };
  features?: OrsGeoJsonFeature[];
};

const DIRECTIONS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

const ALTERNATIVE_ROUTES = {
  target_count: 3,
  weight_factor: 1.6,
  share_factor: 0.7,
} as const;

let loggedKeyStatus = false;

function readKeyFromEnvLocalFile(): string | null {
  // Server-only fallback when process.env is empty after Hot Reload.
  if (typeof window !== "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path") as typeof import("node:path");
    const filePath = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(filePath)) return null;
    const text = fs.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(
        /^(?:NEXT_PUBLIC_)?OPENROUTESERVICE_API_KEY\s*=\s*(.*)$/,
      );
      if (!match) continue;
      let value = match[1]?.trim() ?? "";
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (value.length > 0) return value;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Read API key from env on every call (never hardcode).
 * Prefers NEXT_PUBLIC_OPENROUTESERVICE_API_KEY, then OPENROUTESERVICE_API_KEY,
 * then a direct .env.local file read on the server.
 */
export function getOpenRouteServiceApiKey(): string | null {
  const fromPublic = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY?.trim();
  const fromServer = process.env.OPENROUTESERVICE_API_KEY?.trim();
  const fromFile = readKeyFromEnvLocalFile();
  const key = fromPublic || fromServer || fromFile || "";

  if (process.env.NODE_ENV === "development" && !loggedKeyStatus) {
    loggedKeyStatus = true;
    console.info("[OpenRouteService] API key present:", key.length > 0, {
      nextPublic: Boolean(fromPublic),
      serverEnv: Boolean(fromServer),
      envLocalFile: Boolean(fromFile),
      length: key.length || 0,
    });
  }

  return key.length > 0 ? key : null;
}

export function hasOpenRouteServiceApiKey(): boolean {
  return Boolean(getOpenRouteServiceApiKey());
}

function parseFeature(feature: OrsGeoJsonFeature): {
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  distanceText: string;
  coordinates: [number, number][];
  highwayShare: number;
} | null {
  const meters = feature.properties?.summary?.distance;
  const seconds = feature.properties?.summary?.duration;
  const line = feature.geometry?.coordinates;

  if (
    typeof meters !== "number" ||
    typeof seconds !== "number" ||
    !Array.isArray(line) ||
    line.length === 0
  ) {
    return null;
  }

  const distanceKm = Math.round((meters / 1000) * 100) / 100;
  const coordinates: [number, number][] = [];
  for (const pair of line) {
    const lng = pair[0];
    const lat = pair[1];
    if (typeof lat === "number" && typeof lng === "number") {
      coordinates.push([lat, lng]);
    }
  }

  if (coordinates.length === 0) return null;

  return {
    distanceKm,
    durationSeconds: Math.round(seconds),
    durationText: formatDuration(seconds),
    distanceText: formatDistanceKm(distanceKm),
    coordinates,
    highwayShare: estimateHighwayShare(
      feature.properties?.extras?.waytypes?.summary,
      meters,
    ),
  };
}

function estimateHighwayShare(
  summary: OrsWaytypeSummary[] | undefined,
  totalMeters: number,
): number {
  if (!summary?.length || !(totalMeters > 0)) return 0;
  let highwayMeters = 0;
  for (const row of summary) {
    if (row.value === ORS_WAYTYPE_STATE_ROAD && typeof row.distance === "number") {
      highwayMeters += row.distance;
    }
  }
  return Math.min(1, Math.max(0, highwayMeters / totalMeters));
}

/**
 * OpenRouteService client — key resolved lazily so Next.js env is always current.
 */
export class OpenRouteServiceClient {
  isConfigured(): boolean {
    return hasOpenRouteServiceApiKey();
  }

  /**
   * Fetch a single driving route (primary / fastest when alternatives exist).
   */
  async getDrivingRoute(
    origin: LatLng,
    destination: LatLng,
    signal?: AbortSignal,
  ): Promise<DrivingRouteEstimate> {
    const routes = await this.getDrivingRoutes(origin, destination, signal);
    const primary = routes[0];
    if (!primary) {
      throw new OpenRouteServiceError(
        "request_failed",
        "Unable to calculate the route. Please try again.",
      );
    }
    return primary;
  }

  /**
   * Fetch up to 3 driving routes (recommended + alternatives).
   * Falls back to a single route when alternatives are unavailable
   * (e.g. ORS public API limit ≈ 100 km).
   */
  async getDrivingRoutes(
    origin: LatLng,
    destination: LatLng,
    signal?: AbortSignal,
  ): Promise<DrivingRouteEstimate[]> {
    this.assertCoords(origin, destination);

    try {
      const withAlts = await this.fetchDirections(origin, destination, true, signal);
      if (withAlts.length > 0) return withAlts;
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error instanceof Error && error.name === "AbortError") throw error;
      // Fall through to single-route retry (common when distance > 100 km)
      if (process.env.NODE_ENV === "development") {
        console.info(
          "[OpenRouteService] Alternatives unavailable, retrying single route",
          error instanceof Error ? error.message : error,
        );
      }
    }

    return this.fetchDirections(origin, destination, false, signal);
  }

  private assertCoords(origin: LatLng, destination: LatLng) {
    if (
      !Number.isFinite(origin.lat) ||
      !Number.isFinite(origin.lng) ||
      !Number.isFinite(destination.lat) ||
      !Number.isFinite(destination.lng)
    ) {
      throw new OpenRouteServiceError(
        "request_failed",
        "Unable to calculate the route. Please try again.",
      );
    }
  }

  private async fetchDirections(
    origin: LatLng,
    destination: LatLng,
    includeAlternatives: boolean,
    signal?: AbortSignal,
  ): Promise<DrivingRouteEstimate[]> {
    const apiKey = getOpenRouteServiceApiKey();
    if (!apiKey) {
      throw new OpenRouteServiceError(
        "missing_key",
        "OpenRouteService API Key is missing.",
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.info(
        "[OpenRouteService] Directions request Authorization header: present",
        { alternatives: includeAlternatives },
      );
    }

    const body: Record<string, unknown> = {
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
      // Snap to nearest road within 2km (parks / landmarks often sit off-network)
      radiuses: [2000, 2000],
      instructions: false,
      extra_info: ["waytype"],
    };

    if (includeAlternatives) {
      body.alternative_routes = ALTERNATIVE_ROUTES;
    }

    let response: Response;
    try {
      response = await fetch(DIRECTIONS_URL, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept:
            "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error instanceof Error && error.name === "AbortError") throw error;
      throw new OpenRouteServiceError(
        "request_failed",
        "Unable to calculate the route. Please try again.",
      );
    }

    let json: OrsGeoJson;
    try {
      json = (await response.json()) as OrsGeoJson;
    } catch {
      throw new OpenRouteServiceError(
        "request_failed",
        "Unable to calculate the route. Please try again.",
      );
    }

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[OpenRouteService] Directions failed:",
          response.status,
          json.error?.message ?? "(no message)",
        );
      }
      throw new OpenRouteServiceError(
        "request_failed",
        "Unable to calculate the route. Please try again.",
      );
    }

    const parsed = (json.features ?? [])
      .map(parseFeature)
      .filter((f): f is NonNullable<typeof f> => f != null);

    if (parsed.length === 0) {
      throw new OpenRouteServiceError(
        "request_failed",
        "Unable to calculate the route. Please try again.",
      );
    }

    return enrichRouteOptions(parsed);
  }
}

/** Shared client — key is read from env when used, not frozen at import time. */
export const openRouteService = new OpenRouteServiceClient();
