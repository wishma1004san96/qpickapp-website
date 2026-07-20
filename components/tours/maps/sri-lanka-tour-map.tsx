"use client";

import L from "leaflet";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { filterValidLatLngTuples } from "@/components/maps/map-coordinates";
import {
  CMB_AIRPORT,
  SRI_LANKA_CENTER,
} from "@/components/maps/map-constants";
import type { TourItineraryRoute, TourRouteStop } from "@/lib/tours/itinerary-route";
import type { TourRoadRoute } from "@/lib/tours/road-route";
import type { TourDestination } from "@/lib/tours/types";
import "leaflet/dist/leaflet.css";

export { CMB_AIRPORT as CMB_ROUTE_POINT };

const SRI_LANKA_BOUNDS: L.LatLngBoundsExpression = [
  [5.85, 79.4],
  [9.9, 82.05],
];

const BRAND_BLUE = "#0062fa";
const COMPLETED_TEAL = "#0f766e";
const UPCOMING_INK = "#0a1620";

export type TourMapRoute = {
  id: string;
  label: string;
  coordinates: [number, number][];
  selected?: boolean;
};

export type TourPinState = "active" | "completed" | "upcoming";

/**
 * Official Q Pick teardrop pin (matches ride booking Markers).
 */
function createQPickPinIcon(label: string, state: TourPinState) {
  const fill =
    state === "active"
      ? BRAND_BLUE
      : state === "completed"
        ? COMPLETED_TEAL
        : UPCOMING_INK;
  const pulseClass = state === "active" ? " qpick-map-pin--pulse" : "";
  const size = state === "active" ? 46 : 40;
  const height = state === "active" ? 60 : 52;

  const svg = encodeURIComponent(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 40 52">
      <defs>
        <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#0a1620" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path filter="url(#s)" fill="${fill}" stroke="#ffffff" stroke-width="2.5"
        d="M20 2.5c-8.3 0-15 6.7-15 15 0 11.2 15 31.5 15 31.5S35 28.7 35 17.5c0-8.3-6.7-15-15-15z"/>
      <circle cx="20" cy="17.5" r="9.5" fill="#ffffff"/>
      <text x="20" y="21.5" text-anchor="middle" font-size="13" font-weight="700"
        font-family="system-ui,Segoe UI,sans-serif" fill="${fill}">${label}</text>
    </svg>
  `.trim(),
  );

  return L.divIcon({
    className: `qpick-map-pin-icon${pulseClass}`,
    html: `<img src="data:image/svg+xml,${svg}" width="${size}" height="${height}" alt="" draggable="false" style="display:block;width:${size}px;height:${height}px" />`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 8],
  });
}

function FitRoute({
  coordinates,
  resetToken,
}: {
  coordinates: [number, number][];
  resetToken: number;
}) {
  const map = useMap();
  useEffect(() => {
    const pts = filterValidLatLngTuples(coordinates);
    if (pts.length >= 2) {
      map.fitBounds(pts, { padding: [56, 56], maxZoom: 10, animate: true });
    } else {
      map.fitBounds(SRI_LANKA_BOUNDS, { padding: [24, 24], animate: false });
    }
  }, [map, coordinates, resetToken]);
  return null;
}

function FlyToStop({
  stop,
  focusToken,
}: {
  stop: TourRouteStop | null;
  focusToken: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!stop || focusToken <= 0) return;
    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 10), {
      duration: 0.9,
    });
  }, [map, stop, focusToken]);
  return null;
}

function MapApiBridge({
  onReady,
}: {
  onReady: (map: L.Map) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function AnimatedRoadLine({
  coordinates,
  animate,
  highlighted,
}: {
  coordinates: [number, number][];
  animate: boolean;
  highlighted: boolean;
}) {
  const safe = useMemo(
    () => filterValidLatLngTuples(coordinates),
    [coordinates],
  );
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    if (!animate || safe.length < 2) return undefined;
    const step = Math.max(4, Math.ceil(safe.length / 60));
    let n = Math.min(24, safe.length);
    let intervalId = 0;
    const startId = window.setTimeout(() => {
      setVisibleCount(n);
      intervalId = window.setInterval(() => {
        n = Math.min(n + step, safe.length);
        setVisibleCount(n);
        if (n >= safe.length) window.clearInterval(intervalId);
      }, 40);
    }, 0);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [animate, safe]);

  const positions =
    !animate || safe.length < 2
      ? safe
      : safe.slice(0, Math.max(2, Math.min(visibleCount, safe.length)));
  if (positions.length < 2) return null;

  return (
    <Polyline
      key={animate ? `road-${visibleCount}` : "road-full"}
      positions={positions}
      className={
        highlighted
          ? "tour-route-line tour-route-line--active"
          : "tour-route-line"
      }
      pathOptions={{
        color: highlighted ? BRAND_BLUE : "#5b8def",
        weight: highlighted ? 6 : 4.5,
        opacity: highlighted ? 0.98 : 0.72,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}

function RoadLegsLayer({
  roadRoute,
  activeStopId,
  animate,
}: {
  roadRoute: TourRoadRoute;
  activeStopId: string | null;
  animate: boolean;
}) {
  const activeLegIndex = useMemo(() => {
    if (!activeStopId) return -1;
    return roadRoute.legs.findIndex((leg) => leg.toId === activeStopId);
  }, [activeStopId, roadRoute.legs]);

  // When no focus: one animated full route. When focused: all legs + highlight.
  if (!activeStopId || activeLegIndex < 0) {
    return (
      <AnimatedRoadLine
        coordinates={roadRoute.coordinates}
        animate={animate}
        highlighted
      />
    );
  }

  return (
    <>
      {roadRoute.legs.map((leg, index) => {
        const coords = filterValidLatLngTuples(leg.coordinates);
        if (coords.length < 2) return null;
        const active = index === activeLegIndex;
        const completed = index < activeLegIndex;
        return (
          <Polyline
            key={`${leg.fromId}-${leg.toId}`}
            positions={coords}
            className={
              active
                ? "tour-route-line tour-route-line--active"
                : "tour-route-line"
            }
            pathOptions={{
              color: active
                ? BRAND_BLUE
                : completed
                  ? COMPLETED_TEAL
                  : "#94b8f0",
              weight: active ? 7 : completed ? 5 : 3.5,
              opacity: active ? 1 : completed ? 0.85 : 0.45,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        );
      })}
    </>
  );
}

function ActivePopupOpener({
  markerRef,
  open,
}: {
  markerRef: RefObject<L.Marker | null>;
  open: boolean;
}) {
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (open) {
      marker.openPopup();
    } else {
      marker.closePopup();
    }
  }, [markerRef, open]);
  return null;
}

function ItineraryMarkers({
  stops,
  activeStopId,
  onHoverStop,
  onSelectStop,
  interactive,
}: {
  stops: TourRouteStop[];
  activeStopId: string | null;
  onHoverStop?: (stopId: string | null) => void;
  onSelectStop?: (stopId: string) => void;
  interactive: boolean;
}) {
  const activeSeq = useMemo(() => {
    if (!activeStopId) return null;
    return stops.find((s) => s.id === activeStopId)?.sequence ?? null;
  }, [activeStopId, stops]);

  const rendered = useMemo(() => {
    const out: TourRouteStop[] = [];
    const seenAirport = new Set<string>();
    for (const stop of stops) {
      if (stop.kind === "airport") {
        const key = `${stop.lat.toFixed(4)},${stop.lng.toFixed(4)}`;
        if (seenAirport.has(key)) continue;
        seenAirport.add(key);
      }
      out.push(stop);
    }
    return out;
  }, [stops]);

  return (
    <>
      {rendered.map((stop) => {
        const active = activeStopId === stop.id;
        let state: TourPinState = "upcoming";
        if (active) state = "active";
        else if (activeSeq != null && stop.sequence < activeSeq) {
          state = "completed";
        }

        const icon = createQPickPinIcon(stop.markerLabel, state);

        return (
          <MarkerWithPopup
            key={stop.id}
            stop={stop}
            icon={icon}
            active={active}
            interactive={interactive}
            onHoverStop={onHoverStop}
            onSelectStop={onSelectStop}
          />
        );
      })}
    </>
  );
}

function MarkerWithPopup({
  stop,
  icon,
  active,
  interactive,
  onHoverStop,
  onSelectStop,
}: {
  stop: TourRouteStop;
  icon: L.DivIcon;
  active: boolean;
  interactive: boolean;
  onHoverStop?: (stopId: string | null) => void;
  onSelectStop?: (stopId: string) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  return (
    <Marker
      ref={markerRef}
      position={[stop.lat, stop.lng]}
      icon={icon}
      zIndexOffset={active ? 1200 : stop.kind === "airport" ? 200 : 400}
      eventHandlers={
        interactive
          ? {
              mouseover: () => onHoverStop?.(stop.id),
              mouseout: () => onHoverStop?.(null),
              click: (e) => {
                L.DomEvent.stopPropagation(e.originalEvent);
                onSelectStop?.(stop.id);
              },
            }
          : undefined
      }
    >
      <ActivePopupOpener markerRef={markerRef} open={active} />
      <Popup className="tour-map-popup" closeButton={false} autoClose={false}>
        <div className="min-w-[9rem] font-sans text-[0.8125rem] leading-snug text-[#0a1620]">
          <p className="font-mono text-[0.625rem] tracking-[0.14em] text-[#0062fa] uppercase">
            Stop {stop.markerLabel}
          </p>
          <p className="mt-0.5 font-semibold tracking-tight">{stop.label}</p>
          {stop.dayTitle ? (
            <p className="mt-1 text-[0.7rem] text-[#4a5a66]">
              {stop.day != null ? `Day ${stop.day} · ` : ""}
              {stop.dayTitle}
            </p>
          ) : null}
        </div>
      </Popup>
      <Tooltip direction="top" offset={[0, -48]} className="tour-map-tooltip">
        <span className="font-semibold">{stop.label}</span>
      </Tooltip>
    </Marker>
  );
}

/** Hub explorer: destination pins only (no itinerary route until a package is chosen). */
function DestinationPins({
  destinations,
  hoveredSlug,
  selectedSlug,
  onHover,
  onSelect,
  interactive,
}: {
  destinations: TourDestination[];
  hoveredSlug?: string | null;
  selectedSlug?: string | null;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
  interactive: boolean;
}) {
  return (
    <>
      {destinations.map((dest, index) => {
        const active = hoveredSlug === dest.slug || selectedSlug === dest.slug;
        const icon = createQPickPinIcon(
          String(index + 1),
          active ? "active" : "upcoming",
        );
        return (
          <Marker
            key={dest.slug}
            position={[dest.lat, dest.lng]}
            icon={icon}
            zIndexOffset={active ? 900 : 300}
            eventHandlers={
              interactive
                ? {
                    mouseover: () => onHover?.(dest.slug),
                    mouseout: () => onHover?.(null),
                    click: (e) => {
                      L.DomEvent.stopPropagation(e.originalEvent);
                      onSelect?.(dest.slug);
                    },
                  }
                : undefined
            }
          >
            <Tooltip direction="top" offset={[0, -48]} className="tour-map-tooltip">
              <span className="font-semibold">{dest.name}</span>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

export type SriLankaTourMapProps = {
  destinations?: TourDestination[];
  itineraryRoute?: TourItineraryRoute | null;
  /** Real road-network geometry (ORS / OSRM). Preferred over straight stop lines. */
  roadRoute?: TourRoadRoute | null;
  routes?: TourMapRoute[];
  activeStopId?: string | null;
  focusStopId?: string | null;
  focusToken?: number;
  resetToken?: number;
  animateRoute?: boolean;
  hoveredSlug?: string | null;
  selectedSlug?: string | null;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
  onHoverStop?: (stopId: string | null) => void;
  onSelectStop?: (stopId: string) => void;
  onMapReady?: (map: L.Map) => void;
  className?: string;
  heightClass?: string;
  compact?: boolean;
  interactive?: boolean;
};

/**
 * Premium chauffeur journey map — road-network routes, Q Pick pins, segment highlight.
 */
export function SriLankaTourMap({
  destinations = [],
  itineraryRoute = null,
  roadRoute = null,
  routes = [],
  activeStopId = null,
  focusStopId = null,
  focusToken = 0,
  resetToken = 0,
  animateRoute = true,
  hoveredSlug = null,
  selectedSlug = null,
  onHover,
  onSelect,
  onHoverStop,
  onSelectStop,
  onMapReady,
  className = "",
  heightClass,
  compact = false,
  interactive = true,
}: SriLankaTourMapProps) {
  const resolvedHeight =
    heightClass ??
    (compact
      ? "h-40 w-full"
      : "h-[min(68vh,560px)] w-full min-h-[320px]");

  const roadCoords = roadRoute?.coordinates ?? [];
  const primaryCoords =
    roadCoords.length >= 2
      ? roadCoords
      : (itineraryRoute?.coordinates ??
        routes.find((r) => r.selected)?.coordinates ??
        routes[0]?.coordinates ??
        []);

  const focusStop =
    itineraryRoute?.stops.find((s) => s.id === focusStopId) ?? null;

  const hasRoadNetwork = Boolean(roadRoute && roadRoute.coordinates.length >= 2);

  return (
    <div
      className={`tour-sri-lanka-map relative overflow-hidden rounded-[1.25rem] ${resolvedHeight} ${className}`}
    >
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={14}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        attributionControl
        className="h-full w-full bg-[#e8eef4]"
        style={{ height: "100%", width: "100%" }}
      >
        {/* Premium light basemap with strong road contrast */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        {onMapReady ? <MapApiBridge onReady={onMapReady} /> : null}
        <FitRoute
          coordinates={
            primaryCoords.length
              ? primaryCoords
              : destinations.map((d) => [d.lat, d.lng] as [number, number])
          }
          resetToken={resetToken}
        />
        <FlyToStop stop={focusStop} focusToken={focusToken} />

        {itineraryRoute ? (
          <>
            {hasRoadNetwork && roadRoute ? (
              <RoadLegsLayer
                key={`${roadRoute.provider}-${roadRoute.coordinates.length}`}
                roadRoute={roadRoute}
                activeStopId={activeStopId}
                animate={animateRoute}
              />
            ) : null}
            <ItineraryMarkers
              stops={itineraryRoute.stops}
              activeStopId={activeStopId}
              onHoverStop={onHoverStop}
              onSelectStop={onSelectStop}
              interactive={interactive}
            />
          </>
        ) : (
          <>
            {routes.map((route) => {
              const coords = filterValidLatLngTuples(route.coordinates);
              if (coords.length < 2) return null;
              return (
                <Polyline
                  key={route.id}
                  positions={coords}
                  className={
                    route.selected
                      ? "tour-route-line tour-route-line--active"
                      : "tour-route-line"
                  }
                  pathOptions={{
                    color: route.selected ? BRAND_BLUE : "#5b8def",
                    weight: route.selected ? 5 : 3,
                    opacity: route.selected ? 0.95 : 0.55,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                >
                  <Tooltip sticky className="tour-map-tooltip">
                    {route.label}
                  </Tooltip>
                </Polyline>
              );
            })}
            <DestinationPins
              destinations={destinations}
              hoveredSlug={hoveredSlug}
              selectedSlug={selectedSlug}
              onHover={onHover}
              onSelect={onSelect}
              interactive={interactive}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}

/** @deprecated Prefer getPackageItineraryRoute / buildItineraryRoute */
export function buildPackageRouteCoordinates(
  destinationSlugs: string[],
  destinations: TourDestination[],
  bookendAirport = true,
): [number, number][] {
  const stops = destinationSlugs
    .map((slug) => destinations.find((d) => d.slug === slug))
    .filter((d): d is TourDestination => d != null)
    .map((d) => [d.lat, d.lng] as [number, number]);
  if (stops.length === 0) return [];
  if (!bookendAirport) return stops;
  return [CMB_AIRPORT, ...stops, CMB_AIRPORT];
}
