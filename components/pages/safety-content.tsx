"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  BadgeCheck,
  Car,
  ChevronDown,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  CalendarCheck,
  Flag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  useMessages,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { getDestinationImageSrc } from "@/lib/destination-image-catalog";
import { siteConfig, whatsappLink } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

const STANDARD_ICONS = {
  verifiedDrivers: BadgeCheck,
  verifiedVehicles: Car,
  gpsTracking: Navigation,
  support247: Headphones,
} as const;

const TIMELINE_ICONS = {
  book: CalendarCheck,
  verification: ShieldCheck,
  pickup: Car,
  tracking: MapPin,
  arrival: Flag,
} as const;

const STANDARD_KEYS = [
  "verifiedDrivers",
  "verifiedVehicles",
  "gpsTracking",
  "support247",
] as const;

const TIMELINE_KEYS = [
  "book",
  "verification",
  "pickup",
  "tracking",
  "arrival",
] as const;

const STAT_KEYS = [
  "verifiedDrivers",
  "insuredJourneys",
  "support247",
  "satisfaction",
] as const;

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: reduceMotion ? 0 : delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedStat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduceMotion = useReducedMotion() ?? false;
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: EASE,
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, motionValue, rounded, reduceMotion, value]);

  return (
    <div
      ref={ref}
      className="rounded-[1.35rem] border border-white/70 bg-white/55 px-5 py-6 text-center shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] backdrop-blur-xl"
    >
      <p className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-tight text-ink">
        {display}
        <span className="text-brand">{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium text-ink/55">{label}</p>
    </div>
  );
}

function FaqAccordion({
  items,
  heading,
}: {
  heading: string;
  items: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section aria-labelledby="safety-faq-heading" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <RevealSection>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            FAQ
          </p>
          <h2
            id="safety-faq-heading"
            className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-ink"
          >
            {heading}
          </h2>
        </RevealSection>

        <div className="mt-10 space-y-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <RevealSection key={item.q} delay={index * 0.04}>
                <div className="overflow-hidden rounded-[1.15rem] border border-ink/8 bg-white/70 shadow-[0_8px_28px_rgb(10_22_32_/_0.04)] backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                    aria-expanded={open}
                  >
                    <span className="text-sm font-semibold text-ink sm:text-base">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-brand transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: open ? "auto" : 0,
                      opacity: open ? 1 : 0,
                    }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.32,
                      ease: EASE,
                    }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/60 sm:px-6 sm:pb-6">
                      {item.a}
                    </p>
                  </motion.div>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function SafetyContent() {
  const { pages } = useMessages();
  const safety = pages.safety;
  const reduceMotion = useReducedMotion() ?? false;
  const finalBg = getDestinationImageSrc("sigiriya");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: safety.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="bg-foam">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. Premium Hero */}
      <section
        aria-labelledby="safety-hero-heading"
        className="relative min-h-[min(92vh,880px)] overflow-hidden bg-map-void"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/story/chauffeur.webp"
            alt={safety.hero.imageAlt}
            fill
            priority
            className="object-cover object-[center_30%] opacity-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-map-void/95 via-map-void/72 to-map-void/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-map-void/80 via-transparent to-map-void/20" />
        </div>

        <Container className="relative z-[1] flex min-h-[min(92vh,880px)] flex-col justify-end pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-2xl"
          >
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-[0.625rem] tracking-[0.16em] text-brand-bright uppercase backdrop-blur-md sm:text-[0.6875rem]">
              {safety.hero.eyebrow}
            </p>
            <h1
              id="safety-hero-heading"
              className="mt-6 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] font-semibold tracking-tight text-foam"
            >
              <span className="block">{safety.hero.headline}</span>
              <span className="block text-brand-bright">{safety.hero.headlineLine2}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foam/72 sm:text-lg">
              {safety.hero.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/ride"
                className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-7 text-sm font-semibold text-paper shadow-[0_12px_32px_rgb(0_98_250_/_0.35)] transition hover:brightness-110 motion-safe:hover:-translate-y-0.5"
              >
                {safety.hero.primaryCta}
              </Link>
              <Link
                href="/support"
                className="inline-flex min-h-12 items-center justify-center rounded-[16px] border border-foam/25 bg-foam/10 px-7 text-sm font-semibold text-foam backdrop-blur-md transition hover:bg-foam/15 motion-safe:hover:-translate-y-0.5"
              >
                {safety.hero.secondaryCta}
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 2. Safety Standards */}
      <section
        aria-labelledby="safety-standards-heading"
        className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_12%_20%,rgb(0_98_250_/_0.08),transparent_60%),radial-gradient(50%_45%_at_88%_70%,rgb(1_147_251_/_0.07),transparent_58%)]"
          aria-hidden
        />
        <Container className="relative">
          <RevealSection>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {safety.standards.eyebrow}
            </p>
            <h2
              id="safety-standards-heading"
              className="mt-3 max-w-[20ch] font-display text-[clamp(1.75rem,3.5vw,2.65rem)] font-semibold tracking-tight text-ink"
            >
              {safety.standards.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/55">
              {safety.standards.description}
            </p>
          </RevealSection>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-5">
            {STANDARD_KEYS.map((key, index) => {
              const card = safety.standards.cards[key];
              const Icon = STANDARD_ICONS[key];
              return (
                <RevealSection key={key} delay={index * 0.06}>
                  <article className="group relative h-full overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/55 p-6 shadow-[0_16px_44px_rgb(10_22_32_/_0.06)] backdrop-blur-xl transition duration-300 hover:border-brand/20 hover:bg-white/75 hover:shadow-[0_20px_52px_rgb(0_98_250_/_0.1)] sm:p-7">
                    <div
                      className="pointer-events-none absolute -top-16 -right-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.12),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/15 bg-brand/8 text-brand">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="relative mt-5 text-lg font-semibold tracking-tight text-ink">
                      {card.title}
                    </h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink/55">
                      {card.body}
                    </p>
                  </article>
                </RevealSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. Journey Protection Timeline */}
      <section
        aria-labelledby="safety-timeline-heading"
        className="border-y border-ink/6 bg-[linear-gradient(180deg,#f7fafc_0%,#eef4fb_100%)] py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <RevealSection>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {safety.timeline.eyebrow}
            </p>
            <h2
              id="safety-timeline-heading"
              className="mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-ink"
            >
              {safety.timeline.heading}
            </h2>
          </RevealSection>

          <ol className="relative mt-12 grid gap-8 md:grid-cols-5 md:gap-4">
            <div
              className="pointer-events-none absolute top-8 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent md:block"
              aria-hidden
            />
            {TIMELINE_KEYS.map((key, index) => {
              const step = safety.timeline.steps[key];
              const Icon = TIMELINE_ICONS[key];
              return (
                <li key={key}>
                  <RevealSection delay={index * 0.05} className="flex flex-col items-start md:items-center md:text-center">
                    <div className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-brand shadow-[0_8px_24px_rgb(0_98_250_/_0.12)] backdrop-blur-md">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <p className="mt-4 font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-ink/55 md:mx-auto">
                      {step.body}
                    </p>
                  </RevealSection>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* 4. Emergency Assistance */}
      <section
        aria-labelledby="safety-emergency-heading"
        className="py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <div className="overflow-hidden rounded-[1.75rem] border border-ink/8 bg-map-void shadow-[0_24px_64px_rgb(10_22_32_/_0.18)]">
            <div className="grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
              <div className="border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r">
                <RevealSection>
                  <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
                    {safety.emergency.eyebrow}
                  </p>
                  <h2
                    id="safety-emergency-heading"
                    className="mt-3 font-display text-[clamp(1.65rem,3vw,2.25rem)] font-semibold tracking-tight text-foam"
                  >
                    {safety.emergency.heading}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-foam/65 sm:text-base">
                    {safety.emergency.description}
                  </p>
                </RevealSection>
              </div>

              <div className="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  {
                    key: "hotline" as const,
                    href: `tel:${siteConfig.emergencyLine.replace(/\s/g, "")}`,
                    value: siteConfig.emergencyLine,
                    icon: Phone,
                  },
                  {
                    key: "whatsapp" as const,
                    href: whatsappLink.href,
                    value: siteConfig.phones.whatsapp,
                    icon: MessageCircle,
                  },
                  {
                    key: "email" as const,
                    href: `mailto:${siteConfig.supportEmail}`,
                    value: siteConfig.supportEmail,
                    icon: Mail,
                  },
                ].map((channel, index) => {
                  const copy = safety.emergency[channel.key];
                  const Icon = channel.icon;
                  return (
                    <RevealSection key={channel.key} delay={index * 0.06}>
                      <a
                        href={channel.href}
                        className="group flex h-full flex-col justify-between bg-map-void/95 p-6 transition hover:bg-map-void sm:p-7"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-bright/25 bg-brand/15 text-brand-bright">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <p className="text-sm font-semibold text-foam">{copy.label}</p>
                        </div>
                        <p className="mt-4 font-mono text-sm text-brand-bright transition group-hover:text-foam">
                          {channel.value}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-foam/50">{copy.hint}</p>
                      </a>
                    </RevealSection>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Trust Statistics */}
      <section
        aria-labelledby="safety-stats-heading"
        className="border-t border-ink/6 py-16 sm:py-20 lg:py-24"
      >
        <Container>
          <RevealSection className="text-center">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {safety.stats.eyebrow}
            </p>
            <h2
              id="safety-stats-heading"
              className="mx-auto mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-ink"
            >
              {safety.stats.heading}
            </h2>
          </RevealSection>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {STAT_KEYS.map((key) => {
              const stat = safety.stats.items[key];
              return (
                <AnimatedStat
                  key={key}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              );
            })}
          </div>
        </Container>
      </section>

      {/* 6. FAQ */}
      <FaqAccordion heading={safety.faqHeading} items={safety.faqs} />

      {/* 7. Final CTA */}
      <section
        aria-labelledby="safety-final-cta-heading"
        className="relative overflow-hidden py-20 sm:py-24 lg:py-28"
      >
        <div className="absolute inset-0">
          <Image
            src={finalBg}
            alt={safety.finalCta.imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-map-void/72" />
          <div className="absolute inset-0 bg-gradient-to-t from-map-void/90 via-map-void/50 to-map-void/30" />
        </div>

        <Container className="relative z-[1]">
          <RevealSection className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
              {safety.finalCta.eyebrow}
            </p>
            <h2
              id="safety-final-cta-heading"
              className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight text-foam"
            >
              {safety.finalCta.heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foam/70 sm:text-lg">
              {safety.finalCta.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/ride"
                className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-7 text-sm font-semibold text-paper shadow-[0_12px_32px_rgb(0_98_250_/_0.35)] transition hover:brightness-110 motion-safe:hover:-translate-y-0.5"
              >
                {safety.finalCta.primaryCta}
              </Link>
              <Link
                href="/tour-booking"
                className="inline-flex min-h-12 items-center justify-center rounded-[16px] border border-foam/25 bg-foam/10 px-7 text-sm font-semibold text-foam backdrop-blur-md transition hover:bg-foam/15 motion-safe:hover:-translate-y-0.5"
              >
                {safety.finalCta.secondaryCta}
              </Link>
            </div>
          </RevealSection>
        </Container>
      </section>
    </div>
  );
}
