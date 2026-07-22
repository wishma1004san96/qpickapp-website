import type { TourGalleryImage } from "../types";
import { getGalleryHeroImageSrc } from "@/lib/destination-image-catalog";

function hero(
  id: string,
  alt: string,
  tags: string[],
): TourGalleryImage {
  const src = getGalleryHeroImageSrc(id);
  if (!src) {
    throw new Error(`Missing gallery hero mapping for ${id}`);
  }
  return { id, src, alt, tags };
}

/** Central image registry — components must not hardcode paths. */
export const TOUR_GALLERY: TourGalleryImage[] = [
  hero("sigiriya-hero", "Sigiriya Rock Fortress rising above tropical forest in Sri Lanka", [
    "sigiriya",
    "cultural",
    "hero",
  ]),
  hero("ella-hero", "Nine Arches Bridge in Ella with a blue train crossing highland jungle", [
    "ella",
    "hill-country",
    "hero",
  ]),
  hero("galle-hero", "Galle Fort Lighthouse on Dutch ramparts overlooking the Indian Ocean", [
    "galle",
    "beach",
    "hero",
  ]),
  hero("kandy-hero", "Temple of the Sacred Tooth Relic in Kandy with the Paththirippuwa octagon", [
    "kandy",
    "cultural",
    "hero",
  ]),
  hero("yala-hero", "Sri Lankan leopard at a waterhole in Yala National Park", [
    "yala",
    "wildlife",
    "hero",
  ]),
  hero("mirissa-hero", "Mirissa Beach overlooking turquoise ocean waters", [
    "mirissa",
    "beach",
    "honeymoon",
    "hero",
  ]),
  hero("nuwara-eliya-hero", "Terraced tea plantations covering the hills near Nuwara Eliya", [
    "nuwara-eliya",
    "hill-country",
    "hero",
  ]),
  hero("anuradhapura-hero", "Ruwanwelisaya white stupa in ancient Anuradhapura under soft clouds", [
    "anuradhapura",
    "cultural",
    "hero",
  ]),
  hero("polonnaruwa-hero", "Ancient Polonnaruwa stone shrine with Buddha statue and carved pillars", [
    "polonnaruwa",
    "cultural",
    "hero",
  ]),
  hero("bentota-hero", "Aerial view of Bentota Beach with turquoise sea and palm coastline", [
    "bentota",
    "beach",
    "family",
    "hero",
  ]),
  hero("colombo-hero", "Colombo skyline with Lotus Tower above Beira Lake", ["colombo", "hero"]),
  hero("negombo-hero", "Traditional Oruwa canoe on Negombo Beach with palm trees", [
    "negombo",
    "beach",
    "hero",
  ]),
  hero("trincomalee-hero", "Quiet sandy shoreline near Trincomalee and Nilaveli on Sri Lanka’s east coast", [
    "trincomalee",
    "beach",
    "hero",
  ]),
  hero("hikkaduwa-hero", "Snorkeler swimming with a sea turtle at Hikkaduwa coral reef", [
    "hikkaduwa",
    "beach",
    "wildlife",
    "hero",
  ]),
  hero("dambulla-hero", "Interior of Dambulla Cave Temple with Buddha statues and painted ceiling", [
    "dambulla",
    "cultural",
    "hero",
  ]),
  hero("arugam-bay-hero", "Surfer riding a turquoise barrel wave at Arugam Bay", [
    "arugam-bay",
    "beach",
    "adventure",
    "hero",
  ]),
  {
    id: "chauffeur-story",
    src: "/images/story/chauffeur.webp",
    alt: "Q Pick private chauffeur welcoming guests beside a premium vehicle",
    tags: ["chauffeur", "luxury", "story"],
  },
  {
    id: "arrival-story",
    src: "/images/story/arrival.webp",
    alt: "Guests arriving in Sri Lanka with private airport transfer",
    tags: ["arrival", "airport", "story"],
  },
  {
    id: "discovery-story",
    src: "/images/story/discovery.webp",
    alt: "Travellers discovering a scenic Sri Lankan viewpoint",
    tags: ["discovery", "nature", "story"],
  },
  {
    id: "compose-story",
    src: "/images/story/compose.webp",
    alt: "Curated Sri Lanka journey planning with Q Pick",
    tags: ["planning", "luxury", "story"],
  },
];
