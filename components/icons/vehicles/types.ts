/**
 * Q Pick vehicle icon pack — canonical category IDs.
 * Maps cleanly onto booking / fare / admin vehicle catalogs.
 */

export const QPICK_VEHICLE_ICON_IDS = [
  "bike",
  "tuk",
  "mini",
  "flex",
  "sedan",
  "minivan",
  "frVan",
  "suv",
  "miniBus",
  "bus",
] as const;

export type QPickVehicleIconId = (typeof QPICK_VEHICLE_ICON_IDS)[number];

/** Display labels for design systems / Storybook / admin. */
export const QPICK_VEHICLE_ICON_LABELS: Record<QPickVehicleIconId, string> = {
  bike: "Bike",
  tuk: "Tuk",
  mini: "Mini",
  flex: "Flex",
  sedan: "Sedan",
  minivan: "Minivan",
  frVan: "FR Van",
  suv: "SUV",
  miniBus: "Mini Bus",
  bus: "Bus",
};

/**
 * Map product / fare vehicle IDs → icon pack IDs.
 * `van` and `longVan` share the Hiace-style FR Van glyph.
 */
export const TAXI_VEHICLE_TO_ICON: Record<string, QPickVehicleIconId> = {
  bike: "bike",
  tuk: "tuk",
  mini: "mini",
  miniCar: "mini",
  flex: "flex",
  wagon: "flex",
  sedan: "sedan",
  minivan: "minivan",
  miniVan: "minivan",
  frVan: "frVan",
  van: "frVan",
  longVan: "frVan",
  suv: "suv",
  miniBus: "miniBus",
  bus: "bus",
  longBus: "bus",
};

export function resolveVehicleIconId(
  id: string,
): QPickVehicleIconId | null {
  return TAXI_VEHICLE_TO_ICON[id] ?? null;
}
