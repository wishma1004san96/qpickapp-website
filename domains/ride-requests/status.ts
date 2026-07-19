/**
 * Taxi Ride — real-time status workflow.
 * PENDING → SEARCHING_DRIVERS → DRIVER_ASSIGNED → DRIVER_EN_ROUTE → IN_PROGRESS → COMPLETED
 * Branches: CANCELLED, NO_DRIVERS_FOUND
 */
export type RideRequestStatus =
  | "PENDING"
  | "SEARCHING_DRIVERS"
  | "DRIVER_ASSIGNED"
  | "DRIVER_EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_DRIVERS_FOUND";

export const RIDE_STATUS_FLOW: Record<RideRequestStatus, RideRequestStatus[]> = {
  PENDING: ["SEARCHING_DRIVERS", "CANCELLED"],
  SEARCHING_DRIVERS: ["DRIVER_ASSIGNED", "NO_DRIVERS_FOUND", "CANCELLED"],
  DRIVER_ASSIGNED: ["DRIVER_EN_ROUTE", "CANCELLED"],
  DRIVER_EN_ROUTE: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_DRIVERS_FOUND: ["SEARCHING_DRIVERS", "CANCELLED"],
};

export const RIDE_STATUS_LABELS: Record<RideRequestStatus, string> = {
  PENDING: "Pending",
  SEARCHING_DRIVERS: "Finding nearby drivers",
  DRIVER_ASSIGNED: "Driver assigned",
  DRIVER_EN_ROUTE: "Driver en route",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_DRIVERS_FOUND: "No drivers found",
};

export function canTransitionRide(
  from: RideRequestStatus,
  to: RideRequestStatus,
): boolean {
  return RIDE_STATUS_FLOW[from]?.includes(to) ?? false;
}

export function isRideStatus(value: string): value is RideRequestStatus {
  return value in RIDE_STATUS_LABELS;
}
