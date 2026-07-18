import { NextResponse } from "next/server";
import {
  formatReverseGeocode,
  type NominatimSearchItem,
} from "@/lib/osm/nominatim";

export const runtime = "nodejs";

const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "QPickWebsite/1.0 (contact@quickpickapp.com)";

/**
 * Reverse geocode map-center coordinates (Uber / PickMe style).
 * GET /api/ride/reverse?lat=6.834&lon=79.923
 *
 * Returns the formatted address for the pin position.
 * lat/lng in the response are always the requested pin coordinates.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number.parseFloat(searchParams.get("lat") ?? "");
  const lon = Number.parseFloat(searchParams.get("lon") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Valid lat and lon are required." },
      { status: 400 },
    );
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "Coordinates out of range." },
      { status: 400 },
    );
  }

  const url = new URL(NOMINATIM_REVERSE);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Reverse geocoding failed." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as NominatimSearchItem & {
      error?: string;
    };

    if (data.error || !data.display_name) {
      return NextResponse.json({
        label: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        displayName: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        primary: "Selected location",
        secondary: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        lat,
        lng: lon,
      });
    }

    const place = formatReverseGeocode(data, { lat, lng: lon });

    return NextResponse.json({
      label: place.label,
      displayName: place.displayName,
      primary: place.primary,
      secondary: place.secondary,
      lat: place.lat,
      lng: place.lng,
      osmId: place.osmId,
      name: place.name,
      road: place.road,
      suburb: place.suburb,
      city: place.city,
      district: place.district,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reverse geocode location." },
      { status: 502 },
    );
  }
}
