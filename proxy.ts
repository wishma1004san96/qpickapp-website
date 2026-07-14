import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
} from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const current = request.cookies.get(localeCookieName)?.value;
  if (isLocale(current)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(localeCookieName, defaultLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
