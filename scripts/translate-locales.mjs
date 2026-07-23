/**
 * Translates messages/en.json into all locale files using Google Translate (gtx).
 * Preserves si/ta human translations; only fills keys that still match English.
 *
 * Run: node scripts/translate-locales.mjs
 * Optional: node scripts/translate-locales.mjs de fr   (subset of locales)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagesDir = path.join(root, "messages");
const enPath = path.join(messagesDir, "en.json");

const ALL_LOCALES = [
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

/** Google Translate language codes */
const LOCALE_TO_GOOGLE = {
  si: "si",
  ta: "ta",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  ru: "ru",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
  nl: "nl",
  pt: "pt",
  pl: "pl",
  sv: "sv",
  da: "da",
  no: "no",
  fi: "fi",
  ar: "ar",
  hi: "hi",
};

const PRESERVE_LOCALES = new Set(["si", "ta"]);
const BATCH_SIZE = 40;
const DELAY_MS = 350;
const SPLIT = "\n<<<QP_SPLIT>>>\n";

const BRAND_TOKENS = [
  ["Q Pick", "__QP_BRAND__"],
  ["Quick Pick", "__QP_LEGAL__"],
  ["Sri Lanka", "__QP_COUNTRY__"],
  ["Bandaranaike International", "__QP_AIRPORT__"],
  ["CMB", "__QP_CMB__"],
  ["LKR", "__QP_LKR__"],
  ["WhatsApp", "__QP_WA__"],
  ["qpick.lk", "__QP_DOMAIN__"],
  ["support@qpick.lk", "__QP_EMAIL__"],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function protectString(text) {
  let out = text;
  const vars = [];
  out = out.replace(/\{(\w+)\}/g, (_, name) => {
    const token = `__QP_VAR_${vars.length}__`;
    vars.push({ token, restore: `{${name}}` });
    return token;
  });
  for (const [phrase, token] of BRAND_TOKENS) {
    out = out.split(phrase).join(token);
  }
  return { text: out, vars };
}

function restoreString(text, vars) {
  let out = text;
  for (const [phrase, token] of BRAND_TOKENS) {
    out = out.split(token).join(phrase);
  }
  for (const { token, restore } of vars) {
    out = out.split(token).join(restore);
  }
  return out;
}

function shouldSkipTranslation(text) {
  if (!text || !text.trim()) return true;
  if (/^https?:\/\//.test(text)) return true;
  if (/^\/[\w/-]*$/.test(text)) return true;
  if (/^[\d\s·•|,./:+\-–—()]+$/.test(text)) return true;
  if (/^LKR\s?[\d,]+$/.test(text)) return true;
  if (text === "Q Pick") return true;
  return false;
}

async function translateBatch(strings, targetLang) {
  if (strings.length === 0) return [];

  const protected_ = strings.map(protectString);
  const payload = protected_.map((p) => p.text).join(SPLIT);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(payload)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    throw new Error(`Translate HTTP ${res.status} for ${targetLang}`);
  }
  const data = await res.json();
  const translated = data[0].map((chunk) => chunk[0]).join("");
  const parts = translated.split("<<<QP_SPLIT>>>");
  if (parts.length !== strings.length) {
    // Fallback: translate one-by-one if batch split failed
    const results = [];
    for (const str of strings) {
      await sleep(DELAY_MS);
      const single = await translateBatch([str], targetLang);
      results.push(single[0]);
    }
    return results;
  }
  return parts.map((part, i) => restoreString(part.trim(), protected_[i].vars));
}

function collectLeaves(obj, prefix = "") {
  const leaves = [];
  if (typeof obj === "string") {
    leaves.push({ path: prefix, value: obj });
    return leaves;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      leaves.push(...collectLeaves(item, prefix ? `${prefix}.${index}` : String(index)));
    });
    return leaves;
  }
  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${key}` : key;
      leaves.push(...collectLeaves(value, next));
    }
  }
  return leaves;
}

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const nextIsIndex = /^\d+$/.test(nextPart);
    if (Array.isArray(current)) {
      const index = Number(part);
      if (current[index] === undefined) current[index] = nextIsIndex ? [] : {};
      current = current[index];
    } else {
      if (current[part] === undefined) current[part] = nextIsIndex ? [] : {};
      current = current[part];
    }
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(current)) {
    current[Number(last)] = value;
  } else {
    current[last] = value;
  }
}

function getByPath(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    if (Array.isArray(current)) {
      current = current[Number(part)];
    } else {
      current = current[part];
    }
  }
  return current;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function translateLocale(locale, en, existing) {
  const googleLang = LOCALE_TO_GOOGLE[locale];
  if (!googleLang) throw new Error(`No Google lang for ${locale}`);

  const preserve = PRESERVE_LOCALES.has(locale);
  const base = preserve && existing ? deepClone(existing) : deepClone(en);
  const enLeaves = collectLeaves(en);
  const toTranslate = [];

  for (const { path, value } of enLeaves) {
    if (shouldSkipTranslation(value)) continue;
    if (preserve) {
      const current = getByPath(base, path);
      const enVal = getByPath(en, path);
      if (typeof current === "string" && current !== enVal) continue;
    }
    toTranslate.push({ path, value });
  }

  console.log(`  ${locale}: ${toTranslate.length} strings to translate`);

  for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
    const batch = toTranslate.slice(i, i + BATCH_SIZE);
    const values = batch.map((b) => b.value);
    let translated;
    try {
      translated = await translateBatch(values, googleLang);
    } catch (err) {
      console.warn(`  batch retry (${locale}):`, err.message);
      await sleep(2000);
      translated = await translateBatch(values, googleLang);
    }
    batch.forEach((item, j) => {
      setByPath(base, item.path, translated[j] ?? item.value);
    });
    const pct = Math.min(100, Math.round(((i + batch.length) / toTranslate.length) * 100));
    process.stdout.write(`\r  ${locale}: ${pct}%`);
    await sleep(DELAY_MS);
  }
  process.stdout.write("\n");
  return base;
}

const targetLocales =
  process.argv.length > 2 ? process.argv.slice(2) : ALL_LOCALES;

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

console.log(`Translating en.json → ${targetLocales.join(", ")}`);

for (const locale of targetLocales) {
  const targetPath = path.join(messagesDir, `${locale}.json`);
  const existing = fs.existsSync(targetPath)
    ? JSON.parse(fs.readFileSync(targetPath, "utf8"))
    : null;
  console.log(`\n▶ ${locale}`);
  const translated = await translateLocale(locale, en, existing);
  fs.writeFileSync(targetPath, `${JSON.stringify(translated, null, 2)}\n`, "utf8");
  console.log(`✓ wrote ${locale}.json`);
}

console.log("\nDone.");
