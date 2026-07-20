"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock3,
  Headphones,
  Shield,
  UserRound,
} from "lucide-react";
import { AIRPORT_ORIGIN, formatAirportFare } from "@/lib/airport-rates";
import { RideMapDynamic } from "@/components/maps/RideMapDynamic";
import type {
  ArrivalInfo,
  PassengerInfo,
  SelectedDestination,
  VehicleId,
} from "../types";
import { useTransferRoute } from "../use-transfer-route";
import { estimateDisplayFare, getTransferVehicle } from "../vehicles";

const EASE = [0.22, 1, 0.36, 1] as const;

const INCLUDED = [
  { icon: UserRound, label: "Professional chauffeur" },
  { icon: Clock3, label: "Free waiting time" },
  { icon: Shield, label: "Meet & greet available" },
  { icon: Headphones, label: "24/7 support" },
] as const;

type StepSummaryProps = {
  destination: SelectedDestination;
  vehicleId: VehicleId;
  arrival: ArrivalInfo;
  passenger: PassengerInfo;
};

/**
 * Left-column review on the summary step.
 * Map / fare live in the desktop sticky panel; mobile still shows the map here.
 */
export function StepSummary({
  destination,
  vehicleId,
  arrival,
  passenger,
}: StepSummaryProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const vehicle = getTransferVehicle(vehicleId)!;
  const displayFare = estimateDisplayFare(
    destination.rate.rate,
    vehicle.fareFactor,
  );
  const {
    destPlace,
    routes,
    route,
    routeLoading,
    distanceLabel,
    durationLabel,
    pickup,
  } = useTransferRoute(destination);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 5 of 5
        </p>
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
          Review & confirm
        </h2>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/60">
          Everything looks right? Submit your request — our desk assigns a
          chauffeur after a quick review.
        </p>
      </header>

      {/* Map only on mobile/tablet — desktop uses sticky side panel */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="overflow-hidden rounded-[1.5rem] border border-ink/8 shadow-[0_16px_40px_rgb(10_22_32_/_0.1)] lg:hidden"
      >
        <RideMapDynamic
          pickup={pickup}
          destination={destPlace}
          routes={routes}
          selectedRouteId={route?.id ?? null}
          isRouteLoading={routeLoading}
          distanceLabel={distanceLabel}
          durationLabel={durationLabel}
          className="rounded-none border-0"
        />
      </motion.div>

      <div className="rounded-[1.5rem] border border-ink/8 bg-white/75 p-5 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] backdrop-blur-xl sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className="h-3 w-3 rounded-full bg-brand" />
            <span className="my-1 w-px flex-1 min-h-8 bg-ink/15" />
            <span className="h-3 w-3 rounded-full border-2 border-brand bg-white" />
          </div>
          <div className="min-w-0 flex-1 space-y-5">
            <div>
              <p className="text-[0.6875rem] font-medium tracking-wide text-ink/40 uppercase">
                Airport
              </p>
              <p className="mt-0.5 font-semibold text-ink">{AIRPORT_ORIGIN}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-medium tracking-wide text-ink/40 uppercase">
                Destination
              </p>
              <p className="mt-0.5 font-semibold text-ink">{destination.label}</p>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/8 pt-6 sm:grid-cols-4">
          <div>
            <dt className="text-[0.6875rem] tracking-wide text-ink/40 uppercase">
              Vehicle
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {vehicle.name}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] tracking-wide text-ink/40 uppercase">
              Distance
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {distanceLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] tracking-wide text-ink/40 uppercase">
              Duration
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {durationLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] tracking-wide text-ink/40 uppercase">
              Est. price
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand-deep">
              {formatAirportFare(displayFare)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-2 border-t border-ink/8 pt-6 text-sm text-ink/70 sm:grid-cols-2">
          <p>
            <span className="text-ink/40">Passenger · </span>
            {passenger.name}
          </p>
          <p>
            <span className="text-ink/40">Flight · </span>
            {arrival.flightNumber
              ? arrival.flightNumber.toUpperCase()
              : "Not provided"}
          </p>
          <p>
            <span className="text-ink/40">Arrival · </span>
            {arrival.arrivalDate} · {arrival.arrivalTime}
          </p>
          <p>
            <span className="text-ink/40">Meet & Greet · </span>
            {arrival.meetAndGreet ? "Included" : "Not selected"}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-ink/8 bg-map-void p-5 text-foam lg:hidden sm:p-6">
        <p className="text-[0.6875rem] font-medium tracking-wide text-brand-bright uppercase">
          Included services
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {INCLUDED.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foam/10">
                <Icon className="h-4 w-4 text-brand-bright" aria-hidden />
              </span>
              {label}
              <Check className="ml-auto h-4 w-4 text-brand-bright/70" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
