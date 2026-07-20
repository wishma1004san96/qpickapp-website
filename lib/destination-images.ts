/**
 * Destination photography catalog for airport transfer cards.
 *
 * Prefer local WebP under `/images/destinations/`.
 * Remote Unsplash URLs are temporary fallbacks — swap `src` to local when assets land.
 */

export type DestinationImageSlug =
  | "negombo"
  | "colombo"
  | "kandy"
  | "galle"
  | "ella"
  | "sigiriya"
  | "yala"
  | "bentota"
  | "mirissa"
  | "nuwara-eliya"
  | "anuradhapura"
  | "polonnaruwa"
  | "trincomalee"
  | "arugam-bay"
  | "hikkaduwa"
  | "dambulla";

export type DestinationImage = {
  slug: DestinationImageSlug;
  /** Card / scene image path or URL */
  src: string;
  alt: string;
  landmark: string;
};

const LOCAL = "/images/destinations";

/**
 * Single source of truth — update `src` here when replacing assets.
 * All primary destinations use local WebP under public/images/destinations/.
 */
export const DESTINATION_IMAGES: Record<DestinationImageSlug, DestinationImage> =
  {
    negombo: {
      slug: "negombo",
      src: `${LOCAL}/negombo.webp`,
      alt: "Traditional Sri Lankan Oruwa sailing canoe on Negombo Beach with turquoise water and palm trees",
      landmark: "Negombo Beach / Lagoon",
    },
    colombo: {
      slug: "colombo",
      src: `${LOCAL}/colombo.webp`,
      alt: "Colombo skyline with Lotus Tower rising above Beira Lake and the city harbour",
      landmark: "Lotus Tower & Colombo skyline",
    },
    kandy: {
      slug: "kandy",
      src: `${LOCAL}/kandy.webp`,
      alt: "Temple of the Sacred Tooth Relic (Sri Dalada Maligawa) in Kandy with the iconic octagonal Paththirippuwa",
      landmark: "Temple of the Sacred Tooth Relic",
    },
    galle: {
      slug: "galle",
      src: `${LOCAL}/galle.webp`,
      alt: "Galle Fort Lighthouse on the Dutch Fort ramparts overlooking the beach and Indian Ocean",
      landmark: "Galle Fort Lighthouse",
    },
    ella: {
      slug: "ella",
      src: `${LOCAL}/ella.webp`,
      alt: "Nine Arches Bridge in Ella with a blue train crossing the stone viaduct through highland jungle",
      landmark: "Nine Arches Bridge",
    },
    sigiriya: {
      slug: "sigiriya",
      src: `${LOCAL}/sigiriya.webp`,
      alt: "Sigiriya Rock Fortress rising above ancient ruins and tropical forest in Central Sri Lanka",
      landmark: "Sigiriya Rock Fortress",
    },
    yala: {
      slug: "yala",
      src: `${LOCAL}/yala.webp`,
      alt: "Sri Lankan leopard drinking at a waterhole in Yala National Park during golden hour",
      landmark: "Yala leopard safari",
    },
    bentota: {
      slug: "bentota",
      src: `${LOCAL}/bentota.webp`,
      alt: "Aerial view of Bentota Beach with turquoise ocean, resort pool, and palm coastline",
      landmark: "Bentota Beach",
    },
    mirissa: {
      slug: "mirissa",
      src: `${LOCAL}/mirissa.webp`,
      alt: "Coconut Tree Hill in Mirissa with palm trees on a cliff overlooking the blue Indian Ocean",
      landmark: "Coconut Tree Hill",
    },
    "nuwara-eliya": {
      slug: "nuwara-eliya",
      src: `${LOCAL}/nuwara-eliya.webp`,
      alt: "Terraced tea plantations covering the hillsides near Nuwara Eliya in Sri Lanka’s highlands",
      landmark: "Tea plantations",
    },
    anuradhapura: {
      slug: "anuradhapura",
      src: `${LOCAL}/anuradhapura.webp`,
      alt: "Ruwanwelisaya stupa in Anuradhapura — the great white dagoba under a soft cloudy sky",
      landmark: "Ruwanwelisaya",
    },
    polonnaruwa: {
      slug: "polonnaruwa",
      src: `${LOCAL}/polonnaruwa.webp`,
      alt: "Ancient Polonnaruwa Vatadage stone shrine with Buddha statue framed by carved pillars and stairway",
      landmark: "Polonnaruwa Vatadage",
    },
    trincomalee: {
      slug: "trincomalee",
      src: `${LOCAL}/trincomalee.webp`,
      alt: "Quiet sandy shoreline near Trincomalee and Nilaveli with pandanus trees and a fishing boat",
      landmark: "Nilaveli / Trincomalee Beach",
    },
    "arugam-bay": {
      slug: "arugam-bay",
      src: `${LOCAL}/arugam-bay.webp`,
      alt: "Surfer riding a turquoise barrel wave at Arugam Bay on Sri Lanka’s east coast",
      landmark: "Arugam Bay surfing",
    },
    hikkaduwa: {
      slug: "hikkaduwa",
      src: `${LOCAL}/hikkaduwa.webp`,
      alt: "Snorkeler swimming alongside a sea turtle in clear turquoise water at Hikkaduwa coral reef",
      landmark: "Hikkaduwa coral reef",
    },
    dambulla: {
      slug: "dambulla",
      src: `${LOCAL}/dambulla.webp`,
      alt: "Interior of Dambulla Cave Temple with seated Buddha statues, white stupa, and painted rock ceiling",
      landmark: "Dambulla Cave Temple",
    },
  };

/** Match destination name/label → image slug (longest token wins). */
const MATCH_TOKENS: { slug: DestinationImageSlug; tokens: readonly string[] }[] =
  [
    { slug: "sigiriya", tokens: ["sigiriya"] },
    { slug: "nuwara-eliya", tokens: ["nuwara eliya", "nuwaraeliya", "nuwara-eliya"] },
    { slug: "anuradhapura", tokens: ["anuradhapura"] },
    { slug: "polonnaruwa", tokens: ["polonnaruwa"] },
    { slug: "trincomalee", tokens: ["trincomalee", "nilaveli", "pigeon island"] },
    { slug: "arugam-bay", tokens: ["arugam", "arugam bay"] },
    { slug: "hikkaduwa", tokens: ["hikkaduwa"] },
    { slug: "bentota", tokens: ["bentota"] },
    { slug: "mirissa", tokens: ["mirissa", "weligama"] },
    { slug: "ella", tokens: ["ella", "haputale", "bandarawela", "nine arch"] },
    { slug: "galle", tokens: ["galle", "unawatuna", "ahungalla", "beruwala", "aluthgama"] },
    { slug: "kandy", tokens: ["kandy", "katugastota", "peradeniya", "pilimathalawa"] },
    { slug: "yala", tokens: ["yala"] },
    { slug: "dambulla", tokens: ["dambulla", "habarana"] },
    { slug: "negombo", tokens: ["negombo", "katunayake", "seeduwa", "ja-ela", "ekala"] },
    {
      slug: "colombo",
      tokens: [
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
    },
  ];

export function resolveDestinationImage(
  destinationName: string | null | undefined,
): DestinationImage | null {
  if (!destinationName?.trim()) return null;
  const hay = destinationName.toLowerCase();

  let best: DestinationImage | null = null;
  let bestLen = 0;

  for (const row of MATCH_TOKENS) {
    for (const token of row.tokens) {
      if (hay.includes(token) && token.length > bestLen) {
        best = DESTINATION_IMAGES[row.slug];
        bestLen = token.length;
      }
    }
  }

  return best;
}

export function destinationImageSrc(slug: DestinationImageSlug): string {
  return DESTINATION_IMAGES[slug].src;
}
