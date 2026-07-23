/** Tour domain types — UI must import data only via repository. */

import type { QPickVehicleIconId } from "@/components/icons/vehicles/types";

export type TourCategoryId =
  | "popular"
  | "classic-sri-lanka"
  | "cultural-heritage"
  | "wildlife-safari"
  | "beach-holidays"
  | "hill-country-tea"
  | "tea-country"
  | "adventure"
  | "train-journeys"
  | "honeymoon"
  | "luxury-escapes"
  | "family"
  | "ayurveda-wellness"
  | "food"
  | "festival"
  | "photography-tours"
  | "bird-watching"
  | "pilgrimage"
  | "cruise-excursions"
  | "day-tours"
  | "private-chauffeur"
  | "airport-transfers"
  | "custom-private";

export type TourBadgeId =
  | "best-seller"
  | "luxury"
  | "new"
  | "family-friendly"
  | "eco"
  | "adventure";

export type TourSortId = "featured" | "newest" | "duration" | "popular";

export type TourVehicleId =
  | "sedan"
  | "suv"
  | "van"
  | "luxuryVan"
  | "miniCoach";

export type TourSeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage: string;
  ogTitle?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  keywords?: string[];
};

export type TourItineraryDay = {
  day: number;
  title: string;
  description: string;
  /** Destination for this travel day — defines map route order */
  destinationSlug: string;
  travelTimeLabel?: string;
  activities?: string[];
};

export type TourExperienceFeature = {
  id: string;
  title: string;
  description: string;
};

export type TourCatalogSection = "premium-northern";

export type TourPackage = {
  slug: string;
  title: string;
  durationDays: number;
  /** Overrides the default "{durationDays} days" badge on catalogue cards */
  durationLabel?: string;
  destinationSlugs: string[];
  categoryIds: TourCategoryId[];
  vehicleId: TourVehicleId;
  /** null = show quote label from pricing config */
  startingPriceLkr: number | null;
  /** Shown on premium catalogue cards as "From USD …" */
  startingPriceUsd?: number;
  highlights: string[];
  travelTips: string[];
  packingTips?: string[];
  experienceFeatures?: TourExperienceFeature[];
  suggestedStayIds?: string[];
  bestTimeToVisit: string;
  heroGalleryId: string;
  galleryIds: string[];
  /** Placeholder for future video — never invent footage */
  videoPlaceholder?: boolean;
  seo: TourSeoMeta & { intro: string };
  itinerary: TourItineraryDay[];
  included: string[];
  excluded: string[];
  faqIds: string[];
  relatedPackageSlugs: string[];
  popular: boolean;
  published: boolean;
  /** Marketing badge on catalogue cards */
  badge?: TourBadgeId;
  /** Short audience line for catalogue and detail */
  idealFor?: string;
  /** Vehicle classes suggested on written quote */
  suggestedVehicleIds?: TourVehicleId[];
  /** ISO date for newest sort */
  publishedAt?: string;
  /** Lower values surface first in featured sort */
  featuredRank?: number;
  /** Dedicated catalogue section — excluded from standard day-tour grids */
  catalogSection?: TourCatalogSection;
};

export type TourDestination = {
  slug: string;
  name: string;
  region: string;
  province: string;
  description: string;
  highlights: string[];
  thingsToDo: string[];
  nearbyAttractions: string[];
  keywords: string[];
  imageSrc: string;
  imageAlt: string;
  lat: number;
  lng: number;
  /** Approximate private drive from Colombo (hours) */
  driveFromColomboHours: number;
  driveFromColomboLabel: string;
  bestSeason: string;
  weatherLabel: string;
  bestPhotoTime: string;
  unesco: boolean;
  relatedPackageSlugs: string[];
};

export type TourVehicle = {
  id: TourVehicleId;
  name: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
  /** Official Q Pick fleet icon id — same assets as Choose Your Ride. */
  fleetIconId?: QPickVehicleIconId;
  passengers: number;
  luggage: number;
  ac: boolean;
  wifi: boolean;
  chargingPorts: boolean;
  recommendedTourTypes: string[];
  dayRateHintLkr: number | null;
  apiValue: string;
};

export type TourSuggestedStay = {
  id: string;
  name: string;
  area: string;
  style: string;
  imageSrc: string;
  imageAlt: string;
  /** Always true until real partner inventory exists */
  placeholder: true;
  note: string;
};

export type TourFaq = {
  id: string;
  question: string;
  answer: string;
};

export type TourGalleryImage = {
  id: string;
  src: string;
  alt: string;
  tags: string[];
};

export type TourCategory = {
  id: TourCategoryId;
  hash: string;
  title: string;
  intro: string;
  keywords: string[];
  imageSrc: string;
  imageAlt: string;
};

export type TourReview = {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  published: boolean;
  /** ISO 3166-1 alpha-2 for flag display */
  countryCode?: string;
  /** When set, review appears on matching package detail pages only. */
  packageSlugs?: string[];
};

export type TrustSignal = {
  id: string;
  title: string;
  description: string;
};

export type TourPreferenceId =
  | "adventure"
  | "nature"
  | "wildlife"
  | "beach"
  | "culture"
  | "luxury"
  | "family"
  | "honeymoon"
  | "photography"
  | "wellness";

export type TourAccommodationId =
  | "3-star"
  | "4-star"
  | "5-star"
  | "luxury-villas"
  | "already-booked"
  | "none";

export type TourPricingConfig = {
  quoteLabel: string;
  quoteHint: string;
};

/** Enriched day chapter for magazine itinerary UI */
export type TourDayChapter = TourItineraryDay & {
  imageSrc: string;
  imageAlt: string;
  destinationName: string | null;
  travelTimeResolved: string;
};
