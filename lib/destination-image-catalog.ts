/**
 * Canonical destination photography — filenames match destination names on disk.
 * All assets live under `public/images/destinations/`.
 */

export const DESTINATION_IMAGE_DIR = "/images/destinations";

/** Slug → exact filename (must match a file in public/images/destinations). */
export const DESTINATION_IMAGE_FILES = {
  sigiriya: "Sigiriya Rock Fortress.webp",
  kandy: "Temple of the Tooth (Kandy).webp",
  ella: "Nine Arches Bridge (Ella).webp",
  galle: "Galle Fort Lighthouse.webp",
  yala: "Yala Leopard Safari.webp",
  "nuwara-eliya": "Nuwara Eliya Tea Estates.webp",
  mirissa: "Mirissa Beach.webp",
  bentota: "Bentota Beach.webp",
  trincomalee: "Trincomalee Beach.webp",
  anuradhapura: "anuradhapura.webp",
  polonnaruwa: "polonnaruwa.webp",
  dambulla: "Dambulla Cave Temple.webp",
  "arugam-bay": "Arugam Bay.webp",
  hikkaduwa: "Hikkaduwa Beach.webp",
  negombo: "Negombo Beach.webp",
  colombo: "Colombo Lotus Tower.webp",
  jaffna: "Jaffna Fort.webp",
  "delft-island": "Delft Island.webp",
  "nallur-kandaswamy-temple": "Nallur Kandaswamy Temple.webp",
  "nagadeepa-nainativu": "Nainativu Nagadeepa Temple.webp",
  mannar: "Mannar.webp",
  nilaveli: "Nilaveli Beach.webp",
  pasikuda: "Pasikuda Beach.webp",
  wilpattu: "Wilpattu National Park.webp",
  minneriya: "Minneriya National Park.webp",
  udawalawe: "Udawalawe National Park.webp",
  tangalle: "Tangalle Beach.webp",
  sinharaja: "Sinharaja Forest Reserve.webp",
  mihintale: "Mihintale.webp",
  kalpitiya: "Kalpitiya.webp",
  badulla: "Badulla Railway.webp",
  ratnapura: "Ratnapura.webp",
  "liptons-seat": "Lipton's Seat.webp",
  "ayurveda-wellness": "Ayurveda Wellness.webp",
  tissamaharama: "Tissamaharama.webp",
  batticaloa: "Batticaloa.webp",
  munneswaram: "Munneswaram Temple.webp",
  "horton-plains": "Horton Plains.webp",
} as const;

/** Landmark / gallery filenames (not primary city slugs). */
export const LANDMARK_IMAGE_FILES = {
  "mirissa-beach": "Mirissa Beach.webp",
  "coconut-tree-hill": "Coconut Tree Hill.webp",
  unawatuna: "Unawatuna Beach.webp",
  "horton-plains": "Horton Plains.webp",
  "little-adams-peak": "Little Adam's Peak.webp",
  pinnawala: "Pinnawala Elephant Orphanage.webp",
  ambuluwawa: "Ambuluwawa Tower.webp",
  "ravana-falls": "Ravana Falls.webp",
  "diyaluma-falls": "Diyaluma Falls.webp",
  "madu-river": "Madu River Safari.webp",
  kitulgala: "Kitulgala Rafting.webp",
} as const;

export type DestinationImageSlug = keyof typeof DESTINATION_IMAGE_FILES;
export type LandmarkImageId = keyof typeof LANDMARK_IMAGE_FILES;

/** URL-safe public path for a destination image filename. */
export function destinationImagePublicPath(filename: string): string {
  return `${DESTINATION_IMAGE_DIR}/${encodeURI(filename)}`;
}

export function getDestinationImageSrc(slug: DestinationImageSlug): string {
  return destinationImagePublicPath(DESTINATION_IMAGE_FILES[slug]);
}

export function getDestinationImageFilename(slug: DestinationImageSlug): string {
  return DESTINATION_IMAGE_FILES[slug];
}

export function getLandmarkImageSrc(id: LandmarkImageId): string {
  return destinationImagePublicPath(LANDMARK_IMAGE_FILES[id]);
}

/** Gallery hero id → destination slug (or landmark id). */
const GALLERY_HERO_MAP: Record<
  string,
  { type: "slug"; slug: DestinationImageSlug } | { type: "landmark"; id: LandmarkImageId }
> = {
  "sigiriya-hero": { type: "slug", slug: "sigiriya" },
  "kandy-hero": { type: "slug", slug: "kandy" },
  "ella-hero": { type: "slug", slug: "ella" },
  "galle-hero": { type: "slug", slug: "galle" },
  "yala-hero": { type: "slug", slug: "yala" },
  "mirissa-hero": { type: "slug", slug: "mirissa" },
  "nuwara-eliya-hero": { type: "slug", slug: "nuwara-eliya" },
  "anuradhapura-hero": { type: "slug", slug: "anuradhapura" },
  "polonnaruwa-hero": { type: "slug", slug: "polonnaruwa" },
  "bentota-hero": { type: "slug", slug: "bentota" },
  "colombo-hero": { type: "slug", slug: "colombo" },
  "negombo-hero": { type: "slug", slug: "negombo" },
  "trincomalee-hero": { type: "slug", slug: "trincomalee" },
  "hikkaduwa-hero": { type: "slug", slug: "hikkaduwa" },
  "arugam-bay-hero": { type: "slug", slug: "arugam-bay" },
  "dambulla-hero": { type: "slug", slug: "dambulla" },
};

export function getGalleryHeroImageSrc(galleryId: string): string | null {
  const entry = GALLERY_HERO_MAP[galleryId];
  if (!entry) return null;
  if (entry.type === "slug") return getDestinationImageSrc(entry.slug);
  return getLandmarkImageSrc(entry.id);
}

/** Stay style area → destination slug for photography. */
export const STAY_AREA_IMAGE_SLUG: Record<string, DestinationImageSlug> = {
  sigiriya: "sigiriya",
  kandy: "kandy",
  "nuwara-eliya": "nuwara-eliya",
  ella: "ella",
  yala: "yala",
  mirissa: "mirissa",
  negombo: "negombo",
  trincomalee: "trincomalee",
};

/** Match free-text destination labels → slug (longest token wins). */
const NAME_TO_SLUG: { slug: DestinationImageSlug; tokens: readonly string[] }[] = [
  { slug: "sigiriya", tokens: ["sigiriya rock", "sigiriya"] },
  { slug: "kandy", tokens: ["temple of the tooth", "kandy"] },
  { slug: "ella", tokens: ["nine arches", "ella"] },
  { slug: "galle", tokens: ["galle fort", "galle lighthouse", "galle"] },
  { slug: "yala", tokens: ["yala leopard", "yala"] },
  { slug: "nuwara-eliya", tokens: ["nuwara eliya tea", "nuwara eliya", "nuwaraeliya"] },
  { slug: "mirissa", tokens: ["mirissa beach", "mirissa", "weligama"] },
  { slug: "bentota", tokens: ["bentota beach", "bentota"] },
  { slug: "trincomalee", tokens: ["trincomalee beach", "trincomalee", "nilaveli"] },
  { slug: "anuradhapura", tokens: ["anuradhapura"] },
  { slug: "polonnaruwa", tokens: ["polonnaruwa"] },
  { slug: "dambulla", tokens: ["dambulla cave", "dambulla"] },
  { slug: "arugam-bay", tokens: ["arugam bay", "arugam"] },
  { slug: "hikkaduwa", tokens: ["hikkaduwa beach", "hikkaduwa"] },
  { slug: "negombo", tokens: ["negombo beach", "negombo", "katunayake", "cmb"] },
  { slug: "colombo", tokens: ["colombo lotus", "colombo", "lotus tower"] },
  { slug: "jaffna", tokens: ["jaffna fort", "jaffna"] },
  {
    slug: "nallur-kandaswamy-temple",
    tokens: ["nallur kandaswamy", "nallur kovil", "nallur temple"],
  },
  { slug: "delft-island", tokens: ["delft island", "neduntheevu", "neduntivu"] },
  {
    slug: "nagadeepa-nainativu",
    tokens: ["nagadeepa", "nainativu", "nagapooshani"],
  },
  { slug: "mannar", tokens: ["mannar", "talaimannar"] },
  { slug: "nilaveli", tokens: ["nilaveli", "pigeon island"] },
  { slug: "pasikuda", tokens: ["pasikuda", "passikudah", "pasikudah"] },
  { slug: "wilpattu", tokens: ["wilpattu"] },
  { slug: "minneriya", tokens: ["minneriya", "elephant gathering"] },
  { slug: "udawalawe", tokens: ["udawalawe"] },
  { slug: "tangalle", tokens: ["tangalle", "goyambokka"] },
  { slug: "sinharaja", tokens: ["sinharaja"] },
  { slug: "mihintale", tokens: ["mihintale"] },
  { slug: "kalpitiya", tokens: ["kalpitiya", "dolphin watching"] },
  { slug: "badulla", tokens: ["badulla", "ella railway"] },
  { slug: "ratnapura", tokens: ["ratnapura", "adam's peak", "sri pada"] },
  { slug: "liptons-seat", tokens: ["lipton's seat", "liptons seat", "haputale"] },
  { slug: "ayurveda-wellness", tokens: ["ayurveda", "wellness retreat", "spa"] },
  { slug: "tissamaharama", tokens: ["tissamaharama", "tissa dagoba", "tissa"] },
  { slug: "batticaloa", tokens: ["batticaloa", "kallady"] },
  { slug: "munneswaram", tokens: ["munneswaram", "munneswaram kovil"] },
  { slug: "horton-plains", tokens: ["horton plains", "world's end", "worlds end"] },
];

export function resolveDestinationSlugFromName(
  name: string | null | undefined,
): DestinationImageSlug | null {
  if (!name?.trim()) return null;
  const hay = name.toLowerCase();
  let best: DestinationImageSlug | null = null;
  let bestLen = 0;
  for (const row of NAME_TO_SLUG) {
    for (const token of row.tokens) {
      if (hay.includes(token) && token.length > bestLen) {
        best = row.slug;
        bestLen = token.length;
      }
    }
  }
  return best;
}

export function resolveDestinationImageFromName(name: string | null | undefined): {
  src: string;
  filename: string;
} | null {
  const slug = resolveDestinationSlugFromName(name);
  if (!slug) return null;
  return {
    src: getDestinationImageSrc(slug),
    filename: getDestinationImageFilename(slug),
  };
}
