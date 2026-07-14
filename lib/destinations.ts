export type DestinationSlug = "colombo" | "galle" | "ella" | "sigiriya";

/** Slug + image only — copy lives in messages.destinations.{slug}. */
export type Destination = {
  slug: DestinationSlug;
  image: string;
};

export const destinations: Destination[] = [
  {
    slug: "colombo",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85",
  },
  {
    slug: "galle",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1800&q=85",
  },
  {
    slug: "ella",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85",
  },
  {
    slug: "sigiriya",
    image:
      "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=1800&q=85",
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function isDestinationSlug(slug: string): slug is DestinationSlug {
  return destinations.some((d) => d.slug === slug);
}
