"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPinned } from "lucide-react";
import {
  POPULAR_AIRPORT_LABELS,
  formatAirportFare,
  getPopularAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";

const EASE = [0.22, 1, 0.36, 1] as const;

type PopularDestinationsProps = {
  selectedCode: string | null;
  onSelect: (rate: AirportRate) => void;
  heading: string;
};

export function PopularDestinations({
  selectedCode,
  onSelect,
  heading,
}: PopularDestinationsProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const popular = getPopularAirportRates();

  return (
    <div>
      <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
        {heading}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {popular.map((rate, index) => {
          const active = selectedCode === rate.code;
          const label = POPULAR_AIRPORT_LABELS[rate.code] ?? rate.destination;
          return (
            <motion.button
              key={rate.code}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : index * 0.03,
                ease: EASE,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -4, transition: { duration: 0.22, ease: EASE } }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => onSelect(rate)}
              aria-pressed={active}
              className={`group relative w-full overflow-hidden rounded-[24px] p-px text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                active
                  ? "bg-gradient-to-br from-[#2b7dff] via-brand to-[#0193fb] shadow-[0_16px_40px_rgb(0_98_250_/_0.22)]"
                  : "bg-gradient-to-br from-brand/35 via-white to-brand/20 shadow-[0_10px_28px_rgb(10_22_32_/_0.06)] hover:from-brand/55 hover:to-brand/35 hover:shadow-[0_16px_36px_rgb(0_98_250_/_0.14)]"
              }`}
            >
              <span
                className={`flex h-full flex-col rounded-[23px] p-4 backdrop-blur-xl transition-colors duration-300 ${
                  active
                    ? "bg-gradient-to-b from-[#f7faff] to-[#eef4ff]"
                    : "bg-white/90 group-hover:bg-white/95"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-2xl ${
                    active
                      ? "bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_8px_18px_rgb(0_98_250_/_0.35)]"
                      : "bg-brand/[0.1] text-brand"
                  }`}
                >
                  <MapPinned className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <span
                  className={`mt-3 block truncate text-sm font-semibold tracking-tight ${
                    active ? "text-brand" : "text-ink"
                  }`}
                >
                  {label}
                </span>
                <span className="mt-1 block text-sm font-bold tracking-tight text-ink">
                  {formatAirportFare(rate.rate)}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
