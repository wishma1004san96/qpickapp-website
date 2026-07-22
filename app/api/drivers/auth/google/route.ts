import {
  buildGoogleAuthUrl,
  createOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
  isGoogleAuthConfigured,
} from "@/lib/drivers/google-auth";
import { jsonError } from "@/lib/bookings/shared";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return jsonError("Google sign-in is not configured.", 503);
  }

  const origin = new URL(request.url).origin;
  const state = createOAuthState();
  const url = buildGoogleAuthUrl(origin, state);

  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
