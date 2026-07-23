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
import { PremiumTourCard } from "@/components/tours/premium-tour-card";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  TOUR_CATALOG_FILTERS,
  TOUR_SORT_OPTIONS,
  type TourCatalogFilterId,
} from "@/lib/tours/catalog-filters";
import {
  filterPackagesByCatalogFilter,
  sortTourPackages,
} from "@/lib/tours/repository";
import type {
  TourCategory,
  TourCategoryId,
  TourPackage,
  TourSortId,
} from "@/lib/tours/types";

const BROWSE_ORDER: TourCategoryId[] = [
  "classic-sri-lanka",
  "cultural-heritage",
  "wildlife-safari",
  "beach-holidays",
  "hill-country-tea",
  "tea-country",
  "adventure",
  "train-journeys",
  "honeymoon",
  "luxury-escapes",
  "family",
  "ayurveda-wellness",
  "food",
  "photography-tours",
  "bird-watching",
  "pilgrimage",
  "festival",
  "cruise-excursions",
  "day-tours",
  "private-chauffeur",
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
  return packagesForCategory(categoryId, packages).length;
}

function packagesForCategory(
  categoryId: TourCategoryId,
  packages: TourPackage[],
): TourPackage[] {
  if (categoryId === "custom-private") return packages;
  if (categoryId === "airport-transfers") return [];
  if (categoryId === "day-tours") {
    return packages.filter(
      (p) => p.durationDays === 1 && p.catalogSection !== "premium-northern",
    );
  }
  return packages.filter(
    (p) => p.categoryIds.includes(categoryId) && p.durationDays > 1,
  );
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
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TourCatalogFilterId>("all");
  const [sort, setSort] = useState<TourSortId>("featured");
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

  const multiDayPackages = useMemo(
    () => packages.filter((pkg) => pkg.durationDays > 1),
    [packages],
  );

  const dayTourPackages = useMemo(
    () =>
      packages.filter(
        (pkg) => pkg.durationDays === 1 && pkg.catalogSection !== "premium-northern",
      ),
    [packages],
  );

  const premiumNorthernPackages = useMemo(
    () => packages.filter((pkg) => pkg.catalogSection === "premium-northern"),
    [packages],
  );

  const mapFilteredPackages = useMemo(() => {
    if (!mapFilterSlug) return null;
    return multiDayPackages.filter((p) =>
      p.destinationSlugs.includes(mapFilterSlug),
    );
  }, [multiDayPackages, mapFilterSlug]);

  const mapFilteredPremiumNorthern = useMemo(() => {
    if (!mapFilterSlug) return null;
    return premiumNorthernPackages.filter((p) =>
      p.destinationSlugs.includes(mapFilterSlug),
    );
  }, [premiumNorthernPackages, mapFilterSlug]);

  const mapFilteredDayTours = useMemo(() => {
    if (!mapFilterSlug) return null;
    return dayTourPackages.filter((p) =>
      p.destinationSlugs.includes(mapFilterSlug),
    );
  }, [dayTourPackages, mapFilterSlug]);

  function applyCatalogFilters(
    base: TourPackage[],
    forDaySection: boolean,
  ) {
    if (activeFilter === "all") return base;
    if (activeFilter === "day-tours") {
      return forDaySection
        ? filterPackagesByCatalogFilter(base, ["day-tours"])
        : [];
    }
    const filterDef = TOUR_CATALOG_FILTERS.find((f) => f.id === activeFilter);
    return filterPackagesByCatalogFilter(base, filterDef?.categoryIds ?? null);
  }

  const displayPackages = useMemo(() => {
    const base = mapFilteredPackages ?? multiDayPackages;
    const filtered = applyCatalogFilters(base, false);
    const searched = !normalizedQuery
      ? filtered
      : filtered.filter((pkg) =>
          packageMatchesQuery(pkg, normalizedQuery, destinations),
        );
    return sortTourPackages(searched, sort);
  }, [
    mapFilteredPackages,
    multiDayPackages,
    normalizedQuery,
    destinations,
    activeFilter,
    sort,
  ]);

  const displayDayTours = useMemo(() => {
    const base = mapFilteredDayTours ?? dayTourPackages;
    const filtered = applyCatalogFilters(base, true);
    const searched = !normalizedQuery
      ? filtered
      : filtered.filter((pkg) =>
          packageMatchesQuery(pkg, normalizedQuery, destinations),
        );
    return sortTourPackages(searched, sort);
  }, [
    mapFilteredDayTours,
    dayTourPackages,
    normalizedQuery,
    destinations,
    activeFilter,
    sort,
  ]);

  const displayPremiumNorthern = useMemo(() => {
    const base = mapFilteredPremiumNorthern ?? premiumNorthernPackages;
    let filtered = base;
    if (activeFilter === "day-tours") {
      filtered = [];
    } else if (activeFilter !== "all") {
      const filterDef = TOUR_CATALOG_FILTERS.find((f) => f.id === activeFilter);
      filtered = filterPackagesByCatalogFilter(
        base,
        filterDef?.categoryIds ?? null,
      );
    }
    const searched = !normalizedQuery
      ? filtered
      : filtered.filter((pkg) =>
          packageMatchesQuery(pkg, normalizedQuery, destinations),
        );
    return sortTourPackages(searched, sort);
  }, [
    mapFilteredPremiumNorthern,
    premiumNorthernPackages,
    normalizedQuery,
    destinations,
    activeFilter,
    sort,
  ]);

  const mapFilterName = destinations.find((d) => d.slug === mapFilterSlug)?.name;
  const resultsKey = `${mapFilterSlug ?? "all-tours"}-${activeFilter}-${sort}`;

  const searchPlaceholder = t("toursHub.explorer.searchPlaceholder");

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
    setActiveFilter("all");
    onClearMapFilter?.();
  }

  return (
    <section id="explore-categories" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
            {t("toursHub.explorer.eyebrow")}
          </p>
          <h2 className="mt-1 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-ink">
            {t("toursHub.explorer.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55 sm:text-base">
            {t("toursHub.explorer.subtitle")}
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
              aria-label={t("toursHub.explorer.clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        role="group"
        aria-label={t("toursHub.explorer.categoriesAria")}
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
              {mapFilterSlug
                ? t("toursHub.explorer.mapSelection")
                : t("toursHub.explorer.multiDay")}
            </p>
            <h3 className="mt-1 font-display text-[clamp(1.35rem,2.5vw,2rem)] font-semibold text-ink">
              {mapFilterName
                ? t("toursHub.explorer.mapJourneysThrough", { name: mapFilterName })
                : t("toursHub.explorer.premiumNorthern")}
            </h3>
            <p className="mt-1 text-sm text-ink/50">
              {displayPackages.length}{" "}
              {displayPackages.length === 1
                ? t("toursHub.explorer.itineraryOne")
                : t("toursHub.explorer.itineraryMany")}
              {normalizedQuery ? (
                <>
                  {" "}
                  {t("toursHub.explorer.matchingQuery", {
                    query: query.trim(),
                  })}
                </>
              ) : null}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <label className="flex w-full flex-col gap-1.5 sm:w-48">
              <span className="font-mono text-[0.625rem] tracking-[0.14em] text-ink/45 uppercase">
                {t("toursHub.explorer.sortBy")}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as TourSortId)}
                className="h-11 w-full rounded-xl border border-ink/10 bg-white/90 px-3 text-sm text-ink outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/15"
                aria-label={t("toursHub.explorer.sortAria")}
              >
                {TOUR_SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {t(`toursHub.sort.${option.id}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div
          className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("toursHub.explorer.filterAria")}
        >
          {TOUR_CATALOG_FILTERS.map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-brand bg-brand text-paper shadow-[0_8px_20px_rgb(0_98_250_/_0.25)]"
                    : "border-ink/10 bg-white/80 text-ink/70 hover:border-brand/25 hover:text-ink"
                }`}
              >
                {t(`toursHub.filters.${filter.id}`)}
              </button>
            );
          })}
        </div>

        {(mapFilterSlug || normalizedQuery || activeFilter !== "all") && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={clearSearchAndMap}
              className="text-sm font-semibold text-brand hover:underline"
            >
              {t("toursHub.explorer.resetFilters")}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {displayPackages.length > 0 ? (
            <motion.div
              key={resultsKey + normalizedQuery}
              variants={reduceMotion ? undefined : PACKAGE_GRID_VARIANTS}
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? undefined : "show"}
              exit={reduceMotion ? undefined : "exit"}
              className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {displayPackages.map((pkg) => (
                <motion.div
                  key={pkg.slug}
                  className="h-full"
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
                {t("toursHub.explorer.noToursTitle")}
              </p>
              <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">
                {t("toursHub.explorer.noToursBody")}
              </p>
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink/12 bg-white px-6 text-sm font-semibold text-ink hover:border-brand/25"
                >
                  {t("toursHub.explorer.clearSearch")}
                </button>
                <Link
                  href={bookHref}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-brand/20 bg-brand/8 px-6 text-sm font-semibold text-brand hover:bg-brand/12"
                >
                  {t("toursHub.explorer.planCustomTour")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        id="premium-northern-tours"
        className="mt-14 scroll-mt-28 border-t border-ink/8 pt-10"
      >
        {displayPremiumNorthern.length > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
                  {t("toursHub.explorer.northernPeninsula")}
                </p>
                <h3 className="mt-1 font-display text-[clamp(1.35rem,2.5vw,2rem)] font-semibold text-ink">
                  {t("toursHub.explorer.premiumJaffna")}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-ink/50">
                  {t("toursHub.explorer.premiumJaffnaSub", {
                    count: displayPremiumNorthern.length,
                    experiences:
                      displayPremiumNorthern.length === 1
                        ? t("toursHub.explorer.experienceOne")
                        : t("toursHub.explorer.experienceMany"),
                  })}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`premium-${resultsKey}-${normalizedQuery}`}
                variants={reduceMotion ? undefined : PACKAGE_GRID_VARIANTS}
                initial={reduceMotion ? false : "hidden"}
                animate={reduceMotion ? undefined : "show"}
                exit={reduceMotion ? undefined : "exit"}
                className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {displayPremiumNorthern.map((pkg) => (
                  <motion.div
                    key={pkg.slug}
                    className="h-full"
                    variants={reduceMotion ? undefined : PACKAGE_ITEM_VARIANTS}
                    layout={!reduceMotion}
                  >
                    <PremiumTourCard package={pkg} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        ) : null}
      </div>

      <div
        id="day-tours"
        className="mt-14 scroll-mt-28 border-t border-ink/8 pt-10"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
              Day experiences
            </p>
            <h3 className="mt-1 font-display text-[clamp(1.35rem,2.5vw,2rem)] font-semibold text-ink">
              Day tours
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-ink/50">
              {displayDayTours.length}{" "}
              {displayDayTours.length === 1 ? "experience" : "experiences"} —
              private chauffeur days from Colombo, the coast, and the Cultural
              Triangle.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {displayDayTours.length > 0 ? (
            <motion.div
              key={`day-${resultsKey}-${normalizedQuery}`}
              variants={reduceMotion ? undefined : PACKAGE_GRID_VARIANTS}
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? undefined : "show"}
              exit={reduceMotion ? undefined : "exit"}
              className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {displayDayTours.map((pkg) => (
                <motion.div
                  key={pkg.slug}
                  className="h-full"
                  variants={reduceMotion ? undefined : PACKAGE_ITEM_VARIANTS}
                  layout={!reduceMotion}
                >
                  <PackageCard package={pkg} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key={`day-empty-${resultsKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-ink/50"
            >
              No day tours match your current filters.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
