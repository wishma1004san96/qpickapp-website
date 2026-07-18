"use client";

import { useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";

export type MapDragEventsProps = {
  onMoveStart?: () => void;
  onMove?: () => void;
  onMoveEnd?: (center: { lat: number; lng: number }) => void;
};

/**
 * Leaflet map drag lifecycle — reverse geocode only from moveend (parent).
 * The first moveend (map init / programmatic setView) is ignored so we never
 * setState on the parent during the initial mount pass.
 */
export function MapDragEvents({
  onMoveStart,
  onMove,
  onMoveEnd,
}: MapDragEventsProps) {
  const readyRef = useRef(false);

  useEffect(() => {
    // Allow moveend only after the map has finished its first layout pass
    const id = window.requestAnimationFrame(() => {
      readyRef.current = true;
    });
    return () => {
      window.cancelAnimationFrame(id);
      readyRef.current = false;
    };
  }, []);

  useMapEvents({
    movestart: () => {
      if (!readyRef.current) return;
      onMoveStart?.();
    },
    move: () => {
      if (!readyRef.current) return;
      onMove?.();
    },
    moveend: (event) => {
      if (!readyRef.current) return;
      const c = event.target.getCenter();
      onMoveEnd?.({ lat: c.lat, lng: c.lng });
    },
  });

  return null;
}
