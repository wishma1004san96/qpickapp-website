import { randomBytes } from "crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "qpick_google_oauth_state";

export type GoogleProfile = {
  id: string;
  email: string;
  name: string;
};

function requireGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Google sign-in is not configured.");
  }
  return { clientId, clientSecret };
}

export function googleOAuthRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/drivers/auth/google/callback`;
}

export function buildGoogleAuthUrl(origin: string, state: string): string {
  const { clientId } = requireGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleOAuthRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function createOAuthState(): string {
  return randomBytes(24).toString("hex");
}

export async function fetchGoogleProfile(
  code: string,
  origin: string,
): Promise<GoogleProfile> {
  const { clientId, clientSecret } = requireGoogleConfig();
  const redirectUri = googleOAuthRedirectUri(origin);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error("Google sign-in failed.");
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error("Google sign-in failed.");
  }

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    throw new Error("Could not load Google profile.");
  }

  const profile = (await profileRes.json()) as {
    id?: string;
    email?: string;
    name?: string;
  };

  if (!profile.id || !profile.email) {
    throw new Error("Google account must include an email address.");
  }

  return {
    id: profile.id,
    email: profile.email.trim().toLowerCase(),
    name: profile.name?.trim() || profile.email.split("@")[0] || "Driver",
  };
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}
