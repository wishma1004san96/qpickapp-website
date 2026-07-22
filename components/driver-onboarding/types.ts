import { PENDING_MOBILE_PREFIX } from "@/lib/drivers/mobile";

export type OnboardingStep =
  | "account"
  | "personal"
  | "driving"
  | "vehicle"
  | "bank"
  | "documents"
  | "declaration";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "account",
  "personal",
  "driving",
  "vehicle",
  "bank",
  "documents",
  "declaration",
];

export const ONBOARDING_STEP_LABELS: Record<OnboardingStep, string> = {
  account: "Create Account",
  personal: "Personal Details",
  driving: "Driving Information",
  vehicle: "Vehicle Details",
  bank: "Bank Details",
  documents: "Document Upload",
  declaration: "Declaration",
};

export type DriverOnboardingDraft = {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  accountVerified: boolean;
  authProvider: string;
  canGoOnline: boolean;
  isOnline: boolean;
  profilePhotoPath: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  district: string;
  nicNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  licenseNumber: string;
  licenseExpiry: string;
  yearsExperience: string;
  languagesSpoken: string[];
  vehicleCategory: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  registrationNumber: string;
  vehicleColour: string;
  passengerCapacity: string;
  luggageCapacity: string;
  airConditioning: boolean;
  wifiAvailable: boolean;
  bankName: string;
  bankBranch: string;
  accountHolderName: string;
  accountNumber: string;
  declarationAccepted: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  documents: Partial<Record<string, string>>;
  status: string;
  referenceCode: string;
  profileCompletionPercent: number;
  missingItems: { label: string }[];
  missingDocRequest: string;
};

/** Hide DB-only placeholder mobiles from form fields. */
export function mobileForForm(mobile: string | null | undefined): string {
  const value = String(mobile ?? "").trim();
  if (!value || value.startsWith(PENDING_MOBILE_PREFIX)) return "";
  return value;
}

/** Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX */
export function isValidSriLankanMobile(mobile: string): boolean {
  const normalized = mobile.replace(/[\s-]/g, "");
  if (normalized.startsWith(PENDING_MOBILE_PREFIX)) return false;
  if (normalized.startsWith("+94")) {
    return /^\+947\d{8}$/.test(normalized);
  }
  if (normalized.startsWith("94") && normalized.length === 11) {
    return /^947\d{8}$/.test(normalized);
  }
  return /^07\d{8}$/.test(normalized);
}

export function emptyDraft(): DriverOnboardingDraft {
  return {
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    accountVerified: false,
    authProvider: "",
    canGoOnline: false,
    isOnline: false,
    profilePhotoPath: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    district: "",
    nicNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    licenseNumber: "",
    licenseExpiry: "",
    yearsExperience: "",
    languagesSpoken: [],
    vehicleCategory: "sedan",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    registrationNumber: "",
    vehicleColour: "",
    passengerCapacity: "4",
    luggageCapacity: "2",
    airConditioning: true,
    wifiAvailable: false,
    bankName: "",
    bankBranch: "",
    accountHolderName: "",
    accountNumber: "",
    declarationAccepted: false,
    termsAccepted: false,
    privacyAccepted: false,
    documents: {},
    status: "DRAFT",
    referenceCode: "",
    profileCompletionPercent: 0,
    missingItems: [],
    missingDocRequest: "",
  };
}

export function draftFromApi(item: Record<string, unknown>): DriverOnboardingDraft {
  const base = emptyDraft();
  return {
    ...base,
    fullName: String(item.fullName ?? ""),
    mobile: mobileForForm(String(item.mobile ?? "")),
    email: String(item.email ?? ""),
    accountVerified: Boolean(item.accountVerified),
    authProvider: String(item.authProvider ?? ""),
    canGoOnline: Boolean(
      item.canGoOnline ??
        (item.profileCompletion as { canGoOnline?: boolean } | undefined)?.canGoOnline,
    ),
    isOnline: Boolean(item.isOnline),
    profilePhotoPath: String(item.profilePhotoPath ?? ""),
    dateOfBirth: String(item.dateOfBirth ?? ""),
    gender: String(item.gender ?? ""),
    address: String(item.address ?? ""),
    city: String(item.city ?? ""),
    district: String(item.district ?? ""),
    nicNumber: String(item.nicNumber ?? ""),
    emergencyContactName: String(item.emergencyContactName ?? ""),
    emergencyContactPhone: String(item.emergencyContactPhone ?? ""),
    licenseNumber: String(item.licenseNumber ?? ""),
    licenseExpiry: String(item.licenseExpiry ?? ""),
    yearsExperience: item.yearsExperience != null ? String(item.yearsExperience) : "",
    languagesSpoken: Array.isArray(item.languagesSpoken)
      ? (item.languagesSpoken as string[])
      : [],
    vehicleCategory: String(item.vehicleCategory ?? "sedan"),
    vehicleMake: String(item.vehicleMake ?? ""),
    vehicleModel: String(item.vehicleModel ?? ""),
    vehicleYear: item.vehicleYear != null ? String(item.vehicleYear) : "",
    registrationNumber: String(item.registrationNumber ?? ""),
    vehicleColour: String(item.vehicleColour ?? ""),
    passengerCapacity:
      item.passengerCapacity != null ? String(item.passengerCapacity) : "4",
    luggageCapacity:
      item.luggageCapacity != null ? String(item.luggageCapacity) : "2",
    airConditioning: item.airConditioning !== false,
    wifiAvailable: Boolean(item.wifiAvailable),
    bankName: String(item.bankName ?? ""),
    bankBranch: String(item.bankBranch ?? ""),
    accountHolderName: String(item.accountHolderName ?? ""),
    accountNumber: String(item.accountNumber ?? ""),
    declarationAccepted: Boolean(item.declarationAccepted),
    termsAccepted: Boolean(item.termsAccepted),
    privacyAccepted: Boolean(item.privacyAccepted),
    documents:
      item.documents && typeof item.documents === "object"
        ? (item.documents as Partial<Record<string, string>>)
        : {},
    status: String(item.status ?? "DRAFT"),
    referenceCode: String(item.referenceCode ?? ""),
    profileCompletionPercent:
      (item.profileCompletion as { percent?: number } | undefined)?.percent ?? 0,
    missingItems:
      (item.profileCompletion as { missing?: { label: string }[] } | undefined)
        ?.missing ?? [],
    missingDocRequest: String(item.missingDocRequest ?? ""),
  };
}

export function draftToPatch(draft: DriverOnboardingDraft): Record<string, unknown> {
  return {
    fullName: draft.fullName,
    email: draft.email || null,
    profilePhotoPath: draft.profilePhotoPath || null,
    dateOfBirth: draft.dateOfBirth || null,
    gender: draft.gender || null,
    address: draft.address || null,
    city: draft.city || null,
    district: draft.district || null,
    nicNumber: draft.nicNumber || null,
    emergencyContactName: draft.emergencyContactName || null,
    emergencyContactPhone: draft.emergencyContactPhone || null,
    licenseNumber: draft.licenseNumber || null,
    licenseExpiry: draft.licenseExpiry || null,
    yearsExperience: draft.yearsExperience ? Number(draft.yearsExperience) : null,
    languagesSpoken: draft.languagesSpoken,
    vehicleCategory: draft.vehicleCategory || null,
    vehicleMake: draft.vehicleMake || null,
    vehicleModel: draft.vehicleModel || null,
    vehicleYear: draft.vehicleYear ? Number(draft.vehicleYear) : null,
    registrationNumber: draft.registrationNumber || null,
    vehicleColour: draft.vehicleColour || null,
    passengerCapacity: draft.passengerCapacity
      ? Number(draft.passengerCapacity)
      : null,
    luggageCapacity: draft.luggageCapacity ? Number(draft.luggageCapacity) : null,
    airConditioning: draft.airConditioning,
    wifiAvailable: draft.wifiAvailable,
    bankName: draft.bankName || null,
    bankBranch: draft.bankBranch || null,
    accountHolderName: draft.accountHolderName || null,
    accountNumber: draft.accountNumber || null,
    declarationAccepted: draft.declarationAccepted,
    termsAccepted: draft.termsAccepted,
    privacyAccepted: draft.privacyAccepted,
  };
}
