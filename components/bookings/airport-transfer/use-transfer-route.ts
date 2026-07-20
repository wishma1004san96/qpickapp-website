"use client";

import { useEffect, useState } from "react";
import { CMB_AIRPORT_PLACE } from "@/lib/airport-booking-handoff";
import {
  formatDistance,
  formatDuration,
} from "@/lib/airport-destination-scenes";
import {
  filterValidLatLngTuples,
  isValidLatLng,
} from "@/components/maps/map-coordinates";
import type { DrivingRouteEstimate, SelectedPlace } from "@/lib/osm/types";
import type { SelectedDestination } from "./types";

function sanitizePlace(
  place: SelectedPlace | null | undefined,
): SelectedPlace | null {
  if (!place || !isValidLatLng(place)) return null;
  return {
    ...place,
    lat: place.lat,
    lng: place.lng,
  };
}

function sanitizeRoutes(
  routes: DrivingRouteEstimate[] | undefined,
): DrivingRouteEstimate[] {
  if (!Array.isArray(routes)) return [];
  return routes
    .map((route) => ({
      ...route,
      coordinates: filterValidLatLngTuples(route.coordinates),
    }))
    .filter((route) => route.coordinates.length >= 2);
}

/** Stable CMB pickup — never mutate the shared constant. */
const CMB_PICKUP: SelectedPlace = {
  ...CMB_AIRPORT_PLACE,
  lat: CMB_AIRPORT_PLACE.lat,
  lng: CMB_AIRPORT_PLACE.lng,
};

export function useTransferRoute(destination: SelectedDestination | null) {
  const [destPlace, setDestPlace] = useState<SelectedPlace | null>(() =>
    sanitizePlace(destination?.place),
  );
  const [routes, setRoutes] = useState<DrivingRouteEstimate[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    if (!destination) {
      setDestPlace(null);
      setRoutes([]);
      setRouteLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setRouteLoading(true);
      try {
        let place = sanitizePlace(destination!.place);
        if (!place) {
          const geo = await fetch(
            `/api/ride/geocode?q=${encodeURIComponent(destination!.rate.destination)}`,
          );
          const geoData = (await geo.json()) as {
            results?: SelectedPlace[];
          };
          place = sanitizePlace(geoData.results?.[0] ?? null);
          if (!cancelled) setDestPlace(place);
        } else if (!cancelled) {
          setDestPlace(place);
        }

        if (!place || cancelled) {
          setRoutes([]);
          return;
        }

        if (!isValidLatLng(CMB_PICKUP)) {
          setRoutes([]);
          return;
        }

        const res = await fetch("/api/ride/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: {
              lat: CMB_PICKUP.lat,
              lng: CMB_PICKUP.lng,
            },
            destination: { lat: place.lat, lng: place.lng },
          }),
        });
        const data = (await res.json()) as {
          routes?: DrivingRouteEstimate[];
        };
        if (!cancelled) {
          setRoutes(sanitizeRoutes(data.routes));
        }
      } catch {
        if (!cancelled) {
          setDestPlace(null);
          setRoutes([]);
        }
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [destination]);

  const route = routes[0] ?? null;
  const distanceLabel = destination
    ? route
      ? formatDistance(route.distanceKm)
      : formatDistance(destination.scene.distanceKm)
    : "—";
  const durationLabel = destination
    ? route
      ? formatDuration(Math.round(route.durationSeconds / 60))
      : formatDuration(destination.scene.durationMin)
    : "—";

  return {
    destPlace,
    routes,
    route,
    routeLoading,
    distanceLabel,
    durationLabel,
    pickup: isValidLatLng(CMB_PICKUP) ? CMB_PICKUP : null,
  };
}
