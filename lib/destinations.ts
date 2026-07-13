export type Destination = {
  slug: string;
  name: string;
  region: string;
  summary: string;
  image: string;
  imageAlt: string;
};

export const destinations: Destination[] = [
  {
    slug: "colombo",
    name: "Colombo",
    region: "Western Province",
    summary:
      "Harbour lights, Galle Face breeze, and the pulse of the capital — moved with quiet precision.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Colombo coastal waterfront at dusk",
  },
  {
    slug: "galle",
    name: "Galle",
    region: "Southern Province",
    summary:
      "Fort walls, ocean wind, and the southern coast — airport to ramparts without uncertainty.",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Southern Sri Lankan coastline and clear ocean water",
  },
  {
    slug: "ella",
    name: "Ella",
    region: "Uva Province",
    summary:
      "Mist, tea, and highland air — day charters timed to the mountain light.",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Lush Sri Lankan highland and tropical hillside landscape",
  },
  {
    slug: "sigiriya",
    name: "Sigiriya",
    region: "Central Province",
    summary:
      "Rock fortress and cultural triangle roads — guided by drivers who know the routes.",
    image:
      "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=1800&q=85",
    imageAlt: "Aerial view of Sigiriya Rock Fortress in Sri Lanka",
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}
