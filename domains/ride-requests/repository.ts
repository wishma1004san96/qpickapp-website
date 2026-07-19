import type { RideRequest } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  appendStatusHistory,
  makeReferenceCode,
  parseStatusHistory,
} from "@/lib/bookings/shared";
import { canTransitionRide, type RideRequestStatus } from "./status";

export type CreateRideRequestInput = {
  passengerName: string;
  passengerPhone: string;
  paymentMethod: string;
  pickupLabel: string;
  pickupLat: number;
  pickupLng: number;
  destinationLabel: string;
  destinationLat: number;
  destinationLng: number;
  vehicleType: string;
  scheduledAt?: string | null;
  isAirportPickup?: boolean;
  passengerCount?: number;
  luggageCount?: number;
  notes?: string | null;
  estimatedFareLkr?: number | null;
  estimatedDistanceKm?: number | null;
  estimatedDurationMin?: number | null;
};

const MOCK_DRIVERS = [
  { name: "Kasun Perera", phone: "+94 77 120 4501", plate: "CAB-4821" },
  { name: "Nimal Fernando", phone: "+94 76 334 8812", plate: "KY-2290" },
  { name: "Ruwan Silva", phone: "+94 71 556 9033", plate: "WP-CAB-1104" },
];

function serialize(row: RideRequest) {
  return {
    ...row,
    statusHistory: parseStatusHistory(row.statusHistory),
  };
}

export async function createRideRequest(input: CreateRideRequestInput) {
  const referenceCode = makeReferenceCode("RIDE");
  const history = appendStatusHistory("[]", "PENDING", "Ride request created");

  const created = await prisma.rideRequest.create({
    data: {
      referenceCode,
      status: "PENDING",
      passengerName: input.passengerName.trim(),
      passengerPhone: input.passengerPhone.trim(),
      paymentMethod: input.paymentMethod,
      pickupLabel: input.pickupLabel,
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      destinationLabel: input.destinationLabel,
      destinationLat: input.destinationLat,
      destinationLng: input.destinationLng,
      vehicleType: input.vehicleType,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      isAirportPickup: input.isAirportPickup ?? false,
      passengerCount: input.passengerCount ?? 1,
      luggageCount: input.luggageCount ?? 0,
      notes: input.notes?.trim() || null,
      estimatedFareLkr: input.estimatedFareLkr ?? null,
      estimatedDistanceKm: input.estimatedDistanceKm ?? null,
      estimatedDurationMin: input.estimatedDurationMin ?? null,
      statusHistory: history,
    },
  });

  // Real-time nearby-driver search (isolated to Ride Requests domain)
  return searchNearbyDrivers(created.id);
}

export async function searchNearbyDrivers(id: string) {
  const existing = await prisma.rideRequest.findUnique({ where: { id } });
  if (!existing) return null;

  let history = appendStatusHistory(
    existing.statusHistory,
    "SEARCHING_DRIVERS",
    "Scanning nearby drivers",
  );

  await prisma.rideRequest.update({
    where: { id },
    data: { status: "SEARCHING_DRIVERS", statusHistory: history },
  });

  // Simulated geo search — finds 1–3 nearby drivers based on pickup seed
  const seed = Math.abs(Math.floor(existing.pickupLat * 1000 + existing.pickupLng * 100));
  const found = (seed % 3) + 1;
  const driver = MOCK_DRIVERS[seed % MOCK_DRIVERS.length];

  if (found === 0) {
    history = appendStatusHistory(history, "NO_DRIVERS_FOUND", "No drivers in range");
    const updated = await prisma.rideRequest.update({
      where: { id },
      data: {
        status: "NO_DRIVERS_FOUND",
        nearbyDriversFound: 0,
        statusHistory: history,
      },
    });
    return serialize(updated);
  }

  history = appendStatusHistory(
    history,
    "DRIVER_ASSIGNED",
    `Matched ${found} nearby driver(s); assigned ${driver.name}`,
  );

  const updated = await prisma.rideRequest.update({
    where: { id },
    data: {
      status: "DRIVER_ASSIGNED",
      nearbyDriversFound: found,
      assignedDriverName: driver.name,
      assignedDriverPhone: driver.phone,
      assignedVehiclePlate: driver.plate,
      statusHistory: history,
    },
  });

  return serialize(updated);
}

export async function getRideRequest(id: string) {
  const row = await prisma.rideRequest.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function getRideRequestByReference(referenceCode: string) {
  const row = await prisma.rideRequest.findUnique({ where: { referenceCode } });
  return row ? serialize(row) : null;
}

export async function listRideRequests(limit = 100) {
  const rows = await prisma.rideRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serialize);
}

export async function updateRideRequestStatus(
  id: string,
  status: RideRequestStatus,
  note?: string,
) {
  const existing = await prisma.rideRequest.findUnique({ where: { id } });
  if (!existing) return null;
  if (!canTransitionRide(existing.status as RideRequestStatus, status)) {
    throw new Error(
      `Invalid ride status transition: ${existing.status} → ${status}`,
    );
  }
  const history = appendStatusHistory(existing.statusHistory, status, note);
  const updated = await prisma.rideRequest.update({
    where: { id },
    data: { status, statusHistory: history },
  });
  return serialize(updated);
}

export async function adminAssignRideDriver(
  id: string,
  driver: { name: string; phone: string; plate: string },
) {
  const existing = await prisma.rideRequest.findUnique({ where: { id } });
  if (!existing) return null;

  const current = existing.status as RideRequestStatus;
  const nextStatus: RideRequestStatus =
    current === "DRIVER_ASSIGNED" ||
    current === "DRIVER_EN_ROUTE" ||
    current === "IN_PROGRESS"
      ? current
      : "DRIVER_ASSIGNED";

  if (
    current !== nextStatus &&
    !canTransitionRide(current, nextStatus)
  ) {
    throw new Error(
      `Cannot assign driver from status ${existing.status}`,
    );
  }

  const history = appendStatusHistory(
    existing.statusHistory,
    nextStatus,
    `Admin assigned ${driver.name}`,
  );

  const updated = await prisma.rideRequest.update({
    where: { id },
    data: {
      status: nextStatus,
      assignedDriverName: driver.name,
      assignedDriverPhone: driver.phone,
      assignedVehiclePlate: driver.plate,
      nearbyDriversFound: Math.max(existing.nearbyDriversFound, 1),
      statusHistory: history,
    },
  });
  return serialize(updated);
}
