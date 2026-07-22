import { setDriverOnlineStatus } from "@/domains/driver-applications";
import { jsonError } from "@/lib/bookings/shared";
import { getDriverSessionToken } from "@/lib/drivers/session";

export async function POST(request: Request) {
  try {
    const token = await getDriverSessionToken();
    if (!token) return jsonError("Not authenticated.", 401);

    const body = (await request.json()) as { online?: boolean };
    const item = await setDriverOnlineStatus(token, Boolean(body.online));
    if (!item) return jsonError("Application not found.", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update online status";
    return jsonError(message, 400);
  }
}
