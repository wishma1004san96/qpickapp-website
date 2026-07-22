import { getDestinationImageSrc } from "@/lib/destination-image-catalog";

export type DestinationSlug = "colombo" | "galle" | "ella" | "sigiriya";

/** Slug + image only — copy lives in messages.destinations.{slug}. */
export type Destination = {
  slug: DestinationSlug;
  image: string;
};

export const destinations: Destination[] = [
  {
    slug: "colombo",
    image: getDestinationImageSrc("colombo"),
  },
  {
    slug: "galle",
    image: getDestinationImageSrc("galle"),
  },
  {
    slug: "ella",
    image: getDestinationImageSrc("ella"),
  },
  {
    slug: "sigiriya",
    image: getDestinationImageSrc("sigiriya"),
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function isDestinationSlug(slug: string): slug is DestinationSlug {
  return destinations.some((d) => d.slug === slug);
}
