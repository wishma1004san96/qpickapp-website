/**
 * Tour Booking — admin review & assign driver/guide workflow.
 * SUBMITTED → UNDER_REVIEW → GUIDE_ASSIGNED → CONFIRMED → IN_PROGRESS → COMPLETED
 * Branches: CANCELLED, REJECTED
 */
export type TourBookingStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "GUIDE_ASSIGNED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export const TOUR_STATUS_FLOW: Record<
  TourBookingStatus,
  TourBookingStatus[]
> = {
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED", "REJECTED"],
  UNDER_REVIEW: ["GUIDE_ASSIGNED", "REJECTED", "CANCELLED"],
  GUIDE_ASSIGNED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export const TOUR_STATUS_LABELS: Record<TourBookingStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  GUIDE_ASSIGNED: "Guide / driver assigned",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export function canTransitionTour(
  from: TourBookingStatus,
  to: TourBookingStatus,
): boolean {
  return TOUR_STATUS_FLOW[from]?.includes(to) ?? false;
}

export function isTourStatus(value: string): value is TourBookingStatus {
  return value in TOUR_STATUS_LABELS;
}
