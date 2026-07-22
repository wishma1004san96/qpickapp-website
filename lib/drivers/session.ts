import { cookies } from "next/headers";

export const DRIVER_SESSION_COOKIE = "qpick_driver_session";

export async function getDriverSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(DRIVER_SESSION_COOKIE)?.value ?? null;
}

export function driverSessionCookieOptions(token: string) {
  return {
    name: DRIVER_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function clearDriverSessionCookie() {
  return {
    name: DRIVER_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function isSuperAdmin(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("x-admin-secret");
  return header === secret;
}
