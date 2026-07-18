import { NextResponse } from "next/server";
import {
  looksLikeRoadOrAddressQuery,
  rankNominatimResults,
  type NominatimSearchItem,
} from "@/lib/osm/nominatim";
import type { PlaceSuggestion } from "@/lib/osm/types";

export const runtime = "nodejs";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "QPickWebsite/1.0 (contact@quickpickapp.com)";

function toSuggestion(
  place: ReturnType<typeof rankNominatimResults>[number],
): PlaceSuggestion {
  return {
    id: place.id,
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
    category: place.category,
    type: place.type,
    addressType: place.addressType,
  };
}

function isAdminOnly(items: NominatimSearchItem[]): boolean {
  if (items.length === 0) return true;
  return items.every((item) => {
    const category = (item.category || item.class || "").toLowerCase();
    const addressType = (item.addresstype || item.type || "").toLowerCase();
    return (
      category === "place" ||
      category === "boundary" ||
      addressType === "city" ||
      addressType === "town" ||
      addressType === "village" ||
      addressType === "state" ||
      addressType === "state_district" ||
      addressType === "county" ||
      addressType === "municipality"
    );
  });
}

async function nominatimSearch(
  params: Record<string, string>,
): Promise<NominatimSearchItem[]> {
  const url = new URL(NOMINATIM_SEARCH);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Nominatim HTTP ${res.status}`);
  }

  return (await res.json()) as NominatimSearchItem[];
}

/**
 * Nominatim search proxy (Sri Lanka) for Ride pickup / destination autocomplete.
 * GET /api/ride/geocode?q=Thappawatta%20Road
 *
 * Returns each hit's own lat/lon — never substitutes city-center coordinates.
 * Does not auto-select a result; the client shows all matches in the dropdown.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] as PlaceSuggestion[] });
  }

  const baseParams = {
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    countrycodes: "lk",
    dedupe: "1",
  };

  try {
    let raw = await nominatimSearch(baseParams);

    // If a road/address query only returned city/district centers, retry on the
    // address layer so the exact road/building can surface.
    if (looksLikeRoadOrAddressQuery(q) && isAdminOnly(raw)) {
      try {
        const addressHits = await nominatimSearch({
          ...baseParams,
          layer: "address",
        });
        if (addressHits.length > 0) {
          raw = addressHits;
        }
      } catch {
        // Keep primary results.
      }
    }

    const results = rankNominatimResults(raw, q).map(toSuggestion);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach location search." },
      { status: 502 },
    );
  }
}
