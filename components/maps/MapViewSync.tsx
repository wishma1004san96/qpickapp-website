"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export type MapViewSyncProps = {
  center: [number, number];
  zoom: number;
  /** Only re-center when this changes (open picker / search jump) — never on every drag */
  syncKey: string | number;
};

/**
 * Programmatic setView only when syncKey changes.
 * Avoids fighting the user while they pan the map under the fixed pin.
 */
export function MapViewSync({ center, zoom, syncKey }: MapViewSyncProps) {
  const map = useMap();

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      map.setView(center, zoom, { animate: false });
    });
    return () => window.cancelAnimationFrame(id);
    // Intentionally syncKey-only — center/zoom read from latest closure when key bumps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, syncKey]);

  return null;
}
