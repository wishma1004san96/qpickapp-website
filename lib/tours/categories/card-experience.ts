import type { TourCategoryId } from "../types";

export type CategoryCardExperience = {
  tagline: string;
  chips: string[];
};

export type CategoryExpandedContent = {
  emotionalHeading: string;
  description: string;
  bestSeason: string;
  duration: string;
  recommendedVehicle: string;
  popularDestinations: string;
};

export const CATEGORY_EXPANDED_CONTENT: Record<
  TourCategoryId,
  CategoryExpandedContent
> = {
  popular: {
    emotionalHeading: "Journeys worth the flight",
    description:
      "Editor-curated private circuits that balance heritage mornings, scenic drives, and unhurried evenings — the routes our planners recommend first.",
    bestSeason: "Dec – Apr",
    duration: "3–14 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Sigiriya • Galle • Ella",
  },
  "cultural-heritage": {
    emotionalHeading: "Walk through ancient kingdoms",
    description:
      "From rock fortresses rising from jungle to cave temples glowing with centuries of devotion — experience Sri Lanka’s UNESCO heartland at a pace that honours every stone.",
    bestSeason: "Dec – Apr",
    duration: "3–10 days",
    recommendedVehicle: "SUV",
    popularDestinations: "Sigiriya • Kandy • Anuradhapura",
  },
  "wildlife-safari": {
    emotionalHeading: "Feel the wild awaken",
    description:
      "Dawn mist over grasslands, leopard tracks in red earth, and elephant herds at waterholes — private chauffeur timing for the park gates when the island is most alive.",
    bestSeason: "Feb – Jul",
    duration: "4–12 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Yala • Wilpattu • Udawalawe",
  },
  "beach-holidays": {
    emotionalHeading: "Where golden light meets the ocean",
    description:
      "Southwest coves, whale-watching harbours, and east-coast serenity — coast-hopping without the stress, with your driver waiting in the shade.",
    bestSeason: "Nov – Apr",
    duration: "5–14 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Mirissa • Unawatuna • Arugam Bay",
  },
  "hill-country-tea": {
    emotionalHeading: "Mist, tea, and mountain air",
    description:
      "Cool highland mornings, plantation verandas, and ridge roads that unfurl through clouds — the Sri Lanka of postcards, paced for slow sipping and deep breaths.",
    bestSeason: "Jan – Apr",
    duration: "4–10 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Nuwara Eliya • Ella • Kandy",
  },
  adventure: {
    emotionalHeading: "Adrenaline with a safety net",
    description:
      "Rafting rapids, ridge hikes, and surf breaks — active days supported by a dedicated private driver who knows when to push forward and when to pause.",
    bestSeason: "Year-round",
    duration: "5–12 days",
    recommendedVehicle: "SUV",
    popularDestinations: "Kitulgala • Ella • Arugam Bay",
  },
  "train-journeys": {
    emotionalHeading: "Rails through tea country",
    description:
      "The iconic highland line weaving through emerald plantations — ride the scenic segments while your chauffeur moves luggage by road for seamless connections.",
    bestSeason: "Jan – Apr",
    duration: "4–10 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Ella • Nanu Oya • Kandy",
  },
  honeymoon: {
    emotionalHeading: "Romance at island pace",
    description:
      "Sunset coasts, misty tea country hideaways, and private dinners by the sea — intimate circuits designed for two, without rigid group schedules.",
    bestSeason: "Nov – Apr",
    duration: "7–14 days",
    recommendedVehicle: "SUV or Luxury Van",
    popularDestinations: "Bentota • Ella • Galle",
  },
  "luxury-escapes": {
    emotionalHeading: "Composed, unhurried elegance",
    description:
      "Quieter pacing, premium vehicle classes, and flexible photo stops — travel that feels considered, with every transfer handled before you think to ask.",
    bestSeason: "Dec – Apr",
    duration: "7–14 days",
    recommendedVehicle: "Luxury Van",
    popularDestinations: "Galle • Sigiriya • Nuwara Eliya",
  },
  family: {
    emotionalHeading: "Room for everyone to breathe",
    description:
      "Spacious vans, gentler daily distances, and child-friendly highlights — family holidays that flex when little legs need a break or ice cream appears.",
    bestSeason: "Dec – Apr",
    duration: "5–12 days",
    recommendedVehicle: "Van or Mini Coach",
    popularDestinations: "Sigiriya • Yala • Bentota",
  },
  "ayurveda-wellness": {
    emotionalHeading: "Restore body and rhythm",
    description:
      "Coastal recovery chapters and wellness retreats woven into private journeys — your chauffeur matches the calm of your programme, not the other way around.",
    bestSeason: "Nov – Apr",
    duration: "7–14 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Bentota • Mirissa • Kandy",
  },
  food: {
    emotionalHeading: "Taste every region",
    description:
      "Colombo’s spice-laden streets, hill-country tea with hopper breakfasts, and coastal seafood at sunset — culinary days between heritage and coast.",
    bestSeason: "Year-round",
    duration: "4–10 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Colombo • Kandy • Galle",
  },
  festival: {
    emotionalHeading: "Traditions that move you",
    description:
      "Kandy perahera seasons, temple festivals, and cultural calendars alive with drums and light — timed with private road support when crowds swell.",
    bestSeason: "Jul – Aug",
    duration: "5–10 days",
    recommendedVehicle: "SUV or Van",
    popularDestinations: "Kandy • Dambulla • Colombo",
  },
  "airport-transfers": {
    emotionalHeading: "Seamless from touchdown",
    description:
      "Meet-and-greet CMB arrivals, hotel corridors, and departure timing — the Q Pick chauffeur standard from the moment you land until wheels-up.",
    bestSeason: "Year-round",
    duration: "Same day",
    recommendedVehicle: "Sedan or SUV",
    popularDestinations: "CMB • Colombo • Negombo",
  },
  "custom-private": {
    emotionalHeading: "Your island, your pace",
    description:
      "Every published itinerary is a starting point — refine destinations, pacing, and vehicle with our planners until the route feels unmistakably yours.",
    bestSeason: "Flexible",
    duration: "Any length",
    recommendedVehicle: "Your choice",
    popularDestinations: "Anywhere on island",
  },
};

export const CATEGORY_CARD_EXPERIENCE: Record<
  TourCategoryId,
  CategoryCardExperience
> = {
  popular: {
    tagline: "Hand-picked escapes",
    chips: ["Editor's choice", "Private chauffeur", "Island highlights", "Curated pacing"],
  },
  "cultural-heritage": {
    tagline: "UNESCO Wonders",
    chips: ["Sigiriya • Kandy", "Ancient Kingdoms", "Timeless Sri Lanka", "Temple trails"],
  },
  "wildlife-safari": {
    tagline: "Feel the Wild",
    chips: ["Yala • Wilpattu", "Private Safari", "Best Season: Feb–Jul", "Dawn game drives"],
  },
  "beach-holidays": {
    tagline: "Golden Beaches",
    chips: ["Mirissa • Unawatuna", "Ocean Escape", "Sunset Experiences", "Coastal calm"],
  },
  "hill-country-tea": {
    tagline: "Tea Trails",
    chips: ["Scenic Train", "Cool Climate", "Nuwara Eliya", "Misty viewpoints"],
  },
  adventure: {
    tagline: "Thrills & Heights",
    chips: ["White Water Rafting", "Hiking", "Zipline", "Outdoor Experiences"],
  },
  "train-journeys": {
    tagline: "Rails through mist",
    chips: ["Nine Arches Bridge", "Ella • Nanu Oya", "Tea country views", "Luggage by road"],
  },
  honeymoon: {
    tagline: "Romance reimagined",
    chips: ["Sunset coasts", "Private villas", "Tea country mist", "Unhurried days"],
  },
  "luxury-escapes": {
    tagline: "Composed elegance",
    chips: ["Premium vehicles", "Quieter pacing", "Galle Fort", "Photo-ready stops"],
  },
  family: {
    tagline: "Room for everyone",
    chips: ["Spacious vans", "Gentle distances", "Kid-friendly stops", "Flexible days"],
  },
  "ayurveda-wellness": {
    tagline: "Restore & renew",
    chips: ["Coastal retreats", "Wellness pacing", "Bentota calm", "Holistic journeys"],
  },
  food: {
    tagline: "Taste the island",
    chips: ["Colombo dining", "Spice gardens", "Regional kitchens", "Culinary days"],
  },
  festival: {
    tagline: "Living traditions",
    chips: ["Kandy Perahera", "Temple festivals", "Cultural calendar", "Evening processions"],
  },
  "airport-transfers": {
    tagline: "Seamless arrivals",
    chips: ["CMB meet & greet", "Hotel corridors", "Flight timing", "Q Pick standard"],
  },
  "custom-private": {
    tagline: "Your island, your pace",
    chips: ["Bespoke routing", "Any duration", "Planner support", "Written quotes"],
  },
};

export const ALL_CATEGORIES_EXPERIENCE: CategoryCardExperience = {
  tagline: "Every journey awaits",
  chips: ["Full collection", "Private tours", "All styles", "Reset & explore"],
};
