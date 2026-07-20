"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import { QSpinner } from "@/components/brand/q-mark";
import { DestinationMarker, PickupMarker } from "@/components/maps/Markers";
import {
  DEFAULT_ZOOM,
  MapCamera,
} from "@/components/maps/MapCamera";
import {
  CMB_MAP_CENTER_TUPLE,
  filterValidLatLngTuples,
  isValidLatLng,
} from "@/components/maps/map-coordinates";
import { RouteLayer } from "@/components/maps/RouteLayer";
import type { DrivingRouteEstimate, SelectedPlace } from "@/lib/osm/types";
import "leaflet/dist/leaflet.css";

export type RideMapProps = {
  pickup: SelectedPlace | null;
  destination: SelectedPlace | null;
  /** @deprecated Prefer `routes` + `selectedRouteId` */
  routeCoordinates?: [number, number][];
  routes?: DrivingRouteEstimate[];
  selectedRouteId?: string | null;
  onSelectRoute?: (id: string) => void;
  isRouteLoading?: boolean;
  routeError?: string | null;
  className?: string;
  /** Override MapContainer height classes (default ride booking sizes) */
  mapHeightClass?: string;
  /** Optional labels for map HUD (distance / duration) */
  distanceLabel?: string | null;
  durationLabel?: string | null;
  /** Shown when destination coords are missing/invalid */
  emptyMessage?: string;
};

function sanitizeRoutes(
  routes: DrivingRouteEstimate[],
): DrivingRouteEstimate[] {
  return routes
    .map((route) => ({
      ...route,
      coordinates: filterValidLatLngTuples(route.coordinates),
    }))
    .filter((route) => route.coordinates.length >= 2);
}

/**
 * Premium ride booking map — OSM tiles, custom pins, multi-route, camera motion.
 * Invalid coordinates never reach Leaflet LatLng / markers / polylines.
 */
export function RideMap({
  pickup,
  destination,
  routeCoordinates = [],
  routes = [],
  selectedRouteId = null,
  onSelectRoute,
  isRouteLoading = false,
  routeError = null,
  className = "",
  mapHeightClass = "h-[14rem] w-full sm:h-[16.5rem] lg:h-[19rem]",
  distanceLabel = null,
  durationLabel = null,
  emptyMessage = "Select a destination to preview your route.",
}: RideMapProps) {
  const safePickup = isValidLatLng(pickup) ? pickup : null;
  const safeDestination = isValidLatLng(destination) ? destination : null;
  const safeRoutes = sanitizeRoutes(routes);
  const safeLegacyCoords = filterValidLatLngTuples(routeCoordinates);

  const selected =
    safeRoutes.find((r) => r.id === selectedRouteId) ??
    safeRoutes.find((r) => r.isRecommended) ??
    safeRoutes[0];

  const selectedCoords = selected?.coordinates ?? safeLegacyCoords;
  const allCoords =
    safeRoutes.length > 0
      ? safeRoutes.map((r) => r.coordinates)
      : selectedCoords.length > 0
        ? [selectedCoords]
        : [];

  const polylineRoutes =
    safeRoutes.length > 0
      ? safeRoutes.map((r) => ({
          id: r.id ?? `route-${r.distanceKm}-${r.durationSeconds}`,
          coordinates: r.coordinates,
          selected:
            (selectedRouteId != null && r.id === selectedRouteId) ||
            (selectedRouteId == null && Boolean(r.isRecommended)),
        }))
      : undefined;

  const showEmptyHint = !safeDestination && !isRouteLoading;
  const mapCenter = safePickup
    ? ([safePickup.lat, safePickup.lng] as [number, number])
    : CMB_MAP_CENTER_TUPLE;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[1.15rem] border border-ink/8 bg-[#e8eef3] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.6)] ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={safePickup || safeDestination ? DEFAULT_ZOOM : 11}
        scrollWheelZoom={false}
        className={`z-0 w-full ${mapHeightClass}`}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCamera
          pickup={safePickup}
          destination={safeDestination}
          routeCoordinates={selectedCoords}
          allRouteCoordinates={allCoords}
          selectedRouteKey={selectedRouteId ?? selected?.id ?? null}
        />
        {safeDestination ? (
          <RouteLayer
            coordinates={selectedCoords}
            routes={polylineRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={onSelectRoute}
          />
        ) : null}
        {safePickup ? (
          <PickupMarker
            key={`a-${safePickup.lat}-${safePickup.lng}-${safePickup.label}`}
            place={safePickup}
          />
        ) : null}
        {safeDestination ? (
          <DestinationMarker
            key={`b-${safeDestination.lat}-${safeDestination.lng}-${safeDestination.label}`}
            place={safeDestination}
          />
        ) : null}
      </MapContainer>

      {distanceLabel || durationLabel ? (
        <div className="pointer-events-none absolute top-3 left-3 z-[450] flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          {distanceLabel ? (
            <span className="rounded-full border border-white/25 bg-[#050b12]/78 px-3 py-1.5 text-[0.6875rem] font-semibold tracking-wide text-white shadow-[0_8px_20px_rgb(10_22_32_/_0.28)] backdrop-blur-md">
              {distanceLabel}
            </span>
          ) : null}
          {durationLabel ? (
            <span className="rounded-full border border-white/25 bg-[#050b12]/78 px-3 py-1.5 text-[0.6875rem] font-semibold tracking-wide text-white shadow-[0_8px_20px_rgb(10_22_32_/_0.28)] backdrop-blur-md">
              {durationLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {showEmptyHint ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[450] rounded-[0.9rem] border border-white/40 bg-white/92 px-3.5 py-2.5 text-center text-sm font-medium text-ink/70 shadow-[0_10px_28px_rgb(10_22_32_/_0.12)] backdrop-blur-md sm:inset-x-4">
          {emptyMessage}
        </div>
      ) : null}

      {isRouteLoading ? (
        <div
          className="absolute inset-0 z-[500] flex items-center justify-center bg-[#050b12]/35 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-white/95 px-4 py-2.5 text-sm font-medium text-ink shadow-[0_12px_32px_rgb(10_22_32_/_0.2)]">
            <QSpinner size={16} />
            Calculating route…
          </div>
        </div>
      ) : null}

      {routeError && !isRouteLoading ? (
        <div
          className="absolute inset-x-3 bottom-3 z-[500] rounded-[0.9rem] border border-red-200/80 bg-white/95 px-3.5 py-2.5 text-sm leading-snug text-red-700 shadow-[0_10px_28px_rgb(10_22_32_/_0.12)] backdrop-blur-md sm:inset-x-4"
          role="alert"
        >
          {routeError}
        </div>
      ) : null}
    </div>
  );
}
