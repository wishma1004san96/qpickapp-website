"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, X } from "lucide-react";
import {
  CATEGORY_ICONS,
  HIGHLIGHT_CHIP_ICONS,
} from "@/components/tours/category-card";
import { CATEGORY_EXPANDED_CONTENT } from "@/lib/tours/categories/card-experience";
import {
  getBookHref,
  getGalleryImage,
  getPackageHref,
  getVehicleById,
} from "@/lib/tours/repository";
import type { TourCategory, TourPackage } from "@/lib/tours/types";

const EXPAND_MS = 0.4;
const EXPAND_EASE = [0.22, 1, 0.36, 1] as const;

const contentVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: EXPAND_MS, ease: EXPAND_EASE, staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: EXPAND_MS, ease: EXPAND_EASE } },
} as const;

type CategoryExpandedExperienceProps = {
  category: TourCategory;
  featuredPackages: TourPackage[];
  bookHref: string;
  onClose: () => void;
};

function durationLabel(packages: TourPackage[], fallback: string) {
  if (packages.length === 0) return fallback;
  const days = packages.map((p) => p.durationDays);
  const min = Math.min(...days);
  const max = Math.max(...days);
  if (min === max) return `${min} days`;
  return `${min}–${max} days`;
}

function vehicleLabel(packages: TourPackage[], fallback: string) {
  if (packages.length === 0) return fallback;
  const counts = new Map<string, number>();
  for (const pkg of packages) {
    const vehicle = getVehicleById(pkg.vehicleId);
    const name = vehicle?.name ?? pkg.vehicleId;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 2).map(([name]) => name);
  return top.join(" or ");
}

function FeaturedItinerary({
  pkg,
  index,
}: {
  pkg: TourPackage;
  index: number;
}) {
  const hero = getGalleryImage(pkg.heroGalleryId);
  const href = getPackageHref(pkg.slug);

  return (
    <motion.li variants={itemVariants}>
      <Link
        href={href}
        className="group flex gap-4 rounded-2xl border border-ink/8 bg-white p-3 shadow-[0_8px_24px_rgb(10_22_32_/_0.06)] transition hover:border-brand/20 hover:shadow-[0_12px_32px_rgb(10_22_32_/_0.1)] sm:p-4"
      >
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-28">
          {hero ? (
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              className="object-cover transition-transform duration-[400ms] group-hover:scale-105"
              sizes="112px"
            />
          ) : (
            <div className="absolute inset-0 bg-mist" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="font-mono text-[0.5625rem] tracking-[0.14em] text-brand uppercase">
            Itinerary {index + 1}
          </p>
          <h4 className="mt-0.5 line-clamp-2 font-display text-base font-semibold text-ink sm:text-lg">
            {pkg.title}
          </h4>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {pkg.durationDays} days
          </p>
        </div>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 self-center text-ink/25 transition group-hover:text-brand"
          aria-hidden
        />
      </Link>
    </motion.li>
  );
}

export function CategoryExpandedExperience({
  category,
  featuredPackages,
  bookHref,
  onClose,
}: CategoryExpandedExperienceProps) {
  const Icon = CATEGORY_ICONS[category.id];
  const content = CATEGORY_EXPANDED_CONTENT[category.id];
  const isAirport = category.id === "airport-transfers";
  const primaryPackage = featuredPackages[0];
  const exploreHref = primaryPackage
    ? getPackageHref(primaryPackage.slug)
    : bookHref;
  const journeyBookHref = primaryPackage
    ? getBookHref(primaryPackage.slug)
    : bookHref;

  const chips = [
    {
      icon: HIGHLIGHT_CHIP_ICONS.season,
      label: "Best season",
      value: content.bestSeason,
    },
    {
      icon: HIGHLIGHT_CHIP_ICONS.duration,
      label: "Duration",
      value: durationLabel(featuredPackages, content.duration),
    },
    {
      icon: HIGHLIGHT_CHIP_ICONS.vehicle,
      label: "Recommended vehicle",
      value: vehicleLabel(featuredPackages, content.recommendedVehicle),
    },
    {
      icon: HIGHLIGHT_CHIP_ICONS.destinations,
      label: "Popular destinations",
      value: content.popularDestinations,
    },
  ];

  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: EXPAND_MS, ease: EXPAND_EASE }}
      className="overflow-hidden rounded-[1.5rem] border border-brand/30 bg-white shadow-[0_0_0_1px_rgb(0_98_250_/_0.15),0_32px_80px_rgb(10_22_32_/_0.14)]"
    >
      <div className="relative aspect-[16/7] min-h-[12rem] w-full overflow-hidden sm:aspect-[21/8] sm:min-h-[14rem]">
        <Image
          src={category.imageSrc}
          alt={category.imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-map-void/90 via-map-void/35 to-map-void/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-map-void/50 via-transparent to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-map-void/50 text-foam backdrop-blur-md transition hover:bg-map-void/70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-foam backdrop-blur-md">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-4 font-mono text-[0.625rem] tracking-[0.18em] text-brand-bright uppercase">
            {category.title}
          </p>
          <h3 className="mt-2 max-w-3xl font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-foam">
            {content.emotionalHeading}
          </h3>
        </div>
      </div>

      <motion.div
        className="p-5 sm:p-8"
        variants={contentVariants}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={itemVariants}
          className="max-w-3xl text-base leading-relaxed text-ink/65 sm:text-lg"
        >
          {content.description}
        </motion.p>

        <motion.ul
          variants={itemVariants}
          className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {chips.map((chip) => (
            <li
              key={chip.label}
              className="rounded-2xl border border-ink/8 bg-foam/60 px-4 py-3"
            >
              <p className="flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.12em] text-ink/45 uppercase">
                <chip.icon className="h-3.5 w-3.5" aria-hidden />
                {chip.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{chip.value}</p>
            </li>
          ))}
        </motion.ul>

        {isAirport ? (
          <motion.div variants={itemVariants} className="mt-8">
            <p className="max-w-2xl text-sm leading-relaxed text-ink/60">
              Airport meet-and-greet, hotel corridors, and CMB departures are
              booked separately from multi-day tour packages — with the same Q
              Pick chauffeur standard.
            </p>
            <Link
              href="/airport-transfer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.3)]"
            >
              Book airport transfer
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        ) : featuredPackages.length > 0 ? (
          <>
            <motion.div variants={itemVariants} className="mt-8">
              <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
                Featured itineraries
              </p>
              <ul className="mt-4 grid gap-3 lg:grid-cols-3">
                {featuredPackages.slice(0, 3).map((pkg, index) => (
                  <FeaturedItinerary key={pkg.slug} pkg={pkg} index={index} />
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={exploreHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink/12 bg-white px-6 text-sm font-semibold text-ink transition hover:border-brand/25 hover:text-brand"
              >
                Explore This Journey
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={journeyBookHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.3)]"
              >
                Book This Journey
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div variants={itemVariants} className="mt-8">
            <p className="max-w-2xl text-sm leading-relaxed text-ink/60">
              Our planners can shape a private route for this style — share your
              dates and we confirm pacing, vehicle, and a written quote.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={bookHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-brand/20 bg-brand/8 px-6 text-sm font-semibold text-brand hover:bg-brand/12"
              >
                Explore This Journey
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={bookHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.3)]"
              >
                Book This Journey
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.article>
  );
}
