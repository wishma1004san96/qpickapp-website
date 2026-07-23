/**
 * Generates lib/tours/packages/catalog.ts — original Q Pick tour catalogue.
 * Run: node scripts/generate-tour-catalog.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const DEST_NAMES = {
  negombo: "Negombo",
  colombo: "Colombo",
  sigiriya: "Sigiriya",
  dambulla: "Dambulla",
  kandy: "Kandy",
  "nuwara-eliya": "Nuwara Eliya",
  ella: "Ella",
  yala: "Yala",
  galle: "Galle",
  mirissa: "Mirissa",
  bentota: "Bentota",
  trincomalee: "Trincomalee",
  anuradhapura: "Anuradhapura",
  polonnaruwa: "Polonnaruwa",
  "arugam-bay": "Arugam Bay",
};

/** @type {Array<{
 *   slug: string;
 *   title: string;
 *   days: number;
 *   dests: string[];
 *   cats: string[];
 *   vehicle: string;
 *   badge?: string;
 *   idealFor: string;
 *   vehicles: string[];
 *   popular?: boolean;
 *   featuredRank?: number;
 *   publishedAt: string;
 *   theme: string;
 *   highlights: string[];
 * }>} */
const TOURS = [
  // Day tours
  { slug: "colombo-capital-discovery-day", title: "Colombo Capital Discovery Day", days: 1, dests: ["colombo"], cats: ["day-tours", "classic-sri-lanka", "food", "private-chauffeur", "custom-private"], vehicle: "sedan", idealFor: "Layover guests and city lovers", vehicles: ["sedan", "suv"], publishedAt: "2026-03-01", theme: "Colombo skyline, colonial lanes, and Galle Face sunsets", highlights: ["Lotus Tower viewpoints", "Galle Face Green", "Colombo dining stops"] },
  { slug: "galle-fort-heritage-day", title: "Galle Fort Heritage Day", days: 1, dests: ["galle"], cats: ["day-tours", "cultural-heritage", "beach-holidays", "custom-private"], vehicle: "sedan", idealFor: "History enthusiasts on the south coast", vehicles: ["sedan", "suv"], publishedAt: "2026-03-02", theme: "Dutch ramparts and Indian Ocean light", highlights: ["Galle Fort lighthouse", "Rampart walk", "Boutique streets"] },
  { slug: "sigiriya-rock-sunrise-day", title: "Sigiriya Rock Sunrise Day", days: 1, dests: ["sigiriya"], cats: ["day-tours", "cultural-heritage", "classic-sri-lanka", "photography-tours", "custom-private"], vehicle: "suv", badge: "adventure", idealFor: "Early risers and photography guests", vehicles: ["suv", "van"], publishedAt: "2026-03-03", theme: "Lion Rock at first light", highlights: ["Sigiriya summit", "Water gardens", "Fresco gallery"] },
  { slug: "kandy-sacred-city-day", title: "Kandy Sacred City Day", days: 1, dests: ["kandy"], cats: ["day-tours", "cultural-heritage", "pilgrimage", "custom-private"], vehicle: "sedan", idealFor: "Spiritual travellers and families", vehicles: ["sedan", "suv"], publishedAt: "2026-03-04", theme: "Temple of the Tooth and lake calm", highlights: ["Temple of the Tooth", "Kandy Lake", "Peradeniya option"] },
  { slug: "ella-highland-views-day", title: "Ella Highland Views Day", days: 1, dests: ["ella"], cats: ["day-tours", "hill-country-tea", "adventure", "photography-tours", "custom-private"], vehicle: "suv", idealFor: "Train stopovers and ridge walkers", vehicles: ["suv", "van"], publishedAt: "2026-03-05", theme: "Nine Arches and misty valleys", highlights: ["Nine Arches Bridge", "Little Adam's Peak", "Tea valley cafés"] },
  { slug: "negombo-lagoon-arrival-day", title: "Negombo Lagoon Arrival Day", days: 1, dests: ["negombo"], cats: ["day-tours", "classic-sri-lanka", "private-chauffeur", "custom-private"], vehicle: "sedan", idealFor: "Post-flight relaxation near CMB", vehicles: ["sedan", "suv", "van"], publishedAt: "2026-03-06", theme: "Canals, beach, and harbour colour", highlights: ["Lagoon cruise option", "Fish market", "Beach sunset"] },
  { slug: "anuradhapura-sacred-trail-day", title: "Anuradhapura Sacred Trail Day", days: 1, dests: ["anuradhapura"], cats: ["day-tours", "cultural-heritage", "pilgrimage", "custom-private"], vehicle: "suv", idealFor: "Buddhist heritage pilgrims", vehicles: ["suv", "van"], publishedAt: "2026-03-07", theme: "Ancient stupas and bodhi traditions", highlights: ["Ruwanwelisaya", "Sacred Bodhi tree", "Monastery ruins"] },
  { slug: "bentota-river-coast-day", title: "Bentota River & Coast Day", days: 1, dests: ["bentota"], cats: ["day-tours", "beach-holidays", "family", "custom-private"], vehicle: "sedan", badge: "family-friendly", idealFor: "Families wanting gentle water time", vehicles: ["sedan", "suv", "van"], publishedAt: "2026-03-08", theme: "River estuary and golden sand", highlights: ["Madu River option", "Bentota Beach", "Water sports window"] },
  { slug: "mirissa-southern-coast-day", title: "Mirissa Southern Coast Day", days: 1, dests: ["mirissa"], cats: ["day-tours", "beach-holidays", "wildlife-safari", "custom-private"], vehicle: "sedan", idealFor: "Whale season visitors", vehicles: ["sedan", "suv"], publishedAt: "2026-03-09", theme: "Coconut coves and ocean horizons", highlights: ["Mirissa Beach", "Coconut Hill", "Whale watching season"] },
  { slug: "dambulla-cave-temple-day", title: "Dambulla Cave Temple Day", days: 1, dests: ["dambulla"], cats: ["day-tours", "cultural-heritage", "pilgrimage", "custom-private"], vehicle: "suv", idealFor: "Art and temple enthusiasts", vehicles: ["suv", "van"], publishedAt: "2026-03-10", theme: "Painted caves above the plains", highlights: ["Cave murals", "Golden Temple", "Panoramic viewpoint"] },
  { slug: "yala-wildlife-safari-day", title: "Yala Wildlife Safari Day", days: 1, dests: ["yala"], cats: ["day-tours", "wildlife-safari", "photography-tours", "custom-private"], vehicle: "suv", badge: "adventure", idealFor: "Safari enthusiasts with tight schedules", vehicles: ["suv", "van"], publishedAt: "2026-03-11", theme: "Leopard country at dawn", highlights: ["Jeep safari window", "Dry-zone lagoons", "Birdlife"] },
  { slug: "nuwara-eliya-tea-country-day", title: "Nuwara Eliya Tea Country Day", days: 1, dests: ["nuwara-eliya"], cats: ["day-tours", "tea-country", "hill-country-tea", "custom-private"], vehicle: "suv", idealFor: "Tea lovers and cool-climate fans", vehicles: ["suv", "van"], publishedAt: "2026-03-12", theme: "Plantations and Gregory Lake mist", highlights: ["Tea factory visit", "Gregory Lake", "Highland viewpoints"] },

  // Short breaks 2–3 days
  { slug: "sigiriya-dambulla-heritage-weekend", title: "Sigiriya & Dambulla Heritage Weekend", days: 2, dests: ["sigiriya", "dambulla"], cats: ["classic-sri-lanka", "cultural-heritage", "family", "custom-private"], vehicle: "suv", popular: true, featuredRank: 12, idealFor: "Weekend heritage escapes", vehicles: ["suv", "van"], publishedAt: "2026-02-20", theme: "Rock fortress and cave temples", highlights: ["Sigiriya climb", "Dambulla caves", "Private chauffeur"] },
  { slug: "galle-mirissa-southern-weekend", title: "Galle & Mirissa Southern Weekend", days: 2, dests: ["galle", "mirissa"], cats: ["beach-holidays", "classic-sri-lanka", "honeymoon", "custom-private"], vehicle: "sedan", idealFor: "Coastal couples and friends", vehicles: ["sedan", "suv"], publishedAt: "2026-02-21", theme: "Fort heritage and beach calm", highlights: ["Galle Fort", "Mirissa cove", "Sunset dining"] },
  { slug: "kandy-ella-highland-weekend", title: "Kandy to Ella Highland Weekend", days: 3, dests: ["kandy", "nuwara-eliya", "ella"], cats: ["hill-country-tea", "train-journeys", "classic-sri-lanka", "custom-private"], vehicle: "suv", badge: "best-seller", popular: true, featuredRank: 8, idealFor: "Tea country first-timers", vehicles: ["suv", "van"], publishedAt: "2026-02-15", theme: "Temple city to ridge railways", highlights: ["Kandy Temple", "Tea estates", "Nine Arches Bridge"] },
  { slug: "yala-beach-wildlife-weekend", title: "Yala & Beach Wildlife Weekend", days: 3, dests: ["yala", "mirissa"], cats: ["wildlife-safari", "beach-holidays", "adventure", "custom-private"], vehicle: "suv", idealFor: "Nature lovers wanting coast time", vehicles: ["suv", "van"], publishedAt: "2026-02-22", theme: "Safari dawn and ocean afternoons", highlights: ["Yala jeep safari", "Southern beaches", "Flexible pacing"] },
  { slug: "colombo-negombo-gateway-break", title: "Colombo & Negombo Gateway Break", days: 2, dests: ["colombo", "negombo"], cats: ["classic-sri-lanka", "private-chauffeur", "food", "custom-private"], vehicle: "sedan", idealFor: "Arrival buffer before longer tours", vehicles: ["sedan", "suv", "van"], publishedAt: "2026-02-18", theme: "Capital culture and lagoon ease", highlights: ["Colombo highlights", "Negombo lagoon", "Airport proximity"] },
  { slug: "anuradhapura-pilgrimage-retreat", title: "Anuradhapura Pilgrimage Retreat", days: 3, dests: ["anuradhapura", "dambulla"], cats: ["pilgrimage", "cultural-heritage", "classic-sri-lanka", "custom-private"], vehicle: "suv", idealFor: "Devotional travellers", vehicles: ["suv", "van"], publishedAt: "2026-02-25", theme: "Sacred cities at reflective pace", highlights: ["Anuradhapura stupas", "Dambulla caves", "Quiet temple mornings"] },
  { slug: "polonnaruwa-medieval-escape", title: "Polonnaruwa Medieval Kingdom Escape", days: 2, dests: ["polonnaruwa", "sigiriya"], cats: ["cultural-heritage", "classic-sri-lanka", "photography-tours", "custom-private"], vehicle: "suv", idealFor: "History photographers", vehicles: ["suv", "van"], publishedAt: "2026-02-26", theme: "Gal Vihara and rock vistas", highlights: ["Polonnaruwa ruins", "Sigiriya option", "Archaeological parks"] },
  { slug: "bentota-wellness-coast-break", title: "Bentota Wellness Coast Break", days: 3, dests: ["bentota", "galle"], cats: ["ayurveda-wellness", "beach-holidays", "luxury-escapes", "custom-private"], vehicle: "suv", badge: "luxury", idealFor: "Wellness and spa guests", vehicles: ["suv", "luxuryVan"], publishedAt: "2026-02-28", theme: "Recovery by the Indian Ocean", highlights: ["Ayurveda-friendly pacing", "Bentota calm", "Galle Fort evening"] },

  // Classic 4–6 day circuits
  { slug: "4-days-classic-triangle-kandy", title: "4 Days Classic Triangle & Kandy", days: 4, dests: ["negombo", "sigiriya", "dambulla", "kandy"], cats: ["classic-sri-lanka", "cultural-heritage", "family", "custom-private"], vehicle: "suv", popular: true, featuredRank: 15, idealFor: "First-time island visitors", vehicles: ["suv", "van"], publishedAt: "2026-01-20", theme: "Heritage heartland with royal Kandy", highlights: ["Sigiriya Rock", "Dambulla caves", "Temple of the Tooth"] },
  { slug: "4-days-southern-heritage-coast", title: "4 Days Southern Heritage Coast", days: 4, dests: ["colombo", "galle", "mirissa", "bentota"], cats: ["beach-holidays", "classic-sri-lanka", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Sun-seekers with culture", vehicles: ["suv", "van"], publishedAt: "2026-01-22", theme: "Fort streets and palm-lined bays", highlights: ["Galle Fort", "Mirissa coast", "Bentota leisure"] },
  { slug: "5-days-wildlife-tea-trails", title: "5 Days Wildlife & Tea Trails", days: 5, dests: ["kandy", "nuwara-eliya", "ella", "yala"], cats: ["wildlife-safari", "hill-country-tea", "classic-sri-lanka", "custom-private"], vehicle: "suv", badge: "eco", idealFor: "Nature and plantation lovers", vehicles: ["suv", "van"], publishedAt: "2026-01-25", theme: "Highland mist to leopard plains", highlights: ["Tea country", "Ella ridges", "Yala safari"] },
  { slug: "5-days-romantic-hill-country", title: "5 Days Romantic Hill Country", days: 5, dests: ["kandy", "nuwara-eliya", "ella", "bentota"], cats: ["honeymoon", "hill-country-tea", "luxury-escapes", "custom-private"], vehicle: "suv", badge: "luxury", idealFor: "Couples and anniversaries", vehicles: ["suv", "luxuryVan"], publishedAt: "2026-01-28", theme: "Misty mornings and ocean sunsets", highlights: ["Private pacing", "Tea estate stops", "Coastal finale"] },
  { slug: "6-days-family-discovery", title: "6 Days Family Discovery Circuit", days: 6, dests: ["negombo", "sigiriya", "kandy", "ella", "bentota"], cats: ["family", "classic-sri-lanka", "adventure", "custom-private"], vehicle: "van", badge: "family-friendly", popular: true, featuredRank: 20, idealFor: "Families with children", vehicles: ["van", "suv"], publishedAt: "2026-01-30", theme: "Gentle distances and varied highlights", highlights: ["Sigiriya adventure", "Kandy culture", "Beach finale"] },
  { slug: "6-days-photography-island", title: "6 Days Photography Island Circuit", days: 6, dests: ["sigiriya", "kandy", "ella", "galle", "mirissa"], cats: ["photography-tours", "classic-sri-lanka", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Photographers and content creators", vehicles: ["suv", "van"], publishedAt: "2026-02-01", theme: "Golden-hour routing with local insight", highlights: ["Sigiriya light", "Nine Arches", "Galle ramparts"] },
  { slug: "6-days-birding-wildlife", title: "6 Days Birding & Wildlife Trail", days: 6, dests: ["negombo", "sigiriya", "yala", "mirissa"], cats: ["bird-watching", "wildlife-safari", "custom-private"], vehicle: "suv", badge: "eco", idealFor: "Birders and naturalists", vehicles: ["suv", "van"], publishedAt: "2026-02-03", theme: "Wetlands, dry zone, and coast", highlights: ["Muthurajawela option", "Yala dawn drives", "Coastal birdlife"] },
  { slug: "5-days-spice-food-trail", title: "5 Days Spice & Food Trail", days: 5, dests: ["colombo", "kandy", "galle", "mirissa"], cats: ["food", "classic-sri-lanka", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Culinary travellers", vehicles: ["suv", "van"], publishedAt: "2026-02-05", theme: "Markets, spice gardens, and coastal kitchens", highlights: ["Colombo dining", "Kandy flavours", "Southern seafood"] },
  { slug: "4-days-luxury-south-coast", title: "4 Days Luxury South Coast", days: 4, dests: ["colombo", "galle", "bentota"], cats: ["luxury-escapes", "beach-holidays", "private-chauffeur", "custom-private"], vehicle: "luxuryVan", badge: "luxury", idealFor: "Premium coastal travellers", vehicles: ["luxuryVan", "suv"], publishedAt: "2026-02-07", theme: "Composed transfers and fort elegance", highlights: ["Luxury vehicle class", "Galle Fort", "Bentota resorts"] },
  { slug: "5-days-train-tea-country", title: "5 Days Scenic Train & Tea Country", days: 5, dests: ["kandy", "nuwara-eliya", "ella"], cats: ["train-journeys", "tea-country", "hill-country-tea", "custom-private"], vehicle: "suv", idealFor: "Rail enthusiasts", vehicles: ["suv", "van"], publishedAt: "2026-02-09", theme: "Highland line with luggage by road", highlights: ["Scenic rail segment", "Tea factories", "Ella viewpoints"] },

  // Signature 7–10 day journeys
  { slug: "7-day-sri-lanka-discovery-journey", title: "7 Days Sri Lanka Discovery Journey", days: 7, dests: ["negombo", "sigiriya", "kandy", "ella", "yala", "galle", "mirissa"], cats: ["classic-sri-lanka", "popular", "family", "custom-private"], vehicle: "suv", badge: "best-seller", popular: true, featuredRank: 2, idealFor: "International first visits", vehicles: ["sedan", "suv", "van", "luxuryVan"], publishedAt: "2026-01-10", theme: "Kingdoms, highlands, wildlife, and golden beaches", highlights: ["Sigiriya", "Kandy", "Ella", "Yala", "Galle", "Mirissa"] },
  { slug: "7-days-luxury-island-essentials", title: "7 Days Luxury Island Essentials", days: 7, dests: ["colombo", "sigiriya", "kandy", "nuwara-eliya", "galle", "bentota"], cats: ["luxury-escapes", "classic-sri-lanka", "private-chauffeur", "custom-private"], vehicle: "luxuryVan", badge: "luxury", popular: true, featuredRank: 5, idealFor: "Discerning couples and small groups", vehicles: ["suv", "luxuryVan"], publishedAt: "2026-01-12", theme: "Premium pacing without crowds", highlights: ["Luxury transfers", "Heritage icons", "Tea country", "Fort coast"] },
  { slug: "8-days-wildlife-coast-adventure", title: "8 Days Wildlife & Coast Adventure", days: 8, dests: ["negombo", "sigiriya", "yala", "mirissa", "galle", "bentota"], cats: ["wildlife-safari", "adventure", "beach-holidays", "custom-private"], vehicle: "suv", badge: "adventure", idealFor: "Active travellers", vehicles: ["suv", "van"], publishedAt: "2026-01-14", theme: "Safari mornings and surf-ready afternoons", highlights: ["Yala leopards", "Southern beaches", "Galle Fort"] },
  { slug: "8-days-cultural-immersion", title: "8 Days Cultural Immersion Journey", days: 8, dests: ["anuradhapura", "polonnaruwa", "sigiriya", "dambulla", "kandy", "colombo"], cats: ["cultural-heritage", "pilgrimage", "classic-sri-lanka", "custom-private"], vehicle: "suv", idealFor: "Deep heritage enthusiasts", vehicles: ["suv", "van", "miniCoach"], publishedAt: "2026-01-16", theme: "UNESCO chapters without rush", highlights: ["Ancient cities", "Rock fortress", "Living traditions"] },
  { slug: "9-days-honeymoon-paradise", title: "9 Days Honeymoon Paradise", days: 9, dests: ["negombo", "kandy", "nuwara-eliya", "ella", "bentota", "galle"], cats: ["honeymoon", "luxury-escapes", "hill-country-tea", "custom-private"], vehicle: "suv", badge: "luxury", popular: true, featuredRank: 10, idealFor: "Newlyweds and romantic escapes", vehicles: ["suv", "luxuryVan"], publishedAt: "2026-01-18", theme: "Intimate pacing through mist and ocean", highlights: ["Tea country", "Ella romance", "Coastal sunsets"] },
  { slug: "9-days-family-island-fun", title: "9 Days Family Island Fun", days: 9, dests: ["negombo", "sigiriya", "kandy", "ella", "yala", "bentota"], cats: ["family", "classic-sri-lanka", "wildlife-safari", "custom-private"], vehicle: "van", badge: "family-friendly", idealFor: "Multi-generational families", vehicles: ["van", "suv", "miniCoach"], publishedAt: "2026-01-20", theme: "Room for everyone to breathe", highlights: ["Spacious van", "Safari excitement", "Beach finale"] },
  { slug: "10-days-ayurveda-wellness-journey", title: "10 Days Ayurveda Wellness Journey", days: 10, dests: ["negombo", "kandy", "bentota", "mirissa", "galle"], cats: ["ayurveda-wellness", "luxury-escapes", "beach-holidays", "custom-private"], vehicle: "suv", idealFor: "Wellness-focused travellers", vehicles: ["suv", "luxuryVan"], publishedAt: "2026-01-22", theme: "Recovery chapters woven into private travel", highlights: ["Wellness pacing", "Coastal calm", "Temple balance"] },
  { slug: "10-days-photo-expedition", title: "10 Days Photo Expedition", days: 10, dests: ["sigiriya", "anuradhapura", "kandy", "nuwara-eliya", "ella", "yala", "galle"], cats: ["photography-tours", "wildlife-safari", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Serious photographers", vehicles: ["suv", "van"], publishedAt: "2026-01-24", theme: "Light-aware routing across the island", highlights: ["Dawn shoots", "Wildlife windows", "Coastal blue hour"] },
  { slug: "10-days-east-south-surf-circuit", title: "10 Days East & South Surf Circuit", days: 10, dests: ["colombo", "arugam-bay", "trincomalee", "mirissa", "galle"], cats: ["adventure", "beach-holidays", "custom-private"], vehicle: "suv", badge: "adventure", idealFor: "Surfers and ocean adventurers", vehicles: ["suv", "van"], publishedAt: "2026-01-26", theme: "Seasonal east breaks and south swells", highlights: ["Arugam Bay", "Trincomalee", "Mirissa"] },
  { slug: "7-days-pilgrimage-sacred-island", title: "7 Days Pilgrimage Sacred Island", days: 7, dests: ["colombo", "kandy", "anuradhapura", "dambulla", "polonnaruwa"], cats: ["pilgrimage", "cultural-heritage", "classic-sri-lanka", "custom-private"], vehicle: "suv", idealFor: "Spiritual group travel", vehicles: ["suv", "van", "miniCoach"], publishedAt: "2026-01-28", theme: "Temples, stupas, and devotional calm", highlights: ["Sacred Bodhi", "Cave temples", "Ancient stupas"] },

  // Extended 11–18 day journeys
  { slug: "11-days-tea-train-grand-tour", title: "11 Days Tea & Train Grand Tour", days: 11, dests: ["colombo", "kandy", "nuwara-eliya", "ella", "yala", "galle", "bentota"], cats: ["train-journeys", "tea-country", "classic-sri-lanka", "custom-private"], vehicle: "suv", idealFor: "Rail and plantation enthusiasts", vehicles: ["suv", "van"], publishedAt: "2025-12-10", theme: "Rails, estates, and southern calm", highlights: ["Highland train", "Tea tastings", "Fort coast"] },
  { slug: "12-days-birding-grand-circuit", title: "12 Days Birding Grand Circuit", days: 12, dests: ["negombo", "sigiriya", "kandy", "nuwara-eliya", "yala", "mirissa", "galle"], cats: ["bird-watching", "wildlife-safari", "hill-country-tea", "custom-private"], vehicle: "suv", badge: "eco", idealFor: "Dedicated birdwatchers", vehicles: ["suv", "van"], publishedAt: "2025-12-12", theme: "Wetland to dry zone species", highlights: ["Specialist pacing", "Dawn hides", "Coastal migrants"] },
  { slug: "12-days-luxury-grand-tour", title: "12 Days Luxury Grand Tour", days: 12, dests: ["colombo", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "galle", "bentota"], cats: ["luxury-escapes", "classic-sri-lanka", "private-chauffeur", "custom-private"], vehicle: "luxuryVan", badge: "luxury", popular: true, featuredRank: 12, idealFor: "Premium international guests", vehicles: ["luxuryVan", "suv"], publishedAt: "2025-12-14", theme: "Unhurried elegance across the island", highlights: ["Premium vehicle", "Heritage", "Wildlife", "Coast"] },
  { slug: "13-days-family-adventure-island", title: "13 Days Family Adventure Island", days: 13, dests: ["negombo", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "mirissa", "bentota"], cats: ["family", "adventure", "classic-sri-lanka", "custom-private"], vehicle: "van", badge: "family-friendly", idealFor: "Families wanting variety", vehicles: ["van", "miniCoach"], publishedAt: "2025-12-16", theme: "Active days with comfortable transfers", highlights: ["Van space", "Safari", "Beach play"] },
  { slug: "14-days-north-south-explorer", title: "14 Days North to South Explorer", days: 14, dests: ["negombo", "anuradhapura", "sigiriya", "kandy", "ella", "yala", "galle", "mirissa", "trincomalee"], cats: ["classic-sri-lanka", "cultural-heritage", "beach-holidays", "custom-private"], vehicle: "van", popular: true, featuredRank: 18, idealFor: "Comprehensive island first-timers", vehicles: ["suv", "van"], publishedAt: "2025-12-01", theme: "Full island breadth with seasonal routing", highlights: ["Ancient north", "Highlands", "East option", "South coast"] },
  { slug: "15-days-wellness-heritage-coast", title: "15 Days Wellness Heritage & Coast", days: 15, dests: ["colombo", "kandy", "sigiriya", "bentota", "mirissa", "galle", "negombo"], cats: ["ayurveda-wellness", "cultural-heritage", "beach-holidays", "custom-private"], vehicle: "suv", idealFor: "Long-stay wellness guests", vehicles: ["suv", "luxuryVan"], publishedAt: "2025-12-18", theme: "Restore between heritage chapters", highlights: ["Ayurveda pacing", "UNESCO sites", "Ocean recovery"] },
  { slug: "16-days-photography-masterclass", title: "16 Days Photography Masterclass", days: 16, dests: ["colombo", "anuradhapura", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "galle", "mirissa", "arugam-bay"], cats: ["photography-tours", "classic-sri-lanka", "wildlife-safari", "custom-private"], vehicle: "suv", idealFor: "Professional photographers", vehicles: ["suv", "van"], publishedAt: "2025-12-20", theme: "Extended light hunting across regions", highlights: ["Multi-region shoots", "Wildlife", "Coast and east"] },
  { slug: "18-days-private-chauffeur-grand", title: "18 Days Private Chauffeur Grand Circuit", days: 18, dests: ["negombo", "anuradhapura", "polonnaruwa", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "mirissa", "galle", "bentota", "colombo"], cats: ["private-chauffeur", "classic-sri-lanka", "luxury-escapes", "custom-private"], vehicle: "van", badge: "luxury", idealFor: "Guests wanting full chauffeur service", vehicles: ["suv", "van", "luxuryVan"], publishedAt: "2025-11-28", theme: "Dedicated driver across every region", highlights: ["Full chauffeur", "All regions", "Flexible pacing"] },

  // Cruise & specialty
  { slug: "colombo-cruise-shore-excursion", title: "Colombo Cruise Shore Excursion", days: 1, dests: ["colombo"], cats: ["cruise-excursions", "day-tours", "classic-sri-lanka", "custom-private"], vehicle: "van", idealFor: "Cruise passengers at Colombo port", vehicles: ["van", "miniCoach", "suv"], publishedAt: "2026-03-15", theme: "Highlights before ship departure", highlights: ["Port pickup", "City highlights", "Timed return"] },
  { slug: "galle-cruise-fort-excursion", title: "Galle Cruise Fort Excursion", days: 1, dests: ["galle"], cats: ["cruise-excursions", "day-tours", "cultural-heritage", "custom-private"], vehicle: "van", idealFor: "Southern port calls", vehicles: ["van", "suv"], publishedAt: "2026-03-16", theme: "Fort ramparts within ship hours", highlights: ["Galle Fort", "Rampart walk", "Harbour timing"] },
  { slug: "trincomalee-east-coast-discovery", title: "Trincomalee East Coast Discovery", days: 4, dests: ["trincomalee", "sigiriya", "kandy"], cats: ["beach-holidays", "classic-sri-lanka", "custom-private"], vehicle: "suv", idealFor: "East coast season travellers", vehicles: ["suv", "van"], publishedAt: "2026-02-12", theme: "Nilaveli calm and cultural contrast", highlights: ["Trincomalee beaches", "Snorkel season", "Triangle option"] },
  { slug: "arugam-bay-surf-escape", title: "Arugam Bay Surf Escape", days: 5, dests: ["arugam-bay", "yala", "mirissa"], cats: ["adventure", "beach-holidays", "custom-private"], vehicle: "suv", badge: "adventure", idealFor: "Surfers and beach nomads", vehicles: ["suv", "van"], publishedAt: "2026-02-14", theme: "East swells and south coast contrast", highlights: ["Arugam breaks", "Yala option", "Mirissa"] },

  // Additional catalogue depth to reach 70+
  { slug: "3-days-negombo-beach-escape", title: "3 Days Negombo Beach Escape", days: 3, dests: ["negombo", "colombo"], cats: ["beach-holidays", "classic-sri-lanka", "custom-private"], vehicle: "sedan", idealFor: "Short beach breaks near airport", vehicles: ["sedan", "suv"], publishedAt: "2026-02-16", theme: "Lagoon life and easy arrivals", highlights: ["Negombo Beach", "Colombo option", "Airport ease"] },
  { slug: "4-days-kandy-tea-escape", title: "4 Days Kandy & Tea Escape", days: 4, dests: ["kandy", "nuwara-eliya", "ella"], cats: ["tea-country", "hill-country-tea", "custom-private"], vehicle: "suv", idealFor: "Tea enthusiasts", vehicles: ["suv", "van"], publishedAt: "2026-02-17", theme: "Temple city to plantation mist", highlights: ["Kandy", "Tea estates", "Ella views"] },
  { slug: "5-days-sigiriya-wildlife-loop", title: "5 Days Sigiriya & Wildlife Loop", days: 5, dests: ["sigiriya", "dambulla", "yala", "mirissa"], cats: ["wildlife-safari", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Culture plus safari combos", vehicles: ["suv", "van"], publishedAt: "2026-02-19", theme: "Rock heritage to leopard plains", highlights: ["Sigiriya", "Yala safari", "Southern coast"] },
  { slug: "6-days-luxury-honeymoon-coast", title: "6 Days Luxury Honeymoon Coast", days: 6, dests: ["colombo", "galle", "bentota", "mirissa"], cats: ["honeymoon", "luxury-escapes", "beach-holidays", "custom-private"], vehicle: "luxuryVan", badge: "luxury", idealFor: "Coastal honeymooners", vehicles: ["luxuryVan", "suv"], publishedAt: "2026-02-23", theme: "Fort romance and ocean villas", highlights: ["Galle Fort", "Bentota", "Mirissa sunsets"] },
  { slug: "7-days-adventure-active-island", title: "7 Days Active Adventure Island", days: 7, dests: ["kandy", "ella", "arugam-bay", "yala", "mirissa"], cats: ["adventure", "custom-private"], vehicle: "suv", badge: "adventure", idealFor: "Hikers and thrill seekers", vehicles: ["suv", "van"], publishedAt: "2026-02-24", theme: "Ridges, surf, and safari adrenaline", highlights: ["Ella hikes", "Arugam Bay", "Yala safari"] },
  { slug: "8-days-festival-culture-kandy", title: "8 Days Festival Culture & Kandy", days: 8, dests: ["colombo", "kandy", "dambulla", "sigiriya", "negombo"], cats: ["festival", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Festival season visitors", vehicles: ["suv", "van"], publishedAt: "2026-02-27", theme: "Perahera timing with heritage", highlights: ["Kandy festivals", "Temple visits", "Triangle icons"] },
  { slug: "9-days-eco-sustainable-journey", title: "9 Days Eco Sustainable Journey", days: 9, dests: ["negombo", "sigiriya", "kandy", "ella", "yala", "galle"], cats: ["wildlife-safari", "bird-watching", "custom-private"], vehicle: "suv", badge: "eco", idealFor: "Eco-conscious travellers", vehicles: ["suv", "van"], publishedAt: "2026-03-01", theme: "Low-impact pacing with local partners", highlights: ["Responsible safari", "Village visits", "Heritage"] },
  { slug: "11-days-complete-classic-island", title: "11 Days Complete Classic Island", days: 11, dests: ["negombo", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "galle", "mirissa"], cats: ["classic-sri-lanka", "popular", "custom-private"], vehicle: "suv", popular: true, featuredRank: 14, idealFor: "Balanced first journeys", vehicles: ["suv", "van", "luxuryVan"], publishedAt: "2025-12-05", theme: "Every classic chapter in one circuit", highlights: ["Triangle", "Tea country", "Safari", "South coast"] },
  { slug: "13-days-luxury-honeymoon-grand", title: "13 Days Luxury Honeymoon Grand", days: 13, dests: ["negombo", "kandy", "nuwara-eliya", "ella", "yala", "galle", "bentota"], cats: ["honeymoon", "luxury-escapes", "custom-private"], vehicle: "luxuryVan", badge: "luxury", idealFor: "Extended romantic travel", vehicles: ["luxuryVan", "suv"], publishedAt: "2025-12-08", theme: "Grand romance with premium transfers", highlights: ["Tea mist", "Safari", "Fort and beach"] },
  { slug: "17-days-island-photography-safari", title: "17 Days Island Photography Safari", days: 17, dests: ["negombo", "anuradhapura", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "mirissa", "galle", "trincomalee"], cats: ["photography-tours", "wildlife-safari", "custom-private"], vehicle: "suv", idealFor: "Documentary-style travellers", vehicles: ["suv", "van"], publishedAt: "2025-11-25", theme: "Extended visual storytelling", highlights: ["Wildlife", "Heritage", "Coast and east"] },
  { slug: "20-days-ultimate-private-island", title: "20 Days Ultimate Private Island", days: 20, dests: ["negombo", "anuradhapura", "polonnaruwa", "sigiriya", "kandy", "nuwara-eliya", "ella", "yala", "mirissa", "galle", "bentota", "trincomalee", "arugam-bay", "colombo"], cats: ["private-chauffeur", "classic-sri-lanka", "luxury-escapes", "custom-private"], vehicle: "van", badge: "luxury", idealFor: "Guests with time to explore deeply", vehicles: ["van", "luxuryVan", "miniCoach"], publishedAt: "2025-11-20", theme: "The island without compromise", highlights: ["Every region", "Seasonal routing", "Dedicated chauffeur"] },
  { slug: "2-days-colombo-galle-express", title: "2 Days Colombo to Galle Express", days: 2, dests: ["colombo", "galle"], cats: ["classic-sri-lanka", "beach-holidays", "custom-private"], vehicle: "sedan", idealFor: "Short southbound transfers", vehicles: ["sedan", "suv"], publishedAt: "2026-03-17", theme: "Capital to fort in comfort", highlights: ["Colombo", "Galle Fort", "Coastal drive"] },
  { slug: "3-days-yala-safari-focus", title: "3 Days Yala Safari Focus", days: 3, dests: ["yala", "mirissa"], cats: ["wildlife-safari", "custom-private"], vehicle: "suv", badge: "new", idealFor: "Wildlife weekenders", vehicles: ["suv", "van"], publishedAt: "2026-03-18", theme: "Double safari windows with coast ease", highlights: ["Yala dawn drives", "Mirissa coast", "Flexible jeep timing"] },
  { slug: "4-days-ella-train-escape", title: "4 Days Ella Train Escape", days: 4, dests: ["kandy", "nuwara-eliya", "ella"], cats: ["train-journeys", "hill-country-tea", "custom-private"], vehicle: "suv", badge: "new", idealFor: "Rail lovers with limited time", vehicles: ["suv", "van"], publishedAt: "2026-03-19", theme: "Scenic rail through tea valleys", highlights: ["Train segment", "Nine Arches", "Tea stops"] },
  { slug: "5-days-mirissa-whale-coast", title: "5 Days Mirissa Whale Coast", days: 5, dests: ["galle", "mirissa", "bentota"], cats: ["beach-holidays", "wildlife-safari", "custom-private"], vehicle: "sedan", idealFor: "Ocean wildlife enthusiasts", vehicles: ["sedan", "suv", "van"], publishedAt: "2026-03-20", theme: "Whale season and fort heritage", highlights: ["Mirissa coast", "Whale watching", "Galle Fort"] },
  { slug: "6-days-pilgrimage-triangle", title: "6 Days Pilgrimage Triangle", days: 6, dests: ["kandy", "anuradhapura", "dambulla", "polonnaruwa"], cats: ["pilgrimage", "cultural-heritage", "custom-private"], vehicle: "suv", idealFor: "Faith-led group travel", vehicles: ["suv", "van", "miniCoach"], publishedAt: "2026-03-21", theme: "Sacred sites across the island", highlights: ["Temple of the Tooth", "Anuradhapura", "Dambulla caves"] },
  { slug: "8-days-tea-country-immersion", title: "8 Days Tea Country Immersion", days: 8, dests: ["kandy", "nuwara-eliya", "ella", "bentota"], cats: ["tea-country", "hill-country-tea", "custom-private"], vehicle: "suv", idealFor: "Plantation and estate guests", vehicles: ["suv", "van"], publishedAt: "2026-03-22", theme: "Deep tea belt with coastal finale", highlights: ["Factory visits", "Ella ridges", "Bentota calm"] },
  { slug: "10-days-classic-luxury-blend", title: "10 Days Classic Luxury Blend", days: 10, dests: ["colombo", "sigiriya", "kandy", "ella", "galle", "bentota"], cats: ["luxury-escapes", "classic-sri-lanka", "private-chauffeur", "custom-private"], vehicle: "luxuryVan", badge: "luxury", idealFor: "Premium first-time visitors", vehicles: ["luxuryVan", "suv"], publishedAt: "2026-03-23", theme: "Heritage and coast with premium pacing", highlights: ["Luxury vehicle", "Sigiriya", "Galle Fort"] },
];

function heroForDest(slug) {
  return `${slug}-hero`;
}

function buildItinerary(dests, days) {
  const daysOut = [];
  for (let d = 1; d <= days; d++) {
    const destIndex = Math.min(d - 1, dests.length - 1);
    const slug = dests[destIndex];
    const name = DEST_NAMES[slug] ?? slug;
    const isLast = d === days;
    const isRepeat = d > dests.length;
    daysOut.push({
      day: d,
      destinationSlug: slug,
      title: isLast
        ? d === 1
          ? `${name} discovery`
          : "Departure & onward"
        : isRepeat
          ? `${name} at leisure`
          : `Discover ${name}`,
      description: isLast && d > 1
        ? `Private transfer toward Colombo or Bandaranaike International Airport — or continue your custom route with Q Pick.`
        : `Explore ${name} with your dedicated chauffeur — timing flexes around weather, tickets, and your pace.`,
    });
  }
  return daysOut;
}

function esc(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderTour(t) {
  const slug = t.slug;
  const hero = heroForDest(t.dests[0]);
  const gallery = [...new Set(t.dests.map(heroForDest))].slice(0, 6);
  const destLine = t.dests.map((d) => DEST_NAMES[d] ?? d).join(", ");
  const kw = [
    `${t.days} day Sri Lanka tour`,
    "private chauffeur Sri Lanka",
    ...t.dests.map((d) => DEST_NAMES[d] ?? d),
    ...t.cats.slice(0, 3).map((c) => c.replace(/-/g, " ")),
  ];
  const itinerary = buildItinerary(t.dests, t.days);
  const related = TOURS.filter((o) => o.slug !== slug && o.cats.some((c) => t.cats.includes(c)))
    .slice(0, 2)
    .map((o) => o.slug);

  const optionalFields = [
    t.badge ? `    badge: "${t.badge}",` : "",
    t.popular ? `    popular: true,` : `    popular: false,`,
    t.featuredRank != null ? `    featuredRank: ${t.featuredRank},` : "",
    `    publishedAt: "${t.publishedAt}",`,
    `    idealFor: "${esc(t.idealFor)}",`,
    `    suggestedVehicleIds: [${t.vehicles.map((v) => `"${v}"`).join(", ")}],`,
  ]
    .filter(Boolean)
    .join("\n");

  return `  {
    slug: "${slug}",
    title: "${esc(t.title)}",
    durationDays: ${t.days},
    destinationSlugs: [${t.dests.map((d) => `"${d}"`).join(", ")}],
    categoryIds: [${[...new Set(["custom-private", ...t.cats])].map((c) => `"${c}"`).join(", ")}],
    vehicleId: "${t.vehicle}",
    startingPriceLkr: null,
    highlights: [${t.highlights.map((h) => `"${esc(h)}"`).join(", ")}],
    travelTips: [
      "Confirm entrance tickets and safari jeep hire in advance — your chauffeur coordinates timing.",
      "Pack modest clothing for temples and a light layer for hill country mornings.",
      "Share flight details early so arrival and departure transfers stay composed.",
    ],
    bestTimeToVisit: "Year-round with seasonal tweaks — your Q Pick planner advises the best month for this route.",
    heroGalleryId: "${hero}",
    galleryIds: [${gallery.map((g) => `"${g}"`).join(", ")}],
    seo: {
      title: "${esc(t.title)} | Private Chauffeur Tour | Quick Pick",
      description: "${esc(`${t.theme}. ${t.days}-day private chauffeur journey across ${destLine} with flexible pacing and written quotes from Q Pick.`)}",
      canonicalPath: "/tours/${slug}",
      ogImage: getDestinationImageSrc("${t.dests[0]}"),
      ogTitle: "${esc(t.title)} | Q Pick",
      twitterTitle: "${esc(t.title)}",
      twitterDescription: "${esc(t.theme)}",
      keywords: [${kw.map((k) => `"${esc(k)}"`).join(", ")}],
      intro: "${esc(`${t.theme}. This ${t.days}-day private chauffeur journey visits ${destLine} — ${t.idealFor.toLowerCase()}. Your dedicated driver handles the road while you focus on temples, viewpoints, wildlife windows, and unhurried coastal afternoons. Every Q Pick tour is refined after a written review of your dates, vehicle preference, and pace.`)}",
    },
    itinerary: [
${itinerary
  .map(
    (day) => `      { day: ${day.day}, destinationSlug: "${day.destinationSlug}", title: "${esc(day.title)}", description: "${esc(day.description)}" },`,
  )
  .join("\n")}
    ],
    included: sharedIncluded,
    excluded: sharedExcluded,
    faqIds: ["hub-customize", "hub-price", "hub-airport"],
    relatedPackageSlugs: [${related.map((r) => `"${r}"`).join(", ")}],
${optionalFields}
    published: true,
  }`;
}

const body = `import type { TourPackage } from "../types";
import { getDestinationImageSrc } from "@/lib/destination-image-catalog";
import { sharedExcluded, sharedIncluded } from "./shared";

/** Generated catalogue — run scripts/generate-tour-catalog.mjs to regenerate. */
export const CATALOG_PACKAGES: TourPackage[] = [
${TOURS.map(renderTour).join(",\n")}
];
`;

const out = join(process.cwd(), "lib/tours/packages/catalog.ts");
writeFileSync(out, body, "utf8");
console.log(`Generated ${TOURS.length} tours → ${out}`);
