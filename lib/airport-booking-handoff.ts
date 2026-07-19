/**
 * Airport transfer → Ride booking handoff.
 * Stores form selections in sessionStorage; Ride estimator consumes once.
 * Does not alter fare calculation — official rate is informational context only.
 */

import type { SelectedPlace } from "@/lib/osm/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

export const AIRPORT_BOOKING_HANDOFF_KEY = "qpick:airport-booking-handoff:v1";

export type AirportHandoffLuggage = "cabin" | "medium" | "large";
export type AirportHandoffVehicle = "mini" | "sedan" | "van" | "suv";

export type AirportBookingHandoff = {
  v: 1;
  pickup: string;
  destination: string;
  destinationCode: string;
  date: string;
  time: string;
  passengers: number;
  luggage: AirportHandoffLuggage;
  vehicle: AirportHandoffVehicle;
  officialFareLkr: number;
  nationality: string;
  specialRequest: string;
  createdAt: number;
};

/** Bandaranaike International Airport (CMB) — fixed pickup for airport transfers. */
export const CMB_AIRPORT_PLACE: SelectedPlace = {
  label: "Bandaranaike International Airport (CMB)",
  displayName:
    "Bandaranaike International Airport, Canada Friendship Road, Katunayake, Negombo, Gampaha District, Western Province, 11450, Sri Lanka",
  lat: 7.180756,
  lng: 79.884117,
  name: "Bandaranaike International Airport",
  city: "Katunayake",
  district: "Gampaha District",
};

export function mapAirportVehicleToTaxiId(
  vehicle: AirportHandoffVehicle,
): TaxiVehicleId {
  switch (vehicle) {
    case "mini":
      return "miniCar";
    case "sedan":
      return "sedan";
    case "van":
      return "miniVan";
    case "suv":
      return "suv";
    default:
      return "sedan";
  }
}

export function mapAirportLuggageToCount(luggage: AirportHandoffLuggage): number {
  switch (luggage) {
    case "cabin":
      return 1;
    case "medium":
      return 2;
    case "large":
      return 3;
    default:
      return 1;
  }
}

export function saveAirportBookingHandoff(
  payload: Omit<AirportBookingHandoff, "v" | "createdAt">,
): void {
  if (typeof window === "undefined") return;
  const full: AirportBookingHandoff = {
    ...payload,
    v: 1,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(AIRPORT_BOOKING_HANDOFF_KEY, JSON.stringify(full));
}

/** Read and clear handoff (one-time consume). */
export function consumeAirportBookingHandoff(): AirportBookingHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AIRPORT_BOOKING_HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(AIRPORT_BOOKING_HANDOFF_KEY);
    const parsed = JSON.parse(raw) as AirportBookingHandoff;
    if (parsed?.v !== 1 || !parsed.destination) return null;
    // Expire after 30 minutes
    if (Date.now() - parsed.createdAt > 30 * 60 * 1000) return null;
    return parsed;
  } catch {
    sessionStorage.removeItem(AIRPORT_BOOKING_HANDOFF_KEY);
    return null;
  }
}

export async function geocodeDestinationPlace(
  destination: string,
): Promise<SelectedPlace | null> {
  const q = `${destination}, Sri Lanka`;
  try {
    const res = await fetch(`/api/ride/geocode?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{
        label: string;
        displayName: string;
        lat: number;
        lng: number;
        osmId?: string;
        name?: string;
        road?: string;
        suburb?: string;
        city?: string;
        district?: string;
      }>;
    };
    const first = data.results?.[0];
    if (!first) return null;
    return {
      label: first.label,
      displayName: first.displayName,
      lat: first.lat,
      lng: first.lng,
      osmId: first.osmId,
      name: first.name,
      road: first.road,
      suburb: first.suburb,
      city: first.city,
      district: first.district,
    };
  } catch {
    return null;
  }
}
