import { siteConfig } from "@/lib/site";
import type { TourFaq, TourPackage } from "./types";

export type BreadcrumbItem = { name: string; path: string };

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function buildFaqPageJsonLd(faqs: TourFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildTouristTripJsonLd(pkg: TourPackage) {
  const base = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.seo.description,
    url: `${siteConfig.url}/tours/${pkg.slug}`,
    touristType: "Leisure travellers",
    itinerary: pkg.itinerary.map((day) => ({
      "@type": "TouristAttraction",
      name: `Day ${day.day}: ${day.title}`,
      description: day.description,
    })),
    provider: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/tour-booking?package=${pkg.slug}`,
      availability: "https://schema.org/InStock",
      description: "Request a personalised private chauffeur quote",
      ...(pkg.startingPriceLkr != null
        ? { priceCurrency: "LKR", price: pkg.startingPriceLkr }
        : {}),
    },
  };
  return base;
}

export function buildPackageListJsonLd(packages: TourPackage[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: packages.map((pkg, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: pkg.title,
      url: `${siteConfig.url}/tours/${pkg.slug}`,
    })),
  };
}
