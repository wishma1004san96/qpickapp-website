import type {
  TourAccommodationId,
  TourPackage,
  TourPreferenceId,
  TourVehicleId,
} from "./types";
import { getDestinationBySlug, getPackageBySlug, getVehicleById } from "./repository";

export type TourPlannerPrefill = {
  packageSlug: string | null;
  packageTitle: string | null;
  destinations: string[];
  numberOfDays: number;
  vehicleId: TourVehicleId;
  vehicleApiValue: string;
};

export function prefillFromPackageSlug(slug: string | null | undefined): TourPlannerPrefill | null {
  if (!slug?.trim()) return null;
  const pkg = getPackageBySlug(slug.trim());
  if (!pkg) return null;
  const vehicle = getVehicleById(pkg.vehicleId);
  const destinations = pkg.destinationSlugs
    .map((s) => getDestinationBySlug(s)?.name ?? s)
    .filter(Boolean);

  return {
    packageSlug: pkg.slug,
    packageTitle: pkg.title,
    destinations,
    numberOfDays: pkg.durationDays,
    vehicleId: pkg.vehicleId,
    vehicleApiValue: vehicle?.apiValue ?? pkg.vehicleId,
  };
}

export function buildSpecialRequestPayload(input: {
  packageTitle?: string | null;
  preferences?: TourPreferenceId[];
  accommodation?: TourAccommodationId | null;
  notes?: string | null;
}): string | null {
  const lines: string[] = [];
  if (input.packageTitle?.trim()) {
    lines.push(`Package: ${input.packageTitle.trim()}`);
  }
  if (input.preferences?.length) {
    lines.push(`Preferences: ${input.preferences.join(", ")}`);
  }
  if (input.accommodation) {
    lines.push(`Accommodation: ${input.accommodation}`);
  }
  if (input.notes?.trim()) {
    lines.push(`Notes: ${input.notes.trim()}`);
  }
  if (lines.length === 0) return null;
  return lines.join("\n");
}

export function estimateTourStartingPrice(
  pkg: TourPackage | null,
  vehicleDayRate: number | null,
  days: number,
): number | null {
  if (pkg?.startingPriceLkr != null && days === pkg.durationDays) {
    return pkg.startingPriceLkr;
  }
  if (vehicleDayRate == null || !Number.isFinite(vehicleDayRate)) {
    return null;
  }
  return Math.max(1, days) * vehicleDayRate;
}

import { formatTourPriceLkr } from "./pricing-display";

/** Prefer formatTourPriceLkr — kept for planner summary compatibility. */
export function formatLkr(amount: number | null | undefined): string {
  return formatTourPriceLkr(amount);
}

export function addDaysISO(startISO: string, days: number): string {
  const start = new Date(`${startISO}T12:00:00`);
  if (Number.isNaN(start.getTime())) return "";
  start.setDate(start.getDate() + Math.max(days - 1, 0));
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
