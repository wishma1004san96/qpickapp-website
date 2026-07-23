/**
 * Ensures every configured locale has a messages/*.json file.
 * New locales copy English until professionally translated.
 * Run: node scripts/generate-locale-files.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagesDir = path.join(root, "messages");
const enPath = path.join(messagesDir, "en.json");

const locales = [
  "en",
  "si",
  "ta",
  "de",
  "fr",
  "es",
  "it",
  "ru",
  "zh",
  "ja",
  "ko",
  "nl",
  "pt",
  "pl",
  "sv",
  "da",
  "no",
  "fi",
  "ar",
  "hi",
];

const en = fs.readFileSync(enPath, "utf8");

for (const locale of locales) {
  const target = path.join(messagesDir, `${locale}.json`);
  if (locale === "en") continue;
  if (fs.existsSync(target)) {
    console.log(`• keep ${locale}.json`);
    continue;
  }
  fs.writeFileSync(target, en, "utf8");
  console.log(`✓ created ${locale}.json from en.json`);
}

console.log(`\nLocale files ready (${locales.length} languages).`);
