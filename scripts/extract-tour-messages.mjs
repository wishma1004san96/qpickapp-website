/**
 * Merges tour hub UI + catalog strings into messages/en.json (toursHub, toursCatalog).
 * Run: node scripts/extract-tour-messages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Register tsx loader path via dynamic import of compiled modules through next
// Fallback: parse catalog.ts for slug/title/intro blocks

const enPath = path.join(root, "messages", "en.json");
const catalogPath = path.join(root, "lib", "tours", "packages", "catalog.ts");
const legacyPath = path.join(root, "lib", "tours", "packages", "index.ts");
const categoriesPath = path.join(root, "lib", "tours", "categories", "index.ts");
const destinationsPath = path.join(root, "lib", "tours", "destinations", "index.ts");
const hubPath = path.join(root, "lib", "tours", "seo", "hub.ts");
const faqPath = path.join(root, "lib", "tours", "faq", "index.ts");
const vehiclesPath = path.join(root, "lib", "tours", "vehicles", "index.ts");
const reviewsPath = path.join(root, "lib", "tours", "reviews", "index.ts");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractPackages(source) {
  const packages = {};
  const slugRe = /slug:\s*"([^"]+)"/g;
  const blocks = source.split(/\n\{/);
  for (const block of blocks) {
    const slugMatch = block.match(/slug:\s*"([^"]+)"/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const idealFor = block.match(/idealFor:\s*"([^"]+)"/)?.[1];
    const intro = block.match(/intro:\s*"([^"]+(?:\\.[^"]*)*)"/s)?.[1]?.replace(/\\n/g, "\n");
    const highlights = [...block.matchAll(/highlights:\s*\[([\s\S]*?)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
    );
    const itinerary = [];
    const dayBlocks = [...block.matchAll(/day:\s*(\d+)[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+(?:\\.[^"]*)*)"/g)];
    for (const [, day, itTitle, desc] of dayBlocks) {
      itinerary.push({
        title: itTitle,
        description: desc.replace(/\\n/g, "\n"),
      });
    }
    packages[slug] = {
      title: title ?? slug,
      ...(idealFor ? { idealFor } : {}),
      ...(intro ? { intro } : {}),
      ...(highlights.length ? { highlights } : {}),
      ...(itinerary.length ? { itinerary } : {}),
    };
  }
  return packages;
}

function extractCategories(source) {
  const categories = {};
  const blocks = source.split(/\{\s*\n\s*id:/);
  for (const block of blocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1];
    if (!id) continue;
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const intro = block.match(/intro:\s*\n\s*"([^"]+(?:\\.[^"]*)*)"/s)?.[1]?.replace(/\\n/g, "\n");
    if (title) categories[id] = { title, ...(intro ? { intro } : {}) };
  }
  return categories;
}

function extractDestinations(source) {
  const destinations = {};
  const blocks = source.split(/\{\s*\n\s*slug:/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const name = block.match(/name:\s*"([^"]+)"/)?.[1];
    const region = block.match(/region:\s*"([^"]+)"/)?.[1];
    const description = block.match(/description:\s*\n\s*"([^"]+(?:\\.[^"]*)*)"/s)?.[1]?.replace(/\\n/g, "\n");
    const highlights = [...block.matchAll(/highlights:\s*\[([\s\S]*?)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
    );
    destinations[slug] = {
      name: name ?? slug,
      ...(region ? { region } : {}),
      ...(description ? { description } : {}),
      ...(highlights.length ? { highlights } : {}),
    };
  }
  return destinations;
}

function extractHub(source) {
  const pick = (re) => source.match(re)?.[1]?.replace(/\\n/g, "\n");
  return {
    seo: {
      title: pick(/HUB_SEO[\s\S]*?title:\s*"([^"]+)"/),
      description: pick(/HUB_SEO[\s\S]*?description:\s*\n\s*"([^"]+)"/),
      ogTitle: pick(/ogTitle:\s*"([^"]+)"/),
      twitterTitle: pick(/twitterTitle:\s*"([^"]+)"/),
      twitterDescription: pick(/twitterDescription:\s*\n\s*"([^"]+)"/),
    },
    hero: {
      eyebrow: pick(/HUB_HERO[\s\S]*?eyebrow:\s*"([^"]+)"/),
      headline: pick(/HUB_HERO[\s\S]*?headline:\s*"([^"]+)"/),
      subtitle: pick(/HUB_HERO[\s\S]*?subtitle:\s*\n\s*"([^"]+)"/),
      primaryCta: pick(/primaryCta:\s*\{\s*label:\s*"([^"]+)"/),
      secondaryCta: pick(/secondaryCta:\s*\{\s*label:\s*"([^"]+)"/),
    },
    finalCta: {
      headline: pick(/FINAL_CTA[\s\S]*?headline:\s*"([^"]+)"/),
      body: pick(/FINAL_CTA[\s\S]*?body:\s*"([^"]+)"/),
      ctaLabel: pick(/FINAL_CTA[\s\S]*?ctaLabel:\s*"([^"]+)"/),
      secondaryLabel: pick(/FINAL_CTA[\s\S]*?secondaryLabel:\s*"([^"]+)"/),
    },
    trust: {},
    explorer: {
      eyebrow: "Curated collections",
      title: "Choose your journey",
      subtitle:
        "Premium private tours organised by travel style — open a category to explore its story, featured itineraries, and journey details right here.",
      searchPlaceholder: "Search destinations, experiences or tour names…",
      clearSearch: "Clear search",
      categoriesAria: "Tour categories",
      mapSelection: "Map selection",
      multiDay: "Multi-day journeys",
      premiumNorthern: "Premium private tours",
      sortAria: "Sort tour packages",
      filterAria: "Filter tour packages",
      allCategoriesTitle: "All Categories",
      allCategoriesIntro:
        "Browse every published private tour — reset and explore the full Q Pick collection.",
      viewAllCategories: "View all categories",
      destinationExperiences: "Destination experiences",
      destinationExperiencesSub:
        "Real places, seasons, and photography windows — not just labels on a card.",
      vehiclesTitle: "Travel in private comfort",
      vehiclesSub:
        "Sedan to mini coach — air conditioning, luggage space, and charging for the road.",
      trustTitle: "Why Travel With Q Pick",
      reviewsEmptyTitle: "Guest stories coming soon",
      reviewsEmptyBody:
        "Verified private-tour reviews will appear here as guests share their journeys.",
      faqEyebrow: "Frequently asked questions",
      faqLead:
        "Everything you need to know before planning your journey with Q Pick.",
      noResults: "No tours match your search. Try another keyword or reset filters.",
      noToursTitle: "No tours match your search",
      noToursBody: "Try a different keyword, or reset filters to browse the full collection.",
      planCustomTour: "Plan a custom tour",
      resetFilters: "Reset filters",
      sortBy: "Sort by",
      mapJourneysThrough: "Journeys through {name}",
      itineraryOne: "itinerary",
      itineraryMany: "itineraries",
      matchingQuery: "matching \"{query}\"",
      northernPeninsula: "Northern peninsula",
      premiumJaffna: "Premium Jaffna experiences",
      premiumJaffnaSub:
        "{count} {experiences} — heritage city walks, island ferries, and sacred boat journeys with private chauffeur support.",
      experienceOne: "experience",
      experienceMany: "experiences",
      reviewsEmptyDisclaimer:
        "Verified guest reviews will appear after published trips. We do not display invented testimonials, ratings, or awards.",
      trustBeforeTestimonials: "Trust before testimonials",
      faqTitle: "FAQ",
      defaultImageAlt: "Scenic Sri Lanka highland journey",
      openCategory: "Open {title}",
      countItineraries: "{count} itineraries",
      countPackages: "{count} packages",
      countPackage: "{count} package",
      cmbService: "CMB service",
      packagesFound: "{count} packages",
      dayTour: "Day tour",
      daysTour: "{count} days",
      fromPrice: "Price on request",
      viewDetails: "View details",
      bookTour: "Book this tour",
      idealFor: "Ideal for {value}",
      premiumNorthernHeading: "Northern Sri Lanka",
      premiumNorthernSub:
        "Heritage temples, remote islands, and Jaffna's cultural depth — three premium journeys with dedicated chauffeurs.",
    },
    filters: {
      all: "All",
      classic: "Classic",
      luxury: "Luxury",
      wildlife: "Wildlife",
      adventure: "Adventure",
      beach: "Beach",
      honeymoon: "Honeymoon",
      wellness: "Wellness",
      family: "Family",
      "day-tours": "Day Tours",
    },
    sort: {
      featured: "Featured",
      newest: "Newest",
      duration: "Duration",
      popular: "Popular",
    },
    badges: {
      "best-seller": "Best Seller",
      luxury: "Luxury",
      new: "New",
      "family-friendly": "Family Friendly",
      eco: "Eco",
      adventure: "Adventure",
    },
    breadcrumbs: {
      home: "Home",
      tours: "Tours",
    },
    jsonLd: {
      touristType: "Leisure travellers",
    },
  };
}

function extractTrust(source) {
  const trust = {};
  const blocks = [...source.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*\n\s*"([^"]+)"/g)];
  for (const [, id, title, description] of blocks) {
    trust[id] = { title, description };
  }
  return trust;
}

function extractFaqs(source) {
  const faqs = {};
  const blocks = [...source.matchAll(/id:\s*"([^"]+)"[\s\S]*?question:\s*"([^"]+)"[\s\S]*?answer:\s*"([^"]+(?:\\.[^"]*)*)"/g)];
  for (const [, id, question, answer] of blocks) {
    faqs[id] = { question, answer: answer.replace(/\\n/g, "\n") };
  }
  return faqs;
}

function extractVehicles(source) {
  const vehicles = {};
  const blocks = source.split(/\{\s*\n\s*id:/);
  for (const block of blocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1];
    if (!id) continue;
    const name = block.match(/name:\s*"([^"]+)"/)?.[1];
    const tagline = block.match(/tagline:\s*"([^"]+)"/)?.[1];
    const description = block.match(/description:\s*\n\s*"([^"]+(?:\\.[^"]*)*)"/s)?.[1]?.replace(/\\n/g, "\n");
    vehicles[id] = {
      ...(name ? { name } : {}),
      ...(tagline ? { tagline } : {}),
      ...(description ? { description } : {}),
    };
  }
  return vehicles;
}

const en = JSON.parse(read(enPath));

const catalogSource = read(catalogPath) + read(legacyPath);
const packages = extractPackages(catalogSource);
const categories = extractCategories(read(categoriesPath));
const destinations = extractDestinations(read(destinationsPath));
const toursHub = extractHub(read(hubPath));
toursHub.trust = extractTrust(read(hubPath));

const faqs = extractFaqs(read(faqPath));
const vehicles = extractVehicles(read(vehiclesPath));

let reviewsMeta = { title: "Guest reviews", emptyTitle: "Guest stories coming soon", emptyBody: "" };
const reviewsSource = read(reviewsPath);
const rm = reviewsSource.match(/REVIEWS_SECTION[\s\S]*?title:\s*"([^"]+)"[\s\S]*?emptyTitle:\s*"([^"]+)"[\s\S]*?emptyBody:\s*"([^"]+)"/);
if (rm) {
  reviewsMeta = { title: rm[1], emptyTitle: rm[2], emptyBody: rm[3] };
}
toursHub.reviewsMeta = reviewsMeta;

en.toursHub = toursHub;
en.toursCatalog = { packages, categories, destinations, faqs, vehicles };

// Tour booking wizard strings
en.tourBooking = {
  steps: {
    destinations: {
      kicker: "Step 1",
      title: "Where would you like to go?",
      subtitle: "Select destinations or describe your dream route — we refine the details together.",
    },
    dates: {
      kicker: "Step 2",
      title: "Select travel dates",
      subtitle: "Choose your start date and how many days you want on the road.",
      startDate: "Start date",
      numberOfDays: "Number of days",
      estimatedEnd: "Estimated end date:",
    },
    vehicle: {
      kicker: "Step 3",
      title: "Choose your vehicle",
      subtitle: "Sedan to van — private, air-conditioned, luggage-ready.",
    },
    accommodation: {
      kicker: "Step 4",
      title: "Accommodation preference",
      subtitle: "Tell us your comfort level — we coordinate stays or you book your own.",
    },
    preferences: {
      kicker: "Step 5",
      title: "Travel preferences",
      subtitle: "Pace, interests, and special requests help us shape your itinerary.",
    },
    contact: {
      kicker: "Step 6",
      title: "Your contact details",
      subtitle: "We respond with a written quote and refined itinerary.",
    },
    requests: {
      kicker: "Step 7",
      title: "Special requests",
      subtitle: "Dietary needs, accessibility, celebrations — anything we should know.",
    },
    review: {
      kicker: "Review",
      title: "Review your tour request",
      subtitle: "Confirm details before submitting — no payment required at this stage.",
      submit: "Submit tour request",
      submitting: "Submitting…",
    },
  },
  common: {
    back: "Back",
    continue: "Continue",
    optional: "Optional",
    required: "Required",
  },
};

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, "utf8");
console.log(
  `✓ Updated en.json — toursHub, toursCatalog (${Object.keys(packages).length} packages), tourBooking`,
);
