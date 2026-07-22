import { submitApplication } from "@/domains/driver-applications";
import { jsonError } from "@/lib/bookings/shared";
import { getDriverSessionToken } from "@/lib/drivers/session";

export async function POST() {
  try {
    const token = await getDriverSessionToken();
    if (!token) return jsonError("Not authenticated.", 401);

    const item = await submitApplication(token);
    if (!item) return jsonError("Application not found.", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submit failed";
    return jsonError(message, 400);
  }
}
