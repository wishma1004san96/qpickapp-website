/**
 * One-shot generator: TSV → data/airport-rates.ts
 * Run: node scripts/generate-airport-rates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const tsvPath = path.join(root, ".tmp-airport-rates.tsv");

function titleCase(s) {
  return s
    .split(/(\s+|-\s*|\(|\))/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || part === "(" || part === ")" || part === "-") {
        return part;
      }
      const t = part.trim();
      if (!t) return part;
      if (/^[A-Z0-9.]+$/.test(t) && t.includes(".")) return t;
      return t
        .split(/\s+/)
        .map((w) => {
          if (/^via$/i.test(w)) return "via";
          if (/^\d+$/.test(w)) return w;
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(" ");
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

const raw = fs.readFileSync(tsvPath, "utf8");
const rows = [];

for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("Code") || t.startsWith("@")) continue;
  const m = t.match(/^([A-Z]\d{3})\t(.+)\t([\d.]+)$/);
  if (!m) {
    console.error("BAD LINE:", t);
    process.exit(1);
  }
  rows.push({
    code: m[1],
    destination: titleCase(m[2]),
    rate: Math.round(Number(m[3])),
    currency: "LKR",
    active: true,
  });
}

rows.sort(
  (a, b) =>
    a.destination.localeCompare(b.destination) || a.code.localeCompare(b.code),
);

const records = rows
  .map(
    (r) =>
      `  {\n    code: "${r.code}",\n    destination: ${JSON.stringify(r.destination)},\n    rate: ${r.rate},\n    currency: "LKR",\n    active: true,\n  }`,
  )
  .join(",\n");

const out = `/**
 * Official Q Pick airport transfer rates (Bandaranaike / CMB).
 * Air-conditioned one-way fares in LKR — sourced from the official rate list.
 */

export type AirportRateCurrency = "LKR";

export type AirportRate = {
  code: string;
  destination: string;
  rate: number;
  currency: AirportRateCurrency;
  active: boolean;
};

export const AIRPORT_RATES: readonly AirportRate[] = [
${records},
] as const;

export const AIRPORT_ORIGIN =
  "Bandaranaike International Airport (CMB)" as const;

/** Popular quick-pick destinations (codes must exist in AIRPORT_RATES). */
export const POPULAR_AIRPORT_DESTINATION_CODES = [
  "N015", // Negombo
  "C002", // Colombo 01 - Fort
  "K015", // Kandy
  "G008", // Galle
  "B016", // Bentota
  "H015", // Hikkaduwa
  "S005", // Sigiriya
  "D001", // Dambulla
  "H022", // Haputale (Ella corridor — Ella not on official list)
  "M042", // Mirissa
] as const;

export type PopularAirportDestinationCode =
  (typeof POPULAR_AIRPORT_DESTINATION_CODES)[number];

const byCode = new Map(AIRPORT_RATES.map((r) => [r.code, r]));

export function getAirportRateByCode(code: string): AirportRate | undefined {
  return byCode.get(code.toUpperCase());
}

export function getPopularAirportRates(): AirportRate[] {
  return POPULAR_AIRPORT_DESTINATION_CODES.map((code) => {
    const row = getAirportRateByCode(code);
    if (!row) throw new Error(\`Missing popular airport rate: \${code}\`);
    return row;
  });
}

export function formatAirportFare(
  rate: number,
  currency: AirportRateCurrency = "LKR",
): string {
  return \`\${currency} \${rate.toLocaleString("en-LK")}\`;
}

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\\s+/g, " ");
}

/**
 * Fast autocomplete search by destination name or code.
 * Ranking: exact code > prefix match > includes match.
 */
export function searchAirportRates(query: string, limit = 8): AirportRate[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const active = AIRPORT_RATES.filter((r) => r.active);
  const codeExact: AirportRate[] = [];
  const prefix: AirportRate[] = [];
  const includes: AirportRate[] = [];

  for (const row of active) {
    const code = row.code.toLowerCase();
    const dest = row.destination.toLowerCase();
    if (code === q) {
      codeExact.push(row);
      continue;
    }
    if (code.startsWith(q) || dest.startsWith(q)) {
      prefix.push(row);
      continue;
    }
    if (code.includes(q) || dest.includes(q)) {
      includes.push(row);
    }
  }

  return [...codeExact, ...prefix, ...includes].slice(0, limit);
}
`;

const outPath = path.join(root, "data", "airport-rates.ts");
fs.writeFileSync(outPath, out);
console.log(`Wrote ${rows.length} rates → ${outPath}`);
console.log("Kandy:", rows.find((r) => r.code === "K015"));
