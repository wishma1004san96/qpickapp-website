"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock3,
  Eye,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  QPICK_VEHICLE_ICON_IDS,
  VEHICLE_PHOTO_PUBLIC_PATHS,
  type QPickVehicleIconId,
} from "@/components/icons/vehicles";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import "./ride-page-polish.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const WHY_ICONS = {
  pricing: Wallet,
  drivers: ShieldCheck,
  tracking: Eye,
  support: Clock3,
} as const;

const FLEET_IDS = QPICK_VEHICLE_ICON_IDS;

const FAQ_IDS = ["fare", "payment", "schedule", "safety"] as const;

function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: reduceMotion ? 0 : delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  heading,
  sub,
  id,
}: {
  eyebrow?: string;
  heading: string;
  sub?: string;
  id: string;
}) {
  return (
    <SectionReveal>
      {eyebrow ? (
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="mt-2 font-display text-[clamp(1.65rem,3.2vw,2.15rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink"
      >
        {heading}
      </h2>
      {sub ? (
        <p className="mt-2.5 max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-ink-muted">
          {sub}
        </p>
      ) : null}
    </SectionReveal>
  );
}

/** Why ride with Q Pick — premium glass trust cards. */
export function RideWhySection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const ids = ["pricing", "drivers", "tracking", "support"] as const;

  return (
    <section
      className="ride-section bg-[#F8FAFF] py-12 sm:py-14"
      aria-labelledby="ride-why-heading"
    >
      <Container>
        <SectionHeading
          id="ride-why-heading"
          eyebrow={t("pages.ride.why.eyebrow")}
          heading={t("pages.ride.why.heading")}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {ids.map((id, index) => {
            const Icon = WHY_ICONS[id];
            return (
              <motion.article
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: EASE,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6, transition: { duration: 0.28, ease: EASE } }
                }
                className="ride-why-card group relative overflow-hidden rounded-[1.35rem] p-5 sm:p-6"
              >
                <span className="ride-why-card-edge" aria-hidden />
                <span className="ride-why-icon-wrap relative">
                  <span className="ride-why-icon-glow" aria-hidden />
                  <span className="relative z-[1] grid h-11 w-11 place-items-center rounded-[0.9rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_10px_24px_rgb(0_98_250_/_0.32)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </span>
                <h3 className="relative mt-5 font-display text-[1.05rem] leading-snug font-semibold tracking-tight text-ink">
                  {t(`pages.ride.why.items.${id}.title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-[1.65] text-pretty text-ink-muted">
                  {t(`pages.ride.why.items.${id}.body`)}
                </p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/** Fleet showcase — full Q Pick vehicle category set. */
export function RideFleetSection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const [selected, setSelected] = useState<QPickVehicleIconId>("sedan");

  return (
    <section
      className="ride-section bg-paper py-12 sm:py-14"
      aria-labelledby="ride-fleet-heading"
    >
      <Container>
        <SectionHeading
          id="ride-fleet-heading"
          eyebrow={t("pages.ride.fleet.eyebrow")}
          heading={t("pages.ride.fleet.heading")}
          sub={t("pages.ride.fleet.sub")}
        />

        <div
          className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4"
          role="radiogroup"
          aria-label={t("pages.ride.fleet.heading")}
        >
          {FLEET_IDS.map((id, index) => {
            const isSelected = selected === id;
            const passengers = t(`pages.ride.fleet.vehicles.${id}.passengers`);
            const luggage = t(`pages.ride.fleet.vehicles.${id}.luggage`);
            const blurb = t(`pages.ride.fleet.vehicles.${id}.blurb`);
            const name = t(`pages.ride.fleet.vehicles.${id}.name`);
            const hasMeta = Boolean(passengers || luggage);

            return (
              <motion.button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(id)}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : index * 0.035,
                  ease: EASE,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -5, transition: { duration: 0.25, ease: EASE } }
                }
                animate={{ scale: isSelected && !reduceMotion ? 1.02 : 1 }}
                className={`ride-fleet-card group relative flex flex-col overflow-hidden rounded-[1.35rem] px-3 pt-3 pb-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/45 ${
                  isSelected ? "ride-fleet-card--selected" : ""
                }`}
              >
                {isSelected ? (
                  <motion.span
                    initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-2.5 right-2.5 z-[2] grid h-6 w-6 place-items-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_6px_16px_rgb(0_98_250_/_0.4)]"
                    aria-hidden
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                ) : null}

                <div className="ride-fleet-image relative mx-auto flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[0.9rem] bg-[linear-gradient(180deg,#f8faff_0%,#eef4fb_100%)]">
                  <Image
                    src={VEHICLE_PHOTO_PUBLIC_PATHS[id]}
                    alt={name}
                    width={240}
                    height={144}
                    className="ride-fleet-img h-[78%] w-auto max-w-[92%] object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 160px"
                  />
                </div>

                <h3 className="mt-3 font-display text-sm font-semibold tracking-tight text-ink sm:text-[0.95rem]">
                  {name}
                </h3>
                {hasMeta ? (
                  <div className="mt-1.5 space-y-0.5">
                    {passengers ? (
                      <p className="text-[0.6875rem] font-medium leading-snug text-brand/85">
                        {passengers}
                      </p>
                    ) : null}
                    {luggage ? (
                      <p className="text-[0.6875rem] font-medium leading-snug text-brand/85">
                        {luggage}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <p
                  className={`text-[0.6875rem] leading-snug text-ink-muted ${
                    hasMeta ? "mt-1.5" : "mt-1"
                  }`}
                >
                  {blurb}
                </p>
              </motion.button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/** Compact safety strip for the Ride page. */
export function RideSafetySection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const pillars = ["verified", "sharing", "support"] as const;

  return (
    <section
      className="ride-section bg-[#F8FAFF] py-12 sm:py-14"
      aria-labelledby="ride-safety-heading"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
          <SectionReveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {t("pages.ride.safety.eyebrow")}
            </p>
            <h2
              id="ride-safety-heading"
              className="mt-2 font-display text-[clamp(1.65rem,3.2vw,2.15rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-ink"
            >
              {t("pages.ride.safety.heading")}
            </h2>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
              {t("pages.ride.safety.body")}
            </p>
            <ButtonLink
              href="/safety"
              className="mt-5 transition-[box-shadow,transform] duration-300 hover:shadow-[0_10px_28px_rgb(0_98_250_/_0.18)] motion-safe:hover:-translate-y-0.5"
              variant="secondary"
            >
              {t("pages.ride.safety.cta")}
            </ButtonLink>
          </SectionReveal>

          <ul className="grid gap-3 sm:grid-cols-3">
            {pillars.map((id, index) => (
              <motion.li
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: EASE,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -4, transition: { duration: 0.25, ease: EASE } }
                }
                className="ride-safety-card rounded-[1.25rem] border border-ink/6 bg-paper/90 p-4 shadow-[0_10px_28px_rgb(10_22_32_/_0.04)] backdrop-blur-sm"
              >
                <p className="text-sm font-semibold tracking-tight text-ink">
                  {t(`pages.ride.safety.pillars.${id}.title`)}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  {t(`pages.ride.safety.pillars.${id}.body`)}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/** Ride FAQ accordion. */
export function RideFaqSection() {
  const t = useTranslations();
  const [openId, setOpenId] = useState<string | null>(FAQ_IDS[0]);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="ride-section bg-paper py-12 sm:py-14"
      aria-labelledby="ride-faq-heading"
    >
      <Container className="max-w-3xl">
        <SectionReveal>
          <h2
            id="ride-faq-heading"
            className="font-display text-[clamp(1.65rem,3.2vw,2.15rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-ink"
          >
            {t("pages.ride.faq.heading")}
          </h2>
        </SectionReveal>

        <ul className="mt-7 divide-y divide-ink/8 border-y border-ink/8">
          {FAQ_IDS.map((id) => {
            const open = openId === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : id)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
                >
                  <span className="text-sm font-semibold tracking-tight text-ink sm:text-base">
                    {t(`pages.ride.faq.items.${id}.q`)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 ${
                      open ? "rotate-180 text-brand" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={
                        reduceMotion
                          ? { opacity: 1, height: "auto" }
                          : { opacity: 0, height: 0 }
                      }
                      animate={{ opacity: 1, height: "auto" }}
                      exit={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, height: 0 }
                      }
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-sm leading-relaxed text-ink-muted">
                        {t(`pages.ride.faq.items.${id}.a`)}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** Final booking CTA — points back to the estimator. */
export function RideFinalCta() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  const scrollToEstimator = () => {
    document.getElementById("taxi-fare")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section className="ride-section relative overflow-hidden bg-[linear-gradient(165deg,#0a1620_0%,#0c1f38_50%,#071018_100%)] py-12 text-foam sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgb(0_98_250_/_0.22),transparent_65%)]"
        aria-hidden
      />
      <Container className="relative">
        <SectionReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(1.65rem,3.2vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance">
            {t("pages.ride.finalCta.heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-foam/65">
            {t("pages.ride.finalCta.sub")}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToEstimator}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-medium text-paper shadow-[0_12px_32px_rgb(0_98_250_/_0.4)] transition-[background-color,transform,box-shadow] duration-[var(--duration-ui)] hover:bg-brand-bright hover:shadow-[0_16px_40px_rgb(0_98_250_/_0.5)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
            >
              {t("pages.ride.finalCta.primary")}
            </button>
            <ButtonLink
              href="/support"
              variant="secondary"
              className="min-h-12 border-foam/20 bg-transparent text-foam transition-[border-color,background,transform] duration-300 hover:border-foam/40 hover:bg-foam/10 hover:text-foam motion-safe:hover:-translate-y-0.5"
            >
              {t("pages.ride.finalCta.secondary")}
            </ButtonLink>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
