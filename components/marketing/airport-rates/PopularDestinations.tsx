"use client";

import { motion, useReducedMotion } from "framer-motion";
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
      <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {popular.map((rate, index) => {
          const active = selectedCode === rate.code;
          const label = POPULAR_AIRPORT_LABELS[rate.code] ?? rate.destination;
          return (
            <motion.button
              key={rate.code}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : index * 0.03,
                ease: EASE,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -3, transition: { duration: 0.22, ease: EASE } }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => onSelect(rate)}
              aria-pressed={active}
              className={`airport-popular-chip group relative shrink-0 overflow-hidden rounded-[1.15rem] border px-4 py-3 text-left transition-[border-color,box-shadow,background,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                active
                  ? "border-brand/40 bg-brand/[0.1] shadow-[0_12px_32px_rgb(0_98_250_/_0.2),0_0_0_1px_rgb(0_98_250_/_0.12)] ring-2 ring-brand/25"
                  : "border-white/70 bg-white/70 shadow-[0_8px_24px_rgb(10_22_32_/_0.05)] hover:border-brand/20 hover:shadow-[0_12px_32px_rgb(0_98_250_/_0.12)]"
              }`}
            >
              <span
                className={`block text-sm font-semibold tracking-tight ${
                  active ? "text-brand" : "text-ink"
                }`}
              >
                {label}
              </span>
              <span className="mt-0.5 block text-[0.6875rem] text-ink-muted">
                {formatAirportFare(rate.rate)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
