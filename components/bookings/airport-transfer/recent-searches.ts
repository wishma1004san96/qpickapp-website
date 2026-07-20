import type { AirportRate } from "@/lib/airport-rates";

const KEY = "qpick:airport-transfer-recent:v1";
const MAX = 6;

export type RecentDestination = {
  code: string;
  destination: string;
  rate: number;
  savedAt: number;
};

export function loadRecentDestinations(): RecentDestination[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentDestination[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveRecentDestination(rate: AirportRate): void {
  if (typeof window === "undefined") return;
  const next: RecentDestination = {
    code: rate.code,
    destination: rate.destination,
    rate: rate.rate,
    savedAt: Date.now(),
  };
  const prev = loadRecentDestinations().filter((r) => r.code !== rate.code);
  localStorage.setItem(KEY, JSON.stringify([next, ...prev].slice(0, MAX)));
}
