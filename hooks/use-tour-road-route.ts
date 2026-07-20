"use client";

import { useEffect, useState } from "react";
import type { TourItineraryRoute } from "@/lib/tours/itinerary-route";
import type { TourRoadRoute } from "@/lib/tours/road-route";

type UseTourRoadRouteState = {
  route: TourRoadRoute | null;
  loading: boolean;
  error: string | null;
};

/**
 * Fetch real road-network geometry for an itinerary (ORS / OSRM via API).
 */
export function useTourRoadRoute(
  itineraryRoute: TourItineraryRoute | null | undefined,
): UseTourRoadRouteState {
  const [route, setRoute] = useState<TourRoadRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waypointKey =
    itineraryRoute?.stops
      .map((s) => `${s.id}:${s.lat.toFixed(5)},${s.lng.toFixed(5)}`)
      .join("|") ?? "";

  const canRoute = Boolean(itineraryRoute && itineraryRoute.stops.length >= 2);

  useEffect(() => {
    if (!canRoute || !itineraryRoute) return;

    const controller = new AbortController();
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    const waypoints = itineraryRoute.stops.map((s) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
    }));

    void (async () => {
      try {
        const res = await fetch("/api/tour-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ waypoints }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? `Route request failed (${res.status})`);
        }
        const data = (await res.json()) as TourRoadRoute;
        if (!controller.signal.aborted) {
          setRoute(data);
          setLoading(false);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setRoute(null);
        setError(err instanceof Error ? err.message : "Unable to load road route");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [waypointKey, canRoute, itineraryRoute]);

  if (!canRoute) {
    return { route: null, loading: false, error: null };
  }

  return { route, loading, error };
}
