import type { TourGalleryImage } from "../types";

const D = "/images/destinations";

/** Central image registry — components must not hardcode paths. */
export const TOUR_GALLERY: TourGalleryImage[] = [
  {
    id: "sigiriya-hero",
    src: `${D}/sigiriya.webp`,
    alt: "Sigiriya Rock Fortress rising above tropical forest in Sri Lanka",
    tags: ["sigiriya", "cultural", "hero"],
  },
  {
    id: "ella-hero",
    src: `${D}/ella.webp`,
    alt: "Nine Arches Bridge in Ella with a blue train crossing highland jungle",
    tags: ["ella", "hill-country", "hero"],
  },
  {
    id: "galle-hero",
    src: `${D}/galle.webp`,
    alt: "Galle Fort Lighthouse on Dutch ramparts overlooking the Indian Ocean",
    tags: ["galle", "beach", "hero"],
  },
  {
    id: "kandy-hero",
    src: `${D}/kandy.webp`,
    alt: "Temple of the Sacred Tooth Relic in Kandy with the Paththirippuwa octagon",
    tags: ["kandy", "cultural", "hero"],
  },
  {
    id: "yala-hero",
    src: `${D}/yala.webp`,
    alt: "Sri Lankan leopard at a waterhole in Yala National Park",
    tags: ["yala", "wildlife", "hero"],
  },
  {
    id: "mirissa-hero",
    src: `${D}/mirissa.webp`,
    alt: "Coconut Tree Hill in Mirissa overlooking turquoise ocean waters",
    tags: ["mirissa", "beach", "honeymoon", "hero"],
  },
  {
    id: "nuwara-eliya-hero",
    src: `${D}/nuwara-eliya.webp`,
    alt: "Terraced tea plantations covering the hills near Nuwara Eliya",
    tags: ["nuwara-eliya", "hill-country", "hero"],
  },
  {
    id: "anuradhapura-hero",
    src: `${D}/anuradhapura.webp`,
    alt: "Ruwanwelisaya white stupa in ancient Anuradhapura under soft clouds",
    tags: ["anuradhapura", "cultural", "hero"],
  },
  {
    id: "polonnaruwa-hero",
    src: `${D}/polonnaruwa.webp`,
    alt: "Ancient Polonnaruwa stone shrine with Buddha statue and carved pillars",
    tags: ["polonnaruwa", "cultural", "hero"],
  },
  {
    id: "bentota-hero",
    src: `${D}/bentota.webp`,
    alt: "Aerial view of Bentota Beach with turquoise sea and palm coastline",
    tags: ["bentota", "beach", "family", "hero"],
  },
  {
    id: "colombo-hero",
    src: `${D}/colombo.webp`,
    alt: "Colombo skyline with Lotus Tower above Beira Lake",
    tags: ["colombo", "hero"],
  },
  {
    id: "negombo-hero",
    src: `${D}/negombo.webp`,
    alt: "Traditional Oruwa canoe on Negombo Beach with palm trees",
    tags: ["negombo", "beach", "hero"],
  },
  {
    id: "trincomalee-hero",
    src: `${D}/trincomalee.webp`,
    alt: "Quiet sandy shoreline near Trincomalee and Nilaveli on Sri Lanka’s east coast",
    tags: ["trincomalee", "beach", "hero"],
  },
  {
    id: "hikkaduwa-hero",
    src: `${D}/hikkaduwa.webp`,
    alt: "Snorkeler swimming with a sea turtle at Hikkaduwa coral reef",
    tags: ["hikkaduwa", "beach", "wildlife", "hero"],
  },
  {
    id: "dambulla-hero",
    src: `${D}/dambulla.webp`,
    alt: "Interior of Dambulla Cave Temple with Buddha statues and painted ceiling",
    tags: ["dambulla", "cultural", "hero"],
  },
  {
    id: "arugam-bay-hero",
    src: `${D}/arugam-bay.webp`,
    alt: "Surfer riding a turquoise barrel wave at Arugam Bay",
    tags: ["arugam-bay", "beach", "adventure", "hero"],
  },
];
