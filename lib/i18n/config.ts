export const locales = [
  "en",
  "si",
  "ta",
  "de",
  "fr",
  "es",
  "it",
  "ru",
  "zh",
  "ja",
  "ko",
  "nl",
  "pt",
  "pl",
  "sv",
  "da",
  "no",
  "fi",
  "ar",
  "hi",
] as const;

/** Locales shown in the header language selector (UI only). */
export const selectorLocales = ["en", "si", "ta"] as const;

export type Locale = (typeof locales)[number];

export type SelectorLocale = (typeof selectorLocales)[number];

export const defaultLocale: Locale = "en";

export const defaultSelectorLocale: SelectorLocale = "en";

export const localeCookieName = "qp_locale";

export type LocaleLabel = {
  native: string;
  short: string;
  htmlLang: string;
  /** English name for search / accessibility */
  english: string;
  rtl?: boolean;
};

export const localeLabels: Record<Locale, LocaleLabel> = {
  en: { native: "English", short: "EN", htmlLang: "en", english: "English" },
  si: { native: "සිංහල", short: "SI", htmlLang: "si", english: "Sinhala" },
  ta: { native: "தமிழ்", short: "TA", htmlLang: "ta", english: "Tamil" },
  de: { native: "Deutsch", short: "DE", htmlLang: "de", english: "German" },
  fr: { native: "Français", short: "FR", htmlLang: "fr", english: "French" },
  es: { native: "Español", short: "ES", htmlLang: "es", english: "Spanish" },
  it: { native: "Italiano", short: "IT", htmlLang: "it", english: "Italian" },
  ru: { native: "Русский", short: "RU", htmlLang: "ru", english: "Russian" },
  zh: {
    native: "简体中文",
    short: "ZH",
    htmlLang: "zh-Hans",
    english: "Chinese (Simplified)",
  },
  ja: { native: "日本語", short: "JA", htmlLang: "ja", english: "Japanese" },
  ko: { native: "한국어", short: "KO", htmlLang: "ko", english: "Korean" },
  nl: { native: "Nederlands", short: "NL", htmlLang: "nl", english: "Dutch" },
  pt: {
    native: "Português",
    short: "PT",
    htmlLang: "pt",
    english: "Portuguese",
  },
  pl: { native: "Polski", short: "PL", htmlLang: "pl", english: "Polish" },
  sv: { native: "Svenska", short: "SV", htmlLang: "sv", english: "Swedish" },
  da: { native: "Dansk", short: "DA", htmlLang: "da", english: "Danish" },
  no: { native: "Norsk", short: "NO", htmlLang: "nb", english: "Norwegian" },
  fi: { native: "Suomi", short: "FI", htmlLang: "fi", english: "Finnish" },
  ar: {
    native: "العربية",
    short: "AR",
    htmlLang: "ar",
    english: "Arabic",
    rtl: true,
  },
  hi: { native: "हिन्दी", short: "HI", htmlLang: "hi", english: "Hindi" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function isSelectorLocale(value: unknown): value is SelectorLocale {
  return (
    typeof value === "string" &&
    (selectorLocales as readonly string[]).includes(value)
  );
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Active UI locale — falls back to English when cookie stores a non-selector locale. */
export function normalizeSelectorLocale(value: unknown): SelectorLocale {
  return isSelectorLocale(value) ? value : defaultSelectorLocale;
}

export function isRtlLocale(locale: Locale): boolean {
  return Boolean(localeLabels[locale].rtl);
}
