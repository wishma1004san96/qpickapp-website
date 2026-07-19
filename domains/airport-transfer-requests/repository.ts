import type { AirportTransferRequest } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  appendStatusHistory,
  makeReferenceCode,
  parseStatusHistory,
} from "@/lib/bookings/shared";
import {
  canTransitionAirport,
  CMB_PICKUP,
  type AirportTransferStatus,
} from "./status";

export type CreateAirportTransferInput = {
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string | null;
  nationality?: string | null;
  destinationLabel: string;
  destinationCode?: string | null;
  officialFareLkr?: number | null;
  transferDate: string;
  transferTime: string;
  passengers?: number;
  luggage: string;
  vehicleType: string;
  specialRequest?: string | null;
};

function serialize(row: AirportTransferRequest) {
  return {
    ...row,
    statusHistory: parseStatusHistory(row.statusHistory),
  };
}

export async function createAirportTransferRequest(
  input: CreateAirportTransferInput,
) {
  const referenceCode = makeReferenceCode("ATX");
  const history = appendStatusHistory(
    "[]",
    "SUBMITTED",
    "Airport transfer request submitted — awaiting admin review",
  );

  const created = await prisma.airportTransferRequest.create({
    data: {
      referenceCode,
      status: "SUBMITTED",
      passengerName: input.passengerName.trim(),
      passengerPhone: input.passengerPhone.trim(),
      passengerEmail: input.passengerEmail?.trim() || null,
      nationality: input.nationality?.trim() || null,
      pickupLabel: CMB_PICKUP.label,
      pickupCode: CMB_PICKUP.code,
      destinationLabel: input.destinationLabel.trim(),
      destinationCode: input.destinationCode?.trim() || null,
      officialFareLkr: input.officialFareLkr ?? null,
      transferDate: input.transferDate,
      transferTime: input.transferTime,
      passengers: input.passengers ?? 1,
      luggage: input.luggage,
      vehicleType: input.vehicleType,
      specialRequest: input.specialRequest?.trim() || null,
      statusHistory: history,
    },
  });

  return serialize(created);
}

export async function getAirportTransferRequest(id: string) {
  const row = await prisma.airportTransferRequest.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function listAirportTransferRequests(limit = 100) {
  const rows = await prisma.airportTransferRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serialize);
}

export async function updateAirportTransferStatus(
  id: string,
  status: AirportTransferStatus,
  note?: string,
) {
  const existing = await prisma.airportTransferRequest.findUnique({
    where: { id },
  });
  if (!existing) return null;
  if (
    !canTransitionAirport(existing.status as AirportTransferStatus, status)
  ) {
    throw new Error(
      `Invalid airport transfer status transition: ${existing.status} → ${status}`,
    );
  }
  const history = appendStatusHistory(existing.statusHistory, status, note);
  const updated = await prisma.airportTransferRequest.update({
    where: { id },
    data: { status, statusHistory: history },
  });
  return serialize(updated);
}

export async function adminAssignAirportDriver(
  id: string,
  driver: { name: string; phone: string },
  adminNotes?: string,
) {
  const existing = await prisma.airportTransferRequest.findUnique({
    where: { id },
  });
  if (!existing) return null;

  let status = existing.status as AirportTransferStatus;
  let history = existing.statusHistory;

  if (status === "SUBMITTED") {
    history = appendStatusHistory(history, "UNDER_REVIEW", "Admin opened request");
    status = "UNDER_REVIEW";
  }

  if (status === "UNDER_REVIEW") {
    history = appendStatusHistory(
      history,
      "DRIVER_ASSIGNED",
      `Admin assigned ${driver.name}`,
    );
    status = "DRIVER_ASSIGNED";
  } else if (status === "DRIVER_ASSIGNED" || status === "CONFIRMED") {
    history = appendStatusHistory(
      history,
      status,
      `Admin reassigned to ${driver.name}`,
    );
  } else {
    throw new Error(`Cannot assign driver from status ${existing.status}`);
  }

  const updated = await prisma.airportTransferRequest.update({
    where: { id },
    data: {
      status,
      assignedDriverName: driver.name,
      assignedDriverPhone: driver.phone,
      adminNotes: adminNotes?.trim() || existing.adminNotes,
      statusHistory: history,
    },
  });
  return serialize(updated);
}
