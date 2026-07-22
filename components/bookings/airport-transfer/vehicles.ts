import {
  fleetVehiclePhoto,
  FLEET_VEHICLE_CAPACITY,
} from "@/components/icons/vehicles/fleet-catalog";
import type { TransferVehicle, VehicleId } from "./types";

function transferVehicle(
  id: VehicleId,
  tagline: string,
  fareFactor: number,
  luggageSize: TransferVehicle["luggageSize"],
): TransferVehicle {
  const photo = fleetVehiclePhoto(id)!;
  const capacity = FLEET_VEHICLE_CAPACITY[photo.iconId];
  return {
    id,
    name: photo.name,
    tagline,
    image: photo.src,
    passengers: capacity.passengers,
    luggage: capacity.luggage,
    luggageSize,
    ac: true,
    fareFactor,
  };
}

export const TRANSFER_VEHICLES: TransferVehicle[] = [
  transferVehicle(
    "mini",
    "Smart & efficient for solo or couple arrivals",
    1,
    "cabin",
  ),
  transferVehicle(
    "sedan",
    "The classic chauffeur arrival — composed and quiet",
    1,
    "medium",
  ),
  transferVehicle(
    "suv",
    "Space and presence for family or highland roads",
    1.15,
    "large",
  ),
  transferVehicle(
    "van",
    "Group transfers with room for every bag",
    1.25,
    "large",
  ),
];

export function getTransferVehicle(id: VehicleId | null): TransferVehicle | null {
  if (!id) return null;
  return TRANSFER_VEHICLES.find((v) => v.id === id) ?? null;
}

export function estimateDisplayFare(baseLkr: number, factor: number): number {
  return Math.round(baseLkr * factor);
}
