export const locales = ["en", "si", "ta"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookieName = "qp_locale";

export const localeLabels: Record<
  Locale,
  { native: string; short: string; htmlLang: string }
> = {
  en: { native: "English", short: "EN", htmlLang: "en" },
  si: { native: "සිංහල", short: "SI", htmlLang: "si" },
  ta: { native: "தமிழ்", short: "TA", htmlLang: "ta" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}
