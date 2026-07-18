/**
 * Nominatim result parsing, ranking, and Google-like label formatting.
 * Markers / routing must always use the selected result's lat/lon — never city centers.
 */

export type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  path?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  city_district?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  amenity?: string;
  building?: string;
  shop?: string;
  tourism?: string;
  office?: string;
  leisure?: string;
  [key: string]: string | undefined;
};

export type NominatimSearchItem = {
  place_id: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  category?: string;
  class?: string;
  type?: string;
  addresstype?: string;
  place_rank?: number;
  importance?: number;
  address?: NominatimAddress;
};

export type FormattedPlace = {
  id: string;
  /** Exact Nominatim display_name — store and never re-geocode from city alone */
  displayName: string;
  /** Compact Google-like label for input + summary */
  label: string;
  /** Primary line in dropdown (place / road name) */
  primary: string;
  /** Secondary line (suburb, city, district, country) */
  secondary: string;
  lat: number;
  lng: number;
  osmId?: string;
  category?: string;
  type?: string;
  addressType?: string;
  name?: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
};

const ADMIN_TYPES = new Set([
  "country",
  "state",
  "state_district",
  "county",
  "city",
  "town",
  "municipality",
  "province",
  "region",
  "district",
]);

const PRECISE_CATEGORIES = new Set([
  "highway",
  "building",
  "amenity",
  "shop",
  "tourism",
  "office",
  "leisure",
  "healthcare",
  "education",
  "railway",
  "aeroway",
  "historic",
  "craft",
]);

const ROAD_QUERY_RE =
  /\b(road|rd|street|st|lane|ln|avenue|ave|mwatha|mawatha|place|plaza|drive|dr|highway|hwy|bypass|junction|cross|watta|gama)\b/i;

function uniqueParts(parts: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const trimmed = part?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function placeName(item: NominatimSearchItem): string {
  const address = item.address ?? {};
  return (
    item.name?.trim() ||
    address.amenity ||
    address.building ||
    address.shop ||
    address.tourism ||
    address.office ||
    address.leisure ||
    address.road ||
    address.pedestrian ||
    address.path ||
    ""
  );
}

function roadName(item: NominatimSearchItem): string | undefined {
  const address = item.address ?? {};
  return address.road || address.pedestrian || address.path || undefined;
}

function suburbName(item: NominatimSearchItem): string | undefined {
  const address = item.address ?? {};
  return (
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.hamlet ||
    undefined
  );
}

function cityName(item: NominatimSearchItem): string | undefined {
  const address = item.address ?? {};
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    undefined
  );
}

function districtName(item: NominatimSearchItem): string | undefined {
  const address = item.address ?? {};
  return address.state_district || address.county || address.city_district || undefined;
}

/**
 * Compact label: Place name / Road, Suburb, City, District, Country
 * Example: Thappawatta Road, Maharagama, Colombo District, Sri Lanka
 */
export function formatPlaceLabel(item: NominatimSearchItem): {
  label: string;
  primary: string;
  secondary: string;
  name?: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
} {
  const name = placeName(item) || undefined;
  const road = roadName(item);
  const suburb = suburbName(item);
  const city = cityName(item);
  const district = districtName(item);
  const country = item.address?.country || "Sri Lanka";

  const primary =
    name ||
    [item.address?.house_number, road].filter(Boolean).join(" ") ||
    item.display_name.split(",")[0]?.trim() ||
    item.display_name;

  // Avoid repeating road in secondary when it is already the primary
  const suburbPart =
    suburb && suburb.toLowerCase() !== city?.toLowerCase() ? suburb : undefined;

  const secondaryParts = uniqueParts([
    // If primary is a POI name and road differs, include the road
    name && road && name.toLowerCase() !== road.toLowerCase() ? road : undefined,
    suburbPart,
    city,
    district,
    country,
  ]);

  const labelParts = uniqueParts([primary, suburbPart, city, district, country]);

  return {
    label: labelParts.join(", "),
    primary,
    secondary: secondaryParts.join(", "),
    name,
    road,
    suburb,
    city,
    district,
  };
}

function categoryOf(item: NominatimSearchItem): string {
  return (item.category || item.class || "").toLowerCase();
}

function isAdminResult(item: NominatimSearchItem): boolean {
  const addressType = (item.addresstype || item.type || "").toLowerCase();
  const category = categoryOf(item);
  if (category === "boundary" || category === "place") {
    if (ADMIN_TYPES.has(addressType) || ADMIN_TYPES.has((item.type || "").toLowerCase())) {
      return true;
    }
  }
  return ADMIN_TYPES.has(addressType);
}

function isPreciseResult(item: NominatimSearchItem): boolean {
  const category = categoryOf(item);
  const addressType = (item.addresstype || "").toLowerCase();
  if (PRECISE_CATEGORIES.has(category)) return true;
  if (
    addressType === "road" ||
    addressType === "house" ||
    addressType === "amenity" ||
    addressType === "building" ||
    addressType === "shop"
  ) {
    return true;
  }
  return false;
}

/** Higher score = better match for ride pickup / destination. */
export function scoreNominatimResult(
  item: NominatimSearchItem,
  query: string,
): number {
  let score = (item.importance ?? 0) * 10;
  score += (item.place_rank ?? 0);

  if (isPreciseResult(item)) score += 80;
  if (isAdminResult(item)) score -= 40;

  const q = query.trim().toLowerCase();
  const name = (item.name || placeName(item)).toLowerCase();
  const road = (roadName(item) || "").toLowerCase();

  if (name && (name === q || name.startsWith(q) || q.startsWith(name))) {
    score += 50;
  }
  if (road && (road.includes(q) || q.includes(road))) {
    score += 40;
  }

  if (ROAD_QUERY_RE.test(query)) {
    if (categoryOf(item) === "highway" || item.addresstype === "road") {
      score += 60;
    }
    if (isAdminResult(item)) {
      score -= 80;
    }
  }

  // Prefer exact token overlap with primary name
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (name.includes(token) || road.includes(token)) score += 8;
  }

  return score;
}

export function mapNominatimItem(
  item: NominatimSearchItem,
): FormattedPlace | null {
  const lat = Number.parseFloat(item.lat);
  const lng = Number.parseFloat(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const formatted = formatPlaceLabel(item);

  return {
    id: String(item.place_id),
    displayName: item.display_name,
    label: formatted.label,
    primary: formatted.primary,
    secondary: formatted.secondary,
    lat,
    lng,
    osmId: item.osm_id != null ? String(item.osm_id) : undefined,
    category: item.category || item.class,
    type: item.type,
    addressType: item.addresstype,
    name: formatted.name,
    road: formatted.road,
    suburb: formatted.suburb,
    city: formatted.city,
    district: formatted.district,
  };
}

/**
 * Rank Nominatim hits so roads / buildings / POIs beat city centers.
 * Never auto-pick — caller shows all ranked results in the dropdown.
 */
export function rankNominatimResults(
  items: NominatimSearchItem[],
  query: string,
): FormattedPlace[] {
  const mapped = items
    .map((item) => {
      const place = mapNominatimItem(item);
      if (!place) return null;
      return { place, score: scoreNominatimResult(item, query) };
    })
    .filter((entry): entry is { place: FormattedPlace; score: number } =>
      Boolean(entry),
    );

  mapped.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const results: FormattedPlace[] = [];
  for (const { place } of mapped) {
    const key = `${place.lat.toFixed(5)},${place.lng.toFixed(5)},${place.primary.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(place);
    if (results.length >= 5) break;
  }
  return results;
}

export function looksLikeRoadOrAddressQuery(query: string): boolean {
  return ROAD_QUERY_RE.test(query) || /\d/.test(query);
}

/**
 * Format a Nominatim reverse-geocode hit into a SelectedPlace-ready payload.
 * Caller should override lat/lng with the map pin center (not Nominatim's snapped point).
 */
export function formatReverseGeocode(
  item: NominatimSearchItem,
  pin: { lat: number; lng: number },
): FormattedPlace {
  const formatted = formatPlaceLabel(item);
  return {
    id: String(item.place_id ?? `${pin.lat},${pin.lng}`),
    displayName: item.display_name,
    label: formatted.label || item.display_name,
    primary: formatted.primary,
    secondary: formatted.secondary,
    // Always keep the exact pin / map-center coordinates
    lat: pin.lat,
    lng: pin.lng,
    osmId: item.osm_id != null ? String(item.osm_id) : undefined,
    category: item.category || item.class,
    type: item.type,
    addressType: item.addresstype,
    name: formatted.name,
    road: formatted.road,
    suburb: formatted.suburb,
    city: formatted.city,
    district: formatted.district,
  };
}
