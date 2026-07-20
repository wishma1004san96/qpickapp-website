/**
 * Guest reviews — only published entries with permission appear in the UI.
 * Keep empty until real testimonials are supplied.
 */
import type { TourReview } from "../types";

export const TOUR_REVIEWS: TourReview[] = [];

export const REVIEWS_SECTION = {
  title: "Guest Reviews",
  emptyTitle: "Stories from the road",
  emptyBody:
    "Verified guest reviews will appear after published trips. We do not display invented testimonials, ratings, or awards.",
} as const;
