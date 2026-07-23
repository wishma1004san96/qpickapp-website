import type { TourCategoryId, TourSortId } from "./types";

export type TourCatalogFilterId =
  | "all"
  | "classic"
  | "luxury"
  | "wildlife"
  | "adventure"
  | "beach"
  | "honeymoon"
  | "wellness"
  | "family"
  | "day-tours";

export type TourCatalogFilter = {
  id: TourCatalogFilterId;
  label: string;
  categoryIds: TourCategoryId[] | null;
};

/** Quick-filter chips above the tour catalogue grid. */
export const TOUR_CATALOG_FILTERS: TourCatalogFilter[] = [
  { id: "all", label: "All", categoryIds: null },
  {
    id: "classic",
    label: "Classic",
    categoryIds: ["classic-sri-lanka", "cultural-heritage", "popular"],
  },
  {
    id: "luxury",
    label: "Luxury",
    categoryIds: ["luxury-escapes", "private-chauffeur"],
  },
  {
    id: "wildlife",
    label: "Wildlife",
    categoryIds: ["wildlife-safari", "bird-watching"],
  },
  { id: "adventure", label: "Adventure", categoryIds: ["adventure"] },
  { id: "beach", label: "Beach", categoryIds: ["beach-holidays"] },
  { id: "honeymoon", label: "Honeymoon", categoryIds: ["honeymoon"] },
  {
    id: "wellness",
    label: "Wellness",
    categoryIds: ["ayurveda-wellness"],
  },
  { id: "family", label: "Family", categoryIds: ["family"] },
  { id: "day-tours", label: "Day Tours", categoryIds: ["day-tours"] },
];

export const TOUR_SORT_OPTIONS: { id: TourSortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "duration", label: "Duration" },
  { id: "popular", label: "Popular" },
];

export const TOUR_BADGE_LABELS = {
  "best-seller": "Best Seller",
  luxury: "Luxury",
  new: "New",
  "family-friendly": "Family Friendly",
  eco: "Eco",
  adventure: "Adventure",
} as const;
