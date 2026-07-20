import type { ArrivalInfo, PassengerInfo } from "./types";

/** Pack arrival extras into specialRequest — API schema unchanged. */
export function buildSpecialRequestPayload(
  arrival: ArrivalInfo,
  passenger: PassengerInfo,
): string {
  const lines = [
    arrival.flightNumber.trim()
      ? `Flight: ${arrival.flightNumber.trim().toUpperCase()}`
      : null,
    arrival.airline.trim() ? `Airline: ${arrival.airline.trim()}` : null,
    `Meet & Greet: ${arrival.meetAndGreet ? "Yes" : "No"}`,
    passenger.whatsapp.trim()
      ? `WhatsApp: ${passenger.whatsapp.trim()}`
      : null,
    passenger.specialRequests.trim() || null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const NATIONALITIES = [
  "Sri Lankan",
  "Indian",
  "British",
  "American",
  "Australian",
  "German",
  "French",
  "Chinese",
  "Japanese",
  "Other",
] as const;

export const AIRLINES = [
  "SriLankan Airlines",
  "Emirates",
  "Qatar Airways",
  "Etihad",
  "Singapore Airlines",
  "Cathay Pacific",
  "Air India",
  "IndiGo",
  "other",
] as const;
