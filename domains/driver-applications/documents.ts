export const DRIVER_DOCUMENT_KEYS = [
  "profilePhoto",
  "nicFront",
  "nicBack",
  "licenseFront",
  "licenseBack",
  "vehicleRegistration",
  "vehicleInsurance",
  "revenueLicense",
  "vehicleFront",
  "vehicleRear",
  "vehicleLeft",
  "vehicleRight",
  "vehicleInterior",
] as const;

export type DriverDocumentKey = (typeof DRIVER_DOCUMENT_KEYS)[number];

export const DRIVER_DOCUMENT_LABELS: Record<DriverDocumentKey, string> = {
  profilePhoto: "Profile Photo",
  nicFront: "NIC Front",
  nicBack: "NIC Back",
  licenseFront: "Driving License Front",
  licenseBack: "Driving License Back",
  vehicleRegistration: "Vehicle Registration Book",
  vehicleInsurance: "Vehicle Insurance",
  revenueLicense: "Revenue License",
  vehicleFront: "Vehicle Front",
  vehicleRear: "Vehicle Rear",
  vehicleLeft: "Vehicle Left",
  vehicleRight: "Vehicle Right",
  vehicleInterior: "Vehicle Interior",
};

export function parseDocuments(raw: string): Partial<Record<DriverDocumentKey, string>> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Partial<Record<DriverDocumentKey, string>>;
  } catch {
    return {};
  }
}

export function stringifyDocuments(
  docs: Partial<Record<DriverDocumentKey, string>>,
): string {
  return JSON.stringify(docs);
}
