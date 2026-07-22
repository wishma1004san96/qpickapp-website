"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Search, X } from "lucide-react";
import { CategoryExpandedExperience } from "@/components/tours/category-expanded-experience";
import {
  AllCategoriesCard,
  CategoryCard,
} from "@/components/tours/category-card";
import { PackageCard } from "@/components/tours/package-card";
import type { TourCategory, TourCategoryId, TourPackage } from "@/lib/tours/types";

const BROWSE_ORDER: TourCategoryId[] = [
  "cultural-heritage",
  "wildlife-safari",
  "beach-holidays",
  "hill-country-tea",
  "adventure",
  "train-journeys",
  "honeymoon",
  "luxury-escapes",
  "family",
  "ayurveda-wellness",
  "food",
  "festival",
  "airport-transfers",
  "custom-private",
];

const LAYOUT_TRANSITION = { duration: 0.4, ease: [0.22, 1, 0.36, 1] } as const;

const PACKAGE_GRID_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
} as const;

const PACKAGE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
} as const;

type TourCategoryExplorerProps = {
  categories: TourCategory[];
  packages: TourPackage[];
  destinations: { slug: string; name: string }[];
  bookHref: string;
  mapFilterSlug?: string | null;
  onClearMapFilter?: () => void;
};

function countPackagesForCategory(
  categoryId: TourCategoryId,
  packages: TourPackage[],
): number {
  if (categoryId === "custom-private") return packages.length;
  if (categoryId === "airport-transfers") return 0;
  return packages.filter((p) => p.categoryIds.includes(categoryId)).length;
}

function packagesForCategory(
  categoryId: TourCategoryId,
  packages: TourPackage[],
): TourPackage[] {
  if (categoryId === "custom-private") return packages;
  if (categoryId === "airport-transfers") return [];
  return packages.filter((p) => p.categoryIds.includes(categoryId));
}

function packageMatchesQuery(
  pkg: TourPackage,
  query: string,
  destinations: { slug: string; name: string }[],
): boolean {
  const destNames = pkg.destinationSlugs
    .map((slug) => destinations.find((d) => d.slug === slug)?.name ?? slug)
    .join(" ");
  const haystack = [pkg.title, pkg.seo.intro, destNames, ...pkg.highlights]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function TourCategoryExplorer({
  categories,
  packages,
  destinations,
  bookHref,
  mapFilterSlug,
  onClearMapFilter,
}: TourCategoryExplorerProps) {
  const [query, setQuery] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] =
    useState<TourCategoryId | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const browseCategories = useMemo(
    () =>
      BROWSE_ORDER.map((id) => categories.find((c) => c.id === id)).filter(
        (c): c is TourCategory => c != null,
      ),
    [categories],
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const match = browseCategories.find((c) => c.hash === hash);
    if (match) setExpandedCategoryId(match.id);
  }, [browseCategories]);

  const normalizedQuery = query.trim().toLowerCase();

  const mapFilteredPackages = useMemo(() => {
    if (!mapFilterSlug) return null;
    return packages.filter((p) => p.destinationSlugs.includes(mapFilterSlug));
  }, [packages, mapFilterSlug]);

  const displayPackages = useMemo(() => {
    const base = mapFilteredPackages ?? packages;
    if (!normalizedQuery) return base;
    return base.filter((pkg) =>
      packageMatchesQuery(pkg, normalizedQuery, destinations),
    );
  }, [mapFilteredPackages, packages, normalizedQuery, destinations]);

  const mapFilterName = destinations.find((d) => d.slug === mapFilterSlug)?.name;
  const resultsKey = mapFilterSlug ?? "all-tours";

  const searchPlaceholder = mapFilterSlug && mapFilterName
    ? `Search tours through ${mapFilterName}…`
    : "Search all tour itineraries…";

  function handleCategoryClick(id: TourCategoryId) {
    setExpandedCategoryId((prev) => (prev === id ? null : id));
    onClearMapFilter?.();
  }

  function handleAllCategories() {
    setExpandedCategoryId(null);
    setQuery("");
    onClearMapFilter?.();
  }

  function handleCloseExpanded() {
    setExpandedCategoryId(null);
  }

  function clearSearchAndMap() {
    setQuery("");
    onClearMapFilter?.();
  }

  return (
    <section id="explore-categories" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            Curated collections
          </p>
          <h2 className="mt-1 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-ink">
            Choose your journey
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55 sm:text-base">
            Premium private tours organised by travel style — open a category
            to explore its story, featured itineraries, and journey details
            right here.
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink/35"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-12 w-full rounded-2xl border border-ink/10 bg-white/90 py-3 pr-11 pl-11 text-sm text-ink shadow-[0_10px_28px_rgb(10_22_32_/_0.06)] outline-none transition placeholder:text-ink/35 focus:border-brand/35 focus:ring-2 focus:ring-brand/15"
            aria-label={searchPlaceholder}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/45 hover:bg-foam hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        role="group"
        aria-label="Tour categories"
      >
        <motion.div layout transition={LAYOUT_TRANSITION}>
          <AllCategoriesCard
            packageCount={packages.length}
            dimmed={expandedCategoryId !== null}
            onSelect={handleAllCategories}
          />
        </motion.div>

        {browseCategories.map((category) => {
          const isExpanded = expandedCategoryId === category.id;
          const isDimmed =
            expandedCategoryId !== null && expandedCategoryId !== category.id;

          return (
            <motion.div
              key={category.id}
              layout
              transition={LAYOUT_TRANSITION}
              className={isExpanded ? "col-span-full" : undefined}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isExpanded ? (
                  <CategoryExpandedExperience
                    key={`expanded-${category.id}`}
                    category={category}
                    featuredPackages={packagesForCategory(category.id, packages)}
                    bookHref={bookHref}
                    onClose={handleCloseExpanded}
                  />
                ) : (
                  <motion.div
                    key={`collapsed-${category.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CategoryCard
                      category={category}
                      packageCount={countPackagesForCategory(
                        category.id,
                        packages,
                      )}
                      dimmed={isDimmed}
                      onSelect={() => handleCategoryClick(category.id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 border-t border-ink/8 pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
              {mapFilterSlug ? "Map selection" : "All itineraries"}
            </p>
            <h3 className="mt-1 font-display text-[clamp(1.35rem,2.5vw,2rem)] font-semibold text-ink">
              {mapFilterName
                ? `Journeys through ${mapFilterName}`
                : "Browse all tour packages"}
            </h3>
            {normalizedQuery ? (
              <p className="mt-1 text-sm text-ink/50">
                {displayPackages.length}{" "}
                {displayPackages.length === 1 ? "match" : "matches"} for
                &ldquo;{query.trim()}&rdquo;
              </p>
            ) : null}
          </div>
          {(mapFilterSlug || normalizedQuery) && (
            <button
              type="button"
              onClick={clearSearchAndMap}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {displayPackages.length > 0 ? (
            <motion.div
              key={resultsKey + normalizedQuery}
              variants={reduceMotion ? undefined : PACKAGE_GRID_VARIANTS}
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? undefined : "show"}
              exit={reduceMotion ? undefined : "exit"}
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {displayPackages.map((pkg) => (
                <motion.div
                  key={pkg.slug}
                  variants={reduceMotion ? undefined : PACKAGE_ITEM_VARIANTS}
                  layout={!reduceMotion}
                >
                  <PackageCard package={pkg} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${resultsKey}-${normalizedQuery}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-[1.75rem] border border-ink/10 bg-gradient-to-br from-white via-white to-brand/[0.04] px-6 py-12 text-center shadow-[0_20px_50px_rgb(10_22_32_/_0.08)] sm:px-10 sm:py-14"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgb(0_98_250_/_0.08),transparent_70%)]"
                aria-hidden
              />
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/15 bg-brand/8 text-brand">
                <Compass className="h-6 w-6" aria-hidden />
              </span>
              <p className="relative mt-5 font-display text-[clamp(1.25rem,2.5vw,1.65rem)] font-semibold text-ink">
                No tours match your search
              </p>
              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">
                Try a different keyword, or reset filters to browse the full
                collection.
              </p>
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink/12 bg-white px-6 text-sm font-semibold text-ink hover:border-brand/25"
                >
                  Clear search
                </button>
                <Link
                  href={bookHref}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-brand/20 bg-brand/8 px-6 text-sm font-semibold text-brand hover:bg-brand/12"
                >
                  Plan a custom tour
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
