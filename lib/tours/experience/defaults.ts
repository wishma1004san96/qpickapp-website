import type { TourExperienceFeature, TourPackage } from "../types";

const DEFAULT_PACKING = [
  "Light layers for highland mornings and coastal evenings",
  "Modest clothing covering shoulders and knees for temples",
  "Comfortable walking shoes with grip for viewpoints",
  "Sun protection, refillable bottle, and offline maps",
  "Binoculars if wildlife days are on your route",
];

export function defaultPackingTips(): string[] {
  return DEFAULT_PACKING;
}

export function deriveExperienceFeatures(pkg: TourPackage): TourExperienceFeature[] {
  const features: TourExperienceFeature[] = [
    {
      id: "chauffeur",
      title: "Private chauffeur",
      description:
        "A dedicated driver paces temple etiquette, highland roads, and airport timing around you.",
    },
    {
      id: "comfort",
      title: "Luxury comfort",
      description:
        "Air-conditioned private cabin sized for your group — luggage handled without coach chaos.",
    },
  ];

  if (pkg.categoryIds.includes("cultural-heritage")) {
    features.push({
      id: "unesco",
      title: "UNESCO heritage",
      description:
        "Time for Sigiriya climbs, cave temples, and ancient cities without a day-coach rush.",
    });
  }
  if (pkg.categoryIds.includes("wildlife-safari")) {
    features.push({
      id: "safari",
      title: "Safari window",
      description:
        "Early park logistics for Yala and seasonal wildlife — jeep fees arranged as clear add-ons.",
    });
  }
  if (
    pkg.categoryIds.includes("hill-country-tea") ||
    pkg.categoryIds.includes("train-journeys") ||
    pkg.destinationSlugs.includes("ella")
  ) {
    features.push({
      id: "train",
      title: "Scenic train option",
      description:
        "Optional highland rail segments while your chauffeur transfers luggage by road.",
    });
  }
  if (
    pkg.categoryIds.includes("cultural-heritage") ||
    pkg.destinationSlugs.includes("sigiriya")
  ) {
    features.push({
      id: "sunrise",
      title: "Sunrise experiences",
      description:
        "Softer light for fortress climbs, Nine Arches frames, and coastal sunsets.",
    });
  }
  if (pkg.categoryIds.includes("beach-holidays")) {
    features.push({
      id: "coast",
      title: "Coastal recovery",
      description:
        "Beach chapters after heritage or safari days so the journey breathes.",
    });
  }

  return features.slice(0, 6);
}

export function defaultStayIdsForPackage(pkg: TourPackage): string[] {
  const ids: string[] = [];
  if (pkg.destinationSlugs.some((s) => ["sigiriya", "dambulla", "anuradhapura", "polonnaruwa"].includes(s))) {
    ids.push("triangle-heritage");
  }
  if (pkg.destinationSlugs.includes("kandy")) ids.push("kandy-lake");
  if (pkg.destinationSlugs.includes("nuwara-eliya")) ids.push("tea-country");
  if (pkg.destinationSlugs.includes("ella")) ids.push("ella-ridge");
  if (pkg.destinationSlugs.includes("yala")) ids.push("yala-edge");
  if (pkg.destinationSlugs.some((s) => ["mirissa", "galle", "bentota"].includes(s))) {
    ids.push("south-coast");
  }
  if (pkg.destinationSlugs.some((s) => ["negombo", "colombo"].includes(s))) {
    ids.push("west-arrival");
  }
  if (pkg.destinationSlugs.some((s) => ["trincomalee", "arugam-bay"].includes(s))) {
    ids.push("east-season");
  }
  return [...new Set(ids)].slice(0, 4);
}
