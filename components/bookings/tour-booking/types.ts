import type { QPickVehicleIconId } from "@/components/icons/vehicles/types";
import type {
  TourAccommodationId,
  TourPreferenceId,
} from "@/lib/tours/types";

export type TourPlannerStep =
  | "destinations"
  | "dates"
  | "vehicle"
  | "preferences"
  | "accommodation"
  | "requests"
  | "review"
  | "contact";

export const TOUR_PLANNER_STEPS: TourPlannerStep[] = [
  "destinations",
  "dates",
  "vehicle",
  "preferences",
  "accommodation",
  "requests",
  "review",
  "contact",
];

export type TourPlannerDraft = {
  packageSlug: string | null;
  packageTitle: string | null;
  destinations: string[];
  startDate: string;
  numberOfDays: number;
  vehicleId: QPickVehicleIconId | null;
  preferences: TourPreferenceId[];
  accommodation: TourAccommodationId | null;
  specialNotes: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  passengers: number;
};
