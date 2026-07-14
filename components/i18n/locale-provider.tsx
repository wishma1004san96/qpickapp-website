"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  localeLabels,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getMessages, type Messages } from "@/lib/i18n/get-messages";
import { persistLocale, readStoredLocale } from "@/lib/i18n/locale-cookie";
import { createTranslator, type Translator } from "@/lib/i18n/t";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (next: Locale) => void;
  t: Translator;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale: initialLocale,
  messages: initialMessages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);

  useEffect(() => {
    setLocaleState(initialLocale);
    setMessages(initialMessages);
  }, [initialLocale, initialMessages]);

  // Sync localStorage → cookie if cookie was missing (first visit / SSR mismatch repair).
  useEffect(() => {
    const stored = readStoredLocale();
    if (!stored) {
      persistLocale(locale);
      return;
    }
    if (stored !== locale) {
      persistLocale(stored);
      setLocaleState(stored);
      setMessages(getMessages(stored));
      document.documentElement.lang = localeLabels[stored].htmlLang;
      router.refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- hydrate once

  useEffect(() => {
    document.documentElement.lang = localeLabels[locale].htmlLang;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      const value = normalizeLocale(next);
      if (value === locale) return;
      persistLocale(value);
      setLocaleState(value);
      setMessages(getMessages(value));
      document.documentElement.lang = localeLabels[value].htmlLang;
      router.refresh();
    },
    [locale, router],
  );

  const t = useMemo(() => createTranslator(messages), [messages]);

  const value = useMemo(
    () => ({ locale, messages, setLocale, t }),
    [locale, messages, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslations(): Translator {
  return useLocale().t;
}

/** Access the full messages tree (arrays, nested objects). */
export function useMessages(): Messages {
  return useLocale().messages;
}

/** Alias for useMessages — prefers messages/*.json tree. */
export function useDictionary(): Messages {
  return useLocale().messages;
}
