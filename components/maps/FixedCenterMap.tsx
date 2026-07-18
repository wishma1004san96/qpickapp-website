"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import { FixedCenterPin } from "@/components/maps/FixedCenterPin";
import { MapDragEvents } from "@/components/maps/MapDragEvents";
import { MapViewSync } from "@/components/maps/MapViewSync";
import {
  COLOMBO_CENTER,
  PICKER_ZOOM,
} from "@/components/maps/map-constants";
import type { FixedCenterMapProps } from "@/components/maps/map-types";
import "leaflet/dist/leaflet.css";

export { COLOMBO_CENTER, PICKER_ZOOM };
export type { FixedCenterMapProps };

/**
 * Uber-style map: user pans the map; pin stays fixed at the viewport center.
 * No Leaflet markers — pin is a CSS overlay.
 */
export function FixedCenterMap({
  center,
  zoom = PICKER_ZOOM,
  syncKey,
  isMoving,
  variant = "pickup",
  onMoveStart,
  onMove,
  onMoveEnd,
  className = "",
}: FixedCenterMapProps) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-[#e8eef3] ${className}`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        className="z-0 h-full w-full touch-pan-y"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewSync center={center} zoom={zoom} syncKey={syncKey} />
        <MapDragEvents
          onMoveStart={onMoveStart}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
        />
      </MapContainer>

      <FixedCenterPin isMoving={isMoving} variant={variant} />
    </div>
  );
}
