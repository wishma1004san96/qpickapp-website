export {
  QPICK_VEHICLE_ICON_IDS,
  QPICK_VEHICLE_ICON_LABELS,
  TAXI_VEHICLE_TO_ICON,
  resolveVehicleIconId,
  type QPickVehicleIconId,
} from "./types";

export {
  VEHICLE_ICON_PUBLIC_PATHS,
  VEHICLE_PHOTO_PUBLIC_PATHS,
  vehiclePhotoSrc,
} from "./paths";

export {
  DEFAULT_FLEET_PHOTO_SRC,
  FLEET_VEHICLE_CAPACITY,
  fleetCapacityForTaxiId,
  fleetVehicleNameKey,
  fleetVehiclePhoto,
  requireFleetVehiclePhoto,
  type FleetVehiclePhoto,
} from "./fleet-catalog";

export {
  BikeGlyph,
  TukGlyph,
  MiniGlyph,
  FlexGlyph,
  SedanGlyph,
  MinivanGlyph,
  FrVanGlyph,
  SuvGlyph,
  MiniBusGlyph,
  BusGlyph,
  VEHICLE_GLYPHS,
  VEHICLE_ICON_VIEWBOX,
  VEHICLE_ICON_STROKE,
} from "./vehicle-glyphs";

export { VehicleIcon, VehicleIconTile } from "./vehicle-icon";
