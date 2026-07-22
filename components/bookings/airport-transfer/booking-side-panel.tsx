"use client";

import {
  Check,
  ChevronRight,
  Clock3,
  Headphones,
  Loader2,
  Plane,
  Shield,
  UserRound,
} from "lucide-react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";
import { RideMapDynamic } from "@/components/maps/RideMapDynamic";
import { AIRPORT_ORIGIN, formatAirportFare } from "@/lib/airport-rates";
import type {
  ArrivalInfo,
  BookingStep,
  PassengerInfo,
  SelectedDestination,
  VehicleId,
} from "./types";
import { useTransferRoute } from "./use-transfer-route";
import { estimateDisplayFare, getTransferVehicle } from "./vehicles";

const INCLUDED = [
  { icon: UserRound, label: "Professional chauffeur" },
  { icon: Clock3, label: "Free waiting time after landing" },
  { icon: Shield, label: "Meet & Greet at arrivals" },
  { icon: Headphones, label: "24/7 flight monitoring & support" },
] as const;

type BookingSidePanelProps = {
  step: BookingStep;
  destination: SelectedDestination | null;
  vehicleId: VehicleId | null;
  arrival: ArrivalInfo;
  passenger: PassengerInfo;
  canContinue: boolean;
  submitting: boolean;
  onContinue: () => void;
};

export function BookingSidePanel({
  step,
  destination,
  vehicleId,
  arrival,
  passenger,
  canContinue,
  submitting,
  onContinue,
}: BookingSidePanelProps) {
  const {
    destPlace,
    routes,
    route,
    routeLoading,
    distanceLabel,
    durationLabel,
    pickup,
  } = useTransferRoute(destination);

  const vehicle = getTransferVehicle(vehicleId);
  const displayFare =
    destination && vehicle
      ? estimateDisplayFare(destination.rate.rate, vehicle.fareFactor)
      : destination
        ? destination.rate.rate
        : null;

  const ctaLabel =
    step === "summary" ? "Confirm transfer request" : "Continue";

  return (
    <aside
      aria-label="Transfer summary"
      className="flex flex-col overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white/80 shadow-[0_20px_50px_rgb(10_22_32_/_0.1)] backdrop-blur-xl"
    >
      {/* Map — always mounted; CMB center when no destination */}
      <div className="relative border-b border-ink/6">
        <RideMapDynamic
          pickup={pickup}
          destination={destPlace}
          routes={routes}
          selectedRouteId={route?.id ?? null}
          isRouteLoading={routeLoading}
          distanceLabel={destination ? distanceLabel : null}
          durationLabel={destination ? durationLabel : null}
          className="rounded-none border-0"
          mapHeightClass="h-[220px]"
          emptyMessage="Select a destination to preview your route."
        />
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5 xl:p-6">
        {/* Route strip */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="my-1 w-px flex-1 min-h-6 bg-ink/12" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-brand bg-white" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
                Airport
              </p>
              <p className="truncate text-sm font-semibold text-ink">
                {AIRPORT_ORIGIN}
              </p>
            </div>
            <div>
              <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
                Destination
              </p>
              <p className="truncate text-sm font-semibold text-ink">
                {destination?.label ?? "Select destination"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <dl className="grid grid-cols-3 gap-2 rounded-[1.1rem] bg-foam/80 p-3">
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Distance
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {destination ? distanceLabel : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Time
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {destination ? durationLabel : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] tracking-wide text-ink/40 uppercase">
              Fare
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-brand-deep">
              {displayFare != null ? formatAirportFare(displayFare) : "—"}
            </dd>
          </div>
        </dl>

        {/* Vehicle */}
        {vehicle ? (
          <VehicleCarouselCard
            id={vehicle.id}
            selected
            displayOnly
            name={vehicle.name}
            passengers={vehicle.passengers}
            luggage={vehicle.luggage}
            priceLabel={
              displayFare != null ? formatAirportFare(displayFare) : undefined
            }
            showEta={false}
            showDayNightBadge={false}
            fluid
          />
        ) : (
          <div className="rounded-[1.1rem] border border-dashed border-ink/12 px-3 py-3 text-xs text-ink/40">
            Select a vehicle to see capacity and fare
          </div>
        )}

        {/* Flight / passenger glimpse when available */}
        {(arrival.flightNumber || passenger.name) && step !== "destination" ? (
          <div className="space-y-2 text-xs text-ink/60">
            {arrival.flightNumber ? (
              <p className="flex items-center gap-2">
                <Plane className="h-3.5 w-3.5 text-brand" aria-hidden />
                {arrival.flightNumber.toUpperCase()}
                {arrival.arrivalDate
                  ? ` · ${arrival.arrivalDate} ${arrival.arrivalTime}`
                  : ""}
              </p>
            ) : null}
            {passenger.name ? (
              <p className="flex items-center gap-2">
                <UserRound className="h-3.5 w-3.5 text-brand" aria-hidden />
                {passenger.name}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Included */}
        <div>
          <p className="text-[0.625rem] font-medium tracking-wide text-ink/40 uppercase">
            Included services
          </p>
          <ul className="mt-2.5 space-y-2">
            {INCLUDED.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-xs font-medium text-ink/70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/8 text-brand">
                  <Icon className="h-3 w-3" aria-hidden />
                </span>
                {label}
                <Check className="ml-auto h-3.5 w-3.5 text-brand/50" aria-hidden />
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={submitting || (step === "summary" ? false : !canContinue)}
          onClick={onContinue}
          className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.35)] transition-[filter,opacity,transform] hover:brightness-110 disabled:opacity-40 motion-safe:active:scale-[0.98]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            <>
              {ctaLabel}
              {step !== "summary" ? (
                <ChevronRight className="h-4 w-4" aria-hidden />
              ) : null}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
