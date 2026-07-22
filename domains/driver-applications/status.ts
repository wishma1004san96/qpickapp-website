export const DRIVER_APPLICATION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;

export type DriverApplicationStatus = (typeof DRIVER_APPLICATION_STATUSES)[number];

export const DRIVER_STATUS_LABELS: Record<DriverApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const DRIVER_STATUS_FLOW: Record<
  DriverApplicationStatus,
  readonly DriverApplicationStatus[]
> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PENDING_REVIEW", "REJECTED"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "SUSPENDED"],
  APPROVED: ["SUSPENDED"],
  REJECTED: ["PENDING_REVIEW"],
  SUSPENDED: ["APPROVED", "REJECTED"],
};

export function isDriverApplicationStatus(
  value: string,
): value is DriverApplicationStatus {
  return (DRIVER_APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function canTransitionDriverStatus(
  from: DriverApplicationStatus,
  to: DriverApplicationStatus,
): boolean {
  return DRIVER_STATUS_FLOW[from]?.includes(to) ?? false;
}

/** Only Super Admin may approve — enforced in API via ADMIN_SECRET header. */
export const DRIVER_ADMIN_ACTIONS = [
  "approve",
  "reject",
  "suspend",
  "request_documents",
  "notify_driver",
  "update_checklist",
] as const;

export type DriverAdminAction = (typeof DRIVER_ADMIN_ACTIONS)[number];

export const ADMIN_CHECKLIST_KEYS = [
  "personalDetails",
  "drivingLicense",
  "vehicle",
  "insurance",
  "revenueLicense",
  "nic",
  "bankDetails",
  "documents",
] as const;

export type AdminChecklistKey = (typeof ADMIN_CHECKLIST_KEYS)[number];

export const ADMIN_CHECKLIST_LABELS: Record<AdminChecklistKey, string> = {
  personalDetails: "Personal Details",
  drivingLicense: "Driving License",
  vehicle: "Vehicle",
  insurance: "Insurance",
  revenueLicense: "Revenue License",
  nic: "NIC",
  bankDetails: "Bank Details",
  documents: "Documents",
};
