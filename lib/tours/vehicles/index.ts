import { fleetVehiclePhoto } from "@/components/icons/vehicles/fleet-catalog";
import type { QPickVehicleIconId } from "@/components/icons/vehicles/types";
import type { TourVehicle, TourVehicleId } from "../types";

/** Tour catalog → official Q Pick fleet photo IDs (same as Choose Your Ride). */
export const TOUR_FLEET_IDS: Record<TourVehicleId, QPickVehicleIconId> = {
  sedan: "sedan",
  suv: "suv",
  van: "frVan",
  luxuryVan: "highRoofVan",
  miniCoach: "miniBus",
};

export function tourVehicleToFleetIcon(
  vehicleId: TourVehicleId,
): QPickVehicleIconId {
  return TOUR_FLEET_IDS[vehicleId];
}

function fleetVehicle(
  id: TourVehicleId,
  tagline: string,
  passengers: number,
  luggage: number,
  recommendedTourTypes: string[],
  apiValue: string,
  wifi = true,
): TourVehicle {
  const fleetId = TOUR_FLEET_IDS[id];
  const photo = fleetVehiclePhoto(fleetId)!;
  return {
    id,
    name: photo.name,
    tagline,
    imageSrc: photo.src,
    imageAlt: photo.alt,
    fleetIconId: fleetId,
    passengers,
    luggage,
    ac: true,
    wifi,
    chargingPorts: true,
    recommendedTourTypes,
    dayRateHintLkr: null,
    apiValue,
  };
}

export const TOUR_VEHICLES: TourVehicle[] = [
  fleetVehicle(
    "sedan",
    "Composed comfort for couples and small groups",
    4,
    2,
    ["Honeymoon", "City & short circuits", "Couple escapes"],
    "sedan",
    false,
  ),
  fleetVehicle(
    "suv",
    "Elevated ride for hill country and longer days",
    5,
    4,
    ["Hill country", "Cultural Triangle", "Photography"],
    "suv",
  ),
  fleetVehicle(
    "van",
    "Spacious cabin for families and friends",
    8,
    6,
    ["Family", "Multi-stop circuits", "Group of friends"],
    "van",
  ),
  fleetVehicle(
    "luxuryVan",
    "Premium seating for longer island journeys",
    10,
    8,
    ["Luxury", "Grand Explorer", "Extended island tours"],
    "luxuryVan",
  ),
  fleetVehicle(
    "miniCoach",
    "Group travel without shared coach schedules",
    12,
    8,
    ["Large families", "Corporate groups", "Multi-family trips"],
    "miniCoach",
  ),
];
