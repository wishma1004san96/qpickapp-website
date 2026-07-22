/**
 * Single source of truth for Fleet + Booking vehicle display capacity.
 * Fare engine IDs stay in `taxi-fare-vehicles.ts` (pricing). Photos live in `paths.ts`.
 */

import { VEHICLE_PHOTO_PUBLIC_PATHS } from "@/components/icons/vehicles/paths";
import {
  QPICK_VEHICLE_ICON_LABELS,
  resolveVehicleIconId,
  type QPickVehicleIconId,
} from "@/components/icons/vehicles/types";
import type { TaxiVehicleId } from "@/lib/taxi-fare-vehicles";

/** Default fleet photo when a product id cannot be resolved. */
export const DEFAULT_FLEET_PHOTO_SRC = VEHICLE_PHOTO_PUBLIC_PATHS.sedan;

export type FleetVehiclePhoto = {
  src: string;
  alt: string;
  name: string;
  iconId: QPickVehicleIconId;
};

/** Official Q Pick fleet photo + label for any fare / tour / transfer vehicle id. */
export function fleetVehiclePhoto(id: string): FleetVehiclePhoto | null {
  const iconId = resolveVehicleIconId(id);
  if (!iconId) return null;
  const name = QPICK_VEHICLE_ICON_LABELS[iconId];
  return {
    iconId,
    src: VEHICLE_PHOTO_PUBLIC_PATHS[iconId],
    alt: `${name} — official Q Pick fleet vehicle`,
    name,
  };
}

export function requireFleetVehiclePhoto(id: string): FleetVehiclePhoto {
  return (
    fleetVehiclePhoto(id) ?? {
      iconId: "sedan",
      src: DEFAULT_FLEET_PHOTO_SRC,
      name: QPICK_VEHICLE_ICON_LABELS.sedan,
      alt: `${QPICK_VEHICLE_ICON_LABELS.sedan} — official Q Pick fleet vehicle`,
    }
  );
}

/** Passengers / luggage — must match `pages.ride.fleet.vehicles` copy. */
export const FLEET_VEHICLE_CAPACITY: Record<
  QPickVehicleIconId,
  { passengers: number; luggage: number }
> = {
  bike: { passengers: 1, luggage: 1 },
  tuk: { passengers: 3, luggage: 2 },
  flex: { passengers: 3, luggage: 2 },
  mini: { passengers: 4, luggage: 2 },
  sedan: { passengers: 4, luggage: 2 },
  minivan: { passengers: 6, luggage: 4 },
  frVan: { passengers: 8, luggage: 6 },
  highRoofVan: { passengers: 10, luggage: 8 },
  suv: { passengers: 5, luggage: 4 },
  miniBus: { passengers: 12, luggage: 8 },
  bus: { passengers: 20, luggage: 12 },
};

/** i18n path for the Fleet-branded display name of a fare / icon vehicle id. */
export function fleetVehicleNameKey(id: string): string | null {
  const iconId = resolveVehicleIconId(id);
  if (!iconId) return null;
  return `pages.ride.fleet.vehicles.${iconId}.name`;
}

export function fleetCapacityForTaxiId(id: TaxiVehicleId): {
  passengers: number;
  luggage: number;
} {
  const iconId = resolveVehicleIconId(id);
  if (!iconId) {
    return { passengers: 4, luggage: 2 };
  }
  return FLEET_VEHICLE_CAPACITY[iconId];
}
