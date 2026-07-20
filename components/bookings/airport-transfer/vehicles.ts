import type { TransferVehicle, VehicleId } from "./types";

export const TRANSFER_VEHICLES: TransferVehicle[] = [
  {
    id: "mini",
    name: "Q Mini",
    tagline: "Smart & efficient for solo or couple arrivals",
    image: "/images/fleet/vehicles/mini.webp",
    passengers: 3,
    luggage: 2,
    luggageSize: "cabin",
    ac: true,
    fareFactor: 1,
  },
  {
    id: "sedan",
    name: "Executive Sedan",
    tagline: "The classic chauffeur arrival — composed and quiet",
    image: "/images/fleet/vehicles/sedan.webp",
    passengers: 3,
    luggage: 3,
    luggageSize: "medium",
    ac: true,
    fareFactor: 1,
  },
  {
    id: "suv",
    name: "Premium SUV",
    tagline: "Space and presence for family or highland roads",
    image: "/images/fleet/vehicles/suv.webp",
    passengers: 5,
    luggage: 4,
    luggageSize: "large",
    ac: true,
    fareFactor: 1.15,
  },
  {
    id: "van",
    name: "Luxury Van",
    tagline: "Group transfers with room for every bag",
    image: "/images/fleet/vehicles/van.webp",
    passengers: 7,
    luggage: 6,
    luggageSize: "large",
    ac: true,
    fareFactor: 1.25,
  },
];

export function getTransferVehicle(id: VehicleId | null): TransferVehicle | null {
  if (!id) return null;
  return TRANSFER_VEHICLES.find((v) => v.id === id) ?? null;
}

export function estimateDisplayFare(baseLkr: number, factor: number): number {
  return Math.round(baseLkr * factor);
}
