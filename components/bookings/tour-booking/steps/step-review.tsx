"use client";

import {
  TOUR_ACCOMMODATIONS,
  TOUR_PREFERENCES,
} from "@/lib/tours/constants";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";
import {
  FLEET_VEHICLE_CAPACITY,
} from "@/components/icons/vehicles/fleet-catalog";
import { useTranslations } from "@/components/i18n/locale-provider";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import {
  addDaysISO,
  estimateTourStartingPrice,
} from "@/lib/tours/mappers";
import { getPackageBySlug, getTourPricingConfig } from "@/lib/tours/repository";
import type { TourPlannerDraft } from "../types";

type StepReviewProps = {
  draft: TourPlannerDraft;
};

export function StepReview({ draft }: StepReviewProps) {
  const t = useTranslations();
  const fleetId = draft.vehicleId;
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
  const preferenceLabels = draft.preferences
    .map((id) => TOUR_PREFERENCES.find((p) => p.id === id)?.label ?? id)
    .join(", ");
  const accommodationLabel =
    TOUR_ACCOMMODATIONS.find((a) => a.id === draft.accommodation)?.label ??
    "Not specified";

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 7
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Review your journey
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Confirm the outline before sharing your contact details. Our desk will
          refine timing and send a written quote.
        </p>
      </header>

      <div className="overflow-hidden rounded-[1.35rem] border border-ink/8 bg-white shadow-[0_12px_36px_rgb(10_22_32_/_0.06)]">
        {fleetId ? (
          <div className="p-4">
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
          </div>
        ) : null}

        <dl className="divide-y divide-ink/6">
          <Row
            label="Package"
            value={draft.packageTitle ?? "Custom private tour"}
          />
          <Row
            label="Destinations"
            value={
              draft.destinations.length
                ? draft.destinations.join(" · ")
                : "—"
            }
          />
          <Row
            label="Travel dates"
            value={`${draft.startDate}${endDate ? ` → ${endDate}` : ""} · ${draft.numberOfDays} days`}
          />
          <Row
            label="Vehicle"
            value={
              fleetId && capacity && vehicleName
                ? `${vehicleName} · ${capacity.passengers} passengers · ${capacity.luggage} bags · A/C`
                : "—"
            }
          />
          <Row label="Travellers" value={String(draft.passengers)} />
          <Row
            label="Travel style"
            value={preferenceLabels || "Open to suggestions"}
          />
          <Row label="Accommodation" value={accommodationLabel} />
          <Row
            label="Special requests"
            value={draft.specialNotes.trim() || "None"}
          />
          <Row
            label="Pricing"
            value={
              estimate != null
                ? formatTourPriceLkr(estimate)
                : pricing.quoteLabel
            }
          />
        </dl>
      </div>

      <p className="text-xs leading-relaxed text-ink/45">{pricing.quoteHint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-xs font-medium tracking-wide text-ink/40 uppercase">
        {label}
      </dt>
      <dd className="text-sm font-medium leading-relaxed text-ink">{value}</dd>
    </div>
  );
}
