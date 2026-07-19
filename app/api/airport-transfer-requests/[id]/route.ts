import { getAirportTransferRequest } from "@/domains/airport-transfer-requests";
import { jsonError } from "@/lib/bookings/shared";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await getAirportTransferRequest(id);
  if (!item) return jsonError("Airport transfer request not found", 404);
  return Response.json({ item });
}
