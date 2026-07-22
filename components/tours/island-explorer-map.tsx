"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { SriLankaTourMapDynamic } from "@/components/tours/maps/sri-lanka-tour-map-dynamic";
import { buildItineraryRoute } from "@/lib/tours/itinerary-route";
import type { TourDestination, TourPackage } from "@/lib/tours/types";

type IslandExplorerMapProps = {
  destinations: TourDestination[];
  packages: TourPackage[];
  onDestinationSelect?: (slug: string | null) => void;
  selectedSlug?: string | null;
};

export function IslandExplorerMap({
  destinations,
  packages,
  onDestinationSelect,
  selectedSlug: controlledSlug,
}: IslandExplorerMapProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [internalSlug, setInternalSlug] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const selectedSlug =
    controlledSlug !== undefined ? controlledSlug : internalSlug;

  const activeSlug = hovered ?? selectedSlug;
  const active = destinations.find((d) => d.slug === activeSlug) ?? null;

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

  const routeSummary = useMemo(() => {
    if (!primaryRoute) return "Select a destination to reveal a chauffeur route";
    const stops = primaryRoute.destinationStops.length;
    return `${stops} stops · ${relatedPackages[0]?.durationDays ?? "—"} days · Private chauffeur`;
  }, [primaryRoute, relatedPackages]);

  function select(slug: string) {
    const next = selectedSlug === slug ? null : slug;
    if (controlledSlug === undefined) setInternalSlug(next);
    onDestinationSelect?.(next);
  }

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
          <SriLankaTourMapDynamic
            destinations={destinations}
            itineraryRoute={primaryRoute}
            animateRoute={Boolean(primaryRoute)}
            hoveredSlug={hovered}
            selectedSlug={selectedSlug}
            onHover={setHovered}
            onSelect={select}
            className="rounded-[1.35rem] shadow-[0_20px_50px_rgb(10_22_32_/_0.12)]"
          />
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
        <AnimatePresence mode="wait">
          {active ? (
            <motion.article
              key={active.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white shadow-[0_20px_50px_rgb(10_22_32_/_0.08)]"
            >
              <div className="relative aspect-[16/11]">
                <Image
                  src={active.imageSrc}
                  alt={active.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-map-void/85 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-foam">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[0.625rem] tracking-wide text-brand-bright uppercase">
                      {active.province}
                    </p>
                    {active.unesco ? (
                      <span className="rounded-full bg-foam/15 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase backdrop-blur-sm">
                        UNESCO
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-1 font-display text-2xl font-semibold">
                    {active.name}
                  </h4>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm leading-relaxed text-ink/60">
                  {active.description}
                </p>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-[1rem] bg-foam px-3 py-2.5">
                    <dt className="tracking-wide text-ink/40 uppercase">
                      Best season
                    </dt>
                    <dd className="mt-1 font-semibold text-ink">
                      {active.bestSeason}
                    </dd>
                  </div>
                  <div className="rounded-[1rem] bg-foam px-3 py-2.5">
                    <dt className="tracking-wide text-ink/40 uppercase">
                      From Colombo
                    </dt>
                    <dd className="mt-1 font-semibold text-ink">
                      {active.driveFromColomboLabel}
                    </dd>
                  </div>
                </dl>
                <div>
                  <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
                    Popular attractions
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {active.highlights.map((h) => (
                      <li
                        key={h}
                        className="rounded-full border border-ink/8 px-2.5 py-1 text-[0.6875rem] text-ink/55"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedSlug === active.slug && relatedPackages.length > 0 ? (
                  <div className="mt-auto border-t border-ink/6 pt-4">
                    <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
                      Tours that visit {active.name}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {relatedPackages.map((pkg) => (
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
                    Click the pin to draw that package&apos;s itinerary route
                    through {active.name}.
                  </p>
                )}
              </div>
            </motion.article>
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
                Select a destination to illuminate package routes in travel
                order — from CMB through each overnight stop and back.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
