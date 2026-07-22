"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "@/components/i18n/locale-provider";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";
import {
  FLEET_VEHICLE_CAPACITY,
} from "@/components/icons/vehicles/fleet-catalog";
import type { QPickVehicleIconId } from "@/components/icons/vehicles/types";
import { buildItineraryRoute } from "@/lib/tours/itinerary-route";
import type { TourDestination, TourPackage } from "@/lib/tours/types";
import {
  addDaysISO,
  estimateTourStartingPrice,
} from "@/lib/tours/mappers";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import {
  getPackageBySlug,
  getTourPricingConfig,
} from "@/lib/tours/repository";
import type { TourPlannerDraft, TourPlannerStep } from "./types";

const MiniTourMap = dynamic(
  () =>
    import("@/components/tours/maps/sri-lanka-tour-map").then(
      (m) => m.SriLankaTourMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 w-full items-center justify-center bg-[#e8eef3] text-[0.6875rem] text-ink/40">
        Loading map…
      </div>
    ),
  },
);

type TourTripSummaryProps = {
  draft: TourPlannerDraft;
  step: TourPlannerStep;
  canContinue: boolean;
  submitting: boolean;
  onContinue: () => void;
  destinationsCatalog: TourDestination[];
};

export function TourTripSummary({
  draft,
  step,
  canContinue,
  submitting,
  onContinue,
  destinationsCatalog,
}: TourTripSummaryProps) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const fleetId: QPickVehicleIconId | null = draft.vehicleId;
  const capacity = fleetId ? FLEET_VEHICLE_CAPACITY[fleetId] : null;
  const vehicleName = fleetId
    ? t(`pages.ride.fleet.vehicles.${fleetId}.name`)
    : null;
  const vehicleBlurb = fleetId
    ? t(`pages.ride.fleet.vehicles.${fleetId}.blurb`)
    : null;
  const pkg = draft.packageSlug ? getPackageBySlug(draft.packageSlug) : null;
  const endDate = addDaysISO(draft.startDate, draft.numberOfDays);
  const estimate = estimateTourStartingPrice(
    pkg,
    null,
    draft.numberOfDays,
  );
  const pricing = getTourPricingConfig();
  const ctaLabel = step === "contact" ? "Submit tour request" : "Continue";

  const selectedDestsOrdered = useMemo(() => {
    return draft.destinations
      .map((name) => destinationsCatalog.find((d) => d.name === name))
      .filter((d): d is TourDestination => d != null);
  }, [draft.destinations, destinationsCatalog]);

  const summaryImage =
    selectedDestsOrdered[selectedDestsOrdered.length - 1] ??
    destinationsCatalog[0];

  const itineraryRoute = useMemo(() => {
    if (selectedDestsOrdered.length < 1) return null;
    const synthetic: TourPackage = {
      slug: "custom-planner",
      title: draft.packageTitle ?? "Custom private tour",
      durationDays: Math.max(selectedDestsOrdered.length, draft.numberOfDays),
      destinationSlugs: selectedDestsOrdered.map((d) => d.slug),
      categoryIds: ["popular"],
      vehicleId: "sedan",
      startingPriceLkr: null,
      highlights: [],
      travelTips: [],
      bestTimeToVisit: "",
      heroGalleryId: "sigiriya-hero",
      galleryIds: [],
      seo: {
        title: "",
        description: "",
        canonicalPath: "",
        ogImage: "",
        intro: "",
      },
      itinerary: selectedDestsOrdered.map((d, i) => ({
        day: i + 1,
        destinationSlug: d.slug,
        title: d.name,
        description: d.description,
      })),
      included: [],
      excluded: [],
      faqIds: [],
      relatedPackageSlugs: [],
      popular: false,
      published: true,
    };
    return buildItineraryRoute(synthetic, destinationsCatalog, {
      bookendAirport: true,
    });
  }, [
    selectedDestsOrdered,
    destinationsCatalog,
    draft.packageTitle,
    draft.numberOfDays,
  ]);

  return (
    <aside
      aria-label="Trip summary"
      className="flex flex-col overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white/90 shadow-[0_24px_60px_rgb(10_22_32_/_0.12)] backdrop-blur-xl"
    >
      <div className="relative h-36 overflow-hidden bg-map-void">
        <AnimatePresence mode="wait">
          <motion.div
            key={summaryImage?.slug ?? "empty"}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            {summaryImage ? (
              <Image
                src={summaryImage.imageSrc}
                alt={summaryImage.imageAlt}
                fill
                className="object-cover opacity-85"
                sizes="400px"
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-foam">
          <p className="text-[0.625rem] tracking-wide text-brand-bright uppercase">
            Live journey preview
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {draft.packageTitle ?? "Custom private tour"}
          </p>
        </div>
      </div>

      {itineraryRoute ? (
        <div className="border-b border-ink/6">
          <MiniTourMap
            key={itineraryRoute.coordinates.map((c) => c.join(",")).join("|")}
            itineraryRoute={itineraryRoute}
            animateRoute
            interactive={false}
            heightClass="h-40 w-full rounded-none"
          />
          <p className="bg-foam px-3 py-1.5 text-center text-[0.625rem] text-ink/40">
            Itinerary order · {draft.destinations.length} stop
            {draft.destinations.length === 1 ? "" : "s"} · CMB bookends
          </p>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
            Destinations
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {draft.destinations.length
              ? draft.destinations.join(" · ")
              : "Select destinations"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {fleetId ? (
            <motion.div
              key={fleetId}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.28 }}
            >
              <VehicleCarouselCard
                id={fleetId}
                selected
                displayOnly
                name={vehicleName ?? undefined}
                passengers={capacity?.passengers}
                luggage={capacity?.luggage}
                subtitle={vehicleBlurb ?? undefined}
                showEta={false}
                showDayNightBadge={false}
                fluid
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <dl className="grid grid-cols-2 gap-3 rounded-[1.1rem] bg-foam/90 p-3">
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Days
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {draft.numberOfDays}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Dates
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {draft.startDate}
              {endDate ? ` → ${endDate}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Vehicle
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {vehicleName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Quote
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-brand-deep">
              {formatTourPriceLkr(estimate)}
            </dd>
          </div>
        </dl>

        <ul className="space-y-2 text-xs text-ink/60">
          {[
            "Licensed private chauffeur",
            "Air-conditioned vehicle",
            "Flexible daily pacing",
            "24/7 support desk",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-brand" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={submitting || !canContinue}
          onClick={onContinue}
          className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.35)] disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            <>
              {ctaLabel}
              {step !== "contact" ? (
                <ChevronRight className="h-4 w-4" aria-hidden />
              ) : null}
            </>
          )}
        </button>
        <p className="text-center text-[0.625rem] leading-relaxed text-ink/35">
          {pricing.quoteHint}
        </p>
      </div>
    </aside>
  );
}
