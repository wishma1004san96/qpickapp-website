"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Snowflake, Briefcase, Users } from "lucide-react";
import Image from "next/image";
import { formatAirportFare } from "@/lib/airport-rates";
import {
  formatDistance,
  formatDuration,
} from "@/lib/airport-destination-scenes";
import type { SelectedDestination, VehicleId } from "../types";
import {
  estimateDisplayFare,
  TRANSFER_VEHICLES,
} from "../vehicles";

const EASE = [0.22, 1, 0.36, 1] as const;

type StepVehicleProps = {
  destination: SelectedDestination;
  selectedId: VehicleId | null;
  onSelect: (id: VehicleId) => void;
};

export function StepVehicle({
  destination,
  selectedId,
  onSelect,
}: StepVehicleProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const base = destination.rate.rate;
  const duration = destination.scene.durationMin;
  const distance = destination.scene.distanceKm;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 2 of 5
        </p>
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
          Choose your vehicle
        </h2>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/60">
          To {destination.label} · {formatDistance(distance)} ·{" "}
          {formatDuration(duration)}. Every transfer includes a professional
          chauffeur and climate control.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {TRANSFER_VEHICLES.map((vehicle, i) => {
          const active = selectedId === vehicle.id;
          const fare = estimateDisplayFare(base, vehicle.fareFactor);

          return (
            <motion.button
              key={vehicle.id}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              onClick={() => onSelect(vehicle.id)}
              aria-pressed={active}
              className={`group relative flex flex-col overflow-hidden rounded-[1.5rem] border text-left transition-[transform,box-shadow,border-color] duration-300 sm:flex-row ${
                active
                  ? "border-brand bg-white shadow-[0_20px_50px_rgb(0_98_250_/_0.2)] ring-2 ring-brand/25"
                  : "border-ink/8 bg-white/70 shadow-[0_10px_30px_rgb(10_22_32_/_0.06)] backdrop-blur-md hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_18px_44px_rgb(10_22_32_/_0.12)]"
              }`}
            >
              <div className="relative h-44 shrink-0 bg-gradient-to-br from-[#eef3f8] to-[#dfe8f1] sm:h-auto sm:w-44 md:w-52">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                />
                {active ? (
                  <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-paper shadow-lg">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink">
                        {vehicle.name}
                      </h3>
                      <p className="mt-1 text-sm text-ink/55">
                        {vehicle.tagline}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold text-brand-deep">
                        {formatAirportFare(fare)}
                      </p>
                      <p className="text-[0.6875rem] text-ink/40">
                        Est. · {formatDuration(duration)}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink/65">
                    <li className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-brand" aria-hidden />
                      {vehicle.passengers} passengers
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-brand" aria-hidden />
                      {vehicle.luggage} luggage
                    </li>
                    {vehicle.ac ? (
                      <li className="inline-flex items-center gap-1.5">
                        <Snowflake
                          className="h-3.5 w-3.5 text-brand"
                          aria-hidden
                        />
                        Air conditioning
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
