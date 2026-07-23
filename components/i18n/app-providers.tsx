"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  localeLabels,
  normalizeSelectorLocale,
  isRtlLocale,
  type SelectorLocale,
} from "@/lib/i18n/config";
import { getMessages, type Messages } from "@/lib/i18n/get-messages";
import { persistLocale, readStoredLocale } from "@/lib/i18n/locale-cookie";
import { createTranslator, type Translator } from "@/lib/i18n/t";

type LocaleContextValue = {
  locale: SelectorLocale;
  messages: Messages;
  setLocale: (next: SelectorLocale) => void;
  t: Translator;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyDocumentLocale(locale: SelectorLocale) {
  document.documentElement.lang = localeLabels[locale].htmlLang;
  document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr";
}

export function AppProviders({
  locale: initialLocale,
  messages: initialMessages,
  children,
}: {
  locale: SelectorLocale;
  messages: Messages;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<SelectorLocale>(
    normalizeSelectorLocale(initialLocale),
  );
  const [messages, setMessages] = useState<Messages>(initialMessages);

  // Repair cookie ↔ localStorage once on mount — client-only, no server refresh.
  useEffect(() => {
    const stored = readStoredLocale();
    const resolved = stored ? normalizeSelectorLocale(stored) : locale;
    if (!stored) {
      persistLocale(locale);
      applyDocumentLocale(locale);
      return;
    }
    if (resolved !== locale) {
      if (stored !== resolved) {
        persistLocale(resolved);
      }
      setLocaleState(resolved);
      setMessages(getMessages(resolved));
      applyDocumentLocale(resolved);
      return;
    }
    applyDocumentLocale(locale);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- hydrate once

  const setLocale = useCallback(
    (next: SelectorLocale) => {
      const value = normalizeSelectorLocale(next);
      if (value === locale) return;

      persistLocale(value);
      applyDocumentLocale(value);

      // All message catalogs are statically bundled — switch without remounting the tree.
      startTransition(() => {
        setLocaleState(value);
        setMessages(getMessages(value));
      });
    },
    [locale],
  );

  const t = useMemo(() => createTranslator(messages), [messages]);

  const value = useMemo(
    () => ({ locale, messages, setLocale, t }),
    [locale, messages, setLocale, t],
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within AppProviders");
  }
  return ctx;
}

export function useTranslations(): Translator {
  return useLocale().t;
}

export function useMessages(): Messages {
  return useLocale().messages;
}

export function useDictionary(): Messages {
  return useLocale().messages;
}
