/**
 * Public asset paths for the Q Pick vehicle icon pack + photo cutouts.
 * Prefer React `VehicleIcon` / photo Image on web; use these URLs in native apps.
 */

import {
  resolveVehicleIconId,
  type QPickVehicleIconId,
} from "@/components/icons/vehicles/types";

export const VEHICLE_ICON_PUBLIC_PATHS: Record<QPickVehicleIconId, string> = {
  bike: "/icons/vehicles/bike.svg",
  tuk: "/icons/vehicles/tuk.svg",
  mini: "/icons/vehicles/mini.svg",
  flex: "/icons/vehicles/flex.svg",
  sedan: "/icons/vehicles/sedan.svg",
  minivan: "/icons/vehicles/minivan.svg",
  frVan: "/icons/vehicles/fr-van.svg",
  suv: "/icons/vehicles/suv.svg",
  miniBus: "/icons/vehicles/mini-bus.svg",
  bus: "/icons/vehicles/bus.svg",
};

/** Transparent WebP photo cutouts from the fleet showcase. */
export const VEHICLE_PHOTO_PUBLIC_PATHS: Record<QPickVehicleIconId, string> = {
  bike: "/images/fleet/vehicles/bike.webp",
  tuk: "/images/fleet/vehicles/tuk.webp",
  mini: "/images/fleet/vehicles/mini.webp",
  flex: "/images/fleet/vehicles/flex.webp",
  sedan: "/images/fleet/vehicles/sedan.webp",
  minivan: "/images/fleet/vehicles/minivan.webp",
  frVan: "/images/fleet/vehicles/fr-van.webp",
  suv: "/images/fleet/vehicles/suv.webp",
  miniBus: "/images/fleet/vehicles/mini-bus.webp",
  bus: "/images/fleet/vehicles/bus.webp",
};

export function vehiclePhotoSrc(id: string): string | null {
  const iconId = resolveVehicleIconId(id);
  if (!iconId) return null;
  return VEHICLE_PHOTO_PUBLIC_PATHS[iconId] ?? null;
}
