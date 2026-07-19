/**
 * Immersive destination scenes for Airport Transfer booking UI.
 * Pricing still comes only from official AIRPORT_RATES — these are visual/estimate metadata.
 */

export type DestinationScene = {
  id: string;
  /** Lowercase tokens matched against destination name / label */
  match: readonly string[];
  name: string;
  province: string;
  description: string;
  image: string;
  imageAlt: string;
  distanceKm: number;
  durationMin: number;
};

export const DEFAULT_AIRPORT_SCENE: DestinationScene = {
  id: "default",
  match: [],
  name: "Sri Lanka",
  province: "Island-wide",
  description:
    "A private chauffeur from Bandaranaike International — timed to your flight, composed for the road ahead.",
  image: "/images/airport/hero-arrival.webp",
  imageAlt: "Premium Q Pick airport transfer welcome at CMB",
  distanceKm: 0,
  durationMin: 0,
};

export const DESTINATION_SCENES: readonly DestinationScene[] = [
  {
    id: "sigiriya",
    match: ["sigiriya"],
    name: "Sigiriya",
    province: "Central Province",
    description:
      "The Lion Rock rises from the jungle canopy — arrive with quiet certainty after the flight.",
    image: "/images/app/backgrounds/sigiriya-bg.webp",
    imageAlt: "Sigiriya Rock Fortress at golden hour",
    distanceKm: 170,
    durationMin: 210,
  },
  {
    id: "ella",
    match: ["ella", "haputale", "bandarawela"],
    name: "Ella",
    province: "Uva Province",
    description:
      "Nine Arches and highland mist — the hill country begins the moment you leave arrivals.",
    image: "/images/app/backgrounds/ella-bg.webp",
    imageAlt: "Ella highland landscape near Nine Arches Bridge",
    distanceKm: 220,
    durationMin: 330,
  },
  {
    id: "galle",
    match: ["galle", "unawatuna", "ahungalla", "beruwala", "aluthgama", "ambalangoda"],
    name: "Galle",
    province: "Southern Province",
    description:
      "Dutch Fort ramparts and Indian Ocean light — the southern coast, delivered without scramble.",
    image: "/images/app/backgrounds/galle-bg.webp",
    imageAlt: "Galle Fort and southern coast",
    distanceKm: 150,
    durationMin: 150,
  },
  {
    id: "bentota",
    match: ["bentota"],
    name: "Bentota",
    province: "Southern Province",
    description:
      "Palm-lined beaches and lagoon calm — a coastal transfer timed for resort check-in.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Tropical beach shoreline at Bentota",
    distanceKm: 100,
    durationMin: 120,
  },
  {
    id: "hikkaduwa",
    match: ["hikkaduwa"],
    name: "Hikkaduwa",
    province: "Southern Province",
    description:
      "Coral reef waters and golden sand — southern ease from gate to beachfront.",
    image:
      "https://images.unsplash.com/photo-1519046904884-4511a5d0c5d4?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Hikkaduwa beach coastline",
    distanceKm: 130,
    durationMin: 150,
  },
  {
    id: "kandy",
    match: ["kandy", "katugastota", "peradeniya", "pilimathalawa", "digana"],
    name: "Kandy",
    province: "Central Province",
    description:
      "Temple of the Tooth and lake mist — the hill capital, reached with composed care.",
    image: "/images/app/backgrounds/kandy-bg.webp",
    imageAlt: "Kandy lake and temple cityscape",
    distanceKm: 115,
    durationMin: 180,
  },
  {
    id: "mirissa",
    match: ["mirissa", "weligama", "matara"],
    name: "Mirissa",
    province: "Southern Province",
    description:
      "Coconut Hill sunsets and whale-watching shores — the deep south, privately arranged.",
    image: "/images/app/backgrounds/mirissa-bg.webp",
    imageAlt: "Mirissa coconut hill and ocean view",
    distanceKm: 180,
    durationMin: 210,
  },
  {
    id: "colombo",
    match: [
      "colombo",
      "fort",
      "bambalapitiya",
      "kollupitiya",
      "wellawatta",
      "borella",
      "rajagiriya",
      "nugegoda",
      "dehiwala",
      "mt.lavinia",
      "mount lavinia",
    ],
    name: "Colombo",
    province: "Western Province",
    description:
      "Lotus Tower skyline and harbour lights — the capital, without the curb-side uncertainty.",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Colombo city skyline at dusk",
    distanceKm: 35,
    durationMin: 45,
  },
  {
    id: "negombo",
    match: ["negombo", "katunayake", "seeduwa", "ja-ela", "ekala"],
    name: "Negombo",
    province: "Western Province",
    description:
      "Lagoon breeze minutes from the runway — the closest calm after landing.",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1800&q=80",
    imageAlt: "Negombo lagoon and fishing boats",
    distanceKm: 15,
    durationMin: 25,
  },
  {
    id: "dambulla",
    match: ["dambulla", "habarana"],
    name: "Dambulla",
    province: "Central Province",
    description:
      "Cave temples and cultural triangle roads — inland Sri Lanka, chauffeur-led.",
    image: "/images/app/backgrounds/sigiriya-bg.webp",
    imageAlt: "Cultural triangle landscape near Dambulla",
    distanceKm: 150,
    durationMin: 180,
  },
] as const;

/** More specific matches first (longer tokens preferred via sort). */
export function resolveDestinationScene(
  destinationName: string | null | undefined,
): DestinationScene {
  if (!destinationName?.trim()) return DEFAULT_AIRPORT_SCENE;
  const hay = destinationName.toLowerCase();

  let best: DestinationScene | null = null;
  let bestLen = 0;

  for (const scene of DESTINATION_SCENES) {
    for (const token of scene.match) {
      if (hay.includes(token) && token.length > bestLen) {
        best = scene;
        bestLen = token.length;
      }
    }
  }

  if (!best) {
    return {
      ...DEFAULT_AIRPORT_SCENE,
      name: destinationName,
      description:
        "Your private transfer from Bandaranaike International Airport — official fare, professional chauffeur.",
    };
  }

  // Prefer scene display name when token is a suburb of a known destination
  return best;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDistance(km: number): string {
  if (!km) return "—";
  return `≈ ${km} km`;
}
