"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SriLankaTourMapDynamic } from "@/components/tours/maps/sri-lanka-tour-map-dynamic";
import type { TourMapRoute } from "@/components/tours/maps/sri-lanka-tour-map";
import { useActiveDestination } from "@/lib/hooks/use-active-destination";
import { buildItineraryRoute } from "@/lib/tours/itinerary-route";
import type { TourDestination, TourPackage } from "@/lib/tours/types";

type IslandExplorerMapProps = {
  destinations: TourDestination[];
  packages: TourPackage[];
  onDestinationSelect?: (slug: string | null) => void;
  selectedSlug?: string | null;
};

type DestinationPanelProps = {
  destination: TourDestination;
  selectedSlug: string | null;
  cardRelatedPackages: TourPackage[];
  reduceMotion: boolean;
  onCardEnter: () => void;
  onCardLeave: () => void;
};

const DestinationPanel = memo(
  function DestinationPanel({
    destination,
    selectedSlug,
    cardRelatedPackages,
    reduceMotion,
    onCardEnter,
    onCardLeave,
  }: DestinationPanelProps) {
    const displayedSlugRef = useRef(destination.slug);
    const shouldFadeIn = displayedSlugRef.current !== destination.slug;
    displayedSlugRef.current = destination.slug;

    return (
      <motion.article
        layout={false}
        onPointerEnter={onCardEnter}
        onPointerLeave={onCardLeave}
        className="flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-[0_20px_50px_rgb(10_22_32_/_0.08)]"
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <motion.div
            key={destination.slug}
            className="absolute inset-0"
            initial={shouldFadeIn && !reduceMotion ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
          >
            <Image
              src={destination.imageSrc}
              alt={destination.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-map-void/85 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-foam">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-[0.625rem] tracking-wide text-brand-bright uppercase">
                  {destination.province}
                </p>
                {destination.unesco ? (
                  <span className="rounded-full bg-foam/15 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase backdrop-blur-sm">
                    UNESCO
                  </span>
                ) : null}
              </div>
              <h4 className="mt-1 font-display text-2xl font-semibold">
                {destination.name}
              </h4>
            </div>
          </motion.div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <p className="text-sm leading-relaxed text-ink/60">
            {destination.description}
          </p>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-[1rem] bg-foam px-3 py-2.5">
              <dt className="tracking-wide text-ink/40 uppercase">Best season</dt>
              <dd className="mt-1 font-semibold text-ink">
                {destination.bestSeason}
              </dd>
            </div>
            <div className="rounded-[1rem] bg-foam px-3 py-2.5">
              <dt className="tracking-wide text-ink/40 uppercase">
                From Colombo
              </dt>
              <dd className="mt-1 font-semibold text-ink">
                {destination.driveFromColomboLabel}
              </dd>
            </div>
          </dl>
          <div>
            <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
              Popular attractions
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {destination.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full border border-ink/8 px-2.5 py-1 text-[0.6875rem] text-ink/55"
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
          {selectedSlug === destination.slug && cardRelatedPackages.length > 0 ? (
            <div className="mt-auto border-t border-ink/6 pt-4">
              <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
                Tours that visit {destination.name}
              </p>
              <ul className="mt-2 space-y-1.5">
                {cardRelatedPackages.map((pkg) => (
                  <li key={pkg.slug}>
                    <Link
                      href={`/tours/${pkg.slug}`}
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      {pkg.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-auto text-xs text-ink/40">
              Click the pin to draw that package&apos;s itinerary route through{" "}
              {destination.name}.
            </p>
          )}
        </div>
      </motion.article>
    );
  },
  (prev, next) =>
    prev.destination.slug === next.destination.slug &&
    prev.selectedSlug === next.selectedSlug &&
    prev.reduceMotion === next.reduceMotion &&
    prev.onCardEnter === next.onCardEnter &&
    prev.onCardLeave === next.onCardLeave &&
    prev.cardRelatedPackages.length === next.cardRelatedPackages.length &&
    prev.cardRelatedPackages.every(
      (pkg, index) => pkg.slug === next.cardRelatedPackages[index]?.slug,
    ),
);

const ExplorerMapView = memo(
  function ExplorerMapView({
    destinations,
    activeDestination,
    focusDestinationSlug,
    mapRoutes,
    resetToken,
    onHover,
    onSelect,
  }: {
    destinations: TourDestination[];
    activeDestination: string | null;
    focusDestinationSlug: string | null;
    mapRoutes: TourMapRoute[];
    resetToken: number;
    onHover: (slug: string | null) => void;
    onSelect: (slug: string) => void;
  }) {
    return (
      <SriLankaTourMapDynamic
        destinations={destinations}
        destinationExplorer
        routes={mapRoutes}
        animateRoute={mapRoutes.length > 0}
        activeDestinationSlug={activeDestination}
        focusDestinationSlug={focusDestinationSlug}
        resetToken={resetToken}
        onHover={onHover}
        onSelect={onSelect}
        className="rounded-[1.35rem] shadow-[0_20px_50px_rgb(10_22_32_/_0.12)]"
      />
    );
  },
  (prev, next) =>
    prev.activeDestination === next.activeDestination &&
    prev.focusDestinationSlug === next.focusDestinationSlug &&
    prev.resetToken === next.resetToken &&
    prev.destinations === next.destinations &&
    prev.mapRoutes === next.mapRoutes &&
    prev.onHover === next.onHover &&
    prev.onSelect === next.onSelect,
);

export function IslandExplorerMap({
  destinations,
  packages,
  onDestinationSelect,
  selectedSlug: controlledSlug,
}: IslandExplorerMapProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [internalSlug, setInternalSlug] = useState<string | null>(null);
  const selectedSlug =
    controlledSlug !== undefined ? controlledSlug : internalSlug;

  const {
    activeDestination,
    activate,
    onMarkerEnter,
    onMarkerLeave,
    onCardEnter,
    onCardLeave,
    reset: resetActive,
  } = useActiveDestination(120, selectedSlug);

  const [focusDestinationSlug, setFocusDestinationSlug] = useState<string | null>(
    null,
  );
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    if (!activeDestination) return;
    setFocusDestinationSlug((prev) =>
      prev === activeDestination ? prev : activeDestination,
    );
  }, [activeDestination]);

  const resetMap = useCallback(() => {
    resetActive();
    setFocusDestinationSlug(null);
    setResetToken((t) => t + 1);
    if (controlledSlug === undefined) setInternalSlug(null);
    onDestinationSelect?.(null);
  }, [controlledSlug, onDestinationSelect, resetActive]);

  const destinationBySlug = useMemo(() => {
    const map = new Map<string, TourDestination>();
    for (const dest of destinations) {
      map.set(dest.slug, dest);
    }
    return map;
  }, [destinations]);

  const activeDest = activeDestination
    ? (destinationBySlug.get(activeDestination) ?? null)
    : null;

  const handleMapHover = useCallback(
    (slug: string | null) => {
      if (slug) {
        onMarkerEnter(slug);
      } else {
        onMarkerLeave();
      }
    },
    [onMarkerEnter, onMarkerLeave],
  );

  const select = useCallback(
    (slug: string) => {
      const next = selectedSlug === slug ? null : slug;
      if (controlledSlug === undefined) setInternalSlug(next);
      onDestinationSelect?.(next);
      activate(next);
    },
    [controlledSlug, onDestinationSelect, selectedSlug, activate],
  );

  const relatedPackages = useMemo(() => {
    if (!selectedSlug) return [];
    return packages.filter((p) => p.destinationSlugs.includes(selectedSlug));
  }, [packages, selectedSlug]);

  const primaryRoute = useMemo(() => {
    if (!selectedSlug || relatedPackages.length === 0) return null;
    return buildItineraryRoute(relatedPackages[0], destinations, {
      bookendAirport: true,
    });
  }, [selectedSlug, relatedPackages, destinations]);

  const mapRoutes = useMemo((): TourMapRoute[] => {
    if (!primaryRoute?.coordinates?.length || !selectedSlug) return [];
    return [
      {
        id: `route-${selectedSlug}`,
        label: relatedPackages[0]?.title ?? "",
        coordinates: primaryRoute.coordinates,
        selected: true,
      },
    ];
  }, [primaryRoute, selectedSlug, relatedPackages]);

  const routeSummary = useMemo(() => {
    if (!primaryRoute) return "Select a destination to reveal a chauffeur route";
    const stops = primaryRoute.destinationStops.length;
    return `${stops} stops · ${relatedPackages[0]?.durationDays ?? "—"} days · Private chauffeur`;
  }, [primaryRoute, relatedPackages]);

  const cardRelatedPackages = useMemo(() => {
    if (!activeDest) return [];
    if (selectedSlug === activeDest.slug) return relatedPackages;
    return packages.filter((p) => p.destinationSlugs.includes(activeDest.slug));
  }, [activeDest, selectedSlug, relatedPackages, packages]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-8">
      <div className="tour-route-map-shell overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/75 shadow-[0_24px_60px_rgb(10_22_32_/_0.1)] backdrop-blur-xl">
        <div className="border-b border-ink/6 bg-white/50 px-5 py-4 backdrop-blur-md sm:px-6">
          <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
            Explore the island
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Interactive Sri Lanka map
          </h3>
          <p className="mt-2 font-display text-sm font-medium text-ink/70">
            {routeSummary}
          </p>
        </div>
        <div className="tour-route-map-glass relative p-3 sm:p-4">
          <ExplorerMapView
            destinations={destinations}
            activeDestination={activeDestination}
            focusDestinationSlug={focusDestinationSlug}
            mapRoutes={mapRoutes}
            resetToken={resetToken}
            onHover={handleMapHover}
            onSelect={select}
          />
          <div className="pointer-events-none absolute top-5 right-5 z-[1000] sm:top-6 sm:right-6">
            <button
              type="button"
              onClick={resetMap}
              className="pointer-events-auto flex h-10 items-center gap-1.5 rounded-xl border border-white/60 bg-white/90 px-3 text-xs font-semibold text-ink shadow-[0_8px_24px_rgb(10_22_32_/_0.14)] backdrop-blur-md transition hover:border-brand/30 hover:text-brand"
              aria-label="Reset map view"
            >
              <span aria-hidden>↺</span>
              Reset map
            </button>
          </div>
          {selectedSlug && relatedPackages.length > 0 ? (
            <p className="absolute bottom-6 left-6 z-[500] max-w-[min(100%,320px)] rounded-full border border-white/50 bg-map-void/80 px-3.5 py-1.5 text-[0.6875rem] font-medium text-foam shadow-lg backdrop-blur-md">
              Showing itinerary route for {relatedPackages[0].title}
              {relatedPackages.length > 1
                ? ` · +${relatedPackages.length - 1} more packages`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-[320px] flex-col">
        {activeDest ? (
          <DestinationPanel
            destination={activeDest}
            selectedSlug={selectedSlug}
            cardRelatedPackages={cardRelatedPackages}
            reduceMotion={reduceMotion}
            onCardEnter={onCardEnter}
            onCardLeave={onCardLeave}
          />
        ) : (
          <motion.div
            key="empty"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-start justify-center rounded-[1.75rem] border border-dashed border-ink/15 bg-white/70 px-6 py-10"
          >
            <p className="font-display text-xl font-semibold text-ink">
              Follow a real chauffeur journey
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/50">
              Select a destination to illuminate package routes in travel order
              — from CMB through each overnight stop and back.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
