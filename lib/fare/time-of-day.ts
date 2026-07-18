/**
 * Day / night window for Sri Lanka (Asia/Colombo).
 * Day  05:00–21:59 · Night 22:00–04:59
 */

import type { TimeOfDay } from "@/lib/fare/types";

const COLOMBO = "Asia/Colombo";

export function getColomboHour(at: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: COLOMBO,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(at);
  const hour = parts.find((p) => p.type === "hour")?.value;
  const n = hour != null ? Number.parseInt(hour, 10) : at.getHours();
  return Number.isFinite(n) ? n : 0;
}

export function resolveTimeOfDay(
  at?: Date | string | number,
): TimeOfDay {
  const date =
    at == null
      ? new Date()
      : at instanceof Date
        ? at
        : new Date(at);
  const instant = Number.isNaN(date.getTime()) ? new Date() : date;
  const hour = getColomboHour(instant);
  // 05:00–21:59 inclusive → day; 22:00–04:59 → night
  return hour >= 5 && hour <= 21 ? "day" : "night";
}

export function resolvePeriodRates(
  timeOfDay: TimeOfDay,
  settings: {
    dayBaseFare: number;
    dayPerKmRate: number;
    nightBaseFare: number;
    nightPerKmRate: number;
  },
): { baseFare: number; perKmRate: number } {
  if (timeOfDay === "night") {
    return {
      baseFare: settings.nightBaseFare,
      perKmRate: settings.nightPerKmRate,
    };
  }
  return {
    baseFare: settings.dayBaseFare,
    perKmRate: settings.dayPerKmRate,
  };
}
