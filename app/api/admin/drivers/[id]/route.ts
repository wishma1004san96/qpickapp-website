import { adminUpdateApplication } from "@/domains/driver-applications";
import { jsonError } from "@/lib/bookings/shared";
import { isSuperAdmin } from "@/lib/drivers/session";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  if (!isSuperAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    if (!action) return jsonError("action is required");

    const item = await adminUpdateApplication(id, action, body);
    if (!item) return jsonError("Application not found.", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return jsonError(message, 400);
  }
}
