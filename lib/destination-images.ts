/**
 * Destination photography catalog for airport transfer cards.
 * Filenames match destination names — see lib/destination-image-catalog.ts.
 */

import {
  DESTINATION_IMAGE_FILES,
  destinationImagePublicPath,
  getDestinationImageFilename,
  getDestinationImageSrc,
  resolveDestinationSlugFromName,
  type DestinationImageSlug,
} from "@/lib/destination-image-catalog";

export type { DestinationImageSlug };

export type DestinationImage = {
  slug: DestinationImageSlug;
  /** Card / scene image path */
  src: string;
  alt: string;
  landmark: string;
};

const LANDMARKS: Record<DestinationImageSlug, string> = {
  negombo: "Negombo Beach / Lagoon",
  colombo: "Lotus Tower & Colombo skyline",
  kandy: "Temple of the Sacred Tooth Relic",
  galle: "Galle Fort Lighthouse",
  ella: "Nine Arches Bridge",
  sigiriya: "Sigiriya Rock Fortress",
  yala: "Yala leopard safari",
  bentota: "Bentota Beach",
  mirissa: "Mirissa Beach",
  "nuwara-eliya": "Tea plantations",
  anuradhapura: "Ruwanwelisaya",
  polonnaruwa: "Polonnaruwa Vatadage",
  trincomalee: "Nilaveli / Trincomalee Beach",
  "arugam-bay": "Arugam Bay surfing",
  hikkaduwa: "Hikkaduwa coral reef",
  dambulla: "Dambulla Cave Temple",
};

const ALTS: Record<DestinationImageSlug, string> = {
  negombo:
    "Traditional Sri Lankan Oruwa sailing canoe on Negombo Beach with turquoise water and palm trees",
  colombo:
    "Colombo skyline with Lotus Tower rising above Beira Lake and the city harbour",
  kandy:
    "Temple of the Sacred Tooth Relic (Sri Dalada Maligawa) in Kandy with the iconic octagonal Paththirippuwa",
  galle:
    "Galle Fort Lighthouse on the Dutch Fort ramparts overlooking the beach and Indian Ocean",
  ella:
    "Nine Arches Bridge in Ella with a blue train crossing the stone viaduct through highland jungle",
  sigiriya:
    "Sigiriya Rock Fortress rising above ancient ruins and tropical forest in Central Sri Lanka",
  yala:
    "Sri Lankan leopard drinking at a waterhole in Yala National Park during golden hour",
  bentota:
    "Aerial view of Bentota Beach with turquoise ocean, resort pool, and palm coastline",
  mirissa:
    "Mirissa Beach with palm-lined coastline and turquoise Indian Ocean water",
  "nuwara-eliya":
    "Terraced tea plantations covering the hillsides near Nuwara Eliya in Sri Lanka’s highlands",
  anuradhapura:
    "Ruwanwelisaya stupa in Anuradhapura — the great white dagoba under a soft cloudy sky",
  polonnaruwa:
    "Ancient Polonnaruwa Vatadage stone shrine with Buddha statue framed by carved pillars and stairway",
  trincomalee:
    "Quiet sandy shoreline near Trincomalee and Nilaveli with pandanus trees and a fishing boat",
  "arugam-bay":
    "Surfer riding a turquoise barrel wave at Arugam Bay on Sri Lanka’s east coast",
  hikkaduwa:
    "Snorkeler swimming alongside a sea turtle in clear turquoise water at Hikkaduwa coral reef",
  dambulla:
    "Interior of Dambulla Cave Temple with seated Buddha statues, white stupa, and painted rock ceiling",
};

/** Single source of truth — keyed by slug; paths derived from on-disk filenames. */
export const DESTINATION_IMAGES: Record<DestinationImageSlug, DestinationImage> =
  Object.fromEntries(
    (Object.keys(DESTINATION_IMAGE_FILES) as DestinationImageSlug[]).map(
      (slug) => [
        slug,
        {
          slug,
          src: getDestinationImageSrc(slug),
          alt: ALTS[slug],
          landmark: LANDMARKS[slug],
        },
      ],
    ),
  ) as Record<DestinationImageSlug, DestinationImage>;

/** Match destination name/label → image (longest token wins). */
export function resolveDestinationImage(
  destinationName: string | null | undefined,
): DestinationImage | null {
  const slug = resolveDestinationSlugFromName(destinationName);
  if (!slug) return null;
  return DESTINATION_IMAGES[slug];
}

export function destinationImageSrc(slug: DestinationImageSlug): string {
  return getDestinationImageSrc(slug);
}

export { destinationImagePublicPath, getDestinationImageFilename };
