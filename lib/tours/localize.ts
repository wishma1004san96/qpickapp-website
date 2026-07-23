import type { Messages } from "@/lib/i18n/get-messages";
import { catalogString } from "@/lib/i18n/catalog-string";
import type {
  TourCategory,
  TourDestination,
  TourFaq,
  TourPackage,
  TourVehicle,
  TrustSignal,
} from "./types";

export function localizePackage(
  messages: Messages,
  pkg: TourPackage,
): TourPackage {
  const base = `packages.${pkg.slug}`;
  const localizedHighlights = pkg.highlights.map((h, i) =>
    catalogString(messages, `${base}.highlights.${i}`, h),
  );
  const localizedItinerary = pkg.itinerary.map((day, i) => ({
    ...day,
    title: catalogString(
      messages,
      `${base}.itinerary.${i}.title`,
      day.title,
    ),
    description: catalogString(
      messages,
      `${base}.itinerary.${i}.description`,
      day.description,
    ),
  }));
  const localizedTravelTips = (pkg.travelTips ?? []).map((tip, i) =>
    catalogString(messages, `${base}.travelTips.${i}`, tip),
  );

  return {
    ...pkg,
    title: catalogString(messages, `${base}.title`, pkg.title),
    idealFor: pkg.idealFor
      ? catalogString(messages, `${base}.idealFor`, pkg.idealFor)
      : pkg.idealFor,
    highlights: localizedHighlights,
    travelTips: localizedTravelTips.length ? localizedTravelTips : pkg.travelTips,
    bestTimeToVisit: pkg.bestTimeToVisit
      ? catalogString(messages, `${base}.bestTimeToVisit`, pkg.bestTimeToVisit)
      : pkg.bestTimeToVisit,
    itinerary: localizedItinerary,
    seo: {
      ...pkg.seo,
      title: catalogString(messages, `${base}.seo.title`, pkg.seo.title),
      description: catalogString(
        messages,
        `${base}.seo.description`,
        pkg.seo.description,
      ),
      intro: catalogString(messages, `${base}.intro`, pkg.seo.intro),
      ogTitle: pkg.seo.ogTitle
        ? catalogString(messages, `${base}.seo.ogTitle`, pkg.seo.ogTitle)
        : pkg.seo.ogTitle,
      twitterTitle: pkg.seo.twitterTitle
        ? catalogString(
            messages,
            `${base}.seo.twitterTitle`,
            pkg.seo.twitterTitle,
          )
        : pkg.seo.twitterTitle,
      twitterDescription: pkg.seo.twitterDescription
        ? catalogString(
            messages,
            `${base}.seo.twitterDescription`,
            pkg.seo.twitterDescription,
          )
        : pkg.seo.twitterDescription,
    },
  };
}

export function localizeCategory(
  messages: Messages,
  category: TourCategory,
): TourCategory {
  const base = `categories.${category.id}`;
  return {
    ...category,
    title: catalogString(messages, `${base}.title`, category.title),
    intro: catalogString(messages, `${base}.intro`, category.intro),
  };
}

export function localizeDestination(
  messages: Messages,
  destination: TourDestination,
): TourDestination {
  const base = `destinations.${destination.slug}`;
  return {
    ...destination,
    name: catalogString(messages, `${base}.name`, destination.name),
    region: catalogString(messages, `${base}.region`, destination.region),
    description: catalogString(
      messages,
      `${base}.description`,
      destination.description,
    ),
    highlights: destination.highlights.map((h, i) =>
      catalogString(messages, `${base}.highlights.${i}`, h),
    ),
  };
}

export function localizeVehicle(
  messages: Messages,
  vehicle: TourVehicle,
): TourVehicle {
  const base = `vehicles.${vehicle.id}`;
  return {
    ...vehicle,
    name: catalogString(messages, `${base}.name`, vehicle.name),
    tagline: catalogString(messages, `${base}.tagline`, vehicle.tagline),
  };
}

export function localizeFaq(messages: Messages, faq: TourFaq): TourFaq {
  const base = `faqs.${faq.id}`;
  return {
    ...faq,
    question: catalogString(messages, `${base}.question`, faq.question),
    answer: catalogString(messages, `${base}.answer`, faq.answer),
  };
}

export function localizeTrust(
  messages: Messages,
  signal: TrustSignal,
): TrustSignal {
  const base = `toursHub.trust.${signal.id}`;
  const title =
    getNestedString(messages, `${base}.title`) ?? signal.title;
  const description =
    getNestedString(messages, `${base}.description`) ?? signal.description;
  return { ...signal, title, description };
}

function getNestedString(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}
