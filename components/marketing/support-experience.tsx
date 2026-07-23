"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  Car,
  ChevronDown,
  CreditCard,
  Globe2,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Search,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { brandAssets } from "@/lib/tokens";
import { siteConfig, whatsappLink } from "@/lib/site";
import "./support-experience.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const SERVICE_IDS = [
  "airport",
  "tours",
  "corporate",
  "lostFound",
  "driver",
  "billing",
] as const;

const SERVICE_ICONS = {
  airport: Plane,
  tours: MapPin,
  corporate: Building2,
  lostFound: Search,
  driver: Car,
  billing: CreditCard,
} as const;

const TRUST_IDS = ["response", "satisfaction", "experience", "languages"] as const;

const FAQ_IDS = [
  "book",
  "airport",
  "payment",
  "cancel",
  "refund",
  "corporate",
] as const;

const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

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

export function SupportHero() {
  const t = useTranslations();

  return (
    <section
      className="support-hero border-b border-ink/5 pt-[6.6rem] pb-14 sm:pt-[7.4rem] sm:pb-16 lg:pb-20"
      aria-labelledby="support-hero-heading"
    >
      <div className="support-hero-orb support-hero-orb--a" aria-hidden />
      <div className="support-hero-orb support-hero-orb--b" aria-hidden />
      <div className="support-hero-orb support-hero-orb--c" aria-hidden />

      <Container className="relative z-[1]">
        <div className="support-hero-showcase support-glass-card">
          <div className="support-hero-logo-wrap">
            <div className="support-hero-logo-glow" aria-hidden />
            <Image
              src={brandAssets.logo}
              alt={t("pages.support.hero.logoAlt")}
              width={280}
              height={280}
              priority
              className="support-hero-logo"
            />
          </div>

          <div className="support-hero-copy">
            <p className="support-hero-eyebrow">
              <Headphones className="h-3.5 w-3.5 text-brand" aria-hidden />
              {t("pages.support.hero.badge")}
            </p>

            <h1
              id="support-hero-heading"
              className="support-hero-title font-display text-balance text-ink"
            >
              {t("pages.support.title")}
            </h1>

            <p className="support-hero-description text-pretty text-ink-muted">
              {t("pages.support.description")}
            </p>

            <Link
              href="#support-contact-heading"
              className="support-cta-btn support-cta-btn--luxury"
            >
              {t("pages.support.hero.cta")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function SupportContactCards() {
  const t = useTranslations();

  const cards = [
    {
      id: "email" as const,
      icon: Mail,
      href: `mailto:${siteConfig.supportEmail}`,
      value: siteConfig.supportEmail,
      external: false,
    },
    {
      id: "phone" as const,
      icon: Phone,
      href: `tel:${siteConfig.phones.general.replace(/\s/g, "")}`,
      value: siteConfig.phones.general,
      extra: siteConfig.phoneLines.slice(1),
      external: false,
    },
    {
      id: "whatsapp" as const,
      icon: MessageCircle,
      href: whatsappLink.href,
      value: siteConfig.phones.whatsapp,
      external: true,
    },
    {
      id: "emergency" as const,
      icon: AlertCircle,
      href: `tel:${siteConfig.emergencyLine.replace(/\s/g, "")}`,
      value: siteConfig.emergencyLine,
      external: false,
    },
    {
      id: "location" as const,
      icon: MapPin,
      href: `https://maps.google.com/?q=${encodeURIComponent(siteConfig.address)}`,
      value: siteConfig.address,
      external: true,
    },
  ];

  return (
    <section
      className="border-b border-ink/5 bg-[#F8FAFF] py-12 sm:py-14 lg:py-16"
      aria-labelledby="support-contact-heading"
    >
      <Container>
        <Reveal>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.support.contact.eyebrow")}
          </p>
          <h2
            id="support-contact-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-ink"
          >
            {t("pages.support.contact.heading")}
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const label = t(`pages.support.contact.cards.${card.id}.title`);
            const hint = t(`pages.support.contact.cards.${card.id}.hint`);
            return (
              <Reveal key={card.id} delay={index * 0.05}>
                <a
                  href={card.href}
                  target={card.external ? "_blank" : undefined}
                  rel={card.external ? "noopener noreferrer" : undefined}
                  className="support-glass-card support-glass-card--link group flex h-full min-h-[10.5rem] flex-col rounded-[1.25rem] p-5"
                  aria-label={`${label}: ${card.value}`}
                >
                  <span className="inline-grid h-11 w-11 place-items-center rounded-[0.85rem] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_10px_24px_rgb(0_98_250_/_0.28)] transition group-hover:brightness-110">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-ink">{label}</p>
                  <p className="mt-2 text-[0.8125rem] leading-snug font-medium text-brand">
                    {card.value}
                  </p>
                  {"extra" in card && card.extra ? (
                    <ul className="mt-2 space-y-0.5">
                      {card.extra.map((line) => (
                        <li
                          key={line}
                          className="font-mono text-[0.6875rem] text-ink/55"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-auto pt-3 text-[0.6875rem] leading-relaxed text-ink-muted">
                    {hint}
                  </p>
                </a>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function SupportQuickActions() {
  const t = useTranslations();

  const actions = [
    {
      href: whatsappLink.href,
      label: t("pages.support.quickActions.whatsapp"),
      variant: "primary" as const,
      external: true,
    },
    {
      href: `tel:${siteConfig.phones.general.replace(/\s/g, "")}`,
      label: t("pages.support.quickActions.call"),
      variant: "secondary" as const,
      external: false,
    },
    {
      href: `mailto:${siteConfig.supportEmail}`,
      label: t("pages.support.quickActions.email"),
      variant: "secondary" as const,
      external: false,
    },
    {
      href: "/airport",
      label: t("pages.support.quickActions.airport"),
      variant: "secondary" as const,
      external: false,
    },
  ];

  return (
    <section
      className="border-b border-ink/5 py-10 sm:py-12"
      aria-label={t("pages.support.quickActions.eyebrow")}
    >
      <Container>
        <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.support.quickActions.eyebrow")}
          </p>
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noopener noreferrer" : undefined}
                className={`support-cta-btn ${
                  action.variant === "primary"
                    ? "support-cta-btn--primary"
                    : "support-cta-btn--secondary"
                }`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function SupportServices() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="border-b border-ink/5 py-12 sm:py-14 lg:py-16"
      aria-labelledby="support-services-heading"
    >
      <Container>
        <Reveal>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.support.services.eyebrow")}
          </p>
          <h2
            id="support-services-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-ink"
          >
            {t("pages.support.services.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {t("pages.support.services.description")}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {SERVICE_IDS.map((id, index) => {
            const Icon = SERVICE_ICONS[id];
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
                className="support-feature-card support-glass-card--interactive rounded-[1.5rem] p-5 sm:p-6"
              >
                <span className="inline-grid h-11 w-11 place-items-center rounded-[0.9rem] bg-brand/[0.1] text-brand">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-[1.02rem] font-semibold tracking-tight text-ink">
                  {t(`pages.support.services.items.${id}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-[1.65] text-ink-muted">
                  {t(`pages.support.services.items.${id}.body`)}
                </p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function SupportFaq() {
  const t = useTranslations();
  const { pages } = useMessages();
  const [openId, setOpenId] = useState<string | null>(FAQ_IDS[0]);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="border-b border-ink/5 bg-[#F8FAFF] py-12 sm:py-14 lg:py-16"
      aria-labelledby="support-faq-heading"
    >
      <Container>
        <Reveal>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            FAQ
          </p>
          <h2
            id="support-faq-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-ink"
          >
            {t("pages.support.faq.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {t("pages.support.faq.sub")}
          </p>
        </Reveal>

        <div className="mt-8 flex flex-col gap-3">
          {FAQ_IDS.map((id, index) => {
            const item = pages.support.faq.items[id];
            const open = openId === id;
            return (
              <Reveal key={id} delay={index * 0.04}>
                <article
                  className={`overflow-hidden rounded-[1.25rem] border bg-white/80 shadow-[0_10px_28px_rgb(10_22_32_/_0.05)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${
                    open
                      ? "border-brand/25 shadow-[0_16px_40px_rgb(0_98_250_/_0.1)]"
                      : "border-ink/8"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : id)}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/35 sm:items-center sm:px-6 sm:py-5"
                  >
                    <span className="font-display text-[0.975rem] font-semibold leading-snug text-ink sm:text-[1.05rem]">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.32,
                        ease: EASE,
                      }}
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/8 text-brand sm:mt-0"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.32,
                          ease: EASE,
                        }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-ink/6 px-5 pt-3 pb-5 text-[0.9375rem] leading-[1.75] text-ink/68 sm:px-6 sm:pt-4 sm:pb-6">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function SupportOffice() {
  const t = useTranslations();

  return (
    <section
      className="border-b border-ink/5 py-12 sm:py-14 lg:py-16"
      aria-labelledby="support-office-heading"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-10">
          <Reveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {t("pages.support.office.eyebrow")}
            </p>
            <h2
              id="support-office-heading"
              className="mt-2 font-display text-[clamp(1.55rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-ink"
            >
              {t("pages.support.office.heading")}
            </h2>

            <div className="support-glass-card mt-6 rounded-[1.25rem] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-[0.75rem] bg-brand/[0.1] text-brand">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {t("pages.support.locationLabel")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {siteConfig.address}
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-4 border-t border-ink/6 pt-5">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-ink/50 uppercase">
                    {t("pages.support.office.hoursLabel")}
                  </dt>
                  <dd className="mt-1 text-sm text-ink">
                    {t("pages.support.office.hoursValue")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-ink/50 uppercase">
                    {t("pages.support.office.parkingLabel")}
                  </dt>
                  <dd className="mt-1 text-sm text-ink">
                    {t("pages.support.office.parkingValue")}
                  </dd>
                </div>
              </dl>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(siteConfig.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="support-cta-btn support-cta-btn--secondary mt-6 w-full"
              >
                {t("pages.support.office.directions")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08} x={16} y={0}>
            <div className="support-map-frame h-full min-h-[18rem] lg:min-h-[22rem]">
              <iframe
                title={t("pages.support.office.mapTitle")}
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function SupportTrust() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="py-12 sm:py-14 lg:py-16"
      aria-labelledby="support-trust-heading"
    >
      <Container>
        <Reveal className="text-center">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("pages.support.trust.eyebrow")}
          </p>
          <h2
            id="support-trust-heading"
            className="mx-auto mt-2 max-w-[24ch] font-display text-[clamp(1.55rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-ink"
          >
            {t("pages.support.trust.heading")}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {TRUST_IDS.map((id, index) => (
            <motion.div
              key={id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
                ease: EASE,
              }}
              className="support-glass-card rounded-[1.35rem] px-5 py-6 text-center"
            >
              <p className="font-display text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
                {t(`pages.support.trust.items.${id}.value`)}
              </p>
              <p className="mt-2 text-sm font-medium text-ink-muted">
                {t(`pages.support.trust.items.${id}.label`)}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
