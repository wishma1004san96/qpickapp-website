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
  hikkaduwa: "Hikkaduwa beach & reef",
  dambulla: "Dambulla Cave Temple",
  jaffna: "Jaffna Fort",
  "delft-island": "Delft Island ruins",
  "nallur-kandaswamy-temple": "Nallur Kandaswamy Kovil",
  "nagadeepa-nainativu": "Nagadeepa Purana Vihara",
  mannar: "Talaimannar Lighthouse",
  nilaveli: "Nilaveli Beach",
  pasikuda: "Pasikuda Bay",
  wilpattu: "Wilpattu National Park",
  minneriya: "Minneriya elephant gathering",
  udawalawe: "Udawalawe elephant herd",
  tangalle: "Tangalle Beach",
  sinharaja: "Sinharaja Forest Reserve",
  mihintale: "Mihintale sacred peak",
  kalpitiya: "Kalpitiya dolphin watching",
  badulla: "Badulla railway terminus",
  ratnapura: "Adam's Peak from tea country",
  "liptons-seat": "Lipton's Seat panorama",
  "ayurveda-wellness": "Ayurvedic herbal therapy",
  tissamaharama: "Tissa Dagoba & paddy plains",
  batticaloa: "Batticaloa lagoon promenade",
  munneswaram: "Munneswaram Kovil gopurams",
  "horton-plains": "Horton Plains sambar & grasslands",
};

const ALTS: Record<DestinationImageSlug, string> = {
  negombo:
    "Traditional oruwa fishing boats on the beach near Negombo with turquoise water and coastal headland",
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
    "Aerial view of Hikkaduwa Beach with turquoise reef water, golden sand, and palm-lined coast",
  dambulla:
    "Interior of Dambulla Cave Temple with seated Buddha statues, white stupa, and painted rock ceiling",
  jaffna:
    "Historic Jaffna Fort ramparts overlooking the lagoon in northern Sri Lanka",
  "delft-island":
    "Ancient coral-stone monument and palmyra palms on Delft Island (Neduntheevu)",
  "nallur-kandaswamy-temple":
    "Nallur Kandaswamy Temple gopuram towers in Jaffna, Northern Province",
  "nagadeepa-nainativu":
    "Nagadeepa Purana Vihara Buddhist temple on sacred Nainativu island",
  mannar:
    "Talaimannar Lighthouse on the Mannar coast with turquoise sea and fishing boats",
  nilaveli:
    "Nilaveli Beach near Trincomalee with calm turquoise water on Sri Lanka's east coast",
  pasikuda:
    "Palm-fringed Pasikuda Bay with shallow turquoise water on the east coast",
  wilpattu:
    "Wilpattu National Park dry-zone forest and wildlife landscape in northwest Sri Lanka",
  minneriya:
    "Minneriya National Park reservoir and elephant gathering season landscape",
  udawalawe:
    "Tusker elephant walking across grasslands with a herd at Udawalawe National Park",
  tangalle:
    "Tangalle Beach on Sri Lanka's south coast with golden sand and ocean horizon",
  sinharaja:
    "Green pit viper among lush foliage in Sinharaja rainforest UNESCO reserve",
  mihintale:
    "Mihintale sacred rock steps and ancient Buddhist monastery near Anuradhapura",
  kalpitiya:
    "Spinner dolphins leaping in clear blue water off Kalpitiya on Sri Lanka's north-west coast",
  badulla:
    "Red train at Badulla railway station — scenic terminus of the hill-country line",
  ratnapura:
    "Adam's Peak (Sri Pada) rising above tea plantations in the Ratnapura gem country",
  "liptons-seat":
    "Rolling tea estates and mountain ridges viewed from Lipton's Seat near Haputale",
  "ayurveda-wellness":
    "Traditional Ayurvedic pinda sweda herbal poultice massage at a Sri Lankan wellness retreat",
  tissamaharama:
    "Tissamaharama Raja Maha Vihara white dagoba above green rice fields in southern Sri Lanka",
  batticaloa:
    "Batticaloa lagoon waterfront promenade with stone arches and calm blue water",
  munneswaram:
    "Colourful gopuram towers of Munneswaram Hindu temple against a bright blue sky",
  "horton-plains":
    "Sambar deer with antlers grazing on the misty grasslands of Horton Plains National Park",
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
