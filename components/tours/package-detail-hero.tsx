"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  Car,
  Check,
  Clock,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useRef } from "react";
import { Container } from "@/components/ui/container";
import { usePackageDetailVehicle } from "@/components/tours/package-detail-vehicle-context";
import type { TourGalleryImage, TourPackage } from "@/lib/tours/types";
import "@/components/tours/package-detail-polish.css";

type PackageDetailHeroProps = {
  pkg: TourPackage;
  hero: TourGalleryImage | null;
  tourStyle: string;
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Licensed Tour Operator" },
  { icon: Car, label: "Private Chauffeur" },
  { icon: Zap, label: "Instant Quote" },
  { icon: Headphones, label: "24/7 Support" },
] as const;

export function PackageDetailHero({
  pkg,
  hero,
  tourStyle,
}: PackageDetailHeroProps) {
  const { selectedVehicle } = usePackageDetailVehicle();
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollY, [0, 480], [0, reduceMotion ? 0 : 72]);
  const imageScale = useTransform(scrollY, [0, 480], [1.05, reduceMotion ? 1.05 : 1.12]);

  const metaBadges = [
    {
      icon: Clock,
      label: `${pkg.durationDays} Days`,
    },
    {
      icon: MapPin,
      label: `${pkg.destinationSlugs.length} Destinations`,
    },
    {
      icon: Car,
      label: selectedVehicle?.name ?? "Private vehicle",
    },
    {
      icon: Sparkles,
      label: tourStyle,
    },
    {
      icon: Star,
      label: "4.9 Rating",
    },
    {
      icon: ShieldCheck,
      label: "Private Chauffeur",
    },
  ] as const;

  return (
    <section
      ref={sectionRef}
      aria-label={`${pkg.title} tour overview`}
      className="relative isolate min-h-[min(78vh,720px)] overflow-hidden bg-map-void text-foam"
    >
      {hero ? (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: imageY, scale: imageScale }}
        >
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-map-void/95 via-map-void/38 to-map-void/18" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,rgb(7_16_24_/_0.55),transparent_62%)]"
        aria-hidden
      />

      <Container className="relative flex min-h-[min(78vh,720px)] flex-col justify-end pb-14 pt-28 sm:pb-16">
        <nav aria-label="Breadcrumb" className="text-xs text-foam/60">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/"
                className="rounded-sm transition-colors hover:text-foam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/60 focus-visible:ring-offset-2 focus-visible:ring-offset-map-void/50"
              >
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href="/tours"
                className="rounded-sm transition-colors hover:text-foam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/60 focus-visible:ring-offset-2 focus-visible:ring-offset-map-void/50"
              >
                Tours
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foam/85">{pkg.title}</li>
          </ol>
        </nav>

        <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.2em] text-brand-bright uppercase">
          {pkg.durationDays}-day private chauffeur journey
        </p>

        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,6.2vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-pretty drop-shadow-[0_2px_24px_rgb(0_0_0_/_0.35)]">
          {pkg.title}
        </h1>

        <p className="mt-6 max-w-2xl text-[0.975rem] leading-[1.7] text-pretty text-foam/78 sm:mt-7 sm:text-base sm:leading-[1.75]">
          {pkg.seo.intro}
        </p>

        <ul className="mt-7 flex flex-wrap gap-2 sm:mt-8">
          {metaBadges.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-foam/18 bg-foam/10 px-3 py-1.5 text-[0.6875rem] font-medium text-foam/90 shadow-[0_8px_24px_rgb(0_0_0_/_0.12)] backdrop-blur-md sm:text-xs"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-brand-bright" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap gap-3 sm:mt-10">
          <Link
            href="#book-tour"
            className="tour-detail-btn tour-detail-btn--primary min-h-12 px-8"
          >
            Request Private Quote
          </Link>
          <a
            href="#itinerary"
            className="tour-detail-btn tour-detail-btn--foam min-h-12 px-8"
          >
            View Itinerary
          </a>
        </div>

        <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 sm:mt-8">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 text-xs text-foam/65 sm:text-[0.8125rem]"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-brand-bright" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
