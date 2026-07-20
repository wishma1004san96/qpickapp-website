"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { CategoryCard } from "@/components/tours/category-card";
import { CinematicFinalCta } from "@/components/tours/cinematic-final-cta";
import { DestinationExperienceCard } from "@/components/tours/destination-experience-card";
import { FaqAccordion } from "@/components/tours/faq-accordion";
import { IslandExplorerMap } from "@/components/tours/island-explorer-map";
import { PackageCard } from "@/components/tours/package-card";
import { TrustSection } from "@/components/tours/trust-section";
import { VehicleCard } from "@/components/tours/vehicle-card";
import type {
  TourCategory,
  TourDestination,
  TourFaq,
  TourGalleryImage,
  TourPackage,
  TourReview,
  TourVehicle,
  TrustSignal,
} from "@/lib/tours/types";

type ToursExperienceProps = {
  hero: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  heroImage: TourGalleryImage | null;
  packages: TourPackage[];
  destinations: TourDestination[];
  categories: TourCategory[];
  vehicles: TourVehicle[];
  trust: TrustSignal[];
  reviews: TourReview[];
  reviewsMeta: {
    title: string;
    emptyTitle: string;
    emptyBody: string;
  };
  faqs: TourFaq[];
  finalCta: {
    headline: string;
    body: string;
    ctaLabel: string;
    secondaryLabel?: string;
    secondaryHref?: string;
    href: string;
  };
  finalCtaImage: TourGalleryImage | null;
  bookHref: string;
};

const BROWSE_ORDER = [
  "cultural",
  "beach",
  "wildlife",
  "luxury",
  "adventure",
  "honeymoon",
  "family",
  "photography",
  "nature",
] as const;

export function ToursExperience({
  hero,
  heroImage,
  packages,
  destinations,
  categories,
  vehicles,
  trust,
  reviews,
  reviewsMeta,
  faqs,
  finalCta,
  finalCtaImage,
  bookHref,
}: ToursExperienceProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [filterSlug, setFilterSlug] = useState<string | null>(null);

  const featured = useMemo(() => {
    if (!filterSlug) return packages.filter((p) => p.popular);
    return packages.filter((p) => p.destinationSlugs.includes(filterSlug));
  }, [packages, filterSlug]);

  const filterName = destinations.find((d) => d.slug === filterSlug)?.name;

  const browseCategories = BROWSE_ORDER.map((id) =>
    categories.find((c) => c.id === id),
  ).filter((c): c is TourCategory => c != null);

  return (
    <>
      <section className="relative isolate min-h-[min(92vh,900px)] overflow-hidden bg-map-void text-foam">
        {heroImage ? (
          <motion.div
            className="absolute inset-0"
            initial={reduceMotion ? false : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-map-void via-map-void/70 to-map-void/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-map-void via-transparent to-map-void/40" />
        <Container className="relative flex min-h-[min(92vh,900px)] flex-col justify-end pb-16 pt-28 sm:pb-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-brand-bright uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
              {hero.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foam/70 sm:text-lg">
              {hero.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-7 text-sm font-semibold text-paper shadow-[0_14px_32px_rgb(0_98_250_/_0.4)]"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-foam/25 bg-foam/10 px-7 text-sm font-semibold text-foam backdrop-blur-md hover:bg-foam/15"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      <div className="bg-foam">
        <Container className="py-16 sm:py-20">
          <IslandExplorerMap
            destinations={destinations}
            packages={packages}
            selectedSlug={filterSlug}
            onDestinationSelect={setFilterSlug}
          />
        </Container>

        <section id="packages" className="scroll-mt-24">
          <Container className="pb-16 sm:pb-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
                  Featured journeys
                </p>
                <h2 className="mt-1 font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold text-ink">
                  {filterName
                    ? `Journeys through ${filterName}`
                    : "Private tour packages"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-ink/55">
                  Each itinerary is a living story — refine destinations, pace,
                  and vehicle in the planner.
                </p>
              </div>
              {filterSlug ? (
                <button
                  type="button"
                  onClick={() => setFilterSlug(null)}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Clear map filter
                </button>
              ) : (
                <Link
                  href={bookHref}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Plan My Tour →
                </Link>
              )}
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {featured.map((pkg) => (
                  <PackageCard key={pkg.slug} package={pkg} />
                ))}
              </motion.div>
            </AnimatePresence>
            {featured.length === 0 ? (
              <p className="mt-6 text-sm text-ink/50">
                No published packages currently list this stop — plan a custom
                route instead.
              </p>
            ) : null}
          </Container>
        </section>

        <Container className="pb-16 sm:pb-20">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            Browse by mood
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink/55">
            Culture, coast, wildlife, luxury — choose how you want Sri Lanka to
            feel.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {browseCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                packageCount={
                  packages.filter((p) => p.categoryIds.includes(category.id))
                    .length
                }
              />
            ))}
          </div>
        </Container>

        <Container className="pb-16 sm:pb-20">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            Destination experiences
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink/55">
            Real places, seasons, and photography windows — not just labels on a
            card.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationExperienceCard
                key={destination.slug}
                destination={destination}
                href={
                  destination.relatedPackageSlugs[0]
                    ? `/tours/${destination.relatedPackageSlugs[0]}`
                    : "/tours#packages"
                }
              />
            ))}
          </div>
        </Container>

        <Container className="pb-16 sm:pb-20">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            Travel in private comfort
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink/55">
            Sedan to mini coach — air conditioning, luggage space, and charging
            for the road.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} experience />
            ))}
          </div>
        </Container>

        <Container className="pb-16 sm:pb-20">
          <TrustSection signals={trust} title="Why Travel With Q Pick" />
        </Container>

        <Container className="pb-16 sm:pb-20">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            {reviewsMeta.title}
          </h2>
          {reviews.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <blockquote
                  key={r.id}
                  className="rounded-[1.35rem] border border-ink/8 bg-white p-6"
                >
                  <p className="text-sm leading-relaxed text-ink/70">“{r.quote}”</p>
                  <footer className="mt-4 text-xs font-semibold text-ink">
                    {r.author}
                    <span className="font-normal text-ink/40"> · {r.location}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <div className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-gradient-to-br from-[#0b1c28] via-[#143044] to-[#0a1620] px-6 py-12 text-foam sm:px-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 80% 20%, rgb(43 125 255 / 0.35), transparent 40%)",
                }}
              />
              <p className="relative font-display text-2xl font-semibold sm:text-3xl">
                {reviewsMeta.emptyTitle}
              </p>
              <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-foam/60">
                Verified guest reviews will appear after published trips. We do
                not display invented testimonials, ratings, or awards.
              </p>
              <p className="relative mt-6 text-xs tracking-wide text-foam/40 uppercase">
                Trust before testimonials
              </p>
            </div>
          )}
        </Container>

        <Container className="pb-16 sm:pb-20">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            FAQ
          </h2>
          <div className="mt-6">
            <FaqAccordion faqs={faqs} />
          </div>
        </Container>

        <Container className="pb-20 sm:pb-24">
          <CinematicFinalCta
            headline={finalCta.headline}
            body={finalCta.body}
            primaryLabel={finalCta.ctaLabel}
            primaryHref={finalCta.href}
            secondaryLabel={finalCta.secondaryLabel}
            secondaryHref={finalCta.secondaryHref}
            imageSrc={finalCtaImage?.src ?? "/images/destinations/ella.webp"}
            imageAlt={
              finalCtaImage?.alt ?? "Scenic Sri Lanka highland journey"
            }
          />
        </Container>
      </div>
    </>
  );
}
