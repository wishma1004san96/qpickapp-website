import {
  getDestinationImageSrc,
  getLandmarkImageSrc,
} from "@/lib/destination-image-catalog";
import type { TourCategory } from "../types";

export const TOUR_CATEGORIES: TourCategory[] = [
  {
    id: "popular",
    hash: "packages",
    title: "Featured Journeys",
    intro:
      "Hand-picked private chauffeur itineraries — from short heritage escapes to grand island circuits.",
    keywords: ["Sri Lanka private tours", "Q Pick tour packages"],
    imageSrc: getDestinationImageSrc("sigiriya"),
    imageAlt: "Sigiriya Rock Fortress at golden hour",
  },
  {
    id: "classic-sri-lanka",
    hash: "classic-sri-lanka",
    title: "Classic Sri Lanka",
    intro:
      "The routes every visitor recognises — Cultural Triangle icons, tea country, wildlife, and southern coast chapters composed for first-time discovery.",
    keywords: ["classic Sri Lanka tour", "best of Sri Lanka private chauffeur"],
    imageSrc: getDestinationImageSrc("sigiriya"),
    imageAlt: "Sigiriya Rock Fortress — classic Sri Lanka",
  },
  {
    id: "cultural-heritage",
    hash: "cultural-heritage",
    title: "Cultural & Heritage",
    intro:
      "UNESCO kingdoms, cave temples, and living traditions — paced for reflection, photography, and respectful discovery.",
    keywords: ["Cultural Triangle tour", "Sigiriya private chauffeur", "heritage Sri Lanka"],
    imageSrc: getDestinationImageSrc("sigiriya"),
    imageAlt: "Sigiriya Rock Fortress — Cultural Triangle",
  },
  {
    id: "wildlife-safari",
    hash: "wildlife-safari",
    title: "Wildlife & Safari",
    intro:
      "Leopard country, elephant landscapes, and dawn park gates — with chauffeur logistics for early safari windows.",
    keywords: ["Yala safari tour", "Sri Lanka wildlife chauffeur"],
    imageSrc: getDestinationImageSrc("yala"),
    imageAlt: "Leopard safari in Yala National Park",
  },
  {
    id: "beach-holidays",
    hash: "beach-holidays",
    title: "Beach Holidays",
    intro:
      "Southwest coves, southern surf, and east-coast calm — private transfers so every beach day stays effortless.",
    keywords: ["Sri Lanka beach holiday", "Galle Mirissa private tour"],
    imageSrc: getDestinationImageSrc("mirissa"),
    imageAlt: "Mirissa Beach on the south coast",
  },
  {
    id: "hill-country-tea",
    hash: "hill-country-tea",
    title: "Hill Country",
    intro:
      "Cool mist, plantation visits, and ridge viewpoints from Kandy through Nuwara Eliya to Ella.",
    keywords: ["Nuwara Eliya tea tour", "hill country private chauffeur"],
    imageSrc: getDestinationImageSrc("nuwara-eliya"),
    imageAlt: "Nuwara Eliya tea estates in the highlands",
  },
  {
    id: "tea-country",
    hash: "tea-country",
    title: "Tea Country",
    intro:
      "Factory floors, estate verandas, and misty valleys — Sri Lanka's tea belt at a pace that respects every cup.",
    keywords: ["Ceylon tea tour", "plantation private chauffeur"],
    imageSrc: getDestinationImageSrc("nuwara-eliya"),
    imageAlt: "Terraced tea plantations in Sri Lanka",
  },
  {
    id: "adventure",
    hash: "adventure",
    title: "Adventure Tours",
    intro:
      "Rafting rivers, ridge walks, surf coasts, and active days supported by a dedicated private driver.",
    keywords: ["Ella adventure tour", "Arugam Bay private transfer"],
    imageSrc: getLandmarkImageSrc("kitulgala"),
    imageAlt: "White-water rafting near Kitulgala",
  },
  {
    id: "train-journeys",
    hash: "train-journeys",
    title: "Scenic Train Journeys",
    intro:
      "Highland rail through tea country — optional scenic segments while your chauffeur moves luggage by road.",
    keywords: ["Ella train journey", "Nine Arches Bridge tour"],
    imageSrc: getDestinationImageSrc("ella"),
    imageAlt: "Nine Arches Bridge near Ella",
  },
  {
    id: "honeymoon",
    hash: "honeymoon",
    title: "Honeymoon",
    intro:
      "Romantic circuits across heritage, misty tea country, and ocean sunsets with villa-style stays you choose.",
    keywords: ["Sri Lanka honeymoon private tour"],
    imageSrc: getDestinationImageSrc("bentota"),
    imageAlt: "Bentota coast at sunset",
  },
  {
    id: "luxury-escapes",
    hash: "luxury-escapes",
    title: "Luxury Escapes",
    intro:
      "Quieter pacing, premium vehicle classes, and flexible photo stops for travellers who value composure.",
    keywords: ["luxury Sri Lanka tour", "private chauffeur Sri Lanka"],
    imageSrc: getDestinationImageSrc("galle"),
    imageAlt: "Galle Fort lighthouse at dusk",
  },
  {
    id: "family",
    hash: "family",
    title: "Family Tours",
    intro:
      "Spacious vans, kinder daily distances, and child-friendly highlights without rigid group schedules.",
    keywords: ["family tour Sri Lanka private"],
    imageSrc: getDestinationImageSrc("polonnaruwa"),
    imageAlt: "Polonnaruwa ancient city ruins",
  },
  {
    id: "ayurveda-wellness",
    hash: "ayurveda-wellness",
    title: "Ayurveda & Wellness",
    intro:
      "Coastal recovery chapters and wellness retreats woven into private journeys — pace matched to your programme.",
    keywords: ["Ayurveda Sri Lanka tour", "wellness chauffeur holiday"],
    imageSrc: getDestinationImageSrc("bentota"),
    imageAlt: "Peaceful Bentota coast for wellness stays",
  },
  {
    id: "food",
    hash: "food",
    title: "Food Experiences",
    intro:
      "Colombo dining, spice gardens, and regional kitchens — culinary days between heritage and coast.",
    keywords: ["Sri Lanka food tour", "culinary private chauffeur"],
    imageSrc: getDestinationImageSrc("colombo"),
    imageAlt: "Colombo skyline and dining district",
  },
  {
    id: "festival",
    hash: "festival",
    title: "Festival Experiences",
    intro:
      "Kandy perahera seasons, temple festivals, and cultural calendars — timed with private road support.",
    keywords: ["Kandy festival tour", "Esala Perahera chauffeur"],
    imageSrc: getDestinationImageSrc("kandy"),
    imageAlt: "Temple of the Tooth in Kandy",
  },
  {
    id: "photography-tours",
    hash: "photography-tours",
    title: "Photography Tours",
    intro:
      "Golden-hour routing, wildlife windows, and ridge viewpoints — private chauffeur timing built for serious lenses.",
    keywords: ["Sri Lanka photography tour", "private photo chauffeur"],
    imageSrc: getDestinationImageSrc("ella"),
    imageAlt: "Nine Arches Bridge near Ella",
  },
  {
    id: "bird-watching",
    hash: "bird-watching",
    title: "Bird Watching",
    intro:
      "Wetland dawn choruses, dry-zone hides, and coastal migrants — specialist pacing for birders across the island.",
    keywords: ["Sri Lanka birding tour", "birdwatching chauffeur"],
    imageSrc: getDestinationImageSrc("yala"),
    imageAlt: "Birdlife in Sri Lankan national parks",
  },
  {
    id: "pilgrimage",
    hash: "pilgrimage",
    title: "Pilgrimage",
    intro:
      "Sacred stupas, cave temples, and devotional cities — respectful private travel for faith-led journeys.",
    keywords: ["Buddhist pilgrimage Sri Lanka", "sacred sites tour"],
    imageSrc: getDestinationImageSrc("anuradhapura"),
    imageAlt: "Ruwanwelisaya stupa in Anuradhapura",
  },
  {
    id: "cruise-excursions",
    hash: "cruise-excursions",
    title: "Cruise Excursions",
    intro:
      "Colombo and Galle port calls distilled into confident shore days — timed returns and composed city highlights.",
    keywords: ["Colombo cruise excursion", "Galle shore tour"],
    imageSrc: getDestinationImageSrc("colombo"),
    imageAlt: "Colombo harbour and skyline",
  },
  {
    id: "day-tours",
    hash: "day-tours",
    title: "Day Tours",
    intro:
      "Single-day private chauffeur escapes — ideal for layovers, cruise calls, or a focused taste of one region.",
    keywords: ["Sri Lanka day tour", "private day chauffeur"],
    imageSrc: getDestinationImageSrc("galle"),
    imageAlt: "Galle Fort lighthouse",
  },
  {
    id: "private-chauffeur",
    hash: "private-chauffeur",
    title: "Private Chauffeur Tours",
    intro:
      "Dedicated driver, premium vehicle class, and flexible daily pacing — the Q Pick standard for discerning travellers.",
    keywords: ["private chauffeur Sri Lanka", "dedicated driver tour"],
    imageSrc: getDestinationImageSrc("colombo"),
    imageAlt: "Private chauffeur tour in Sri Lanka",
  },
  {
    id: "airport-transfers",
    hash: "airport-transfers",
    title: "Airport Transfers",
    intro:
      "Meet-and-greet CMB arrivals, hotel corridors, and departure timing — the Q Pick standard from touchdown.",
    keywords: ["Colombo airport transfer", "CMB private chauffeur"],
    imageSrc: getDestinationImageSrc("negombo"),
    imageAlt: "Negombo lagoon near Bandaranaike International Airport",
  },
  {
    id: "custom-private",
    hash: "custom-private",
    title: "Custom Private Tours",
    intro:
      "Every published itinerary is a starting point — refine destinations, pace, and vehicle with our planners.",
    keywords: ["custom Sri Lanka tour", "bespoke private chauffeur"],
    imageSrc: getDestinationImageSrc("ella"),
    imageAlt: "Ella highlands — custom private routing",
  },
];

/** Luxury browse grid — excludes internal “popular” meta category. */
export const TOUR_BROWSE_CATEGORY_IDS = TOUR_CATEGORIES.filter(
  (c) => c.id !== "popular",
).map((c) => c.id);
