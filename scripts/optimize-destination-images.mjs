/**
 * Optimize destination hero images → public/images/destinations/*.webp
 * Sources: local assets folder + Wikimedia Commons (CC-licensed).
 * Run: node scripts/optimize-destination-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir =
  process.env.DESTINATION_ASSETS_DIR ??
  path.join(process.env.USERPROFILE ?? "", ".cursor/projects/d-quickpickapp/assets");
const outDir = path.join(root, "public/images/destinations");
const toursDir = path.join(root, "public/images/tours");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(toursDir, { recursive: true });

/** @type {Record<string, string>} fragment → exact output filename */
const ASSET_OUTPUTS = {
  "sinharaja-rain-forest-snake": "Sinharaja Forest Reserve.webp",
  treat2: "Ayurveda Wellness.webp",
  Lipton_s_Seat: "Lipton's Seat.webp",
  "jaffna-47a00095": "Jaffna Fort.webp",
  Nallur_Kandaswamy_Temple: "Nallur Kandaswamy Temple.webp",
  Delft_Island: "Delft Island.webp",
  "Mannar-67166a77": "Mannar.webp",
  Kalpitiya: "Kalpitiya.webp",
  Negombo1: "Negombo Beach.webp",
  "Nagadipa-Purana-Vihara": "Nainativu Nagadeepa Temple.webp",
  "badulla-railway-station": "Badulla Railway.webp",
  Ratnapura: "Ratnapura.webp",
  thissamaharama: "Tissamaharama.webp",
  "Batticaloa-Gate": "Batticaloa.webp",
  "munneswaram-temple": "Munneswaram Temple.webp",
  "jaffna-5863bd94": "Jaffna Fort.webp",
  "Delft_Island-1a0b696f": "Delft Island.webp",
  "Mannar-e11fa535": "Mannar.webp",
  "Mihintale-ba405385": "Mihintale.webp",
  "Minneriya-5bcbc5cb": "Minneriya National Park.webp",
  "Wilpattu_National_Park": "Wilpattu National Park.webp",
  "Udawalawe-National-Park": "Udawalawe National Park.webp",
  "negombo-0bd80880": "Negombo Beach.webp",
  "Sigiriya-Rock-Fortress": "Sigiriya Rock Fortress.webp",
  "Temple-of-the-Tooth-_Kandy_": "Temple of the Tooth (Kandy).webp",
  "dambulla-cave-temple-79fbb480": "Dambulla Cave Temple.webp",
  "Polonnaruwa-Ancient-City": "polonnaruwa.webp",
  "anuradhapura-3323a6b3": "anuradhapura.webp",
  "Nine_Arches_Bridge-6ddbd4c8": "Nine Arches Bridge (Ella).webp",
  "Nuwara_Eliya_Tea_Estates-3d31aeee": "Nuwara Eliya Tea Estates.webp",
  "World_s-End-d88015e8": "Horton Plains.webp",
  "Little-Adams-Peak-f3b2a642": "Little Adam's Peak.webp",
  "Yala_National_Park-76c59dee": "Yala Leopard Safari.webp",
  "Unawatuna-f84e1b9b": "Unawatuna Beach.webp",
  "Arugam_Bay-47f73e12": "Arugam Bay.webp",
  "Trincomalee-5bda275e": "Trincomalee Beach.webp",
  "hikkaduwa-b060be80": "Hikkaduwa Beach.webp",
  "bentota-beach-c437c18c": "Bentota Beach.webp",
  "colombo-2c1a1bdd": "Colombo Lotus Tower.webp",
  hortonplace: "Horton Plains.webp",
  udawalawa: "Udawalawe National Park.webp",
  hikkaduwa1: "Hikkaduwa Beach.webp",
};

/** @type {{ url: string; out: string; credit: string }[]} */
const WIKIMEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Nagadipa_temple.jpg",
    out: "Nainativu Nagadeepa Temple.webp",
    credit: "Nagadipa temple.jpg — Wikimedia Commons",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/39/Nillaveli_Beach.JPG",
    out: "Nilaveli Beach.webp",
    credit: "Nillaveli Beach.JPG — Anton Croos / Wikimedia Commons (CC)",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Passikudah_Beach.jpg",
    out: "Pasikuda Beach.webp",
    credit: "Passikudah Beach.jpg — Knthabrew / Wikimedia Commons (CC BY-SA 4.0)",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Tangalle_Beach%2C_Sri_Lanka_%2840081697721%29.jpg",
    out: "Tangalle Beach.webp",
    credit: "Tangalle Beach — Wikimedia Commons (CC)",
  },
];

/** Existing files to recompress only when smaller than 1600×900 (skipped if locked). */
const REFRESH_ONLY = [];

function findAsset(fragment) {
  if (!fs.existsSync(assetsDir)) return null;
  const hit = fs.readdirSync(assetsDir).find((name) => name.includes(fragment));
  return hit ? path.join(assetsDir, hit) : null;
}

async function toHeroWebp(input, output) {
  let quality = 82;
  let lastBuf = null;

  for (let i = 0; i < 8; i++) {
    lastBuf = await sharp(input)
      .rotate()
      .resize(1600, 900, { fit: "cover", position: "centre" })
      .webp({ quality, effort: 4 })
      .toBuffer();

    const kb = lastBuf.length / 1024;
    if (kb >= 195 && kb <= 410) break;
    if (kb > 410) quality = Math.max(58, quality - 7);
    else quality = Math.min(90, quality + 6);
  }

  fs.writeFileSync(output, lastBuf);
  return lastBuf.length;
}

async function downloadToTemp(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(outDir, `.tmp-${path.basename(url)}`);
  fs.writeFileSync(tmp, buf);
  return tmp;
}

console.log("Optimizing destination images…\n");

for (const [fragment, filename] of Object.entries(ASSET_OUTPUTS)) {
  const src = findAsset(fragment);
  const dest = path.join(outDir, filename);
  if (!src) {
    console.warn(`⚠ missing asset for ${filename} (${fragment})`);
    continue;
  }
  const bytes = await toHeroWebp(src, dest);
  console.log(`✓ ${filename} (${Math.round(bytes / 1024)} KB)`);
}

for (const { url, out, credit } of WIKIMEDIA) {
  const dest = path.join(outDir, out);
  const tmp = await downloadToTemp(url);
  const bytes = await toHeroWebp(tmp, dest);
  fs.unlinkSync(tmp);
  console.log(`✓ ${out} (${Math.round(bytes / 1024)} KB) — ${credit}`);
}

for (const filename of REFRESH_ONLY) {
  const src = path.join(outDir, filename);
  if (!fs.existsSync(src)) continue;
  const tmp = path.join(outDir, `.refresh-${filename}`);
  const bytes = await toHeroWebp(src, tmp);
  fs.renameSync(tmp, src);
  console.log(`✓ refreshed ${filename} (${Math.round(bytes / 1024)} KB)`);
}

/** Tour hero cards used by northern destinations on the interactive map. */
const TOUR_HERO_FROM_DEST = [
  ["Jaffna Fort.webp", "jaffna-fort-aerial.webp"],
  ["Delft Island.webp", "delft-island-coral-beach.webp"],
  ["Nainativu Nagadeepa Temple.webp", "nainativu-sacred-island.webp"],
  ["Nallur Kandaswamy Temple.webp", "nallur-kandaswamy-temple.webp"],
];

for (const [srcName, tourName] of TOUR_HERO_FROM_DEST) {
  const src = path.join(outDir, srcName);
  const dest = path.join(toursDir, tourName);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ skip tour hero ${tourName} — missing ${srcName}`);
    continue;
  }
  const bytes = await toHeroWebp(src, dest);
  console.log(`✓ tours/${tourName} (${Math.round(bytes / 1024)} KB)`);
}

const required = [
  ...Object.values(ASSET_OUTPUTS),
  ...WIKIMEDIA.map((w) => w.out),
];
const missing = required.filter((f) => !fs.existsSync(path.join(outDir, f)));
if (missing.length) {
  console.warn("\nMissing files:");
  for (const f of missing) console.warn(`  ${f}`);
  process.exit(1);
}

console.log("\nAll destination images optimized.");
