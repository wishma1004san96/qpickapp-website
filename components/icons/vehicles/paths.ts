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
  // Q Flex = compact hatchback (former Mini glyph/asset)
  flex: "/icons/vehicles/mini.svg",
  // Q Mini = Wagon R upgrade (former Flex glyph as SVG stand-in)
  mini: "/icons/vehicles/flex.svg",
  sedan: "/icons/vehicles/sedan.svg",
  minivan: "/icons/vehicles/minivan.svg",
  frVan: "/icons/vehicles/fr-van.svg",
  highRoofVan: "/icons/vehicles/fr-van.svg",
  suv: "/icons/vehicles/suv.svg",
  miniBus: "/icons/vehicles/mini-bus.svg",
  bus: "/icons/vehicles/bus.svg",
};

/**
 * Transparent WebP photo cutouts.
 * Q Flex → former Mini hatchback photo
 * Q Mini → Wagon R photo
 * Q Flat Roof Van → flat-roof-van
 * Q High Roof Van → high-roof-van
 */
export const VEHICLE_PHOTO_PUBLIC_PATHS: Record<QPickVehicleIconId, string> = {
  bike: "/images/fleet/vehicles/bike.webp",
  tuk: "/images/fleet/vehicles/tuk.webp",
  flex: "/images/fleet/vehicles/mini.webp",
  mini: "/images/fleet/vehicles/wagon-r.png",
  sedan: "/images/fleet/vehicles/sedan.webp",
  minivan: "/images/fleet/vehicles/minivan.webp",
  frVan: "/images/fleet/vehicles/flat-roof-van.webp",
  highRoofVan: "/images/fleet/vehicles/high-roof-van.webp",
  suv: "/images/fleet/vehicles/suv.webp",
  miniBus: "/images/fleet/vehicles/mini-bus.webp",
  bus: "/images/fleet/vehicles/bus.webp",
};

export function vehiclePhotoSrc(id: string): string | null {
  const iconId = resolveVehicleIconId(id);
  if (!iconId) return null;
  return VEHICLE_PHOTO_PUBLIC_PATHS[iconId] ?? null;
}
