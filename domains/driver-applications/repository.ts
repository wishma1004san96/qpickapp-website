import type { DriverApplication } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { isRealMobile, pendingMobilePlaceholder } from "@/lib/drivers/mobile";
import {
  appendStatusHistory,
  makeReferenceCode,
  parseStatusHistory,
} from "@/lib/bookings/shared";
import {
  parseDocuments,
  stringifyDocuments,
  type DriverDocumentKey,
} from "./documents";
import { computeProfileCompletion, sectionCompletion } from "./profile-completion";
import {
  canTransitionDriverStatus,
  type AdminChecklistKey,
  type DriverApplicationStatus,
} from "./status";

export type DriverApplicationDto = ReturnType<typeof serialize>;

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string | null | undefined): boolean {
  if (!hash) return false;
  return hashPassword(password) === hash;
}

function parseChecklist(raw: string): Partial<Record<AdminChecklistKey, boolean>> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Partial<Record<AdminChecklistKey, boolean>>)
      : {};
  } catch {
    return {};
  }
}

function parseLanguages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function serialize(row: DriverApplication) {
  const completion = computeProfileCompletion(row);
  return {
    ...row,
    languagesSpoken: parseLanguages(row.languagesSpoken),
    documents: parseDocuments(row.documents),
    adminChecklist: parseChecklist(row.adminChecklist),
    statusHistory: parseStatusHistory(row.statusHistory),
    profileCompletion: completion,
    sections: sectionCompletion(row),
  };
}

export async function findApplicationBySession(
  sessionToken: string | null | undefined,
) {
  if (!sessionToken) return null;
  const row = await prisma.driverApplication.findUnique({
    where: { sessionToken },
  });
  return row ? serialize(row) : null;
}

export async function findApplicationByMobile(mobile: string) {
  const row = await prisma.driverApplication.findUnique({ where: { mobile } });
  return row ? serialize(row) : null;
}

export async function findApplicationById(id: string) {
  const row = await prisma.driverApplication.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function listDriverApplications(status?: DriverApplicationStatus) {
  const rows = await prisma.driverApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(serialize);
}

export async function listPendingDriverApplications() {
  const rows = await prisma.driverApplication.findMany({
    where: {
      status: { in: ["SUBMITTED", "PENDING_REVIEW"] },
    },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map(serialize);
}

export async function registerOrLoginWithEmail(input: {
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.driverApplication.findFirst({ where: { email } });

  if (existing) {
    if (!verifyPassword(input.password, existing.passwordHash)) {
      throw new Error("Invalid email or password.");
    }
    const sessionToken = existing.sessionToken ?? randomBytes(32).toString("hex");
    const row = await prisma.driverApplication.update({
      where: { id: existing.id },
      data: {
        sessionToken,
        accountVerified: true,
        authProvider: existing.authProvider ?? "email",
        authSubject: existing.authSubject ?? email,
      },
    });
    return serialize(row);
  }

  const sessionToken = randomBytes(32).toString("hex");
  const row = await prisma.driverApplication.create({
    data: {
      email,
      mobile: pendingMobilePlaceholder(),
      passwordHash: hashPassword(input.password),
      authProvider: "email",
      authSubject: email,
      accountVerified: true,
      sessionToken,
      referenceCode: makeReferenceCode("DRV"),
      statusHistory: appendStatusHistory("[]", "DRAFT", "Application started"),
    },
  });
  return serialize(row);
}

export async function registerOrLoginWithGoogle(profile: {
  id: string;
  email: string;
  name: string;
}) {
  const email = profile.email.trim().toLowerCase();
  const existing =
    (await prisma.driverApplication.findUnique({ where: { authSubject: profile.id } })) ??
    (await prisma.driverApplication.findFirst({ where: { email } }));

  const sessionToken = existing?.sessionToken ?? randomBytes(32).toString("hex");
  const data = {
    email,
    fullName: existing?.fullName ?? profile.name,
    authProvider: "google",
    authSubject: profile.id,
    accountVerified: true,
    sessionToken,
  };

  const row = existing
    ? await prisma.driverApplication.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.driverApplication.create({
        data: {
          ...data,
          mobile: pendingMobilePlaceholder(),
          referenceCode: makeReferenceCode("DRV"),
          statusHistory: appendStatusHistory("[]", "DRAFT", "Application started"),
        },
      });

  return serialize(row);
}

export async function upsertAccountStep(input: {
  sessionToken: string;
  fullName: string;
  mobile: string;
}) {
  const mobile = input.mobile.trim().replace(/\s/g, "");
  const existing = await prisma.driverApplication.findUnique({
    where: { sessionToken: input.sessionToken },
  });
  if (!existing) {
    throw new Error("Application not found.");
  }
  if (!existing.accountVerified) {
    throw new Error("Please sign in with Google or email first.");
  }

  const mobileTaken = await prisma.driverApplication.findFirst({
    where: { mobile, NOT: { id: existing.id } },
  });
  if (mobileTaken) {
    throw new Error("This mobile number is already registered.");
  }

  const row = await prisma.driverApplication.update({
    where: { sessionToken: input.sessionToken },
    data: {
      fullName: input.fullName.trim(),
      mobile,
      currentStep: Math.max(existing.currentStep, 1),
    },
  });

  return serialize(row);
}

export async function updateApplicationDraft(
  sessionToken: string,
  patch: Record<string, unknown>,
) {
  const existing = await prisma.driverApplication.findUnique({
    where: { sessionToken },
  });
  if (!existing) return null;
  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    throw new Error("Application can only be edited while in draft or rejected state.");
  }

  const languages = patch.languagesSpoken;
  const row = await prisma.driverApplication.update({
    where: { sessionToken },
    data: {
      fullName: patch.fullName != null ? String(patch.fullName) : undefined,
      email: patch.email != null ? String(patch.email) || null : undefined,
      profilePhotoPath:
        patch.profilePhotoPath != null ? String(patch.profilePhotoPath) || null : undefined,
      dateOfBirth: patch.dateOfBirth != null ? String(patch.dateOfBirth) || null : undefined,
      gender: patch.gender != null ? String(patch.gender) || null : undefined,
      address: patch.address != null ? String(patch.address) || null : undefined,
      city: patch.city != null ? String(patch.city) || null : undefined,
      district: patch.district != null ? String(patch.district) || null : undefined,
      nicNumber: patch.nicNumber != null ? String(patch.nicNumber) || null : undefined,
      emergencyContactName:
        patch.emergencyContactName != null
          ? String(patch.emergencyContactName) || null
          : undefined,
      emergencyContactPhone:
        patch.emergencyContactPhone != null
          ? String(patch.emergencyContactPhone) || null
          : undefined,
      licenseNumber:
        patch.licenseNumber != null ? String(patch.licenseNumber) || null : undefined,
      licenseExpiry:
        patch.licenseExpiry != null ? String(patch.licenseExpiry) || null : undefined,
      yearsExperience:
        patch.yearsExperience != null ? Number(patch.yearsExperience) : undefined,
      languagesSpoken:
        languages != null ? JSON.stringify(languages) : undefined,
      vehicleCategory:
        patch.vehicleCategory != null ? String(patch.vehicleCategory) || null : undefined,
      vehicleMake: patch.vehicleMake != null ? String(patch.vehicleMake) || null : undefined,
      vehicleModel: patch.vehicleModel != null ? String(patch.vehicleModel) || null : undefined,
      vehicleYear: patch.vehicleYear != null ? Number(patch.vehicleYear) : undefined,
      registrationNumber:
        patch.registrationNumber != null
          ? String(patch.registrationNumber) || null
          : undefined,
      vehicleColour:
        patch.vehicleColour != null ? String(patch.vehicleColour) || null : undefined,
      passengerCapacity:
        patch.passengerCapacity != null ? Number(patch.passengerCapacity) : undefined,
      luggageCapacity:
        patch.luggageCapacity != null ? Number(patch.luggageCapacity) : undefined,
      airConditioning:
        patch.airConditioning != null ? Boolean(patch.airConditioning) : undefined,
      wifiAvailable: patch.wifiAvailable != null ? Boolean(patch.wifiAvailable) : undefined,
      bankName: patch.bankName != null ? String(patch.bankName) || null : undefined,
      bankBranch: patch.bankBranch != null ? String(patch.bankBranch) || null : undefined,
      accountHolderName:
        patch.accountHolderName != null ? String(patch.accountHolderName) || null : undefined,
      accountNumber:
        patch.accountNumber != null ? String(patch.accountNumber) || null : undefined,
      declarationAccepted:
        patch.declarationAccepted != null ? Boolean(patch.declarationAccepted) : undefined,
      termsAccepted:
        patch.termsAccepted != null ? Boolean(patch.termsAccepted) : undefined,
      privacyAccepted:
        patch.privacyAccepted != null ? Boolean(patch.privacyAccepted) : undefined,
      currentStep: patch.currentStep != null ? Number(patch.currentStep) : undefined,
    },
  });

  return serialize(row);
}

export async function setApplicationDocument(
  sessionToken: string,
  key: DriverDocumentKey,
  path: string,
) {
  const existing = await prisma.driverApplication.findUnique({
    where: { sessionToken },
  });
  if (!existing) return null;

  const docs = parseDocuments(existing.documents);
  docs[key] = path;
  if (key === "profilePhoto") {
    const row = await prisma.driverApplication.update({
      where: { sessionToken },
      data: {
        documents: stringifyDocuments(docs),
        profilePhotoPath: path,
      },
    });
    return serialize(row);
  }

  const row = await prisma.driverApplication.update({
    where: { sessionToken },
    data: { documents: stringifyDocuments(docs) },
  });
  return serialize(row);
}

export async function submitApplication(sessionToken: string) {
  const existing = await prisma.driverApplication.findUnique({
    where: { sessionToken },
  });
  if (!existing) return null;

  if (!existing.declarationAccepted || !existing.termsAccepted || !existing.privacyAccepted) {
    throw new Error("Please accept all declarations before submitting.");
  }
  if (!existing.accountVerified) {
    throw new Error("Please sign in before submitting.");
  }
  if (!isRealMobile(existing.mobile)) {
    throw new Error("Mobile number is required.");
  }

  const completion = computeProfileCompletion(existing);
  if (completion.percent < 85) {
    throw new Error("Please complete required profile sections before submitting.");
  }

  const history = appendStatusHistory(
    existing.statusHistory,
    "SUBMITTED",
    "Driver application submitted",
  );

  const row = await prisma.driverApplication.update({
    where: { sessionToken },
    data: {
      status: "PENDING_REVIEW",
      statusHistory: appendStatusHistory(history, "PENDING_REVIEW", "Awaiting admin review"),
      submittedAt: new Date(),
      canGoOnline: false,
    },
  });

  return serialize(row);
}

export async function adminUpdateApplication(
  id: string,
  action: string,
  payload: Record<string, unknown>,
) {
  const existing = await prisma.driverApplication.findUnique({ where: { id } });
  if (!existing) return null;

  let status = existing.status as DriverApplicationStatus;
  let history = existing.statusHistory;
  let canGoOnline = existing.canGoOnline;
  let isOnline = existing.isOnline;
  let adminNotes = existing.adminNotes;
  let missingDocRequest = existing.missingDocRequest;
  let adminChecklist = parseChecklist(existing.adminChecklist);

  switch (action) {
    case "approve": {
      if (!canTransitionDriverStatus(status, "APPROVED")) {
        throw new Error("Cannot approve from current status.");
      }
      status = "APPROVED";
      history = appendStatusHistory(history, "APPROVED", String(payload.note ?? "Approved by admin"));
      canGoOnline = true;
      break;
    }
    case "reject": {
      status = "REJECTED";
      history = appendStatusHistory(history, "REJECTED", String(payload.note ?? "Rejected by admin"));
      canGoOnline = false;
      isOnline = false;
      break;
    }
    case "suspend": {
      status = "SUSPENDED";
      history = appendStatusHistory(history, "SUSPENDED", String(payload.note ?? "Suspended by admin"));
      canGoOnline = false;
      isOnline = false;
      break;
    }
    case "request_documents": {
      missingDocRequest = String(payload.message ?? "Please upload missing documents.");
      history = appendStatusHistory(history, status, `Docs requested: ${missingDocRequest}`);
      status = "DRAFT";
      history = appendStatusHistory(history, "DRAFT", "Returned for additional documents");
      canGoOnline = false;
      isOnline = false;
      break;
    }
    case "notify_driver": {
      adminNotes = String(payload.message ?? adminNotes ?? "Admin notification sent.");
      history = appendStatusHistory(history, status, `Driver notified: ${adminNotes}`);
      break;
    }
    case "update_checklist": {
      const patch = payload.checklist as Partial<Record<AdminChecklistKey, boolean>> | undefined;
      if (patch) adminChecklist = { ...adminChecklist, ...patch };
      break;
    }
    default:
      throw new Error("Unknown admin action.");
  }

  if (payload.adminNotes != null) {
    adminNotes = String(payload.adminNotes) || null;
  }

  const row = await prisma.driverApplication.update({
    where: { id },
    data: {
      status,
      statusHistory: history,
      canGoOnline,
      isOnline,
      adminNotes,
      missingDocRequest,
      adminChecklist: JSON.stringify(adminChecklist),
    },
  });

  return serialize(row);
}

export async function setDriverOnlineStatus(sessionToken: string, online: boolean) {
  const existing = await prisma.driverApplication.findUnique({
    where: { sessionToken },
  });
  if (!existing) return null;

  const completion = computeProfileCompletion(existing);
  if (!completion.canGoOnline) {
    throw new Error("You cannot go online until your application is approved.");
  }

  const row = await prisma.driverApplication.update({
    where: { sessionToken },
    data: { isOnline: online },
  });

  return serialize(row);
}

export { hashPassword };
