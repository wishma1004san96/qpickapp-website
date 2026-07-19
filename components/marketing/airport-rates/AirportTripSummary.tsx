"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  CalendarDays,
  Car,
  Clock3,
  Plane,
  Users,
} from "lucide-react";
import {
  AIRPORT_ORIGIN,
  formatAirportFare,
  type AirportRate,
} from "@/lib/airport-rates";
import {
  formatDistance,
  formatDuration,
  type DestinationScene,
} from "@/lib/airport-destination-scenes";
import type {
  AirportBookingState,
  LuggageSize,
  VehicleType,
} from "@/components/marketing/airport-rates/AirportBookingForm";

const EASE = [0.22, 1, 0.36, 1] as const;

type AirportTripSummaryProps = {
  state: AirportBookingState;
  scene: DestinationScene;
  labels: {
    title: string;
    route: string;
    distance: string;
    duration: string;
    vehicle: string;
    passengers: string;
    date: string;
    time: string;
    fare: string;
    vehicleOptions: Record<VehicleType, string>;
    luggageOptions: Record<LuggageSize, string>;
    pending: string;
  };
};

function Row({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/6 py-3.5 last:border-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand/[0.08] text-brand">
          {icon}
        </span>
        <span className="text-sm text-ink-muted">{label}</span>
      </div>
      <span className="max-w-[55%] text-right text-sm font-semibold text-pretty text-ink">
        {value}
      </span>
    </div>
  );
}

export function AirportTripSummary({
  state,
  scene,
  labels,
}: AirportTripSummaryProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const selected: AirportRate | null = state.selected;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_20px_56px_rgb(10_22_32_/_0.06)] backdrop-blur-xl sm:p-7"
      aria-labelledby="airport-trip-summary-heading"
    >
      <h3
        id="airport-trip-summary-heading"
        className="font-display text-lg font-semibold tracking-tight text-ink"
      >
        {labels.title}
      </h3>

      <div className="mt-5 rounded-[20px] border border-ink/6 bg-gradient-to-b from-white/80 to-[#f7faff]/80 p-4 sm:p-5">
        <p className="text-[0.6875rem] font-medium tracking-wide text-ink-muted uppercase">
          {labels.route}
        </p>
        <div className="mt-3 flex items-start gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper">
              <Plane className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="my-1 h-8 w-px bg-brand/30" aria-hidden />
            <ArrowDown className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="mt-1 h-8 w-px bg-brand/30" aria-hidden />
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper">
              <Car className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-5 pt-1">
            <div>
              <p className="text-sm font-semibold text-ink">{AIRPORT_ORIGIN}</p>
              <p className="mt-0.5 text-xs text-ink-muted">CMB</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                {selected?.destination ?? labels.pending}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {selected ? selected.code : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Row
          icon={<Car className="h-4 w-4" aria-hidden />}
          label={labels.distance}
          value={selected ? formatDistance(scene.distanceKm) : "—"}
        />
        <Row
          icon={<Clock3 className="h-4 w-4" aria-hidden />}
          label={labels.duration}
          value={selected ? formatDuration(scene.durationMin) : "—"}
        />
        <Row
          icon={<Car className="h-4 w-4" aria-hidden />}
          label={labels.vehicle}
          value={labels.vehicleOptions[state.vehicle]}
        />
        <Row
          icon={<Users className="h-4 w-4" aria-hidden />}
          label={labels.passengers}
          value={`${state.passengers} · ${labels.luggageOptions[state.luggage]}`}
        />
        <Row
          icon={<CalendarDays className="h-4 w-4" aria-hidden />}
          label={labels.date}
          value={state.date || "—"}
        />
        <Row
          icon={<Clock3 className="h-4 w-4" aria-hidden />}
          label={labels.time}
          value={state.time || "—"}
        />
      </div>

      <div className="mt-4 rounded-[20px] border border-brand/20 bg-gradient-to-br from-[#050b12] to-[#0a1628] p-5 text-[#f3f6f7] shadow-[0_20px_48px_rgb(10_22_32_/_0.25)]">
        <p className="text-xs font-medium text-[#f3f6f7]/55">{labels.fare}</p>
        <p className="mt-1 font-display text-[clamp(1.65rem,3vw,2.1rem)] font-semibold tracking-tight">
          {selected ? formatAirportFare(selected.rate) : "—"}
        </p>
      </div>
    </motion.section>
  );
}
