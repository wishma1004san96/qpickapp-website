import type {
  TourAccommodationId,
  TourCategoryId,
  TourPreferenceId,
} from "./types";

export const TOUR_CATEGORY_IDS: TourCategoryId[] = [
  "popular",
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

export const TOUR_PREFERENCES: { id: TourPreferenceId; label: string }[] = [
  { id: "adventure", label: "Adventure" },
  { id: "luxury", label: "Luxury" },
  { id: "nature", label: "Nature" },
  { id: "beach", label: "Beach" },
  { id: "culture", label: "Culture" },
  { id: "photography", label: "Photography" },
  { id: "wildlife", label: "Wildlife" },
  { id: "family", label: "Family" },
  { id: "honeymoon", label: "Honeymoon" },
  { id: "wellness", label: "Wellness" },
];

export const TOUR_ACCOMMODATIONS: { id: TourAccommodationId; label: string }[] =
  [
    { id: "already-booked", label: "Already Booked" },
    { id: "3-star", label: "3 Star" },
    { id: "4-star", label: "4 Star" },
    { id: "5-star", label: "5 Star" },
    { id: "luxury-villas", label: "Luxury Villa" },
    { id: "none", label: "No Accommodation" },
  ];

export const TOUR_BOOKING_PATH = "/tour-booking";
export const TOURS_HUB_PATH = "/tours";
