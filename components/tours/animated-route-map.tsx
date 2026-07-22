"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type L from "leaflet";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";
import type { TourMapStopDetail } from "@/components/tours/maps/sri-lanka-tour-map";
import { useTourMapSync } from "@/components/tours/tour-map-sync-context";
import { useTourRoadRoute } from "@/hooks/use-tour-road-route";
import type { TourItineraryRoute } from "@/lib/tours/itinerary-route";
import { getStopSchedule } from "@/lib/tours/map-stop-schedule";
import { getTourGoogleMapsUrl } from "@/lib/tours/road-route";
import {
  getDestinationBySlug,
  getPackageBySlug,
  getPackageDayChapters,
} from "@/lib/tours/repository";
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
      <div className="flex h-[min(56vh,480px)] min-h-[300px] w-full items-center justify-center rounded-[1.5rem] bg-[#eef2f6] text-sm text-ink/45">
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
  const mapSync = useTourMapSync();
  const [localStopId, setLocalStopId] = useState<string | null>(null);
  const [localDay, setLocalDay] = useState<number | null>(null);
  const activeStopId = mapSync?.activeStopId ?? localStopId;
  const activeDay = mapSync?.activeDay ?? localDay;
  const [focusStopId, setFocusStopId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);
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

  const chapters = useMemo(
    () => getPackageDayChapters(itineraryRoute.packageSlug),
    [itineraryRoute.packageSlug],
  );

  const mapsUrl = useMemo(
    () => getTourGoogleMapsUrl(itineraryRoute.stops),
    [itineraryRoute.stops],
  );

  const stopDetails = useMemo(() => {
    const details: Record<string, TourMapStopDetail> = {};
    const lastDest =
      itineraryRoute.destinationStops[itineraryRoute.destinationStops.length - 1];

    for (const stop of itineraryRoute.stops) {
      const day = stop.day ?? stop.days[0] ?? null;
      const chapter = day != null ? chapters.find((c) => c.day === day) : null;
      const dest = stop.destinationSlug
        ? getDestinationBySlug(stop.destinationSlug)
        : null;
      const schedule = getStopSchedule(stop, {
        isLastDestination: lastDest?.id === stop.id,
        dayIndex: day ?? undefined,
      });

      details[stop.id] = {
        imageSrc: chapter?.imageSrc ?? dest?.imageSrc,
        imageAlt: chapter?.imageAlt ?? dest?.imageAlt,
        day,
        arrivalTime: schedule.arrivalTime,
        departureTime: schedule.departureTime,
        description:
          chapter?.description ??
          stop.dayDescription ??
          dest?.description?.slice(0, 120),
      };
    }
    return details;
  }, [itineraryRoute, chapters]);

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

  const routeSummary = useMemo(() => {
    const parts: string[] = [];
    if (roadRoute?.distanceText && roadRoute.distanceKm > 0) {
      parts.push(roadRoute.distanceText);
    }
    if (roadRoute?.durationText && roadRoute.durationSeconds > 0) {
      parts.push(roadRoute.durationText);
    }
    parts.push(`${destinationCount} Stops`);
    parts.push(vehicle?.name ? `${vehicle.name}` : "Private Chauffeur");
    return parts.join(" • ");
  }, [roadRoute, destinationCount, vehicle?.name]);

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

  function syncHover(stopId: string | null, day: number | null) {
    if (mapSync) {
      mapSync.setActiveStop(stopId, day);
    } else {
      setLocalStopId(stopId);
      setLocalDay(day);
    }
  }

  function activateFromList(stopId: string, day: number | null) {
    syncHover(stopId, day);
    setFocusStopId(stopId);
    setFocusToken((t) => t + 1);
  }

  function activateFromMarker(stopId: string) {
    const stop = itineraryRoute.stops.find((s) => s.id === stopId);
    const day = stop?.day ?? stop?.days[0] ?? null;
    syncHover(stopId, day);
    setFocusStopId(stopId);
    setFocusToken((t) => t + 1);
    scrollToItineraryDay(day, stopId);
  }

  function handleHoverStop(stopId: string | null) {
    if (!stopId) {
      syncHover(null, null);
      return;
    }
    const stop = itineraryRoute.stops.find((s) => s.id === stopId);
    const day = stop?.day ?? stop?.days[0] ?? null;
    syncHover(stopId, day);
  }

  function resetRoute() {
    if (mapSync) {
      mapSync.clearActive();
    } else {
      setLocalStopId(null);
      setLocalDay(null);
    }
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

  return (
    <div
      className={`tour-detail-card tour-route-map-shell overflow-hidden ${className}`}
    >
      <div className="tour-route-map-summary border-b border-ink/8 bg-white/60 px-4 py-3.5 backdrop-blur-md sm:px-6">
        <p className="font-mono text-[0.5625rem] tracking-[0.18em] text-brand uppercase">
          Your private route
        </p>
        <p className="mt-1 font-display text-sm font-semibold tracking-tight text-ink sm:text-base">
          {routeLoading ? "Tracing Sri Lankan roads…" : routeSummary}
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
        <div
          ref={mapShellRef}
          className="tour-route-map-glass relative min-h-[300px] p-3 sm:p-4"
        >
          <MapDynamic
            itineraryRoute={itineraryRoute}
            roadRoute={roadRoute}
            activeStopId={activeStopId}
            focusStopId={focusStopId}
            focusToken={focusToken}
            resetToken={resetToken}
            stopDetails={stopDetails}
            animateRoute
            interactive
            onHoverStop={handleHoverStop}
            onSelectStop={activateFromMarker}
            onMapReady={onMapReady}
            heightClass="h-[min(56vh,480px)] w-full min-h-[300px]"
            className="rounded-[1.35rem] shadow-[0_20px_50px_rgb(10_22_32_/_0.12)]"
          />

          <div className="pointer-events-none absolute top-5 right-5 z-[1000] flex flex-col gap-2 sm:top-6 sm:right-6">
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
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-sm font-semibold text-ink shadow-[0_8px_24px_rgb(10_22_32_/_0.14)] backdrop-blur-md transition hover:border-brand/30 hover:text-brand"
              aria-label="Open in Google Maps"
              title="Open in Google Maps"
            >
              G
            </a>
          </div>

          {routeError ? (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-[1000] max-w-[90%] -translate-x-1/2 rounded-full bg-map-void/85 px-4 py-2 text-center text-[0.6875rem] font-medium text-white shadow-lg backdrop-blur-sm">
              Road routing unavailable — markers still synced to your itinerary.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col border-t border-ink/8 bg-foam/40 lg:border-t-0 lg:border-l">
          {vehicle ? (
            <div className="border-b border-ink/8 bg-white/70 px-4 py-4 sm:px-5">
              <p className="font-mono text-[0.5625rem] tracking-[0.16em] text-brand uppercase">
                Your vehicle
              </p>
              <div className="mt-2.5">
                <VehicleCarouselCard
                  id={vehicle.fleetIconId ?? vehicle.id}
                  selected
                  displayOnly
                  name={vehicle.name}
                  passengers={vehicle.passengers}
                  luggage={vehicle.luggage}
                  showEta={false}
                  showDayNightBadge={false}
                  fluid
                />
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
              {days} days · hover a stop to preview · tap to jump to that day
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
                      onMouseEnter={() => syncHover(item.stopId, item.day)}
                      onMouseLeave={() => syncHover(null, null)}
                      onFocus={() => syncHover(item.stopId, item.day)}
                      onClick={() => activateFromList(item.stopId, item.day)}
                      className={`flex w-full gap-3 rounded-xl border-t border-ink/8 py-3 text-left text-sm transition-all ${
                        active
                          ? "bg-brand/[0.1] text-ink shadow-[inset_0_0_0_1px_rgb(0_98_250_/_0.2)]"
                          : "text-ink/85 hover:bg-white/80"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${
                          active ? "bg-brand text-white" : "bg-ink text-white"
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
      className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-base font-semibold text-ink shadow-[0_8px_24px_rgb(10_22_32_/_0.14)] backdrop-blur-md transition hover:border-brand/30 hover:text-brand"
    >
      {children}
    </button>
  );
}
