import { prisma } from "@/lib/db";
import {
  appendStatusHistory,
  makeReferenceCode,
  parseStatusHistory,
} from "@/lib/bookings/shared";
import { canTransitionTour, type TourBookingStatus } from "./status";

export type CreateTourBookingInput = {
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string | null;
  destinations: string[];
  startDate: string;
  endDate?: string | null;
  numberOfDays: number;
  vehicleType: string;
  passengers?: number;
  specialRequest?: string | null;
};

function serialize(
  row: Awaited<ReturnType<typeof prisma.tourBookingRequest.findUnique>>,
) {
  if (!row) return null;
  let destinations: string[] = [];
  try {
    destinations = JSON.parse(row.destinations) as string[];
  } catch {
    destinations = row.destinations ? [row.destinations] : [];
  }
  return {
    ...row,
    destinations,
    statusHistory: parseStatusHistory(row.statusHistory),
  };
}

export async function createTourBookingRequest(input: CreateTourBookingInput) {
  const referenceCode = makeReferenceCode("TOUR");
  const history = appendStatusHistory(
    "[]",
    "SUBMITTED",
    "Tour booking request submitted — awaiting admin review",
  );

  const created = await prisma.tourBookingRequest.create({
    data: {
      referenceCode,
      status: "SUBMITTED",
      passengerName: input.passengerName.trim(),
      passengerPhone: input.passengerPhone.trim(),
      passengerEmail: input.passengerEmail?.trim() || null,
      destinations: JSON.stringify(input.destinations),
      startDate: input.startDate,
      endDate: input.endDate || null,
      numberOfDays: input.numberOfDays,
      vehicleType: input.vehicleType,
      passengers: input.passengers ?? 2,
      specialRequest: input.specialRequest?.trim() || null,
      statusHistory: history,
    },
  });

  return serialize(created)!;
}

export async function getTourBookingRequest(id: string) {
  const row = await prisma.tourBookingRequest.findUnique({ where: { id } });
  return serialize(row);
}

export async function listTourBookingRequests(limit = 100) {
  const rows = await prisma.tourBookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => serialize(r)!);
}

export async function updateTourBookingStatus(
  id: string,
  status: TourBookingStatus,
  note?: string,
) {
  const existing = await prisma.tourBookingRequest.findUnique({
    where: { id },
  });
  if (!existing) return null;
  if (!canTransitionTour(existing.status as TourBookingStatus, status)) {
    throw new Error(
      `Invalid tour booking status transition: ${existing.status} → ${status}`,
    );
  }
  const history = appendStatusHistory(existing.statusHistory, status, note);
  const updated = await prisma.tourBookingRequest.update({
    where: { id },
    data: { status, statusHistory: history },
  });
  return serialize(updated);
}

export async function adminAssignTourGuide(
  id: string,
  assignment: {
    guideName: string;
    guidePhone?: string;
    driverName?: string;
    driverPhone?: string;
  },
  adminNotes?: string,
) {
  const existing = await prisma.tourBookingRequest.findUnique({
    where: { id },
  });
  if (!existing) return null;

  let status = existing.status as TourBookingStatus;
  let history = existing.statusHistory;

  if (status === "SUBMITTED") {
    history = appendStatusHistory(history, "UNDER_REVIEW", "Admin opened request");
    status = "UNDER_REVIEW";
  }

  if (status === "UNDER_REVIEW") {
    history = appendStatusHistory(
      history,
      "GUIDE_ASSIGNED",
      `Admin assigned guide ${assignment.guideName}`,
    );
    status = "GUIDE_ASSIGNED";
  } else if (status === "GUIDE_ASSIGNED" || status === "CONFIRMED") {
    history = appendStatusHistory(
      history,
      status,
      `Admin reassigned guide ${assignment.guideName}`,
    );
  } else {
    throw new Error(`Cannot assign guide from status ${existing.status}`);
  }

  const updated = await prisma.tourBookingRequest.update({
    where: { id },
    data: {
      status,
      assignedGuideName: assignment.guideName,
      assignedGuidePhone: assignment.guidePhone?.trim() || null,
      assignedDriverName: assignment.driverName?.trim() || null,
      assignedDriverPhone: assignment.driverPhone?.trim() || null,
      adminNotes: adminNotes?.trim() || existing.adminNotes,
      statusHistory: history,
    },
  });
  return serialize(updated);
}
