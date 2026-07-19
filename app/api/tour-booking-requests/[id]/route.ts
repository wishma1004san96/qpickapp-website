import { getTourBookingRequest } from "@/domains/tour-booking-requests";
import { jsonError } from "@/lib/bookings/shared";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await getTourBookingRequest(id);
  if (!item) return jsonError("Tour booking request not found", 404);
  return Response.json({ item });
}
