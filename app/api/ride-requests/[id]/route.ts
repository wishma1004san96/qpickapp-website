import {
  getRideRequest,
  searchNearbyDrivers,
  updateRideRequestStatus,
} from "@/domains/ride-requests";
import { isRideStatus } from "@/domains/ride-requests/status";
import { jsonError } from "@/lib/bookings/shared";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await getRideRequest(id);
  if (!item) return jsonError("Ride request not found", 404);
  return Response.json({ item });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    if (body.action === "search_drivers") {
      const item = await searchNearbyDrivers(id);
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
