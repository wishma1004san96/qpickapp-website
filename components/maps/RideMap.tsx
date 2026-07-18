"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import { QSpinner } from "@/components/brand/q-mark";
import { DestinationMarker, PickupMarker } from "@/components/maps/Markers";
import {
  DEFAULT_ZOOM,
  MapCamera,
  SRI_LANKA_CENTER,
} from "@/components/maps/MapCamera";
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
  /** Optional labels for map HUD (distance / duration) */
  distanceLabel?: string | null;
  durationLabel?: string | null;
};

/**
 * Premium ride booking map — OSM tiles, custom pins, multi-route, camera motion.
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
  distanceLabel = null,
  durationLabel = null,
}: RideMapProps) {
  const selected =
    routes.find((r) => r.id === selectedRouteId) ??
    routes.find((r) => r.isRecommended) ??
    routes[0];

  const selectedCoords =
    selected?.coordinates ?? routeCoordinates;
  const allCoords =
    routes.length > 0
      ? routes.map((r) => r.coordinates)
      : routeCoordinates.length > 0
        ? [routeCoordinates]
        : [];

  const polylineRoutes =
    routes.length > 0
      ? routes.map((r) => ({
          id: r.id ?? `route-${r.distanceKm}-${r.durationSeconds}`,
          coordinates: r.coordinates,
          selected:
            (selectedRouteId != null && r.id === selectedRouteId) ||
            (selectedRouteId == null && Boolean(r.isRecommended)),
        }))
      : undefined;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[1.15rem] border border-ink/8 bg-[#e8eef3] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.6)] ${className}`}
    >
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="z-0 h-[14rem] w-full sm:h-[16.5rem] lg:h-[19rem]"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCamera
          pickup={pickup}
          destination={destination}
          routeCoordinates={selectedCoords}
          allRouteCoordinates={allCoords}
          selectedRouteKey={selectedRouteId ?? selected?.id ?? null}
        />
        <RouteLayer
          coordinates={selectedCoords}
          routes={polylineRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
        />
        {pickup ? (
          <PickupMarker
            key={`a-${pickup.lat}-${pickup.lng}-${pickup.label}`}
            place={pickup}
          />
        ) : null}
        {destination ? (
          <DestinationMarker
            key={`b-${destination.lat}-${destination.lng}-${destination.label}`}
            place={destination}
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
