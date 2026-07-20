import type { TourSuggestedStay } from "../types";

const D = "/images/destinations";

/**
 * Suggested stay styles — placeholders only.
 * Never presented as confirmed hotel partnerships.
 */
export const TOUR_SUGGESTED_STAYS: TourSuggestedStay[] = [
  {
    id: "triangle-heritage",
    name: "Cultural Triangle stay",
    area: "Sigiriya / Dambulla belt",
    style: "Heritage boutique or villa garden",
    imageSrc: `${D}/sigiriya.webp`,
    imageAlt: "Sigiriya landscape suggesting overnight Cultural Triangle stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership. We advise options after your request.",
  },
  {
    id: "kandy-lake",
    name: "Kandy lake-view stay",
    area: "Kandy",
    style: "Hill capital hotel or boutique",
    imageSrc: `${D}/kandy.webp`,
    imageAlt: "Kandy Temple area suggesting overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership.",
  },
  {
    id: "tea-country",
    name: "Tea country lodge",
    area: "Nuwara Eliya",
    style: "Cool-climate plantation lodge",
    imageSrc: `${D}/nuwara-eliya.webp`,
    imageAlt: "Tea plantations suggesting highland overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership.",
  },
  {
    id: "ella-ridge",
    name: "Ella ridge hideaway",
    area: "Ella",
    style: "Viewpoint café-hotel or villa",
    imageSrc: `${D}/ella.webp`,
    imageAlt: "Ella Nine Arches area suggesting overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership.",
  },
  {
    id: "yala-edge",
    name: "Wildlife-edge lodge",
    area: "Yala approaches",
    style: "Safari-adjacent lodge",
    imageSrc: `${D}/yala.webp`,
    imageAlt: "Yala landscape suggesting wildlife-edge overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership. Park safaris booked separately.",
  },
  {
    id: "south-coast",
    name: "Southern coast retreat",
    area: "Mirissa / Galle",
    style: "Beach boutique or fort-side stay",
    imageSrc: `${D}/mirissa.webp`,
    imageAlt: "Mirissa coast suggesting beach overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership.",
  },
  {
    id: "west-arrival",
    name: "Arrival corridor stay",
    area: "Negombo / Colombo",
    style: "Airport-convenient hotel",
    imageSrc: `${D}/negombo.webp`,
    imageAlt: "Negombo beach suggesting arrival overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership.",
  },
  {
    id: "east-season",
    name: "East-coast seasonal stay",
    area: "Trincomalee / Arugam Bay",
    style: "Beach lodge (season dependent)",
    imageSrc: `${D}/trincomalee.webp`,
    imageAlt: "East coast beach suggesting seasonal overnight stays",
    placeholder: true,
    note: "Stay style suggestion only — not a hotel partnership. East routing depends on season.",
  },
];
