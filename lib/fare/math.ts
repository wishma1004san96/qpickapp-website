/** Shared fare math helpers — reused by dynamic & standard engines. */

export function clampNonNeg(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

export function roundLkr(amount: number): number {
  return Math.round(amount);
}

/** Base Fare + (Distance × Per KM). */
export function calculateDistanceCharge(
  distanceKm: number,
  baseFare: number,
  perKmRate: number,
): { distanceKm: number; baseFare: number; perKmRate: number; distanceCharge: number } {
  const distance = clampNonNeg(distanceKm);
  const base = clampNonNeg(baseFare);
  const perKm = clampNonNeg(perKmRate);
  return {
    distanceKm: distance,
    baseFare: base,
    perKmRate: perKm,
    distanceCharge: base + distance * perKm,
  };
}

export function calculateBillableWaitingMinutes(
  waitingMinutes: number,
  freeWaitingMinutes: number,
): number {
  const waiting = clampNonNeg(waitingMinutes);
  const free = clampNonNeg(freeWaitingMinutes);
  return Math.max(0, waiting - free);
}

export function calculateWaitingCharge(
  waitingMinutes: number,
  freeWaitingMinutes: number,
  waitingPerMinute: number,
): { billableWaitingMinutes: number; waitingCharge: number } {
  const billable = calculateBillableWaitingMinutes(
    waitingMinutes,
    freeWaitingMinutes,
  );
  return {
    billableWaitingMinutes: billable,
    waitingCharge: billable * clampNonNeg(waitingPerMinute),
  };
}
