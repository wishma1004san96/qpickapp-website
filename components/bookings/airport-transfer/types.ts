import type { AirportRate } from "@/lib/airport-rates";
import type { DestinationScene } from "@/lib/airport-destination-scenes";
import type { SelectedPlace } from "@/lib/osm/types";

export type BookingStep =
  | "destination"
  | "vehicle"
  | "arrival"
  | "passenger"
  | "summary";

export const BOOKING_STEPS: BookingStep[] = [
  "destination",
  "vehicle",
  "arrival",
  "passenger",
  "summary",
];

export type VehicleId = "mini" | "sedan" | "suv" | "van";

export type TransferVehicle = {
  id: VehicleId;
  name: string;
  tagline: string;
  image: string;
  passengers: number;
  luggage: number;
  /** Mapped to API luggage field */
  luggageSize: "cabin" | "medium" | "large";
  ac: boolean;
  /** Display multiplier on official base fare (UI only; API still sends official rate) */
  fareFactor: number;
};

export type SelectedDestination = {
  rate: AirportRate;
  label: string;
  category: "popular" | "city" | "attraction" | "search";
  scene: DestinationScene;
  place: SelectedPlace | null;
};

export type ArrivalInfo = {
  flightNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  airline: string;
  meetAndGreet: boolean;
};

export type PassengerInfo = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  nationality: string;
  specialRequests: string;
};

export type AirportTransferDraft = {
  destination: SelectedDestination | null;
  vehicleId: VehicleId | null;
  arrival: ArrivalInfo;
  passenger: PassengerInfo;
};
