/**
 * Sync destination images into public/images/destinations/
 * with exact destination-name filenames (.webp).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir =
  process.env.DESTINATION_ASSETS_DIR ??
  "C:\\Users\\User\\.cursor\\projects\\d-quickpickapp\\assets";
const outDir = join(root, "public", "images", "destinations");

mkdirSync(outDir, { recursive: true });

/** @type {[string, string][]} source basename fragment → output filename */
const ASSET_MAP = [
  ["Sigiriya-Rock-Fortress", "Sigiriya Rock Fortress.webp"],
  ["Temple-of-the-Tooth-_Kandy_", "Temple of the Tooth (Kandy).webp"],
  ["dambulla-cave-temple", "Dambulla Cave Temple.webp"],
  ["Polonnaruwa-Ancient-City", "Polonnaruwa.webp"],
  ["anuradhapura-3323", "Anuradhapura.webp"],
  ["Nine_Arches_Bridge", "Nine Arches Bridge (Ella).webp"],
  ["Little-Adams-Peak", "Little Adam's Peak.webp"],
  ["Ravana-Waterfall", "Ravana Falls.webp"],
  ["Nuwara_Eliya_Tea_Estates", "Nuwara Eliya Tea Estates.webp"],
  ["Horton-Plains", "Horton Plains.webp"],
  ["Yala_National_Park-76c59dee", "Yala Leopard Safari.webp"],
  ["Unawatuna-f84e1b9b", "Unawatuna Beach.webp"],
  ["Arugam_Bay-47f73e12", "Arugam Bay.webp"],
  ["Trincomalee-5bda275e", "Trincomalee Beach.webp"],
  ["Pinnawala-Elephant-Orphanage", "Pinnawala Elephant Orphanage.webp"],
  ["Diyaluma-Falls", "Diyaluma Falls.webp"],
  ["Bentota-a8bdbff0", "Bentota Beach.webp"],
  ["Kitulgala-Rafting", "Kitulgala Rafting.webp"],
  ["Ambuluwawa-Tower", "Ambuluwawa Tower.webp"],
  ["Madu-River-Safari", "Madu River Safari.webp"],
  ["hikkaduwa-b060be80", "Hikkaduwa Beach.webp"],
  ["negombo-0bd80880", "Negombo Beach.webp"],
  ["colombo-2c1a1bdd", "Colombo Lotus Tower.webp"],
];

/** @type {[string, string][]} existing slug webp → named webp */
const EXISTING_WEBP_MAP = [
  ["galle.webp", "Galle Fort Lighthouse.webp"],
  ["mirissa.webp", "Coconut Tree Hill.webp"],
  ["mirissa.webp", "Mirissa Beach.webp"],
];

function findAsset(fragment) {
  if (!existsSync(assetsDir)) return null;
  const hit = readdirSync(assetsDir).find((name) => name.includes(fragment));
  return hit ? join(assetsDir, hit) : null;
}

function toWebp(input, output) {
  const cmd = `npx --yes sharp-cli -i "${input}" -o "${output}" -f webp -q 82`;
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

for (const [fragment, filename] of ASSET_MAP) {
  const src = findAsset(fragment);
  const dest = join(outDir, filename);
  if (!src) {
    console.warn(`[missing source] ${filename} (no asset matching "${fragment}")`);
    continue;
  }
  console.log(`→ ${filename}`);
  toWebp(src, dest);
}

for (const [slugFile, filename] of EXISTING_WEBP_MAP) {
  const src = join(outDir, slugFile);
  const dest = join(outDir, filename);
  if (!existsSync(src)) {
    console.warn(`[missing source] ${filename} (no ${slugFile})`);
    continue;
  }
  if (existsSync(dest)) continue;
  console.log(`→ ${filename} (from ${slugFile})`);
  copyFileSync(src, dest);
}

const required = [
  "Sigiriya Rock Fortress.webp",
  "Temple of the Tooth (Kandy).webp",
  "Nine Arches Bridge (Ella).webp",
  "Galle Fort Lighthouse.webp",
  "Yala Leopard Safari.webp",
  "Nuwara Eliya Tea Estates.webp",
  "Horton Plains.webp",
  "Little Adam's Peak.webp",
  "Mirissa Beach.webp",
  "Coconut Tree Hill.webp",
  "Unawatuna Beach.webp",
  "Hikkaduwa Beach.webp",
  "Bentota Beach.webp",
  "Trincomalee Beach.webp",
  "Arugam Bay.webp",
  "Polonnaruwa.webp",
  "Anuradhapura.webp",
  "Dambulla Cave Temple.webp",
  "Pinnawala Elephant Orphanage.webp",
  "Ambuluwawa Tower.webp",
  "Ravana Falls.webp",
  "Diyaluma Falls.webp",
  "Madu River Safari.webp",
  "Kitulgala Rafting.webp",
  "Negombo Beach.webp",
  "Colombo Lotus Tower.webp",
];

const missing = required.filter((f) => !existsSync(join(outDir, f)));
if (missing.length) {
  console.warn("\nMissing destination files:");
  for (const f of missing) console.warn(`  ${f}`);
} else {
  console.log("\nAll required destination images present.");
}
