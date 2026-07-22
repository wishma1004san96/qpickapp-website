import { registerOrLoginWithGoogle } from "@/domains/driver-applications";
import {
  fetchGoogleProfile,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/drivers/google-auth";
import { driverSessionCookieOptions } from "@/lib/drivers/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = url.origin;

  const store = await cookies();
  const expectedState = store.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  store.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/drive/apply?auth_error=google`);
  }

  try {
    const profile = await fetchGoogleProfile(code, origin);
    const item = await registerOrLoginWithGoogle(profile);
    const response = NextResponse.redirect(`${origin}/drive/apply`);
    if (item.sessionToken) {
      response.cookies.set(driverSessionCookieOptions(item.sessionToken));
    }
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/drive/apply?auth_error=google`);
  }
}
