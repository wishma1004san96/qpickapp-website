import { registerOrLoginWithEmail } from "@/domains/driver-applications";
import { jsonError } from "@/lib/bookings/shared";
import { driverSessionCookieOptions } from "@/lib/drivers/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !email.includes("@")) {
      return jsonError("A valid email address is required.");
    }
    if (password.length < 8) {
      return jsonError("Password must be at least 8 characters.");
    }

    const item = await registerOrLoginWithEmail({ email, password });
    const response = NextResponse.json({ item });
    if (item.sessionToken) {
      response.cookies.set(driverSessionCookieOptions(item.sessionToken));
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email sign-in failed";
    return jsonError(message, 400);
  }
}
