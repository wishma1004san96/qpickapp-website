"use client";

import L from "leaflet";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
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

const EMPTY_ROUTE_COORDS: [number, number][] = [];

const DESTINATION_FOCUS_ZOOM = 10;

const MARKER_COLORS = {
  start: "#0062fa",
  intermediate: "#c9a227",
  destination: "#16a34a",
  return: "#dc2626",
  active: "#0062fa",
  hub: "#0a1620",
} as const;

export type TourMapRoute = {
  id: string;
  label: string;
  coordinates: [number, number][];
  selected?: boolean;
};

export type TourMapStopDetail = {
  imageSrc?: string;
  imageAlt?: string;
  day?: number | null;
  arrivalTime?: string;
  departureTime?: string;
  description?: string;
};

type MarkerRole = "start" | "intermediate" | "destination" | "return" | "hub";

function resolveMarkerRole(
  stop: TourRouteStop,
  destinationStops: TourRouteStop[],
): MarkerRole {
  if (stop.id === "airport-start") return "start";
  if (stop.id === "airport-end") return "return";
  const lastDest = destinationStops[destinationStops.length - 1];
  if (lastDest && stop.id === lastDest.id) return "destination";
  return "intermediate";
}

function markerFill(role: MarkerRole, active: boolean): string {
  if (active) return MARKER_COLORS.active;
  return MARKER_COLORS[role === "hub" ? "hub" : role];
}

function createQPickPinIcon(
  label: string,
  role: MarkerRole,
  active: boolean,
) {
  const fill = markerFill(role, active);
  const pulseClass = active ? " qpick-map-pin--pulse" : "";
  /** Fixed dimensions — icon never changes size to prevent hover flicker. */
  const visualW = 46;
  const visualH = 60;
  const hitW = 46;
  const hitH = 60;

  const svg = encodeURIComponent(
    `
    <svg xmlns="http://www.w3.org/2000/svg" width="${visualW}" height="${visualH}" viewBox="0 0 40 52">
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
    html: `<div style="width:${hitW}px;height:${hitH}px;display:flex;align-items:flex-end;justify-content:center;pointer-events:auto"><img src="data:image/svg+xml,${svg}" width="${visualW}" height="${visualH}" alt="" draggable="false" style="display:block;width:${visualW}px;height:${visualH}px" /></div>`,
    iconSize: [hitW, hitH],
    iconAnchor: [hitW / 2, hitH],
  });
}

function buildPinSvgDataUrl(markerLabel: string, active: boolean): string {
  const fill = markerFill("hub", active);
  const visualW = 46;
  const visualH = 60;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${visualW}" height="${visualH}" viewBox="0 0 40 52">
      <defs>
        <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#0a1620" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path filter="url(#s)" fill="${fill}" stroke="#ffffff" stroke-width="2.5"
        d="M20 2.5c-8.3 0-15 6.7-15 15 0 11.2 15 31.5 15 31.5S35 28.7 35 17.5c0-8.3-6.7-15-15-15z"/>
      <circle cx="20" cy="17.5" r="9.5" fill="#ffffff"/>
      <text x="20" y="21.5" text-anchor="middle" font-size="13" font-weight="700"
        font-family="system-ui,Segoe UI,sans-serif" fill="${fill}">${markerLabel}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const combinedDestinationIconCache = new Map<string, L.DivIcon>();

function createCombinedDestinationMarkerIcon(
  cacheKey: string,
  markerLabel: string,
  destinationName: string,
  offsetX: number,
  offsetY: number,
): L.DivIcon {
  const cached = combinedDestinationIconCache.get(cacheKey);
  if (cached) return cached;

  const idleSrc = buildPinSvgDataUrl(markerLabel, false);
  const activeSrc = buildPinSvgDataUrl(markerLabel, true);
  const icon = L.divIcon({
    className: "destination-marker-icon",
    html: `<div class="destination-marker"><div class="qpick-map-pin-icon"><img class="destination-marker__pin destination-marker__pin--idle" src="${idleSrc}" width="46" height="60" alt="" draggable="false" /><img class="destination-marker__pin destination-marker__pin--active" src="${activeSrc}" width="46" height="60" alt="" draggable="false" /></div><span class="tour-map-label" style="transform:translate(calc(-50% + ${offsetX}px), ${offsetY}px)">${destinationName}</span></div>`,
    iconSize: [46, 60],
    iconAnchor: [23, 60],
  });
  combinedDestinationIconCache.set(cacheKey, icon);
  return icon;
}

function createLabelIcon(
  label: string,
  offsetX: number,
  offsetY: number,
  visible: boolean,
  interactive: boolean,
) {
  const labelClass = visible
    ? "tour-map-label tour-map-label--highlight"
    : "tour-map-label";
  const opacity = visible ? 1 : 0;
  const pointerEvents = visible && interactive ? "auto" : "none";
  return L.divIcon({
    className: "tour-map-label-icon",
    html: `<span class="${labelClass}" style="transform:translate(${offsetX}px,${offsetY}px);opacity:${opacity};pointer-events:${pointerEvents}">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createDirectionIcon(bearing: number) {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="#0062fa" d="M7 1 L12 11 L7 9 L2 11 Z" transform="rotate(${bearing} 7 7)"/></svg>`,
  );
  return L.divIcon({
    className: "tour-map-direction-icon",
    html: `<img src="data:image/svg+xml,${svg}" width="14" height="14" alt="" draggable="false" />`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function bearingDegrees(
  from: [number, number],
  to: [number, number],
): number {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const dLng = ((to[1] - from[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function computeLabelOffsets(
  stops: { id: string; lat: number; lng: number; label: string }[],
): Map<string, { x: number; y: number }> {
  const offsets = new Map<string, { x: number; y: number }>();
  const groups = new Map<string, typeof stops>();

  for (const stop of stops) {
    const key = `${stop.lat.toFixed(2)},${stop.lng.toFixed(2)}`;
    const group = groups.get(key) ?? [];
    group.push(stop);
    groups.set(key, group);
  }

  const patterns = [
    { x: 0, y: 10 },
    { x: 14, y: 4 },
    { x: -14, y: 4 },
    { x: 0, y: -6 },
    { x: 20, y: 12 },
    { x: -20, y: 12 },
  ];

  for (const group of groups.values()) {
    group.forEach((stop, index) => {
      offsets.set(stop.id, patterns[index % patterns.length] ?? { x: 0, y: 10 });
    });
  }

  return offsets;
}

function FitRoute({
  coordinates,
  resetToken,
  resetOnly = false,
}: {
  coordinates: [number, number][];
  resetToken: number;
  resetOnly?: boolean;
}) {
  const map = useMap();
  const lastFitKeyRef = useRef("");

  useEffect(() => {
    if (resetOnly) {
      if (resetToken <= 0) return;
      const fitKey = `reset-only|${resetToken}`;
      if (fitKey === lastFitKeyRef.current) return;
      lastFitKeyRef.current = fitKey;
      map.fitBounds(SRI_LANKA_BOUNDS, { padding: [24, 24], animate: true });
      return;
    }

    const pts = filterValidLatLngTuples(coordinates);
    const fitKey = `${resetToken}|${pts.map((p) => p.join(",")).join(";")}`;
    if (fitKey === lastFitKeyRef.current) return;
    lastFitKeyRef.current = fitKey;

    if (pts.length >= 2) {
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 11, animate: true });
    } else if (pts.length === 1) {
      map.setView(pts[0], DESTINATION_FOCUS_ZOOM, { animate: true });
    } else if (resetToken > 0) {
      map.fitBounds(SRI_LANKA_BOUNDS, { padding: [24, 24], animate: true });
    }
  }, [map, coordinates, resetToken, resetOnly]);

  return null;
}

function FlyToDestination({
  destination,
  focusSlug,
  resetToken,
  disabled,
}: {
  destination: TourDestination | null;
  focusSlug: string | null;
  resetToken: number;
  disabled?: boolean;
}) {
  const map = useMap();
  const lastFlownSlugRef = useRef<string | null>(null);
  const lastResetTokenRef = useRef(resetToken);

  useEffect(() => {
    if (lastResetTokenRef.current !== resetToken) {
      lastResetTokenRef.current = resetToken;
      lastFlownSlugRef.current = null;
    }
  }, [resetToken]);

  useEffect(() => {
    if (disabled || !destination || !focusSlug) return;
    if (lastFlownSlugRef.current === focusSlug) return;
    lastFlownSlugRef.current = focusSlug;
    map.flyTo([destination.lat, destination.lng], DESTINATION_FOCUS_ZOOM, {
      duration: 0.7,
    });
  }, [map, destination, focusSlug, resetToken, disabled]);

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
      duration: 0.85,
    });
  }, [map, stop, focusToken]);
  return null;
}

function MapApiBridge({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function VisibleObserver({
  onVisible,
}: {
  onVisible: (visible: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    const observer = new IntersectionObserver(
      ([entry]) => onVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [map, onVisible]);

  return null;
}

function AnimatedRoadLine({
  coordinates,
  animate,
  visible,
}: {
  coordinates: [number, number][];
  animate: boolean;
  visible: boolean;
}) {
  const safe = useMemo(
    () => filterValidLatLngTuples(coordinates),
    [coordinates],
  );
  const [visibleCount, setVisibleCount] = useState(2);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!animate || !visible || safe.length < 2 || hasAnimated) return undefined;
    const step = Math.max(3, Math.ceil(safe.length / 72));
    let n = Math.min(20, safe.length);
    let intervalId = 0;
    const startId = window.setTimeout(() => {
      setVisibleCount(n);
      intervalId = window.setInterval(() => {
        n = Math.min(n + step, safe.length);
        setVisibleCount(n);
        if (n >= safe.length) {
          window.clearInterval(intervalId);
          setHasAnimated(true);
        }
      }, 32);
    }, 120);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [animate, visible, safe, hasAnimated]);

  const positions =
    !animate || !visible || hasAnimated || safe.length < 2
      ? safe
      : safe.slice(0, Math.max(2, Math.min(visibleCount, safe.length)));

  const directionPoints = useMemo(() => {
    if (positions.length < 4) return [];
    const out: { pos: [number, number]; bearing: number }[] = [];
    const slots = [0.2, 0.45, 0.7, 0.9];
    for (const slot of slots) {
      const index = Math.min(
        positions.length - 2,
        Math.max(1, Math.floor(positions.length * slot)),
      );
      const from = positions[index];
      const to = positions[index + 1];
      if (!from || !to) continue;
      out.push({ pos: from, bearing: bearingDegrees(from, to) });
    }
    return out;
  }, [positions]);

  if (positions.length < 2) return null;

  return (
    <>
      <Polyline
        key={animate && !hasAnimated ? `road-${visibleCount}` : "road-full"}
        positions={positions}
        className="tour-route-line tour-route-line--active"
        pathOptions={{
          color: "#0062fa",
          weight: 5,
          opacity: 0.92,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {directionPoints.map((point, i) => (
        <Marker
          key={`dir-${i}`}
          position={point.pos}
          icon={createDirectionIcon(point.bearing)}
          interactive={false}
          zIndexOffset={50}
        />
      ))}
    </>
  );
}

function ItineraryMarkers({
  stops,
  destinationStops,
  activeStopId,
  stopDetails,
  onHoverStop,
  onSelectStop,
  interactive,
}: {
  stops: TourRouteStop[];
  destinationStops: TourRouteStop[];
  activeStopId: string | null;
  stopDetails?: Record<string, TourMapStopDetail>;
  onHoverStop?: (stopId: string | null) => void;
  onSelectStop?: (stopId: string) => void;
  interactive: boolean;
}) {
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

  const labelOffsets = useMemo(
    () =>
      computeLabelOffsets(
        rendered.map((s) => ({
          id: s.id,
          lat: s.lat,
          lng: s.lng,
          label: s.label,
        })),
      ),
    [rendered],
  );

  return (
    <>
      {rendered.map((stop) => {
        const active = activeStopId === stop.id;
        const role = resolveMarkerRole(stop, destinationStops);
        const icon = createQPickPinIcon(stop.markerLabel, role, active);
        const offset = labelOffsets.get(stop.id) ?? { x: 0, y: 10 };

        return (
          <MarkerWithLabel
            key={stop.id}
            stop={stop}
            icon={icon}
            labelIcon={createLabelIcon(stop.label, offset.x, offset.y, true, false)}
            active={active}
            detail={stopDetails?.[stop.id]}
            interactive={interactive}
            onHoverStop={onHoverStop}
            onSelectStop={onSelectStop}
          />
        );
      })}
    </>
  );
}

function MarkerWithLabel({
  stop,
  icon,
  labelIcon,
  active,
  interactive,
  onHoverStop,
  onSelectStop,
}: {
  stop: TourRouteStop;
  icon: L.DivIcon;
  labelIcon: L.DivIcon;
  active: boolean;
  detail?: TourMapStopDetail;
  interactive: boolean;
  onHoverStop?: (stopId: string | null) => void;
  onSelectStop?: (stopId: string) => void;
}) {
  const onHoverStopRef = useRef(onHoverStop);
  const onSelectStopRef = useRef(onSelectStop);
  onHoverStopRef.current = onHoverStop;
  onSelectStopRef.current = onSelectStop;

  const eventHandlers = useMemo(
    () =>
      interactive
        ? {
            mouseenter: () => onHoverStopRef.current?.(stop.id),
            mouseleave: () => onHoverStopRef.current?.(null),
            click: (e: L.LeafletMouseEvent) => {
              L.DomEvent.stopPropagation(e.originalEvent);
              onSelectStopRef.current?.(stop.id);
            },
          }
        : undefined,
    [interactive, stop.id],
  );

  return (
    <>
      <Marker
        position={[stop.lat, stop.lng]}
        icon={icon}
        zIndexOffset={active ? 1200 : stop.kind === "airport" ? 200 : 400}
        eventHandlers={eventHandlers}
      />
      <Marker
        position={[stop.lat, stop.lng]}
        icon={labelIcon}
        interactive={false}
        zIndexOffset={active ? 1100 : 100}
      />
    </>
  );
}

function HoverCardLayer({
  stop,
  detail,
}: {
  stop: TourRouteStop;
  detail: TourMapStopDetail;
}) {
  const map = useMap();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(map.getContainer().closest(".tour-sri-lanka-map") as HTMLElement);
  }, [map]);

  useEffect(() => {
    function update() {
      const point = map.latLngToContainerPoint([stop.lat, stop.lng]);
      setPos({ x: point.x, y: point.y });
    }
    update();
    map.on("move zoom", update);
    return () => {
      map.off("move zoom", update);
    };
  }, [map, stop.lat, stop.lng]);

  if (!host) return null;

  return createPortal(
    <div
      className="tour-map-hover-card"
      style={{
        left: pos.x,
        top: pos.y - 72,
      }}
    >
      {detail.imageSrc ? (
        <div
          className="tour-map-hover-card__image"
          style={{ backgroundImage: `url(${detail.imageSrc})` }}
          role="img"
          aria-label={detail.imageAlt ?? stop.label}
        />
      ) : null}
      <div className="tour-map-hover-card__body">
        <p className="tour-map-hover-card__eyebrow">
          {detail.day != null ? `Day ${detail.day}` : `Stop ${stop.markerLabel}`}
        </p>
        <p className="tour-map-hover-card__title">{stop.label}</p>
        {detail.arrivalTime ? (
          <p className="tour-map-hover-card__meta">
            <span>Arrive</span> {detail.arrivalTime}
          </p>
        ) : null}
        {detail.departureTime ? (
          <p className="tour-map-hover-card__meta">
            <span>Depart</span> {detail.departureTime}
          </p>
        ) : null}
        {detail.description ? (
          <p className="tour-map-hover-card__desc">{detail.description}</p>
        ) : null}
      </div>
    </div>,
    host,
  );
}

const DestinationPin = memo(
  function DestinationPin({
    dest,
    icon,
    isActive,
    interactive,
    onPointerEnter,
    onPointerLeave,
    onSelect,
  }: {
    dest: TourDestination;
    icon: L.DivIcon;
    isActive: boolean;
    interactive: boolean;
    onPointerEnter: (slug: string) => void;
    onPointerLeave: () => void;
    onSelect: (slug: string) => void;
  }) {
    const markerRef = useRef<L.Marker>(null);
    const callbacksRef = useRef({
      onPointerEnter,
      onPointerLeave,
      onSelect,
    });
    callbacksRef.current = { onPointerEnter, onPointerLeave, onSelect };

    const slugRef = useRef(dest.slug);
    slugRef.current = dest.slug;

    useEffect(() => {
      const root = markerRef.current
        ?.getElement()
        ?.querySelector(".destination-marker");
      root?.classList.toggle("is-active", isActive);
    }, [isActive]);

    useEffect(() => {
      if (!interactive) return undefined;
      const marker = markerRef.current;
      if (!marker) return undefined;

      let unbind: (() => void) | undefined;

      const bind = () => {
        unbind?.();
        const root = marker
          .getElement()
          ?.querySelector(".destination-marker") as HTMLElement | null;
        if (!root) return;

        const handleEnter = () => {
          callbacksRef.current.onPointerEnter(slugRef.current);
        };
        const handleLeave = () => {
          callbacksRef.current.onPointerLeave();
        };

        root.addEventListener("mouseenter", handleEnter);
        root.addEventListener("mouseleave", handleLeave);
        unbind = () => {
          root.removeEventListener("mouseenter", handleEnter);
          root.removeEventListener("mouseleave", handleLeave);
        };
      };

      bind();
      marker.on("add", bind);
      return () => {
        marker.off("add", bind);
        unbind?.();
      };
    }, [interactive, dest.slug]);

    const clickHandler = useMemo(
      () =>
        interactive
          ? {
              click: (e: L.LeafletMouseEvent) => {
                L.DomEvent.stopPropagation(e.originalEvent);
                callbacksRef.current.onSelect(slugRef.current);
              },
            }
          : undefined,
      [interactive],
    );

    return (
      <Marker
        ref={markerRef}
        position={[dest.lat, dest.lng]}
        icon={icon}
        zIndexOffset={300}
        eventHandlers={clickHandler}
      />
    );
  },
  (prev, next) =>
    prev.dest.slug === next.dest.slug &&
    prev.isActive === next.isActive &&
    prev.interactive === next.interactive &&
    prev.icon === next.icon,
);

const DestinationPins = memo(
  function DestinationPins({
    destinations,
    activeDestinationSlug,
    onHover,
    onSelect,
    interactive,
  }: {
    destinations: TourDestination[];
    activeDestinationSlug?: string | null;
    onHover?: (slug: string | null) => void;
    onSelect?: (slug: string) => void;
    interactive: boolean;
  }) {
    const onHoverRef = useRef(onHover);
    const onSelectRef = useRef(onSelect);
    onHoverRef.current = onHover;
    onSelectRef.current = onSelect;

    const onPointerEnter = useCallback((slug: string) => {
      onHoverRef.current?.(slug);
    }, []);

    const onPointerLeave = useCallback(() => {
      onHoverRef.current?.(null);
    }, []);

    const onSelectPin = useCallback((slug: string) => {
      onSelectRef.current?.(slug);
    }, []);

    const labelOffsets = useMemo(
      () =>
        computeLabelOffsets(
          destinations.map((d) => ({
            id: d.slug,
            lat: d.lat,
            lng: d.lng,
            label: d.name,
          })),
        ),
      [destinations],
    );

    const markerIcons = useMemo(() => {
      const icons = new Map<string, L.DivIcon>();
      destinations.forEach((dest, index) => {
        const markerLabel = String(index + 1);
        const offset = labelOffsets.get(dest.slug) ?? { x: 0, y: 10 };
        const cacheKey = `${dest.slug}|${offset.x}|${offset.y}`;
        icons.set(
          dest.slug,
          createCombinedDestinationMarkerIcon(
            cacheKey,
            markerLabel,
            dest.name,
            offset.x,
            offset.y,
          ),
        );
      });
      return icons;
    }, [destinations, labelOffsets]);

    return (
      <>
        {destinations.map((dest) => {
          const isActive = activeDestinationSlug === dest.slug;
          const icon = markerIcons.get(dest.slug);
          if (!icon) return null;
          return (
            <DestinationPin
              key={dest.slug}
              dest={dest}
              icon={icon}
              isActive={isActive}
              interactive={interactive}
              onPointerEnter={onPointerEnter}
              onPointerLeave={onPointerLeave}
              onSelect={onSelectPin}
            />
          );
        })}
      </>
    );
  },
  (prev, next) =>
    prev.activeDestinationSlug === next.activeDestinationSlug &&
    prev.interactive === next.interactive &&
    prev.destinations === next.destinations &&
    prev.onHover === next.onHover &&
    prev.onSelect === next.onSelect,
);

export type SriLankaTourMapProps = {
  destinations?: TourDestination[];
  itineraryRoute?: TourItineraryRoute | null;
  roadRoute?: TourRoadRoute | null;
  routes?: TourMapRoute[];
  activeStopId?: string | null;
  focusStopId?: string | null;
  focusToken?: number;
  resetToken?: number;
  focusDestinationSlug?: string | null;
  animateRoute?: boolean;
  activeDestinationSlug?: string | null;
  /** @deprecated Use activeDestinationSlug */
  hoveredSlug?: string | null;
  /** @deprecated Use activeDestinationSlug */
  selectedSlug?: string | null;
  stopDetails?: Record<string, TourMapStopDetail>;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
  /** Keep destination explorer pins when an itinerary route is also shown. */
  destinationExplorer?: boolean;
  onHoverStop?: (stopId: string | null) => void;
  onSelectStop?: (stopId: string) => void;
  onMapReady?: (map: L.Map) => void;
  className?: string;
  heightClass?: string;
  compact?: boolean;
  interactive?: boolean;
};

export const SriLankaTourMap = memo(function SriLankaTourMap({
  destinations = [],
  itineraryRoute = null,
  roadRoute = null,
  routes = [],
  activeStopId = null,
  focusStopId = null,
  focusToken = 0,
  resetToken = 0,
  focusDestinationSlug = null,
  animateRoute = true,
  activeDestinationSlug = null,
  hoveredSlug = null,
  selectedSlug = null,
  stopDetails,
  onHover,
  onSelect,
  destinationExplorer = false,
  onHoverStop,
  onSelectStop,
  onMapReady,
  className = "",
  heightClass,
  compact = false,
  interactive = true,
}: SriLankaTourMapProps) {
  const [routeVisible, setRouteVisible] = useState(false);

  const resolvedHeight =
    heightClass ??
    (compact
      ? "h-40 w-full"
      : "h-[min(68vh,560px)] w-full min-h-[320px]");

  const roadCoords = roadRoute?.coordinates ?? [];
  const primaryCoords = useMemo(() => {
    if (roadCoords.length >= 2) return roadCoords;
    if (itineraryRoute?.coordinates && itineraryRoute.coordinates.length >= 2) {
      return itineraryRoute.coordinates;
    }
    const routeCoords =
      routes.find((r) => r.selected)?.coordinates ?? routes[0]?.coordinates;
    if (routeCoords && routeCoords.length >= 2) return routeCoords;
    return EMPTY_ROUTE_COORDS;
  }, [roadCoords, itineraryRoute?.coordinates, routes]);

  const focusStop =
    itineraryRoute?.stops.find((s) => s.id === focusStopId) ?? null;

  const focusDestination = useMemo(
    () =>
      focusDestinationSlug
        ? (destinations.find((d) => d.slug === focusDestinationSlug) ?? null)
        : null,
    [destinations, focusDestinationSlug],
  );

  const showItineraryMarkers = Boolean(itineraryRoute) && !destinationExplorer;

  const resolvedActiveSlug =
    activeDestinationSlug ?? hoveredSlug ?? selectedSlug ?? null;

  return (
    <div
      className={`tour-sri-lanka-map tour-sri-lanka-map--luxury relative overflow-hidden rounded-[1.5rem] ${resolvedHeight} ${className}`}
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
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        {onMapReady ? <MapApiBridge onReady={onMapReady} /> : null}
        <VisibleObserver onVisible={setRouteVisible} />
        <FitRoute
          coordinates={primaryCoords}
          resetToken={resetToken}
          resetOnly={destinationExplorer}
        />
        <FlyToStop stop={focusStop} focusToken={focusToken} />
        <FlyToDestination
          destination={focusDestination}
          focusSlug={focusDestinationSlug}
          resetToken={resetToken}
          disabled={!destinationExplorer && primaryCoords.length >= 2}
        />

        {primaryCoords.length >= 2 ? (
          <AnimatedRoadLine
            coordinates={primaryCoords}
            animate={animateRoute}
            visible={routeVisible}
          />
        ) : null}

        {showItineraryMarkers ? (
          <>
            <ItineraryMarkers
              stops={itineraryRoute!.stops}
              destinationStops={itineraryRoute!.destinationStops}
              activeStopId={activeStopId}
              stopDetails={stopDetails}
              onHoverStop={onHoverStop}
              onSelectStop={onSelectStop}
              interactive={interactive}
            />
            {activeStopId && stopDetails?.[activeStopId] ? (
              <HoverCardLayer
                stop={
                  itineraryRoute!.stops.find((s) => s.id === activeStopId) ??
                  itineraryRoute!.stops[0]
                }
                detail={stopDetails[activeStopId]!}
              />
            ) : null}
          </>
        ) : (
          <>
            {routes.map((route) => {
              const coords = filterValidLatLngTuples(route.coordinates);
              if (coords.length < 2) return null;
              const skipStaticLine =
                animateRoute &&
                route.selected &&
                primaryCoords.length >= 2;
              if (skipStaticLine) return null;
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
                    color: route.selected ? "#0062fa" : "#94b8f0",
                    weight: route.selected ? 5 : 3,
                    opacity: route.selected ? 0.92 : 0.5,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              );
            })}
            <DestinationPins
              destinations={destinations}
              activeDestinationSlug={resolvedActiveSlug}
              onHover={onHover}
              onSelect={onSelect}
              interactive={interactive}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
});

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
