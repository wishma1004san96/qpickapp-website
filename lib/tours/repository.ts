import { getDestinationImageSrc } from "@/lib/destination-image-catalog";
import {
  buildItineraryRoute,
  type TourItineraryRoute,
} from "./itinerary-route";
import { TOUR_CATEGORIES } from "./categories";
import { TOUR_DESTINATIONS } from "./destinations";
import {
  defaultPackingTips,
  defaultStayIdsForPackage,
  deriveExperienceFeatures,
} from "./experience/defaults";
import { HUB_FAQ_IDS, TOUR_FAQS } from "./faq";
import { TOUR_GALLERY } from "./gallery";
import { TOUR_PACKAGES } from "./packages";
import { getTourPricingConfig } from "./pricing-display";
import { REVIEWS_SECTION, TOUR_REVIEWS } from "./reviews";
import {
  FINAL_CTA,
  HUB_HERO,
  HUB_SEO,
  INTERNAL_LINKS,
  PACKAGE_DETAIL_TRUST_SIGNALS,
  TRUST_SIGNALS,
} from "./seo/hub";
import { TOUR_SUGGESTED_STAYS } from "./stays";
import { TOUR_VEHICLES } from "./vehicles";
import type {
  TourCategory,
  TourCategoryId,
  TourDayChapter,
  TourDestination,
  TourExperienceFeature,
  TourFaq,
  TourGalleryImage,
  TourPackage,
  TourReview,
  TourSeoMeta,
  TourSuggestedStay,
  TourVehicle,
  TourVehicleId,
} from "./types";

export type { TourItineraryRoute };
export {
  buildItineraryRoute,
  findStopForDay,
  findStopForDestinationSlug,
} from "./itinerary-route";
export type { TourRouteStop } from "./itinerary-route";


/** Public accessors — UI/pages import from here only. */

const PACKAGE_ALIASES: Record<string, string> = {
  "10-days-luxury-island-tour": "10-days-wildlife-adventure",
};

function enrichPackage(pkg: TourPackage): TourPackage {
  return {
    ...pkg,
    packingTips: pkg.packingTips?.length ? pkg.packingTips : defaultPackingTips(),
    experienceFeatures: pkg.experienceFeatures?.length
      ? pkg.experienceFeatures
      : deriveExperienceFeatures(pkg),
    suggestedStayIds: pkg.suggestedStayIds?.length
      ? pkg.suggestedStayIds
      : defaultStayIdsForPackage(pkg),
    videoPlaceholder: pkg.videoPlaceholder ?? true,
  };
}

export function getAllPackages(): TourPackage[] {
  return TOUR_PACKAGES.filter((p) => p.published).map(enrichPackage);
}

export function getPackageBySlug(slug: string): TourPackage | null {
  const resolved = PACKAGE_ALIASES[slug] ?? slug;
  const pkg = getAllPackages().find((p) => p.slug === resolved) ?? null;
  return pkg;
}

export function getPackagesByCategory(categoryId: TourCategoryId): TourPackage[] {
  if (categoryId === "popular") return getPopularPackages();
  return getAllPackages().filter((p) => p.categoryIds.includes(categoryId));
}

export function getPackagesForDestination(destinationSlug: string): TourPackage[] {
  return getAllPackages().filter((p) =>
    p.destinationSlugs.includes(destinationSlug),
  );
}

export function getPopularPackages(): TourPackage[] {
  return getAllPackages().filter((p) => p.popular);
}

export function getAllDestinations(): TourDestination[] {
  return TOUR_DESTINATIONS;
}

export function getDestinationBySlug(slug: string): TourDestination | null {
  return TOUR_DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

export function getDestinationsForPackage(slug: string): TourDestination[] {
  const pkg = getPackageBySlug(slug);
  if (!pkg) return [];
  return pkg.destinationSlugs
    .map((s) => getDestinationBySlug(s))
    .filter((d): d is TourDestination => d != null);
}

/** Chauffeur route in true itinerary order (Airport → days → Airport). */
export function getPackageItineraryRoute(slug: string): TourItineraryRoute | null {
  const pkg = getPackageBySlug(slug);
  if (!pkg) return null;
  return buildItineraryRoute(pkg, TOUR_DESTINATIONS, { bookendAirport: true });
}

export function getPackageDayChapters(slug: string): TourDayChapter[] {
  const pkg = getPackageBySlug(slug);
  if (!pkg) return [];

  return pkg.itinerary.map((day, index) => {
    const destSlug = day.destinationSlug;
    const dest = destSlug ? getDestinationBySlug(destSlug) : null;
    const gallery = dest
      ? null
      : getGalleryImage(
          pkg.galleryIds[index % pkg.galleryIds.length] ?? pkg.heroGalleryId,
        );

    return {
      ...day,
      imageSrc:
        dest?.imageSrc ??
        gallery?.src ??
        getDestinationImageSrc("sigiriya"),
      imageAlt:
        dest?.imageAlt ?? gallery?.alt ?? `Day ${day.day} on ${pkg.title}`,
      destinationName: dest?.name ?? null,
      travelTimeResolved:
        day.travelTimeLabel ??
        (index === 0
          ? "CMB meet & private transfer"
          : dest?.driveFromColomboLabel
            ? `Private transfer · ${dest.driveFromColomboLabel.replace("from Colombo", "typical island pace")}`
            : "Private chauffeur transfer"),
    };
  });
}

export function getPackageExperienceFeatures(
  slug: string,
): TourExperienceFeature[] {
  return getPackageBySlug(slug)?.experienceFeatures ?? [];
}

export function getSuggestedStays(ids?: string[]): TourSuggestedStay[] {
  if (!ids?.length) return TOUR_SUGGESTED_STAYS;
  const map = new Map(TOUR_SUGGESTED_STAYS.map((s) => [s.id, s]));
  return ids.map((id) => map.get(id)).filter((s): s is TourSuggestedStay => s != null);
}

export function getSuggestedStaysForPackage(slug: string): TourSuggestedStay[] {
  const pkg = getPackageBySlug(slug);
  return getSuggestedStays(pkg?.suggestedStayIds);
}

export function getAllVehicles(): TourVehicle[] {
  return TOUR_VEHICLES;
}

export function getVehicleById(id: string): TourVehicle | null {
  return TOUR_VEHICLES.find((v) => v.id === id) ?? null;
}

export function getHubFaqs(): TourFaq[] {
  return getFaqsByIds([...HUB_FAQ_IDS]);
}

export function getFaqsByIds(ids: string[]): TourFaq[] {
  const map = new Map(TOUR_FAQS.map((f) => [f.id, f]));
  return ids.map((id) => map.get(id)).filter((f): f is TourFaq => f != null);
}

export function getGalleryImage(id: string): TourGalleryImage | null {
  return TOUR_GALLERY.find((g) => g.id === id) ?? null;
}

export function getPackageGallery(slug: string): TourGalleryImage[] {
  const pkg = getPackageBySlug(slug);
  if (!pkg) return [];
  return pkg.galleryIds
    .map((id) => getGalleryImage(id))
    .filter((g): g is TourGalleryImage => g != null);
}

/** Package gallery plus destination & story imagery — deduped by src. */
export function getExpandedPackageGallery(slug: string): TourGalleryImage[] {
  const pkg = getPackageBySlug(slug);
  if (!pkg) return [];

  const seen = new Set<string>();
  const images: TourGalleryImage[] = [];

  function push(image: TourGalleryImage | null) {
    if (!image || seen.has(image.src)) return;
    seen.add(image.src);
    images.push(image);
  }

  push(getGalleryImage(pkg.heroGalleryId));
  for (const id of pkg.galleryIds) push(getGalleryImage(id));

  for (const dest of getDestinationsForPackage(slug)) {
    push({
      id: `dest-${dest.slug}`,
      src: dest.imageSrc,
      alt: dest.imageAlt,
      tags: [dest.slug, "destination"],
    });
  }

  for (const id of ["chauffeur-story", "discovery-story", "compose-story"]) {
    push(getGalleryImage(id));
  }

  return images;
}

export function getReviewsForPackage(slug: string): TourReview[] {
  const all = getReviews();
  const matched = all.filter(
    (r) => !r.packageSlugs?.length || r.packageSlugs.includes(slug),
  );
  return matched.length > 0 ? matched : all.slice(0, 3);
}

export function getPackageDetailTrustSignals() {
  return PACKAGE_DETAIL_TRUST_SIGNALS;
}

export function getCategories(): TourCategory[] {
  return TOUR_CATEGORIES;
}

export function getCategoryById(id: TourCategoryId): TourCategory | null {
  return TOUR_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getHubSeo(): TourSeoMeta {
  return HUB_SEO;
}

export function getCategorySeo(categoryId: TourCategoryId): TourSeoMeta {
  const category = getCategoryById(categoryId);
  if (!category) return HUB_SEO;
  return {
    title: `${category.title} Tours Sri Lanka | Q Pick`,
    description: category.intro,
    canonicalPath: `/tours#${category.hash}`,
    ogImage: category.imageSrc,
  };
}

export function getReviews(): TourReview[] {
  return TOUR_REVIEWS.filter((r) => r.published);
}

export function getReviewsSectionMeta() {
  return REVIEWS_SECTION;
}

export function getTrustSignals() {
  return TRUST_SIGNALS;
}

export function getHubHero() {
  return HUB_HERO;
}

export function getFinalCta() {
  return FINAL_CTA;
}

export function getInternalLinks() {
  return INTERNAL_LINKS;
}

export function getPricingConfig() {
  return getTourPricingConfig();
}

export { getTourPricingConfig };

export function getBookHref(packageSlug?: string): string {
  if (packageSlug) {
    return `/tour-booking?package=${encodeURIComponent(packageSlug)}`;
  }
  return "/tour-booking";
}

export function getPackageHref(slug: string): string {
  return `/tours/${slug}`;
}

export function getGoogleMapsDirectionsUrl(destinations: TourDestination[]): string {
  if (destinations.length === 0) return "https://maps.google.com/?q=Sri+Lanka";
  const path = destinations.map((d) => `${d.lat},${d.lng}`).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}

export type { TourVehicleId };
