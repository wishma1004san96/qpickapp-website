import { CMB_AIRPORT } from "@/components/maps/map-constants";
import { isValidCoordinate } from "@/components/maps/map-coordinates";
import type {
  TourDestination,
  TourItineraryDay,
  TourPackage,
} from "./types";

export type TourRouteStopKind = "airport" | "destination";

/** A geographic stop on the chauffeur journey (itinerary order). */
export type TourRouteStop = {
  id: string;
  kind: TourRouteStopKind;
  markerLabel: string;
  sequence: number;
  label: string;
  lat: number;
  lng: number;
  destinationSlug: string | null;
  /** Primary day associated with this stop (first night / focus day) */
  day: number | null;
  /** All itinerary days that map to this stop */
  days: number[];
  dayTitle: string | null;
  dayDescription: string | null;
};

export type TourItineraryRoute = {
  packageSlug: string;
  packageTitle: string;
  /** Full path including CMB bookends — polyline follows this order exactly */
  coordinates: [number, number][];
  stops: TourRouteStop[];
  destinationStops: TourRouteStop[];
  /** day number → stop id */
  dayToStopId: Record<number, string>;
};

function tuple(lat: number, lng: number): [number, number] | null {
  if (!isValidCoordinate(lat, lng)) return null;
  return [lat, lng];
}

export function resolveDayDestinationSlug(
  day: TourItineraryDay,
  index: number,
  packageDestinationSlugs: string[],
): string | null {
  if (day.destinationSlug?.trim()) return day.destinationSlug.trim();
  if (packageDestinationSlugs.length === 0) return null;
  return (
    packageDestinationSlugs[
      Math.min(index, packageDestinationSlugs.length - 1)
    ] ?? null
  );
}

/**
 * Build the chauffeur route from itinerary travel order.
 * Never uses destinationSlugs catalogue order as the polyline path.
 */
export function buildItineraryRoute(
  pkg: TourPackage,
  destinations: TourDestination[],
  options?: { bookendAirport?: boolean },
): TourItineraryRoute {
  const bookend = options?.bookendAirport !== false;
  const bySlug = new Map(destinations.map((d) => [d.slug, d]));
  const dayToStopId: Record<number, string> = {};

  const destinationStops: TourRouteStop[] = [];
  let markerNum = 0;
  let lastSlug: string | null = null;

  pkg.itinerary.forEach((day, index) => {
    const slug = resolveDayDestinationSlug(
      day,
      index,
      pkg.destinationSlugs,
    );
    if (!slug) return;
    const dest = bySlug.get(slug);
    if (!dest) return;

    if (slug === lastSlug && destinationStops.length > 0) {
      const prev = destinationStops[destinationStops.length - 1];
      dayToStopId[day.day] = prev.id;
      prev.days.push(day.day);
      return;
    }

    lastSlug = slug;
    markerNum += 1;
    const id = `stop-${markerNum}`;
    dayToStopId[day.day] = id;
    destinationStops.push({
      id,
      kind: "destination",
      markerLabel: String(markerNum),
      sequence: -1,
      label: dest.name,
      lat: dest.lat,
      lng: dest.lng,
      destinationSlug: dest.slug,
      day: day.day,
      days: [day.day],
      dayTitle: day.title,
      dayDescription: day.description,
    });
  });

  const stops: TourRouteStop[] = [];
  let sequence = 0;

  if (bookend) {
    const airport = tuple(CMB_AIRPORT[0], CMB_AIRPORT[1]);
    if (airport) {
      stops.push({
        id: "airport-start",
        kind: "airport",
        markerLabel: "1",
        sequence: sequence++,
        label: "Airport (CMB)",
        lat: airport[0],
        lng: airport[1],
        destinationSlug: null,
        day: null,
        days: [],
        dayTitle: "Arrival",
        dayDescription: "Meet your chauffeur at Bandaranaike International.",
      });
    }
  }

  for (const stop of destinationStops) {
    stops.push({ ...stop, sequence: sequence++ });
  }

  if (bookend) {
    const airport = tuple(CMB_AIRPORT[0], CMB_AIRPORT[1]);
    if (airport) {
      stops.push({
        id: "airport-end",
        kind: "airport",
        markerLabel: "A",
        sequence: sequence++,
        label: "Return · Airport (CMB)",
        lat: airport[0],
        lng: airport[1],
        destinationSlug: null,
        day: null,
        days: [],
        dayTitle: "Departure",
        dayDescription: "Private transfer back to CMB.",
      });
    }
  }

  // Number every stop in travel order: 1 Airport → 2 Negombo → …
  stops.forEach((stop, index) => {
    stop.sequence = index;
    stop.markerLabel = String(index + 1);
  });

  const coordinates = stops
    .map((s) => tuple(s.lat, s.lng))
    .filter((t): t is [number, number] => t != null);

  return {
    packageSlug: pkg.slug,
    packageTitle: pkg.title,
    coordinates,
    stops,
    destinationStops: stops.filter((s) => s.kind === "destination"),
    dayToStopId,
  };
}

export function findStopForDay(
  route: TourItineraryRoute,
  day: number,
): TourRouteStop | null {
  const id = route.dayToStopId[day];
  if (!id) return null;
  return route.stops.find((s) => s.id === id) ?? null;
}

export function findStopForDestinationSlug(
  route: TourItineraryRoute,
  slug: string,
): TourRouteStop | null {
  return (
    route.destinationStops.find((s) => s.destinationSlug === slug) ?? null
  );
}
