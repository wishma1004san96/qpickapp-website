/**
 * Prefill for Airport Transfer booking only — never shared with Ride Requests.
 */
export const AIRPORT_TRANSFER_PREFILL_KEY =
  "qpick:airport-transfer-prefill:v1";

export type AirportTransferPrefill = {
  v: 1;
  destination: string;
  destinationCode: string;
  date: string;
  time: string;
  passengers: number;
  luggage: string;
  vehicle: string;
  nationality: string;
  specialRequest: string;
  officialFareLkr: number;
  createdAt: number;
};

export function saveAirportTransferPrefill(
  payload: Omit<AirportTransferPrefill, "v" | "createdAt">,
): void {
  if (typeof window === "undefined") return;
  const full: AirportTransferPrefill = {
    ...payload,
    v: 1,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(AIRPORT_TRANSFER_PREFILL_KEY, JSON.stringify(full));
}

export function consumeAirportTransferPrefill(): AirportTransferPrefill | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AIRPORT_TRANSFER_PREFILL_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(AIRPORT_TRANSFER_PREFILL_KEY);
  try {
    return JSON.parse(raw) as AirportTransferPrefill;
  } catch {
    return null;
  }
}
