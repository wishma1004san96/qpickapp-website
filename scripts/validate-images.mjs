/**
 * Pre-build image path validator — case-sensitive checks for Linux/Vercel.
 * Fails the build when any referenced public asset is missing or case-mismatched.
 */
import fs from "fs";
import path from "path";
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
const publicSet = new Set(
  publicFiles.map((f) => path.relative(publicDir, f).replace(/\\/g, "/")),
);

/** @type {{ component: string, expected: string, actual: string | null, issue: string }[]} */
const failures = [];

function report(component, urlPath, issue, actual = null) {
  failures.push({
    component,
    expected: urlPath,
    actual,
    issue,
  });
}

function checkUrl(component, urlPath) {
  const rel = urlPath.replace(/^\//, "");
  let decoded = rel;
  try {
    decoded = decodeURI(rel);
  } catch {
    /* keep rel */
  }

  if (publicSet.has(rel)) return true;
  if (publicSet.has(decoded)) return true;

  const lower = rel.toLowerCase();
  const found = [...publicSet].find(
    (k) => k.toLowerCase() === lower || k.toLowerCase() === decoded.toLowerCase(),
  );
  if (found) {
    report(component, urlPath, "case-sensitive mismatch (breaks on Linux/Vercel)", `/${found}`);
    return false;
  }

  report(component, urlPath, "file not found in public/", null);
  return false;
}

function extractQuotedFilenames(filePath, label) {
  const text = fs.readFileSync(filePath, "utf8");
  const matches = [...text.matchAll(/:\s*"([^"]+\.(webp|png|jpg|jpeg|svg))"/g)].map((m) => m[1]);
  for (const filename of [...new Set(matches)]) {
    checkUrl(label, `/images/destinations/${filename}`);
  }
}

// 1. Destination + landmark catalog
const catalogPath = path.join(root, "lib/destination-image-catalog.ts");
extractQuotedFilenames(catalogPath, "lib/destination-image-catalog.ts");

// 2. Gallery story paths
const galleryPath = path.join(root, "lib/tours/gallery/index.ts");
const gallery = fs.readFileSync(galleryPath, "utf8");
for (const p of [...new Set([...gallery.matchAll(/\/images\/[^"']+/g)].map((m) => m[0]))]) {
  checkUrl("lib/tours/gallery/index.ts", p);
}

// 3. Vehicle photo + icon paths
const vehiclePaths = path.join(root, "components/icons/vehicles/paths.ts");
const vehicleText = fs.readFileSync(vehiclePaths, "utf8");
for (const p of [...new Set([...vehicleText.matchAll(/"(\/(?:images|icons)\/[^"]+)"/g)].map((m) => m[1]))]) {
  checkUrl("components/icons/vehicles/paths.ts", p);
}

function collectSourceFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next" || ent.name === "scripts") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectSourceFiles(p, acc);
    else if (/\.(ts|tsx|js|jsx|css|mdx)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const hardcodedPattern =
  /["'](\/(?:images|icons)\/[^"']+\.(?:webp|png|jpg|jpeg|svg|gif|avif))["']/g;
const hardcoded = new Set();
for (const file of collectSourceFiles(root)) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(hardcodedPattern)) {
    hardcoded.add(match[1]);
  }
}

for (const p of hardcoded) {
  checkUrl("hardcoded source reference", p);
}

// 5. Resolve encoded catalog URLs (spaces, parentheses)
const catalog = fs.readFileSync(catalogPath, "utf8");
const allFilenames = [
  ...catalog.matchAll(/:\s*"([^"]+\.webp)"/g),
].map((m) => m[1]);
for (const filename of [...new Set(allFilenames)]) {
  const encoded = `/images/destinations/${encodeURI(filename)}`;
  checkUrl(`destinationImagePublicPath(${filename})`, encoded);
}

if (failures.length > 0) {
  console.error("\n❌ Image validation failed:\n");
  for (const f of failures) {
    console.error(`  [${f.issue}]`);
    console.error(`    component: ${f.component}`);
    console.error(`    expected:  ${f.expected}`);
    if (f.actual) console.error(`    actual:    ${f.actual}`);
    console.error("");
  }
  process.exit(1);
}

console.log(`✅ Image validation passed (${publicSet.size} public assets, ${hardcoded.size} hardcoded paths checked).`);
