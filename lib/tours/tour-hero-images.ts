/** Premium tour card heroes — unique multi-day images and location-specific day tours. */
export const TOUR_HERO_IMAGES = {
  "hero-cultural-triangle": {
    src: "/images/tours/gal-vihara-polonnaruwa.webp",
    alt: "Gal Vihara reclining Buddha statues in ancient Polonnaruwa, Sri Lanka Cultural Triangle private tour",
  },
  "hero-hill-country-escape": {
    src: "/images/tours/nine-arches-bridge-ella.webp",
    alt: "Nine Arches Bridge in Ella with blue train crossing Sri Lanka hill country tea valleys",
  },
  "hero-best-of-sri-lanka": {
    src: "/images/tours/galle-fort-lighthouse.webp",
    alt: "Galle Fort Lighthouse on Dutch ramparts overlooking the Indian Ocean, Best of Sri Lanka tour",
  },
  "hero-wildlife-adventure": {
    src: "/images/tours/yala-leopard-safari.webp",
    alt: "Sri Lankan leopard at a waterhole in Yala National Park wildlife safari tour",
  },
  "hero-complete-sri-lanka": {
    src: "/images/tours/pidurangala-sigiriya.webp",
    alt: "Pidurangala Rock viewpoint facing Sigiriya Lion Rock fortress at sunrise, Complete Sri Lanka tour",
  },
  "hero-grand-explorer": {
    src: "/images/tours/jaffna-fort-aerial.webp",
    alt: "Historic Jaffna Fort ramparts and lagoon on Sri Lanka's northern peninsula, Grand Explorer tour",
  },
  "hero-ella-train-escape": {
    src: "/images/tours/ella-rock-viewpoint.webp",
    alt: "Ella Rock summit viewpoint above misty tea valleys on the Ella Train Escape private tour",
  },
  "hero-mirissa-whale-coast": {
    src: "/images/tours/mirissa-southern-coast.webp",
    alt: "Mirissa Beach turquoise waters on Sri Lanka's southern coast whale watching tour",
  },
  "hero-luxury-honeymoon-coast": {
    src: "/images/tours/bentota-luxury-coast.webp",
    alt: "Bentota Beach palm-lined shoreline on a luxury honeymoon coast private tour Sri Lanka",
  },
  "hero-pilgrimage-triangle": {
    src: "/images/tours/sri-maha-bodhi-anuradhapura.webp",
    alt: "Sacred Sri Maha Bodhi tree in Anuradhapura on a Pilgrimage Triangle private tour",
  },
  "hero-festival-culture-kandy": {
    src: "/images/tours/temple-of-the-tooth-kandy.webp",
    alt: "Temple of the Sacred Tooth Relic in Kandy during festival culture private tour Sri Lanka",
  },
  "hero-honeymoon-paradise": {
    src: "/images/tours/liptons-seat-tea-country.webp",
    alt: "Lipton's Seat panoramic tea plantation viewpoint in Sri Lanka hill country honeymoon tour",
  },
  "hero-ayurveda-wellness": {
    src: "/images/tours/ayurveda-wellness-treatment.webp",
    alt: "Traditional Ayurveda herbal wellness treatment on a restorative Sri Lanka private journey",
  },
  "hero-day-colombo": {
    src: "/images/tours/colombo-lotus-tower.webp",
    alt: "Colombo skyline with Lotus Tower above Beira Lake on a capital discovery day tour",
  },
  "hero-day-galle": {
    src: "/images/tours/galle-fort-lighthouse.webp",
    alt: "Galle Fort lighthouse and Dutch ramparts on a southern heritage day tour Sri Lanka",
  },
  "hero-day-sigiriya": {
    src: "/images/tours/sigiriya-rock-fortress.webp",
    alt: "Sigiriya Rock Fortress rising above tropical forest on a sunrise day tour Sri Lanka",
  },
  "hero-day-kandy": {
    src: "/images/tours/temple-of-the-tooth-kandy.webp",
    alt: "Temple of the Sacred Tooth Relic beside Kandy Lake on a sacred city day tour",
  },
  "hero-day-ella": {
    src: "/images/tours/nine-arches-bridge-ella.webp",
    alt: "Nine Arches Bridge and Ella highland valleys on a hill country views day tour",
  },
  "hero-day-yala": {
    src: "/images/tours/yala-leopard-safari.webp",
    alt: "Leopard in Yala National Park on a private wildlife safari day tour Sri Lanka",
  },
  "hero-day-anuradhapura": {
    src: "/images/tours/anuradhapura-sacred-city.webp",
    alt: "Ancient stupas and sacred ruins in Anuradhapura on a sacred trail day tour",
  },
  "hero-day-mirissa": {
    src: "/images/tours/mirissa-southern-coast.webp",
    alt: "Mirissa Beach coconut coves on a southern coast whale season day tour",
  },
  "hero-jaffna-heritage-city": {
    src: "/images/tours/jaffna-fort-aerial.webp",
    alt: "Jaffna Fort ramparts and lagoon on a private heritage city tour in northern Sri Lanka",
  },
  "hero-delft-island-adventure": {
    src: "/images/tours/delft-island-coral-beach.webp",
    alt: "Coral shoreline and turquoise shallows near Delft Island off Sri Lanka's Jaffna peninsula",
  },
  "hero-nainativu-sacred-island": {
    src: "/images/tours/nainativu-sacred-island.webp",
    alt: "Sacred island temples at Nainativu reached by boat from Sri Lanka's northern coast",
  },
} as const;

export type TourHeroImageId = keyof typeof TOUR_HERO_IMAGES;

export function getTourHeroImageSrc(id: TourHeroImageId): string {
  return TOUR_HERO_IMAGES[id].src;
}
