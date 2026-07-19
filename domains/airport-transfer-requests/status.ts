/**
 * Airport Transfer — admin review & assign workflow.
 * SUBMITTED → UNDER_REVIEW → DRIVER_ASSIGNED → CONFIRMED → IN_PROGRESS → COMPLETED
 * Branches: CANCELLED, REJECTED
 */
export type AirportTransferStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DRIVER_ASSIGNED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export const AIRPORT_STATUS_FLOW: Record<
  AirportTransferStatus,
  AirportTransferStatus[]
> = {
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED", "REJECTED"],
  UNDER_REVIEW: ["DRIVER_ASSIGNED", "REJECTED", "CANCELLED"],
  DRIVER_ASSIGNED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export const AIRPORT_STATUS_LABELS: Record<AirportTransferStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  DRIVER_ASSIGNED: "Driver assigned",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

export function canTransitionAirport(
  from: AirportTransferStatus,
  to: AirportTransferStatus,
): boolean {
  return AIRPORT_STATUS_FLOW[from]?.includes(to) ?? false;
}

export function isAirportStatus(value: string): value is AirportTransferStatus {
  return value in AIRPORT_STATUS_LABELS;
}

/** Fixed CMB pickup — never mixed with ride or tour pickup logic. */
export const CMB_PICKUP = {
  label: "Bandaranaike International Airport (CMB)",
  code: "CMB",
} as const;
