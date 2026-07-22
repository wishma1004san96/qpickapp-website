"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Binoculars,
  Calendar,
  Car,
  Clock,
  Compass,
  Gem,
  Grid3X3,
  Heart,
  Landmark,
  Leaf,
  MapPin,
  Mountain,
  Plane,
  Sparkles,
  Train,
  Umbrella,
  Users,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TourCategory, TourCategoryId } from "@/lib/tours/types";

export const CATEGORY_ICONS: Record<TourCategoryId, LucideIcon> = {
  popular: Sparkles,
  "cultural-heritage": Landmark,
  "wildlife-safari": Binoculars,
  "beach-holidays": Umbrella,
  "hill-country-tea": Mountain,
  adventure: Zap,
  "train-journeys": Train,
  honeymoon: Heart,
  "luxury-escapes": Gem,
  family: Users,
  "ayurveda-wellness": Leaf,
  food: Utensils,
  festival: Calendar,
  "airport-transfers": Plane,
  "custom-private": Compass,
};

const frameBase =
  "group relative w-full overflow-hidden rounded-[1.5rem] border border-ink/8 text-left shadow-[0_20px_50px_rgb(10_22_32_/_0.12)] outline-none transition-[box-shadow,border-color,opacity] duration-[400ms] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-foam hover:border-brand/25 hover:shadow-[0_28px_60px_rgb(10_22_32_/_0.18)]";

type CategoryCardProps = {
  category: TourCategory;
  packageCount: number;
  dimmed?: boolean;
  onSelect?: () => void;
  className?: string;
};

type AllCategoriesCardProps = {
  packageCount: number;
  dimmed?: boolean;
  onSelect: () => void;
  className?: string;
};

function CollapsedCardBody({
  icon: Icon,
  countLabel,
  title,
  intro,
  imageSrc,
  imageAlt,
}: {
  icon: LucideIcon;
  countLabel: string;
  title: string;
  intro: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ""}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-map-void via-[#1a3a5c] to-brand/40" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_20%_0%,rgb(0_98_250_/_0.35),transparent_60%)]" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-map-void/92 via-map-void/45 to-map-void/15" />
      <div className="relative flex h-full min-h-[15.5rem] flex-col justify-end p-5 sm:min-h-[17rem] sm:p-6">
        <span className="mb-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-foam backdrop-blur-md">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <p className="font-mono text-[0.5625rem] tracking-[0.18em] text-brand-bright uppercase">
          {countLabel}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-foam sm:text-[1.35rem]">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foam/70">
          {intro}
        </p>
      </div>
    </>
  );
}

export function AllCategoriesCard({
  packageCount,
  dimmed = false,
  onSelect,
  className = "",
}: AllCategoriesCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label="View all categories"
      className={`${frameBase} ${dimmed ? "opacity-45 saturate-[0.85]" : "opacity-100"} ${className}`}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.35 }}
    >
      <CollapsedCardBody
        icon={Grid3X3}
        countLabel={`${packageCount} ${packageCount === 1 ? "itinerary" : "itineraries"}`}
        title="All Categories"
        intro="Browse every published private tour — reset and explore the full Q Pick collection."
      />
    </motion.button>
  );
}

export function CategoryCard({
  category,
  packageCount,
  dimmed = false,
  onSelect,
  className = "",
}: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.id] ?? Sparkles;
  const countLabel =
    category.id === "airport-transfers"
      ? "CMB service"
      : category.id === "custom-private"
        ? `${packageCount} itineraries`
        : `${packageCount} ${packageCount === 1 ? "package" : "packages"}`;

  const frameClass = `${frameBase} ${dimmed ? "opacity-45 saturate-[0.85]" : "opacity-100"} ${className}`;

  const body = (
    <CollapsedCardBody
      icon={Icon}
      countLabel={countLabel}
      title={category.title}
      intro={category.intro}
      imageSrc={category.imageSrc}
      imageAlt={category.imageAlt}
    />
  );

  if (onSelect) {
    return (
      <motion.button
        type="button"
        onClick={onSelect}
        aria-expanded={false}
        aria-label={`Open ${category.title}`}
        className={frameClass}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.35 }}
      >
        {body}
      </motion.button>
    );
  }

  return (
    <Link href={`/tours#${category.hash}`} className={`${frameClass} block`}>
      {body}
    </Link>
  );
}

export const HIGHLIGHT_CHIP_ICONS = {
  season: Calendar,
  duration: Clock,
  vehicle: Car,
  destinations: MapPin,
} as const;
