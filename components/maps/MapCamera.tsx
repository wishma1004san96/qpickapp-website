"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { SelectedPlace } from "@/lib/osm/types";

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 7;
const PICKUP_ZOOM = 15.5;

export type MapCameraProps = {
  pickup: SelectedPlace | null;
  destination: SelectedPlace | null;
  routeCoordinates: [number, number][];
  /** Optional union of all alternative route geometries for fitBounds */
  allRouteCoordinates?: [number, number][][];
  /** Changes when the selected route changes — forces a soft re-fit */
  selectedRouteKey?: string | null;
};

/**
 * Camera control: flyTo pickup, then fitBounds when destination/route exist.
 */
export function MapCamera({
  pickup,
  destination,
  routeCoordinates,
  allRouteCoordinates = [],
  selectedRouteKey = null,
}: MapCameraProps) {
  const map = useMap();
  const prevPickupRef = useRef<string | null>(null);
  const prevDestRef = useRef<string | null>(null);
  const prevRouteSigRef = useRef("");

  useEffect(() => {
    const pickupKey = pickup ? `${pickup.lat},${pickup.lng}` : null;
    const destKey = destination
      ? `${destination.lat},${destination.lng}`
      : null;

    const unionPoints =
      allRouteCoordinates.length > 0
        ? allRouteCoordinates.flat()
        : routeCoordinates;
    const routeSig = [
      selectedRouteKey ?? "",
      allRouteCoordinates
        .map(
          (line) =>
            `${line.length}:${line[0]?.join(",") ?? ""}:${line[line.length - 1]?.join(",") ?? ""}`,
        )
        .join(";"),
      routeCoordinates.length,
      routeCoordinates[0]?.join(",") ?? "",
      routeCoordinates[routeCoordinates.length - 1]?.join(",") ?? "",
    ].join("|");

    const pickupChanged = pickupKey !== prevPickupRef.current;
    const destChanged = destKey !== prevDestRef.current;
    const routeChanged = routeSig !== prevRouteSigRef.current;

    prevPickupRef.current = pickupKey;
    prevDestRef.current = destKey;
    prevRouteSigRef.current = routeSig;

    if (!pickup && !destination) {
      map.setView(SRI_LANKA_CENTER, DEFAULT_ZOOM, { animate: true });
      return;
    }

    // Single selected place — fly to that result's exact lat/lng (never a city center)
    if (pickup && !destination) {
      if (pickupChanged) {
        map.flyTo([pickup.lat, pickup.lng], PICKUP_ZOOM, {
          animate: true,
          duration: 0.85,
          easeLinearity: 0.25,
        });
      }
      return;
    }

    if (!pickup && destination) {
      if (destChanged) {
        map.flyTo([destination.lat, destination.lng], PICKUP_ZOOM, {
          animate: true,
          duration: 0.85,
          easeLinearity: 0.25,
        });
      }
      return;
    }

    // Both points — fit route(s) or exact marker coordinates
    // Re-fit on place change or first route arrival; soft pan when only selection changes
    if (pickup && destination && (destChanged || routeChanged || pickupChanged)) {
      const points: [number, number][] =
        unionPoints.length > 1
          ? unionPoints
          : [
              [pickup.lat, pickup.lng],
              [destination.lat, destination.lng],
            ];

      const bounds = L.latLngBounds(points);
      const onlySelectionChanged =
        !pickupChanged && !destChanged && routeChanged && Boolean(selectedRouteKey);

      map.flyToBounds(bounds, {
        padding: [56, 56],
        maxZoom: onlySelectionChanged ? map.getZoom() : 16,
        animate: true,
        duration: onlySelectionChanged ? 0.45 : 0.9,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compare via routeSig, not array identity
  }, [
    map,
    pickup,
    destination,
    selectedRouteKey,
    // Serialize geometries so new array identities don't retrigger endlessly
    routeCoordinates.length > 0
      ? `${routeCoordinates.length}:${routeCoordinates[0]?.join(",")}:${routeCoordinates[routeCoordinates.length - 1]?.join(",")}`
      : "",
    allRouteCoordinates
      .map(
        (line) =>
          `${line.length}:${line[0]?.join(",") ?? ""}:${line[line.length - 1]?.join(",") ?? ""}`,
      )
      .join("|"),
  ]);

  return null;
}

export { SRI_LANKA_CENTER, DEFAULT_ZOOM, PICKUP_ZOOM };
