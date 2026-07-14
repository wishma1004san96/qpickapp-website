import { cookies } from "next/headers";
import {
  defaultLocale,
  localeCookieName,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/config";

/** Server-side locale from the persistent cookie (defaults to English). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(localeCookieName)?.value;
  return raw ? normalizeLocale(raw) : defaultLocale;
}
