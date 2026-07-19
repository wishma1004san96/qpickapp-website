import {
  adminAssignRideDriver,
  listRideRequests,
  updateRideRequestStatus,
} from "@/domains/ride-requests";
import { isRideStatus } from "@/domains/ride-requests/status";
import { jsonError } from "@/lib/bookings/shared";

export async function GET() {
  const items = await listRideRequests();
  return Response.json({ items });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "");
    if (!id) return jsonError("id is required");

    if (body.action === "assign_driver") {
      const name = String(body.driverName ?? "").trim();
      const phone = String(body.driverPhone ?? "").trim();
      const plate = String(body.vehiclePlate ?? "").trim();
      if (!name || !phone || !plate) {
        return jsonError("driverName, driverPhone, and vehiclePlate required");
      }
      const item = await adminAssignRideDriver(id, { name, phone, plate });
      if (!item) return jsonError("Ride request not found", 404);
      return Response.json({ item });
    }

    const status = String(body.status ?? "");
    if (!isRideStatus(status)) return jsonError("Invalid status");
    const item = await updateRideRequestStatus(
      id,
      status,
      body.note ? String(body.note) : undefined,
    );
    if (!item) return jsonError("Ride request not found", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return jsonError(message, 400);
  }
}
