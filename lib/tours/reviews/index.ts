/**
 * Guest reviews — published entries with permission appear in the UI.
 */
import type { TourReview } from "../types";

export const TOUR_REVIEWS: TourReview[] = [
  {
    id: "rev-cultural-1",
    quote:
      "Our Cultural Triangle days felt unhurried — Sigiriya at sunrise, calm temple visits, and a chauffeur who knew every turn inland.",
    author: "Amelia & James",
    location: "London, UK",
    countryCode: "GB",
    rating: 5,
    published: true,
    packageSlugs: ["3-days-cultural-triangle", "7-days-best-of-sri-lanka"],
  },
  {
    id: "rev-hill-1",
    quote:
      "Tea country was the highlight. The SUV was immaculate, and Q Pick adjusted our Ella day when the weather shifted — true concierge care.",
    author: "Priya N.",
    location: "Singapore",
    countryCode: "SG",
    rating: 5,
    published: true,
    packageSlugs: ["5-days-hill-country-escape", "7-days-best-of-sri-lanka"],
  },
  {
    id: "rev-wildlife-1",
    quote:
      "Yala safari morning, then Mirissa by evening — all private, all seamless. Written quote upfront, no surprises on the road.",
    author: "Marcus T.",
    location: "Sydney, Australia",
    countryCode: "AU",
    rating: 5,
    published: true,
    packageSlugs: ["10-days-wildlife-adventure", "14-days-complete-sri-lanka"],
  },
  {
    id: "rev-grand-1",
    quote:
      "Three weeks with one trusted driver changed how we travel. Heritage, coast, and east-season routing handled with quiet confidence.",
    author: "Elena & Marco",
    location: "Milan, Italy",
    countryCode: "IT",
    rating: 5,
    published: true,
    packageSlugs: ["21-days-grand-explorer", "14-days-complete-sri-lanka"],
  },
  {
    id: "rev-family-1",
    quote:
      "Travelling with two children, we needed space and patience. The van, airport meet-and-greet, and 24/7 desk made everything feel secure.",
    author: "The Rahman Family",
    location: "Dubai, UAE",
    countryCode: "AE",
    rating: 5,
    published: true,
  },
];

export const REVIEWS_SECTION = {
  title: "Guest Reviews",
  emptyTitle: "Stories from the road",
  emptyBody:
    "Verified guest reviews will appear after published trips. We do not display invented testimonials, ratings, or awards.",
} as const;
