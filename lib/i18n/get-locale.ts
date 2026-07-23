import { cookies } from "next/headers";
import {
  defaultSelectorLocale,
  localeCookieName,
  normalizeSelectorLocale,
  type SelectorLocale,
} from "@/lib/i18n/config";

/** Server-side locale from the persistent cookie (defaults to English). */
export async function getLocale(): Promise<SelectorLocale> {
  const store = await cookies();
  const raw = store.get(localeCookieName)?.value;
  return raw ? normalizeSelectorLocale(raw) : defaultSelectorLocale;
}
