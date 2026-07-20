"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type L from "leaflet";
import { useTourRoadRoute } from "@/hooks/use-tour-road-route";
import type { TourItineraryRoute } from "@/lib/tours/itinerary-route";
import { getTourGoogleMapsUrl } from "@/lib/tours/road-route";
import { getPackageBySlug } from "@/lib/tours/repository";
import type { TourVehicle } from "@/lib/tours/types";

type AnimatedRouteMapProps = {
  itineraryRoute: TourItineraryRoute;
  title?: string;
  className?: string;
  vehicle?: TourVehicle | null;
  durationDays?: number;
};

const MapDynamic = dynamic(
  () =>
    import("@/components/tours/maps/sri-lanka-tour-map").then(
      (m) => m.SriLankaTourMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(56vh,480px)] min-h-[300px] w-full items-center justify-center bg-[#e8eef3] text-sm text-ink/45">
        Preparing chauffeur route…
      </div>
    ),
  },
);

export function AnimatedRouteMap({
  itineraryRoute,
  title,
  className = "",
  vehicle = null,
  durationDays,
}: AnimatedRouteMapProps) {
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [focusStopId, setFocusStopId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapShellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const { route: roadRoute, loading: routeLoading, error: routeError } =
    useTourRoadRoute(itineraryRoute);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const heading = title ?? itineraryRoute.packageTitle;
  const days =
    durationDays ??
    getPackageBySlug(itineraryRoute.packageSlug)?.durationDays ??
    itineraryRoute.destinationStops.length;

  const mapsUrl = useMemo(
    () => getTourGoogleMapsUrl(itineraryRoute.stops),
    [itineraryRoute.stops],
  );

  const listItems = useMemo(() => {
    const pkg = getPackageBySlug(itineraryRoute.packageSlug);
    const pkgDays = pkg?.itinerary ?? [];
    const items: {
      key: string;
      stopId: string;
      day: number | null;
      label: string;
      sub: string;
      kind: "airport" | "destination";
      number: string;
    }[] = [];

    for (const stop of itineraryRoute.stops) {
      if (stop.id === "airport-end") {
        items.push({
          key: stop.id,
          stopId: stop.id,
          day: null,
          label: stop.label,
          sub: "Private transfer to CMB",
          kind: "airport",
          number: stop.markerLabel,
        });
        continue;
      }
      if (stop.kind === "airport") {
        items.push({
          key: stop.id,
          stopId: stop.id,
          day: null,
          label: stop.label,
          sub: "Meet your chauffeur",
          kind: "airport",
          number: stop.markerLabel,
        });
        continue;
      }

      const dayList =
        stop.days.length > 0
          ? stop.days
          : stop.day != null
            ? [stop.day]
            : [];

      for (const day of dayList) {
        const dayMeta = pkgDays.find((d) => d.day === day);
        items.push({
          key: `day-${day}`,
          stopId: stop.id,
          day,
          label: stop.label,
          sub: dayMeta?.title ?? stop.dayTitle ?? `Day ${day}`,
          kind: "destination",
          number: stop.markerLabel,
        });
      }
    }
    return items;
  }, [itineraryRoute]);

  const destinationCount = itineraryRoute.destinationStops.length;

  const scrollToItineraryDay = useCallback((day: number | null, stopId: string) => {
    if (day != null) {
      const chapter = document.getElementById(`itinerary-day-${day}`);
      if (chapter) {
        chapter.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const dayRow = document.getElementById(`route-stop-day-${day}`);
      dayRow?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    document
      .getElementById(`route-stop-${stopId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  function activateFromList(stopId: string, day: number | null) {
    setActiveStopId(stopId);
    setActiveDay(day);
    setFocusStopId(stopId);
    setFocusToken((t) => t + 1);
  }

  function activateFromMarker(stopId: string) {
    const stop = itineraryRoute.stops.find((s) => s.id === stopId);
    const day = stop?.day ?? stop?.days[0] ?? null;
    setActiveStopId(stopId);
    setActiveDay(day);
    setFocusStopId(stopId);
    setFocusToken((t) => t + 1);
    scrollToItineraryDay(day, stopId);
  }

  function resetRoute() {
    setActiveStopId(null);
    setActiveDay(null);
    setFocusStopId(null);
    setResetToken((t) => t + 1);
    mapRef.current?.closePopup();
  }

  async function toggleFullscreen() {
    const el = mapShellRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(false);
    }
  }

  const onMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const stats = [
    {
      label: "Distance",
      value: routeLoading
        ? "…"
        : roadRoute?.distanceText && roadRoute.distanceKm > 0
          ? roadRoute.distanceText
          : "—",
    },
    {
      label: "Drive time",
      value: routeLoading
        ? "…"
        : roadRoute?.durationText && roadRoute.durationSeconds > 0
          ? roadRoute.durationText
          : "—",
    },
    {
      label: "Destinations",
      value: String(destinationCount),
    },
    {
      label: "Days",
      value: String(days),
    },
    {
      label: "Vehicle",
      value: vehicle?.name ?? "Private",
    },
  ];

  return (
    <div
      className={`overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white shadow-[0_16px_40px_rgb(10_22_32_/_0.06)] ${className}`}
    >
      {/* Route statistics */}
      <div className="grid grid-cols-2 gap-px border-b border-ink/8 bg-ink/[0.04] sm:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white px-3 py-3 text-center sm:px-4 sm:py-3.5"
          >
            <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink/40 uppercase">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-sm font-semibold tracking-tight text-ink sm:text-[0.9375rem]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
        <div ref={mapShellRef} className="relative min-h-[300px] bg-[#e8eef3] p-2 sm:p-3">
          <MapDynamic
            itineraryRoute={itineraryRoute}
            roadRoute={roadRoute}
            activeStopId={activeStopId}
            focusStopId={focusStopId}
            focusToken={focusToken}
            resetToken={resetToken}
            animateRoute
            interactive
            onHoverStop={setActiveStopId}
            onSelectStop={activateFromMarker}
            onMapReady={onMapReady}
            heightClass="h-[min(56vh,480px)] w-full min-h-[300px]"
            className="rounded-[1rem]"
          />

          {/* Map controls */}
          <div className="pointer-events-none absolute top-4 right-4 z-[1000] flex flex-col gap-2 sm:top-5 sm:right-5">
            <ControlButton
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => void toggleFullscreen()}
            >
              {isFullscreen ? "↘" : "⛶"}
            </ControlButton>
            <ControlButton label="Reset route" onClick={resetRoute}>
              ↺
            </ControlButton>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 bg-white/95 text-sm font-semibold text-ink shadow-[0_8px_20px_rgb(10_22_32_/_0.12)] backdrop-blur-sm transition hover:border-brand/30 hover:text-brand"
              aria-label="Open in Google Maps"
              title="Open in Google Maps"
            >
              G
            </a>
          </div>

          {(routeLoading || routeError) && (
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-[1000] max-w-[90%] -translate-x-1/2 rounded-full bg-map-void/85 px-4 py-2 text-center text-[0.6875rem] font-medium text-white shadow-lg">
              {routeLoading
                ? "Tracing Sri Lankan roads…"
                : "Road routing unavailable — markers still synced to your itinerary."}
            </div>
          )}
        </div>

        <div className="flex flex-col border-t border-ink/8 bg-foam/50 lg:border-t-0 lg:border-l">
          {vehicle ? (
            <div className="flex items-center gap-3 border-b border-ink/8 bg-white/70 px-5 py-4">
              <div className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden">
                <Image
                  src={vehicle.imageSrc}
                  alt={vehicle.imageAlt}
                  fill
                  className="object-contain object-center"
                  sizes="72px"
                />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-brand uppercase">
                  Your vehicle
                </p>
                <p className="truncate font-display text-base font-semibold text-ink">
                  {vehicle.name}
                </p>
                <p className="truncate text-xs text-ink/45">{vehicle.tagline}</p>
              </div>
            </div>
          ) : null}

          <div className="flex-1 p-5">
            <p className="font-mono text-[0.625rem] tracking-[0.18em] text-brand uppercase">
              Chauffeur journey
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink">
              {heading}
            </h3>
            <p className="mt-1 text-xs text-ink/45">
              Hover a day to highlight the road. Tap a pin to open that chapter.
            </p>
            <ol className="mt-4 max-h-[min(52vh,360px)] space-y-0 overflow-y-auto overscroll-contain pr-1">
              {listItems.map((item) => {
                const active =
                  activeStopId === item.stopId ||
                  (item.day != null && activeDay === item.day);
                return (
                  <li
                    key={item.key}
                    id={
                      item.day != null
                        ? `route-stop-day-${item.day}`
                        : `route-stop-${item.stopId}`
                    }
                  >
                    <button
                      type="button"
                      onMouseEnter={() => {
                        setActiveStopId(item.stopId);
                        if (item.day != null) setActiveDay(item.day);
                      }}
                      onMouseLeave={() => {
                        setActiveStopId(null);
                        setActiveDay(null);
                      }}
                      onFocus={() => {
                        setActiveStopId(item.stopId);
                        if (item.day != null) setActiveDay(item.day);
                      }}
                      onClick={() => activateFromList(item.stopId, item.day)}
                      className={`flex w-full gap-3 border-t border-ink/8 py-3 text-left text-sm transition-colors ${
                        active
                          ? "bg-brand/[0.08] text-ink"
                          : "text-ink/85 hover:bg-white/70"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${
                          active
                            ? "bg-brand text-white"
                            : "bg-ink text-white"
                        }`}
                      >
                        {item.number}
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span className="font-semibold text-ink">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-ink/45">
                          {item.day != null ? `Day ${item.day} · ` : ""}
                          {item.sub}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 bg-white/95 text-base font-semibold text-ink shadow-[0_8px_20px_rgb(10_22_32_/_0.12)] backdrop-blur-sm transition hover:border-brand/30 hover:text-brand"
    >
      {children}
    </button>
  );
}
