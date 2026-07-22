import type { DriverApplication } from "@prisma/client";
import { isRealMobile } from "@/lib/drivers/mobile";
import {
  DRIVER_DOCUMENT_KEYS,
  DRIVER_DOCUMENT_LABELS,
  parseDocuments,
  type DriverDocumentKey,
} from "./documents";

export type ProfileCompletionItem = {
  id: string;
  label: string;
  complete: boolean;
};

export type ProfileCompletion = {
  percent: number;
  missing: ProfileCompletionItem[];
  complete: boolean;
  canGoOnline: boolean;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function parseLanguages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function computeProfileCompletion(
  row: DriverApplication,
): ProfileCompletion {
  const docs = parseDocuments(row.documents);
  const items: ProfileCompletionItem[] = [];

  const personalFields: { id: string; label: string; ok: boolean }[] = [
    { id: "fullName", label: "Full Name", ok: hasText(row.fullName) },
    { id: "mobile", label: "Mobile Number", ok: isRealMobile(row.mobile) },
    { id: "profilePhoto", label: "Profile Photo", ok: hasText(row.profilePhotoPath) || hasText(docs.profilePhoto) },
    { id: "dateOfBirth", label: "Date of Birth", ok: hasText(row.dateOfBirth) },
    { id: "gender", label: "Gender", ok: hasText(row.gender) },
    { id: "address", label: "Address", ok: hasText(row.address) },
    { id: "city", label: "City", ok: hasText(row.city) },
    { id: "district", label: "District", ok: hasText(row.district) },
    { id: "nicNumber", label: "NIC Number", ok: hasText(row.nicNumber) },
    { id: "emergencyContactName", label: "Emergency Contact Name", ok: hasText(row.emergencyContactName) },
    { id: "emergencyContactPhone", label: "Emergency Contact Number", ok: hasText(row.emergencyContactPhone) },
  ];

  const drivingFields = [
    { id: "licenseNumber", label: "Driving License Number", ok: hasText(row.licenseNumber) },
    { id: "licenseExpiry", label: "License Expiry Date", ok: hasText(row.licenseExpiry) },
    { id: "yearsExperience", label: "Years of Experience", ok: row.yearsExperience != null && row.yearsExperience >= 0 },
    { id: "languagesSpoken", label: "Languages Spoken", ok: parseLanguages(row.languagesSpoken).length > 0 },
  ];

  const vehicleFields = [
    { id: "vehicleCategory", label: "Vehicle Category", ok: hasText(row.vehicleCategory) },
    { id: "vehicleMake", label: "Vehicle Make", ok: hasText(row.vehicleMake) },
    { id: "vehicleModel", label: "Vehicle Model", ok: hasText(row.vehicleModel) },
    { id: "vehicleYear", label: "Vehicle Year", ok: row.vehicleYear != null },
    { id: "registrationNumber", label: "Registration Number", ok: hasText(row.registrationNumber) },
    { id: "vehicleColour", label: "Vehicle Colour", ok: hasText(row.vehicleColour) },
    { id: "passengerCapacity", label: "Passenger Capacity", ok: row.passengerCapacity != null && row.passengerCapacity > 0 },
    { id: "luggageCapacity", label: "Luggage Capacity", ok: row.luggageCapacity != null && row.luggageCapacity >= 0 },
  ];

  const bankFields = [
    { id: "bankName", label: "Bank Name", ok: hasText(row.bankName) },
    { id: "bankBranch", label: "Branch", ok: hasText(row.bankBranch) },
    { id: "accountHolderName", label: "Account Holder Name", ok: hasText(row.accountHolderName) },
    { id: "accountNumber", label: "Account Number", ok: hasText(row.accountNumber) },
  ];

  for (const field of [...personalFields, ...drivingFields, ...vehicleFields, ...bankFields]) {
    items.push({ id: field.id, label: field.label, complete: field.ok });
  }

  for (const key of DRIVER_DOCUMENT_KEYS) {
    if (key === "profilePhoto") continue;
    items.push({
      id: key,
      label: DRIVER_DOCUMENT_LABELS[key],
      complete: hasText(docs[key]),
    });
  }

  const total = items.length;
  const done = items.filter((i) => i.complete).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const missing = items.filter((i) => !i.complete);

  return {
    percent,
    missing,
    complete: percent === 100,
    canGoOnline: row.status === "APPROVED" && row.canGoOnline && percent === 100,
  };
}

export function sectionCompletion(
  row: DriverApplication,
): Record<string, { percent: number; complete: boolean }> {
  const docs = parseDocuments(row.documents);
  const langs = parseLanguages(row.languagesSpoken);

  const personal = [
    hasText(row.fullName),
    isRealMobile(row.mobile),
    hasText(row.profilePhotoPath) || hasText(docs.profilePhoto),
    hasText(row.dateOfBirth),
    hasText(row.gender),
    hasText(row.address),
    hasText(row.city),
    hasText(row.district),
    hasText(row.nicNumber),
    hasText(row.emergencyContactName),
    hasText(row.emergencyContactPhone),
  ];

  const driving = [
    hasText(row.licenseNumber),
    hasText(row.licenseExpiry),
    row.yearsExperience != null,
    langs.length > 0,
    hasText(docs.licenseFront),
    hasText(docs.licenseBack),
  ];

  const vehicle = [
    hasText(row.vehicleCategory),
    hasText(row.vehicleMake),
    hasText(row.vehicleModel),
    row.vehicleYear != null,
    hasText(row.registrationNumber),
    hasText(row.vehicleColour),
    row.passengerCapacity != null,
    row.luggageCapacity != null,
    hasText(docs.vehicleRegistration),
    hasText(docs.vehicleFront),
    hasText(docs.vehicleRear),
    hasText(docs.vehicleLeft),
    hasText(docs.vehicleRight),
    hasText(docs.vehicleInterior),
  ];

  const insurance = [hasText(docs.vehicleInsurance)];
  const revenue = [hasText(docs.revenueLicense)];
  const nic = [hasText(docs.nicFront), hasText(docs.nicBack)];
  const bank = [
    hasText(row.bankName),
    hasText(row.bankBranch),
    hasText(row.accountHolderName),
    hasText(row.accountNumber),
  ];

  const docKeys: DriverDocumentKey[] = DRIVER_DOCUMENT_KEYS.filter((k) => k !== "profilePhoto");
  const documents = docKeys.map((k) => hasText(docs[k]));

  function pct(flags: boolean[]) {
    const done = flags.filter(Boolean).length;
    return {
      percent: flags.length ? Math.round((done / flags.length) * 100) : 0,
      complete: done === flags.length && flags.length > 0,
    };
  }

  return {
    personalDetails: pct(personal),
    drivingLicense: pct(driving),
    vehicle: pct(vehicle),
    insurance: pct(insurance),
    revenueLicense: pct(revenue),
    nic: pct(nic),
    bankDetails: pct(bank),
    documents: pct(documents),
  };
}
