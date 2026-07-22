import {
  findApplicationBySession,
  updateApplicationDraft,
  upsertAccountStep,
} from "@/domains/driver-applications";
import { jsonError } from "@/lib/bookings/shared";
import {
  driverSessionCookieOptions,
  getDriverSessionToken,
} from "@/lib/drivers/session";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getDriverSessionToken();
  const item = await findApplicationBySession(token);
  if (!item) return Response.json({ item: null });
  return Response.json({ item });
}

export async function PATCH(request: Request) {
  try {
    const token = await getDriverSessionToken();
    if (!token) return jsonError("Not authenticated.", 401);

    const body = (await request.json()) as Record<string, unknown>;
    const item = await updateApplicationDraft(token, body);
    if (!item) return jsonError("Application not found.", 404);
    return Response.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return jsonError(message, 400);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const step = String(body.step ?? "account");
    const token = await getDriverSessionToken();

    if (step === "account") {
      if (!token) return jsonError("Please sign in with Google or email first.", 401);

      const fullName = String(body.fullName ?? "").trim();
      const mobile = String(body.mobile ?? "").replace(/\s/g, "");

      if (!fullName || mobile.length < 9) {
        return jsonError("Full name and valid mobile required.");
      }

      const item = await upsertAccountStep({
        sessionToken: token,
        fullName,
        mobile,
      });

      const response = NextResponse.json({ item });
      if (item.sessionToken) {
        response.cookies.set(driverSessionCookieOptions(item.sessionToken));
      }
      return response;
    }

    return jsonError("Unknown step.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return jsonError(message, 400);
  }
}
