"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, MapPin, Plane } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import {
  AIRPORT_ORIGIN,
  formatAirportFare,
  type AirportRate,
} from "@/lib/airport-rates";

const EASE = [0.22, 1, 0.36, 1] as const;

type AirportFareCardProps = {
  rate: AirportRate;
  labels: {
    destination: string;
    fare: string;
    airport: string;
    status: string;
    statusValue: string;
    code: string;
    bookCta: string;
  };
};

export function AirportFareCard({ rate, labels }: AirportFareCardProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.2 } }
      }
      transition={{ duration: 0.42, ease: EASE }}
      className="relative overflow-hidden rounded-[24px] border border-white/80 bg-gradient-to-b from-white/96 to-[#f8faff]/90 p-5 shadow-[0_1px_0_rgb(255_255_255_/_0.95)_inset,0_18px_48px_rgb(10_22_32_/_0.07),0_0_0_1px_rgb(0_98_250_/_0.04)] backdrop-blur-xl sm:p-7"
      aria-live="polite"
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.18),transparent_68%)] blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
            {labels.destination}
          </p>
          <h3 className="mt-1.5 font-display text-[clamp(1.45rem,3vw,1.85rem)] font-semibold tracking-tight text-ink">
            {rate.destination}
          </h3>
          <p className="mt-1 font-mono text-[0.75rem] text-ink-muted">
            {labels.code} {rate.code}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/[0.08] px-3 py-1.5 text-xs font-semibold text-brand shadow-[0_0_20px_rgb(0_98_250_/_0.12)]">
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          {labels.statusValue}
        </span>
      </div>

      <div className="relative mt-6 rounded-[1.15rem] border border-white/70 bg-white/55 px-4 py-4 shadow-[0_1px_0_rgb(255_255_255_/_0.9)_inset] backdrop-blur-md sm:px-5 sm:py-5">
        <p className="text-sm font-medium text-ink-muted">{labels.fare}</p>
        <p className="mt-1 font-display text-[clamp(1.85rem,4vw,2.45rem)] font-semibold tracking-tight text-ink">
          {formatAirportFare(rate.rate, rate.currency)}
        </p>
      </div>

      <dl className="relative mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex gap-2.5 rounded-[1rem] border border-ink/6 bg-white/45 px-3.5 py-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[0.7rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_8px_18px_rgb(0_98_250_/_0.28)]">
            <Plane className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-[0.6875rem] font-medium tracking-wide text-ink-muted uppercase">
              {labels.airport}
            </dt>
            <dd className="mt-0.5 text-sm leading-snug font-semibold text-pretty text-ink">
              {AIRPORT_ORIGIN}
            </dd>
          </div>
        </div>
        <div className="flex gap-2.5 rounded-[1rem] border border-ink/6 bg-white/45 px-3.5 py-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[0.7rem] bg-ink/[0.06] text-brand">
            <MapPin className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <dt className="text-[0.6875rem] font-medium tracking-wide text-ink-muted uppercase">
              {labels.status}
            </dt>
            <dd className="mt-0.5 text-sm leading-snug font-semibold text-ink">
              {labels.statusValue}
            </dd>
          </div>
        </div>
      </dl>

      <motion.div
        className="relative mt-6"
        whileHover={reduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        <ButtonLink
          href="/ride#taxi-fare"
          size="lg"
          className="w-full rounded-[14px] shadow-[0_12px_32px_rgb(0_98_250_/_0.28)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_16px_40px_rgb(0_98_250_/_0.36)]"
        >
          {labels.bookCta}
        </ButtonLink>
      </motion.div>
    </motion.article>
  );
}

export function AirportFareCardSkeleton() {
  return (
    <div
      className="relative animate-pulse overflow-hidden rounded-[24px] border border-white/80 bg-gradient-to-b from-white/96 to-[#f8faff]/90 p-5 shadow-[0_18px_48px_rgb(10_22_32_/_0.06)] sm:p-7"
      aria-hidden
    >
      <div className="h-3 w-24 rounded bg-ink/10" />
      <div className="mt-3 h-8 w-48 rounded bg-ink/10" />
      <div className="mt-6 h-24 rounded-[1.15rem] bg-ink/[0.06]" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="h-16 rounded-[1rem] bg-ink/[0.05]" />
        <div className="h-16 rounded-[1rem] bg-ink/[0.05]" />
      </div>
      <div className="mt-6 h-12 rounded-[14px] bg-ink/[0.08]" />
    </div>
  );
}
