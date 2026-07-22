import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(webp|png|jpg|jpeg|svg|gif|avif)$/i.test(ent.name)) acc.push(p);
  }
  return acc;
}

const publicFiles = walk(publicDir);
const publicSet = new Map(
  publicFiles.map((f) => {
    const rel = path.relative(publicDir, f).replace(/\\/g, "/");
    return [rel, f];
  }),
);

function checkPath(urlPath) {
  const rel = urlPath.replace(/^\//, "");
  let decoded;
  try {
    decoded = decodeURI(rel);
  } catch {
    decoded = rel;
  }

  if (publicSet.has(rel)) return { ok: true, actual: rel };
  if (publicSet.has(decoded)) return { ok: true, actual: decoded };

  const lower = rel.toLowerCase();
  const found = [...publicSet.keys()].find(
    (k) => k.toLowerCase() === lower || k.toLowerCase() === decoded.toLowerCase(),
  );
  if (found) return { ok: false, issue: "case", ref: rel, actual: found };
  return { ok: false, issue: "missing", ref: rel };
}

const issues = [];

// Catalog filenames
const catalogPath = path.join(root, "lib/destination-image-catalog.ts");
const catalog = fs.readFileSync(catalogPath, "utf8");
const fileMatches = [...catalog.matchAll(/:\s*"([^"]+\.(webp|png|jpg|jpeg))"/g)].map((m) => m[1]);
for (const filename of [...new Set(fileMatches)]) {
  const result = checkPath(`/images/destinations/${filename}`);
  if (!result.ok) {
    issues.push({ source: "destination-image-catalog", ...result });
  }
}

// Hardcoded /images/ and /icons/ paths in source
let rgOutput = "";
try {
  rgOutput = execSync(
    `rg -o "/(?:images|icons)/[A-Za-z0-9_./()%' -+]+" --glob "!node_modules" --glob "!.next" --glob "!scripts" "${root}"`,
    { encoding: "utf8" },
  );
} catch (e) {
  rgOutput = e.stdout?.toString() ?? "";
}

const hardcoded = [
  ...new Set(
    rgOutput
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/"([^"]+)"/);
        return m?.[1];
      })
      .filter(Boolean),
  ),
];

for (const p of hardcoded) {
  const result = checkPath(p);
  if (!result.ok) {
    issues.push({ source: "hardcoded", path: p, ...result });
  }
}

// Gallery registry
const galleryPath = path.join(root, "lib/tours/gallery/index.ts");
if (fs.existsSync(galleryPath)) {
  const gallery = fs.readFileSync(galleryPath, "utf8");
  const galleryPaths = [...gallery.matchAll(/\/images\/[^"']+/g)].map((m) => m[0]);
  for (const p of [...new Set(galleryPaths)]) {
    const result = checkPath(p);
    if (!result.ok) issues.push({ source: "gallery", path: p, ...result });
  }
}

console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2));
