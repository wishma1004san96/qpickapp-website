"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Check,
  Headphones,
  Plane,
  Radar,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import "./airport-hero.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST_IDS = ["tracking", "greet", "pricing", "support"] as const;

const FEATURES = [
  { id: "tracking", Icon: Radar },
  { id: "greet", Icon: ShieldCheck },
  { id: "pricing", Icon: Wallet },
  { id: "support", Icon: Headphones },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  x = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.55, delay: reduceMotion ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function FloatCard({
  children,
  className = "",
  delay = 0,
  amp = 8,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amp?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      className={`airport-float-card rounded-[1.1rem] px-3.5 py-3 ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={
        reduceMotion
          ? { opacity: 1, y: 0 }
          : {
              opacity: 1,
              y: [0, -amp, 0],
              scale: 1,
            }
      }
      transition={
        reduceMotion
          ? { duration: 0.4, delay, ease: EASE }
          : {
              opacity: { duration: 0.5, delay, ease: EASE },
              scale: { duration: 0.5, delay, ease: EASE },
              y: {
                duration: 4.8 + delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay + 0.55,
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/** Premium Airport Transfers hero — two-column landing composition. */
export function AirportHero() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: visualRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [28, -28],
  );

  return (
    <section
      className="airport-hero border-b border-ink/5 pt-[6.6rem] pb-14 sm:pt-[7.4rem] sm:pb-16 lg:pb-20"
      aria-labelledby="airport-hero-heading"
    >
      <div className="airport-hero-orb airport-hero-orb--a" aria-hidden />
      <div className="airport-hero-orb airport-hero-orb--b" aria-hidden />
      <div className="airport-hero-orb airport-hero-orb--c" aria-hidden />
      <div className="airport-hero-runway" aria-hidden />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-12 xl:gap-16">
          {/* Left copy — ~45% */}
          <div className="min-w-0">
            <Reveal delay={0.02}>
              <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
                {t("pages.airport.hero.eyebrow")}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1
                id="airport-hero-heading"
                className="mt-3.5 font-display text-[clamp(2.05rem,4.6vw,3.15rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-ink"
              >
                {t("pages.airport.hero.titleLine1")}
                <br />
                {t("pages.airport.hero.titleLine2")}
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-5 max-w-xl text-[0.975rem] leading-[1.7] text-pretty text-ink-muted sm:text-base">
                {t("pages.airport.hero.description")}
              </p>
            </Reveal>

            <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/ride#taxi-fare" size="lg" className="rounded-[14px]">
                {t("pages.airport.hero.primaryCta")}
              </ButtonLink>
              <ButtonLink
                href="/ride#ride-fleet-heading"
                variant="secondary"
                size="lg"
                className="rounded-[14px] border-ink/10 bg-white/75 backdrop-blur-md"
              >
                {t("pages.airport.hero.secondaryCta")}
              </ButtonLink>
            </Reveal>

            <Reveal delay={0.28} className="mt-8">
              <ul className="flex flex-wrap gap-x-4 gap-y-2.5">
                {TRUST_IDS.map((id) => (
                  <li
                    key={id}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/80"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/[0.1] text-brand">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    {t(`pages.airport.hero.trust.${id}`)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Right visual */}
          <Reveal delay={0.12} x={24} y={0} className="min-w-0">
            <div ref={visualRef} className="airport-hero-visual aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/4]">
              <motion.div
                className="absolute inset-[-8%] h-[116%] w-[116%]"
                style={{ y: imageY }}
              >
                <Image
                  src="/images/airport/hero-arrival.webp"
                  alt={t("pages.airport.hero.imageAlt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-[50%_35%]"
                />
              </motion.div>

              <div className="airport-hero-visual-glass" aria-hidden />

              {/* Floating status cards */}
              <div className="pointer-events-none absolute inset-0 z-[2] p-3.5 sm:p-5">
                <FloatCard
                  delay={0.35}
                  amp={7}
                  className="absolute top-4 left-3.5 max-w-[11.5rem] sm:top-6 sm:left-5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[0.65rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_8px_18px_rgb(0_98_250_/_0.35)]">
                      <Plane className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-muted uppercase">
                        {t("pages.airport.hero.cards.flight.label")}
                      </p>
                      <p className="mt-0.5 font-display text-sm font-semibold tracking-tight text-ink">
                        {t("pages.airport.hero.cards.flight.code")}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[0.6875rem] font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                        {t("pages.airport.hero.cards.flight.status")}
                      </p>
                    </div>
                  </div>
                </FloatCard>

                <FloatCard
                  delay={0.5}
                  amp={9}
                  className="absolute top-[38%] right-3.5 max-w-[12.5rem] sm:right-5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[0.65rem] bg-ink text-paper">
                      <UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.625rem] tracking-[0.14em] text-ink-muted uppercase">
                        {t("pages.airport.hero.cards.driver.label")}
                      </p>
                      <p className="mt-0.5 text-[0.8125rem] leading-snug font-semibold text-ink">
                        {t("pages.airport.hero.cards.driver.status")}
                      </p>
                    </div>
                  </div>
                </FloatCard>

                <FloatCard
                  delay={0.65}
                  amp={6}
                  className="absolute right-3.5 bottom-4 left-3.5 sm:right-auto sm:bottom-6 sm:left-5 sm:max-w-[14rem]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/[0.12] text-brand">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden />
                    </span>
                    <p className="text-[0.8125rem] leading-snug font-semibold text-ink">
                      {t("pages.airport.hero.cards.meetGreet")}
                    </p>
                  </div>
                </FloatCard>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/** Four premium glass feature cards below the airport hero. */
export function AirportFeatures() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="border-b border-ink/5 bg-[#F8FAFF] py-12 sm:py-14 lg:py-16"
      aria-labelledby="airport-features-heading"
    >
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.airport.features.eyebrow")}
          </p>
          <h2
            id="airport-features-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink"
          >
            {t("pages.airport.features.heading")}
          </h2>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map(({ id, Icon }, index) => (
            <motion.article
              key={id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
                ease: EASE,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -6, transition: { duration: 0.28, ease: EASE } }
              }
              className="airport-feature-card group relative overflow-hidden rounded-[1.5rem] p-5 sm:p-6"
            >
              <span className="airport-feature-card-edge" aria-hidden />
              <span className="relative inline-grid place-items-center">
                <span className="airport-feature-icon-glow" aria-hidden />
                <span className="relative z-[1] grid h-11 w-11 place-items-center rounded-[0.9rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_10px_24px_rgb(0_98_250_/_0.32)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
              </span>
              <h3 className="relative mt-5 font-display text-[1.05rem] leading-snug font-semibold tracking-tight text-ink">
                {t(`pages.airport.features.items.${id}.title`)}
              </h3>
              <p className="relative mt-2 text-sm leading-[1.65] text-pretty text-ink-muted">
                {t(`pages.airport.features.items.${id}.body`)}
              </p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
