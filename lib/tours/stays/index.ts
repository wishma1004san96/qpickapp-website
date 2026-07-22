import type { TourSuggestedStay } from "../types";
import {
  getDestinationImageSrc,
  STAY_AREA_IMAGE_SLUG,
} from "@/lib/destination-image-catalog";

function stayImage(areaSlug: keyof typeof STAY_AREA_IMAGE_SLUG) {
  return getDestinationImageSrc(STAY_AREA_IMAGE_SLUG[areaSlug]);
}

/**
 * Suggested stay styles — placeholders only.
 * Photography matches the destination area via canonical filenames.
 */
export const TOUR_SUGGESTED_STAYS: TourSuggestedStay[] = [
  {
    id: "cultural-triangle-boutique",
    name: "Boutique heritage lodge",
    area: "Sigiriya / Dambulla",
    style: "Heritage boutique",
    note: "Jungle-framed pools and quiet courtyards near the Cultural Triangle.",
    imageSrc: stayImage("sigiriya"),
    imageAlt: "Sigiriya landscape suggesting overnight Cultural Triangle stays",
    placeholder: true,
  },
  {
    id: "kandy-lake-hotel",
    name: "Lake-view city hotel",
    area: "Kandy",
    style: "Colonial comfort",
    note: "Walkable to the lake and Temple of the Tooth — ideal for one calm night.",
    imageSrc: stayImage("kandy"),
    imageAlt: "Kandy Temple area suggesting overnight stays",
    placeholder: true,
  },
  {
    id: "tea-country-lodge",
    name: "Tea country bungalow",
    area: "Nuwara Eliya",
    style: "Plantation bungalow",
    note: "Fireplaces, misty mornings, and estate walks in cool highland air.",
    imageSrc: stayImage("nuwara-eliya"),
    imageAlt: "Tea plantations suggesting highland overnight stays",
    placeholder: true,
  },
  {
    id: "ella-view-lodge",
    name: "Ridge-view guesthouse",
    area: "Ella",
    style: "Hill country view",
    note: "Terraces above the valley — perfect after Nine Arches and ridge walks.",
    imageSrc: stayImage("ella"),
    imageAlt: "Ella Nine Arches area suggesting overnight stays",
    placeholder: true,
  },
  {
    id: "yala-lodge",
    name: "Safari-edge lodge",
    area: "Yala",
    style: "Wildlife lodge",
    note: "Early departures for dawn game drives with pool time on return.",
    imageSrc: stayImage("yala"),
    imageAlt: "Yala landscape suggesting wildlife-edge overnight stays",
    placeholder: true,
  },
  {
    id: "south-coast-villa",
    name: "Coastal villa",
    area: "Mirissa",
    style: "Beach villa",
    note: "Ocean air and sunset decks along the southern coast.",
    imageSrc: stayImage("mirissa"),
    imageAlt: "Mirissa coast suggesting beach overnight stays",
    placeholder: true,
  },
  {
    id: "negombo-arrival",
    name: "Airport-edge resort",
    area: "Negombo",
    style: "Arrival resort",
    note: "Unwind after your flight before the island chapters begin.",
    imageSrc: stayImage("negombo"),
    imageAlt: "Negombo beach suggesting arrival overnight stays",
    placeholder: true,
  },
  {
    id: "east-coast-beach",
    name: "East coast beach hotel",
    area: "Trincomalee",
    style: "Beach resort",
    note: "Clear-season swimming and snorkel days on the east coast.",
    imageSrc: stayImage("trincomalee"),
    imageAlt: "East coast beach suggesting seasonal overnight stays",
    placeholder: true,
  },
];
