/**
 * Browser geolocation helpers for Ride pickup selection.
 */

import type { SelectedPlace } from "@/lib/osm/types";

export type GeolocationErrorCode =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "failed";

export class GeolocationRequestError extends Error {
  readonly code: GeolocationErrorCode;

  constructor(code: GeolocationErrorCode, message: string) {
    super(message);
    this.name = "GeolocationRequestError";
    this.code = code;
  }
}

export function getCurrentCoordinates(
  options?: PositionOptions,
): Promise<{ lat: number; lng: number }> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.reject(
      new GeolocationRequestError(
        "unsupported",
        "Location services are not available on this device.",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new GeolocationRequestError(
              "denied",
              "Location permission was denied.",
            ),
          );
          return;
        }
        if (err.code === err.POSITION_UNAVAILABLE) {
          reject(
            new GeolocationRequestError(
              "unavailable",
              "Unable to determine your current location.",
            ),
          );
          return;
        }
        if (err.code === err.TIMEOUT) {
          reject(
            new GeolocationRequestError(
              "timeout",
              "Location request timed out. Please try again.",
            ),
          );
          return;
        }
        reject(
          new GeolocationRequestError(
            "failed",
            "Unable to determine your current location.",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 30_000,
        ...options,
      },
    );
  });
}

type ReversePayload = {
  label?: string;
  displayName?: string;
  lat?: number;
  lng?: number;
  osmId?: string;
  name?: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
  error?: string;
};

/**
 * Resolve device GPS to a SelectedPlace via the ride reverse API.
 */
export async function resolveCurrentLocation(
  signal?: AbortSignal,
): Promise<SelectedPlace> {
  const { lat, lng } = await getCurrentCoordinates();

  const res = await fetch(
    `/api/ride/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`,
    { signal },
  );
  const data = (await res.json()) as ReversePayload;

  if (!res.ok) {
    // Still usable — pin coords with coordinate label
    return {
      label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
    };
  }

  return {
    label: data.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    displayName:
      data.displayName || data.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lat,
    lng,
    osmId: data.osmId,
    name: data.name,
    road: data.road,
    suburb: data.suburb,
    city: data.city,
    district: data.district,
  };
}
