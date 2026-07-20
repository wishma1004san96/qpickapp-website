import type { TourSeoMeta, TrustSignal } from "../types";

export const HUB_SEO: TourSeoMeta = {
  title: "Private Sri Lanka Tours with Chauffeur | Q Pick",
  description:
    "Explore Sri Lanka with Q Pick — private chauffeurs, premium vehicles, and tailor-made journeys across cultural sites, hill country, beaches, and wildlife.",
  canonicalPath: "/tours",
  ogImage: "/images/destinations/sigiriya.webp",
  ogTitle: "Explore Sri Lanka with Q Pick Private Tours",
  twitterTitle: "Private Sri Lanka Tours | Q Pick",
  twitterDescription:
    "Tailor-made island journeys with private chauffeurs and premium vehicles.",
};

export const TRUST_SIGNALS: TrustSignal[] = [
  {
    id: "chauffeurs",
    title: "Private Chauffeurs",
    description:
      "Licensed drivers who know temple etiquette, highland roads, and calm airport arrivals.",
  },
  {
    id: "airport",
    title: "Airport Pickup",
    description:
      "Bandaranaike International (CMB) meet-and-greet timed to your flight.",
  },
  {
    id: "support",
    title: "24/7 Support",
    description:
      "A real Q Pick desk behind every itinerary before and during travel.",
  },
  {
    id: "vehicles",
    title: "Luxury Vehicles",
    description:
      "Sedans, SUVs, vans, and coaches — private cabin, air-conditioned, luggage-ready.",
  },
  {
    id: "pricing",
    title: "Transparent Pricing",
    description:
      "Written quotes after review — no invented website prices or curb-side surprises.",
  },
  {
    id: "personal",
    title: "Personalized Tours",
    description:
      "Every package is editable: destinations, days, pace, and vehicle class.",
  },
];

export const HUB_HERO = {
  eyebrow: "Q Pick Private Tours",
  headline: "Explore Sri Lanka with Q Pick",
  subtitle:
    "Discover unforgettable journeys with private chauffeurs, premium vehicles and tailor-made experiences.",
  primaryCta: { label: "Explore Packages", href: "/tours#packages" },
  secondaryCta: { label: "Plan My Tour", href: "/tour-booking" },
  imageId: "sigiriya-hero",
} as const;

export const FINAL_CTA = {
  headline: "Your Sri Lanka Journey Starts Here",
  body: "Share your dates and destinations — we shape a private chauffeur itinerary and confirm a written quote.",
  ctaLabel: "Plan My Journey",
  secondaryLabel: "Speak With A Travel Expert",
  secondaryHref: "https://wa.me/94783619000",
  href: "/tour-booking",
  imageId: "ella-hero",
} as const;

export const INTERNAL_LINKS = [
  {
    title: "Airport Transfer",
    description: "Private CMB pickup with Meet & Greet.",
    href: "/airport-transfer",
  },
  {
    title: "City & Island Rides",
    description: "Chauffeur rides for evenings and short hops.",
    href: "/ride",
  },
  {
    title: "Custom Tour Planner",
    description: "Build a multi-day itinerary online.",
    href: "/tour-booking",
  },
] as const;
