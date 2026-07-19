import {
  adminAssignTourGuide,
  listTourBookingRequests,
  updateTourBookingStatus,
} from "@/domains/tour-booking-requests";
import { isTourStatus } from "@/domains/tour-booking-requests/status";
import { jsonError } from "@/lib/bookings/shared";

export async function GET() {
  const items = await listTourBookingRequests();
  return Response.json({ items });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "");
    if (!id) return jsonError("id is required");

    if (body.action === "assign_guide") {
      const guideName = String(body.guideName ?? "").trim();
      if (!guideName) return jsonError("guideName is required");
      const item = await adminAssignTourGuide(
        id,
        {
          guideName,
          guidePhone: body.guidePhone
            ? String(body.guidePhone)
            : undefined,
          driverName: body.driverName
            ? String(body.driverName)
            : undefined,
          driverPhone: body.driverPhone
            ? String(body.driverPhone)
            : undefined,
        },
        body.adminNotes ? String(body.adminNotes) : undefined,
      );
      if (!item) return jsonError("Tour booking request not found", 404);
      return Response.json({ item });
    }

    const status = String(body.status ?? "");
    if (!isTourStatus(status)) return jsonError("Invalid status");
    const item = await updateTourBookingStatus(
      id,
      status,
      body.note ? String(body.note) : undefined,
    );
    if (!item) return jsonError("Tour booking request not found", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return jsonError(message, 400);
  }
}
