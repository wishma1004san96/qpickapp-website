"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { SelectedPlace } from "@/lib/osm/types";
import {
  CMB_MAP_CENTER_TUPLE,
  filterValidLatLngTuples,
  isValidLatLng,
  toLatLngTuple,
} from "@/components/maps/map-coordinates";

const DEFAULT_ZOOM = 11;
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
 * Never calls flyTo / fitBounds with invalid LatLngs.
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

  const safePickup = isValidLatLng(pickup) ? pickup : null;
  const safeDestination = isValidLatLng(destination) ? destination : null;

  useEffect(() => {
    const pickupKey = safePickup
      ? `${safePickup.lat},${safePickup.lng}`
      : null;
    const destKey = safeDestination
      ? `${safeDestination.lat},${safeDestination.lng}`
      : null;

    const unionPoints = filterValidLatLngTuples(
      allRouteCoordinates.length > 0
        ? allRouteCoordinates.flat()
        : routeCoordinates,
    );
    const routeSig = [
      selectedRouteKey ?? "",
      allRouteCoordinates
        .map((line) => {
          const valid = filterValidLatLngTuples(line);
          return `${valid.length}:${valid[0]?.join(",") ?? ""}:${valid[valid.length - 1]?.join(",") ?? ""}`;
        })
        .join(";"),
      unionPoints.length,
      unionPoints[0]?.join(",") ?? "",
      unionPoints[unionPoints.length - 1]?.join(",") ?? "",
    ].join("|");

    const pickupChanged = pickupKey !== prevPickupRef.current;
    const destChanged = destKey !== prevDestRef.current;
    const routeChanged = routeSig !== prevRouteSigRef.current;

    prevPickupRef.current = pickupKey;
    prevDestRef.current = destKey;
    prevRouteSigRef.current = routeSig;

    if (!safePickup && !safeDestination) {
      map.setView(CMB_MAP_CENTER_TUPLE, DEFAULT_ZOOM, { animate: true });
      return;
    }

    if (safePickup && !safeDestination) {
      if (pickupChanged) {
        const center = toLatLngTuple(safePickup);
        if (center) {
          map.flyTo(center, PICKUP_ZOOM, {
            animate: true,
            duration: 0.85,
            easeLinearity: 0.25,
          });
        }
      }
      return;
    }

    if (!safePickup && safeDestination) {
      if (destChanged) {
        const center = toLatLngTuple(safeDestination);
        if (center) {
          map.flyTo(center, PICKUP_ZOOM, {
            animate: true,
            duration: 0.85,
            easeLinearity: 0.25,
          });
        }
      }
      return;
    }

    if (
      safePickup &&
      safeDestination &&
      (destChanged || routeChanged || pickupChanged)
    ) {
      const pickupTuple = toLatLngTuple(safePickup);
      const destTuple = toLatLngTuple(safeDestination);
      const points: [number, number][] =
        unionPoints.length > 1
          ? unionPoints
          : [pickupTuple, destTuple].filter(
              (p): p is [number, number] => p != null,
            );

      if (points.length === 0) {
        map.setView(CMB_MAP_CENTER_TUPLE, DEFAULT_ZOOM, { animate: true });
        return;
      }

      if (points.length === 1) {
        map.flyTo(points[0], PICKUP_ZOOM, {
          animate: true,
          duration: 0.85,
          easeLinearity: 0.25,
        });
        return;
      }

      try {
        const bounds = L.latLngBounds(points);
        if (!bounds.isValid()) {
          map.setView(CMB_MAP_CENTER_TUPLE, DEFAULT_ZOOM, { animate: true });
          return;
        }

        const onlySelectionChanged =
          !pickupChanged &&
          !destChanged &&
          routeChanged &&
          Boolean(selectedRouteKey);

        map.flyToBounds(bounds, {
          padding: [56, 56],
          maxZoom: onlySelectionChanged ? map.getZoom() : 16,
          animate: true,
          duration: onlySelectionChanged ? 0.45 : 0.9,
        });
      } catch {
        map.setView(CMB_MAP_CENTER_TUPLE, DEFAULT_ZOOM, { animate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compare via routeSig, not array identity
  }, [
    map,
    safePickup,
    safeDestination,
    selectedRouteKey,
    routeCoordinates.length > 0
      ? `${routeCoordinates.length}:${routeCoordinates[0]?.join(",")}:${routeCoordinates[routeCoordinates.length - 1]?.join(",")}`
      : "",
    allRouteCoordinates
      .map((line) => {
        const valid = filterValidLatLngTuples(line);
        return `${valid.length}:${valid[0]?.join(",") ?? ""}:${valid[valid.length - 1]?.join(",") ?? ""}`;
      })
      .join("|"),
  ]);

  return null;
}

export {
  CMB_MAP_CENTER_TUPLE as SRI_LANKA_CENTER,
  DEFAULT_ZOOM,
  PICKUP_ZOOM,
};
