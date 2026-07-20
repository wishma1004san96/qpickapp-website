/**
 * Immersive destination scenes for Airport Transfer booking UI.
 * Pricing still comes only from official AIRPORT_RATES — these are visual/estimate metadata.
 *
 * Photography: lib/destination-images.ts (local WebP under public/images/destinations/).
 */

import {
  DESTINATION_IMAGES,
  resolveDestinationImage,
} from "@/lib/destination-images";

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

function scene(
  id: keyof typeof DESTINATION_IMAGES,
  meta: Omit<DestinationScene, "id" | "image" | "imageAlt">,
): DestinationScene {
  const photo = DESTINATION_IMAGES[id];
  return {
    id,
    image: photo.src,
    imageAlt: photo.alt,
    ...meta,
  };
}

export const DESTINATION_SCENES: readonly DestinationScene[] = [
  scene("sigiriya", {
    match: ["sigiriya"],
    name: "Sigiriya",
    province: "Central Province",
    description:
      "The Lion Rock rises from the jungle canopy — arrive with quiet certainty after the flight.",
    distanceKm: 170,
    durationMin: 210,
  }),
  scene("ella", {
    match: ["ella", "haputale", "bandarawela", "nine arch"],
    name: "Ella",
    province: "Uva Province",
    description:
      "Nine Arches and highland mist — the hill country begins the moment you leave arrivals.",
    distanceKm: 220,
    durationMin: 330,
  }),
  scene("galle", {
    match: ["galle", "unawatuna", "ahungalla", "beruwala", "aluthgama", "ambalangoda"],
    name: "Galle",
    province: "Southern Province",
    description:
      "Dutch Fort ramparts and Indian Ocean light — the southern coast, delivered without scramble.",
    distanceKm: 150,
    durationMin: 150,
  }),
  scene("bentota", {
    match: ["bentota"],
    name: "Bentota",
    province: "Southern Province",
    description:
      "Palm-lined beaches and lagoon calm — a coastal transfer timed for resort check-in.",
    distanceKm: 100,
    durationMin: 120,
  }),
  scene("hikkaduwa", {
    match: ["hikkaduwa"],
    name: "Hikkaduwa",
    province: "Southern Province",
    description:
      "Coral reef waters and golden sand — southern ease from gate to beachfront.",
    distanceKm: 130,
    durationMin: 150,
  }),
  scene("kandy", {
    match: ["kandy", "katugastota", "peradeniya", "pilimathalawa", "digana"],
    name: "Kandy",
    province: "Central Province",
    description:
      "Temple of the Tooth and lake mist — the hill capital, reached with composed care.",
    distanceKm: 115,
    durationMin: 180,
  }),
  scene("mirissa", {
    match: ["mirissa", "weligama", "matara"],
    name: "Mirissa",
    province: "Southern Province",
    description:
      "Coconut Hill sunsets and whale-watching shores — the deep south, privately arranged.",
    distanceKm: 180,
    durationMin: 210,
  }),
  scene("colombo", {
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
    distanceKm: 35,
    durationMin: 45,
  }),
  scene("negombo", {
    match: ["negombo", "katunayake", "seeduwa", "ja-ela", "ekala"],
    name: "Negombo",
    province: "Western Province",
    description:
      "Lagoon breeze minutes from the runway — the closest calm after landing.",
    distanceKm: 15,
    durationMin: 25,
  }),
  scene("dambulla", {
    match: ["dambulla", "habarana"],
    name: "Dambulla",
    province: "Central Province",
    description:
      "Cave temples and cultural triangle roads — inland Sri Lanka, chauffeur-led.",
    distanceKm: 150,
    durationMin: 180,
  }),
  scene("yala", {
    match: ["yala"],
    name: "Yala",
    province: "Southern Province",
    description:
      "Leopard country and scrubland roads — safari timing handled with quiet precision.",
    distanceKm: 290,
    durationMin: 360,
  }),
  scene("nuwara-eliya", {
    match: ["nuwara eliya", "nuwaraeliya", "nuwara-eliya"],
    name: "Nuwara Eliya",
    province: "Central Province",
    description:
      "Tea country mist and highland air — the cool hills after the coast.",
    distanceKm: 180,
    durationMin: 300,
  }),
  scene("anuradhapura", {
    match: ["anuradhapura"],
    name: "Anuradhapura",
    province: "North Central Province",
    description:
      "Sacred stupas and ancient roads — the cultural triangle, chauffeured.",
    distanceKm: 200,
    durationMin: 270,
  }),
  scene("polonnaruwa", {
    match: ["polonnaruwa"],
    name: "Polonnaruwa",
    province: "North Central Province",
    description:
      "Stone kings and quiet ruins — heritage travel without the scramble.",
    distanceKm: 230,
    durationMin: 300,
  }),
  scene("trincomalee", {
    match: ["trincomalee", "nilaveli", "pigeon island"],
    name: "Trincomalee",
    province: "Eastern Province",
    description:
      "East-coast calm and Nilaveli light — the other ocean, privately timed.",
    distanceKm: 260,
    durationMin: 330,
  }),
  scene("arugam-bay", {
    match: ["arugam", "arugam bay"],
    name: "Arugam Bay",
    province: "Eastern Province",
    description:
      "Surf breaks and east-coast energy — a long drive worth arriving composed.",
    distanceKm: 320,
    durationMin: 420,
  }),
] as const;

/** More specific matches first (longer tokens preferred via sort). */
export function resolveDestinationScene(
  destinationName: string | null | undefined,
): DestinationScene {
  if (!destinationName?.trim()) return DEFAULT_AIRPORT_SCENE;
  const hay = destinationName.toLowerCase();

  let best: DestinationScene | null = null;
  let bestLen = 0;

  for (const sceneRow of DESTINATION_SCENES) {
    for (const token of sceneRow.match) {
      if (hay.includes(token) && token.length > bestLen) {
        best = sceneRow;
        bestLen = token.length;
      }
    }
  }

  if (!best) {
    const photo = resolveDestinationImage(destinationName);
    return {
      ...DEFAULT_AIRPORT_SCENE,
      name: destinationName,
      description:
        "Your private transfer from Bandaranaike International Airport — official fare, professional chauffeur.",
      ...(photo
        ? { image: photo.src, imageAlt: photo.alt }
        : {}),
    };
  }

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
