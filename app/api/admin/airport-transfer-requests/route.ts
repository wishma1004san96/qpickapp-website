import {
  adminAssignAirportDriver,
  listAirportTransferRequests,
  updateAirportTransferStatus,
} from "@/domains/airport-transfer-requests";
import { isAirportStatus } from "@/domains/airport-transfer-requests/status";
import { jsonError } from "@/lib/bookings/shared";

export async function GET() {
  const items = await listAirportTransferRequests();
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
      if (!name || !phone) {
        return jsonError("driverName and driverPhone are required");
      }
      const item = await adminAssignAirportDriver(
        id,
        { name, phone },
        body.adminNotes ? String(body.adminNotes) : undefined,
      );
      if (!item) return jsonError("Airport transfer request not found", 404);
      return Response.json({ item });
    }

    const status = String(body.status ?? "");
    if (!isAirportStatus(status)) return jsonError("Invalid status");
    const item = await updateAirportTransferStatus(
      id,
      status,
      body.note ? String(body.note) : undefined,
    );
    if (!item) return jsonError("Airport transfer request not found", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return jsonError(message, 400);
  }
}
