"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  Calendar,
  Car,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  MapPin,
  Play,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMessages } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { DriveJourneyTimeline } from "@/components/pages/drive-journey-timeline";
import { fleetVehiclePhoto } from "@/components/icons/vehicles/fleet-catalog";
import type { QPickVehicleIconId } from "@/components/icons/vehicles/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const WHY_ICONS = {
  earnings: Banknote,
  schedule: Calendar,
  clients: Users,
  support: Headphones,
} as const;

const WHY_KEYS = ["earnings", "schedule", "clients", "support"] as const;

const JOURNEY_ICONS = {
  apply: ClipboardCheck,
  verify: ShieldCheck,
  inspection: Car,
  training: GraduationCap,
  approved: BadgeCheck,
  start: Play,
} as const;

const DRIVE_FLEET_CATEGORIES: {
  iconId: QPickVehicleIconId;
  label: string;
}[] = [
  { iconId: "mini", label: "Mini" },
  { iconId: "sedan", label: "Sedan" },
  { iconId: "suv", label: "SUV" },
  { iconId: "frVan", label: "Flat Roof Van" },
  { iconId: "highRoofVan", label: "High Roof Van" },
  { iconId: "miniBus", label: "Mini Bus" },
  { iconId: "bus", label: "Bus" },
];

const JOURNEY_KEYS = [
  "apply",
  "verify",
  "inspection",
  "training",
  "approved",
  "start",
] as const;

function Reveal({
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
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay: reduceMotion ? 0 : delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DriveContent() {
  const { pages } = useMessages();
  const drive = pages.drive;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="bg-foam">
      {/* 1. Premium Hero */}
      <section
        aria-labelledby="drive-hero-heading"
        className="relative min-h-[min(92vh,860px)] overflow-hidden bg-map-void"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/story/chauffeur.webp"
            alt={drive.hero.imageAlt}
            fill
            priority
            className="object-cover object-[center_35%] opacity-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-map-void/95 via-map-void/75 to-map-void/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-map-void/85 via-transparent to-map-void/15" />
        </div>

        <Container className="relative z-[1] flex min-h-[min(92vh,860px)] flex-col justify-end pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-2xl"
          >
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-[0.625rem] tracking-[0.16em] text-brand-bright uppercase backdrop-blur-md sm:text-[0.6875rem]">
              {drive.hero.eyebrow}
            </p>
            <h1
              id="drive-hero-heading"
              className="mt-6 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] font-semibold tracking-tight text-foam"
            >
              <span className="block">{drive.hero.headline}</span>
              <span className="block text-brand-bright">{drive.hero.headlineLine2}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foam/72 sm:text-lg">
              {drive.hero.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/drive/apply"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-7 text-sm font-semibold text-paper shadow-[0_12px_32px_rgb(0_98_250_/_0.35)] transition hover:brightness-110 motion-safe:hover:-translate-y-0.5"
              >
                {drive.hero.primaryCta}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#requirements"
                className="inline-flex min-h-12 items-center justify-center rounded-[16px] border border-foam/25 bg-foam/10 px-7 text-sm font-semibold text-foam backdrop-blur-md transition hover:bg-foam/15 motion-safe:hover:-translate-y-0.5"
              >
                {drive.hero.secondaryCta}
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 2. Why Join Q Pick */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_12%_20%,rgb(0_98_250_/_0.08),transparent_60%),radial-gradient(50%_45%_at_88%_70%,rgb(1_147_251_/_0.07),transparent_58%)]"
          aria-hidden
        />
        <Container className="relative">
          <Reveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {drive.whyJoin.eyebrow}
            </p>
            <h2 className="mt-3 max-w-[20ch] font-display text-[clamp(1.75rem,3.5vw,2.65rem)] font-semibold tracking-tight text-ink">
              {drive.whyJoin.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/55">
              {drive.whyJoin.description}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-5">
            {WHY_KEYS.map((key, index) => {
              const card = drive.whyJoin.cards[key];
              const Icon = WHY_ICONS[key];
              return (
                <Reveal key={key} delay={index * 0.06}>
                  <article className="group h-full overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/55 p-6 shadow-[0_16px_44px_rgb(10_22_32_/_0.06)] backdrop-blur-xl transition duration-300 hover:border-brand/20 hover:bg-white/75 hover:shadow-[0_20px_52px_rgb(0_98_250_/_0.1)] sm:p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/15 bg-brand/8 text-brand">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/55">{card.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. Fleet Categories */}
      <section className="border-y border-ink/6 bg-[linear-gradient(180deg,#f7fafc_0%,#eef4fb_100%)] py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {drive.fleet.eyebrow}
            </p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-ink">
              {drive.fleet.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/55">
              {drive.fleet.description}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DRIVE_FLEET_CATEGORIES.map((category, index) => {
              const photo = fleetVehiclePhoto(category.iconId);
              if (!photo) return null;
              return (
                <Reveal key={category.iconId} delay={index * 0.04}>
                  <div className="flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white shadow-[0_12px_36px_rgb(10_22_32_/_0.06)]">
                    <div className="flex h-44 w-full items-center justify-center bg-gradient-to-b from-[#eef4fb] to-white px-5 py-4">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={280}
                        height={160}
                        unoptimized={photo.src.endsWith(".png")}
                        className="max-h-full w-auto max-w-full object-contain object-center"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="mt-auto border-t border-ink/6 px-4 py-3.5">
                      <p className="text-sm font-semibold text-ink">{category.label}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. Driver Journey Timeline */}
      <DriveJourneyTimeline
        eyebrow={drive.journey.eyebrow}
        heading={drive.journey.heading}
        steps={JOURNEY_KEYS.map((key) => ({
          key,
          title: drive.journey.steps[key].title,
          body: drive.journey.steps[key].body,
          icon: JOURNEY_ICONS[key],
        }))}
      />

      {/* 5. Driver Testimonials */}
      <section className="border-y border-ink/6 bg-map-void py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
              {drive.testimonials.eyebrow}
            </p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-foam">
              {drive.testimonials.heading}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {drive.testimonials.items.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.06}>
                <blockquote className="flex h-full flex-col rounded-[1.35rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex gap-0.5 text-brand-bright" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-foam/75">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="mt-6 border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-foam">{item.name}</p>
                    <p className="mt-1 text-xs text-foam/50">{item.role}</p>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Driver Requirements */}
      <section id="requirements" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-start">
            <Reveal>
              <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
                {drive.requirements.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-ink">
                {drive.requirements.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/55">
                {drive.requirements.description}
              </p>
              <Link
                href="/drive/apply"
                className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-5 text-sm font-semibold text-paper"
              >
                {drive.hero.primaryCta}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>

            <Reveal delay={0.08}>
              <ul className="space-y-3">
                {drive.requirements.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-[1.1rem] border border-ink/8 bg-white px-4 py-3.5 text-sm leading-relaxed text-ink/70 shadow-[0_8px_24px_rgb(10_22_32_/_0.04)]"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 7. Example Earnings */}
      <section className="border-t border-ink/6 bg-[linear-gradient(180deg,#f7fafc_0%,#eef4fb_100%)] py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
              {drive.earnings.eyebrow}
            </p>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-ink">
              {drive.earnings.heading}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/55">
              {drive.earnings.description}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {drive.earnings.examples.map((example, index) => (
              <Reveal key={example.label} delay={index * 0.05}>
                <div className="rounded-[1.25rem] border border-ink/8 bg-white p-5 shadow-[0_12px_36px_rgb(10_22_32_/_0.05)]">
                  <p className="text-sm font-medium text-ink/55">{example.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-brand">
                    {example.amount}
                  </p>
                  <p className="mt-2 text-xs text-ink/45">{example.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-ink/40">
            {drive.earnings.disclaimer}
          </p>
        </Container>
      </section>

      {/* 8. Final CTA */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-0">
          <Image
            src="/images/app/driver-app/hire-map.webp"
            alt={drive.finalCta.imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-map-void/78" />
          <div className="absolute inset-0 bg-gradient-to-t from-map-void/90 via-map-void/55 to-map-void/35" />
        </div>

        <Container className="relative z-[1]">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
              {drive.finalCta.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight text-foam">
              {drive.finalCta.heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foam/70 sm:text-lg">
              {drive.finalCta.description}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/drive/apply"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-7 text-sm font-semibold text-paper shadow-[0_12px_32px_rgb(0_98_250_/_0.35)] transition hover:brightness-110 motion-safe:hover:-translate-y-0.5"
              >
                {drive.finalCta.primaryCta}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#requirements"
                className="inline-flex min-h-12 items-center justify-center rounded-[16px] border border-foam/25 bg-foam/10 px-7 text-sm font-semibold text-foam backdrop-blur-md transition hover:bg-foam/15"
              >
                {drive.finalCta.secondaryCta}
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
