/** Tour domain types — UI must import data only via repository. */

export type TourCategoryId =
  | "popular"
  | "cultural"
  | "beach"
  | "wildlife"
  | "luxury"
  | "adventure"
  | "honeymoon"
  | "family"
  | "photography"
  | "nature"
  | "hill-country";

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

export type TourPackage = {
  slug: string;
  title: string;
  durationDays: number;
  destinationSlugs: string[];
  categoryIds: TourCategoryId[];
  vehicleId: TourVehicleId;
  /** null = show quote label from pricing config */
  startingPriceLkr: number | null;
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
};

export type TourReview = {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  published: boolean;
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
