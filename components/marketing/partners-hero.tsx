"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CreditCard,
  Globe2,
  Hotel,
  MapPin,
  Plane,
  Sparkles,
  Star,
  UserCheck,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./partners-hero.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURE_IDS = [
  "accountManager",
  "priorityDispatch",
  "guestTracking",
  "monthlyReporting",
  "corporateBilling",
  "airportMeetGreet",
] as const;

const FEATURE_ICONS = {
  accountManager: UserCheck,
  priorityDispatch: Zap,
  guestTracking: MapPin,
  monthlyReporting: BarChart3,
  corporateBilling: CreditCard,
  airportMeetGreet: Plane,
} as const;

const TRUSTED_CATEGORY_IDS = [
  "hotels",
  "villas",
  "agencies",
  "corporate",
  "airlines",
] as const;

const TRUSTED_ICONS = {
  hotels: Hotel,
  villas: Building2,
  agencies: Globe2,
  corporate: Building2,
  airlines: Plane,
} as const;

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
  amp = 7,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amp?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      className={`partners-float-card ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
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
                duration: 5 + delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay + 0.5,
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/** Premium partners landing hero — two-column hospitality composition. */
export function PartnersHero() {
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
    reduceMotion ? [0, 0] : [24, -24],
  );

  return (
    <section
      className="partners-hero border-b border-ink/5 pt-[6.6rem] pb-14 sm:pt-[7.4rem] sm:pb-16 lg:pb-20"
      aria-labelledby="partners-hero-heading"
    >
      <div className="partners-hero-orb partners-hero-orb--a" aria-hidden />
      <div className="partners-hero-orb partners-hero-orb--b" aria-hidden />
      <div className="partners-hero-orb partners-hero-orb--c" aria-hidden />
      <div className="partners-hero-grid" aria-hidden />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <Reveal delay={0.02}>
              <p className="partners-trust-badge">
                <span className="partners-trust-badge__dot" aria-hidden>
                  <Sparkles className="h-3 w-3" strokeWidth={2.25} />
                </span>
                {t("pages.partners.hero.badge")}
              </p>
            </Reveal>

            <Reveal delay={0.07}>
              <h1
                id="partners-hero-heading"
                className="mt-5 font-display text-[clamp(2.05rem,4.8vw,3.2rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-ink"
              >
                {t("pages.partners.title")}
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-[0.975rem] leading-[1.72] text-pretty text-ink-muted sm:text-base">
                {t("pages.partners.description")}
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl text-[0.9rem] leading-[1.68] text-pretty text-ink/55">
                {t("pages.partners.body")}
              </p>
            </Reveal>

            <Reveal delay={0.22} className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/support"
                className="partners-hero-btn partners-hero-btn--primary"
                aria-label={t("pages.partners.primaryCta")}
              >
                <span>{t("pages.partners.primaryCta")}</span>
                <ArrowRight
                  className="partners-hero-btn__arrow"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/airport"
                className="partners-hero-btn partners-hero-btn--secondary"
                aria-label={t("pages.partners.secondaryCta")}
              >
                {t("pages.partners.secondaryCta")}
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.1} x={20} y={0} className="min-w-0">
            <div
              ref={visualRef}
              className="partners-hero-visual aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]"
            >
              <motion.div
                className="absolute inset-[-6%] h-[112%] w-[112%]"
                style={{ y: imageY }}
              >
                <Image
                  src="/images/app/story/chauffeur.webp"
                  alt={t("pages.partners.hero.scenes.chauffeurAlt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  className="object-cover object-[50%_28%]"
                />
              </motion.div>

              <div className="partners-hero-visual-glass" aria-hidden />

              <div className="partners-hero-scene partners-hero-scene--airport">
                <Image
                  src="/images/airport/hero-arrival.webp"
                  alt={t("pages.partners.hero.scenes.airportAlt")}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>

              <div className="partners-hero-scene partners-hero-scene--hotel">
                <Image
                  src="/images/tours/bentota-luxury-coast.webp"
                  alt={t("pages.partners.hero.scenes.hotelAlt")}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 z-[4] p-3 sm:p-4">
                <FloatCard
                  delay={0.3}
                  amp={6}
                  className="absolute top-3 left-3 max-w-[9.5rem] sm:top-4 sm:left-4 sm:max-w-[10.5rem]"
                >
                  <p className="flex items-center gap-1 text-[0.8125rem] font-semibold text-ink">
                    <Star
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                    {t("pages.partners.hero.stats.rating")}
                  </p>
                </FloatCard>

                <FloatCard
                  delay={0.42}
                  amp={8}
                  className="absolute top-[34%] right-3 max-w-[10.5rem] sm:right-4"
                >
                  <p className="text-[0.8125rem] leading-snug font-semibold text-ink">
                    {t("pages.partners.hero.stats.hotels")}
                  </p>
                </FloatCard>

                <FloatCard
                  delay={0.54}
                  amp={5}
                  className="absolute top-[52%] left-3 max-w-[10rem] sm:left-4"
                >
                  <p className="text-[0.8125rem] leading-snug font-semibold text-ink">
                    {t("pages.partners.hero.stats.transfers")}
                  </p>
                </FloatCard>

                <FloatCard
                  delay={0.66}
                  amp={7}
                  className="absolute right-3 bottom-[30%] max-w-[10.5rem] sm:right-4"
                >
                  <p className="text-[0.8125rem] leading-snug font-semibold text-ink">
                    {t("pages.partners.hero.stats.coverage")}
                  </p>
                </FloatCard>

                <FloatCard
                  delay={0.78}
                  amp={6}
                  className="absolute right-3 bottom-3 left-3 sm:right-auto sm:bottom-4 sm:left-auto sm:max-w-[12rem]"
                >
                  <p className="flex items-center gap-1.5 text-[0.8125rem] leading-snug font-semibold text-ink">
                    <Zap className="h-3.5 w-3.5 text-brand" aria-hidden />
                    {t("pages.partners.hero.stats.dispatch")}
                  </p>
                </FloatCard>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/** Trusted partner categories — hotels, villas, agencies, corporate, airlines. */
export function PartnersTrusted() {
  const t = useTranslations();
  const { pages } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const trusted = pages.partners.trusted;

  return (
    <section
      className="border-b border-ink/5 bg-[#F8FAFF] py-12 sm:py-14 lg:py-16"
      aria-labelledby="partners-trusted-heading"
    >
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.partners.trusted.eyebrow")}
          </p>
          <h2
            id="partners-trusted-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink"
          >
            {t("pages.partners.trusted.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-[0.9375rem]">
            {t("pages.partners.trusted.description")}
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TRUSTED_CATEGORY_IDS.map((id, index) => {
            const Icon = TRUSTED_ICONS[id];
            const names = trusted.categories[id].names;
            return (
              <motion.article
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: EASE,
                }}
                className="partners-trusted-card rounded-[1.25rem] p-5"
              >
                <span className="inline-grid h-9 w-9 place-items-center rounded-[0.7rem] bg-brand/[0.1] text-brand">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-sm font-semibold tracking-tight text-ink">
                  {t(`pages.partners.trusted.categories.${id}.title`)}
                </h3>
                <ul className="mt-3 space-y-1.5" aria-label={t(`pages.partners.trusted.categories.${id}.title`)}>
                  {names.map((name) => (
                    <li
                      key={name}
                      className="font-display text-[0.8125rem] tracking-wide text-ink-soft/90"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/** Partner platform feature grid. */
export function PartnersFeatures() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="border-b border-ink/5 py-12 sm:py-14 lg:py-16"
      aria-labelledby="partners-features-heading"
    >
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.partners.features.eyebrow")}
          </p>
          <h2
            id="partners-features-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink"
          >
            {t("pages.partners.features.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-[0.9375rem]">
            {t("pages.partners.features.description")}
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {FEATURE_IDS.map((id, index) => {
            const Icon = FEATURE_ICONS[id];
            return (
              <motion.article
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: EASE,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -5, transition: { duration: 0.28, ease: EASE } }
                }
                className="partners-feature-card group relative overflow-hidden rounded-[1.5rem] p-5 sm:p-6"
              >
                <span className="partners-feature-card-edge" aria-hidden />
                <span className="relative inline-grid place-items-center">
                  <span
                    className="absolute inset-[-8px] rounded-full bg-[radial-gradient(circle,rgb(0_98_250/0.28),transparent_68%)] opacity-55 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative z-[1] grid h-11 w-11 place-items-center rounded-[0.9rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_10px_24px_rgb(0_98_250_/_0.32)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </span>
                <h3 className="relative mt-5 font-display text-[1.02rem] leading-snug font-semibold tracking-tight text-ink">
                  {t(`pages.partners.features.items.${id}.title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-[1.65] text-pretty text-ink-muted">
                  {t(`pages.partners.features.items.${id}.body`)}
                </p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
