"use client";

import { Polyline } from "react-leaflet";

export type RoutePolylineOption = {
  id: string;
  coordinates: [number, number][];
  selected: boolean;
};

export type RouteLayerProps = {
  /** @deprecated Prefer `routes` for multi-route rendering */
  coordinates?: [number, number][];
  routes?: RoutePolylineOption[];
  selectedRouteId?: string | null;
  onSelectRoute?: (id: string) => void;
};

const SELECTED_COLOR = "#2563EB";
const ALT_COLOR = "#C5CDD6";

/**
 * Driving route polylines — selected route is Q Pick blue & thick;
 * alternatives are light gray & thinner. Draw unselected first so
 * the selected path paints on top.
 */
export function RouteLayer({
  coordinates = [],
  routes,
  selectedRouteId = null,
  onSelectRoute,
}: RouteLayerProps) {
  const options: RoutePolylineOption[] =
    routes && routes.length > 0
      ? routes
      : coordinates.length >= 2
        ? [
            {
              id: "primary",
              coordinates,
              selected: true,
            },
          ]
        : [];

  if (options.length === 0) return null;

  const ordered = [...options].sort((a, b) => {
    const aSel = a.selected || a.id === selectedRouteId ? 1 : 0;
    const bSel = b.selected || b.id === selectedRouteId ? 1 : 0;
    return aSel - bSel;
  });

  return (
    <>
      {ordered.map((route) => {
        if (route.coordinates.length < 2) return null;
        const selected =
          route.selected ||
          (selectedRouteId != null && route.id === selectedRouteId);

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            eventHandlers={
              onSelectRoute
                ? {
                    click: () => onSelectRoute(route.id),
                  }
                : undefined
            }
            pathOptions={{
              color: selected ? SELECTED_COLOR : ALT_COLOR,
              weight: selected ? 6 : 3.5,
              opacity: selected ? 0.95 : 0.72,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        );
      })}
    </>
  );
}
