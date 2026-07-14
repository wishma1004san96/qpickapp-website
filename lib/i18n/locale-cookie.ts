import {
  localeCookieName,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Client: persist locale to cookie + localStorage. */
export function persistLocale(locale: Locale) {
  const value = normalizeLocale(locale);
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${localeCookieName}=${value}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
  try {
    localStorage.setItem(localeCookieName, value);
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

/** Client: read locale from cookie, then localStorage, else default. */
export function readStoredLocale(): Locale | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${localeCookieName}=`));
  if (match) {
    return normalizeLocale(match.split("=")[1]);
  }

  try {
    const fromStorage = localStorage.getItem(localeCookieName);
    if (fromStorage) return normalizeLocale(fromStorage);
  } catch {
    // Ignore.
  }

  return null;
}
