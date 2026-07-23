import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getMessages } from "@/lib/i18n/get-messages";
import { localeCookieName, normalizeSelectorLocale } from "@/lib/i18n/config";

/**
 * Cookie-based locale (localePrefix: "never") — no URL rewrites, no [locale] segment.
 * Matches next-intl "without i18n routing" setup so / stays at app/page.tsx.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale = hasLocale(routing.locales, cookieLocale)
    ? normalizeSelectorLocale(cookieLocale)
    : routing.defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
  };
});
