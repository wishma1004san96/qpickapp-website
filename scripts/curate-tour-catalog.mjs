import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "lib/tours/packages/catalog.ts");

const MULTI_DAY_SLUGS = [
  "4-days-ella-train-escape",
  "5-days-mirissa-whale-coast",
  "6-days-luxury-honeymoon-coast",
  "6-days-pilgrimage-triangle",
  "8-days-festival-culture-kandy",
  "9-days-honeymoon-paradise",
  "10-days-ayurveda-wellness-journey",
];

const DAY_TOUR_SLUGS = [
  "colombo-capital-discovery-day",
  "galle-fort-heritage-day",
  "sigiriya-rock-sunrise-day",
  "kandy-sacred-city-day",
  "ella-highland-views-day",
  "yala-wildlife-safari-day",
  "anuradhapura-sacred-trail-day",
  "mirissa-southern-coast-day",
];

const allSlugs = [...MULTI_DAY_SLUGS, ...DAY_TOUR_SLUGS];
const src = readFileSync(catalogPath, "utf8");
const blocks = [];

for (const slug of allSlugs) {
  const marker = `slug: "${slug}"`;
  const start = src.indexOf(`  {\n    ${marker}`);
  if (start === -1) {
    console.error(`Missing package: ${slug}`);
    process.exit(1);
  }
  let depth = 0;
  let end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  const block = src.slice(start, end);
  if (src[end] === ",") end++;
  blocks.push(block.trim());
}

const out = `import type { TourPackage } from "../types";
import { getDestinationImageSrc } from "@/lib/destination-image-catalog";
import { sharedExcluded, sharedIncluded } from "./shared";

/** Premium curated catalogue — hand-picked multi-day journeys and day tours. */
export const CATALOG_PACKAGES: TourPackage[] = [
${blocks.join(",\n")},
];
`;

writeFileSync(catalogPath, out);
console.log(
  `Curated ${allSlugs.length} packages (${MULTI_DAY_SLUGS.length} multi-day + ${DAY_TOUR_SLUGS.length} day tours).`,
);
