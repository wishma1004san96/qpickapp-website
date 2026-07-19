"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock3,
  Eye,
  Headphones,
  LocateFixed,
  Minus,
  Plus,
  ShieldCheck,
  Siren,
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

const SAFETY_PILLARS = [
  { id: "verified", Icon: ShieldCheck },
  { id: "sharing", Icon: LocateFixed },
  { id: "support", Icon: Headphones },
  { id: "emergency", Icon: Siren },
] as const;

const FAQ_IDS = [
  "fareCalc",
  "airport",
  "tour",
  "vehicle",
  "drivers",
  "share",
  "cancel",
  "contact",
] as const;

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
          className="ride-fleet-grid mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 min-[1440px]:grid-cols-4"
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

                <div className="ride-fleet-image">
                  <span className="ride-fleet-image-frame">
                    <Image
                      src={VEHICLE_PHOTO_PUBLIC_PATHS[id]}
                      alt={name}
                      fill
                      unoptimized
                      className="ride-fleet-img"
                      sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 180px"
                    />
                  </span>
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

/** Premium safety section — two-column luxury layout. */
export function RideSafetySection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="ride-safety-premium relative overflow-hidden py-16 sm:py-20 lg:py-24"
      aria-labelledby="ride-safety-heading"
    >
      <div className="ride-safety-premium__glow" aria-hidden />
      <div className="ride-safety-premium__orb ride-safety-premium__orb--a" aria-hidden />
      <div className="ride-safety-premium__orb ride-safety-premium__orb--b" aria-hidden />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14 xl:gap-16">
          <SectionReveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
              {t("pages.ride.safety.eyebrow")}
            </p>
            <h2
              id="ride-safety-heading"
              className="mt-3 font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-ink"
            >
              {t("pages.ride.safety.heading")}
            </h2>
            <p className="mt-5 max-w-lg text-[1.05rem] leading-[1.65] text-ink-muted sm:text-[1.125rem]">
              {t("pages.ride.safety.body")}
            </p>
            <ButtonLink
              href="/safety"
              size="lg"
              className="mt-8 shadow-[0_14px_36px_rgb(0_98_250_/_0.28)] transition-[box-shadow,transform] duration-300 hover:shadow-[0_18px_44px_rgb(0_98_250_/_0.38)] motion-safe:hover:-translate-y-0.5"
            >
              {t("pages.ride.safety.cta")}
            </ButtonLink>
          </SectionReveal>

          <div className="ride-safety-cards relative">
            <svg
              className="ride-safety-cards__lines pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <motion.path
                d="M28 28 C 48 28, 52 48, 72 48"
                fill="none"
                stroke="rgb(0 98 250 / 0.18)"
                strokeWidth="0.35"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
              />
              <motion.path
                d="M28 72 C 48 72, 52 52, 72 52"
                fill="none"
                stroke="rgb(0 98 250 / 0.14)"
                strokeWidth="0.35"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.4 }}
              />
            </svg>

            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {SAFETY_PILLARS.map(({ id, Icon }, index) => (
                <motion.li
                  key={id}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 22, scale: 0.96 }
                  }
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.5,
                    delay: reduceMotion ? 0 : 0.08 + index * 0.08,
                    ease: EASE,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -6, transition: { duration: 0.28, ease: EASE } }
                  }
                  className={`ride-safety-glass ${
                    index % 2 === 1 ? "sm:mt-6" : ""
                  }`}
                >
                  <span className="ride-safety-glass__icon relative" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                    {id === "verified" ? (
                      <Check
                        className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-brand p-[1px] text-paper"
                        strokeWidth={3}
                      />
                    ) : null}
                  </span>
                  <h3 className="mt-4 font-display text-[1.05rem] font-semibold tracking-tight text-ink">
                    {t(`pages.ride.safety.pillars.${id}.title`)}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
                    {t(`pages.ride.safety.pillars.${id}.body`)}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Premium glass FAQ accordion. */
export function RideFaqSection() {
  const t = useTranslations();
  const [openId, setOpenId] = useState<string | null>(FAQ_IDS[0]);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="ride-faq-premium relative overflow-hidden bg-paper py-16 sm:py-20 lg:py-24"
      aria-labelledby="ride-faq-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(0_98_250_/_0.06),transparent_70%)]"
        aria-hidden
      />
      <Container className="relative z-[1] max-w-3xl">
        <SectionReveal className="text-center sm:text-left">
          <h2
            id="ride-faq-heading"
            className="font-display text-[clamp(1.85rem,3.6vw,2.65rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-ink"
          >
            {t("pages.ride.faq.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ink-muted sm:mx-0">
            {t("pages.ride.faq.sub")}
          </p>
        </SectionReveal>

        <ul className="mt-10 space-y-3.5 sm:mt-12 sm:space-y-4">
          {FAQ_IDS.map((id, index) => {
            const open = openId === id;
            return (
              <motion.li
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.04,
                  ease: EASE,
                }}
                className={`ride-faq-item ${open ? "ride-faq-item--open" : ""}`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : id)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
                >
                  <span className="font-display text-[1.05rem] leading-snug font-semibold tracking-tight text-ink sm:text-[1.15rem]">
                    {t(`pages.ride.faq.items.${id}.q`)}
                  </span>
                  <span
                    className={`ride-faq-item__toggle ${open ? "ride-faq-item__toggle--open" : ""}`}
                    aria-hidden
                  >
                    {open ? (
                      <Minus className="h-4 w-4" strokeWidth={2.25} />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={2.25} />
                    )}
                  </span>
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
                      transition={{ duration: 0.32, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[0.975rem] leading-[1.7] text-ink-muted sm:px-6 sm:pb-6 sm:text-[1.02rem]">
                        {t(`pages.ride.faq.items.${id}.a`)}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** Premium post-FAQ CTA card. */
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
    <section className="ride-section bg-foam pb-16 sm:pb-20 lg:pb-24">
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="ride-final-premium relative overflow-hidden rounded-[1.75rem] px-6 py-12 text-center text-foam sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14"
        >
          <div className="ride-final-premium__glow" aria-hidden />
          <div className="ride-final-premium__orb" aria-hidden />
          <div className="relative z-[1] mx-auto max-w-2xl">
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.65rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
              {t("pages.ride.finalCta.heading")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[1.05rem] leading-relaxed text-foam/70 sm:text-[1.125rem]">
              {t("pages.ride.finalCta.sub")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-9 sm:gap-4">
              <ButtonLink
                href="/support"
                variant="onDark"
                size="lg"
                className="min-w-[10.5rem] shadow-[0_12px_32px_rgb(0_0_0_/_0.25)]"
              >
                {t("pages.ride.finalCta.secondary")}
              </ButtonLink>
              <button
                type="button"
                onClick={scrollToEstimator}
                className="inline-flex min-h-12 min-w-[10.5rem] items-center justify-center rounded-[var(--radius-md)] bg-brand px-6 text-base font-medium text-paper shadow-[0_14px_36px_rgb(0_98_250_/_0.45)] transition-[background-color,transform,box-shadow] duration-[var(--duration-ui)] hover:bg-brand-bright hover:shadow-[0_18px_44px_rgb(0_98_250_/_0.55)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("pages.ride.finalCta.primary")}
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
