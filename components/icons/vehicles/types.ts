/**
 * Q Pick vehicle icon pack — canonical category IDs.
 * Maps cleanly onto booking / fare / admin vehicle catalogs.
 *
 * Display order (Fleet):
 * Q Bike → Q Tuk → Q Flex → Q Mini → Q Sedan → Q Minivan →
 * Q Flat Roof Van → Q High Roof Van → Q SUV → Q Mini Bus → Q Bus
 */

export const QPICK_VEHICLE_ICON_IDS = [
  "bike",
  "tuk",
  "flex",
  "mini",
  "sedan",
  "minivan",
  "frVan",
  "highRoofVan",
  "suv",
  "miniBus",
  "bus",
] as const;

export type QPickVehicleIconId = (typeof QPICK_VEHICLE_ICON_IDS)[number];

/** Display labels for design systems / Storybook / admin. */
export const QPICK_VEHICLE_ICON_LABELS: Record<QPickVehicleIconId, string> = {
  bike: "Q Bike",
  tuk: "Q Tuk",
  flex: "Q Flex",
  mini: "Q Mini",
  sedan: "Q Sedan",
  minivan: "Q Minivan",
  frVan: "Q Flat Roof Van",
  highRoofVan: "Q High Roof Van",
  suv: "Q SUV",
  miniBus: "Q Mini Bus",
  bus: "Q Bus",
};

/**
 * Map product / fare vehicle IDs → icon pack IDs.
 * Q Flex = compact hatchback (ex-Mini). Q Mini = Wagon R (ex-Flex / wagon).
 * frVan = flat roof; highRoofVan / longVan = high roof airport van.
 */
export const TAXI_VEHICLE_TO_ICON: Record<string, QPickVehicleIconId> = {
  bike: "bike",
  tuk: "tuk",
  flex: "flex",
  mini: "flex",
  miniCar: "flex",
  wagon: "mini",
  sedan: "sedan",
  minivan: "minivan",
  miniVan: "minivan",
  frVan: "frVan",
  van: "frVan",
  flatRoofVan: "frVan",
  highRoofVan: "highRoofVan",
  longVan: "highRoofVan",
  suv: "suv",
  miniBus: "miniBus",
  bus: "bus",
  longBus: "bus",
};

export function resolveVehicleIconId(
  id: string,
): QPickVehicleIconId | null {
  if ((QPICK_VEHICLE_ICON_IDS as readonly string[]).includes(id)) {
    return id as QPickVehicleIconId;
  }
  return TAXI_VEHICLE_TO_ICON[id] ?? null;
}
